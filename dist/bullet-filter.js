(function(){
  const CFG = window.BulletConfig;
  const BUS = window.BulletBus;
  const PARAMS = window.BulletParams;
  if(!CFG || !BUS || !PARAMS) throw new Error('Filter deps missing');

  const hasVal = (params,val)=>Object.values(params).includes(val);

  function evalCondition(raw, params){
    const isGlobalNot = /^\{\{\s*!\s*/.test(raw);
    let c = raw.replace(/^\{\{\s*if(?:not)?\s+/i,'')
               .replace(/^\{\{\s*!\s*/, '')
               .replace(/\s*\}\}$/, '')
               .trim();
    if(!c) return true;

    let out=true;

    if(c.includes(',')){
      const parts = c.split(',').map(x=>x.trim());
      out = parts.some(p=>evalCondition(`{{if ${p}}}`, params));
      return isGlobalNot ? !out : out;
    }

    if(c.includes('&')){
      const parts = c.split('&').map(x=>x.trim());
      out = parts.every(part=>{
        if(part.startsWith('!')) return !hasVal(params, part.slice(1));
        return hasVal(params, part);
      });
      return isGlobalNot ? !out : out;
    }

    if(c.startsWith('!')) out = !hasVal(params, c.slice(1));
    else out = hasVal(params, c);

    return isGlobalNot ? !out : out;
  }

  function filterHeadings(){
    const params = PARAMS.get();
    document.querySelectorAll(CFG.SELECTORS.headings).forEach(h=>{
      const gray = h.querySelector('.notion-gray');
      if(!gray) return;
      const match = gray.textContent.match(/\{\{?\s*(?:if|!)[^}]+\}?\}/i);
      if(!match) return;

      const ok = evalCondition(match[0], params);
      const details = h.closest('details');
      if(details) details.style.display = ok ? '' : 'none';
      else h.style.display = ok ? '' : 'none';
      gray.style.display='none';
    });
  }

  function filterCallouts(){
    const params = PARAMS.get();
    document.querySelectorAll(CFG.SELECTORS.calloutGray).forEach(span=>{
      if(span.closest('.notion-h, h1,h2,h3,h4,h5,h6, summary')) return;

      const match = span.textContent.match(/\{\{?\s*(?:if|!)[^}]+\}?\}/i);
      if(!match) return;

      const callout = span.closest('.notion-callout');
      if(!callout) return;

      const ok = evalCondition(match[0], params);
      callout.style.display = ok ? '' : 'none';
      span.style.display='none';
    });
  }

  function run(){
    filterHeadings();
    filterCallouts();
    BUS.emit(CFG.EVENTS.FILTER_CHANGED);
  }

  window.BulletFilter = { run };

  BUS.on(CFG.EVENTS.PARAMS_CHANGED, run);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

})();
