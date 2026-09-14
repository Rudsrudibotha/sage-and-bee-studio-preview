const menu=document.querySelector('.menu-toggle');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('.site-header').classList.toggle('menu-open',open);});
document.querySelectorAll('.site-nav a').forEach(a=>a.addEventListener('click',()=>{menu?.setAttribute('aria-expanded','false');document.querySelector('.site-header').classList.remove('menu-open');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.setAttribute('aria-expanded','false');document.querySelector('.site-header').classList.remove('menu-open');menu.focus();}});
const dialog=document.querySelector('.lightbox');let trigger;
document.querySelectorAll('[data-gallery]').forEach(link=>link.addEventListener('click',event=>{if(!dialog?.showModal)return;event.preventDefault();trigger=link;const img=link.querySelector('img');dialog.querySelector('img').src=link.href;dialog.querySelector('img').alt=img.alt;dialog.querySelector('p').textContent=link.dataset.caption||img.alt;dialog.querySelector('a').href=link.dataset.source;dialog.showModal();}));
dialog?.querySelector('button').addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog?.addEventListener('close',()=>trigger?.focus());
const reduced=matchMedia('(prefers-reduced-motion: reduce)');const narrow=matchMedia('(max-width: 760px)');const scenes=[...document.querySelectorAll('.pin-wrap')];let scheduled=false;
function renderScroll(){scheduled=false;const distance=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--progress',distance>0?Math.min(1,Math.max(0,scrollY/distance)):0);for(const scene of scenes){const r=scene.getBoundingClientRect();const progress=Math.min(1,Math.max(0,-r.top/Math.max(1,r.height-innerHeight)));scene.style.setProperty('--shift',reduced.matches||narrow.matches?'0px':`${(progress-.5)*45}px`);scene.style.setProperty('--scale',reduced.matches||narrow.matches?'1':String(1+progress*.035));}}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(renderScroll);}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);renderScroll();
