import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import './GemHero.css';

export default function GemHero({ width = 800, height = 700 }) {
  const canvasRef     = useRef(null);
  const anamorphicRef = useRef(null);
  const sparkleRef    = useRef(null);
  const crossFlareRef = useRef(null);

  useEffect(() => {
    const canvasEl     = canvasRef.current;
    const anamorphicEl = anamorphicRef.current;
    const sparkleEl    = sparkleRef.current;
    const crossFlareEl = crossFlareRef.current;
    if (!canvasEl) return;

    
    
    const canvas = canvasEl;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    
    // ── CHROMATIC ABERRATION SHADER ──
    const ChromaticAberrationShader = {
      uniforms: {
        tDiffuse: { value: null },
        uIntensity: { value: 0.0035 },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uIntensity;
        uniform float uTime;
        varying vec2 vUv;
    
        void main() {
          vec2 center = vec2(0.5);
          vec2 dir = vUv - center;
          float dist = length(dir);
    
          // Stronger aberration toward edges and at bright spots
          float edgeFactor = smoothstep(0.05, 0.5, dist);
          float pulse = 1.0 + 0.15 * sin(uTime * 1.2);
          float offset = uIntensity * edgeFactor * pulse;
    
          // Radial chromatic split — R shifts outward, B shifts inward
          vec2 rUv = vUv + dir * offset * 1.2;
          vec2 gUv = vUv;
          vec2 bUv = vUv - dir * offset * 1.0;
    
          float r = texture2D(tDiffuse, rUv).r;
          float g = texture2D(tDiffuse, gUv).g;
          float b = texture2D(tDiffuse, bUv).b;
          float a = texture2D(tDiffuse, gUv).a;
    
          // Boost fringing on bright specular areas (luminance-driven)
          float lum = dot(vec3(r, g, b), vec3(0.299, 0.587, 0.114));
          float specBoost = smoothstep(0.55, 0.95, lum);
          float extraOffset = uIntensity * 2.5 * specBoost * pulse;
    
          vec2 rUv2 = vUv + dir * (offset + extraOffset) * 1.4;
          vec2 bUv2 = vUv - dir * (offset + extraOffset) * 1.2;
    
          float r2 = texture2D(tDiffuse, rUv2).r;
          float b2 = texture2D(tDiffuse, bUv2).b;
    
          // Blend: use stronger split on bright areas
          r = mix(r, r2, specBoost * 0.7);
          b = mix(b, b2, specBoost * 0.7);
    
          gl_FragColor = vec4(r, g, b, a);
        }
      `,
    };
    
    const scene = new THREE.Scene();
    
    // ── POST-PROCESSING COMPOSER ──
    const composer = new EffectComposer(renderer);
    
    const aspect = 800 / 700;
    const camH = 3.2;
    const camera = new THREE.OrthographicCamera(-camH * aspect, camH * aspect, camH, -camH, 0.1, 100);
    camera.position.set(0, 0.1, 8);
    camera.lookAt(0, -0.3, 0);
    
    // ── ENVIRONMENT ──
    const cubeRT = new THREE.WebGLCubeRenderTarget(256);
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT);
    const envScene = new THREE.Scene();
    const wallGeo = new THREE.PlaneGeometry(40, 40);
    const walls = [
      { pos: [0,0,-20], rot: [0,0,0], col: 0x1a4a5a },
      { pos: [0,0,20], rot: [0,Math.PI,0], col: 0x061218 },
      { pos: [-20,0,0], rot: [0,Math.PI/2,0], col: 0x0f3040 },
      { pos: [20,0,0], rot: [0,-Math.PI/2,0], col: 0x0f3040 },
      { pos: [0,20,0], rot: [Math.PI/2,0,0], col: 0xfff4e0 },
      { pos: [0,-20,0], rot: [-Math.PI/2,0,0], col: 0x040e14 },
    ];
    walls.forEach(w => {
      const m = new THREE.Mesh(wallGeo, new THREE.MeshBasicMaterial({ color: w.col, side: THREE.DoubleSide }));
      m.position.set(...w.pos); m.rotation.set(...w.rot);
      envScene.add(m);
    });
    envScene.add(new THREE.PointLight(0xfff8e8, 80, 60).translateX(8).translateY(12).translateZ(5));
    const el2 = new THREE.PointLight(0xe0f0ff, 30, 50); el2.position.set(-8,-2,8); envScene.add(el2);
    const el3 = new THREE.PointLight(0xffffff, 40, 50); el3.position.set(0,15,0); envScene.add(el3);
    cubeCamera.update(renderer, envScene);
    
    // ── BRILLIANT CUT GEOMETRY (wider 1.5:1, flatter crown 12%, deeper pavilion) ──
    function createBrilliantCut() {
      const N = 8;
      const girdleRadius = 2.2;
      const tableRadius = girdleRadius * 0.67;
      const totalHeight = girdleRadius / 0.75;
      const crownHeight = totalHeight * 0.12;
      const pavilionDepth = totalHeight * 0.72;
      const girdleThickness = totalHeight * 0.02;
    
      const tableY = crownHeight;
      const culetY = -pavilionDepth;
      const girdleTopY = girdleThickness / 2;
      const girdleBotY = -girdleThickness / 2;
    
      const girdleTop = [], girdleBot = [];
      for (let i = 0; i < N * 2; i++) {
        const angle = (i / (N * 2)) * Math.PI * 2;
        const x = girdleRadius * Math.cos(angle);
        const z = girdleRadius * Math.sin(angle);
        girdleTop.push(new THREE.Vector3(x, girdleTopY, z));
        girdleBot.push(new THREE.Vector3(x, girdleBotY, z));
      }
    
      const tablePoints = [];
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2 + Math.PI / N;
        tablePoints.push(new THREE.Vector3(tableRadius * Math.cos(angle), tableY, tableRadius * Math.sin(angle)));
      }
    
      const starPoints = [];
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2;
        const r = (tableRadius + girdleRadius) * 0.50;
        const h = crownHeight * 0.35;
        starPoints.push(new THREE.Vector3(r * Math.cos(angle), h, r * Math.sin(angle)));
      }
    
      const pavMidPoints = [];
      for (let i = 0; i < N * 2; i++) {
        const angle = (i / (N * 2)) * Math.PI * 2;
        const r = girdleRadius * 0.42;
        const h = culetY * 0.52;
        pavMidPoints.push(new THREE.Vector3(r * Math.cos(angle), h, r * Math.sin(angle)));
      }
    
      const culet = new THREE.Vector3(0, culetY, 0);
      const tableCenter = new THREE.Vector3(0, tableY, 0);
      const positions = [];
    
      function addTri(a, b, c) {
        const ab = new THREE.Vector3().subVectors(b, a);
        const ac = new THREE.Vector3().subVectors(c, a);
        const n = new THREE.Vector3().crossVectors(ab, ac).normalize();
        positions.push(a.x,a.y,a.z,n.x,n.y,n.z, b.x,b.y,b.z,n.x,n.y,n.z, c.x,c.y,c.z,n.x,n.y,n.z);
      }
    
      // Table
      for (let i = 0; i < N; i++) addTri(tableCenter, tablePoints[i], tablePoints[(i+1)%N]);
    
      // Crown
      for (let i = 0; i < N; i++) {
        const next = (i+1) % N;
        const gi = i*2, gi1 = i*2+1, gi2 = ((i+1)*2) % (N*2);
        addTri(tablePoints[i], starPoints[i], tablePoints[next]);
        addTri(starPoints[i], girdleTop[gi], girdleTop[gi1]);
        addTri(starPoints[i], girdleTop[gi1], starPoints[next]);
        addTri(tablePoints[next], starPoints[i], girdleTop[gi1]);
        addTri(tablePoints[next], girdleTop[gi1], girdleTop[gi2]);
      }
    
      // Girdle
      for (let i = 0; i < N*2; i++) {
        const next = (i+1) % (N*2);
        addTri(girdleTop[i], girdleBot[i], girdleBot[next]);
        addTri(girdleTop[i], girdleBot[next], girdleTop[next]);
      }
    
      // Pavilion
      for (let i = 0; i < N*2; i++) {
        const next = (i+1) % (N*2);
        addTri(girdleBot[i], girdleBot[next], pavMidPoints[i]);
        addTri(pavMidPoints[i], girdleBot[next], pavMidPoints[next]);
        addTri(pavMidPoints[i], pavMidPoints[next], culet);
      }
    
      const geo = new THREE.BufferGeometry();
      const verts = new Float32Array(positions.length / 2);
      const norms = new Float32Array(positions.length / 2);
      for (let i = 0; i < positions.length / 6; i++) {
        verts[i*3] = positions[i*6]; verts[i*3+1] = positions[i*6+1]; verts[i*3+2] = positions[i*6+2];
        norms[i*3] = positions[i*6+3]; norms[i*3+1] = positions[i*6+4]; norms[i*3+2] = positions[i*6+5];
      }
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    
      return { geometry: geo, params: { girdleRadius, tableRadius, crownHeight, pavilionDepth, girdleTopY, girdleBotY, tableY, culetY } };
    }
    
    const { geometry: gemGeometry, params: gp } = createBrilliantCut();
    
    // ── GEM MATERIAL ──
    const gemMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0.04, 0.50, 0.68),
      metalness: 0.02,
      roughness: 0.01,
      transmission: 0.55,
      thickness: 4.0,
      ior: 2.2,
      envMap: cubeRT.texture,
      envMapIntensity: 4.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.005,
      specularIntensity: 2.5,
      specularColor: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 0.97,
      side: THREE.DoubleSide,
      sheen: 0.1,
      sheenColor: new THREE.Color('#5ec8e0'),
      attenuationColor: new THREE.Color('#1a5a7a'),
      attenuationDistance: 1.2,
    });
    
    const gem = new THREE.Mesh(gemGeometry, gemMaterial);
    gem.position.y = -0.9;
    scene.add(gem);
    
    // Inner glow shell
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0.1, 0.72, 0.82),
      emissive: new THREE.Color(0.0, 0.22, 0.32),
      emissiveIntensity: 1.0,
      transparent: true, opacity: 0.14,
      roughness: 0.0, metalness: 0.0,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerGem = new THREE.Mesh(gemGeometry, innerMat);
    innerGem.scale.set(0.88, 0.88, 0.88);
    innerGem.position.y = -0.9;
    scene.add(innerGem);
    
    // ── GOLD CAGE (thick, bold, architectural) ──
    const cageGroup = new THREE.Group();
    const tubeR = gp.girdleRadius * 0.035;
    
    const goldMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4A84C'),
      metalness: 1.0,
      roughness: 0.08,
      envMap: cubeRT.texture,
      envMapIntensity: 2.5,
    });
    
    // Girdle ring
    const girdleRing = new THREE.Mesh(new THREE.TorusGeometry(gp.girdleRadius + tubeR * 0.3, tubeR, 12, 64), goldMat);
    girdleRing.rotation.x = Math.PI / 2;
    cageGroup.add(girdleRing);
    
    // Table ring
    const tableRing = new THREE.Mesh(new THREE.TorusGeometry(gp.tableRadius + tubeR * 0.3, tubeR, 12, 64), goldMat);
    tableRing.rotation.x = Math.PI / 2;
    tableRing.position.y = gp.tableY;
    cageGroup.add(tableRing);
    
    // Crown + Pavilion struts
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const tx = gp.tableRadius * Math.cos(angle);
      const tz = gp.tableRadius * Math.sin(angle);
      const gx = gp.girdleRadius * Math.cos(angle);
      const gz = gp.girdleRadius * Math.sin(angle);
    
      const crownPath = new THREE.LineCurve3(new THREE.Vector3(tx, gp.tableY, tz), new THREE.Vector3(gx, 0, gz));
      cageGroup.add(new THREE.Mesh(new THREE.TubeGeometry(crownPath, 8, tubeR, 8, false), goldMat));
    
      const pavPath = new THREE.LineCurve3(new THREE.Vector3(gx, 0, gz), new THREE.Vector3(0, gp.culetY, 0));
      cageGroup.add(new THREE.Mesh(new THREE.TubeGeometry(pavPath, 10, tubeR, 8, false), goldMat));
    }
    
    cageGroup.position.y = -0.9;
    scene.add(cageGroup);
    
    // ── CAGE RIM BLOOM (additive glow shell) ──
    const cageBloomGroup = new THREE.Group();
    const bloomMat = new THREE.MeshBasicMaterial({
      color: 0xC9A84C,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    // Clone cage geometry with larger tubes
    const bloomTubeR = tubeR * 1.8;
    const bloomGirdleRing = new THREE.Mesh(new THREE.TorusGeometry(gp.girdleRadius + bloomTubeR * 0.3, bloomTubeR, 8, 48), bloomMat);
    bloomGirdleRing.rotation.x = Math.PI / 2;
    cageBloomGroup.add(bloomGirdleRing);
    
    const bloomTableRing = new THREE.Mesh(new THREE.TorusGeometry(gp.tableRadius + bloomTubeR * 0.3, bloomTubeR, 8, 48), bloomMat);
    bloomTableRing.rotation.x = Math.PI / 2;
    bloomTableRing.position.y = gp.tableY;
    cageBloomGroup.add(bloomTableRing);
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const tx = gp.tableRadius * Math.cos(angle);
      const tz = gp.tableRadius * Math.sin(angle);
      const gx = gp.girdleRadius * Math.cos(angle);
      const gz = gp.girdleRadius * Math.sin(angle);
    
      const cp = new THREE.LineCurve3(new THREE.Vector3(tx, gp.tableY, tz), new THREE.Vector3(gx, 0, gz));
      cageBloomGroup.add(new THREE.Mesh(new THREE.TubeGeometry(cp, 6, bloomTubeR, 6, false), bloomMat));
    
      const pp = new THREE.LineCurve3(new THREE.Vector3(gx, 0, gz), new THREE.Vector3(0, gp.culetY, 0));
      cageBloomGroup.add(new THREE.Mesh(new THREE.TubeGeometry(pp, 8, bloomTubeR, 6, false), bloomMat));
    }
    
    cageBloomGroup.position.y = -0.9;
    scene.add(cageBloomGroup);
    
    // ── LIGHTING (simplified, strong key light dominant) ──
    const keyLight = new THREE.DirectionalLight(0xfff4e0, 2.8);
    keyLight.position.set(6, 10, 6);
    scene.add(keyLight);
    
    const fillLight = new THREE.DirectionalLight(0xa8d8ea, 0.7);
    fillLight.position.set(-6, -1, 5);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, 2, -8);
    scene.add(rimLight);
    
    const ambientLight = new THREE.AmbientLight(0xf0f4f8, 0.3);
    scene.add(ambientLight);
    
    // Teal core inside gem — pulsing
    const tealCore = new THREE.PointLight(0x00d4ff, 2.5, 8);
    tealCore.position.set(0, -0.9, 0);
    scene.add(tealCore);
    
    // ── DUST MOTES ──
    const MOTE_COUNT = 100;
    const moteGeo = new THREE.BufferGeometry();
    const motePos = new Float32Array(MOTE_COUNT * 3);
    const moteSz = new Float32Array(MOTE_COUNT);
    for (let i = 0; i < MOTE_COUNT; i++) {
      motePos[i*3] = (Math.random()-0.5)*8;
      motePos[i*3+1] = (Math.random()-0.5)*8;
      motePos[i*3+2] = (Math.random()-0.5)*6;
      moteSz[i] = 0.4 + Math.random() * 1.2;
    }
    moteGeo.setAttribute('position', new THREE.Float32BufferAttribute(motePos, 3));
    moteGeo.setAttribute('aSize', new THREE.Float32BufferAttribute(moteSz, 1));
    
    const moteMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#7aacbc') } },
      vertexShader: `
        attribute float aSize;
        varying float vAlpha;
        uniform float uTime;
        void main() {
          vec3 p = position;
          p.y += sin(uTime * 0.15 + p.x * 2.0) * 0.3;
          p.x += cos(uTime * 0.1 + p.z * 1.5) * 0.15;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float dist = length(p.xyz);
          vAlpha = smoothstep(5.5, 2.0, dist) * (0.15 + 0.08 * sin(uTime * 0.8 + p.y * 3.0));
          gl_PointSize = aSize * (60.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float glow = exp(-d * d * 3.0);
          gl_FragColor = vec4(uColor, vAlpha * glow);
        }
      `,
    });
    const motes = new THREE.Points(moteGeo, moteMat);
    scene.add(motes);
    
    // ── CAUSTIC FLOOR PLANE (flat below gem) ──
    const causticMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uGemRotY: { value: 0 }, uGemRotX: { value: 0 },
        uTealColor: { value: new THREE.Color(0.06, 0.55, 0.7) },
        uGoldColor: { value: new THREE.Color(0.78, 0.66, 0.3) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uGemRotY;
        uniform float uGemRotX;
        uniform vec3 uTealColor;
        uniform vec3 uGoldColor;
        varying vec2 vUv;
    
        vec2 hash(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
        }
        float voronoi(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p); float m = 1.0;
          for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++) {
            vec2 nb = vec2(float(x), float(y));
            vec2 pt = hash(i + nb) * 0.5 + 0.5;
            pt = 0.5 + 0.5 * sin(uTime * 0.4 + 6.2831 * pt);
            m = min(m, length(nb + pt - f));
          }
          return m;
        }
        float causticPattern(vec2 uv) {
          vec2 off = vec2(uGemRotY * 1.8, uGemRotX * 1.2);
          float v1 = voronoi(uv * 5.0 + off + uTime * 0.08);
          float v2 = voronoi(uv * 7.5 - off * 0.6 + uTime * 0.05);
          float v3 = voronoi(uv * 3.2 + off * 1.5 - uTime * 0.12);
          float c1 = smoothstep(0.0, 0.15, v1) * (1.0 - smoothstep(0.15, 0.35, v1));
          float c2 = smoothstep(0.0, 0.12, v2) * (1.0 - smoothstep(0.12, 0.28, v2));
          float c3 = smoothstep(0.0, 0.18, v3) * (1.0 - smoothstep(0.18, 0.4, v3));
          return c1 * 0.5 + c2 * 0.35 + c3 * 0.25;
        }
        void main() {
          vec2 c = vUv - 0.5;
          // Add ripple distortion to floor caustic UVs
          vec2 rippleC = c;
          rippleC.x += sin(c.y * 14.0 + uTime * 2.0) * 0.008;
          rippleC.y += cos(c.x * 14.0 - uTime * 1.6) * 0.008;
          float ell = length(rippleC * vec2(1.0, 1.6));
          float falloff = 1.0 - smoothstep(0.15, 0.48, ell);
          float core = exp(-ell * ell * 8.0) * 0.3;
          float caustic = causticPattern(rippleC);
          vec3 col = mix(uTealColor, uGoldColor, caustic * 0.4 + 0.1);
          col += vec3(0.9, 0.95, 1.0) * caustic * 0.3;
          float alpha = (caustic * 0.6 + core) * falloff * 0.65;
          alpha *= 0.85 + 0.15 * sin(uTime * 0.7);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    
    const causticPlane = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), causticMat);
    causticPlane.rotation.x = -Math.PI / 2;
    causticPlane.position.set(0, gp.culetY - 0.1 - 0.9, 0);
    scene.add(causticPlane);
    
    // ── WALL CAUSTIC (behind gem) ──
    const wallCausticMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uGemRotY: { value: 0 }, uGemRotX: { value: 0 },
        uTealColor: { value: new THREE.Color(0.04, 0.42, 0.58) },
        uGoldColor: { value: new THREE.Color(0.6, 0.5, 0.22) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform float uTime; uniform float uGemRotY; uniform float uGemRotX;
        uniform vec3 uTealColor; uniform vec3 uGoldColor;
        varying vec2 vUv;
        vec2 hash(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
        }
        float voronoi(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p); float m = 1.0;
          for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++) {
            vec2 nb = vec2(float(x), float(y));
            vec2 pt = hash(i + nb) * 0.5 + 0.5;
            pt = 0.5 + 0.5 * sin(uTime * 0.3 + 6.2831 * pt);
            m = min(m, length(nb + pt - f));
          }
          return m;
        }
        float causticPattern(vec2 uv) {
          vec2 off = vec2(uGemRotY * 2.2, uGemRotX * 1.8);
          float v1 = voronoi(uv * 4.0 + off + uTime * 0.06);
          float v2 = voronoi(uv * 6.0 - off * 0.7 + uTime * 0.04);
          float c1 = smoothstep(0.0, 0.14, v1) * (1.0 - smoothstep(0.14, 0.32, v1));
          float c2 = smoothstep(0.0, 0.11, v2) * (1.0 - smoothstep(0.11, 0.26, v2));
          return c1 * 0.45 + c2 * 0.35;
        }
        void main() {
          vec2 c = vUv - 0.5;
          float ell = length(c * vec2(1.4, 1.0));
          float falloff = 1.0 - smoothstep(0.12, 0.45, ell);
          float caustic = causticPattern(c);
          vec3 col = mix(uTealColor, uGoldColor, caustic * 0.3);
          col += vec3(0.7, 0.85, 1.0) * caustic * 0.25;
          float alpha = caustic * falloff * 0.18;
          alpha *= 0.8 + 0.2 * sin(uTime * 0.5 + 1.3);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    const wallCausticPlane = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), wallCausticMat);
    wallCausticPlane.position.set(0, -0.7, -3.5);
    scene.add(wallCausticPlane);
    
    // ── REFLECTIVE GROUND PLANE (mirror fade) ──
    const groundMirrorGeo = new THREE.PlaneGeometry(8, 8);
    const groundMirrorMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uTint: { value: new THREE.Color(0.04, 0.18, 0.24) },
        uKeyLightDir: { value: new THREE.Vector3(6, 10, 6).normalize() },
        uKeyLightColor: { value: new THREE.Color(1.0, 0.96, 0.88) },
        uFillLightDir: { value: new THREE.Vector3(-6, -1, 5).normalize() },
        uFillLightColor: { value: new THREE.Color(0.66, 0.85, 0.92) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uTint;
        uniform vec3 uKeyLightDir;
        uniform vec3 uKeyLightColor;
        uniform vec3 uFillLightDir;
        uniform vec3 uFillLightColor;
        varying vec2 vUv;
        varying vec3 vWorldPos;
    
        // Compute ripple height at a UV position
        float rippleHeight(vec2 p, float t) {
          float h = 0.0;
          h += sin(length(p) * 28.0 - t * 2.4) * 0.012;
          h += sin(p.x * 18.0 + t * 1.7) * cos(p.y * 14.0 - t * 1.3) * 0.008;
          h += sin(length(p - vec2(0.12, -0.08)) * 36.0 - t * 3.1) * 0.006;
          h += cos(p.x * 24.0 - t * 2.0 + p.y * 20.0) * 0.004;
          h += sin((p.x + p.y) * 32.0 + t * 1.5) * 0.003;
          return h;
        }
    
        // Compute surface normal from ripple height field via central differences
        vec3 rippleNormal(vec2 p, float t) {
          float eps = 0.003;
          float hL = rippleHeight(p - vec2(eps, 0.0), t);
          float hR = rippleHeight(p + vec2(eps, 0.0), t);
          float hD = rippleHeight(p - vec2(0.0, eps), t);
          float hU = rippleHeight(p + vec2(0.0, eps), t);
          vec3 n = normalize(vec3(hL - hR, 2.0 * eps, hD - hU));
          return n;
        }
    
        // Caustic concentration — second derivatives measure wavefront convergence
        float causticConcentration(vec2 p, float t) {
          float eps = 0.004;
          float hC = rippleHeight(p, t);
          float hL = rippleHeight(p - vec2(eps, 0.0), t);
          float hR = rippleHeight(p + vec2(eps, 0.0), t);
          float hD = rippleHeight(p - vec2(0.0, eps), t);
          float hU = rippleHeight(p + vec2(0.0, eps), t);
          // Laplacian — measures concavity / convergence of wave energy
          float laplacian = (hL + hR + hD + hU - 4.0 * hC) / (eps * eps);
          // Second partial derivatives for determinant of Hessian
          float hLU = rippleHeight(p + vec2(-eps, eps), t);
          float hRU = rippleHeight(p + vec2(eps, eps), t);
          float hLD = rippleHeight(p + vec2(-eps, -eps), t);
          float hRD = rippleHeight(p + vec2(eps, -eps), t);
          float dxx = (hR - 2.0 * hC + hL) / (eps * eps);
          float dyy = (hU - 2.0 * hC + hD) / (eps * eps);
          float dxy = (hRU - hLU - hRD + hLD) / (4.0 * eps * eps);
          // Determinant of Hessian — positive = bowl (convergence), negative = saddle
          float hessian = dxx * dyy - dxy * dxy;
          // Caustic intensity: strong where Laplacian is large positive (convergence)
          // and Hessian is positive (true bowl focus, not saddle point)
          float convergence = max(laplacian, 0.0);
          float focus = max(hessian, 0.0);
          // Nonlinear compounding — caustic nodes flare up sharply
          float caustic = pow(convergence * 0.012, 1.8) + pow(focus * 0.00006, 1.5);
          caustic = min(caustic, 1.0);
          return caustic;
        }
    
        void main() {
          vec2 c = vUv - 0.5;
          float dist = length(c);
          // Radial fade — strongest directly under gem, fading outward
          float radialFade = 1.0 - smoothstep(0.0, 0.45, dist);
          // Vertical fade — front-to-back falloff (y in UV maps to z depth)
          float depthFade = smoothstep(0.05, 0.55, vUv.y);
          // Liquid ripple distortion on ground mirror
          vec2 rc = c;
          rc.x += sin(c.y * 16.0 + uTime * 2.2) * 0.006;
          rc.y += cos(c.x * 14.0 - uTime * 1.8) * 0.006;
          float shimmer = 0.88 + 0.12 * sin(uTime * 0.6 + rc.x * 12.0 + rc.y * 8.0)
                         * (1.0 + 0.3 * sin(uTime * 1.3 + rc.x * 6.0));
    
          // ── Surface normal perturbation — ripple-based specular reflections ──
          vec3 ripN = rippleNormal(c, uTime);
          // View direction (camera looks roughly down -Z, slight tilt)
          vec3 viewDir = normalize(vec3(0.0, 0.12, 1.0));
          // Key light specular — dancing highlight from upper-right
          vec3 keyRefl = reflect(-uKeyLightDir, ripN);
          float keySpec = pow(max(dot(keyRefl, viewDir), 0.0), 64.0);
          keySpec *= smoothstep(0.0, 0.3, radialFade); // confine to ground area
          // Fill light specular — subtle cool highlight from left
          vec3 fillRefl = reflect(-uFillLightDir, ripN);
          float fillSpec = pow(max(dot(fillRefl, viewDir), 0.0), 48.0);
          fillSpec *= smoothstep(0.0, 0.25, radialFade);
          // Teal core light specular — from below/inside gem
          vec3 tealLightDir = normalize(vec3(0.0, -1.0, 0.2));
          vec3 tealRefl = reflect(-tealLightDir, ripN);
          float tealSpec = pow(max(dot(tealRefl, viewDir), 0.0), 32.0);
          tealSpec *= smoothstep(0.0, 0.2, radialFade);
    
          // Combine specular contributions
          vec3 specColor = uKeyLightColor * keySpec * 0.55
                         + uFillLightColor * fillSpec * 0.18
                         + vec3(0.0, 0.82, 1.0) * tealSpec * 0.22;
    
          // ── Caustic concentration nodes ──
          float caustic = causticConcentration(c, uTime);
          // Caustic color: warm white core with teal-gold fringe
          vec3 causticCol = mix(
            vec3(0.06, 0.55, 0.7),   // teal fringe
            vec3(1.0, 0.97, 0.9),     // bright white-warm core
            smoothstep(0.0, 0.6, caustic)
          );
          // Add subtle gold tint at medium intensity nodes
          causticCol += vec3(0.78, 0.66, 0.3) * caustic * 0.3 * (1.0 - caustic);
          // Caustics compound with existing specular — bright spots get brighter
          float specLum = keySpec * 0.55 + fillSpec * 0.18 + tealSpec * 0.22;
          float causticBoost = caustic * (1.0 + specLum * 3.0); // nonlinear compounding
          // Temporal flicker — caustic nodes shimmer independently
          float flicker = 0.7 + 0.3 * sin(uTime * 4.2 + c.x * 30.0) * cos(uTime * 3.1 + c.y * 25.0);
          causticBoost *= flicker;
    
          // Diffuse ripple modulation — subtle brightness variation from normals
          float diffRipple = max(dot(ripN, uKeyLightDir), 0.0);
          float diffMod = 0.85 + 0.15 * diffRipple;
    
          // Original specular highlight streak
          float specX = smoothstep(0.08, 0.0, abs(c.x - 0.08));
          float specY = smoothstep(0.25, 0.0, abs(c.y - 0.05));
          float spec = specX * specY * 0.35;
          // Combine
          float alpha = radialFade * depthFade * shimmer * diffMod * 0.28 + spec * radialFade;
          // Add specular highlights to alpha so they're visible
          float specAlpha = (keySpec * 0.45 + fillSpec * 0.12 + tealSpec * 0.15) * radialFade * depthFade;
          alpha += specAlpha;
          // Add caustic node contribution to alpha
          float causticAlpha = causticBoost * radialFade * depthFade * 0.35;
          alpha += causticAlpha;
          vec3 col = uTint + vec3(0.02, 0.06, 0.08) * spec * 4.0;
          col += specColor;
          // Add caustic color contribution
          col += causticCol * causticBoost * 0.4;
          // Slight warm tint near center from gold cage reflection
          float warmZone = exp(-dist * dist * 12.0);
          col += vec3(0.12, 0.08, 0.02) * warmZone * 0.5;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    
    const groundMirror = new THREE.Mesh(groundMirrorGeo, groundMirrorMat);
    groundMirror.rotation.x = -Math.PI / 2;
    groundMirror.position.set(0, gp.culetY - 0.9 - 0.08, 0.3);
    scene.add(groundMirror);
    
    // Mirrored gem reflection (inverted, faded) with ripple distortion
    const reflectionGroup = new THREE.Group();
    
    const reflGemMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0.04, 0.50, 0.68),
      metalness: 0.02,
      roughness: 0.01,
      transmission: 0.55,
      thickness: 4.0,
      ior: 2.2,
      envMap: cubeRT.texture,
      envMapIntensity: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.005,
      specularIntensity: 2.5,
      specularColor: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      attenuationColor: new THREE.Color('#1a5a7a'),
      attenuationDistance: 1.2,
    });
    reflGemMat.onBeforeCompile = (shader) => {
      shader.uniforms.uRippleTime = { value: 0 };
      shader.vertexShader = 'uniform float uRippleTime;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         float rippleDist = length(transformed.xz);
         float ripple1 = sin(rippleDist * 8.0 - uRippleTime * 2.4) * 0.018;
         float ripple2 = sin(rippleDist * 12.0 + uRippleTime * 1.7 + 1.5) * 0.010;
         float ripple3 = cos(transformed.x * 6.0 + uRippleTime * 1.3) * sin(transformed.z * 6.0 - uRippleTime * 1.0) * 0.008;
         transformed.y += (ripple1 + ripple2 + ripple3) * smoothstep(0.0, 1.5, rippleDist);
         transformed.x += sin(transformed.z * 5.0 + uRippleTime * 1.8) * 0.006;
         transformed.z += cos(transformed.x * 5.0 - uRippleTime * 1.4) * 0.006;
        `
      );
      reflGemMat.userData.shader = shader;
    };
    const reflGem = new THREE.Mesh(gemGeometry, reflGemMat);
    reflectionGroup.add(reflGem);
    
    const reflCageMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4A84C'),
      metalness: 1.0,
      roughness: 0.08,
      envMap: cubeRT.texture,
      envMapIntensity: 2.5,
      transparent: true,
      opacity: 0.15,
    });
    reflCageMat.onBeforeCompile = (shader) => {
      shader.uniforms.uRippleTime = { value: 0 };
      shader.vertexShader = 'uniform float uRippleTime;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         float cRippleDist = length(transformed.xz);
         float cRipple1 = sin(cRippleDist * 8.0 - uRippleTime * 2.4) * 0.018;
         float cRipple2 = sin(cRippleDist * 12.0 + uRippleTime * 1.7 + 1.5) * 0.010;
         transformed.y += (cRipple1 + cRipple2) * smoothstep(0.0, 1.5, cRippleDist);
         transformed.x += sin(transformed.z * 5.0 + uRippleTime * 1.8) * 0.006;
         transformed.z += cos(transformed.x * 5.0 - uRippleTime * 1.4) * 0.006;
        `
      );
      reflCageMat.userData.shader = shader;
    };
    
    // Clone cage struts for reflection
    const reflGirdleRing = new THREE.Mesh(new THREE.TorusGeometry(gp.girdleRadius + tubeR * 0.3, tubeR, 12, 64), reflCageMat);
    reflGirdleRing.rotation.x = Math.PI / 2;
    reflectionGroup.add(reflGirdleRing);
    
    const reflTableRing = new THREE.Mesh(new THREE.TorusGeometry(gp.tableRadius + tubeR * 0.3, tubeR, 12, 64), reflCageMat);
    reflTableRing.rotation.x = Math.PI / 2;
    reflTableRing.position.y = gp.tableY;
    reflectionGroup.add(reflTableRing);
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const tx = gp.tableRadius * Math.cos(angle);
      const tz = gp.tableRadius * Math.sin(angle);
      const gx = gp.girdleRadius * Math.cos(angle);
      const gz = gp.girdleRadius * Math.sin(angle);
      const cp = new THREE.LineCurve3(new THREE.Vector3(tx, gp.tableY, tz), new THREE.Vector3(gx, 0, gz));
      reflectionGroup.add(new THREE.Mesh(new THREE.TubeGeometry(cp, 8, tubeR, 8, false), reflCageMat));
      const pp = new THREE.LineCurve3(new THREE.Vector3(gx, 0, gz), new THREE.Vector3(0, gp.culetY, 0));
      reflectionGroup.add(new THREE.Mesh(new THREE.TubeGeometry(pp, 10, tubeR, 8, false), reflCageMat));
    }
    
    // Flip vertically and position below ground plane
    const groundY = gp.culetY - 0.9 - 0.08;
    reflectionGroup.scale.set(1, -1, 1);
    reflectionGroup.position.y = groundY * 2 + 0.9;
    scene.add(reflectionGroup);
    
    // Fade-out plane over reflection (gradient mask with ripple distortion)
    const reflFadeMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          // Subtle UV ripple to distort the fade edge itself
          uv.y += sin(uv.x * 12.0 + uTime * 1.6) * 0.012;
          uv.y += cos(uv.x * 8.0 - uTime * 1.1) * 0.008;
          float fade = smoothstep(0.0, 0.75, 1.0 - uv.y);
          gl_FragColor = vec4(0.02, 0.094, 0.118, fade * 0.88);
        }
      `,
    });
    const reflFadePlane = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), reflFadeMat);
    reflFadePlane.rotation.x = -Math.PI / 2;
    reflFadePlane.position.set(0, groundY - 0.01, 0.3);
    scene.add(reflFadePlane);
    
    // ── FINISH COMPOSER SETUP ──
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    const chromaPass = new ShaderPass(ChromaticAberrationShader);
    chromaPass.renderToScreen = true;
    composer.addPass(chromaPass);
    
    // ── ANAMORPHIC STREAK SYSTEM ──
    const anamorphicLayer = anamorphicEl;
    
    class AnamorphicStreak {
      constructor(x, y, width, color, opacity, speed) {
        this.el = document.createElement('div');
        this.el.className = 'anamorphic-streak';
        this.baseX = x;
        this.baseY = y;
        this.width = width;
        this.baseOpacity = opacity;
        this.speed = speed;
        this.phase = Math.random() * Math.PI * 2;
        this.el.style.top = `${y}px`;
        this.el.style.left = `${x - width / 2}px`;
        this.el.style.width = `${width}px`;
        this.el.style.background = `linear-gradient(90deg, transparent 0%, ${color}22 15%, ${color} 50%, ${color}22 85%, transparent 100%)`;
        anamorphicLayer.appendChild(this.el);
      }
      update(elapsed, gemRotY, flareActive) {
        const shimmer = 0.5 + 0.5 * Math.sin(elapsed * this.speed + this.phase);
        const rotInfluence = 1.0 + Math.abs(Math.sin(gemRotY * 3.0 + this.phase)) * 0.6;
        const flareMult = 1.0 + flareActive * 2.5;
        const alpha = this.baseOpacity * shimmer * rotInfluence * flareMult;
        const scaleX = 0.7 + shimmer * 0.6 + flareActive * 1.2;
        const drift = Math.sin(elapsed * 0.3 + this.phase) * 8;
        this.el.style.opacity = Math.min(alpha, 0.85);
        this.el.style.transform = `translateX(${drift}px) scaleX(${scaleX})`;
      }
      destroy() { this.el.remove(); }
    }
    
    // Create persistent streaks at specular hotspot positions on the crown
    const streaks = [];
    const streakConfigs = [
      // Primary bright streak — upper-right crown specular (key light now upper-right)
      { x: 480, y: 340, w: 320, color: '#ffffff', opacity: 0.35, speed: 1.8 },
      { x: 480, y: 340, w: 480, color: '#a8e4f8', opacity: 0.12, speed: 1.4 },
      // Secondary — upper-left crown facet
      { x: 310, y: 350, w: 240, color: '#ffffff', opacity: 0.22, speed: 2.1 },
      { x: 310, y: 350, w: 380, color: '#7ad0e8', opacity: 0.08, speed: 1.6 },
      // Table center highlight
      { x: 400, y: 330, w: 200, color: '#ffffff', opacity: 0.18, speed: 1.5 },
      { x: 400, y: 330, w: 550, color: '#90d8ee', opacity: 0.06, speed: 1.1 },
      // Crown-left edge catch
      { x: 230, y: 370, w: 180, color: '#d4eaf4', opacity: 0.15, speed: 2.4 },
      // Crown-right edge catch
      { x: 560, y: 368, w: 160, color: '#d4eaf4', opacity: 0.12, speed: 2.0 },
      // Subtle wide ambient streak across the full gem
      { x: 400, y: 355, w: 700, color: '#5ec8e0', opacity: 0.04, speed: 0.7 },
    ];
    
    streakConfigs.forEach(cfg => {
      streaks.push(new AnamorphicStreak(cfg.x, cfg.y, cfg.w, cfg.color, cfg.opacity, cfg.speed));
    });
    
    // ── LENS FLARE + SCATTER PARTICLES ──
    const crossFlare = crossFlareEl;
    const sparkleLayer = sparkleEl;
    
    function fireFlare() {
      crossFlare.classList.remove('firing');
      void crossFlare.offsetWidth;
      crossFlare.classList.add('firing');
    
      // Scatter particles
      for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'scatter-particle';
        const endX = (Math.random() - 0.5) * 160;
        const endY = (Math.random() - 0.5) * 160;
        const animName = `scatter_${Date.now()}_${i}`;
        const style = document.createElement('style');
        style.textContent = `
          @keyframes ${animName} {
            0%   { opacity: 1; transform: translate(0, 0) scale(1); }
            100% { opacity: 0; transform: translate(${endX}px, ${endY}px) scale(0.3); }
          }
        `;
        document.head.appendChild(style);
        p.style.left = '60%';
        p.style.top = '48%';
        p.style.animation = `${animName} 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards`;
        p.style.animationDelay = `${Math.random() * 0.1}s`;
        sparkleLayer.appendChild(p);
        setTimeout(() => { p.remove(); style.remove(); }, 1000);
      }
    
      setTimeout(() => crossFlare.classList.remove('firing'), 700);
    }
    
    setInterval(fireFlare, 5000);
    setTimeout(fireFlare, 1200);
    
    // ── SPRING PHYSICS MOUSE ──
    let targetRotY = 0, targetRotX = 0;
    let currentRotY = 0, currentRotX = 0;
    let velY = 0, velX = 0;
    const stiffness = 0.06, damping = 0.82;
    
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetRotY = nx * 12 * Math.PI / 180;
      targetRotX = -ny * 6 * Math.PI / 180;
    });
    canvas.addEventListener('mouseleave', () => { targetRotY = 0; targetRotX = 0; });
    
    // ── ANIMATION LOOP ──
    const clock = new THREE.Clock();
    let idleAngle = 0;
    
    function animate() {
      const elapsed = clock.getElapsedTime();
    
      idleAngle += 0.8 * Math.PI / 180;
    
      // Speed up on hover
      const isHovering = targetRotY !== 0 || targetRotX !== 0;
      if (isHovering) idleAngle += 0.6 * Math.PI / 180; // extra speed → total ~1.4°
    
      velY = velY * damping + (targetRotY - currentRotY) * stiffness;
      velX = velX * damping + (targetRotX - currentRotX) * stiffness;
      currentRotY += velY;
      currentRotX += velX;
    
      const ry = idleAngle + currentRotY;
      const rx = currentRotX + 0.175; // ~10° upward tilt
    
      gem.rotation.y = ry; gem.rotation.x = rx;
      cageGroup.rotation.y = ry; cageGroup.rotation.x = rx;
      cageBloomGroup.rotation.y = ry; cageBloomGroup.rotation.x = rx;
      innerGem.rotation.y = ry; innerGem.rotation.x = rx;
    
        // Mirror reflection follows gem rotation (inverted X tilt)
        reflectionGroup.rotation.y = ry;
        reflectionGroup.rotation.x = -rx;
    
        // Update ripple time uniforms on reflection materials
        if (reflGemMat.userData.shader) {
          reflGemMat.userData.shader.uniforms.uRippleTime.value = elapsed;
        }
        if (reflCageMat.userData.shader) {
          reflCageMat.userData.shader.uniforms.uRippleTime.value = elapsed;
        }
        reflFadeMat.uniforms.uTime.value = elapsed;
    
        // Keep positions in sync after rotation
      gem.position.y = -0.9;
      innerGem.position.y = -0.9;
      cageGroup.position.y = -0.9;
      cageBloomGroup.position.y = -0.9;
    
      innerMat.emissiveIntensity = 0.8 + Math.sin(elapsed * 1.8) * 0.3;
    
      // Teal core pulsing drift inside gem
      tealCore.position.set(Math.sin(elapsed * 0.5) * 0.2, -0.9 + Math.cos(elapsed * 0.4) * 0.15, 0);
      tealCore.intensity = 2.2 + Math.sin(elapsed * 1.5) * 0.4;
    
      // Cage bloom pulse
      bloomMat.opacity = 0.04 + Math.sin(elapsed * 1.4) * 0.025;
    
      // Ground mirror shimmer
      groundMirrorMat.uniforms.uTime.value = elapsed;
    
      // Dust motes
      moteMat.uniforms.uTime.value = elapsed;
      motes.rotation.y = elapsed * 0.02;
    
      // Chromatic aberration
      chromaPass.uniforms.uTime.value = elapsed;
      // Pulse intensity slightly stronger during flare moments
      const flareCycle = elapsed % 5.0;
      const flareActive = flareCycle > 0 && flareCycle < 0.8 ? smoothstepJS(0, 0.3, flareCycle) * (1.0 - smoothstepJS(0.5, 0.8, flareCycle)) : 0;
      chromaPass.uniforms.uIntensity.value = 0.0035 + flareActive * 0.006;
    
      // Anamorphic streaks
      streaks.forEach(s => s.update(elapsed, ry, flareActive));
    
      // Caustics
      causticMat.uniforms.uTime.value = elapsed;
      causticMat.uniforms.uGemRotY.value = ry;
      causticMat.uniforms.uGemRotX.value = currentRotX;
    
      wallCausticMat.uniforms.uTime.value = elapsed;
      wallCausticMat.uniforms.uGemRotY.value = ry;
      wallCausticMat.uniforms.uGemRotX.value = currentRotX;
    
      composer.render();
    }
    
    function smoothstepJS(edge0, edge1, x) {
      const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    }
    
    renderer.setAnimationLoop(animate);
    
    
    
    // ── CLEANUP on unmount ──
    return () => {
      renderer.setAnimationLoop(null);
      renderer.dispose();
      if (typeof streaks !== 'undefined') streaks.forEach(s => s.el && s.el.remove());
    };
  }, []);

  return (
    <section className="gem-hero">
      <div className="canvas-wrap">
        <div className="logo-overlay">
          <div className="logo-script">Gemscape</div>
          <svg className="logo-underline" viewBox="0 0 320 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', overflow: 'visible' }}>
            <path className="underline-glow-trail-outer" d="M10 18 Q40 4, 80 14 Q120 24, 160 10 Q200 -2, 240 12 Q280 22, 310 8" stroke="rgba(232,201,106,0.25)" strokeWidth="6" strokeLinecap="round" fill="none" filter="url(#trailBlurOuter)"/>
            <path className="underline-glow-trail" d="M10 18 Q40 4, 80 14 Q120 24, 160 10 Q200 -2, 240 12 Q280 22, 310 8" stroke="rgba(232,201,106,0.45)" strokeWidth="3" strokeLinecap="round" fill="none" filter="url(#trailBlur)"/>
            <path className="underline-path" d="M10 18 Q40 4, 80 14 Q120 24, 160 10 Q200 -2, 240 12 Q280 22, 310 8" stroke="url(#underlineGrad)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
            <foreignObject x="0" y="0" width="320" height="24" style={{ overflow: 'visible' }}>
              <div className="underline-spark"></div>
            </foreignObject>
            <defs>
              <filter id="trailBlur" x="-10%" y="-50%" width="120%" height="200%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
              <filter id="trailBlurOuter" x="-20%" y="-80%" width="140%" height="260%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
              <linearGradient id="underlineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="rgba(201,168,76,0)" />
                <stop offset="15%"  stopColor="rgba(201,168,76,0.5)" />
                <stop offset="50%"  stopColor="rgba(232,201,106,0.7)" />
                <stop offset="85%"  stopColor="rgba(201,168,76,0.5)" />
                <stop offset="100%" stopColor="rgba(201,168,76,0)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="logo-divider"></div>
          <div className="logo-subtitle">Travel and Tours</div>
        </div>

        <canvas ref={canvasRef} id="gem-canvas" />

        <div ref={anamorphicRef} className="anamorphic-layer" id="anamorphic-layer" />
        <div ref={sparkleRef} className="sparkle-layer" id="sparkle-layer">
          <div ref={crossFlareRef} className="cross-flare" id="cross-flare">
            <div className="bloom" />
            <div className="bar-h" />
            <div className="bar-v" />
          </div>
        </div>
      </div>
    </section>
  );
}
