// @ts-nocheck
import { useEffect, useRef } from "react";

const BrilliantGem = ({ width = 500, height = 500 }: { width?: number; height?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent double-init in strict mode
    if (cleanupRef.current) return;

    const container = containerRef.current;
    let animationId: number;
    let destroyed = false;

    const init = async () => {
      const THREE = await import("three");
      const { EffectComposer } = await import("three/examples/jsm/postprocessing/EffectComposer.js");
      const { RenderPass } = await import("three/examples/jsm/postprocessing/RenderPass.js");
      const { ShaderPass } = await import("three/examples/jsm/postprocessing/ShaderPass.js");

      if (destroyed) return;

      const canvas = document.createElement("canvas");
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      canvas.style.background = "transparent";
      container.appendChild(canvas);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.6;

      // ── RIM HALO SHADER ──
      const RimHaloShader = {
        uniforms: {
          tDiffuse: { value: null },
          uResolution: { value: new THREE.Vector2(width, height) },
          uTime: { value: 0 },
          uHaloColor: { value: new THREE.Color(0.15, 0.75, 0.85) },
          uHaloIntensity: { value: 0.7 },
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
          uniform vec2 uResolution;
          uniform float uTime;
          uniform vec3 uHaloColor;
          uniform float uHaloIntensity;
          varying vec2 vUv;
          void main() {
            vec4 center = texture2D(tDiffuse, vUv);
            float centerLum = dot(center.rgb, vec3(0.299, 0.587, 0.114));
            float edgeSum = 0.0;
            float samples = 0.0;
            vec2 texel = 1.0 / uResolution;
            for (float i = 0.0; i < 16.0; i++) {
              float angle = i * 6.2831853 / 16.0;
              vec2 dir = vec2(cos(angle), sin(angle));
              vec2 offset1 = dir * texel * 2.0;
              float s1 = dot(texture2D(tDiffuse, vUv + offset1).rgb, vec3(0.299, 0.587, 0.114));
              edgeSum += abs(centerLum - s1);
              samples += 1.0;
              vec2 offset2 = dir * texel * 4.0;
              float s2 = dot(texture2D(tDiffuse, vUv + offset2).rgb, vec3(0.299, 0.587, 0.114));
              edgeSum += abs(centerLum - s2) * 0.6;
              samples += 0.6;
            }
            float edge = edgeSum / samples;
            float halo = smoothstep(0.02, 0.12, edge);
            float outerEdge = 0.0;
            float outerSamples = 0.0;
            for (float i = 0.0; i < 12.0; i++) {
              float angle = i * 6.2831853 / 12.0;
              vec2 dir = vec2(cos(angle), sin(angle));
              vec2 offset = dir * texel * 7.0;
              float s = dot(texture2D(tDiffuse, vUv + offset).rgb, vec3(0.299, 0.587, 0.114));
              outerEdge += abs(centerLum - s);
              outerSamples += 1.0;
            }
            float outerHalo = smoothstep(0.015, 0.08, outerEdge / outerSamples) * 0.4;
            float totalHalo = max(halo, outerHalo);
            float pulse = 0.85 + 0.15 * sin(uTime * 1.6);
            vec3 haloCol = mix(uHaloColor, vec3(0.85, 0.95, 1.0), halo * 0.6);
            vec3 result = center.rgb + haloCol * totalHalo * uHaloIntensity * pulse;
            gl_FragColor = vec4(result, center.a);
          }
        `,
      };

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
            float edgeFactor = smoothstep(0.05, 0.5, dist);
            float pulse = 1.0 + 0.15 * sin(uTime * 1.2);
            float offset = uIntensity * edgeFactor * pulse;
            vec2 rUv = vUv + dir * offset * 1.2;
            vec2 gUv = vUv;
            vec2 bUv = vUv - dir * offset * 1.0;
            float r = texture2D(tDiffuse, rUv).r;
            float g = texture2D(tDiffuse, gUv).g;
            float b = texture2D(tDiffuse, bUv).b;
            float a = texture2D(tDiffuse, gUv).a;
            float lum = dot(vec3(r, g, b), vec3(0.299, 0.587, 0.114));
            float specBoost = smoothstep(0.55, 0.95, lum);
            float extraOffset = uIntensity * 2.5 * specBoost * pulse;
            vec2 rUv2 = vUv + dir * (offset + extraOffset) * 1.4;
            vec2 bUv2 = vUv - dir * (offset + extraOffset) * 1.2;
            float r2 = texture2D(tDiffuse, rUv2).r;
            float b2 = texture2D(tDiffuse, bUv2).b;
            r = mix(r, r2, specBoost * 0.7);
            b = mix(b, b2, specBoost * 0.7);
            gl_FragColor = vec4(r, g, b, a);
          }
        `,
      };

      const scene = new THREE.Scene();
      const composer = new EffectComposer(renderer);

      const aspect = width / height;
      const camH = 3.2;
      const camera = new THREE.OrthographicCamera(
        -camH * aspect, camH * aspect, camH, -camH, 0.1, 100
      );
      camera.position.set(0, 0.2, 8);
      camera.lookAt(0, 0, 0);

      // ── ENVIRONMENT ──
      const cubeRT = new THREE.WebGLCubeRenderTarget(256);
      const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT);
      const envScene = new THREE.Scene();
      const wallGeo = new THREE.PlaneGeometry(40, 40);
      const walls = [
        { pos: [0, 0, -20] as const, rot: [0, 0, 0] as const, col: 0x1a4a5a },
        { pos: [0, 0, 20] as const, rot: [0, Math.PI, 0] as const, col: 0x061218 },
        { pos: [-20, 0, 0] as const, rot: [0, Math.PI / 2, 0] as const, col: 0x0f3040 },
        { pos: [20, 0, 0] as const, rot: [0, -Math.PI / 2, 0] as const, col: 0x0f3040 },
        { pos: [0, 20, 0] as const, rot: [Math.PI / 2, 0, 0] as const, col: 0xfff4e0 },
        { pos: [0, -20, 0] as const, rot: [-Math.PI / 2, 0, 0] as const, col: 0x040e14 },
      ];
      walls.forEach((w) => {
        const m = new THREE.Mesh(
          wallGeo,
          new THREE.MeshBasicMaterial({ color: w.col, side: THREE.DoubleSide })
        );
        m.position.set(...w.pos);
        m.rotation.set(...w.rot);
        envScene.add(m);
      });
      envScene.add(
        new THREE.PointLight(0xfff8e8, 80, 60).translateX(8).translateY(12).translateZ(5)
      );
      const el2 = new THREE.PointLight(0xe0f0ff, 30, 50);
      el2.position.set(-8, -2, 8);
      envScene.add(el2);
      const el3 = new THREE.PointLight(0xffffff, 40, 50);
      el3.position.set(0, 15, 0);
      envScene.add(el3);
      cubeCamera.update(renderer, envScene);

      // ── BRILLIANT CUT GEOMETRY ──
      function createBrilliantCut() {
        const N = 16;
        const girdleRadius = 2.2;
        const tableRadius = girdleRadius * 0.58;
        const totalHeight = girdleRadius / 0.75;
        const crownHeight = totalHeight * 0.14;
        const pavilionDepth = totalHeight * 0.72;
        const girdleThickness = totalHeight * 0.018;
        const tableY = crownHeight;
        const culetY = -pavilionDepth;
        const girdleTopY = girdleThickness / 2;
        const girdleBotY = -girdleThickness / 2;

        const girdleTop: THREE.Vector3[] = [];
        const girdleBot: THREE.Vector3[] = [];
        for (let i = 0; i < N * 2; i++) {
          const angle = (i / (N * 2)) * Math.PI * 2;
          const rMod = i % 2 === 0 ? 1.0 : 0.997;
          const x = girdleRadius * rMod * Math.cos(angle);
          const z = girdleRadius * rMod * Math.sin(angle);
          girdleTop.push(new THREE.Vector3(x, girdleTopY, z));
          girdleBot.push(new THREE.Vector3(x, girdleBotY, z));
        }

        const tablePoints: THREE.Vector3[] = [];
        for (let i = 0; i < N; i++) {
          const angle = (i / N) * Math.PI * 2 + Math.PI / N;
          tablePoints.push(
            new THREE.Vector3(tableRadius * Math.cos(angle), tableY, tableRadius * Math.sin(angle))
          );
        }

        const starPoints: THREE.Vector3[] = [];
        for (let i = 0; i < N; i++) {
          const angle = (i / N) * Math.PI * 2;
          const r = (tableRadius + girdleRadius) * 0.52;
          const h = crownHeight * 0.38;
          starPoints.push(new THREE.Vector3(r * Math.cos(angle), h, r * Math.sin(angle)));
        }

        const upperGirdlePoints: THREE.Vector3[] = [];
        for (let i = 0; i < N * 2; i++) {
          const angle = (i / (N * 2)) * Math.PI * 2;
          const r = girdleRadius * 0.92;
          const h = crownHeight * 0.15;
          upperGirdlePoints.push(new THREE.Vector3(r * Math.cos(angle), h, r * Math.sin(angle)));
        }

        const pavMidPoints: THREE.Vector3[] = [];
        for (let i = 0; i < N * 2; i++) {
          const angle = (i / (N * 2)) * Math.PI * 2;
          const r = girdleRadius * 0.48;
          const h = culetY * 0.45;
          pavMidPoints.push(new THREE.Vector3(r * Math.cos(angle), h, r * Math.sin(angle)));
        }

        const pavLowerPoints: THREE.Vector3[] = [];
        for (let i = 0; i < N; i++) {
          const angle = (i / N) * Math.PI * 2 + Math.PI / N;
          const r = girdleRadius * 0.2;
          const h = culetY * 0.78;
          pavLowerPoints.push(new THREE.Vector3(r * Math.cos(angle), h, r * Math.sin(angle)));
        }

        const culet = new THREE.Vector3(0, culetY, 0);
        const tableCenter = new THREE.Vector3(0, tableY, 0);
        const positions: number[] = [];

        function addTri(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) {
          const ab = new THREE.Vector3().subVectors(b, a);
          const ac = new THREE.Vector3().subVectors(c, a);
          const n = new THREE.Vector3().crossVectors(ab, ac).normalize();
          positions.push(
            a.x, a.y, a.z, n.x, n.y, n.z,
            b.x, b.y, b.z, n.x, n.y, n.z,
            c.x, c.y, c.z, n.x, n.y, n.z
          );
        }

        for (let i = 0; i < N; i++) addTri(tableCenter, tablePoints[i], tablePoints[(i + 1) % N]);

        for (let i = 0; i < N; i++) {
          const next = (i + 1) % N;
          const gi = i * 2;
          const gi1 = i * 2 + 1;
          const gi2 = ((i + 1) * 2) % (N * 2);
          addTri(tablePoints[i], starPoints[i], tablePoints[next]);
          addTri(starPoints[i], upperGirdlePoints[gi], upperGirdlePoints[gi1]);
          addTri(starPoints[i], upperGirdlePoints[gi1], starPoints[next]);
          addTri(upperGirdlePoints[gi], girdleTop[gi], girdleTop[gi1]);
          addTri(upperGirdlePoints[gi], girdleTop[gi1], upperGirdlePoints[gi1]);
          addTri(upperGirdlePoints[gi1], girdleTop[gi1], girdleTop[gi2]);
          addTri(tablePoints[next], starPoints[i], upperGirdlePoints[gi1]);
          addTri(tablePoints[next], upperGirdlePoints[gi1], upperGirdlePoints[gi2]);
        }

        for (let i = 0; i < N * 2; i++) {
          const next = (i + 1) % (N * 2);
          addTri(girdleTop[i], girdleBot[i], girdleBot[next]);
          addTri(girdleTop[i], girdleBot[next], girdleTop[next]);
        }

        for (let i = 0; i < N * 2; i++) {
          const next = (i + 1) % (N * 2);
          addTri(girdleBot[i], girdleBot[next], pavMidPoints[i]);
          addTri(pavMidPoints[i], girdleBot[next], pavMidPoints[next]);
        }
        for (let i = 0; i < N * 2; i++) {
          const next = (i + 1) % (N * 2);
          const li = Math.floor(i / 2) % N;
          const lnext = Math.floor(next / 2) % N;
          addTri(pavMidPoints[i], pavMidPoints[next], pavLowerPoints[li]);
          if (li !== lnext) {
            addTri(pavMidPoints[next], pavLowerPoints[lnext], pavLowerPoints[li]);
          }
        }
        for (let i = 0; i < N; i++) {
          addTri(pavLowerPoints[i], pavLowerPoints[(i + 1) % N], culet);
        }

        const geo = new THREE.BufferGeometry();
        const verts = new Float32Array(positions.length / 2);
        const norms = new Float32Array(positions.length / 2);
        for (let i = 0; i < positions.length / 6; i++) {
          verts[i * 3] = positions[i * 6];
          verts[i * 3 + 1] = positions[i * 6 + 1];
          verts[i * 3 + 2] = positions[i * 6 + 2];
          norms[i * 3] = positions[i * 6 + 3];
          norms[i * 3 + 1] = positions[i * 6 + 4];
          norms[i * 3 + 2] = positions[i * 6 + 5];
        }
        geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
        geo.setAttribute("normal", new THREE.Float32BufferAttribute(norms, 3));

        return {
          geometry: geo,
          params: { girdleRadius, tableRadius, crownHeight, pavilionDepth, girdleTopY, girdleBotY, tableY, culetY },
        };
      }

      const { geometry: gemGeometry, params: gp } = createBrilliantCut();

      // ── GEM MATERIAL ──
      const gemMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0.04, 0.5, 0.68),
        metalness: 0.02,
        roughness: 0.005,
        transmission: 0.6,
        thickness: 4.5,
        ior: 2.42,
        envMap: cubeRT.texture,
        envMapIntensity: 6.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.002,
        specularIntensity: 4.0,
        specularColor: new THREE.Color("#ffffff"),
        transparent: true,
        opacity: 0.97,
        side: THREE.DoubleSide,
        sheen: 0.2,
        sheenColor: new THREE.Color("#5ec8e0"),
        attenuationColor: new THREE.Color("#1a5a7a"),
        attenuationDistance: 1.0,
      });

      gemMaterial.onBeforeCompile = (shader) => {
        shader.uniforms.uDispTime = { value: 0 };
        shader.fragmentShader = "uniform float uDispTime;\n" + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <output_fragment>",
          `
          float lum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
          float dispStrength = smoothstep(0.4, 0.95, lum) * 0.18;
          float dispFlicker = 0.8 + 0.2 * sin(uDispTime * 2.5 + gl_FragCoord.x * 0.05);
          float rShift = dispStrength * dispFlicker * 1.2;
          float bShift = dispStrength * dispFlicker * 0.9;
          gl_FragColor.r += rShift * 0.4;
          gl_FragColor.g -= dispStrength * 0.1;
          gl_FragColor.b += bShift * 0.35;
          float rainbowPhase = gl_FragCoord.x * 0.03 + gl_FragCoord.y * 0.02 + uDispTime * 1.8;
          vec3 rainbow = vec3(
            sin(rainbowPhase) * 0.5 + 0.5,
            sin(rainbowPhase + 2.094) * 0.5 + 0.5,
            sin(rainbowPhase + 4.189) * 0.5 + 0.5
          );
          gl_FragColor.rgb += rainbow * dispStrength * dispFlicker * 0.3;
          #include <output_fragment>
          `
        );
        gemMaterial.userData.shader = shader;
      };

      const gem = new THREE.Mesh(gemGeometry, gemMaterial);
      gem.position.y = 0;
      gem.scale.set(0.34, 0.34, 0.34);
      scene.add(gem);

      // Inner glow shell
      const innerMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0.1, 0.72, 0.82),
        emissive: new THREE.Color(0.0, 0.22, 0.32),
        emissiveIntensity: 1.0,
        transparent: true,
        opacity: 0.14,
        roughness: 0.0,
        metalness: 0.0,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const innerGem = new THREE.Mesh(gemGeometry, innerMat);
      innerGem.scale.set(0.88 * 0.34, 0.88 * 0.34, 0.88 * 0.34);
      innerGem.position.y = 0;
      scene.add(innerGem);

      // ── GOLD CAGE ──
      const cageGroup = new THREE.Group();
      const tubeR = gp.girdleRadius * 0.035;
      const goldMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#D4A84C"),
        metalness: 1.0,
        roughness: 0.08,
        envMap: cubeRT.texture,
        envMapIntensity: 2.5,
      });

      const girdleRing = new THREE.Mesh(
        new THREE.TorusGeometry(gp.girdleRadius + tubeR * 0.3, tubeR, 12, 64),
        goldMat
      );
      girdleRing.rotation.x = Math.PI / 2;
      cageGroup.add(girdleRing);

      const tableRing = new THREE.Mesh(
        new THREE.TorusGeometry(gp.tableRadius + tubeR * 0.3, tubeR, 12, 64),
        goldMat
      );
      tableRing.rotation.x = Math.PI / 2;
      tableRing.position.y = gp.tableY;
      cageGroup.add(tableRing);

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
        const tx = gp.tableRadius * Math.cos(angle);
        const tz = gp.tableRadius * Math.sin(angle);
        const gx = gp.girdleRadius * Math.cos(angle);
        const gz = gp.girdleRadius * Math.sin(angle);
        const crownPath = new THREE.LineCurve3(
          new THREE.Vector3(tx, gp.tableY, tz),
          new THREE.Vector3(gx, 0, gz)
        );
        cageGroup.add(new THREE.Mesh(new THREE.TubeGeometry(crownPath, 8, tubeR, 8, false), goldMat));
        const pavPath = new THREE.LineCurve3(
          new THREE.Vector3(gx, 0, gz),
          new THREE.Vector3(0, gp.culetY, 0)
        );
        cageGroup.add(new THREE.Mesh(new THREE.TubeGeometry(pavPath, 10, tubeR, 8, false), goldMat));
      }
      cageGroup.scale.set(0.34, 0.34, 0.34);
      cageGroup.position.y = 0;
      scene.add(cageGroup);

      // ── CAGE BLOOM ──
      const cageBloomGroup = new THREE.Group();
      const bloomMat = new THREE.MeshBasicMaterial({
        color: 0xc9a84c,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const bloomTubeR = tubeR * 1.8;
      const bloomGirdleRing = new THREE.Mesh(
        new THREE.TorusGeometry(gp.girdleRadius + bloomTubeR * 0.3, bloomTubeR, 8, 48),
        bloomMat
      );
      bloomGirdleRing.rotation.x = Math.PI / 2;
      cageBloomGroup.add(bloomGirdleRing);
      const bloomTableRing = new THREE.Mesh(
        new THREE.TorusGeometry(gp.tableRadius + bloomTubeR * 0.3, bloomTubeR, 8, 48),
        bloomMat
      );
      bloomTableRing.rotation.x = Math.PI / 2;
      bloomTableRing.position.y = gp.tableY;
      cageBloomGroup.add(bloomTableRing);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
        const tx = gp.tableRadius * Math.cos(angle);
        const tz = gp.tableRadius * Math.sin(angle);
        const gx = gp.girdleRadius * Math.cos(angle);
        const gz = gp.girdleRadius * Math.sin(angle);
        const cp = new THREE.LineCurve3(
          new THREE.Vector3(tx, gp.tableY, tz),
          new THREE.Vector3(gx, 0, gz)
        );
        cageBloomGroup.add(new THREE.Mesh(new THREE.TubeGeometry(cp, 6, bloomTubeR, 6, false), bloomMat));
        const pp = new THREE.LineCurve3(
          new THREE.Vector3(gx, 0, gz),
          new THREE.Vector3(0, gp.culetY, 0)
        );
        cageBloomGroup.add(new THREE.Mesh(new THREE.TubeGeometry(pp, 8, bloomTubeR, 6, false), bloomMat));
      }
      cageBloomGroup.scale.set(0.34, 0.34, 0.34);
      cageBloomGroup.position.y = 0;
      scene.add(cageBloomGroup);

      // ── LIGHTING ──
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
      const tealCore = new THREE.PointLight(0x00d4ff, 2.5, 8);
      tealCore.position.set(0, 0, 0);
      scene.add(tealCore);

      // ── SPARKLE PARTICLES ──
      const SPARKLE_COUNT = 35;
      const _sPos = new Float32Array(SPARKLE_COUNT * 3);
      const _sSize = new Float32Array(SPARKLE_COUNT);
      const _sVel: { x: number; y: number; z: number }[] = [];
      const _sLife: number[] = [];
      const _sMaxL: number[] = [];
      const GEM_RADIUS = 0.78;

      function _resetSparkle(i: number) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = GEM_RADIUS * (0.95 + Math.random() * 0.15);
        _sPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        _sPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        _sPos[i * 3 + 2] = r * Math.cos(phi);
        const outward = 0.003;
        _sVel[i] = {
          x: _sPos[i * 3] * outward + (Math.random() - 0.5) * 0.003,
          y: -0.008 - Math.random() * 0.006,
          z: _sPos[i * 3 + 2] * outward + (Math.random() - 0.5) * 0.003,
        };
        const life = 80 + Math.floor(Math.random() * 100);
        _sLife[i] = life;
        _sMaxL[i] = life;
        _sSize[i] = 1.5 + Math.random() * 2.0;
      }

      for (let i = 0; i < SPARKLE_COUNT; i++) {
        _resetSparkle(i);
        _sLife[i] = Math.floor(Math.random() * _sMaxL[i]);
      }

      const _sparkleGeo = new THREE.BufferGeometry();
      _sparkleGeo.setAttribute("position", new THREE.BufferAttribute(_sPos, 3));
      _sparkleGeo.setAttribute("size", new THREE.BufferAttribute(_sSize, 1));

      const _sparkleMat = new THREE.ShaderMaterial({
        uniforms: {
          uGold: { value: new THREE.Color("#E8C96A") },
          uIce: { value: new THREE.Color("#c8f0ff") },
          uTime: { value: 0.0 },
        },
        vertexShader: `
          attribute float size;
          varying float vSize;
          void main() {
            vSize = size;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (220.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3 uGold;
          uniform vec3 uIce;
          uniform float uTime;
          varying float vSize;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            float alpha = 1.0 - smoothstep(0.0, 0.5, d);
            alpha = pow(alpha, 2.2);
            if (alpha < 0.015) discard;
            float cross = 1.0 - smoothstep(0.0, 0.08, min(abs(uv.x), abs(uv.y)));
            alpha = max(alpha, cross * 0.6);
            float t = sin(vSize * 3.1 + uTime) * 0.5 + 0.5;
            vec3 col = mix(uGold, uIce, t);
            gl_FragColor = vec4(col, alpha * 0.75);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const _sparklePoints = new THREE.Points(_sparkleGeo, _sparkleMat);
      scene.add(_sparklePoints);

      // ── POST PROCESSING ──
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);
      const rimHaloPass = new ShaderPass(RimHaloShader);
      rimHaloPass.uniforms.uResolution.value.set(
        width * Math.min(window.devicePixelRatio, 2),
        height * Math.min(window.devicePixelRatio, 2)
      );
      composer.addPass(rimHaloPass);
      const chromaPass = new ShaderPass(ChromaticAberrationShader);
      chromaPass.renderToScreen = true;
      composer.addPass(chromaPass);

      // ── MOUSE INTERACTION ──
      let targetRotY = 0;
      let targetRotX = 0;
      let currentRotY = 0;
      let currentRotX = 0;
      let velY = 0;
      let velX = 0;
      const stiffness = 0.06;
      const damping = 0.82;

      const onMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        targetRotY = nx * 12 * (Math.PI / 180);
        targetRotX = -ny * 6 * (Math.PI / 180);
      };
      const onMouseLeave = () => {
        targetRotY = 0;
        targetRotX = 0;
      };
      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mouseleave", onMouseLeave);

      // ── ANIMATION LOOP ──
      const clock = new THREE.Clock();
      let idleAngle = 0;

      function smoothstepJS(edge0: number, edge1: number, x: number) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
      }

      function animate() {
        if (destroyed) return;
        const elapsed = clock.getElapsedTime();
        idleAngle += 0.8 * (Math.PI / 180);
        const isHovering = targetRotY !== 0 || targetRotX !== 0;
        if (isHovering) idleAngle += 0.6 * (Math.PI / 180);

        velY = velY * damping + (targetRotY - currentRotY) * stiffness;
        velX = velX * damping + (targetRotX - currentRotX) * stiffness;
        currentRotY += velY;
        currentRotX += velX;

        const ry = idleAngle + currentRotY;
        const rx = currentRotX + 0.175;

        gem.rotation.y = ry;
        gem.rotation.x = rx;
        cageGroup.rotation.y = ry;
        cageGroup.rotation.x = rx;
        cageBloomGroup.rotation.y = ry;
        cageBloomGroup.rotation.x = rx;
        innerGem.rotation.y = ry;
        innerGem.rotation.x = rx;

        gem.position.y = 0;
        innerGem.position.y = 0;
        cageGroup.position.y = 0;
        cageBloomGroup.position.y = 0;

        innerMat.emissiveIntensity = 0.8 + Math.sin(elapsed * 1.8) * 0.3;

        if (gemMaterial.userData.shader) {
          gemMaterial.userData.shader.uniforms.uDispTime.value = elapsed;
        }

        tealCore.position.set(Math.sin(elapsed * 0.5) * 0.2, Math.cos(elapsed * 0.4) * 0.15, 0);
        tealCore.intensity = 2.2 + Math.sin(elapsed * 1.5) * 0.4;

        bloomMat.opacity = 0.04 + Math.sin(elapsed * 1.4) * 0.025;

        rimHaloPass.uniforms.uTime.value = elapsed;
        rimHaloPass.uniforms.uHaloIntensity.value = 0.6 + 0.15 * Math.sin(elapsed * 1.2);

        chromaPass.uniforms.uTime.value = elapsed;
        const flareCycle = elapsed % 5.0;
        const flareActive =
          flareCycle > 0 && flareCycle < 0.8
            ? smoothstepJS(0, 0.3, flareCycle) * (1.0 - smoothstepJS(0.5, 0.8, flareCycle))
            : 0;
        chromaPass.uniforms.uIntensity.value = 0.0035 + flareActive * 0.006;

        // Sparkle tick
        _sparkleMat.uniforms.uTime.value += 0.03;
        for (let i = 0; i < SPARKLE_COUNT; i++) {
          _sLife[i]--;
          if (_sLife[i] <= 0) {
            _resetSparkle(i);
          } else {
            _sPos[i * 3] += _sVel[i].x;
            _sPos[i * 3 + 1] += _sVel[i].y;
            _sPos[i * 3 + 2] += _sVel[i].z;
            const frac = _sLife[i] / _sMaxL[i];
            const fade = frac < 0.2 ? frac / 0.2 : 1.0;
            _sSize[i] = (1.2 + Math.random() * 1.8) * frac * fade;
          }
        }
        _sparkleGeo.attributes.position.needsUpdate = true;
        _sparkleGeo.attributes.size.needsUpdate = true;

        composer.render();
      }

      renderer.setAnimationLoop(animate);

      // ── CLEANUP ──
      cleanupRef.current = () => {
        destroyed = true;
        renderer.setAnimationLoop(null);
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseleave", onMouseLeave);
        renderer.dispose();
        composer.dispose();
        gemGeometry.dispose();
        gemMaterial.dispose();
        innerMat.dispose();
        goldMat.dispose();
        bloomMat.dispose();
        _sparkleGeo.dispose();
        _sparkleMat.dispose();
        if (canvas.parentElement) {
          canvas.parentElement.removeChild(canvas);
        }
      };
    };

    init();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        overflow: "visible",
        background: "transparent",
        margin: "0 auto",
      }}
    />
  );
};

export default BrilliantGem;
