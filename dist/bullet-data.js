(function(){
  const DATA = window.MODAL_DATA;
  if(!DATA){
    console.error("❌ MODAL_DATA missing → load bullet-data.js before bullet-modal.js");
    return;
  }

  // ===========================
  // PARAMS (simple)
  // ===========================
  const PARAM_KEYS = ['model','module','sensor','range','env','cond','img'];
  const PFX = 'bullet_';

  function getParams(){
    const url = new URLSearchParams(location.search);
    const out = {};
    PARAM_KEYS.forEach(k=>{
      out[k] = url.get(k) || sessionStorage.getItem(PFX+k) || null;
      if(out[k]==='') out[k]=null;
    });
    return out;
  }

  function setParams(params){
    const url = new URL(location.href);

    PARAM_KEYS.forEach(k=>{
      if(params[k]){
        sessionStorage.setItem(PFX+k, params[k]);
        url.searchParams.set(k, params[k]);
      } else {
        sessionStorage.removeItem(PFX+k);
        url.searchParams.delete(k);
      }
    });

    history.replaceState({}, '', url.toString());
  }

  // ===========================
  // DOM Helpers
  // ===========================
  function $(sel, ctx=document){ return ctx.querySelector(sel); }
  function $all(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }

  function show(id){ const el=document.getElementById(id); if(el) el.style.display='inline'; }
  function hide(id){ const el=document.getElementById(id); if(el) el.style.display='none'; }

  function resetSelect(id){
    const tr = $(`#${id} .select-trigger`);
    if(tr){
      tr.textContent = tr.dataset.placeholder;
      tr.classList.remove('has-value');
    }
    $all(`#${id} .select-option`).forEach(o=>o.classList.remove('selected'));
  }

  function populate(id, options){
    const dd = $(`#${id} .select-dropdown`);
    if(!dd) return;
    dd.innerHTML='';
    Object.entries(options).forEach(([value,label])=>{
      const div=document.createElement('div');
      div.className='select-option';
      div.dataset.value=value;
      div.textContent=label;
      div.addEventListener('click',(e)=>{
        e.stopPropagation();
        handleSelect(id,value,label);
      });
      dd.appendChild(div);
    });
  }

  // ===========================
  // State
  // ===========================
  let state = {
    instrument:null,
    module:null,
    env:null,
    range:null,
    cond2:[],
    img:null
  };

  // ===========================
  // Select routing
  // ===========================
  function handleSelect(selectId,value,label){
    const tr=$(`#${selectId} .select-trigger`);
    const dd=$(`#${selectId} .select-dropdown`);
    if(!tr||!dd) return;

    tr.textContent=label;
    tr.classList.add('has-value');
    tr.classList.remove('active');
    dd.classList.remove('active');

    $all(`#${selectId} .select-option`).forEach(o=>o.classList.remove('selected'));
    $(`#${selectId} .select-option[data-value="${value}"]`)?.classList.add('selected');

    if(selectId==='selectInstrument') onInstrument(value);
    if(selectId==='selectModule') onModule(value);
    if(selectId==='selectEnv') onEnv(value);
    if(selectId==='selectRange') onRange(value);
  }

  function onInstrument(v){
    state.instrument=v;
    state.module=null; state.env=null; state.range=null; state.cond2=[]; state.img=null;

    hide('section-module'); hide('section-env'); hide('section-range');
    $('#section-checkboxes') && ($('#section-checkboxes').style.display='none');

    resetSelect('selectModule'); resetSelect('selectEnv'); resetSelect('selectRange');

    const inst=DATA.instruments[v];
    if(!inst || inst.modules.includes('none')) return;

    const mods={};
    inst.modules.forEach(m=>mods[m]=DATA.modules[m].name);
    populate('selectModule', mods);
    show('section-module');
  }

  function onModule(v){
    state.module=v;
    state.env=null; state.range=null; state.cond2=[]; state.img=null;

    hide('section-env'); hide('section-range');
    $('#section-checkboxes') && ($('#section-checkboxes').style.display='none');

    resetSelect('selectEnv'); resetSelect('selectRange');

    const mod=DATA.modules[v];
    const envs={};
    mod.conditions.forEach(c=>envs[c]=DATA.conditions[c]);
    populate('selectEnv', envs);
    show('section-env');
  }

  function onEnv(v){
    state.env=v;
    state.range=null; state.cond2=[]; state.img=null;

    hide('section-range');
    $('#section-checkboxes') && ($('#section-checkboxes').style.display='none');

    resetSelect('selectRange');

    const mod=DATA.modules[state.module];
    if(mod.sensors.includes('none')){
      buildCond2();
      buildImaging();
      $('#section-checkboxes').style.display='block';
      return;
    }

    const ranges={};
    mod.sensors.forEach(s=>ranges[s]=DATA.sensors[s]);
    populate('selectRange', ranges);
    show('section-range');
  }

  function onRange(v){
    state.range=v;
    state.cond2=[]; state.img=null;
    buildCond2();
    buildImaging();
    $('#section-checkboxes').style.display='block';
  }

  // ===========================
  // Cond2 + Imaging
  // ===========================
  function buildCond2(){
    const grid=$('#cond2Grid');
    if(!grid) return;
    grid.innerHTML='';

    const opts={...DATA.condition2};
    delete opts[state.env];
    if(state.module!=='reci') delete opts.lvdt;

    Object.entries(opts).forEach(([value,label])=>{
      const item=document.createElement('div'); item.className='checkbox-item';
      const cb=document.createElement('input');
      cb.type='checkbox'; cb.id=`cond2_${value}`; cb.value=value;
      cb.addEventListener('change',()=>{
        if(cb.checked){
          if(!state.cond2.includes(value)) state.cond2.push(value);
        } else state.cond2 = state.cond2.filter(x=>x!==value);
      });
      const lab=document.createElement('label');
      lab.htmlFor=`cond2_${value}`; lab.textContent=label;
      item.appendChild(cb); item.appendChild(lab);
      grid.appendChild(item);
    });
  }

  function buildImaging(){
    const grid=$('#imgGrid');
    const wrap=$('#imgWrap');
    if(!grid||!wrap) return;

    if(!state.instrument){ wrap.style.display='none'; return; }

    const inst=DATA.instruments[state.instrument];
    const opts=[];
    if(inst.modules.includes('lamb')) opts.push({v:'lamb',l:'Lambda Imaging Head'});
    if(inst.modules.includes('sigm')) opts.push({v:'sigm',l:'Sigma Imaging Head'});
    if(inst.modules.includes('delt')) opts.push({v:'delt',l:'Delta Imaging Head'});

    if(!opts.length){ wrap.style.display='none'; return; }

    grid.innerHTML='';
    opts.forEach(({v,l})=>{
      const item=document.createElement('div'); item.className='checkbox-item';
      const cb=document.createElement('input');
      cb.type='checkbox'; cb.id=`img_${v}`; cb.value=v;
      cb.addEventListener('change',()=>{
        if(cb.checked){
          $all('#imgGrid input[type="checkbox"]').forEach(x=>{ if(x!==cb) x.checked=false; });
          state.img=v;
        } else state.img=null;
      });
      const lab=document.createElement('label');
      lab.htmlFor=`img_${v}`; lab.textContent=l;
      item.appendChild(cb); item.appendChild(lab);
      grid.appendChild(item);
    });

    wrap.style.display='block';
  }

  // ===========================
  // Modal HTML + init
  // ===========================
  function buildModal(){
    const navbar = document.querySelector('.navbar.bullet-navbar');
    if(!navbar) return;

    if(!navbar.querySelector('.configure-button')){
      const b=document.createElement('button');
      b.className='configure-button';
      b.textContent='Configure';
      navbar.appendChild(b);
    }

    if($('#bulletModal')) return;

    const modal=document.createElement('div');
    modal.id='bulletModal';
    modal.className='configure-modal';
    modal.innerHTML=`
      <button class="configure-close-button">×</button>
      <h3 class="configure-modal-title">Configure your manual</h3>

      <div class="configure-form-paragraph">
        My instrument is a
        <div class="custom-select" id="selectInstrument">
          <div class="select-trigger" data-placeholder="choose instrument">choose instrument</div>
          <div class="select-dropdown">
            ${Object.entries(DATA.instruments).map(([k,v])=>`<div class="select-option" data-value="${k}">${v.name}</div>`).join('')}
          </div>
        </div>.

        <span class="form-section" id="section-module" style="display:none;">
          <span class="form-line-break"></span>I would like to use my
          <div class="custom-select" id="selectModule">
            <div class="select-trigger" data-placeholder="module">module</div>
            <div class="select-dropdown"></div>
          </div> module
        </span>

        <span class="form-section" id="section-env" style="display:none;">
          to conduct a
          <div class="custom-select" id="selectEnv">
            <div class="select-trigger" data-placeholder="test type">test type</div>
            <div class="select-dropdown"></div>
          </div> test.
        </span>

        <span class="form-section" id="section-range" style="display:none;">
          <span class="form-line-break"></span>I will be using a
          <div class="custom-select" id="selectRange">
            <div class="select-trigger" data-placeholder="sensor">sensor</div>
            <div class="select-dropdown"></div>
          </div> sensor.
        </span>
      </div>

      <div id="section-checkboxes" style="display:none;">
        <div class="configure-form-paragraph" style="margin-top:20px;margin-bottom:5px;">
          I am interested in the following additional conditions:
        </div>

        <div class="checkboxes-section">
          <div class="checkbox-subtitle">Conditions</div>
          <div class="checkbox-grid" id="cond2Grid"></div>

          <div id="imgWrap" style="display:none;">
            <div class="checkbox-subtitle" style="margin-top:20px;">Imaging</div>
            <div class="checkbox-grid" id="imgGrid"></div>
          </div>
        </div>
      </div>

      <div class="configure-actions">
        <button class="configure-reset-button">Reset All</button>
        <button class="configure-apply-button">Apply Configuration</button>
      </div>
    `;

    navbar.parentElement.insertBefore(modal, navbar.nextSibling);

    // dropdown behavior
    $all('.custom-select', modal).forEach(sel=>{
      const tr=$('.select-trigger', sel);
      const dd=$('.select-dropdown', sel);
      tr.addEventListener('click',(e)=>{
        e.stopPropagation();
        dd.classList.toggle('active');
        tr.classList.toggle('active');
      });
    });

    // outside click closes dropdowns
    document.addEventListener('click', ()=>{
      $all('.select-dropdown.active', modal).forEach(dd=>{
        dd.classList.remove('active');
        dd.previousElementSibling?.classList.remove('active');
      });
    });

    // instrument listeners
    $all('#selectInstrument .select-option', modal).forEach(opt=>{
      opt.addEventListener('click',(e)=>{
        e.stopPropagation();
        handleSelect('selectInstrument', opt.dataset.value, opt.textContent);
      });
    });

    // open modal
    navbar.querySelector('.configure-button').addEventListener('click',(e)=>{
      e.stopPropagation();
      modal.classList.toggle('active');
      if(modal.classList.contains('active')) loadExistingConfig();
    });

    // close modal
    $('.configure-close-button', modal).addEventListener('click',()=>modal.classList.remove('active'));

    document.addEventListener('click',(e)=>{
      if(!modal.contains(e.target) && !navbar.querySelector('.configure-button').contains(e.target)){
        modal.classList.remove('active');
      }
    });

    // apply
    $('.configure-apply-button', modal).addEventListener('click', ()=>{
      const p = {};
      if(state.instrument) p.model = state.instrument;
      if(state.module) p.module = state.module;
      if(state.env) p.env = state.env;

      if(state.range){
        const cfg = DATA.sensorCodes[state.range];
        if(cfg?.sensor) p.sensor = cfg.sensor;
        if(cfg?.range) p.range = cfg.range;
      }

      if(state.cond2.length) p.cond = state.cond2.join(',');
      if(state.img) p.img = state.img;

      setParams(p);
      location.href = location.pathname + '?' + new URLSearchParams(getParams()).toString();
    });

    // reset
    $('.configure-reset-button', modal).addEventListener('click', ()=>{
      state = { instrument:null,module:null,env:null,range:null,cond2:[],img:null };
      setParams({});
      $all('.select-trigger', modal).forEach(tr=>{
        tr.textContent = tr.dataset.placeholder;
        tr.classList.remove('has-value');
      });
      $all('input[type="checkbox"]', modal).forEach(cb=>cb.checked=false);
      hide('section-module'); hide('section-env'); hide('section-range');
      $('#section-checkboxes').style.display='none';
    });

    loadExistingConfig();
  }

  function loadExistingConfig(){
    const p=getParams();
    state.instrument = p.model || null;
    state.module = p.module || null;
    state.env = p.env || null;
    state.range = p.range || null;
    state.cond2 = p.cond ? p.cond.split(',') : [];
    state.img = p.img || null;

    if(state.instrument) handleSelect('selectInstrument', state.instrument, DATA.instruments[state.instrument]?.name || state.instrument);
    if(state.module) handleSelect('selectModule', state.module, DATA.modules[state.module]?.name || state.module);
    if(state.env) handleSelect('selectEnv', state.env, DATA.conditions[state.env] || state.env);
    if(state.range) handleSelect('selectRange', state.range, DATA.sensors[state.range] || state.range);

    $all('#cond2Grid input[type="checkbox"]').forEach(cb=>cb.checked = state.cond2.includes(cb.value));
    $all('#imgGrid input[type="checkbox"]').forEach(cb=>cb.checked = state.img === cb.value);
  }

  // init when DOM ready
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', buildModal);
  } else {
    buildModal();
  }

})();
