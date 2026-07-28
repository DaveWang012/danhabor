(() => {
  const STORAGE_KEY = "danhabor.author.v1";
  const placeholder = "./danhabor-character-folder-empty.png";
  const defaults = {
    name: "王海街",
    roles: "世界观构建者 / 视觉档案设计师 / 叙事创作者",
    lead: "构建不存在的历史，记录可能发生的故事。\n专注于架空世界观、冷战美学与互动叙事的创作实践。",
    about: "姓名：王海街\n职业：世界观构建者与视觉档案设计师\n所在地：中国",
    archiveNumber: "GA-1963-WHJ",
    established: "2026",
    identity: "世界观构建者",
    organization: "丹港档案馆",
    tags: ["架空历史", "冷战美学", "游戏叙事", "互动体验"],
    tools: "AI Generation / HTML / CSS / JavaScript\nPhotoshop / Figma / 剧本与世界观设计",
    focus: [
      {"icon":"▣","title":"世界观构建","body":"设计复杂的架空历史、政治、地理与文化体系。"},
      {"icon":"▤","title":"视觉档案设计","body":"运用冷战时期的档案美学，打造沉浸式视觉语言。"},
      {"icon":"●","title":"叙事与角色设计","body":"连接人物与世界，创建多维角色与非线性叙事结构。"},
      {"icon":"〈/〉","title":"互动体验开发","body":"通过前端与交互设计，让叙事世界可探索、可体验。"}
    ],
    projects: [
      {"title":"丹港世界计划","body":"构建虚构城市丹港及其政治格局与历史事件。","image":"../public/assets/danhabor-001-cover.jpg"},
      {"title":"丹港档案馆","body":"以档案系统收录人物、案件与历史文件。","image":"./danhabor-ui-reference.png"},
      {"title":"人物志系列","body":"为虚构世界中的人物建立详细身份记录。","image":"./danhabor-character-folder-empty.png"},
      {"title":"冷战美学实验","body":"探索冷战时期的视觉语言与叙事结构。","image":"./danhabor-passport-cover.png"}
    ],
    methods: [
      {"title":"世界构建","body":"从历史与现实中提取灵感。"},
      {"title":"档案化设计","body":"将设定转化为可阅读的档案。"},
      {"title":"互动实现","body":"用网页让世界可探索。"},
      {"title":"叙事传递","body":"让作品与世界观自然连接。"}
    ],
    statement: "我热衷于创造那些不存在于现实中的世界，\n并通过档案与叙事，让它们变得真实可感。",
    portrait: ""
  };
  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const form = document.querySelector("#author-form");
  const dialog = document.querySelector("#author-editor");
  const toast = document.querySelector("#author-toast");
  let data = load();

  function load() {
    try { return {...deepClone(defaults), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")}; }
    catch { return deepClone(defaults); }
  }
  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[char]);
  }
  function render() {
    document.querySelector("#author-name-bracket").textContent = `[ ${data.name} ]`;
    document.querySelector("#author-roles").textContent = data.roles;
    document.querySelector("#author-lead").textContent = data.lead;
    document.querySelector("#author-about").textContent = data.about;
    document.querySelector("#author-signature").textContent = data.name;
    const portrait = document.querySelector("#author-portrait");
    portrait.src = data.portrait || placeholder;
    portrait.alt = `${data.name}肖像`;
    document.querySelector("#author-facts").innerHTML = [
      ["档案编号", data.archiveNumber],
      ["建立时间", data.established],
      ["身份标识", data.identity],
      ["所在机构", data.organization]
    ].map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
    document.querySelector("#author-tags").innerHTML = (data.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    document.querySelector("#author-tools").textContent = data.tools;
    document.querySelector("#author-focus").innerHTML = (data.focus || []).map((item) => `<article class="focus-item"><i>${escapeHtml(item.icon || "•")}</i><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></div></article>`).join("");
    document.querySelector("#author-projects").innerHTML = (data.projects || []).map((item) => `<article class="project-card"><img src="${escapeHtml(item.image || placeholder)}" alt="${escapeHtml(item.title)}" /><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`).join("");
    document.querySelector("#author-methods").innerHTML = (data.methods || []).map((item, index) => `<article class="method-item"><strong>${String(index + 1).padStart(2, "0")} / ${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></article>`).join("");
    document.querySelector("#author-statement").textContent = data.statement;
  }
  function fillForm() {
    for (const [key, value] of Object.entries(data)) {
      const field = form.elements.namedItem(key);
      if (!field) continue;
      field.value = field.dataset.json !== undefined ? JSON.stringify(value, null, 2) : value;
    }
    document.querySelector("#author-portrait-file").value = "";
  }
  function readImage(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve("");
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const scale = Math.min(1, 900 / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.naturalWidth * scale);
          canvas.height = Math.round(image.naturalHeight * scale);
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", .78));
        };
        image.onerror = reject;
        image.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  function notice(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(notice.timer);
    notice.timer = setTimeout(() => { toast.hidden = true; }, 2400);
  }
  function close() { dialog.close(); }
  document.querySelector("#edit-author").addEventListener("click", () => { fillForm(); dialog.showModal(); });
  document.querySelector("#close-author-editor").addEventListener("click", close);
  document.querySelector("#cancel-author").addEventListener("click", close);
  document.querySelector("#reset-author").addEventListener("click", () => {
    if (!confirm("恢复作者档案的默认内容？")) return;
    data = deepClone(defaults);
    localStorage.removeItem(STORAGE_KEY);
    render();
    fillForm();
    notice("已恢复默认作者档案。");
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const next = {};
      for (const [key, current] of Object.entries(data)) {
        const field = form.elements.namedItem(key);
        if (!field) { next[key] = current; continue; }
        next[key] = field.dataset.json !== undefined ? JSON.parse(field.value || "[]") : field.value.trim();
      }
      const portrait = await readImage(document.querySelector("#author-portrait-file").files[0]);
      if (portrait) next.portrait = portrait;
      data = next;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      render();
      close();
      notice("作者档案已保存到当前浏览器。");
    } catch (error) {
      notice(error instanceof SyntaxError ? "JSON 格式有误，请检查数组字段。" : "保存失败，请缩小图片后重试。");
    }
  });
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  render();
})();
