import{n as h,y as E,G as N,s as A,H as k}from"./scheduler.CfTqBbps.js";const p=[];function _(s,u){return{subscribe:O(s,u).subscribe}}function O(s,u=h){let f;const r=new Set;function a(t){if(A(s,t)&&(s=t,f)){const o=!p.length;for(const n of r)n[1](),p.push(n,s);if(o){for(let n=0;n<p.length;n+=2)p[n][0](p[n+1]);p.length=0}}}function e(t){a(t(s))}function l(t,o=h){const n=[t,o];return r.add(n),r.size===1&&(f=u(a,e)||h),t(s),()=>{r.delete(n),r.size===0&&f&&(f(),f=null)}}return{set:a,update:e,subscribe:l}}function G(s,u,f){const r=!Array.isArray(s),a=r?[s]:s;if(!a.every(Boolean))throw new Error("derived() expects stores as input, got a falsy value");const e=u.length<2;return _(f,(l,t)=>{let o=!1;const n=[];let i=0,b=h;const g=()=>{if(i)return;b();const y=u(r?n[0]:n,l,t);e?l(y):b=k(y)?y:h},c=a.map((y,w)=>E(y,I=>{n[w]=I,i&=~(1<<w),o&&g()},()=>{i|=1<<w}));return o=!0,g(),function(){N(c),b(),o=!1}})}function H(s){return{subscribe:s.subscribe.bind(s)}}const j=-1,m=-2,S=-3,T=-4,D=-5,q=-6;function R(s,u){return B(JSON.parse(s),u)}function B(s,u){if(typeof s=="number")return a(s,!0);if(!Array.isArray(s)||s.length===0)throw new Error("Invalid input");const f=s,r=Array(f.length);function a(e,l=!1){if(e===j)return;if(e===S)return NaN;if(e===T)return 1/0;if(e===D)return-1/0;if(e===q)return-0;if(l)throw new Error("Invalid input");if(e in r)return r[e];const t=f[e];if(!t||typeof t!="object")r[e]=t;else if(Array.isArray(t))if(typeof t[0]=="string"){const o=t[0],n=u==null?void 0:u[o];if(n)return r[e]=n(a(t[1]));switch(o){case"Date":r[e]=new Date(t[1]);break;case"Set":const i=new Set;r[e]=i;for(let c=1;c<t.length;c+=1)i.add(a(t[c]));break;case"Map":const b=new Map;r[e]=b;for(let c=1;c<t.length;c+=2)b.set(a(t[c]),a(t[c+1]));break;case"RegExp":r[e]=new RegExp(t[1],t[2]);break;case"Object":r[e]=Object(t[1]);break;case"BigInt":r[e]=BigInt(t[1]);break;case"null":const g=Object.create(null);r[e]=g;for(let c=1;c<t.length;c+=2)g[t[c]]=a(t[c+1]);break;default:throw new Error(`Unknown type ${o}`)}}else{const o=new Array(t.length);r[e]=o;for(let n=0;n<t.length;n+=1){const i=t[n];i!==m&&(o[n]=a(i))}}else{const o={};r[e]=o;for(const n in t){const i=t[n];o[n]=a(i)}}return r[e]}return a(0)}export{m as H,S as N,T as P,j as U,D as a,q as b,H as c,G as d,R as p,_ as r,B as u,O as w};
