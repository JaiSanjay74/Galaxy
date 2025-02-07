<template>
    <div class="postview" v-if="fpost != null">
        <div class="account">
            <i class="fa-solid fa-arrow-left" @click="()=>{changewin(storage.getItem('tmpwinkey'))}"></i>
            <div @click="()=>{
                    changewin('profileinfo')
                    usergid = fpost.gid
                    usertype = 'public'
                }"><ProfileImage :url="fpost.img"/></div>
            <div>
                <b>{{fpost.name}}</b>
                <b>{{ fpost.gid }}</b>
            </div>
        </div>
        <div class="msg">
           {{fpost.post}}
        </div>
        <div class="opt">
            <i :class="'fa-solid fa-thumbs-up '+like" @click="lupdate">{{ lcount }}</i>
            <i :class="'fa-solid fa-thumbs-down '+unlike" @click="uupdate">{{ ucount }}</i>
        </div>
        <b class="rtit">Replies ({{ finalReplys.length }})</b>
        <div class="reply">
            <textarea placeholder="Reply" :ref="(e)=>{reptxt.push(e)}"></textarea>
            <button @click="reply">Reply</button>
        </div>
        
        <div v-for="reply in finalReplys" :key="reply.repid" :repid="reply.repid" class="rlu">

        <div class="account" style="margin-top: 25px;" >
            <div @click="()=>{
                    changewin('profileinfo')
                    usergid = reply.gid
                    usertype = 'public'
                }"><ProfileImage :url="reply.img"/></div>
            <div>
                <b>{{reply.name  }}</b>
                <b>{{reply.gid}}</b>
            </div>
        </div>
        <div class="msg">
            {{reply.reply}}
        </div>
        <div class="opt">
            <i :class="'fa-solid fa-thumbs-up '+reply.IsViewerLiked" @click="lrupdate">{{ reply.noOflikes }}</i>
            <i :class="'fa-solid fa-thumbs-down '+reply.IsViewerUnliked" @click="urupdate">{{ reply.noOfUnlikes }}</i>
        </div>

    </div>

    </div>
</template>
<script setup>
let storage = sessionStorage
import { defineProps ,ref,inject, onMounted,onUnmounted} from 'vue';
import {getMainPost,ReplyPost,PostAnalytics} from "../res/GalaxyRESTAPIv1.js"
import * as PostFns from "../res/JS/Postfunctions.js"

let datum = defineProps(['postid'])

let fpost = ref(null)
let finalReplys = ref([])

let like = ref("")
let unlike = ref("")
let lcount = ref("")
let ucount = ref("")


let lupdate = async (e)=>{
    console.log(datum.postid)
    await PostFns.Likepost(datum.postid,like,unlike,showmsg,lcount,ucount)}
let uupdate = async (e)=>{
    await PostFns.UnLikepost(datum.postid,like,unlike,showmsg,lcount,ucount)} 

let lrupdate = async (e)=>{
    await PostFns.Likereply(e,showmsg,fpost,finalReplys,datum.postid)}
let urupdate = async (e)=>{
    await PostFns.UnLikereply(e,showmsg,fpost,finalReplys,datum.postid)}     
let showmsg = inject("Messenger")
let changewin = inject("WindowModifer")

let usertype = inject("usertype")
let usergid = inject("usergid")

onUnmounted(()=>{
    sessionStorage.removeItem("isHome")
})

onMounted(async()=>{
    let post = await getMainPost(localStorage.getItem("GToken"),datum.postid)
    console.log(post)
    if(post === "NO_POST_USER_FOUND"){
        showmsg({msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
    }
    else if(post === "NO_POST_FOUND"){
        showmsg({msg:"No post found !",error:true,manual:false,type:"show"})
    }
    else if(post === "USER_NOT_FOUND"){
        console.log(post+"set")
        showmsg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
    }
    else{
        fpost.value = post.post
        finalReplys.value = post.replys

        like.value = post.post.IsViewerLiked
        unlike.value = post.post.IsViewerUnliked
        lcount.value = post.post.NoOflikes
        ucount.value = post.post.NoOfUnlikes
    }

    // for user analytics
     if(sessionStorage.getItem("isHome") === "home"){
        console.log(0)
         await PostAnalytics(localStorage.getItem("GToken"),post.post.gid,"recentViews")
     }
})


let reptxt = []
async function reply() {
    reptxt.splice(0,reptxt.length - 1)
    if(!reptxt[0].value.length == 0 || !reptxt[0].value === ""){
        let reply_txt = await ReplyPost(localStorage.getItem("GToken"),reptxt[0].value ,datum.postid)

         if(reply_txt === "UNKNOWN_ACCOUNT"){
           showmsg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
           }
        else if(reply_txt === false){
          showmsg({msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
         }
       else{
            let post = await getMainPost(localStorage.getItem("GToken"),datum.postid)
            if(post === "NO_POST_USER_FOUND"){
               showmsg({msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
             }
            else if(post === "NO_POST_FOUND"){
               showmsg({msg:"No post found !",error:true,manual:false,type:"show"})
            }
            else if(post === "USER_NOT_FOUND"){
               showmsg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
             }
            else{
               fpost.value = post.post
               finalReplys.value = post.replys
           }
        }
    }
    else{
        showmsg({msg:"Please fill reply box !",error:true,manual:false,type:"show"})
    }
}
</script>
<style src="../css/postview.css" scoped></style>