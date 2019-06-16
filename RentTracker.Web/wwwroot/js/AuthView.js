(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["AuthView"],{"0566":function(e,t,a){"use strict";a.r(t);var s=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"h-screen w-screen flex justify-center items-center bg-blue-800"},[a("div",{staticClass:"max-w-xs"},[a("ul",{staticClass:"flex border-b-2"},[a("li",{staticClass:"cursor-pointer flex-grow  border-l border-t rounded-l rounded-bl-none py-2 px-4 text-center font-semibold ",class:e.computedClasses("SignInForm"),on:{click:function(t){e.activeForm="SignInForm"}}},[e._v("\n        Sign in\n      ")]),a("li",{staticClass:"cursor-pointer flex-grow py-2 px-4 rounded-r rounded-br-none text-center font-semibold",class:e.computedClasses("RegisterForm"),on:{click:function(t){e.activeForm="RegisterForm"}}},[e._v("\n        Register\n      ")])]),a(e.activeForm,{tag:"component"}),a("p",{staticClass:"text-center text-gray-500 text-xs"},[e._v("\n      ©2019 RentTracker. All rights reserved.\n    ")])],1)])},n=[],r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("form",{staticClass:"bg-white rounded-b shadow-md px-8 pt-6 pb-8 mb-4",attrs:{method:"POST"}},[a("div",{staticClass:"mb-4"},[a("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"username"}},[e._v("\n      Username\n    ")]),a("input",{directives:[{name:"model",rawName:"v-model",value:e.username,expression:"username"}],staticClass:"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",attrs:{id:"username",name:"UserName",type:"text",placeholder:"Username"},domProps:{value:e.username},on:{input:function(t){t.target.composing||(e.username=t.target.value)}}})]),a("div",{staticClass:"mb-6"},[a("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"password"}},[e._v("\n      Password\n    ")]),a("input",{directives:[{name:"model",rawName:"v-model",value:e.password,expression:"password"}],staticClass:"shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline",attrs:{id:"password",name:"Password",type:"password",placeholder:"******************"},domProps:{value:e.password},on:{input:function(t){t.target.composing||(e.password=t.target.value)}}}),a("p",{staticClass:"text-red-500 text-xs italic"},[e._v("Please choose a password.")])]),e._m(0),e._m(1)])},o=[function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"flex items-center justify-between"},[a("input",{attrs:{name:"RememberLogin",type:"hidden",value:"false"}}),a("input",{attrs:{name:"ReturnUrl",type:"hidden",value:"/"}}),a("button",{staticClass:"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",attrs:{type:"submit"}},[e._v("\n      Sign In\n    ")]),a("a",{staticClass:"inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800",attrs:{href:"#"}},[e._v("\n      Forgot Password?\n    ")])])},function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"mt-4 flex items-center justify-center"},[a("a",{staticClass:"flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",attrs:{href:"/auth/external?provider=Google&returnUrl=/"}},[a("i",{staticClass:"fab fa-google"}),e._v(" Sign in with Google\n    ")])])}],i=a("bc3a"),l=a.n(i),m={name:"SignInForm",data(){return{username:"",password:""}},methods:{attemptLogin(){var e=new FormData;e.set("UserName",this.username),e.set("Password",this.password),e.set("RememberLogin",!1),e.set("ReturnUrl","/"),l.a.post("/auth/login",e,{headers:{"Content-Type":"multipart/form-data"}})}}},d=m,u=a("2877"),c=Object(u["a"])(d,r,o,!1,null,null,null),p=c.exports,b=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("form",{staticClass:"bg-white rounded-b shadow-md px-8 pt-6 pb-8 mb-4",attrs:{action:"/auth/register",method:"POST"}},[a("div",{staticClass:"mb-4"},[a("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"firstname"}},[e._v("\n      First name\n    ")]),a("input",{directives:[{name:"model",rawName:"v-model",value:e.firstName,expression:"firstName"}],staticClass:"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",attrs:{id:"firstname",name:"FirstName",type:"text",placeholder:"First name"},domProps:{value:e.firstName},on:{input:function(t){t.target.composing||(e.firstName=t.target.value)}}})]),a("div",{staticClass:"mb-4"},[a("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"lastname"}},[e._v("\n      Last name\n    ")]),a("input",{directives:[{name:"model",rawName:"v-model",value:e.lastName,expression:"lastName"}],staticClass:"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",attrs:{id:"lastname",name:"LastName",type:"text",placeholder:"Last name"},domProps:{value:e.lastName},on:{input:function(t){t.target.composing||(e.lastName=t.target.value)}}})]),a("div",{staticClass:"mb-4"},[a("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"email"}},[e._v("\n      Email\n    ")]),a("input",{directives:[{name:"model",rawName:"v-model",value:e.email,expression:"email"}],staticClass:"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",attrs:{id:"email",name:"Email",type:"email",placeholder:"Email"},domProps:{value:e.email},on:{input:function(t){t.target.composing||(e.email=t.target.value)}}})]),a("div",{staticClass:"mb-4"},[a("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"username"}},[e._v("\n      Username\n    ")]),a("input",{directives:[{name:"model",rawName:"v-model",value:e.username,expression:"username"}],staticClass:"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",attrs:{id:"username",name:"UserName",type:"text",placeholder:"Username"},domProps:{value:e.username},on:{input:function(t){t.target.composing||(e.username=t.target.value)}}})]),a("div",{staticClass:"mb-6"},[a("label",{staticClass:"block text-gray-700 text-sm font-bold mb-2",attrs:{for:"password"}},[e._v("\n      Password\n    ")]),a("input",{directives:[{name:"model",rawName:"v-model",value:e.password,expression:"password"}],staticClass:"shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline",attrs:{id:"password",name:"Password",type:"password",placeholder:"******************"},domProps:{value:e.password},on:{input:function(t){t.target.composing||(e.password=t.target.value)}}}),a("p",{staticClass:"text-red-500 text-xs italic"},[e._v("Please choose a password.")])]),e._m(0)])},f=[function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"flex items-center justify-between"},[a("input",{attrs:{name:"RememberLogin",type:"hidden",value:"false"}}),a("input",{attrs:{name:"ReturnUrl",type:"hidden",value:"/"}}),a("button",{staticClass:"flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",attrs:{type:"submit"}},[e._v("\n      Register\n    ")])])}],g={name:"RegisterForm",data(){return{firstName:"",lastName:"",email:"",username:"",password:""}},methods:{attemptLogin(){var e=new FormData;e.set("FirstName",this.firstName),e.set("LastName",this.lastName),e.set("Email",this.email),e.set("UserName",this.username),e.set("Password",this.password),l.a.post("/auth/register",e,{headers:{"Content-Type":"multipart/form-data"}})}}},v=g,h=Object(u["a"])(v,b,f,!1,null,null,null),w=h.exports,x={name:"AuthView",components:{SignInForm:p,RegisterForm:w},data(){return{activeForm:"SignInForm",activeClasses:"bg-white text-blue-600",inactiveClasses:"bg-gray-400 border-gray-400 text-white hover:bg-white hover:border-white hover:text-blue-600"}},methods:{computedClasses(e){return this.activeForm===e?this.activeClasses:this.inactiveClasses}}},y=x,C=Object(u["a"])(y,s,n,!1,null,null,null);t["default"]=C.exports}}]);
//# sourceMappingURL=AuthView.js.map