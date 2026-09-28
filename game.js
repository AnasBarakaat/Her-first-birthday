'use strict';
// Edit these six messages to personalise the birthday itinerary. Venue names stay secret.
const CHAPTERS=[
  {time:'10:00 AM',title:'Fuel for the morning',symbol:'☀',text:'Meet me by Empire Pizza at 10. Our first little feast waits beneath the name of a mighty tree—one that begins as a tiny acorn. Can you guess where we’re going?',note:'Yummyyyy',summary:'Meet by Empire Pizza, then follow the little acorn clue.'},
  {time:'1:00 PM',title:'My queen rests',symbol:'❀',text:'We’ll find our way to a familiar place where you are treated like royalty. Your body and mind need the rest.',note:'A moment of serenity for my little ponyo.',summary:'A familiar favourite, with a relaxing massage surprise.'},
  {time:'2:30–4:00 PM',title:'Matcha time',symbol:'♧',text:'Take a moment to sip on your favorite matcha, Sasuke will steer the boat for my little ponyo baby.',note:'Matcha and cookie COMBANATION.',summary:'A cosy lunch, matcha, and something sweet. We’ll follow our cravings.'},
  {time:'4:00 PM',title:'Glam time',symbol:'✧',text:'Ponyo has been fueled up, now Ponyo will shine like the little star she is.',note:'Sephora is asking to partner with Reem Cream beauty, should we partner with them?',summary:'Hair styling and makeup in Janabiya.'},
  {time:'AFTER YOUR MAKEOVER',title:"A moment for the inner child",symbol:'♔',text:'While the chapters before this were for resting the adult you and treating the adult you, this moment will be for your inner child to come to life and be celebrated.',note:'Secrets secrets...',summary:'Home, where a few carefully kept surprises await.'},
  {time:'8:00 PM',title:"My wife's night",symbol:'☾',text:'The final piece, the pink slik dress,and a night out with just you and me.',note:'No one compares to your beauty, you have my heart',summary:'Your pink dress, dinner and drinks by Bahrain Bay, and birthday sweetness.'}
];
const $=id=>document.getElementById(id), canvas=$('sea'), ctx=canvas.getContext('2d');
const game=new OceanGame(), input={swim:false,vertical:0,targetY:null};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let w=innerWidth,h=innerHeight,last=0,elapsed=0,sound=false,toastTimer,catTimer=0,catSeen=false,clueScheduled=false,swimPhase=0,ponyX=.5,ponyAngle=0,fadeTimer;
const art=new Image();art.src='assets/characters.png';
art.onerror=()=>notify('The little fish couldn’t load. Please refresh to try again.');
const swimArt=new Image();swimArt.src='assets/ponyo-swim.png';
const backdrop=document.querySelector('.painted-sea');
const SOUNDTRACK_URL='assets/'+encodeURIComponent('Ponyo On The Cliff By The Sea Full SoundTrack - Best Instrumental Songs Of Ghibli Collection.mp3');
const MUSIC_VOLUME=.18;
const music=$('music');music.volume=0;music.src=SOUNDTRACK_URL;
let fadeInterval;
function fadeMusicIn(){clearInterval(fadeInterval);fadeInterval=setInterval(()=>{music.volume=Math.min(MUSIC_VOLUME,music.volume+.015);if(music.volume>=MUSIC_VOLUME)clearInterval(fadeInterval);},120);}
const canSwim=()=>['playing','clue','finished'].includes(game.state);
function musicLabel(){$('sound').innerHTML=`♫ <span>${sound?'music on':'music off'}</span>`;$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',`Turn music ${sound?'off':'on'}`);}
async function playMusic(){try{await music.play();sound=true;fadeMusicIn();}catch{sound=false;notify('Tap the music button to start the soundtrack.');}musicLabel();}
music.onerror=()=>{sound=false;clearInterval(fadeInterval);musicLabel();notify('The soundtrack could not load.');};
musicLabel();
const bubbles=Array.from({length:26},(_,i)=>({x:(i*.618033)%1,y:(i*.379)%1,r:2+(i%4)*1.5,speed:7+i%7}));
function resize(){w=canvas.clientWidth;h=canvas.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);game.pearls=[];game.nextPearl=game.distance+70;}
addEventListener('resize',resize);resize();
function dots(){ $('chapter-dots').innerHTML=Array.from({length:6},(_,i)=>`<i class="${i<game.chapter?'done':i===game.chapter?'current':''}"></i>`).join('');$('chapter-dots').setAttribute('aria-label',`${game.chapter} of 6 chapters revealed`);}
function updateHUD(){ $('count').textContent=`${game.collected} / 5`;$('chapter-label').textContent=`CHAPTER ${String(game.chapter+1).padStart(2,'0')} / 06`;dots(); }
function notify(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4200);}
$('sound').onclick=()=>{if(sound){music.pause();clearInterval(fadeInterval);sound=false;musicLabel();}else playMusic();};
function clearInput(){input.swim=false;input.vertical=0;input.targetY=null;$('swim').classList.remove('held');}
function start(){game.start();playMusic();$('welcome').classList.add('departing');clearTimeout(fadeTimer);fadeTimer=setTimeout(()=>$('welcome').hidden=true,1100);$('hud').hidden=false;$('controls').hidden=false;$('pause').hidden=false;$('footer-note').textContent='A DAY FULL OF LITTLE WONDERS';updateHUD();notify('Hold the right button to swim. Slide up or down to find pearls.');$('swim').focus({preventScroll:true});}
$('start').onclick=start;
function bindHold(id,onDown,onMove,onUp){const element=$(id);element.addEventListener('pointerdown',e=>{if(!canSwim())return;e.preventDefault();element.setPointerCapture(e.pointerId);onDown(e);});element.addEventListener('pointermove',e=>{if(element.hasPointerCapture(e.pointerId)&&onMove)onMove(e);});for(const event of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(event,()=>onUp());}
let dragStart=0,swimStartY=0;
bindHold('swim',e=>{input.swim=true;dragStart=e.clientY;swimStartY=game.y*h;$('swim').classList.add('held');},e=>{input.targetY=swimStartY+(e.clientY-dragStart)*1.6;},()=>{input.swim=false;input.targetY=null;$('swim').classList.remove('held');});
bindHold('up',()=>{input.vertical=-1;input.targetY=null;},null,()=>input.vertical=0);
bindHold('down',()=>{input.vertical=1;input.targetY=null;},null,()=>input.vertical=0);
// The entire right half is also a swim surface, so holding feels like an HTML game.
$('ocean').addEventListener('pointerdown',e=>{if(e.target.closest('button,a,dialog')||!canSwim()||e.clientX<w*.5)return;e.preventDefault();$('ocean').setPointerCapture(e.pointerId);input.swim=true;dragStart=e.clientY;swimStartY=game.y*h;});
$('ocean').addEventListener('pointermove',e=>{if($('ocean').hasPointerCapture(e.pointerId))input.targetY=swimStartY+(e.clientY-dragStart)*1.6;});
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('ocean').addEventListener(type,e=>{if(e.target===$('ocean'))clearInput();});
addEventListener('keydown',e=>{if(!canSwim())return;if(['ArrowUp','ArrowDown','ArrowRight',' '].includes(e.key)){e.preventDefault();if(e.key==='ArrowUp')input.vertical=-1;else if(e.key==='ArrowDown')input.vertical=1;else input.swim=true;}});
addEventListener('keyup',e=>{if(['ArrowUp','ArrowDown'].includes(e.key))input.vertical=0;if(['ArrowRight',' '].includes(e.key))input.swim=false;});
let beforePause='playing';function pause(){if(!canSwim())return;clearInput();beforePause=game.state;game.state='paused';music.pause();clearInterval(fadeInterval);$('pause-dialog').showModal();}
$('pause').onclick=pause;$('resume').onclick=()=>{$('pause-dialog').close();game.state=beforePause;if(sound)playMusic();};
addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();music.pause();clearInterval(fadeInterval);}else if(sound&&canSwim())playMusic();});
function showClue(){$('ocean').classList.add('reading');const c=CHAPTERS[game.chapter];$('clue-number').textContent=`LITTLE SECRET ${String(game.chapter+1).padStart(2,'0')} / 06`;$('clue-symbol').textContent=c.symbol;$('clue-time').textContent=c.time;$('clue-title').textContent=c.title;$('clue-text').textContent=c.text;$('clue-footnote').textContent=c.note;$('continue').textContent=game.chapter===5?'Our beautiful day, all together ♡':'There’s more to discover →';$('clue-dialog').hidden=false;}
$('continue').onclick=()=>{$('clue-dialog').hidden=true;$('ocean').classList.remove('reading');game.continue();clueScheduled=false;if(game.state==='finished'){finish();}else{updateHUD();notify('Another five pearls, another little secret.');}};
function finish(){$('hud').hidden=true;$('pause').hidden=true;dots();$('itinerary').innerHTML=CHAPTERS.map(c=>`<article><time>${c.time}</time><div><strong>${c.title}</strong><p>${c.summary}</p></div></article>`).join('');$('ending-dialog').show();}
function reset(){for(const dialog of document.querySelectorAll('dialog'))dialog.close();clearInput();game.reset();music.pause();clearInterval(fadeInterval);sound=false;musicLabel();clearTimeout(fadeTimer);$('welcome').classList.remove('departing');$('clue-dialog').hidden=true;$('ocean').classList.remove('reading');ponyX=.5;ponyAngle=0;clueScheduled=false;catTimer=0;catSeen=false;$('welcome').hidden=false;$('hud').hidden=true;$('controls').hidden=true;$('pause').hidden=true;$('toast').classList.remove('visible');clearTimeout(toastTimer);$('footer-note').textContent='MADE WITH LOVE, JUST FOR YOU';dots();$('start').focus();}
$('restart').onclick=reset;$('replay').onclick=reset;
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('cancel',e=>{e.preventDefault();if(dialog.id==='pause-dialog')$('resume').click();});
function sprite(index,x,y,size,angle=0){if(!art.complete||!art.naturalWidth)return;const sw=art.naturalWidth/2,sh=art.naturalHeight/2;ctx.save();ctx.translate(x,y);ctx.rotate(angle);if(index>=2)ctx.scale(-1,1);ctx.drawImage(art,(index%2)*sw,Math.floor(index/2)*sh,sw,sh,-size/2,-size*sh/sw/2,size,size*sh/sw);ctx.restore();}
function drawSwimmer(x,y,size,angle){
  if(!swimArt.complete||!swimArt.naturalWidth){sprite(1,x,y,size,angle);return;}
  const frame=reduced?0:Math.floor(swimPhase)%6,sw=swimArt.naturalWidth/3,sh=swimArt.naturalHeight/2;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  ctx.drawImage(swimArt,(frame%3)*sw,Math.floor(frame/3)*sh,sw,sh,-size/2,-size*sh/sw/2,size,size*sh/sw);ctx.restore();
}
function pearl(x,y,r=12){ctx.save();ctx.shadowColor='#fff2d2';ctx.shadowBlur=22;const g=ctx.createRadialGradient(x-4,y-5,1,x,y,r);g.addColorStop(0,'#fff');g.addColorStop(.5,'#fff4e1');g.addColorStop(1,'#cbaaa3');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#fff6dc70';ctx.beginPath();ctx.arc(x,y,r+5,0,Math.PI*2);ctx.stroke();ctx.restore();}
function render(now){const dt=Math.min((now-last)/1000||0,.05);last=now;if(!document.hidden){elapsed+=dt;ctx.clearRect(0,0,w,h);
  ctx.strokeStyle='#d9fff24a';ctx.lineWidth=1;for(const b of bubbles){const x=((b.x*w-game.distance*(.12+b.r*.025))%w+w)%w+Math.sin(elapsed*.4+b.x*10)*4,y=(b.y*h-(reduced?0:elapsed*b.speed))%h;ctx.beginPath();ctx.arc(x,(y+h)%h,b.r,0,Math.PI*2);ctx.stroke();}
  const sleeping=game.state==='sleeping',bob=reduced?0:Math.sin(elapsed*1.6)*5;
  if(canSwim()){
    const hit=game.step(dt,input,w,h);if(hit)updateHUD();
    // The camera drifts in one direction instead of rocking back and forth.
    if(!reduced)backdrop.style.transform=`translateX(${-1.7*(1-Math.exp(-game.distance/3500))}%)`;
    if(game.state==='clue'&&!clueScheduled){clueScheduled=true;showClue();}
    catTimer+=dt;
  }
  for(const p of game.pearls)pearl(p.x,p.y+(reduced?0:Math.sin(elapsed*2+p.x*.01)*3));
  const catPeriod=catTimer%27;
  if(catTimer>8&&catPeriod>8&&catPeriod<23){const cx=w+100-(catPeriod-8)/15*(w+240);sprite(game.chapter%2?3:2,cx,h*.38+Math.sin(catTimer*.7)*20,145,-.08);if(!catSeen&&cx<w*.8){catSeen=true;notify('Your followers are everywhere.');}}
  ponyX+=((sleeping?.5:.32)-ponyX)*(1-Math.exp(-dt*3));
  ponyAngle+=((sleeping?-.08:Math.atan2(game.vy,350)*.38)-ponyAngle)*(1-Math.exp(-dt*7));
  swimPhase+=dt*(game.speed>30?8:2);
  const px=ponyX*w,py=sleeping?h*.53:game.y*h;
  if(sleeping)sprite(0,px,py+bob,Math.min(w*.48,235),ponyAngle);
  else drawSwimmer(px,py+(reduced?0:Math.sin(swimPhase*.75)*1.5),Math.min(w*.43,180),ponyAngle);
  if(sleeping){ctx.fillStyle='#fff4dbaa';ctx.font='italic 20px Georgia';ctx.fillText('z',px+53,py-32+bob);ctx.font='italic 15px Georgia';ctx.fillText('z',px+71,py-49+bob);}
}requestAnimationFrame(render);}
dots();requestAnimationFrame(render);
