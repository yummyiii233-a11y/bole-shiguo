/* Native adaptation of the supplied MorphOrb interaction. */
(() => {
  const form=document.getElementById('homeSearch');
  const field=document.getElementById('homePatentInput');
  document.body.insertAdjacentHTML('afterbegin','<svg class="glass-filter-defs" aria-hidden="true" width="0" height="0"><defs><filter id="bole-liquid-refraction" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise"/><feGaussianBlur in="noise" stdDeviation="2" result="smoothNoise"/><feDisplacementMap in="SourceGraphic" in2="smoothNoise" scale="12" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>');
  const stage=document.createElement('div');
  stage.className='morph-stage';
  form.before(stage);stage.append(form);
  form.querySelector('svg').innerHTML='<path d="m10 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="m19 14 1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/>';
  const send=form.querySelector('button');
  send.setAttribute('aria-label','开始智能评估');
  send.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20V4m-7 7 7-7 7 7"/></svg>';
  stage.insertAdjacentHTML('beforeend','<canvas class="morph-orb" width="440" height="440" aria-hidden="true"></canvas><p class="morph-status" role="status" aria-live="polite"></p><article class="morph-answer" tabindex="-1"><small>检索结果</small><h2></h2><p></p><div><button type="button" class="morph-view">查看完整评估 →</button><button type="button" class="morph-reset">重新检索</button></div></article><button type="button" class="morph-cancel">取消检索</button>');
  const canvas=stage.querySelector('canvas'),ctx=canvas.getContext('2d');
  const status=stage.querySelector('.morph-status'),answer=stage.querySelector('.morph-answer');
  [form,answer].forEach(surface=>{
    surface.classList.add('liquid-glass');
    surface.insertAdjacentHTML('afterbegin','<span class="glass-distortion" aria-hidden="true"></span><span class="glass-tint" aria-hidden="true"></span><span class="glass-shine" aria-hidden="true"></span>');
  });
  answer.querySelectorAll('button').forEach(button=>button.classList.add('menu-item'));
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const points=[];
  for(let k=0;k<16;k++){
    const y=1-(k+.5)/8,r=Math.sqrt(1-y*y),m=Math.max(4,Math.round(30*r));
    for(let j=0;j<m;j++){const a=j/m*Math.PI*2+k*.35;points.push({x:Math.cos(a)*r,y,z:Math.sin(a)*r});}
  }
  let epoch=0,raf=0,busy=false,matched=null,lastQuery='';
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  function reset(){epoch++;cancelAnimationFrame(raf);busy=false;stage.dataset.phase='idle';form.inert=false;send.disabled=false;status.textContent='';field.focus({preventScroll:true});}
  function draw(now,start){
    if(!ctx||!busy)return;
    const t=(now-start)/1000,angle=reduced.matches?.4:t*.65;
    ctx.clearRect(0,0,440,440);
    const dots=points.map((p,i)=>{const x=p.x*Math.cos(angle)+p.z*Math.sin(angle),z=-p.x*Math.sin(angle)+p.z*Math.cos(angle);const yy=p.y*Math.cos(.35)-z*Math.sin(.35),zz=p.y*Math.sin(.35)+z*Math.cos(.35);return {x,y:yy,z:zz,i};}).sort((a,b)=>a.z-b.z);
    for(const p of dots){const depth=(p.z+1)/2,f=2.8/(2.8-p.z),light=Math.max(0,Math.sin(p.i*.1-t*4))**12;ctx.fillStyle=`rgba(225,228,235,${.1+.45*depth+.4*light})`;ctx.beginPath();ctx.arc(220+p.x*130*f,220-p.y*130*f,(1+depth*1.5+light)*f,0,Math.PI*2);ctx.fill();}
    if(!reduced.matches)raf=requestAnimationFrame(n=>draw(n,start));
  }
  async function start(query){
    if(busy||!query.trim())return;
    busy=true;lastQuery=query.trim();matched=findPatent(lastQuery);const run=++epoch;
    form.inert=true;send.disabled=true;stage.dataset.phase='launch';
    await wait(reduced.matches?120:650);if(run!==epoch)return;
    stage.dataset.phase='think';draw(performance.now(),performance.now());
    const labels=['检索专利资料','核对成果信息','读取评估依据'];
    for(const label of labels){status.textContent=label+'…';await wait(reduced.matches?150:650);if(run!==epoch)return;}
    stage.dataset.phase='resolve';status.textContent=matched?'已找到匹配成果':'未找到匹配成果';
    await wait(reduced.matches?120:450);if(run!==epoch)return;
    cancelAnimationFrame(raf);busy=false;stage.dataset.phase='answered';
    answer.querySelector('h2').textContent=matched?matched.title:'暂未找到这项成果';
    answer.querySelector('p').textContent=matched?`${matched.university} · ${matched.publication_number}`:`当前演示库包含 5 项真实专利。请尝试专利号、成果关键词或高校名称。`;
    stage.querySelector('.morph-view').hidden=!matched;
    answer.focus({preventScroll:true});
  }
  stage.querySelector('.morph-reset').addEventListener('click',reset);
  stage.querySelector('.morph-cancel').addEventListener('click',reset);
  stage.querySelector('.morph-view').addEventListener('click',()=>{input.value=matched?.publication_number||lastQuery;reset();openHomePage('workspace');runEvaluation();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&stage.dataset.phase!=='idle')reset();});
  document.querySelectorAll('.landing-nav a').forEach(a=>a.addEventListener('click',()=>{if(stage.dataset.phase!=='idle')reset();}));
  stage.dataset.phase='idle';window.BoleMorph={start};
})();
