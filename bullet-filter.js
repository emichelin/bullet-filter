(function(){
  "use strict";

  const Core = window.BulletCore;
  const CFG  = window.BulletCFG;

  if(!Core || !CFG){
    console.error("[BulletFilter] missing deps: BulletCore/BulletCFG");
    return;
  }

  // ============================================================================
  // 0) Utils
  // ============================================================================
  function getParamsMerged(){
    const p = {};
    new URLSearchParams(location.search).forEach((v,k)=>(p[k]=v));

    CFG.PARAM_KEYS.forEach(k=>{
      const v = sessionStorage.getItem(`${CFG.STORAGE_PREFIX}${k}`);
      if(v && !p[k]) p[k]=v;
    });

    return p;
  }

  function hasVal(params, val){
    return Object.values(params).includes(val);
  }

  // Split string by delimiter ONLY at depth 0 (not inside parentheses)
  function splitTopLevel(str, delimiterChar){
    const out = [];
    let depth = 0;
    let current = "";

    for(let i=0;i<str.length;i++){
      const ch = str[i];
      if(ch === "(") depth++;
      else if(ch === ")") depth--;
      else if(ch === delimiterChar && depth === 0){
        out.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }

    if(current.trim()) out.push(current.trim());
    return out;
  }

  // ============================================================================
  // 1) Condition parsing & evaluation (same logic as old Step 4)
  // ============================================================================
  const evalCondition = (() => {
    const cache = new Map();

    function normalizeRaw(raw){
      const isGlobalNot = /^\{\{\s*!\s*/.test(raw);
      let expr = raw
        .replace(/^\{\{\s*if(?:not)?\s+/i, "")
        .replace(/^\{\{\s*!\s*/, "")
        .replace(/\s*\}\}$/, "")
        .trim();

      // allow "{{if (rota)}}" with no & inside
      const simpleParens = expr.match(/^\(([^)]+)\)$/);
      if(simpleParens && !simpleParens[1].includes("&")){
        expr = simpleParens[1].trim();
      }

      return { expr, isGlobalNot };
    }

    function evaluateExpr(expr, params){
      if(!expr) return true;

      // OR (comma, top-level)
      if(expr.includes(",")){
        const parts = splitTopLevel(expr, ",");
        if(parts.length > 1){
          return parts.some(p => evaluateExpr(p, params));
        }
      }

      // NOT group !(a,b,c)
      const notGroup = expr.match(/^!\s*\(([^)]+)\)$/);
      if(notGroup){
        const vals = notGroup[1].split(",").map(v=>v.trim());
        return !vals.some(v => hasVal(params, v));
      }

      // AND with OR group a&(b,c)
      const andGroup = expr.match(/^([^&]+)&\(([^)]+)\)$/);
      if(andGroup){
        const left = andGroup[1].trim();
        const rights = andGroup[2].split(",").map(v=>v.trim());
        return hasVal(params, left) && rights.some(v => hasVal(params, v));
      }

      // AND chain a&b&!c&!(d,e)
      if(expr.includes("&")){
        const parts = splitTopLevel(expr, "&");

        return parts.every(part=>{
          if(!part) return true;

          // !x
          if(part.startsWith("!")){
            const v = part.slice(1).trim();
            return !hasVal(params, v);
          }

          // !(a,b,c)
          const ng = part.match(/^!\s*\(([^)]+)\)$/);
          if(ng){
            const vals = ng[1].split(",").map(v=>v.trim());
            return !vals.some(v => hasVal(params, v));
          }

          return hasVal(params, part.trim());
        });
      }

      // simple !x
      if(expr.startsWith("!")){
        return !hasVal(params, expr.slice(1).trim());
      }

      // simple x
      return hasVal(params, expr.trim());
    }

    return function(raw, params){
      const key = raw + JSON.stringify(params);
      if(cache.has(key)) return cache.get(key);

      let out = true;
      try {
        const { expr, isGlobalNot } = normalizeRaw(raw);
        out = evaluateExpr(expr, params);
        if(isGlobalNot) out = !out;
      } catch(err){
        out = true;
      }

      cache.set(key, out);
      return out;
    };
  })();

  // ============================================================================
  // 2) FILTER: headings (.notion-h + h1-h6)
  // ============================================================================
  function filterHeadings(params){

    // Notion headings (.notion-h)
    Core.$$(".notion-h").forEach(h=>{
      const gray = Core.$(".notion-gray", h);
      if(!gray) return;

      const match = gray.textContent.match(/\{\{?\s*(?:if|!)[^}]+\}?\}/i);
      if(!match) return;

      const ok = evalCondition(match[0], params);
      const details = h.closest("details");

      if(details) details.style.display = ok ? "" : "none";
      else h.style.display = ok ? "" : "none";

      gray.style.display = "none";
    });

    // Native HTML headings (h1-h6)
    Core.$$("h1,h2,h3,h4,h5,h6").forEach(h=>{
      const gray = Core.$(".notion-gray", h);
      if(!gray) return;

      const match = gray.textContent.match(/\{\{?\s*(?:if|!)[^}]+\}?\}/i);
      if(!match) return;

      const ok = evalCondition(match[0], params);
      h.style.display = ok ? "" : "none";
      gray.style.display = "none";
    });
  }

  // ============================================================================
  // 3) FILTER: callouts with .notion-gray conditions (excluding headings)
  // ============================================================================
  function filterCallouts(params){
    Core.$$(".notion-callout .notion-gray").forEach(span=>{
      // Skip if inside heading / summary
      if(span.closest(".notion-h, h1,h2,h3,h4,h5,h6, summary")) return;

      const match = span.textContent.match(/\{\{?\s*(?:if|!)[^}]+\}?\}/i);
      if(!match) return;

      const callout = span.closest(".notion-callout");
      if(!callout) return;

      const ok = evalCondition(match[0], params);
      callout.style.display = ok ? "" : "none";
      span.style.display = "none";
    });
  }

  // ============================================================================
  // 4) Hide callouts that became empty after filtering
  // ============================================================================
  function hideEmptyCallouts(){
    Core.$$(".notion-callout").forEach(callout=>{
      if(callout.style.display === "none") return;

      const children = Array.from(callout.children);

      const hasVisible = children.some(child=>{
        if(child.classList.contains("notion-callout-icon")) return false;

        const cs = window.getComputedStyle(child);
        if(cs.display === "none") return false;

        // remove condition markers
        const txt = child.textContent.replace(/\{\{[^}]+\}\}/g, "").trim();
        if(txt.length > 0) return true;

        // media check
        const media = child.querySelectorAll("img:not([style*='display: none']), table:not([style*='display: none'])");
        return media.length > 0;
      });

      if(!hasVisible) callout.style.display = "none";
    });
  }

  // ============================================================================
  // 5) "Invisible toggles" unroll -o
  // ============================================================================
  function unrollInvisibleToggles(){
    Core.$$("details").forEach(details=>{
      const summary = Core.$("summary", details);
      if(!summary) return;

      Core.$$(".notion-gray", summary).forEach(span=>{
        const txt = span.textContent.trim();
        if(txt === "-o" || txt.includes("-o")){
          details.open = true;
          details.classList.add("toggle-unrolled-invisible");

          const parent = details.closest(".notion-callout, [class*='notion-callout']");
          if(parent) parent.classList.add("callout-invisible-wrapper");
        }
      });
    });
  }

  // ============================================================================
  // 6) Run all filters
  // ============================================================================
  function run(){
    const params = getParamsMerged();

    filterHeadings(params);
    filterCallouts(params);

    setTimeout(unrollInvisibleToggles, 200);
    setTimeout(hideEmptyCallouts, 300);

    setTimeout(()=> Core.emit(CFG.EVENTS.FILTER_CHANGED), 400);
  }

  // ============================================================================
  // Init
  // ============================================================================
  const runDebounced = Core.debounce(run, 30);

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();

  Core.on(CFG.EVENTS.PARAMS_CHANGED, runDebounced);
  window.addEventListener("popstate", runDebounced);
  window.addEventListener("hashchange", runDebounced);

  window.BulletFilter = { run };

})();
