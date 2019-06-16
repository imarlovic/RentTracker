(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["IntegrationView"],{"0942":function(t,s,a){"use strict";var e=function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"field"},[t.label?a("label",{staticClass:"block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"},[t._v("\n    "+t._s(t.label)+"\n  ")]):t._e(),t._t("default")],2)},n=[],i={name:"RField",inheritAttrs:!0,props:{label:{type:String,default:null}}},r=i,o=a("2877"),c=Object(o["a"])(r,e,n,!1,null,null,null);s["a"]=c.exports},"1b73":function(t,s,a){"use strict";var e=a("552f"),n=a.n(e);n.a},"48c8":function(t,s,a){"use strict";var e=a("b1b3"),n=a.n(e);n.a},"552f":function(t,s,a){},6051:function(t,s,a){"use strict";a.r(s);var e=function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"flex justify-center items-center p-4"},[t.activeApartment?a("integration-setup"):a("div",{staticClass:"mt-12"},[a("h1",{staticClass:"text-gray-900"},[t._v("Please pick an apartment to see the calendar")])])],1)},n=[],i=a("2f62"),r=function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"max-w-5xl w-full flex flex-col justify-center items-center pt-4 md:pt-8 px-4"},[a("booking-integration",{staticClass:"mb-10"}),a("airbnb-integration")],1)},o=[],c=function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"w-full flex flex-col"},[a("div",{staticClass:"flex flex-wrap items-center px-2 "},[a("img",{staticClass:"integration-logo pr-4 mb-4",attrs:{src:"https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Booking.com_logo.svg/1280px-Booking.com_logo.svg.png",alt:""}}),a("div",{staticClass:"flex items-center mb-4"},[a("integration-status",{attrs:{configuration:t.configuration}})],1)]),a("div",{staticClass:"w-full flex flex-wrap"},[a("r-field",{staticClass:"ml-0",attrs:{label:"Property ID"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.propertyId,expression:"propertyId"}],staticClass:"input",attrs:{placeholder:"Property ID",type:"text",regex:"(0-9)+"},domProps:{value:t.propertyId},on:{input:function(s){s.target.composing||(t.propertyId=s.target.value)}}})]),a("r-field",{attrs:{label:"Password"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.password,expression:"password"}],staticClass:"input",attrs:{placeholder:"Password",type:"password"},domProps:{value:t.password},on:{input:function(s){s.target.composing||(t.password=s.target.value)}}})]),a("r-field",{attrs:{label:"Pulse Code"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.pulseCode,expression:"pulseCode"}],staticClass:"input",attrs:{placeholder:"Pulse Code",type:"text"},domProps:{value:t.pulseCode},on:{input:function(s){s.target.composing||(t.pulseCode=s.target.value)}}})])],1),a("div",{staticClass:"w-full flex"},[a("r-field",{staticClass:"ml-0"},[t.changed?a("button",{staticClass:"btn btn-primary mr-2",on:{click:t.trySave}},[a("i",{staticClass:"fas fa-save"})]):t._e(),"WORKING"===t.status||"FAILED"===t.status?a("button",{staticClass:"btn btn-primary mr-2",attrs:{disabled:t.syncInProgress},on:{click:t.trySync}},[a("span",{staticClass:"pr-2"},[a("i",{staticClass:"fas fa-sync",class:{rotate:t.syncInProgress}})]),t._v("Sync")]):t._e(),"WORKING"!==t.status?a("button",{staticClass:"btn btn-secondary mr-2",on:{click:t.tryConfigure}},[a("i",{staticClass:"pr-2 fas fa-cog"}),t._v("Configure")]):t._e()])],1)])},l=[],u=a("0942"),p=function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"w-full flex"},[a("span",{staticClass:"text-gray-600"},[t._v(t._s(t.statusDescription))]),a("span",{staticClass:"mx-2",class:t.iconClasses},[a("i",{staticClass:"fas",class:t.icon})]),t.configuration?a("span",{staticClass:"text-gray-600 ml-4",attrs:{title:t.configuration.lastUpdated}},[t._v(t._s(t.updateDate))]):t._e()])},d=[],g=a("c1df"),f={name:"IntegrationStatus",props:{configuration:{type:Object,default:null}},data(){return{statusDescription:"",iconClasses:"",icon:""}},computed:{updateDate(){return this.configuration&&this.configuration.lastUpdated&&"NotConfigured"!==this.configuration.status?"Last updated: "+g(this.configuration.lastUpdated).fromNow():""}},watch:{"configuration.status":{immediate:!0,handler:function(t=""){switch(t.toUpperCase()){case"NOTCONFIGURED":this.statusDescription="Not configured",this.iconClasses="text-gray-600",this.icon="fa-question-circle";break;case"FAILED":this.statusDescription="Failed",this.iconClasses="text-red-600",this.icon="fa-exclamation-triangle";break;case"WORKING":this.statusDescription="Working",this.iconClasses="text-green-600",this.icon="fa-check";break;default:this.statusDescription="N/A",this.iconClasses="text-gray-600",this.icon="fa-question-circle"}}}}},m=f,b=a("2877"),h=Object(b["a"])(m,p,d,!1,null,null,null),y=h.exports,C={name:"BookingIntegration",components:{RField:u["a"],IntegrationStatus:y},data(){return{propertyId:"",password:"",pulseCode:"",syncInProgress:!1}},computed:{...Object(i["d"])({configuration:t=>t.apartment.bookingIntegrationConfiguration}),status(){return this.configuration?this.configuration.status.toUpperCase():"UNSET"},changed(){return!this.configuration||(this.propertyId!==this.configuration.propertyId||this.password!==this.configuration.password)}},watch:{configuration:{immediate:!0,handler:function(t){t&&(this.propertyId=t.propertyId,this.password=t.password)}}},methods:{...Object(i["b"])({createOrUpdate:"apartment/createOrUpdateIntegrationConfiguration",setupIntegration:"apartment/setupBookingIntegration",syncReservations:"apartment/syncBookingReservations"}),async trySave(){try{let s={...this.configuration,propertyId:this.propertyId,password:this.password,provider:"Booking"};await this.createOrUpdate(s)}catch(t){console.log(t)}},async tryConfigure(){try{await this.setupIntegration(this.pulseCode)}catch(t){console.log(t)}},async trySync(){try{this.syncInProgress=!0,await this.syncReservations()}catch(t){console.log(t)}finally{this.syncInProgress=!1}}}},v=C,w=(a("48c8"),Object(b["a"])(v,c,l,!1,null,"5b2fe5e0",null)),I=w.exports,x=function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"w-full flex flex-col"},[a("div",{staticClass:"flex flex-wrap px-2"},[a("img",{staticClass:"integration-logo pr-4 mb-4",attrs:{src:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/1280px-Airbnb_Logo_B%C3%A9lo.svg.png",alt:""}}),a("div",{staticClass:"flex items-center mb-4"},[a("integration-status",{attrs:{configuration:t.configuration}})],1)]),a("div",{staticClass:"w-full flex flex-wrap"},[a("r-field",{staticClass:"ml-0 w-64",attrs:{label:"Username"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.username,expression:"username"}],staticClass:"input",attrs:{placeholder:"Username",type:"text"},domProps:{value:t.username},on:{input:function(s){s.target.composing||(t.username=s.target.value)}}})]),a("r-field",{attrs:{label:"Password"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.password,expression:"password"}],staticClass:"input",attrs:{placeholder:"Password",type:"password"},domProps:{value:t.password},on:{input:function(s){s.target.composing||(t.password=s.target.value)}}})])],1),a("div",{staticClass:"w-full flex"},[a("r-field",{staticClass:"ml-0"},[t.changed?a("button",{staticClass:"btn btn-primary mr-2",on:{click:t.trySave}},[a("i",{staticClass:"fas fa-save"})]):t._e(),"WORKING"===t.status||"FAILED"===t.status?a("button",{staticClass:"btn btn-primary mr-2",attrs:{disabled:t.syncInProgress},on:{click:t.trySync}},[a("span",{staticClass:"pr-2"},[a("i",{staticClass:"fas fa-sync",class:{rotate:t.syncInProgress}})]),t._v("Sync")]):t._e(),"WORKING"!==t.status?a("button",{staticClass:"btn btn-secondary mr-2",on:{click:t.tryConfigure}},[a("i",{staticClass:"pr-2 fas fa-cog"}),t._v("Configure")]):t._e()])],1)])},_=[],k={name:"AirbnbIntegration",components:{RField:u["a"],IntegrationStatus:y},data(){return{username:"",password:"",syncInProgress:!1}},computed:{...Object(i["d"])({configuration:t=>t.apartment.airbnbIntegrationConfiguration}),status(){return this.configuration?this.configuration.status.toUpperCase():"UNSET"},changed(){return!this.configuration||(this.username!==this.configuration.username||this.password!==this.configuration.password)}},watch:{configuration:{immediate:!0,handler:function(t){t&&(this.username=t.username,this.password=t.password)}}},methods:{...Object(i["b"])({createOrUpdate:"apartment/createOrUpdateIntegrationConfiguration",setupIntegration:"apartment/setupAirbnbIntegration",syncReservations:"apartment/syncAirbnbReservations"}),async trySave(){try{let s={...this.configuration,username:this.username,password:this.password,provider:"Airbnb"};await this.createOrUpdate(s)}catch(t){console.log(t)}},async tryConfigure(){try{await this.setupIntegration()}catch(t){console.log(t)}},async trySync(){try{this.syncInProgress=!0,await this.syncReservations()}catch(t){console.log(t)}finally{this.syncInProgress=!1}}}},O=k,P=(a("1b73"),Object(b["a"])(O,x,_,!1,null,"5d1065ab",null)),A=P.exports,N={name:"IntegrationSetup",components:{BookingIntegration:I,AirbnbIntegration:A}},S=N,U=Object(b["a"])(S,r,o,!1,null,"e67bfe7a",null),j=U.exports,R={name:"IntegrationView",components:{IntegrationSetup:j},computed:{...Object(i["d"])({activeApartment:t=>t.global.activeApartment})},watch:{activeApartment:{immediate:!0,handler:function(t){t&&this.getIntegrationConfigurations(t.id)}}},methods:{...Object(i["b"])({getIntegrationConfigurations:"apartment/getIntegrationConfigurations"})}},D=R,E=Object(b["a"])(D,e,n,!1,null,"1b534b8e",null);s["default"]=E.exports},b1b3:function(t,s,a){}}]);
//# sourceMappingURL=IntegrationView.js.map