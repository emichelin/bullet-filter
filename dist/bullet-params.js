(function(){
  const CFG = window.BulletConfig;
  const BUS = window.BulletBus;
  const KEYS = CFG.PARAM_KEYS;
  const PREFIX = CFG.STORAGE_PREFIX;

  function readURL(){
    const u = new URLSearchParams(location.search);
    const out = {};
    KEYS.forEach(k=>{
      const v = u.get(k);
      if(v != null && v !== '') out[k]=v;
    });
    return out;
  }

  function readStorage(){
    const out = {};
    KEYS.forEach(k=>{
      const v = sessionStorage.getItem(PREFIX+k);
      if(v != null && v !== '') out[k]=v;
    });
    return out;
  }

  function merge(){
    return { ...readStorage(), ...readURL() };
  }

  function saveStorage(params){
    KEYS.forEach(k=>{
      if(params[k] != null && params[k] !== '') sessionStorage.setItem(PREFIX+k, params[k]);
    });
  }

  function updateURL(params, replace=true){
    const url = new URL(location.href);
    KEYS.forEach(k=>{
      if(params[k] != null && params[k] !== '') url.searchParams.set(k, params[k]);
      else url.searchParams.delete(k);
    });
    if(replace) history.replaceState({}, '', url.toString());
    else history.pushState({}, '', url.toString());
  }

  function get(){ return merge(); }

  function set(params, { replace=true } = {}){
    const mergedParams = { ...merge(), ...params };
    saveStorage(mergedParams);
    updateURL(mergedParams, replace);
    BUS.emit(CFG.EVENTS.PARAMS_CHANGED, mergedParams);
    return mergedParams;
  }

  function clear({ replace=true } = {}){
    KEYS.forEach(k=>sessionStorage.removeItem(PREFIX+k));
    const url = new URL(location.href);
    KEYS.forEach(k=>url.searchParams.delete(k));
    if(replace) history.replaceState({}, '', url.toString());
    else history.pushState({}, '', url.toString());
    BUS.emit(CFG.EVENTS.PARAMS_CHANGED, {});
  }

  window.BulletParams = { get, set, clear, updateURL };
})();
