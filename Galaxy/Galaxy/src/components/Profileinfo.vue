<template>
  <div class="profinfo" v-if="profile != null">
      <div class="pimg">
        <ProfileImage :url="profile.settings.profileImage"/>
      </div>
      <div class="pdetails">
        <b>{{profile.name}}</b>
        <b>{{profile.GID}}</b>
        <b>Joined On {{moment(profile.created).format("DD.MM.YYYY")}}</b>
        <b><span>{{profile.followers.length}} Followers</span><span>{{profile.followings.length}} Following</span></b>
      </div>
      <div class="opt">
        <b @click="openposts"><i class="fa-solid fa-film" ></i>Posts</b>
        <b @click="async()=>{
          if(!profile.followers.includes(gid)){
            await follow()
          }
          else{
            await unfollow()
          }
        }">{{!(profile.followers.includes(gid)) ? '+ Follow':'Un Follow'}}</b>
      </div>
  </div>
</template>

<script setup>
import * as galaxy from "../res/GalaxyRESTAPIv1.js"
import moment from "moment";
import { onMounted, ref,defineProps, inject} from 'vue';

let gid = sessionStorage.getItem("tmpgid")

let datum = defineProps(["gid","type"])
let profile = ref(null)
let postgid = inject("postgid")
let purpose = inject("postspurpose")
let setwindow = inject("WindowModifer")

let showmsg = inject("Messenger")

let openposts = ()=>{
          setwindow('posts')
          purpose.value = "public"
          postgid.value =  datum.gid
        }

let follow = async function(){
  let isfollowed = await galaxy.Follow(localStorage.getItem("GToken"),datum.gid)
  console.log(isfollowed)
  if(isfollowed === "NO_FOLLOWEE_FOUND"){
    showmsg({msg:"User which you tried to follow are not found !",error:true,manual:false,type:"show"})
  }
  else if(isfollowed === "UNKNOWN_ACCOUNT"){
    showmsg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
  }
  else{
    let prof = await galaxy.getUserAccount(localStorage.getItem("GToken"),datum.type,datum.gid)

    if(prof !== null){
      profile.value = prof
    }
  }
}
let unfollow = async function(){
  let isfollowed = await galaxy.UnFollow(localStorage.getItem("GToken"),datum.gid)
  console.log(isfollowed)
  if(isfollowed === "NO_FOLLOWEE_FOUND"){
    showmsg({msg:"User which you tried to follow are not found !",error:true,manual:false,type:"show"})
  }
  else if(isfollowed === "UNKNOWN_ACCOUNT"){
    showmsg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
  }
  else{
    let prof = await galaxy.getUserAccount(localStorage.getItem("GToken"),datum.type,datum.gid)

    if(prof !== null){
      profile.value = prof
    }
  }
}

onMounted(async()=>{
  let prof = await galaxy.getUserAccount(localStorage.getItem("GToken"),datum.type,datum.gid)
  console.log(datum.type)
  console.log(datum.gid)
  console.log(prof)
  if(prof !== null){
    profile.value = prof
  }
  else{
    showmsg({msg:"Unknown user !",error:true,manual:false,type:"show"})
  }
})


</script>
<style src="../css/profinfo.css" scoped>
</style>