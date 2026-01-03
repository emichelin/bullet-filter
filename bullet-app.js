(function(){
  "use strict";

  const Core  = window.BulletCore;
  const CFG   = window.BulletCFG;

  const Modal  = window.BulletModal;
  const Filter = window.BulletFilter;
  const TOC    = window.BulletTOC;

  if(!Core || !CFG){
    console.error("[BulletApp] missing deps: BulletCore/BulletCFG");
    return;
  }

  // ============================================================================
  // 0) PARAM RESYNC ON LOAD
  // ============================================================================
  function resyncParamsOnLoad(){
    const merged = Core.Params.get();
    Core.Params.set(merged, { replace:true });
  }

  // ============================================================================
  // 1) NAVBAR DISPLAY
  // ============================================================================
  function renderNavbar(){
    const navbar = document.querySelector(CFG.SELECTORS.navbar);
    if(!navbar) return;

    // remove old display
    navbar.querySelector(".params-display")?.remove();

    const p = Core.Params.get();
    const values = [
      p.model,
      p.module,
      p.env,
      p.sensor,
      p.range,
      p.cond,
      p.opt,
      p.img
    ].filter(Boolean);

    const display = document.createElement("div");
    display.className = "params-display";

    if(values.length === 0){
      display.textContent = "Full Manual";
      display.classList.add("full-manual");
    } else {
      display.textContent = values.join(" • ");
      display.classList.add("has-params");
    }

    navbar.appendChild(display);

    // ensure Configure button exists (modal depends on it)
    if(!navbar.querySelector(".configure-button")){
      const btn = document.createElement("button");
      btn.className = "configure-button";
      btn.textContent = "Configure";
      navbar.appendChild(btn);
    }
  }

  // ============================================================================
  // 2) LINK INTERCEPTION (same behavior as your old app)
  // ============================================================================
  function initLinkInterception(){
    document.addEventListener("click", (e)=>{
      const link = e.target.closest("a[href]");
      if(!link) return;

      const href = link.getAttribute("href");

      // allow normal behavior for anchors / mail / tel / js / blank / download
      if(
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.hasAttribute("download") ||
        link.target === "_blank"
      ) return;

      // ignore clicks inside modal
      if(link.closest("#configModal")) return;

      // parse URL
      let linkUrl;
      try { linkUrl = new URL(href, location.origin); }
      catch { return; }

      // only same-origin internal links
      if(linkUrl.origin !== location.origin) return;

      e.preventDefault();
      e.stopPropagation();

      // merge current params + incoming params
      const current = Core.Params.get();
      const incoming = {};

      linkUrl.searchParams.forEach((v,k)=>{
        if(CFG.PARAM_KEYS.includes(k)) incoming[k] = v;
      });

      const finalParams = { ...current, ...incoming };
      Core.Params.set(finalParams, { replace:false });

      // build final URL (preserving hash)
      const finalUrl = new URL(linkUrl.pathname, location.origin);
      Object.entries(finalParams).forEach(([k,v])=>{
        if(v) finalUrl.searchParams.set(k,v);
      });
      if(linkUrl.hash) finalUrl.hash = linkUrl.hash;

      location.href = finalUrl.toString();
    }, true);
  }

  // ============================================================================
  // 3) INIT MODULES
  // ============================================================================
  async function initModules(){
    // wait navbar (Bullet sometimes renders later)
    await Core.waitFor(CFG.SELECTORS.navbar, 10000).catch(()=>null);

    // init modal
    if(Modal?.init) Modal.init();

    // init filter
    if(Filter?.run) Filter.run();

    // init toc
    if(TOC?.init) TOC.init();
  }

  // ============================================================================
  // 4) BOOTSTRAP
  // ============================================================================
  function bootstrap(){
    resyncParamsOnLoad();
    renderNavbar();
    initLinkInterception();
    initModules();

    // rerender navbar whenever params change
    Core.on(CFG.EVENTS.PARAMS_CHANGED, renderNavbar);

    // rerun filter & toc when params change
    Core.on(CFG.EVENTS.PARAMS_CHANGED, ()=>{
      if(Filter?.run) Filter.run();
      if(TOC?.refresh) TOC.refresh();
    });

    // rerun toc after filtering
    Core.on(CFG.EVENTS.FILTER_CHANGED, ()=>{
      if(TOC?.refresh) TOC.refresh();
    });

    // handle back button
    window.addEventListener("popstate", ()=>{
      Core.emit(CFG.EVENTS.PARAMS_CHANGED, Core.Params.get());
    });
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootstrap);
  else bootstrap();

})();
