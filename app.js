const navItems = document.querySelectorAll('.nav-item');
const workspace = document.getElementById('workspace');
const placeholder = document.getElementById('placeholder');
const placeholderTitle = document.getElementById('placeholderTitle');
const libraryPage = document.getElementById('library');
const recordsPage = document.getElementById('records');
const routesPage = document.getElementById('routes');
const reportsPage = document.getElementById('reports');
const headerTitle = document.getElementById('headerTitle');
const headerBreadcrumb = document.getElementById('headerBreadcrumb');
const input = document.getElementById('patentInput');
const evaluateBtn = document.getElementById('evaluateBtn');
const result = document.getElementById('resultSection');
const errorBox = document.getElementById('searchError');
const titles = {library:'科技成果库',records:'评估记录',routes:'转化路径推荐',reports:'报告中心'};
const dimensionMeta = {
  technology:{label:'技术潜力',icon:'⌘',className:'tech'},
  legal:{label:'法律稳定性',icon:'✓',className:'law'},
  market:{label:'市场适配度',icon:'◒',className:'market'},
  environment:{label:'转化环境',icon:'↗',className:'transfer'}
};
const ipcFields = {A:'生活需要',B:'作业与运输',C:'化学与冶金',D:'纺织与造纸',E:'固定建筑物',F:'机械工程',G:'物理',H:'电学'};
let catalog = [];
const selectedForCompare = new Set();

function openHomePage(page){
  document.querySelector('.landing-home').style.display='none';
  document.querySelector('.app-shell').classList.add('opened');
  document.querySelector(`.nav-item[data-page="${page}"]`).click();
  window.scrollTo({top:0,behavior:'instant'});
}
document.querySelectorAll('[data-open-page]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();
  openHomePage(link.dataset.openPage);
}));
document.getElementById('returnHome').addEventListener('click',()=>{
  document.querySelector('.landing-home').style.display='';
  document.querySelector('.app-shell').classList.remove('opened');
  document.querySelector('.sidebar').classList.remove('open');
  window.scrollTo({top:0,behavior:'instant'});
});
const homeMenu=document.querySelector('.home-menu');
homeMenu.addEventListener('click',()=>{
  const expanded=homeMenu.getAttribute('aria-expanded')!=='true';
  homeMenu.setAttribute('aria-expanded',String(expanded));
  document.getElementById('homeNavigation').classList.toggle('is-open',expanded);
});
document.querySelectorAll('.landing-nav a').forEach(link=>link.addEventListener('click',()=>{
  homeMenu.setAttribute('aria-expanded','false');
  document.getElementById('homeNavigation').classList.remove('is-open');
}));
function evaluateFromHome(query){
  input.value=query;
  openHomePage('workspace');
  runEvaluation();
}
document.getElementById('homeSearch').addEventListener('submit',event=>{
  event.preventDefault();
  evaluateFromHome(document.getElementById('homePatentInput').value.trim());
});
document.querySelectorAll('[data-home-query]').forEach(button=>button.addEventListener('click',()=>{
  document.getElementById('homePatentInput').value=button.dataset.homeQuery;
  evaluateFromHome(button.dataset.homeQuery);
}));

document.querySelectorAll('.search-card,.panel,.results').forEach(card=>card.addEventListener('pointermove',e=>{
  const r=card.getBoundingClientRect();
  card.style.setProperty('--mx',`${e.clientX-r.left}px`);
  card.style.setProperty('--my',`${e.clientY-r.top}px`);
}));

navItems.forEach(btn=>btn.addEventListener('click',()=>{
  navItems.forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  const page=btn.dataset.page;
  document.querySelectorAll('.app-shell .page').forEach(section=>section.classList.remove('active-page'));
  if(page==='workspace'){
    workspace.classList.add('active-page');
    libraryPage.classList.remove('active-page');
    recordsPage.classList.remove('active-page');
    routesPage.classList.remove('active-page');
    reportsPage.classList.remove('active-page');
    placeholder.classList.remove('active-page');
    headerBreadcrumb.textContent='智能评估 / 新建评估';
    headerTitle.textContent='高校科技成果智能评估';
  } else if(page==='library'){
    workspace.classList.remove('active-page');
    recordsPage.classList.remove('active-page');
    routesPage.classList.remove('active-page');
    reportsPage.classList.remove('active-page');
    placeholder.classList.remove('active-page');
    libraryPage.classList.add('active-page');
    headerBreadcrumb.textContent='成果管理 / 成果库';
    headerTitle.textContent='高校科技成果库';
    renderLibrary();
  } else if(page==='records'){
    workspace.classList.remove('active-page');
    libraryPage.classList.remove('active-page');
    placeholder.classList.remove('active-page');
    routesPage.classList.remove('active-page');
    reportsPage.classList.remove('active-page');
    recordsPage.classList.add('active-page');
    headerBreadcrumb.textContent='评估管理 / 历史记录';
    headerTitle.textContent='评估记录';
    renderRecords();
  } else if(page==='routes'){
    workspace.classList.remove('active-page');
    libraryPage.classList.remove('active-page');
    recordsPage.classList.remove('active-page');
    placeholder.classList.remove('active-page');
    routesPage.classList.add('active-page');
    headerBreadcrumb.textContent='转化决策 / 路径推荐';
    headerTitle.textContent='转化路径推荐';
    renderRoutes();
  } else if(page==='reports'){
    workspace.classList.remove('active-page');
    libraryPage.classList.remove('active-page');
    recordsPage.classList.remove('active-page');
    routesPage.classList.remove('active-page');
    placeholder.classList.remove('active-page');
    reportsPage.classList.add('active-page');
    headerBreadcrumb.textContent='成果输出 / 报告中心';
    headerTitle.textContent='报告中心';
    renderReports();
  } else {
    workspace.classList.remove('active-page');
    libraryPage.classList.remove('active-page');
    recordsPage.classList.remove('active-page');
    routesPage.classList.remove('active-page');
    reportsPage.classList.remove('active-page');
    placeholder.classList.add('active-page');
    placeholderTitle.textContent=titles[page];
    headerBreadcrumb.textContent=`${titles[page]} / 概览`;
    headerTitle.textContent=titles[page];
  }
  document.querySelector('.sidebar').classList.remove('open');
}));

document.querySelector('[data-back]').addEventListener('click',()=>navItems[0].click());
document.querySelector('.mobile-menu').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));
document.querySelectorAll('.examples button').forEach(btn=>btn.addEventListener('click',()=>{
  input.value=btn.textContent;
  runEvaluation();
}));

function normalize(value){return value.toLowerCase().replace(/[\s-]/g,'')}
function formatDate(value){
  if(!value || value.length!==8) return '待补充';
  return `${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}`;
}
function findPatent(query){
  const needle=normalize(query.trim());
  if(!needle) return null;
  const queryPatentId=needle.replace(/^cn/,'').replace(/[a-z]$/,'');
  return catalog.find(item=>[
    item.publication_number,item.title,item.university,...item.assignees,...item.ipc
  ].some(value=>{
    const normalized=normalize(value||'');
    const itemPatentId=normalized.replace(/^cn/,'').replace(/[a-z]$/,'');
    return normalized.includes(needle) || (queryPatentId.length >= 7 && itemPatentId === queryPatentId);
  }));
}
function setText(id,text){document.getElementById(id).textContent=text}

function renderPatent(item){
  const primaryIpc=item.ipc[0]||'';
  const field=ipcFields[primaryIpc.charAt(0)]||'技术领域待识别';
  const effective=item.status.granted&&!item.status.ceased;
  setText('statusTag',effective?'已授权 · 未检出终止事件':'需核验法律状态');
  setText('kindTag',item.kind);
  setText('fieldTag',field);
  setText('patentTitle',item.title);
  setText('patentMeta',`公开号：${item.publication_number} · 权利人：${item.assignees.join('、')} · 授权日：${formatDate(item.grant_date)} · IPC：${primaryIpc||'待补充'}`);
  setText('totalScore',item.total);
  setText('scoreLabel',item.label);
  setText('confidenceValue',`${Math.round(item.confidence*100)}%`);
  setText('ruleVersion',item.rule_version);
  setText('scoreSummary',item.status.transferred||item.status.licensed
    ? '已检出历史转化事件，建议重点复盘实施效果并评估二次转化空间。'
    : '技术与法律条件较完整，可优先补充市场证据并开展企业验证。');
  document.getElementById('scoreRing').style.strokeDashoffset=String(327*(1-item.total/100));

  const first=item.routes[0];
  setText('primaryRoute',first.name);
  setText('primaryRouteReason',first.reason);
  setText('routeCount',item.routes.length);

  const list=document.getElementById('dimensionList');
  list.innerHTML='';
  Object.entries(item.dimensions).forEach(([key,dimension])=>{
    const meta=dimensionMeta[key];
    const percent=Math.round(dimension.score/dimension.max*100);
    const summary=dimension.evidence.map(x=>x.detail).slice(0,2).join('；');
    const button=document.createElement('button');
    button.type='button';
    button.innerHTML=`<span class="dim-icon ${meta.className}">${meta.icon}</span><div><div><b>${meta.label}</b><strong>${dimension.score}<small> / ${dimension.max}</small></strong></div><i><em style="width:${percent}%"></em></i><small>${summary}</small></div>`;
    button.addEventListener('click',()=>renderEvidence(meta.label,dimension));
    list.appendChild(button);
  });

  setText('agentSummary',`基于 ${item.university} 的专利、法律状态与高校转化表现数据，建议优先执行以下行动。当前市场维度仍使用代理指标，结论需由 TTO 和领域专家复核。`);
  const actions=document.getElementById('agentActions');
  actions.innerHTML=item.routes.map(route=>`<li><span>${route.rank}</span><div><b>${route.name}</b><small>${route.reason}</small></div></li>`).join('');
  renderEvidence(dimensionMeta.technology.label,item.dimensions.technology);
}

function renderEvidence(label,dimension){
  const panel=document.getElementById('evidencePanel');
  panel.innerHTML=`<strong>${label} · ${dimension.score}/${dimension.max}</strong><ul>${dimension.evidence.map(x=>`<li><span>${x.detail}</span><b>+${x.points}</b></li>`).join('')}</ul>`;
}

function showError(query){
  errorBox.innerHTML=`未找到“<strong>${query||'空白内容'}</strong>”。当前演示库包含 5 项专利，可点击上方示例或输入标题关键词、高校名称。`;
  errorBox.classList.remove('hidden');
  input.focus();
}

function runEvaluation(){
  const item=findPatent(input.value);
  if(!item){showError(input.value.trim());return}
  errorBox.classList.add('hidden');
  const state=document.getElementById('analysisState');
  const label=document.getElementById('analysisText');
  const pct=document.getElementById('analysisPct');
  state.classList.remove('hidden');
  result.style.opacity='.3';
  result.style.pointerEvents='none';
  const steps=[['读取专利基本信息与法律状态','18%'],['识别技术领域与高校转化环境','42%'],['计算四维转化潜力评分','71%'],['生成转化路径与证据说明','93%']];
  let i=0;
  label.textContent=steps[0][0];pct.textContent=steps[0][1];
  const timer=setInterval(()=>{
    i++;
    if(i<steps.length){label.textContent=steps[i][0];pct.textContent=steps[i][1]}
    else{
      clearInterval(timer);
      renderPatent(item);
      state.classList.add('hidden');
      result.style.opacity='1';
      result.style.pointerEvents='auto';
      result.scrollIntoView({behavior:'smooth',block:'start'});
    }
  },380);
}

function patentField(item){
  return ipcFields[(item.ipc[0]||'').charAt(0)]||'其他领域';
}

function populateLibraryFilters(){
  const universities=[...new Set(catalog.map(item=>item.university))].sort();
  const fields=[...new Set(catalog.map(patentField))].sort();
  document.getElementById('universityFilter').innerHTML='<option value="all">全部高校</option>'+universities.map(x=>`<option value="${x}">${x}</option>`).join('');
  document.getElementById('fieldFilter').innerHTML='<option value="all">全部领域</option>'+fields.map(x=>`<option value="${x}">${x}</option>`).join('');
  setText('libraryTotal',catalog.length);
  setText('highPotentialCount',catalog.filter(x=>x.label==='高准备度').length);
  setText('universityCount',universities.length);
}

function libraryItems(){
  const query=normalize(document.getElementById('librarySearch').value);
  const university=document.getElementById('universityFilter').value;
  const field=document.getElementById('fieldFilter').value;
  const level=document.getElementById('levelFilter').value;
  const sort=document.getElementById('sortFilter').value;
  const filtered=catalog.filter(item=>{
    const searchable=normalize([item.title,item.publication_number,item.university,...item.assignees].join(' '));
    return (!query||searchable.includes(query))
      && (university==='all'||item.university===university)
      && (field==='all'||patentField(item)===field)
      && (level==='all'||item.label===level);
  });
  filtered.sort((a,b)=>sort==='score-asc'?a.total-b.total:sort==='date-desc'?(b.grant_date||'').localeCompare(a.grant_date||''):b.total-a.total);
  return filtered;
}

function renderLibrary(){
  const items=libraryItems();
  setText('libraryResultCount',`显示 ${items.length} 项成果`);
  const grid=document.getElementById('patentGrid');
  if(!items.length){
    grid.innerHTML='<div class="library-empty"><span>⌕</span><strong>没有符合条件的成果</strong><p>请调整关键词或筛选条件。</p></div>';
    return;
  }
  grid.innerHTML=items.map(item=>{
    const selected=selectedForCompare.has(item.publication_number);
    const dims=Object.entries(item.dimensions).map(([key,d])=>`<div><span>${dimensionMeta[key].label}</span><i><em style="width:${Math.round(d.score/d.max*100)}%"></em></i><b>${d.score}</b></div>`).join('');
    return `<article class="patent-card panel ${selected?'selected':''}" data-patent="${item.publication_number}">
      <div class="patent-card-top"><label class="compare-check"><input type="checkbox" ${selected?'checked':''} aria-label="选择 ${item.title} 进行比较"><span></span></label><div class="tag-row"><span class="tag success">${item.label}</span><span class="tag">${patentField(item)}</span></div><strong class="card-score">${item.total}</strong></div>
      <h3>${item.title}</h3><p>${item.publication_number} · ${item.university}</p>
      <div class="mini-dimensions">${dims}</div>
      <div class="card-route"><span>首选路径</span><b>${item.routes[0].name}</b></div>
      <button class="view-patent">查看完整评估 <span>→</span></button>
    </article>`;
  }).join('');
  grid.querySelectorAll('.patent-card').forEach(card=>{
    const id=card.dataset.patent;
    card.querySelector('.compare-check input').addEventListener('change',event=>toggleCompare(id,event.target.checked));
    card.querySelector('.view-patent').addEventListener('click',()=>openPatentFromLibrary(id));
  });
}

function toggleCompare(id,checked){
  if(checked&&selectedForCompare.size>=3){
    const checkbox=document.querySelector(`.patent-card[data-patent="${id}"] input`);
    if(checkbox) checkbox.checked=false;
    return;
  }
  if(checked) selectedForCompare.add(id); else selectedForCompare.delete(id);
  updateCompareTray();
  renderLibrary();
}

function updateCompareTray(){
  const tray=document.getElementById('compareTray');
  tray.classList.toggle('hidden',selectedForCompare.size===0);
  setText('compareNames',`已选择 ${selectedForCompare.size} 项（最多 3 项）`);
  document.getElementById('openCompare').disabled=selectedForCompare.size<2;
}

function openPatentFromLibrary(id){
  const item=catalog.find(x=>x.publication_number===id);
  if(!item)return;
  input.value=item.publication_number;
  renderPatent(item);
  navItems[0].click();
  result.scrollIntoView({behavior:'smooth',block:'start'});
}

function openComparison(){
  const items=catalog.filter(x=>selectedForCompare.has(x.publication_number));
  if(items.length<2)return;
  const rows=[
    ['综合得分',item=>`${item.total} / 100`],
    ['准备度',item=>item.label],
    ['所属高校',item=>item.university],
    ['技术领域',item=>patentField(item)],
    ['技术潜力',item=>`${item.dimensions.technology.score} / 30`],
    ['法律稳定性',item=>`${item.dimensions.legal.score} / 25`],
    ['市场适配度',item=>`${item.dimensions.market.score} / 20`],
    ['转化环境',item=>`${item.dimensions.environment.score} / 25`],
    ['首选路径',item=>item.routes[0].name]
  ];
  document.getElementById('compareTable').innerHTML=`<div class="compare-row compare-titles"><b>比较指标</b>${items.map(x=>`<div><span>${x.publication_number}</span><strong>${x.title}</strong></div>`).join('')}</div>`
    +rows.map(([label,value])=>`<div class="compare-row"><b>${label}</b>${items.map(x=>`<div>${value(x)}</div>`).join('')}</div>`).join('');
  document.getElementById('compareModal').classList.remove('hidden');
}

function formatEvaluationTime(value){
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return '时间待补充';
  return new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(date);
}

function recordItems(){
  const query=normalize(document.getElementById('recordSearch').value);
  const level=document.getElementById('recordLevelFilter').value;
  const sort=document.getElementById('recordSort').value;
  const items=catalog.filter(item=>{
    const searchable=normalize([item.title,item.publication_number,item.university].join(' '));
    return (!query||searchable.includes(query))&&(level==='all'||item.label===level);
  });
  items.sort((a,b)=>sort==='score-desc'?b.total-a.total:sort==='score-asc'?a.total-b.total:new Date(b.evaluated_at)-new Date(a.evaluated_at));
  return items;
}

function renderRecords(){
  const items=recordItems();
  const average=catalog.reduce((sum,item)=>sum+item.total,0)/(catalog.length||1);
  setText('recordTotal',catalog.length);
  setText('recordAverage',average.toFixed(1));
  setText('recordHighCount',catalog.filter(item=>item.label==='高准备度').length);
  const list=document.getElementById('recordList');
  if(!items.length){
    list.innerHTML='<div class="record-empty">没有符合条件的评估记录，请调整搜索或筛选条件。</div>';
    return;
  }
  list.innerHTML=items.map(item=>`<div class="record-row" data-record="${item.publication_number}">
    <div class="record-patent"><span class="record-icon">${patentField(item).charAt(0)}</span><div><strong>${item.title}</strong><small>${item.publication_number} · ${item.university}</small></div></div>
    <div class="record-time"><strong>${formatEvaluationTime(item.evaluated_at)}</strong><small>${item.rule_version}</small></div>
    <div class="record-score"><strong>${item.total}</strong><span class="tag ${item.label==='高准备度'?'success':''}">${item.label}</span></div>
    <div class="confidence-cell"><i><em style="width:${Math.round(item.confidence*100)}%"></em></i><span>${Math.round(item.confidence*100)}%</span></div>
    <div class="record-route"><strong>${item.routes[0].name}</strong><small>${item.routes.length} 条候选路径</small></div>
    <div class="record-actions"><button class="record-view">查看结果</button><button class="record-more" aria-label="更多操作">···</button></div>
  </div>`).join('');
  list.querySelectorAll('.record-row').forEach(row=>row.querySelector('.record-view').addEventListener('click',()=>openPatentFromLibrary(row.dataset.record)));
}

function allRouteItems(){
  return catalog.flatMap(item=>item.routes.map(route=>({item,route})));
}

function populateRouteFilters(){
  const universities=[...new Set(catalog.map(item=>item.university))].sort();
  const routeTypes=[...new Set(allRouteItems().map(x=>x.route.name))].sort();
  document.getElementById('routeUniversity').innerHTML='<option value="all">全部高校</option>'+universities.map(x=>`<option value="${x}">${x}</option>`).join('');
  document.getElementById('routeType').innerHTML='<option value="all">全部路径</option>'+routeTypes.map(x=>`<option value="${x}">${x}</option>`).join('');
  setText('routeTotalStat',allRouteItems().length);
  setText('routeTypeStat',routeTypes.length);
  setText('routeVerifyStat',catalog.filter(x=>x.routes[0].name==='许可＋联合验证').length);
  setText('routeReuseStat',catalog.filter(x=>x.status.transferred||x.status.licensed).length);
}

function routeItems(){
  const query=normalize(document.getElementById('routeSearch').value);
  const university=document.getElementById('routeUniversity').value;
  const routeType=document.getElementById('routeType').value;
  const priority=document.getElementById('routePriority').value;
  return allRouteItems().filter(({item,route})=>{
    const searchable=normalize([item.title,item.publication_number,item.university,route.name,route.reason].join(' '));
    return (!query||searchable.includes(query))
      && (university==='all'||item.university===university)
      && (routeType==='all'||route.name===routeType)
      && (priority==='all'||String(route.rank)===priority);
  }).sort((a,b)=>a.route.rank-b.route.rank||b.item.total-a.item.total);
}

function routeEvidence(item){
  const evidence=[];
  if(item.status.transferred||item.status.licensed)evidence.push('已检出历史转化事件');
  if(item.dimensions.legal.score>=20)evidence.push('法律条件较完整');
  if(item.assignees.length>1)evidence.push('存在产业合作关系');
  if(item.dimensions.technology.score>=20)evidence.push('技术潜力较高');
  return evidence.slice(0,3);
}

function renderRoutes(){
  const items=routeItems();
  setText('routeResultCount',`${items.length} 条建议`);
  const list=document.getElementById('routeList');
  if(!items.length){
    list.innerHTML='<div class="route-empty"><span>↗</span><strong>没有符合条件的路径建议</strong><p>请调整筛选条件后重试。</p></div>';
    return;
  }
  list.innerHTML=items.map(({item,route})=>`<article class="route-item panel ${route.rank===1?'primary-route':''}" data-route-patent="${item.publication_number}">
    <div class="route-rank"><span>${route.rank===1?'首选':`备选 ${route.rank-1}`}</span><strong>${String(route.rank).padStart(2,'0')}</strong></div>
    <div class="route-body"><div class="route-body-head"><div><span>${item.publication_number} · ${item.university}</span><h3>${route.name}</h3></div><b>${item.total}<small>/100</small></b></div>
      <p>${route.reason}</p><div class="route-evidence">${routeEvidence(item).map(x=>`<span>✓ ${x}</span>`).join('')}</div>
      <div class="route-patent-title">对应成果：${item.title}</div>
    </div>
    <div class="route-actions"><span class="tag ${item.label==='高准备度'?'success':''}">${item.label}</span><button>查看完整评估 →</button></div>
  </article>`).join('');
  list.querySelectorAll('.route-item').forEach(card=>card.querySelector('button').addEventListener('click',()=>openPatentFromLibrary(card.dataset.routePatent)));
}

let activeReport = null;

function renderReportList(){
  const list=document.getElementById('reportItems');
  list.innerHTML=[...catalog].sort((a,b)=>b.total-a.total).map((item,index)=>`<button class="report-list-item ${activeReport&&activeReport.publication_number===item.publication_number?'active':''}" data-report="${item.publication_number}">
    <span class="report-list-icon">${String(index+1).padStart(2,'0')}</span><span><strong>${item.title}</strong><small>${item.university} · ${item.publication_number}</small></span><b>${item.total}</b>
  </button>`).join('');
  list.querySelectorAll('.report-list-item').forEach(button=>button.addEventListener('click',()=>selectReport(button.dataset.report)));
  setText('reportCount',`${catalog.length} 份`);
}

function selectReport(id){
  activeReport=catalog.find(item=>item.publication_number===id)||catalog[0];
  renderReportList();
  const item=activeReport;
  setText('reportVersion',item.rule_version);
  setText('reportTitle',item.title);
  setText('reportSubtitle',`${item.university} · ${item.publication_number}`);
  setText('reportScore',item.total);
  setText('reportLevel',item.label);
  setText('reportConfidence',`${Math.round(item.confidence*100)}%`);
  setText('reportRoute',item.routes[0].name);
  document.getElementById('reportFacts').innerHTML=`<div><span>专利类型</span><strong>${item.kind}</strong></div><div><span>授权日期</span><strong>${formatDate(item.grant_date)}</strong></div><div><span>IPC 分类</span><strong>${item.ipc.join('、')}</strong></div><div><span>权利人</span><strong>${item.assignees.join('、')}</strong></div>`;
  document.getElementById('reportDimensions').innerHTML=Object.entries(item.dimensions).map(([key,d])=>`<div class="report-dimension"><div><span>${dimensionMeta[key].label}</span><b>${d.score}<small>/${d.max}</small></b></div><i><em style="width:${Math.round(d.score/d.max*100)}%"></em></i><p>${d.evidence.slice(0,2).map(x=>x.detail).join('；')}</p></div>`).join('');
  document.getElementById('reportActions').innerHTML=item.routes.map(route=>`<div><span>${route.rank}</span><section><strong>${route.name}</strong><p>${route.reason}</p></section></div>`).join('');
}

function renderReports(){
  if(!activeReport)activeReport=[...catalog].sort((a,b)=>b.total-a.total)[0]||catalog[0];
  renderReportList();
  selectReport(activeReport.publication_number);
}

function downloadActiveReport(){
  if(!activeReport)return;
  const item=activeReport;
  const lines=[
    '伯乐识果｜高校科技成果转化评估摘要',
    '----------------------------------------',
    `成果名称：${item.title}`,
    `公开号：${item.publication_number}`,
    `所属高校：${item.university}`,
    `权利人：${item.assignees.join('、')}`,
    `综合得分：${item.total}/100（${item.label}）`,
    `结果置信度：${Math.round(item.confidence*100)}%`,
    `规则版本：${item.rule_version}`,
    '',
    '四维评分：',
    ...Object.entries(item.dimensions).map(([key,d])=>`- ${dimensionMeta[key].label}：${d.score}/${d.max}；${d.evidence.map(x=>x.detail).join('；')}`),
    '',
    '转化路径建议：',
    ...item.routes.map(route=>`${route.rank}. ${route.name}：${route.reason}`),
    '',
    '说明：本摘要用于成果初筛，不等同于商业尽调结论。'
  ];
  const blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');anchor.href=url;anchor.download=`伯乐识果-${item.publication_number}-评估摘要.txt`;anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

['librarySearch','universityFilter','fieldFilter','levelFilter','sortFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='librarySearch'?'input':'change',renderLibrary));
document.getElementById('clearCompare').addEventListener('click',()=>{selectedForCompare.clear();updateCompareTray();renderLibrary()});
document.getElementById('openCompare').addEventListener('click',openComparison);
document.getElementById('closeCompare').addEventListener('click',()=>document.getElementById('compareModal').classList.add('hidden'));
document.getElementById('compareModal').addEventListener('click',event=>{if(event.target.id==='compareModal')event.currentTarget.classList.add('hidden')});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.getElementById('compareModal').classList.add('hidden')});
['recordSearch','recordLevelFilter','recordSort'].forEach(id=>document.getElementById(id).addEventListener(id==='recordSearch'?'input':'change',renderRecords));
document.getElementById('recordsNewEvaluation').addEventListener('click',()=>navItems[0].click());
['routeSearch','routeUniversity','routeType','routePriority'].forEach(id=>document.getElementById(id).addEventListener(id==='routeSearch'?'input':'change',renderRoutes));
document.getElementById('resetRouteFilters').addEventListener('click',()=>{
  document.getElementById('routeSearch').value='';
  document.getElementById('routeUniversity').value='all';
  document.getElementById('routeType').value='all';
  document.getElementById('routePriority').value='all';
  renderRoutes();
});
document.getElementById('downloadReport').addEventListener('click',downloadActiveReport);

evaluateBtn.addEventListener('click',runEvaluation);
input.addEventListener('keydown',event=>{if(event.key==='Enter')runEvaluation()});

function initializeCatalog(data){
    catalog=data;
    document.getElementById('catalogCount').textContent=`演示库：${catalog.length} 项真实专利`;
    document.getElementById('patentSuggestions').innerHTML=catalog.map(item=>`<option value="${item.publication_number}">${item.title}</option>`).join('');
    populateLibraryFilters();
    renderLibrary();
    renderRecords();
    populateRouteFilters();
    renderRoutes();
    renderReports();
    const initial=findPatent(input.value)||catalog[0];
    input.value=initial.publication_number;
    renderPatent(initial);
}

if(Array.isArray(window.BOLE_CATALOG)){
  initializeCatalog(window.BOLE_CATALOG);
}else{
  fetch('demo_scores.json?v=20261016-3')
    .then(response=>{if(!response.ok)throw new Error('数据文件读取失败');return response.json()})
    .then(initializeCatalog)
    .catch(error=>{
    document.getElementById('catalogCount').textContent='演示数据载入失败';
    errorBox.textContent=`${error.message}。`;
    errorBox.classList.remove('hidden');
    });
}
