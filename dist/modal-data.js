// Modal configuration data
window.MODAL_DATA = {
  instruments: {
    mft5: {
      name: 'MFT-5000',
      modules: ['urota', 'reci', 'scra']
    },
    umt: {
      name: 'UMT',
      modules: ['urota', 'reci']
    }
  },

  modules: {
    urota: {
      name: 'Universal Rotary Module',
      conditions: ['4ball', 'pindisc', 'tribocor'],
      sensors: ['2d', '3d', 'none']
    },
    reci: {
      name: 'Reciprocating Module',
      conditions: ['flatflat', 'pindisc'],
      sensors: ['1d', '2d', '3d']
    },
    scra: {
      name: 'Scratch Module',
      conditions: ['scratch'],
      sensors: ['1d', '2d']
    }
  },

  conditions: {
    '4ball': '4-Ball Test',
    'pindisc': 'Pin-on-Disc',
    'tribocor': 'Tribocorrosion',
    'flatflat': 'Flat-on-Flat',
    'scratch': 'Scratch Test'
  },

  sensors: {
    '1d': '1D Load Cell',
    '2d': '2D Load Cell',
    '3d': '3D Load Cell'
  },

  condition2: {
    'll': 'Low Load',
    'ull': 'Ultra Low Load',
    'hl': 'High Load',
    'lvdt': 'LVDT'
  },

  sensorCodes: {
    '1d': { sensor: '1d', range: 'standard' },
    '2d': { sensor: '2d', range: 'standard' },
    '3d': { sensor: '3d', range: 'standard' }
  }
};
