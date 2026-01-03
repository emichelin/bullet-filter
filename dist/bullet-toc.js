(function(){
  const CFG = window.BulletConfig;
  const BUS = window.BulletBus;
  if(!CFG || !BUS) throw new Error('TOC deps missing');

  const TOC_ID='static-toc';
  const HID='toc-hidden';
  let tocContainer;
  let entries=[];

  function build(){
    if(document.getElementById(TOC_ID)) return;

    tocContainer=document.createElement('div');
    tocContainer.id=TOC_ID;
    tocContainer.className='dynamic-toc';
    tocContainer.innerHTML='<div class="toc-title">Contents</div>';
    document.body.appendChild(tocContainer);

    document.querySelectorAll(CFG.SELECTORS.tocHeadings).forEach((el,i)=>{
      if(!el.id) el.id='toc-'+i;
      const a=document.createElement('a');
      a.href='#'+el.id;
      a.textContent = el.textContent.replace(/\{\{.*?\}\}|-o/g,'').trim();
      a.className='toc-item';
      tocContainer.appendChild(a);
      entries.push({ linkEl:a, targetEl:el });
    });

    tocContainer.addEventListener('click', e=>{
      if(!e.target.matches('.toc-item')) return;
      const target = document.getElementById(e.target.hash.slice(1));
      const details = target?.closest('details');
      if(details && !details.open) details.open=true;
    });
  }

  function refresh(){
    if(!tocContainer) return;
    entries.forEach(({linkEl,targetEl})=>{
      const visible = targetEl.offsetParent !== null && getComputedStyle(targetEl).display !== 'none';
      linkEl.classList.toggle(HID, !visible);
    });
    const hasVisible = entries.some(e=>!e.linkEl.classList.contains(HID));
    tocContainer.style.display = hasVisible ? 'block' : 'none';
  }

  window.BulletTOC = { build, refresh };

  BUS.on(CFG.EVENTS.FILTER_CHANGED, refresh);
  BUS.on(CFG.EVENTS.PARAMS_CHANGED, refresh);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ build(); refresh(); });
  } else {
    build(); refresh();
  }
})();
