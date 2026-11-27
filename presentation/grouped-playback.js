const groupedPlayback = (() => {
  const ranges = {
    1:[[1,2]], 2:[[1,7]], 4:[[1,4],[5,7]], 5:[[5,7]], 6:[[2,6]], 7:[[1,3]],
    8:[[1,2],[3,6]], 9:[[2,7],[9,13]], 10:[[1,6],[7,12]], 12:[[1,2],[3,6],[7,8]]
  };
  const omitted = {5:new Set([1,3,4])};
  const timers = new Set();
  const overlays = new Set();
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let playing = false;
  function clearTimers() {
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
  }
  let groupTimer;
  function cancel() {
    clearTimeout(groupTimer);
    clearTimers();
    playing=false;
  }
  function later(callback,ms) {
    const token = setTimeout(()=>{
      timers.delete(token);
      callback();
    },ms);
    timers.add(token);
  }
  function enabled(page,beat) { return !omitted[page]?.has(beat+1); }
  function first(page) { return page===5 ? 1 : 0; }
  function center([x,y,w,h]) { return [x+w/2,y+h/2]; }

  function prepare(shots) {
    const copy = shots.map(page=>page.map(shot=>({...shot})));
    // selected.png: both checked rows, beneath header and above row three.
    Object.assign(copy[1][4],{highlight:[17.9,44.43,79,18.9],zoom:1,origin:[50,50]});
    for (const [key,p,entry,draft,send] of [["benchmark",8,2,3,4],["matching",9,8,9,10],["advice",10,6,7,8]]) {
      const shots=copy[p-4];
      const {input, send:sendRect}=groupCapture[key];
      Object.assign(shots[entry],{
        image:`group-${key}-entry`,zoom:1,origin:[50,50],entryReplay:key,point:undefined,
        label: key==="matching"?"下滚至「查找合作企业」":shots[entry].label
      });
      Object.assign(shots[draft],{
        image:`group-${key}-draft`,draftReveal:key,draftRegion:input,point:undefined,
        zoom:1,origin:[50,50]
      });
      Object.assign(shots[send],{point:center(sendRect),before:`group-${key}-entry`});
    }
    copy[4][5].benchmarkAnswer = true;
    return copy;
  }
  function dwell(page,index,shot) {
    if(shot?.stream) return 8600;
    if(shot?.archive) return Math.max(3900,(shot.live?.regions?.length??6)*470+2300);
    if(shot?.entryReplay) return shot.entryReplay==="matching" ? 3300 : 2100;
    if(shot?.draftReveal) return 4300;
    if(shot?.benchmarkAnswer) return 4900;
    if(page===12) return index>=6 ? 2500 : 1600;
    if(page===4&&index===5) return 4200;
    if(page===5&&index===5) return 3700;
    return shot?.point ? 2750 : 2250;
  }
  function start(targetPage,targetBeat,replay=false,automatic=true) {
    cancel();
    if(!enabled(targetPage,targetBeat)) targetBeat=first(targetPage);
    const bounds=automatic ? ranges[targetPage]?.find(([a,b])=>a<=targetBeat+1&&targetBeat+1<=b) : undefined;
    function play(index) {
      show(targetPage,index,replay&&index===targetBeat);
      if(!bounds){playing=false;return;}
      playing=true;
      next.disabled=true;
      const shot=targetPage>3?stageShots[targetPage-4][index]:undefined;
      groupTimer=setTimeout(()=>{
        let nextBeat=index+1;
        while(nextBeat<bounds[1] && !enabled(targetPage,nextBeat)) nextBeat++;
        if(nextBeat>=bounds[1]) {
          playing=false;
          next.disabled=false;
        }
        else play(nextBeat);
      },dwell(targetPage,index,shot));
    }
    play(targetBeat);
  }
  function move(delta) {
    if(delta>0&&playing) return;
    let target=beat+delta;
    while(target>=0&&target<limits[page-1]&&!enabled(page,target)) target+=delta;
    if(target>=0&&target<limits[page-1]) start(page,target,false,delta>0);
    else if(delta>0&&page<limits.length) start(page+1,first(page+1));
    else if(delta<0&&page>1) start(page-1,limits[page-2]-1,false,false);
  }
  function keep(node) { overlays.add(node);camera.append(node);return node; }
  function overlay(tag,classname) {
    const node=document.createElement(tag);
    node.className=classname;
    node.setAttribute("aria-hidden","true");
    return keep(node);
  }
  function place(node,[x,y,w,h]) {
    Object.assign(node.style,{left:`${x}%`,top:`${y}%`,width:`${w}%`,height:`${h}%`});
  }
  function animatePointer(rect) {
    const [x,y]=center(rect);
    const ringShape=keep(ring.cloneNode(false));
    const cursorShape=keep(cursor.cloneNode(true));
    ringShape.removeAttribute("id");
    cursorShape.removeAttribute("id");
    for(const shape of [ringShape,cursorShape]){
      Object.assign(shape.style,{left:`${x}%`,top:`${y}%`,zIndex:"8"});
    }
    cursorShape.animate([
      {opacity:0,transform:"translate(4cqw,2cqw)"},
      {opacity:1,transform:"translate(-12%,-7%)",offset:.63},
      {opacity:1,transform:"translate(-12%,-7%)",offset:.80},
      {opacity:0,transform:"translate(-12%,-7%)"}
    ],{duration:760,easing:"ease-out"});
    ringShape.animate([{opacity:.95,scale:.5},{opacity:0,scale:1.42}],{duration:380,delay:500});
    later(()=>{ringShape.remove();cursorShape.remove();},970);
  }
  function hideOld() {
    clearTimers();
    for(const node of overlays) {
      for(const animation of node.getAnimations({subtree:true})) animation.cancel();
      node.remove();
    }
    overlays.clear();
  }
  function inset([x,y,w,h]) { return `inset(${y}% ${100-x-w}% ${100-y-h}% ${x}%)`; }
  function revealImage(name,[x,y,w,h],duration) {
    const mask=overlay("img","grouped-draft-mask");
    mask.alt="";
    mask.src=`assets/${name}.png`;
    mask.animate([{clipPath:inset([x,y,w,h])},{clipPath:inset([x,y+h,w,0])}],
      {delay:240,duration,easing:"linear",fill:"both"});
    later(()=>mask.remove(),duration+260);
  }
  function land(shot) {
    if(!reducedMotion.matches) {
      if(shot.draftReveal) revealImage(`group-${shot.draftReveal}-draft-empty`,shot.draftRegion,1300);
      if(shot.benchmarkAnswer) {
        const {left,top,width,bottom}=liveResults.benchmark.geometry;
        revealImage("live-benchmark-status",[left,top,width,bottom-top],2300);
      }
    }
    if(!shot.entryReplay) return;
    const {target,pane,scroll}=groupCapture[shot.entryReplay];
    function finish() {
      place(overlay("span","grouped-target"),target);
      if(!reducedMotion.matches)animatePointer(target);
    }
    if(!scroll||reducedMotion.matches){finish();return;}
    // The track is stitched from the real scroll positions, with the chat fixed.
    const viewport=overlay("div","grouped-scroll-window");
    place(viewport,pane);
    const track=new Image();
    track.alt="";
    track.src="assets/group-matching-scroll.png";
    const travel=scroll/(864*pane[3]/100);
    track.style.height=`${(1+travel)*100}%`;
    viewport.append(track);
    track.animate([{transform:"translateY(0)"},{transform:`translateY(${-travel/(1+travel)*100}%)`}],
      {delay:280,duration:1300,easing:"cubic-bezier(.35,.05,.2,1)",fill:"both"});
    later(()=>{viewport.remove();finish();},1620);
  }
  function assets() {
    const names=Object.keys(groupCapture).flatMap(key=>[
      `group-${key}-entry`,`group-${key}-draft`,`group-${key}-draft-empty`
    ]);
    names.push("group-matching-scroll");
    return names.map(name=>{const img=new Image();img.src=`assets/${name}.png`;return img;});
  }
  return {start,move,first,prepare,hideOld,land,assets};
})();
