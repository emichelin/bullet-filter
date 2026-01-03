(function(){
  const CFG = window.BulletConfig;
  const BUS = window.BulletBus;
  const PARAMS = window.BulletParams;
  const DATA = window.MODAL_DATA;

  if(!CFG || !BUS || !PARAMS || !DATA) throw new Error('Modal deps missing');

  function $(sel, ctx=document){ return ctx.querySelector(sel); }
  function $all(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }

  let modalState = {
    instrument:null,
    module:null,
    condition1:null,
    sensorRange:null,
    condition2:[],
    imaging:null
  };

  function resetSelect(selectId){
    const tr = $(`#${selectId} .select-trigger`);
    if(tr){
      tr.textContent = tr.dataset.placeholder;
      tr.classList.remove('has-value');
    }
    $all(`#${selectId} .select-option`).forEach(o=>o.classList.remove('selected'));
  }

  function populate(selectId, opts){
    const dd = $(`#${selectId} .select-dropdown`);
    if(!dd) return;
    dd.innerHTML='';
    Object.entries(opts).forEach(([value,label])=>{
      const div = document.createElement('div');
      div.className='select-option';
      div.dataset.value=value;
      div.textContent=label;
      div.addEventListener('click',(e)=>{
        e.stopPropagation();
        handleSelect(selectId, value, label);
      });
      dd.appendChild(div);
    });
  }

  function show(id){
    const el = document.getElementById(id);
    if(el) el.style.display='inline';
  }

  function hide(id){
    const el = document.getElementById(id);
    if(el) el.style.display='none';
  }

  function handleSelect(selectId, value, label){
    const tr = $(`#${selectId} .select-trigger`);
    const dd = $(`#${selectId} .select-dropdown`);
    if(!tr || !dd) return;

    tr.textContent=label;
    tr.classList.add('has-value');
    tr.classList.remove('active');
    dd.classList.remove('active');

    $all(`#${selectId} .select-option`).forEach(o=>o.classList.remove('selected'));
    $(`#${selectId} .select-option[data-value="${value}"]`)?.classList.add('selected');

    if(selectId==='selectInstrument') onInstrument(value);
    if(selectId==='selectModule') onModule(value);
    if(selectId==='selectCondition1') onCondition1(value);
    if(selectId==='selectSensor') onSensorRange(value);
  }

  function onInstrument(val){
    modalState.instrument = val;
    modalState.module = null;
    modalState.condition1 = null;
    modalState.sensorRange = null;
    modalState.condition2 = [];
    modalState.imaging = null;

    ['section-module','section-condition1','section-sensor'].forEach(hide);
    $('#section-checkboxes-wrapper').style.display='none';

    resetSelect('selectModule');
    resetSelect('selectCondition1');
    resetSelect('selectSensor');

    const inst = DATA.instruments[val];
    if(!inst || inst.modules.includes('none')) return;

    const mods = {};
    inst.modules.forEach(m=>mods[m]=DATA.modules[m].name);
    populate('selectModule', mods);
    show('section-module');
  }

  function onModule(val){
    modalState.module = val;
    modalState.condition1 = null;
    modalState.sensorRange = null;
    modalState.condition2 = [];
    modalState.imaging = null;

    ['section-condition1','section-sensor'].forEach(hide);
    $('#section-checkboxes-wrapper').style.display='none';

    resetSelect('selectCondition1');
    resetSelect('selectSensor');

    const mod = DATA.modules[val];
    const conds = {};
    mod.conditions.forEach(c=>conds[c]=DATA.conditions[c]);
    populate('selectCondition1', conds);
    show('section-condition1');
  }

  function onCondition1(val){
    modalState.condition1 = val;
    modalState.sensorRange = null;
    modalState.condition2 = [];
    modalState.imaging = null;

    hide('section-sensor');
    $('#section-checkboxes-wrapper').style.display='none';
    resetSelect('selectSensor');

    const mod = DATA.modules[modalState.module];
    if(mod.sensors.includes('none')){
      updateCond2();
      $('#section-checkboxes-wrapper').style.display='block';
      updateImaging();
      return;
    }

    const sensors = {};
    mod.sensors.forEach(s=>sensors[s]=DATA.sensors[s]);
    populate('selectSensor', sensors);
    show('section-sensor');
  }

  function onSensorRange(val){
    modalState.sensorRange = val;
    modalState.condition2 = [];
    modalState.imaging = null;
    updateCond2();
    $('#section-checkboxes-wrapper').style.display='block';
    updateImaging();
  }

  function updateCond2(){
    const grid = $('#checkboxGrid');
    grid.innerHTML='';

    const opts = { ...DATA.condition2 };
    delete opts[modalState.condition1];
    if(modalState.module !== 'reci') delete opts.lvdt;

    Object.entries(opts).forEach(([value,label])=>{
      const item=document.createElement('div');
      item.className='checkbox-item';

      const cb=document.createElement('input');
      cb.type='checkbox';
      cb.id=`cond2_${value}`;
      cb.value=value;
      cb.addEventListener('change',()=>{
        if(cb.checked){
          if(!modalState.condition2.includes(value)) modalState.condition2.push(value);
        } else {
          modalState.condition2 = modalState.condition2.filter(v=>v!==value);
        }
      });

      const lab=document.createElement('label');
      lab.htmlFor=`cond2_${value}`;
      lab.textContent=label;

      item.appendChild(cb);
      item.appendChild(lab);
      grid.appendChild(item);
    });
  }

  function updateImaging(){
    const sub = $('#imaging-subsection');
    const grid = $('#imagingGrid');

    if(!modalState.instrument){ sub.style.display='none'; return; }

    const inst = DATA.instruments[modalState.instrument];
    const opts=[];
    if(inst.modules.includes('lamb')) opts.push({value:'lamb', label:'Lambda Imaging Head'});
    if(inst.modules.includes('sigm')) opts.push({value:'sigm', label:'Sigma Imaging Head'});
    if(inst.modules.includes('delt')) opts.push({value:'delt', label:'Delta Imaging Head'});

    if(!opts.length){ sub.style.display='none'; return; }

    grid.innerHTML='';
    opts.forEach(({value,label})=>{
      const item=document.createElement('div');
      item.className='checkbox-item';

      const cb=document.createElement('input');
      cb.type='checkbox';
      cb.id=`img_${value}`;
      cb.value=value;
      cb.addEventListener('change',()=>{
        if(cb.checked){
          $all('#imagingGrid input[type="checkbox"]').forEach(x=>{ if(x!==cb) x.checked=false; });
          modalState.imaging=value;
        } else modalState.imaging=null;
      });

      const lab=document.createElement('label');
      lab.htmlFor=`img_${value}`;
      lab.textContent=label;

      item.appendChild(cb); item.appendChild(lab);
      grid.appendChild(item);
    });

    sub.style.display='block';
  }

  function applyFromParams(){
    const p = PARAMS.get();
    modalState.instrument = p.model || null;
    modalState.module = p.module || null;
    modalState.condition1 = p.env || null;
    modalState.sensorRange = p.range || null;
    modalState.condition2 = p.cond ? p.cond.split(',') : [];
    modalState.imaging = p.img || null;

    if(modalState.instrument) handleSelect('selectInstrument', modalState.instrument, DATA.instruments[modalState.instrument]?.name || modalState.instrument);
    if(modalState.module) handleSelect('selectModule', modalState.module, DATA.modules[modalState.module]?.name || modalState.module);
    if(modalState.condition1) handleSelect('selectCondition1', modalState.condition1, DATA.conditions[modalState.condition1] || modalState.condition1);
    if(modalState.sensorRange) handleSelect('selectSensor', modalState.sensorRange, DATA.sensors[modalState.sensorRange] || modalState.sensorRange);

    // checkboxes sync
    $all('#checkboxGrid input[type="checkbox"]').forEach(cb=>cb.checked = modalState.condition2.includes(cb.value));
    $all('#imagingGrid input[type="checkbox"]').forEach(cb=>cb.checked = modalState.imaging === cb.value);
  }

  function initCustomSelects(modal){
    $all('.custom-select', modal).forEach(selectEl=>{
      const trigger = $('.select-trigger', selectEl);
      const dropdown = $('.select-dropdown', selectEl);

      trigger.addEventListener('click',(e)=>{
        e.stopPropagation();
        document.querySelectorAll('.select-dropdown.active').forEach(dd=>{
          if(dd!==dropdown){
            dd.classList.remove('active');
            dd.previousElementSibling.classList.remove('active');
          }
        });
        dropdown.classList.toggle('active');
        trigger.classList.toggle('active');
      });
    });

    document.addEventListener('click', ()=>{
      document.querySelectorAll('.select-dropdown.active').forEach(dd=>{
        dd.classList.remove('active');
        dd.previousElementSibling.classList.remove('active');
      });
    });
  }

  function init(){
    const navbar = document.querySelector(CFG.SELECTORS.navbar);
    const btn = navbar?.querySelector('.configure-button');
    if(!btn) return;

    if(document.getElementById('configModal')) return;

    const modal = document.createElement('div');
    modal.className='configure-modal';
    modal.id='configModal';

    modal.innerHTML = `
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

        <span class="form-section" id="section-condition1" style="display:none;">
          to conduct a
          <div class="custom-select" id="selectCondition1">
            <div class="select-trigger" data-placeholder="test type">test type</div>
            <div class="select-dropdown"></div>
          </div> test.
        </span>

        <span class="form-section" id="section-sensor" style="display:none;">
          <span class="form-line-break"></span>I will be using a
          <div class="custom-select" id="selectSensor">
            <div class="select-trigger" data-placeholder="sensor">sensor</div>
            <div class="select-dropdown"></div>
          </div> sensor.
        </span>
      </div>

      <div id="section-checkboxes-wrapper" style="display:none;">
        <div class="configure-form-paragraph" style="margin-top:20px;margin-bottom:5px;">
          I am interested in the following additional conditions:
        </div>

        <div class="checkboxes-section">
          <div class="checkbox-subtitle">Conditions</div>
          <div class="checkbox-grid" id="checkboxGrid"></div>

          <div id="imaging-subsection" style="display:none;">
            <div class="checkbox-subtitle" style="margin-top:20px;">Imaging</div>
            <div class="checkbox-grid" id="imagingGrid"></div>
          </div>
        </div>
      </div>

      <div class="configure-actions">
        <button class="configure-reset-button">Reset All</button>
        <button class="configure-apply-button">Apply Configuration</button>
      </div>
    `;

    navbar.parentElement.insertBefore(modal, navbar.nextSibling);

    initCustomSelects(modal);

    // instrument click listeners
    $all('#selectInstrument .select-option', modal).forEach(opt=>{
      opt.addEventListener('click',(e)=>{
        e.stopPropagation();
        handleSelect('selectInstrument', opt.dataset.value, opt.textContent);
      });
    });

    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      modal.classList.toggle('active');
      if(modal.classList.contains('active')) applyFromParams();
    });

    $('.configure-close-button', modal).addEventListener('click', ()=>modal.classList.remove('active'));

    document.addEventListener('click',(e)=>{
      if(!modal.contains(e.target) && !btn.contains(e.target)) modal.classList.remove('active');
    });

    $('.configure-apply-button', modal).addEventListener('click', ()=>{
      const p = {};
      if(modalState.instrument) p.model = modalState.instrument;
      if(modalState.module) p.module = modalState.module;
      if(modalState.condition1) p.env = modalState.condition1;

      if(modalState.sensorRange){
        const cfg = DATA.sensorCodes[modalState.sensorRange];
        if(cfg?.sensor) p.sensor = cfg.sensor;
        if(cfg?.range) p.range = cfg.range;
      }

      if(modalState.condition2.length) p.cond = modalState.condition2.join(',');
      if(modalState.imaging) p.img = modalState.imaging;

      PARAMS.set(p, { replace:false });
      location.href = location.pathname + '?' + new URLSearchParams(PARAMS.get()).toString();
    });

    $('.configure-reset-button', modal).addEventListener('click', ()=>{
      modalState = { instrument:null,module:null,condition1:null,sensorRange:null,condition2:[],imaging:null };
      PARAMS.clear({ replace:true });

      $all('.select-trigger', modal).forEach(tr=>{
        tr.textContent = tr.dataset.placeholder;
        tr.classList.remove('has-value');
      });

      $all('input[type="checkbox"]', modal).forEach(cb=>cb.checked=false);
      ['section-module','section-condition1','section-sensor'].forEach(hide);
      $('#section-checkboxes-wrapper').style.display='none';
    });

    applyFromParams();
  }

  window.BulletModal = { init, applyFromParams };

  BUS.on(CFG.EVENTS.PARAMS_CHANGED, ()=>{
    const modal = document.getElementById('configModal');
    if(modal && modal.classList.contains('active')) applyFromParams();
  });

})();
