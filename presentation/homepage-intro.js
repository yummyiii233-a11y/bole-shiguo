(() => {
  const intro = document.querySelector(".homepage-intro");
  const start = document.querySelector("#home-start");
  const skip = document.querySelector("#home-skip");
  const footer = stage.querySelector("footer");
  const screen = intro.querySelector(".homepage-screen");
  let finishTimer;
  let ready = false;
  const point = homeEntryPoint;
  screen.style.setProperty("--entry-x", `${point[0]}%`);
  screen.style.setProperty("--entry-y", `${point[1]}%`);
  footer.inert = true;
  Promise.all([...screen.querySelectorAll("img")].map(image=>image.decode())).then(() => {
    ready = true;
    start.disabled = false;
  }).catch(() => { start.textContent = "素材未完整加载"; });

  function finish() {
    if (intro.hidden) return;
    clearTimeout(finishTimer);
    intro.inert = true;
    footer.inert = false;
    show(1,0,true);
    if (reduced.matches) intro.hidden = true;
    else intro.animate([{opacity:1},{opacity:0}],{duration:550,fill:"forwards"})
      .finished.then(() => { intro.hidden = true; });
    next.focus({preventScroll:true});
  }
  function play() {
    if (!ready || intro.inert) return;
    clearTimeout(finishTimer);
    intro.classList.remove("running");
    void intro.offsetWidth;
    intro.classList.add("running");
    start.textContent = "重播开场";
    finishTimer = setTimeout(finish,12000);
  }
  start.onclick = play;
  skip.onclick = finish;
  document.addEventListener("keydown", event => {
    if (intro.hidden || intro.inert || event.metaKey || event.ctrlKey || event.altKey) return;
    if (!["ArrowLeft","ArrowRight"," ","r","R","Escape"].includes(event.key)) return;
    if (event.key === " " && event.target.closest("button")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.key === "Escape" || (event.key === "ArrowRight" && finishTimer)) finish();
    else if (event.key !== "ArrowLeft") play();
  }, true);
})();
