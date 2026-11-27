(() => {
  const intro = document.querySelector(".homepage-intro");
  const start = document.querySelector("#home-start");
  const skip = document.querySelector("#home-skip");
  const footer = stage.querySelector("footer");
  const screen = intro.querySelector(".homepage-screen");
  const frames = [...screen.querySelectorAll("img")];
  const timers = [];
  let playing = false;
  function clearPlayback() {
    timers.forEach(clearTimeout);
    timers.length = 0;
    playing = false;
    screen.classList.remove("is-entering");
  }
  function showFrame(frame) {
    frames.forEach(image => image.classList.toggle("is-current", image === frame));
  }
  let ready = false;
  const point = homeEntryPoint;
  screen.style.setProperty("--entry-x", `${point[0]}%`);
  screen.style.setProperty("--entry-y", `${point[1]}%`);
  footer.inert = true;
  Promise.all(frames.map(image=>image.decode())).then(() => {
    ready = true;
    start.disabled = false;
  }).catch(() => { start.textContent = "素材未完整加载"; });

  function finish() {
    if (intro.hidden) return;
    clearPlayback();
    intro.inert = true;
    footer.inert = false;
    groupedPlayback.start(1,groupedPlayback.first(1),true);
    if (reduced.matches) intro.hidden = true;
    else intro.animate([{opacity:1},{opacity:0}],{duration:550,fill:"forwards"})
      .finished.then(() => { intro.hidden = true; });
    next.focus({preventScroll:true});
  }
  function play() {
    if (!ready || intro.inert) return;
    clearPlayback();
    playing = true;
    intro.classList.add("running");
    showFrame(frames[0]);
    for (const frame of frames.slice(1)) {
      timers.push(setTimeout(() => {
        screen.classList.remove("is-entering");
        showFrame(frame);
      }, Number(frame.dataset.at)));
    }
    timers.push(setTimeout(() => {
      showFrame(frames[0]);
      screen.classList.add("is-entering");
    }, 15900));
    start.textContent = "重播开场";
    timers.push(setTimeout(finish, 19000));
  }
  start.onclick = play;
  skip.onclick = finish;
  document.addEventListener("keydown", event => {
    if (intro.hidden || intro.inert || event.metaKey || event.ctrlKey || event.altKey) return;
    if (!["ArrowLeft","ArrowRight"," ","r","R","Escape"].includes(event.key)) return;
    if (event.key === " " && event.target.closest("button")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.key === "Escape" || (event.key === "ArrowRight" && playing)) finish();
    else if (event.key !== "ArrowLeft") play();
  }, true);
})();
