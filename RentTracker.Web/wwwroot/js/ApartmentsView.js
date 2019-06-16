(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["ApartmentsView"],{"0942":function(t,e,a){"use strict";var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"field"},[t.label?a("label",{staticClass:"block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"},[t._v("\n    "+t._s(t.label)+"\n  ")]):t._e(),t._t("default")],2)},s=[],r={name:"RField",inheritAttrs:!0,props:{label:{type:String,default:null}}},i=r,l=a("2877"),c=Object(l["a"])(i,n,s,!1,null,null,null);e["a"]=c.exports},"14aa":function(t,e,a){},"5b7c":function(t,e,a){"use strict";var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return t.active?a("div",{staticClass:"modal-container fixed top-0 right-0 w-screen h-screen overflow-auto flex flex-col justify-center items-center"},[a("div",{staticClass:"modal-backdrop absolute top-0 right-0 w-screen h-screen bg-gray-700 opacity-75",on:{click:t.close}}),a("div",{staticClass:"modal-content max-w-full h-full md:h-auto flex flex-col bg-white rounded shadow-lg",class:t.contentClass},[a("div",{staticClass:"modal-header"},[t._t("header")],2),a("div",{staticClass:"modal-body flex-grow md:flex-grow-0"},[t._t("default")],2),a("div",{staticClass:"modal-footer"},[t._t("footer")],2)])]):t._e()},s=[],r={name:"RModal",props:{active:{type:Boolean,required:!0},size:{type:String,default:"md"}},computed:{contentClass(){let t=[];switch(this.size){case"md":t.push("modal-size-md")}return t.join(" ")}},methods:{close(){this.$emit("close")}}},i=r,l=(a("b11f"),a("2877")),c=Object(l["a"])(i,n,s,!1,null,"6b5ed9fd",null);e["a"]=c.exports},6919:function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"flex p-4"},[t._l(t.apartments,function(e){return a("apartment-card",{key:e.id,attrs:{apartment:e},on:{"apartment:edit":t.editApartment}})}),a("apartment-form",{attrs:{visible:null!==t.selectedApartment,apartment:t.selectedApartment},on:{close:function(e){t.selectedApartment=null},"apartment:saved":t.apartmentSaved}})],2)},s=[],r=a("2f62"),i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"apartment-card cursor-pointer flex p-4",class:{active:t.isActive}},[a("div",{staticClass:"card-body max-w-sm relative rounded overflow-hidden shadow-lg",on:{click:function(e){return t.selectApartment(t.apartment)}}},[a("button",{staticClass:"action-btn btn bg-gray-600",on:{click:function(e){return t.openApartment(t.apartment)}}},[a("i",{staticClass:"icon fas fa-pen"})]),a("img",{staticClass:"w-full",attrs:{src:t.apartment.headerUrl,alt:"Sunset in the mountains"}}),a("div",{staticClass:"px-6 py-4"},[a("div",{staticClass:"font-bold text-xl mb-2 text-gray-700"},[t._v(t._s(t.apartment.name))])])])])},l=[],c={name:"ApartmentCard",props:{apartment:{type:Object,required:!0}},computed:{...Object(r["d"])({activeApartment:t=>t.global.activeApartment}),isActive(){return this.activeApartment&&this.activeApartment.id===this.apartment.id}},methods:{...Object(r["c"])({setActiveApartment:"global/setActiveApartment"}),openApartment(t){this.$emit("apartment:edit",t)},selectApartment(t){this.setActiveApartment(t),this.$router.push("/calendar")}}},o=c,m=(a("f697"),a("2877")),d=Object(m["a"])(o,i,l,!1,null,"3621d478",null),p=d.exports,u=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("r-modal",{attrs:{active:t.visible},on:{close:t.close},scopedSlots:t._u([{key:"header",fn:function(){return[a("p",{staticClass:"ml-6 my-3 font-bold  text-xl text-gray-700"},[t._v(t._s(t.title))])]},proxy:!0},{key:"default",fn:function(){return[t.formData?a("div",{staticClass:"m-6 flex flex-row flex-wrap align-center justify-between"},[a("div",{staticClass:"w-full"},[a("r-field",{attrs:{label:"Name"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.formData.name,expression:"formData.name"}],staticClass:"input",attrs:{type:"text",placeholder:"Enter name"},domProps:{value:t.formData.name},on:{input:function(e){e.target.composing||t.$set(t.formData,"name",e.target.value)}}})]),a("r-field",{attrs:{label:"Header Image"}},[a("input",{staticClass:"input",attrs:{type:"file",placeholder:"Upload image"},on:{change:t.imageSelected}})])],1)]):t._e()]},proxy:!0},{key:"footer",fn:function(){return[a("div",{staticClass:"m-3 flex flex-row justify-end items-center"},[a("button",{staticClass:"btn btn-primary",attrs:{disabled:t.submitting},on:{click:t.submit}},[a("span",{staticClass:"icon"},[a("i",{staticClass:"fas fa-save"})]),t._v(" Save")]),a("button",{staticClass:"btn btn-outline-secondary ml-auto",on:{click:t.close}},[t._v("Cancel")])])]},proxy:!0}])})},f=[],h=a("bc3a"),b=a.n(h),v=a("0942"),g=a("5b7c"),A={name:"ApartmentForm",components:{RField:v["a"],RModal:g["a"]},props:{visible:{type:Boolean,required:!0},apartment:{type:Object,default:null}},data(){return{submitting:!1,formData:null,image:null}},computed:{title(){return this.apartment?this.apartment.name:"New apartment"}},watch:{apartment:{immediate:!0,handler:function(t){this.formData=t?{...t}:{name:""},this.image=null}}},methods:{...Object(r["b"])({createOrUpdateApartment:"apartment/createOrUpdateApartment"}),close(){this.$emit("close")},imageSelected(t){this.image=t.target.files[0]},async submit(){try{if(this.submitting=!0,this.image){let t=new FormData;if(t.append("image",this.image),this.formData.headerId)await b.a.put(`/api/img/${this.formData.headerId}`,t,{headers:{"Content-Type":"multipart/form-data"}});else{let e=await b.a.post("/api/img",t,{headers:{"Content-Type":"multipart/form-data"}});this.formData.headerId=e.data.id}}let e=await this.createOrUpdateApartment(this.formData);this.$emit("apartment:saved",e)}catch(t){}finally{this.submitting=!1}}}},x=A,y=Object(m["a"])(x,u,f,!1,null,null,null),w=y.exports,C={name:"ApartmentsView",components:{ApartmentCard:p,ApartmentForm:w},mounted(){this.getApartments()},data(){return{selectedApartment:null}},computed:{...Object(r["d"])({apartments:t=>t.global.apartments})},methods:{...Object(r["b"])({getApartments:"global/getApartments"}),editApartment(t){this.selectedApartment=t},apartmentSaved(t){this.selectedApartment=null,this.getApartments()}}},_=C,j=Object(m["a"])(_,n,s,!1,null,"1d00d499",null);e["default"]=j.exports},"85e4":function(t,e,a){},b11f:function(t,e,a){"use strict";var n=a("14aa"),s=a.n(n);s.a},f697:function(t,e,a){"use strict";var n=a("85e4"),s=a.n(n);s.a}}]);
//# sourceMappingURL=ApartmentsView.js.map