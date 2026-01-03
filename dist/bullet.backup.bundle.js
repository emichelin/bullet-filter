(function(){
  "use strict";

  // ============================================================================
  // 0) MODAL DATA (COMPLET)
  // ============================================================================
  window.MODAL_DATA = {
    instruments: {
      up2: { name: 'UP-2000', modules: ['sigm','delt'] },
      up3: { name: 'UP-3000', modules: ['lamb','sigm','delt'] },
      up5: { name: 'UP-5000', modules: ['lamb','sigm','delt'] },
      mft2:{ name: 'MFT-2000', modules: ['stat','rota','reci','lamb','sigm','delt'] },
      mft5:{ name: 'MFT-5000', modules: ['stat','rota','reci','bor','scra','urota','vcoil','mtm','lamb','sigm','delt'] },
      smt2:{ name: 'SMT-2000', modules: ['stat'] },
      smt5:{ name: 'SMT-5000', modules: ['stat'] },
      ust2:{ name: 'UST-2', modules: ['stat'] },
      fftm:{ name: 'FFT-M', modules: ['vcoil'] },
      fft1:{ name: 'FFT-1', modules: ['vcoil'] },
      fft2:{ name: 'FFT-2', modules: ['vcoil'] },
      aj1:{ name: 'AJ-1000', modules: ['none'] },
      trt1:{ name: 'TRT-1000', modules: ['none'] },
      mvt2:{ name: 'MVT-2', modules: ['none'] }
    },
    modules: {
      stat:{ name:'Stationary', conditions:['liq','dry'], sensors:['ull','ll','ml','hl','FzFx','Fz','nano','micro','stch'] },
      rota:{ name:'Rotary', conditions:['brk','liq','heat','cool','humid','ev','dry'], sensors:['ull','ll','ml','hl','FzFx','FzTq'] },
      reci:{ name:'Reciprocating', conditions:['srv','liq','heat','cool','humid','ev','tcorr','dry'], sensors:['ull','ll','ml','hl','FzFx','Fzp','Fz'] },
      bor: { name:'Block-On-Ring', conditions:['cut','grs','liq','heat','cool','humid','ev','dry'], sensors:['ml','hl','FzFx'] },
      scra:{ name:'Scratch', conditions:['dry'], sensors:['ml','hl'] },
      urota:{ name:'Upper Rotary', conditions:['tap','4ball','heat','cool','ev','dry'], sensors:['none'] },
      vcoil:{ name:'VoiceCoil', conditions:['heat','ev','dry'], sensors:['none'] },
      mtm:{ name:'Mini Traction', conditions:['liq','heat','ev','dry'], sensors:['ml'] },
      lamb:{ name:'Lambda Imaging', conditions:['bfdf','cfc','wli'], sensors:['none'] },
      sigm:{ name:'Sigma Imaging', conditions:['bfdf','wli'], sensors:['none'] },
      delt:{ name:'Delta Imaging', conditions:['bfdf'], sensors:['none'] },
      none:{ name:'None', conditions:[], sensors:[] }
    },
    conditions: {
      srv:'SRV',
      tap:'Tapping Torque',
      '4ball':'4-ball',
      brk:'Brake',
      cut:'Cutting',
      grs:'Grease Test',
      liq:'Liquid',
      heat:'Heated',
      cool:'Cooled',
      humid:'Humidity',
      ev:'Electrified',
      tcorr:'Tribocorrosion',
      dry:'Dry',
      bfdf:'Bright Field Dark Field',
      cfc:'Confocal',
      wli:'White Light'
    },
    sensors: {
      ull:'Ultra Low-Load Argon',
      ll:'Low Load Argon',
      ml:'Medium Load Argon',
      hl:'High Load Argon',
      FzFx:'Fz+Fx',
      Fzp:'Fz+piezo',
      Fz:'Fz',
      FzTq:'Fz+Torque',
      nano:'Nano-Indentation',
      micro:'Micro-Indentation',
      stch:'Scratch',
      none:'None'
    },
    sensorCodes: {
      ull:{ sensor:'2d', range:'ull' },
      ll:{ sensor:'2d', range:'ll' },
      ml:{ sensor:'2d', range:'ml' },
      hl:{ sensor:'2d', range:'hl' },
      FzFx:{ sensor:'1d1d', range:null },
      Fzp:{ sensor:'fzpz', range:null },
      Fz:{ sensor:'fz', range:null },
      FzTq:{ sensor:'fztq', range:null },
      nano:{ sensor:'nano', range:null },
      micro:{ sensor:'micro', range:null },
      stch:{ sensor:'stch', range:null },
      none:{ sensor:null, range:null }
    },
    condition2: {
      lvdt:'LVDT',
      liq:'Liquid',
      ev:'Electrified',
      heat:'Heated',
      cool:'Cooled',
      humid:'Humidity'
    }
  };

  // ============================================================================
  // 1) CONFIG
  // ============================================================================
  window.BulletConfig = {
    PARAM_KEYS: ['model','module','sensor','range','env','cond','opt','other','img'],
    STORAGE_PREFIX: 'bullet_',
    EVENTS: {
      PARAMS_CHANGED: 'bullet:paramsChanged',
      FILTER_CHANGED: 'bullet:filterChanged'
    },
    SELECTORS: {
      navbar: '.navbar.bullet-navbar',
      headings: '.notion-h, h1, h2, h3, h4, h5, h6',
      calloutGray: '.notion-callout .notion-gray',
      tocHeadings: '.notion-h1, .notion-h2, .notion-h3, h1, h2, h3, details summary'
    }
  };

  // ============================================================================
  // 2) EVENT BUS
  // ============================================================================
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

  // ============================================================================
  // 3) PARAMS (URL + sessionStorage)
  // ============================================================================
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

  // ============================================================================
  // 4) MODAL (COMPLET)
  // ============================================================================
  (function(){
    const CFG = window.BulletConfig;
    const BUS = window.BulletBus;
    const PARAMS = window.BulletParams;
    const DATA = window.MODAL_DATA;

    function $(sel, ctx=document){ return ctx.querySelector(sel); }
    function $all(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }

    let modalState = {
      instrument: null,
      module: null,
      condition1: null,
      sensor: null,
      condition2: [],
      imaging: null
    };

    function showSection(id){
      const el = document.getElementById(id);
      if(el) el.style.display='inline';
    }
    function hideSection(id){
      const el = document.getElementById(id);
      if(el) el.style.display='none';
    }
    function resetTrigger(selectId){
      const trigger = document.querySelector(`#${selectId} .select-trigger`);
      if(trigger){
        trigger.textContent = trigger.dataset.placeholder;
        trigger.classList.remove('has-value');
      }
      document.querySelectorAll(`#${selectId} .select-option`).forEach(o=>o.classList.remove('selected'));
    }

    function populateDropdown(selectId, options){
      const dropdown = document.querySelector(`#${selectId} .select-dropdown`);
      if(!dropdown) return;

      dropdown.innerHTML='';
      Object.entries(options).forEach(([value,label])=>{
        const option = document.createElement('div');
        option.className='select-option';
        option.dataset.value=value;
        option.textContent=label;
        option.addEventListener('click',(e)=>{
          e.stopPropagation();
          handleSelect(selectId, value, label);
        });
        dropdown.appendChild(option);
      });
    }

    function handleSelect(selectId, value, label){
      const trigger = document.querySelector(`#${selectId} .select-trigger`);
      const dropdown = document.querySelector(`#${selectId} .select-dropdown`);
      if(!trigger || !dropdown) return;

      trigger.textContent=label;
      trigger.classList.add('has-value');
      dropdown.classList.remove('active');
      trigger.classList.remove('active');

      document.querySelectorAll(`#${selectId} .select-option`).forEach(o=>o.classList.remove('selected'));
      document.querySelector(`#${selectId} .select-option[data-value="${value}"]`)?.classList.add('selected');

      if(selectId==='selectInstrument') handleInstrumentSelect(value);
      else if(selectId==='selectModule') handleModuleSelect(value);
      else if(selectId==='selectCondition1') handleCondition1Select(value);
      else if(selectId==='selectSensor') handleSensorSelect(value);
    }

    function handleInstrumentSelect(value){
      modalState.instrument=value;
      modalState.module=null;
      modalState.condition1=null;
      modalState.sensor=null;
      modalState.condition2=[];
      modalState.imaging=null;

      ['section-module','section-condition1','section-sensor'].forEach(hideSection);
      document.getElementById('section-checkboxes-wrapper').style.display='none';

      resetTrigger('selectModule');
      resetTrigger('selectCondition1');
      resetTrigger('selectSensor');

      const instrumentData = DATA.instruments[value];
      if(!instrumentData || instrumentData.modules.includes('none')) return;

      const availableModules = {};
      instrumentData.modules.forEach(mod=>{
        availableModules[mod]=DATA.modules[mod].name;
      });

      populateDropdown('selectModule', availableModules);
      showSection('section-module');
    }

    function handleModuleSelect(value){
      modalState.module=value;
      modalState.condition1=null;
      modalState.sensor=null;
      modalState.condition2=[];
      modalState.imaging=null;

      ['section-condition1','section-sensor'].forEach(hideSection);
      document.getElementById('section-checkboxes-wrapper').style.display='none';

      resetTrigger('selectCondition1');
      resetTrigger('selectSensor');

      const moduleData = DATA.modules[value];
      const availableConditions = {};
      moduleData.conditions.forEach(cond=>{
        availableConditions[cond]=DATA.conditions[cond];
      });

      populateDropdown('selectCondition1', availableConditions);
      showSection('section-condition1');
    }

    function handleCondition1Select(value){
      modalState.condition1=value;
      modalState.sensor=null;
      modalState.condition2=[];
      modalState.imaging=null;

      hideSection('section-sensor');
      document.getElementById('section-checkboxes-wrapper').style.display='none';
      resetTrigger('selectSensor');

      const moduleData = DATA.modules[modalState.module];

      if(moduleData.sensors.includes('none')){
        updateCheckboxes();
        document.getElementById('section-checkboxes-wrapper').style.display='block';
        updateImagingSection();
        return;
      }

      const availableSensors={};
      moduleData.sensors.forEach(s=>{
        availableSensors[s]=DATA.sensors[s];
      });

      populateDropdown('selectSensor', availableSensors);
      showSection('section-sensor');
    }

    function handleSensorSelect(value){
      modalState.sensor=value;
      modalState.condition2=[];
      modalState.imaging=null;

      updateCheckboxes();
      document.getElementById('section-checkboxes-wrapper').style.display='block';
      updateImagingSection();
    }

    function updateImagingSection(){
      const imagingSubsection=document.getElementById('imaging-subsection');
      const imagingGrid=document.getElementById('imagingGrid');

      if(!modalState.instrument){ imagingSubsection.style.display='none'; return; }
      const instrumentData = DATA.instruments[modalState.instrument];

      const opts=[];
      if(instrumentData.modules.includes('lamb')) opts.push({value:'lamb',label:'Lambda Imaging Head'});
      if(instrumentData.modules.includes('sigm')) opts.push({value:'sigm',label:'Sigma Imaging Head'});
      if(instrumentData.modules.includes('delt')) opts.push({value:'delt',label:'Delta Imaging Head'});

      if(!opts.length){ imagingSubsection.style.display='none'; return; }

      imagingGrid.innerHTML='';
      opts.forEach(({value,label})=>{
        const item=document.createElement('div');
        item.className='checkbox-item';

        const cb=document.createElement('input');
        cb.type='checkbox';
        cb.id=`img_${value}`;
        cb.value=value;
        cb.addEventListener('change',(e)=>{
          if(e.target.checked){
            document.querySelectorAll('#imagingGrid input[type="checkbox"]').forEach(x=>{ if(x!==cb) x.checked=false; });
            modalState.imaging=value;
          } else modalState.imaging=null;
        });

        const lab=document.createElement('label');
        lab.htmlFor=`img_${value}`;
        lab.textContent=label;

        item.appendChild(cb);
        item.appendChild(lab);
        imagingGrid.appendChild(item);
      });

      imagingSubsection.style.display='block';
    }

    function updateCheckboxes(){
      const grid=document.getElementById('checkboxGrid');
      grid.innerHTML='';

      const options={...DATA.condition2};
      delete options[modalState.condition1];
      if(modalState.module !== 'reci') delete options.lvdt;

      Object.entries(options).forEach(([value,label])=>{
        const item=document.createElement('div');
        item.className='checkbox-item';

        const cb=document.createElement('input');
        cb.type='checkbox';
        cb.id=`cond2_${value}`;
        cb.value=value;
        cb.addEventListener('change',()=>{
          if(cb.checked){
            if(!modalState.condition2.includes(value)) modalState.condition2.push(value);
          } else modalState.condition2 = modalState.condition2.filter(v=>v!==value);
        });

        const lab=document.createElement('label');
        lab.htmlFor=`cond2_${value}`;
        lab.textContent=label;

        item.appendChild(cb);
        item.appendChild(lab);
        grid.appendChild(item);
      });
    }

    function initCustomSelects(modal){
      const selects = modal.querySelectorAll('.custom-select');
      selects.forEach(selectEl=>{
        const trigger = selectEl.querySelector('.select-trigger');
        const dropdown = selectEl.querySelector('.select-dropdown');

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

      document.addEventListener('click',()=>{
        document.querySelectorAll('.select-dropdown.active').forEach(dd=>{
          dd.classList.remove('active');
          dd.previousElementSibling.classList.remove('active');
        });
      });
    }

    function loadConfigFromParams(){
      const p = PARAMS.get();
      modalState.instrument = p.model || null;
      modalState.module = p.module || null;
      modalState.condition1 = p.env || null;
      modalState.sensor = p.range || null;
      modalState.condition2 = p.cond ? p.cond.split(',').filter(Boolean) : [];
      modalState.imaging = p.img || null;
    }

    function applyModalStateToUI(){
      if(modalState.instrument){
        handleSelect('selectInstrument', modalState.instrument, DATA.instruments[modalState.instrument]?.name || modalState.instrument);
      }
      if(modalState.module){
        handleSelect('selectModule', modalState.module, DATA.modules[modalState.module]?.name || modalState.module);
      }
      if(modalState.condition1){
        handleSelect('selectCondition1', modalState.condition1, DATA.conditions[modalState.condition1] || modalState.condition1);
      }
      if(modalState.sensor){
        handleSelect('selectSensor', modalState.sensor, DATA.sensors[modalState.sensor] || modalState.sensor);
      }

      // sync checkboxes
      requestAnimationFrame(()=>{
        document.querySelectorAll('#checkboxGrid input[type="checkbox"]').forEach(cb=>{
          cb.checked = modalState.condition2.includes(cb.value);
        });
        document.querySelectorAll('#imagingGrid input[type="checkbox"]').forEach(cb=>{
          cb.checked = modalState.imaging === cb.value;
        });
      });
    }

    function buildModal(){
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

      btn.addEventListener('click',(e)=>{
        e.stopPropagation();
        modal.classList.toggle('active');
        if(modal.classList.contains('active')){
          loadConfigFromParams();
          applyModalStateToUI();
        }
      });

      modal.querySelector('.configure-close-button').addEventListener('click',()=>modal.classList.remove('active'));

      document.addEventListener('click',(e)=>{
        if(!modal.contains(e.target) && !btn.contains(e.target)) modal.classList.remove('active');
      });

      modal.querySelector('.configure-reset-button').addEventListener('click',()=>{
        modalState = { instrument:null,module:null,condition1:null,sensor:null,condition2:[],imaging:null };
        PARAMS.clear({ replace:true });

        document.querySelectorAll('.select-trigger', modal).forEach(tr=>{
          tr.textContent = tr.dataset.placeholder;
          tr.classList.remove('has-value');
        });

        document.querySelectorAll('input[type="checkbox"]', modal).forEach(cb=>cb.checked=false);
        ['section-module','section-condition1','section-sensor'].forEach(hideSection);
        document.getElementById('section-checkboxes-wrapper').style.display='none';
      });

      modal.querySelector('.configure-apply-button').addEventListener('click',()=>{
        const params = {};
        if(modalState.instrument) params.model = modalState.instrument;
        if(modalState.module) params.module = modalState.module;
        if(modalState.condition1) params.env = modalState.condition1;

        if(modalState.sensor){
          const sc = DATA.sensorCodes[modalState.sensor];
          if(sc?.sensor) params.sensor = sc.sensor;
          if(sc?.range) params.range = sc.range;
        }

        if(modalState.condition2.length) params.cond = modalState.condition2.join(',');
        if(modalState.imaging) params.img = modalState.imaging;

        PARAMS.set(params, { replace:false });
        location.href = location.pathname + '?' + new URLSearchParams(PARAMS.get()).toString();
      });
    }

    function init(){
      buildModal();
    }

    window.BulletModal = { init };

    // run init when DOM ready
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
    else init();

  })();

  // ============================================================================
  // 5) FILTER (callouts + headings)
  // ============================================================================
  // NOTE: PART 2 continues with bullet-filter.js + toc + app, because message size limit.

})();
/* ============================================================================
   BULLET BACKUP BUNDLE — PART 2/2
   -> bullet-filter.js + bullet-toc.js + bullet-app.js
   ========================================================================== */

(function(){
  "use strict";

  const CFG = window.BulletConfig;
  const BUS = window.BulletBus;
  const PARAMS = window.BulletParams;

  // ============================================================================
  // 5) FILTER (from your Step 4 corrected version)
  // ============================================================================
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

  // ============================================================================
  // 6) TOC (ultra simple)
  // ============================================================================
  (function(){
    if(!CFG || !BUS) return;

    const TOC_ID = 'static-toc';
    const HID_CLASS = 'toc-hidden';
    let tocContainer;
    let tocEntries = [];

    function buildOnce(){
      if(document.getElementById(TOC_ID)) return;

      tocContainer = document.createElement('div');
      tocContainer.id = TOC_ID;
      tocContainer.className = 'dynamic-toc';
      tocContainer.innerHTML = '<div class="toc-title">Contents</div>';
      document.body.appendChild(tocContainer);

      const sel = CFG.SELECTORS.tocHeadings;
      document.querySelectorAll(sel).forEach((el,i)=>{
        if(!el.id) el.id = 'toc-' + i;
        const a = document.createElement('a');
        a.href = '#' + el.id;
        a.textContent = el.textContent.replace(/\{\{.*?\}\}|-o/g, '').trim();
        a.className = 'toc-item';
        tocContainer.appendChild(a);
        tocEntries.push({ linkEl:a, targetEl:el });
      });

      tocContainer.addEventListener('click', e=>{
        if(!e.target.matches('.toc-item')) return;
        const target = document.getElementById(e.target.hash.slice(1));
        const details = target?.closest('details');
        if(details && !details.open) details.open = true;
      });
    }

    function refreshTOC(){
      tocEntries.forEach(({linkEl,targetEl})=>{
        const visible = targetEl.offsetParent !== null && window.getComputedStyle(targetEl).display !== 'none';
        linkEl.classList.toggle(HID_CLASS, !visible);
      });

      const hasVisible = tocEntries.some(e => !e.linkEl.classList.contains(HID_CLASS));
      if(tocContainer) tocContainer.style.display = hasVisible ? 'block' : 'none';
    }

    window.BulletTOC = { buildOnce, refresh: refreshTOC };

    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', ()=>{
        buildOnce(); refreshTOC();
      });
    } else {
      buildOnce(); refreshTOC();
    }

    BUS.on(CFG.EVENTS.PARAMS_CHANGED, refreshTOC);
    BUS.on(CFG.EVENTS.FILTER_CHANGED, refreshTOC);
  })();

  // ============================================================================
  // 7) APP (bootstrap)
  // ============================================================================
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

})();
