// Executable acceptance specification, NOT a Pine interpreter.
class RegistrySpec {
 constructor(detect,{limit=12,life=0,mode='Close',bias=0}={}){this.detect=detect;this.limit=limit;this.life=life;this.mode=mode;this.bias=bias;this.models=[];this.bars=[];this.dropped=0;this.retired=[];}
 step(bar){
  const index=this.bars.length,prior=this.bars.at(-1);this.bars.push(bar);
  this.models=this.models.filter(m=>{
   if(!m.c3&&(m.dir||m.kind===2))m.c3={...bar};
   const bad=m.dir&&(m.dir===1?(this.mode==='Close'?bar.c<m.inv:bar.l<m.inv):(this.mode==='Close'?bar.c>m.inv:bar.h>m.inv));
   const reached=m.cp!=null&&m.dir&&(m.dir===1?bar.h>=m.cp:bar.l<=m.cp);
   if(bad||reached||this.life>0&&index-m.index>=this.life){this.retired.push({id:m.id,reason:bad&&reached?'ambiguous':bad?'invalid':reached?'target':'expiry'});return false;}
   if(m.kind===2&&m.dir!==this.bias){m.dir=this.bias;m.phase=0;m.resolved=bar.t;m.inv=m.dir===1?m.lo:m.dir===-1?m.hi:null;m.cp=null;}
   if(m.kind===3&&!m.dir){
    const lo=bar.l<=m.lo-.25,hi=bar.h>=m.hi+.25,inside=bar.c>m.lo&&bar.c<m.hi;
    if(lo&&hi&&inside){this.retired.push({id:m.id,reason:'ambiguous'});return false;}
    const direction=lo&&!hi&&inside?1:hi&&!lo&&inside?-1:bar.c>m.hi?1:bar.c<m.lo?-1:0;
    if(direction){m.dir=direction;m.phase=inside?1:2;m.resolved=bar.t;m.inv=direction===1?Math.min(bar.l,m.lo):Math.max(bar.h,m.hi);m.cp=inside?(direction===1?m.hi:m.lo):null;m.c3={...bar};if(inside&&(direction===1?bar.h>=m.cp:bar.l<=m.cp)){this.retired.push({id:m.id,reason:'ambiguous'});return false;}}
   }
   return true;
  });
  if(prior){
   const p=this.detect(prior,bar),crt=p.tsBull||p.tsBear,egf=p.engulfBull||p.engulfBear||p.outsideBar;
   const nested=this.models.some(m=>m.kind===3&&!m.dir&&bar.h<=m.hi&&bar.l>=m.lo),isb=p.insideBar&&!nested;
   if(crt||egf||isb){
    if(this.models.length>=this.limit)this.dropped++;
    else{
     const kind=crt?1:isb?3:2,dir=crt?(p.tsBull?1:-1):kind===2?this.bias:0;
     const hi=kind===2?Math.max(prior.h,bar.h):prior.h,lo=kind===2?Math.min(prior.l,bar.l):prior.l;
     if(crt&&(dir===1?bar.h>=hi:bar.l<=lo))this.retired.push({id:bar.t,reason:'ambiguous'});
     else this.models.push({id:bar.t,index,kind,flags:(crt?1:0)+(p.engulfBull||p.engulfBear?2:0)+(isb?4:0)+(p.outsideBar?8:0),dir,phase:crt?1:0,hi,lo,inv:dir===1?Math.min(bar.l,lo):dir===-1?Math.max(bar.h,hi):null,cp:crt?(dir===1?hi:lo):null,c1:{...prior},c2:{...bar},c3:null,resolved:dir?bar.t:null});
    }
   }
  }
  return this.snapshot();
 }
 snapshot(){return structuredClone(this.models);}
}
function pickIrl(model,zones){
 if(!model.dir)return null;
 for(const kind of [1,2]){
  const found=[...zones].reverse().find(z=>z.kind===kind&&z.hi<=model.hi&&z.lo>=model.lo&&z.dir===model.dir&&!z.filled);
  if(found)return found;
 }
 return null;
}
function pickErl(model,swings){
 const up=swings.filter(q=>q.side===1&&q.price>model.hi&&!q.consumed).map(q=>q.price);
 const down=swings.filter(q=>q.side===-1&&q.price<model.lo&&!q.consumed).map(q=>q.price);
 return {up:up.length?Math.min(...up):null,down:down.length?Math.max(...down):null};
}
module.exports={RegistrySpec,pickIrl,pickErl};
