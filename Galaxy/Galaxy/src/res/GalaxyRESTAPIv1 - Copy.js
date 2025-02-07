const server_origin = "http://localhost:7000"
import {AESEncryptData,DecryptAESEncryptedData} from "./SecurityV1/Securityv1.js"

export async function RequestSignUp(email,name,password){
    // Encryption Client Data
    let encrypted = AESEncryptData(JSON.stringify({
        email:email,password:password,name:name
    }))

    let data = await(await fetch(server_origin + "/api/signup",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
            },
        body:JSON.stringify(encrypted)     
    })).json()

    // Decryption Server Data (Response)
    let decrypted = await DecryptAESEncryptedData(data)

    return JSON.parse(decrypted).data 
}

export async function SignUp(requestID,otp) {
    // Encryption Client Data
    let encrypted = AESEncryptData(JSON.stringify({
        rqid:requestID,otp:otp
    }))

    let data = await(await fetch(server_origin + "/api/signup",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
            },
        body:JSON.stringify(encrypted)    
    })).json()

    // Decryption Server Data (Response)
    let decrypted = await DecryptAESEncryptedData(data)

    return JSON.parse(decrypted).data 
}

export async function SignIn(gid,password) {

    // Encryption Client Data
    let encrypted = AESEncryptData(JSON.stringify({
        gid:gid,password:password
    }))
    
    // Sending Encrypted data
    let data = await(await fetch(server_origin + "/api/signin",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
            },
        body: JSON.stringify(encrypted)   
    })).json()

    // Decryption Server Data (Response)
    let decrypted = await DecryptAESEncryptedData(data)
    return JSON.parse(decrypted).data                   // data.data
}

export async function SignOut(token) {
    let data = await(await fetch(server_origin + "/api/signout",{
        method:"POST",
        headers:{
            Authorization:"Bearer "+token
            }   
    })).json()
    return data.data
}

export async function UpdateAccount(token,credential) {  // credential should be object data type
    let update = async(cred,data)=>{
        // Encryption Client Data
        let encrypted = AESEncryptData(JSON.stringify({
            upinfo:cred,data:data
        }))
        let data = await(await fetch(server_origin + "/api/updateaccount",{
        method:"PUT",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
            },
        body: JSON.stringify(encrypted)    
    })).json()

    // Decryption Server Data (Response)
    let decrypted = await DecryptAESEncryptedData(data)
    return JSON.parse(decrypted).data
    }

    if(Object.keys(credential).includes("email")){
        return await update("email",credential.email)
    }
    else if(Object.keys(credential).includes("name")){
        return await update("name",credential.name)
    }
    else{
        return "UNKNOWN_CREDENTIAL_TYPE"
    }
}

export async function DeleteAccount(token) {
    let data = await(await fetch(server_origin + "/api/deleteaccount",{
        method:"DELETE",
        headers:{
            Authorization:"Bearer "+token
            }   
    })).json()
    return data.data
}

export async function ForgetPassword(gid) {

    // Encryption Client Data
    let encrypted = AESEncryptData(JSON.stringify({
        gid:gid
    }))

    let data = await(await fetch(server_origin + "/api/forgetpassword",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
            },
        body:JSON.stringify(encrypted)    
    })).json()
    
    // Decryption Server Data (Response)
    let decrypted = await DecryptAESEncryptedData(data)
    return JSON.parse(decrypted).data
}

export async function VerifyOTP(gid,otp) {
    let data = await(await fetch(server_origin + "/api/verifyotp",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
            },
        body:JSON.stringify({
            gid:gid,otp:otp
        })     
    })).json()
    return data.data
}

export async function ChangePassword(passtkn,password) {
    let data = await(await fetch(server_origin + "/api/changepassword",{
        method:"PUT",
        headers:{
            "Content-Type":"application/json"
            },
        body:JSON.stringify({
            passtoken:passtkn,password:password
        })     
    })).json()
    return data.data
}

export async function UploadProfileImage(token,Image_Base64) {
    let data = await(await fetch(server_origin + "/api/uploadprofileimage",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
            },
        body:JSON.stringify({
            image_base64_string:Image_Base64
        })     
    })).json()
    return data.data
}

export async function UploadPost(token,post) {
    let data = await(await fetch(server_origin + "/api/newpost",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
            },
        body:JSON.stringify({
            post:post
        })     
    })).json()
    return data.data
}

export async function DeletePost(token,postid) {
    let data = await(await fetch(server_origin + "/api/deletepost",{
        method:"DELETE",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
            },
        body:JSON.stringify({
            postid:postid
        })     
    })).json()
    return data.data
}

export async function ReplyPost(token,reply,postid) {
    let data = await(await fetch(server_origin + "/api/reply",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
            },
        body:JSON.stringify({
            reply:reply,postid:postid
        })     
    })).json()
    return data.data
}

export async function LikePost(token,postid) {
    let data = await(await fetch(server_origin + "/api/likepost",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
            },
        body:JSON.stringify({
            postid:postid
        })     
    })).json()
    return data
}


export async function UnLikePost(token,postid) {
    let data = await(await fetch(server_origin + "/api/unlikepost",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
            },
        body:JSON.stringify({
            postid:postid
        })     
    })).json()
    return data
}


export async function LikeReply(token,repid) {
    let data = await(await fetch(server_origin + "/api/likereply",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
            },
        body:JSON.stringify({
            repid:repid
        })     
    })).json()
    return data
}
export async function UnLikeReply(token,repid) {
    let data = await(await fetch(server_origin + "/api/unlikereply",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
            },
        body:JSON.stringify({
            repid:repid
        })     
    })).json()
    return data
}
export async function Follow(token,followeeID) {
    let data = await(await fetch(server_origin + "/api/follow",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
            },
        body:JSON.stringify({
            followeeID:followeeID
        })     
    })).json()
    return data.data
}
export async function UnFollow(token,followeeID) {
    let data =  await(await fetch(server_origin + "/api/unfollow",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
            },
        body:JSON.stringify({
            followeeID:followeeID
        })     
    })).json()
    return data.data
}
export async function PostFollowerVisible(token) {
    let data = await(await fetch(server_origin + "/api/setfollowervisible",{
        method:"POST",
        headers:{
            Authorization:"Bearer "+token
            }     
    })).json()
    return data.data
}
export async function getUserAccount(token,type,gid) {  // gid should be give null if type == private
    let url = type == "private" ? "/api/account?type=private":("/api/account?type=public&gid="+gid)
    let data = await(await fetch(server_origin + url,{  // type = private or any (it means public)
        method:"GET",
        headers:{
            Authorization:"Bearer "+token
            }    
    })).json()
    return data.data
}
export async function getFollowerOrFollowings(token,type) {  
    let data = await(await fetch(server_origin + "/api/followdetails?type="+type,{  // type = follower or any (it means followings)
        method:"GET",
        headers:{
            Authorization:"Bearer "+token
            }    
    })).json()
    return data
}
export async function getPosts(token,type,gid) {  // gid should be give null if type == private
    let url = type == "private" ? "/api/posts?type=private":("/api/posts?type=public&gid="+gid)
    let data = await(await fetch(server_origin + url,{  // type = private or any (it means public)
        method:"GET",
        headers:{
            Authorization:"Bearer "+token
            }    
    })).json()
    return data.data
}

export async function getMainPost(token,postid) { 
    
    let data = await(await fetch(server_origin + "/api/mainpost?postid="+postid,{  
        method:"GET",
        headers:{
            Authorization:"Bearer "+token
            }     
    })).json()
    return data.data
}

// For user analytics
export async function PostAnalytics(token,postusrid,comp) {  // comp should be likes or recentViews
    console.log(postusrid)
    let data = await(await fetch(server_origin + "/api/postanalytics",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
            },
        body:JSON.stringify({
            postuserid:postusrid,comp:comp
        })     
    })).json()
    return data.data
}                  
export async function getHomePosts(token,postids) {  // comp should be likes or recentViews
    let data = await(await fetch(server_origin + "/api/homeposts",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
            },
        body:JSON.stringify({
            recpostids:postids
        })     
    })).json()
    return data.data
}   