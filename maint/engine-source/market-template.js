/* ===== 版型：市集（low poly；一區白色帳篷一個分類，一個攤位一個細項；零件用「蓋章」InstancedMesh 畫）===== */
Hc.market = {
  name: "市集",
  build({ THREE: T, scene, data, colorOf }) {
    const cats = data.categories,
      N = Math.max(1, cats.length),
      MAXI = 6;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let focusId = null,
      fk = 0;
    const V3 = (x, y, z) => new T.Vector3(x, y, z);
    const C = (h) => new T.Color(h);
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647), (seed - 1) / 2147483646);
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const neon = (hex, l, s) => {
      const o = {};
      C(hex).getHSL(o);
      return new T.Color().setHSL(o.h, s, l);
    };

    /* ---------- 尺寸與配置 ---------- */
    const TW = 3.2, // 帳篷寬
      TDP = 3.0, // 帳篷深
      PX = 3.7, // 帳篷間距
      ROWP = 6.4, // 兩排帳篷的間距（含前方走道）
      WK = 5.2, // 中央步道寬
      R = Math.ceil(N / 2), // 區塊排數
      GAPZ = 3.2,
      FRONT = 5, // 入口廣場深
      BACK = 10.5; // 餐車廣場深
    // 每區：項目 3 個以內一排（不足 3 頂補上裝飾帳篷），4–6 個兩排
    const nOf = cats.map((c) => Math.min(MAXI, data.entities.filter((e) => e.cat === c.id).length));
    const perRow = (n) => Math.max(3, n <= 3 ? n : Math.ceil(n / 2));
    const rowsOf = (n) => (n <= 3 ? 1 : 2);
    const BW = PX * Math.max(...nOf.map(perRow), 3), // 區塊寬（各區一致，左右對齊）
      BX = N === 1 ? 0 : WK / 2 + 1.6 + BW / 2, // 區塊中心 x
      HW = (N === 1 ? WK / 2 + 1.6 + BW : BX + BW / 2) + 3.4; // 廣場半寬
    const rowD = Array.from({ length: R }, (_, r) => Math.max(...[nOf[r * 2] || 0, nOf[r * 2 + 1] || 0].map((n) => rowsOf(n) * ROWP)));
    const DC = FRONT + rowD.reduce((a, b) => a + b, 0) + (R - 1) * GAPZ + BACK;
    const ZF = DC / 2, // 前牆
      ZB = -DC / 2; // 主館前緣
    const blockC = (i) => {
      const r = Math.floor(i / 2),
        side = N === 1 ? 0 : i % 2 === 0 ? -1 : 1;
      let z = ZF - FRONT;
      for (let k = 0; k < r; k++) z -= rowD[k] + GAPZ;
      const x = N === 1 ? -(WK / 2 + 1.6 + BW / 2) : side * BX;
      return V3(x, 0, z - (rowsOf(nOf[i]) * ROWP) / 2);
    };

    /* ---------- 色票（日／夜）---------- */
    const PAL = new Map();
    const pal = (d, n) => {
      n = n || "#" + C(d).multiplyScalar(0.42).getHexString();
      const k = d + "|" + n;
      PAL.has(k) || PAL.set(k, { d: C(d), n: C(n), same: false });
      return PAL.get(k);
    };
    const palC = (d, n) => ({ d, n, same: false });
    const K = {
      canvas: pal("#f7f3ea", "#9a9486"),
      cloth: pal("#efe6d6"),
      clothB: pal("#dfe7ea"),
      wood: pal("#b88a5a"),
      woodL: pal("#d9b98e"),
      metal: pal("#9aa3aa"),
      dark: pal("#3a3f45"),
      white: pal("#fbfaf6"),
      brick: pal("#b5634b"),
      brickD: pal("#9c5440"),
      stone: pal("#d8d4cc"),
      roof: pal("#8d8781"),
      roofD: pal("#676d73"),
      frame: pal("#2f3438"),
      glass: pal("#5f6b70", "#3a3320"),
      trunk: pal("#7a5a40"),
      leaf: pal("#7bab4f"),
      leaf2: pal("#93bf5b"),
      leaf3: pal("#5f9445"),
      hedge: pal("#6e9f4a"),
      pot: pal("#c8b8a4"),
      soil: pal("#7a6250"),
      paper: pal("#fffdf8"),
      ceramic: ["#d8dde0", "#a9b8c2", "#e8e2d6", "#8fa3ad", "#c9b8a2"].map((h) => pal(h)),
      art: ["#9cb4c8", "#d9b38c", "#a7c1a4", "#c8a6a0"].map((h) => pal(h)),
      bag: pal("#e8dcc4"),
      skin: ["#f1c9a5", "#e0b08a", "#c99772", "#f5d6b8"].map((h) => pal(h)),
      hair: ["#2b2622", "#3e2f25", "#151515", "#5a4332"].map((h) => pal(h)),
      shirt: ["#ffffff", "#e9e4d8", "#9fb3c4", "#c9a98a", "#7d8f7a", "#3f4a57", "#d8c3a5", "#a6b5a0", "#2f3b48", "#c7b6c9"].map((h) => pal(h)),
      pants: ["#2f3a4a", "#4a4f55", "#8a7d6b", "#e6e1d6", "#3b4636"].map((h) => pal(h)),
      bulb: pal("#d9d5c8", "#ffd58a"),
      win: pal("#4f5a60", "#ffcf86"),
      lamp: pal("#e8e4d8", "#ffe2a0"),
      truck: ["#9fbfa6", "#e6c46e", "#e9b9bf", "#9fb3cf"].map((h) => pal(h)),
    };

    /* ---------- 蓋章（同形狀同材質→一個 InstancedMesh）---------- */
    const pyrGeo = new T.CylinderGeometry(0, 1, 1, 4, 1).rotateY(Math.PI / 4);
    // 單位三角柱：寬 1、高 1、深 1，底邊在 y=0，尖端朝上（屋頂、山牆用）
    const triGeo = new T.CylinderGeometry(1, 1, 1, 3, 1).rotateX(-Math.PI / 2).translate(0, 0.5, 0).scale(1 / Math.sqrt(3), 1 / 1.5, 1);
    const UNIT = {
      box: new T.BoxGeometry(1, 1, 1),
      cyl: new T.CylinderGeometry(1, 1, 1, 10),
      cone: new T.CylinderGeometry(0.62, 1, 1, 8),
      ball: new T.IcosahedronGeometry(1, 0),
      sph: new T.SphereGeometry(1, 8, 6),
      pyr: pyrGeo,
      tri: triGeo,
      oct: new T.CylinderGeometry(1, 1, 1, 8),
    };
    const MAT = { lit: new T.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), glow: new T.MeshBasicMaterial({ color: 0xffffff }) };
    const themed = [];
    const mkStamp = () => {
      const B = new Map();
      return {
        B,
        put(shape, lit, col, x, y, z, sx, sy, sz, ry = 0, rz = 0, rx = 0) {
          const key = shape + (lit ? "L" : "G");
          B.has(key) || B.set(key, { shape, lit, items: [] });
          B.get(key).items.push({ x, y, z, sx, sy, sz, ry, rz, rx, col });
        },
      };
    };
    const dummy = new T.Object3D();
    const realize = (S, parent, shadow = true) => {
      const out = [];
      S.B.forEach((b) => {
        if (!b.items.length) return;
        const im = new T.InstancedMesh(UNIT[b.shape], b.lit ? MAT.lit : MAT.glow, b.items.length);
        im.frustumCulled = false;
        b.items.forEach((it, k) => {
          dummy.position.set(it.x, it.y, it.z);
          dummy.rotation.set(it.rx, it.ry, it.rz);
          dummy.scale.set(it.sx, it.sy, it.sz);
          dummy.updateMatrix();
          im.setMatrixAt(k, dummy.matrix);
          im.setColorAt(k, it.col.d);
        });
        im.instanceMatrix.needsUpdate = true;
        im.instanceColor.needsUpdate = true;
        im.castShadow = im.receiveShadow = b.lit && shadow;
        parent.add(im);
        const rec = { im, cols: b.items.map((it) => it.col) };
        themed.push(rec);
        out.push(rec);
      });
      return out;
    };
    const frame = (S, ox, oy, oz, ry = 0, sc = 1) => {
      const c = Math.cos(ry),
        s = Math.sin(ry);
      const P = (x, z) => [ox + (x * c + z * s) * sc, oz + (-x * s + z * c) * sc];
      return {
        box(x, y, z, w, h, d, col, lit = true, r2 = 0, rz = 0) {
          const [X, Z] = P(x, z);
          S.put("box", lit, col, X, oy + y * sc, Z, w * sc, h * sc, d * sc, ry + r2, rz);
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
        sph(x, y, z, r, col, lit = true, sy = 1) {
          const [X, Z] = P(x, z);
          S.put("sph", lit, col, X, oy + y * sc, Z, r * sc, r * sy * sc, r * sc);
        },
        pyr(x, y, z, side, h, col) {
          const [X, Z] = P(x, z);
          S.put("pyr", true, col, X, oy + y * sc, Z, (side / Math.SQRT2) * sc, h * sc, (side / Math.SQRT2) * sc, ry);
        },
        tri(x, y, z, w, h, d, col) {
          const [X, Z] = P(x, z);
          S.put("tri", true, col, X, oy + y * sc, Z, w * sc, h * sc, d * sc, ry);
        },
        oct(x, y, z, r, h, col) {
          const [X, Z] = P(x, z);
          S.put("oct", true, col, X, oy + y * sc, Z, r * sc, h * sc, r * sc, Math.PI / 8);
        },
      };
    };

    /* ---------- 光線（暖色午後）、霧 ---------- */
    const hemi = new T.HemisphereLight(0xffffff, 0xe8ddd0, 1.15);
    const sun = new T.DirectionalLight(0xfff0dc, 1.35);
    sun.position.set(-34, 58, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 10, far: 200 });
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.03;
    const amb = new T.AmbientLight(0xffd9a8, 0);
    scene.add(hemi, sun, amb);
    const fog = new T.Fog(0xf3ede2, 200, 420);
    scene.fog = fog;
    const L = {
      hemiSky: [C("#ffffff"), C("#4a5f8a")],
      hemiGnd: [C("#e8ddd0"), C("#1a1622")],
      hemiI: [1.15, 0.7],
      sunC: [C("#fff0dc"), C("#8fa8e0")],
      sunI: [1.35, 0.25],
      fog: [C("#f3ede2"), C("#121626")],
    };

    /* ---------- 貼圖：紅磚鋪面、石板步道 ---------- */
    const mkTex = (draw, size = 256) => {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      draw(c.getContext("2d"), size);
      const t = new T.CanvasTexture(c);
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.anisotropy = 4;
      return t;
    };
    const brickTex = mkTex((g, n) => {
      g.fillStyle = "#c9a593";
      g.fillRect(0, 0, n, n);
      const bh = 32,
        bw = 64;
      for (let r = 0; r < n / bh; r++)
        for (let c = -1; c < n / bw + 1; c++) {
          const x = c * bw + (r % 2 ? bw / 2 : 0);
          g.fillStyle = ["#b8735c", "#b06b55", "#bd7c63", "#a96751", "#c08467"][(r * 7 + c * 3 + 20) % 5];
          g.fillRect(x + 2, r * bh + 2, bw - 4, bh - 4);
        }
    });
    const stoneTex = mkTex((g, n) => {
      g.fillStyle = "#c9c6bf";
      g.fillRect(0, 0, n, n);
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 2; c++) {
          g.fillStyle = ["#dcd9d2", "#d5d2ca", "#e1ded7", "#d0cdc5"][(r + c * 3) % 4];
          g.fillRect(c * 128 + 2, r * 64 + 2, 124, 60);
        }
    });
    const texMats = [];
    const slab = (tex, w, d, x, y, z, rep, h = 0.06, side) => {
      const t = tex.clone();
      t.needsUpdate = true;
      t.repeat.set(w / rep, d / rep);
      const m = new T.MeshLambertMaterial({ color: "#ffffff", map: t });
      texMats.push(m);
      const mats = side ? [side, side, m, side, side, side] : m;
      const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), mats);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    };
    const baseSide = new T.MeshLambertMaterial({ color: "#d9d3c7" });
    texMats.push(baseSide);
    const GW = HW * 2 + 26,
      GD = DC + 46;
    slab(stoneTex, GW, GD, 0, -0.7, -4, 3.2, 1.4, baseSide); // 基座與外圍人行道
    slab(brickTex, HW * 2, DC + 1, 0, 0.03, 0, 1.6); // 廣場紅磚
    slab(stoneTex, WK, DC + 16, 0, 0.06, 7.5, 2.6); // 中央石板步道（延伸出大門）

    const site = mkStamp();
    const F = frame(site, 0, 0, 0);

    /* ---------- 紅磚圍牆、大門、樹籬 ---------- */
    const wall = (x0, x1, z, along = "x") => {
      const len = Math.abs(x1 - x0),
        mid = (x0 + x1) / 2;
      if (along === "x") {
        F.box(mid, 0.75, z, len, 1.5, 0.45, K.brick);
        F.box(mid, 1.55, z, len + 0.1, 0.12, 0.6, K.stone);
        for (let x = Math.min(x0, x1); x <= Math.max(x0, x1) + 0.01; x += 4.2) {
          F.box(x, 1.0, z, 0.75, 2.0, 0.75, K.brickD);
          F.box(x, 2.08, z, 0.9, 0.16, 0.9, K.stone);
          F.pyr(x, 2.32, z, 0.8, 0.35, K.stone);
        }
      } else {
        F.box(z, 0.75, mid, 0.45, 1.5, len, K.brick);
        F.box(z, 1.55, mid, 0.6, 0.12, len + 0.1, K.stone);
        for (let x = Math.min(x0, x1); x <= Math.max(x0, x1) + 0.01; x += 4.2) {
          F.box(z, 1.0, x, 0.75, 2.0, 0.75, K.brickD);
          F.box(z, 2.08, x, 0.9, 0.16, 0.9, K.stone);
          F.pyr(z, 2.32, x, 0.8, 0.35, K.stone);
        }
      }
    };
    const G2 = WK / 2 + 0.6;
    wall(-HW, -G2, ZF);
    wall(G2, HW, ZF);
    // 兩側牆（留一個側門）
    const sideWall = (x) => {
      const segs = [[ZF, ZF - 9], [ZF - 13, ZB + 1]];
      segs.forEach(([a, b]) => {
        const len = a - b,
          mid = (a + b) / 2;
        F.box(x, 0.75, mid, 0.45, 1.5, len, K.brick);
        F.box(x, 1.55, mid, 0.6, 0.12, len + 0.1, K.stone);
        for (let z = b; z <= a + 0.01; z += 4.2) {
          F.box(x, 1.0, z, 0.75, 2.0, 0.75, K.brickD);
          F.box(x, 2.08, z, 0.9, 0.16, 0.9, K.stone);
          F.pyr(x, 2.32, z, 0.8, 0.35, K.stone);
        }
      });
    };
    sideWall(-HW);
    sideWall(HW);
    // 大門鐵門（打開）
    for (const sx of [-1, 1]) {
      F.box(sx * (G2 + 0.1), 1.4, ZF, 0.95, 2.8, 0.95, K.brickD);
      F.box(sx * (G2 + 0.1), 2.9, ZF, 1.1, 0.2, 1.1, K.stone);
      F.pyr(sx * (G2 + 0.1), 3.2, ZF, 1.0, 0.45, K.stone);
      const gx = sx * (G2 - 0.3),
        gz = ZF - 1.1;
      F.box(gx, 1.15, gz, 0.06, 2.1, 2.2, K.frame, true, sx * 0.25);
      for (let k = 0; k < 6; k++) F.box(gx - sx * 0.02, 1.15, gz - 0.95 + k * 0.38, 0.05, 2.0, 0.05, K.frame);
    }
    // 牆外樹籬
    for (const sx of [-1, 1])
      for (let x = G2 + 2.5; x < HW - 1; x += 5.2) {
        F.box(sx * x, 0.35, ZF + 1.6, 4.4, 0.7, 1.3, K.stone);
        for (let k = 0; k < 4; k++) F.ball(sx * x - 1.6 + k * 1.05, 0.95, ZF + 1.6, 0.62, k % 2 ? K.hedge : K.leaf3, 0.75);
      }

    /* ---------- 樹（low poly 榕樹與一般樹）---------- */
    const tree = (x, z, s = 1, big = false) => {
      F.cyl(x, 1.4 * s, z, (big ? 0.55 : 0.25) * s, 2.8 * s, K.trunk);
      if (big) {
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2;
          F.cyl(x + Math.cos(a) * 1.4 * s, 1.6 * s, z + Math.sin(a) * 1.4 * s, 0.07 * s, 3.2 * s, K.trunk);
        }
        [[0, 4.4, 0, 2.6], [1.9, 3.9, 0.6, 2.0], [-1.8, 4.0, -0.4, 2.1], [0.5, 4.2, -1.8, 1.9], [-0.6, 4.1, 1.8, 1.9], [0, 5.6, 0, 1.8]].forEach(([dx, y, dz, r], k) =>
          F.ball(x + dx * s, y * s, z + dz * s, r * s, [K.leaf, K.leaf2, K.leaf3][k % 3], 0.8),
        );
      } else {
        F.ball(x, 3.2 * s, z, 1.5 * s, K.leaf, 0.9);
        F.ball(x + 0.7 * s, 3.9 * s, z - 0.3 * s, 1.0 * s, K.leaf2);
        F.ball(x - 0.6 * s, 3.7 * s, z + 0.4 * s, 0.9 * s, K.leaf3);
      }
    };
    // 八角形花台＋大榕樹（後方兩角）
    const bigTree = (x, z) => {
      F.oct(x, 0.3, z, 3.4, 0.6, K.stone);
      F.oct(x, 0.62, z, 3.0, 0.06, K.soil);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
        F.box(x + Math.cos(a) * 3.65, 0.42, z + Math.sin(a) * 3.65, 2.6, 0.12, 0.7, K.woodL, true, -a + Math.PI / 2);
      }
      tree(x, z, 1.25, true);
    };
    bigTree(-HW + 5.5, ZB + 5.5);
    bigTree(HW - 5.5, ZB + 5.5);
    tree(-HW - 4, ZF + 3.5, 1.3);
    tree(HW + 4, ZF + 3.5, 1.3);
    for (let z = ZF - 6; z > ZB; z -= 9) {
      tree(-HW - 5.5, z, 1.1);
      tree(HW + 5.5, z - 3, 1.05);
    }

    /* ---------- 主館：老紅磚倉庫（三個山牆）＋兩側廠房 ---------- */
    const HD = 13,
      HZ = ZB - HD / 2 - 0.5,
      HWd = Math.min(HW * 2 + 4, 44);
    const nG = 3,
      gw = HWd / nG;
    F.box(0, 0.25, HZ, HWd + 1, 0.5, HD + 1, K.stone);
    for (let k = 0; k < nG; k++) {
      const cx = -HWd / 2 + gw * (k + 0.5);
      F.box(cx, 3.5, HZ, gw, 6.5, HD, K.brick);
      // 山牆＋雙斜屋頂（三角柱）
      F.tri(cx, 6.75, HZ + HD / 2 - 0.25, gw - 0.2, 3.8, 0.5, K.brick);
      F.tri(cx, 6.75, HZ, gw + 0.5, 4.2, HD - 0.6, K.roof);
      F.box(cx, 6.85, HZ, gw + 0.6, 0.2, HD + 0.2, K.stone);
      // 圓窗、拱窗
      site.put("cyl", true, K.stone, cx, 8.2, HZ + HD / 2 + 0.05, 0.6, 0.12, 0.6, 0, 0, Math.PI / 2);
      site.put("cyl", false, K.win, cx, 8.2, HZ + HD / 2 + 0.12, 0.42, 0.08, 0.42, 0, 0, Math.PI / 2);
      for (const wx of [-gw * 0.28, gw * 0.28]) {
        if (k === 1) continue;
        F.box(cx + wx, 3.2, HZ + HD / 2 + 0.06, 2.0, 3.0, 0.12, K.frame);
        site.put("box", false, K.win, cx + wx, 3.2, HZ + HD / 2 + 0.14, 1.8, 2.8, 0.04);
        F.box(cx + wx, 4.85, HZ + HD / 2 + 0.06, 2.2, 0.3, 0.2, K.stone);
        for (let m = -1; m <= 1; m += 2) F.box(cx + wx + m * 0.45, 3.2, HZ + HD / 2 + 0.17, 0.06, 2.8, 0.05, K.frame);
        F.box(cx + wx, 3.2, HZ + HD / 2 + 0.17, 1.8, 0.06, 0.05, K.frame);
      }
      if (k === 1) {
        // 大拱門入口
        F.box(cx, 2.6, HZ + HD / 2 + 0.06, 5.2, 4.6, 0.14, K.frame);
        site.put("box", false, K.win, cx, 2.5, HZ + HD / 2 + 0.15, 4.9, 4.4, 0.04);
        F.box(cx, 5.1, HZ + HD / 2 + 0.08, 5.8, 0.4, 0.3, K.stone);
        for (let m = -2; m <= 2; m++) F.box(cx + m * 1.0, 2.5, HZ + HD / 2 + 0.18, 0.07, 4.4, 0.05, K.frame);
      }
      for (const px of [-gw / 2, gw / 2]) F.box(cx + px, 3.5, HZ + HD / 2 + 0.15, 0.5, 6.5, 0.3, K.brickD);
    }
    // 兩側廠房
    for (const sx of [-1, 1]) {
      const x = sx * (HW + 8),
        L = Math.min(DC * 0.55, 30),
        z = ZB + L / 2 + 1;
      F.box(x, 2.1, z, 7, 4.2, L, K.brick);
      F.tri(x, 4.2, z, 7.8, 2.2, L + 0.6, K.roof);
      for (let k = 0; k < Math.floor(L / 5); k++) {
        const wz = z - L / 2 + 2.5 + k * 5;
        F.box(x - sx * 3.52, 2.2, wz, 0.1, 2.2, 1.6, K.frame);
        site.put("box", false, K.win, x - sx * 3.56, 2.2, wz, 0.04, 2.0, 1.4);
      }
    }

    /* ---------- 餐車（主館前）---------- */
    const truck = (x, z, col, ry) => {
      const TF = frame(site, x, 0, z, ry);
      TF.box(0, 1.35, 0, 4.2, 2.1, 2.0, col);
      TF.box(-2.6, 1.0, 0, 1.2, 1.4, 1.9, col);
      TF.box(-2.85, 1.45, 0, 0.6, 0.6, 1.7, K.glass);
      TF.box(0.3, 1.5, 1.01, 2.6, 0.9, 0.04, K.dark);
      TF.box(0.3, 1.05, 1.25, 2.8, 0.08, 0.5, K.woodL);
      TF.box(0.3, 2.15, 1.45, 3.0, 0.08, 1.0, K.white, true, 0);
      for (let k = 0; k < 5; k++) TF.box(-0.6 + k * 0.45, 1.18, 1.25, 0.3, 0.18, 0.3, K.ceramic[k % 5]);
      for (const wx of [-2.4, 1.3]) for (const wz of [-1.0, 1.0]) TF.cyl(wx, 0.38, wz, 0.38, 0.25, K.dark);
      TF.box(0, 2.48, 0, 4.0, 0.08, 1.9, K.white);
    };
    const tz = ZB + 5.5;
    [-HW + 13, -6.2, 6.2, HW - 13].forEach((x, k) => truck(x, tz + (k % 2 ? 0.6 : 0), K.truck[k], 0));

    /* ---------- 路燈（步道兩側）---------- */
    const lamps = [];
    for (let z = ZF - 4; z > ZB + 8; z -= 11)
      for (const sx of [-1, 1]) {
        F.cyl(sx * (WK / 2 + 0.5), 1.8, z, 0.07, 3.6, K.metal);
        F.box(sx * (WK / 2 + 0.5), 3.7, z, 0.45, 0.3, 0.45, K.metal);
        site.put("box", false, K.lamp, sx * (WK / 2 + 0.5), 3.6, z, 0.36, 0.26, 0.36);
      }

    /* ---------- 攤位 ---------- */
    const GOODS = {
      pottery(TF, A) {
        for (let k = 0; k < 6; k++) TF.cyl(-1.1 + k * 0.44, 0.92, -0.1 + (k % 2) * 0.25, 0.17, 0.2, K.ceramic[k % 5]);
        TF.box(0, 1.4, -1.25, 2.6, 0.06, 0.4, K.woodL);
        for (let k = 0; k < 5; k++) TF.cone(-1.0 + k * 0.5, 1.6, -1.25, 0.13, 0.32, K.ceramic[(k + 2) % 5]);
      },
      art(TF, A) {
        for (const x of [-0.8, 0.6]) {
          TF.box(x, 1.55, -0.7, 0.9, 1.2, 0.06, K.wood);
          TF.box(x, 1.55, -0.66, 0.78, 1.06, 0.03, K.art[x > 0 ? 1 : 0]);
          TF.box(x, 0.85, -0.55, 0.05, 1.7, 0.05, K.wood, true, 0, 0.2);
        }
        for (let k = 0; k < 4; k++) TF.box(-1.0 + k * 0.6, 0.86, 0.15, 0.42, 0.04, 0.32, K.art[k]);
      },
      bags(TF, A) {
        TF.box(0, 1.9, -1.2, 2.8, 0.05, 0.05, K.metal);
        for (let k = 0; k < 4; k++) {
          TF.box(-1.05 + k * 0.7, 1.45, -1.2, 0.5, 0.65, 0.06, K.bag);
          TF.box(-1.05 + k * 0.7, 1.82, -1.2, 0.3, 0.2, 0.02, K.dark);
        }
        for (let k = 0; k < 3; k++) TF.box(-0.6 + k * 0.6, 0.9, 0.1, 0.45, 0.12, 0.35, K.bag);
      },
      plants(TF, A) {
        for (let k = 0; k < 5; k++) {
          TF.cone(-1.1 + k * 0.55, 0.92, 0.1, 0.16, 0.22, K.pot);
          TF.ball(-1.1 + k * 0.55, 1.15, 0.1, 0.22, k % 2 ? K.leaf : K.leaf2);
        }
        for (let k = 0; k < 3; k++) {
          TF.cone(-1.0 + k * 1.0, 0.25, -1.35, 0.26, 0.5, K.pot);
          TF.ball(-1.0 + k * 1.0, 0.85, -1.35, 0.5, k % 2 ? K.leaf3 : K.leaf, 1.2);
        }
      },
      cards(TF, A) {
        TF.box(0, 1.25, -0.3, 2.4, 0.9, 0.05, K.wood, true, 0, 0);
        for (let r = 0; r < 2; r++) for (let k = 0; k < 5; k++) TF.box(-0.95 + k * 0.48, 1.05 + r * 0.42, -0.26, 0.32, 0.36, 0.02, k % 2 ? K.paper : K.art[(k + r) % 4]);
        for (let k = 0; k < 4; k++) TF.box(-0.9 + k * 0.6, 0.86, 0.25, 0.35, 0.05, 0.25, K.paper);
      },
      books(TF, A) {
        for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) TF.box(-1.0 + k * 0.65, 0.86 + j * 0.06, 0.05, 0.5, 0.05, 0.36, j % 2 ? K.art[k] : K.paper);
        TF.box(0, 1.2, -1.3, 2.6, 1.4, 0.4, K.wood);
        for (let r = 0; r < 2; r++) for (let k = 0; k < 8; k++) TF.box(-1.1 + k * 0.31, 0.8 + r * 0.55, -1.15, 0.22, 0.36, 0.25, K.art[(k + r) % 4]);
      },
      cafe(TF, A) {
        TF.box(0.7, 1.05, 0.0, 0.5, 0.35, 0.4, K.metal);
        TF.cyl(0.7, 1.32, 0.0, 0.12, 0.2, K.dark);
        for (let k = 0; k < 5; k++) TF.cyl(-1.1 + k * 0.3, 0.92, 0.15, 0.09, 0.2, K.paper);
        TF.box(-0.6, 1.6, -1.0, 1.4, 0.8, 0.05, K.dark);
        TF.box(-0.6, 1.6, -0.97, 1.25, 0.65, 0.02, K.paper);
      },
      tech(TF, A) {
        for (const x of [-0.8, 0.4]) {
          TF.box(x, 1.18, -0.2, 0.9, 0.55, 0.06, K.dark, true, 0, 0);
          TF.box(x, 1.18, -0.16, 0.8, 0.45, 0.02, A.scr, false);
          TF.box(x, 0.88, 0.05, 0.6, 0.03, 0.3, K.metal);
        }
        TF.box(1.15, 0.95, 0.1, 0.35, 0.2, 0.25, K.white);
        TF.box(0, 1.85, -1.3, 1.8, 0.9, 0.06, K.white);
        TF.box(0, 1.85, -1.26, 1.6, 0.7, 0.02, A.scr, false);
      },
      desk(TF, A) {
        TF.box(0, 1.6, -1.2, 2.0, 0.9, 0.06, K.white);
        TF.box(0, 1.6, -1.16, 1.8, 0.4, 0.02, A.acc);
        for (let k = 0; k < 3; k++) TF.box(-0.7 + k * 0.7, 0.88, 0.1, 0.4, 0.06, 0.3, K.paper);
        TF.box(0.9, 0.95, -0.2, 0.3, 0.2, 0.3, K.ceramic[1]);
        TF.box(-1.6, 0.75, 0.9, 0.5, 1.5, 0.08, K.wood, true, 0.3);
        TF.box(-1.6, 1.2, 0.95, 0.42, 0.6, 0.03, K.paper, true, 0.3);
      },
    };
    const RULES = [
      ["tech", /系統|網路|AI|電腦|資安|平台|雲端|數位|軟體|自動化|程式|網站|App|帳號/i],
      ["desk", /諮詢|服務|窗口|客服|申請|協助|報修|問答|中心|小幫手/],
      ["books", /書|教學|課程|閱讀|學習|講座|研習|圖書/],
      ["cards", /卡|文件|表單|公文|證明|明信片|資料|簽核/],
      ["plants", /植|綠|環境|永續|花|園藝|生態/],
      ["pottery", /陶|瓷|手作|工藝|杯|碗/],
      ["art", /畫|藝術|設計|展|攝影|美/],
      ["bags", /袋|包|文創|周邊|紀念/],
      ["cafe", /咖啡|茶|飲|食|餐|甜點/],
    ];
    const ORDER = ["pottery", "art", "plants", "cards", "bags", "books", "cafe", "tech", "desk"];
    const goodsOf = (ent, used, base) => {
      const txt = (ent.name || "") + " " + (ent.highlight || "");
      for (const [t, re] of RULES) if (re.test(txt) && !used.includes(t)) return t;
      for (let k = 0; k < ORDER.length; k++) {
        const t = ORDER[(base + k) % ORDER.length];
        if (!used.includes(t)) return t;
      }
      return ORDER[base % ORDER.length];
    };

    /* 帳篷：白色金字塔頂、垂邊、四根柱、鋪布的桌子；垂邊上一條分類色（低彩度）*/
    const tent = (x, z, A) => {
      const TF = frame(site, x, 0, z, 0);
      TF.pyr(0, 2.95, 0, TW + 0.15, 0.95, K.canvas);
      for (const [dx, dz, w, d] of [[0, TDP / 2, TW, 0.04], [0, -TDP / 2, TW, 0.04], [TW / 2, 0, 0.04, TDP], [-TW / 2, 0, 0.04, TDP]]) TF.box(dx, 2.33, dz, w + 0.04, 0.32, d + 0.04, K.canvas);
      TF.box(0, 2.21, TDP / 2 + 0.03, TW, 0.07, 0.02, A.trim);
      for (const dx of [-TW / 2 + 0.05, TW / 2 - 0.05]) for (const dz of [-TDP / 2 + 0.05, TDP / 2 - 0.05]) TF.cyl(dx, 1.1, dz, 0.035, 2.2, K.metal);
      TF.box(0, 0.42, 0.15, 2.7, 0.82, 0.85, K.cloth);
      TF.box(0, 0.84, 0.15, 2.8, 0.03, 0.95, K.cloth);
      return TF;
    };

    /* ---------- 分區與攤位 ---------- */
    const blocks = [],
      fillers = [],
      items = {},
      anchors = {},
      pickables = [],
      IP = [],
      isl = [];
    const SCRp = pal("#9fd3ea", "#8fe0ff");
    cats.forEach((cat, i) => {
      const c = blockC(i),
        col = colorOf(cat.id);
      const A = {
        trim: palC(neon(col, 0.62, 0.25), neon(col, 0.3, 0.25)),
        acc: palC(neon(col, 0.72, 0.22), neon(col, 0.3, 0.22)),
        scr: SCRp,
      };
      const ents = data.entities.filter((e) => e.cat === cat.id).slice(0, MAXI);
      const n = ents.length,
        front = n <= 3 ? n : Math.ceil(n / 2),
        rows = rowsOf(n),
        pr = perRow(n);
      const used = [];
      const rowZ = (row) => c.z + (rows === 1 ? 0 : row === 0 ? ROWP / 2 : -ROWP / 2) - 0.6;
      const slotX = (j) => c.x + (j - (pr - 1) / 2) * PX;
      // 前排不足 3 頂：補上裝飾帳篷（沒有分類色帶，點了會進到這一區）
      for (let j = front; j < pr; j++) {
        const x = slotX(j),
          z = rowZ(0);
        const TF = tent(x, z, { trim: K.canvas });
        GOODS[pick(["pottery", "plants", "art", "bags", "cafe"])](TF, A);
        fillers.push({ x, z, block: i });
      }
      ents.forEach((ent, k) => {
        const row = k < front ? 0 : 1,
          j = row === 0 ? k : k - front;
        const x = slotX(j),
          z = rowZ(row);
        const TF = tent(x, z, A);
        const g = goodsOf(ent, used, i + k);
        used.push(g);
        GOODS[g](TF, A);
        const hit = new T.Mesh(new T.BoxGeometry(TW, 3.2, TDP), new T.MeshBasicMaterial({ visible: false }));
        hit.position.set(x, 1.6, z);
        hit.userData.eid = ent.id;
        scene.add(hit);
        pickables.push(hit);
        const an = new T.Object3D();
        an.position.set(x, 3.9, z);
        scene.add(an);
        anchors[ent.id] = an;
        items[ent.id] = { x, z, block: i, goods: g, front: z + TDP / 2, hit };
      });
      // 分區立牌（看板＋細柱）
      const sx = c.x + (c.x <= 0 ? BW / 2 + 0.9 : -BW / 2 - 0.9),
        sz = rowZ(0) + TDP / 2 + 0.6;
      F.cyl(sx, 1.2, sz, 0.05, 2.4, K.frame);
      F.box(sx, 2.35, sz, 1.4, 0.6, 0.06, K.white);
      F.box(sx, 2.35, sz + 0.04, 1.2, 0.12, 0.02, A.trim);
      // 點分區的範圍（整區地面）
      const bp = new T.Mesh(new T.BoxGeometry(BW + 1.6, 3.2, rows * ROWP + 0.4), new T.MeshBasicMaterial({ visible: false }));
      bp.position.set(c.x, 1.6, c.z - 0.4);
      bp.userData.isl = i;
      scene.add(bp);
      IP.push(bp);
      blocks.push({ i, c, n, rows, sign: V3(c.x, 4.5, rowZ(0)), tagC: neon(col, 0.5, 0.22), ents });
      isl.push({ c: c.clone() });
    });

    /* ---------- 夜晚串燈（帳篷列之間）---------- */
    const bulbs = mkStamp(),
      cable = [];
    blocks.forEach((b) => {
      const rows = b.rows === 1 ? [b.c.z - 0.6 + TDP / 2 + 0.2] : [b.c.z + ROWP / 2 - 0.6 + TDP / 2 + 0.2, b.c.z - ROWP / 2 - 0.6 + TDP / 2 + 0.2];
      rows.forEach((z) => {
        const x0 = b.c.x - BW / 2,
          x1 = b.c.x + BW / 2;
        for (let k = 0; k <= 16; k++) {
          const t = k / 16,
            x = x0 + (x1 - x0) * t,
            y = 2.18 - 0.22 * Math.sin(((t * 3) % 1) * Math.PI);
          bulbs.put("sph", false, K.bulb, x, y, z, 0.07, 0.07, 0.07);
        }
        cable.push([x0, 2.25, z, x1, 2.25, z]);
      });
    });
    // 步道上方的串燈（之字）
    for (let z = ZF - 3; z > ZB + 4; z -= 4)
      for (let k = 0; k <= 10; k++) {
        const t = k / 10;
        bulbs.put("sph", false, K.bulb, -WK / 2 - 0.5 + (WK + 1) * t, 3.3 - 0.4 * Math.sin(t * Math.PI), z - t * 2, 0.07, 0.07, 0.07);
      }
    realize(site, scene);
    const bulbRec = realize(bulbs, scene, false);

    /* ---------- 人：攤主、看攤的人、逛街的人（共用人群模組，每幀更新）---------- */
    const loops = [];
    const rect = (x0, z0, x1, z1) => [V3(x0, 0, z0), V3(x1, 0, z0), V3(x1, 0, z1), V3(x0, 0, z1), V3(x0, 0, z0)];
    blocks.forEach((b) => {
      const hw = BW / 2 + 1.1,
        hd = (b.rows * ROWP) / 2 + 0.9;
      loops.push(rect(b.c.x - hw, b.c.z - hd, b.c.x + hw, b.c.z + hd));
    });
    loops.push(rect(-HW + 1.6, ZB + 10, HW - 1.6, ZF - 2.2));
    loops.push([V3(-1.1, 0, ZF + 6), V3(-1.1, 0, ZB + 3), V3(1.1, 0, ZB + 3), V3(1.1, 0, ZF + 6), V3(-1.1, 0, ZF + 6)]);
    // 平視時：站在鏡頭與攤位之間（或離鏡頭很近）的人會擋住畫面
    const blocksView = (x, z, cam) => {
      const ax = cam.position.x,
        az = cam.position.z;
      const tt = window.__tour && window.__tour.controls ? window.__tour.controls.target : V3(0, 0, 0);
      const bx = tt.x - ax,
        bz = tt.z - az,
        L2 = bx * bx + bz * bz || 1;
      const u = Math.max(0, Math.min(1, ((x - ax) * bx + (z - az) * bz) / L2));
      const dx = ax + bx * u - x,
        dz = az + bz * u - z;
      return dx * dx + dz * dz < 1.1 * 1.1 || Math.hypot(x - ax, z - az) < 2.2;
    };
    const crowd = mkCrowd(T, scene, {
      scale: 1,
      rnd,
      reduce,
      loops,
      pal: { skin: K.skin, hair: K.hair, shirt: K.shirt, pants: K.pants, bag: [K.bag, K.dark, K.woodL], tights: [K.dark, pal("#4a4440")] },
      adjust(p, dt) {
        if (!p.stall) return;
        // 鏡頭聚焦這個攤位時，攤前的人往兩側讓開
        p.x0 === undefined && (p.x0 = p.x);
        p.aside += ((p.stall === focusId ? 1 : 0) - p.aside) * Math.min(1, dt * 2.5);
        const it = items[p.stall];
        p.x = p.x0 + Math.sign(p.x0 - it.x || 1) * 2.0 * p.aside;
      },
      hide: (p, cam) => cam && cam.position.y < 4 && blocksView(p.x, p.z, cam),
    });
    const mkPerson = (kind, opt) => crowd.add(kind, opt);
    // 攤主（站在桌後）
    Object.values(items).forEach((it) => mkPerson("vendor", { x: it.x + (rnd() - 0.5) * 0.8, z: it.z - 0.75, ry: 0 }));
    // 看攤的人（站在攤前）
    Object.entries(items).forEach(([id, it]) => {
      const m = 1 + Math.floor(rnd() * 2);
      for (let k = 0; k < m; k++) mkPerson("browse", { stall: id, x: it.x + (rnd() - 0.5) * 2.2, z: it.front + 0.7 + rnd() * 0.5, ry: Math.PI + (rnd() - 0.5) * 0.6, aside: 0 });
    });
    fillers.forEach((it) => mkPerson("browse", { x: it.x + (rnd() - 0.5) * 2, z: it.z + TDP / 2 + 0.8, ry: Math.PI + (rnd() - 0.5) * 0.6 }));
    // 餐車前排隊
    [-HW + 13, -6.2, 6.2, HW - 13].forEach((x) => {
      for (let k = 0; k < 2; k++) mkPerson("browse", { x: x + 0.3 + (rnd() - 0.5), z: tz + 2.3 + k * 0.8, ry: Math.PI });
    });
    // 逛街的人：沿路線走
    const WALKERS = Math.min(70, 22 + N * 7);
    for (let k = 0; k < WALKERS; k++) {
      const li = k < WALKERS * 0.25 ? loops.length - 1 - (k % 2) : k % loops.length;
      mkPerson("walk", { loop: li, s: rnd() * crowd.loopLen[li].L, v: (0.75 + rnd() * 0.5) * (rnd() < 0.5 ? 1 : -1), off: (rnd() - 0.5) * 1.1 });
    }
    crowd.finalize(MAT.lit, themed);
    crowd.draw(0, 0, null);

    /* ---------- 天上的飛鳥（幾群繞圈、拍翅膀）---------- */
    const FL = [],
      NB = 14;
    for (let k = 0; k < NB; k++) FL.push({ g: k % 3, a: rnd() * 6.28, r: 8 + rnd() * 6, y: 15 + rnd() * 6, sp: 0.18 + rnd() * 0.08, ph: rnd() * 6, dx: (rnd() - 0.5) * 3, dz: (rnd() - 0.5) * 3 });
    const flockC = [V3(-HW * 0.4, 0, -DC * 0.15), V3(HW * 0.5, 0, DC * 0.1), V3(0, 0, -DC * 0.35)];
    const birdMat = new T.MeshLambertMaterial({ color: "#4a4f57", flatShading: true });
    const birdBody = new T.InstancedMesh(UNIT.box, birdMat, NB),
      birdWing = new T.InstancedMesh(UNIT.box, birdMat, NB * 2);
    [birdBody, birdWing].forEach((im) => {
      im.frustumCulled = false;
      im.instanceMatrix.setUsage(T.DynamicDrawUsage);
      scene.add(im);
    });
    const bm = new T.Matrix4(),
      bq = new T.Quaternion(),
      be = new T.Euler(),
      bp = V3(0, 0, 0),
      bs = V3(1, 1, 1),
      bo = V3(0, 0, 0);
    const setB = (im, i, x, y, z, sx, sy, sz, ry, rz, ox = 0) => {
      be.set(0, ry, rz, "YZX");
      bq.setFromEuler(be);
      bo.set(ox, 0, 0).applyQuaternion(bq);
      bp.set(x + bo.x, y + bo.y, z + bo.z);
      bs.set(sx, sy, sz);
      bm.compose(bp, bq, bs);
      im.setMatrixAt(i, bm);
    };
    const drawBirds = (t) => {
      FL.forEach((b, i) => {
        const c = flockC[b.g],
          a = b.a + t * b.sp;
        const x = c.x + b.dx + Math.cos(a) * b.r,
          z = c.z + b.dz + Math.sin(a) * b.r,
          y = b.y + Math.sin(t * 0.7 + b.ph) * 0.6;
        const ry = -a; // 沿圓周飛
        const flap = reduce ? 0.2 : Math.sin(t * 9 + b.ph) * 0.65;
        setB(birdBody, i, x, y, z, 0.16, 0.12, 0.42, ry, 0);
        // 翅膀：以身體兩側為軸上下拍
        setB(birdWing, i * 2, x, y, z, 0.5, 0.03, 0.2, ry, flap, -0.25);
        setB(birdWing, i * 2 + 1, x, y, z, 0.5, 0.03, 0.2, ry, -flap, 0.25);
      });
      birdBody.instanceMatrix.needsUpdate = birdWing.instanceMatrix.needsUpdate = true;
    };
    drawBirds(0);

    /* ---------- 路上的兩隻小貓（慢慢走、偶爾停下）---------- */
    const catPath = [
      [V3(-HW + 2.2, 0, ZF - 3), V3(-HW + 2.2, 0, ZB + 12), V3(-WK / 2 - 0.6, 0, ZB + 12), V3(-WK / 2 - 0.6, 0, ZF - 3), V3(-HW + 2.2, 0, ZF - 3)],
      [V3(HW - 2.4, 0, ZB + 11), V3(HW - 2.4, 0, ZF - 4), V3(WK / 2 + 0.7, 0, ZF - 4), V3(WK / 2 + 0.7, 0, ZB + 11), V3(HW - 2.4, 0, ZB + 11)],
    ];
    const catLen = catPath.map((pts) => {
      let L = 0;
      const seg = [];
      for (let k = 1; k < pts.length; k++) seg.push(pts[k].distanceTo(pts[k - 1])), (L += seg[seg.length - 1]);
      return { L, seg };
    });
    const cats2 = [
      { li: 0, s: 3, col: pal("#d79a62", "#5a4130"), ph: 0 },
      { li: 1, s: 10, col: pal("#8e9196", "#3b3d42"), ph: 2 },
    ];
    const catMats = new T.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    const catIM = new T.InstancedMesh(UNIT.box, catMats, cats2.length * 9);
    catIM.frustumCulled = false;
    catIM.castShadow = true;
    catIM.instanceMatrix.setUsage(T.DynamicDrawUsage);
    scene.add(catIM);
    const catCols = [];
    cats2.forEach((c) => {
      for (let k = 0; k < 9; k++) catCols.push(k === 8 ? pal("#f3efe8", "#6a6560") : c.col);
    });
    catCols.forEach((c, q) => catIM.setColorAt(q, c.d));
    catIM.instanceColor.needsUpdate = true;
    themed.push({ im: catIM, cols: catCols });
    const cv = V3(0, 0, 0);
    const catAt = (li, s) => {
      const pts = catPath[li],
        { L, seg } = catLen[li];
      s = ((s % L) + L) % L;
      for (let k = 0; k < seg.length; k++) {
        if (s <= seg[k]) {
          const a = pts[k],
            b = pts[k + 1],
            t = s / seg[k];
          cv.set(a.x + (b.x - a.x) * t, 0, a.z + (b.z - a.z) * t);
          return Math.atan2(b.x - a.x, b.z - a.z);
        }
        s -= seg[k];
      }
      cv.copy(pts[0]);
      return 0;
    };
    const ce = new T.Euler(),
      cq = new T.Quaternion(),
      cm = new T.Matrix4(),
      cp = V3(0, 0, 0),
      cs = V3(1, 1, 1),
      co = V3(0, 0, 0);
    const putCat = (i, x, z, ry, lx, ly, lz, sx, sy, sz, rx = 0) => {
      ce.set(rx, ry, 0, "YXZ");
      cq.setFromEuler(ce);
      co.set(lx, ly, lz).applyQuaternion(new T.Quaternion().setFromEuler(new T.Euler(0, ry, 0)));
      cp.set(x + co.x, co.y, z + co.z);
      cs.set(sx, sy, sz);
      cm.compose(cp, cq, cs);
      catIM.setMatrixAt(i, cm);
    };
    const drawCats = (t, dt) => {
      cats2.forEach((c, n) => {
        const go = reduce ? 0 : Math.max(0, Math.sin(t * 0.25 + c.ph)); // 走一陣、停一陣
        c.s += 0.45 * go * dt;
        const ry = catAt(c.li, c.s),
          x = cv.x,
          z = cv.z,
          sw = Math.sin(t * 9 + c.ph) * 0.5 * Math.min(1, go * 3),
          b = n * 9;
        putCat(b, x, z, ry, 0, 0.32, 0, 0.24, 0.22, 0.55); // 身體
        putCat(b + 1, x, z, ry, 0, 0.47, 0.34, 0.22, 0.2, 0.2); // 頭
        putCat(b + 2, x, z, ry, -0.07, 0.6, 0.36, 0.06, 0.08, 0.04); // 耳
        putCat(b + 3, x, z, ry, 0.07, 0.6, 0.36, 0.06, 0.08, 0.04);
        putCat(b + 4, x, z, ry, 0, 0.5, -0.36, 0.05, 0.05, 0.35, -0.9 + Math.sin(t * 2 + c.ph) * 0.2); // 尾巴翹起
        [[-0.08, 0.18], [0.08, -0.18]].forEach(([lx, lz], k) => {
          putCat(b + 5 + k * 2, x, z, ry, lx, 0.12, lz, 0.06, 0.22, 0.06, sw * (k ? 1 : -1));
          putCat(b + 6 + k * 2, x, z, ry, -lx, 0.12, lz, 0.06, 0.22, 0.06, -sw * (k ? 1 : -1));
        });
      });
      catIM.instanceMatrix.needsUpdate = true;
    };
    drawCats(0, 0);

    /* ---------- 光柱與攤位框線 ---------- */
    const beamH = 3.4;
    const beamMat = new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: T.NormalBlending,
      side: T.DoubleSide,
      uniforms: { uTime: { value: 0 }, uK: { value: 0 }, uCol: { value: new T.Color("#ffd58a") } },
      vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader:
        "varying vec2 vUv; uniform float uTime,uK; uniform vec3 uCol; void main(){ float fade=pow(1.0-vUv.y,1.6); float st=0.6+0.4*sin(vUv.y*20.0-uTime*3.0); gl_FragColor=vec4(uCol*(0.7+0.5*st), fade*0.4*uK); }",
    });
    const beam = new T.Mesh(new T.CylinderGeometry(1.8, 2.2, beamH, 32, 1, true).translate(0, beamH / 2, 0), beamMat);
    beam.visible = false;
    beam.renderOrder = 3;
    scene.add(beam);
    const ringMat = new T.MeshBasicMaterial({ color: "#ffd58a", transparent: true, opacity: 0, depthWrite: false });
    const ring = new T.Mesh(new T.RingGeometry(2.2, 2.45, 48).rotateX(-Math.PI / 2), ringMat);
    ring.visible = false;
    scene.add(ring);

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
      texMats.forEach((tm) => tm.color.set("#ffffff").lerp(C("#5a5866"), m));
      amb.intensity = 0.85 * m;
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
    const OV_EL = 0.6;
    const ovPose = () => {
      const pw = HW * 2 + 10,
        ph = DC * Math.sin(OV_EL) + 14 + 10;
      return orbit(V3(0, 0, -2), fit(pw, ph) * (mobile() ? 0.95 : 1.0), 0.12, OV_EL);
    };
    const blockPose = (i) => {
      const b = blocks[i];
      const tz = b.rows === 1 ? b.c.z - 0.2 : b.c.z;
      return orbit(V3(b.c.x, 1.0, tz), fitPanel(BW + 8, b.rows * ROWP + 6) * 1.15, b.c.x < 0 ? -0.3 : b.c.x > 0 ? 0.3 : 0, 0.62);
    };
    // 攤位平視：鏡頭站在攤前走道（離攤位正面不超過 2.9，才不會被前一排帳篷擋住），沿走道往中央步道側退，看到整個攤面
    const stallPose = (id) => {
      const it = items[id];
      const d = Math.max(5.2, fitPanel(mobile() ? 4.2 : 5.2, 3.8));
      const az = Math.acos(Math.min(1, 2.9 / d)) * (it.x < 0 ? 1 : it.x > 0 ? -1 : 1);
      const tgt = V3(it.x, 1.1, it.front - 0.4);
      return { pos: V3(it.x + Math.sin(az) * d, 1.95, it.front - 0.4 + Math.cos(az) * d), target: tgt };
    };
    const R0 = Math.max(30, fit(HW * 2 + 10, DC) / 3);

    /* ---------- 聚焦攤位的鏡頭動線 ---------- */
    const TT = () => window.__tour;
    let path = null,
      lastEnt = null,
      lastMode = "overview";
    const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    // 拉近並轉到平視：水平位置平順前進，高度晚一點才降（先拉近、最後轉成平視），不會先貼近再後退
    const startWalk = (id, cam, ctl) => {
      const end = stallPose(id);
      path = {
        t0: performance.now(),
        ms: (cam.position.y > 12 ? 2600 : 1700) / ((TT() && TT().S.speed) || 1),
        P0: cam.position.clone(),
        T0: ctl.target.clone(),
        P1: end.pos,
        T1: end.target,
      };
    };

    /* ---------- 分區標籤（全景時顯示，可點）---------- */
    const tagWrap = document.createElement("div");
    tagWrap.id = "mtags";
    document.body.appendChild(tagWrap);
    const tags = blocks.map((b, i) => {
      const el = document.createElement("button");
      el.className = "mtag";
      el.style.setProperty("--fc", "#" + b.tagC.getHexString());
      el.innerHTML = "<i></i><span></span>";
      el.querySelector("span").textContent = cats[i].name;
      el.onclick = () => TT() && TT().focusIsland(i);
      tagWrap.appendChild(el);
      return el;
    });
    const pr = V3(0, 0, 0);
    const layoutTags = (cam, show) => {
      tagWrap.classList.toggle("off", !show);
      if (!show) return;
      blocks.forEach((b, i) => {
        pr.copy(b.sign).project(cam);
        tags[i].style.left = (((pr.x + 1) / 2) * innerWidth).toFixed(1) + "px";
        tags[i].style.top = (((1 - pr.y) / 2) * innerHeight).toFixed(1) + "px";
      });
    };

    /* ---------- 對外介面 ---------- */
    const W = {
      anchors,
      pickables,
      islandPicks: IP,
      isl,
      dynLabels: [],
      noCatLabels: true,
      agents: [],
      pigeons: [],
      R: R0,
      limits: { minPolar: 0.35, maxPolar: 1.56, minAz: -1.6, maxAz: 1.6 },
      get overviewPose() {
        return ovPose();
      },
      focusPose: (id) => stallPose(id),
      islandPose: (i) => (blocks[i] ? blockPose(i) : null),
      setFocus(id) {
        focusId = id && items[id] ? id : null;
        if (!focusId) return;
        const it = items[focusId];
        beam.position.set(it.x, 0.05, it.z + 0.3);
        ring.position.set(it.x, 0.1, it.z + 0.3);
      },
      setTheme,
      blocks,
      items,
      update(t, dt, cam) {
        const tour = TT(),
          S = tour && tour.S,
          ctl = tour && tour.controls;
        // 進到某個攤位時：拉近並轉到平視
        const ent = S && S.mode === "tour" && S.cur ? S.cur.entity : null;
        if (ent !== lastEnt) {
          if (ent && items[ent] && ctl && !reduce) startWalk(ent, cam, ctl);
          else if (!ent) path = null;
          lastEnt = ent;
        }
        if (S && S.mode !== "tour" && lastMode === "tour") path = null;
        lastMode = S ? S.mode : "overview";
        if (path) {
          const p = Math.min(1, (performance.now() - path.t0) / path.ms),
            e2 = ease(p),
            ey = e2 * e2;
          cam.position.set(
            path.P0.x + (path.P1.x - path.P0.x) * e2,
            path.P0.y + (path.P1.y - path.P0.y) * ey,
            path.P0.z + (path.P1.z - path.P0.z) * e2,
          );
          ctl.target.lerpVectors(path.T0, path.T1, e2);
          cam.lookAt(ctl.target);
          if (p >= 1) path = null;
        }
        // 光柱
        fk += ((focusId ? 1 : 0) - fk) * Math.min(1, dt * (focusId ? 2.4 : 3));
        beamMat.uniforms.uTime.value = t;
        // 平視時光柱會擋住攤面：鏡頭靠近就淡出，只留地上的光圈
        beamMat.uniforms.uK.value = fk * clamp((cam.position.distanceTo(beam.position) - 6) / 6);
        beam.visible = ring.visible = fk > 0.004;
        ringMat.opacity = fk * (0.6 + 0.25 * Math.sin(t * 3));
        // 點選：在某區時只開該區的攤位，全景時都能點
        const fl = S && (S.mode === "island" || S.mode === "tour") ? S.isl : -1;
        for (const id in items) {
          const it = items[id];
          fl < 0 || it.block === fl ? it.hit.layers.set(0) : it.hit.layers.set(31);
        }
        layoutTags(cam, !!S && S.mode === "overview" && !path);
        crowd.draw(t, dt, cam);
        drawBirds(t);
        drawCats(t, dt);
      },
    };
    // 拖曳鏡頭時停止動線
    setTimeout(() => {
      const c = TT() && TT().controls;
      c && c.addEventListener("start", () => (path = null));
    }, 0);
    return W;
  },
};
