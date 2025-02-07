<template>
  <div class="log">
    <b>Sign Up</b>
    <input type="text" :placeholder="label" spellcheck="false" :ref="(e)=>{inputs.push(e)}">
    <input type="email" placeholder="Email" spellcheck="false"  :ref="(e)=>{inputs.push(e)}" v-if="!IsOTPSent">
    <input type="password" placeholder="Password" spellcheck="false" :ref="(e)=>{inputs.push(e)}" v-if="!IsOTPSent"> 
    <b @click="fn">{{button}}</b>
    <b class="lar" >Already have an account? <span @click="Changewindow">Log In</span></b>
  </div>

</template>
<script setup>
import * as GalaxyAPI from "../res/GalaxyRESTAPIv1.js"
import { ref ,defineEmits,inject, nextTick} from "vue";

var IsOTPSent = ref(false)
var label = ref("Name")
var button = ref("SIGN UP")
var fn = ref(ReqSignup)
var inputs = []
var Showmessage = defineEmits(["msg"])
let window = inject("WindowModifer")
var Changewindow = ()=>{
  window("login")
}
async function ReqSignup(){
  let allinputs = inputs.every((v,i)=>{
    return v.value.length != 0
  })
  if(allinputs){
    if(inputs[2].value.length == 6){
      Showmessage("msg",{msg:"Please wait...!",error:false,manual:true,type:"show"})
      let SignUpresult = await GalaxyAPI.RequestSignUp(inputs[1].value,inputs[0].value,inputs[2].value)
      if(SignUpresult === false){
       Showmessage("msg",{msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
      }
      else if(SignUpresult === "EXISTS"){
        Showmessage("msg",{msg:"Please try another email !",error:true,manual:false,type:"show"})
      }
      else{
        Showmessage("msg",{msg:"OTP was sent to "+inputs[1].value,error:false,manual:false,type:"show"})
        sessionStorage.setItem("reqidTMP",JSON.stringify({reqid:SignUpresult,email:inputs[1].value}))
        inputs.splice(0,inputs.length)
        IsOTPSent.value = true
        label.value = "OTP"
        button.value = "VERIFY OTP"
        fn.value = Signup
        await nextTick()
        console.log(inputs)
        inputs[0].value = ""
      }
    }
    else{
      Showmessage("msg",{msg:"Password must be 6 digit !",error:true,manual:false,type:"show"})
    }
  }
  else{
    Showmessage("msg",{msg:"Please fill all field !",error:true,manual:false,type:"show"})
  } 
}

async function Signup(){
   let cred = JSON.parse(sessionStorage.getItem("reqidTMP"))
   Showmessage("msg",{msg:"Please wait...!",error:false,manual:true,type:"show"})
   let Issignup = await GalaxyAPI.SignUp(cred.reqid,inputs[0].value)

   switch(Issignup){
    case "NO_ATTEMPT":
        Showmessage("msg",{msg:"You doesn't involve in Signup attempts",error:true,manual:false,type:"show"})
        break
    case "ATTEMPT_EXPIRED":
        Showmessage("msg",{msg:"Your signup attempt was expired. Please try again !",error:true,manual:false,type:"show"})
        break
    case "EXISTS":
        Showmessage("msg",{msg:"Please use different email !",error:true,manual:false,type:"show"})
        break
    case "INCORRECT_OTP":
        Showmessage("msg",{msg:"OTP is incorrect !",error:true,manual:false,type:"show"})
        break
    case "CREATION_FAILED":
        Showmessage("msg",{msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
        break 
    case false:
        Showmessage("msg",{msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
        break
    default:
        Showmessage("msg",{msg:"Your account was created successfully And Your GID was sent to"+cred.email
        ,error:false,manual:false,type:"show"})
        sessionStorage.clear()
        window("login")                     
   }
}
</script>
<style src="../css/signup.css" scoped></style>