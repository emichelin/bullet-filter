(function(){
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
})();
