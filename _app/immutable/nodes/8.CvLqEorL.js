import{s as X,o as T,e as Q,a as z,c as L,b as O,g as A,f as I,m as y,i as j,h as W,p as P,q as Y,u as Z,r as x,v as ee,n as ie}from"../chunks/scheduler.CifE-UFa.js";import{S as te,i as ae,e as S,c as k,a as F,m as C,t as p,g as oe,b,f as re,d as V}from"../chunks/index.YRSh76gT.js";import{B as fe,s as se,T as ue}from"../chunks/index.DJ9jivjJ.js";import{w as ce}from"../chunks/index.CmTsz0B0.js";import{D as de,E as me,T as _e,C as ge,S as pe,c as he,a as G,P as be,b as $e,d as we}from"../chunks/table-header.DwiKIo6V.js";import{m as Ie}from"../chunks/index.BbcxlKRP.js";const ke=n=>({}),H=n=>({}),Fe=n=>({}),J=n=>({});function U(n){let e,a;return e=new _e({props:{sticky:!0,$$slots:{end:[Ee],middle:[ve],start:[Ve]},$$scope:{ctx:n}}}),{c(){k(e.$$.fragment)},l(s){F(e.$$.fragment,s)},m(s,t){C(e,s,t),a=!0},p(s,t){const o={};t&8388816&&(o.$$scope={dirty:t,ctx:s}),e.$set(o)},i(s){a||(p(e.$$.fragment,s),a=!0)},o(s){b(e.$$.fragment,s),a=!1},d(s){V(e,s)}}}function Ce(n){let e,a;return e=new we({}),{c(){k(e.$$.fragment)},l(s){F(e.$$.fragment,s)},m(s,t){C(e,s,t),a=!0},i(s){a||(p(e.$$.fragment,s),a=!0)},o(s){b(e.$$.fragment,s),a=!1},d(s){V(e,s)}}}function Ve(n){let e,a,s;e=new fe({props:{class:"text-muted-foreground hover:text-accent-foreground",size:"icon-xl",variant:"ghost",$$slots:{default:[Ce]},$$scope:{ctx:n}}}),e.$on("click",n[13]);const t=n[15].start,o=Y(t,n,n[23],H);return{c(){k(e.$$.fragment),a=z(),o&&o.c()},l(r){F(e.$$.fragment,r),a=A(r),o&&o.l(r)},m(r,d){C(e,r,d),j(r,a,d),o&&o.m(r,d),s=!0},p(r,d){const f={};d&8388608&&(f.$$scope={dirty:d,ctx:r}),e.$set(f),o&&o.p&&(!s||d&8388608)&&Z(o,t,r,r[23],s?ee(t,r[23],d,ke):x(r[23]),H)},i(r){s||(p(e.$$.fragment,r),p(o,r),s=!0)},o(r){b(e.$$.fragment,r),b(o,r),s=!1},d(r){r&&I(a),V(e,r),o&&o.d(r)}}}function ve(n){let e;const a=n[15].middle,s=Y(a,n,n[23],J);return{c(){s&&s.c()},l(t){s&&s.l(t)},m(t,o){s&&s.m(t,o),e=!0},p(t,o){s&&s.p&&(!e||o&8388608)&&Z(s,a,t,t[23],e?ee(a,t[23],o,Fe):x(t[23]),J)},i(t){e||(p(s,t),e=!0)},o(t){b(s,t),e=!1},d(t){s&&s.d(t)}}}function Ee(n){let e,a,s,t,o;function r(f){n[16](f)}let d={flatColumns:n[7]};return n[6]!==void 0&&(d.hideForId=n[6]),e=new ge({props:d}),T.push(()=>S(e,"hideForId",r)),t=new pe({props:{onInput:n[17]}}),{c(){k(e.$$.fragment),s=z(),k(t.$$.fragment)},l(f){F(e.$$.fragment,f),s=A(f),F(t.$$.fragment,f)},m(f,_){C(e,f,_),j(f,s,_),C(t,f,_),o=!0},p(f,_){const h={};_&128&&(h.flatColumns=f[7]),!a&&_&64&&(a=!0,h.hideForId=f[6],P(()=>a=!1)),e.$set(h);const m={};_&16&&(m.onInput=f[17]),t.$set(m)},i(f){o||(p(e.$$.fragment,f),p(t.$$.fragment,f),o=!0)},o(f){b(e.$$.fragment,f),b(t.$$.fragment,f),o=!1},d(f){f&&I(s),V(e,f),V(t,f)}}}function Ke(n){let e,a,s,t,o,r,d,f,_,h,m,v,$,u=n[1]&&U(n);function E(i){n[18](i)}function q(i){n[19](i)}function M(i){n[20](i)}function D(i){n[21](i)}let w={class:"w-full",columnInitializers:n[11],data:n[0],actions:n[3],defaultAction:n[12]};n[4]!==void 0&&(w.filterValue=n[4]),n[7]!==void 0&&(w.flatColumns=n[7]),n[6]!==void 0&&(w.hideForId=n[6]),n[5]!==void 0&&(w.sortKeys=n[5]),t=new de({props:w}),T.push(()=>S(t,"filterValue",E)),T.push(()=>S(t,"flatColumns",q)),T.push(()=>S(t,"hideForId",M)),T.push(()=>S(t,"sortKeys",D));function R(i){n[22](i)}let N={item:n[8],title:n[10]};return n[9]!==void 0&&(N.open=n[9]),m=new me({props:N}),T.push(()=>S(m,"open",R)),{c(){e=Q("div"),a=Q("div"),u&&u.c(),s=z(),k(t.$$.fragment),h=z(),k(m.$$.fragment),this.h()},l(i){e=L(i,"DIV",{class:!0});var c=O(e);a=L(c,"DIV",{class:!0});var g=O(a);u&&u.l(g),s=A(g),F(t.$$.fragment,g),g.forEach(I),c.forEach(I),h=A(i),F(m.$$.fragment,i),this.h()},h(){y(a,"class","mt-4 flex h-max w-full flex-col items-start justify-start overflow-y-scroll"),y(e,"class",_="flex flex-col items-start justify-start "+n[2])},m(i,c){j(i,e,c),W(e,a),u&&u.m(a,null),W(a,s),C(t,a,null),j(i,h,c),C(m,i,c),$=!0},p(i,[c]){i[1]?u?(u.p(i,c),c&2&&p(u,1)):(u=U(i),u.c(),p(u,1),u.m(a,s)):u&&(oe(),b(u,1,1,()=>{u=null}),re());const g={};c&1&&(g.data=i[0]),c&8&&(g.actions=i[3]),!o&&c&16&&(o=!0,g.filterValue=i[4],P(()=>o=!1)),!r&&c&128&&(r=!0,g.flatColumns=i[7],P(()=>r=!1)),!d&&c&64&&(d=!0,g.hideForId=i[6],P(()=>d=!1)),!f&&c&32&&(f=!0,g.sortKeys=i[5],P(()=>f=!1)),t.$set(g),(!$||c&4&&_!==(_="flex flex-col items-start justify-start "+i[2]))&&y(e,"class",_);const K={};c&256&&(K.item=i[8]),c&1024&&(K.title=i[10]),!v&&c&512&&(v=!0,K.open=i[9],P(()=>v=!1)),m.$set(K)},i(i){$||(p(u),p(t.$$.fragment,i),p(m.$$.fragment,i),$=!0)},o(i){b(u),b(t.$$.fragment,i),b(m.$$.fragment,i),$=!1},d(i){i&&(I(e),I(h)),u&&u.d(),V(t),V(m,i)}}}function Te(n,e,a){let{$$slots:s={},$$scope:t}=e,{data:o}=e,{header:r=!0}=e,{state:d=se}=e,f=new Map,_=ce(""),h=he([]),m={},v,{class:$=""}=e,u,E=!1,q="Edit Person",M=[{accessor:l=>l,cell:l=>G(be,{item:l.value}),header:"Picture",id:"picture",plugins:{sort:{disable:!0},tableFilter:{disable:!0}}},{accessor:l=>l.name,header:"Name",id:"name"},{accessor:l=>Ie(l.min.people,l.max.people,"people"),header:"Required Workers",id:"capacity"},{accessor:l=>l.qualifications,cell:l=>G($e,{items:l.value,placeholder:"No Qualifications"}),header:"Required Qualifications",id:"qualifications",plugins:{sort:{getSortValue:l=>l.map(B=>B.name).join(" ")},tableFilter:{getFilterValue:l=>l.map(B=>B.name).join(" ")}}}],{actions:D=new Map([...f,["Edit",l=>w(l)],["Delete",l=>l.delete()]])}=e;function w(l){a(10,q="Edit Task"),a(8,u=l.get()),a(9,E=!0)}function R(){a(10,q="Create new Location"),a(8,u=new ue({},d)),a(9,E=!0)}function N(l){m=l,a(6,m)}const i=l=>_.set(l);function c(l){_=l,a(4,_)}function g(l){v=l,a(7,v)}function K(l){m=l,a(6,m)}function ne(l){h=l,a(5,h)}function le(l){E=l,a(9,E)}return n.$$set=l=>{"data"in l&&a(0,o=l.data),"header"in l&&a(1,r=l.header),"state"in l&&a(14,d=l.state),"class"in l&&a(2,$=l.class),"actions"in l&&a(3,D=l.actions),"$$scope"in l&&a(23,t=l.$$scope)},[o,r,$,D,_,h,m,v,u,E,q,M,w,R,d,s,N,i,c,g,K,ne,le,t]}class Pe extends te{constructor(e){super(),ae(this,e,Te,Ke,X,{data:0,header:1,state:14,class:2,actions:3})}}function Se(n){let e,a,s;return a=new Pe({props:{data:n[0],class:"h-full w-full"}}),{c(){e=Q("main"),k(a.$$.fragment),this.h()},l(t){e=L(t,"MAIN",{class:!0});var o=O(e);F(a.$$.fragment,o),o.forEach(I),this.h()},h(){y(e,"class","h-full w-full")},m(t,o){j(t,e,o),C(a,e,null),s=!0},p:ie,i(t){s||(p(a.$$.fragment,t),s=!0)},o(t){b(a.$$.fragment,t),s=!1},d(t){t&&I(e),V(a)}}}function qe(n){return[se.tasks]}class Me extends te{constructor(e){super(),ae(this,e,qe,Se,X,{})}}export{Me as component};
