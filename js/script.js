/* Duomix salespage - script.js */
(function(){
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s,c){return (c||document).querySelector(s)};
  var $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  function onSee(el, ratio, cb, once){
    if(!el) return;
    if(!('IntersectionObserver' in window)){cb(el);return}
    var io = new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){cb(e.target);if(once!==false) io.unobserve(e.target)}})},{threshold:ratio});
    io.observe(el);
  }

  /* reveal */
  $$('.rv').forEach(function(el){ onSee(el, .01, function(t){t.classList.add('in')}) });
  // stagger within grids
  ['.pain-grid','.adv-grid','.sp-cards','.bonus-grid','.wall','.steps3','.plan30'].forEach(function(g){
    $$(g).forEach(function(grid){ $$('.rv',grid).forEach(function(c,i){ c.style.transitionDelay = (i%3)*(g==='.adv-grid'?120:140)+'ms' }) });
  });

  /* tracking */
  track && track('ViewContent',{content_name:'Duomix'});
  $$('.plan-btn').forEach(function(b){ b.addEventListener('click',function(){ track('InitiateCheckout',{content_name:b.getAttribute('data-pkg')}) }) });

  /* laptop open */
  var lap = $('#laptop');
  if(RM) lap.classList.add('open'); else onSee(lap,.25,function(t){t.classList.add('open')});
  window.addEventListener('blur',function(){ var a=document.activeElement; if(a && a.tagName==='IFRAME' && $('#vidScreen').contains(a)) $('#playHint').classList.add('hide') });
  $('#vidScreen').addEventListener('click',function(){ $('#playHint').classList.add('hide') });

  /* slider */
  (function(){
    var sl=$('#slider'); if(!sl) return;
    var track=$('.slides',sl), n=$$('.slide',sl).length, i=0, timer=null, dots=$('.dots',sl);
    for(var k=0;k<n;k++){ var b=document.createElement('button'); b.className='dot'; b.setAttribute('aria-label','Slaid '+(k+1)); (function(k){b.onclick=function(){go(k)}})(k); dots.appendChild(b) }
    function go(k){ i=(k+n)%n; track.style.transform='translateX(-'+(i*100)+'%)'; $$('.dot',sl).forEach(function(d,j){ d.classList.remove('on'); if(j===i){ void d.offsetWidth; d.classList.add('on') } }); restart() }
    function restart(){ clearInterval(timer); if(!RM) timer=setInterval(function(){ if(!sl.classList.contains('paused') && !document.hidden) go(i+1) },6000) }
    $$('.sl-btn',sl).forEach(function(b){ b.onclick=function(){ go(i+ +b.getAttribute('data-dir')) } });
    sl.addEventListener('mouseenter',function(){sl.classList.add('paused')}); sl.addEventListener('mouseleave',function(){sl.classList.remove('paused')});
    sl.addEventListener('focusin',function(){sl.classList.add('paused')}); sl.addEventListener('focusout',function(){sl.classList.remove('paused')});
    var x0=null; track.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
    track.addEventListener('touchend',function(e){ if(x0===null) return; var dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>40) go(i+(dx<0?1:-1)); x0=null });
    go(0);
  })();

  /* WhatsApp chat (mesej sebenar pelanggan, nama disorok) */
  (function(){
    var body=$('#waBody'); if(!body) return;
    var msgs=[
      {o:0,t:'Allamdulillah',h:'9:45'},
      {o:0,t:'Sy br minum 2 kali',h:'9:46'},
      {o:0,t:'Dah rase lega',h:'9:46'},
      {o:0,t:'Perut pun dah selesa..sakit pada ulu hati dah tak ade',h:'9:46'},
      {o:0,t:'Pg2 dah membuang',h:'9:47'},
      {o:1,t:'Alhamdulillah',h:'9:47'},
      {o:0,t:'Dah bertenaga',h:'9:48'},
      {o:0,t:'Mkn tu ttp nk kena jaga jgk',h:'9:48'}
    ];
    var running=false;
    function bubble(m){ var d=document.createElement('div'); d.className='msg '+(m.o?'out-m':'in-m'); d.innerHTML=m.t.replace(/</g,'&lt;')+'<span class="t">'+m.h+(m.o?' <span class="tick">✓✓</span>':'')+'</span>'; body.appendChild(d); return d }
    function trim(){ while(body.scrollHeight>body.clientHeight+2 && body.children.length>2){ body.removeChild(body.children[1]) } }
    function run(){
      if(running) return; running=true; $('#waReplay').style.display='none';
      $$('.msg,.typing',body).forEach(function(n){n.remove()});
      if(RM){ msgs.forEach(bubble); trim(); running=false; return }
      var k=0;
      (function next(){
        if(k>=msgs.length){ $$('.tick',body).forEach(function(t){t.classList.add('blue')}); $('#waStatus').textContent='online'; $('#waReplay').style.display='inline-block'; running=false; return }
        var m=msgs[k++];
        if(!m.o){ var ty=document.createElement('div'); ty.className='typing'; ty.innerHTML='Pelanggan sedang menaip… <span class="d"></span><span class="d"></span><span class="d"></span>'; body.appendChild(ty); trim(); $('#waStatus').textContent='sedang menaip…';
          setTimeout(function(){ ty.remove(); bubble(m); trim(); setTimeout(next,450) },900);
        } else { setTimeout(function(){ bubble(m); trim(); setTimeout(next,450) },500) }
      })();
    }
    onSee(body,.35,run);
    $('#waReplay').onclick=run;
  })();

  /* confetti engine */
  function confetti(canvas, opts){
    if(RM || !canvas) return;
    var ctx=canvas.getContext('2d'), dpr=Math.min(window.devicePixelRatio||1,2);
    var r=canvas.getBoundingClientRect(); canvas.width=r.width*dpr; canvas.height=r.height*dpr; ctx.scale(dpr,dpr);
    var W=r.width,H=r.height, colors=['#2563eb','#f97316','#facc15','#16a34a','#db2777','#7c3aed'], P=[];
    var count=opts.count||100;
    (opts.origins||[[.5,.5]]).forEach(function(o){ for(var i=0;i<count/(opts.origins||[1]).length;i++){ var a=Math.random()*Math.PI*2, s=4+Math.random()*7; P.push({x:o[0]*W,y:o[1]*H,vx:Math.cos(a)*s,vy:Math.sin(a)*s-4,w:5+Math.random()*6,h:3+Math.random()*4,c:colors[i%colors.length],r:Math.random()*6,vr:(Math.random()-.5)*.3}) } });
    if(opts.rain){ for(var j=0;j<opts.rain;j++){ P.push({x:Math.random()*W,y:-Math.random()*H*.5,vx:(Math.random()-.5)*1.5,vy:2+Math.random()*2,w:5+Math.random()*5,h:3+Math.random()*3,c:colors[j%colors.length],r:Math.random()*6,vr:(Math.random()-.5)*.3}) } }
    var t0=performance.now(), dur=opts.dur||4200;
    (function f(t){
      var e=t-t0; ctx.clearRect(0,0,W,H); var alpha = e>dur-900 ? Math.max(0,(dur-e)/900) : 1;
      P.forEach(function(p){ p.vy+=.18; p.vx*=.99; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr; ctx.save(); ctx.globalAlpha=alpha; ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle=p.c; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore() });
      if(e<dur) requestAnimationFrame(f); else ctx.clearRect(0,0,W,H);
    })(t0);
  }
  onSee($('#cmp'),.35,function(t){ t.classList.add('in'); var r=$('.cmp-r',t).getBoundingClientRect(), cr=t.getBoundingClientRect(); confetti($('#cmpCanvas'),{count:38,origins:[[(r.left-cr.left+r.width/2)/cr.width,.25]],dur:3000}) });
  onSee($('#produk'),.4,function(){ var small=window.innerWidth<640; confetti($('#revealCanvas'),{count:small?60:120,origins:[[.18,.4],[.82,.4]],rain:small?30:50,dur:4200}) });

  /* brand chips + markers */
  onSee($('#brandPhoto'),.2,function(t){ $$('.chip',t).forEach(function(c,i){ c.style.transitionDelay=(i*100)+'ms' }); t.classList.add('in') });

  /* stacking cards */
  (function(){
    var cards=$$('.stack-card'); if(!cards.length || RM) return;
    var ticking=false;
    function upd(){
      ticking=false;
      for(var i=0;i<cards.length-1;i++){
        var r=cards[i].getBoundingClientRect(), nr=cards[i+1].getBoundingClientRect();
        var p=Math.min(1,Math.max(0,1-(nr.top-r.top)/r.height));
        var inner=cards[i].firstElementChild; inner.style.transform='scale('+(1-.05*p)+')'; inner.style.filter='brightness('+(1-.15*p)+')';
      }
    }
    window.addEventListener('scroll',function(){ if(!ticking){ticking=true; requestAnimationFrame(upd)} },{passive:true}); upd();
  })();

  /* timeline */
  (function(){
    var tl=$('#tl'); if(!tl) return; var items=$$('.tf',tl);
    onSee(tl,.2,function(){ items.forEach(function(it,i){ setTimeout(function(){ it.classList.add('in') }, RM?0:i*520) }); setTimeout(function(){ tl.classList.add('lit') }, RM?0:items.length*520+600) });
  })();

  /* case bars, value drop */
  onSee($('#case'),.3,function(t){t.classList.add('in')});
  onSee($('#drop'),.5,function(t){t.classList.add('in')});

  /* after-payment steps */
  (function(){
    var a=$('#after'); if(!a) return; var st=$$('.as',a);
    onSee(a,.3,function(){ if(RM){st.forEach(function(s){s.classList.add('lit')});return} var k=0; setInterval(function(){ st.forEach(function(s){s.classList.remove('lit')}); st[k%st.length].classList.add('lit'); k++ },520) });
  })();

})();
