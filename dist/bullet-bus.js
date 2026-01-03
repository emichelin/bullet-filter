(function(){
  const listeners = {};

  function on(event, cb){
    (listeners[event] ||= []).push(cb);
  }

  function emit(event, payload){
    (listeners[event] || []).forEach(cb=>{
      try { cb(payload); } catch(e){ console.error('[BulletBus]', e); }
    });
  }

  window.BulletBus = { on, emit };
})();
