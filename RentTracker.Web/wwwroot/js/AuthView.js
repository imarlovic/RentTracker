(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["AuthView"],{"0566":function(e,t,s){"use strict";s.r(t);var a=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"h-screen w-screen flex flex-col justify-center items-center bg-blue-600"},[e._m(0),s("div",{staticClass:"max-w-xs"},[s("ul",{staticClass:"flex border-b-2 border-gray-400"},[s("li",{staticClass:"cursor-pointer flex-grow  border-l border-t rounded-l rounded-bl-none py-2 px-4 text-center font-semibold ",class:e.computedClasses("SignInForm"),on:{click:function(t){e.activeForm="SignInForm"}}},[e._v("\n        Sign in\n      ")]),s("li",{staticClass:"cursor-pointer flex-grow py-2 px-4 rounded-r rounded-br-none text-center font-semibold",class:e.computedClasses("RegisterForm"),on:{click:function(t){e.activeForm="RegisterForm"}}},[e._v("\n        Register\n      ")])]),s(e.activeForm,{tag:"component"}),s("p",{staticClass:"text-center text-gray-300 text-xs"},[e._v("\n      ©2019 RentTracker. All rights reserved.\n    ")])],1)])},r=[function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"absolute top-0 max-w-sm px-12 pt-4 md:pt-12"},[s("img",{attrs:{src:"/img/logos/renttracker_logo_white.png",alt:""}})])}],n=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("form",{staticClass:"bg-white rounded-b shadow-md px-8 pt-6 pb-8 mb-4",attrs:{method:"POST"},on:{submit:e.attemptLogin}},[s("div",{staticClass:"mb-4"},[s("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"username"}},[e._v("\n      Username\n    ")]),s("input",{directives:[{name:"model",rawName:"v-model",value:e.username,expression:"username"}],staticClass:"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",class:{"border-red-500":e.isDirty&&!e.username},attrs:{id:"username",name:"UserName",type:"text",placeholder:"Username"},domProps:{value:e.username},on:{input:function(t){t.target.composing||(e.username=t.target.value)}}}),e.isDirty&&!e.username?s("p",{staticClass:"text-red-500 text-xs italic"},[e._v("Please enter a password.")]):e._e()]),s("div",{staticClass:"mb-6"},[s("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"password"}},[e._v("\n      Password\n    ")]),s("input",{directives:[{name:"model",rawName:"v-model",value:e.password,expression:"password"}],staticClass:"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline",class:{"border-red-500":e.isDirty&&!e.password},attrs:{id:"password",name:"Password",type:"password",placeholder:"Password"},domProps:{value:e.password},on:{input:function(t){t.target.composing||(e.password=t.target.value)}}}),e.isDirty&&!e.password?s("p",{staticClass:"text-red-500 text-xs italic"},[e._v("Please enter a password.")]):e._e()]),e._m(0),e._m(1)])},i=[function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"flex items-center justify-between"},[s("input",{attrs:{name:"RememberLogin",type:"hidden",value:"false"}}),s("input",{attrs:{name:"ReturnUrl",type:"hidden",value:"/"}}),s("button",{staticClass:"w-full hover:shadow-xl bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",attrs:{type:"submit"}},[e._v("\n      Sign In\n    ")])])},function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"mt-4 flex items-center justify-center"},[s("a",{staticClass:"hover:shadow-xl flex-grow flex shadow text-gray-600 font-semibold p-2 rounded focus:outline-none focus:shadow-outline",attrs:{href:"/auth/external?provider=Google&returnUrl=/"}},[s("img",{staticClass:"w-6",attrs:{src:"/img/logos/google_g_logo.png",alt:""}}),s("span",{staticClass:"px-4"},[e._v("Sign in with Google")])])])}],o=(s("bc3a"),{name:"SignInForm",data:function(){return{isDirty:!1,username:"",password:""}},computed:{isValid:function(){return this.username&&this.password}},methods:{attemptLogin:function(e){this.isDirty=!0,this.isValid||e.preventDefault()}}}),l=o,d=s("2877"),m=Object(d["a"])(l,n,i,!1,null,null,null),u=m.exports,c=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("form",{staticClass:"bg-white rounded-b shadow-md px-8 pt-6 pb-8 mb-4",attrs:{action:"/auth/register",method:"POST"},on:{submit:e.attemptRegister}},[s("div",{staticClass:"mb-4"},[s("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"firstname"}},[e._v("\n      First name\n    ")]),s("input",{directives:[{name:"model",rawName:"v-model",value:e.firstName,expression:"firstName"}],staticClass:"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",class:{"border-red-500":e.isDirty&&!e.firstName},attrs:{id:"firstname",name:"FirstName",type:"text",placeholder:"First name"},domProps:{value:e.firstName},on:{input:function(t){t.target.composing||(e.firstName=t.target.value)}}}),e.isDirty&&!e.firstName?s("p",{staticClass:"text-red-500 text-xs italic"},[e._v("Please enter first name.")]):e._e()]),s("div",{staticClass:"mb-4"},[s("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"lastname"}},[e._v("\n      Last name\n    ")]),s("input",{directives:[{name:"model",rawName:"v-model",value:e.lastName,expression:"lastName"}],staticClass:"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",class:{"border-red-500":e.isDirty&&!e.lastName},attrs:{id:"lastname",name:"LastName",type:"text",placeholder:"Last name"},domProps:{value:e.lastName},on:{input:function(t){t.target.composing||(e.lastName=t.target.value)}}}),e.isDirty&&e.lastName?s("p",{staticClass:"text-red-500 text-xs italic"},[e._v("Please enter last name.")]):e._e()]),s("div",{staticClass:"mb-4"},[s("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"email"}},[e._v("\n      Email\n    ")]),s("input",{directives:[{name:"model",rawName:"v-model",value:e.email,expression:"email"}],staticClass:"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",class:{"border-red-500":e.isDirty&&!e.email},attrs:{id:"email",name:"Email",type:"email",placeholder:"Email"},domProps:{value:e.email},on:{input:function(t){t.target.composing||(e.email=t.target.value)}}}),e.isDirty&&!e.email?s("p",{staticClass:"text-red-500 text-xs italic"},[e._v("Please enter email.")]):e._e()]),s("div",{staticClass:"mb-4"},[s("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"username"}},[e._v("\n      Username\n    ")]),s("input",{directives:[{name:"model",rawName:"v-model",value:e.username,expression:"username"}],staticClass:"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",class:{"border-red-500":e.isDirty&&!e.username},attrs:{id:"username",name:"UserName",type:"text",placeholder:"Username"},domProps:{value:e.username},on:{input:function(t){t.target.composing||(e.username=t.target.value)}}}),e.isDirty&&!e.username?s("p",{staticClass:"text-red-500 text-xs italic"},[e._v("Please enter username.")]):e._e()]),s("div",{staticClass:"mb-6"},[s("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"password"}},[e._v("\n      Password\n    ")]),s("input",{directives:[{name:"model",rawName:"v-model",value:e.password,expression:"password"}],staticClass:"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",class:{"border-red-500":e.isDirty&&!e.password},attrs:{id:"password",name:"Password",type:"password",placeholder:"******************"},domProps:{value:e.password},on:{input:function(t){t.target.composing||(e.password=t.target.value)}}}),e.isDirty&&!e.password?s("p",{staticClass:"text-red-500 text-xs italic"},[e._v("Please choose a password.")]):e._e()]),e._m(0)])},p=[function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"flex items-center justify-between"},[s("input",{attrs:{name:"RememberLogin",type:"hidden",value:"false"}}),s("input",{attrs:{name:"ReturnUrl",type:"hidden",value:"/"}}),s("button",{staticClass:"shadow hover:shadow-lg flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",attrs:{type:"submit"}},[e._v("\n      Register\n    ")])])}],f={name:"RegisterForm",data:function(){return{isDirty:!1,firstName:"",lastName:"",email:"",username:"",password:""}},computed:{isValid:function(){return this.firstName&&this.lastName&&this.email&&this.username&&this.password}},methods:{attemptRegister:function(e){this.isDirty=!0,this.isValid||e.preventDefault()}}},g=f,b=Object(d["a"])(g,c,p,!1,null,null,null),v=b.exports,x={name:"AuthView",components:{SignInForm:u,RegisterForm:v},data:function(){return{activeForm:"SignInForm",activeClasses:"bg-white text-blue-600",inactiveClasses:"bg-gray-500 border-gray-500 text-white hover:bg-white hover:border-white hover:text-blue-600"}},methods:{computedClasses:function(e){return this.activeForm===e?this.activeClasses:this.inactiveClasses}}},w=x,h=Object(d["a"])(w,a,r,!1,null,null,null);t["default"]=h.exports}}]);
//# sourceMappingURL=AuthView.js.map