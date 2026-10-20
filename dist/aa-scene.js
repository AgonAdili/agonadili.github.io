import * as THREE from './assets/vendor/three.module.js';

/**
 * const sculpture = initAAScene(document.querySelector('.aa-scene'), { reducedMotion });
 * sculpture?.setProgress(heroScrollProgress); // 0…1
 * sculpture?.pulse();
 * sculpture?.dispose();
 * A null return means WebGL is unavailable; the host can show its own fallback.
 */
export function initAAScene(container, { reducedMotion = false } = {}) {
  if (!container) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch {
    container.classList.remove('aa-scene-ready');
    container.classList.add('aa-scene-fallback');
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  Object.assign(renderer.domElement.style, {
    display: 'block', width: '100%', height: '100%', pointerEvents: 'none',
  });
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 80);
  const target = new THREE.Vector3(0, 0.02, 0);

  // Bright cards against a charcoal studio make the bevels read like polished metal.
  // This is generated locally: no HDR download or late texture pop-in.
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0x323439);
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(22, 18, 22),
    new THREE.MeshBasicMaterial({ color: 0x42444a, side: THREE.BackSide }),
  );
  studio.add(room);
  const cardResources = [];
  const addCard = (width, height, position, color, brightness = 1, lookAt = [0, 0, 0]) => {
    const geometry = new THREE.PlaneGeometry(width, height);
    const tint = new THREE.Color(color).multiplyScalar(brightness);
    const material = new THREE.MeshBasicMaterial({ color: tint, side: THREE.DoubleSide });
    const card = new THREE.Mesh(geometry, material);
    card.position.set(...position);
    card.lookAt(...lookAt);
    studio.add(card);
    cardResources.push(geometry, material);
  };
  addCard(3.5, 10, [-5, 2, 4], 0xffffff, 5.5);
  addCard(1.1, 11, [5, 1, 2], 0xf7f9ff, 7);
  addCard(9, 4, [0, 7, 0], 0xffffff, 4);
  addCard(2.4, 8, [1.5, 0.5, 7], 0xffffff, 3.4);
  addCard(3, 6, [5, 1.5, -5], 0xffc99a, 3);
  addCard(1, 9, [-1.8, 0, 5], 0x050609, 1);
  addCard(7, 2, [-1, -5, 2], 0x1b1d22, 1);

  const disposeStudio = () => {
    room.geometry.dispose();
    room.material.dispose();
    cardResources.forEach(resource => resource.dispose());
  };
  let environment;
  const refreshEnvironment = () => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    try {
      const nextEnvironment = pmrem.fromScene(studio, 0.035);
      environment?.dispose();
      environment = nextEnvironment;
      scene.environment = environment.texture;
    } finally {
      pmrem.dispose();
    }
  };
  try {
    refreshEnvironment();
  } catch {
    disposeStudio();
    renderer.dispose();
    renderer.domElement.remove();
    container.classList.remove('aa-scene-ready');
    container.classList.add('aa-scene-fallback');
    return null;
  }

  const frontMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xbfc2c8,
    metalness: 1,
    roughness: 0.205,
    envMapIntensity: 1.35,
    clearcoat: 0.32,
    clearcoatRoughness: 0.16,
  });
  const edgeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xa7aab0,
    metalness: 1,
    roughness: 0.255,
    envMapIntensity: 1.45,
    clearcoat: 0.22,
    clearcoatRoughness: 0.19,
  });

  const letterShape = new THREE.Shape();
  letterShape.moveTo(-1.5, -1.75);
  letterShape.lineTo(-0.48, 1.75);
  letterShape.lineTo(0.48, 1.75);
  letterShape.lineTo(1.5, -1.75);
  letterShape.lineTo(0.68, -1.75);
  letterShape.lineTo(0.44, -0.91);
  letterShape.lineTo(-0.44, -0.91);
  letterShape.lineTo(-0.68, -1.75);
  letterShape.closePath();
  const counter = new THREE.Path();
  counter.moveTo(-0.30, -0.25);
  counter.lineTo(0.30, -0.25);
  counter.lineTo(0, 0.87);
  counter.closePath();
  letterShape.holes.push(counter);

  const geometry = new THREE.ExtrudeGeometry(letterShape, {
    depth: 0.62,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 0.105,
    bevelSize: 0.085,
    bevelSegments: 5,
    curveSegments: 1,
  });
  geometry.translate(0, 0, -0.31);
  geometry.computeVertexNormals();

  const sculpture = new THREE.Group();
  const rear = new THREE.Mesh(geometry, [frontMaterial, edgeMaterial]);
  const front = new THREE.Mesh(geometry, [frontMaterial, edgeMaterial]);
  rear.position.set(0.88, 0.36, -0.48);
  rear.rotation.set(-0.1, -0.30, 0.11);
  front.position.set(-0.86, -0.35, 0.61);
  front.rotation.set(0.05, 0.18, -0.15);
  sculpture.add(rear, front);
  scene.add(sculpture);

  const key = new THREE.DirectionalLight(0xfff2e2, 3.5);
  key.position.set(-4, 6, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 2.5);
  rim.position.set(4, 2, -3);
  scene.add(rim);
  const warmFill = new THREE.PointLight(0xffa35d, 13, 15, 2);
  warmFill.position.set(3, -0.5, 3);
  scene.add(warmFill);

  // A soft contact shadow keeps the floating object anchored on the host's grid.
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext('2d');
  const radial = shadowContext.createRadialGradient(64, 64, 4, 64, 64, 62);
  radial.addColorStop(0, 'rgba(22, 20, 17, 0.30)');
  radial.addColorStop(0.48, 'rgba(22, 20, 17, 0.12)');
  radial.addColorStop(1, 'rgba(22, 20, 17, 0)');
  shadowContext.fillStyle = radial;
  shadowContext.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeometry = new THREE.PlaneGeometry(6.5, 3.8);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.68,
  });
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.1, -2.43, 0);
  scene.add(shadow);

  let width = 1;
  let height = 1;
  let frame = 0;
  let disposed = false;
  let contextLost = false;
  let onScreen = true;
  let previousTime = 0;
  let elapsed = reducedMotion ? 2 : 0;
  let scrollProgress = 0;
  let smoothProgress = 0;
  let pulseTime = -10;
  const pointer = { x: 0, y: 0 };
  const smoothedPointer = { x: 0, y: 0 };
  const easeOut = value => 1 - Math.pow(1 - value, 4);

  const compose = delta => {
    if (disposed || contextLost) return;
    const intro = reducedMotion ? 1 : easeOut(Math.min(elapsed / 1.8, 1));
    const interpolation = reducedMotion ? 1 : 1 - Math.exp(-delta * 4);
    smoothedPointer.x += (pointer.x - smoothedPointer.x) * interpolation;
    smoothedPointer.y += (pointer.y - smoothedPointer.y) * interpolation;
    smoothProgress += (scrollProgress - smoothProgress) * interpolation;
    const float = reducedMotion ? 0 : Math.sin(elapsed * 0.7) * 0.045;
    const impulse = reducedMotion ? 0 : Math.max(0, 1 - (elapsed - pulseTime) / 0.8);
    const pop = Math.sin(impulse * Math.PI) * 0.1;

    sculpture.rotation.set(
      0.10 + (1 - intro) * 0.35 + smoothedPointer.y * 0.065 + smoothProgress * 0.11,
      -0.29 + (1 - intro) * 1.8 + smoothedPointer.x * 0.13 - smoothProgress * 0.24,
      -0.04 + (1 - intro) * -0.2 + smoothProgress * 0.04,
    );
    sculpture.position.y = 0.12 + float + (1 - intro) * -0.6 + pop - smoothProgress * 0.12;
    sculpture.scale.setScalar(0.94 + intro * 0.06 + pop * 0.06);
    rear.rotation.z = 0.11 + (reducedMotion ? 0 : Math.sin(elapsed * 0.46) * 0.018);
    front.rotation.z = -0.15 + (reducedMotion ? 0 : Math.sin(elapsed * 0.54 + 1) * 0.012);
    shadowMaterial.opacity = 0.68 * intro;
    renderer.domElement.style.opacity = String(Math.min(intro * 2.5, 1));
    renderer.render(scene, camera);
  };

  const canAnimate = () => !disposed && !contextLost && !reducedMotion && onScreen && !document.hidden;
  const animate = time => {
    frame = 0;
    if (!canAnimate()) return;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 1 / 60;
    previousTime = time;
    elapsed += delta;
    compose(delta);
    frame = window.requestAnimationFrame(animate);
  };
  const updateAnimation = () => {
    if (canAnimate() && !frame) {
      previousTime = 0;
      frame = window.requestAnimationFrame(animate);
    } else if (!canAnimate() && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  };
  const resize = () => {
    if (disposed || contextLost) return;
    const bounds = container.getBoundingClientRect();
    width = Math.max(bounds.width, 1);
    height = Math.max(bounds.height, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // The nearer letter extends toward the camera; give narrow canvases extra
    // horizontal breathing room while retaining the wide-screen composition.
    camera.position.set(0.25, 0.6, Math.max(8.6, 10.5 / camera.aspect));
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    compose(1 / 60);
  };
  const onPointerMove = event => {
    if (reducedMotion || !onScreen) return;
    const bounds = container.getBoundingClientRect();
    pointer.x = THREE.MathUtils.clamp((event.clientX - bounds.left) / width * 2 - 1, -1, 1);
    pointer.y = THREE.MathUtils.clamp((event.clientY - bounds.top) / height * 2 - 1, -1, 1);
  };
  const resetPointer = () => { pointer.x = 0; pointer.y = 0; };
  const onVisibilityChange = () => updateAnimation();
  const onContextLost = event => {
    event.preventDefault();
    contextLost = true;
    container.classList.remove('aa-scene-ready');
    container.classList.add('aa-scene-fallback');
    renderer.domElement.style.visibility = 'hidden';
    updateAnimation();
  };
  const onContextRestored = () => {
    if (disposed || !contextLost) return;
    // Render-target pixels are lost with the context, so rebuild the studio map.
    try {
      refreshEnvironment();
      contextLost = false;
      resize();
      container.classList.remove('aa-scene-fallback');
      container.classList.add('aa-scene-ready');
      renderer.domElement.style.visibility = '';
      updateAnimation();
    } catch {
      contextLost = true;
    }
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('blur', resetPointer);
  document.addEventListener('visibilitychange', onVisibilityChange);

  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(container);
  if (!resizeObserver) window.addEventListener('resize', resize, { passive: true });
  const intersectionObserver = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(entries => {
      onScreen = entries[0].isIntersecting;
      updateAnimation();
    }, { rootMargin: '80px', threshold: 0 })
    : null;
  intersectionObserver?.observe(container);
  resize();
  updateAnimation();

  return {
    setProgress(progress) {
      scrollProgress = reducedMotion ? 0 : THREE.MathUtils.clamp(progress || 0, 0, 1);
    },
    pulse() {
      pulseTime = elapsed;
      updateAnimation();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', resetPointer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      geometry.dispose();
      frontMaterial.dispose();
      edgeMaterial.dispose();
      shadowGeometry.dispose();
      shadowMaterial.dispose();
      shadowTexture.dispose();
      environment.dispose();
      disposeStudio();
      renderer.dispose();
      renderer.domElement.remove();
      container.classList.remove('aa-scene-ready', 'aa-scene-fallback');
    },
  };
}
