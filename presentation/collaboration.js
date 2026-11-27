const collaborationReplay = (() => {
  const {points: clickPoints, geometry} = collabCapture;
  const reply = document.querySelector(".reply-window");
  const replyImage = reply.querySelector("img");
  const statusImage = document.querySelector(".status-replay");
  const before = document.querySelector(".before-analysis");
  const layers = document.querySelector(".archive-layers");
  const tag = document.querySelector(".collab-tag");
  const noMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const right = {zoom:1.36,origin:[98,33]};
  const left = {zoom:1.33,origin:[24,86]};
  const history = "同一专利 · 已保存建档回放";
  const flowCache = new Map();
  for (const type of Object.keys(liveResults)) {
    if (type === "benchmark") continue;
    const image = new Image();
    image.src=`assets/live-${type}-flow.png`;
    flowCache.set(type,image);
  }
  const taskNames = {
    benchmark: "开展技术对标",
    market: "分析市场应用",
    matching: "查找合作企业",
    decision: "分析转化决策",
    advice: "生成成果转化建议书"
  };
  const selectionPoint = {
    market: thirdPoints["market-tab"],
    decision: thirdPoints["decision-tab"]
  };

  function task(type, {point = selectionPoint[type], entryImage = `co-${type}-entry`} = {}) {
    const name = taskNames[type];
    const record = liveResults[type];
    const completed = Boolean(record);
    const clip = `live-${type}`;
    const previous = {
      benchmark:"co-benchmark-entry",market:"co-market-entry",
      matching:liveResults.market?"live-market-archive":"co-matching-entry",
      decision:"p3-decision",advice:liveResults.decision?"live-decision-archive":"co-advice-entry"
    }[type];
    return [
      {image:entryImage, label:`右侧任务入口 · ${name}`,
        note:"北大案例 · 进入本轮任务前", point, ...right},
      {image:`co-${type}-draft`, label:`点击「${name}」，左侧自动预填任务`,
        note:completed?"真实指令 · CN107049247A · 确认后发送；本次补充了历史回溯基准日。":"真实指令 · CN107049247A · 确认后手动发送；当前只有预填实录。",
        point:clickPoints[`${type}Task`], coTag:"真实界面回放 · 待发送", ...left},
      ...(!completed ? [] : [
        {image:`${clip}-status`,label:`发送后，小伯乐处理「${name}」`,note:resultNote(type, record),
          point:clickPoints[`${type}Send`],coTag:"登录后的实际运行 · 离线回放",
          live:record, replayType:type, before:previous,stream:type!=="benchmark",zoom:1.23,origin:[23,68]},
        ...(record.sourceAsset && type!=="benchmark" ? [
          {image:`${clip}-sources`,label:"检查本轮保留的来源",note:"候选线索需核查来源和公开日期，不等于已证实商业需求。",
            coTag:"本轮保留的网页线索",before:previous,zoom:1.25,origin:[30,67]}
        ] : []),
        {image:`${clip}-${record.regions.length?"base":"archive"}`,label:record.regions.length?"右侧按已有栏目填入本轮分析":"右侧保留本轮实际状态",
          note:resultNote(type, record),coTag:"登录后的实际运行 · 离线回放",live:record,replayType:type,
          archive:Boolean(record.regions.length),zoom:1.23,origin:[98,type==="matching"?55:145]},
        ...(record.detailRegions?.length?[{
          image:`${clip}-detail-base`,
          label:{market:"继续查看行业痛点与市场需求",matching:"继续核对候选企业及匹配理由",decision:"继续展开推荐方式与待解决的问题"}[type],
          note:type==="matching"?"滨松光子是器件线索，Inscopix 是同用途的单光子路线线索；均未证实合作需求。":resultNote(type, record),
          coTag:"右侧实际结果 · 分步回放",
          live:record,replayType:type,detailReplay:true,archive:true,zoom:1.24,origin:[98,42]
        }]:[]),
        ...(type==="market"||type==="advice"?[{image:`${clip}-archive`,label:"完整双栏 · 复核本轮工作成果",
          note:resultNote(type, record),coTag:"登录后的实际运行 · 离线回放"}]:[]),
        ...(record.adviceAsset?[{image:"live-advice-report",label:"打开已生成的《成果转化建议书》",
          note:"北大案例 · AI 生成的建议草稿，供技术经理人复核。",
          coTag:"真实生成记录",zoom:1.37,origin:[98,27]}]:[])
      ])
    ];
  }

  function resultNote(type,record) {
    if(type==="benchmark")return "本轮 Google Patents 检索纳入 0 条可比专利；不使用不适用的通用回退建议。";
    if(type==="market")return record.regions.length?"右侧按已有市场栏目显示本轮结果；推断与公开资料分开。":"左侧保留本轮回答；工作空间未录得可展示的对应字段。";
    if(type==="matching")return record.hasCompanies?"系统返回的候选企业与匹配理由，仍需技术经理人复核，不能视为已对接。":"本轮未核实合格的企业匹配；不将候选线索展示为已确认合作方。";
    if(type==="advice")return record.hasReport?"本轮建议书为 AI 草稿；由技术经理人复核后使用。":"本轮未确认有可归档建议书。";
    return "回溯分析建议，不是已发生的转化结果或交易决定。";
  }

  const original = [...extension.shots, ...phaseThree.shots];
  const shots = original.map(section => [...section]);
  shots[2] = [
    original[2][0],
    {image:"co-filing-prompt",label:"切换到同一件专利的已保存建档任务",
      note:"原提问和实录状态：已收到本轮问题、已获取网页资料、答案已生成。",coTag:history,status:true,zoom:1.25,origin:[22,29]},
    {image:"co-filing-status",label:"小伯乐逐段整理建档资料",
      note:"原有建档回答的流式回放 · 保留 2017 年 8 月 18 日的时间约束。",
      coTag:history, stream:true,zoom:1.26,origin:[25,63]},
    {image:"co-filing-sources",label:"已保存的联网线索，连同来源一起查看",
      note:"画面为原会话保存的真实网页线索，不当作基准日前已核实结论。",coTag:history,zoom:1.29,origin:[22,65]},
    {image:"co-archive-base",label:"从聊天到档案：真实字段逐条填入",
      note:"已保存建档结果的分步回放；名称、编号、申请人、技术领域和摘要均取自本案。",coTag:history,
      archive:true,zoom:1.24,origin:[99,152]},
    {image:"co-archive-full",label:"左侧协作过程，右侧结构化工作成果",
      note:"北京大学 CN107049247A · 同一项专利的建档会话与成果档案。",coTag:history}
  ];
  shots[3] = [
    {image:"p3-technology",label:"专业评价体系 × AI智能分析",note:"三大价值维度共 27 项三级指标。",side:["summary"],point:points["benchmark-tab"],...right},
    original[3][4],
    original[3][5]
  ];
  shots[4] = [
    original[4][0], original[4][2],
    ...task("benchmark"),
    ...(liveResults.benchmark?[]:[original[4].at(-1)])
  ];
  shots[5] = [
    original[5][0], ...task("market"),
    ...task("matching",{point:undefined}),
    ...(liveResults.matching?[]:original[5].slice(-2))
  ];
  shots[6] = [
    ...task("decision",{point:liveResults.matching?thirdPoints["decision-tab"]:null,entryImage:"p3-decision"}),
    ...(liveResults.decision?[]:[original[6][3]]),
    ...task("advice"),
  ];
  shots[7] = liveResults.advice?.hasReport ? [
    {image:"live-pku-reports",label:"北大案例的分析报告归档在同一专利下",note:"报告中心 · CN107049247A · 回溯分析草稿待复核。",
      point:thirdPoints["report-nav"]},
    original[7][7]
  ] : [original[7][1],original[7][3],original[7][4],original[7][6],original[7][7]];

  function reset(stage) {
    stage.classList.remove("co-linked");
    reply.classList.remove("visible");
    statusImage.classList.remove("visible");
    before.classList.remove("visible");
    tag.classList.remove("co-label");
    layers.replaceChildren();
    replyImage.src="assets/co-answer-flow.png";
    replyImage.style.height="";
  }

  function startReply(shot) {
    const area=shot.live?.geometry ?? geometry;
    if(shot.live) {
      replyImage.src=flowCache.get(shot.replayType).src;
    }
    Object.entries({
      left:area.left, top:area.top, width:area.width, height:area.bottom-area.top
    }).forEach(([dimension,value])=>reply.style.setProperty(`--reply-${dimension}`,`${value}%`));
    reply.classList.add("visible");
    const windowHeight = reply.clientHeight;
    const imageHeight = shot.live ? reply.clientWidth*shot.live.flowRatio : replyImage.offsetHeight;
    if (!windowHeight || !imageHeight) return [];
    const distance = Math.max(0,Math.min(imageHeight-windowHeight,windowHeight*2.75));
    const track = [0,0,distance*.34,distance*.68,distance];
    const offsets = [0,.2,.43,.7,1];
    return [
      replyImage.animate(track.map((y,index)=>({transform:`translateY(${-y}px)`,offset:offsets[index]})),
        {duration:6800,fill:"forwards",easing:"linear"}),
      reply.animate([
        {clipPath:"inset(0 0 100% 0)"},
        {clipPath:"inset(0 0 68% 0)",offset:.08},
        {clipPath:"inset(0 0 0 0)",offset:.34},
        {clipPath:"inset(0 0 0 0)"}
      ],{duration:6800,fill:"forwards",easing:"linear"})
    ];
  }

  function lightArchive(stage,shot) {
    stage.classList.add("co-linked");
    const animations = [];
    const regions=shot.detailReplay?shot.live.detailRegions:shot.live?.regions ?? archiveRevealAreas;
    for (const [index, [left,top,width,height]] of regions.entries()) {
      const field = new Image();
      field.src = shot.live?`assets/live-${shot.replayType}-${shot.detailReplay?"detail":"archive"}.png`:"assets/co-archive-full.png";
      field.alt = "";
      field.style.clipPath=`inset(${top}% ${100-left-width}% ${100-top-height}% ${left}%)`;
      layers.append(field);
      if (noMotion.matches) continue;
      const flash=document.createElement("span");
      flash.className="field-flash";
      Object.assign(flash.style,{left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`});
      layers.append(flash);
      const delay=600+index*470;
      animations.push(field.animate([{opacity:0},{opacity:1}],{delay,duration:390,fill:"both",easing:"ease-out"}));
      animations.push(flash.animate([{opacity:0},{opacity:1,offset:.3},{opacity:0}],{delay,duration:590}));
    }
    return animations;
  }

  function showStatus() {
    const [x,y,w,h] = collabCapture.statusArea;
    const bounds = progress => `inset(${y}% ${100-x-w}% ${100-y-h*progress}% ${x}%)`;
    statusImage.style.clipPath=bounds(1);
    statusImage.classList.add("visible");
    if (noMotion.matches) return [];
    return [statusImage.animate([
      {clipPath:bounds(0)}, {clipPath:bounds(.42),offset:.27},
      {clipPath:bounds(.66),offset:.56}, {clipPath:bounds(1)}
    ],{duration:1850,easing:"steps(1, jump-start)"})];
  }

  function land(stage,shot) {
    if(shot.before) {
      before.src=`assets/${shot.before}.png`;
      before.classList.add("visible");
    }
    if (shot.coTag) {
      tag.textContent=shot.coTag;
      tag.classList.add("visible","co-label");
    }
    if (shot.status) return showStatus();
    if (shot.archive) return lightArchive(stage,shot);
    if (noMotion.matches) {
      if (shot.stream) {
        for (const animation of startReply(shot)) animation.finish();
      }
      return [];
    }
    if (shot.stream) return startReply(shot);
    return [];
  }
  return {shots,reset,land};
})();
