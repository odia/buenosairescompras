(this.webpackJsonpweb=this.webpackJsonpweb||[]).push([[0],{12:function(e,t,n){"use strict";n.r(t);var r=n(1),c=n.n(r),s=n(4),a=n.n(s),i=n(2),u=n(0);var j=function(e){var t=e.text,n=e.progress;return Object(u.jsxs)("p",{children:[t||"Loading...",Object(u.jsx)("br",{}),void 0!==n&&Object(u.jsx)("input",{type:"range",value:1e3*n,readOnly:!0,name:"volume",min:"0",max:"1000",step:"1"}),void 0===n&&"unknown length"]})},b=function(e){var t=e.highlights.map((function(e,t,n){return 0===t?e.substring(e.length-40):t===n.length-1?e.substring(0,40):t%2===0?e.substring(0,40)+"..."+e.substring(e.length-40):Object(u.jsx)("b",{children:e})}));return Object(u.jsx)(u.Fragment,{children:t.map((function(e,t){return Object(u.jsx)("span",{children:e},t)}))})},l=function(e){var t=e.searchResults,n=e.search,c=Object(r.useState)(""),s=Object(i.a)(c,2),a=s[0],j=s[1];return Object(r.useEffect)((function(){a.length<3||n(a)}),[a,n]),Object(u.jsxs)(u.Fragment,{children:[Object(u.jsx)("input",{type:"text",value:a,onChange:function(e){return j(e.target.value)}}),t.length>0&&Object(u.jsx)("table",{children:t.map((function(e){return Object(u.jsxs)("tr",{children:[Object(u.jsx)("td",{children:Object(u.jsx)("a",{href:e.searchResult.id,target:"_blank",rel:"noreferrer",children:e.searchResult["tender/description"]})}),Object(u.jsx)("td",{children:e.searchResult["tender/title"]}),Object(u.jsx)("td",{children:e.searchResult["tender/description"]}),Object(u.jsx)("td",{children:Object(u.jsx)(b,{highlights:e.highlights})})]},e.searchResult.id)}))})]})},o=n(5),h=n.n(o),d=function(){var e=Object(r.useState)(),t=Object(i.a)(e,2),n=t[0],c=t[1],s=Object(r.useState)(!1),a=Object(i.a)(s,2),b=a[0],o=a[1],d=Object(r.useState)(!1),O=Object(i.a)(d,2),g=O[0],f=O[1],x=Object(r.useState)(!1),p=Object(i.a)(x,2),v=p[0],m=p[1],k=Object(r.useState)(null),S=Object(i.a)(k,2),w=S[0],F=S[1],R=Object(r.useState)([]),y=Object(i.a)(R,2),C=y[0],E=y[1];Object(r.useEffect)((function(){if(!w){var e=h()();F(e),e.addEventListener("message",(function(e){var t=e.data,n=[t[0],t[1]],r=n[0],s=n[1];if(r)switch(r){case"setFailed":f(s);break;case"setProgress":c(s);break;case"setReady":m(s);break;case"setSearchResults":E(s);break;default:console.error("unexpected message type: "+r)}}))}}),[w]);return Object(r.useEffect)((function(){!b&&w&&(o(!0),w.init())}),[b,w]),Object(u.jsx)(u.Fragment,{children:g?Object(u.jsxs)("p",{children:["Fall\xf3 la descarga",Object(u.jsx)("button",{onClick:function(){return setMinisearches([]),c(0),f(!1),o(!1),void m(!1)},children:"Reintentar"})]}):v?Object(u.jsx)(l,{searchResults:C,search:function(e){w.search(e)}}):Object(u.jsx)(j,{text:1===n?"Preparing...":"Downloading...",progress:n})})};var O=function(){var e=Object(r.useState)(!1),t=Object(i.a)(e,2),n=t[0],c=t[1];return Object(u.jsxs)(u.Fragment,{children:[!n&&Object(u.jsx)("button",{onClick:function(){return c(!0)},children:"Listo para descargar muchos megas de datos"}),n&&Object(u.jsx)(d,{})]})},g=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,13)).then((function(t){var n=t.getCLS,r=t.getFID,c=t.getFCP,s=t.getLCP,a=t.getTTFB;n(e),r(e),c(e),s(e),a(e)}))};a.a.render(Object(u.jsx)(c.a.StrictMode,{children:Object(u.jsx)(O,{})}),document.getElementById("root")),g()},5:function(e,t,n){var r=n(11),c=["init","search"];e.exports=function(){var e=new Worker(n.p+"c4ebd2b11f6d49570cad.worker.js",{name:"[hash].worker.js"});return r(e,c),e}}},[[12,1,2]]]);
//# sourceMappingURL=main.cecf8ec1.chunk.js.map