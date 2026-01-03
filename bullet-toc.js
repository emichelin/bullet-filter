(function(){
  "use strict";

  const Core = window.BulletCore;
  const CFG  = window.BulletCFG;

  if(!Core || !CFG){
    console.error("[BulletTOC] missing deps: BulletCore/BulletCFG");
    return;
  }

  const TOC_ID = "static-toc";
  const HID_CLASS = "toc-hidden";

  let tocContainer = null;
  let entries = []; // [{linkEl, targetEl}]

  // ============================================================================
  // 1) Build TOC once
  // ============================================================================
  function buildOnce(){
    if(document.getElementById(TOC_ID)) return;

    tocContainer = Core.create("div", {
      id: TOC_ID,
      class: "dynamic-toc",
      html: `<div class="toc-title">Contents</div>`
    });

    document.body.appendChild(tocContainer);

    // Collect headings
    const selector = ".notion-h1, .notion-h2, .notion-h3, h1, h2, h3, details summary";
    const els = Core.$$(selector);

    entries = [];
    els.forEach((el, i)=>{
      if(!el.id) el.id = `toc-${i}`;

      const a = Core.create("a", {
        href: `#${el.id}`,
        class: "toc-item"
      }, [
        el.textContent.replace(/\{\{.*?\}\}|-o/g, "").trim()
      ]);

      tocContainer.appendChild(a);
      entries.push({ linkEl: a, targetEl: el });
    });

    // Open toggles if heading is inside a closed <details>
    tocContainer.addEventListener("click",(e)=>{
      if(!e.target.matches(".toc-item")) return;
      const target = document.getElementById(e.target.hash.slice(1));
      const details = target?.closest("details");
      if(details && !details.open) details.open = true;
    });
  }

  // ============================================================================
  // 2) Refresh visibility (hide items for hidden headings)
  // ============================================================================
  function refresh(){
    if(!tocContainer) tocContainer = document.getElementById(TOC_ID);
    if(!tocContainer) return;

    entries.forEach(({ linkEl, targetEl })=>{
      const visible =
        targetEl.offsetParent !== null &&
        window.getComputedStyle(targetEl).display !== "none";

      linkEl.classList.toggle(HID_CLASS, !visible);
    });

    // keep TOC block visible always (fixed behavior)
    // but hide it if absolutely nothing remains visible
    const hasVisible = entries.some(e => !e.linkEl.classList.contains(HID_CLASS));
    tocContainer.style.display = hasVisible ? "block" : "none";
  }

  // ============================================================================
  // Init
  // ============================================================================
  function init(){
    buildOnce();
    refresh();
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  Core.on(CFG.EVENTS.PARAMS_CHANGED, ()=> setTimeout(refresh, 20));
  Core.on(CFG.EVENTS.FILTER_CHANGED, ()=> setTimeout(refresh, 20));

  window.BulletTOC = { init, refresh, buildOnce };
})();
