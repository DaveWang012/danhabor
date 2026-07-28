(() => {
  const pageKey = document.body.dataset.pageKey;
  const storageKey = `danhabor-${pageKey}-records-v1`;
  const heroStorageKey = `danhabor-${pageKey}-hero-v1`;
  const defaults = JSON.parse(document.querySelector("#seed-data").textContent);
  const recordsRoot = document.querySelector("#records");
  const dialog = document.querySelector("#record-dialog");
  const form = document.querySelector("#record-form");
  const status = document.querySelector("#status");
  const searchInput = document.querySelector("#record-search");
  const hero = document.querySelector(".hero");
  const heroImageInput = document.querySelector("#hero-image-input");
  const resetHeroImage = document.querySelector("#reset-hero-image");
  let records = loadRecords();
  let editingId = null;
  let query = "";

  function loadRecords() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(saved) ? saved : defaults;
    } catch { return defaults; }
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[char]);
  }
  function saveRecords() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(records));
      showStatus("内容已保存在当前浏览器。");
      return true;
    } catch {
      showStatus("保存空间不足，请缩小图片后重试。");
      return false;
    }
  }
  function showStatus(message) {
    status.textContent = message;
    status.hidden = false;
    clearTimeout(status.timer);
    status.timer = setTimeout(() => { status.hidden = true; }, 2500);
  }
  function render() {
    const visible = records.filter((record) => `${record.code} ${record.title} ${record.subtitle} ${record.body}`.toLowerCase().includes(query));
    recordsRoot.classList.toggle("is-single", visible.length === 1);
    recordsRoot.classList.toggle("is-pair", visible.length === 2);
    recordsRoot.innerHTML = visible.length ? visible.map((record) => {
      const media = record.image
        ? `<img src="${escapeHtml(record.image)}" alt="${escapeHtml(record.title)}资料图片" />`
        : `<button class="media-empty" type="button" data-edit="${escapeHtml(record.id)}" aria-label="为${escapeHtml(record.title)}插入图片"><span aria-hidden="true">＋</span><span>插入资料图片</span></button>`;
      const link = record.link ? `<a href="${escapeHtml(record.link)}">打开关联页面</a>` : "";
      return `<article class="record"><div class="record-media">${media}</div><div class="record-copy"><p class="record-code">${escapeHtml(record.code)}</p><h2>${escapeHtml(record.title)}</h2><p class="record-subtitle">${escapeHtml(record.subtitle)}</p><p class="record-body">${escapeHtml(record.body).replace(/\n/g, "<br>")}</p></div><div class="record-actions"><button type="button" data-edit="${escapeHtml(record.id)}">编辑</button>${link}</div></article>`;
    }).join("") : `<div class="empty-state">没有找到匹配的档案记录。</div>`;
  }
  function openEditor(id = null) {
    editingId = id;
    const record = records.find((item) => item.id === id);
    document.querySelector("#editor-title").textContent = record ? "编辑档案记录" : "新增档案记录";
    document.querySelector("#record-code").value = record?.code || "";
    document.querySelector("#record-title").value = record?.title || "";
    document.querySelector("#record-subtitle").value = record?.subtitle || "";
    document.querySelector("#record-body").value = record?.body || "";
    document.querySelector("#record-image-url").value = record?.image?.startsWith("data:") ? "" : (record?.image || "");
    document.querySelector("#record-link").value = record?.link || "";
    document.querySelector("#record-image-file").value = "";
    document.querySelector("#delete-record").hidden = !record;
    dialog.showModal();
  }
  function compressImage(dataUrl, maxSide = 1280, targetLength = 420000) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        context.fillStyle = "#06090b";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        let quality = 0.76;
        let result = canvas.toDataURL("image/jpeg", quality);
        while (result.length > targetLength && quality > 0.42) {
          quality -= 0.08;
          result = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(result);
      };
      image.onerror = () => reject(new Error("图片格式无法读取。"));
      image.src = dataUrl;
    });
  }
  function readImage(file, maxSide = 1280, targetLength = 420000) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve("");
      if (file.size > 12000000) return reject(new Error("图片请控制在 12 MB 以内。"));
      const reader = new FileReader();
      reader.onload = async () => {
        try { resolve(await compressImage(reader.result, maxSide, targetLength)); }
        catch (error) { reject(error); }
      };
      reader.onerror = () => reject(new Error("图片读取失败。"));
      reader.readAsDataURL(file);
    });
  }
  function applyHeroImage(image) {
    if (image) hero.style.backgroundImage = `url(${JSON.stringify(image)})`;
    else hero.style.removeProperty("background-image");
    resetHeroImage.hidden = !image;
  }

  recordsRoot.addEventListener("click", (event) => {
    const id = event.target.closest("[data-edit]")?.dataset.edit;
    if (id) openEditor(id);
  });
  document.querySelector("#add-record").addEventListener("click", () => openEditor());
  document.querySelector("#cancel-editor").addEventListener("click", () => dialog.close());
  document.querySelector("#delete-record").addEventListener("click", () => {
    if (!editingId || !confirm("确定删除这条档案记录吗？")) return;
    records = records.filter((item) => item.id !== editingId);
    if (saveRecords()) { render(); dialog.close(); }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const existing = records.find((item) => item.id === editingId);
    try {
      const uploaded = await readImage(document.querySelector("#record-image-file").files[0]);
      const record = {
        id: existing?.id || `record-${Date.now()}`,
        code: document.querySelector("#record-code").value.trim(),
        title: document.querySelector("#record-title").value.trim(),
        subtitle: document.querySelector("#record-subtitle").value.trim(),
        body: document.querySelector("#record-body").value.trim(),
        image: uploaded || document.querySelector("#record-image-url").value.trim() || existing?.image || "",
        link: document.querySelector("#record-link").value.trim()
      };
      records = existing ? records.map((item) => item.id === editingId ? record : item) : [...records, record];
      if (saveRecords()) { render(); dialog.close(); }
    } catch (error) { showStatus(error.message || "保存失败。"); }
  });
  document.querySelector("#change-hero-image").addEventListener("click", () => {
    heroImageInput.value = "";
    heroImageInput.click();
  });
  heroImageInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const image = await readImage(file, 1920, 720000);
      localStorage.setItem(heroStorageKey, image);
      applyHeroImage(image);
      showStatus("封面背景已更新。");
    } catch (error) { showStatus(error.message || "背景图片保存失败。"); }
  });
  resetHeroImage.addEventListener("click", () => {
    localStorage.removeItem(heroStorageKey);
    applyHeroImage("");
    showStatus("已恢复默认背景。");
  });
  document.querySelector("#search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    query = searchInput.value.trim().toLowerCase();
    render();
  });
  searchInput.addEventListener("input", () => {
    if (!searchInput.value) { query = ""; render(); }
  });
  const now = new Date();
  document.querySelector("#page-date").textContent = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  try { applyHeroImage(localStorage.getItem(heroStorageKey) || ""); }
  catch { applyHeroImage(""); }
  render();
})();
