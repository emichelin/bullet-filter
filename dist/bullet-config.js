(function(){
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
      headingGray: '.notion-gray',
      tocHeadings: '.notion-h1,.notion-h2,.notion-h3,h1,h2,h3,details summary'
    }
  };
})();
