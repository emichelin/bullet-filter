  (function(){
    if(!CFG || !BUS || !PARAMS) return;

    const hasVal = (params, val) => Object.values(params).includes(val);

    const evalCondition = (() => {
      const cache = new Map();
      return (raw, params) => {
        const key = raw + JSON.stringify(params);
        if (cache.has(key)) return cache.get(key);

        let out = true;
        try {
          const isGlobalNot = /^\{\{\s*!\s*/.test(raw);
          let c = raw
            .replace(/^\{\{\s*if(?:not)?\s+/i, '')
            .replace(/^\{\{\s*!\s*/, '')
            .replace(/\s*\}\}$/, '')
            .trim();
          if (!c) return true;

          const simpleOrWithParens = c.match(/^\(([^)]+)\)$/);
          if (simpleOrWithParens && !simpleOrWithParens[1].includes('&')) c = simpleOrWithParens[1].trim();

          // OR with commas (top-level)
          if (/(?![^(]*\)),/.test(c)) {
            const parts = [];
            let depth = 0, current = '';
            for (let i = 0; i < c.length; i++) {
              const ch = c[i];
              if (ch === '(') depth++;
              else if (ch === ')') depth--;
              else if (ch === ',' && depth === 0) {
                parts.push(current.trim());
                current = '';
                continue;
              }
              current += ch;
            }
            if (current.trim()) parts.push(current.trim());
            out = parts.some(p => evalCondition(`{{if ${p}}}`, params));
            if (isGlobalNot) out = !out;
            cache.set(key, out);
            return out;
          }

          // NOT group !(a,b,c)
          const notGroup = c.match(/^!\s*\(([^)]+)\)$/);
          if (notGroup) {
            const vals = notGroup[1].split(',').map(v => v.trim());
            out = !vals.some(v => hasVal(params, v));
            if (isGlobalNot) out = !out;
            cache.set(key, out);
            return out;
          }

          // AND with group a&(b,c)
          const andWithGroups = c.match(/^([^&]+)&\(([^)]+)\)$/);
          if (andWithGroups) {
            const left = andWithGroups[1].trim();
            const orValues = andWithGroups[2].split(',').map(v => v.trim());
            out = hasVal(params, left) && orValues.some(v => hasVal(params, v));
            if (isGlobalNot) out = !out;
            cache.set(key, out);
            return out;
          }

          // AND chain a&b&!c&!(d,e)
          if (c.includes('&')) {
            const parts = [];
            let depth = 0, current = '';
            for (let i = 0; i < c.length; i++) {
              const ch = c[i];
              if (ch === '(') depth++;
              else if (ch === ')') depth--;
              else if (ch === '&' && depth === 0) {
                parts.push(current.trim());
                current = '';
                continue;
              }
              current += ch;
            }
            if (current.trim()) parts.push(current.trim());

            out = parts.every(part => {
              if (part.startsWith('!')) return !hasVal(params, part.slice(1).trim());
              const ng = part.match(/^!\s*\(([^)]+)\)$/);
              if (ng) return !ng[1].split(',').map(v => v.trim()).some(v => hasVal(params, v));
              return hasVal(params, part);
            });

            if (isGlobalNot) out = !out;
            cache.set(key, out);
            return out;
          }

          // simple NOT !x
          if (c.startsWith('!')) {
            out = !hasVal(params, c.slice(1).trim());
            if (isGlobalNot) out = !out;
            cache.set(key, out);
            return out;
          }

          out = hasVal(params, c);
          if (isGlobalNot) out = !out;
        } catch (_) {
          out = true;
        }
        cache.set(key, out);
        return out;
      };
    })();

    const getMergedParams = () => {
      const p = {};
      new URLSearchParams(location.search).forEach((v,k)=>(p[k]=v));
      CFG.PARAM_KEYS.forEach(k=>{
        const v = sessionStorage.getItem(`${CFG.STORAGE_PREFIX}${k}`);
        if(v && !p[k]) p[k]=v;
      });
      return p;
    };

    function filterToggleHeadings(){
      const params = getMergedParams();

      // headings notion (.notion-h)
      document.querySelectorAll('.notion-h').forEach(h=>{
        const gray = h.querySelector('.notion-gray');
        if(!gray) return;
        const match = gray.textContent.match(/\{\{?\s*(?:if|!)[^}]+\}?\}/i);
        if(!match) return;

        const ok = evalCondition(match[0], params);
        const details = h.closest('details');
        if(details) details.style.display = ok ? '' : 'none';
        else h.style.display = ok ? '' : 'none';

        gray.style.display = 'none';
      });

      // headings HTML (h1-h6)
      document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(heading=>{
        const gray = heading.querySelector('.notion-gray');
        if(!gray) return;
        const match = gray.textContent.match(/\{\{?\s*(?:if|!)[^}]+\}?\}/i);
        if(!match) return;

        const ok = evalCondition(match[0], params);
        heading.style.display = ok ? '' : 'none';
        gray.style.display = 'none';
      });
    }

    function filterTextCallouts(){
      const params = getMergedParams();
      document.querySelectorAll('.notion-callout .notion-gray').forEach(span=>{
        if(span.closest('.notion-h, h1,h2,h3,h4,h5,h6, summary')) return;

        const match = span.textContent.match(/\{\{?\s*(?:if|!)[^}]+\}?\}/i);
        if(!match) return;
        const callout = span.closest('.notion-callout');
        if(!callout) return;

        const ok = evalCondition(match[0], params);
        callout.style.display = ok ? '' : 'none';
        span.style.display = 'none';
      });
    }

    function hideEmptyCallouts(){
      document.querySelectorAll('.notion-callout').forEach(callout=>{
        if(callout.style.display === 'none') return;

        const hasVisibleContent = Array.from(callout.children).some(child=>{
          if(child.classList.contains('notion-callout-icon')) return false;
          const cs = window.getComputedStyle(child);
          if(cs.display === 'none') return false;
          const txt = child.textContent.replace(/\{\{[^}]+\}\}/g, '').trim();
          if(txt.length > 0) return true;
          const media = child.querySelectorAll('img:not([style*="display: none"]), table:not([style*="display: none"])');
          return media.length > 0;
        });

        if(!hasVisibleContent) callout.style.display='none';
      });
    }

    function unrollInvisibleToggles(){
      const allDetails = document.querySelectorAll('details');
      allDetails.forEach((details)=>{
        const summary = details.querySelector('summary');
        if(!summary) return;

        const graySpans = summary.querySelectorAll('.notion-gray');
        Array.from(graySpans).forEach(span=>{
          const text = span.textContent.trim();
          if(text === '-o' || text.includes('-o')){
            details.open = true;
            details.classList.add('toggle-unrolled-invisible');
            const parentCallout = details.closest('.notion-callout, [class*="notion-callout"]');
            if(parentCallout) parentCallout.classList.add('callout-invisible-wrapper');
          }
        });
      });
    }

    function runAll(){
      filterToggleHeadings();
      filterTextCallouts();
      setTimeout(unrollInvisibleToggles, 200);
      setTimeout(hideEmptyCallouts, 300);
      setTimeout(()=> BUS.emit(CFG.EVENTS.FILTER_CHANGED), 400);
    }

    window.BulletFilter = { run: runAll };

    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runAll);
    else runAll();

    ['popstate','hashchange', CFG.EVENTS.PARAMS_CHANGED].forEach(ev=>{
      window.addEventListener(ev, ()=> setTimeout(runAll,0));
    });

    BUS.on(CFG.EVENTS.PARAMS_CHANGED, ()=> setTimeout(runAll,0));
  })();
