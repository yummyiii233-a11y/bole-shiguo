const finale = (() => {
  const scene = document.querySelector(".finale");
  const documents = scene.querySelector(".finale-docs");
  const heading = scene.querySelector(".finale-heading");
  const flow = scene.querySelector(".finale-flow");
  const capabilities = scene.querySelector(".finale-capabilities");
  const items = [...capabilities.querySelectorAll("li")];
  const previews = [...capabilities.querySelectorAll(".finale-preview img")];
  const principle = scene.querySelector(".finale-principle");
  const statements = [...principle.querySelectorAll("p")];
  const brand = scene.querySelector(".finale-brand");
  const sheet = scene.querySelector(".mini-sheet");
  const filename = document.createElement("strong");
  filename.textContent = "patents_20.xlsx";
  const table = document.createElement("table");
  table.setAttribute("aria-label","批量专利工作簿实际数据节选");
  const headers = table.createTHead().insertRow();
  for (const heading of workbook.headers.slice(0,3)) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = heading;
    headers.append(cell);
  }
  const body = table.createTBody();
  for (const entry of workbook.rows.slice(0,4)) {
    const row = body.insertRow();
    for (const value of entry.slice(0,3)) row.insertCell().textContent = value;
  }
  sheet.append(filename,table);

  const shots = [
    { label:"从建议书到整轮工作成果", note:"对标仍为资料不足，企业线索待核实，建议书为待复核草稿。" },
    { label:"把原本分散的工作，连成一个闭环。" },
    {}, {}, {}, {},
    {}, {}, {}
  ].map(shot => ({image:"p3-portfolio",...shot}));
  const modeClasses = ["finale-gather","finale-closing-loop","finale-principles","finale-branding"];

  function render(stage, beat) {
    const mode = beat === 0 ? 0 : beat === 1 ? 1 : beat === 6 || beat === 7 ? 2 : beat === 8 ? 3 : -1;
    for (const [index,name] of modeClasses.entries()) {
      stage.classList.toggle(name,mode === index);
    }
    const capability = beat >= 2 && beat <= 5 ? beat-2 : -1;
    heading.setAttribute("aria-hidden",String(beat < 0 || beat > 5));
    documents.inert = mode !== 0 && mode !== 1;
    flow.inert = mode !== 1;
    capabilities.inert = capability < 0;
    principle.inert = mode !== 2;
    brand.inert = mode !== 3;
    for (const [index,item] of items.entries()) {
      item.classList.toggle("is-seen",index <= capability);
      item.classList.toggle("is-current",index === capability);
      item.setAttribute("aria-hidden",String(index > capability));
      previews[index].classList.toggle("is-current",index === capability);
      previews[index].setAttribute("aria-hidden",String(index !== capability));
    }
    for (const [index,text] of statements.entries()) {
      const seen = mode === 2 && index <= beat-6;
      text.classList.toggle("is-seen",seen);
      text.setAttribute("aria-hidden",String(!seen));
    }
  }
  return {shots,render};
})();
