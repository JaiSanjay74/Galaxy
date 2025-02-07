<template>
    <div class="profile"  v-if="profile != null">
        <div class="primg">
            <img :src="image"/>
            <div class="ins">
          <b>{{profile.name}}</b>
          <b>{{ profile.GID }}</b>
          <div>
          <b @click="state = 'set'"><i class="fa-solid fa-gear"></i>Settings</b>
          </div>
        </div>
        </div>

        <div class="info" v-if="state == 'core'">
            <b>Name</b>
            <input type="text" spellcheck="false" placeholder="Name" :value="profile.name" :ref="(e)=>{inps.push(e)}" disabled>
            <b>Email</b>
            <input type="email" spellcheck="false" placeholder="Email" :value="profile.email" :ref="(e)=>{inps.push(e)}" disabled>
            <div class="spps">
              <b>{{ profile.followers.length }} Followers</b>
              <b>{{ profile.followings.length }} Followings</b>
            </div>
            <button @click="update.fn">{{update.ubtntxt}}</button>
            <button v-if="update.ubtntxt == 'SAVE'" @click="cancel">Cancel</button>
        </div>

        <Settings v-else @close="closeset" @updatefollower="reload" :fstate="profile.settings.followersVisiblity"/>
        
    </div>
</template>

<style src="../css/profile.css" scoped></style>
<script>
import { onMounted, reactive, ref ,inject, onUpdated, nextTick} from 'vue';
import Profset from './Profset.vue';
import * as galaxy from "../res/GalaxyRESTAPIv1.js"

export default {
    components:{
        Settings:Profset
    },
    setup(){

        let showmsg = inject("Messenger")
        let setwindow = inject("WindowModifer")
        /////////////////////
        let state = ref("core")
        let profile = ref(null)

        let oldname = ""
        let oldemail = ""

        // for updating image
        let image = ref("")
        // for updation
        let inps = []
        let update = reactive({
            ubtntxt:"Update",
            fn:()=>{}
        })
        let cancel = ()=>{
            inps.splice(0,inps.length - 2)
            inps[0].disabled = true
            inps[1].disabled = true
            update.ubtntxt = "Update"
            update.fn = ()=>{
                        inps.splice(0,inps.length - 2)
                         inps[0].removeAttribute("disabled")
                       inps[1].removeAttribute("disabled")
                     inps[0].focus()
                       update.ubtntxt = "SAVE"
                       update.fn = updateaccount
                     }
        }
        let updateaccount = async ()=>{
            inps.splice(0,inps.length - 2)
            if(oldemail !== inps[1].value){
                let isupdated = await galaxy.UpdateAccount(localStorage.getItem("GToken"),{email:inps[1].value})
                if(isupdated === "EXISTS"){
                    showmsg({msg:"Please use another email",error:true,manual:false,type:"show"})
                }
                else if(isupdated === false){
                    showmsg({msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
                }
                else{
                    let prof = await galaxy.getUserAccount(localStorage.getItem("GToken"),"private",null)
                    console.log(prof)
                    if(prof){
                       profile.value = prof
                       oldemail = prof.email
                       oldname = prof.name
                      cancel() 
                    }
                }
            }
            else{
                cancel()
            }
           
            if(oldname !== inps[0].value){
               let isupdated = await galaxy.UpdateAccount(localStorage.getItem("GToken"),{name:inps[0].value})
                if(isupdated === false){
                    showmsg({msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
                }
                else{
                    let prof = await galaxy.getUserAccount(localStorage.getItem("GToken"),"private",null)
                    console.log(prof)
                    if(prof){
                       profile.value = prof
                       oldemail = prof.email
                       oldname = prof.name
                       cancel()
                    }
                }
            }
            else{
                cancel()
            }
        }
    
        onMounted(async()=>{
          let prof = await galaxy.getUserAccount(localStorage.getItem("GToken"),"private",null)
          if(prof){
            image.value = await(await fetch(prof.settings.profileImage)).text()
            console.log(image)  
            profile.value = prof
            oldemail = prof.email
            oldname = prof.name
            update.fn = ()=>{
                inps.splice(0,inps.length - 2)
                inps[0].removeAttribute("disabled")
                inps[1].removeAttribute("disabled")
                inps[0].focus()
                update.ubtntxt = "SAVE"
                update.fn = updateaccount
            }
            
          }
        })
        onUpdated(()=>{console.log("updated"+image)})
        let reload = async ()=>{
          let prof = await galaxy.getUserAccount(localStorage.getItem("GToken"),"private",null)
          if(prof){
            let dt = await(await fetch(prof.settings.profileImage)).text()
            image.value = dt
            await nextTick()
            console.log(dt)
            profile.value = prof
            oldemail = prof.email
            oldname = prof.name
            update.fn = async ()=>{
                inps.splice(0,inps.length - 2)
                inps[0].removeAttribute("disabled")
                inps[1].removeAttribute("disabled")
                inps[0].focus()
                update.ubtntxt = "SAVE"
                update.fn = updateaccount
            }
            
          }
        }
       
        let closeset = ()=>{
            state.value = "core"
        }
        return {state,closeset,profile,update,inps,cancel,reload,image}
    }
}
</script>