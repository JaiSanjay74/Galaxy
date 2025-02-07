<template>
    
    <div class="posts" @scroll="homeel">
        <b class="tit">Posts</b>
        <b v-if="posts.length == 0">No posts</b>
        <div class="hl" v-else>
        <Post v-for="post in posts" :key="post.postid" 
         :user="post.owner" :usernm="post.name" :usrimg="post.img" :post="post.post" 
         :postid="post.postid" :noOfrp="post.noOfreplys" :noOfli="post.noOflikes"
         :noOful="post.noOfUnlikes" :type="datum.type" :islk="post.IsViewerLiked" :isul="post.IsViewerUnliked"
        />
       </div>
        
    </div>
</template>

<script setup>
import { onMounted, onUpdated, ref,defineProps, inject, onUnmounted} from 'vue';
import {getHomePosts,getPosts} from "../res/GalaxyRESTAPIv1.js"

var datum = defineProps(['type','gid'])
let msg = inject("Messenger")
var posts = ref([])
var updation = {
    isprivateUpdted:false,
    ishomeupdated:false
}

let homeel = ref(null)

// for storing recived postids
let storeRecivedposts = (serdta)=>{
                if(sessionStorage.getItem("recpst") != null){
                    let oldrecposts = JSON.parse(sessionStorage.getItem("recpst"))
                    for(let post of serdta){
                        oldrecposts.postids.push(post.postid)
                    } 
                    sessionStorage.setItem("recpst",JSON.stringify(oldrecposts))
                }
                else{
                    let newrecivedposts = {postids:[]}
                    for(let post of serdta){
                        newrecivedposts.postids.push(post.postid)
                    } 
                    sessionStorage.setItem("recpst",JSON.stringify(newrecivedposts))
                }
            }

onMounted(async()=>{

    if(datum.type === "private"){
        let serverdata = await getPosts(localStorage.getItem("GToken"),datum.type,null)
        if(serverdata === "USER_NOT_FOUND"){
           msg({msg:"User not found !",error:true,manual:false,type:"show"})
        }
        else if(serverdata === "UNKOWN_ACCOUNT"){
           msg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
        }
        else{
            updation.isprivateUpdted = true
            posts.value = serverdata 
        }
    }
    else if(datum.type === "home"){
        let serverdata = await getHomePosts(localStorage.getItem("GToken"),[])
        if(serverdata.length == 0){
            msg({msg:"Somethings went wrong !",error:true,manual:false,type:"show"})
        }
        else{
            updation.ishomeupdated = true
            posts.value = serverdata
            sessionStorage.setItem("isHome","home")
            
            storeRecivedposts(serverdata)
            // for request user posts through analytics
            let getHomepostsAnalytics = async(el)=>{

                let ScrollBarHeight = 0
                let ScrolledAmount = 0
                let contentSize = 0

               ScrollBarHeight = el.currentTarget.clientHeight
               ScrolledAmount = el.currentTarget.scrollTop
               contentSize = el.currentTarget.scrollHeight

               let ThumbSize = 0

              if(contentSize > ScrollBarHeight){
                  let overflowedSize = contentSize - ScrollBarHeight
                  ThumbSize = ScrollBarHeight - overflowedSize
                  
                  if(Math.round(ScrolledAmount) == Math.round(ScrollBarHeight - ThumbSize)){
                    console.log(Math.round(ScrolledAmount) == Math.round(ScrollBarHeight - ThumbSize))
                   
                    if(posts.value.length != 0){
                        let newposts = await getHomePosts(localStorage.getItem("GToken"),JSON.parse(sessionStorage.getItem("recpst")).postids)
                        posts.value.push(...newposts)
                        storeRecivedposts(newposts)
                        console.log(posts.value)
                    }
                  }
               }
            }
            homeel.value = getHomepostsAnalytics
            console.log(homeel.value)
        }
    }
    else if(datum.type === "public"){
        let serverdata = await getPosts(localStorage.getItem("GToken"),datum.type,null)
        if(serverdata === "USER_NOT_FOUND"){
           msg({msg:"User not found !",error:true,manual:false,type:"show"})
        }
        else if(serverdata === "UNKOWN_ACCOUNT"){
           msg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
        }
        else{
            posts.value = serverdata 
        }
    }
}) 

onUpdated(async()=>{
   if(datum.type === "private"){
    if(!updation.isprivateUpdted){
        let serverdata = await getPosts(localStorage.getItem("GToken"),datum.type,null)
        posts.value = serverdata
        updation.isprivateUpdted = true
        updation.ishomeupdated = false
    }
   }
   else if(datum.type === "home"){
    if(!updation.ishomeupdated){
        var serverdata = await getHomePosts(localStorage.getItem("GToken"),[])
      posts.value = serverdata
      updation.ishomeupdated = true
      updation.isprivateUpdted = false 
    }
   }
})
</script>
<style src="../css/posts.css" scoped></style>