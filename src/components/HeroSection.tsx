import { useRef, useEffect } from "react";
import { useWave } from "@/components/GemscapeWave";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown, Star } from "lucide-react";
import { motion } from "framer-motion";
import * as THREE from "three";

/* ── Inline 3D Gem — full BrilliantGem pipeline at small size ── */
function InlineGem({ size = 88 }: { size?: number }) {
  const mountRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let destroyed = false;

    const init = async () => {
      const { EffectComposer } = await import("three/examples/jsm/postprocessing/EffectComposer.js");
      const { RenderPass } = await import("three/examples/jsm/postprocessing/RenderPass.js");
      const { ShaderPass } = await import("three/examples/jsm/postprocessing/ShaderPass.js");
      if (destroyed) return;

      const canvas = document.createElement("canvas");
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      canvas.style.background = "transparent";
      el.appendChild(canvas);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      /* ── Rim Halo Shader ── */
      const RimHaloShader = {
        uniforms: {
          tDiffuse: { value: null },
          uResolution: { value: new THREE.Vector2(size, size) },
          uTime: { value: 0 },
          uHaloColor: { value: new THREE.Color(0.15, 0.75, 0.85) },
          uHaloIntensity: { value: 0.7 },
        },
        vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `
          uniform sampler2D tDiffuse;uniform vec2 uResolution;uniform float uTime;
          uniform vec3 uHaloColor;uniform float uHaloIntensity;varying vec2 vUv;
          void main(){
            vec4 center=texture2D(tDiffuse,vUv);
            float cLum=dot(center.rgb,vec3(0.299,0.587,0.114));
            float eSum=0.0;float samps=0.0;vec2 tx=1.0/uResolution;
            for(float i=0.0;i<16.0;i++){
              float a=i*6.2831853/16.0;vec2 d=vec2(cos(a),sin(a));
              float s1=dot(texture2D(tDiffuse,vUv+d*tx*2.0).rgb,vec3(0.299,0.587,0.114));
              eSum+=abs(cLum-s1);samps+=1.0;
              float s2=dot(texture2D(tDiffuse,vUv+d*tx*4.0).rgb,vec3(0.299,0.587,0.114));
              eSum+=abs(cLum-s2)*0.6;samps+=0.6;
            }
            float edge=smoothstep(0.02,0.12,eSum/samps);float oE=0.0;float oS=0.0;
            for(float i=0.0;i<12.0;i++){
              float a=i*6.2831853/12.0;vec2 d=vec2(cos(a),sin(a));
              float s=dot(texture2D(tDiffuse,vUv+d*tx*7.0).rgb,vec3(0.299,0.587,0.114));
              oE+=abs(cLum-s);oS+=1.0;
            }
            float oHalo=smoothstep(0.015,0.08,oE/oS)*0.4;
            float tH=max(edge,oHalo);
            float pulse=0.85+0.15*sin(uTime*1.6);
            vec3 hCol=mix(uHaloColor,vec3(0.85,0.95,1.0),edge*0.6);
            vec3 res=center.rgb+hCol*tH*uHaloIntensity*pulse;
            gl_FragColor=vec4(res,center.a);
          }`,
      };

      /* ── Chromatic Aberration Shader ── */
      const ChromaticAberrationShader = {
        uniforms: {
          tDiffuse: { value: null },
          uIntensity: { value: 0.0035 },
          uTime: { value: 0 },
        },
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `
          uniform sampler2D tDiffuse;uniform float uIntensity;uniform float uTime;varying vec2 vUv;
          void main(){
            vec2 c=vec2(0.5);vec2 dir=vUv-c;float dist=length(dir);
            float ef=smoothstep(0.05,0.5,dist);float pulse=1.0+0.15*sin(uTime*1.2);
            float off=uIntensity*ef*pulse;
            float r=texture2D(tDiffuse,vUv+dir*off*1.2).r;
            float g=texture2D(tDiffuse,vUv).g;
            float b=texture2D(tDiffuse,vUv-dir*off*1.0).b;
            float a=texture2D(tDiffuse,vUv).a;
            float lum=dot(vec3(r,g,b),vec3(0.299,0.587,0.114));
            float sb=smoothstep(0.55,0.95,lum);
            float eo=uIntensity*2.5*sb*pulse;
            float r2=texture2D(tDiffuse,vUv+dir*(off+eo)*1.4).r;
            float b2=texture2D(tDiffuse,vUv-dir*(off+eo)*1.2).b;
            r=mix(r,r2,sb*0.7);b=mix(b,b2,sb*0.7);
            gl_FragColor=vec4(r,g,b,a);
          }`,
      };

      const scene = new THREE.Scene();
      const composer = new EffectComposer(renderer);

      const aspect = 1;
      const camH = 3.2;
      const camera = new THREE.OrthographicCamera(-camH * aspect, camH * aspect, camH, -camH, 0.1, 100);
      camera.position.set(0, 0.2, 8);
      camera.lookAt(0, 0, 0);

      /* ── Environment Map ── */
      const envScene = new THREE.Scene();
      const cubeRT = new THREE.WebGLCubeRenderTarget(256);
      const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT);
      const wallGeo = new THREE.PlaneGeometry(40, 40);
      const walls: { pos: [number, number, number]; rot: [number, number, number]; col: number }[] = [
        { pos: [0, 20, 0], rot: [Math.PI / 2, 0, 0], col: 0xffffff },
        { pos: [0, -20, 0], rot: [-Math.PI / 2, 0, 0], col: 0x05181e },
        { pos: [0, 0, -20], rot: [0, 0, 0], col: 0x1a8a9e },
        { pos: [0, 0, 20], rot: [0, Math.PI, 0], col: 0x1a8a9e },
        { pos: [-20, 0, 0], rot: [0, Math.PI / 2, 0], col: 0x3cc8b8 },
        { pos: [20, 0, 0], rot: [0, -Math.PI / 2, 0], col: 0x3cc8b8 },
      ];
      walls.forEach((w) => {
        const m = new THREE.Mesh(wallGeo, new THREE.MeshBasicMaterial({ color: w.col, side: THREE.DoubleSide }));
        m.position.set(...w.pos);
        m.rotation.set(...w.rot);
        envScene.add(m);
      });
      envScene.add(new THREE.PointLight(0xfff8e8, 80, 60).translateX(8).translateY(12).translateZ(5));
      envScene.add((() => { const l = new THREE.PointLight(0xe0f0ff, 30, 50); l.position.set(-8, -2, 8); return l; })());
      envScene.add((() => { const l = new THREE.PointLight(0xffffff, 40, 50); l.position.set(0, 15, 0); return l; })());
      cubeCamera.update(renderer, envScene);
      scene.environment = cubeRT.texture;

      /* ── Brilliant Cut Geometry ── */
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
          tablePoints.push(new THREE.Vector3(tableRadius * Math.cos(angle), tableY, tableRadius * Math.sin(angle)));
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
          positions.push(a.x, a.y, a.z, n.x, n.y, n.z, b.x, b.y, b.z, n.x, n.y, n.z, c.x, c.y, c.z, n.x, n.y, n.z);
        }

        for (let i = 0; i < N; i++) addTri(tableCenter, tablePoints[i], tablePoints[(i + 1) % N]);
        for (let i = 0; i < N; i++) {
          const next = (i + 1) % N;
          const gi = i * 2, gi1 = i * 2 + 1, gi2 = ((i + 1) * 2) % (N * 2);
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
          if (li !== lnext) addTri(pavMidPoints[next], pavLowerPoints[lnext], pavLowerPoints[li]);
        }
        for (let i = 0; i < N; i++) addTri(pavLowerPoints[i], pavLowerPoints[(i + 1) % N], culet);

        const geo = new THREE.BufferGeometry();
        const verts = new Float32Array(positions.length / 2);
        const norms = new Float32Array(positions.length / 2);
        for (let i = 0; i < positions.length / 6; i++) {
          verts[i * 3] = positions[i * 6]; verts[i * 3 + 1] = positions[i * 6 + 1]; verts[i * 3 + 2] = positions[i * 6 + 2];
          norms[i * 3] = positions[i * 6 + 3]; norms[i * 3 + 1] = positions[i * 6 + 4]; norms[i * 3 + 2] = positions[i * 6 + 5];
        }
        geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
        geo.setAttribute("normal", new THREE.Float32BufferAttribute(norms, 3));
        return geo;
      }

      const gemGeometry = createBrilliantCut();

      /* ── Gem Material ── */
      const gemMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#1a8a9e"),
        metalness: 0.0,
        roughness: 0.03,
        transmission: 0.92,
        thickness: 3.5,
        ior: 2.42,
        envMap: cubeRT.texture,
        envMapIntensity: 2.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        specularIntensity: 1.0,
        specularColor: new THREE.Color("#ffffff"),
        reflectivity: 1.0,
        transparent: false,
        opacity: 1.0,
        side: THREE.DoubleSide,
        attenuationColor: new THREE.Color("#0d5e6e"),
        attenuationDistance: 2.0,
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
          vec3 rainbow = vec3(sin(rainbowPhase)*0.5+0.5, sin(rainbowPhase+2.094)*0.5+0.5, sin(rainbowPhase+4.189)*0.5+0.5);
          gl_FragColor.rgb += rainbow * dispStrength * dispFlicker * 0.3;
          #include <output_fragment>
          `
        );
        gemMaterial.userData.shader = shader;
      };

      const gemGroup = new THREE.Group();
      const gem = new THREE.Mesh(gemGeometry, gemMaterial);
      gemGroup.add(gem);

      /* ── Gold Wireframe ── */
      const edgesGeo = new THREE.EdgesGeometry(gemGeometry, 1);
      const wireframe = new THREE.LineSegments(
        edgesGeo,
        new THREE.LineBasicMaterial({ color: "#C9A84C", transparent: true, opacity: 0.55, linewidth: 1 })
      );
      gemGroup.add(wireframe);

      gemGroup.scale.set(0.34, 0.34, 0.34);
      scene.add(gemGroup);

      /* ── Lighting ── */
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(-4, 5, 3);
      scene.add(keyLight);
      const fillLight = new THREE.PointLight(0x7ecad6, 0.8);
      fillLight.position.set(4, 0, 3);
      scene.add(fillLight);
      const rimLight = new THREE.PointLight(0xfff5e6, 0.5);
      rimLight.position.set(0, -3, -2);
      scene.add(rimLight);
      scene.add(new THREE.AmbientLight(0x1a3040, 0.3));

      /* ── Sparkle Particles ── */
      const SPARKLE_COUNT = 12;
      const GEM_RADIUS = 0.78 * 1.2;
      const _sPos = new Float32Array(SPARKLE_COUNT * 3);
      const _sSize = new Float32Array(SPARKLE_COUNT);
      const _sPhase: number[] = [];
      const _sMaxLife: number[] = [];
      const _sLife: number[] = [];

      function _resetSparkle(i: number) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = GEM_RADIUS * (0.85 + Math.random() * 0.35);
        _sPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        _sPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        _sPos[i * 3 + 2] = r * Math.cos(phi);
        _sMaxLife[i] = 36;
        _sLife[i] = _sMaxLife[i];
        _sPhase[i] = Math.random() * 100;
        _sSize[i] = 0;
      }

      for (let i = 0; i < SPARKLE_COUNT; i++) {
        _resetSparkle(i);
        _sPhase[i] = Math.random() * 120;
      }

      const _sparkleGeo = new THREE.BufferGeometry();
      _sparkleGeo.setAttribute("position", new THREE.BufferAttribute(_sPos, 3));
      _sparkleGeo.setAttribute("size", new THREE.BufferAttribute(_sSize, 1));

      const _sparkleMat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color("#ffffff") } },
        vertexShader: `
          attribute float size;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (220.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            float alpha = 1.0 - smoothstep(0.0, 0.5, d);
            alpha = pow(alpha, 2.5);
            if (alpha < 0.01) discard;
            gl_FragColor = vec4(uColor, alpha * 0.9);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const _sparklePoints = new THREE.Points(_sparkleGeo, _sparkleMat);
      scene.add(_sparklePoints);

      /* ── Post Processing ── */
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rimHaloPass = new ShaderPass(RimHaloShader);
      rimHaloPass.uniforms.uResolution.value.set(size * dpr, size * dpr);
      composer.addPass(rimHaloPass);
      const chromaPass = new ShaderPass(ChromaticAberrationShader);
      chromaPass.renderToScreen = true;
      composer.addPass(chromaPass);

      /* ── Animation ── */
      const clock = new THREE.Clock();
      const ROTATION_SPEED = (2 * Math.PI) / 14;

      function smoothstepJS(edge0: number, edge1: number, x: number) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
      }

      function animate() {
        if (destroyed) return;
        const elapsed = clock.getElapsedTime();

        const ry = elapsed * ROTATION_SPEED;
        const bob = Math.sin(elapsed * 0.5) * 0.08;
        gemGroup.rotation.y = ry;
        gemGroup.rotation.x = 0.175;
        gemGroup.position.y = bob;

        if (gemMaterial.userData.shader) {
          gemMaterial.userData.shader.uniforms.uDispTime.value = elapsed;
        }
        rimHaloPass.uniforms.uTime.value = elapsed;
        rimHaloPass.uniforms.uHaloIntensity.value = 0.6 + 0.15 * Math.sin(elapsed * 1.2);
        chromaPass.uniforms.uTime.value = elapsed;

        const flareCycle = elapsed % 5.0;
        const flareActive = flareCycle > 0 && flareCycle < 0.8
          ? smoothstepJS(0, 0.3, flareCycle) * (1.0 - smoothstepJS(0.5, 0.8, flareCycle))
          : 0;
        chromaPass.uniforms.uIntensity.value = 0.0035 + flareActive * 0.006;

        for (let i = 0; i < SPARKLE_COUNT; i++) {
          if (_sPhase[i] > 0) { _sPhase[i]--; _sSize[i] = 0; continue; }
          _sLife[i]--;
          if (_sLife[i] <= 0) {
            _resetSparkle(i);
            _sPhase[i] = 30 + Math.random() * 90;
            _sSize[i] = 0;
          } else {
            const life = _sLife[i];
            const max = _sMaxLife[i];
            const progress = 1 - life / max;
            let brightness: number;
            if (progress < 0.167) brightness = progress / 0.167;
            else if (progress < 0.5) brightness = 1.0;
            else brightness = 1.0 - (progress - 0.5) / 0.5;
            _sSize[i] = brightness * (1.5 + Math.random() * 0.5);
          }
        }
        _sparkleGeo.attributes.position.needsUpdate = true;
        _sparkleGeo.attributes.size.needsUpdate = true;

        composer.render();
      }

      renderer.setAnimationLoop(animate);

      /* ── Cleanup ── */
      return () => {
        destroyed = true;
        renderer.setAnimationLoop(null);
        renderer.dispose();
        composer.dispose();
        gemGeometry.dispose();
        gemMaterial.dispose();
        edgesGeo.dispose();
        _sparkleGeo.dispose();
        _sparkleMat.dispose();
        if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
      };
    };

    let cleanup: (() => void) | undefined;
    init().then((c) => { cleanup = c as (() => void) | undefined; });

    return () => {
      destroyed = true;
      cleanup?.();
    };
  }, [size]);

  return (
    <span
      ref={mountRef}
      data-inline-gem
      style={{
        display: "inline-block",
        width: size,
        height: size,
        verticalAlign: "middle",
        position: "relative",
        top: -4,
      }}
    />
  );
}

/* ── Animated Stars ── */
const AnimatedStars = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
    <div style={{ display: "flex", gap: 4 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 1.8 + i * 0.12, type: "spring", stiffness: 300, damping: 15 }}
          style={{ color: "#C9A84C", fontSize: 22, display: "inline-block" }}
        >
          <Star size={20} fill="#C9A84C" strokeWidth={0} />
        </motion.span>
      ))}
    </div>
    <motion.span
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2.4, duration: 0.6 }}
      style={{
        fontSize: 13,
        color: "rgba(255,255,255,0.5)",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 400,
      }}
    >
      Rated 5 stars by over <strong style={{ color: "#C9A84C", fontWeight: 600 }}>1,000+</strong> travellers
    </motion.span>
  </div>
);

/* ── Stat Cards (right column) ── */
const stats = [
  { value: "365", label: "Beaches in Antigua" },
  { value: "500+", label: "Happy Travellers" },
  { value: "5★", label: "Average Rating" },
];

const StatCards = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
    {stats.map((s, i) => (
      <motion.div
        key={s.label}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 + i * 0.2, duration: 0.7, ease: "easeOut" }}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 16,
          padding: "24px 32px",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36,
            fontWeight: 600,
            background: "linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.1,
          }}
        >
          {s.value}
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
            marginTop: 4,
            letterSpacing: ".04em",
          }}
        >
          {s.label}
        </div>
      </motion.div>
    ))}
  </div>
);

/* ── Hero Section ── */
const HeroSection = () => {
  const { navigateTo } = useWave();
  const heroRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    video.muted = true;
    const attemptPlay = () => {
      video.play().catch((err) => {
        console.warn("Hero video autoplay blocked:", err.message);
        const playOnInteraction = () => {
          video.play().catch(() => {});
          document.removeEventListener("click", playOnInteraction);
          document.removeEventListener("touchstart", playOnInteraction);
          document.removeEventListener("keydown", playOnInteraction);
        };
        document.addEventListener("click", playOnInteraction, { once: true });
        document.addEventListener("touchstart", playOnInteraction, { once: true });
        document.addEventListener("keydown", playOnInteraction, { once: true });
      });
    };
    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.addEventListener("canplay", attemptPlay, { once: true });
    }
    return () => {
      video.removeEventListener("canplay", attemptPlay);
    };
  }, []);

  const gemSize = isMobile ? 64 : 88;

  return (
    <section
      ref={heroRef}
      className="hero-cinematic"
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ═══ LAYER 1 — DRONE VIDEO ═══ */}
      <video
        ref={heroVideoRef}
        src="/videos/antigua-aerial.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/images/antigua-hero-poster.jpg"
        className="hero-video"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          opacity: 0.65,
        }}
        onError={(e) => {
          (e.currentTarget as HTMLVideoElement).style.display = "none";
        }}
      />

      {/* ═══ LAYER 2A — LINEAR GRADIENT OVERLAY ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(5,24,30,0.50) 0%, rgba(5,24,30,0.35) 35%, rgba(5,24,30,0.55) 70%, rgba(5,24,30,0.90) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ═══ LAYER 2B — TEAL AMBIENT GLOW ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(26,138,158,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* ═══ LAYER 3 — TWO-COLUMN GRID ═══ */}
      <div className="hero-grid-layout" style={{ position: "relative", zIndex: 3, width: "100%", height: "100%" }}>
        {/* LEFT — TEXT */}
        <div className="hero-text-col">
          <span
            style={{
              fontSize: 11,
              letterSpacing: ".18em",
              color: "rgba(201,168,76,0.75)",
              textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              marginBottom: 14,
            }}
          >
            ANTIGUA · CARIBBEAN
          </span>

          {/* Headline with inline 3D gem */}
          <h1
            className="hero-headline"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#fff",
              fontWeight: 400,
              lineHeight: 1.1,
              margin: 0,
              maxWidth: 700,
            }}
          >
            Where Every Journey
            <br />
            {"Becomes a "}
            <InlineGem size={gemSize} />
            <span
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                background: "linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              .
            </span>
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.75,
              maxWidth: 480,
              marginTop: 16,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Antigua, privately. Beautifully. Entirely on your terms.
          </p>

          <AnimatedStars />

          <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
            <button
              onClick={() => navigateTo("/book")}
              style={{
                background: "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".12em",
                padding: "14px 28px",
                border: "none",
                borderRadius: 3,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Book Now
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("services");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                background: "transparent",
                border: "1px solid rgba(201,168,76,0.5)",
                color: "#C9A84C",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".12em",
                padding: "14px 28px",
                borderRadius: 3,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Explore Services
            </button>
          </div>
        </div>

        {/* RIGHT — STAT CARDS */}
        <div className="hero-right-col">
          <StatCards />
        </div>
      </div>

      {/* ═══ SCROLL CHEVRON ═══ */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <ChevronDown size={28} color="rgba(212,173,124,0.7)" className="hero-chevron-bounce" />
      </div>

      <style>{`
        .hero-grid-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          align-items: center;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 48px;
          gap: 48px;
        }
        .hero-text-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .hero-headline {
          font-size: clamp(40px, 5vw, 72px);
        }
        .hero-right-col {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          max-width: 360px;
          justify-self: center;
        }

        @keyframes chevronBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .hero-chevron-bounce {
          animation: chevronBounce 2s ease-in-out infinite;
        }

        /* Tablet */
        @media (min-width: 769px) and (max-width: 1024px) {
          .hero-grid-layout {
            padding: 0 24px;
            gap: 24px;
            grid-template-columns: 1.2fr 0.8fr;
          }
          .hero-headline {
            font-size: clamp(28px, 4.5vw, 48px) !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .hero-grid-layout {
            grid-template-columns: 1fr;
            padding: 0 20px;
            gap: 24px;
            justify-items: center;
            align-content: center;
          }
          .hero-right-col {
            order: 1;
            max-width: 100%;
            width: 100%;
          }
          .hero-text-col {
            align-items: center;
            text-align: center;
          }
          .hero-headline {
            font-size: clamp(24px, 7vw, 36px) !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
