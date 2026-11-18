/* ===== 共用：low poly 人群（大樓、市集用）=====
   腿以髖、手以肩為軸前後擺（左腳向前時右手向前）；短髮／中長髮／長髮、褲裝／裙裝、包包。
   cfg：{ scale, rnd, reduce, pal:{skin,hair,shirt,pants,bag,tights}, loops:[[Vector3...]], adjust(p,dt), hide(p,cam) } */
function mkCrowd(T, scene, cfg) {
  const S = cfg.scale || 1,
    rnd = cfg.rnd,
    reduce = cfg.reduce,
    P = cfg.pal;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const people = [];
  const loops = cfg.loops || [];
  const loopLen = loops.map((pts) => {
    let L = 0;
    const seg = [];
    for (let k = 1; k < pts.length; k++) {
      const l = pts[k].distanceTo(pts[k - 1]);
      seg.push(l);
      L += l;
    }
    return { L, seg };
  });
  const add = (kind, opt) => {
    const hs = rnd(),
      style = hs < 0.48 ? 0 : hs < 0.76 ? 1 : 2;
    const p = Object.assign(
      {
        kind,
        skin: pick(P.skin),
        hair: pick(P.hair),
        shirt: pick(P.shirt),
        pants: pick(P.pants),
        bag: rnd() < 0.4 ? pick(P.bag) : null,
        h: 0.92 + rnd() * 0.14,
        ph: rnd() * 10,
        x: 0,
        z: 0,
        ry: 0,
        hairStyle: style,
        skirt: rnd() < (style ? 0.42 : 0.06),
      },
      opt,
    );
    p.legC = p.skirt ? (rnd() < 0.5 ? p.skin : pick(P.tights)) : p.pants;
    people.push(p);
    return p;
  };
  const posOn = (li, s, out) => {
    const pts = loops[li],
      { L, seg } = loopLen[li];
    s = ((s % L) + L) % L;
    for (let k = 0; k < seg.length; k++) {
      if (s <= seg[k]) {
        const a = pts[k],
          b = pts[k + 1],
          t = s / seg[k];
        out.set(a.x + (b.x - a.x) * t, 0, a.z + (b.z - a.z) * t);
        return Math.atan2(b.x - a.x, b.z - a.z);
      }
      s -= seg[k];
    }
    out.copy(pts[0]);
    return 0;
  };
  const NAMES = ["leg", "arm", "torso", "head", "hair", "hairB", "skirt", "bag"];
  const box = new T.BoxGeometry(1, 1, 1),
    sph = new T.SphereGeometry(1, 8, 6),
    cone = new T.CylinderGeometry(0.55, 1, 1, 8);
  const GEO = { leg: box, arm: box, torso: box, head: sph, hair: sph, hairB: box, skirt: cone, bag: box };
  let IM = null;
  const finalize = (mat, themed) => {
    const n = Math.max(1, people.length),
      cnt = { leg: 2 * n, arm: 2 * n, torso: n, head: n, hair: n, hairB: n, skirt: n, bag: n };
    IM = {};
    const cols = {};
    NAMES.forEach((k) => {
      const im = new T.InstancedMesh(GEO[k], mat, cnt[k]);
      im.frustumCulled = false;
      im.castShadow = true;
      im.instanceMatrix.setUsage(T.DynamicDrawUsage);
      scene.add(im);
      IM[k] = im;
      cols[k] = [];
    });
    people.forEach((p) => {
      cols.leg.push(p.legC, p.legC);
      cols.arm.push(p.shirt, p.shirt);
      cols.torso.push(p.shirt);
      cols.head.push(p.skin);
      cols.hair.push(p.hair);
      cols.hairB.push(p.hair);
      cols.skirt.push(p.pants);
      cols.bag.push(p.bag || p.shirt);
    });
    NAMES.forEach((k) => {
      if (!cols[k].length) return;
      cols[k].forEach((c, q) => IM[k].setColorAt(q, c.d));
      IM[k].instanceColor.needsUpdate = true;
      themed.push({ im: IM[k], cols: cols[k] });
    });
  };
  const e = new T.Euler(),
    qn = new T.Quaternion(),
    sv = new T.Vector3(),
    pv = new T.Vector3(),
    m4 = new T.Matrix4(),
    tmp = new T.Vector3();
  const put = (k, i, x, y, z, sx, sy, sz, ry, rx = 0) => {
    pv.set(x, y, z);
    e.set(rx, ry, 0, "YXZ");
    qn.setFromEuler(e);
    sv.set(sx, sy, sz);
    m4.compose(pv, qn, sv);
    IM[k].setMatrixAt(i, m4);
  };
  const off = (k, i, x, z) => put(k, i, x, -9, z, 1e-3, 1e-3, 1e-3, 0);
  const draw = (t, dt, cam) => {
    if (!IM) return;
    people.forEach((p, q) => {
      let swing = 0;
      if (p.kind === "walk") {
        if (!reduce) p.s += p.v * dt;
        const ry = posOn(p.loop, p.s, tmp) + (p.v < 0 ? Math.PI : 0);
        // 走在路線右側，雙向人流不相撞
        p.x = tmp.x + Math.cos(ry) * p.off;
        p.z = tmp.z - Math.sin(ry) * p.off;
        p.ry = ry;
        swing = reduce ? 0 : Math.sin((t * 7 * Math.abs(p.v)) / S + p.ph) * 0.5;
      } else if (!reduce && p.kind !== "still") {
        p.ry0 === undefined && (p.ry0 = p.ry);
        p.ry = p.ry0 + Math.sin(t * 0.4 + p.ph) * 0.25;
      }
      cfg.adjust && cfg.adjust(p, dt);
      if (cfg.hide && cfg.hide(p, cam)) {
        for (const k of ["leg", "arm"]) for (const j of [0, 1]) off(k, q * 2 + j, p.x, p.z);
        for (const k of ["torso", "head", "hair", "hairB", "skirt", "bag"]) off(k, q, p.x, p.z);
        return;
      }
      const h = p.h * S,
        c = Math.cos(p.ry),
        s = Math.sin(p.ry),
        bob = Math.abs(swing) * 0.04 * S,
        y0 = p.y || 0;
      const hy = 0.82 * h,
        la = 0.6 * h,
        sh = 1.44 * h + bob + y0;
      for (const side of [-1, 1]) {
        const idx = q * 2 + (side > 0 ? 1 : 0),
          a = swing * side,
          zz = -(hy / 2) * Math.sin(a);
        const lx = p.x + c * side * 0.11 * S,
          lz = p.z - s * side * 0.11 * S;
        put("leg", idx, lx + zz * s, y0 + hy + bob - (hy / 2) * Math.cos(a), lz + zz * c, (p.skirt ? 0.12 : 0.16) * S, hy, (p.skirt ? 0.13 : 0.18) * S, p.ry, a);
        const b = -a * 0.8,
          za = -(la / 2) * Math.sin(b),
          ax = p.x + c * side * 0.29 * S,
          az = p.z - s * side * 0.29 * S;
        put("arm", idx, ax + za * s, sh - (la / 2) * Math.cos(b), az + za * c, 0.12 * S, la, 0.13 * S, p.ry, b);
      }
      put("torso", q, p.x, y0 + 0.82 * h + 0.33 * h + bob, p.z, 0.44 * S, 0.66 * h, 0.26 * S, p.ry);
      put("head", q, p.x, y0 + 1.62 * h + bob, p.z, 0.17 * S, 0.2 * S, 0.17 * S, p.ry);
      put("hair", q, p.x - s * 0.02 * S, y0 + 1.7 * h + bob, p.z - c * 0.02 * S, 0.18 * S, 0.13 * S, 0.18 * S, p.ry);
      if (p.hairStyle) {
        // 中長髮到下巴、長髮到背中間
        const L = p.hairStyle === 2 ? 0.55 : 0.3;
        put("hairB", q, p.x - s * 0.1 * S, y0 + 1.72 * h - (L * h) / 2 + bob, p.z - c * 0.1 * S, 0.36 * S, L * h, 0.13 * S, p.ry);
      } else off("hairB", q, p.x, p.z);
      if (p.skirt) put("skirt", q, p.x, y0 + 0.62 * h + bob, p.z, 0.27 * S, 0.42 * h, 0.24 * S, p.ry);
      else off("skirt", q, p.x, p.z);
      if (p.bag) put("bag", q, p.x - s * 0.2 * S, y0 + 1.15 * h + bob, p.z - c * 0.2 * S, 0.34 * S, 0.4 * S, 0.16 * S, p.ry);
      else off("bag", q, p.x, p.z);
    });
    NAMES.forEach((k) => (IM[k].instanceMatrix.needsUpdate = true));
  };
  return { people, add, finalize, draw, loops, loopLen };
}
