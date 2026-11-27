const extension = (() => {
  const focus = document.querySelector(".focus-box");
  const status = document.querySelector(".collab-tag");
  const excel = document.querySelector(".excel");
  const metrics = document.querySelector(".metrics");
  const detail = document.querySelector(".showcase-detail");
  const activeClasses = ["extension","sheet-open","sheet-tech","detail-shot","drag-shot","result-shot","patent-shot","linked"];
  const selectText = {
    comparison: ["原表资料对照 · 两件均待分析", "资料字段，先对齐", [
      ["示例高校丙 · CN106975371A", "膜分离与水处理 · 基准日 2017-07-25"],
      ["示例高校丁 · CN110888056A", "动力电池状态估算 · 基准日 2020-03-17"],
      ["两件基准日状态", "申请已公开，尚未授权。对比窗口的库内摘要和独立权利要求原文仍缺。"]
    ]],
    patent: ["示例高校甲 · 示范专利", "CN107049247A", [
      ["申请人", "示例高校甲"],
      ["技术方向", "光学成像、脑科学、高端科研仪器"],
      ["分析基准日", "2017年8月18日"],
      ["基准日状态", "申请已公开，尚未授权"]
    ]]
  };
  const sheets = document.querySelector(".sheet table");
  const columns = document.createElement("thead");
  const row = columns.insertRow();
  for (const name of workbook.headers) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = name;
    row.append(th);
  }
  sheets.append(columns);
  const tbody = sheets.createTBody();
  for (const entry of workbook.rows) {
    const tr = tbody.insertRow();
    for (const value of entry) tr.insertCell().textContent = value;
  }
  for (const [value,label] of [[workbook.universities,"所高校"],[workbook.records,"项专利"],[workbook.fields,"个资料字段"]]) {
    const item = document.createElement("div");
    item.append(Object.assign(document.createElement("strong"),{textContent:value}),
      Object.assign(document.createElement("span"),{textContent:label}));
    metrics.append(item);
  }

  const shots = [
    [
      {image:"assets", label:"从现有的成果管理，开始批量导入", note:"使用项目真实测试文件 patents_20.xlsx", file:true},
      {image:"bulk-start", label:"同一张表，每一行对应一项专利", note:"高校名称、专利名称、公告号和分析基准日取自原表", file:true, sheet:true, metrics:1},
      {image:"bulk-start", label:"不同专利，各自带着资料与时间口径", note:"横向查看基准日、法律状态、技术领域及技术摘要", file:true, sheet:true, tech:true, metrics:2},
      {image:"bulk-start", label:"18 所高校 · 20 项专利 · 46 个资料字段", note:"这是测试文件规模，不是已完成评估数", file:true, sheet:true, tech:true, metrics:3},
      {image:"bulk-dialog", label:"把 Excel 拖到真实的导入窗口", note:"成果管理 → 上传专利 → 拖拽文件至此", point:points.upload, detail:true, file:true, drag:true},
      {image:"bulk-parsed", label:"识别 20 项；可导入 18 项，重复 2 项", note:"实际解析异常 0 项 · 本次使用「跳过重复专利」", detail:true, zoom:1.10, origin:[50,83]},
      {image:"bulk-list", label:"新增 18 条记录，资产库共 21 条", note:"以原有 3 条为起点；新增条目仍是「待分析」", point:points.confirm, detail:true, zoom:1.12, origin:[61,28], highlight:[17.7,39.3,79.1,9], sweep:true},
      {image:"bulk-list", label:"一次导入，独立建档。", note:"真实导入回放 · 接下来打开「分类与对比」", result:true, hover:points.tools}
    ],
    [
      {image:"bulk-list", label:"不同领域，多项成果，一处管理。", note:"领域从原表可核，列表里未映射的字段仍显示「待补充」", zoom:1.12, origin:[55,22], highlight:[17.7,39.3,79.1,9], sweep:true},
      {image:"classify", label:"打开「分类与对比」", note:"现有分类是收藏分类；支持按状态筛选，不是自动按技术领域分组", point:points.tools, zoom:1.06, origin:[48,20]},
      {image:"collection", label:"按已有收藏分类查看", note:"实际切到「生物学」收藏分类；本批记录尚未归入该分类", point:points.collection, zoom:1.06, origin:[51,24]},
      {image:"filtered", label:"回到全部收藏，筛选「待分析」", note:"本次导入的记录尚未完成评估；据实际工作状态筛选", point:points.status, zoom:1.08, origin:[47,22]},
      {image:"selected", label:"选中示例高校丙、示例高校丁的两条记录", note:"用勾选框加入对比，不计算分数或排名", zoom:1.11, origin:[37,22], highlight:[16,32,80,22]},
      {image:"comparison", label:"看原文和缺项，再决定该补什么", note:"左侧是实际 Excel 原表节选；右侧为产品的真实并排对比", point:points.compare, side:"comparison", zoom:1.12, origin:[50,49]},
      {image:"patent-focus", label:"选择一项成果，开展深度协作。", note:"通过专利号定位记录，由技术经理人主动选择示范专利", point:points["close-compare"], side:"patent", zoom:1.08, origin:[50,22], highlight:[16,45,81,8]}
    ],
    [
      {image:"collab-before", label:"示例高校甲 · CN107049247A", note:"进入同一件专利的实际双栏工作空间", point:points.open},
      {image:"collab-before", label:"协作过程", note:"自然语言沟通、发起任务、补充资料", zoom:1.49, origin:[18,44]},
      {image:"collab-before", label:"工作成果", note:"结构化分析、结果保存、报告沉淀", zoom:1.47, origin:[99,31]},
      {image:"collab-before", label:"在同一页面来回核对", note:"左侧对话与右侧档案围绕同一件专利展开"},
      {image:"task-panel", label:"在右侧打开「技术对标与价值分析」", note:"现有入口包含评估技术价值、开展技术对标等", point:points["benchmark-tab"], zoom:1.36, origin:[98,25]},
      {image:"task-draft", label:"点击「评估技术价值」，左侧自动填入指令", note:"当前实现是预填，技术经理人确认后手动发送；本段没有发起新的在线评估", point:points.task, zoom:1.39, origin:[22,54], highlight:[17,34,40.8,18]},
      {image:"filing-record", label:"切回同一专利的一次真实建档记录", note:"已保存的建档回放 · 可见本轮问题、网页资料提示与回答 · 非现场推理", zoom:1.41, origin:[19,22], historic:true},
      {image:"filing-record", label:"聊天中整理的内容，在右侧按字段查看", note:"真实建档画面：专利名称、编号、申请人和技术摘要；没有演示价值分析已完成", zoom:1.42, origin:[99,29], linked:true, historic:true, highlight:[60.3,27.6,38.4,55]},
      {image:"feedback", label:"技术经理人还可以补充要求、核清证据", note:"输入示例 · 未发送；右侧保留真实界面状态", zoom:1.42, origin:[22,60]},
      {image:"filing-record", label:"左侧，是人与AI协作的过程。", note:"回到完整双栏 · 已保存的高校甲建档记录", historic:true},
      {image:"handoff", label:"右侧，是人与AI共同完成的工作成果。", note:"停在「技术对标与价值分析」· 高校甲案例尚无已核验的对标结果", point:points["benchmark-tab"], zoom:1.13, origin:[92,23], historic:true}
    ]
  ];

  function addInfo(info) {
    const [kicker,title,values] = selectText[info];
    const elements = [
      Object.assign(document.createElement("p"), {className:"eyebrow",textContent:kicker}),
      Object.assign(document.createElement("h3"), {textContent:title})
    ];
    for (const [key,value] of values) {
      const line = document.createElement("p");
      line.append(Object.assign(document.createElement("strong"),{textContent:key}), document.createElement("br"), value);
      elements.push(line);
    }
    detail.replaceChildren(...elements);
  }

  function render(stage, shot) {
    const c = [Boolean(shot),shot?.sheet,shot?.tech,shot?.detail,shot?.drag,shot?.result,shot?.side,shot?.linked];
    activeClasses.forEach((name,index) => stage.classList.toggle(name,Boolean(c[index])));
    excel.classList.toggle("visible",Boolean(shot?.file));
    excel.classList.remove("dropped");
    excel.setAttribute("aria-hidden",String(!shot?.file));
    [...metrics.children].forEach((item,i) => {
      item.classList.toggle("visible", i < (shot?.metrics ?? 0));
      item.setAttribute("aria-hidden", String(i >= (shot?.metrics ?? 0)));
    });
    detail.classList.toggle("visible",Boolean(shot?.side));
    detail.setAttribute("aria-hidden",String(!shot?.side));
    if (shot?.side) addInfo(shot.side);
    status.classList.toggle("visible",Boolean(shot?.historic));
    focus.classList.remove("visible");
  }
  function land(shot) {
    if (shot.drag) requestAnimationFrame(() => {
      if (excel.closest(".drag-shot")) excel.classList.add("dropped");
    });
    if (!shot.highlight) return;
    const [left,top,width,height] = shot.highlight.map(x=>`${x}%`);
    Object.assign(focus.style,{left,top,width,height});
    focus.classList.add("visible");
    if (shot.sweep && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return focus.animate([{transform:"translateY(0)"},{transform:"translateY(100%)"},{transform:"translateY(200%)"}],
        {duration:1500,easing:"cubic-bezier(.22,.79,.19,1)",fill:"forwards"});
    }
  }
  return {shots,render,land};
})();
