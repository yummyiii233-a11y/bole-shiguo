const phaseThree = (() => {
  const side = document.querySelector(".evidence-side");
  const board = document.querySelector(".evidence-board");
  const evidenceStage = document.querySelector(".evidence-stage");
  const {labels, config, groups, templates} = valueConfig;
  const {fields, rows} = pkuEvidence;
  const indicator = config.flat().find(([id]) => id === "T03");
  const evidence = name => rows[name].value;
  const dimensions = [
    {index:1, image:"p3-technology", name:"技术价值", note:"技术通俗解读、对标及科研改进；保留原有评价标准。"},
    {index:0, image:"p3-legal", name:"法律价值", note:"基准日仅能确认申请已公开；价值评价需核查权利与证据。", point:thirdPoints["legal-tab"]},
    {index:2, image:"p3-economic", name:"经济价值", note:"成本、市场规模及交易资料未证实，界面未给正式评分。", point:thirdPoints["economic-tab"]}
  ];
  const zoomRight = {zoom:1.42,origin:[99,30]};
  const zoomLeft = {zoom:1.39,origin:[23,79]};
  const pending = "界面实录 · 未发送";
  const history = "预录工作空间 · 非实时推理";

  const shots = [
    [
      {image:"handoff", label:"从右侧工作空间，进入专业价值分析", note:"沿用第 6 页的同一件专利", zoom:1.13,origin:[92,23]},
      ...dimensions.map(({index,image,name,note,point}) => ({
        image, label:name, note, point, side:["dimension",index], zoom:1.32,origin:[98,27]
      })),
      {image:"p3-indicator", label:"以 T03 技术效果为例：有参数，不等于已完成赋值",
        note:"原有标准与实际证据状态；右侧仍为「待核验」", side:["indicator"], zoom:1.54,origin:[100,77], highlight:[60.7,50.9,36,11]},
      {image:"p3-economic", label:"不编造数据，不将未知视为零。",
        note:"材料能够支持什么、还缺什么，分别记录。", side:["unknown"], zoom:1.32,origin:[98,28]},
      {image:"p3-technology", label:"专业评价体系 × AI智能分析",
        note:`法律 7 项、技术 10 项、经济 10 项；本案 ${fields} 条资料记录不等于 139 项已赋值。`, ...zoomRight}
    ],
    [
      {image:"p3-technology", board:"documents", label:"先看真实专利原文", note:"CN107049247A · 公开文本首页、说明书与图 5a/5b"},
      {image:"p3-technology", board:"parameters", count:2, label:"从原文抽取可核对的技术参数", note:"数字对应 2017 年公开版本；不同实验条件不直接横比。"},
      {image:"p3-technology", board:"parameters", count:5, label:"性能数据连同测试条件一起保留", note:"来源：公开说明书及 2017 年 Nature Methods 论文；帧率为 256×256 像素条件。"},
      {image:"filing-record", side:["technical"], label:"用一句话讲清楚技术解决了什么", note:"左侧原建档会话为实录；解读提炼自实际建档记录和扩充版 Excel。", historic:history, ...zoomLeft},
      {image:"p3-technology", label:"打开真实的技术对标入口", note:"实际按钮：开展技术对标；当前尚无已通过核验的对标专利。", ...zoomRight},
      {image:"p3-benchmark-draft", label:"小伯乐预填对标任务：相似专利、原文依据、差异与验证建议",
        note:"老师确认后发送；没有已保存的高校甲对标检索结果。", point:thirdPoints["benchmark-task"], historic:pending, ...zoomLeft},
      {image:"p3-technology", side:["benchmarkGap"], label:"不仅理解技术，更帮助技术走向应用。",
        note:"对标表、科研改进建议及正式对标报告均等待本案真实结果。", ...zoomRight}
    ],
    [
      {image:"p3-technology", board:"market", label:"从技术能力出发，找可能的应用场景", note:"这些方向是资料支持的推断，均非已经确认的商业需求。"},
      {image:"p3-market", label:"切到「市场与企业匹配」", note:"同一专利下组织目标行业、应用场景、行业痛点和市场需求。", point:thirdPoints["market-tab"], ...zoomRight},
      {image:"p3-market-draft", label:"先发起市场应用分析",
        note:"系统预填四类分析问题；此镜头未发送、未执行检索。", point:thirdPoints["market-task"], historic:pending, ...zoomLeft},
      {image:"p3-match-draft", label:"再找合作企业，要求同时给出匹配依据和来源",
        note:"真实入口预填并开启联网搜索；具体企业需有基准日前可核对的材料。", point:thirdPoints["match-task"], historic:pending, ...zoomLeft},
      {image:"p3-market", side:["marketGap"], label:"不只是找到企业，更是找到合作依据。",
        note:"本案没有经过核验的企业候选，因此不展示企业名称或重点标记。", ...zoomRight},
      {image:"p3-decision", label:"进入「转化决策」，保留已经知道的事实和未确认的缺口",
        note:"仍是示例高校甲 CN107049247A。", point:thirdPoints["decision-tab"], ...zoomRight}
    ],
    [
      {image:"p3-decision", board:"inputs", label:"把已核实的资料与尚待补证的环节放到一起",
        note:"分析依据包括已保存的材料与前序分析；当前案例仅有已完成的建档。"},
      {image:"p3-decision", label:"在右侧检查转化决策", note:"综合结论、推荐方式、关键问题、下一步行动建议是实际系统栏目。", ...zoomRight},
      {image:"p3-decision-draft", label:"「分析转化决策」将任务带到左侧聊天",
        note:"指令要求结合已关联资料、既有分析及证据缺口，仍由老师确认发送。", point:thirdPoints["decision-task"], historic:pending, ...zoomLeft},
      {image:"p3-decision", side:["decisionGap"], label:"证据不够时，暂不替技术经理人定结论。",
        note:"本案没有已保存的推进结论、转化路径或行动计划。", ...zoomRight},
      {image:"p3-advice-draft", label:"点击「生成成果转化建议书」，看到真实任务指令",
        note:"未提交；未获得建议书时，「查看建议书」不可用。", point:thirdPoints["advice-task"], historic:pending, ...zoomLeft},
      {image:"p3-decision", label:"AI辅助决策，技术经理人推进转化。",
        note:"保留当前案例待分析的真实状态，接下来查看报告中心。"}
    ],
    [
      {image:"p3-decision", label:"对应专利的建议书，从工作空间发起",
        note:"本案尚无建议书，不展示虚构封面、目录或正文。", ...zoomRight},
      {image:"p3-reports", label:"进入报告中心，按专利和报告类型整理",
        note:"实际报告列表；本案没有正式报告记录。", point:thirdPoints["report-nav"]},
      {image:"p3-templates", label:"查看产品中的实际生成入口",
        note:"点模板预填聊天任务；归档以已有真实结果为准。", point:thirdPoints["report-generate"], zoom:1.13,origin:[94,15]},
      {image:"p3-templates", board:"templates", label:"四类报告模板，对应不同阶段的工作成果",
        note:"来自当前产品配置；这些是模板，不是本案已生成的四份报告。"},
      {image:"p3-archived", label:"打开一份真实归档：示例高校乙企业匹配报告",
        note:"CN100496927C · 独立案例 · 本轮未命中可引用企业需求。", point:thirdPoints["archive-open"], historic:history, zoom:1.12,origin:[53,21]},
      {image:"p3-other-chat", label:"华南理工：报告、聊天与专利独立保存",
        note:"CN100496927C 的已有分析与对话，不挂到示例高校甲专利。", historic:history},
      {image:"p3-back-to-pku", label:"切回示例高校甲，恢复它自己的建档会话",
        note:"CN107049247A · 左侧是独立建档记录，右侧是该专利的结构化信息。", point:thirdPoints["switch-patent"], historic:history},
      {image:"p3-portfolio", label:"从一次AI回答，到长期积累的成果转化资产。",
        note:"回到成果管理，多项专利在同一工作台内独立保存。", point:thirdPoints["asset-nav"]}
    ]
  ];

  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function line(card, label, value, className) {
    const entry = el("p",null,className);
    entry.append(el("b",label + "　"), value);
    card.append(entry);
  }
  function card(kicker,title) {
    const node = el("article",null,"evidence-card");
    node.append(el("p",kicker,"eyebrow"),el("h3",title));
    return node;
  }
  function drawSide([kind,index]) {
    let node;
    if (kind === "summary") {
      node=card("系统内置评价体系", "3 大维度 · 27 项三级指标");
      for (const i of [1,0,2]) {
        const names = ["核查权利状态、保护范围和依赖度。","读懂技术、核对对照条件，保留原评价标准。","核查应用、竞争和收益证据。"];
        line(node,`${labels[i]} · ${config[i].length} 项`,names[i]);
      }
    } else if (kind === "dimension") {
      node = card("指标原始配置 · " + labels[index], `${config[index].length} 项三级指标`);
      const counts = el("div",null,"value-count");
      [[labels.length,"大价值维度"],[config.flat().length,"项三级指标"]].forEach(([value,unit]) => {
        const number=el("div");
        number.append(el("strong",String(value)),el("span",unit));
        counts.append(number);
      });
      node.append(counts);
      for (const [name,...ids] of groups[index]) {
        const group=el("div",null,"value-group");
        group.append(el("b",name),el("small",ids.map(id=>config[index].find(row=>row[0]===id)[1]).join(" · ")));
        node.append(group);
      }
    } else if (kind === "indicator") {
      node=card("原始配置 × 专利资料",`${indicator[0]} ${indicator[1]} · ${indicator[2]}%`);
      line(node,"评价标准",indicator[3]);
      line(node,"原始资料",`横向分辨率 ${evidence("横向分辨率（μm）")} μm，来源：专利实施例。`,"factual");
      line(node,"赋值所需",indicator[4]);
      line(node,"实际结果","待核验；有单项参数，尚不能据此给出改善率或分数。","unassigned");
    } else if (kind === "unknown") {
      node=card(`${fields} 条资料记录 · 2017年8月18日`,"事实、推断与缺项");
      line(node,"已知事实",evidence("基准日法律状态"),"factual");
      line(node,"潜在方向",evidence("潜在应用3")+"（推断）");
      line(node,"尚待核实","单台制造成本、批量生产能力、企业合作意向、市场规模。","unassigned");
    } else if (kind === "technical") {
      node=card("公开资料与建档内容 · 摘要","在自由活动中观察脑活动");
      line(node,"怎么做到",evidence("技术摘要"),"factual");
      line(node,"证据边界",evidence("技术成熟情况"));
    } else if (kind === "benchmarkGap") {
      node=card("技术对标 · 本案未完成","对比要从同口径证据开始");
      line(node,"核对文献","公告号、公开日期和相关结构。");
      line(node,"核对性能","成像条件、视场和帧率应可比；没有可靠同条件数据的不作定量比较。");
      line(node,"实际状态","无已核验对标专利或已生成对标报告。","unassigned");
    } else if (kind === "marketGap") {
      node=card("企业匹配 · 结果待核验","合作理由，需要证据");
      line(node,"时间口径","企业和相关需求依据均须能追溯至 2017年8月18日及以前。");
      line(node,"实际状态","无已核实的企业名单、需求、接洽或重点标记。","unassigned");
    } else {
      node=card("转化决策 · 待分析","什么材料决定能否推进？");
      line(node,"权利边界",evidence("基准日法律状态"));
      line(node,"工程验证","批量生产能力未核实。");
      line(node,"需求证据","企业合作意向、转化合同及市场规模未知。","unassigned");
    }
    side.replaceChildren(node);
  }
  function cardGrid(kind, elements) {
    const grid=el("div",null,kind+" third-reveal");
    elements.forEach((values,index) => {
      const tile=el("article");
      tile.style.setProperty("--seq", index);
      tile.append(el("small",values[0]),el("b",values[1]),el("p",values[2]));
      grid.append(tile);
    });
    return grid;
  }
  function drawBoard(shot) {
    const previousKind = board.dataset.kind;
    board.dataset.kind=shot.board;
    if (shot.board === "documents") {
      const fan=el("div",null,"document-fan third-reveal");
      [["p3-patent-4","说明书"],["patent","发明专利申请公开首页"],["p3-patent-22","结构附图 · 图 5a / 5b"]].forEach(([name,title],index) => {
        const documentPage=el("figure");
        const image=el("img");
        image.src=`assets/${name}.png`;
        image.alt=`CN107049247A ${title}`;
        documentPage.style.setProperty("--seq",index);
        documentPage.append(image,el("figcaption",title));
        fan.append(documentPage);
      });
      board.replaceChildren(fan);
    } else if (shot.board === "parameters") {
      const rawWeight=evidence("探头重量（g）");
      const values=[
        ["探头重量",`约 ${Math.round(Number(rawWeight)*10)/10} g`, `论文记录 ${rawWeight} g`],
        ["激光波长",`${evidence("激光波长（nm）")} nm`,"公开专利摘要及实施例"],
        ["横向分辨率",`${evidence("横向分辨率（μm）")} μm`,"荧光微珠测量"],
        ["轴向分辨率",`${evidence("轴向分辨率（μm）")} μm`,"荧光微珠测量"],
        ["栅格扫描帧率",`${evidence("栅格扫描帧率（Hz）")} Hz`,evidence("栅格扫描图像尺寸")+"条件"]
      ];
      if (previousKind !== "parameters") {
        board.replaceChildren(el("p","2017年公开专利及论文 · 技术参数","board-kicker"),cardGrid("facts-grid",values));
      }
      for (const [index,tile] of [...board.querySelectorAll(".facts-grid article")].entries()) {
        tile.toggleAttribute("hidden",index >= shot.count);
      }
    } else if (shot.board === "market") {
      board.replaceChildren(el("div","微型双光子显微成像 · 自由活动动物脑成像","flow-hub"),cardGrid("flow-grid",[
        ["潜在场景 01","脑科学研究",evidence("潜在应用1")],
        ["潜在场景 02","神经系统疾病研究",evidence("潜在应用2")],
        ["潜在场景 03","神经药理学及药物研发","用于探索药物干预相关的神经活动变化；待验证。"],
        ["潜在场景 04","高端生命科学仪器",evidence("潜在应用3")]
      ]));
    } else if (shot.board === "inputs") {
      board.replaceChildren(el("div","CN107049247A · 转化决策输入","flow-hub"),cardGrid("flow-grid",[
        ["已有","专利档案 · 公开文献",evidence("基准日法律状态")],
        ["待分析","技术、法律、经济价值","证据有来源，评价有缺项。"],
        ["待核验","技术对标与科研改进","尚无已核验对标结果。"],
        ["待核验","市场需求与企业线索","尚无已确认的需求或合作企业。"]
      ]));
    } else {
      board.replaceChildren(el("p","报告中心 · 实际系统模板","board-kicker"),
        cardGrid("template-grid",templates.map(([title,description],i)=>[`0${i+1} / 模板`,title,description])));
    }
  }
  function render(stage, shot) {
    stage.classList.toggle("third",Boolean(shot));
    stage.classList.toggle("extension",Boolean(shot) || Number(stage.dataset.page) > 3);
    stage.classList.toggle("has-evidence-side",Boolean(shot?.side));
    stage.classList.toggle("has-evidence-board",Boolean(shot?.board));
    side.inert = !shot?.side;
    board.inert = !shot?.board;
    evidenceStage.setAttribute("aria-hidden", String(!shot?.side && !shot?.board));
    if (shot?.side) drawSide(shot.side);
    if (shot?.board) drawBoard(shot);
    else delete board.dataset.kind;
    if (shot) {
      const tag = document.querySelector(".collab-tag");
      tag.textContent=shot.historic ?? "真实界面回放";
      tag.classList.toggle("visible",Boolean(shot.historic));
    } else document.querySelector(".collab-tag").textContent="真实界面回放";
  }
  return {shots,render};
})();
