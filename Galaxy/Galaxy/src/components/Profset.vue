<template>
    <div class="settings">
        <div class="head">
            <i class="fa-solid fa-angle-left" @click="emit('close')"></i>
            <b>Settings</b>
        </div>
        <div class="opts">
            
            <div class="opt">
                <b>Followers visibility</b>
                <input id="chf" type="checkbox" :checked="props.fstate">
                <label for="chf" class="chk" @click="changefollowervis">
                    <div></div>
                </label>   
            </div>
            
             <input type="file" id="file" :onchange="getimage">
             <b @click="(e)=>{ e.currentTarget.parentElement.children.item(1).click()}">Update Profile Image</b>
             <b class="chp" @click="goforgetpassword">Change password</b>
            <b class="del" @click="deleteaccount">Delete account</b>
            <p>This will delete your account permanently including your posts,replays,followers,followings,account credentials and 
                your profile images permanently.After this you can't recover them.
            </p>
        </div>
    </div>
</template>

<script setup>
import { defineEmits,ref,inject } from 'vue';
import * as galaxy from "../res/GalaxyRESTAPIv1.js"

let emit = defineEmits(["close","updatefollower"])

let storage = localStorage
let props = defineProps(['fstate'])
let showmsg = inject("Messenger")
let loader = inject("loader")
let login = inject("islogin")
let changewin = inject("WindowModifer")
let screen = inject("screen")

let goforgetpassword = ()=>{
                screen.value = "home" 
                login.v = true
                changewin('login')
                storage.removeItem('GToken')
             }
let changefollowervis = async ()=>{
    let result = await galaxy.PostFollowerVisible(localStorage.getItem("GToken"))
    console.log(result)
    if(result){
        emit("updatefollower")
    }
    else{
        showmsg({msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
    }
}

// for uploading image

let getimage = (e)=>{
  
   let image = e.currentTarget.parentElement.children.item(1).files[0]
   
   let freader = new FileReader()
   freader.readAsDataURL(image)

   freader.onload = async ()=>{
     loader.value = true
     let isuploaded = await galaxy.UploadProfileImage(localStorage.getItem("GToken"),freader.result)
     if(isuploaded === "UPLOADED" || isuploaded === true){
        loader.value = false
        showmsg({msg:"Image was succesfully uploaded !",error:true,manual:false,type:"show"})
        emit("updatefollower")
     }
     else if(isuploaded === "INTERNEL_ERROR"){
        loader.value = false
        showmsg({msg:"Something went wrog ! - Server error",error:true,manual:false,type:"show"})
     }
   }
  
}

// delete account
async function deleteaccount() {
    loader.value = true
    let isdeleted = await galaxy.DeleteAccount(localStorage.getItem("GToken"))
    if(isdeleted === "CREDENTIALS_ONLY_DELETED"){
        loader.value = false
        showmsg({msg:"Your credentials only deleted. So please contact our customer care now !",error:true,manual:false,type:"show"})
    }
    else if(isdeleted === "UNKNOWN_ACCOUNT"){
        loader.value = false
        showmsg({msg:"Unkown user account !",error:true,manual:false,type:"show"})
    }
    else if(isdeleted === false){
        loader.value = false
        showmsg({msg:"Something went wrog ! - Server error",error:true,manual:false,type:"show"})
    }
    else if(isdeleted === true){
        loader.value = false
        showmsg({msg:"Your account was succesfully deleted now !",error:true,manual:false,type:"show"})
        localStorage.clear()
        sessionStorage.clear()
        location.reload()
    }
}
</script>
<style src="../css/profset.css" scoped></style>