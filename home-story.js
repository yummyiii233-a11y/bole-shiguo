/* Glass folders use the geometry, motion and procedural artwork of the supplied component. */
(() => {
  const groups=[
    {label:'医疗与生命健康',art:'aurora',tone:'dark',place:'bottom-left',ids:['CN-101862211-B']},
    {label:'电子信息与智能制造',art:'glacier',tone:'dark',place:'top-left',ids:['CN-101719504-B','CN-101534062-B']},
    {label:'绿色技术与环境',art:'verdant',tone:'dark',place:'top-right',ids:['CN-109444944-B','CN-115646511-B']}
  ];
  const source=window.BOLE_CATALOG||[];
  const key='bole.collections.v1';
  let saved=[];let storageAvailable=true;
  try{const data=JSON.parse(localStorage.getItem(key)||'[]');saved=Array.isArray(data)?data.filter(f=>f&&Number.isInteger(f.group)&&f.group>=0&&f.group<3&&typeof f.name==='string'&&typeof f.meta==='string').slice(-90):[];}catch{storageAvailable=false;}
  const gallery=document.getElementById('folderGallery');
  const dialog=document.getElementById('folderAddDialog'),addForm=document.getElementById('folderAddForm');
  const toast=document.getElementById('folderToast');let toastTimer,addingGroup=0,returnFocus=null,active=-1;
  const backPath='M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z';
  const frontPath='M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 176A22 22 0 0 1 318 198L22 198A22 22 0 0 1 0 176Z';
  const details=document.createElement('div');details.className='folder-details';details.hidden=true;gallery.after(details);
  const nodes=[];const artworkCache=new Map();
  function announce(message){toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3600);}
  function filesFor(i){return [...source.filter(x=>groups[i].ids.includes(x.publication_number)).map(x=>({name:x.title,meta:`${x.university} · ${x.publication_number}`,id:x.publication_number})),...saved.filter(x=>x.group===i)];}
  function canvasArt(preset,seed,className){
    const canvas=document.createElement('canvas');canvas.className=className;canvas.setAttribute('aria-hidden','true');
    const cacheKey=preset+seed;
    if(!artworkCache.has(cacheKey)){
      artworkCache.set(cacheKey,new Promise(resolve=>{
        const palettes={aurora:['#070d19','#12243c','#344d6d','#70879f','#24374f','#101927'],glacier:['#090e18','#253449','#7b8fa5','#35485e','#131e30','#9eafc0'],verdant:['#050e13','#12323c','#34626d','#0d1a25','#557b82','#9db6b9'],dusk:['#0b101f','#293953','#657795','#18243a','#8796ae']};
        const recipe={...window.BoleFolderArt.ART_PRESETS[preset],colors:palettes[preset]||palettes.aurora};
        const job=window.BoleFolderArt.createArtJob(364,296,recipe,seed);
        function paint(){if(!job.step(5)){requestAnimationFrame(paint);return;}const src=document.createElement('canvas');src.width=job.width;src.height=job.height;src.getContext('2d')?.putImageData(new ImageData(job.pixels,job.width,job.height),0,0);resolve(src);}
        requestAnimationFrame(paint);
      }));
    }
    artworkCache.get(cacheKey).then(src=>{canvas.width=src.width;canvas.height=src.height;canvas.getContext('2d')?.drawImage(src,0,0);canvas.dataset.ready='true';});return canvas;
  }
  function selectFile(file){
    const found=file.id?source.find(x=>x.publication_number===file.id):findPatent(file.meta)||findPatent(file.name);
    if(found){input.value=found.publication_number;openHomePage('workspace');runEvaluation();}
    else announce('这张卡片已收藏。加入评估数据库后即可生成完整评估。');
  }
  function renderDetails(i){
    details.replaceChildren();details.hidden=i<0;if(i<0)return;
    const head=document.createElement('div');head.className='folder-details-head';
    const label=document.createElement('strong');label.textContent=groups[i].label+' · 全部卡片';
    const close=document.createElement('button');close.type='button';close.textContent='收起';close.addEventListener('click',()=>{toggleFolder(i,false);nodes[i].querySelector('.gf-hit').focus({preventScroll:true});});head.append(label,close);details.append(head);
    for(const file of filesFor(i)){
      const row=document.createElement('button');row.type='button';row.className='folder-detail-item';
      const text=document.createElement('span'),name=document.createElement('strong'),meta=document.createElement('small'),action=document.createElement('span');
      name.textContent=file.name;meta.textContent=file.meta||'自定义成果卡片';action.textContent=file.id?'查看评估 ↗':'已收藏';text.append(name,meta);row.append(text,action);row.addEventListener('click',()=>selectFile(file));details.append(row);
    }
  }
  function toggleFolder(i,open){
    active=open?i:-1;
    nodes.forEach((node,index)=>{const expanded=open&&index===i;node.toggleAttribute('data-open',expanded);node.querySelector('.gf-hit').setAttribute('aria-expanded',String(expanded));node.querySelector('.gf-files').inert=!expanded;});
    renderDetails(active);
  }
  function renderFiles(i,dropped=false){
    const node=nodes[i],files=filesFor(i),visible=files.slice(-4),stack=node.querySelector('.gf-files');stack.replaceChildren();
    visible.forEach((file,index)=>{
      const sheet=document.createElement('button');sheet.type='button';sheet.className='gf-sheet';
      sheet.style.setProperty('--gf-slot',visible.length<=1?0:index/(visible.length-1)*2-1);sheet.style.setProperty('--gf-depth',visible.length-1-index);sheet.style.setProperty('--gf-jx',(index%2?-3:3)+'px');sheet.style.setProperty('--gf-jr',(index%2?2:-2)+'deg');sheet.style.zIndex=index+1;
      if(index===0&&groups[i].art!=='none'){sheet.classList.add('gf-sheet--art');sheet.append(canvasArt(i===0?'dusk':'verdant',11+i,'gf-sheet-art'));}
      else {const lines=document.createElement('span');lines.className='gf-lines';lines.setAttribute('aria-hidden','true');[86,92,64,88,42].forEach(w=>{const line=document.createElement('i');line.style.width=w+'%';lines.append(line);});sheet.append(lines);}
      const head=document.createElement('span');head.className='gf-sheet-head';const name=document.createElement('span'),meta=document.createElement('span');name.className='gf-sheet-name';meta.className='gf-sheet-meta';name.textContent=file.name;meta.textContent=file.meta||'自定义成果卡片';head.append(name,meta);sheet.append(head);sheet.setAttribute('aria-label','查看 '+file.name);sheet.addEventListener('click',()=>selectFile(file));
      if(dropped&&index===visible.length-1)sheet.classList.add('gf-sheet--drop');stack.append(sheet);
    });
    const count=node.querySelector('.gf-meta');count.textContent=files.length+' 项专利';if(dropped){count.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:500});node.querySelector('.gf-front').animate([{scale:'1'},{scale:'1.018 .975'},{scale:'1'}],{duration:700,delay:380});}
    node.querySelector('.gf-hit').setAttribute('aria-label',groups[i].label+'，'+files.length+' 项专利，点击展开或收起');
  }
  groups.forEach((group,i)=>{
    const node=document.createElement('div');node.className='gf-root';node.dataset.tone=group.tone;node.dataset.place=group.place;
    node.innerHTML=`<div class="gf-stage"><div class="gf-tilt"><div class="gf-shadow" aria-hidden="true"></div><div class="gf-back" aria-hidden="true"><div class="gf-back-sheen"></div></div><svg class="gf-rim gf-back-rim" viewBox="0 0 340 272" aria-hidden="true"><path d="${backPath}"/></svg><div class="gf-front"><div class="gf-tint" aria-hidden="true"></div><div class="gf-spec" aria-hidden="true"></div><svg class="gf-rim gf-front-rim" viewBox="0 0 340 198" aria-hidden="true"><path d="${frontPath}" stroke="rgba(255,255,255,.6)"/></svg><button type="button" class="gf-hit" aria-expanded="false" aria-controls="folder-files-${i}"></button><div class="gf-label"><span class="gf-title"></span><span class="gf-meta"></span></div></div><div class="gf-files" id="folder-files-${i}" role="group"></div><button type="button" class="gf-key gf-key--add"></button></div></div>`;
    node.querySelector('.gf-back').style.clipPath=`path('${backPath}')`;node.querySelector('.gf-front').style.clipPath=`path('${frontPath}')`;
    node.querySelector('.gf-title').textContent=group.label;node.querySelector('.gf-files').setAttribute('aria-label',group.label+'专利卡片');node.querySelector('.gf-files').inert=true;
    if(group.art!=='none')node.querySelector('.gf-back').prepend(canvasArt(group.art,3+i*4,'gf-art'));
    node.querySelector('.gf-hit').addEventListener('click',()=>toggleFolder(i,active!==i));
    const add=node.querySelector('.gf-key');add.setAttribute('aria-label','添加专利到'+group.label);add.addEventListener('click',()=>{addingGroup=i;returnFocus=add;document.getElementById('folderDialogDescription').textContent='加入「'+group.label+'」，整理你关注的成果。';addForm.reset();dialog.showModal();});
    node.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=node.getBoundingClientRect();node.style.setProperty('--gf-px',((e.clientX-r.left)/r.width*2-1).toFixed(3));node.style.setProperty('--gf-py',((e.clientY-r.top)/r.height*2-1).toFixed(3));});
    node.addEventListener('pointerleave',()=>{node.style.setProperty('--gf-px','0');node.style.setProperty('--gf-py','0');});
    nodes.push(node);gallery.append(node);renderFiles(i);
  });
  function resize(){if(!gallery.clientWidth)return;nodes.forEach(node=>{const width=Math.min(340,gallery.clientWidth/(window.innerWidth>900?3:1)-(window.innerWidth>900?34:0));node.style.width=width+'px';node.style.height=326*width/340+'px';node.querySelector('.gf-stage').style.transform=`translateY(${54*width/340}px) scale(${width/340})`;});}
  resize();window.addEventListener('resize',resize);
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(gallery);
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const i=nodes.indexOf(entry.target);setTimeout(()=>entry.target.dataset.entered='true',i*140);observer.unobserve(entry.target);}}),{threshold:.2});nodes.forEach(n=>observer.observe(n));}else nodes.forEach(n=>n.dataset.entered='true');
  dialog.querySelectorAll('[data-close-folder-dialog]').forEach(btn=>btn.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));
  addForm.addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('folderFileName').value.trim(),meta=document.getElementById('folderFileMeta').value.trim();if(!name){document.getElementById('folderFileName').setCustomValidity('请输入成果名称');document.getElementById('folderFileName').reportValidity();return;}saved.push({group:addingGroup,name,meta});try{localStorage.setItem(key,JSON.stringify(saved));storageAvailable=true;}catch{storageAvailable=false;}dialog.close();toggleFolder(addingGroup,false);renderFiles(addingGroup,true);announce(storageAvailable?'已加入「'+groups[addingGroup].label+'」，保存在当前浏览器':'已加入本次页面；浏览器未允许保存，刷新后不会保留');});
  document.getElementById('folderFileName').addEventListener('input',e=>e.target.setCustomValidity(''));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.open&&active>=0){const index=active;toggleFolder(index,false);nodes[index].querySelector('.gf-hit').focus({preventScroll:true});}});
  document.addEventListener('pointerdown',e=>{if(active>=0&&!gallery.contains(e.target)&&!details.contains(e.target)&&!dialog.open)toggleFolder(active,false);});
  document.querySelectorAll('[data-story-page]').forEach(btn=>btn.addEventListener('click',()=>openHomePage(btn.dataset.storyPage)));
  document.querySelectorAll('[data-story-home]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();showHome();}));
})();
