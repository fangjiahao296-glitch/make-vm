import {mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
function run(prog,inp){
const st=new Array(257);let sp=0;
const cs=new Array(65);let cp=0;
const mem=new Int32Array(256);
const out=[];
let pc=0,ip=0,steps=0,a=0,b=0,v=0,off=0,s='';
const n=prog.length;
const done=c=>({out:Buffer.from(out),code:c});
for(;;){
if(steps>=1000000)return done(10);
if(pc<0||pc>=n)return done(9);
const op=prog[pc];
switch(op){
case 0:return done(0);
case 1:
if(pc+2>n)return done(9);
if(sp>=256)return done(3);
v=prog[pc+1];if(v>=128)v-=256;
st[sp++]=v;pc+=2;break;
case 2:
if(pc+5>n)return done(9);
if(sp>=256)return done(3);
v=prog[pc+1]|prog[pc+2]<<8|prog[pc+3]<<16|prog[pc+4]<<24;
st[sp++]=v;pc+=5;break;
case 3:
if(sp<1)return done(2);
sp--;pc++;break;
case 4:
if(sp<1)return done(2);
if(sp>=256)return done(3);
st[sp]=st[sp-1];sp++;pc++;break;
case 5:
if(sp<2)return done(2);
v=st[sp-1];st[sp-1]=st[sp-2];st[sp-2]=v;pc++;break;
case 6:
if(sp<2)return done(2);
if(sp>=256)return done(3);
st[sp]=st[sp-2];sp++;pc++;break;
case 7:
if(sp<3)return done(2);
a=st[sp-3];b=st[sp-2];v=st[sp-1];
st[sp-3]=b;st[sp-2]=v;st[sp-1]=a;pc++;break;
case 16:
if(sp<2)return done(2);
b=st[--sp];a=st[--sp];st[sp++]=(a+b)|0;pc++;break;
case 17:
if(sp<2)return done(2);
b=st[--sp];a=st[--sp];st[sp++]=(a-b)|0;pc++;break;
case 18:
if(sp<2)return done(2);
b=st[--sp];a=st[--sp];st[sp++]=Math.imul(a,b);pc++;break;
case 19:
if(sp<2)return done(2);
b=st[sp-1];a=st[sp-2];
if(b===0)return done(4);
sp-=2;st[sp++]=Math.trunc(a/b)|0;pc++;break;
case 20:
if(sp<2)return done(2);
b=st[sp-1];a=st[sp-2];
if(b===0)return done(4);
sp-=2;st[sp++]=(a%b)|0;pc++;break;
case 21:
if(sp<2)return done(2);
b=st[sp-1];a=st[sp-2];
if((b>>>0)===0)return done(4);
sp-=2;st[sp++]=Math.trunc((a>>>0)/(b>>>0))|0;pc++;break;
case 22:
if(sp<2)return done(2);
b=st[sp-1];a=st[sp-2];
if((b>>>0)===0)return done(4);
sp-=2;st[sp++]=((a>>>0)%(b>>>0))|0;pc++;break;
case 23:
if(sp<1)return done(2);
st[sp-1]=(-st[sp-1])|0;pc++;break;
case 24:
if(sp<2)return done(2);
b=st[--sp];a=st[--sp];st[sp++]=a&b;pc++;break;
case 25:
if(sp<2)return done(2);
b=st[--sp];a=st[--sp];st[sp++]=a|b;pc++;break;
case 26:
if(sp<2)return done(2);
b=st[--sp];a=st[--sp];st[sp++]=a^b;pc++;break;
case 27:
if(sp<1)return done(2);
st[sp-1]=~st[sp-1];pc++;break;
case 28:
if(sp<2)return done(2);
b=st[--sp];a=st[--sp];st[sp++]=a<<(b&31);pc++;break;
case 29:
if(sp<2)return done(2);
b=st[--sp];a=st[--sp];st[sp++]=a>>(b&31);pc++;break;
case 30:
if(sp<2)return done(2);
b=st[--sp];a=st[--sp];st[sp++]=(a>>>(b&31))|0;pc++;break;
case 32:
if(sp<2)return done(2);
b=st[--sp];a=st[--sp];st[sp++]=a===b?1:0;pc++;break;
case 33:
if(sp<2)return done(2);
b=st[--sp];a=st[--sp];st[sp++]=a<b?1:0;pc++;break;
case 34:
if(sp<2)return done(2);
b=st[--sp];a=st[--sp];st[sp++]=(a>>>0)<(b>>>0)?1:0;pc++;break;
case 48:
if(pc+3>n)return done(9);
off=prog[pc+1]|prog[pc+2]<<8;
if(off>=32768)off-=65536;
pc=pc+3+off;break;
case 49:
if(pc+3>n)return done(9);
if(sp<1)return done(2);
v=st[--sp];
off=prog[pc+1]|prog[pc+2]<<8;
if(off>=32768)off-=65536;
pc=v===0?pc+3+off:pc+3;break;
case 50:
if(pc+3>n)return done(9);
if(sp<1)return done(2);
v=st[--sp];
off=prog[pc+1]|prog[pc+2]<<8;
if(off>=32768)off-=65536;
pc=v!==0?pc+3+off:pc+3;break;
case 51:
if(pc+3>n)return done(9);
if(cp>=64)return done(7);
cs[cp++]=pc+3;
pc=prog[pc+1]|prog[pc+2]<<8;break;
case 52:
if(cp===0)return done(8);
pc=cs[--cp];break;
case 64:
if(sp<1)return done(2);
v=st[sp-1];
if(v<0||v>255)return done(6);
st[sp-1]=mem[v];pc++;break;
case 65:
if(sp<2)return done(2);
v=st[sp-1];a=st[sp-2];
if(v<0||v>255)return done(6);
mem[v]=a;sp-=2;pc++;break;
case 80:
if(sp<1)return done(2);
v=st[--sp];s=String(v);
if(out.length+s.length>65536)return done(11);
for(const c of s)out.push(c.charCodeAt(0));
pc++;break;
case 81:
if(sp<1)return done(2);
v=st[--sp];
if(out.length+1>65536)return done(11);
out.push(v&255);pc++;break;
case 82:
if(sp>=256)return done(3);
st[sp++]=ip<inp.length?inp[ip++]:-1;pc++;break;
case 83:
if(sp<1)return done(2);
v=st[--sp];
return done(v&255);
default:return done(5);
}
steps++;
}
}
const I=process.env.MAKEFUN_INPUT_DIR??'/input';
const O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
for(const id of readdirSync(I).sort()){
const prog=readFileSync(join(I,id,'program.bin'));
let inp;
try{inp=readFileSync(join(I,id,'input.bin'));}catch{inp=Buffer.alloc(0);}
const r=run(prog,inp);
mkdirSync(join(O,id),{recursive:true});
writeFileSync(join(O,id,'stdout.bin'),r.out);
writeFileSync(join(O,id,'exit.txt'),r.code+'\n');
}
