<template>
  <div class="log">
    <b>Log In</b>
    <input v-if="inps.inp1.visible" type="text" :placeholder="inps.inp1.txt" :ref="(e)=>{inputs.push(e)}">
    <input v-if="inps.inp2.visible" type="password" :placeholder="inps.inp2.txt" :ref="(e)=>{inputs.push(e)}">
    <b id="forg" v-if="state.fn == Login" @click="Triggerforgetpassword">Forget password?</b>
    <b id="fbtn" @click="state.fn">{{state.button}}</b>
    <b id="lar">Don't have an account? <span @click="()=>{window('signup')}">Sign Up</span></b>
  </div>
</template>
<script setup>
import { ref,nextTick,inject,defineEmits, reactive, onMounted} from 'vue';
import * as Galaxy from "../res/GalaxyRESTAPIv1.js"

var state = reactive({
  fn:Login,
  button:"LOG IN"
})
var inps = reactive({
  inp1:{
    visible:true,
    txt:"GID"
  },
  inp2:{
    visible:true,
    txt:"Password"
}})
var window = inject("WindowModifer")
let login = inject("islogin")
let props = defineProps(["isFromApp"])
var Emit = defineEmits(["msg","app"])
var inputs = []

onMounted(()=>{
  if(props.isFromApp){
    login.v = false
    Triggerforgetpassword()
  }
})
async function Login(){
  let loginresult = await Galaxy.SignIn(inputs[0].value,inputs[1].value)
  if(inputs.every((v,i)=>v.value.length != 0)){
    if(loginresult === "INCORRECT_PASSWORD"){
    Emit("msg",{msg:"Password is incorrect !",error:true,manual:false,type:"show"})
  }
  else if(loginresult === false){
    Emit("msg",{msg:"Unknown user account !",error:true,manual:false,type:"show"})
  }
  else{
    localStorage.setItem("GToken",loginresult)
    Emit("app")
    window("postview")
  }
  }
  else{
    Emit("msg",{msg:"Please fill all field !",error:true,manual:false,type:"show"})
  }
}

function Triggerforgetpassword(){
  inputs.splice(0,inputs.length)
  state.button = "SEND OTP"
  inps.inp2.visible = false
  state.fn = Forgetpassword
}

async function Forgetpassword(){
  Emit("msg",{msg:"Please wait...!",error:false,manual:true,type:"show"})
  let forgetpass = await Galaxy.ForgetPassword(inputs[0].value)
  if(forgetpass == "UNKNOWN_ACCOUNT"){
    Emit("msg",{msg:"Unknown user account !",error:true,manual:false,type:"show"})
  }
  else if(forgetpass == "ERROR"){
    Emit("msg",{msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
  }
  else{ 
    sessionStorage.setItem("tmpgid",inputs[0].value) 
    inputs.splice(0,inputs.length)
    inps.inp1.txt = "OTP"
    state.button = "VERIFY OTP"
    state.fn = verifyotp
    Emit("msg",{msg:"OTP was sent to "+forgetpass,error:false,manual:false,type:"show"})
    await nextTick()
    inputs[0].value = ""
  }
}

async function verifyotp(){
  let verifcation = await Galaxy.VerifyOTP(sessionStorage.getItem("tmpgid"),inputs[0].value)
  if(verifcation === "INCORRECT_OTP"){
    Emit("msg",{msg:"OTP is incorrect !",error:true,manual:false,type:"show"})
  }
  else if(verifcation === "EXPIRED"){
    Emit("msg",{msg:"OTP was expired. Please try again !",error:true,manual:false,type:"show"})
  }
  else if(verifcation === "UNKNOWN_ACCOUNT"){
    Emit("msg",{msg:"Unknown user account !",error:true,manual:false,type:"show"})
  }
  else{
    inputs.splice(0,inputs.length)
    sessionStorage.setItem("passkey",verifcation)
    inps.inp1.txt = "New password"
    state.button = "CHANGE PASSWORD"
    state.fn = changepass
    await nextTick()
    inputs[0].value = ""
  }
}

async function changepass() {
    Emit("msg",{msg:"Please wait...!",error:false,manual:true,type:"show"})
    let changeddet = await Galaxy.ChangePassword(sessionStorage.getItem("passkey"),inputs[0].value)
    if(changeddet === "INVALID_PASSTOKEN"){
      Emit("msg",{msg:"Unknown entry !",error:true,manual:false,type:"show"})
    }
    else if(changeddet === "PASSTOKEN_EXPIRED"){
      Emit("msg",{msg:"Session was expired !",error:true,manual:false,type:"show"})
    }
    else if(changeddet === "INTERNEL_JWT_ERROR"){
      Emit("msg",{msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
    }
    else if(changeddet === false){
      Emit("msg",{msg:"Unkown user account !",error:true,manual:false,type:"show"})
    }
    else{
      Emit("msg",{msg:"Password was successfully updated !",error:false,manual:false,type:"show"})

      // reset login comp to normal
      inps.inp1.txt = "GID"
      inps.inp2.txt = "Password"
      inps.inp2.visible = true
      state.fn = Login
      state.button = "LOG IN"
      await nextTick()
      inputs[0].value = ""
    }
}

</script>
<style src="../css/login.css" scoped></style>