(() => {
  if (window.top !== window.self) {
    let lastReportedState = "";
    const reportPageState = () => {
      const opening = document.querySelector("#opening-intro");
      const archiveReady = !opening || document.documentElement.classList.contains("start-in-archive") || opening.hidden;
      const stateSignature = `${location.href}|${document.title}|${archiveReady}`;
      if (stateSignature === lastReportedState) return;
      lastReportedState = stateSignature;
      window.parent.postMessage({
        type: "danhabor:page-state",
        href: `${location.pathname.split("/").pop()}${location.search}${location.hash}`,
        path: location.pathname,
        title: document.title,
        archiveReady,
      }, "*");
    };
    reportPageState();
    const reportTimer = window.setInterval(reportPageState, 300);
    window.addEventListener("hashchange", reportPageState);
    window.addEventListener("pageshow", reportPageState);
    window.addEventListener("pagehide", () => window.clearInterval(reportTimer), { once: true });
    return;
  }

  if (window.DanhaborMusicPlayer) return;

  const STORAGE_KEY = "danhabor.globalMusic.v1";
  const WINDOW_NAME_PREFIX = "DANHABOR_MUSIC:";
  const SAVE_INTERVAL = 2000;
  const DEFAULT_VOLUME = 0.46;

  // Add or remove tracks here. Paths are relative to this script in /outputs.
  const PLAYLIST = Object.freeze([
    {
      id: "macaroni-detective",
      title: "マカロニ刑事のテーマ",
      artist: "大野克夫 / 丹港影像档案室",
      src: "../public/assets/macaroni-detective-theme.mp3",
      recommendedPages: ["archive", "cases", "characters", "behind", "origin"],
    },
    {
      id: "kakugo",
      title: "覚悟",
      artist: "橋本しん / 丹芷世界观",
      src: "../public/assets/kakugo.mp3",
      recommendedPages: ["world"],
    },
  ]);

  const requestedPage = new URLSearchParams(location.search).get("page") || location.pathname;
  const defaultState = {
    currentTrackId: /danhabor-world\.html/i.test(requestedPage) ? "kakugo" : PLAYLIST[0].id,
    currentTime: 0,
    isPlaying: false,
    volume: DEFAULT_VOLUME,
    muted: false,
    playMode: "loop",
    expanded: false,
    savedAt: Date.now(),
  };

  const normalizeState = (candidate) => {
    const source = candidate && typeof candidate === "object" ? candidate : {};
    const trackExists = PLAYLIST.some((track) => track.id === source.currentTrackId);
    return {
      currentTrackId: trackExists ? source.currentTrackId : defaultState.currentTrackId,
      currentTime: Number.isFinite(Number(source.currentTime)) ? Math.max(0, Number(source.currentTime)) : 0,
      isPlaying: Boolean(source.isPlaying),
      volume: Number.isFinite(Number(source.volume)) ? Math.max(0, Math.min(1, Number(source.volume))) : DEFAULT_VOLUME,
      muted: Boolean(source.muted),
      playMode: ["loop", "one", "shuffle"].includes(source.playMode) ? source.playMode : "loop",
      expanded: Boolean(source.expanded),
      savedAt: Number.isFinite(Number(source.savedAt)) ? Number(source.savedAt) : Date.now(),
    };
  };

  const readJson = (value) => {
    try { return JSON.parse(value); } catch { return null; }
  };

  const loadState = () => {
    let stored = null;
    try { stored = readJson(localStorage.getItem(STORAGE_KEY)); } catch {}
    if (!stored && window.name.startsWith(WINDOW_NAME_PREFIX)) {
      stored = readJson(window.name.slice(WINDOW_NAME_PREFIX.length));
    }
    const restored = normalizeState(stored || defaultState);
    if (stored && restored.isPlaying) {
      restored.currentTime += Math.max(0, Math.min(8, (Date.now() - restored.savedAt) / 1000));
    }
    return restored;
  };

  const state = loadState();
  let currentIndex = Math.max(0, PLAYLIST.findIndex((track) => track.id === state.currentTrackId));
  let pendingSeek = state.currentTime;
  let wantsPlayback = state.isPlaying;
  let awaitingGesture = false;
  let saveTimer = 0;
  let consecutiveErrors = 0;

  const scriptUrl = document.currentScript?.src || location.href;
  const trackUrl = (track) => new URL(track.src, scriptUrl).href;
  const audio = new Audio();
  audio.preload = "metadata";
  audio.volume = state.volume;
  audio.muted = state.muted;

  const root = document.createElement("aside");
  root.className = "danhabor-music-player";
  root.classList.toggle("dmp-on-preview", /danhabor-001-preview\.html/i.test(requestedPage));
  root.setAttribute("aria-label", "丹港全站背景音乐播放器");
  root.innerHTML = `
    <div class="dmp-console">
      <div class="dmp-mini">
        <button class="dmp-button dmp-play" type="button" aria-label="播放背景音乐" title="播放背景音乐">▶</button>
        <div class="dmp-mini-readout" aria-live="polite">
          <i class="dmp-disc" aria-hidden="true"></i>
          <small class="dmp-label">GLOBAL ARCHIVE BGM</small>
          <strong class="dmp-title"></strong>
        </div>
        <button class="dmp-button dmp-expand" type="button" aria-label="展开播放器" title="展开播放器">≡</button>
      </div>
      <section class="dmp-panel" aria-label="播放器详情" hidden>
        <div class="dmp-now">
          <div class="dmp-cover" aria-hidden="true"></div>
          <div class="dmp-now-copy"><strong></strong><span></span></div>
        </div>
        <div class="dmp-timeline">
          <span class="dmp-time dmp-current-time">0:00</span>
          <input class="dmp-range dmp-progress" type="range" min="0" max="100" step="0.1" value="0" aria-label="播放进度" />
          <span class="dmp-time dmp-duration">--:--</span>
        </div>
        <div class="dmp-controls">
          <button class="dmp-button dmp-previous" type="button" aria-label="上一首" title="上一首">|◀</button>
          <button class="dmp-button dmp-rewind" type="button" aria-label="后退十秒" title="后退十秒">−10</button>
          <button class="dmp-button dmp-panel-play" type="button" aria-label="播放" title="播放">▶</button>
          <button class="dmp-button dmp-forward" type="button" aria-label="前进十秒" title="前进十秒">+10</button>
          <button class="dmp-button dmp-next" type="button" aria-label="下一首" title="下一首">▶|</button>
        </div>
        <div class="dmp-volume-row">
          <button class="dmp-button dmp-mute" type="button" aria-label="静音" title="静音">VOL</button>
          <input class="dmp-range dmp-volume" type="range" min="0" max="1" step="0.01" value="${state.volume}" aria-label="背景音乐音量" />
          <button class="dmp-button dmp-mode" type="button" aria-label="切换播放模式" title="切换播放模式">循环</button>
        </div>
        <p class="dmp-status" aria-live="polite"></p>
        <ol class="dmp-playlist" aria-label="背景音乐歌单"></ol>
      </section>
    </div>`;
  document.body.appendChild(root);

  const elements = {
    play: root.querySelector(".dmp-play"),
    panelPlay: root.querySelector(".dmp-panel-play"),
    expand: root.querySelector(".dmp-expand"),
    panel: root.querySelector(".dmp-panel"),
    miniTitle: root.querySelector(".dmp-title"),
    nowTitle: root.querySelector(".dmp-now-copy strong"),
    artist: root.querySelector(".dmp-now-copy span"),
    currentTime: root.querySelector(".dmp-current-time"),
    duration: root.querySelector(".dmp-duration"),
    progress: root.querySelector(".dmp-progress"),
    previous: root.querySelector(".dmp-previous"),
    next: root.querySelector(".dmp-next"),
    rewind: root.querySelector(".dmp-rewind"),
    forward: root.querySelector(".dmp-forward"),
    mute: root.querySelector(".dmp-mute"),
    volume: root.querySelector(".dmp-volume"),
    mode: root.querySelector(".dmp-mode"),
    status: root.querySelector(".dmp-status"),
    playlist: root.querySelector(".dmp-playlist"),
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remaining}`;
  };

  const snapshot = () => ({
    currentTrackId: PLAYLIST[currentIndex].id,
    currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : pendingSeek,
    isPlaying: wantsPlayback,
    volume: audio.volume,
    muted: audio.muted,
    playMode: state.playMode,
    expanded: state.expanded,
    savedAt: Date.now(),
  });

  const saveState = () => {
    const serialized = JSON.stringify(snapshot());
    try { localStorage.setItem(STORAGE_KEY, serialized); } catch {}
    try { window.name = `${WINDOW_NAME_PREFIX}${serialized}`; } catch {}
  };

  const setStatus = (message = "") => {
    elements.status.textContent = message;
  };

  const updateTrackList = () => {
    [...elements.playlist.querySelectorAll(".dmp-track-button")].forEach((button, index) => {
      button.setAttribute("aria-current", String(index === currentIndex));
      const duration = button.querySelector(".dmp-track-duration");
      if (index === currentIndex && Number.isFinite(audio.duration)) duration.textContent = formatTime(audio.duration);
    });
  };

  const renderPlaylist = () => {
    const fragment = document.createDocumentFragment();
    PLAYLIST.forEach((track, index) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dmp-track-button";
      button.dataset.trackIndex = String(index);
      button.innerHTML = `
        <span class="dmp-track-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="dmp-track-copy"><strong></strong><span></span></span>
        <span class="dmp-track-duration">--:--</span>`;
      button.querySelector("strong").textContent = track.title;
      button.querySelector(".dmp-track-copy span").textContent = track.artist;
      button.setAttribute("aria-label", `播放 ${track.title}`);
      item.appendChild(button);
      fragment.appendChild(item);
    });
    elements.playlist.replaceChildren(fragment);
    updateTrackList();
  };

  const updateExpanded = () => {
    elements.panel.hidden = !state.expanded;
    root.classList.toggle("dmp-expanded", state.expanded);
    elements.expand.textContent = state.expanded ? "×" : "≡";
    elements.expand.setAttribute("aria-label", state.expanded ? "收起播放器" : "展开播放器");
    elements.expand.title = state.expanded ? "收起播放器" : "展开播放器";
  };

  const updatePlaybackUi = () => {
    const playing = !audio.paused && !audio.ended;
    root.classList.toggle("dmp-is-playing", playing);
    elements.play.textContent = playing ? "Ⅱ" : "▶";
    elements.panelPlay.textContent = playing ? "Ⅱ" : "▶";
    elements.play.setAttribute("aria-label", playing ? "暂停背景音乐" : "播放背景音乐");
    elements.panelPlay.setAttribute("aria-label", playing ? "暂停" : "播放");
    elements.mute.textContent = audio.muted || audio.volume === 0 ? "MUTE" : "VOL";
    elements.mute.setAttribute("aria-label", audio.muted ? "恢复声音" : "静音");
  };

  const updateTimeline = () => {
    const duration = audio.duration;
    const current = audio.currentTime || 0;
    elements.currentTime.textContent = formatTime(current);
    elements.duration.textContent = formatTime(duration);
    elements.progress.value = Number.isFinite(duration) && duration > 0 ? String((current / duration) * 100) : "0";
  };

  const modeText = () => ({ loop: "循环", one: "单曲", shuffle: "随机" })[state.playMode];
  const updateMode = () => {
    elements.mode.textContent = modeText();
    elements.mode.title = `播放模式：${modeText()}`;
  };

  const updateTrackUi = () => {
    const track = PLAYLIST[currentIndex];
    elements.miniTitle.textContent = track.title;
    elements.nowTitle.textContent = track.title;
    elements.artist.textContent = track.artist;
    updateTrackList();
  };

  const attemptPlay = async () => {
    wantsPlayback = true;
    try {
      await audio.play();
      awaitingGesture = false;
      setStatus("");
    } catch {
      awaitingGesture = true;
      setStatus("待恢复播放 / 点击播放器继续");
    }
    updatePlaybackUi();
    saveState();
  };

  const pause = ({ reset = false } = {}) => {
    wantsPlayback = false;
    awaitingGesture = false;
    audio.pause();
    if (reset) {
      audio.currentTime = 0;
      pendingSeek = 0;
    }
    setStatus("");
    updatePlaybackUi();
    updateTimeline();
    saveState();
  };

  const loadTrack = (index, { autoplay = wantsPlayback, seek = 0 } = {}) => {
    currentIndex = (index + PLAYLIST.length) % PLAYLIST.length;
    pendingSeek = Math.max(0, seek);
    const shouldPlay = Boolean(autoplay);
    wantsPlayback = shouldPlay;
    audio.pause();
    audio.src = trackUrl(PLAYLIST[currentIndex]);
    audio.load();
    updateTrackUi();
    updateTimeline();
    setStatus("");
    if (shouldPlay) attemptPlay();
    else saveState();
  };

  const nextIndex = () => {
    if (state.playMode !== "shuffle" || PLAYLIST.length < 2) return (currentIndex + 1) % PLAYLIST.length;
    let candidate = currentIndex;
    while (candidate === currentIndex) candidate = Math.floor(Math.random() * PLAYLIST.length);
    return candidate;
  };

  const playNext = () => loadTrack(nextIndex(), { autoplay: true });
  const playPrevious = () => loadTrack((currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length, { autoplay: true });

  let activePageTrackId = null;
  const pageTrackId = (page) => {
    if (/danhabor-world\.html/i.test(page)) return "kakugo";
    if (/danhabor-001-preview\.html/i.test(page)) return "macaroni-detective";
    return null;
  };
  const syncTrackForPage = (page) => {
    const nextPageTrackId = pageTrackId(page);
    if (nextPageTrackId === activePageTrackId) return;
    activePageTrackId = nextPageTrackId;
    if (!nextPageTrackId || PLAYLIST[currentIndex].id === nextPageTrackId) return;
    const index = PLAYLIST.findIndex((track) => track.id === nextPageTrackId);
    if (index >= 0) loadTrack(index, { autoplay: wantsPlayback, seek: 0 });
  };

  const togglePlayback = () => {
    if (audio.paused) attemptPlay();
    else pause();
  };

  const cycleMode = () => {
    const modes = ["loop", "one", "shuffle"];
    state.playMode = modes[(modes.indexOf(state.playMode) + 1) % modes.length];
    updateMode();
    saveState();
  };

  let framedPage = requestedPage;
  let framedArchiveReady = !/danhabor-001-preview\.html/i.test(requestedPage) || /[?&]view=archive(?:&|$)/i.test(requestedPage);

  const updateVisibility = () => {
    const opening = document.querySelector("#opening-intro");
    if (opening) {
      const isArchiveReady = document.documentElement.classList.contains("start-in-archive") || opening.hidden;
      root.classList.toggle("dmp-hidden", !isArchiveReady);
      return;
    }
    const isPreview = /danhabor-001-preview\.html/i.test(framedPage);
    root.classList.toggle("dmp-on-preview", isPreview);
    root.classList.toggle("dmp-hidden", isPreview && !framedArchiveReady);
  };

  elements.play.addEventListener("click", togglePlayback);
  elements.panelPlay.addEventListener("click", togglePlayback);
  elements.expand.addEventListener("click", () => {
    state.expanded = !state.expanded;
    updateExpanded();
    saveState();
  });
  elements.previous.addEventListener("click", playPrevious);
  elements.next.addEventListener("click", playNext);
  elements.rewind.addEventListener("click", () => { audio.currentTime = Math.max(0, audio.currentTime - 10); updateTimeline(); saveState(); });
  elements.forward.addEventListener("click", () => { audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + 10); updateTimeline(); saveState(); });
  elements.progress.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = (Number(elements.progress.value) / 100) * audio.duration;
    updateTimeline();
  });
  elements.progress.addEventListener("change", saveState);
  elements.volume.addEventListener("input", () => {
    audio.volume = Number(elements.volume.value);
    if (audio.volume > 0) audio.muted = false;
    updatePlaybackUi();
    saveState();
  });
  elements.mute.addEventListener("click", () => {
    audio.muted = !audio.muted;
    updatePlaybackUi();
    saveState();
  });
  elements.mode.addEventListener("click", cycleMode);
  elements.playlist.addEventListener("click", (event) => {
    const button = event.target.closest(".dmp-track-button");
    if (!button) return;
    loadTrack(Number(button.dataset.trackIndex), { autoplay: true });
  });

  audio.addEventListener("loadedmetadata", () => {
    if (pendingSeek) audio.currentTime = Math.min(pendingSeek, Math.max(0, audio.duration - 0.15));
    pendingSeek = 0;
    updateTimeline();
    updateTrackList();
  });
  audio.addEventListener("timeupdate", updateTimeline);
  audio.addEventListener("play", () => {
    wantsPlayback = true;
    consecutiveErrors = 0;
    updatePlaybackUi();
  });
  audio.addEventListener("pause", updatePlaybackUi);
  audio.addEventListener("ended", () => {
    if (state.playMode === "one") loadTrack(currentIndex, { autoplay: true });
    else playNext();
  });
  audio.addEventListener("error", () => {
    consecutiveErrors += 1;
    setStatus(`无法播放：${PLAYLIST[currentIndex].title}`);
    if (consecutiveErrors < PLAYLIST.length) window.setTimeout(playNext, 700);
    else {
      wantsPlayback = false;
      setStatus("歌单暂时无法播放");
      updatePlaybackUi();
    }
  });

  const resumeAfterGesture = () => {
    if (awaitingGesture || wantsPlayback) attemptPlay();
  };
  document.addEventListener("pointerdown", resumeAfterGesture, { once: true, capture: true });
  document.addEventListener("touchstart", resumeAfterGesture, { once: true, capture: true });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.expanded) {
      state.expanded = false;
      updateExpanded();
      saveState();
      return;
    }
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable) return;
    if (!root.contains(document.activeElement) && !state.expanded) return;
    if (event.code === "Space") { event.preventDefault(); togglePlayback(); }
    if (event.key === "ArrowLeft") { event.preventDefault(); audio.currentTime = Math.max(0, audio.currentTime - 5); }
    if (event.key === "ArrowRight") { event.preventDefault(); audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + 5); }
    if (event.key === "ArrowUp") { event.preventDefault(); audio.volume = Math.min(1, audio.volume + 0.05); elements.volume.value = String(audio.volume); }
    if (event.key === "ArrowDown") { event.preventDefault(); audio.volume = Math.max(0, audio.volume - 0.05); elements.volume.value = String(audio.volume); }
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    try {
      const target = new URL(link.href, location.href);
      if (target.protocol === location.protocol && (target.protocol === "file:" || target.origin === location.origin)) saveState();
    } catch {}
  }, true);
  document.addEventListener("visibilitychange", () => { if (document.hidden) saveState(); });
  window.addEventListener("pagehide", saveState);
  window.addEventListener("beforeunload", saveState);

  const openingVisibilityTimer = document.querySelector("#opening-intro")
    ? window.setInterval(updateVisibility, 300)
    : 0;
  window.addEventListener("message", (event) => {
    if (!event.data || event.data.type !== "danhabor:page-state") return;
    framedPage = event.data.path || event.data.href || framedPage;
    framedArchiveReady = Boolean(event.data.archiveReady);
    syncTrackForPage(framedPage);
    updateVisibility();
  });

  window.DanhaborMusicPlayer = Object.freeze({
    audio,
    playlist: PLAYLIST,
    play: attemptPlay,
    pause,
    toggle: togglePlayback,
    next: playNext,
    previous: playPrevious,
    save: saveState,
    select: (trackId, autoplay = true) => {
      const index = PLAYLIST.findIndex((track) => track.id === trackId);
      if (index >= 0) loadTrack(index, { autoplay });
    },
    getState: snapshot,
  });

  renderPlaylist();
  updateTrackUi();
  updateExpanded();
  updateMode();
  updatePlaybackUi();
  updateVisibility();
  loadTrack(currentIndex, { autoplay: false, seek: state.currentTime });
  syncTrackForPage(requestedPage);
  if (state.isPlaying) {
    wantsPlayback = true;
    attemptPlay();
  }
  saveTimer = window.setInterval(() => { if (wantsPlayback) saveState(); }, SAVE_INTERVAL);
  window.addEventListener("unload", () => {
    window.clearInterval(saveTimer);
    if (openingVisibilityTimer) window.clearInterval(openingVisibilityTimer);
  }, { once: true });
})();
