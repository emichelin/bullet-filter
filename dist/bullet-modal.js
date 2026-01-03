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
