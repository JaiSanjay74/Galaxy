
<template>
  
 <div class="app" v-if="screen == 'application'">
   <div class="a1">
    <img src="./res/galaxy.png" id="logo"  @click="sfn">
    <b v-if="!search">Galaxy</b>
    <input type="text" placeholder="Search" spellcheck="false" v-if="search">
    <i class="fa-solid fa-magnifying-glass" @click="searchfn" ></i>
    </div>

    <div class="a2">
        
    <nav>
        <div>
        <section @click="()=>{window = 'posts';postpurpose = 'home'}">
            <i class="fa-solid fa-house"></i>
            <b>Home</b>
        </section>
        <section @click="()=>{window = 'profilelist';profilelistpurpose = 'followers'}">
            <i class="fa-solid fa-user-plus"></i>
            <b>Followers</b>
        </section>
        <section @click="()=>{window = 'profilelist';profilelistpurpose = 'followings'}">
            <i class="fa-solid fa-person-walking"></i>
            <b>Following</b>
        </section>
        <section @click=" window = 'posts';postpurpose = 'private'">
            <i class="fa-solid fa-signs-post"></i>
            <b>My posts</b>
        </section>
        <section @click="()=>{window = 'profile';postpurpose = 'private'}">
            <i class="fa-solid fa-user"></i>
            <b>My profile</b>
        </section>
    </div>

    <div class="account">
             <ProfileImage :url="ucred.img"/>
            <div>
                <b>{{ucred.name}}</b>
                <b>{{ ucred.gid }}</b>
            </div>
        </div>
    </nav>
    
    <div class="screen">
     <ProfileList v-if="window == 'profilelist'" :type="profilelistpurpose"/>
     <Profileinfo v-else-if="window == 'profileinfo'" :type="usertype" :gid="usergid"/>
     <Posts v-else-if="window == 'posts'" :gid="postsgid" :type="postpurpose"/>
     <Postview v-else-if="window == 'postview'" :postid="postid"/>
     <Profile v-else-if="window == 'profile'"/>
     <Newpost v-else-if="window == 'npost'"/>
     <Loader v-if="loader"/>
    </div>

    <button id="adpst" @click="window = 'npost'"><span>+</span>Post</button>
     </div>

     <div class="mmsg" v-if="message != null">
        <div>
        <i :class="'fa-solid fa-circle-exclamation'+ message.type "></i>
        <b>{{message.msg}}</b>
        </div>
     </div>
    
     
  </div>

<div class="home" v-else>
   <div class="mmsg" v-if="homemsg != null">
        <div>
        <i :class="'fa-solid fa-circle-exclamation'  +homemsg.type"></i>
        <b>{{ homemsg.msg }}</b>
        </div>
     </div>

      <div class="head" >
        <img src="./res/galaxy.png" id="logo">
        <b>Galaxy</b>
      </div>

      <div v-if="window == null" class="inf">
      <p>Stay connected with others around the world</p>
      <h5>India's number one social media which is available around the world</h5>
      <button @click="window = 'signup'">Sign Up</button>
      <b class="alr">Already have an account? <span @click="window = 'login'">Log in</span></b>
    </div>
    <Login v-if="window == 'login'" :isFromApp="isLogin.v" @app="screen = 'application'" @msg="ShowHomeMessage"/>
    <Signup v-if="window == 'signup'"  @msg="ShowHomeMessage"/>

  </div>

</template>

<style src="./Main_css/app.css" scoped>

</style>
<style src="./Main_css/home.css" scoped></style>
<script setup>
import { provide, ref ,onMounted, onUpdated} from "vue";
import Newpost from "./components/Newpost.vue"
import Test from "./components/Test.vue";
import {getUserAccount} from "./res/GalaxyRESTAPIv1.js"

import * as SecurityV1 from "./res/SecurityV1/Securityv1.js"

//loader.vue
let loader = ref(false)
 //----window datum---

 //Posts.vue
 let postpurpose = ref("home")
 let postsgid = ref("")

 //Profilelists.vue
 let profilelistpurpose = ref("followers")

 //Postview.vue
 let postid = ref("")

 // App.vue (Account display at the bottom-lefts)
 var ucred = {
    name:"",gid:"",img:""
 }
 // Profileinfo.vue

  let usergid = ref("")
  let usertype = ref("")

  
//------App core-----
var screen = ref("home")
var window = ref(null)
var message = ref(null)
var homemsg = ref(null) //{type:"er",msg:"text"}
//
  // search
 let search = ref(false)
 let searchfn = sfn
 let searchprofile = async (e)=>{
    let searchtx = e.target.parentElement.children.item(1).value
    console.log(e.target.parentElement.children)
    console.log(searchtx)
    
    if(searchtx.length != 0){
       let isexists = await getUserAccount(localStorage.getItem("GToken"),"public",searchtx)
       if(isexists != null){
        SetWindow("profileinfo")
        usergid.value = searchtx
        usertype.value = "public"
        search.value = false
        searchfn = sfn
       } 
       else{
        ShowMessage({msg:"Unknown user !",error:true,manual:false,type:"show"}) 
       }
    }
    else{
       ShowMessage({msg:"Please type user GID in search box !",error:true,manual:false,type:"show"})
    }
}

function sfn(){
    search.value = !search.value
    if(search.value){
        searchfn = searchprofile
    }
    else{
        searchfn = sfn
    }
}

// login trigerer
let isLogin = {v:false}
provide("islogin",isLogin)
//

function SetWindow (win){window.value = win}

function ShowMessage(settings){ 
    console.log("work")
    if(settings.type == "show"){
        let purpose = settings.error ? " er":" suc"
        message.value = {type:purpose,msg:settings.msg}
        if(!settings.manual){
            setTimeout(()=>{
              message.value = null
            },2000)
        }
    }
    else{
        homemsg.value = null
    }
}
let ShowHomeMessage = (settings)=>{ 
    
    if(settings.type == "show"){
        let purpose = settings.error ? " er":" suc"
        homemsg.value = {type:purpose,msg:settings.msg}
        if(!settings.manual){
            setTimeout(()=>{
              homemsg.value = null
            },2000)
        }
    }
    else{
        homemsg.value = null
    }
}
let logged = async()=>{
    let IsAlreadyLogged = localStorage.getItem("GToken")

    if(IsAlreadyLogged){
        let cred = await getUserAccount(localStorage.getItem("GToken"),"private",null)
        sessionStorage.clear()
        if(cred === "EXPIRED"){
            ShowHomeMessage({msg:"Your token was expired. Please login again !",error:true,manual:false,type:"show"})
        }
        else if(cred === "JWT_ERROR"){
            ShowHomeMessage({msg:"Something went wrong !",error:true,manual:false,type:"show"})
        }
        else{
            ucred.gid = cred.GID
            ucred.name = cred.name
            ucred.img = cred.settings.profileImage
            screen.value = "application"
            SetWindow("posts")
            sessionStorage.setItem("tmpgid",cred.GID)
        }
        // configure security
        await SecurityV1.configureSecurity()
    } 
}

onMounted(logged)

provide("screen",screen)
provide("WindowModifer",SetWindow)
provide("Messenger",ShowMessage)

provide("POSTID",postid)

provide("postgid",postsgid)
provide("postspurpose",postpurpose)

provide("usertype",usertype)
provide("usergid",usergid)

provide("loader",loader)
</script>