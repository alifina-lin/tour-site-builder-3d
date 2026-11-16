  Dt = (s) => document.querySelector(s),
  he = (s) => String(s ?? "").replace(/[&<>"]/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[t]),
  Je = (s) => s != null && String(s).trim() !== "",
  um = Ge.site.brandColor || "#c8643b";
document.documentElement.style.setProperty("--accent", um);
document.title = Ge.site.title || "導覽網站";
var tr = Object.fromEntries(Ge.categories.map((s) => [s.id, s])),
  Wc = Object.fromEntries(Ge.entities.map((s) => [s.id, s])),
  dm = Object.fromEntries((Ge.sources || []).map((s) => [s.id, s])),
  Mn = Ge.steps.filter((s) => Wc[s.entity]),
  uM = () => matchMedia("(max-width:760px)").matches,
  Xc = (s) => (tr[s] && tr[s].color) || um,
  fm = (s) => s && Je(s.value) && Je(s.unit) && Je(s.label) && Je(s.year) && Je(s.src) && dm[s.src],
  Hc = {};
Hc.town = Hc.islands = {
  name: "六角群島",
  build({ THREE: s, scene: t, data: e, colorOf: n }) {
    let i = (M, U, y) => new s.Vector3(M, U, y),
      r = 7,
      a = () => {
        ((r |= 0), (r = (r + 1831565813) | 0));
        let M = Math.imul(r ^ (r >>> 15), 1 | r);
        return ((M = (M + Math.imul(M ^ (M >>> 7), 61 | M)) ^ M), ((M ^ (M >>> 14)) >>> 0) / 4294967296);
      },
      o = (M) => M[Math.floor(a() * M.length)],
      c = (M, U) => M + a() * (U - M),
      l = (M, U = {}) => new s.MeshLambertMaterial(Object.assign({ color: M, flatShading: !0 }, U)),
      h = (M, U, y, C, L, D) => {
        let F = new s.Mesh(M, U);
        return (F.position.set(y, C, L), (D || t).add(F), F);
      },
      u = (M) => M != null && String(M).trim() !== "",
      d = matchMedia("(prefers-reduced-motion: reduce)").matches,
      f = new Map(),
      m = (M) => (f.has(M) || f.set(M, l(M)), f.get(M)),
      _ = new Map(),
      g = (M, U) => (_.has(M) || _.set(M, U()), _.get(M)),
      p = (M, U, y) => g("b" + M + "," + U + "," + y, () => new s.BoxGeometry(M, U, y)),
      v = (M, U = 10, y = 8) => g("s" + M + "," + U + "," + y, () => new s.SphereGeometry(M, U, y)),
      x = (M, U, y, C = 8) => g("c" + M + "," + U + "," + y + "," + C, () => new s.CylinderGeometry(M, U, y, C)),
      S = e.categories,
      I = Math.max(1, S.length),
      E = 7.4,
      R = E * Math.cos(Math.PI / 6),
      k = 3.4,
      w = 2 * R + k;
    t.add(new s.HemisphereLight(16777215, 13621704, 1.05));
    let T = new s.DirectionalLight(16774112, 1.1);
    (T.position.set(12, 22, 8), t.add(T));
    let V = {},
      q = { brick: 1.2, wood: 1.6, stone: 1.5, dirt: 4, grass: 4 },
      ht = {
        brick: (M) => {
          ((M.fillStyle = "#ead9c4"), M.fillRect(0, 0, 128, 128));
          for (let U = 0; U < 4; U++)
            for (let y = 0; y < 2; y++) {
              let C = (y * 64 + (U % 2 ? 32 : 0)) % 128,
                L = U * 32 + 2;
              ((M.fillStyle = o(["#c4795f", "#cc8268", "#bd7058", "#c97d63"])),
                M.fillRect(C + 2, L, 60, 28),
                C + 62 > 128 && M.fillRect(C - 126, L, 60, 28));
            }
        },
        wood: (M) => {
          for (let U = 0; U < 4; U++)
            ((M.fillStyle = ["#c99b6b", "#bf9060", "#d0a574", "#c3955f"][U]),
              M.fillRect(0, U * 32, 128, 32),
              (M.fillStyle = "#8f6a42"),
              M.fillRect(0, U * 32, 128, 2),
              M.fillRect((U * 41 + 20) % 128, U * 32, 2, 32));
        },
        stone: (M) => {
          ((M.fillStyle = "#bdb7aa"), M.fillRect(0, 0, 128, 128));
          for (let U = 0; U < 2; U++)
            for (let y = 0; y < 2; y++) {
              let C = (y * 64 + (U ? 32 : 0)) % 128,
                L = U * 64;
              ((M.fillStyle = o(["#dcd7cb", "#d3cec2", "#e0dbcf"])),
                M.fillRect(C + 2, L + 2, 60, 60),
                C + 62 > 128 && M.fillRect(C - 126, L + 2, 60, 60));
            }
        },
        dirt: (M) => {
          ((M.fillStyle = "#e6dcc3"), M.fillRect(0, 0, 128, 128));
          for (let U = 0; U < 50; U++)
            ((M.fillStyle = o(["#d9ceb2", "#efe6cf"])), M.fillRect(a() * 128, a() * 128, 4, 3));
        },
        grass: (M) => {
          ((M.fillStyle = "#b5d39a"), M.fillRect(0, 0, 128, 128));
          for (let U = 0; U < 60; U++)
            ((M.fillStyle = o(["#a7c88b", "#c3dfa8", "#aed094"])), M.fillRect(a() * 128, a() * 128, 5, 4));
        },
      },
      z = (M) =>
        V[M] ||
        (V[M] = (() => {
          let U = document.createElement("canvas");
          ((U.width = U.height = 128), ht[M](U.getContext("2d")));
          let y = new s.CanvasTexture(U);
          return ((y.wrapS = y.wrapT = s.RepeatWrapping), (y.colorSpace = s.SRGBColorSpace), (y.anisotropy = 4), y);
        })()),
      H = {},
      W = (M) => H[M] || (H[M] = new s.MeshLambertMaterial({ map: z(M) })),
      tt = (M, U, y) => {
        let C = M.attributes.uv;
        for (let L = 0; L < C.count; L++) C.setXY(L, C.getX(L) * U, C.getY(L) * y);
        return M;
      },
      j = (M, U, y) => {
        let C = new s.PlaneGeometry(M, U);
        return (C.rotateX(-Math.PI / 2), tt(C, M / y, U / y));
      },
      $ = (M, U) => {
        let y = new s.CircleGeometry(M, 28);
        return (y.rotateX(-Math.PI / 2), tt(y, (2 * M) / U, (2 * M) / U));
      },
      ct = (M, U) => {
        let y = new s.Shape();
        for (let L = 0; L < 6; L++) {
          let D = Math.PI / 2 + (L * Math.PI) / 3,
            F = M * Math.cos(D),
            Z = M * Math.sin(D);
          L ? y.lineTo(F, Z) : y.moveTo(F, Z);
        }
        y.closePath();
        let C = new s.ShapeGeometry(y);
        return (C.rotateX(-Math.PI / 2), tt(C, 1 / U, 1 / U));
      },
      nt = (M, U) => {
        if (!U.length) return;
        let y = new s.InstancedMesh(M, new s.MeshLambertMaterial({ color: 16777215, flatShading: !0 }), U.length),
          C = new s.Object3D(),
          L = new s.Color();
        return (
          U.forEach((D, F) => {
            (C.position.set(D.x, D.y, D.z),
              C.rotation.set(0, D.ry || 0, 0),
              C.scale.set(D.sx, D.sy, D.sz),
              C.updateMatrix(),
              y.setMatrixAt(F, C.matrix),
              y.setColorAt(F, L.set(D.c)));
          }),
          (y.instanceMatrix.needsUpdate = !0),
          (y.instanceColor.needsUpdate = !0),
          t.add(y),
          y
        );
      },
      St = [w * Math.sin(Math.PI / 6), w * Math.cos(Math.PI / 6)],
      X = [w, 0],
      st = (M, U) => [M * St[0] + U * X[0], M * St[1] + U * X[1]],
      bt = [[0, 0]];
    for (let M = 1; bt.length < I && M < 8; M++) {
      let U = [];
      for (let y = -M; y <= M; y++)
        for (let C = -M; C <= M; C++) Math.max(Math.abs(y), Math.abs(C), Math.abs(y + C)) === M && U.push([y, C]);
      (U.sort((y, C) => {
        let L = st(...y),
          D = st(...C);
        return Math.atan2(L[0], L[1]) - Math.atan2(D[0], D[1]);
      }),
        bt.push(...U));
    }
    let Nt = bt.slice(0, I).map((M) => st(...M)),
      Rt = Nt.reduce((M, U) => [M[0] + U[0] / I, M[1] + U[1] / I], [0, 0]),
      Tt = Nt.map((M, U) => ({ i: U, c: i(M[0] - Rt[0], 0, M[1] - Rt[1]), nb: [], doors: [], ents: [] })),
      qt = Tt.reduce((M, U) => Math.max(M, U.c.length()), 0) + E;
    Tt.forEach((M) =>
      Tt.forEach((U) => {
        M !== U && Math.abs(M.c.distanceTo(U.c) - w) < 0.05 && M.nb.push(U.i);
      }),
    );
    let Lt = (M, U) => {
        let y = Tt[U].c.clone().sub(Tt[M].c);
        return Math.atan2(y.x, y.z);
      },
      Jt = (M) => (
        (M = String(M || "")),
        /磚|brick/i.test(M) ? "brick" : /草|grass/i.test(M) ? "grass" : /木|地板|wood/i.test(M) ? "wood" : ""
      ),
      O = (M) => (
        (M = String(M || "")),
        /籬|綠|hedge/i.test(M)
          ? "hedge"
          : /柵|木|fence/i.test(M)
            ? "fence"
            : /混|mix/i.test(M)
              ? "mix"
              : /原|無|plain|none/i.test(M)
                ? "plain"
                : ""
      ),
      mt = [
        ["brick", "hedge"],
        ["grass", "fence"],
        ["wood", "plain"],
        ["grass", "mix"],
        ["brick", "fence"],
        ["wood", "hedge"],
        ["grass", "plain"],
        ["brick", "mix"],
      ],
      J = ["stone", "brick", "dirt", "wood"];
    Tt.forEach((M, U) => {
      let y = S[U] || {},
        C = mt[U % mt.length];
      ((M.ground = Jt(y.ground) || C[0]), (M.edge = O(y.edge) || C[1]));
      let L = J[U % 4];
      (L === M.ground && (L = J[(U + 1) % 4]), (M.path = L), (M.col = n(y.id)));
    });
    let dt = h(new s.CircleGeometry(qt + 90, 48), l(9422540), 0, -0.7, 0);
    dt.rotation.x = -Math.PI / 2;
    let K = [],
      Ft = [],
      wt = [],
      A = [],
      b = [],
      G = [],
      lt = [7118434, 8367726, 6263129, 8959349],
      at = [8367726, 7118434, 9747839];
    let IP = [];
    Tt.forEach((M) => {
      let { x: U, z: y } = M.c;
      [
        h(new s.CylinderGeometry(E * 1.12, E * 1.16, 0.3, 6), l(12049622), U, -0.5, y),
        h(new s.CylinderGeometry(E, E * 0.95, 0.9, 6), l(14206624), U, -0.45, y),
        h(ct(E, q[M.ground]), W(M.ground), U, 0.01, y),
      ].forEach((m) => ((m.userData.isl = M.i), IP.push(m)));
      let C = [0, 1, 2, 3, 4, 5].map((L) => {
        let D = Math.PI / 6 + (L * Math.PI) / 3;
        return M.nb.some((F) => Math.abs(Math.atan2(Math.sin(Lt(M.i, F) - D), Math.cos(Lt(M.i, F) - D))) < 0.1);
      });
      for (let L = 0; L < 6; L++) {
        let D = (L * Math.PI) / 3,
          F = ((L + 1) * Math.PI) / 3,
          Z = 0.93,
          et = U + E * Z * Math.sin(D),
          pt = y + E * Z * Math.cos(D),
          Et = U + E * Z * Math.sin(F),
          Pt = y + E * Z * Math.cos(F),
          ut = Et - et,
          Q = Pt - pt,
          Ot = Math.hypot(ut, Q),
          Yt = Math.atan2(-Q, ut),
          Zt = M.edge === "mix" ? ((L + M.i) % 2 ? "hedge" : "fence") : M.edge,
          Kt = Math.round(Ot / (Zt === "hedge" ? 0.9 : 1.05));
        if (Zt === "hedge" && (L + M.i) % 2 === 0) {
          // 修剪整齊、對齊成一整條的綠籬（有橋的邊在中間留出入口）
          (C[L] ? [[0, 0.33], [0.67, 1]] : [[0, 1]]).forEach(([a0, a1]) => {
            let x0 = a0 === 0 ? -0.12 / Ot : a0,
              x1 = a1 === 1 ? 1 + 0.12 / Ot : a1,
              mx = et + ut * ((x0 + x1) / 2),
              mz = pt + Q * ((x0 + x1) / 2),
              len = Ot * (x1 - x0);
            K.push({ x: mx, y: 0.33, z: mz, ry: Yt, sx: len, sy: 0.66, sz: 0.62, c: 6263129 });
            K.push({ x: mx, y: 0.675, z: mz, ry: Yt, sx: len - 0.06, sy: 0.05, sz: 0.54, c: 8367726 });
          });
          continue;
        }
        for (let Gt = 0; Gt <= Kt; Gt++) {
          let Xt = Gt / Kt;
          if (C[L] && Math.abs(Xt - 0.5) < 0.17) continue;
          let mn = et + ut * Xt,
            ce = pt + Q * Xt;
          if (Zt === "hedge") {
            let We = c(0.5, 0.8);
            K.push({ x: mn, y: We / 2, z: ce, ry: Yt + c(-0.2, 0.2), sx: 1, sy: We, sz: c(0.6, 0.8), c: o(lt) });
          } else if (Zt === "fence") {
            if (
              (Ft.push({ x: mn, y: 0.36, z: ce, ry: Yt, sx: 0.12, sy: 0.72, sz: 0.12, c: 11569754 }),
              Gt < Kt && !(C[L] && Math.abs((Gt + 0.5) / Kt - 0.5) < 0.17))
            ) {
              let We = et + (ut * (Gt + 0.5)) / Kt,
                gn = pt + (Q * (Gt + 0.5)) / Kt;
              [0.26, 0.52].forEach((zn) =>
                wt.push({ x: We, y: zn, z: gn, ry: Yt, sx: Ot / Kt, sy: 0.07, sz: 0.05, c: 13214580 }),
              );
            }
          } else if (Gt < Kt) {
            let We = et + (ut * (Gt + 0.5)) / Kt,
              gn = pt + (Q * (Gt + 0.5)) / Kt;
            (C[L] && Math.abs((Gt + 0.5) / Kt - 0.5) < 0.17) ||
              A.push({ x: We, y: 0.09, z: gn, ry: Yt, sx: Ot / Kt, sy: 0.18, sz: 0.32, c: 15261642 });
          }
        }
      }
      (h($(1.55, q[M.path]), W(M.path), U, 0.045, y), (M.P = i(U, 0, y)));
    });
    let it = [];
    Tt.forEach((M) =>
      M.nb.forEach((U) => {
        let y = Lt(M.i, U),
          C = R + k / 2,
          L = Math.sin(y),
          D = Math.cos(y),
          F = h(j(0.95, C, q[M.path]), W(M.path), M.c.x + (L * C) / 2, 0.05, M.c.z + (D * C) / 2);
        if (((F.rotation.y = y), M.i < U)) {
          let Z = M.c.x + L * (R + k / 2),
            et = M.c.z + D * (R + k / 2),
            pt = h(new s.BoxGeometry(1.35, 0.24, k + 0.5), l(13481874), Z, -0.1, et);
          ((pt.rotation.y = y), it.push([M.i, U]));
        }
      }),
    );
    let Ut = (M) => {
        let U = (M && M.shape) || (M && M.name) || "";
        return /牆|盾|防|資安|安全/.test(U)
          ? "wall"
          : /塔|管線|網路|天線|燈|通訊/.test(U)
            ? "tower"
            : /圓|穹|球|雲|平台|資料|中心|園/.test(U)
              ? "dome"
              : /門|入口|窗口|橋|櫃台|服務台/.test(U)
                ? "gate"
                : "house";
      },
      Mt = 16249576,
      At = {},
      Vt = [],
      Wt = {},
      rt = [],
      ee = (M) => {
        let U = S.findIndex((y) => y.id === M);
        return U < 0 ? 0 : U;
      };
    /* ===== 光柱特效：漸層光柱＋往上流動的光紋＋地面魔法圈＋仙子閃粉 ===== */
    let fxs = 7,
      fxr = () => ((fxs = (fxs * 16807) % 2147483647) / 2147483647),
      FXU = { uTime: { value: 0 }, uPR: { value: Math.min(devicePixelRatio, 2) }, uBoost: { value: 1 }, uDust: { value: 1 }, halos: [] },
      fxCS = `
        #include <colorspace_fragment>`,
      beamV = `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0);
          vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz);
          gl_Position = projectionMatrix * viewMatrix * w; }`,
      beamF = `uniform float uK, uTime, uBoost, uAlpha, uCore; uniform vec3 uTint;
        varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main(){
          float f = abs(dot(normalize(vN), normalize(vV)));
          float y = vUv.y;
          float a = pow(f, 1.4) * pow(1.0 - y, 1.3) * smoothstep(0.0, 0.03, y);
          a *= 0.72 + 0.28 * smoothstep(0.3, 1.0, sin(uTime * 4.0 - y * 26.0));
          vec3 c = mix(uTint, vec3(1.0, 0.93, 0.75), uCore * (0.6 + 0.4 * f));
          gl_FragColor = vec4(c, clamp(a * uK * uAlpha * uBoost, 0.0, 1.0));` + fxCS + `
        }`,
      ringF = `uniform float uK, uTime, uBoost, uAge; uniform vec3 uTint; varying vec2 vUv;
        void main(){
          vec2 p = vUv * 2.0 - 1.0; float r = length(p);
          float ang = atan(p.y, p.x);
          float glow = exp(-r * 3.2) * 0.75;
          float rip = smoothstep(0.1, 0.0, abs(fract(r * 1.6 - uTime * 0.55) - 0.5) - 0.38) * (1.0 - r);
          float dash = step(0.5, fract(ang / 6.2832 * 28.0 + uTime * 0.12)) * smoothstep(0.035, 0.0, abs(r - 0.74));
          float ring = smoothstep(0.03, 0.0, abs(r - 0.86));
          float burst = smoothstep(0.06, 0.0, abs(r - min(1.0, uAge * 1.4))) * (1.0 - smoothstep(0.4, 0.8, uAge));
          float a = (glow + rip * 0.55 + dash * 0.8 + ring * 0.7 + burst) * (1.0 - smoothstep(0.92, 1.0, r));
          vec3 c = mix(uTint, vec3(1.0, 0.86, 0.55), 0.25 + 0.35 * glow);
          gl_FragColor = vec4(c, clamp(a * uK * uBoost, 0.0, 1.0));` + fxCS + `
        }`,
      dustV = `attribute vec4 aSeed; attribute vec2 aK;
        uniform float uTime, uK, uAge, uPR, uDust;
        varying float vTw; varying float vA; varying float vHue;
        void main(){
          float ph = fract(aSeed.w + uTime * aSeed.z);
          float y, r, ang;
          if (aK.x < 0.5) {
            y = ph * 9.5; r = aSeed.y * (1.0 - 0.6 * ph) + 0.15;
            ang = aSeed.x + uTime * (1.1 + aSeed.z * 5.0) + ph * 6.0;
          } else {
            y = (1.0 - ph) * 7.0 + 0.4; r = aSeed.y * 1.5 + ph * 0.9;
            ang = aSeed.x + uTime * 0.35 + sin(uTime + aSeed.w * 9.0) * 0.4;
          }
          r *= 1.0 + 2.6 * exp(-uAge * 2.2);
          y += 1.8 * exp(-uAge * 2.0) * aSeed.y;
          vec3 p = vec3(cos(ang) * r, y, sin(ang) * r);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float tw = pow(abs(sin(uTime * (2.5 + aSeed.z * 22.0) + aSeed.w * 40.0)), 5.0);
          vTw = tw; vHue = aSeed.w;
          vA = smoothstep(0.0, 0.08, ph) * (1.0 - smoothstep(0.72, 1.0, ph)) * uK;
          gl_PointSize = aK.y * (0.3 + 0.9 * tw) * uPR * uDust * 900.0 / max(1.0, -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      dustF = `uniform vec3 uTint; uniform float uBoost; varying float vTw; varying float vA; varying float vHue;
        void main(){
          vec2 d = gl_PointCoord - 0.5;
          float core = exp(-dot(d, d) * 70.0);
          float star = exp(-abs(d.x) * 26.0) * exp(-abs(d.y) * 4.5) + exp(-abs(d.y) * 26.0) * exp(-abs(d.x) * 4.5);
          float a = clamp(core * 1.2 + star * (0.35 + 0.9 * vTw), 0.0, 1.0) * vA;
          vec3 gold = mix(vec3(1.0, 0.68, 0.2), vec3(1.0, 0.88, 0.5), vHue);
          vec3 c = mix(mix(gold, uTint, 0.18), vec3(1.0, 0.97, 0.88), core * 0.45);
          gl_FragColor = vec4(c, clamp(a * uBoost, 0.0, 1.0));` + fxCS + `
        }`,
      mkBeam = (x, z, colHex, sc) => {
        let g = new s.Group();
        (g.position.set(x, 0, z), (g.visible = !1), t.add(g));
        let tint = new s.Color(colHex).lerp(new s.Color(16777215), 0.12).multiplyScalar(1.35),
          u = { uK: { value: 0 }, uAge: { value: 9 }, uTint: { value: tint }, uTime: FXU.uTime, uPR: FXU.uPR, uBoost: FXU.uBoost, uDust: FXU.uDust },
          add = { transparent: !0, depthWrite: !1, blending: s.AdditiveBlending },
          bm = (alpha, core) =>
            new s.ShaderMaterial(
              Object.assign({ uniforms: Object.assign({}, u, { uAlpha: { value: alpha }, uCore: { value: core } }), vertexShader: beamV, fragmentShader: beamF, side: s.DoubleSide }, add),
            ),
          outer = new s.Mesh(new s.CylinderGeometry(1.35 * sc, 1.05 * sc, 15, 32, 1, !0), bm(0.62, 0.05)),
          core = new s.Mesh(new s.CylinderGeometry(0.24 * sc, 0.2 * sc, 15, 20, 1, !0), bm(0.6, 0.7));
        ((outer.position.y = core.position.y = 7.5), g.add(outer, core), FXU.halos.push(outer.material));
        let ring = new s.Mesh(
          new s.PlaneGeometry(5.6 * sc, 5.6 * sc),
          new s.ShaderMaterial(Object.assign({ uniforms: u, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }", fragmentShader: ringF }, add)),
        );
        ((ring.rotation.x = -Math.PI / 2), (ring.position.y = 0.08), g.add(ring));
        let N = 170,
          gd = new s.BufferGeometry(),
          sd = new Float32Array(N * 4),
          kk = new Float32Array(N * 2);
        for (let i = 0; i < N; i++)
          ((sd[i * 4] = fxr() * 6.283),
            (sd[i * 4 + 1] = 0.35 + fxr() * 1.25),
            (sd[i * 4 + 2] = 0.06 + fxr() * 0.16),
            (sd[i * 4 + 3] = fxr()),
            (kk[i * 2] = i % 3 === 0 ? 1 : 0),
            (kk[i * 2 + 1] = 0.12 + fxr() * 0.2));
        (gd.setAttribute("position", new s.BufferAttribute(new Float32Array(N * 3), 3)),
          gd.setAttribute("aSeed", new s.BufferAttribute(sd, 4)),
          gd.setAttribute("aK", new s.BufferAttribute(kk, 2)));
        let dust = new s.Points(gd, new s.ShaderMaterial(Object.assign({ uniforms: u, vertexShader: dustV, fragmentShader: dustF }, add)));
        ((dust.frustumCulled = !1), g.add(dust));
        return { g, u };
      };

    (e.entities.forEach((M) => Tt[ee(M.cat)].ents.push(M)),
      Tt.forEach((M) => {
        let U = M.ents.length;
        M.ents.forEach((y, C) => {
          let L, D;
          if (U <= 6) ((L = (Math.round((C * 6) / U) * Math.PI) / 3 + 0), (D = U === 1 ? 0.42 * E : 0.6 * E));
          else {
            let ze = C < 6;
            ((L = ((ze ? C : C - 6) * Math.PI) / 3 + (ze ? 0 : Math.PI / 6)), (D = ze ? 0.66 * E : 0.36 * E));
          }
          let F = Math.sin(L) * D,
            Z = Math.cos(L) * D,
            et = M.c.x + F,
            pt = M.c.z + Z,
            Et = Math.atan2(Z, F),
            Pt = n(y.cat),
            ut = new s.Group();
          (ut.position.set(et, 0, pt), (ut.rotation.y = -Et + Math.PI / 2), t.add(ut));
          let Q = l(Pt, { emissive: 0 }),
            Ot = l(Mt),
            Yt = (U > 6 ? 0.8 : 0.9) + a() * 0.2,
            owd = Math.hypot(M.c.x, M.c.z) < 0.5 ? [0, 1] : [M.c.x / Math.hypot(M.c.x, M.c.z), M.c.z / Math.hypot(M.c.x, M.c.z)],
            hMul = U >= 4 ? Math.max(0.68, Math.min(1.42, 1 - 0.26 * ((F * owd[0] + Z * owd[1]) / D) + (C % 2 ? -0.1 : 0.12))) : 1,
            Zt =
              U >= 4
                ? ((own) =>
                    own !== "house"
                      ? own
                      : ((bs) => [bs, ...["house", "dome", "gate", "tower", "wall"].filter((k) => k !== bs)][C % 5])(Ut(S[M.i])))(Ut({ shape: y.name }))
                : Ut(S[M.i]),
            Kt = (ze, Ne, kn, ir, nn) => {
              let Ri = h(ze, Ne, kn, ir, nn, ut);
              return ((Ri.userData.eid = y.id), Vt.push(Ri), Ri);
            },
            Gt = 2;
          if (Zt === "house") {
            Kt(new s.BoxGeometry(2.2, 1.5 * hMul, 2.2), Ot, 0, 0.75 * hMul, 0);
            let ze = Kt(new s.ConeGeometry(1.9, 1.1, 4), Q, 0, 1.5 * hMul + 0.55, 0);
            ((ze.rotation.y = Math.PI / 4), (Gt = 1.5 * hMul + 1.2));
          } else if (Zt === "tower")
            (Kt(new s.BoxGeometry(1.5, 3.4 * hMul, 1.5), Ot, 0, 1.7 * hMul, 0),
              Kt(new s.BoxGeometry(1.9, 0.4, 1.9), Q, 0, 3.4 * hMul + 0.2, 0),
              Kt(new s.CylinderGeometry(0.06, 0.06, 1.3, 6), Q, 0, 3.4 * hMul + 1.0, 0),
              (Gt = 3.4 * hMul + 1.6));
          else if (Zt === "wall") {
            (Kt(new s.BoxGeometry(3.4, 1.4 * hMul, 1.1), Ot, 0, 0.7 * hMul, 0), Kt(new s.BoxGeometry(3.6, 0.28, 1.3), Q, 0, 1.4 * hMul + 0.14, 0));
            for (let ze = -1; ze <= 1; ze++) Kt(new s.BoxGeometry(0.5, 0.5, 0.5), Ot, ze * 1.2, 1.4 * hMul + 0.55, 0);
            Gt = 1.4 * hMul + 1.0;
          } else
            Zt === "dome"
              ? (Kt(new s.CylinderGeometry(1.5, 1.6, 1.3 * hMul, 20), Ot, 0, 0.65 * hMul, 0),
                Kt(new s.SphereGeometry(1.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), Q, 0, 1.3 * hMul, 0),
                (Gt = 1.3 * hMul + 1.6))
              : ([-1.05, 1.05].forEach((ze) => Kt(new s.BoxGeometry(0.7, 2.2 * hMul, 0.9), Ot, ze, 1.1 * hMul, 0)),
                Kt(new s.BoxGeometry(3, 0.55, 1.1), Q, 0, 2.2 * hMul + 0.25, 0),
                (Gt = 2.2 * hMul + 0.9));
          (ut.scale.setScalar(Yt), (Gt *= Yt));
          let Xt = new s.Object3D();
          (Xt.position.set(et, Gt + 0.2, pt), t.add(Xt), (At[y.id] = Xt));
          let mn = mkBeam(et, pt, Pt, Yt),
            ce = new s.Group();
          (ce.position.set(et + 1.3 * Yt, 0, pt),
            (ce.scale.y = 0.001),
            t.add(ce),
            h(new s.CylinderGeometry(0.04, 0.04, 3.4, 6), l(9080724), 0, 1.7, 0, ce),
            h(new s.BoxGeometry(1.1, 0.6, 0.04), l(Pt), 0.55, 3, 0, ce));
          let We = i(F, 0, Z).normalize();
          Wt[y.id] = { g: ut, beam: mn, flag: ce, roof: Q, pos: i(et, 0, pt), dir: We, isl: M.i, on: !1, k: 0 };
          let gn = Math.max(0.6, D - 1.5);
          (M.doors.push(i(M.c.x + Math.sin(L) * gn, 0, M.c.z + Math.cos(L) * gn)), rt.push({ x: et, z: pt, r: 2.6 }));
          let zn = h(
            j(0.85, gn, q[M.path]),
            W(M.path),
            M.c.x + (Math.sin(L) * gn) / 2,
            0.045,
            M.c.z + (Math.cos(L) * gn) / 2,
          );
          zn.rotation.y = L;
        });
      }));
    let N = [];
    Tt.forEach((M) => {
      (M.nb.forEach((U) => N.push([M.c, Tt[U].c.clone().sub(M.c).normalize().multiplyScalar(R)])),
        M.doors.forEach((U) => N.push([M.c, U.clone().sub(M.c)])));
    });
    let ot = (M, U, y) => {
      let C = M.x - U.x,
        L = M.z - U.z,
        D = y.x * y.x + y.z * y.z || 1,
        F = Math.max(0, Math.min(1, (C * y.x + L * y.z) / D));
      return Math.hypot(C - y.x * F, L - y.z * F);
    };
    (Tt.forEach((M) => {
      let U = M.ground === "grass" ? 7 : 3;
      for (let y = 0, C = 0; y < 200 && C < U; y++) {
        let L = a() * Math.PI * 2,
          D = c(2.6, R - 1.5),
          F = i(M.c.x + Math.sin(L) * D, 0, M.c.z + Math.cos(L) * D);
        if (rt.some((et) => Math.hypot(et.x - F.x, et.z - F.z) < et.r) || N.some((et) => ot(F, et[0], et[1]) < 1.2))
          continue;
        let Z = c(0.7, 1.15);
        (b.push({ x: F.x, y: 0.3 * Z, z: F.z, sx: Z, sy: Z, sz: Z, c: 10257766 }),
          G.push({ x: F.x, y: 1.3 * Z, z: F.z, sx: Z, sy: Z, sz: Z, c: at[C % 3] }),
          C++);
      }
    }),
      nt(p(1, 1, 1), K),
      nt(p(1, 1, 1), Ft),
      nt(p(1, 1, 1), wt),
      nt(p(1, 1, 1), A),
      nt(new s.CylinderGeometry(0.09, 0.12, 0.6, 5), b),
      nt(new s.ConeGeometry(0.65, 1.5, 6), G));
    let yt = [15913907, 14923924, 13209702, 9724488],
      ft = [2827296, 4862754, 1908002, 8016432, 12096610, 9211026],
      zt = [8099752, 12618358, 9416330, 12165828, 13744238, 7307162, 13933196, 14933195],
      ne = [5201267, 6971221, 8227439, 4147799, 9075300],
      re = [14249802, 5078952, 5937779, 14725196, 8219568],
      jt = ["short", "long", "ponytail", "bun", "curly"],
      _t = 0,
      B = (M) => {
        _t++;
        let U = {
            skin: o(yt),
            hair: o(ft),
            top: o(zt),
            bot: o(ne),
            bag: o(re),
            style: jt[(_t * 2 + (a() < 0.5 ? 0 : 1)) % 5],
            sc: c(0.92, 1.08),
          },
          y =
            M === "run"
              ? ["none", "backpack", "none"]
              : M === "bike"
                ? ["backpack", "side", "none", "backpack"]
                : ["backpack", "side", "book", "coffee", "backpack", "none", "book", "coffee"];
        U.item = y[(_t * 3 + (a() < 0.5 ? 0 : 1)) % y.length];
        let C = new s.Group(),
          L = new s.Group();
        C.add(L);
        let D = (ut, Q, Ot, Yt, Zt, Kt, Gt, Xt) => {
            let mn = new s.Mesh(p(ut, Q, Ot), m(Yt));
            return (mn.position.set(Zt, Kt, Gt), (Xt || L).add(mn), mn);
          },
          F = (ut, Q, Ot, Yt, Zt, Kt) => {
            let Gt = new s.Mesh(v(ut), m(Q));
            return (Gt.position.set(Ot, Yt, Zt), (Kt || L).add(Gt), Gt);
          },
          Z = (ut, Q) => {
            let Ot = new s.Group();
            return (Ot.position.set(ut, Q, 0), L.add(Ot), Ot);
          },
          et = [-1, 1].map((ut) => {
            let Q = Z(ut * 0.1, 0.5);
            return (D(0.14, 0.42, 0.14, U.bot, 0, -0.21, 0, Q), D(0.15, 0.08, 0.23, 4868690, 0, -0.46, 0.04, Q), Q);
          }),
          pt = [-1, 1].map((ut) => {
            let Q = Z(ut * 0.27, 0.98);
            return (D(0.11, 0.3, 0.11, U.top, 0, -0.15, 0, Q), D(0.1, 0.2, 0.1, U.skin, 0, -0.4, 0, Q), Q);
          });
        (D(0.4, 0.5, 0.24, U.top, 0, 0.75, 0),
          F(0.18, U.skin, 0, 1.2, 0),
          D(0.04, 0.05, 0.02, 2763312, -0.065, 1.2, 0.17),
          D(0.04, 0.05, 0.02, 2763312, 0.065, 1.2, 0.17));
        let Et = new s.Mesh(
          g("hc", () => new s.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.42)),
          m(U.hair),
        );
        if ((Et.position.set(0, 1.21, -0.015), L.add(Et), U.style === "long"))
          (D(0.38, 0.5, 0.12, U.hair, 0, 1.02, -0.14),
            D(0.06, 0.3, 0.2, U.hair, -0.19, 1.12, -0.02),
            D(0.06, 0.3, 0.2, U.hair, 0.19, 1.12, -0.02));
        else if (U.style === "ponytail") {
          F(0.08, U.hair, 0, 1.22, -0.22);
          let ut = D(0.07, 0.28, 0.07, U.hair, 0, 1.06, -0.27);
          ut.rotation.x = 0.25;
        } else if (U.style === "bun") F(0.1, U.hair, 0, 1.42, -0.05);
        else if (U.style === "curly")
          for (let ut = 0; ut < 7; ut++) {
            let Q = (ut / 7) * Math.PI * 2;
            F(0.07, U.hair, Math.sin(Q) * 0.19, 1.3 + 0.02 * (ut % 2), Math.cos(Q) * 0.17 - 0.02);
          }
        if (U.item === "backpack")
          (D(0.32, 0.4, 0.14, U.bag, 0, 0.78, -0.19),
            D(0.06, 0.34, 0.02, U.bag, -0.13, 0.8, 0.125),
            D(0.06, 0.34, 0.02, U.bag, 0.13, 0.8, 0.125));
        else if (U.item === "side") {
          D(0.22, 0.2, 0.09, U.bag, -0.27, 0.5, 0.04);
          let ut = D(0.04, 0.7, 0.03, U.bag, 0, 0.76, 0.125);
          ut.rotation.z = 0.62;
        } else if (U.item === "book") {
          let ut = D(0.2, 0.03, 0.16, U.bag, 0, -0.53, 0.07, pt[1]);
          ut.rotation.x = 0.1;
        } else if (U.item === "coffee") {
          let ut = new s.Mesh(x(0.05, 0.04, 0.13, 8), m(16052198));
          (ut.position.set(0, -0.53, 0.05), pt[1].add(ut));
          let Q = new s.Mesh(x(0.055, 0.055, 0.025, 8), m(7031348));
          (Q.position.set(0, -0.455, 0.05), pt[1].add(Q));
        }
        C.scale.setScalar(U.sc * 0.95);
        let Pt = null;
        if (M === "bike") {
          ((Pt = new s.Group()), C.add(Pt));
          let ut = o(re);
          [-0.5, 0.5].forEach((Kt) => {
            let Gt = new s.Mesh(
              g("wh", () => {
                let Xt = new s.TorusGeometry(0.32, 0.04, 6, 16);
                return (Xt.rotateY(Math.PI / 2), Xt);
              }),
              m(4014408),
            );
            (Gt.position.set(0, 0.34, Kt), Pt.add(Gt), (Pt["w" + (Kt > 0 ? 1 : 0)] = Gt));
          });
          let Q = new s.Mesh(p(0.05, 0.05, 1), m(ut));
          (Q.position.set(0, 0.5, 0), Pt.add(Q));
          let Ot = new s.Mesh(p(0.05, 0.32, 0.05), m(ut));
          (Ot.position.set(0, 0.62, -0.2), Pt.add(Ot));
          let Yt = new s.Mesh(p(0.5, 0.04, 0.04), m(4014408));
          (Yt.position.set(0, 0.88, 0.48), Pt.add(Yt));
          let Zt = new s.Mesh(p(0.04, 0.5, 0.04), m(ut));
          (Zt.position.set(0, 0.62, 0.48), Pt.add(Zt), L.position.set(0, 0.24, -0.12));
        }
        return { g: C, body: L, legs: et, arms: pt, kind: M, sp: U, bike: Pt, ph: a() * 6.28, am: 0 };
      },
      gt = (M, U, y, C) => {
        let L = C ? 1 : 0;
        ((M.am += (L - M.am) * Math.min(1, U * 8)),
          (M.ph += U * (M.kind === "run" ? y * 3.4 : M.kind === "bike" ? y * 2.4 : y * 4.6) * (C ? 1 : 0)));
        let D = Math.sin(M.ph),
          F = M.am,
          Z = M.sp.item === "book" || M.sp.item === "coffee";
        if (M.kind === "bike") {
          ((M.legs[0].rotation.x = -0.85 + D * 0.5 * F),
            (M.legs[1].rotation.x = -0.85 - D * 0.5 * F),
            (M.arms[0].rotation.x = -1.05),
            (M.arms[1].rotation.x = -1.05),
            (M.body.rotation.x = 0.12),
            M.bike && C && ((M.bike.w0.rotation.x += U * y * 3), (M.bike.w1.rotation.x = M.bike.w0.rotation.x)));
          return;
        }
        let et = M.kind === "run" ? 1 : 0.58;
        ((M.legs[0].rotation.x = D * et * F),
          (M.legs[1].rotation.x = -D * et * F),
          (M.arms[0].rotation.x = -D * et * 0.9 * F - (M.kind === "run" ? 0.5 * F : 0)),
          (M.arms[1].rotation.x = Z ? -0.95 + D * 0.05 * F : D * et * 0.9 * F - (M.kind === "run" ? 0.5 * F : 0)),
          (M.body.rotation.x = M.kind === "run" ? 0.2 * F : 0),
          (M.body.position.y = Math.abs(D) * (M.kind === "run" ? 0.07 : 0.035) * F));
      },
      xt = () => {
        let M = o([14262374, 10134443, 3816e3, 15262422, 12158288]),
          U = new s.Group(),
          y = new s.Group();
        U.add(y);
        let C = (Z, et, pt, Et, Pt, ut, Q, Ot) => {
          let Yt = new s.Mesh(p(Z, et, pt), m(Q || M));
          return (Yt.position.set(Et, Pt, ut), (Ot || y).add(Yt), Yt);
        };
        (C(0.22, 0.22, 0.5, 0, 0.3, 0),
          C(0.2, 0.18, 0.18, 0, 0.4, 0.32),
          C(0.05, 0.07, 0.04, -0.07, 0.52, 0.32),
          C(0.05, 0.07, 0.04, 0.07, 0.52, 0.32));
        let L = new s.Group();
        (L.position.set(0, 0.36, -0.26), y.add(L));
        let D = C(0.06, 0.06, 0.34, 0, 0.06, -0.15, null, L);
        D.rotation.x = -0.5;
        let F = [
          [-0.07, 0.2],
          [0.07, 0.2],
          [-0.07, -0.2],
          [0.07, -0.2],
        ].map(([Z, et]) => {
          let pt = new s.Group();
          return (pt.position.set(Z, 0.2, et), y.add(pt), C(0.06, 0.2, 0.06, 0, -0.1, 0, null, pt), pt);
        });
        return { g: U, body: y, legs: F, tail: L, ph: a() * 6.28, am: 0, kind: "cat" };
      },
      Ht = () => {
        let M = new s.Group(),
          U = new s.Group();
        M.add(U);
        let y = (et, pt, Et, Pt, ut, Q, Ot, Yt) => {
          let Zt = new s.Mesh(v(et), m(pt));
          return (Zt.position.set(Et, Pt, ut), Zt.scale.set(Q, Ot, Yt), U.add(Zt), Zt);
        };
        y(0.16, 10134187, 0, 0.22, 0, 0.9, 0.8, 1.3);
        let C = new s.Group();
        (C.position.set(0, 0.34, 0.2), U.add(C));
        let L = new s.Mesh(v(0.07), m(9081499));
        C.add(L);
        let D = new s.Mesh(p(0.025, 0.025, 0.06), m(14721104));
        (D.position.set(0, -0.005, 0.08), C.add(D), y(0.06, 7314060, 0, 0.31, 0.13, 1, 0.8, 1));
        let F = new s.Mesh(p(0.1, 0.03, 0.16), m(8226190));
        (F.position.set(0, 0.22, -0.24), U.add(F));
        let Z = [-1, 1].map((et) => {
          let pt = new s.Group();
          (pt.position.set(et * 0.12, 0.26, 0), U.add(pt));
          let Et = new s.Mesh(p(0.2, 0.02, 0.2), m(8752534));
          return (Et.position.set(et * 0.1, 0, -0.02), pt.add(Et), pt);
        });
        return (
          [-0.04, 0.04].forEach((et) => {
            let pt = new s.Mesh(p(0.015, 0.1, 0.015), m(14256778));
            (pt.position.set(et, 0.06, 0), M.add(pt));
          }),
          { g: M, body: U, head: C, wings: Z, ph: a() * 6.28, state: "peck", timer: c(2, 6), t: 0, fly: null }
        );
      },
      Bt = [],
      ae = [],
      oe = (M, U, y, C) => ({ a: M.clone(), b: U.clone(), len: Math.max(0.01, M.distanceTo(U)), end: y, to: C }),
      _e = (M) => {
        let U = Tt[M.i],
          y = M.kind === "walk" ? 0.5 : 0.8,
          C = U.nb.filter((L) => L !== M.last || U.nb.length === 1);
        if (C.length && (a() < y || !U.doors.length)) {
          let L = o(C);
          M.leg = oe(U.P, Tt[L].P, "cross", L);
        } else
          U.doors.length
            ? (M.leg = oe(U.P, o(U.doors), "door"))
            : (M.leg = oe(U.P, U.P.clone().add(i(1, 0, 0)), "door"));
        M.d = 0;
      },
      Ce = (M, U, y, C, L) => {
        let D = Object.assign(
          {
            obj: M,
            kind: U,
            speed: y,
            i: C,
            last: -1,
            lane: (a() < 0.5 ? -1 : 1) * (U === "bike" ? 0.38 : 0.3),
            wait: 0,
            yaw: 0,
            state: "move",
          },
          L || {},
        );
        (_e(D), (D.d = a() * D.leg.len), t.add(M.g));
        let F = D.leg,
          Z = F.b.clone().sub(F.a).normalize(),
          et = F.a.clone().add(Z.clone().multiplyScalar(D.d));
        return (
          M.g.position.set(et.x + Z.z * D.lane, 0.05, et.z - Z.x * D.lane),
          (D.yaw = Math.atan2(Z.x, Z.z)),
          (M.g.rotation.y = D.yaw),
          Bt.push(D),
          D
        );
      },
      me = Math.min(24, I * 3),
      Ue = ["walk", "walk", "run", "bike", "walk", "bike"];
    for (let M = 0; M < me; M++) {
      let U = Ue[M % Ue.length],
        y = U === "run" ? 3.3 : U === "bike" ? 4 : 1.5;
      Ce(B(U), U, y * c(0.9, 1.1), M % I);
    }
    for (let M = 0; M < Math.min(3, Math.max(1, Math.round(I / 3))); M++) Ce(xt(), "cat", 0.9, (M * 2 + 1) % I);
    for (let M = 0; M < Math.min(6, I + 1); M++) {
      let U = Ht(),
        y = Tt[M % I];
      U.isl = y.i;
      let C = a() * 6.28,
        L = c(0.4, 2);
      (U.g.position.set(y.P.x + Math.sin(C) * L, 0.05, y.P.z + Math.cos(C) * L),
        (U.g.rotation.y = a() * 6.28),
        t.add(U.g),
        ae.push(U));
    }
    let en = (M) => Math.atan2(Math.sin(M), Math.cos(M)),
      xa = (M, U) => {
        let y = M.obj;
        if (M.state === "wait") {
          if (
            ((M.wait -= U),
            y.kind === "cat"
              ? ((y.tail.rotation.y = Math.sin(performance.now() * 0.003 + y.ph) * 0.5),
                (y.am += (0 - y.am) * Math.min(1, U * 8)))
              : gt(y, U, M.speed, !1),
            M.wait <= 0)
          )
            if (((M.state = "move"), M.after === "back")) {
              let Et = Tt[M.i];
              ((M.leg = oe(M.leg.b, Et.P, "plaza")), (M.d = 0));
            } else _e(M);
          return;
        }
        let C = M.leg;
        ((M.d += M.speed * U),
          M.d >= C.len &&
            ((M.d = C.len),
            C.end === "door"
              ? ((M.state = "wait"), (M.wait = c(1.2, 3.2)), (M.after = "back"))
              : (C.end === "cross" && ((M.last = M.i), (M.i = C.to)),
                y.kind === "cat" && a() < 0.5
                  ? ((M.state = "wait"), (M.wait = c(3, 7)), (M.after = "choose"))
                  : _e(M))));
        let L = M.leg,
          D = L.b.clone().sub(L.a).normalize(),
          F = L.a.clone().add(D.clone().multiplyScalar(M.d)),
          Z = F.x + D.z * M.lane,
          et = F.z - D.x * M.lane,
          pt = Math.min(1, U * 9);
        if (
          ((y.g.position.x += (Z - y.g.position.x) * pt),
          (y.g.position.z += (et - y.g.position.z) * pt),
          (M.yaw += en(Math.atan2(D.x, D.z) - M.yaw) * Math.min(1, U * 8)),
          (y.g.rotation.y = M.yaw),
          y.kind === "cat")
        ) {
          ((y.ph += U * M.speed * 7), (y.am += (1 - y.am) * Math.min(1, U * 8)));
          let Et = Math.sin(y.ph) * 0.7 * y.am;
          ((y.legs[0].rotation.x = Et),
            (y.legs[3].rotation.x = Et),
            (y.legs[1].rotation.x = -Et),
            (y.legs[2].rotation.x = -Et),
            (y.tail.rotation.y = Math.sin(y.ph * 0.5) * 0.3));
        } else gt(y, U, M.speed, !0);
      },
      jc = (M, U, y) => {
        let C = Tt[M.isl];
        if (((M.timer -= U), M.state === "peck")) {
          if (
            ((M.ph += U * 6),
            (M.head.rotation.x = Math.max(0, Math.sin(M.ph)) * 0.9),
            M.wings.forEach((L, D) => (L.rotation.z = (D ? -1 : 1) * 0.1)),
            M.tg)
          ) {
            let L = M.tg.x - M.g.position.x,
              D = M.tg.z - M.g.position.z,
              F = Math.hypot(L, D);
            if (F < 0.08) M.tg = null;
            else {
              let Z = 0.45 * U;
              ((M.g.position.x += (L / F) * Z),
                (M.g.position.z += (D / F) * Z),
                (M.g.rotation.y += en(Math.atan2(L, D) - M.g.rotation.y) * Math.min(1, U * 6)),
                (M.body.position.y = Math.abs(Math.sin(M.ph)) * 0.015));
            }
          }
          if (M.timer <= 0)
            if (a() < 0.35) {
              let L = a() * 6.28,
                D = c(0.8, 2.6);
              ((M.fly = {
                x0: M.g.position.x,
                z0: M.g.position.z,
                x1: C.P.x + Math.sin(L) * D,
                z1: C.P.z + Math.cos(L) * D,
                t: 0,
              }),
                (M.state = "fly"),
                (M.tg = null));
            } else {
              let L = a() * 6.28,
                D = c(0.4, 2.4);
              ((M.tg = { x: C.P.x + Math.sin(L) * D, z: C.P.z + Math.cos(L) * D }), (M.timer = c(2, 5)));
            }
        } else {
          let L = M.fly;
          L.t += U / 0.9;
          let D = Math.min(1, L.t);
          ((M.g.position.x = L.x0 + (L.x1 - L.x0) * D),
            (M.g.position.z = L.z0 + (L.z1 - L.z0) * D),
            (M.g.position.y = 0.05 + Math.sin(D * Math.PI) * 0.8),
            (M.g.rotation.y += en(Math.atan2(L.x1 - L.x0, L.z1 - L.z0) - M.g.rotation.y) * Math.min(1, U * 10)),
            M.wings.forEach((F, Z) => (F.rotation.z = (Z ? -1 : 1) * Math.sin(y * 40) * 0.9)),
            (M.head.rotation.x = 0),
            D >= 1 && ((M.state = "peck"), (M.g.position.y = 0.05), (M.timer = c(3, 8)), (M.body.position.y = 0)));
        }
      },
      Ci = [],
      nr = [],
      Bn = Object.keys(Wt),
      ya = (M) => {
        let U = String(M || ""),
          y = Bn.find((C) => C === U || e.entities.find((L) => L.id === C).name === U);
        if (!y) {
          let C = S.find((L) => L.id === U || L.name === U);
          C && (y = Bn.find((L) => e.entities.find((D) => D.id === L).cat === C.id));
        }
        return y || Bn[Math.floor(a() * Bn.length)];
      };
    (e.dynamics || []).slice(0, 12).forEach((M, U) => {
      let y = ya(M.near);
      if (!y) return;
      let C = Wt[y],
        L = (M.name || "") + (M.meaning || ""),
        D = new s.Group();
      t.add(D);
      let F = [],
        Z = (Q, Ot) => {
          let Yt = new s.MeshLambertMaterial(Object.assign({ color: Q, transparent: !0, flatShading: !0 }, Ot || {}));
          return (F.push(Yt), Yt);
        },
        et = "float";
      /封包|流|資料|水|列車|車流|訊號/.test(L)
        ? (et = "flow")
        : /燈|閃|亮|指示/.test(L)
          ? (et = "blink")
          : /人|走|師生|學生|遊客|行人/.test(L)
            ? (et = "walk")
            : /樹|搖|風|旗|雲/.test(L)
              ? (et = "sway")
              : /吊車|轉|齒輪|風車|雷達/.test(L) && (et = "spin");
      let pt = i(-C.dir.z, 0, C.dir.x),
        Et = C.pos.clone().add(pt.clone().multiplyScalar(U % 2 ? 2.4 : -2.4)),
        Pt = Tt[C.isl],
        ut = () => {};
      if (et === "flow") {
        let Q = Pt.nb.length ? Tt[Pt.nb[0]].P : Pt.doors[0] || Pt.P.clone().add(i(2, 0, 0)),
          Ot = [0, 1, 2].map((Yt) => {
            let Zt = new s.Mesh(
              new s.SphereGeometry(0.15, 8, 6),
              Z(16774872, { emissive: 16771496, emissiveIntensity: 0.8 }),
            );
            return (D.add(Zt), { m: Zt, o: Yt / 3 });
          });
        ut = (Yt) =>
          Ot.forEach((Zt) => {
            let Kt = (Yt * 0.12 + Zt.o) % 1;
            Zt.m.position.set(Pt.P.x + (Q.x - Pt.P.x) * Kt, 0.3, Pt.P.z + (Q.z - Pt.P.z) * Kt);
          });
      } else if (et === "blink") {
        let Q = new s.Mesh(new s.BoxGeometry(0.28, 0.28, 0.28), Z(16773312, { emissive: 16765562 }));
        (Q.position.copy(At[y].position).add(i(0.9, -0.3, 0.5)),
          D.add(Q),
          (ut = (Ot) => {
            Q.material.emissiveIntensity = 0.3 + 0.7 * (Math.sin(Ot * 2.1 + U) > 0.2 ? 1 : 0);
          }));
      } else if (et === "walk") {
        let Q = ["walk", "run", "bike"][U % 3];
        Ce(B(Q), Q, Q === "run" ? 3.3 : Q === "bike" ? 4 : 1.5, C.isl);
      } else if (et === "sway") {
        let Q = new s.Group(),
          Ot = new s.Mesh(new s.ConeGeometry(0.5, 1.3, 6), Z(8367726));
        Ot.position.y = 1.1;
        let Yt = new s.Mesh(new s.CylinderGeometry(0.08, 0.1, 0.5, 5), Z(10257766));
        ((Yt.position.y = 0.25),
          Q.add(Ot, Yt),
          Q.position.copy(Et),
          D.add(Q),
          (ut = (Zt) => {
            Q.rotation.z = Math.sin(Zt * 0.9 + U) * 0.06;
          }));
      } else if (et === "spin") {
        let Q = new s.Group(),
          Ot = new s.Mesh(new s.CylinderGeometry(0.06, 0.06, 1.6, 6), Z(9080724));
        Ot.position.y = 0.8;
        let Yt = new s.Mesh(new s.BoxGeometry(1.6, 0.07, 0.12), Z(16249576));
        ((Yt.position.y = 1.6),
          Q.add(Ot, Yt),
          Q.position.copy(Et),
          D.add(Q),
          (ut = (Zt) => {
            Yt.rotation.y = Zt * 0.35;
          }));
      } else {
        let Q = new s.Mesh(
          new s.SphereGeometry(0.22, 10, 8),
          Z(16774872, { emissive: 16771496, emissiveIntensity: 0.5 }),
        );
        (D.add(Q), (ut = (Ot) => Q.position.set(Et.x, 2 + Math.sin(Ot * 0.8 + U) * 0.25, Et.z)));
      }
      if (u(M.label)) {
        let Q = new s.Object3D();
        (Q.position.copy(Et).setY(1.8), t.add(Q), nr.push({ text: M.label, object: Q }));
      }
      Ci.push({ grp: D, mats: F, upd: ut, center: Et });
    });
    /* ===== 效能：人物、貓、鴿子改用 InstancedMesh；島座、地面、道路、橋按材質合併 ===== */
    let CI = mkInstancer(s, t);
    (Bt.forEach((A) => A.obj.g.traverse((o) => o.isMesh && !o.isInstancedMesh && CI.add(o))),
      ae.forEach((A) => A.g.traverse((o) => o.isMesh && CI.add(o))),
      CI.finalize(),
      mergeStatic(s, t, t.children.filter((o) => o.isMesh && !o.isInstancedMesh && o !== dt), IP),
      (t.userData.instancer = CI),
      (t.onBeforeRender = () => CI.sync()));
    let va = () => {
      let M = innerWidth / Math.max(1, innerHeight),
        U = Math.max(1, Math.min(2.6, Math.pow(1.6 / M, 0.8)));
      return { pos: i(0, (qt * 1.3 + 9) * U, (qt * 1.5 + 10) * U), target: i(0, -1, 0) };
    };
    return {
      anchors: At,
      pickables: Vt,
      get overviewPose() {
        return va();
      },
      focusPose: (M) => {
        let U = Wt[M],
          y = At[M].position;
        return {
          pos: y
            .clone()
            .add(U.dir.clone().multiplyScalar(13.5))
            .setY(y.y + 5.6),
          target: i(y.x, y.y - 1.5, y.z),
        };
      },
      R: qt,
      islandPicks: IP,
      fx: FXU,
      islandPose: (M) => {
        let U = Tt[M];
        if (!U) return null;
        let y = U.c.clone().setY(0);
        y.length() < 0.5 ? y.set(0, 0, 1) : y.normalize();
        let A = innerWidth / Math.max(1, innerHeight),
          F = Math.max(1, Math.min(2.4, Math.pow(1.6 / A, 0.8))) * (U.ents && U.ents.length >= 4 ? 1.25 : 1);
        return { pos: U.c.clone().addScaledVector(y, 16 * F).setY(26 * F), target: U.c.clone().addScaledVector(y, U.ents && U.ents.length >= 4 ? -3.2 : 1.2).setY(-1.5) };
      },
      agents: Bt,
      pigeons: ae,
      isl: Tt,
      setFocus(M) {
        Object.keys(Wt).forEach((U) => {
          Wt[U].on = U === M;
        });
      },
      update(M, U, y) {
        FXU.uTime.value = M;
        (Object.values(Wt).forEach((C) => {
          (C.on && !C.was && (C.t0 = M), (C.was = C.on));
          ((C.k += ((C.on ? 1 : 0) - C.k) * Math.min(1, U * (C.on ? 2.2 : 3))),
            (C.beam.u.uK.value = C.k),
            (C.beam.u.uAge.value = M - (C.t0 || 0)),
            (C.beam.g.visible = C.k > 0.004),
            (C.flag.scale.y = Math.max(0.001, C.k)));
          let L = C.k * 0.38;
          C.roof.emissive.setRGB(L * 0.6, L * 0.6, L * 0.6);
        }),
          d || (Bt.forEach((C) => xa(C, U)), ae.forEach((C) => jc(C, U, M))),
          Ci.forEach((C) => {
            C.upd(M);
            let L = y.position.distanceTo(C.center) < 6.5;
            C.mats.forEach((D) => {
              D.opacity += ((L ? 0.12 : 1) - D.opacity) * Math.min(1, U * 3);
            });
          }));
      },
      dynLabels: nr,
    };
  },
};
/* ===== 效能工具：InstancedMesh 角色渲染器＋靜態幾何合併 =====
 * mkInstancer：把很多小零件（人物、貓、鴿子、飛鳥的身體部位）改成少數幾個 InstancedMesh 一次畫完。
 *   原本的零件留著當「骨架」（動畫照舊改它們的位置與角度），但不畫出來；
 *   每一格把零件的世界矩陣寫進 instance。方塊、球統一成單位形狀，尺寸放進矩陣，所以大部分零件能共用同一組。
 * mergeGeos：把很多不會動的網格（島座、地面、道路、橋）按材質合併成一個。
 */
function mkInstancer(THREE, scene) {
  const unitBox = new THREE.BoxGeometry(1, 1, 1),
    spheres = {},
    buckets = new Map(),
    M = new THREE.Matrix4(),
    S = new THREE.Matrix4(),
    ZERO = new THREE.Matrix4().makeScale(0, 0, 0),
    TAU = Math.PI * 2;
  const keyOf = (mesh) => {
    const g = mesh.geometry,
      p = g.parameters || {},
      side = mesh.material.side;
    if (g.type === "BoxGeometry" && (p.widthSegments || 1) === 1 && (p.heightSegments || 1) === 1 && (p.depthSegments || 1) === 1)
      return ["box|" + side, unitBox, [p.width, p.height, p.depth]];
    if (g.type === "SphereGeometry" && !p.phiStart && Math.abs(p.phiLength - TAU) < 1e-6 && !p.thetaStart && Math.abs(p.thetaLength - Math.PI) < 1e-6) {
      const k = p.widthSegments + "x" + p.heightSegments;
      spheres[k] = spheres[k] || new THREE.SphereGeometry(1, p.widthSegments, p.heightSegments);
      return ["sph" + k + "|" + side, spheres[k], [p.radius, p.radius, p.radius]];
    }
    return ["g" + g.uuid + "|" + side, g, null];
  };
  const visible = (o) => {
    for (; o; o = o.parent) if (!o.visible) return !1;
    return !0;
  };
  return {
    buckets,
    add(mesh, root, live) {
      const [k, geo, scl] = keyOf(mesh);
      buckets.has(k) || buckets.set(k, { geo, side: mesh.material.side, items: [] });
      buckets.get(k).items.push({ mesh, scl, root, live });
    },
    finalize() {
      for (const b of buckets.values()) {
        const im = new THREE.InstancedMesh(b.geo, new THREE.MeshLambertMaterial({ color: 16777215, flatShading: !0, side: b.side }), b.items.length);
        im.frustumCulled = !1;
        im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        b.items.forEach((it, i) => {
          im.setColorAt(i, it.mesh.material.color);
          it.mesh.visible = !1; // 原零件只當骨架，不再畫
        });
        im.instanceColor.needsUpdate = !0;
        scene.add(im);
        b.im = im;
      }
    },
    sync() {
      for (const b of buckets.values()) {
        let live = !1;
        b.items.forEach((it, i) => {
          if (it.root && !visible(it.root)) b.im.setMatrixAt(i, ZERO);
          else {
            M.copy(it.mesh.matrixWorld);
            it.scl && M.multiply(S.makeScale(it.scl[0], it.scl[1], it.scl[2]));
            b.im.setMatrixAt(i, M);
          }
          it.live && (b.im.setColorAt(i, it.mesh.material.color), (live = !0));
        });
        b.im.instanceMatrix.needsUpdate = !0;
        live && (b.im.instanceColor.needsUpdate = !0);
      }
    },
  };
}
function mergeGeos(THREE, geos) {
  // geos：已經套好位置的 BufferGeometry；有索引的先展開，再把共同的屬性接起來
  const list = geos.map((g) => (g.index ? g.toNonIndexed() : g)),
    names = Object.keys(list[0].attributes).filter((n) => list.every((g) => g.attributes[n] && g.attributes[n].itemSize === list[0].attributes[n].itemSize)),
    out = new THREE.BufferGeometry();
  names.forEach((n) => {
    const size = list[0].attributes[n].itemSize,
      arr = new Float32Array(list.reduce((a, g) => a + g.attributes[n].count * size, 0));
    let off = 0;
    list.forEach((g) => {
      arr.set(g.attributes[n].array.subarray(0, g.attributes[n].count * size), off);
      off += g.attributes[n].count * size;
    });
    out.setAttribute(n, new THREE.BufferAttribute(arr, size));
  });
  return out;
}
function mergeStatic(THREE, scene, meshes, keep) {
  // 按材質分組合併；keep 裡的網格（島面）保留成看不見的點選替身，其餘拿掉
  const groups = new Map();
  meshes.forEach((m) => {
    const t = m.material,
      key = [t.type, t.color ? t.color.getHex() : "", t.map ? t.map.uuid : "", t.flatShading, t.side, t.transparent, t.opacity].join("|");
    groups.has(key) || groups.set(key, { mat: t, items: [] });
    groups.get(key).items.push(m);
  });
  let n = 0;
  for (const g of groups.values()) {
    if (g.items.length < 2) continue;
    const geos = g.items.map((m) => (m.updateMatrixWorld(!0), m.geometry.clone().applyMatrix4(m.matrixWorld)));
    scene.add(new THREE.Mesh(mergeGeos(THREE, geos), g.mat));
    g.items.forEach((m) => (keep.includes(m) ? (m.visible = !1) : m.parent && m.parent.remove(m)));
    n += g.items.length;
  }
  return n;
}

var dM = Hc[Ge.site.template] || Hc.town,
  as = new Gs({ antialias: !0, alpha: !0 });
as.setPixelRatio(Math.min(devicePixelRatio, 2));
Dt("#stage").appendChild(as.domElement);
var pm = new Vc({ element: Dt("#labels") }),
  Ku = new Hs(),
  Ae = new we(40, 1, 0.1, 400),
  Ke = dM.build({ THREE: Bc, scene: Ku, data: Ge, colorOf: Xc }),
  He = new kc(Ae, as.domElement);
He.enableDamping = !0;
He.dampingFactor = 0.08;
He.maxPolarAngle = 1.45;
He.minDistance = 4;
He.maxDistance = Ke.R * 7;
He.autoRotateSpeed = 0.5;
Ae.position.copy(Ke.overviewPose.pos);
He.target.copy(Ke.overviewPose.target);
var mm = {};
var crowdCat = {};
Ge.categories.forEach((c) => (crowdCat[c.id] = Ge.entities.filter((x) => x.cat === c.id).length >= 4));
Ge.entities.forEach((s) => {
  if (!Ke.anchors[s.id]) return;
  let t = document.createElement("div");
  crowdCat[s.cat] && t.setAttribute("data-crowd", "1");
  ((t.className = "lb"),
    (t.innerHTML = `<i style="background:${he(Xc(s.cat))}"></i>${he(s.name)}`),
    (t.onclick = () => Kc(s.id)));
  let e = new ma(t);
  (Ke.anchors[s.id].add(e), (mm[s.id] = t));
});
Ge.categories.forEach((c, i) => {
  if (!crowdCat[c.id] || !Ke.isl || !Ke.isl[i]) return;
  let t = document.createElement("div");
  ((t.className = "lb catlb"), (t.innerHTML = `<i style="background:${he(Xc(c.id))}"></i>${he(c.name)}`), (t.onclick = () => focusIsland(i)));
  let o = new Bc.Object3D();
  (o.position.set(Ke.isl[i].c.x, 4.2, Ke.isl[i].c.z), Ku.add(o), o.add(new ma(t)));
});
(Ke.dynLabels || []).forEach((s) => {
  let t = document.createElement("div");
  ((t.className = "lb dy"), (t.textContent = s.text), s.object.add(new ma(t)));
});
var _a = (s) =>
    Object.entries(mm).forEach(([t, e]) => {
      e.className = "lb" + (s === null ? "" : t === s ? " on" : " off");
    }),
  gm = !1;
function ju() {
  let s = innerWidth,
    t = innerHeight;
  (as.setSize(s, t),
    pm.setSize(s, t),
    (Ae.aspect = s / t),
    gm
      ? uM()
        ? Ae.setViewOffset(s, t, 0, t * 0.23, s, t)
        : Ae.setViewOffset(s, t, 178, 0, s, t)
      : Ae.clearViewOffset(),
    Ae.updateProjectionMatrix());
}
addEventListener("resize", ju);
ju();
var Rn = null,
  fM = (s) => (s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2);
function qc(s, t) {
  if (t <= 0) {
    (Ae.position.copy(s.pos), He.target.copy(s.target), (Rn = null));
    return;
  }
  Rn = { t0: performance.now(), ms: t, p0: Ae.position.clone(), t0v: He.target.clone(), p1: s.pos, t1v: s.target };
}
He.addEventListener("start", () => {
  ((Rn = null), (He.autoRotate = !1));
});
var lm = new da(),
  Ju = new Y(),
  Gc = null;
as.domElement.addEventListener("pointerdown", (s) => {
  Gc = [s.clientX, s.clientY];
});
as.domElement.addEventListener("pointerup", (s) => {
  if (!Gc || Math.hypot(s.clientX - Gc[0], s.clientY - Gc[1]) > 5) return;
  (Ju.set((s.clientX / innerWidth) * 2 - 1, -(s.clientY / innerHeight) * 2 + 1),
    Ae.view &&
      Ae.view.enabled &&
      Ju.set(
        ((s.clientX + Ae.view.offsetX) / Ae.view.fullWidth) * 2 - 1,
        -((s.clientY + Ae.view.offsetY) / Ae.view.fullHeight) * 2 + 1,
      ),
    lm.setFromCamera(Ju, Ae));
  let t = lm.intersectObjects(Ke.pickables, !1)[0];
  if (t) return (emit("pick"), Kc(t.object.userData.eid));
  let ih = lm.intersectObjects(Ke.islandPicks || [], !1)[0];
  ih && focusIsland(ih.object.userData.isl);
});
var hm = new Zs();
(function s() {
  requestAnimationFrame(s);
  let t = Math.min(hm.getDelta(), 0.1),
    e = hm.elapsedTime;
  if (Rn) {
    let n = Math.min(1, (performance.now() - Rn.t0) / Rn.ms),
      i = fM(n);
    (Ae.position.lerpVectors(Rn.p0, Rn.p1, i), He.target.lerpVectors(Rn.t0v, Rn.t1v, i), n >= 1 && (Rn = null));
  }
  (He.update(), Ke.update(e, t, Ae), as.render(Ku, Ae), pm.render(Ku, Ae));
})();
var kt = { i: -1, cur: null, tok: 0, done: !1, playing: !1, speed: 1, mode: "overview", isl: -1, beam: null },
  Qs = (s) => {
    let t = kt.tok;
    return new Promise((e, n) => setTimeout(() => (t === kt.tok ? e() : n()), s / kt.speed));
  },
  Yc = '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>',
  _m = '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>',
  emit = (type, d) => window.dispatchEvent(new CustomEvent("tour", { detail: Object.assign({ type }, d || {}) })),
  catIdx = (id) => Ge.categories.findIndex((c) => c.id === id);
function ga(s) {
  let t = Number(String(s).replace(/,/g, ""));
  return isNaN(t) ? String(s) : t.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
function pM(s, t, e, n) {
  let i = Number(String(t).replace(/,/g, ""));
  if (isNaN(i) || e <= 0) {
    s.textContent = ga(t);
    return;
  }
  let r = performance.now(),
    a = String(t).includes(".") ? String(t).split(".")[1].length : 0;
  (function o() {
    if (n !== kt.tok) {
      s.textContent = ga(t);
      return;
    }
    let c = Math.min(1, (performance.now() - r) / e);
    ((s.textContent = (i * (1 - Math.pow(1 - c, 3))).toLocaleString("en-US", {
      minimumFractionDigits: a,
      maximumFractionDigits: a,
    })),
      c < 1 ? requestAnimationFrame(o) : (s.textContent = ga(t)));
  })();
}
function xm(s) {
  ((gm = s), Dt("#panel").classList.toggle("hide", !s), ju());
}
function setMode(m) {
  let ch = kt.mode !== m;
  kt.mode = m;
  document.body.dataset.mode = m;
  ch && emit("mode", { mode: m });
}
function curCat() {
  return kt.cur ? kt.cur.cat : kt.mode === "island" && Ge.categories[kt.isl] ? Ge.categories[kt.isl].id : null;
}
function ym() {
  ((Dt("#dots").innerHTML = Mn.map(
    (t, e) => `<button class="${e === kt.i ? "cur" : ""}" data-k="${e}" aria-label="第${e + 1}步"></button>`,
  ).join("")),
    document.querySelectorAll("#dots button").forEach((t) => (t.onclick = () => Ti(+t.dataset.k))));
  let c = curCat();
  document.querySelectorAll("#chips .chip[data-c]").forEach((t) => t.classList.toggle("cur", !!c && t.dataset.c === c));
  Dt("#d-n").textContent =
    kt.mode === "island" ? "這一區" : kt.i >= 0 ? `第 ${kt.i + 1} 步 ／ 共 ${Mn.length} 步` : "延伸介紹";
  Dt("#play").innerHTML = kt.playing ? _m : Yc;
}
function resetCase() {
  let c = Dt("#case");
  c.style.transition = "none";
  c.classList.remove("show", "flip", "flat");
  c.getAnimations && c.getAnimations().forEach((a) => a.cancel());
  void c.offsetWidth;
  c.style.transition = "";
}
function Qu() {
  (Dt("#ann").classList.remove("show"),
    resetCase(),
    Dt("#d-b").classList.remove("show"),
    (Dt("#stats").innerHTML = ""),
    (Dt("#statsps").style.display = "none"));
}
function beam(id) {
  if (kt.beam === id) return;
  kt.beam = id;
  Ke.setFocus(id);
  id && emit("beam", { id });
}
function entDetail(t, shown) {
  let i = (t.resources || []).filter((a) => Je(a.name)).slice(0, 3),
    r = [...new Set(shown.map((a) => a.src))].map((k) => dm[k]).filter(Boolean),
    h = `${Je(t.highlight) ? `<div class="hl">${he(t.highlight)}</div>` : ""}
 ${Je(t.intro) ? `<div class="sub">服務介紹</div><div>${he(t.intro)}</div>` : ""}
 ${Je(t.history) ? `<div class="sub">沿革</div><div>${he(t.history)}</div>` : ""}
 ${Je(t.howto) ? `<div class="sub">怎麼使用／申請</div><div>${he(t.howto)}</div>` : ""}
 ${i.length ? `<div class="sub">相關資源</div><div class="tags">${i.map((a) => (Je(a.url) ? `<a href="${he(a.url)}" target="_blank" rel="noopener">${he(a.name)}</a>` : `<span>${he(a.name)}</span>`)).join("")}</div>` : ""}
 ${Je(t.contact) ? `<div class="sub">聯絡窗口</div><div>${he(t.contact)}</div>` : ""}
 ${r.length ? `<div class="src">${r.map((a) => `來源：${he(a.name)}（${he(a.year)}）${Je(a.method) ? "；" + he(a.method) : ""}`).join("<br>")}</div>` : ""}`;
  return h.trim() ? `<div class="more">${h}</div>` : "";
}
function vm(s) {
  let t = Wc[s.entity],
    e = tr[s.cat] || tr[t.cat] || {};
  ((Dt("#a-cat").textContent = e.name || ""),
    (Dt("#a-h").textContent = s.headline || t.name),
    (Dt("#a-p").textContent = s.sub || ""),
    (Dt("#c-t").textContent = s.caseType || "使用者故事"),
    (Dt("#c-p").textContent = s.caseText || ""));
  let n = (s.stats || []).filter(fm);
  n.length || (n = [t.stat1, t.stat2].filter(fm));
  let img = Je(s.image) ? s.image : t.image;
  return (
    (Dt("#statsps").style.display = "none"),
    (Dt("#stats").innerHTML = n
      .map(
        (i) =>
          `<div class="stat"><b class="tn">0</b><u>${he(i.unit)}</u><span>${he(i.label)}（${he(i.year)}）</span></div>`,
      )
      .join("")),
    (Dt("#d-b").innerHTML =
      `${Je(img) ? `<img src="images/${encodeURIComponent(img)}" alt="" onerror="this.remove()">` : ""}<h3 class="serif">${he(s.headline || t.name)}</h3>${Je(s.body) ? `<div>${he(s.body)}</div>` : ""}${entDetail(t, n)}<div id="story-slot"></div>`),
    (Dt("#desc").scrollTop = 0),
    n
  );
}
function landStory(s, anim) {
  let slot = Dt("#story-slot");
  if (!slot || !Je(s.caseText)) return;
  slot.innerHTML = `<div class="story${anim ? " land" : ""}"><small>${he(s.caseType || "使用者故事")}</small><p>${he(s.caseText)}</p></div>`;
  if (anim) {
    let d = Dt("#desc");
    requestAnimationFrame(() => d.scrollTo({ top: d.scrollHeight, behavior: "smooth" }));
  }
}
function flyStory() {
  let c = Dt("#case"),
    slot = Dt("#story-slot");
  if (!c.animate) return;
  let a = c.getBoundingClientRect(),
    d = Dt("#desc"),
    dx = innerWidth * 0.45,
    dy = -20;
  if (slot && d) {
    let max = d.scrollHeight - d.clientHeight,
      delta = Math.max(0, max - d.scrollTop);
    delta > 0 && d.scrollTo({ top: max, behavior: "smooth" });
    let b = slot.getBoundingClientRect();
    b.width && ((dx = b.left + b.width / 2 - (a.left + a.width / 2)), (dy = b.top - delta + 50 - (a.top + a.height / 2)));
  }
  // 換成「平面背面」再飛：避免透明度讓 3D 翻面失效、露出鏡像的正面
  ((c.style.transition = "none"), c.classList.add("flat"), void c.offsetWidth);
  c.animate(
    [
      { transform: "translate(0px,0px) scale(1)", opacity: 1, offset: 0 },
      { transform: `translate(${dx * 0.18}px,${dy * 0.05}px) scale(.92)`, opacity: 1, offset: 0.25 },
      { transform: `translate(${dx}px,${dy}px) scale(.28)`, opacity: 0, offset: 1 },
    ],
    { duration: 720 / kt.speed, easing: "cubic-bezier(.5,0,.3,1)", fill: "forwards" },
  );
}
async function mM(e, t) {
  let n = vm(e);
  try {
    if (
      (Dt("#ann").classList.remove("show"),
      await Qs(1300),
      (kt.phase = 2),
      beam(e.entity),
      _a(e.entity),
      Dt("#ann").classList.add("show"),          // ① 主題卡與光柱同時出現
      emit("ann"),
      await Qs(2000),
      Dt("#ann").classList.remove("show"),       // ② 主題卡淡出
      await Qs(550),
      Dt("#d-b").classList.add("show"),          // ③ 右側欄：主標＋簡介（＋數據）
      (Dt("#statsps").style.display = n.length ? "" : "none"),
      emit("panel"),
      document.querySelectorAll("#stats .stat").forEach((i) => i.classList.add("show")),
      document
        .querySelectorAll("#stats .stat")
        .forEach((i, r) => pM(i.querySelector("b"), n[r].value, 1100 / kt.speed, t)),
      n.length && emit("count"),
      Je(e.caseText))
    ) {
      // ④ 留一點時間讀簡介，再翻使用者故事；退場後放到右側欄最後
      await Qs(Math.min(3500, Math.max(1800, (e.body || "").length * 20)));
      let i = Dt("#case");
      (i.classList.add("show"), await Qs(450), i.classList.add("flip"), emit("flip"), await Qs(2600));
      (emit("storyExit"), flyStory(), await Qs(700));
      (landStory(e, !0), emit("storyLand"), resetCase(), await Qs(500));
    }
    (await Qs(900), (kt.done = !0), td(t));
  } catch {}
}
function gM() {
  let s = ++kt.tok,
    t = kt.cur,
    e = vm(t);
  (document.body.classList.add("instant"),
    qc(Ke.focusPose(t.entity), 0),
    beam(t.entity),
    _a(t.entity),
    Dt("#ann").classList.remove("show"),
    (Dt("#statsps").style.display = e.length ? "" : "none"),
    document.querySelectorAll("#stats .stat").forEach((n, i) => {
      (n.classList.add("show"), (n.querySelector("b").textContent = ga(e[i].value)));
    }),
    resetCase(),
    landStory(t, !1),
    Dt("#d-b").classList.add("show"),
    (kt.done = !0),
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove("instant"))),
    td(s));
}
function td(s) {
  if (!kt.playing || !kt.done || kt.mode !== "tour" || !kt.cur) return;
  let t = Math.max(2600, ((kt.cur.body || "").length + (kt.cur.caseText || "").length * 0.5) * 55);
  setTimeout(() => {
    s === kt.tok && kt.playing && kt.done && Zc();
  }, t / kt.speed);
}
function Ti(s) {
  if (s < 0) return $c();
  if (s >= Mn.length) return Mm();
  runStep(Mn[s], s);
}
function runStep(step, idx) {
  (er(), Dt("#end").classList.remove("on"), kt.tok++);
  let t = kt.tok;
  ((kt.i = idx),
    (kt.cur = step),
    (kt.isl = catIdx(step.cat)),
    setMode("tour"),
    (kt.done = !1),
    (He.autoRotate = !1),
    (Dt("#intro").style.display = "none"),
    xm(!0),
    Qu(),
    ym(),
    kt.beam && kt.beam !== step.entity && beam(null),
    _a(step.entity),
    qc(Ke.focusPose(step.entity), 1300 / kt.speed),
    mM(step, t));
}
function Zc() {
  if (kt.mode === "island") {
    let k = Mn.findIndex((x) => x.cat === curCat());
    return Ti(k < 0 ? 0 : k);
  }
  if (kt.mode === "tour" && !kt.done) return gM();
  Ti(kt.i + 1);
}
function ed() {
  if (kt.mode === "island") return $c();
  if (kt.mode === "tour" && kt.i < 0 && kt.cur) return focusIsland(catIdx(kt.cur.cat));
  kt.mode === "tour" && kt.i >= 0 && Ti(kt.i - 1);
}
function $c() {
  (kt.tok++,
    setMode("overview"),
    (kt.i = -1),
    (kt.cur = null),
    (kt.isl = -1),
    (kt.playing = !1),
    (kt.done = !1),
    er(),
    Dt("#end").classList.remove("on"),
    Qu(),
    beam(null),
    _a(null),
    xm(!1),
    (Dt("#intro").style.display = ""),
    (He.autoRotate = !0),
    qc(Ke.overviewPose, 1500),
    ym());
}
function Mm() {
  (kt.tok++,
    (kt.playing = !1),
    setMode("end"),
    Qu(),
    beam(null),
    _a(null),
    (Dt("#play").innerHTML = Yc),
    (Dt("#e-t").textContent = Ge.site.outro || ""),
    (Dt("#e-g").innerHTML = Ge.categories
      .map((s) => {
        let t = Ge.entities.filter((e) => e.cat === s.id);
        return t.length
          ? `<div class="grp"><div class="sub" style="color:${he(s.color)}">${he(s.name)}</div><div class="tags">${t.map((e) => `<a href="#" data-e="${he(e.id)}">${he(e.name)}</a>`).join("")}</div></div>`
          : "";
      })
      .join("")),
    document.querySelectorAll("#e-g a").forEach(
      (s) =>
        (s.onclick = (t) => {
          (t.preventDefault(), Dt("#end").classList.remove("on"), Kc(s.dataset.e));
        }),
    ),
    (Dt("#e-c").textContent = Ge.site.cta || ""),
    Dt("#end").classList.add("on"),
    emit("end"));
}
function Jc(s) {
  ((kt.playing = s), (Dt("#play").innerHTML = s ? _m : Yc), s && kt.mode === "tour" && kt.done && td(kt.tok));
}
/* 點細項：直接進入光柱＋導覽流程（不再開 modal）*/
function Kc(s) {
  let t = Wc[s];
  if (!t) return;
  kt.playing && Jc(!1);
  let k = Mn.findIndex((x) => x.entity === s);
  if (k >= 0) return Ti(k);
  runStep(
    { cat: t.cat, entity: s, headline: t.name, sub: t.highlight || "", stats: [], caseType: "", caseText: "", body: "", image: t.image || "" },
    -1,
  );
}
/* 點島：聚焦整個分區 */
function focusIsland(i) {
  let cat = Ge.categories[i];
  if (!cat || !Ke.islandPose) return;
  (er(), Dt("#end").classList.remove("on"), kt.tok++);
  ((kt.playing = !1), (kt.i = -1), (kt.cur = null), (kt.isl = i), (kt.done = !0));
  (setMode("island"), (He.autoRotate = !1), (Dt("#intro").style.display = "none"), xm(!0), Qu(), beam(null));
  Object.entries(mm).forEach(([id, el]) => {
    el.className = "lb" + (Wc[id] && Wc[id].cat === cat.id ? "" : " off");
  });
  let ents = Ge.entities.filter((x) => x.cat === cat.id && Ke.anchors[x.id]),
    hasSteps = Mn.some((x) => x.cat === cat.id);
  ((Dt("#a-cat").textContent = "分區"), (Dt("#a-h").textContent = cat.name), (Dt("#a-p").textContent = cat.pitch || ""));
  Dt("#d-b").innerHTML =
    `<h3 class="serif">${he(cat.name)}</h3>${Je(cat.pitch) ? `<p class="pitch">${he(cat.pitch)}</p>` : ""}<div class="sub">這一區有 ${ents.length} 個地點，點一下就能看介紹</div><div class="items">${ents.map((x) => `<button class="it" data-e="${he(x.id)}"><i style="background:${he(Xc(x.cat))}"></i><b>${he(x.name)}</b>${Je(x.highlight) ? `<span>${he(x.highlight)}</span>` : ""}</button>`).join("")}</div>${hasSteps ? `<button class="btn" id="isl-go">從這一區開始導覽</button>` : ""}`;
  Dt("#d-b").querySelectorAll(".it").forEach((b) => (b.onclick = () => Kc(b.dataset.e)));
  let g = Dt("#isl-go");
  g && (g.onclick = () => ((kt.playing = !0), Zc()));
  (ym(), qc(Ke.islandPose(i), 1200 / kt.speed), emit("island", { i }));
  Qs(800)
    .then(() => (Dt("#ann").classList.add("show"), Dt("#d-b").classList.add("show"), Qs(2800)))
    .then(() => Dt("#ann").classList.remove("show"))
    .catch(() => {});
}
function er() {
  Dt("#cardov").classList.remove("on");
}
Dt("#cardov").addEventListener("click", (s) => {
  s.target.id === "cardov" && er();
});
Dt("#ttl").textContent = Ge.site.title || "";
Dt("#sub").textContent = Ge.site.subtitle || "";
Dt("#tag").textContent = Ge.site.tagline || "";
Dt("#lead").textContent = Ge.site.intro || "";
var _M = [...new Set(Mn.map((s) => s.cat))];
Dt("#chips").innerHTML =
  _M
    .map(
      (s) =>
        `<button class="chip" data-c="${he(s)}"><i style="background:${he(Xc(s))}"></i>${he((tr[s] || {}).name || s)}</button>`,
    )
    .join("") + '<button class="chip ghost" id="homeb">回到全景</button>';
document.querySelectorAll("#chips .chip[data-c]").forEach((s) => (s.onclick = () => focusIsland(catIdx(s.dataset.c))));
Dt("#homeb").onclick = $c;
Dt("#go").onclick = () => {
  ((kt.playing = !0), Ti(0));
};
Dt("#free").onclick = () => {
  Dt("#intro").style.display = "none";
};
Dt("#next").onclick = Zc;
Dt("#prev").onclick = ed;
Dt("#play").onclick = () => (kt.mode === "island" ? ((kt.playing = !0), Zc()) : Jc(!kt.playing));
Dt("#spd").onclick = () => {
  ((kt.speed = kt.speed === 1 ? 2 : 1), (Dt("#spd").textContent = kt.speed + "×"));
};
Dt("#again").onclick = () => {
  ((kt.playing = !0), Ti(0));
};
Dt("#home").onclick = $c;
Dt("#end-x").onclick = () => Dt("#end").classList.remove("on");
addEventListener("keydown", (s) => {
  if (s.target && /INPUT|TEXTAREA/.test(s.target.tagName)) return;
  s.key === "ArrowRight"
    ? Zc()
    : s.key === "ArrowLeft"
      ? ed()
      : s.key === " "
        ? (s.preventDefault(),
          kt.mode === "overview" || kt.mode === "end"
            ? ((kt.playing = !0), Ti(0))
            : kt.mode === "island"
              ? ((kt.playing = !0), Zc())
              : Jc(!kt.playing))
        : s.key === "Escape" && (er(), Dt("#end").classList.remove("on"));
});
Dt("#play").innerHTML = Yc;
He.autoRotate = !0;
/* 滑過可點的島或建築時顯示手指游標 */
let hvT = 0;
as.domElement.addEventListener("pointermove", (s) => {
  let n = performance.now();
  if (s.buttons || n - hvT < 90) return;
  hvT = n;
  Ju.set((s.clientX / innerWidth) * 2 - 1, -(s.clientY / innerHeight) * 2 + 1);
  Ae.view &&
    Ae.view.enabled &&
    Ju.set(((s.clientX + Ae.view.offsetX) / Ae.view.fullWidth) * 2 - 1, -((s.clientY + Ae.view.offsetY) / Ae.view.fullHeight) * 2 + 1);
  lm.setFromCamera(Ju, Ae);
  as.domElement.style.cursor =
    lm.intersectObjects(Ke.pickables, !1).length || lm.intersectObjects(Ke.islandPicks || [], !1).length ? "pointer" : "";
});
window.__tourPerf = { mkInstancer, mergeGeos };
window.__tour = {
  S: kt,
  camera: Ae,
  controls: He,
  camTo: qc,
  W: Ke,
  THREE: Bc,
  scene: Ku,
  renderer: as,
  goStep: Ti,
  next: Zc,
  prev: ed,
  home: $c,
  showEnd: Mm,
  openCard: Kc,
  pick: Kc,
  focusIsland,
  closeCard: er,
  setPlaying: Jc,
  steps: Mn,
  ents: Wc,
};
Object.assign(window.__tour, window.__tourPerf);

/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2023 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
