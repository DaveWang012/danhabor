(() => {
  const STORAGE_KEY = "danhabor.characters.archive.v2";
  const LAST_CHARACTER_KEY = "danhabor.characters.last.v1";
  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const defaults = deepClone(window.DANHABOR_CHARACTER_DEFAULTS || []);
  const app = document.querySelector("#archive-app");
  const archiveWorkspace = document.querySelector(".archive-workspace");
  const archiveFolder = document.querySelector(".archive-folder");
  const passport = document.querySelector("#passport");
  const passportCover = document.querySelector("#passport-open");
  const passportIdentity = document.querySelector("#passport-identity");
  const passportLower = document.querySelector("#passport-lower");
  const passportHinge = document.querySelector("#passport-hinge");
  const paperStack = document.querySelector("#paper-stack");
  const relatedList = document.querySelector("#related-list");
  const archiveStatus = document.querySelector("#archive-status");
  const search = document.querySelector("#character-search");
  const searchOptions = document.querySelector("#character-options");
  const editDrawer = document.querySelector("#edit-drawer");
  const drawerScrim = document.querySelector("#drawer-scrim");
  const form = document.querySelector("#character-form");
  const toast = document.querySelector("#toast");
  const lightbox = document.querySelector("#image-lightbox");
  const lightboxStage = document.querySelector("#lightbox-stage");
  const lightboxImage = document.querySelector("#lightbox-image");
  const lightboxTitle = document.querySelector("#lightbox-title");
  const lightboxCaption = document.querySelector("#lightbox-caption");
  const lightboxReplaceFile = document.querySelector("#lightbox-replace-file");

  let characters = loadCharacters();
  let currentIndex = Math.max(0, characters.findIndex((character) => character.id === readStorage(LAST_CHARACTER_KEY)));
  let state = "passportClosed";
  let transitionLocked = false;
  let paperRenderToken = 0;
  let editSnapshot = null;
  let addingCharacter = false;
  let toastTimer = 0;
  let lightboxItems = [];
  let lightboxIndex = 0;
  let imageScale = 1;
  let imageX = 0;
  let imageY = 0;
  let dragStart = null;

  const ARCHIVE_WIDTH = 1450;
  const ARCHIVE_HEIGHT = 1080;
  const ARCHIVE_VERTICAL_GUTTER = 40;
  const DEFAULT_PASSPORT_COVER = "./danhabor-passport-cover.png";
  const DEFAULT_LIN_VISA_PAGE = "./danhabor-passport-visa-page.png";
  const ARCHIVE_PLACEHOLDER_IMAGE = "./danhabor-character-folder-empty.png";

  function readStorage(key) {
    try { return localStorage.getItem(key) || ""; }
    catch { return ""; }
  }

  function loadCharacters() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) && saved.length ? saved : deepClone(defaults);
    } catch {
      return deepClone(defaults);
    }
  }

  function saveCharacters(message = "人物档案已保存到当前浏览器。") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
      localStorage.setItem(LAST_CHARACTER_KEY, currentCharacter().id);
      showToast(message);
      return true;
    } catch {
      showToast("浏览器存储空间不足，请改用图片路径并缩小数据。");
      return false;
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2600);
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
  }

  function currentCharacter() {
    return characters[currentIndex] || characters[0];
  }

  function initials(character) {
    return String(character?.name || "?").trim().slice(0, 2) || "?";
  }

  function setState(nextState, statusText) {
    state = nextState;
    app.dataset.state = nextState;
    if (statusText) archiveStatus.textContent = statusText;
  }

  function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  function updateArchiveScale() {
    const availableWidth = Math.max(320, window.innerWidth - 24);
    const scaleFactor = Math.min(1, availableWidth / ARCHIVE_WIDTH);
    const scaledWidth = ARCHIVE_WIDTH * scaleFactor;
    const scaledHeight = ARCHIVE_HEIGHT * scaleFactor;

    archiveFolder.style.setProperty("--archive-scale", String(scaleFactor));
    archiveWorkspace.style.width = `${scaledWidth}px`;
    archiveWorkspace.style.height = `${scaledHeight + ARCHIVE_VERTICAL_GUTTER}px`;
  }

  function portraitMarkup(character, className = "portrait-placeholder") {
    if (character.passportPhoto) {
      return `
        <span class="${className}" aria-label="${escapeHtml(character.name)}照片占位">${escapeHtml(initials(character))}</span>
        <img
          src="${escapeHtml(character.passportPhoto)}"
          data-image-initials="${escapeHtml(initials(character))}"
          alt="${escapeHtml(character.name)}证件照"
        />`;
    }
    return `<span class="${className}" aria-label="${escapeHtml(character.name)}照片占位">${escapeHtml(initials(character))}</span>`;
  }

  function handleArchiveImageFailure(image) {
    const fallbackSource = image.dataset.fallbackSrc || "";
    if (fallbackSource && image.dataset.fallbackTried !== "true") {
      image.dataset.fallbackTried = "true";
      image.src = fallbackSource;
      return;
    }
    image.hidden = true;
  }

  function installImageFallbacks(root) {
    root.querySelectorAll("img[data-image-initials]").forEach((image) => {
      if (image.complete && image.naturalWidth === 0) {
        handleArchiveImageFailure(image);
      }
    });
  }

  document.addEventListener(
    "error",
    (event) => {
      const image = event.target;
      if (
        image instanceof HTMLImageElement &&
        image.matches("img[data-image-initials]")
      ) {
        handleArchiveImageFailure(image);
      }
    },
    true
  );

  function renderPassport() {
    const character = currentCharacter();
    const coverImage = character.passportCover || DEFAULT_PASSPORT_COVER;
    const visaPageImage = typeof character.visaPageImage === "string"
      ? character.visaPageImage
      : character.id === "lin-haining" ? DEFAULT_LIN_VISA_PAGE : "";

    document.documentElement.style.setProperty("--page-accent", character.theme?.accent || "#a56c2c");
    document.querySelector("#cover-number").textContent = character.passportNumber || "UNFILED";
    passportCover.classList.toggle("has-cover-image", Boolean(coverImage));
    passportCover.style.backgroundImage = coverImage ? `url(${JSON.stringify(coverImage)})` : "";
    passportLower.classList.toggle("has-visa-page-image", Boolean(visaPageImage));
    passportLower.style.backgroundImage = visaPageImage ? `url(${JSON.stringify(visaPageImage)})` : "";
    const passportPhotoIndex = character.passportPhoto ? 0 : -1;
    passportIdentity.innerHTML = `
      <header class="passport-identity-header">
        <strong>丹港管理委员会 / PERSONNEL IDENTITY</strong>
        <span>NO. ${escapeHtml(character.passportNumber)}</span>
      </header>
      <button class="passport-photo-button" type="button" ${passportPhotoIndex >= 0 ? `data-lightbox-index="${passportPhotoIndex}"` : "disabled"} aria-label="查看${escapeHtml(character.name)}证件照">
        ${portraitMarkup(character)}
      </button>
      <dl class="identity-fields">
        ${identityField("姓名 / NAME", character.name, true)}
        ${identityField("外文名 / GIVEN NAME", character.foreignName)}
        ${identityField("性别 / SEX", character.gender)}
        ${identityField("出生日期 / DATE OF BIRTH", character.birthDate)}
        ${identityField("出生地 / PLACE OF BIRTH", character.birthPlace)}
        ${identityField("国籍 / NATIONALITY", character.nationality)}
        ${identityField("所属地区 / REGION", character.region)}
        ${identityField("职业 / OCCUPATION", character.occupation)}
        ${identityField("签发 / ISSUE", character.issueDate)}
        ${identityField("有效期 / EXPIRY", character.expiryDate)}
      </dl>
      <div class="identity-issue-line">
        <span>签发机构 / ISSUING AUTHORITY</span>
        <strong>丹港管理委员会出入境事务局</strong>
        <em>${escapeHtml(character.name)}</em>
      </div>
      <pre class="machine-code">${escapeHtml(character.machineReadableCode)}</pre>`;
    installImageFallbacks(passportIdentity);

    const stamps = Array.isArray(character.stamps) ? character.stamps : [];
    passportLower.innerHTML = `
      <div class="visa-page">
        <header class="visa-page-title"><span>签证 / VISAS</span><span>${escapeHtml(character.name)} / ${escapeHtml(character.passportNumber)}</span></header>
        <div class="stamp-grid">
          ${stamps.map((stamp, index) => `<div class="passport-stamp" data-tone="${escapeHtml(stamp.tone || "blue")}" style="--stamp-rotation:${[-2, 1.5, -.8, 2.2, -1.4, .6][index % 6]}deg"><strong>${escapeHtml(stamp.place)}</strong><span>${escapeHtml(stamp.date)}</span></div>`).join("")}
        </div>
        <footer class="visa-page-foot">THIS PASSPORT IS VALID FOR OFFICIAL SERVICE ONLY / 本护照仅限公务通行</footer>
      </div>`;
    updateLightboxItems();
  }

  function identityField(label, value, emphasized = false) {
    return `<div class="identity-field ${emphasized ? "identity-field-name" : ""}"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || "—")}</dd></div>`;
  }

  function renderSearchOptions() {
    searchOptions.innerHTML = characters.map((character) => `<option value="${escapeHtml(character.name)}">${escapeHtml(character.foreignName || character.id)}</option>`).join("");
  }

  function characterAvatar(character) {
    if (character.avatar || character.passportPhoto) {
      const imageSource = character.avatar || character.passportPhoto;
      const fallbackSource = character.avatar && character.passportPhoto && character.avatar !== character.passportPhoto
        ? character.passportPhoto
        : "";
      return `
        <span class="related-avatar-fallback">${escapeHtml(initials(character))}</span>
        <img
          src="${escapeHtml(imageSource)}"
          data-fallback-src="${escapeHtml(fallbackSource)}"
          data-image-initials="${escapeHtml(initials(character))}"
          alt="${escapeHtml(character.name)}头像"
        />`;
    }
    return `<span class="related-avatar-fallback">${escapeHtml(initials(character))}</span>`;
  }

  function renderRelatedCharacters() {
    const character = currentCharacter();
    const relatedIds = Array.isArray(character.relatedCharacters) ? character.relatedCharacters : [];
    const related = relatedIds.map((id) => characters.find((item) => item.id === id)).filter(Boolean);
    const fallback = characters.filter((item) => item.id !== character.id).slice(0, 5);
    const visible = related.length ? related : fallback;
    relatedList.innerHTML = visible.map((item) => `
      <button class="related-character" type="button" data-character-id="${escapeHtml(item.id)}" aria-label="切换到${escapeHtml(item.name)}">
        <span class="related-avatar">${characterAvatar(item)}</span>
        <span>${escapeHtml(item.name)}</span>
      </button>`).join("");
    installImageFallbacks(relatedList);
  }

  function renderPaperStack({ reveal = true } = {}) {
    const token = ++paperRenderToken;
    const character = currentCharacter();
    const organizations = Array.isArray(character.organizations) ? character.organizations : [];
    const timeline = Array.isArray(character.timeline) ? character.timeline : [];
    const gallery = Array.isArray(character.gallery) ? character.gallery : [];
    const galleryOffset = character.passportPhoto ? 1 : 0;
    const pocketImages = Array.from({ length: 4 }, (_, index) => gallery[index] || null);
    const photoSlots = pocketImages.map((image, index) => {
      if (!image) {
        return `<button class="archive-photo archive-photo-empty" type="button" data-lightbox-index="${galleryOffset + index}" aria-label="打开第${index + 1}张资料照片位置">
          <img src="${ARCHIVE_PLACEHOLDER_IMAGE}" alt="" loading="lazy" />
        </button>`;
      }
      return `<button class="archive-photo" type="button" data-lightbox-index="${galleryOffset + index}" aria-label="放大${escapeHtml(image.title || "资料图片")}">
        <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.title || "资料图片")}" loading="lazy" />
      </button>`;
    }).join("");
    const photoCaptions = pocketImages.map((image, index) => `<span>
      <strong>${escapeHtml(image?.title || `资料位置 ${String(index + 1).padStart(2, "0")}`)}</strong>
      <small>${escapeHtml(image?.caption || image?.year || "点击上方位置添加图片与说明")}</small>
    </span>`).join("");

    paperStack.classList.remove("is-visible");
    paperStack.innerHTML = `
      <div class="paper-grid">
        ${paperCard("人物概述", "PERSONNEL OVERVIEW", character.summary, "paper-summary", 0)}
        ${paperCard("经历摘要", "EXPERIENCE", character.experience, "paper-experience", 1)}
        <section class="paper-card paper-organizations" style="--paper-index:2">
          <h2>所属阵营 / 组织 <small>AFFILIATIONS</small></h2>
          <div class="organization-tags">${organizations.map((organization) => `<span class="organization-tag">${escapeHtml(organization)}</span>`).join("") || "<span>未归档</span>"}</div>
        </section>
        <section class="paper-card paper-timeline" style="--paper-index:3">
          <h2>重要节点 <small>TIMELINE</small></h2>
          <div class="timeline-list">${timeline.map((item) => `<div class="timeline-row"><time>${escapeHtml(item.date)}</time><span>${escapeHtml(item.text)}</span></div>`).join("") || "<p>暂无记录</p>"}</div>
        </section>
      </div>
      <section class="archive-pocket" aria-label="相关影像收纳袋">
        <div class="archive-pocket-photos">
          <p>相关影像 <small>VISUAL RECORDS</small></p>
          <div class="gallery-list">${photoSlots}</div>
        </div>
        <div class="archive-pocket-captions">${photoCaptions}</div>
        <span class="archive-pocket-reel" aria-hidden="true"></span>
      </section>`;
    if (reveal) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (token === paperRenderToken && state !== "passportClosed" && state !== "passportClosing") paperStack.classList.add("is-visible");
      }));
    }
  }

  function paperCard(title, label, body, className, index) {
    return `<section class="paper-card ${className}" style="--paper-index:${index}"><h2>${escapeHtml(title)} <small>${escapeHtml(label)}</small></h2><p>${escapeHtml(body || "暂无记录")}</p></section>`;
  }

  function clearPaperStack() {
    paperRenderToken += 1;
    paperStack.classList.remove("is-visible");
    window.setTimeout(() => {
      if (state === "passportClosed" || state === "passportClosing") paperStack.replaceChildren();
    }, 280);
  }

  function renderCharacter({ renderPapers = state === "passportOpen" } = {}) {
    if (!characters.length) return;
    renderPassport();
    renderRelatedCharacters();
    renderSearchOptions();
    search.value = "";
    if (renderPapers) renderPaperStack();
    localStorage.setItem(LAST_CHARACTER_KEY, currentCharacter().id);
    preloadAdjacentCharacters();
  }

  async function openPassport() {
    if (transitionLocked || state !== "passportClosed") return;
    transitionLocked = true;
    setState("passportOpening", `OPENING / 正在调取 ${currentCharacter().name} 档案`);
    renderPaperStack({ reveal: false });
    await wait(230);
    paperStack.classList.add("is-visible");
    await wait(560);
    setState("passportOpen", `FILE OPEN / ${currentCharacter().name} · ${currentCharacter().occupation}`);
    transitionLocked = false;
  }

  async function closePassport() {
    if (transitionLocked || state !== "passportOpen") return;
    transitionLocked = true;
    setState("passportClosing", "CLOSING / 正在归还人物档案");
    clearPaperStack();
    await wait(570);
    setState("passportClosed", "PASSPORT CLOSED / 选择护照进入人物档案");
    transitionLocked = false;
  }

  async function changeCharacter(nextIndex) {
    if (transitionLocked || !characters.length) return;
    const normalizedIndex = (nextIndex + characters.length) % characters.length;
    if (normalizedIndex === currentIndex) return;
    transitionLocked = true;
    if (state === "passportOpen") {
      setState("passportClosing", "CHANGING FILE / 正在合上当前护照");
      clearPaperStack();
      await wait(540);
    }
    setState("characterChanging", "CHANGING FILE / 装入新人物档案");
    currentIndex = normalizedIndex;
    renderCharacter({ renderPapers: false });
    await wait(120);
    setState("passportOpening", `OPENING / 正在调取 ${currentCharacter().name} 档案`);
    renderPaperStack({ reveal: false });
    await wait(180);
    paperStack.classList.add("is-visible");
    await wait(610);
    setState("passportOpen", `FILE OPEN / ${currentCharacter().name} · ${currentCharacter().occupation}`);
    transitionLocked = false;
  }

  function updateLightboxItems() {
    const character = currentCharacter();
    lightboxItems = [];
    if (character.passportPhoto) {
      lightboxItems.push({ src: character.passportPhoto, title: `${character.name}证件照`, year: character.issueDate, caption: `${character.passportNumber} / ${character.region}`, kind: "passport" });
    }
    const gallery = Array.isArray(character.gallery) ? character.gallery : [];
    for (let index = 0; index < 4; index += 1) {
      const item = gallery[index];
      lightboxItems.push(item?.src
        ? { ...item, kind: "gallery", galleryIndex: index }
        : {
            src: ARCHIVE_PLACEHOLDER_IMAGE,
            title: `未归档影像位置 ${String(index + 1).padStart(2, "0")}`,
            caption: "使用“替换图片”装入资料图与说明。",
            kind: "gallery",
            galleryIndex: index,
            placeholder: true
          });
    }
  }

  function imageFileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!file?.type?.startsWith("image/")) return reject(new Error("invalid image"));
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);
      image.onload = () => {
        const maxSize = 1600;
        const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        context.fillStyle = "#ded2b8";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("image load failed"));
      };
      image.src = objectUrl;
    });
  }

  async function replaceLightboxImage(file) {
    if (!file) return;
    const character = currentCharacter();
    const item = lightboxItems[lightboxIndex];
    if (!item) return;
    const snapshot = deepClone(character);
    try {
      const src = await imageFileToDataUrl(file);
      if (item.kind === "passport") {
        character.passportPhoto = src;
      } else {
        character.gallery = Array.isArray(character.gallery) ? character.gallery : [];
        const previous = character.gallery[item.galleryIndex] || {};
        character.gallery[item.galleryIndex] = {
          ...previous,
          src,
          title: previous.title || file.name.replace(/\.[^.]+$/, "") || `资料图片 ${item.galleryIndex + 1}`,
          caption: previous.caption || "由本地资料图片替换。",
          year: previous.year || new Date().getFullYear().toString()
        };
      }
      if (!saveCharacters("图片已替换并保存到当前浏览器。")) {
        characters[currentIndex] = snapshot;
        return;
      }
      renderCharacter();
      updateLightboxItems();
      updateLightbox();
    } catch {
      showToast("无法读取该图片，请换一张尺寸较小的 JPG 或 PNG。");
    } finally {
      lightboxReplaceFile.value = "";
    }
  }

  function openLightbox(index) {
    if (!lightboxItems.length || !lightboxItems[index]) return;
    lightboxIndex = index;
    resetImageTransform();
    updateLightbox();
    lightbox.showModal();
    document.body.classList.add("is-lightbox-open");
  }

  function updateLightbox() {
    const item = lightboxItems[lightboxIndex];
    if (!item) return;
    lightboxImage.src = item.src;
    lightboxImage.alt = item.title || "人物档案图片";
    lightboxTitle.textContent = item.title || "未命名影像";
    lightboxCaption.textContent = [item.year, item.caption].filter(Boolean).join(" / ");
    updateImageTransform();
    document.querySelector("#lightbox-previous").disabled = lightboxItems.length < 2;
    document.querySelector("#lightbox-next").disabled = lightboxItems.length < 2;
  }

  function closeLightbox() {
    if (lightbox.open) lightbox.close();
    document.body.classList.remove("is-lightbox-open");
    resetImageTransform();
  }

  function stepLightbox(direction) {
    if (lightboxItems.length < 2) return;
    lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
    resetImageTransform();
    updateLightbox();
  }

  function updateImageTransform() {
    lightboxImage.style.setProperty("--image-scale", imageScale);
    lightboxImage.style.setProperty("--image-x", `${imageX}px`);
    lightboxImage.style.setProperty("--image-y", `${imageY}px`);
  }

  function resetImageTransform() {
    imageScale = 1;
    imageX = 0;
    imageY = 0;
    updateImageTransform();
  }

  function setImageScale(nextScale) {
    imageScale = Math.max(0.7, Math.min(4, nextScale));
    if (imageScale <= 1) { imageX = 0; imageY = 0; }
    updateImageTransform();
  }

  function openEditor({ adding = false } = {}) {
    if (transitionLocked) return;
    addingCharacter = adding;
    editSnapshot = deepClone(currentCharacter());
    fillEditor(currentCharacter());
    document.querySelector("#edit-drawer-title").textContent = adding ? "新增人物档案" : `编辑档案 · ${currentCharacter().name}`;
    document.querySelector("#delete-character").hidden = adding || characters.length <= 1;
    editDrawer.classList.add("is-open");
    drawerScrim.classList.add("is-open");
    editDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-editor-open");
  }

  function closeEditor({ restore = false } = {}) {
    if (restore && editSnapshot) {
      if (addingCharacter) {
        characters.splice(currentIndex, 1);
        currentIndex = Math.max(0, currentIndex - 1);
      } else {
        characters[currentIndex] = editSnapshot;
      }
      renderCharacter();
    }
    addingCharacter = false;
    editSnapshot = null;
    editDrawer.classList.remove("is-open");
    drawerScrim.classList.remove("is-open");
    editDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-editor-open");
  }

  function fillEditor(character) {
    const simpleFields = ["id", "name", "foreignName", "gender", "birthDate", "birthPlace", "nationality", "region", "occupation", "passportPhoto", "avatar", "passportCover", "visaPageImage", "passportNumber", "issueDate", "expiryDate", "machineReadableCode", "summary", "experience"];
    simpleFields.forEach((key) => { if (form.elements[key]) form.elements[key].value = character[key] || ""; });
    form.elements.themeAccent.value = character.theme?.accent || "#a56c2c";
    form.elements.themeStamp.value = character.theme?.stamp || "#31576b";
    ["organizations", "timeline", "stamps", "gallery", "relatedCharacters", "customPaperSections"].forEach((key) => {
      form.elements[key].value = JSON.stringify(character[key] || [], null, 2);
      form.elements[key].removeAttribute("aria-invalid");
    });
    updateEditorMediaPreview("passportPhoto");
    updateEditorMediaPreview("avatar");
  }

  function updateEditorMediaPreview(fieldName) {
    const preview = form.querySelector(`[data-media-preview="${fieldName}"]`);
    if (!preview) return;
    const image = preview.querySelector("img");
    const note = preview.querySelector("span");
    const value = form.elements[fieldName]?.value.trim() || "";
    const fallback = fieldName === "avatar" ? form.elements.passportPhoto?.value.trim() : "";
    const source = value || fallback || "";
    preview.classList.toggle("is-empty", !source);
    image.removeAttribute("src");
    if (source) image.src = source;
    note.textContent = value
      ? (value.startsWith("data:image/") ? "已载入本地图片，保存档案后将保留在当前浏览器。" : value)
      : (fallback ? "当前头像沿用证件照。" : fieldName === "avatar" ? "未单独设置时将使用证件照。" : "尚未装入证件照。");
  }

  async function chooseEditorMedia(fieldName, file) {
    if (!file) return;
    const fileInput = form.querySelector(`[data-media-input="${fieldName}"]`);
    try {
      const src = await imageFileToDataUrl(file);
      form.elements[fieldName].value = src;
      currentCharacter()[fieldName] = src;
      renderCharacter();
      updateEditorMediaPreview("passportPhoto");
      updateEditorMediaPreview("avatar");
      showToast(`${fieldName === "passportPhoto" ? "证件照" : "头像"}已装入，点击“保存”写入浏览器。`);
    } catch {
      showToast("无法读取该图片，请选择 JPG、PNG 或 WebP 文件。");
    } finally {
      if (fileInput) fileInput.value = "";
    }
  }

  function applyEditorPreview(target) {
    const character = currentCharacter();
    const key = target.name;
    if (!key) return;
    if (key === "themeAccent" || key === "themeStamp") {
      character.theme ||= {};
      character.theme[key === "themeAccent" ? "accent" : "stamp"] = target.value;
      renderCharacter();
      return;
    }
    if (target.matches("[data-json]")) {
      try {
        character[key] = JSON.parse(target.value || "[]");
        target.removeAttribute("aria-invalid");
      } catch {
        target.setAttribute("aria-invalid", "true");
        return;
      }
    } else {
      character[key] = target.value;
    }
    renderCharacter();
    if (key === "passportPhoto" || key === "avatar") {
      updateEditorMediaPreview("passportPhoto");
      updateEditorMediaPreview("avatar");
    }
  }

  function validateEditor() {
    const invalidJson = [...form.querySelectorAll("[data-json]")].filter((field) => {
      try { JSON.parse(field.value || "[]"); field.removeAttribute("aria-invalid"); return false; }
      catch { field.setAttribute("aria-invalid", "true"); return true; }
    });
    if (invalidJson.length) {
      invalidJson[0].focus();
      showToast("JSON 格式有误，请修正标红字段。");
      return false;
    }
    const duplicate = characters.some((character, index) => character.id === form.elements.id.value.trim() && index !== currentIndex);
    if (duplicate) {
      form.elements.id.focus();
      showToast("人物 ID 已存在，请使用唯一 ID。");
      return false;
    }
    return true;
  }

  async function addCharacter() {
    if (transitionLocked) return;
    const template = deepClone(defaults[0] || {});
    const id = `character-${Date.now()}`;
    Object.assign(template, {
      id,
      name: "新人物",
      foreignName: "NEW PERSONNEL",
      avatar: "",
      passportPhoto: "",
      passportCover: DEFAULT_PASSPORT_COVER,
      visaPageImage: "",
      passportNumber: `DG ${String(Date.now()).slice(-7)}`,
      summary: "待补充人物概述。",
      experience: "待补充经历摘要。",
      organizations: [],
      timeline: [],
      stamps: [],
      gallery: [],
      relatedObjects: [],
      relatedCharacters: [],
      customPaperSections: []
    });
    const wasOpen = state === "passportOpen";
    if (wasOpen) {
      transitionLocked = true;
      setState("passportClosing", "NEW FILE / 正在建立人物档案");
      clearPaperStack();
      await wait(540);
      transitionLocked = false;
    }
    characters.push(template);
    currentIndex = characters.length - 1;
    setState("passportClosed", "NEW FILE / 新人物档案尚未保存");
    renderCharacter({ renderPapers: false });
    openEditor({ adding: true });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(characters, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `danhabor-characters-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("人物数据 JSON 已导出。");
  }

  function importData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        const incoming = Array.isArray(imported) ? imported : [imported];
        if (!incoming.length || incoming.some((character) => !character.id || !character.name)) throw new Error("missing fields");
        characters = deepClone(incoming);
        currentIndex = 0;
        saveCharacters("人物档案 JSON 已导入。");
        setState("passportClosed", "IMPORT COMPLETE / 已装入导入的人物数据");
        renderCharacter({ renderPapers: false });
        closeEditor();
      } catch {
        showToast("无法导入：请选择符合人物数据结构的 JSON 文件。");
      }
    };
    reader.readAsText(file);
  }

  function preloadAdjacentCharacters() {
    const indices = [currentIndex, currentIndex - 1, currentIndex + 1].map((index) => (index + characters.length) % characters.length);
    const urls = indices.flatMap((index) => {
      const character = characters[index];
      return [character.avatar, character.passportPhoto, ...(character.gallery || []).slice(0, 2).map((item) => item.src)].filter(Boolean);
    });
    const preload = () => [...new Set(urls)].forEach((url) => { const image = new Image(); image.src = url; });
    if ("requestIdleCallback" in window) window.requestIdleCallback(preload, { timeout: 1000 });
    else window.setTimeout(preload, 120);
  }

  document.querySelector("#passport-open").addEventListener("click", openPassport);
  passportHinge.addEventListener("click", closePassport);
  document.querySelector("#previous-character").addEventListener("click", () => changeCharacter(currentIndex - 1));
  document.querySelector("#next-character").addEventListener("click", () => changeCharacter(currentIndex + 1));
  document.querySelector("#open-editor").addEventListener("click", () => openEditor());
  document.querySelector("#toolbar-edit").addEventListener("click", () => openEditor());
  document.querySelector("#add-character").addEventListener("click", addCharacter);
  document.querySelector("#export-character-data").addEventListener("click", exportData);
  document.querySelector("#close-editor").addEventListener("click", () => closeEditor({ restore: true }));
  document.querySelector("#cancel-edit").addEventListener("click", () => closeEditor({ restore: true }));
  drawerScrim.addEventListener("click", () => closeEditor({ restore: true }));

  passportIdentity.addEventListener("click", (event) => {
    if (event.target.closest("button, a, input, select, textarea")) return;
    closePassport();
  });

  relatedList.addEventListener("click", (event) => {
    const id = event.target.closest("[data-character-id]")?.dataset.characterId;
    const index = characters.findIndex((character) => character.id === id);
    if (index >= 0) changeCharacter(index);
  });

  paperStack.addEventListener("click", (event) => {
    const detail = event.target.closest("[data-paper-detail]");
    if (detail) showToast(`${detail.querySelector("h2")?.childNodes[0]?.textContent?.trim() || "纸片"}已调出，可在编辑档案中修改。`);
  });

  document.addEventListener("click", (event) => {
    const imageButton = event.target.closest("[data-lightbox-index]");
    if (imageButton) openLightbox(Number(imageButton.dataset.lightboxIndex));
    if (event.target.closest("[data-add-gallery]")) {
      openEditor();
      window.setTimeout(() => {
        const galleryField = form.elements.gallery;
        galleryField?.scrollIntoView({ block: "center", behavior: "smooth" });
        galleryField?.focus();
      }, 380);
    }
  });

  search.addEventListener("change", () => {
    const value = search.value.trim().toLowerCase();
    const index = characters.findIndex((character) => [character.name, character.foreignName, character.id, character.passportNumber].some((field) => String(field || "").toLowerCase().includes(value)));
    if (index < 0) return showToast("未找到匹配的人物档案。");
    if (state === "passportOpen") changeCharacter(index);
    else {
      currentIndex = index;
      renderCharacter({ renderPapers: false });
      showToast(`已选择 ${currentCharacter().name}，点击护照查看。`);
    }
  });

  form.addEventListener("input", (event) => applyEditorPreview(event.target));
  form.addEventListener("click", (event) => {
    const selectButton = event.target.closest("[data-select-media]");
    if (selectButton) {
      form.querySelector(`[data-media-input="${selectButton.dataset.selectMedia}"]`)?.click();
      return;
    }
    const clearButton = event.target.closest("[data-clear-media]");
    if (clearButton) {
      const fieldName = clearButton.dataset.clearMedia;
      form.elements[fieldName].value = "";
      currentCharacter()[fieldName] = "";
      renderCharacter();
      updateEditorMediaPreview("passportPhoto");
      updateEditorMediaPreview("avatar");
    }
  });
  form.querySelectorAll("[data-media-input]").forEach((input) => {
    input.addEventListener("change", (event) => chooseEditorMedia(input.dataset.mediaInput, event.target.files[0]));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateEditor()) return;
    characters[currentIndex].id = form.elements.id.value.trim();
    characters[currentIndex].name = form.elements.name.value.trim();
    if (!saveCharacters()) return;
    addingCharacter = false;
    editSnapshot = null;
    renderCharacter();
    closeEditor();
  });

  document.querySelector("#restore-defaults").addEventListener("click", () => {
    if (!confirm("恢复默认人物数据将清除当前浏览器中保存的编辑，是否继续？")) return;
    characters = deepClone(defaults);
    currentIndex = 0;
    localStorage.removeItem(STORAGE_KEY);
    setState("passportClosed", "DEFAULT DATA / 已恢复默认人物数据");
    renderCharacter({ renderPapers: false });
    closeEditor();
    showToast("已恢复默认人物档案。");
  });
  document.querySelector("#import-character-data").addEventListener("click", () => document.querySelector("#import-character-file").click());
  document.querySelector("#import-character-file").addEventListener("change", (event) => importData(event.target.files[0]));
  document.querySelector("#delete-character").addEventListener("click", () => {
    if (characters.length <= 1 || !confirm(`确定删除 ${currentCharacter().name} 的人物档案吗？`)) return;
    characters.splice(currentIndex, 1);
    currentIndex = Math.min(currentIndex, characters.length - 1);
    saveCharacters("人物档案已删除。");
    setState("passportClosed", "FILE DELETED / 已删除人物档案");
    renderCharacter({ renderPapers: false });
    closeEditor();
  });

  document.querySelector("#close-lightbox").addEventListener("click", closeLightbox);
  document.querySelector("#lightbox-previous").addEventListener("click", () => stepLightbox(-1));
  document.querySelector("#lightbox-next").addEventListener("click", () => stepLightbox(1));
  document.querySelector("#lightbox-zoom-in").addEventListener("click", () => setImageScale(imageScale + 0.25));
  document.querySelector("#lightbox-zoom-out").addEventListener("click", () => setImageScale(imageScale - 0.25));
  document.querySelector("#lightbox-reset").addEventListener("click", resetImageTransform);
  document.querySelector("#lightbox-replace").addEventListener("click", () => lightboxReplaceFile.click());
  lightboxReplaceFile.addEventListener("change", (event) => replaceLightboxImage(event.target.files[0]));
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
  lightbox.addEventListener("close", () => document.body.classList.remove("is-lightbox-open"));
  lightboxStage.addEventListener("wheel", (event) => { event.preventDefault(); setImageScale(imageScale + (event.deltaY < 0 ? 0.15 : -0.15)); }, { passive: false });
  lightboxStage.addEventListener("pointerdown", (event) => {
    if (imageScale <= 1) return;
    dragStart = { x: event.clientX - imageX, y: event.clientY - imageY };
    lightboxStage.classList.add("is-dragging");
    lightboxStage.setPointerCapture(event.pointerId);
  });
  lightboxStage.addEventListener("pointermove", (event) => {
    if (!dragStart) return;
    imageX = event.clientX - dragStart.x;
    imageY = event.clientY - dragStart.y;
    updateImageTransform();
  });
  lightboxStage.addEventListener("pointerup", () => { dragStart = null; lightboxStage.classList.remove("is-dragging"); });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (lightbox.open) closeLightbox();
      else if (editDrawer.classList.contains("is-open")) closeEditor({ restore: true });
      return;
    }
    if (lightbox.open && event.key === "ArrowLeft") stepLightbox(-1);
    if (lightbox.open && event.key === "ArrowRight") stepLightbox(1);
  });

  window.addEventListener("resize", updateArchiveScale, { passive: true });
  updateArchiveScale();
  renderCharacter({ renderPapers: false });
})();
