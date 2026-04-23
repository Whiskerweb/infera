// Infera — 3D globe (three.js) for hero
// Cobe-style: near-black sphere, crisp small green dots, minimal.

(function(){
const canvas = document.getElementById('globeStage');
if (canvas && window.THREE) boot(canvas);
else if (canvas) window.addEventListener('load', () => window.THREE && boot(canvas));

async function boot(canvas) {
  const mask = await loadMask();
  bootGlobe(canvas, mask);
}

async function loadMask() {
  const urls = [
    'https://unpkg.com/three-globe@2.31.0/example/img/earth-dark.jpg',
    'https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-dark.jpg',
  ];
  for (const url of urls) {
    try {
      const img = await loadImage(url);
      const W = 1024, H = 512;
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, W, H);
      return { kind: 'image', img: ctx.getImageData(0, 0, W, H) };
    } catch(e) {}
  }
  return { kind: 'poly', img: buildPolygonMask() };
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = url;
  });
}

function sampleIsLand(mask, u, v) {
  const img = mask.img;
  const x = Math.max(0, Math.min(img.width - 1, Math.floor(u * img.width)));
  const y = Math.max(0, Math.min(img.height - 1, Math.floor(v * img.height)));
  const i = (y * img.width + x) * 4;
  if (mask.kind === 'image') {
    const r = img.data[i], g = img.data[i+1], b = img.data[i+2];
    return (0.2126*r + 0.7152*g + 0.0722*b) > 28;
  }
  return img.data[i] > 128;
}

function bootGlobe(canvas, mask) {
  const parent = canvas.parentElement;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
  scene.add(camera);

  // Globe root — offset to the right so it sits behind the telemetry card
  const root = new THREE.Group();
  root.rotation.y = (-15 * Math.PI) / 180;
  root.rotation.x = (-28 * Math.PI) / 180;
  root.rotation.z = -0.05;
  scene.add(root);

  const R = 1.0;

  // --- Base sphere: near-black with a hint of green at the limb ---
  const baseGeo = new THREE.SphereGeometry(R * 0.997, 96, 96);
  const baseMat = new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: new THREE.Color(0x040505) },
      uEdge: { value: new THREE.Color(0x0A1A10) },
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uBase;
      uniform vec3 uEdge;
      varying vec3 vNormal;
      void main() {
        float f = clamp(dot(vNormal, vec3(0.0,0.0,1.0)), 0.0, 1.0);
        vec3 col = mix(uEdge, uBase, pow(f, 1.2));
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  root.add(new THREE.Mesh(baseGeo, baseMat));

  // --- Dots (Fibonacci sphere sampled against land mask) ---
  const landPos = [];
  const landInt = [];
  const N = 9000;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const y = 1 - 2 * t;
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const lat = Math.asin(y);
    const lon = Math.atan2(z, x);
    const u = (lon + Math.PI) / (2 * Math.PI);
    const v = 1 - (lat + Math.PI / 2) / Math.PI;
    if (sampleIsLand(mask, u, v)) {
      landPos.push(x * R * 1.003, y * R * 1.003, z * R * 1.003);
      const latD = lat * 180 / Math.PI;
      const lonD = lon * 180 / Math.PI;
      const isEurope = (latD > 35 && latD < 72) && (lonD > -12 && lonD < 42);
      landInt.push(isEurope ? 1.0 : 0.5);
    }
  }

  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(landPos, 3));
  dotGeo.setAttribute('aIntensity', new THREE.Float32BufferAttribute(landInt, 1));

  const dotMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uSize:   { value: 2.2 * dpr },                   // crisp ~2.2px * dpr
      uColor:  { value: new THREE.Color(0x5aa372) },   // muted green land
      uAccent: { value: new THREE.Color(0x7EE787) },   // Europe accent
    },
    vertexShader: `
      attribute float aIntensity;
      varying float vIntensity;
      varying float vFacing;
      uniform float uSize;
      void main() {
        vIntensity = aIntensity;
        vec3 worldNormal = normalize(mat3(modelMatrix) * normalize(position));
        vec3 toCam = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
        vFacing = max(dot(worldNormal, toCam), 0.0);
        gl_PointSize = uSize;                           // FIXED pixel size (no distance blow-up)
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uAccent;
      varying float vIntensity;
      varying float vFacing;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        // crisper disk with light AA
        float a = 1.0 - smoothstep(0.38, 0.5, d);
        vec3 col = mix(uColor, uAccent, step(0.9, vIntensity));
        // hide back of sphere
        float face = smoothstep(0.05, 0.35, vFacing);
        gl_FragColor = vec4(col, a * face);
      }
    `
  });
  root.add(new THREE.Points(dotGeo, dotMat));

  // --- Soft green rim halo ---
  const rimGeo = new THREE.SphereGeometry(R * 1.045, 64, 64);
  const rimMat = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(0x7EE787) } },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.80 - dot(vNormal, vec3(0.0,0.0,1.0)), 3.5);
        gl_FragColor = vec4(uColor, 1.0) * intensity * 0.32;
      }
    `
  });
  root.add(new THREE.Mesh(rimGeo, rimMat));

  // --- Cities: EU hubs (primary) + worldwide endpoints ---
  const CITIES = [
    // EU hubs (pulsing rings) — lat, lon, code, isHub
    [48.8566,   2.3522, 'PAR', true],
    [52.5200,  13.4050, 'BER', true],
    [51.5074,  -0.1278, 'LON', true],
    [52.3676,   4.9041, 'AMS', true],
    [50.1109,   8.6821, 'FRA', true],
    // EU secondary
    [41.9028,  12.4964, 'ROM', false],
    [40.4168,  -3.7038, 'MAD', false],
    [59.3293,  18.0686, 'STO', false],
    [55.6761,  12.5683, 'COP', false],
    [47.3769,   8.5417, 'ZRH', false],
    [48.2082,  16.3738, 'VIE', false],
    [45.4642,   9.1900, 'MIL', false],
    [41.3851,   2.1734, 'BCN', false],
    [45.7640,   4.8357, 'LYO', false],
    [60.1699,  24.9384, 'HEL', false],
    [59.9139,  10.7522, 'OSL', false],
    [38.7223,  -9.1393, 'LIS', false],
    [53.3498,  -6.2603, 'DUB', false],
    [52.2297,  21.0122, 'WAW', false],
    [50.0755,  14.4378, 'PRG', false],
    [37.9838,  23.7275, 'ATH', false],
    // North America
    [40.7128, -74.0060, 'NYC', false],
    [37.7749,-122.4194, 'SFO', false],
    [43.6532, -79.3832, 'TOR', false],
    [47.6062,-122.3321, 'SEA', false],
    [34.0522,-118.2437, 'LAX', false],
    // South America
    [-23.5505,-46.6333, 'SAO', false],
    [-34.6037,-58.3816, 'BUE', false],
    [  4.7110,-74.0721, 'BOG', false],
    // Africa
    [ 30.0444, 31.2357, 'CAI', false],
    [  6.5244,  3.3792, 'LAG', false],
    [-26.2041, 28.0473, 'JHB', false],
    [ 33.5731, -7.5898, 'CAS', false],
    [ 36.8065, 10.1815, 'TUN', false],
    // Middle East
    [ 25.2048, 55.2708, 'DXB', false],
    [ 32.0853, 34.7818, 'TLV', false],
    [ 41.0082, 28.9784, 'IST', false],
    // Asia
    [ 35.6762,139.6503, 'TYO', false],
    [ 37.5665,126.9780, 'SEL', false],
    [  1.3521,103.8198, 'SIN', false],
    [ 19.0760, 72.8777, 'BOM', false],
    [ 28.7041, 77.1025, 'DEL', false],
    [ 39.9042,116.4074, 'BJS', false],
    [ 31.2304,121.4737, 'SHA', false],
    [ 22.3193,114.1694, 'HKG', false],
    [ 13.7563,100.5018, 'BKK', false],
    // Oceania
    [-33.8688,151.2093, 'SYD', false],
    [-37.8136,144.9631, 'MEL', false],
  ];

  function llToVec3(lat, lon, rad = R) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon) * Math.PI / 180;
    return new THREE.Vector3(
      -rad * Math.sin(phi) * Math.cos(theta),
       rad * Math.cos(phi),
       rad * Math.sin(phi) * Math.sin(theta)
    );
  }

  const cityGroup = new THREE.Group();
  root.add(cityGroup);
  const cityVecs = [];

  CITIES.forEach(([lat, lon, label, isHub]) => {
    const v = llToVec3(lat, lon, R * 1.008);
    cityVecs.push(v);
    if (isHub) {
      const ringGeo = new THREE.RingGeometry(0.018, 0.022, 40);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x7EE787,
        transparent: true, opacity: 0.6, side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(v);
      ring.lookAt(0,0,0);
      ring.userData = { baseOp: 0.6, t: Math.random()*Math.PI*2, speed: 0.7 + Math.random()*0.4 };
      cityGroup.add(ring);
    }
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(isHub ? 0.010 : 0.005, 12, 12),
      new THREE.MeshBasicMaterial({
        color: isHub ? 0xB5F5B9 : 0x7EE787,
        transparent: true, opacity: isHub ? 1 : 0.85
      })
    );
    core.position.copy(v);
    cityGroup.add(core);
  });

  // --- Arcs ---
  const arcsGroup = new THREE.Group();
  root.add(arcsGroup);

  function makeArc(start, end, color = 0x7EE787) {
    const dist = start.distanceTo(end);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const lift = R + dist * 0.55;
    mid.normalize().multiplyScalar(lift);

    const curve = new THREE.QuadraticBezierCurve3(start.clone(), mid, end.clone());

    // Thin tube: visible but understated
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.0028, 6, false);
    const tubeMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uColor:    { value: new THREE.Color(color) },
        uProgress: { value: 0 },
        uLife:     { value: 0 },
      },
      vertexShader: `
        varying float vT;
        void main() {
          // u of the tube UV runs along the length; use it as progress
          vT = uv.x;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uProgress;
        uniform float uLife;
        varying float vT;
        void main() {
          float head = 1.0 - smoothstep(uProgress - 0.02, uProgress + 0.02, vT);
          float tail = smoothstep(uProgress - 0.55, uProgress, vT);
          float visible = head * tail;
          float bodyFade = sin(vT * 3.14159);
          gl_FragColor = vec4(uColor, visible * bodyFade * uLife * 0.55);
        }
      `
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);

    // Subtle leading "packet"
    const headMat = new THREE.MeshBasicMaterial({
      color: 0x7EE787, transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.009, 10, 10), headMat);
    tube.add(head);

    tube.userData = {
      mat: tubeMat, headMat, head, curve,
      born: performance.now(),
      duration: 1500 + Math.random()*700,
    };
    return tube;
  }

  const activeArcs = [];
  // 80% of arcs start from an EU hub (outbound from sovereign grid),
  // 20% are intra-global to populate the other side of the planet.
  function spawnArc() {
    const hubs = cityVecs.slice(0, 5); // EU primary hubs
    const fromHub = Math.random() < 0.8;
    const a = fromHub
      ? hubs[Math.floor(Math.random()*hubs.length)]
      : cityVecs[5 + Math.floor(Math.random() * (cityVecs.length - 5))];
    let b;
    do { b = cityVecs[Math.floor(Math.random()*cityVecs.length)]; }
    while (b === a);
    const arc = makeArc(a, b);
    arcsGroup.add(arc);
    activeArcs.push(arc);
  }
  // Seed a modest set of arcs already in flight
  for (let i = 0; i < 5; i++) {
    const fromHub = Math.random() < 0.7;
    const a = fromHub
      ? cityVecs[Math.floor(Math.random()*5)]
      : cityVecs[5 + Math.floor(Math.random() * (cityVecs.length - 5))];
    let b;
    do { b = cityVecs[Math.floor(Math.random()*cityVecs.length)]; }
    while (b === a);
    const arc = makeArc(a, b);
    arc.userData.born = performance.now() - Math.random() * arc.userData.duration;
    arcsGroup.add(arc);
    activeArcs.push(arc);
  }

  let arcTimer = 0;

  // --- Resize: fit sphere to a sensible portion of the canvas, offset right ---
  function resize() {
    const r = parent.getBoundingClientRect();
    const w = Math.max(320, r.width);
    const h = Math.max(320, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;

    // Frame the globe so it occupies ~70% of the shorter dimension
    const targetFrac = 0.68;
    const minDim = Math.min(w, h);
    const worldSize = (R * 2) * (Math.max(w, h) / minDim) / targetFrac;
    // solve camera distance for current vFOV
    const vfov = camera.fov * Math.PI / 180;
    const distV = (R / targetFrac) / Math.tan(vfov / 2);
    // horizontal constraint
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    const distH = (R / targetFrac) / Math.tan(hfov / 2);
    const dist = Math.max(distV, distH);
    camera.position.set(0, 0.05, dist);

    // Offset sphere to the right ~20% of half-width (but clamped on narrow)
    const aspect = w / h;
    const xOffset = aspect > 1.2 ? R * 0.9 : 0;
    root.position.set(xOffset, 0, 0);

    camera.lookAt(xOffset, 0, 0);
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(parent);

  let last = performance.now();
  let autoRot = 0.035;

  function frame(now) {
    const dt = Math.min(50, now - last) / 1000;
    last = now;

    root.rotation.y += autoRot * dt;

    cityGroup.children.forEach(child => {
      if (child.userData && child.userData.speed) {
        child.userData.t += dt * child.userData.speed;
        const s = 1 + 0.35 * Math.sin(child.userData.t);
        child.scale.setScalar(s);
        child.material.opacity = child.userData.baseOp * (0.55 + 0.45 * (0.5 + 0.5*Math.sin(child.userData.t)));
      }
    });

    arcTimer -= dt;
    if (arcTimer <= 0 && activeArcs.length < 10) {
      spawnArc();
      arcTimer = 0.55 + Math.random() * 0.7;
    }

    for (let i = activeArcs.length - 1; i >= 0; i--) {
      const arc = activeArcs[i];
      const age = now - arc.userData.born;
      const prog = age / arc.userData.duration;
      const life = prog < 0.12 ? (prog/0.12)
                 : prog > 0.9  ? (1 - (prog-0.9)/0.1)
                 : 1;
      arc.userData.mat.uniforms.uProgress.value = Math.min(1.15, prog * 1.15);
      arc.userData.mat.uniforms.uLife.value = Math.max(0, life);
      // Move the bright packet head along the curve
      if (arc.userData.head && prog >= 0 && prog <= 1) {
        const p = arc.userData.curve.getPoint(Math.min(0.999, Math.max(0, prog)));
        arc.userData.head.position.copy(p);
        arc.userData.headMat.opacity = life;
      }
      if (prog >= 1.05) {
        arcsGroup.remove(arc);
        arc.geometry.dispose();
        arc.material.dispose();
        arc.userData.head.geometry.dispose();
        arc.userData.headMat.dispose();
        activeArcs.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  document.addEventListener('visibilitychange', () => {
    autoRot = document.hidden ? 0 : 0.035;
  });
}

function buildPolygonMask() {
  const W = 720, H = 360;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  function poly(pts) {
    ctx.beginPath();
    pts.forEach(([lon, lat], i) => {
      const x = (lon + 180) / 360 * W;
      const y = (90 - lat) / 180 * H;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath(); ctx.fill();
  }
  poly([[-168,66],[-155,72],[-130,70],[-110,73],[-95,78],[-80,75],[-60,62],[-52,48],[-65,45],[-75,35],[-82,25],[-98,18],[-107,23],[-117,32],[-125,40],[-125,48],[-132,55],[-150,60],[-168,66]]);
  poly([[-81,12],[-70,10],[-55,5],[-48,0],[-35,-7],[-34,-25],[-48,-33],[-58,-40],[-67,-53],[-72,-55],[-75,-48],[-70,-20],[-78,-5],[-81,12]]);
  poly([[-10,36],[-5,43],[3,43],[8,44],[12,46],[15,38],[24,36],[28,40],[30,45],[35,47],[40,50],[50,60],[45,67],[30,70],[20,70],[10,64],[0,58],[-10,50],[-10,36]]);
  poly([[-17,20],[-10,28],[0,32],[10,35],[20,32],[30,30],[35,20],[42,12],[50,10],[50,0],[42,-12],[35,-25],[25,-33],[18,-34],[12,-20],[9,-2],[0,5],[-8,4],[-15,10],[-17,20]]);
  poly([[40,50],[60,55],[75,60],[95,65],[120,65],[140,65],[175,65],[178,72],[155,75],[120,77],[90,76],[60,75],[40,72],[40,50]]);
  poly([[60,38],[75,38],[90,30],[100,25],[110,22],[120,30],[130,38],[135,45],[145,50],[140,38],[125,32],[118,20],[110,10],[100,5],[90,8],[78,8],[72,20],[65,25],[60,38]]);
  poly([[113,-22],[122,-14],[135,-12],[145,-15],[153,-25],[150,-37],[140,-38],[118,-35],[113,-30],[113,-22]]);
  return ctx.getImageData(0, 0, W, H);
}
})();
