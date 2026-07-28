(() => {
  const CONFIG = Object.freeze({
    dragThresholdRatio: 0.42,
    minimumThresholdRatio: 0.075,
    maximumDragRatio: 1.42,
    clickMoveTolerance: 9,
    clickTimeTolerance: 420,
    yFollowRatio: 0.08,
    maxYFollowRatio: 0.012,
    maxRotation: 2.6,
    tearDuration: 640,
    revealDuration: 760,
    exitDelay: 650,
  });

  const intro = document.querySelector("#boarding-intro");
  const stage = intro?.querySelector(".boarding-pass-stage");
  const stub = intro?.querySelector(".boarding-pass-stub");
  const homeScreen = intro?.querySelector(".home-screen");
  const particles = intro?.querySelector(".tear-particles");

  if (!intro || !stage || !stub || !homeScreen || !particles) return;

  let state = "idle";
  let activePointerId = null;
  let startX = 0;
  let startY = 0;
  let dragX = 0;
  let dragY = 0;
  let pointerDownAt = 0;
  let stageRect = stage.getBoundingClientRect();
  let stubWidth = stageRect.width * (0.8684 - 0.7112);
  let threshold = Math.max(stubWidth * CONFIG.dragThresholdRatio, stageRect.width * CONFIG.minimumThresholdRatio);
  let frameRequest = 0;
  let pendingTransform = null;
  let tearAudioContext = null;

  const setState = (nextState) => {
    state = nextState;
    intro.dataset.state = nextState;
    intro.classList.toggle("is-hovering", nextState === "hover");
    intro.classList.toggle("is-dragging", nextState === "dragging");
  };

  const measure = () => {
    stageRect = stage.getBoundingClientRect();
    stubWidth = stageRect.width * (0.8684 - 0.7112);
    threshold = Math.max(stubWidth * CONFIG.dragThresholdRatio, stageRect.width * CONFIG.minimumThresholdRatio);
  };

  const setRevealProgress = (progress) => {
    const normalized = Math.max(0, Math.min(1, progress));
    intro.style.setProperty("--tear-progress", normalized.toFixed(3));
    homeScreen.style.opacity = String(0.04 + normalized * 0.76);
    homeScreen.style.filter = `blur(${(14 * (1 - normalized)).toFixed(2)}px)`;
    homeScreen.style.transform = `translateY(${(1.2 * (1 - normalized)).toFixed(2)}%) scale(${(1.02 - normalized * 0.02).toFixed(4)})`;
  };

  const renderDrag = () => {
    frameRequest = 0;
    if (!pendingTransform || state !== "dragging") return;
    const { x, y, rotation } = pendingTransform;
    stub.style.setProperty("--stub-x", `${x}px`);
    stub.style.setProperty("--stub-y", `${y}px`);
    stub.style.setProperty("--stub-rotation", `${rotation}deg`);
    setRevealProgress(x / threshold);
    pendingTransform = null;
  };

  const queueDragRender = (x, y) => {
    const progress = Math.min(1, x / threshold);
    pendingTransform = {
      x,
      y,
      rotation: progress * CONFIG.maxRotation + Math.sin(x * 0.075) * 0.18,
    };
    if (!frameRequest) frameRequest = requestAnimationFrame(renderDrag);
  };

  const createParticles = () => {
    particles.replaceChildren();
    const count = 14;
    for (let index = 0; index < count; index += 1) {
      const fleck = document.createElement("i");
      const direction = index % 2 ? 1 : -0.45;
      fleck.style.top = `${7 + (index / (count - 1)) * 86}%`;
      fleck.style.setProperty("--particle-size", `${2.5 + (index % 4) * 0.9}px`);
      fleck.style.setProperty("--particle-x", `${direction * (18 + (index % 5) * 8)}px`);
      fleck.style.setProperty("--particle-y", `${(index % 3) * 2}px`);
      fleck.style.setProperty("--particle-rotate", `${60 + index * 29}deg`);
      fleck.style.setProperty("--particle-delay", `${index * 13}ms`);
      fleck.style.setProperty("--particle-duration", `${430 + (index % 5) * 45}ms`);
      particles.appendChild(fleck);
    }
  };

  const playTearSound = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!tearAudioContext) tearAudioContext = new AudioContextClass();
    if (tearAudioContext.state === "suspended") tearAudioContext.resume().catch(() => {});

    const context = tearAudioContext;
    const duration = 0.46;
    const now = context.currentTime + 0.003;
    const frameCount = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) {
      const envelope = Math.pow(1 - index / frameCount, 0.7);
      const fibers = Math.sin(index * 0.31) > 0.82 ? 1.55 : 0.72;
      data[index] = (Math.random() * 2 - 1) * envelope * fibers;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1250, now);
    filter.frequency.exponentialRampToValueAtTime(540, now + duration);
    filter.Q.value = 0.58;
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start(now);
    source.stop(now + duration);
  };

  const resetTransform = () => {
    stub.getAnimations().forEach((animation) => animation.cancel());
    stub.style.removeProperty("--stub-x");
    stub.style.removeProperty("--stub-y");
    stub.style.removeProperty("--stub-rotation");
    stub.style.removeProperty("transform");
    setRevealProgress(0);
  };

  const springBack = () => {
    setState("idle");
    stub.style.transition = "filter 220ms ease, transform 360ms cubic-bezier(0.22, 0.72, 0.18, 1)";
    resetTransform();
  };

  const completeTear = () => {
    if (state === "tearing" || state === "completed") return;
    state = "tearing";
    intro.dataset.state = state;
    intro.classList.remove("is-hovering", "is-dragging");
    intro.classList.add("is-tearing", "is-completed");
    setRevealProgress(1);
    createParticles();
    playTearSound();

    // This starts during the pointer gesture, so browsers allow opening audio.
    window.DanhaborOpening?.begin();

    const currentTransform = getComputedStyle(stub).transform;
    const finalX = Math.max(stageRect.width * 0.31, stubWidth * 1.9);
    stub.animate(
      [
        { transform: currentTransform === "none" ? "translate3d(0, 0, 0)" : currentTransform },
        { transform: `translate3d(${finalX * 0.28}px, -2px, 0) rotate(2.8deg)`, offset: 0.36 },
        { transform: `translate3d(${finalX}px, -${stageRect.height * 0.018}px, 0) rotate(5.2deg)` },
      ],
      {
        duration: CONFIG.tearDuration,
        easing: "cubic-bezier(0.2, 0.76, 0.18, 1)",
        fill: "forwards",
      },
    );

    window.setTimeout(() => {
      state = "completed";
      intro.dataset.state = state;
    }, CONFIG.tearDuration);

    window.setTimeout(() => {
      intro.hidden = true;
    }, CONFIG.exitDelay + CONFIG.revealDuration + 80);
  };

  const releasePointer = (event) => {
    if (state !== "dragging" || event.pointerId !== activePointerId) return;
    if (stub.hasPointerCapture(activePointerId)) stub.releasePointerCapture(activePointerId);
    const elapsed = performance.now() - pointerDownAt;
    const distance = Math.hypot(dragX, dragY);
    const isClick = distance <= CONFIG.clickMoveTolerance && elapsed <= CONFIG.clickTimeTolerance;
    activePointerId = null;
    if (dragX >= threshold || isClick) completeTear();
    else springBack();
  };

  stub.addEventListener("pointerenter", () => {
    if (state === "idle") setState("hover");
  });

  stub.addEventListener("pointerleave", () => {
    if (state === "hover") setState("idle");
  });

  stub.addEventListener("pointerdown", (event) => {
    if (state === "tearing" || state === "completed") return;
    measure();
    activePointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    dragX = 0;
    dragY = 0;
    pointerDownAt = performance.now();
    stub.setPointerCapture(activePointerId);
    stub.style.transition = "filter 120ms ease";
    setState("dragging");
    event.preventDefault();
  });

  stub.addEventListener("pointermove", (event) => {
    if (state !== "dragging" || event.pointerId !== activePointerId) return;
    const maximumDrag = stubWidth * CONFIG.maximumDragRatio;
    const maximumY = stageRect.height * CONFIG.maxYFollowRatio;
    dragX = Math.max(0, Math.min(maximumDrag, event.clientX - startX));
    dragY = Math.max(-maximumY, Math.min(maximumY, (event.clientY - startY) * CONFIG.yFollowRatio));
    queueDragRender(dragX, dragY);
    event.preventDefault();
  });

  stub.addEventListener("pointerup", releasePointer);
  stub.addEventListener("pointercancel", (event) => {
    if (event.pointerId !== activePointerId) return;
    activePointerId = null;
    springBack();
  });

  stub.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    completeTear();
  });

  const reset = () => {
    state = "idle";
    activePointerId = null;
    intro.hidden = false;
    intro.dataset.state = state;
    intro.classList.remove("is-hovering", "is-dragging", "is-tearing", "is-completed");
    intro.getAnimations().forEach((animation) => animation.cancel());
    particles.replaceChildren();
    resetTransform();
    measure();
  };

  window.addEventListener("resize", () => requestAnimationFrame(measure));
  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    window.DanhaborOpening?.reset();
    reset();
  });

  window.DanhaborBoardingPass = { reset, getState: () => state, config: CONFIG };
  createParticles();
  measure();

  if (document.documentElement.classList.contains("start-in-archive")) {
    intro.hidden = true;
  }
})();
