/* ============================================================
   Globe Network Viz — canvas, live-animated
   Rotating Earth (orthographic projection) centered on Europe.
   Country outlines, glowing capital nodes, animated arcs between
   European cities rendered as great-circle-ish paths projected
   onto the sphere (culled when on far side).
   ============================================================ */

// Simplified world land polygons [lon, lat] — focused on Europe + neighbours
// Other continents are sketched lightly to give globe context.
const WORLD_POLYS = [
  // ---- Europe (detailed) ----
  // France
  [[-4.5,48.4],[-1.5,48.7],[1.6,50.9],[3.1,50.8],[5.7,49.5],[7.6,49.0],[8.2,48.9],[7.8,47.5],[6.8,47.1],[7.0,45.9],[7.6,43.8],[4.8,43.4],[3.1,42.4],[0.7,42.7],[-1.9,43.4],[-1.5,44.3],[-1.1,46.0],[-2.2,47.2],[-4.7,47.8],[-4.5,48.4]],
  // Iberia (Spain + Portugal merged loosely)
  [[-9.5,43.8],[-8.2,43.7],[-3.8,43.5],[-1.8,43.3],[0.7,42.7],[3.3,41.9],[0.2,40.5],[-0.3,39.5],[-1.6,38.7],[-2.8,36.7],[-5.1,36.0],[-6.4,36.2],[-7.4,37.2],[-8.9,36.9],[-9.5,38.5],[-9.0,40.1],[-8.9,42.0],[-9.5,43.8]],
  // UK
  [[-5.1,58.6],[-3.3,58.6],[-1.7,57.8],[-2.1,56.6],[-1.4,54.6],[0.5,53.3],[1.6,52.8],[1.3,51.3],[-0.1,50.8],[-3.5,50.6],[-5.2,50.1],[-4.3,51.6],[-5.0,53.0],[-4.7,54.8],[-4.9,55.6],[-5.6,56.6],[-5.9,57.6],[-5.1,58.6]],
  // Ireland
  [[-10.0,54.2],[-7.3,55.4],[-6.0,55.0],[-6.1,54.1],[-5.3,53.4],[-6.2,52.2],[-6.9,51.5],[-9.9,51.5],[-10.4,52.3],[-9.9,53.9],[-10.0,54.2]],
  // Benelux cluster (NL + BE)
  [[2.5,51.1],[4.4,51.4],[4.5,52.3],[5.9,53.4],[7.0,53.4],[7.1,52.3],[6.4,50.3],[5.7,49.5],[4.8,49.8],[4.1,50.3],[2.5,50.7],[2.5,51.1]],
  // Germany
  [[7.1,53.4],[8.7,54.0],[10.9,54.4],[14.1,53.7],[14.4,52.9],[14.8,52.1],[14.6,51.0],[15.0,50.3],[12.5,50.2],[13.0,49.3],[12.8,48.7],[13.8,48.6],[12.7,47.7],[10.5,47.5],[7.6,47.6],[7.6,48.9],[8.2,49.0],[6.4,49.2],[6.4,50.3],[7.0,53.4],[7.1,53.4]],
  // Italy
  [[7.6,43.8],[7.9,43.8],[8.4,44.2],[9.2,44.4],[10.2,44.0],[12.4,44.0],[13.7,45.6],[13.6,45.8],[12.3,45.8],[10.4,45.9],[8.6,46.4],[6.8,45.9],[7.0,45.0],[7.6,43.8]],
  // Alpine (CH + AT merged rough)
  [[6.1,46.2],[7.0,45.9],[8.6,46.4],[9.5,46.9],[10.5,46.9],[12.4,46.8],[13.9,46.5],[15.0,46.6],[16.5,46.8],[16.9,48.0],[15.0,48.9],[13.8,48.6],[12.7,47.7],[10.5,47.5],[9.5,46.9],[8.6,47.8],[7.6,47.6],[7.0,47.1],[6.1,46.2]],
  // Poland
  [[14.1,53.7],[16.3,54.4],[19.5,54.4],[23.0,54.3],[23.6,52.7],[24.0,50.9],[22.6,49.4],[19.4,49.5],[17.6,50.0],[15.0,50.3],[14.6,51.0],[14.8,52.1],[14.4,52.9],[14.1,53.7]],
  // Czech + Slovak + Hungary
  [[12.5,50.2],[15.0,50.3],[17.6,50.0],[18.3,49.6],[19.4,49.5],[22.6,49.4],[22.1,48.4],[20.5,48.5],[22.1,47.3],[20.8,46.2],[18.9,45.9],[17.5,45.9],[16.5,46.8],[16.9,48.0],[15.0,48.9],[13.8,48.6],[12.8,48.7],[12.5,50.2]],
  // Denmark
  [[8.1,54.9],[10.0,54.8],[11.0,55.1],[12.3,56.1],[10.9,57.7],[8.1,56.7],[8.1,54.9]],
  // Norway
  [[5.0,58.2],[5.6,59.3],[8.5,58.3],[10.5,59.1],[11.6,60.0],[11.9,61.6],[13.7,64.0],[14.0,66.1],[17.0,68.0],[19.9,69.0],[23.7,70.1],[27.5,70.9],[30.2,70.0],[28.2,71.1],[24.9,68.6],[22.0,66.1],[18.1,64.0],[14.7,61.5],[11.9,59.6],[7.0,58.0],[5.0,58.2]],
  // Sweden
  [[11.2,59.0],[12.3,56.1],[14.2,55.4],[16.3,56.2],[18.7,59.5],[19.1,61.6],[21.9,64.7],[23.6,66.5],[22.2,68.4],[20.6,69.1],[18.1,68.6],[17.0,68.0],[13.7,64.0],[12.6,63.8],[13.7,61.6],[11.9,61.6],[11.6,60.0],[11.2,59.0]],
  // Finland
  [[22.2,68.4],[23.6,66.5],[21.9,64.7],[21.5,63.0],[22.5,60.8],[26.3,60.4],[28.0,60.5],[29.0,61.3],[31.5,62.9],[30.1,65.7],[29.0,69.1],[27.5,69.9],[23.7,70.1],[22.2,68.4]],
  // Greece (mainland)
  [[20.6,41.9],[22.5,41.5],[24.5,41.6],[26.1,41.5],[26.6,40.5],[26.3,40.0],[23.6,40.4],[23.4,39.3],[22.0,38.8],[23.7,37.9],[22.3,37.3],[22.9,36.4],[20.7,38.3],[19.9,40.0],[20.6,41.9]],
  // Balkans rough
  [[13.6,45.8],[15.2,45.5],[16.2,46.2],[17.5,45.9],[18.9,45.9],[20.8,46.2],[21.4,45.0],[22.7,44.2],[22.3,42.3],[22.5,41.5],[20.6,41.9],[19.9,40.0],[19.4,40.7],[19.3,42.2],[18.4,42.6],[16.0,43.5],[15.2,44.2],[13.6,45.8]],
  // Romania + Bulgaria
  [[20.8,46.2],[22.1,47.3],[26.6,48.3],[28.2,45.5],[28.8,44.4],[28.5,43.7],[28.0,42.0],[27.0,42.0],[26.1,41.5],[24.5,41.6],[22.5,41.5],[22.3,42.3],[22.7,44.2],[21.4,45.0],[20.8,46.2]],
  // ---- Rough context outlines (less detail) ----
  // Russia / Western
  [[24.0,50.9],[27.5,55.0],[30.0,58.5],[35.0,61.0],[40.0,63.0],[45.0,64.0],[50.0,65.0],[60.0,66.0],[68.0,67.0],[75.0,68.0],[80.0,68.0],[85.0,69.0],[95.0,69.0],[105.0,70.0],[120.0,71.5],[140.0,72.0],[155.0,71.0],[170.0,68.0],[160.0,60.0],[140.0,55.0],[135.0,45.0],[128.0,42.0],[120.0,42.0],[110.0,42.0],[95.0,48.0],[85.0,50.0],[75.0,52.0],[60.0,54.0],[50.0,52.0],[42.0,48.0],[38.0,45.0],[40.0,52.0],[32.0,51.0],[28.0,52.0],[23.6,52.7],[24.0,50.9]],
  // Turkey + Caucasus rough
  [[26.3,40.0],[28.0,41.0],[32.0,42.0],[36.0,41.5],[41.0,41.0],[43.0,41.0],[44.5,40.0],[45.0,39.0],[44.0,37.0],[42.0,37.0],[37.5,36.8],[34.0,36.5],[31.0,36.8],[28.5,36.8],[27.2,37.0],[26.6,38.5],[26.6,40.5],[26.3,40.0]],
  // North Africa top-edge: Morocco + Algeria + Tunisia + Libya + Egypt coast
  [[-9.8,35.7],[-5.5,35.8],[-2.0,35.3],[1.0,36.5],[3.5,36.8],[7.5,37.0],[10.0,36.9],[11.0,34.0],[15.0,32.0],[20.0,31.5],[25.0,31.5],[30.0,31.2],[34.0,31.5],[33.0,30.0],[30.0,28.0],[25.0,28.0],[20.0,26.0],[15.0,27.0],[10.0,29.0],[5.0,31.0],[0.0,32.0],[-5.0,32.0],[-9.5,30.0],[-13.0,27.0],[-12.0,32.0],[-9.8,35.7]],
  // Greenland tip (context)
  [[-45.0,60.0],[-30.0,60.5],[-20.0,65.0],[-22.0,70.0],[-25.0,75.0],[-35.0,78.0],[-50.0,78.0],[-55.0,72.0],[-52.0,65.0],[-45.0,60.0]],
  // Iceland
  [[-24.0,63.4],[-22.0,63.6],[-18.0,63.3],[-14.0,64.3],[-13.5,65.5],[-17.0,66.5],[-22.0,66.2],[-24.5,65.6],[-24.0,63.4]],
  // Svalbard rough (optional)
  [[10.0,77.0],[18.0,77.5],[28.0,79.5],[25.0,81.0],[12.0,80.0],[10.0,77.0]],
  // ---- Americas east coast + Africa west for flavor ----
  [[-55.0,60.0],[-50.0,55.0],[-55.0,50.0],[-65.0,45.0],[-70.0,42.0],[-75.0,35.0],[-80.0,27.0],[-82.0,24.0],[-80.0,25.0],[-78.0,30.0],[-75.0,35.0],[-70.0,40.0],[-66.0,44.0],[-60.0,47.0],[-55.0,50.0],[-55.0,60.0]],
  [[-17.0,15.0],[-15.0,12.0],[-13.0,10.0],[-9.0,6.0],[-5.0,5.0],[0.0,5.5],[5.0,4.0],[9.5,4.0],[9.5,2.0],[11.0,-1.0],[13.0,-4.0],[13.0,-8.0],[13.0,-15.0],[14.0,-22.0],[17.0,-28.0],[17.0,-33.0],[19.0,-35.0],[22.0,-35.0],[28.0,-33.0],[32.0,-30.0],[35.0,-25.0],[40.0,-18.0],[40.0,-10.0],[39.0,-5.0],[41.0,0.0],[44.0,10.0],[51.0,12.0],[48.0,12.0],[44.0,12.0],[43.0,14.0],[38.0,15.0],[36.0,22.0],[34.0,28.0],[32.0,30.0],[25.0,32.0],[15.0,32.0],[10.0,35.0],[0.0,35.0],[-8.0,32.0],[-15.0,25.0],[-17.0,20.0],[-17.0,15.0]],
];

class NetworkViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({
      accent: '#7EE787',
      blue: '#6BB3FF',
      text: 'rgba(144,150,160,0.8)',
      ocean: '#0E1013',
      oceanEdge: 'rgba(126, 231, 135, 0.12)',
      land: 'rgba(126, 231, 135, 0.06)',
      landStroke: 'rgba(126, 231, 135, 0.28)',
      graticule: 'rgba(255,255,255,0.035)',
      glow: 'rgba(126, 231, 135, 0.18)',
      packetRate: 0.045,
      // Camera: centered on Europe, slight tilt
      lon0: 10,
      lat0: 48,
      rotSpeed: 0.018,  // deg / frame — slow, calm
    }, opts);
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.packets = [];
    this.t = 0;

    this.cities = [
      ['PARIS',      2.35, 48.85, 'hub'],
      ['LONDON',    -0.12, 51.51, 'hub'],
      ['BERLIN',    13.40, 52.52, 'hub'],
      ['AMSTERDAM',  4.89, 52.37, 'hub'],
      ['FRANKFURT',  8.68, 50.11, 'hub'],
      ['MADRID',    -3.70, 40.42, 'node'],
      ['BARCELONA',  2.17, 41.39, 'node'],
      ['LISBON',    -9.14, 38.72, 'node'],
      ['DUBLIN',    -6.26, 53.35, 'node'],
      ['BRUSSELS',   4.35, 50.85, 'node'],
      ['MILAN',      9.19, 45.46, 'node'],
      ['ROME',      12.49, 41.90, 'node'],
      ['ZURICH',     8.55, 47.37, 'node'],
      ['VIENNA',    16.37, 48.21, 'node'],
      ['PRAGUE',    14.42, 50.08, 'node'],
      ['WARSAW',    21.01, 52.23, 'node'],
      ['COPENHAGEN',12.57, 55.68, 'node'],
      ['STOCKHOLM', 18.07, 59.33, 'node'],
      ['OSLO',      10.75, 59.91, 'node'],
      ['HELSINKI',  24.94, 60.17, 'node'],
      ['BUDAPEST',  19.04, 47.50, 'node'],
      ['BUCHAREST', 26.10, 44.43, 'node'],
      ['ATHENS',    23.73, 37.98, 'node'],
      ['LYON',       4.84, 45.76, 'node'],
      ['MARSEILLE',  5.37, 43.30, 'node'],
      ['HAMBURG',    9.99, 53.55, 'node'],
      ['MUNICH',    11.58, 48.14, 'node'],
    ];

    this.rotLon = this.opts.lon0;
    this.lat0 = this.opts.lat0;

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
    requestAnimationFrame(this.loop);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.cx = this.w / 2;
    this.cy = this.h / 2;
    this.R = Math.min(this.w, this.h) * 0.44;
  }

  // Orthographic projection.
  // Returns { x, y, visible } — visible=false when point is on far side.
  project(lon, lat) {
    const lam = (lon - this.rotLon) * Math.PI / 180;
    const phi = lat * Math.PI / 180;
    const phi0 = this.lat0 * Math.PI / 180;
    const cosC = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lam);
    const visible = cosC >= 0;
    const x = this.cx + this.R * Math.cos(phi) * Math.sin(lam);
    const y = this.cy - this.R * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lam));
    return { x, y, visible, z: cosC };
  }

  drawOcean() {
    const ctx = this.ctx;
    // Soft radial gradient behind globe
    const grad = ctx.createRadialGradient(this.cx, this.cy, this.R * 0.2, this.cx, this.cy, this.R * 1.15);
    grad.addColorStop(0, '#10141A');
    grad.addColorStop(0.7, '#0B0B0C');
    grad.addColorStop(1, '#07080A');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.R * 1.12, 0, Math.PI * 2);
    ctx.fill();

    // Globe disk
    const oceanGrad = ctx.createRadialGradient(this.cx - this.R * 0.3, this.cy - this.R * 0.3, this.R * 0.2, this.cx, this.cy, this.R);
    oceanGrad.addColorStop(0, '#141A22');
    oceanGrad.addColorStop(1, '#0A0D12');
    ctx.fillStyle = oceanGrad;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.R, 0, Math.PI * 2);
    ctx.fill();

    // Rim
    ctx.strokeStyle = this.opts.oceanEdge;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.R, 0, Math.PI * 2);
    ctx.stroke();

    // Outer glow
    const glow = ctx.createRadialGradient(this.cx, this.cy, this.R, this.cx, this.cy, this.R * 1.18);
    glow.addColorStop(0, 'rgba(126,231,135,0.10)');
    glow.addColorStop(1, 'rgba(126,231,135,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.R * 1.18, 0, Math.PI * 2);
    ctx.fill();
  }

  drawGraticule() {
    const ctx = this.ctx;
    ctx.strokeStyle = this.opts.graticule;
    ctx.lineWidth = 1;
    // Meridians every 15°
    for (let lon = -180; lon < 180; lon += 15) {
      ctx.beginPath();
      let drew = false;
      for (let lat = -80; lat <= 80; lat += 4) {
        const p = this.project(lon, lat);
        if (!p.visible) { drew = false; continue; }
        if (!drew) { ctx.moveTo(p.x, p.y); drew = true; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    // Parallels every 15°
    for (let lat = -75; lat <= 75; lat += 15) {
      ctx.beginPath();
      let drew = false;
      for (let lon = -180; lon <= 180; lon += 4) {
        const p = this.project(lon, lat);
        if (!p.visible) { drew = false; continue; }
        if (!drew) { ctx.moveTo(p.x, p.y); drew = true; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }

  drawLand() {
    const ctx = this.ctx;
    ctx.fillStyle = this.opts.land;
    ctx.strokeStyle = this.opts.landStroke;
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    for (const poly of WORLD_POLYS) {
      // Project + split on visibility
      const segs = [];
      let cur = [];
      for (const [lon, lat] of poly) {
        const p = this.project(lon, lat);
        if (p.visible) cur.push([p.x, p.y]);
        else if (cur.length) { segs.push(cur); cur = []; }
      }
      if (cur.length) segs.push(cur);
      for (const seg of segs) {
        if (seg.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(seg[0][0], seg[0][1]);
        for (let i = 1; i < seg.length; i++) ctx.lineTo(seg[i][0], seg[i][1]);
        // Only close/fill if the whole polygon was visible (roughly)
        if (seg.length === poly.length) { ctx.closePath(); ctx.fill(); }
        ctx.stroke();
      }
    }
  }

  drawCities() {
    const ctx = this.ctx;
    this.cityProj = this.cities.map(c => ({ name: c[0], lon: c[1], lat: c[2], tier: c[3], proj: this.project(c[1], c[2]), phase: (this._phases ||= {})[c[0]] ??= Math.random() * Math.PI * 2 }));
    for (const c of this.cityProj) {
      if (!c.proj.visible) continue;
      this._phases[c.name] += 0.02;
      const phase = this._phases[c.name];
      const isHub = c.tier === 'hub';
      const baseR = isHub ? 3.3 : 1.8;
      const pulse = 0.5 + Math.sin(phase) * 0.5;

      if (isHub) {
        const ringR = baseR + 3 + pulse * 10;
        ctx.strokeStyle = `rgba(126, 231, 135, ${0.35 * (1 - pulse)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(c.proj.x, c.proj.y, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = isHub ? this.opts.accent : 'rgba(126, 231, 135, 0.85)';
      ctx.shadowBlur = isHub ? 14 : 6;
      ctx.shadowColor = this.opts.accent;
      ctx.beginPath();
      ctx.arc(c.proj.x, c.proj.y, baseR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (isHub) {
        ctx.fillStyle = this.opts.text;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(c.name, c.proj.x + 7, c.proj.y + 3);
      }
    }
  }

  spawnPacket() {
    if (this.cities.length < 2) return;
    const hubs = this.cities.filter(c => c[3] === 'hub');
    const from = (Math.random() < 0.7 ? hubs : this.cities);
    const a = from[Math.floor(Math.random() * from.length)];
    let b = this.cities[Math.floor(Math.random() * this.cities.length)];
    let tries = 0;
    while (b === a && tries++ < 5) b = this.cities[Math.floor(Math.random() * this.cities.length)];
    if (a === b) return;

    this.packets.push({
      aLon: a[1], aLat: a[2],
      bLon: b[1], bLat: b[2],
      progress: 0,
      speed: 0.004 + Math.random() * 0.004,
      color: Math.random() > 0.7 ? this.opts.blue : this.opts.accent,
    });
  }

  // Slerp along the great circle between two points on the sphere (unit sphere),
  // then project to 2D. Used for arc trail rendering.
  // Returns { x, y, visible, z } for given t in [0,1].
  arcPoint(aLon, aLat, bLon, bLat, t) {
    // Convert to unit vectors
    const toVec = (lon, lat) => {
      const lam = lon * Math.PI / 180, phi = lat * Math.PI / 180;
      return [Math.cos(phi) * Math.cos(lam), Math.cos(phi) * Math.sin(lam), Math.sin(phi)];
    };
    const a = toVec(aLon, aLat), b = toVec(bLon, bLat);
    const dot = Math.max(-1, Math.min(1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2]));
    const omega = Math.acos(dot);
    if (omega < 1e-6) {
      // degenerate, just return a
      return this.project(aLon, aLat);
    }
    const sinO = Math.sin(omega);
    const k1 = Math.sin((1 - t) * omega) / sinO;
    const k2 = Math.sin(t * omega) / sinO;
    const v = [k1 * a[0] + k2 * b[0], k1 * a[1] + k2 * b[1], k1 * a[2] + k2 * b[2]];
    // back to lon/lat (normalise)
    const len = Math.hypot(v[0], v[1], v[2]) || 1;
    const nx = v[0] / len, ny = v[1] / len, nz = v[2] / len;
    const lat = Math.asin(nz) * 180 / Math.PI;
    const lon = Math.atan2(ny, nx) * 180 / Math.PI;
    // Add a slight "lift" by scaling outward — fake altitude curve that makes
    // visible arcs look like they bulge off the surface.
    const p = this.project(lon, lat);
    // Bulge: boost away from globe center by up to ~8%, bell-shaped over t
    const bulge = 1 + 0.08 * Math.sin(Math.PI * t);
    return {
      x: this.cx + (p.x - this.cx) * bulge,
      y: this.cy + (p.y - this.cy) * bulge,
      visible: p.visible,
      z: p.z,
    };
  }

  drawPackets() {
    const ctx = this.ctx;
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      p.progress += p.speed;
      if (p.progress >= 1) { this.packets.splice(i, 1); continue; }

      // Draw faint full path (only visible segment) behind packet
      ctx.strokeStyle = p.color + '22';
      ctx.lineWidth = 1;
      ctx.beginPath();
      let drew = false;
      for (let k = 0; k <= 30; k++) {
        const pt = this.arcPoint(p.aLon, p.aLat, p.bLon, p.bLat, k / 30);
        if (!pt.visible) { drew = false; continue; }
        if (!drew) { ctx.moveTo(pt.x, pt.y); drew = true; }
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Trail
      const segs = 14;
      for (let k = 0; k < segs; k++) {
        const tt = Math.max(0, p.progress - k * 0.025);
        const pt = this.arcPoint(p.aLon, p.aLat, p.bLon, p.bLat, tt);
        if (!pt.visible) continue;
        const alpha = (1 - k / segs) * 0.9;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.8 - k * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Head
      const head = this.arcPoint(p.aLon, p.aLat, p.bLon, p.bLat, p.progress);
      if (head.visible) {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  drawHud() {
    const ctx = this.ctx;
    ctx.fillStyle = this.opts.text;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('EU GRID · LIVE', 10, 14);
    ctx.textAlign = 'right';
    const visible = (this.cityProj || []).filter(c => c.proj.visible).length;
    ctx.fillText(`${visible}/${this.cities.length} NODES · ${this.packets.length} IN-FLIGHT`, this.w - 10, this.h - 8);
  }

  loop() {
    this.t++;
    this.rotLon += this.opts.rotSpeed;
    if (this.rotLon > 360) this.rotLon -= 360;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    this.drawOcean();
    this.drawGraticule();
    this.drawLand();
    if (Math.random() < this.opts.packetRate) this.spawnPacket();
    this.drawPackets();
    this.drawCities();
    this.drawHud();
    requestAnimationFrame(this.loop);
  }
}

window.NetworkViz = NetworkViz;
