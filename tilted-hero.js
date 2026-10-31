/* Native adaptation of the supplied TiltedGridHero, preserving cylindrical strip geometry. */
(() => {
  const root=document.getElementById('patentReel');
  const camera=root.querySelector('.patent-reel-camera');
  const images=['patent-medical.jpg','patent-chip.jpg','patent-environment.jpg'];
  const SLICES=16,CAMERA=1.6,aspect=16/9,gap=6,speed=4,bend=80*Math.PI/180;
  const arc=(CAMERA-1+Math.cos(bend))/(2*CAMERA*Math.sin(bend));
  const style=document.createElement('style');root.append(style);
  images.forEach(src=>{const image=new Image();image.src=src;});
  let oldWidth=0,oldHeight=0;
  function layout(){
    const width=root.clientWidth,height=root.clientHeight;
    if(!width||!height||width===oldWidth&&height===oldHeight)return;
    oldWidth=width;oldHeight=height;
    const h=Math.min(height*.65,width*.55/aspect),radius=width*arc;
    const unit=h/radius*180/Math.PI,pitch=(aspect+gap/100)*unit;
    const limit=bend*180/Math.PI+aspect*unit/2;
    const columns=Math.min(60,Math.max(2,Math.ceil(2*limit/pitch)));
    const sweep=columns*pitch/2,hide=(sweep-Math.min(sweep,limit))/(2*sweep)*100;
    const turn=angle=>`translateZ(${radius}px) rotateY(${angle}deg) translateZ(${-radius}px)`;
    style.textContent=`@keyframes bole-reel-orbit{from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}0%,${hide}%,${100-hide}%,100%{visibility:hidden}${hide+.001}%,${100-hide-.001}%{visibility:visible}}`;
    camera.style.perspective=radius*CAMERA+'px';camera.replaceChildren();
    for(let t=0;t<columns;t++){
      const tile=document.createElement('div');tile.className='reel-tile';
      const first=columns-1-t;let index=first%images.length;
      Object.assign(tile.style,{left:`calc(50% - ${h*aspect/2}px)`,top:`calc(50% - ${h/2}px)`,width:h*aspect+'px',height:h+'px',animation:`bole-reel-orbit ${columns*speed}s linear ${-t*speed}s infinite`});
      for(let k=0;k<SLICES;k++){
        const share=aspect/SLICES,strip=document.createElement('div');strip.className='reel-strip';
        Object.assign(strip.style,{left:h*(aspect-share)/2+'px',width:h*share+(k===SLICES-1?0:1)+'px',height:h+'px',transform:turn((aspect/2-(k+.5)*share)*unit)});
        if(k===0)strip.style.borderRadius='10px 0 0 10px';if(k===SLICES-1)strip.style.borderRadius='0 10px 10px 0';
        const img=document.createElement('img');img.src=images[index];img.alt='';img.draggable=false;Object.assign(img.style,{left:-h*k*share+'px',width:h*aspect+'px',height:h+'px'});strip.append(img);tile.append(strip);
      }
      tile.addEventListener('animationiteration',e=>{if(e.target!==tile)return;index=(Math.round(e.elapsedTime/(columns*speed))*columns+first)%images.length;tile.querySelectorAll('img').forEach(img=>img.src=images[index]);});camera.append(tile);
    }
  }
  new ResizeObserver(layout).observe(root);layout();
  // Freeze a complete frame for reduced motion and stop rendering off screen.
  const observer=new IntersectionObserver(entries=>{const visible=entries[0].isIntersecting;root.classList.toggle('reel-outside',!visible);});observer.observe(root);
  const bodyObserver=new MutationObserver(()=>root.classList.toggle('reel-hidden',document.body.classList.contains('inner-view')));bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
})();
