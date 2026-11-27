const stage = document.querySelector(".stage");
const pages = [...document.querySelectorAll(".page")];
const dots = [...document.querySelectorAll("[data-goto]")];
const milestones = [...document.querySelectorAll("[data-phase]")];
const frame = [...document.querySelectorAll(".frame")];
const camera = document.querySelector(".camera");
const cursor = document.querySelector(".cursor");
const ring = document.querySelector(".click-ring");
const paper = document.querySelector(".paper");
const dossier = document.querySelector(".dossier");
const artifact = document.querySelector(".artifact");
const next = document.querySelector("#next");
const back = document.querySelector("#back");
const fullscreen = document.querySelector("#fullscreen");
const fullscreenStatus = document.querySelector("#fullscreen-status");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

const journey = [
  { label: "公开专利文本 · CN107049247A", note: "来源：发明专利申请公布文本首页" },
  { label: "从文献中提取信息，建立结构化档案", note: "建档事实取自项目已有资料与小伯乐保存的记录" },
  { label: "01　成果建档", note: "已建档 · 北京大学 · 分析基准日 2017年8月18日" },
  { label: "02　价值分析与技术对标", artifact: ["分析任务", "价值证据与技术对标", "组织技术、法律、经济三维证据，明确对标对象和待核实事项。"] },
  { label: "03　市场与企业匹配", artifact: ["匹配任务", "核验应用与需求", "整理目标场景、需求来源和潜在合作线索，供技术经理人核验。"] },
  { label: "04　转化决策", artifact: ["决策任务", "比较可选转化方式", "归拢适用条件、证据缺口和下一步行动，由技术经理人判断。"] },
  { label: "汇集各阶段材料，形成成果转化建议书", artifact: ["工作成果 · 结构示意", "成果转化建议书", "专利基本信息、价值和对标证据、市场与合作线索、转化方式及推进计划。"] }
];
const product = [
  { image: "workbench", label: "小伯乐 Agent · 真实工作台", note: "工作台、与小伯乐协作、成果管理、报告中心共用一个工作空间。" },
  { image: "assets", label: "回到成果管理", note: "停在专利列表 · 批量导入留待下一阶段", point: [6, 27.5] }
];
const stageShots = groupedPlayback.prepare([...collaborationReplay.shots,finale.shots]);
const limits = [2, journey.length, product.length, ...stageShots.map(shots => shots.length)];
const imageCache = new Map();
for (const image of ["collaboration", ...product.map(shot=>shot.image), ...stageShots.flat().map(shot=>shot.image)]) {
  if (!imageCache.has(image)) {
    const asset = new Image();
    asset.src = `assets/${image}.png`;
    imageCache.set(image, asset);
  }
}
let page = 1;
let beat = 0;
let front = 0;
let frameName = "";
let pendingShot;
let pointerAnimations = [];
const caption = document.querySelector("#caption");
const note = document.querySelector("#note");
const position = document.querySelector("#position");

function showFrame(name) {
  if (name === frameName) return;
  const visible = frame[front];
  front = 1 - front;
  const entering = frame[front];
  entering.src = imageCache.get(name).src;
  entering.alt = {
    workbench: "真实工作台：在管 3 件、待分析 3 件、分析中 0 件、已完成分析 0 件",
    assets: "真实成果管理：显示本地专利名称、编号、技术领域、当前阶段和进度",
    collaboration: "真实双栏协作：左侧为北大案例建档对话，右侧为专利工作空间",
    benchmark: "真实专利工作空间：四个工作阶段、价值维度及评估和对标按钮",
    reports: "真实报告中心：报告列表、所属专利和报告类型",
    report: "已保存的华南理工大学 CN100496927C 企业匹配报告"
  }[name] ?? stageShots.flat().find(shot => shot.image === name)?.label ?? "";
  entering.removeAttribute("aria-hidden");
  entering.style.zIndex = "2";
  entering.classList.add("current");
  visible.style.zIndex = "1";
  visible.classList.remove("current");
  visible.setAttribute("aria-hidden", "true");
  frameName = name;
}

function showShot(shot, simulate) {
  function land() {
    showFrame(shot.image);
    camera.style.setProperty("--zoom", shot.zoom ?? 1);
    camera.style.setProperty("--origin", (shot.origin ?? [50, 50]).map(n => `${n}%`).join(" "));
    if (page > 3) {
      const sweep = extension.land(shot);
      if (sweep) pointerAnimations.push(sweep);
    }
    if (shot.coTag || shot.stream || shot.archive) {
      pointerAnimations.push(...collaborationReplay.land(stage,shot));
    }
    groupedPlayback.land(shot);
    if (shot.hover && !reduced.matches) {
      const [x,y] = shot.hover;
      cursor.style.left = `${x}%`;
      cursor.style.top = `${y}%`;
      pointerAnimations.push(cursor.animate([
        {opacity:0,transform:"translate(2cqw,1.4cqw)"},
        {opacity:1,transform:"translate(-14%,-9%)"}
      ],{delay:340,duration:660,easing:"ease-out",fill:"forwards"}));
    }
  }
  if (!simulate || !shot.point || reduced.matches) {
    land();
    return;
  }
  const [x,y] = shot.point;
  cursor.style.left = ring.style.left = `${x}%`;
  cursor.style.top = ring.style.top = `${y}%`;
  cursor.style.zIndex = ring.style.zIndex = "4";
  if(!stage.classList.contains("grouped-entry")) camera.style.setProperty("--zoom", 1);
  pointerAnimations = [
    cursor.animate([
      {opacity:0, transform:"translate(.7cqw,1cqw)"},
      {opacity:1, transform:"translate(-14%,-9%)", offset:.5},
      {opacity:1, transform:"translate(-14%,-9%)", offset:.7},
      {opacity:0, transform:"translate(-14%,-9%)"}
    ], {duration:920, easing:"ease-out"}),
    ring.animate([{opacity:.9,scale:.46},{opacity:0,scale:1.45}], {duration:420,delay:400,easing:"ease-out"})
  ];
  pendingShot = setTimeout(land, 460);
}

function show(targetPage, targetBeat, replay = false) {
  clearTimeout(pendingShot);
  groupedPlayback.hideOld();
  fullscreenStatus.hidden = true;
  for (const animation of pointerAnimations) animation.cancel();
  pointerAnimations = [];
  const oldPage = page;
  const oldBeat = beat;
  page = targetPage;
  beat = targetBeat;
  stage.dataset.page = page;
  stage.dataset.beat = beat;
  for (const [index, element] of pages.entries()) element.inert = index + 1 !== page;
  for (const dot of dots) {
    dot.toggleAttribute("aria-current", Number(dot.dataset.goto) === page);
  }
  const journeyBeat = page === 2 ? journey[beat] : undefined;
  const extendedShot = page > 3 ? stageShots[page - 4][beat] : undefined;
  const shot = page === 3 ? product[beat] : extendedShot;
  const sendingDraft = page===oldPage && beat===oldBeat+1 && stageShots[page-4]?.[beat-1]?.draftReveal;
  stage.classList.toggle("grouped-entry", Boolean(shot?.entryReplay || shot?.draftReveal || sendingDraft));
  extension.render(stage,page <= 6 ? extendedShot : undefined);
  phaseThree.render(stage,page >= 7 && page <= 11 ? extendedShot : undefined);
  finale.render(stage,page === 12 ? beat : -1);
  collaborationReplay.reset(stage);
  stage.classList.toggle("focus-shot", Boolean(shot?.zoom));
  paper.setAttribute("aria-hidden", String(page !== 2));
  dossier.classList.toggle("visible", page === 2 && beat >= 1);
  dossier.classList.toggle("compact", page === 2 && beat >= 3);
  dossier.classList.toggle("handoff", page === 3);
  artifact.classList.toggle("handoff", page === 3);
  artifact.classList.toggle("visible", Boolean(journeyBeat?.artifact));
  dossier.setAttribute("aria-hidden", String(page !== 2 || beat < 1));
  artifact.setAttribute("aria-hidden", String(!journeyBeat?.artifact));
  for (const item of milestones) {
    const phase = Number(item.dataset.phase);
    item.toggleAttribute("aria-current", page === 2 && beat === phase);
    item.classList.toggle("done", page === 2 && beat > phase);
  }
  if (journeyBeat?.artifact) {
    const [type, title, description] = journeyBeat.artifact;
    const eyebrow = Object.assign(document.createElement("p"), {className:"eyebrow",textContent:type});
    const heading = Object.assign(document.createElement("h3"), {textContent:title});
    const text = Object.assign(document.createElement("p"), {className:"tagline",textContent:description});
    artifact.replaceChildren(eyebrow,heading,text);
  }
  if (shot) {
    const forward = (oldPage === page && (beat === oldBeat + 1 || (page===5 && beat===4 && oldBeat===1))) ||
      (page === oldPage + 1 && oldBeat === limits[oldPage - 1] - 1);
    showShot(shot, forward);
  }
  else {
    showFrame(page === 2 && beat === 6 ? "workbench" : "collaboration");
    camera.style.setProperty("--zoom", "1");
    camera.style.setProperty("--origin", "50% 50%");
  }
  if (replay && !reduced.matches) {
    const elements = page === 1 ? [...pages[0].children,document.querySelector(".device")] : [page === 2 ? paper : document.querySelector(".device")];
    for (const [index, element] of elements.entries()) {
      for (const animation of element.getAnimations().filter(a => a instanceof CSSAnimation)) {
        animation.currentTime = 0;
      }
      if (page !== 1) {
        pointerAnimations.push(element.animate([{opacity:0,translate:"0 1.6cqw"},{opacity:1,translate:"none"}],
          {duration:760,delay:index * 90,easing:"cubic-bezier(.22,.79,.19,1)"}));
      }
    }
  }
  caption.textContent = shot?.label ?? journeyBeat?.label ?? "";
  note.textContent = shot?.note ?? journeyBeat?.note ?? (journeyBeat?.artifact ? "流程示意 · 本案尚未生成该阶段的分析结果" : "");
  position.textContent = `第 ${page} / ${limits.length} 页 · ${beat + 1} / ${limits[page - 1]} 步`;
  back.disabled = page === 1 && beat === 0;
  next.disabled = page === limits.length && beat === limits.at(-1) - 1;
  next.textContent = next.disabled ? "阶段结束" : beat === limits[page - 1] - 1 ? "下一页 →" : page === 1 ? "继续 →" : "下一步 →";
}

function step(direction) { groupedPlayback.move(direction); }
async function changeFullscreen() {
  fullscreenStatus.hidden = true;
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    fullscreenStatus.textContent = "当前预览不允许网页全屏，请在独立浏览器窗口打开演示并使用浏览器全屏。";
    fullscreenStatus.hidden = false;
  }
}
next.onclick = () => step(1);
back.onclick = () => step(-1);
fullscreen.onclick = changeFullscreen;
document.querySelector("#replay").onclick = () => groupedPlayback.start(page,groupedPlayback.first(page),true);
for (const dot of dots) dot.onclick = () => {
  const target=Number(dot.dataset.goto);
  groupedPlayback.start(target,groupedPlayback.first(target));
};
document.addEventListener("fullscreenchange", () => {
  fullscreen.textContent = document.fullscreenElement ? "退出全屏" : "全屏";
});
document.addEventListener("keydown", event => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  switch (event.key.toLowerCase()) {
    case "arrowright": event.preventDefault(); step(1); break;
    case "arrowleft": event.preventDefault(); step(-1); break;
    case " ": if (!event.target.closest("button")) { event.preventDefault(); step(1); } break;
    case "r": groupedPlayback.start(page,groupedPlayback.first(page),true); break;
    case "f": void changeFullscreen(); break;
    case "h": stage.classList.toggle("clean"); break;
    case "escape": fullscreenStatus.hidden = true; break;
  }
});
Promise.allSettled(groupedPlayback.assets().map(img=>img.decode()));
show(1,0);
