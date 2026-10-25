/** A perspective point surface, rendered with native Canvas 2D. */
export function initDotField(container, { reducedMotion = false } = {}) {
  if (!container) return null;
  const canvas = document.createElement('canvas');
  let context;
  try { context = canvas.getContext('2d', { alpha: true }); } catch { return null; }
  if (!context) return null;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.pointerEvents = 'none';
  container.append(canvas);

  const host = container.closest('.hero-art') || container;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const pointer = { x: 0, y: 0, strength: 0, targetX: 0, targetY: 0, targetStrength: 0 };
  const palette = ['241,240,232', '235,245,191', '227,250,146', '220,255,101'];
  let points = [];
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let elapsed = reducedMotion ? 2 : 0;
  let progress = 0;
  let targetProgress = 0;
  let pulseAge = 10;
  let previousTime = 0;
  let frame = 0;
  let visible = true;
  let disposed = false;

  function createPoints() {
    const columns = width < 600 ? 40 : 60;
    const rows = width < 600 ? 32 : 44;
    points = [];
    for (let row = 0; row < rows; row++) {
      const v = row / (rows - 1) * 2 - 1;
      for (let column = 0; column < columns; column++) {
        const u = column / (columns - 1) * 2 - 1;
        // A soft boundary gives the surface breathing room without a hard crop.
        const boundary = clamp((1 - Math.pow(Math.abs(u), 6)) * (1 - Math.pow(Math.abs(v), 6)));
        if (boundary < 0.025) continue;
        points.push({ u, v, boundary: Math.pow(boundary, 0.45) });
      }
    }
  }

  function render() {
    if (disposed) return;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    const time = reducedMotion ? 0 : elapsed;
    const entrance = reducedMotion ? 1 : 1 - Math.pow(1 - clamp(elapsed / 1.35), 3);
    const yaw = -0.38 + progress * 0.34;
    const pitch = 0.77 + progress * 0.19;
    const roll = -0.21 + progress * 0.12;
    const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
    const cosRoll = Math.cos(roll), sinRoll = Math.sin(roll);
    const unit = Math.min(width / 7.1, height / 4.6);
    const centerX = width * 0.51;
    const centerY = height * 0.5;
    const radius = Math.min(width, height) * 0.31;
    const buckets = Array.from({ length: 32 }, () => []);

    for (const point of points) {
      const x = point.u * 3.08;
      const z = point.v * 2.03;
      const wave = Math.sin(x * 1.08 + z * 0.83 + time * 0.24);
      let elevation = wave * 0.5 + Math.cos(z * 1.45 - x * 0.36 - time * 0.17) * 0.23;
      elevation += Math.sin(x * 2.0 - z * 1.3 + time * 0.2) * 0.07;
      elevation += (1 - entrance) * Math.sin(x * 2 + z) * 0.48;
      const rotatedX = x * cosYaw + z * sinYaw;
      const rotatedZ = -x * sinYaw + z * cosYaw;
      const depth = rotatedZ * cosPitch - elevation * sinPitch;
      const perspective = 1 / (1 + depth * 0.075);
      let projectedY = elevation * cosPitch + rotatedZ * sinPitch;
      let px = centerX + (rotatedX * cosRoll - projectedY * sinRoll) * unit * perspective;
      let py = centerY - (rotatedX * sinRoll + projectedY * cosRoll) * unit * perspective;
      const dx = px - pointer.x;
      const dy = py - pointer.y;
      const distance = Math.hypot(dx, dy);
      const influence = reducedMotion ? 0 : Math.exp(-Math.pow(distance / radius, 2) * 2.7) * pointer.strength;

      if (influence > 0.001) {
        const ripple = Math.sin(distance * 0.045 - time * 3.4) * 0.12;
        elevation += influence * (0.35 + ripple);
        projectedY = elevation * cosPitch + rotatedZ * sinPitch;
        px = centerX + (rotatedX * cosRoll - projectedY * sinRoll) * unit * perspective;
        py = centerY - (rotatedX * sinRoll + projectedY * cosRoll) * unit * perspective;
        const push = influence * 9;
        px += dx / Math.max(distance, 1) * push;
        py += dy / Math.max(distance, 1) * push;
      }

      if (!reducedMotion && pulseAge < 2.5) {
        const radialDistance = Math.hypot(point.u * 1.3, point.v);
        const ring = Math.exp(-Math.pow((radialDistance - pulseAge * 0.65) * 4, 2));
        py -= ring * Math.sin(pulseAge * Math.PI / 2.5) * unit * 0.16;
      }

      const front = clamp((2.5 - depth) / 5);
      const crest = clamp((wave + 0.2) * 0.85);
      const opacity = clamp((0.22 + front * 0.5 + influence * 0.17) * point.boundary * entrance);
      const opacityBucket = Math.min(7, Math.floor(opacity * 9));
      const colorBucket = Math.min(3, Math.floor((crest * 0.8 + influence * 0.2) * 4));
      const dotRadius = ((width < 600 ? 0.7 : 0.85) + front * 0.7 + crest * 0.15 + influence * 0.25) * perspective;
      if (px > 1 && px < width - 1 && py > 1 && py < height - 1) {
        buckets[colorBucket * 8 + opacityBucket].push(px, py, dotRadius);
      }
    }

    // Group dots by color and opacity so thousands of points need only 32 fills.
    for (let index = 0; index < buckets.length; index++) {
      const bucket = buckets[index];
      if (!bucket.length) continue;
      context.fillStyle = `rgba(${palette[Math.floor(index / 8)]},${(index % 8 + 1) / 10})`;
      context.beginPath();
      for (let dot = 0; dot < bucket.length; dot += 3) {
        const x = bucket[dot], y = bucket[dot + 1], r = bucket[dot + 2];
        context.moveTo(x + r, y);
        context.arc(x, y, r, 0, Math.PI * 2);
      }
      context.fill();
    }
  }

  const canAnimate = () => !disposed && !reducedMotion && visible && !document.hidden;
  function animate(now) {
    frame = 0;
    if (!canAnimate()) return;
    if (!previousTime || now - previousTime >= 1000 / 30 - 0.5) {
      const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.08) : 1 / 30;
      previousTime = now;
      elapsed += delta;
      pulseAge += delta;
      const ease = 1 - Math.exp(-delta * 5.5);
      pointer.x += (pointer.targetX - pointer.x) * ease;
      pointer.y += (pointer.targetY - pointer.y) * ease;
      pointer.strength += (pointer.targetStrength - pointer.strength) * ease;
      progress += (targetProgress - progress) * ease;
      render();
    }
    frame = requestAnimationFrame(animate);
  }

  function syncAnimation() {
    if (canAnimate() && !frame) {
      previousTime = 0;
      frame = requestAnimationFrame(animate);
    } else if (!canAnimate() && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  function resize() {
    if (disposed) return;
    const rect = container.getBoundingClientRect();
    width = Math.max(rect.width, 1);
    height = Math.max(rect.height, 1);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    pointer.x = pointer.targetX = width / 2;
    pointer.y = pointer.targetY = height / 2;
    createPoints();
    render();
  }

  function movePointer(event) {
    if (reducedMotion || !visible || disposed) return;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    pointer.targetX = clamp(x, 0, width);
    pointer.targetY = clamp(y, 0, height);
    pointer.targetStrength = x >= 0 && x <= width && y >= 0 && y <= height ? 1 : 0;
    // A quick tap can finish between frames; retain its impulse while it decays.
    if (event.type === 'pointerdown' && event.pointerType !== 'mouse' && pointer.targetStrength) {
      pointer.x = pointer.targetX;
      pointer.y = pointer.targetY;
      pointer.strength = 1;
    }
  }
  const resetPointer = () => { pointer.targetStrength = 0; };
  const releasePointer = event => { if (event.pointerType !== 'mouse') resetPointer(); };
  host.addEventListener('pointermove', movePointer, { passive: true });
  host.addEventListener('pointerdown', movePointer, { passive: true });
  host.addEventListener('pointerleave', resetPointer);
  host.addEventListener('pointercancel', resetPointer);
  window.addEventListener('pointerup', releasePointer, { passive: true });
  window.addEventListener('blur', resetPointer);
  document.addEventListener('visibilitychange', syncAnimation);

  const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
  resizeObserver?.observe(container);
  if (!resizeObserver) window.addEventListener('resize', resize, { passive: true });
  const intersectionObserver = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncAnimation();
  }, { rootMargin: '70px' });
  intersectionObserver?.observe(container);
  resize();
  syncAnimation();

  return {
    setProgress(value) {
      if (disposed || reducedMotion) return;
      targetProgress = clamp(Number(value) || 0);
    },
    pulse() {
      if (disposed || reducedMotion) return;
      pulseAge = 0;
      syncAnimation();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', resize);
      host.removeEventListener('pointermove', movePointer);
      host.removeEventListener('pointerdown', movePointer);
      host.removeEventListener('pointerleave', resetPointer);
      host.removeEventListener('pointercancel', resetPointer);
      window.removeEventListener('pointerup', releasePointer);
      window.removeEventListener('blur', resetPointer);
      document.removeEventListener('visibilitychange', syncAnimation);
      canvas.remove();
      container.classList.remove('dot-field-ready');
      points = [];
    }
  };
}
