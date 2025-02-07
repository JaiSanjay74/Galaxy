<template>

    <div class="post" >
        <div class="account">
            <div @click="()=>{
                    setwindow('profileinfo')
                    usergid = datum.user
                    usertype = 'public'
                }"><ProfileImage :url="datum.usrimg"/></div>
            <div>
                <b @click="()=>{
        postid = datum.postid;
        setwindow('postview');
        storage.setItem('tmpwinkey','posts')}" :ref="(e)=>{comp = e}">{{ datum.usernm }}</b>
                <b>{{ datum.user }}</b>
            </div>
        </div>
        <div class="msg">
            {{datum.post}}
        </div>
        <div class="opt">
            <i class="fa-regular fa-comment" >{{ datum.noOfrp }}</i>
            <i :class="'fa-solid fa-thumbs-up '+like" @click="lupdate">{{lcount}}</i>
            <i :class="'fa-solid fa-thumbs-down '+ unlike" @click="uupdate">{{ ucount }}</i>
        </div>
    </div>

</template>

<script setup>

let storage = sessionStorage
import * as PostFns from "../res/JS/Postfunctions.js"
import { ref,inject,defineProps, onUnmounted, onMounted, onUpdated} from "vue"; 
import { onLongPress } from "@vueuse/core";
import {DeletePost} from "../res/GalaxyRESTAPIv1.js"

let datum = defineProps(['user','usernm','usrimg','post','postid','noOfrp','noOfli','noOful','type','islk','isul'])
let like = ref(datum.islk)
let unlike = ref(datum.isul)
let lcount = ref(datum.noOfli)
let ucount = ref(datum.noOful)

let showmsg = inject("Messenger")
let postid = inject("POSTID")
let setwindow = inject("WindowModifer")

let lupdate = async (e)=>{
    await PostFns.Likepost(datum.postid,like,unlike,showmsg,lcount,ucount)}
let uupdate = async (e)=>{
    await PostFns.UnLikepost(datum.postid,like,unlike,showmsg,lcount,ucount)} 

let comp = null
let removelongpress = null
onMounted(()=>{
    if(datum.type === "private"){
      removelongpress = onLongPress(comp,async()=>{
          let isdeleted = await DeletePost(localStorage.getItem("GToken"),datum.postid)
          if(isdeleted === "UNKNOWN_ACCOUNT"){
            showmsg({msg:"Unkown user account !",error:true,manual:false,type:"show"})
          }
          else if(isdeleted){
            showmsg({msg:"Post was deleted !",error:false,manual:false,type:"show"})
          }
          else{
            showmsg({msg:"Unable to delete the post !",error:true,manual:false,type:"show"})
          }
       },{delay:2000})
       console.log(comp)
    }
})
onUpdated(()=>{
    if(removelongpress != null){
        console.log("rem")
        removelongpress()
        removelongpress = null
    }
})
let usertype = inject("usertype")
let usergid = inject("usergid")
</script>
<style src="../css/post.css" scoped></style>