
/* ==== 日夜主題裝飾層：海面、雲、鳥、帆船、天燈、光線、霧；依電腦時間自動切換，也可手動切換 ==== */
(() => {
  const THEMES = {"day": {"seed": 21, "light": {"sky": "#f2f8ff", "ground": "#d9cfb4", "hemi": 1.0, "sun": "#fff4e0", "sunI": 1.25, "sunPos": [14, 24, 10]}, "fog": {"color": "#d6ebf1", "near": 1.6, "far": 5.5}, "sea": {"deep": "#4a94bf", "mid": "#5cb3c6", "shallow": "#a6e2d5", "foam": "#ffffff", "horizon": "#d6ebf1", "glint": "#ffffff", "cloudShadow": 0.16, "glitter": 0.45, "spark": 0.3, "wave": 0.016, "normK": 1.1, "glintElev": 0.5, "shallowWidth": 7, "specPow": 90, "path": 10}, "cloud": {"count": 18, "size": [1.5, 3.0], "h": [6, 12], "spread": 40, "wind": [1, 0.35], "speed": 0.45, "top": "#ffffff", "bottom": "#d7e4f0", "emissive": "#ffffff", "emissiveI": 0.3, "opacity": 0.96, "occluded": 0, "margin": 1.2, "maxAng": 0.3}, "bird": {"flocks": 2, "perFlock": 6, "h": [11, 16], "scale": 1.25, "body": "#ffffff", "tip": "#5d6b78"}, "boats": {"count": 3, "scale": 1.3, "hull": ["#c8643b", "#3f86a8", "#ffffff"], "sail": "#fffaf0"}, "lanterns": null, "fx": {"boost": 1.1, "dust": 1.25}}, "night": {"seed": 33, "light": {"sky": "#ffd6b8", "ground": "#6c6a98", "hemi": 0.95, "sun": "#ffb877", "sunI": 1.45, "sunPos": [18, 12, 10]}, "fog": {"color": "#f1b49c", "near": 1.3, "far": 4.8}, "sea": {"deep": "#3f5283", "mid": "#4f7b97", "shallow": "#8bb8ad", "foam": "#fff1df", "horizon": "#f0b39c", "glint": "#ffc778", "cloudShadow": 0.0, "glitter": 1.0, "spark": 0.4, "wave": 0.018, "normK": 1.5, "glintElev": 0.38, "shallowWidth": 6.5, "specPow": 90, "path": 22}, "cloud": {"count": 16, "size": [1.6, 3.2], "h": [6, 12], "spread": 40, "wind": [1, -0.25], "speed": 0.35, "top": "#ffece6", "bottom": "#cbb4d8", "emissive": "#ffcab6", "emissiveI": 0.35, "opacity": 0.95, "occluded": 0, "margin": 1.2, "maxAng": 0.3}, "bird": {"flocks": 2, "perFlock": 6, "h": [11, 17], "scale": 1.2, "body": "#3a3348", "tip": "#2a2436"}, "boats": null, "lanterns": {"count": 12, "y0": 1.5, "top": 19, "scale": 1.35, "paper": "#ffe3b0", "glow": "#ffa85a", "glowSize": 2.2}, "fx": {"boost": 1.25, "dust": 1.05}}};
  const T = window.__tour;
  if (!T || !T.W || !T.THREE || !T.camera) return;
  const THREE = T.THREE, W = T.W, cam = T.camera, ctl = T.controls;
  const scene = T.scene || W.anchors[Object.keys(W.anchors)[0]].parent;
  if (!scene || !scene.isScene) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width:760px)").matches;
  const R = W.R;
  const APO = 7.4 * 1.16 * Math.cos(Math.PI / 6);
  const isl = (W.isl || []).map((o) => o.c);
  const D = THEMES.day, N = THEMES.night;
  const col = (h) => new THREE.Color(h);
  let seed = 21;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rr = (a, b) => a + rnd() * (b - a);
  const ss = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;

  // 把兩個主題的顏色先轉成 Color 物件，切換時直接內插
  const C2 = (path) => { const g = (o) => path.split(".").reduce((x, k) => x[k], o); return [col(g(D)), col(g(N))]; };
  const S2 = (path) => { const g = (o) => path.split(".").reduce((x, k) => x[k], o); return [g(D), g(N)]; };
  const tmpC = new THREE.Color();
  const lc = (pair, t, out) => (out || tmpC).copy(pair[0]).lerp(pair[1], t);
  const ls = (pair, t) => lerp(pair[0], pair[1], t);

  /* ---------- 光線 ---------- */
  const hemi = scene.children.find((o) => o.isHemisphereLight);
  const sun = scene.children.find((o) => o.isDirectionalLight);
  const L = { sky: C2("light.sky"), ground: C2("light.ground"), sun: C2("light.sun"), hemi: S2("light.hemi"), sunI: S2("light.sunI"),
    pos: [new THREE.Vector3(...D.light.sunPos), new THREE.Vector3(...N.light.sunPos)] };

  /* ---------- 霧 ---------- */
  const fog = new THREE.Fog(D.fog.color, 200, 400);
  scene.fog = fog;
  const F = { color: C2("fog.color"), near: S2("fog.near"), far: S2("fog.far") };

  /* ---------- 海面 ---------- */
  const sea = scene.children.find((o) => o.isMesh && o.geometry && o.geometry.type === "CircleGeometry" && o.geometry.parameters.radius > R + 20);
  const MAXI = 32, MAXC = 16;
  const SC = ["deep", "mid", "shallow", "foam", "horizon", "glint"].map((k) => [k, C2("sea." + k)]);
  const SS = ["cloudShadow", "glitter", "spark", "wave", "normK", "glintElev", "shallowWidth", "specPow", "path"].map((k) => [k, S2("sea." + k)]);
  let seaMat = null;
  if (sea) {
    seaMat = new THREE.ShaderMaterial({
      fog: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
        uTime: { value: 0 },
        uDeep: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uShallow: { value: new THREE.Color() },
        uFoam: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uGlint: { value: new THREE.Color() },
        uIsl: { value: Array.from({ length: MAXI }, (_, i) => new THREE.Vector2(isl[i] ? isl[i].x : 9999, isl[i] ? isl[i].z : 9999)) },
        uCount: { value: Math.min(MAXI, isl.length) },
        uApo: { value: APO },
        uCl: { value: Array.from({ length: MAXC }, () => new THREE.Vector3(9999, 9999, 0)) },
        uClN: { value: 0 },
        uCloudShadow: { value: 0 }, uSeaR: { value: sea.geometry.parameters.radius },
        uSun: { value: new THREE.Vector3(0, 0.5, -1).normalize() },
        uGlitter: { value: 0 }, uSpark: { value: 0 }, uWave: { value: 0 }, uNormK: { value: 1 },
        uShallowWidth: { value: 7 }, uSpecPow: { value: 80 }, uPath: { value: 8 },
      }]),
      vertexShader: `
        varying vec3 vW;
        #include <fog_pars_vertex>
        void main(){
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          vec4 mvPosition = viewMatrix * w;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: `
        uniform float uTime, uApo, uCloudShadow, uSeaR, uGlitter, uSpark, uWave, uNormK, uShallowWidth, uSpecPow, uPath;
        uniform vec3 uDeep, uMid, uShallow, uFoam, uHorizon, uGlint, uSun;
        uniform vec2 uIsl[${MAXI}]; uniform int uCount;
        uniform vec3 uCl[${MAXC}]; uniform int uClN;
        varying vec3 vW;
        #include <common>
        #include <fog_pars_fragment>
        float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
        float vn(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
          return mix(mix(h21(i),h21(i+vec2(1,0)),u.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x), u.y); }
        float sdHex(vec2 p, float r){ const vec3 k=vec3(-0.866025404,0.5,0.577350269);
          p=abs(p); p-=2.0*min(dot(k.xy,p),0.0)*k.xy; p-=vec2(clamp(p.x,-k.z*r,k.z*r),r); return length(p)*sign(p.y); }
        float wav(vec2 p, float t){
          return vn(p*0.42+vec2(t*0.05,t*0.03)) + 0.5*vn(p*1.05+vec2(-t*0.08,t*0.05)) + 0.25*vn(p*2.5+vec2(t*0.11,-t*0.09)); }
        void main(){
          vec2 p = vW.xz; float t = uTime;
          float d = 1e4;
          for (int i = 0; i < ${MAXI}; i++){ if (i >= uCount) break; vec2 q = p - uIsl[i]; d = min(d, sdHex(vec2(q.y, q.x), uApo)); }
          float w = wav(p, t);
          float dd = d + (w - 0.85) * 1.8;
          float sh = 1.0 - smoothstep(0.0, uShallowWidth, dd);
          vec3 c = mix(uMid, uDeep, smoothstep(uShallowWidth, uSeaR * 0.55, d));
          c = mix(c, uShallow, sh * sh);
          vec3 V = normalize(cameraPosition - vW);
          float camD = length(cameraPosition - vW);
          float detail = 1.0 - smoothstep(45.0, 150.0, camD);
          c *= 0.97 + 0.06 * vn(p * 0.08 + vec2(t * 0.01, 0.0));
          float band = smoothstep(0.72, 1.0, sin(w * 6.0 + t * 0.5) * 0.5 + 0.5);
          c += band * uWave * (0.35 + 0.65 * (1.0 - sh)) * detail;
          float pathF = pow(max(dot(reflect(-uSun, vec3(0.0, 1.0, 0.0)), V), 0.0), uPath);
          float e = 0.35;
          float hx = wav(p + vec2(e, 0.0), t) - w, hz = wav(p + vec2(0.0, e), t) - w;
          float nk = uNormK * (0.35 + 0.65 * detail);
          vec3 N = normalize(vec3(-hx * nk, 1.0, -hz * nk));
          float spec = pow(max(dot(reflect(-uSun, N), V), 0.0), uSpecPow);
          c += uGlint * spec * uGlitter * (0.25 + 0.75 * pathF);
          c += uGlint * pathF * uGlitter * 0.12;
          float sp = vn(p * 3.1 + vec2(t * 0.7, -t * 0.5)) * vn(p * 2.3 - vec2(t * 0.4, t * 0.6));
          c += uGlint * smoothstep(0.7, 0.9, sp) * uSpark * (1.0 - sh * 0.6) * detail * (0.3 + 0.7 * pathF);
          float fz = d + 0.22 * sin(t * 1.3 + w * 5.0);
          float foam = (1.0 - smoothstep(0.0, 0.85, fz)) * step(-0.4, d);
          float ring = smoothstep(0.32, 0.0, abs(fz - 1.7 - 0.45 * sin(t * 0.8))) * smoothstep(0.45, 0.7, vn(p * 1.7 + t * 0.25));
          c = mix(c, uFoam, clamp(foam * 0.9 + ring * 0.5, 0.0, 1.0));
          float s = 0.0;
          for (int i = 0; i < ${MAXC}; i++){ if (i >= uClN) break; vec3 cl = uCl[i]; float r = length(p - cl.xy); s = max(s, 1.0 - smoothstep(cl.z * 0.25, cl.z, r)); }
          c *= 1.0 - clamp(s, 0.0, 1.0) * uCloudShadow;
          c = mix(c, uHorizon, smoothstep(uSeaR * 0.5, uSeaR * 0.97, length(p)));
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
    });
    sea.material = seaMat;
  }

  /* ---------- 雲 ---------- */
  const CL = { top: C2("cloud.top"), bottom: C2("cloud.bottom"), emissive: C2("cloud.emissive"), emissiveI: S2("cloud.emissiveI"), opacity: S2("cloud.opacity") };
  const CC = D.cloud;
  const clouds = [], puffs = [];
  const puffGeo = (r) => {
    const g = new THREE.IcosahedronGeometry(r, 1);
    const pos = g.attributes.position, ks = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      if (y < -r * 0.22) { y = -r * 0.22 + (y + r * 0.22) * 0.3; pos.setY(i, y); }
      ks[i] = ss(-r * 0.3, r * 0.75, y);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(pos.count * 3), 3));
    g.computeVertexNormals();
    puffs.push({ g, ks });
    return g;
  };
  const cT = new THREE.Color(), cB = new THREE.Color(), cX = new THREE.Color();
  const recolorClouds = (m) => {
    lc(CL.top, m, cT); lc(CL.bottom, m, cB);
    puffs.forEach(({ g, ks }) => {
      const a = g.attributes.color;
      for (let i = 0; i < ks.length; i++) { cX.copy(cB).lerp(cT, ks[i]); a.setXYZ(i, cX.r, cX.g, cX.b); }
      a.needsUpdate = true;
    });
  };
  const RC = R + CC.spread;
  const wind = new THREE.Vector2(...CC.wind).normalize();
  for (let k = 0; k < Math.round(CC.count * (small ? 0.6 : 1)); k++) {
    const size = rr(CC.size[0], CC.size[1]);
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, transparent: true, opacity: 0 });
    const g = new THREE.Group();
    const n = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1) - 0.5;
      const r = size * (1 - Math.abs(f) * 0.85) * rr(0.85, 1.05) + size * 0.22;
      const m = new THREE.Mesh(puffGeo(r), mat);
      m.position.set(f * size * 2.5 + rr(-0.15, 0.15) * size, rr(0, 0.2) * size, rr(-0.35, 0.35) * size);
      m.rotation.y = rnd() * 6.28;
      g.add(m);
    }
    const top = new THREE.Mesh(puffGeo(size * 0.7), mat);
    top.position.set(rr(-0.4, 0.4) * size, size * 0.55, 0);
    g.add(top);
    if (T.mergeGeos) {
      // 效能：把這朵雲的幾團合併成一個網格（每朵雲仍可各自淡出）
      const parts = g.children.slice(), mine = puffs.splice(puffs.length - parts.length, parts.length);
      const merged = T.mergeGeos(THREE, parts.map((p) => (p.updateMatrix(), p.geometry.applyMatrix4(p.matrix))));
      parts.forEach((p) => g.remove(p));
      g.add(new THREE.Mesh(merged, mat));
      const ks = new Float32Array(mine.reduce((a, x) => a + x.ks.length, 0));
      let off = 0;
      mine.forEach((x) => (ks.set(x.ks, off), (off += x.ks.length)));
      puffs.push({ g: merged, ks });
    }
    g.rotation.y = Math.atan2(wind.x, wind.y) + Math.PI / 2 + rr(-0.4, 0.4);
    const a = rnd() * 6.28, rad = rr(R * 0.4, RC * 0.95);
    g.position.set(Math.cos(a) * rad, rr(CC.h[0], CC.h[1]), Math.sin(a) * rad);
    scene.add(g);
    clouds.push({ g, mat, size, spd: rr(0.6, 1.0) * CC.speed, ph: rnd() * 6.28, op: 0, y0: g.position.y });
  }

  /* ---------- 鳥群 ---------- */
  const B = D.bird;
  const BC = { body: C2("bird.body"), tip: C2("bird.tip") };
  const flocks = [];
  const wingCache = {};
  const wingGeo = (s, inner) => wingCache[s + "|" + inner] || (wingCache[s + "|" + inner] = wingGeo0(s, inner));
  const wingGeo0 = (s, inner) => {
    const v = inner
      ? [0, 0, 0.16, 0, 0, -0.1, s * 0.45, 0.02, -0.02, 0, 0, 0.16, s * 0.45, 0.02, -0.02, s * 0.45, 0.02, 0.1]
      : [0, 0, 0.1, 0, 0, -0.02, s * 0.5, -0.03, -0.2, 0, 0, 0.1, s * 0.5, -0.03, -0.2, s * 0.32, -0.02, 0.02];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  };
  const mb = new THREE.MeshLambertMaterial({ flatShading: true, side: THREE.DoubleSide });
  const mt = new THREE.MeshLambertMaterial({ flatShading: true, side: THREE.DoubleSide });
  const birdBody = new THREE.ConeGeometry(0.085, 0.6, 5);
  const birdTail = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([0, 0, -0.22, -0.11, 0, -0.42, 0.11, 0, -0.42], 3));
  birdTail.computeVertexNormals();
  const makeBird = () => {
    const g = new THREE.Group();
    g.rotation.order = "YXZ";
    const body = new THREE.Mesh(birdBody, mb);
    body.rotation.x = Math.PI / 2;
    g.add(body);
    const tail = new THREE.Mesh(birdTail, mb);
    g.add(tail);
    const wings = [-1, 1].map((s) => {
      const inner = new THREE.Group(), outer = new THREE.Group();
      inner.position.x = s * 0.05;
      inner.add(new THREE.Mesh(wingGeo(s, true), mb));
      outer.position.set(s * 0.45, 0.02, 0.04);
      outer.add(new THREE.Mesh(wingGeo(s, false), mt));
      inner.add(outer);
      g.add(inner);
      return { s, inner, outer };
    });
    g.scale.setScalar(B.scale);
    scene.add(g);
    return { g, wings, ph: rnd() * 6.28, rate: rr(7, 9.5), gl: rnd() * 6.28, off: new THREE.Vector3() };
  };
  for (let f = 0; f < (small ? 1 : B.flocks); f++) {
    const fl = { rad: rr(R * 0.55, R + 14), ex: rr(0.65, 1), h: rr(B.h[0], B.h[1]), w: (f % 2 ? -1 : 1) * rr(0.07, 0.12), a: rnd() * 6.28, birds: [] };
    for (let i = 0; i < B.perFlock; i++) {
      const b = makeBird();
      const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
      b.off.set(i ? side * row * 1.15 * B.scale : 0, rr(-0.25, 0.25), -row * 1.0 * B.scale);
      fl.birds.push(b);
    }
    flocks.push(fl);
  }

  // 效能：所有飛鳥的身體、尾巴、翅膀各自共用一組 InstancedMesh；顏色跟著日夜換
  const BI = T.mkInstancer ? T.mkInstancer(THREE, scene) : null;
  if (BI) { flocks.forEach((fl) => fl.birds.forEach((b) => b.g.traverse((o) => o.isMesh && BI.add(o, b.g, true)))); BI.finalize(); }

  /* ---------- 帆船（白天）---------- */
  const boats = [], boatMats = [];
  {
    const wc = document.createElement("canvas"); wc.width = 64; wc.height = 256;
    const x = wc.getContext("2d");
    const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = gr; x.beginPath(); x.moveTo(26, 0); x.lineTo(38, 0); x.lineTo(64, 256); x.lineTo(0, 256); x.closePath(); x.fill();
    const wakeTex = new THREE.CanvasTexture(wc);
    const BT = D.boats;
    const tm = (o) => { const m = new THREE.MeshLambertMaterial(Object.assign({ transparent: true, flatShading: true }, o)); boatMats.push([m, 1]); return m; };
    for (let k = 0; k < BT.count; k++) {
      const g = new THREE.Group();
      const hullG = new THREE.BoxGeometry(0.62, 0.26, 1.7);
      const hp = hullG.attributes.position;
      for (let i = 0; i < hp.count; i++) {
        if (hp.getZ(i) > 0) hp.setX(i, hp.getX(i) * 0.25);
        if (hp.getY(i) < 0) hp.setX(i, hp.getX(i) * 0.7);
      }
      hullG.computeVertexNormals();
      g.add(new THREE.Mesh(hullG, tm({ color: BT.hull[k % BT.hull.length] })));
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 5), tm({ color: 0x8a6a4a }));
      mast.position.set(0, 0.9, 0.15); g.add(mast);
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0, 1.35); sh.lineTo(-0.85, 0); sh.closePath();
      const sail = new THREE.Mesh(new THREE.ShapeGeometry(sh), tm({ color: BT.sail, side: THREE.DoubleSide, flatShading: false }));
      sail.rotation.y = Math.PI / 2; sail.position.set(0, 0.25, 0.12); g.add(sail);
      const wm = new THREE.MeshBasicMaterial({ map: wakeTex, transparent: true, depthWrite: false, opacity: 0.55 });
      boatMats.push([wm, 0.55]);
      const wake = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 3.4), wm);
      wake.rotation.x = -Math.PI / 2; wake.position.set(0, -0.11, -2.4);
      g.add(wake);
      g.scale.setScalar(BT.scale);
      scene.add(g);
      boats.push({ g, r: R + rr(6, 20), a: (k / BT.count) * 6.28 + rr(-0.4, 0.4), w: (k % 2 ? -1 : 1) * rr(0.025, 0.04), ph: rnd() * 6.28 });
    }
  }

  /* ---------- 天燈（夜晚）---------- */
  const lanterns = [];
  const LT = N.lanterns;
  if (isl.length) {
    const gc = document.createElement("canvas"); gc.width = gc.height = 64;
    const x = gc.getContext("2d");
    const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,230,180,1)"); gr.addColorStop(0.35, "rgba(255,170,90,.55)"); gr.addColorStop(1, "rgba(255,140,60,0)");
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const glowTex = new THREE.CanvasTexture(gc);
    const spawn = (o, first) => {
      const c = isl[Math.floor(rnd() * isl.length)], a = rnd() * 6.28, r = rr(1, 6);
      o.base.set(c.x + Math.cos(a) * r, 0, c.z + Math.sin(a) * r);
      o.y = first ? rr(LT.y0, LT.top) : LT.y0;
      o.spd = rr(0.28, 0.45); o.ph = rnd() * 6.28;
    };
    for (let k = 0; k < Math.round(LT.count * (small ? 0.6 : 1)); k++) {
      const g = new THREE.Group();
      const mat = new THREE.MeshLambertMaterial({ color: LT.paper, emissive: col(LT.glow), emissiveIntensity: 1.1, transparent: true, flatShading: true });
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.42, 6), mat));
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: LT.glow, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
      sp.scale.setScalar(LT.glowSize || 1.7); g.add(sp);
      g.scale.setScalar(LT.scale);
      scene.add(g);
      const o = { g, mat, sp, base: new THREE.Vector3(), y: 0, spd: 0, ph: 0, spawn };
      spawn(o, true);
      lanterns.push(o);
    }
  }

  /* ---------- 主題內插 ---------- */
  const FXB = S2("fx.boost"), FXD = S2("fx.dust");
  let mix = 0, target = 0, cur = "day";
  const apply = (m) => {
    if (hemi) { lc(L.sky, m, hemi.color); lc(L.ground, m, hemi.groundColor); hemi.intensity = ls(L.hemi, m); }
    if (sun) { lc(L.sun, m, sun.color); sun.intensity = ls(L.sunI, m); sun.position.lerpVectors(L.pos[0], L.pos[1], m); }
    lc(F.color, m, fog.color);
    if (seaMat) {
      const u = seaMat.uniforms;
      SC.forEach(([k, p]) => lc(p, m, u["u" + k[0].toUpperCase() + k.slice(1)].value));
      SS.forEach(([k, p]) => { const n = "u" + k[0].toUpperCase() + k.slice(1); if (u[n]) u[n].value = ls(p, m); });
    }
    clouds.forEach((c) => { lc(CL.emissive, m, c.mat.emissive); c.mat.emissiveIntensity = ls(CL.emissiveI, m); });
    recolorClouds(m);
    lc(BC.body, m, mb.color); lc(BC.tip, m, mt.color);
    if (W.fx) {
      W.fx.uBoost.value = ls(FXB, m); W.fx.uDust.value = ls(FXD, m);
    }
  };
  const autoName = () => { const h = new Date().getHours(); return h >= 6 && h < 18 ? "day" : "night"; };
  const btn = document.getElementById("themeb");
  const icon = { day: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
    night: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>' };
  const setTheme = (name, instant) => {
    cur = name; target = name === "night" ? 1 : 0;
    if (instant) { mix = target; apply(mix); }
    document.body.classList.toggle("night", name === "night");
    if (btn) { btn.innerHTML = icon[name]; btn.title = name === "night" ? "夜晚（點一下切換成白天）" : "白天（點一下切換成夜晚）"; btn.setAttribute("aria-label", btn.title); }
    window.dispatchEvent(new CustomEvent("tour", { detail: { type: "theme", night: name === "night", instant: !!instant } }));
  };
  let manual = false;
  const q = new URLSearchParams(location.search).get("theme");
  if (q === "day" || q === "night") { manual = true; setTheme(q, true); } else setTheme(autoName(), true);
  setInterval(() => { if (!manual && autoName() !== cur) setTheme(autoName(), false); }, 60000);
  if (btn) btn.onclick = () => { manual = true; setTheme(cur === "day" ? "night" : "day", false); };
  window.__theme = { set: (n) => { manual = true; setTheme(n, false); }, get: () => cur, auto: () => { manual = false; setTheme(autoName(), false); } };

  /* ---------- 每一格畫面更新 ---------- */
  const tmp = new THREE.Vector3(), fwd = new THREE.Vector3();
  let last = performance.now(), time = 0;
  const prevBR = scene.onBeforeRender;
  scene.onBeforeRender = function (...args) {
    prevBR && prevBR.apply(this, args);
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (!reduce) time += dt;

    if (mix !== target) {
      mix = target > mix ? Math.min(target, mix + dt / 1.6) : Math.max(target, mix - dt / 1.6);
      apply(ss(0, 1, mix));
    }
    const m = ss(0, 1, mix);
    const sunDir = sun ? sun.position.clone().normalize() : tmp.set(0.4, 0.8, 0.3);
    const offX = sunDir.x / Math.max(0.2, sunDir.y), offZ = sunDir.z / Math.max(0.2, sunDir.y);

    const camDist = cam.position.distanceTo(ctl ? ctl.target : tmp.set(0, 0, 0));
    fog.near = camDist + R * ls(F.near, m); fog.far = camDist + R * ls(F.far, m);

    if (seaMat) {
      const u = seaMat.uniforms;
      u.uTime.value = reduce ? 12 : time;
      cam.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
      u.uSun.value.set(fwd.x, u.uGlintElev ? u.uGlintElev.value : ls(SS[5][1], m), fwd.z).normalize();
    }

    let ci = 0;
    const cop = ls(CL.opacity, m);
    clouds.forEach((c) => {
      const p = c.g.position;
      if (!reduce) {
        p.x += wind.x * c.spd * dt; p.z += wind.y * c.spd * dt;
        p.y = c.y0 + Math.sin(time * 0.3 + c.ph) * 0.25;
        const along = p.x * wind.x + p.z * wind.y, cross = -p.x * wind.y + p.z * wind.x;
        const lim = Math.sqrt(Math.max(1, RC * RC - cross * cross));
        if (along > lim) { const na = -lim; p.x = na * wind.x - cross * wind.y; p.z = na * wind.y + cross * wind.x; c.op = 0; }
      }
      const r = Math.hypot(p.x, p.z);
      const edge = 1 - ss(RC * 0.78, RC, r);
      let tgt = edge;
      const cp = cam.position;
      if (cp.y > p.y + 0.5) {
        const k = cp.y / (cp.y - p.y);
        const hx = cp.x + (p.x - cp.x) * k, hz = cp.z + (p.z - cp.z) * k;
        if (Math.hypot(hx, hz) < R + c.size * CC.margin) tgt = Math.min(tgt, CC.occluded);
      }
      const ang = (c.size * 2.6) / Math.max(0.1, cp.distanceTo(p));
      tgt *= 1 - ss(CC.maxAng * 0.75, CC.maxAng, ang);
      tgt *= ss(camDist * 0.9, camDist * 1.08, cp.distanceTo(p));   // 雲不會擋在鏡頭和目標之間
      c.op += (tgt - c.op) * Math.min(1, dt * (tgt < c.op ? 4.5 : 2));
      c.mat.opacity = c.op * cop;
      c.g.visible = c.op > 0.01;
      if (seaMat && ci < MAXC && edge > 0.05) {
        seaMat.uniforms.uCl.value[ci].set(p.x - offX * p.y, p.z - offZ * p.y, c.size * 2.6 * edge);
        ci++;
      }
    });
    if (seaMat) seaMat.uniforms.uClN.value = ci;

    flocks.forEach((fl) => {
      if (!reduce) fl.a += fl.w * dt;
      const a = fl.a;
      const cx = Math.cos(a) * fl.rad, cz = Math.sin(a) * fl.rad * fl.ex, cy = fl.h + Math.sin(a * 1.7) * 1.0;
      const dx = -Math.sin(a) * fl.rad * fl.w, dz = Math.cos(a) * fl.rad * fl.ex * fl.w;
      const yaw = Math.atan2(dx, dz);
      const c0 = Math.cos(yaw), s0 = Math.sin(yaw);
      fl.birds.forEach((b) => {
        if (!reduce) b.ph += dt * b.rate;
        const o = b.off;
        b.g.position.set(cx + o.x * c0 + o.z * s0, cy + o.y + Math.sin(time * 1.3 + b.gl) * 0.12, cz - o.x * s0 + o.z * c0);
        b.g.rotation.set(Math.sin(time * 0.9 + b.gl) * 0.05, yaw, -Math.sign(fl.w) * 0.22);
        b.g.visible = cam.position.distanceTo(b.g.position) > 8;   // 太靠近鏡頭就先隱藏
        const env = 0.25 + 0.75 * ss(-0.2, 0.6, Math.sin(time * 0.45 + b.gl));
        const fa = Math.sin(b.ph) * 0.75 * env;
        b.wings.forEach((wg) => {
          wg.inner.rotation.z = wg.s * (fa + 0.08);
          wg.outer.rotation.z = wg.s * Math.sin(b.ph - 0.7) * 0.55 * env;
        });
      });
    });

    if (BI) { flocks.forEach((fl) => fl.birds.forEach((b) => b.g.updateMatrixWorld(true))); BI.sync(); }

    const bv = 1 - m;
    boatMats.forEach(([mm, base]) => (mm.opacity = base * bv));
    boats.forEach((bt) => {
      bt.g.visible = bv > 0.01;
      if (!reduce) bt.a += bt.w * dt;
      const x = Math.cos(bt.a) * bt.r, z = Math.sin(bt.a) * bt.r;
      const dx = -Math.sin(bt.a) * bt.w, dz = Math.cos(bt.a) * bt.w;
      bt.g.position.set(x, -0.62 + Math.sin(time * 1.6 + bt.ph) * 0.04, z);
      bt.g.rotation.set(Math.sin(time * 1.3 + bt.ph) * 0.04, Math.atan2(dx, dz), Math.sin(time * 1.1 + bt.ph) * 0.06);
    });

    lanterns.forEach((o) => {
      if (!reduce) { o.y += o.spd * dt; o.ph += dt; }
      if (o.y > LT.top) o.spawn(o, false);
      const f = ss(LT.y0, LT.y0 + 1.2, o.y) * (1 - ss(LT.top - 4, LT.top, o.y)) * m;
      o.g.position.set(o.base.x + Math.sin(o.ph * 0.6) * 0.5, o.y, o.base.z + Math.cos(o.ph * 0.5) * 0.5);
      o.g.rotation.z = Math.sin(o.ph * 0.9) * 0.06;
      const near = cam.position.distanceTo(o.g.position) < 3 ? 0 : 1;
      o.mat.opacity = f * near;
      o.sp.material.opacity = f * near * (0.75 + 0.25 * Math.sin(o.ph * 3.1));
      o.g.visible = f * near > 0.01;
    });
  };
})();
