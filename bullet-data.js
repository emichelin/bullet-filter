(function(){
  "use strict";

  // ============================================================================
  // Bullet Data V5 — human editable + compiled output
  // Produces: window.MODAL_DATA
  // Keeps your current URL logic: sensor=<type> & range=<range>
  // ============================================================================

  // -------------------------------
  // 1) Human-friendly definitions
  // -------------------------------

  // Instruments: [id, displayName, [modules...]]
  const INSTRUMENTS = [
    ["up2",  "UP-2000",  ["sigm","delt"]],
    ["up3",  "UP-3000",  ["lamb","sigm","delt"]],
    ["up5",  "UP-5000",  ["lamb","sigm","delt"]],
    ["mft2", "MFT-2000", ["stat","rota","reci","lamb","sigm","delt"]],
    ["mft5", "MFT-5000", ["stat","rota","reci","bor","scra","urota","vcoil","mtm","lamb","sigm","delt"]],
    ["smt2", "SMT-2000", ["stat"]],
    ["smt5", "SMT-5000", ["stat"]],
    ["ust2", "UST-2",    ["stat"]],
    ["fftm", "FFT-M",    ["vcoil"]],
    ["fft1", "FFT-1",    ["vcoil"]],
    ["fft2", "FFT-2",    ["vcoil"]],
    ["aj1",  "AJ-1000",  ["none"]],
    ["trt1", "TRT-1000", ["none"]],
    ["mvt2", "MVT-2",    ["none"]],
  ];

  // Modules: [id, displayName, [conditions...], [sensorOptions...]]
  // sensorOptions are the values shown in modal (ull,ll,ml,hl,FzFx,Fz...)
  const MODULES = [
    ["stat","Stationary",
      ["liq","dry"],
      ["ull","ll","ml","hl","FzFx","Fz","nano","micro","stch"]
    ],

    ["rota","Rotary",
      ["brk","liq","heat","cool","humid","ev","dry"],
      ["ull","ll","ml","hl","FzFx","FzTq"]
    ],

    ["reci","Reciprocating",
      ["srv","liq","heat","cool","humid","ev","tcorr","dry"],
      ["ull","ll","ml","hl","FzFx","Fzp","Fz"]
    ],

    ["bor","Block-On-Ring",
      ["cut","grs","liq","heat","cool","humid","ev","dry"],
      ["ml","hl","FzFx"]
    ],

    ["scra","Scratch",
      ["dry"],
      ["ml","hl"]
    ],

    ["urota","Upper Rotary",
      ["tap","4ball","heat","cool","ev","dry"],
      ["none"]
    ],

    ["vcoil","VoiceCoil",
      ["heat","ev","dry"],
      ["none"]
    ],

    ["mtm","Mini Traction",
      ["liq","heat","ev","dry"],
      ["ml"]
    ],

    ["lamb","Lambda Imaging",
      ["bfdf","cfc","wli"],
      ["none"]
    ],

    ["sigm","Sigma Imaging",
      ["bfdf","wli"],
      ["none"]
    ],

    ["delt","Delta Imaging",
      ["bfdf"],
      ["none"]
    ],

    ["none","None",
      [],
      []
    ],
  ];

  // Conditions: id -> label
  const CONDITIONS = {
    srv:  "SRV",
    tap:  "Tapping Torque",
    "4ball":"4-ball",
    brk:  "Brake",
    cut:  "Cutting",
    grs:  "Grease Test",
    liq:  "Liquid",
    heat: "Heated",
    cool: "Cooled",
    humid:"Humidity",
    ev:   "Electrified",
    tcorr:"Tribocorrosion",
    dry:  "Dry",
    bfdf: "Bright Field Dark Field",
    cfc:  "Confocal",
    wli:  "White Light"
  };

  // Sensors: id -> label
  const SENSORS = {
    ull:  "Ultra Low-Load Argon",
    ll:   "Low Load Argon",
    ml:   "Medium Load Argon",
    hl:   "High Load Argon",
    FzFx: "Fz+Fx",
    Fzp:  "Fz+piezo",
    Fz:   "Fz",
    FzTq: "Fz+Torque",
    nano: "Nano-Indentation",
    micro:"Micro-Indentation",
    stch: "Scratch",
    none: "None"
  };

  // sensorCodes: choice -> {sensor:<type>, range:<range|null>}
  // This is what generates URL params sensor=... & range=...
  const SENSOR_CODES = {
    ull:   { sensor:"2d",    range:"ull" },
    ll:    { sensor:"2d",    range:"ll"  },
    ml:    { sensor:"2d",    range:"ml"  },
    hl:    { sensor:"2d",    range:"hl"  },
    FzFx:  { sensor:"1d1d",  range:null  },
    Fzp:   { sensor:"fzpz",  range:null  },
    Fz:    { sensor:"fz",    range:null  },
    FzTq:  { sensor:"fztq",  range:null  },
    nano:  { sensor:"nano",  range:null  },
    micro: { sensor:"micro", range:null  },
    stch:  { sensor:"stch",  range:null  },
    none:  { sensor:null,    range:null  }
  };

  // condition2 checkboxes (extra env)
  const CONDITION2 = {
    lvdt:  "LVDT",
    liq:   "Liquid",
    ev:    "Electrified",
    heat:  "Heated",
    cool:  "Cooled",
    humid: "Humidity"
  };

  // ============================================================================
  // 2) Compile into MODAL_DATA (same structure as before)
  // ============================================================================
  function compile(){
    const instruments = Object.fromEntries(
      INSTRUMENTS.map(([id,name,modules])=>[id,{ name, modules }])
    );

    const modules = Object.fromEntries(
      MODULES.map(([id,name,conditions,sensors])=>[id,{ name, conditions, sensors }])
    );

    return {
      instruments,
      modules,
      conditions: CONDITIONS,
      sensors: SENSORS,
      sensorCodes: SENSOR_CODES,
      condition2: CONDITION2
    };
  }

  // ============================================================================
  // 3) Validation (warn only, never crash)
  // ============================================================================
  function validate(data){
    const moduleIds = new Set(Object.keys(data.modules));
    const conditionIds = new Set(Object.keys(data.conditions));
    const sensorIds = new Set(Object.keys(data.sensors));
    const sensorCodeIds = new Set(Object.keys(data.sensorCodes));

    // Instruments module references
    Object.entries(data.instruments).forEach(([instId, inst])=>{
      inst.modules.forEach(m=>{
        if(!moduleIds.has(m)) console.warn(`[BulletData] Unknown module "${m}" in instrument "${instId}"`);
      });
    });

    // Modules conditions/sensors references
    Object.entries(data.modules).forEach(([modId, mod])=>{
      mod.conditions.forEach(c=>{
        if(!conditionIds.has(c)) console.warn(`[BulletData] Unknown condition "${c}" in module "${modId}"`);
      });
      mod.sensors.forEach(s=>{
        if(!sensorIds.has(s)) console.warn(`[BulletData] Unknown sensor "${s}" in module "${modId}"`);
        if(!sensorCodeIds.has(s)) console.warn(`[BulletData] Missing sensorCodes for "${s}" (module "${modId}")`);
      });
    });
  }

  const MODAL_DATA = compile();
  validate(MODAL_DATA);

  window.MODAL_DATA = MODAL_DATA;

})();
