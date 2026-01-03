  (function(){
    const MODAL = window.BulletModal;
    const FILTER = window.BulletFilter;
    const TOC = window.BulletTOC;

    if(!CFG || !BUS || !PARAMS) throw new Error('App deps missing');

    // 0) resync on load
    const merged = PARAMS.get();
    PARAMS.set(merged, { replace:true });

    // 1) Link interception
    document.addEventListener('click', (e)=>{
      const link = e.target.closest('a[href]');
      if(!link) return;
      const href = link.getAttribute('href');

      if(
        href.startsWith('#') ||
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.hasAttribute('download') ||
        link.target === '_blank'
      ) return;

      if(link.closest('#configModal')) return;

      let linkUrl;
      try { linkUrl = new URL(href, location.origin); }
      catch { return; }

      if(linkUrl.origin !== location.origin) return;

      e.preventDefault();
      e.stopPropagation();

      const current = PARAMS.get();
      const incoming = {};
      linkUrl.searchParams.forEach((v,k)=>{
        if(CFG.PARAM_KEYS.includes(k)) incoming[k]=v;
      });

      const finalParams = { ...current, ...incoming };
      PARAMS.set(finalParams, { replace:false });

      const finalUrl = new URL(linkUrl.pathname, location.origin);
      Object.entries(finalParams).forEach(([k,v])=>{ if(v) finalUrl.searchParams.set(k,v); });
      if(linkUrl.hash) finalUrl.hash = linkUrl.hash;

      location.href = finalUrl.toString();
    }, true);

    // 2) Navbar display
    function renderNavbar(){
      const navbar = document.querySelector(CFG.SELECTORS.navbar);
      if(!navbar) return;

      navbar.querySelector('.params-display')?.remove();

      const p = PARAMS.get();
      const values = [p.model,p.module,p.env,p.sensor,p.range,p.cond,p.opt,p.img].filter(Boolean);

      const display=document.createElement('div');
      display.className='params-display';

      if(values.length===0){
        display.textContent='Full Manual';
        display.classList.add('full-manual');
      } else {
        display.textContent=values.join(' • ');
        display.classList.add('has-params');
      }

      navbar.appendChild(display);

      if(!navbar.querySelector('.configure-button')){
        const btn=document.createElement('button');
        btn.className='configure-button';
        btn.textContent='Configure';
        navbar.appendChild(btn);
      }
    }

    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', renderNavbar);
    else renderNavbar();

    BUS.on(CFG.EVENTS.PARAMS_CHANGED, renderNavbar);

    // 3) init modal after navbar exists
    function tryInitModal(){
      const navbar = document.querySelector(CFG.SELECTORS.navbar);
      const btn = navbar?.querySelector('.configure-button');
      if(btn && MODAL) MODAL.init();
    }

    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', tryInitModal);
    else tryInitModal();

  })();
