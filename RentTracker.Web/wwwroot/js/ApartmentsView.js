(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["ApartmentsView"],{"014b":function(t,e,n){"use strict";var a=n("e53d"),r=n("07e3"),i=n("8e60"),s=n("63b6"),c=n("9138"),o=n("ebfd").KEY,l=n("294c"),u=n("dbdb"),f=n("45f2"),p=n("62a0"),m=n("5168"),d=n("ccb9"),b=n("6718"),h=n("47ee"),v=n("9003"),y=n("e4ae"),g=n("f772"),w=n("241e"),x=n("36c3"),O=n("1bc3"),C=n("aebd"),_=n("a159"),j=n("0395"),A=n("bf0b"),S=n("9aa9"),k=n("d9f6"),F=n("c3a1"),E=A.f,P=k.f,D=j.f,$=a.Symbol,N=a.JSON,I=N&&N.stringify,R="prototype",z=m("_hidden"),J=m("toPrimitive"),L={}.propertyIsEnumerable,T=u("symbol-registry"),q=u("symbols"),M=u("op-symbols"),U=Object[R],K="function"==typeof $&&!!S.f,W=a.QObject,B=!W||!W[R]||!W[R].findChild,V=i&&l(function(){return 7!=_(P({},"a",{get:function(){return P(this,"a",{value:7}).a}})).a})?function(t,e,n){var a=E(U,e);a&&delete U[e],P(t,e,n),a&&t!==U&&P(U,e,a)}:P,Y=function(t){var e=q[t]=_($[R]);return e._k=t,e},G=K&&"symbol"==typeof $.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof $},H=function(t,e,n){return t===U&&H(M,e,n),y(t),e=O(e,!0),y(n),r(q,e)?(n.enumerable?(r(t,z)&&t[z][e]&&(t[z][e]=!1),n=_(n,{enumerable:C(0,!1)})):(r(t,z)||P(t,z,C(1,{})),t[z][e]=!0),V(t,e,n)):P(t,e,n)},Q=function(t,e){y(t);var n,a=h(e=x(e)),r=0,i=a.length;while(i>r)H(t,n=a[r++],e[n]);return t},X=function(t,e){return void 0===e?_(t):Q(_(t),e)},Z=function(t){var e=L.call(this,t=O(t,!0));return!(this===U&&r(q,t)&&!r(M,t))&&(!(e||!r(this,t)||!r(q,t)||r(this,z)&&this[z][t])||e)},tt=function(t,e){if(t=x(t),e=O(e,!0),t!==U||!r(q,e)||r(M,e)){var n=E(t,e);return!n||!r(q,e)||r(t,z)&&t[z][e]||(n.enumerable=!0),n}},et=function(t){var e,n=D(x(t)),a=[],i=0;while(n.length>i)r(q,e=n[i++])||e==z||e==o||a.push(e);return a},nt=function(t){var e,n=t===U,a=D(n?M:x(t)),i=[],s=0;while(a.length>s)!r(q,e=a[s++])||n&&!r(U,e)||i.push(q[e]);return i};K||($=function(){if(this instanceof $)throw TypeError("Symbol is not a constructor!");var t=p(arguments.length>0?arguments[0]:void 0),e=function(n){this===U&&e.call(M,n),r(this,z)&&r(this[z],t)&&(this[z][t]=!1),V(this,t,C(1,n))};return i&&B&&V(U,t,{configurable:!0,set:e}),Y(t)},c($[R],"toString",function(){return this._k}),A.f=tt,k.f=H,n("6abf").f=j.f=et,n("355d").f=Z,S.f=nt,i&&!n("b8e3")&&c(U,"propertyIsEnumerable",Z,!0),d.f=function(t){return Y(m(t))}),s(s.G+s.W+s.F*!K,{Symbol:$});for(var at="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),rt=0;at.length>rt;)m(at[rt++]);for(var it=F(m.store),st=0;it.length>st;)b(it[st++]);s(s.S+s.F*!K,"Symbol",{for:function(t){return r(T,t+="")?T[t]:T[t]=$(t)},keyFor:function(t){if(!G(t))throw TypeError(t+" is not a symbol!");for(var e in T)if(T[e]===t)return e},useSetter:function(){B=!0},useSimple:function(){B=!1}}),s(s.S+s.F*!K,"Object",{create:X,defineProperty:H,defineProperties:Q,getOwnPropertyDescriptor:tt,getOwnPropertyNames:et,getOwnPropertySymbols:nt});var ct=l(function(){S.f(1)});s(s.S+s.F*ct,"Object",{getOwnPropertySymbols:function(t){return S.f(w(t))}}),N&&s(s.S+s.F*(!K||l(function(){var t=$();return"[null]"!=I([t])||"{}"!=I({a:t})||"{}"!=I(Object(t))})),"JSON",{stringify:function(t){var e,n,a=[t],r=1;while(arguments.length>r)a.push(arguments[r++]);if(n=e=a[1],(g(e)||void 0!==t)&&!G(t))return v(e)||(e=function(t,e){if("function"==typeof n&&(e=n.call(this,t,e)),!G(e))return e}),a[1]=e,I.apply(N,a)}}),$[R][J]||n("35e8")($[R],J,$[R].valueOf),f($,"Symbol"),f(Math,"Math",!0),f(a.JSON,"JSON",!0)},"0395":function(t,e,n){var a=n("36c3"),r=n("6abf").f,i={}.toString,s="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],c=function(t){try{return r(t)}catch(e){return s.slice()}};t.exports.f=function(t){return s&&"[object Window]"==i.call(t)?c(t):r(a(t))}},"0942":function(t,e,n){"use strict";var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"field"},[t.label?n("label",{staticClass:"block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"},[t._v("\n    "+t._s(t.label)+"\n  ")]):t._e(),t._t("default")],2)},r=[],i={name:"RField",inheritAttrs:!0,props:{label:{type:String,default:null}}},s=i,c=n("2877"),o=Object(c["a"])(s,a,r,!1,null,null,null);e["a"]=o.exports},"14aa":function(t,e,n){},"15ef":function(t,e,n){},"18d5":function(t,e,n){"use strict";var a=n("15ef"),r=n.n(a);r.a},"268f":function(t,e,n){t.exports=n("fde4")},"2ab7":function(t,e,n){"use strict";var a=n("8c9c"),r=n.n(a);r.a},"32a6":function(t,e,n){var a=n("241e"),r=n("c3a1");n("ce7e")("keys",function(){return function(t){return r(a(t))}})},"355d":function(t,e){e.f={}.propertyIsEnumerable},"454f":function(t,e,n){n("46a7");var a=n("584a").Object;t.exports=function(t,e,n){return a.defineProperty(t,e,n)}},"46a7":function(t,e,n){var a=n("63b6");a(a.S+a.F*!n("8e60"),"Object",{defineProperty:n("d9f6").f})},"47ee":function(t,e,n){var a=n("c3a1"),r=n("9aa9"),i=n("355d");t.exports=function(t){var e=a(t),n=r.f;if(n){var s,c=n(t),o=i.f,l=0;while(c.length>l)o.call(t,s=c[l++])&&e.push(s)}return e}},"5b7c":function(t,e,n){"use strict";var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return t.active?n("div",{staticClass:"modal-container fixed top-0 right-0 w-screen h-screen overflow-auto flex flex-col justify-center items-center"},[n("div",{staticClass:"modal-backdrop absolute top-0 right-0 w-screen h-screen bg-gray-700 opacity-75",on:{click:t.close}}),n("div",{staticClass:"modal-content max-w-full h-full md:h-auto flex flex-col bg-white rounded shadow-lg",class:t.contentClass},[n("div",{staticClass:"modal-header"},[t._t("header")],2),n("div",{staticClass:"modal-body flex-grow md:flex-grow-0"},[t._t("default")],2),n("div",{staticClass:"modal-footer"},[t._t("footer")],2)])]):t._e()},r=[],i={name:"RModal",props:{active:{type:Boolean,required:!0},size:{type:String,default:"md"}},computed:{contentClass:function(){var t=[];switch(this.size){case"md":t.push("modal-size-md")}return t.join(" ")}},methods:{close:function(){this.$emit("close")}}},s=i,c=(n("b11f"),n("2877")),o=Object(c["a"])(s,a,r,!1,null,"6b5ed9fd",null);e["a"]=o.exports},6718:function(t,e,n){var a=n("e53d"),r=n("584a"),i=n("b8e3"),s=n("ccb9"),c=n("d9f6").f;t.exports=function(t){var e=r.Symbol||(r.Symbol=i?{}:a.Symbol||{});"_"==t.charAt(0)||t in e||c(e,t,{value:s.f(t)})}},6919:function(t,e,n){"use strict";n.r(e);var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"h-full flex flex-col flex-grow md:p-4"},[t.isLoading?n("loading-indicator"):n("div",{staticClass:"flex flex-wrap items-center"},[t.activeApartment?t._e():n("div",{staticClass:"w-full px-6 py-4 text-xl font-semibold text-gray-700"},[t._v("Select an apartment to continue")]),t._l(t.apartments,function(e){return n("apartment-card",{key:e.id,attrs:{apartment:e},on:{"apartment:edit":t.editApartment}})})],2),n("div",{staticClass:"mt-auto flex justify-center px-2"},[n("r-field",[n("button",{staticClass:"btn btn-outline-primary",on:{click:t.newApartment}},[n("span",{staticClass:"icon pr-2"},[n("i",{staticClass:"fas fa-plus"})]),t._v("New apartment")])])],1),n("apartment-form",{attrs:{visible:t.showForm,apartment:t.selectedApartment},on:{close:t.closeForm,"apartment:saved":t.apartmentSaved}})],1)},r=[],i=n("cebc"),s=n("2f62"),c=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"apartment-card w-full sm:max-w-sm cursor-pointer flex p-4",class:{active:t.isActive}},[n("div",{staticClass:"card-body w-full relative rounded overflow-hidden shadow-lg hover:shadow-xl"},[n("img",{staticClass:"w-full",attrs:{src:t.apartment.headerUrl,alt:"Sunset in the mountains"},on:{click:function(e){return t.selectApartment(t.apartment)}}}),n("div",{staticClass:"py-2 px-4 pb-0"},[n("div",{staticClass:"font-bold text-xl mb-2 text-gray-700"},[t._v(t._s(t.apartment.name))])]),n("div",{staticClass:"flex justify-start items-center pl-4 pr-2 py-2"},[t.isActive?t._e():n("button",{staticClass:"btn btn-primary size-sm mr-2",on:{click:function(e){return t.selectApartment(t.apartment)}}},[t._m(0),t._v("Select")]),n("button",{staticClass:"btn btn-outline-secondary size-sm ml-auto",on:{click:function(e){return t.openApartment(t.apartment)}}},[n("i",{staticClass:"fas fa-pen"})])])])])},o=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("span",{staticClass:"icon pr-2"},[n("i",{staticClass:"fas fa-map-marker-alt"})])}],l={name:"ApartmentCard",props:{apartment:{type:Object,required:!0}},computed:Object(i["a"])({},Object(s["e"])({activeApartment:function(t){return t.global.activeApartment}}),{isActive:function(){return this.activeApartment&&this.activeApartment.id===this.apartment.id}}),methods:Object(i["a"])({},Object(s["d"])({setActiveApartment:"global/setActiveApartment"}),{openApartment:function(t){this.$emit("apartment:edit",t)},selectApartment:function(t){this.setActiveApartment(t),this.$router.push("/")}})},u=l,f=(n("c564"),n("2877")),p=Object(f["a"])(u,c,o,!1,null,"39fbd723",null),m=p.exports,d=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("r-modal",{attrs:{active:t.visible},on:{close:t.close},scopedSlots:t._u([{key:"header",fn:function(){return[n("p",{staticClass:"ml-6 my-3 font-bold  text-xl text-gray-700"},[t._v(t._s(t.title))])]},proxy:!0},{key:"default",fn:function(){return[t.formData?n("div",{staticClass:"m-6 flex flex-row flex-wrap align-center justify-between"},[n("div",{staticClass:"w-full"},[n("r-field",{attrs:{label:"Name"}},[n("input",{directives:[{name:"model",rawName:"v-model",value:t.formData.name,expression:"formData.name"}],staticClass:"input",attrs:{type:"text",placeholder:"Enter name"},domProps:{value:t.formData.name},on:{input:function(e){e.target.composing||t.$set(t.formData,"name",e.target.value)}}})]),n("r-field",{attrs:{label:"Header Image"}},[n("file-input",{model:{value:t.image,callback:function(e){t.image=e},expression:"image"}})],1)],1)]):t._e()]},proxy:!0},{key:"footer",fn:function(){return[n("div",{staticClass:"m-3 flex flex-row justify-end items-center"},[n("button",{staticClass:"btn btn-primary",attrs:{disabled:t.submitting},on:{click:t.submit}},[n("span",{staticClass:"icon"},[n("i",{staticClass:"fas fa-save"})]),t._v(" Save")]),n("button",{staticClass:"btn btn-outline-secondary ml-auto",on:{click:t.close}},[t._v("Cancel")])])]},proxy:!0}])})},b=[],h=(n("96cf"),n("3b8d")),v=(n("7f7f"),n("bc3a")),y=n.n(v),g=n("0942"),w=n("d2d0"),x=n("5b7c"),O={name:"ApartmentForm",components:{RField:g["a"],FileInput:w["a"],RModal:x["a"]},props:{visible:{type:Boolean,required:!0},apartment:{type:Object,default:null}},data:function(){return{submitting:!1,formData:null,image:null}},computed:{title:function(){return this.apartment?this.apartment.name:"New apartment"}},watch:{apartment:{immediate:!0,handler:function(t){this.formData=t?Object(i["a"])({},t):{name:""},this.image=null}}},methods:Object(i["a"])({},Object(s["b"])({createOrUpdateApartment:"apartment/createOrUpdateApartment"}),{close:function(){this.$emit("close")},imageSelected:function(t){this.image=t.target.files[0]},submit:function(){var t=Object(h["a"])(regeneratorRuntime.mark(function t(){var e,n,a;return regeneratorRuntime.wrap(function(t){while(1)switch(t.prev=t.next){case 0:if(t.prev=0,this.submitting=!0,!this.image){t.next=14;break}if(e=new FormData,e.append("image",this.image),!this.formData.headerId){t.next=10;break}return t.next=8,y.a.put("/api/img/".concat(this.formData.headerId),e,{headers:{"Content-Type":"multipart/form-data"}});case 8:t.next=14;break;case 10:return t.next=12,y.a.post("/api/img",e,{headers:{"Content-Type":"multipart/form-data"}});case 12:n=t.sent,this.formData.headerId=n.data.id;case 14:return t.next=16,this.createOrUpdateApartment(this.formData);case 16:a=t.sent,this.$emit("apartment:saved",a),t.next=22;break;case 20:t.prev=20,t.t0=t["catch"](0);case 22:return t.prev=22,this.submitting=!1,t.finish(22);case 25:case"end":return t.stop()}},t,this,[[0,20,22,25]])}));function e(){return t.apply(this,arguments)}return e}()})},C=O,_=Object(f["a"])(C,d,b,!1,null,null,null),j=_.exports,A=n("a4a1"),S={name:"ApartmentsView",components:{RField:g["a"],LoadingIndicator:A["a"],ApartmentCard:m,ApartmentForm:j},mounted:function(){this.getApartments()},data:function(){return{selectedApartment:null,showForm:!1}},computed:Object(i["a"])({},Object(s["e"])({activeApartment:function(t){return t.global.activeApartment},isLoading:function(t){return t.global.status.apartment.loading},apartments:function(t){return t.global.apartments}})),methods:Object(i["a"])({},Object(s["b"])({getApartments:"global/getApartments"}),{closeForm:function(){this.showForm=!1,this.selectedApartment=null},newApartment:function(){this.selectedApartment=null,this.showForm=!0},editApartment:function(t){this.selectedApartment=t,this.showForm=!0},apartmentSaved:function(t){this.selectedApartment=null,this.showForm=!1,this.getApartments()}})},k=S,F=(n("18d5"),Object(f["a"])(k,a,r,!1,null,"5493fde3",null));e["default"]=F.exports},"6abf":function(t,e,n){var a=n("e6f3"),r=n("1691").concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return a(t,r)}},"6e45":function(t,e,n){},"85f2":function(t,e,n){t.exports=n("454f")},"883d":function(t,e,n){"use strict";var a=n("6e45"),r=n.n(a);r.a},"8aae":function(t,e,n){n("32a6"),t.exports=n("584a").Object.keys},"8c9c":function(t,e,n){},9003:function(t,e,n){var a=n("6b4c");t.exports=Array.isArray||function(t){return"Array"==a(t)}},"9aa9":function(t,e){e.f=Object.getOwnPropertySymbols},a4a1:function(t,e,n){"use strict";var a=function(){var t=this,e=t.$createElement;t._self._c;return t._m(0)},r=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"w-full h-full flex flex-col justify-center items-center"},[n("div",{staticClass:"sk-folding-cube"},[n("div",{staticClass:"sk-cube1 sk-cube"}),n("div",{staticClass:"sk-cube2 sk-cube"}),n("div",{staticClass:"sk-cube4 sk-cube"}),n("div",{staticClass:"sk-cube3 sk-cube"})]),n("div",{staticClass:"text-blue-600 text-md font-semibold tracking-widest"},[t._v("Loading")])])}],i={name:"LoadingIndicator",props:{type:{type:String,default:"square-dots"}}},s=i,c=(n("883d"),n("2877")),o=Object(c["a"])(s,a,r,!1,null,null,null);e["a"]=o.exports},a4bb:function(t,e,n){t.exports=n("8aae")},b11f:function(t,e,n){"use strict";var a=n("14aa"),r=n.n(a);r.a},bd86:function(t,e,n){"use strict";n.d(e,"a",function(){return i});var a=n("85f2"),r=n.n(a);function i(t,e,n){return e in t?r()(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}},bf0b:function(t,e,n){var a=n("355d"),r=n("aebd"),i=n("36c3"),s=n("1bc3"),c=n("07e3"),o=n("794b"),l=Object.getOwnPropertyDescriptor;e.f=n("8e60")?l:function(t,e){if(t=i(t),e=s(e,!0),o)try{return l(t,e)}catch(n){}if(c(t,e))return r(!a.f.call(t,e),t[e])}},bf90:function(t,e,n){var a=n("36c3"),r=n("bf0b").f;n("ce7e")("getOwnPropertyDescriptor",function(){return function(t,e){return r(a(t),e)}})},c564:function(t,e,n){"use strict";var a=n("d6fc"),r=n.n(a);r.a},ccb9:function(t,e,n){e.f=n("5168")},ce7e:function(t,e,n){var a=n("63b6"),r=n("584a"),i=n("294c");t.exports=function(t,e){var n=(r.Object||{})[t]||Object[t],s={};s[t]=e(n),a(a.S+a.F*i(function(){n(1)}),"Object",s)}},cebc:function(t,e,n){"use strict";n.d(e,"a",function(){return u});var a=n("268f"),r=n.n(a),i=n("e265"),s=n.n(i),c=n("a4bb"),o=n.n(c),l=n("bd86");function u(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{},a=o()(n);"function"===typeof s.a&&(a=a.concat(s()(n).filter(function(t){return r()(n,t).enumerable}))),a.forEach(function(e){Object(l["a"])(t,e,n[e])})}return t}},d2d0:function(t,e,n){"use strict";var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"file input"},[n("label",{staticClass:"text-lg"},[t._m(0),t._v("\n    "+t._s(this.file?this.file.name:"Choose a file...")+"\n  ")]),n("input",{attrs:{type:"file"},on:{change:t.fileSelected}})])},r=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("span",{staticClass:"icon pr-4"},[n("i",{staticClass:"fas fa-file-upload"})])}],i={name:"FileInput",inheritAttrs:!0,props:{value:{type:File,default:null}},data:function(){return{file:null}},methods:{fileSelected:function(t){this.file=t.target.files[0],console.log(this.file),this.$emit("input",this.file)}}},s=i,c=(n("2ab7"),n("2877")),o=Object(c["a"])(s,a,r,!1,null,"6edae47d",null);e["a"]=o.exports},d6fc:function(t,e,n){},e265:function(t,e,n){t.exports=n("ed33")},ebfd:function(t,e,n){var a=n("62a0")("meta"),r=n("f772"),i=n("07e3"),s=n("d9f6").f,c=0,o=Object.isExtensible||function(){return!0},l=!n("294c")(function(){return o(Object.preventExtensions({}))}),u=function(t){s(t,a,{value:{i:"O"+ ++c,w:{}}})},f=function(t,e){if(!r(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!i(t,a)){if(!o(t))return"F";if(!e)return"E";u(t)}return t[a].i},p=function(t,e){if(!i(t,a)){if(!o(t))return!0;if(!e)return!1;u(t)}return t[a].w},m=function(t){return l&&d.NEED&&o(t)&&!i(t,a)&&u(t),t},d=t.exports={KEY:a,NEED:!1,fastKey:f,getWeak:p,onFreeze:m}},ed33:function(t,e,n){n("014b"),t.exports=n("584a").Object.getOwnPropertySymbols},fde4:function(t,e,n){n("bf90");var a=n("584a").Object;t.exports=function(t,e){return a.getOwnPropertyDescriptor(t,e)}}}]);
//# sourceMappingURL=ApartmentsView.js.map