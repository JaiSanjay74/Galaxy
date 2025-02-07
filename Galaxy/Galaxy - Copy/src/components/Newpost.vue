<template>
    <div class="newpost">
        <div class="head">
        <i class="fa-solid fa-xmark" @click="()=>{win('posts')}"></i>
        <b>New Post</b>
        </div>
        <textarea placeholder="Type a post" spellcheck="false"></textarea>
        <button @click="newpost"><span>+</span>Post</button>
    </div>
</template>

<script setup>
import { inject } from "vue";
import {UploadPost} from "../res/GalaxyRESTAPIv1.js"

let msg = inject("Messenger")
let win = inject("WindowModifer")

async function newpost(e) {
    let post = e.target.parentElement.children.item(1).value
    if(post.length != 0){
        let result = await UploadPost(localStorage.getItem("GToken"),post)
        if(result === "INTERNEL_ERROR"){
          msg({msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
        }
        else if(result === "UNKNOWN_ACCOUNT"){
          msg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
        }
        else{
          msg({msg:"Successfully posted ! Go to My posts to see your new post",error:true,manual:false,type:"show"})
          win("posts")
        }
    }
    else{
        msg({msg:"Please fill post box !",error:true,manual:false,type:"show"})
    }
}
</script>
<style src="../css/newpost.css" scoped></style>