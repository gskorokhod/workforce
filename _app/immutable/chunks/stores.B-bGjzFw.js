import{d as v,w as d}from"./index.RRcRCkg8.js";import{y as b}from"./scheduler.B1uOEMOA.js";let g,y;function S(n){if(typeof document>"u")return;clearTimeout(g),clearTimeout(y);const t=document.createElement("style"),s=document.createTextNode(`* {
     -webkit-transition: none !important;
     -moz-transition: none !important;
     -o-transition: none !important;
     -ms-transition: none !important;
     transition: none !important;
  }`);t.appendChild(s);const e=()=>document.head.appendChild(t),o=()=>document.head.removeChild(t);if(typeof window.getComputedStyle<"u"){e(),n(),window.getComputedStyle(t).opacity,o();return}if(typeof window.requestAnimationFrame<"u"){e(),n(),window.requestAnimationFrame(o);return}e(),g=window.setTimeout(()=>{n(),y=window.setTimeout(o,120)},120)}function w(n){return n.filter(t=>t.length>0)}const k={getItem:n=>null,setItem:(n,t)=>{}},l=typeof document<"u",L=["dark","light","system"],T=d("mode-watcher-mode"),C=d("mode-watcher-theme"),M=q(),V=K(),_=d(void 0),A=z(),E=d(!0),I=d([]),N=d([]),Q=D(),B=x();function q(){const n="system",t=l?localStorage:k,s=t.getItem(o());let e=p(s)?s:n;function o(){return b(T)}const{subscribe:u,set:r}=d(e,()=>{if(!l)return;const i=c=>{if(c.key!==o())return;const f=c.newValue;p(f)?r(e=f):r(e=n)};return addEventListener("storage",i),()=>removeEventListener("storage",i)});function a(i){r(e=i),t.setItem(o(),e)}return{subscribe:u,set:a}}function z(){const n=l?localStorage:k,t=n.getItem(e());let s=t??"";function e(){return b(C)}const{subscribe:o,set:u}=d(s,()=>{if(!l)return;const a=i=>{if(i.key!==e())return;const c=i.newValue;u(c===null?s="":s=c)};return addEventListener("storage",a),()=>removeEventListener("storage",a)});function r(a){u(s=a),n.setItem(e(),s)}return{subscribe:o,set:r}}function K(){let t=!0;const{subscribe:s,set:e}=d(void 0,()=>{if(!l)return;const r=i=>{t&&e(i.matches?"light":"dark")},a=window.matchMedia("(prefers-color-scheme: light)");return a.addEventListener("change",r),()=>a.removeEventListener("change",r)});function o(){if(!l)return;const r=window.matchMedia("(prefers-color-scheme: light)");e(r.matches?"light":"dark")}function u(r){t=r}return{subscribe:s,query:o,tracking:u}}function D(){const{subscribe:n}=v([M,V,_,E,I,N],([t,s,e,o,u,r])=>{if(!l)return;const a=t==="system"?s:t,i=w(u),c=w(r);function f(){const m=document.documentElement,h=document.querySelector('meta[name="theme-color"]');a==="light"?(i.length&&m.classList.remove(...i),c.length&&m.classList.add(...c),m.style.colorScheme="light",h&&e&&h.setAttribute("content",e.light)):(c.length&&m.classList.remove(...c),i.length&&m.classList.add(...i),m.style.colorScheme="dark",h&&e&&h.setAttribute("content",e.dark))}return o?S(f):f(),a});return{subscribe:n}}function x(){const{subscribe:n}=v([A,E],([t,s])=>{if(!l)return;function e(){document.documentElement.setAttribute("data-theme",t)}return s?S(e):e(),t});return{subscribe:n}}function p(n){return typeof n!="string"?!1:L.includes(n)}export{C as a,B as b,E as c,Q as d,_ as e,I as f,p as i,N as l,T as m,V as s,A as t,M as u};
