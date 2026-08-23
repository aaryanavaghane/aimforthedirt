import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AtmosWebGLSceneProps {
  scrollProgress: number; // 0.0 to 1.0 from GSAP ScrollTrigger
  currentPhase: number;
}

export const AtmosWebGLScene: React.FC<AtmosWebGLSceneProps> = ({ scrollProgress }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rocketGroupRef = useRef<THREE.Group | null>(null);
  const cloudGroupRef = useRef<THREE.Group | null>(null);
  const starFieldRef = useRef<THREE.Points | null>(null);
  const warpLinesRef = useRef<THREE.LineSegments | null>(null);
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
  const moonGlowRef = useRef<THREE.Mesh | null>(null);
  const thrusterPlumeRef = useRef<THREE.Mesh | null>(null);
  const thrusterLightRef = useRef<THREE.PointLight | null>(null);

  // Mouse parallax interpolation
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x061536, 0.015); // Deep electric midnight blue atmospheric fog

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 14);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setClearColor(0x020408, 1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- 2. LIGHTING (Cool Midnight Blue, Rich Teal & Shimmering Silver Starlight) ---
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(12, 20, 10);
    scene.add(keyLight);

    const blueRimLight = new THREE.DirectionalLight(0x0d38e8, 3.2);
    blueRimLight.position.set(-10, -5, -8);
    scene.add(blueRimLight);

    const tealFillLight = new THREE.DirectionalLight(0x00f5ff, 1.6);
    tealFillLight.position.set(0, -10, 5);
    scene.add(tealFillLight);

    const thrusterLight = new THREE.PointLight(0x00f5ff, 3.5, 18);
    thrusterLight.position.set(0, -2.8, 0);
    scene.add(thrusterLight);
    thrusterLightRef.current = thrusterLight;

    // --- 3. PROCEDURAL TEXTURES ---
    // Volumetric cloud puff texture (Deep Royal Blue & Misty White)
    const createCloudTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      grad.addColorStop(0.35, 'rgba(13, 56, 232, 0.55)');
      grad.addColorStop(0.7, 'rgba(8, 27, 75, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(canvas);
    };

    // Photorealistic Moon surface texture with high-contrast crater relief
    const createMoonTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#1e2533';
      ctx.fillRect(0, 0, 1024, 512);

      // Lunar Maria & Highland variations
      for (let i = 0; i < 450; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const r = Math.random() * 50 + 5;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        const isLight = Math.random() < 0.45;
        grad.addColorStop(0, isLight ? 'rgba(241, 245, 249, 0.28)' : 'rgba(8, 12, 22, 0.5)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // High-contrast craters with sharp rim shadows
      for (let i = 0; i < 110; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const r = Math.random() * 18 + 3;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#060a12';
        ctx.fill();
        ctx.lineWidth = Math.max(1, r * 0.22);
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.75)';
        ctx.stroke();
      }

      return new THREE.CanvasTexture(canvas);
    };

    // --- 4. SPACECRAFT / LANDER 3D MODEL (Aerospace Obsidian & Silver Chrome) ---
    const rocketGroup = new THREE.Group();
    rocketGroupRef.current = rocketGroup;

    // Fuselage / Command Module (Metallic Titanium Obsidian with Silver Polish)
    const hullGeom = new THREE.ConeGeometry(0.85, 3.2, 32);
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      metalness: 0.9,
      roughness: 0.18,
      emissive: 0x061536,
      emissiveIntensity: 0.25,
    });
    const hullMesh = new THREE.Mesh(hullGeom, hullMat);
    hullMesh.position.y = 0.6;
    rocketGroup.add(hullMesh);

    // Avionics / Cockpit Visor Strip (Brilliant Electric Cyan Glow)
    const visorGeom = new THREE.CylinderGeometry(0.52, 0.68, 0.45, 32, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    const visorMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      side: THREE.DoubleSide,
    });
    const visorMesh = new THREE.Mesh(visorGeom, visorMat);
    visorMesh.position.set(0, 1.1, 0.15);
    visorMesh.rotation.y = Math.PI / 6;
    rocketGroup.add(visorMesh);

    // Service Module Base
    const baseGeom = new THREE.CylinderGeometry(0.85, 0.95, 0.8, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x080e18,
      metalness: 0.92,
      roughness: 0.3,
    });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.y = -1.1;
    rocketGroup.add(baseMesh);

    // Aerodynamic Stabilizer Fins (4 fins)
    for (let i = 0; i < 4; i++) {
      const finGeom = new THREE.BoxGeometry(0.08, 1.2, 0.85);
      const finMat = new THREE.MeshStandardMaterial({
        color: 0x0a2396,
        metalness: 0.8,
        roughness: 0.25,
      });
      const finMesh = new THREE.Mesh(finGeom, finMat);
      const angle = (i * Math.PI) / 2;
      finMesh.position.set(Math.cos(angle) * 0.95, -1.3, Math.sin(angle) * 0.95);
      finMesh.rotation.y = -angle;
      finMesh.rotation.z = Math.PI / 10;
      rocketGroup.add(finMesh);
    }

    // Rocket Thruster Engine Bell
    const bellGeom = new THREE.CylinderGeometry(0.35, 0.65, 0.75, 24);
    const bellMat = new THREE.MeshStandardMaterial({
      color: 0x1a2233,
      metalness: 0.95,
      roughness: 0.1,
    });
    const bellMesh = new THREE.Mesh(bellGeom, bellMat);
    bellMesh.position.y = -1.8;
    rocketGroup.add(bellMesh);

    // Thruster Exhaust Flame Cone (Electric Cyan & Ice-Blue Ion Plume)
    const plumeGeom = new THREE.ConeGeometry(0.6, 2.6, 24, 1, true);
    const plumeMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    });
    const plumeMesh = new THREE.Mesh(plumeGeom, plumeMat);
    plumeMesh.position.y = -3.2;
    plumeMesh.rotation.x = Math.PI;
    rocketGroup.add(plumeMesh);
    thrusterPlumeRef.current = plumeMesh;

    // Thruster Core (Diamond White Hot Plasma)
    const coreGeom = new THREE.ConeGeometry(0.25, 1.8, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.98,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    coreMesh.position.y = -2.7;
    coreMesh.rotation.x = Math.PI;
    rocketGroup.add(coreMesh);

    rocketGroup.position.set(0, -0.6, 2.5);
    scene.add(rocketGroup);

    // --- 5. PHASE 1: VOLUMETRIC MIDNIGHT BLUE & TEAL CLOUDS ---
    const cloudGroup = new THREE.Group();
    cloudGroupRef.current = cloudGroup;
    const cloudTexture = createCloudTexture();
    const cloudCount = 140;

    for (let i = 0; i < cloudCount; i++) {
      const cloudMat = new THREE.SpriteMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        color: new THREE.Color(i % 2 === 0 ? 0x0d38e8 : 0x00f5ff),
      });
      const sprite = new THREE.Sprite(cloudMat);
      const radius = 3.5 + Math.random() * 8.5;
      const theta = Math.random() * Math.PI * 2;
      const y = -15 + Math.random() * 35;
      sprite.position.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
      const scale = 5.5 + Math.random() * 7.5;
      sprite.scale.set(scale, scale, 1);
      cloudGroup.add(sprite);
    }
    scene.add(cloudGroup);

    // --- 6. PHASE 2 & 3: STARFIELD & WARP STREAKS (Shimmering Silver & Cyan) ---
    const starCount = 3800;
    const starGeom = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 190;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 230;
      starPositions[i * 3 + 2] = -10 - Math.random() * 160;

      const isCyan = Math.random() < 0.25;
      const isSilver = Math.random() < 0.45;
      if (isCyan) {
        starColors[i * 3] = 0.0;
        starColors[i * 3 + 1] = 0.96;
        starColors[i * 3 + 2] = 1.0;
      } else if (isSilver) {
        starColors[i * 3] = 0.88;
        starColors[i * 3 + 1] = 0.92;
        starColors[i * 3 + 2] = 0.98;
      } else {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 1.0;
        starColors[i * 3 + 2] = 1.0;
      }
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.85,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
    });
    const starField = new THREE.Points(starGeom, starMat);
    scene.add(starField);
    starFieldRef.current = starField;

    // Warp Lines / Speed Streaks (Ice-Blue & Cyan)
    const warpCount = 220;
    const warpGeom = new THREE.BufferGeometry();
    const warpPositions = new Float32Array(warpCount * 6);

    for (let i = 0; i < warpCount; i++) {
      const x = (Math.random() - 0.5) * 45;
      const y = (Math.random() - 0.5) * 45;
      const z = -5 - Math.random() * 80;
      const len = 4 + Math.random() * 12;

      warpPositions[i * 6] = x;
      warpPositions[i * 6 + 1] = y;
      warpPositions[i * 6 + 2] = z;

      warpPositions[i * 6 + 3] = x;
      warpPositions[i * 6 + 4] = y + len * 0.4;
      warpPositions[i * 6 + 5] = z + len;
    }
    warpGeom.setAttribute('position', new THREE.BufferAttribute(warpPositions, 3));
    const warpMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const warpLines = new THREE.LineSegments(warpGeom, warpMat);
    scene.add(warpLines);
    warpLinesRef.current = warpLines;

    // --- 7. PHASE 4: DETAILED 3D LUNAR SPHERE WITH COOL CYAN & SILVER RIM LIGHT ---
    const moonTex = createMoonTexture();
    const moonGeom = new THREE.SphereGeometry(4.5, 64, 64);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.9,
      metalness: 0.1,
      bumpMap: moonTex,
      bumpScale: 0.09,
    });
    const moonMesh = new THREE.Mesh(moonGeom, moonMat);
    moonMesh.position.set(0, 32, -90);
    moonMesh.scale.set(0.1, 0.1, 0.1);
    scene.add(moonMesh);
    moonMeshRef.current = moonMesh;

    // Moon Atmospheric Rim Glow (Electric Cyan / Ice Blue)
    const glowGeom = new THREE.SphereGeometry(4.75, 48, 48);
    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x00f5ff) },
        viewVector: { value: camera.position },
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.62 - dot(vNormal, vNormel), 2.2);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity * 1.8;
          gl_FragColor = vec4(glow, intensity * 0.9);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const moonGlow = new THREE.Mesh(glowGeom, glowMat);
    moonMesh.add(moonGlow);
    moonGlowRef.current = moonGlow;

    // --- 8. MOUSE PARALLAX LISTENER ---
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // --- 9. RESIZE HANDLER ---
    const onResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // --- 10. ANIMATION / RENDER LOOP ---
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Rocket hover breathing & parallax tilt
      if (rocketGroupRef.current) {
        rocketGroupRef.current.rotation.y = mouseRef.current.x * 0.22 + Math.sin(elapsedTime * 1.5) * 0.025;
        rocketGroupRef.current.rotation.x = -mouseRef.current.y * 0.18 + Math.cos(elapsedTime * 1.2) * 0.02;
        rocketGroupRef.current.position.x = mouseRef.current.x * 0.35;
      }

      // Thruster flame flicker
      if (thrusterPlumeRef.current) {
        const pulse = 0.88 + Math.sin(elapsedTime * 35) * 0.22;
        thrusterPlumeRef.current.scale.set(pulse, 1.0 + pulse * 0.35, pulse);
      }
      if (thrusterLightRef.current) {
        thrusterLightRef.current.intensity = 3.0 + Math.sin(elapsedTime * 40) * 1.0;
      }

      // Moon subtle self-rotation
      if (moonMeshRef.current) {
        moonMeshRef.current.rotation.y = elapsedTime * 0.035;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // --- 11. GSAP SCROLL SCRUBBING LOGIC ---
  useEffect(() => {
    const p = Math.max(0, Math.min(1, scrollProgress));
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const rocket = rocketGroupRef.current;
    const clouds = cloudGroupRef.current;
    const stars = starFieldRef.current;
    const warp = warpLinesRef.current;
    const moon = moonMeshRef.current;

    if (!scene || !camera || !rocket) return;

    // PHASE 1: The Ascent (p: 0.0 -> 0.28)
    if (clouds) {
      clouds.position.y = -p * 110;
      const cloudOpacity = Math.max(0, 1 - (p / 0.32));
      clouds.children.forEach((child) => {
        if ((child as THREE.Sprite).material) {
          (child as THREE.Sprite).material.opacity = cloudOpacity * 0.7;
        }
      });
    }

    // Fog & Background Void transition (Deep electric blue to pure space void)
    if (scene.fog) {
      if (p < 0.3) {
        (scene.fog as THREE.FogExp2).density = THREE.MathUtils.lerp(0.018, 0.003, p / 0.3);
      } else {
        (scene.fog as THREE.FogExp2).density = 0.0012;
      }
    }

    // PHASE 2 & 3: Breaking Atmosphere & Deep Space Warp (p: 0.28 -> 0.65)
    if (warp) {
      if (p > 0.2 && p < 0.7) {
        const warpIntensity = Math.sin(((p - 0.2) / 0.5) * Math.PI);
        (warp.material as THREE.LineBasicMaterial).opacity = warpIntensity * 0.8;
        warp.position.y = -(p - 0.2) * 60;
      } else {
        (warp.material as THREE.LineBasicMaterial).opacity = 0.0;
      }
    }

    if (stars) {
      stars.position.y = -p * 40;
    }

    // PHASE 4: Moon Arrival & Rocket Hover Lock (p: 0.65 -> 1.0)
    if (moon) {
      if (p > 0.45) {
        const moonProgress = (p - 0.45) / 0.55;
        const scale = THREE.MathUtils.lerp(0.1, 1.25, Math.pow(moonProgress, 1.8));
        moon.scale.set(scale, scale, scale);
        moon.position.y = THREE.MathUtils.lerp(32, 2.4, moonProgress);
        moon.position.z = THREE.MathUtils.lerp(-90, -7.8, moonProgress);
      } else {
        moon.scale.set(0.01, 0.01, 0.01);
      }
    }

    // Rocket Deceleration and Hover Pitch
    if (p > 0.75) {
      const hoverProgress = (p - 0.75) / 0.25;
      rocket.position.y = THREE.MathUtils.lerp(-0.6, -0.15, hoverProgress);
      rocket.position.z = THREE.MathUtils.lerp(2.5, 3.2, hoverProgress);
      if (thrusterPlumeRef.current) {
        thrusterPlumeRef.current.scale.y = THREE.MathUtils.lerp(1.0, 0.45, hoverProgress);
      }
    } else {
      rocket.position.y = -0.6;
      rocket.position.z = 2.5;
    }
  }, [scrollProgress]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden"
    />
  );
};
