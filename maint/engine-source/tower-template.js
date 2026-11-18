/* ===== 版型：科技大樓 v2（玻璃帷幕大樓；一層樓一個分類，一間房一個細項；零件全部用「蓋章」InstancedMesh 畫）===== */
Hc.tower = {
  name: "大樓",
  build({ THREE: T, scene, data, colorOf }) {
    const cats = data.categories,
      N = Math.max(1, cats.length),
      FH = 5.0, // 樓高
      W = 40, // 樓面寬（x）
      D = 26, // 樓面深（z）
      SL = 0.5, // 樓板厚
      WH = 3.0, // 隔間牆高（剖面高度）
      MAXI = 6;
    const HT = N * FH;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const V3 = (x, y, z) => new T.Vector3(x, y, z);
    const C = (h) => new T.Color(h);
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647), (seed - 1) / 2147483646);
    const neon = (hex, l, s = 0.8) => {
      const o = {};
      C(hex).getHSL(o);
      return new T.Color().setHSL(o.h, s, l);
    };

    /* ---------- 色票：每個顏色都有白天、夜晚兩個值 ---------- */
    const PAL = new Map();
    const pal = (d, n = d) => {
      const k = d + "|" + n;
      if (!PAL.has(k)) PAL.set(k, { d: C(d), n: C(n), same: d === n });
      return PAL.get(k);
    };
    const palC = (d, n) => ({ d, n, same: false });
    const K = {
      white: pal("#ffffff", "#8a97ac"),
      fascia: pal("#ffffff", "#a3afc2"),
      mull: pal("#e9edf0", "#5c6b83"),
      wall: pal("#fbfaf7", "#4b576f"),
      wallWood: pal("#f1e6d6", "#5a5048"),
      wallCool: pal("#eef3f6", "#41536e"),
      frost: pal("#e2eef5", "#3b5f86"),
      desk: pal("#f7f7f5", "#5d6c88"),
      wood: pal("#c99f6e", "#5b4636"),
      woodL: pal("#dcc19a", "#625342"),
      dark: pal("#333b45", "#121a29"),
      metal: pal("#a9b4bd", "#46546a"),
      paper: pal("#ffffff", "#9aa8c0"),
      sofa: pal("#8a9aab", "#2c3d58"),
      sofa2: pal("#c8b39b", "#5b3d33"),
      plant: pal("#4f9a5c", "#25503a"),
      plant2: pal("#6cb36a", "#2d5b3c"),
      pot: pal("#dcd6cc", "#4b4f5c"),
      trunk: pal("#8a6a4c", "#3a2e26"),
      paving: pal("#ffffff", "#2a3346"),
      lawn: pal("#a5cf8f", "#1f3a2a"),
      road: pal("#ffffff", "#2a3346"),
      slab: pal("#f4f2ee", "#2a3549"),
      tileGray: pal("#e9e6df", "#2d384c"),
      tileRack: pal("#d3d8dd", "#1d2738"),
      tileWood: pal("#dcc29e", "#4a3d31"),
      tileWarm: pal("#efe5d3", "#3d3a3c"),
      tileBlue: pal("#d6dee6", "#26344c"),
      tileMint: pal("#dbe4da", "#24392f"),
      light: pal("#ffffff", "#fff1d2"),
      led1: pal("#37ff9a"),
      led2: pal("#35d5ff"),
      led3: pal("#ffb23a"),
      lamp: pal("#fff6dd", "#ffe2a0"),
      red: pal("#ff5577"),
      skin: ["#f1c9a5", "#e0b08a", "#c99772", "#f5d6b8"].map((h) => pal(h, "#" + C(h).multiplyScalar(0.5).getHexString())),
      hairC: ["#2b2622", "#3e2f25", "#151515", "#5a4332"].map((h) => pal(h, "#" + C(h).multiplyScalar(0.6).getHexString())),
      shirtC: ["#ffffff", "#e9e4d8", "#9fb3c4", "#c9a98a", "#7d8f7a", "#3f4a57", "#d8c3a5", "#2f3b48", "#c7b6c9"].map((h) => pal(h, "#" + C(h).multiplyScalar(0.45).getHexString())),
      pantsC: ["#2f3a4a", "#4a4f55", "#8a7d6b", "#3b4636", "#5a5f66"].map((h) => pal(h, "#" + C(h).multiplyScalar(0.5).getHexString())),
      binders: ["#c9a48e", "#8fa6bd", "#a9bfae", "#e1d2b2", "#a9a2bd"].map((h) => pal(h, "#" + C(h).multiplyScalar(0.45).getHexString())),
    };

    /* ---------- 蓋章：同形狀、同材質的零件合成一個 InstancedMesh ---------- */
    const UNIT = {
      box: new T.BoxGeometry(1, 1, 1),
      cyl: new T.CylinderGeometry(1, 1, 1, 12),
      cone: new T.CylinderGeometry(0.62, 1, 1, 10),
      ball: new T.IcosahedronGeometry(1, 0),
      sph: new T.SphereGeometry(1, 10, 8),
    };
    const MAT = {
      lit: new T.MeshLambertMaterial({ color: 0xffffff, flatShading: true }),
      glow: new T.MeshBasicMaterial({ color: 0xffffff }),
    };
    const themed = []; // 需要隨日夜變色的 InstancedMesh
    const mkStamp = () => {
      const B = new Map();
      return {
        B,
        put(shape, lit, col, x, y, z, sx, sy, sz, ry = 0, rz = 0) {
          const key = shape + (lit ? "L" : "G");
          B.has(key) || B.set(key, { shape, lit, items: [] });
          B.get(key).items.push({ x, y, z, sx, sy, sz, ry, rz, col });
        },
      };
    };
    const dummy = new T.Object3D();
    const realize = (S, parent) => {
      const out = [];
      S.B.forEach((b) => {
        if (!b.items.length) return;
        const im = new T.InstancedMesh(UNIT[b.shape], b.lit ? MAT.lit : MAT.glow, b.items.length);
        im.frustumCulled = false;
        b.items.forEach((it, k) => {
          dummy.position.set(it.x, it.y, it.z);
          dummy.rotation.set(0, it.ry, it.rz);
          dummy.scale.set(it.sx, it.sy, it.sz);
          dummy.updateMatrix();
          im.setMatrixAt(k, dummy.matrix);
          im.setColorAt(k, it.col.d);
        });
        im.instanceMatrix.needsUpdate = true;
        im.instanceColor.needsUpdate = true;
        im.castShadow = im.receiveShadow = b.lit;
        parent.add(im);
        const rec = { im, cols: b.items.map((it) => it.col) };
        b.items.some((it) => !it.col.same) && themed.push(rec);
        out.push(rec);
      });
      return out;
    };
    /* 以某點為原點、轉 ry 的區域座標蓋章（y 為零件中心高）*/
    // sc：零件放大倍數（尺寸與高度）；ps：位置間距倍數
    const frame = (S, ox, oy, oz, ry = 0, sc = 1, ps = sc) => {
      const c = Math.cos(ry),
        s = Math.sin(ry);
      const P = (x, z) => [ox + (x * c + z * s) * ps, oz + (-x * s + z * c) * ps];
      return {
        _ox: ox, _oy: oy, _oz: oz, _ry: ry, _sc: sc, _ps: ps,
        box(x, y, z, w, h, d, col, lit = true, r2 = 0) {
          const [X, Z] = P(x, z);
          S.put("box", lit, col, X, oy + y * sc, Z, w * sc, h * sc, d * sc, ry + r2);
        },
        cyl(x, y, z, r, h, col, lit = true) {
          const [X, Z] = P(x, z);
          S.put("cyl", lit, col, X, oy + y * sc, Z, r * sc, h * sc, r * sc);
        },
        cone(x, y, z, r, h, col) {
          const [X, Z] = P(x, z);
          S.put("cone", true, col, X, oy + y * sc, Z, r * sc, h * sc, r * sc);
        },
        ball(x, y, z, r, col, sy = 1) {
          const [X, Z] = P(x, z);
          S.put("ball", true, col, X, oy + y * sc, Z, r * sc, r * sy * sc, r * sc, rnd() * 3);
        },
        sph(x, y, z, r, col, lit = false) {
          const [X, Z] = P(x, z);
          S.put("sph", lit, col, X, oy + y * sc, Z, r * sc, r * sc, r * sc);
        },
      };
    };

    /* ---------- 光線、霧、地面、天際線 ---------- */
    const hemi = new T.HemisphereLight(0xffffff, 0xe3e8ec, 1.2);
    const sun = new T.DirectionalLight(0xfff6ea, 1.25);
    sun.position.set(-30, 64, 44);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -52, right: 52, top: 52, bottom: -52, near: 10, far: 200 });
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.03;
    const amb = new T.AmbientLight(0xfff1dc, 0); // 夜晚進到樓層時，室內燈打開
    scene.add(hemi, sun, amb);
    const fog = new T.Fog(0xeef6fb, 260, 560);
    scene.fog = fog;
    const L = {
      hemiSky: [C("#ffffff"), C("#4a6ea8")],
      hemiGnd: [C("#e3e8ec"), C("#0b1426")],
      hemiI: [1.2, 0.95],
      sunC: [C("#fff6ea"), C("#8fb8ff")],
      sunI: [1.25, 0.45],
      fog: [C("#eef6fb"), C("#0a1428")],
      fogN: [260, 140],
      fogF: [560, 380],
    };
    const groundMat = new T.MeshLambertMaterial({ color: "#060c18", transparent: true, opacity: 0 });
    const ground = new T.Mesh(new T.CircleGeometry(420, 48), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.32;
    scene.add(ground);
    const gridPts = [];
    for (let k = -200; k <= 200; k += 8) gridPts.push(-200, -0.3, k, 200, -0.3, k, k, -0.3, -200, k, -0.3, 200);
    const gridGeo = new T.BufferGeometry();
    gridGeo.setAttribute("position", new T.Float32BufferAttribute(gridPts, 3));
    const gridMat = new T.LineBasicMaterial({ color: "#cfdae2", transparent: true, opacity: 0.6 });
    scene.add(new T.LineSegments(gridGeo, gridMat));
    // 天際線：遠處剪影，一個 InstancedMesh；夜晚亮窗
    const winC = document.createElement("canvas");
    winC.width = 64;
    winC.height = 128;
    {
      const g = winC.getContext("2d");
      g.fillStyle = "#000";
      g.fillRect(0, 0, 64, 128);
      for (let r = 0; r < 16; r++)
        for (let c = 0; c < 8; c++)
          if (rnd() > 0.55) {
            g.fillStyle = rnd() > 0.5 ? "#ffd9a0" : "#9fdcff";
            g.fillRect(c * 8 + 1, r * 8 + 2, 5, 4);
          }
    }
    const skyMat = new T.MeshLambertMaterial({ color: "#0c1930", emissive: "#ffffff", emissiveMap: new T.CanvasTexture(winC), flatShading: true });
    const SKN = 44;
    const skyIM = new T.InstancedMesh(UNIT.box, skyMat, SKN);
    skyIM.frustumCulled = false;
    for (let k = 0; k < SKN; k++) {
      const a = (k / SKN) * Math.PI * 2 + rnd() * 0.1,
        r = 170 + rnd() * 90,
        w = 10 + rnd() * 14,
        h = 16 + rnd() * 50;
      dummy.position.set(Math.cos(a) * r, h / 2 - 0.3, Math.sin(a) * r);
      dummy.rotation.set(0, rnd() * 3, 0);
      dummy.scale.set(w, h, w * (0.7 + rnd() * 0.5));
      dummy.updateMatrix();
      skyIM.setMatrixAt(k, dummy.matrix);
    }
    scene.add(skyIM);

    /* ---------- 廣場鋪面：磁磚線條＋紅磚人行道（貼圖）---------- */
    const mkTex = (draw, size = 256) => {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      draw(c.getContext("2d"), size);
      const t = new T.CanvasTexture(c);
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.anisotropy = 4;
      return t;
    };
    const tileTex = mkTex((g, n) => {
      g.fillStyle = "#f1eee9";
      g.fillRect(0, 0, n, n);
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++) {
          g.fillStyle = ["#f3f0eb", "#eeebe5", "#f5f3ee", "#ece8e2"][(r * 3 + c * 5) % 4];
          g.fillRect(c * 64 + 2, r * 64 + 2, 60, 60);
        }
      g.fillStyle = "#d9d3ca";
      for (let k = 0; k <= 4; k++) {
        g.fillRect(k * 64 - 1, 0, 2, n);
        g.fillRect(0, k * 64 - 1, n, 2);
      }
    });
    const brickTex = mkTex((g, n) => {
      g.fillStyle = "#e3d8cf";
      g.fillRect(0, 0, n, n);
      const bh = 32,
        bw = 64;
      for (let r = 0; r < n / bh; r++)
        for (let c = -1; c < n / bw + 1; c++) {
          const x = c * bw + (r % 2 ? bw / 2 : 0);
          g.fillStyle = ["#b97a63", "#b3725c", "#bf846c", "#ad6e5a"][(r * 7 + c * 3 + 8) % 4];
          g.fillRect(x + 2, r * bh + 2, bw - 4, bh - 4);
        }
    });
    const plazaMats = [];
    const slabTex = (tex, w, d, x, y, z, rep, h = 0.06) => {
      const t = tex.clone();
      t.needsUpdate = true;
      t.repeat.set(w / rep, d / rep);
      const m = new T.MeshLambertMaterial({ color: "#ffffff", map: t });
      plazaMats.push(m);
      const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    };
    const PW = W + 30,
      PD = D + 30,
      PZ = 2;
    slabTex(tileTex, PW, PD, 0, -0.6, PZ, 4, 1.2); // 廣場基座（看得到側邊厚度）
    slabTex(brickTex, PW, 5, 0, 0.03, PZ + PD / 2 - 2.5, 1.6); // 前方紅磚人行道
    slabTex(brickTex, 3.2, PD - 5, -PW / 2 + 1.6, 0.03, PZ - 2.5, 1.6); // 兩側紅磚道
    slabTex(brickTex, 3.2, PD - 5, PW / 2 - 1.6, 0.03, PZ - 2.5, 1.6);
    slabTex(brickTex, 7, PZ + PD / 2 - 5 - (D / 2 + 0.6), 4, 0.03, (D / 2 + 0.6 + PZ + PD / 2 - 5) / 2, 1.6); // 入口步道

    /* ---------- 玻璃的天空反射（簡易環境貼圖）---------- */
    const envFace = (top, bot) => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d"),
        gr = g.createLinearGradient(0, 0, 0, 64);
      gr.addColorStop(0, top);
      gr.addColorStop(1, bot);
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      return c;
    };
    const side = envFace("#9fcfee", "#eef6fb");
    const envMap = new T.CubeTexture([side, side, envFace("#8cc4ea", "#8cc4ea"), envFace("#e7eaec", "#e7eaec"), side, side]);
    envMap.needsUpdate = true;
    const envSet = (m) =>
      floors.forEach((f) => {
        f.gm.reflectivity = 0.55 - 0.4 * m;
      });

    /* ---------- 廣場、樹、外梯 ---------- */
    const site = mkStamp();
    {
      const F = frame(site, 0, 0, 0);

      // 草地
      [[-W / 2 - 8, -2, 8, D + 14], [W / 2 + 8, -2, 8, D + 14], [-W / 2 + 8, D / 2 + 8.2, 12, 4], [W / 2 - 10, D / 2 + 8.2, 14, 4]].forEach(([x, z, w, d]) =>
        F.box(x, 0.05, z, w, 0.12, d, K.lawn),
      );
      // 樹（低面數）
      const tree = (x, z, s = 1) => {
        F.cyl(x, 0.9 * s, z, 0.18 * s, 1.8 * s, K.trunk);
        F.ball(x, 2.5 * s, z, 1.35 * s, K.plant, 1.1);
        F.ball(x + 0.6 * s, 3.3 * s, z - 0.3 * s, 0.95 * s, K.plant2);
        F.ball(x - 0.5 * s, 3.1 * s, z + 0.4 * s, 0.85 * s, K.plant);
      };
      for (let k = 0; k < 5; k++) tree(-W / 2 - 8, -D / 2 + 2 + k * 6.2, 0.95 + (k % 2) * 0.2);
      for (let k = 0; k < 5; k++) tree(W / 2 + 8, -D / 2 + 3 + k * 6.2, 1.05 - (k % 2) * 0.15);
      [-W / 2 + 4, -W / 2 + 12, W / 2 - 16, W / 2 - 6].forEach((x, k) => tree(x, D / 2 + 8.2, 0.9 + (k % 2) * 0.2));
      // 路燈、長椅
      for (let k = 0; k < 5; k++) {
        const x = -W / 2 + 2 + k * 9.5;
        F.cyl(x, 1.8, D / 2 + 11.4, 0.08, 3.6, K.metal);
        F.box(x, 3.65, D / 2 + 11.4, 0.5, 0.14, 0.5, K.lamp, false);
      }
      [-6, 6].forEach((x) => {
        F.box(x, 0.45, D / 2 + 10.2, 2.4, 0.12, 0.6, K.wood);
        F.box(x - 1.0, 0.22, D / 2 + 10.2, 0.12, 0.44, 0.5, K.metal);
        F.box(x + 1.0, 0.22, D / 2 + 10.2, 0.12, 0.44, 0.5, K.metal);
      });
    }
    realize(site, scene);
    const tall = mkStamp();
    {
      const F = frame(tall, 0, 0, 0);
      // 入口雨遮
      F.box(4, 3.6, D / 2 + 2.2, 9, 0.3, 4.2, K.white);
      F.box(0.2, 1.8, D / 2 + 4, 0.25, 3.6, 0.25, K.metal);
      F.box(7.8, 1.8, D / 2 + 4, 0.25, 3.6, 0.25, K.metal);
      // 外梯：從廣場上到 2F 陽台
      if (N >= 2) {
        const ns = 14,
          run = 0.9,
          x0 = -W / 2 + 10.4;
        for (let k = 0; k < ns; k++) {
          const top = FH - k * (FH / ns);
          F.box(x0 + (k + 0.5) * run, top / 2, D / 2 + 2.5, run, top, 2.2, K.white);
        }
        const len = Math.hypot(ns * run, FH),
          ang = Math.atan2(FH, ns * run);
        [1.45, 3.55].forEach((dz) => {
          tall.put("box", true, K.metal, x0 + (ns * run) / 2, FH / 2 + 1.0, D / 2 + dz, len, 0.07, 0.07, 0, -ang);
        });
      }
    }
    const tallG = new T.Group();
    scene.add(tallG);
    realize(tall, tallG);

    /* ---------- 房間設備組（區域座標：x 橫向、z 往門的方向為正）---------- */
    const chair = (F, x, z, ry, A) => {
      const c = Math.cos(ry),
        s = Math.sin(ry);
      F.box(x, 0.46, z, 0.55, 0.08, 0.55, A.acc, true, ry);
      F.box(x - s * 0.26, 0.76, z - c * 0.26, 0.55, 0.5, 0.07, A.acc, true, ry);
      F.cyl(x, 0.22, z, 0.05, 0.44, K.metal);
      // 有人坐的椅子（比例依房間種類）
      if (rnd() < (A.occ == null ? 0.6 : A.occ)) seated(F, x, z, ry, A.typing !== false);
    };
    const pickP = (a) => a[Math.floor(rnd() * a.length)];
    const person = () => ({ skin: pickP(K.skin), hair: pickP(K.hairC), shirt: pickP(K.shirtC), pants: pickP(K.pantsC), long: rnd() < 0.35 });
    // 坐在椅子上、面向 (sin ry, cos ry)；手放在前方桌面
    const seated = (F, x, z, ry, typing = true) => {
      const c = Math.cos(ry),
        s = Math.sin(ry),
        P = person();
      F.box(x + s * 0.12, 0.56, z + c * 0.12, 0.38, 0.13, 0.42, P.pants, true, ry);
      F.box(x + s * 0.33, 0.27, z + c * 0.33, 0.3, 0.48, 0.14, P.pants, true, ry);
      F.box(x - s * 0.06, 0.9, z - c * 0.06, 0.4, 0.56, 0.22, P.shirt, true, ry);
      if (typing) F.box(x + s * 0.2, 0.84, z + c * 0.2, 0.46, 0.09, 0.3, P.shirt, true, ry);
      else for (const sd of [-1, 1]) F.box(x - s * 0.04 + c * sd * 0.24, 0.82, z - c * 0.04 - s * sd * 0.24, 0.1, 0.42, 0.12, P.shirt, true, ry);
      F.sph(x - s * 0.05, 1.34, z - c * 0.05, 0.14, P.skin, true);
      F.sph(x - s * 0.07, 1.4, z - c * 0.07, 0.15, P.hair, true);
      if (P.long) F.box(x - s * 0.15, 1.2, z - c * 0.15, 0.28, 0.32, 0.08, P.hair, true, ry);
    };
    const standing = (F, x, z, ry) => {
      const c = Math.cos(ry),
        s = Math.sin(ry),
        P = person();
      for (const sd of [-1, 1]) {
        F.box(x + c * sd * 0.1, 0.42, z - s * sd * 0.1, 0.15, 0.84, 0.17, P.pants, true, ry);
        F.box(x + c * sd * 0.28, 1.12, z - s * sd * 0.28, 0.11, 0.58, 0.12, P.shirt, true, ry);
      }
      F.box(x, 1.15, z, 0.42, 0.64, 0.24, P.shirt, true, ry);
      F.sph(x, 1.64, z, 0.15, P.skin, true);
      F.sph(x - s * 0.02, 1.7, z - c * 0.02, 0.16, P.hair, true);
      if (P.long) F.box(x - s * 0.1, 1.48, z - c * 0.1, 0.3, 0.4, 0.08, P.hair, true, ry);
    };
    const plant = (F, x, z, s = 1) => {
      F.cone(x, 0.3 * s, z, 0.32 * s, 0.6 * s, K.pot);
      F.ball(x, 0.95 * s, z, 0.5 * s, K.plant);
      F.ball(x + 0.15 * s, 1.35 * s, z - 0.1 * s, 0.34 * s, K.plant2);
    };
    const screen = (F, x, y, z, w, h, ry, A) => {
      F.box(x, y, z, w, h, 0.08, K.dark, true, ry);
      const c = Math.cos(ry),
        s = Math.sin(ry);
      F.box(x + s * 0.05, y, z + c * 0.05, w - 0.12, h - 0.12, 0.02, A.scr, false, ry);
    };
    const ROOM = {
      desk(F, w, d, A) {
        const nC = Math.max(1, Math.floor((w - 1.5) / 4.6)),
          rows = d > 8 ? [-2.3, 1.7] : [-0.4];
        for (const rz of rows)
          for (let c = 0; c < nC; c++) {
            const cx = -w / 2 + (w / nC) * (c + 0.5);
            F.box(cx, 0.98, rz, 3.3, 0.4, 0.05, A.acc);
            for (const sx of [-0.85, 0.85])
              for (const sz of [-1, 1]) {
                const x = cx + sx,
                  z = rz + sz * 0.45;
                F.box(x, 0.75, z, 1.6, 0.06, 0.8, K.desk);
                F.box(x, 0.37, z + sz * 0.3, 1.5, 0.7, 0.05, K.metal);
                F.box(x, 1.05, z - sz * 0.18, 0.7, 0.42, 0.04, K.dark);
                F.box(x, 1.05, z - sz * 0.15, 0.62, 0.34, 0.02, A.scr, false);
                chair(F, x, z + sz * 0.85, sz > 0 ? Math.PI : 0, A);
              }
          }
        F.box(w / 2 - 0.35, 0.9, -d / 2 + 1.8, 0.5, 1.8, 2.4, K.wood);
        for (let k = 0; k < 3; k++) F.box(w / 2 - 0.42, 0.45 + k * 0.55, -d / 2 + 1.8, 0.36, 0.3, 2.1, K.binders[k]);
        plant(F, -w / 2 + 0.7, -d / 2 + 0.7, 1.1);
      },
      rack(F, w, d, A) {
        const n = Math.max(2, Math.min(9, Math.floor((w - 3) / 1.2))),
          xs = -((n - 1) * 1.2) / 2 + 0.8;
        for (const [rz, face] of [[-1.7, 1], [1.4, -1]])
          for (let k = 0; k < n; k++) {
            const x = xs + k * 1.2;
            F.box(x, 1.15, rz, 1.05, 2.3, 1.1, K.dark);
            for (let r = 0; r < 3; r++) F.box(x - 0.12, 0.7 + r * 0.55, rz + face * 0.56, 0.6, 0.05, 0.02, A.scr, false);
            for (let r = 0; r < 3; r++) leds.put("box", false, [K.led1, K.led2, K.led3][(k + r) % 3], ...lp(F, x + 0.32, 0.7 + r * 0.55, rz + face * 0.57), 0.08 * F._sc, 0.08 * F._sc, 0.02 * F._sc);
          }
        F.box(-w / 2 + 0.9, 1.1, -0.2, 1.2, 2.2, 2.8, K.white);
        F.box(-w / 2 + 1.52, 1.5, -0.2, 0.02, 0.5, 1.6, A.scr, false);
        F.box(0, 2.45, -0.15, w - 2, 0.08, 0.5, K.metal);
      },
      meeting(F, w, d, A) {
        const Lt = Math.max(3, Math.min(w - 4.2, 9));
        F.box(0, 0.76, -0.3, Lt, 0.08, 2.0, K.woodL);
        F.box(-Lt * 0.32, 0.37, -0.3, 0.3, 0.72, 1.3, K.metal);
        F.box(Lt * 0.32, 0.37, -0.3, 0.3, 0.72, 1.3, K.metal);
        const nc = Math.floor(Lt / 1.1);
        for (let k = 0; k < nc; k++) {
          const x = -Lt / 2 + (Lt / nc) * (k + 0.5);
          chair(F, x, -1.75, 0, A);
          chair(F, x, 1.15, Math.PI, A);
        }
        screen(F, -w / 2 + 0.2, 1.55, -0.3, 2.8, 1.4, Math.PI / 2, A);
        F.box(w / 2 - 0.12, 1.45, -0.3, 0.05, 1.1, 2.4, K.paper);
        F.box(0, 0.36, -d / 2 + 0.5, Math.min(Lt, 5), 0.72, 0.5, K.wood);
        plant(F, w / 2 - 0.7, -d / 2 + 0.7, 1.2);
        plant(F, -w / 2 + 0.7, d / 2 - 0.8, 1.0);
      },
      counter(F, w, d, A) {
        const cl = Math.min(6, w - 3),
          cz = d / 2 - 2.0;
        F.box(0, 0.53, cz, cl, 1.05, 0.8, K.white);
        F.box(0, 1.08, cz, cl + 0.1, 0.06, 1.0, K.dark);
        F.box(0, 0.65, cz + 0.41, cl - 0.2, 0.1, 0.02, A.scr, false);
        F.box(cl / 2 - 0.4, 0.53, cz - 1.2, 0.8, 1.05, 1.8, K.white);
        for (const x of [-1.2, 1.0]) {
          F.box(x, 1.32, cz - 0.15, 0.6, 0.38, 0.04, K.dark);
          F.box(x, 1.32, cz - 0.12, 0.52, 0.3, 0.02, A.scr, false);
          chair(F, x, cz - 0.9, 0, A);
        }
        // 等候區
        const sz = -d / 2 + 2.2;
        for (const [z, ry] of [[sz - 0.9, 0], [sz + 1.5, Math.PI]]) {
          F.box(0, 0.25, z, 3.0, 0.45, 0.9, K.sofa, true);
          F.box(0, 0.62, z + (ry ? 0.38 : -0.38), 3.0, 0.5, 0.2, K.sofa, true);
        }
        F.box(0, 0.22, sz + 0.3, 1.4, 0.06, 0.7, K.woodL);
        F.box(0, 0.02, sz + 0.3, 4.4, 0.03, 3.4, A.rug);
        plant(F, -w / 2 + 0.7, -d / 2 + 0.7, 1.3);
        plant(F, w / 2 - 0.7, -d / 2 + 0.7, 1.1);
        F.box(-w / 2 + 1.2, 0.75, cz, 0.6, 1.5, 0.4, K.dark);
        F.box(-w / 2 + 1.2, 1.0, cz + 0.21, 0.5, 0.8, 0.02, A.scr, false);
      },
      printer(F, w, d, A) {
        const nU = Math.max(1, Math.floor((d - 1.5) / 2.2));
        for (let u = 0; u < nU; u++) {
          const z = -d / 2 + 1.4 + u * 2.2;
          F.box(-w / 2 + 0.4, 1.0, z, 0.6, 2.0, 2.0, K.wood);
          for (let r = 0; r < 3; r++) for (let b = 0; b < 4; b++) F.box(-w / 2 + 0.45, 0.4 + r * 0.6, z - 0.75 + b * 0.5, 0.42, 0.42, 0.36, K.binders[(u + r + b) % 5]);
        }
        for (const z of [-1.8, 0.6]) {
          F.box(w / 2 - 0.8, 0.55, z, 0.9, 1.1, 1.3, K.white);
          F.box(w / 2 - 0.8, 1.15, z, 0.9, 0.12, 1.3, K.dark);
          F.box(w / 2 - 1.27, 0.95, z + 0.3, 0.02, 0.25, 0.4, A.scr, false);
          F.box(w / 2 - 1.4, 0.75, z - 0.2, 0.4, 0.04, 0.7, K.paper);
        }
        F.box(0, 0.88, -0.5, 2.6, 0.06, 1.3, K.desk);
        F.box(0, 0.43, -0.5, 2.4, 0.84, 0.1, K.metal);
        for (let k = 0; k < 3; k++) F.box(-0.8 + k * 0.7, 0.98 + (k % 2) * 0.05, -0.5, 0.42, 0.14 + (k % 2) * 0.1, 0.6, K.paper);
        for (let k = 0; k < 3; k++) F.box(0.8 + k * 0.6, 0.2, d / 2 - 1.2, 0.5, 0.4, 0.4, K.woodL);
        plant(F, -w / 2 + 0.8, d / 2 - 0.9, 1.0);
      },
      board(F, w, d, A) {
        const sl = Math.min(d - 2, 6.5);
        F.box(-w / 2 + 0.2, 1.75, -0.4, 0.1, 2.3, sl, K.dark);
        F.box(-w / 2 + 0.27, 1.75, -0.4, 0.02, 2.1, sl - 0.2, A.scrDim, false);
        for (let k = 0; k < 6; k++) {
          const h = 0.5 + ((k * 37) % 10) * 0.13;
          F.box(-w / 2 + 0.3, 0.9 + h / 2, -0.4 - sl / 2 + 0.8 + k * ((sl - 1.2) / 5), 0.02, h, 0.42, A.scr, false);
        }
        F.box(-w / 2 + 1.6, 0.5, -0.4, 0.8, 1.0, 0.6, K.woodL);
        const rows = Math.max(1, Math.min(5, Math.floor((w - 4.5) / 2.1)));
        const tl = Math.min(d - 3, 6.2),
          nc = Math.floor(tl / 1.05);
        for (let r = 0; r < rows; r++) {
          const x = -w / 2 + 3.6 + r * 2.1;
          F.box(x, 0.74, -0.4, 0.6, 0.05, tl, K.desk);
          F.box(x, 0.36, -0.4, 0.06, 0.72, tl - 0.4, K.metal);
          for (let k = 0; k < nc; k++) chair(F, x + 0.7, -0.4 - tl / 2 + (tl / nc) * (k + 0.5), -Math.PI / 2, A);
        }
        plant(F, w / 2 - 0.7, -d / 2 + 0.7, 1.2);
      },
    };
    const lp = (F, x, y, z) => {
      // 取得區域座標換算後的世界座標（給 LED 這種另外蓋章的零件用）
      const tmp = mkStamp();
      frame(tmp, F._ox, F._oy, F._oz, F._ry, F._sc, F._ps).box(x, y, z, 1, 1, 1, K.white);
      const it = tmp.B.get("boxL").items[0];
      return [it.x, it.y, it.z];
    };
    let leds = null;
    const TYPE_FLOOR = { desk: "tileBlue", rack: "tileRack", meeting: "tileWood", counter: "tileWarm", printer: "tileGray", board: "tileMint" };
    const HIT_H = 3.0,
      FS_ = 1.45; // 家具放大倍數（參考圖 2 的比例）
    const ORDER = ["desk", "board", "meeting", "counter", "printer", "rack"];
    const RULES = [
      ["rack", /網路|主機|伺服|機房|資安|防火牆|備份|雲端|儲存|安全/],
      ["counter", /諮詢|客服|櫃台|問答|窗口|支援|報修|服務台|協助|小幫手|助理/],
      ["printer", /列印|印表|申請|表單|文件|公文|證明|影印|簽核|文書/],
      ["meeting", /會議|課程|教學|研習|活動|訓練|講座|視訊|培訓|研討/],
      ["board", /數據|統計|報表|分析|儀表|看板|成效|指標|資料/],
      ["desk", /系統|平台|網站|帳號|信箱|軟體|應用|登入|入口|電腦|行政/],
    ];
    const pickType = (ent, used, base) => {
      const txt = (ent.name || "") + " " + (ent.highlight || "");
      for (const [t, re] of RULES) if (re.test(txt) && !used.includes(t)) return t;
      for (let k = 0; k < ORDER.length; k++) {
        const t = ORDER[(base + k) % ORDER.length];
        if (!used.includes(t)) return t;
      }
      return ORDER[base % ORDER.length];
    };
    /* 房間配置：3 間以內排在後排、前面是開放區；4–6 間分前後兩排，中間走廊 */
    const X0 = -W / 2 + 1.0,
      X1 = W / 2 - 1.0,
      ZB0 = -D / 2 + 1.0,
      ZB1 = -2.2,
      ZF0 = 2.2,
      ZF1 = D / 2 - 1.0;
    const zonesFor = (n) => {
      // 每間房最寬 16；房間少時置中，兩側留給走道擺設
      const row = (k, z0, z1, front) =>
        Array.from({ length: k }, (_, j) => {
          const w = Math.min(k === 1 ? 22 : 99, (X1 - X0) / k),
            s = -(w * k) / 2 + 1.5;
          return { x0: s + j * w, x1: s + (j + 1) * w, z0, z1, front, first: j === 0 };
        });
      if (n <= 3) return row(Math.max(1, n), ZB0, ZB1, false);
      const a = Math.ceil(n / 2);
      return [...row(a, ZB0, ZB1, false), ...row(n - a, ZF0, ZF1, true)];
    };
    /* 開放區（3 間以內時的前半層）：每層不同 */
    const LOUNGE = [
      (F, A) => {
        for (const x of [-9, 6]) {
          F.box(x, 0.02, 0, 7, 0.03, 4.6, A.rug);
          F.box(x, 0.25, -1.4, 3.2, 0.45, 0.95, K.sofa);
          F.box(x, 0.62, -1.82, 3.2, 0.5, 0.2, K.sofa);
          F.box(x - 2.9, 0.25, 0.4, 0.95, 0.45, 2.4, K.sofa2);
          F.box(x, 0.24, 0.3, 1.6, 0.06, 0.9, K.woodL);
        }
        [-16, -1, 14].forEach((x) => plant(F, x, 3.2, 1.5));
      },
      (F, A) => {
        F.box(14, 0.55, -1, 6, 1.1, 1.0, K.wood);
        F.box(14, 1.12, -1, 6.2, 0.06, 1.2, K.dark);
        F.box(14, 1.5, -2.6, 5, 1.0, 0.3, K.white);
        for (let k = 0; k < 4; k++) {
          const x = -14 + k * 6.5;
          F.cyl(x, 0.74, 0.5, 0.75, 0.06, K.desk);
          F.cyl(x, 0.37, 0.5, 0.07, 0.72, K.metal);
          for (let j = 0; j < 3; j++) {
            const a = (j / 3) * Math.PI * 2;
            F.cyl(x + Math.sin(a) * 1.4, 0.25, 0.5 + Math.cos(a) * 1.4, 0.28, 0.5, A.acc);
          }
        }
        plant(F, -18, 3.4, 1.4);
        plant(F, 9, 3.4, 1.2);
      },
      (F, A) => {
        for (const x of [-8, 6]) {
          F.box(x, 0.75, 0, 8, 0.06, 1.6, K.woodL);
          F.box(x, 0.37, 0, 7.4, 0.72, 0.1, K.metal);
          for (let k = 0; k < 6; k++) for (const z of [-1.2, 1.2]) F.cyl(x - 3.4 + k * 1.36, 0.32, z, 0.22, 0.64, A.acc);
        }
        [-17, 16].forEach((x) => {
          F.ball(x, 0.4, 0, 0.7, A.acc, 0.6);
          F.ball(x + 1.4, 0.4, 0.8, 0.7, K.sofa2, 0.6);
        });
        plant(F, 0, 3.4, 1.4);
      },
      (F, A) => {
        for (let k = 0; k < 4; k++) {
          const x = -15 + k * 10;
          F.box(x, 0.35, -0.5, 4.2, 0.7, 1.4, K.wood);
          for (let j = 0; j < 4; j++) F.ball(x - 1.5 + j, 1.0, -0.5, 0.55, j % 2 ? K.plant : K.plant2);
          F.box(x, 0.45, 1.8, 3, 0.1, 0.7, K.woodL);
          F.box(x, 0.22, 1.8, 2.8, 0.44, 0.1, K.metal);
        }
        F.box(0, 0.02, 0, W - 6, 0.03, 6, A.rug);
      },
    ];
    const WALLS = ["wall", "wallWood", "frost", "wallCool"];
    const SCR = pal("#9fd3ea", "#8fe0ff"),
      SCRD = pal("#3a5466", "#20384c");
    const muted = (col) => neon(col, 0.5, 0.22);

    /* 白色樓板帶：沿樓板外緣一圈（不蓋住樓面）*/
    const band = (F, y, h) => {
      const t = 0.45;
      F.box(0, y, D / 2 + t / 2, W + 2 * t, h, t, K.fascia);
      F.box(0, y, -D / 2 - t / 2, W + 2 * t, h, t, K.fascia);
      F.box(W / 2 + t / 2, y, 0, t, h, D, K.fascia);
      F.box(-W / 2 - t / 2, y, 0, t, h, D, K.fascia);
    };
    /* ---------- 蓋樓 ---------- */
    const floors = [],
      items = {},
      anchors = {},
      pickables = [],
      IP = [],
      isl = [];
    const glassBase = {
      d: C("#86afcb"),
      n: C("#1e4268"),
      od: 0.6,
      on: 0.42,
      ed: C("#000000"),
      en: C("#0e2440"),
    };
    cats.forEach((cat, i) => {
      const y0 = i * FH,
        yF = y0 + SL; // 樓面高度
      const col = colorOf(cat.id);
      // 低彩度：只留一點點分類色相；螢幕統一冰藍色
      const A = {
        acc: palC(neon(col, 0.42, 0.14), neon(col, 0.26, 0.16)),
        scr: SCR,
        scrDim: SCRD,
        rug: palC(neon(col, 0.86, 0.12), neon(col, 0.22, 0.12)),
        carpet: palC(C("#f1eee8"), C("#2c3447")),
      };
      const g = new T.Group();
      scene.add(g);
      const core = mkStamp(),
        skin = mkStamp(),
        ceil = mkStamp();
      leds = mkStamp();
      const F = frame(core, 0, 0, 0);
      /* 樓板、白色樓板帶、走廊地毯 */
      F.box(0, y0 + SL / 2, 0, W, SL, D, K.slab);
      band(F, y0 + 0.25, 0.8);
      F.box(0, yF + 0.012, 0, W - 0.4, 0.02, D - 0.4, A.carpet);
      /* 陽台（偶數樓層＝2F、4F…）*/
      if (i % 2 === 1) {
        F.box(-W / 2 + 5, y0 + 0.25, D / 2 + 1.9, 10, 0.8, 3.8, K.fascia);
        F.box(-W / 2 + 5, yF + 1.05, D / 2 + 3.75, 10, 0.07, 0.07, K.metal);
        F.box(-W / 2 + 0.05, yF + 1.05, D / 2 + 1.9, 0.07, 0.07, 3.8, K.metal);
        plant(frame(core, -W / 2 + 2, yF, D / 2 + 2.6, 0, 1.3), 0, 0, 1.3);
        plant(frame(core, -W / 2 + 8, yF, D / 2 + 2.6, 0, 1.3), 0, 0, 1.1);
      }
      /* 電梯梯廳（走廊左端）*/
      const coreW = 3.4;
      F.box(X0 + coreW / 2, yF + WH / 2, 0, coreW, WH, 4.0, K.white);
      F.box(X0 + coreW + 0.01, yF + 1.1, -0.9, 0.02, 2.1, 1.1, K.metal);
      F.box(X0 + coreW + 0.01, yF + 1.1, 0.9, 0.02, 2.1, 1.1, K.metal);
      F.box(X0 + coreW + 0.02, yF + 2.35, 0, 0.02, 0.12, 0.5, A.scr, false);
      /* 天花燈 */
      const FC = frame(ceil, 0, 0, 0);
      for (let x = -W / 2 + 4; x < W / 2 - 2; x += 5) for (let z = -D / 2 + 3; z < D / 2 - 2; z += 4.6) FC.box(x, y0 + FH - 0.08, z, 2.0, 0.05, 0.5, K.light, false);
      /* 外皮：竪框、橫框、白色翼板、實牆 */
      const FS = frame(skin, 0, 0, 0);
      const gh = FH - SL - 0.15;
      for (let x = -W / 2; x <= W / 2 + 0.01; x += 2.5) {
        FS.box(x, yF + gh / 2, D / 2 - 0.05, 0.12, gh, 0.14, K.mull);
        FS.box(x, yF + gh / 2, -D / 2 + 0.05, 0.12, gh, 0.14, K.mull);
      }
      for (let z = -D / 2 + 2.5; z < D / 2; z += 2.5) {
        FS.box(W / 2 - 0.05, yF + gh / 2, z, 0.14, gh, 0.12, K.mull);
        FS.box(-W / 2 + 0.05, yF + gh / 2, z, 0.14, gh, 0.12, K.mull);
      }
      FS.box(0, yF + 1.0, D / 2 - 0.05, W, 0.08, 0.12, K.mull);
      FS.box(0, yF + 1.0, -D / 2 + 0.05, W, 0.08, 0.12, K.mull);
      FS.box(W / 2 - 0.05, yF + 1.0, 0, 0.12, 0.08, D, K.mull);
      FS.box(-W / 2 + 0.05, yF + 1.0, 0, 0.12, 0.08, D, K.mull);
      if (i % 3 === 2) FS.box(-W / 2 + 13, yF + gh / 2, D / 2 + 0.08, 5, gh, 0.3, K.white);
      if (i % 3 === 0) FS.box(W / 2 + 0.08, yF + gh / 2, -D / 2 + 4, 0.3, gh, 7, K.white);
      /* 玻璃帷幕（每層一個材質，可單獨淡出）*/
      const gm = new T.MeshPhongMaterial({
        color: glassBase.d.clone(),
        transparent: true,
        opacity: glassBase.od,
        depthWrite: false,
        envMap,
        combine: T.MixOperation,
        reflectivity: 0.55,
        specular: 0xffffff,
        shininess: 90,
      });
      const glass = new T.InstancedMesh(UNIT.box, gm, 4 + (i % 2 === 1 ? 2 : 0));
      glass.frustumCulled = false;
      const gl = [
        [0, D / 2 - 0.05, W, 0.06],
        [0, -D / 2 + 0.05, W, 0.06],
        [W / 2 - 0.05, 0, 0.06, D],
        [-W / 2 + 0.05, 0, 0.06, D],
      ];
      if (i % 2 === 1) gl.push([-W / 2 + 5, D / 2 + 3.75, 10, 0.05, 1.0], [-W / 2 + 0.05, D / 2 + 1.9, 0.05, 3.8, 1.0]);
      gl.forEach(([x, z, sx, sz, h], k) => {
        const hh = h || gh;
        dummy.position.set(x, yF + hh / 2, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(sx, hh, sz);
        dummy.updateMatrix();
        glass.setMatrixAt(k, dummy.matrix);
      });
      glass.renderOrder = 2;
      g.add(glass);
      /* 樓層高亮光帶（樓板帶外緣）*/
      const accMat = new T.MeshBasicMaterial({ color: "#cfdde6" });
      const acc = new T.Group();
      [[0, D / 2 + 0.47, W + 0.95, 0.06], [0, -D / 2 - 0.47, W + 0.95, 0.06], [W / 2 + 0.47, 0, 0.06, D + 0.95], [-W / 2 - 0.47, 0, 0.06, D + 0.95]].forEach(([x, z, sx, sz]) => {
        const m = new T.Mesh(UNIT.box, accMat);
        m.position.set(x, y0 + 0.4, z);
        m.scale.set(sx, 1, sz);
        acc.add(m);
      });
      g.add(acc);
      /* 這一層的房間 */
      const ents = data.entities.filter((e) => e.cat === cat.id).slice(0, MAXI);
      const zones = zonesFor(ents.length || 1);
      const wallK = K[WALLS[i % WALLS.length]];
      const used = [];
      ents.forEach((ent, k) => {
        const z = zones[k],
          w = z.x1 - z.x0,
          d = z.z1 - z.z0,
          cx = (z.x0 + z.x1) / 2,
          cz = (z.z0 + z.z1) / 2,
          ry = z.front ? Math.PI : 0;
        const type = pickType(ent, used, i + k);
        used.push(type);
        // 房間地板
        F.box(cx, yF + 0.03, cz, w - 0.2, 0.03, d - 0.2, K[TYPE_FLOOR[type]]);
        // 隔間：走廊側（留門）、與隔壁之間
        const dz = z.front ? z.z0 : z.z1,
          door = 2.0,
          dx = cx + (k % 2 ? -1 : 1) * (w / 2 - 2.0);
        const segs = [[z.x0, dx - door / 2], [dx + door / 2, z.x1]];
        segs.forEach(([a, b]) => b - a > 0.05 && F.box((a + b) / 2, yF + WH / 2, dz, b - a, WH, 0.18, wallK));
        if (z.x1 < X1 - 0.01) F.box(z.x1, yF + WH / 2, cz, 0.18, WH, d, wallK);
        if (z.first && z.x0 > X0 + 0.01) F.box(z.x0, yF + WH / 2, cz, 0.18, WH, d, wallK);
        // 設備組
        const RF = frame(core, cx, yF, cz, ry, FS_);
        A.occ = { desk: 0.8, meeting: 0.55, board: 0.6, counter: 1 }[type] ?? 0.6;
        A.typing = type !== "meeting" && type !== "board";
        const rw = (w - 0.6) / FS_,
          rd = (d - 0.6) / FS_;
        ROOM[type](RF, rw, rd, A);
        // 站著辦公的人
        if (type === "counter") standing(RF, -0.6, rd / 2 - 0.9, Math.PI);
        if (type === "rack") standing(RF, 0.6, -0.15, Math.PI / 2);
        if (type === "printer") standing(RF, rw / 2 - 1.9, -1.8, Math.PI / 2);
        if (type === "board") standing(RF, -rw / 2 + 1.2, 0.9, Math.PI / 2);
        if (type === "meeting") standing(RF, -rw / 2 + 1.0, 0.8, Math.PI / 2);
        if (type === "desk" && rnd() < 0.7) standing(RF, rw / 2 - 1.3, rd / 2 - 1.2, -Math.PI * 0.75);
        // 點選範圍＝整間房
        const hit = new T.Mesh(new T.BoxGeometry(w - 0.2, HIT_H, d - 0.2), new T.MeshBasicMaterial({ visible: false }));
        hit.position.set(cx, yF + HIT_H / 2, cz);
        hit.userData.eid = ent.id;
        g.add(hit);
        pickables.push(hit);
        const an = new T.Object3D();
        an.position.set(cx, yF + 3.7, cz);
        g.add(an);
        anchors[ent.id] = an;
        items[ent.id] = { floor: i, cx, cz, w, d, y: yF, type, hit };
      });
      // 後排房間兩側的空地
      if (zones.length && ents.length <= 3) {
        const zl = zones[0].x0,
          zr = zones[Math.min(ents.length, zones.length) - 1].x1;
        [[X0 + 3.6, zl], [zr, X1]].forEach(([a, b]) => {
          if (b - a < 3) return;
          const mx = (a + b) / 2;
          plant(frame(core, mx - (b - a) * 0.28, yF, ZB0 + 1.4, 0, 1.35), 0, 0, 1.4);
          plant(frame(core, mx + (b - a) * 0.28, yF, ZB0 + 1.4, 0, 1.35), 0, 0, 1.2);
          const LF = frame(core, mx, yF, (ZB0 + ZB1) / 2, 0, 1.35);
          const sw = Math.min(3, (b - a - 1) / 1.35);
          LF.box(0, 0.25, 0, sw, 0.45, 0.95, K.sofa);
          LF.box(0, 0.62, -0.38, sw, 0.5, 0.2, K.sofa);
          LF.box(0, 0.22, 1.3, 1.4, 0.06, 0.7, K.woodL);
        });
      }
      // 開放區或走廊的擺設
      if (ents.length <= 3) {
        LOUNGE[i % LOUNGE.length](frame(core, 3, yF, (ZF0 + ZF1) / 2, 0, 1.25, 1.0), A);
        const CF = frame(core, -8 + i * 3.3, yF, ZF0 + 2.4, 0, 1.4);
        standing(CF, -0.35, 0, Math.PI / 2 - 0.3);
        standing(CF, 0.35, 0.05, -Math.PI / 2 + 0.3);
        // 共用設施：沿窗植栽、左側電話亭
        for (let x = -11; x <= 13; x += 4) {
          const PF = frame(core, x, yF, 11.5, 0, 1.3);
          PF.box(0, 0.25, 0, 1.8, 0.5, 0.6, K.wood);
          PF.ball(-0.4, 0.75, 0, 0.42, K.plant);
          PF.ball(0.45, 0.8, 0, 0.38, K.plant2);
        }
        for (let k = 0; k < 2; k++) {
          const BF = frame(core, -17.6, yF, 5.2 + k * 2.9, Math.PI / 2, 1.25);
          BF.box(0, 0.03, 0, 1.9, 0.06, 1.9, K.dark);
          BF.box(-0.92, 1.1, 0, 0.06, 2.2, 1.9, K.frost);
          BF.box(0.92, 1.1, 0, 0.06, 2.2, 1.9, K.frost);
          BF.box(0, 1.1, -0.92, 1.9, 2.2, 0.06, K.frost);
          BF.box(0, 2.22, 0, 1.95, 0.06, 1.95, K.white);
          BF.box(0, 0.25, -0.55, 1.3, 0.45, 0.55, A.acc);
          BF.box(0, 0.72, 0.25, 0.8, 0.05, 0.5, K.woodL);
        }
      }
      else
        for (const x of [-6, 6, 15]) {
          plant(frame(core, x, yF, 0, 0, 1.35), 0, 0, 1.2);
          frame(core, x - 2.8, yF, 0.9, 0, 1.35).box(0, 0.22, 0, 2.2, 0.44, 0.5, K.woodL);
        }
      /* 蓋章完成 */
      const recCore = realize(core, g),
        skinG = new T.Group(),
        ceilG = new T.Group();
      g.add(skinG, ceilG);
      realize(skin, skinG);
      realize(ceil, ceilG);
      const ledRec = realize(leds, g)[0] || null;
      /* 點樓層的替身（整層的體積）*/
      const pick = new T.Mesh(new T.BoxGeometry(W + 1, FH, D + 1), new T.MeshBasicMaterial({ visible: false }));
      pick.position.set(0, y0 + FH / 2, 0);
      pick.userData.isl = i;
      g.add(pick);
      IP.push(pick);
      floors.push({ i, y0, yF, g, gm, skinG, ceilG, acc, accMat, accBase: C("#cfdde6"), tagC: muted(col), col, ents, pick, ledRec, lift: 0, skin: 1, ceil: 1, hk: 0, scrPal: A.scr });
      isl.push({ c: V3(0, y0 + FH / 2, 0) });
    });
    leds = null;

    /* ---------- 屋頂 ---------- */
    const roofG = new T.Group();
    scene.add(roofG);
    {
      const R = mkStamp(),
        F = frame(R, 0, 0, 0);
      F.box(0, HT + SL / 2, 0, W, SL, D, K.slab);
      band(F, HT + 0.25, 0.8);
      F.box(0, HT + 1.05, D / 2 + 0.3, W + 0.9, 0.9, 0.3, K.fascia);
      F.box(0, HT + 1.05, -D / 2 - 0.3, W + 0.9, 0.9, 0.3, K.fascia);
      F.box(W / 2 + 0.3, HT + 1.05, 0, 0.3, 0.9, D + 0.9, K.fascia);
      F.box(-W / 2 - 0.3, HT + 1.05, 0, 0.3, 0.9, D + 0.9, K.fascia);
      F.box(-W / 2 + 7, HT + SL + 1.7, -D / 2 + 5, 10, 3.4, 7, K.white);
      F.box(-W / 2 + 7, HT + SL + 1.7, -D / 2 + 8.52, 7, 2.4, 0.05, K.frost);
      [0, 3, 6].forEach((dx) => F.box(W / 2 - 12 + dx, HT + SL + 0.7, -D / 2 + 4, 2.2, 1.4, 1.8, K.metal));
      F.box(8, HT + SL + 0.12, 5, 14, 0.24, 9, K.lawn);
      for (let k = 0; k < 6; k++) F.ball(2 + k * 2.3, HT + SL + 0.7, 1.4 + (k % 2) * 0.8, 0.7, k % 2 ? K.plant : K.plant2);
      for (let k = 0; k < 5; k++) F.box(-6 + k * 2.6, HT + SL + 0.2, 7.5, 2.2, 0.06, 1.4, K.dark, true);
      F.cyl(-W / 2 + 10, HT + SL + 5.4, -D / 2 + 4, 0.1, 4, K.metal);
      F.sph(-W / 2 + 10, HT + SL + 7.5, -D / 2 + 4, 0.28, K.red);
      realize(R, roofG);
    }
    let roofK = 1;
    const ICE = C("#7cc4e8"),
      NIGHTLED = C("#e6f6ff");

    /* ---------- 前方道路與來往的車 ---------- */
    const roadZ = PZ + PD / 2 + 4.2;
    const asphaltTex = mkTex((g, n) => {
      g.fillStyle = "#6b6f74";
      g.fillRect(0, 0, n, n);
      for (let k = 0; k < 400; k++) {
        g.fillStyle = rnd() < 0.5 ? "#73777c" : "#63676c";
        g.fillRect(rnd() * n, rnd() * n, 2, 2);
      }
      g.fillStyle = "#e9e6dc";
      g.fillRect(0, n / 2 - 3, n * 0.55, 6); // 中線虛線
    });
    slabTex(asphaltTex, PW, 8.4, 0, -0.62, roadZ, 8.4, 1.16);
    {
      const RS = mkStamp(),
        RF = frame(RS, 0, 0, 0);
      RF.box(0, 0.07, roadZ - 4.3, PW, 0.14, 0.3, K.white);
      RF.box(0, 0.07, roadZ + 4.3, PW, 0.14, 0.3, K.white);
      realize(RS, scene);
    }
    const CARC = ["#f2f2ef", "#b9bec4", "#4b5058", "#7f93a8", "#a8786c", "#d9d2c3"].map((h) => pal(h, "#" + C(h).multiplyScalar(0.4).getHexString()));
    const cars = [];
    for (let k = 0; k < 6; k++) cars.push({ lane: k % 2, x: -PW / 2 + (k * PW) / 6 + rnd() * 3, v: (5.5 + rnd() * 2.5) * (k % 2 ? -1 : 1), col: CARC[k % CARC.length] });
    const carBox = new T.InstancedMesh(UNIT.box, MAT.lit, cars.length * 3),
      carWheel = new T.InstancedMesh(UNIT.cyl, MAT.lit, cars.length * 4),
      carLight = new T.InstancedMesh(UNIT.box, MAT.glow, cars.length * 2);
    const carCols = [],
      wheelCols = [],
      lightCols = [];
    cars.forEach((c) => {
      carCols.push(c.col, c.col, pal("#3a4450", "#1c2a3a"));
      for (let k = 0; k < 4; k++) wheelCols.push(K.dark);
      lightCols.push(pal("#f3eee0", "#fff1c4"), pal("#f3eee0", "#fff1c4"));
    });
    [[carBox, carCols], [carWheel, wheelCols], [carLight, lightCols]].forEach(([im, cols]) => {
      im.frustumCulled = false;
      im.castShadow = im.material === MAT.lit;
      im.instanceMatrix.setUsage(T.DynamicDrawUsage);
      cols.forEach((c, q) => im.setColorAt(q, c.d));
      im.instanceColor.needsUpdate = true;
      themed.push({ im, cols });
      scene.add(im);
    });
    const cd = new T.Object3D();
    const putC = (im, i, x, y, z, sx, sy, sz, rx = 0) => {
      cd.position.set(x, y, z);
      cd.rotation.set(rx, 0, 0);
      cd.scale.set(sx, sy, sz);
      cd.updateMatrix();
      im.setMatrixAt(i, cd.matrix);
    };
    const drawCars = (dt) => {
      const half = PW / 2 - 1.5;
      cars.forEach((c, k) => {
        if (!reduce) c.x += c.v * dt;
        c.x > half + 4 && (c.x = -half - 4);
        c.x < -half - 4 && (c.x = half + 4);
        // 到基座邊緣時縮小消失，從另一端長出來
        const sc = clamp((half + 2 - Math.abs(c.x)) / 2.5),
          z = roadZ + (c.lane ? -1.9 : 1.9),
          dir = Math.sign(c.v);
        putC(carBox, k * 3, c.x, 0.62 * sc, z, 4.0 * sc, 0.75 * sc, 1.8 * sc);
        putC(carBox, k * 3 + 1, c.x - dir * 0.3 * sc, 1.22 * sc, z, 2.2 * sc, 0.55 * sc, 1.62 * sc);
        putC(carBox, k * 3 + 2, c.x - dir * 0.3 * sc, 1.22 * sc, z, 2.26 * sc, 0.4 * sc, 1.66 * sc);
        [[-1.3, -0.82], [-1.3, 0.82], [1.3, -0.82], [1.3, 0.82]].forEach(([wx, wz], j) => putC(carWheel, k * 4 + j, c.x + wx * sc, 0.36 * sc, z + wz * sc, 0.36 * sc, 0.25 * sc, 0.36 * sc, Math.PI / 2));
        putC(carLight, k * 2, c.x + dir * 2.0 * sc, 0.7 * sc, z - 0.55 * sc, 0.06 * sc, 0.16 * sc, 0.32 * sc);
        putC(carLight, k * 2 + 1, c.x + dir * 2.0 * sc, 0.7 * sc, z + 0.55 * sc, 0.06 * sc, 0.16 * sc, 0.32 * sc);
      });
      carBox.instanceMatrix.needsUpdate = carWheel.instanceMatrix.needsUpdate = carLight.instanceMatrix.needsUpdate = true;
    };
    drawCars(0);

    /* ---------- 廣場上的行人（共用人群模組）---------- */
    const HS = 1.4; // 室外人物比例（與放大後的家具一致）
    const rect = (x0, z0, x1, z1) => [V3(x0, 0, z0), V3(x1, 0, z0), V3(x1, 0, z1), V3(x0, 0, z1), V3(x0, 0, z0)];
    const zS = PZ + PD / 2 - 2.5;
    const oLoops = [
      rect(-W / 2 - 4.5, -D / 2 - 4, W / 2 + 4.5, D / 2 + 5.6),
      rect(-PW / 2 + 2.5, zS - 0.8, PW / 2 - 2.5, zS + 0.8),
      rect(-PW / 2 + 1.6, -D / 2 - 6, -PW / 2 + 1.6 + 0.01, zS),
      rect(PW / 2 - 1.6, -D / 2 - 6, PW / 2 - 1.6 + 0.01, zS),
      [V3(4, 0, D / 2 + 1.2), V3(4, 0, zS), V3(4.01, 0, D / 2 + 1.2)],
    ];
    const crowd = mkCrowd(T, scene, {
      scale: HS,
      rnd,
      reduce,
      loops: oLoops,
      pal: { skin: K.skin, hair: K.hairC, shirt: K.shirtC, pants: K.pantsC, bag: [K.dark, K.woodL, K.paper], tights: [K.dark] },
    });
    const NW = 22 + Math.min(10, N * 2);
    for (let k = 0; k < NW; k++) {
      const li = k < NW * 0.4 ? 0 : k < NW * 0.7 ? 1 : 2 + (k % 3);
      crowd.add("walk", { loop: li, s: rnd() * crowd.loopLen[li].L, v: (0.9 + rnd() * 0.6) * (rnd() < 0.5 ? 1 : -1), off: (rnd() - 0.5) * 1.2 });
    }
    // 入口前、長椅邊站著聊天的人
    [[1.5, D / 2 + 6.2, 0.4], [2.4, D / 2 + 6.4, -2.6], [-6, D / 2 + 10.4, 3.1]].forEach(([x, z, ry]) => crowd.add("idle", { x, z, ry }));
    crowd.finalize(MAT.lit, themed);
    crowd.draw(0, 0, null);

    /* ---------- 光柱與房間框線（點到細項時亮起）---------- */
    const beamH = FH - SL - 1.2;
    const beamMat = new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: T.AdditiveBlending,
      side: T.DoubleSide,
      uniforms: { uTime: { value: 0 }, uK: { value: 0 }, uCol: { value: new T.Color("#5fe3ff") } },
      vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader:
        "varying vec2 vUv; uniform float uTime,uK; uniform vec3 uCol; void main(){ float fade=pow(1.0-vUv.y,1.5); float st=0.55+0.45*sin(vUv.y*26.0-uTime*3.2); float ed=0.65+0.35*sin(vUv.x*37.7+uTime*1.3); gl_FragColor=vec4(uCol*(0.6+0.7*st), fade*0.42*uK*ed); }",
    });
    const beam = new T.Mesh(new T.CylinderGeometry(0.8, 1, beamH, 32, 1, true).translate(0, beamH / 2, 0), beamMat);
    beam.visible = false;
    beam.renderOrder = 3;
    scene.add(beam);
    const frameMat = new T.MeshBasicMaterial({ color: "#5fe3ff", transparent: true, opacity: 0, depthWrite: false });
    const rimG = new T.Group();
    const rim = [0, 1, 2, 3].map(() => {
      const m = new T.Mesh(UNIT.box, frameMat);
      rimG.add(m);
      return m;
    });
    rimG.visible = false;
    scene.add(rimG);
    let focusId = null,
      fk = 0;

    /* ---------- 夜晚飄浮的資料微粒 ---------- */
    const PN = 160,
      ppos = new Float32Array(PN * 3);
    for (let k = 0; k < PN; k++) ppos.set([(rnd() - 0.5) * 80, rnd() * (HT + 10), (rnd() - 0.5) * 60], k * 3);
    const pgeo = new T.BufferGeometry();
    pgeo.setAttribute("position", new T.BufferAttribute(ppos, 3));
    const pmat = new T.PointsMaterial({ color: "#6fe6ff", size: 0.25, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending });
    scene.add(new T.Points(pgeo, pmat));

    /* ---------- 日夜 ---------- */
    let mix = 0;
    const tc = new T.Color();
    const setTheme = (m) => {
      mix = m;
      themed.forEach((r) => {
        for (let k = 0; k < r.cols.length; k++) r.im.setColorAt(k, tc.copy(r.cols[k].d).lerp(r.cols[k].n, m));
        r.im.instanceColor.needsUpdate = true;
      });
      hemi.color.copy(L.hemiSky[0]).lerp(L.hemiSky[1], m);
      hemi.groundColor.copy(L.hemiGnd[0]).lerp(L.hemiGnd[1], m);
      hemi.intensity = L.hemiI[0] + (L.hemiI[1] - L.hemiI[0]) * m;
      sun.color.copy(L.sunC[0]).lerp(L.sunC[1], m);
      sun.intensity = L.sunI[0] + (L.sunI[1] - L.sunI[0]) * m;
      fog.color.copy(L.fog[0]).lerp(L.fog[1], m);
      // 白天：只有淡藍漸層天空；夜晚：深色地面、格線與遠處城市
      groundMat.opacity = m;
      ground.visible = m > 0.02;
      skyIM.visible = m > 0.5;
      gridMat.color.set("#14406e");
      gridMat.opacity = 0.45 * m;
      fog.near = L.fogN[0] + (L.fogN[1] - L.fogN[0]) * m;
      fog.far = L.fogF[0] + (L.fogF[1] - L.fogF[0]) * m;
      plazaMats.forEach((pm) => pm.color.set("#ffffff").lerp(C("#3a4558"), m));
      envSet(m);
      pmat.opacity = 0.85 * m;
      floors.forEach((f) => {
        f.gm.color.copy(glassBase.d).lerp(glassBase.n, m);
        f.gm.emissive.copy(glassBase.ed).lerp(glassBase.en, m);
      });
      const bl = m > 0.5 ? T.AdditiveBlending : T.NormalBlending;
      if (beamMat.blending !== bl) {
        beamMat.blending = bl;
        beamMat.needsUpdate = true;
      }
    };
    setTheme(0);

    /* ---------- 鏡頭 ---------- */
    const TAN = Math.tan((40 * Math.PI) / 360);
    const asp = () => innerWidth / Math.max(1, innerHeight);
    const mobile = () => innerWidth <= 760;
    const fit = (w, h) => Math.max(h / 2 / TAN, w / 2 / (TAN * asp()));
    const fitPanel = (w, h) =>
      mobile()
        ? Math.max(h / 2 / (TAN * 0.54), w / 2 / (TAN * asp()))
        : Math.max(h / 2 / TAN, w / 2 / (TAN * Math.max(0.5, (innerWidth - 360) / Math.max(1, innerHeight))));
    const orbit = (c, d, az, el) => ({ pos: V3(c.x + Math.sin(az) * Math.cos(el) * d, c.y + Math.sin(el) * d, c.z + Math.cos(az) * Math.cos(el) * d), target: c.clone() });
    const OV_AZ = 0.62,
      OV_EL = 0.26;
    const ovPose = () => {
      const pw = W * Math.cos(OV_AZ) + D * Math.sin(OV_AZ) + 16,
        ph = HT + 8 + (W * Math.sin(OV_AZ) + D * Math.cos(OV_AZ)) * Math.sin(OV_EL);
      const d = fit(pw, ph) * (mobile() ? 1.12 : 1.38);
      return orbit(V3(asp() > 1.25 ? -2 : mobile() ? 7 : 0, HT * 0.44, 0), d, OV_AZ, OV_EL);
    };
    const PL_AZ = 0.5,
      PL_EL = 0.86;
    const planPose = (i) => {
      const f = floors[i];
      const pw = W * Math.cos(PL_AZ) + D * Math.sin(PL_AZ) + 3,
        ph = (W * Math.sin(PL_AZ) + D * Math.cos(PL_AZ)) * Math.sin(PL_EL) + 4;
      return orbit(V3(0, f.yF, 1), fitPanel(mobile() ? pw * 0.62 : pw, ph) * 1.3, PL_AZ, PL_EL);
    };
    const roomPose = (id) => {
      const it = items[id],
        s = Math.max(it.w, it.d) + 4;
      return orbit(V3(it.cx, it.y + 0.6, it.cz), fitPanel(s * 1.2, s * 0.95), 0.42, 0.86);
    };
    const R0 = Math.max(30, fit(W + 16, HT + 20) / 3.2);

    /* ---------- 鏡頭動線：從全景穿過玻璃進到樓層 ---------- */
    const TT = () => window.__tour;
    let active = -1,
      path = null;
    const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    const startPath = (a, endPose, cam, ctl) => {
      const f = floors[a],
        y = f.yF,
        gx = 6;
      const P0 = cam.position.clone(),
        T0 = ctl.target.clone();
      const gOut = V3(gx + 4, y + 2.2, D / 2 + 11),
        gIn = V3(gx, y + 2.3, D / 2 - 5);
      path = {
        t0: performance.now(),
        ms: 3200 / ((TT() && TT().S.speed) || 1),
        a,
        pc: new T.CatmullRomCurve3([P0, gOut, gIn, endPose.pos.clone()], false, "centripetal"),
        tc: new T.CatmullRomCurve3([T0, V3(gx, y + 1.8, 0), V3(gx * 0.5, y + 1.0, -5), endPose.target.clone()], false, "centripetal"),
        p: 0,
      };
    };
    const activeFloor = (S) => (S && (S.mode === "island" || S.mode === "tour") && S.isl >= 0 ? S.isl : -1);

    /* ---------- 樓層標籤＋指引線（全景時顯示，可點）---------- */
    const tagWrap = document.createElement("div");
    tagWrap.id = "ftags";
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    tagWrap.appendChild(svg);
    document.body.appendChild(tagWrap);
    let hoverF = -1;
    const tags = floors.map((f, i) => {
      const b = document.createElement("button");
      b.className = "ftag";
      b.style.setProperty("--fc", "#" + f.tagC.getHexString());
      b.innerHTML = `<b>${i + 1}F</b><span></span>`;
      b.querySelector("span").textContent = cats[i].name;
      b.onclick = () => TT() && TT().focusIsland(i);
      b.onmouseenter = () => (hoverF = i);
      b.onmouseleave = () => (hoverF = -1);
      tagWrap.appendChild(b);
      const path = document.createElementNS(svgNS, "path");
      const dot = document.createElementNS(svgNS, "circle");
      dot.setAttribute("r", "3.5");
      dot.style.fill = "#" + f.tagC.getHexString();
      svg.append(path, dot);
      return { b, path, dot };
    });
    const pv = new T.Vector3();
    const toScr = (x, y, z, cam) => {
      pv.set(x, y, z).project(cam);
      return [((pv.x + 1) / 2) * innerWidth, ((1 - pv.y) / 2) * innerHeight];
    };
    const layoutTags = (cam, show) => {
      tagWrap.classList.toggle("off", !show);
      if (!show) return;
      let colX = 0;
      floors.forEach((f) => {
        colX = Math.max(colX, toScr(W / 2 + 0.5, f.y0 + FH * 0.5, -D / 2, cam)[0], toScr(W / 2 + 0.5, f.y0 + FH * 0.5, D / 2, cam)[0]);
      });
      colX += mobile() ? 10 : 34;
      tags.forEach((t, i) => {
        const f = floors[i];
        const [ax, ay] = toScr(W / 2 + 0.2, f.y0 + FH * 0.55, D / 2 - 6, cam);
        const tw = t.b.offsetWidth || 120;
        const x = Math.min(colX, innerWidth - tw - 8);
        t.b.style.left = x + "px";
        t.b.style.top = ay + "px";
        t.path.setAttribute("d", `M${ax.toFixed(1)} ${ay.toFixed(1)} L${(x - 4).toFixed(1)} ${ay.toFixed(1)}`);
        t.dot.setAttribute("cx", ax.toFixed(1));
        t.dot.setAttribute("cy", ay.toFixed(1));
      });
    };

    /* ---------- 對外介面（和六角群島相同的版型介面）---------- */
    const Wd = {
      anchors,
      pickables,
      islandPicks: IP,
      isl,
      dynLabels: [],
      noCatLabels: true,
      agents: [],
      pigeons: [],
      R: R0,
      get overviewPose() {
        return ovPose();
      },
      focusPose: (id) => roomPose(id),
      islandPose: (i) => (floors[i] ? planPose(i) : null),
      setFocus(id) {
        focusId = id && items[id] ? id : null;
        if (!focusId) return;
        const it = items[focusId];
        beam.position.set(it.cx, it.y, it.cz);
        const r = Math.min(it.w, it.d) * 0.3;
        beam.scale.set(r, 1, r);
        const w = it.w - 0.3,
          d = it.d - 0.3,
          y = it.y + 0.09;
        rim[0].position.set(it.cx, y, it.cz - d / 2);
        rim[0].scale.set(w, 0.06, 0.12);
        rim[1].position.set(it.cx, y, it.cz + d / 2);
        rim[1].scale.set(w, 0.06, 0.12);
        rim[2].position.set(it.cx - w / 2, y, it.cz);
        rim[2].scale.set(0.12, 0.06, d);
        rim[3].position.set(it.cx + w / 2, y, it.cz);
        rim[3].scale.set(0.12, 0.06, d);
      },
      setTheme,
      floors,
      items,
      update(t, dt, cam) {
        const tour = TT(),
          S = tour && tour.S,
          ctl = tour && tour.controls;
        /* 目前所在樓層改變 → 安排鏡頭與樓層顯示 */
        const a = activeFloor(S);
        if (a !== active) {
          const prev = active;
          active = a;
          path = null;
          if (a >= 0 && prev < 0 && ctl && !reduce) {
            const pose = S.mode === "tour" && S.cur ? roomPose(S.cur.entity) : planPose(a);
            startPath(a, pose, cam, ctl);
          }
        }
        let gateLift = 1,
          gateSkin = 1;
        if (path) {
          const p = Math.min(1, (performance.now() - path.t0) / path.ms),
            e = ease(p);
          // 時間分三段：飛到玻璃外（0–40%）、慢慢穿過玻璃（40–62%）、升到平面圖（62–100%）
          const u = e < 0.4 ? (e / 0.4) / 3 : e < 0.62 ? 1 / 3 + ((e - 0.4) / 0.22) / 3 : 2 / 3 + ((e - 0.62) / 0.38) / 3;
          cam.position.copy(path.pc.getPoint(u));
          ctl.target.copy(path.tc.getPoint(u));
          cam.lookAt(ctl.target);
          gateLift = clamp((e - 0.22) / 0.36);
          gateSkin = clamp((e - 0.45) / 0.12);
          if (p >= 1) path = null;
        }
        /* 樓層：上方升起移開、所在樓層玻璃與天花淡出 */
        const k = Math.min(1, dt * 4);
        floors.forEach((f, j) => {
          const wantLift = active >= 0 && j > active ? 1 : 0,
            wantSkin = active === j ? 0 : 1;
          if (path) {
            f.lift = Math.max(f.lift, wantLift * gateLift);
            f.skin = wantSkin ? f.skin + (1 - f.skin) * k : Math.min(f.skin, 1 - gateSkin);
          } else {
            f.lift += (wantLift - f.lift) * k;
            f.skin += (wantSkin - f.skin) * k;
          }
          f.g.position.y = f.lift * 16;
          f.g.visible = f.lift < 0.97;
          f.gm.opacity = (glassBase.od + (glassBase.on - glassBase.od) * mix) * f.skin;
          f.skinG.visible = f.skin > 0.35;
          f.ceilG.visible = f.skin > 0.6;
          // 點選：全景時只能點樓層；在某層時只能點該層的房間與下方樓層
          const lay = (m, on) => (on ? m.layers.set(0) : m.layers.set(31));
          lay(f.pick, f.lift < 0.5 && j !== active);
          f.ents.forEach((e) => items[e.id] && lay(items[e.id].hit, active === j));
          // 高亮光帶：滑過標籤、或就是所在樓層
          const want = j === hoverF || j === active ? 1 : 0;
          f.hk += (want - f.hk) * Math.min(1, dt * 5);
          f.accMat.color.copy(f.accBase).lerp(ICE, f.hk).lerp(NIGHTLED, mix * (1 - f.hk) * 0.8);
          f.acc.children.forEach((m) => (m.scale.y = 0.05 + 0.2 * f.hk));
        });
        amb.intensity += (mix * (active >= 0 ? 1.6 : 0.25) - amb.intensity) * k;
        roofK += ((active >= 0 ? 1 : 0) - roofK) * k;
        if (path) roofK = Math.max(roofK, gateLift);
        roofG.position.y = roofK * 16;
        roofG.visible = roofK < 0.97;
        tallG.visible = active !== 0;
        /* 光柱、房間框線 */
        fk += ((focusId ? 1 : 0) - fk) * Math.min(1, dt * (focusId ? 2.4 : 3));
        beamMat.uniforms.uTime.value = t;
        beamMat.uniforms.uK.value = fk;
        beam.visible = rimG.visible = fk > 0.004;
        frameMat.opacity = fk * (0.65 + 0.3 * Math.sin(t * 3));
        if (focusId) {
          const f = floors[items[focusId].floor];
          tc.copy(f.scrPal.d).lerp(f.scrPal.n, mix);
          beamMat.uniforms.uCol.value.copy(tc);
          frameMat.color.copy(tc);
        }
        /* 樓層標籤 */
        layoutTags(cam, !!S && S.mode === "overview" && !path);
        crowd.draw(t, dt, cam);
        drawCars(dt);
        if (reduce) return;
        /* 機櫃燈號閃爍 */
        floors.forEach((f) => {
          const r = f.ledRec;
          if (!r || !f.g.visible) return;
          for (let q = 0; q < r.cols.length; q++) r.im.setColorAt(q, tc.copy(r.cols[q].d).multiplyScalar(Math.sin(t * 5.5 + q * 2.3) > 0.1 ? 1 : 0.22));
          r.im.instanceColor.needsUpdate = true;
        });
        const pp = pgeo.attributes.position;
        for (let q = 0; q < PN; q++) {
          let y = pp.getY(q) + dt * (0.5 + (q % 5) * 0.12);
          y > HT + 10 && (y = 0);
          pp.setY(q, y);
        }
        pp.needsUpdate = true;
      },
    };

    /* 使用者拖曳鏡頭時，停止動線 */
    setTimeout(() => {
      const c = TT() && TT().controls;
      c && c.addEventListener("start", () => (path = null));
    }, 0);

    /* ---------- 手機：上下撥動切換樓層 ---------- */
    const stage = document.getElementById("stage");
    let sw = null;
    stage.addEventListener("pointerdown", (e) => (sw = e.pointerType === "touch" ? [e.clientX, e.clientY, performance.now()] : null));
    stage.addEventListener("pointerup", (e) => {
      if (!sw) return;
      const dx = e.clientX - sw[0],
        dy = e.clientY - sw[1],
        dt = performance.now() - sw[2];
      sw = null;
      const tt = TT();
      if (!tt || dt > 700 || Math.abs(dy) < 70 || Math.abs(dy) < Math.abs(dx) * 1.6) return;
      const cur = tt.S.isl;
      const to = dy < 0 ? (cur < 0 ? 0 : cur + 1) : cur - 1; // 往上撥＝去更高的一層
      if (to < 0) return tt.home();
      if (to >= N) return;
      tt.focusIsland(to);
    });
    return Wd;
  },
};
