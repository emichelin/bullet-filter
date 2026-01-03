(function(){
  "use strict";

  const Core = window.BulletCore;
  const CFG  = window.BulletCFG;
  const DATA = window.MODAL_DATA;

  if(!Core || !CFG || !DATA){
    console.error("[BulletModal] missing deps: BulletCore/BulletCFG/MODAL_DATA");
    return;
  }

  // ============================================================================
  // 0) TEMPLATE (same HTML / same classes)
  // ============================================================================
  const TEMPLATE = () => `
    <button class="configure-close-button">×</button>
    <h3 class="configure-modal-title">Configure your manual</h3>

    <div class="configure-form-paragraph">
      My instrument is a
      <div class="custom-select" id="selectInstrument">
        <div class="select-trigger" data-placeholder="choose instrument">choose instrument</div>
        <div class="select-dropdown">
          ${Object.entries(DATA.instruments).map(([id, inst]) =>
            `<div class="select-option" data-value="${id}">${inst.name}</div>`
          ).join("")}
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

  // ============================================================================
  // 1) STATE
  // ============================================================================
  const S = {
    instrument: null,
    module: null,
    condition1: null,
    sensor: null,       // "ull", "ml", "FzFx" ...
    condition2: [],
    imaging: null
  };

  // ============================================================================
  // 2) UI CACHE
  // ============================================================================
  const UI = {
    navbar: null,
    button: null,
    modal: null,

    sectionModule: null,
    sectionCondition1: null,
    sectionSensor: null,
    wrapperCheckboxes: null,

    checkboxGrid: null,
    imagingSection: null,
    imagingGrid: null
  };

  // ============================================================================
  // 3) SMALL HELPERS (UI)
  // ============================================================================
  const Ui = {
    showInline: (el)=> el && (el.style.display = "inline"),
    showBlock:  (el)=> el && (el.style.display = "block"),
    hide:       (el)=> el && (el.style.display = "none"),

    closeDropdowns(){
      Core.$$(".select-dropdown.active", UI.modal).forEach(dd=>{
        dd.classList.remove("active");
        dd.previousElementSibling?.classList.remove("active");
      });
    },

    setTrigger(selectId, label){
      const trigger = Core.$(`#${selectId} .select-trigger`, UI.modal);
      if(!trigger) return;
      trigger.textContent = label || trigger.dataset.placeholder;
      trigger.classList.toggle("has-value", !!label);
    },

    clearSelected(selectId){
      Core.$$(`#${selectId} .select-option`, UI.modal).forEach(opt=>opt.classList.remove("selected"));
    },

    markSelected(selectId, value){
      Ui.clearSelected(selectId);
      const opt = Core.$(`#${selectId} .select-option[data-value="${value}"]`, UI.modal);
      if(opt) opt.classList.add("selected");
    },

    populate(selectId, options){
      const dropdown = Core.$(`#${selectId} .select-dropdown`, UI.modal);
      if(!dropdown) return;
      dropdown.innerHTML = "";

      Object.entries(options).forEach(([value,label])=>{
        const opt = Core.create("div", { class:"select-option", "data-value": value }, [label]);
        opt.addEventListener("click",(e)=>{
          e.stopPropagation();
          Actions.select(selectId, value);
        });
        dropdown.appendChild(opt);
      });
    }
  };

  // ============================================================================
  // 4) RESET LEVELS (clear dependent selections)
  // ============================================================================
  function reset(level){
    if(level === "instrument"){
      S.module = null;
      S.condition1 = null;
      S.sensor = null;
      S.condition2 = [];
      S.imaging = null;

      Ui.hide(UI.sectionModule);
      Ui.hide(UI.sectionCondition1);
      Ui.hide(UI.sectionSensor);
      Ui.hide(UI.wrapperCheckboxes);

      Ui.setTrigger("selectModule", null);
      Ui.setTrigger("selectCondition1", null);
      Ui.setTrigger("selectSensor", null);

      Ui.clearSelected("selectModule");
      Ui.clearSelected("selectCondition1");
      Ui.clearSelected("selectSensor");
      return;
    }

    if(level === "module"){
      S.condition1 = null;
      S.sensor = null;
      S.condition2 = [];
      S.imaging = null;

      Ui.hide(UI.sectionCondition1);
      Ui.hide(UI.sectionSensor);
      Ui.hide(UI.wrapperCheckboxes);

      Ui.setTrigger("selectCondition1", null);
      Ui.setTrigger("selectSensor", null);

      Ui.clearSelected("selectCondition1");
      Ui.clearSelected("selectSensor");
      return;
    }

    if(level === "condition1"){
      S.sensor = null;
      S.condition2 = [];
      S.imaging = null;

      Ui.hide(UI.sectionSensor);
      Ui.hide(UI.wrapperCheckboxes);

      Ui.setTrigger("selectSensor", null);
      Ui.clearSelected("selectSensor");
    }
  }

  // ============================================================================
  // 5) RENDER CHECKBOXES
  // ============================================================================
  function renderCondition2(){
    UI.checkboxGrid.innerHTML = "";

    const options = { ...DATA.condition2 };
    delete options[S.condition1];
    if(S.module !== "reci") delete options.lvdt;

    Object.entries(options).forEach(([value,label])=>{
      const item = Core.create("div", { class:"checkbox-item" });

      const cb = Core.create("input", { type:"checkbox", id:`cond2_${value}`, value });
      cb.checked = S.condition2.includes(value);

      cb.addEventListener("change", ()=>{
        if(cb.checked){
          if(!S.condition2.includes(value)) S.condition2.push(value);
        } else {
          S.condition2 = S.condition2.filter(v=>v!==value);
        }
      });

      const lab = Core.create("label", { for:`cond2_${value}` }, [label]);

      item.appendChild(cb);
      item.appendChild(lab);
      UI.checkboxGrid.appendChild(item);
    });
  }

  function renderImaging(){
    UI.imagingGrid.innerHTML = "";

    if(!S.instrument){
      Ui.hide(UI.imagingSection);
      return;
    }

    const inst = DATA.instruments[S.instrument];
    const imaging = [];

    if(inst.modules.includes("lamb")) imaging.push(["lamb","Lambda Imaging Head"]);
    if(inst.modules.includes("sigm")) imaging.push(["sigm","Sigma Imaging Head"]);
    if(inst.modules.includes("delt")) imaging.push(["delt","Delta Imaging Head"]);

    if(!imaging.length){
      Ui.hide(UI.imagingSection);
      return;
    }

    imaging.forEach(([value,label])=>{
      const item = Core.create("div", { class:"checkbox-item" });

      const cb = Core.create("input", { type:"checkbox", id:`img_${value}`, value });
      cb.checked = (S.imaging === value);

      cb.addEventListener("change", ()=>{
        if(cb.checked){
          Core.$$('#imagingGrid input[type="checkbox"]', UI.modal).forEach(x=>{
            if(x !== cb) x.checked = false;
          });
          S.imaging = value;
        } else {
          S.imaging = null;
        }
      });

      const lab = Core.create("label", { for:`img_${value}` }, [label]);

      item.appendChild(cb);
      item.appendChild(lab);
      UI.imagingGrid.appendChild(item);
    });

    Ui.showBlock(UI.imagingSection);
  }

  function renderCheckboxes(){
    renderCondition2();
    renderImaging();
    Ui.showBlock(UI.wrapperCheckboxes);
  }

  // ============================================================================
  // 6) ACTIONS (declarative selection pipeline)
  // ============================================================================
  const Actions = {

    select(selectId, value){
      Ui.closeDropdowns();
      const fn = Actions.handlers[selectId];
      if(fn) fn(value);
    },

    handlers: {
      selectInstrument(value){
        S.instrument = value;
        reset("instrument");

        Ui.setTrigger("selectInstrument", DATA.instruments[value]?.name || value);
        Ui.markSelected("selectInstrument", value);

        const inst = DATA.instruments[value];
        if(!inst || inst.modules.includes("none")) return;

        const availableModules = {};
        inst.modules.forEach(m=>{
          availableModules[m] = DATA.modules[m]?.name || m;
        });

        Ui.populate("selectModule", availableModules);
        Ui.showInline(UI.sectionModule);
      },

      selectModule(value){
        S.module = value;
        reset("module");

        Ui.setTrigger("selectModule", DATA.modules[value]?.name || value);
        Ui.markSelected("selectModule", value);

        const mod = DATA.modules[value];
        const availableConditions = {};
        mod.conditions.forEach(c=>{
          availableConditions[c] = DATA.conditions[c] || c;
        });

        Ui.populate("selectCondition1", availableConditions);
        Ui.showInline(UI.sectionCondition1);
      },

      selectCondition1(value){
        S.condition1 = value;
        reset("condition1");

        Ui.setTrigger("selectCondition1", DATA.conditions[value] || value);
        Ui.markSelected("selectCondition1", value);

        const mod = DATA.modules[S.module];

        // If "none sensor": show checkboxes directly
        if(mod.sensors.includes("none")){
          renderCheckboxes();
          return;
        }

        const availableSensors = {};
        mod.sensors.forEach(s=>{
          availableSensors[s] = DATA.sensors[s] || s;
        });

        Ui.populate("selectSensor", availableSensors);
        Ui.showInline(UI.sectionSensor);
      },

      selectSensor(value){
        S.sensor = value;
        S.condition2 = [];
        S.imaging = null;

        Ui.setTrigger("selectSensor", DATA.sensors[value] || value);
        Ui.markSelected("selectSensor", value);

        renderCheckboxes();
      }
    }
  };

  // ============================================================================
  // 7) PARAMS <-> STATE
  // ============================================================================
  function stateFromParams(){
    const p = Core.Params.get();

    S.instrument = p.model  || null;
    S.module     = p.module || null;
    S.condition1 = p.env    || null;

    // important: modal picks range option (ull/ml...) from ?range=
    S.sensor     = p.range || null;

    S.condition2 = p.cond ? p.cond.split(",").filter(Boolean) : [];
    S.imaging    = p.img || null;
  }

  function applyStateToUI(){
    if(!S.instrument){
      resetAllUI();
      return;
    }

    // instrument -> module -> env -> sensor pipeline (same order)
    Actions.handlers.selectInstrument(S.instrument);

    if(S.module){
      Actions.handlers.selectModule(S.module);
    }

    if(S.condition1){
      Actions.handlers.selectCondition1(S.condition1);
    }

    if(S.sensor){
      Actions.handlers.selectSensor(S.sensor);
    }

    // resync checkboxes
    requestAnimationFrame(()=>{
      Core.$$("#checkboxGrid input[type='checkbox']", UI.modal).forEach(cb=>{
        cb.checked = S.condition2.includes(cb.value);
      });
      Core.$$("#imagingGrid input[type='checkbox']", UI.modal).forEach(cb=>{
        cb.checked = (S.imaging === cb.value);
      });
    });
  }

  // ============================================================================
  // 8) APPLY / RESET
  // ============================================================================
  function applyConfig(){
    const params = {};

    if(S.instrument) params.model  = S.instrument;
    if(S.module)     params.module = S.module;
    if(S.condition1) params.env    = S.condition1;

    if(S.sensor){
      const sc = DATA.sensorCodes[S.sensor];
      if(sc?.sensor) params.sensor = sc.sensor;
      if(sc?.range)  params.range  = sc.range;
    }

    if(S.condition2.length) params.cond = S.condition2.join(",");
    if(S.imaging) params.img = S.imaging;

    Core.Params.set(params, { replace:false });

    const merged = Core.Params.get();
    const qs = new URLSearchParams(merged).toString();
    location.href = location.pathname + (qs ? `?${qs}` : "");
  }

  function resetAllUI(){
    S.instrument = null;
    reset("instrument");

    Ui.setTrigger("selectInstrument", null);
    Ui.clearSelected("selectInstrument");

    Ui.hide(UI.sectionModule);
    Ui.hide(UI.sectionCondition1);
    Ui.hide(UI.sectionSensor);
    Ui.hide(UI.wrapperCheckboxes);

    Core.$$("input[type='checkbox']", UI.modal).forEach(cb=>cb.checked=false);
  }

  function resetAll(){
    Core.Params.clear({ replace:true });
    resetAllUI();
  }

  // ============================================================================
  // 9) OPEN / CLOSE
  // ============================================================================
  function open(){
    UI.modal.classList.add("active");
    sync();
  }
  function close(){
    UI.modal.classList.remove("active");
    Ui.closeDropdowns();
  }
  function toggle(){
    if(UI.modal.classList.contains("active")) close();
    else open();
  }

  // ============================================================================
  // 10) BIND SELECT DROPDOWNS
  // ============================================================================
  function initSelectDropdowns(){
    Core.$$(".custom-select", UI.modal).forEach(selectEl=>{
      const trigger  = Core.$(".select-trigger", selectEl);
      const dropdown = Core.$(".select-dropdown", selectEl);

      trigger.addEventListener("click",(e)=>{
        e.stopPropagation();

        Core.$$(".select-dropdown.active", UI.modal).forEach(dd=>{
          if(dd !== dropdown){
            dd.classList.remove("active");
            dd.previousElementSibling?.classList.remove("active");
          }
        });

        dropdown.classList.toggle("active");
        trigger.classList.toggle("active");
      });
    });

    document.addEventListener("click", Ui.closeDropdowns);
  }

  // ============================================================================
  // 11) BUILD MODAL + HOOKS
  // ============================================================================
  function buildModal(){
    UI.modal = Core.create("div", {
      class: "configure-modal",
      id: "configModal",
      html: TEMPLATE()
    });

    UI.navbar.parentElement.insertBefore(UI.modal, UI.navbar.nextSibling);

    // cache refs
    UI.sectionModule      = Core.$("#section-module", UI.modal);
    UI.sectionCondition1  = Core.$("#section-condition1", UI.modal);
    UI.sectionSensor      = Core.$("#section-sensor", UI.modal);
    UI.wrapperCheckboxes  = Core.$("#section-checkboxes-wrapper", UI.modal);
    UI.checkboxGrid       = Core.$("#checkboxGrid", UI.modal);
    UI.imagingSection     = Core.$("#imaging-subsection", UI.modal);
    UI.imagingGrid        = Core.$("#imagingGrid", UI.modal);

    initSelectDropdowns();

    // close button
    Core.$(".configure-close-button", UI.modal).addEventListener("click", close);

    // reset/apply
    Core.$(".configure-reset-button", UI.modal).addEventListener("click", resetAll);
    Core.$(".configure-apply-button", UI.modal).addEventListener("click", applyConfig);

    // close outside modal
    document.addEventListener("click",(e)=>{
      if(!UI.modal.classList.contains("active")) return;
      if(UI.modal.contains(e.target)) return;
      if(UI.button.contains(e.target)) return;
      close();
    });

    // instrument options click
    Core.$$("#selectInstrument .select-option", UI.modal).forEach(opt=>{
      opt.addEventListener("click",(e)=>{
        e.stopPropagation();
        Actions.select("selectInstrument", opt.dataset.value);
      });
    });
  }

  // ============================================================================
  // 12) SYNC
  // ============================================================================
  function sync(){
    stateFromParams();
    applyStateToUI();
  }

  // ============================================================================
  // 13) INIT PUBLIC
  // ============================================================================
  async function init(){
    UI.navbar = await Core.waitFor(CFG.SELECTORS.navbar, 10000).catch(()=>null);
    if(!UI.navbar) return;

    // ensure button exists
    UI.button = Core.$(".configure-button", UI.navbar);
    if(!UI.button){
      UI.button = Core.create("button", { class:"configure-button" }, ["Configure"]);
      UI.navbar.appendChild(UI.button);
    }

    // build modal once
    if(!Core.$("#configModal")) buildModal();

    // toggle modal
    UI.button.addEventListener("click",(e)=>{
      e.stopPropagation();
      toggle();
    });

    // refresh if params changed while modal open
    Core.on(CFG.EVENTS.PARAMS_CHANGED, ()=>{
      if(UI.modal.classList.contains("active")) sync();
    });
  }

  // ============================================================================
  // Expose
  // ============================================================================
  window.BulletModal = { init, open, close, toggle };

})();
