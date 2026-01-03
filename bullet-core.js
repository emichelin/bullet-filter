(function(){
  "use strict";

  // ============================================================================
  // BulletCore V5 — utilities + event bus + params
  // ============================================================================
  const Core = {};
  const CFG = {
    PARAM_KEYS: ['model','module','sensor','range','env','cond','opt','other','img'],
    STORAGE_PREFIX: 'bullet_',
    EVENTS: {
      PARAMS_CHANGED: 'bullet:paramsChanged',
      FILTER_CHANGED: 'bullet:filterChanged',
      TOC_CHANGED:    'bullet:tocChanged'
    },
    SELECTORS: {
      navbar: '.navbar.bullet-navbar'
    },
    DEBUG: false
  };

  // --- Logging
  Core.log = (...a)=> CFG.DEBUG && console.log('[Bullet]', ...a);
  Core.warn = (...a)=> console.warn('[Bullet]', ...a);

  // --- DOM helpers
  Core.$ = (sel, ctx=document)=> ctx.querySelector(sel);
  Core.$$ = (sel, ctx=document)=> Array.from(ctx.querySelectorAll(sel));

  Core.show = (el, display='block')=>{
    if(typeof el === 'string') el = document.getElementById(el);
    if(el) el.style.display = display;
  };
  Core.hide = (el)=>{
    if(typeof el === 'string') el = document.getElementById(el);
    if(el) el.style.display = 'none';
  };

  Core.create = (tag, props={}, children=[])=>{
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k,v])=>{
      if(k === 'class') el.className = v;
      else if(k === 'html') el.innerHTML = v;
      else if(k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    });
    children.forEach(c=> el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return el;
  };

  // --- Wait for element (robust with MutationObserver)
  Core.waitFor = (selector, timeout=10000)=>{
    return new Promise((resolve, reject)=>{
      const found = document.querySelector(selector);
      if(found) return resolve(found);

      const obs = new MutationObserver(()=>{
        const el = document.querySelector(selector);
        if(el){
          obs.disconnect();
          resolve(el);
        }
      });

      obs.observe(document.documentElement, { childList:true, subtree:true });

      if(timeout){
        setTimeout(()=>{
          obs.disconnect();
          reject(new Error(`waitFor timeout: ${selector}`));
        }, timeout);
      }
    });
  };

  Core.debounce = (fn, delay=80)=>{
    let t;
    return (...args)=>{
      clearTimeout(t);
      t = setTimeout(()=> fn(...args), delay);
    };
  };

  // ============================================================================
  // Event bus (small + safe)
  // ============================================================================
  const listeners = {};
  Core.on = (event, cb)=>{
    (listeners[event] ||= []).push(cb);
  };
  Core.emit = (event, payload)=>{
    (listeners[event] || []).forEach(cb=>{
      try { cb(payload); } catch(err){ Core.warn('Bus handler error', err); }
    });
  };

  // ============================================================================
  // Params: URL + sessionStorage (single source of truth)
  // ============================================================================
  const Keys = CFG.PARAM_KEYS;
  const Prefix = CFG.STORAGE_PREFIX;

  function readURL(){
    const u = new URLSearchParams(location.search);
    const out = {};
    Keys.forEach(k=>{
      const v = u.get(k);
      if(v != null && v !== '') out[k] = v;
    });
    return out;
  }

  function readStorage(){
    const out = {};
    Keys.forEach(k=>{
      const v = sessionStorage.getItem(Prefix + k);
      if(v != null && v !== '') out[k] = v;
    });
    return out;
  }

  function merged(){
    return { ...readStorage(), ...readURL() };
  }

  function saveStorage(p){
    Keys.forEach(k=>{
      if(p[k] != null && p[k] !== '') sessionStorage.setItem(Prefix+k, p[k]);
      else sessionStorage.removeItem(Prefix+k);
    });
  }

  function updateURL(p, replace=true){
    const url = new URL(location.href);
    Keys.forEach(k=>{
      if(p[k] != null && p[k] !== '') url.searchParams.set(k, p[k]);
      else url.searchParams.delete(k);
    });
    if(replace) history.replaceState({}, '', url.toString());
    else history.pushState({}, '', url.toString());
  }

  Core.Params = {
    get: ()=> merged(),
    set: (p, { replace=true } = {})=>{
      const m = { ...merged(), ...p };
      saveStorage(m);
      updateURL(m, replace);
      Core.emit(CFG.EVENTS.PARAMS_CHANGED, m);
      return m;
    },
    clear: ({ replace=true } = {})=>{
      const empty = {};
      saveStorage(empty);
      updateURL(empty, replace);
      Core.emit(CFG.EVENTS.PARAMS_CHANGED, empty);
    }
  };

  // ============================================================================
  // Expose globally
  // ============================================================================
  window.BulletCore = Core;
  window.BulletCFG = CFG;

})();
