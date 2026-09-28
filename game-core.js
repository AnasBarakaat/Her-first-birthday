/* Small deterministic game model, independent of rendering and browser APIs. */
(function(root){
  class OceanGame {
    constructor(){this.reset();}
    reset(){this.chapter=0;this.collected=0;this.distance=0;this.y=.5;this.speed=0;this.vy=0;this.pearls=[];this.nextPearl=100;this.state='sleeping';}
    start(){if(this.state==='sleeping')this.state='playing';}
    step(dt,input,width,height){
      if(!['playing','clue','finished'].includes(this.state))return false;
      dt=Math.min(dt,.05);
      const top=Math.min(220,height*.32),bottom=Math.max(top+60,height-195);
      const target=input.targetY==null?this.y*height:input.targetY;
      const wantedY=input.targetY==null?(input.vertical||0)*300:Math.max(-340,Math.min(340,(target-this.y*height)*7));
      this.vy+=(wantedY-this.vy)*(1-Math.exp(-dt*10));
      this.y=Math.max(top,Math.min(bottom,this.y*height+this.vy*dt))/height;
      this.speed+=((input.swim?245:0)-this.speed)*(1-Math.exp(-dt*(input.swim?5:3.5)));
      const advance=dt*this.speed;
      this.distance+=advance;
      if(this.state!=='playing')return false;
      if(this.distance>=this.nextPearl&&this.pearls.length<3){
        const n=Math.round(this.nextPearl/180);
        this.pearls.push({x:width+30,y:top+(bottom-top)*(.2+(n%3)*.3)});
        this.nextPearl=this.distance+220;
      }
      let hit=false;
      for(const pearl of this.pearls){
        pearl.x-=advance;
        if(Math.hypot(pearl.x-width*.32,pearl.y-this.y*height)<46){pearl.hit=true;this.collected++;hit=true;}
      }
      this.pearls=this.pearls.filter(p=>!p.hit&&p.x> -30);
      if(this.collected>=5){this.collected=5;this.state='clue';this.pearls=[];}
      return hit;
    }
    continue(){if(this.state!=='clue')return;this.chapter++;this.collected=0;this.pearls=[];this.nextPearl=this.distance+90;this.state=this.chapter>=6?'finished':'playing';}
  }
  root.OceanGame=OceanGame;
  if(typeof module!=='undefined')module.exports=OceanGame;
})(typeof globalThis!=='undefined'?globalThis:this);
