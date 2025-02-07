<template>
    
    <div class="proflist">
        <b class="tit">{{datum.type === "followers"?'Followers':'Followings'}} ({{ fdatum.length ? fdatum.length : 0 }})</b>
        <b v-if="fdatum.length == 0">No {{datum.type === "followers"?'Followers':'Followings'}}</b>
        <div class="hl" v-else>
        <div class="prof" v-for="data in fdatum" :key="data.gid">
        <ProfileImage :url="data.img"/>
        <div :gid="data.gid">
            <b @click="openuser">{{data.name}}</b>
            <b>{{data.gid}}</b>
        </div>
        </div>
        </div>
    </div>
</template>

<script setup>
import * as galaxy from "../res/GalaxyRESTAPIv1.js"
import { onMounted, ref,defineProps, inject,onUpdated} from 'vue';

let datum = defineProps(["type"])
let fdatum = ref([])

let showmsg = inject("Messenger")
let setwindow = inject("WindowModifer")

let usertype = inject("usertype")
let usergid = inject("usergid")


// Updation controls
let current = datum.type == "followers" ? "followings":"followers"

let openuser = (e)=>{
    setwindow("profileinfo")
    usertype.value = "public"
    usergid.value = e.currentTarget.parentElement.getAttribute("gid")
}
onMounted(async()=>{
   if(datum.type === "followers"){
    
    let follower = await galaxy.getFollowerOrFollowings(localStorage.getItem("GToken"),"follower")
    console.log(follower)
    if(follower === "UNKNOWN_ACCOUNT"){
        showmsg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
    }
    else{
        fdatum.value = follower.data
    }
    
    if(follower.error){
        showmsg({msg:"Some followers are not found !",error:true,manual:false,type:"show"})
    }
   }
   else if(datum.type === "followings"){
    let follower = await galaxy.getFollowerOrFollowings(localStorage.getItem("GToken"),"followings")
    console.log(follower)
    if(follower === "UNKNOWN_ACCOUNT"){
        showmsg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
    }
    else{
        fdatum.value = follower.data
    }
    
    if(follower.error){
        showmsg({msg:"Some followings are not found !",error:true,manual:false,type:"show"})
    }
   }
})

onUpdated(async()=>{
   if(datum.type === current){
     if(datum.type === "followers"){
        let follower = await galaxy.getFollowerOrFollowings(localStorage.getItem("GToken"),"follower")
        console.log(follower)
        if(follower === "UNKNOWN_ACCOUNT"){
          showmsg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
        }
        else{
          fdatum.value = follower.data
        }
    
        if(follower.error){
         showmsg({msg:"Some followers are not found !",error:true,manual:false,type:"show"})
        }
         current = "followings"
    }
    else{
        let follower = await galaxy.getFollowerOrFollowings(localStorage.getItem("GToken"),"followings")
        console.log(follower)
        if(follower === "UNKNOWN_ACCOUNT"){
          showmsg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
        }
        else{
          fdatum.value = follower.data
        }
    
        if(follower.error){
        showmsg({msg:"Some followings are not found !",error:true,manual:false,type:"show"})
        }
         current = "followers"
     }
   }
})
</script>
<style src="../css/profilelist.css" scoped></style>