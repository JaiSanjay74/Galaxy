import {ReplyPost,LikePost,UnLikePost,LikeReply,UnLikeReply,DeletePost,getMainPost} from "../GalaxyRESTAPIv1.js"

export async function Reply(txt,element) {
    let postid = element.parentElement.getAttribute("postid")
    let token = sessionStorage.getItem("GToken")
    let isreplayed = await ReplyPost(token,txt,postid)

    return isreplayed
}

export async function Likepost(postid,lk,uk,Showmsg,lc,uc) {
    let token = localStorage.getItem("GToken")
    let result = await LikePost(token,postid)
    //console.log(result.data)
    if(!Object.keys(result.data).includes("initial")){
        //console.log(result.data)
        if(result.data === "ERROR" || result.data.l === false){
            Showmsg({msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
        }
        else if(result.data === "POST_NOT_FOUND"){
            Showmsg({msg:"Post not found !",error:true,manual:false,type:"show"})
        }
        else if(result.data === "UNKNOWN_ACCOUNT"){
            Showmsg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
        }
        else{
            console.log(result.data)
            uk.value = false
            lk.value = true
            lc.value = result.data.l
            uc.value = result.data.u
        }
    }
    else{
        let {data} = result
        if(data.l !== false){
            lk.value = false
            uk.value = false
            lc.value = result.data.l
            uc.value = result.data.u
            console.log(result.data)
        }
        else{
            Showmsg({msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
        }
    }
}


export async function UnLikepost(postid,lk,uk,Showmsg,lc,uc) {
    let token = localStorage.getItem("GToken")
    let result = await UnLikePost(token,postid)

    if(!Object.keys(result.data).includes("initial")){
        if(result.data === "ERROR" || result.data.u === false){
            Showmsg({msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
        }
        else if(result.data === "POST_NOT_FOUND"){
            Showmsg({msg:"Post not found !",error:true,manual:false,type:"show"})
        }
        else if(result.data === "UNKNOWN_ACCOUNT"){
            Showmsg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
        }
        else{
            uk.value = true
            lk.value = false
            lc.value = result.data.l
            uc.value = result.data.u
        }
    }
    else{
        let {data} = result
        if(data.l !== false){
            lk.value = false
            uk.value = false
            lc.value = result.data.l
            uc.value = result.data.u
        }
        else{
            Showmsg({msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
        }
    }
}

export async function Likereply(element,showmsg,fp,fr,pstid) {
    let repid = element.currentTarget.parentElement.parentElement.getAttribute("repid")
    let token = localStorage.getItem("GToken")
    console.log(repid+"rep")
    let result = await LikeReply(token,repid)

        if(result.data === "ERROR" || result.data.l === false){
            showmsg({msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
        }
        else if(result.data === "POST_NOT_FOUND"){
            showmsg({msg:"Post not found !",error:true,manual:false,type:"show"})
        }
        else if(result.data === "UNKNOWN_ACCOUNT"){
            showmsg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
        }
        else{
            let post = await getMainPost(localStorage.getItem("GToken"),pstid)
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
                fp.value = post.post
                fr.value = post.replys
        
            }
        }
}

export async function UnLikereply(element,showmsg,fp,fr,pstid) {
    let repid = element.currentTarget.parentElement.parentElement.getAttribute("repid")
    let token = localStorage.getItem("GToken")
    let result = await UnLikeReply(token,repid)

        if(result.data === "ERROR" || result.data.u === false){
            showmsg({msg:"Something went wrong ! - Server problem",error:true,manual:false,type:"show"})
        }
        else if(result.data === "POST_NOT_FOUND"){
            showmsg({msg:"Post not found !",error:true,manual:false,type:"show"})
        }
        else if(result.data === "UNKNOWN_ACCOUNT"){
            showmsg({msg:"Unknown user account !",error:true,manual:false,type:"show"})
        }
        else{
            let post = await getMainPost(localStorage.getItem("GToken"),pstid)
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
                fp.value = post.post
                fr.value = post.replys
        
            }
        }
}
