import{s as L,w as F,x as I,e as Q,a as R,c as W,b as X,g as N,f as y,r as M,i as A,h as ne,o as le,u as ie,p as oe,q as re,n as de}from"../chunks/scheduler.CfTqBbps.js";import{S as x,i as ee,e as C,c as v,a as K,m as S,t as w,b as V,d as P}from"../chunks/index.BMQpolGU.js";import{D as me,c as z,R as ce,a as fe,C as _e}from"../chunks/column-hide-selector.DxLTjeiX.js";import{C as ge}from"../chunks/constraints-for-list.mitfACEy.js";import{a as pe,P as he}from"../chunks/task-badge.BfYk71nd.js";import{S as be}from"../chunks/skills-list.B5NyDCE7.js";import{t as Y,m as te,p as ke}from"../chunks/person.DEL9NjrQ.js";import{g as Fe,a as Ie,d as J,c as Ce}from"../chunks/task.BAsfaQWs.js";import{d as we,B as Ve}from"../chunks/index.DhF70wyd.js";import{w as Z}from"../chunks/parse.iudxBx5H.js";import{T as ve}from"../chunks/task-edit-dialog.2VvQxjV0.js";import{T as Ke}from"../chunks/top_bar.BR58X00F.js";import{S as Se,d as Pe}from"../chunks/search.CbyWi5od.js";function Te(t){let e,a,l,n,i,o;function m(u){t[8](u)}function f(u){t[9](u)}function _(u){t[10](u)}function b(u){t[11](u)}let c={class:t[5],columnInitializers:t[6],data:t[4]};return t[0]!==void 0&&(c.filterValue=t[0]),t[3]!==void 0&&(c.flatColumns=t[3]),t[2]!==void 0&&(c.hideForId=t[2]),t[1]!==void 0&&(c.sortKeys=t[1]),e=new me({props:c}),F.push(()=>C(e,"filterValue",m)),F.push(()=>C(e,"flatColumns",f)),F.push(()=>C(e,"hideForId",_)),F.push(()=>C(e,"sortKeys",b)),{c(){v(e.$$.fragment)},l(u){K(e.$$.fragment,u)},m(u,g){S(e,u,g),o=!0},p(u,[g]){const h={};g&32&&(h.class=u[5]),g&16&&(h.data=u[4]),!a&&g&1&&(a=!0,h.filterValue=u[0],I(()=>a=!1)),!l&&g&8&&(l=!0,h.flatColumns=u[3],I(()=>l=!1)),!n&&g&4&&(n=!0,h.hideForId=u[2],I(()=>n=!1)),!i&&g&2&&(i=!0,h.sortKeys=u[1],I(()=>i=!1)),e.$set(h)},i(u){o||(w(e.$$.fragment,u),o=!0)},o(u){V(e.$$.fragment,u),o=!1},d(u){P(e,u)}}}function ye(t,e,a){let{data:l=Y}=e,{actions:n=new Map}=e,{filterValue:i=Z("")}=e,{sortKeys:o=fe([])}=e,{hideForId:m={}}=e,{flatColumns:f}=e,{class:_=""}=e,b=[{accessor:s=>s,cell:s=>z(pe,{task:s.value}),header:"Icon",id:"icon",plugins:{sort:{disable:!0},tableFilter:{disable:!0}}},{accessor:"name",cell:s=>we(s.value),header:"Name",id:"name"},{accessor:"description",header:"Description",id:"description"},{accessor:s=>Fe(s),cell:s=>z(he,{compact:!0,people:s.value}),header:"Assigned people",id:"people",plugins:{sort:{getSortValue:s=>s.map(k=>k.name).join(" ")},tableFilter:{getFilterValue:s=>s.map(k=>k.name).join(" ")}}},{accessor:s=>Ie(s),cell:s=>z(be,{compact:!0,skills:s.value}),header:"Required skills",id:"required_skills",plugins:{sort:{getSortValue:s=>s.map(k=>k.name).join(" ")},tableFilter:{getFilterValue:s=>s.map(k=>k.name).join(" ")}}},{accessor:s=>s,cell:s=>z(ge,{forOperand:s.value}),header:"Constraints",id:"constraints",plugins:{sort:{getSortValue:s=>te(s).map(k=>k.type).join(" ")},tableFilter:{getFilterValue:s=>te(s).map(k=>k.type).join(" ")}}}];n.size>0&&b.push({accessor:s=>s,cell:s=>z(ce,{actions:n,item:s.value}),header:"Actions",id:"actions",plugins:{sort:{disable:!0},tableFilter:{disable:!0}}});function c(s){i=s,a(0,i)}function u(s){f=s,a(3,f)}function g(s){m=s,a(2,m)}function h(s){o=s,a(1,o)}return t.$$set=s=>{"data"in s&&a(4,l=s.data),"actions"in s&&a(7,n=s.actions),"filterValue"in s&&a(0,i=s.filterValue),"sortKeys"in s&&a(1,o=s.sortKeys),"hideForId"in s&&a(2,m=s.hideForId),"flatColumns"in s&&a(3,f=s.flatColumns),"class"in s&&a(5,_=s.class)},[i,o,m,f,l,_,b,n,c,u,g,h]}class $e extends x{constructor(e){super(),ee(this,e,ye,Te,L,{data:4,actions:7,filterValue:0,sortKeys:1,hideForId:2,flatColumns:3,class:5})}}const je=t=>({}),ae=t=>({}),De=t=>({}),se=t=>({});function qe(t){let e,a;return e=new Pe({}),{c(){v(e.$$.fragment)},l(l){K(e.$$.fragment,l)},m(l,n){S(e,l,n),a=!0},i(l){a||(w(e.$$.fragment,l),a=!0)},o(l){V(e.$$.fragment,l),a=!1},d(l){P(e,l)}}}function ze(t){let e,a,l;e=new Ve({props:{class:"text-muted-foreground hover:text-accent-foreground",size:"icon_xl",variant:"ghost",$$slots:{default:[qe]},$$scope:{ctx:t}}}),e.$on("click",t[9]);const n=t[11].start,i=le(n,t,t[20],ae);return{c(){v(e.$$.fragment),a=R(),i&&i.c()},l(o){K(e.$$.fragment,o),a=N(o),i&&i.l(o)},m(o,m){S(e,o,m),A(o,a,m),i&&i.m(o,m),l=!0},p(o,m){const f={};m&1048576&&(f.$$scope={dirty:m,ctx:o}),e.$set(f),i&&i.p&&(!l||m&1048576)&&ie(i,n,o,o[20],l?re(n,o[20],m,je):oe(o[20]),ae)},i(o){l||(w(e.$$.fragment,o),w(i,o),l=!0)},o(o){V(e.$$.fragment,o),V(i,o),l=!1},d(o){o&&y(a),P(e,o),i&&i.d(o)}}}function Ae(t){let e;const a=t[11].middle,l=le(a,t,t[20],se);return{c(){l&&l.c()},l(n){l&&l.l(n)},m(n,i){l&&l.m(n,i),e=!0},p(n,i){l&&l.p&&(!e||i&1048576)&&ie(l,a,n,n[20],e?re(a,n[20],i,De):oe(n[20]),se)},i(n){e||(w(l,n),e=!0)},o(n){V(l,n),e=!1},d(n){l&&l.d(n)}}}function Ee(t){let e,a,l,n,i;function o(f){t[12](f)}let m={flatColumns:t[4]};return t[5]!==void 0&&(m.hideForId=t[5]),e=new _e({props:m}),F.push(()=>C(e,"hideForId",o)),n=new Se({props:{onInput:t[13]}}),{c(){v(e.$$.fragment),l=R(),v(n.$$.fragment)},l(f){K(e.$$.fragment,f),l=N(f),K(n.$$.fragment,f)},m(f,_){S(e,f,_),A(f,l,_),S(n,f,_),i=!0},p(f,_){const b={};_&16&&(b.flatColumns=f[4]),!a&&_&32&&(a=!0,b.hideForId=f[5],I(()=>a=!1)),e.$set(b);const c={};_&4&&(c.onInput=f[13]),n.$set(c)},i(f){i||(w(e.$$.fragment,f),w(n.$$.fragment,f),i=!0)},o(f){V(e.$$.fragment,f),V(n.$$.fragment,f),i=!1},d(f){f&&y(l),P(e,f),P(n,f)}}}function Re(t){let e,a,l,n,i,o,m,f,_,b,c,u,g,h;a=new Ke({props:{sticky:!0,$$slots:{end:[Ee],middle:[Ae],start:[ze]},$$scope:{ctx:t}}});function s(r){t[14](r)}function k(r){t[15](r)}function U(r){t[16](r)}function B(r){t[17](r)}let $={actions:t[10],class:"w-full",data:t[0]};t[2]!==void 0&&($.filterValue=t[2]),t[4]!==void 0&&($.flatColumns=t[4]),t[5]!==void 0&&($.hideForId=t[5]),t[3]!==void 0&&($.sortKeys=t[3]),n=new $e({props:$}),F.push(()=>C(n,"filterValue",s)),F.push(()=>C(n,"flatColumns",k)),F.push(()=>C(n,"hideForId",U)),F.push(()=>C(n,"sortKeys",B));function O(r){t[18](r)}function G(r){t[19](r)}let D={onSubmit:t[8]};return t[6]!==void 0&&(D.open=t[6]),t[7]!==void 0&&(D.taskProps=t[7]),c=new ve({props:D}),F.push(()=>C(c,"open",O)),F.push(()=>C(c,"taskProps",G)),{c(){e=Q("div"),v(a.$$.fragment),l=R(),v(n.$$.fragment),b=R(),v(c.$$.fragment),this.h()},l(r){e=W(r,"DIV",{class:!0});var p=X(e);K(a.$$.fragment,p),l=N(p),K(n.$$.fragment,p),p.forEach(y),b=N(r),K(c.$$.fragment,r),this.h()},h(){M(e,"class",_="flex h-full w-full flex-col items-start justify-start overflow-y-scroll "+t[1])},m(r,p){A(r,e,p),S(a,e,null),ne(e,l),S(n,e,null),A(r,b,p),S(c,r,p),h=!0},p(r,[p]){const E={};p&1048628&&(E.$$scope={dirty:p,ctx:r}),a.$set(E);const T={};p&1&&(T.data=r[0]),!i&&p&4&&(i=!0,T.filterValue=r[2],I(()=>i=!1)),!o&&p&16&&(o=!0,T.flatColumns=r[4],I(()=>o=!1)),!m&&p&32&&(m=!0,T.hideForId=r[5],I(()=>m=!1)),!f&&p&8&&(f=!0,T.sortKeys=r[3],I(()=>f=!1)),n.$set(T),(!h||p&2&&_!==(_="flex h-full w-full flex-col items-start justify-start overflow-y-scroll "+r[1]))&&M(e,"class",_);const d={};!u&&p&64&&(u=!0,d.open=r[6],I(()=>u=!1)),!g&&p&128&&(g=!0,d.taskProps=r[7],I(()=>g=!1)),c.$set(d)},i(r){h||(w(a.$$.fragment,r),w(n.$$.fragment,r),w(c.$$.fragment,r),h=!0)},o(r){V(a.$$.fragment,r),V(n.$$.fragment,r),V(c.$$.fragment,r),h=!1},d(r){r&&(y(e),y(b)),P(a),P(n),P(c,r)}}}function Ne(t,e,a){let{$$slots:l={},$$scope:n}=e,{data:i=Y}=e,o=Z(""),m=fe([]),f,_={},{class:b=""}=e,c=!1,u,g=Z(J());function h(d){u=d.uuid,g.set(d),a(6,c=!0)}function s(d){ke(d)}function k(d){Y.update(j=>{if(u!==void 0){const q=j.findIndex(H=>H.uuid===u);if(q!==-1){console.log("Updating index: ",q);const H=j[q];return j[q]={...H,...d},console.log(j[q]),j}}let ue=Ce(d);return j.push(ue),j}),g.set(J()),u=void 0,a(6,c=!1)}function U(){g.set(J()),u=void 0,a(6,c=!0)}const B=new Map([["Delete",s],["Edit",h]]);function $(d){_=d,a(5,_)}const O=d=>o.set(d);function G(d){o=d,a(2,o)}function D(d){f=d,a(4,f)}function r(d){_=d,a(5,_)}function p(d){m=d,a(3,m)}function E(d){c=d,a(6,c)}function T(d){g=d,a(7,g)}return t.$$set=d=>{"data"in d&&a(0,i=d.data),"class"in d&&a(1,b=d.class),"$$scope"in d&&a(20,n=d.$$scope)},[i,b,o,m,f,_,c,g,k,U,B,l,$,O,G,D,r,p,E,T,n]}class Me extends x{constructor(e){super(),ee(this,e,Ne,Re,L,{data:0,class:1})}}function Ue(t){let e,a,l,n;return l=new Me({}),{c(){e=Q("div"),a=Q("main"),v(l.$$.fragment),this.h()},l(i){e=W(i,"DIV",{class:!0});var o=X(e);a=W(o,"MAIN",{class:!0});var m=X(a);K(l.$$.fragment,m),m.forEach(y),o.forEach(y),this.h()},h(){M(a,"class","h-dvh w-full p-4"),M(e,"class","w-full bg-gray-50")},m(i,o){A(i,e,o),ne(e,a),S(l,a,null),n=!0},p:de,i(i){n||(w(l.$$.fragment,i),n=!0)},o(i){V(l.$$.fragment,i),n=!1},d(i){i&&y(e),P(l)}}}class tt extends x{constructor(e){super(),ee(this,e,null,Ue,L,{})}}export{tt as component};
