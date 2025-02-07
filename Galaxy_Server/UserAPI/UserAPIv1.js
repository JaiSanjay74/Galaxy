// User API V1
var cuid = require("cuid")
var filesys = require("fs")
var bcrypt = require("bcrypt")
require("dotenv").config({path:"../Security/.env"})
var datefns = require("date-fns")
var OTPmanager = require("../Server Components/OTPmanagerv1.js")
var jwt = require("jsonwebtoken")
var SecurityV1 = require("../Security/Securityv1.js")
var UserHelper = require("../Server Components/UserHelperFunctions.js")
var Uploadmanager = require("../Server Components/UploadManager.js")
var busboy = require("busboy")

async function Signup(rq,rs){
    if(!Object.keys(rq.body).includes("otp")){
       // For request signup
       let email = await rs.userprofiles.findOne({email:rq.body.email})
       if(email == null){
       let OTP = await OTPmanager.SendOTP("perunkarunai@gmail.com",rq.body.email,"OTP for verification")
       if((typeof OTP) == "string"){
        const request_id = cuid()
        rs.signupauth.insertOne({
            email:rq.body.email,
            reqid:request_id,
            otp:OTP, 
            exp:datefns.addMinutes(new Date(),5).toISOString(),
            name:rq.body.name,
            password:rq.body.password
        })
        SecurityV1.SendSecure({data:request_id},rs,rq.body.pubkey)
        //rs.send({data:request_id})
       }
       else{
        SecurityV1.SendSecure({data:false},rs,rq.body.pubkey)
        //rs.send({data:false})
       }
       }
       else{
        SecurityV1.SendSecure({data:"EXISTS"},rs,rq.body.pubkey)
        //rs.send({data:"EXISTS"})
       } 
    }
    else{
       // For completing signup
       let req = await rs.signupauth.findOne({reqid:rq.body.rqid})
       if(req != null){
         if(datefns.isBefore(new Date(),datefns.parseISO(req.exp))){
            let email = await rs.userprofiles.findOne({email:req.email})
            if(email == null){
                if(req.otp == rq.body.otp){
                    // Random post id derivation
                    let randomPosts = await rs.userposts.find().sort({date:-1}).limit(5).project({owner:1}).toArray()
                    let extractedPostids = []
                    for(let itm of randomPosts){
                        extractedPostids.push(itm.owner)
                    }
                    const ID = cuid()
                    // Password hashing
                    let hashed = await bcrypt.hash(req.password,await bcrypt.genSalt(10))
                    try{
                        await rs.userprofiles.insertOne({
                            name:req.name,
                            email:req.email,
                            password:hashed,
                            GID:req.name + ID.substring(3,7),
                            followers:[], // should be ID only
                            followings:[],
                            settings:{
                                followersVisiblity:true,
                                profileImage:process.env.ORIGIN + "/default.txt"
                            },
                            created:(new Date()).toISOString(),
                            currentOTP:null,
                            Analytics:{
                                recentViews:extractedPostids
                            }
                        })
                        let isgidsent = await OTPmanager.SendGID("perunkarunai@gmail.com",req.email,
                            "Your account was successfully created !",req.name + ID.substring(3,7))

                        await rs.signupauth.deleteOne({reqid:rq.body.rqid})
                        SecurityV1.SendSecure({data:isgidsent},rs,rq.body.pubkey)
                       // rs.send({data:isgidsent})
                    }
                    catch(er){
                        SecurityV1.SendSecure({data:"CREATION_FAILED"},rs,rq.body.pubkey)
                       // rs.send({data:"CREATION_FAILED"})
                    }
                }
                else{
                    SecurityV1.SendSecure({data:"INCORRECT_OTP"},rs,rq.body.pubkey)
                    //rs.send({data:"INCORRECT_OTP"})
                }
            }
            else{
                SecurityV1.SendSecure({data:"EXISTS"},rs,rq.body.pubkey)
                //rs.send({data:"EXISTS"})
            }
         }
         else{
            SecurityV1.SendSecure({data:"ATTEMPT_EXPIRED"},rs,rq.body.pubkey)
            await rs.signupauth.deleteOne({reqid:rq.body.rqid})
            //rs.send({data:"ATTEMPT_EXPIRED"})
         }
       }
       else{
        SecurityV1.SendSecure({data:"NO_ATTEMPT"},rs,rq.body.pubkey)
        //rs.send({data:"NO_ATTEMPT"})
       }
    }
}

async function Signin(rq,rs){
    let gid = await rs.userprofiles.findOne({GID:rq.body.gid})
    if(gid != null){
        let validatePassword = await bcrypt.compare(rq.body.password,gid.password)
        
        if(validatePassword){                                          //gid.password == rq.body.password
            let token = jwt.sign({
                gid:rq.body.gid
            },process.env.JWT_SECRET,{expiresIn:"24h"})
            //rs.send({data:token})
            SecurityV1.SendSecure({data:token},rs,rq.body.pubkey)
        }
        else{
           // rs.send({data:"INCORRECT_PASSWORD"})
            SecurityV1.SendSecure({data:"INCORRECT_PASSWORD"},rs,rq.body.pubkey)
        }
    }
    else{
        //rs.send({data:false})
        SecurityV1.SendSecure({data:false},rs,rq.body.pubkey)
    }
}
async function Signout(rq,rs){
    let islogout = (await rs.signoutedJWTS.updateOne({},{
        $push:{
            JWTS:UserHelper.getJWT(rq)
        }
    })).modifiedCount == 1
    rs.send({data:islogout})
}

async function UpdateAccount(rq,rs) {
    let gid = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))
    
    if(gid != null){
            switch(rq.body.upinfo){

                case "name":
                    let isNameModifed = (await rs.userprofiles.updateOne({GID:UserHelper.getGID(rs)}
                    ,{$set:{name:rq.body.data}})).modifiedCount == 1
                    SecurityV1.SendSecure({data:isNameModifed},rs,rq.body.pubkey);
                    //rs.send({data:isNameModifed}) 
                    break
                case "email":
                    let email = await rs.userprofiles.find({email:rq.body.email}).toArray()
                    if(email.length == 0){
                        let isEmailModifed = (await rs.userprofiles.updateOne({GID:UserHelper.getGID(rs)}
                        ,{$set:{email:rq.body.data}})).modifiedCount == 1
                        SecurityV1.SendSecure({data:isEmailModifed},rs,rq.body.pubkey);
                        //rs.send({data:isEmailModifed})
                    }
                    else{
                        SecurityV1.SendSecure({data:"EXISTS"},rs,rq.body.pubkey);
                        //rs.send({data:"EXISTS"})
                    }
            }
    }
    else{
        rs.send({data:"UNKOWN_ACCOUNT"})
    }
}

async function Deleteaccount(rq,rs){
    let gid = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))
    if(gid != null){
        let isALLrelationsDeleted = []
        let isdel = (await rs.userprofiles.deleteOne({
            GID:UserHelper.getGID(rs)
        })).deletedCount == 1
        let repln = await rs.userreplys.find({owner:UserHelper.getGID(rs)}).toArray() 
        let postln = await rs.userposts.find({owner:UserHelper.getGID(rs)}).toArray()
        
        // If account credentials deleted
        if(isdel){
            // If user replayed
            if(repln.length != 0){
               let isrepld = (await rs.userreplys.deleteMany({owner:UserHelper.getGID(rs)})).deletedCount > 0 
              isALLrelationsDeleted.push(isrepld ? true : false) 
            }
 
             //If user posted
             if(postln.length != 0){
               var ispostdel = (await rs.userposts.deleteMany({owner:UserHelper.getGID(rs)})).deletedCount > 0
               isALLrelationsDeleted.push(ispostdel ? true : false) 
             }      
             
             //If user posts has replyed
             for(let itm of postln){
                let replys = await rs.userreplys.find({postid:itm.postid}).toArray()
                if(replys.length != 0){
                    let replysdeleted = await rs.userreplys.deleteMany({postid:itm.postid})
                    isALLrelationsDeleted.push(replysdeleted)
                }
             }
             //if user profileimage deleted
             filesys.readdir("./UserProfileImages",(er,f)=>{
                if(f.includes(gid.GID+".txt")){
                    filesys.unlink("./UserProfileImages/"+gid.GID+".txt",async(e)=>{
                        isALLrelationsDeleted.push(!e ? true : false) 
                })
                 }
             })
                
            // If user has custom profile image
            if(isALLrelationsDeleted.length == 0){
                rs.send({data:true})
            }
            else{
                if(!isALLrelationsDeleted.includes(false)){
                    SecurityV1.SendSecure({data:true},rs,rq.body.pubkey);
                    //rs.send({data:true})
                }
                else{
                    SecurityV1.SendSecure({data:"CREDENTIALS_ONLY_DELETED"},rs,rq.body.pubkey);
                    //rs.send({data:"CREDENTIALS_ONLY_DELETED"})
                }
            }
        }
        else{
            SecurityV1.SendSecure({data:false},rs,rq.body.pubkey);
            //rs.send({data:false})
        }
    }
    else{
        SecurityV1.SendSecure({data:"UNKNOWN_ACCOUNT"},rs,rq.body.pubkey);
        //rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}

async function Forgetpassword(rq,rs){
    let isaccount = await UserHelper.IsUser(rs.userprofiles,rq.body.gid)
    if(isaccount != null){
       let isOtpsent = await OTPmanager.SendOTP("perunkarunai@gmail.com",
        isaccount.email,"OTP for forget password"
       )

       if(typeof isOtpsent == "string"){
         let otpupdated = await rs.userprofiles.updateOne({GID:rq.body.gid},{$set:{currentOTP:isOtpsent}})
         if(otpupdated.modifiedCount == 1){
            SecurityV1.SendSecure({data:isaccount.email},rs,rq.body.pubkey);
            //rs.send({data:isaccount.email})
            setTimeout(()=>{
                rs.userprofiles.updateOne({GID:rq.body.gid},{$set:{currentOTP:null}})
            },300000) // (1000 * 60) -> (60000 * 5) -> (300000) //-> 1000 = 1s, 60000 = 1m ,300000 = 5m  
         }
         else{
            SecurityV1.SendSecure({data:"ERROR"},rs,rq.body.pubkey);
            //rs.send({data:"ERROR"})
         }
       }
       else{
           SecurityV1.SendSecure({data:"ERROR"},rs,rq.body.pubkey);
           //rs.send({data:"ERROR"}) 
       }
    }
    else{
        SecurityV1.SendSecure({data:"UNKNOWN_ACCOUNT"},rs,rq.body.pubkey);
        //rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}

async function VerifyOTP(rq,rs) {
    let isaccount = await UserHelper.IsUser(rs.userprofiles,rq.body.gid)
    if(isaccount != null){
        if(isaccount.currentOTP == rq.body.otp){
           let token = jwt.sign({gid:rq.body.gid},process.env.PASSWORD_SECRET,{expiresIn:"4m"})
           SecurityV1.SendSecure({data:token},rs,rq.body.pubkey);
           //rs.send({data:token})
        }
        else{
           if(isaccount.currentOTP == null){
               SecurityV1.SendSecure({data:"EXPIRED"},rs,rq.body.pubkey);
              //rs.send({data:"EXPIRED"})
           } 
           else{
            SecurityV1.SendSecure({data:"INCORRECT_OTP"},rs,rq.body.pubkey);
            //rs.send({data:"INCORRECT_OTP"})
           }
        }
    }
    else{
        SecurityV1.SendSecure({data:"UNKNOWN_ACCOUNT"},rs,rq.body.pubkey);
        //rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}
async function Changepassword(rq,rs){
    try{
        let gid = jwt.verify(rq.body.passtoken,process.env.PASSWORD_SECRET)
        // Password hashing
        let hashed = await bcrypt.hash(rq.body.password,await bcrypt.genSalt(10))
        let isUpdated = (await rs.userprofiles.updateOne({GID:gid.gid},{
            $set:{
                password:hashed
            }
        })).modifiedCount == 1
        SecurityV1.SendSecure({data:isUpdated},rs,rq.body.pubkey);
        //rs.send({data:isUpdated})
    }
    catch(e){
        if(e.message == "invalid signature"){
            SecurityV1.SendSecure({data:"INVALID_PASSTOKEN"},rs,rq.body.pubkey);
            //rs.send({data:"INVALID_PASSTOKEN"})
        }
        else if(e.message == "jwt expired"){
            SecurityV1.SendSecure({data:"PASSTOKEN_EXPIRED"},rs,rq.body.pubkey);
            //rs.send({data:"PASSTOKEN_EXPIRED"})
        }
        else{
            SecurityV1.SendSecure({data:"INTERNEL_JWT_ERROR"},rs,rq.body.pubkey);
            //rs.send({data:"INTERNEL_JWT_ERROR"})
        }
    }
}
async function UploadProfileImage(rq,rs){
    let Image_Base64 = rq.body.image_base64_string
    let user = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))

    if(user != null){
        try{
            // for check if imagae already exists
           filesys.readdir("./UserProfileImages",async(er,files)=>{
                if(er){
                    SecurityV1.SendSecure({data:"INTERNEL_ERROR"},rs,rq.body.pubkey);
                    //rs.send({data:"INTERNEL_ERROR"})
                }
                else{
                    let UploadProfileImage = async function(){
                            let image = "./UserProfileImages/"
                            filesys.promises.writeFile(image+user.GID+".txt",Image_Base64,{encoding:"ascii"})
                            if(user.settings.profileImage.includes("default")){
                                let ischanged = (await rs.userprofiles.updateOne({GID:UserHelper.getGID(rs)},
                                {$set:{
                                "settings.profileImage":`${process.env.ORIGIN}/${user.GID+".txt"}`
                                }})).modifiedCount == 1
                                SecurityV1.SendSecure({data:ischanged},rs,rq.body.pubkey);
                                //rs.send({data:ischanged}) // if changed in db true
                            }
                            else{
                                SecurityV1.SendSecure({data:"UPLOADED"},rs,rq.body.pubkey);
                                //rs.send({data:"UPLOADED"})
                            }
                    }
                    if(files.includes(UserHelper.getGID(rs) + ".txt")){
                        filesys.unlink("./UserProfileImages/"+UserHelper.getGID(rs)+".txt",async(er)=>{
                            if(!er){
                                await UploadProfileImage()
                            }
                            else{
                                SecurityV1.SendSecure({data:"INTERNEL_ERROR"},rs,rq.body.pubkey);
                                //rs.send({data:"INTERNEL_ERROR"})
                            }
                        })
                    }
                    else{
                        await UploadProfileImage()
                    }
                }
            })
        }
        catch(e){
            SecurityV1.SendSecure({data:"ERROR"},rs,rq.body.pubkey);
            //rs.send({data:"ERROR"})
        }
    }
    else{
        SecurityV1.SendSecure({data:"UNKNOWN_ACCOUNT"},rs,rq.body.pubkey);
        //rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}

async function NewPost(rq,rs){
    let user = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))
    
    if(user != null){
        
        let postid = cuid()

        let post = {
            owner:user.GID,
            postid:postid,
            date:(new Date()).toISOString(),
            post:rq.body.post,
            likes:[],
            unlikes:[]
        }
        try{
            await rs.userposts.insertOne(post)
            SecurityV1.SendSecure({data:isUploaded},rs,rq.body.pubkey);
            //rs.send({data:true})
        }
        catch(e){
            SecurityV1.SendSecure({data:"INTERNEL_ERROR"},rs,rq.body.pubkey);
            //rs.send({data:"INTERNEL_ERROR"})
        }
    }
    else{
        SecurityV1.SendSecure({data:"UNKNOWN_ACCOUNT"},rs,rq.body.pubkey);
        //rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}

async function DeletePost(rq,rs){
    let user = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))

    if(user != null){
        let isPostdeleted = (await rs.userposts.deleteOne({postid :rq.body.postid})).deletedCount == 1
        if (isPostdeleted){
            SecurityV1.SendSecure({data:true},rs,rq.body.pubkey);
            //rs.send({data:true})
        }
        else{
            SecurityV1.SendSecure({data:false},rs,rq.body.pubkey);
            //rs.send({data:false})
        }
    }
    else{
        SecurityV1.SendSecure({data:"UNKNOWN_ACCOUNT"},rs,rq.body.pubkey);
        //rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}

async function Reply(rq,rs){
    let user = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))

    if(user != null){
        let reply = {
            reply:rq.body.reply,
            owner:user.GID,
            repid:cuid(),
            date:(new Date()).toISOString(),
            postid:rq.body.postid,
            likes:[],
            unlikes:[]
        }
        try{
            await rs.userreplys.insertOne(reply)
            SecurityV1.SendSecure({data:true},rs,rq.body.pubkey);
            //rs.send({data:true})
        }
        catch(e){
            SecurityV1.SendSecure({data:false},rs,rq.body.pubkey);
            //rs.send({data:false})
        }
    }
    else{
        SecurityV1.SendSecure({data:"UNKNOWN_ACCOUNT"},rs,rq.body.pubkey);
        //rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}
async function LikePost(rq,rs){
    let user = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))
    let post = await rs.userposts.findOne({postid:rq.body.postid})
    // Is user exist
    if(user != null){ // is post exist
        if(post != null){ // user already liked
            if(post.likes.includes(UserHelper.getGID(rs))){
                let islikeremoved = (await rs.userposts.updateOne({postid:rq.body.postid},{
                    $pull:{ 
                        likes:{$in:[UserHelper.getGID(rs)]}
                    }
                })).modifiedCount == 1
                let rpost = islikeremoved ? (await rs.userposts.findOne({postid:rq.body.postid})).likes.length : false
                let rpost2 = islikeremoved ? (await rs.userposts.findOne({postid:rq.body.postid})).unlikes.length : false

                SecurityV1.SendSecure({data:{l:rpost,u:rpost2,initial:""}},rs,rq.body.pubkey);
                //rs.send({data:{l:rpost,u:rpost2,initial:""}})
            }// if user not alredy liked
            else{
                let isunliked = post.unlikes.includes(user.GID)
                // is already unliked
                if(isunliked){ // is user unlike removed
                let isunlikeremoved = (await rs.userposts.updateOne({postid:rq.body.postid},{
                    $pull:{ 
                        unlikes:{$in:[UserHelper.getGID(rs)]}
                    }
                })).modifiedCount == 1
                    if(isunlikeremoved){
                      let isliked = (await rs.userposts.updateOne({postid:rq.body.postid},{
                        $push:{
                           likes:UserHelper.getGID(rs)
                        }
                      })).modifiedCount == 1
                      let rpost = isliked ? (await rs.userposts.findOne({postid:rq.body.postid})).likes.length : false
                      let rpost2 = isliked ? (await rs.userposts.findOne({postid:rq.body.postid})).unlikes.length : false

                      SecurityV1.SendSecure({data:{l:rpost,u:rpost2}},rs,rq.body.pubkey);
                      //rs.send({data:{l:rpost,u:rpost2}})

                   }
                   else{
                    SecurityV1.SendSecure({data:"ERROR"},rs,rq.body.pubkey);
                    //rs.send({data:"ERROR"})
                   }
                }
                else{
                    let isliked = (await rs.userposts.updateOne({postid:rq.body.postid},{
                        $push:{
                           likes:UserHelper.getGID(rs)
                        }
                      })).modifiedCount == 1
                      let rpost = isliked ? (await rs.userposts.findOne({postid:rq.body.postid})).likes.length : false
                      let rpost2 = isliked ? (await rs.userposts.findOne({postid:rq.body.postid})).unlikes.length : false

                      SecurityV1.SendSecure({data:{l:rpost,u:rpost2}},rs,rq.body.pubkey);
                      //rs.send({data:{l:rpost,u:rpost2}})
                }
            }    
        }
        else{
            SecurityV1.SendSecure({data:"POST_NOT_FOUND"},rs,rq.body.pubkey);
            //rs.send({data:"POST_NOT_FOUND"})
        }
    }
    else{
        SecurityV1.SendSecure({data:"UNKNOWN_ACCOUNT"},rs,rq.body.pubkey);
        //rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}
async function UnLikePost(rq,rs){
    let user = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))
    let post = await rs.userposts.findOne({postid:rq.body.postid})
    
    if(user != null){ 
        if(post != null){ 
            if(post.unlikes.includes(UserHelper.getGID(rs))){
                let isunlikeremoved = (await rs.userposts.updateOne({postid:rq.body.postid},{
                    $pull:{ 
                        unlikes:{$in:[UserHelper.getGID(rs)]}
                    }
                })).modifiedCount == 1
                let rpost = isunlikeremoved ? (await rs.userposts.findOne({postid:rq.body.postid})).likes.length : false
                let rpost2 = isunlikeremoved ? (await rs.userposts.findOne({postid:rq.body.postid})).unlikes.length : false

                SecurityV1.SendSecure({data:{l:rpost,u:rpost2,initial:""}},rs,rq.body.pubkey);
                //rs.send({data:{l:rpost,u:rpost2,initial:""}})
            }
            else{
                let isliked = post.likes.includes(user.GID)
               
                if(isliked){ 
                let islikeremoved = (await rs.userposts.updateOne({postid:rq.body.postid},{
                    $pull:{ 
                        likes:{$in:[UserHelper.getGID(rs)]}
                    }
                })).modifiedCount == 1
                    if(islikeremoved){
                      let isunliked = (await rs.userposts.updateOne({postid:rq.body.postid},{
                        $push:{
                           unlikes:UserHelper.getGID(rs)
                        }
                      })).modifiedCount == 1
                      let rpost = isunliked ? (await rs.userposts.findOne({postid:rq.body.postid})).likes.length : false
                      let rpost2 = isunliked ? (await rs.userposts.findOne({postid:rq.body.postid})).unlikes.length : false

                      SecurityV1.SendSecure({data:{l:rpost,u:rpost2}},rs,rq.body.pubkey);
                      //rs.send({data:{l:rpost,u:rpost2}})
                   }
                   else{
                    SecurityV1.SendSecure({data:"ERROR"},rs,rq.body.pubkey);
                    //rs.send({data:"ERROR"})
                   }
                }
                else{
                    let isunliked = (await rs.userposts.updateOne({postid:rq.body.postid},{
                        $push:{
                           unlikes:UserHelper.getGID(rs)
                        }
                      })).modifiedCount == 1
                      let rpost = isunliked ? (await rs.userposts.findOne({postid:rq.body.postid})).likes.length : false
                      let rpost2 = isunliked ? (await rs.userposts.findOne({postid:rq.body.postid})).unlikes.length : false

                      SecurityV1.SendSecure({data:{l:rpost,u:rpost2}},rs,rq.body.pubkey);
                      //rs.send({data:{l:rpost,u:rpost2}})
                }
            }    
        }
        else{
            SecurityV1.SendSecure({data:"POST_NOT_FOUND"},rs,rq.body.pubkey);
            //rs.send({data:"POST_NOT_FOUND"})
        }
    }
    else{
        SecurityV1.SendSecure({data:"UNKNOWN_ACCOUNT"},rs,rq.body.pubkey);
        //rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}
async function LikeReply(rq,rs){
    let user = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))
    let post = await rs.userreplys.findOne({repid:rq.body.repid})
    // Is user exist
    if(user != null){ // is post exist
        if(post != null){ // user already liked
            if(post.likes.includes(UserHelper.getGID(rs))){
                let islikeremoved = (await rs.userreplys.updateOne({repid:rq.body.repid},{
                    $pull:{ 
                        likes:{$in:[UserHelper.getGID(rs)]}
                    }
                })).modifiedCount == 1
                let rpost = islikeremoved ? (await rs.userreplys.findOne({repid:rq.body.repid})).likes.length : false
                let rpost2 = islikeremoved ? (await rs.userreplys.findOne({repid:rq.body.repid})).unlikes.length : false

                SecurityV1.SendSecure({data:{l:rpost,u:rpost2,initial:""}},rs,rq.body.pubkey);
                //rs.send({data:{l:rpost,u:rpost2,initial:""}})
            }// if user not alredy liked
            else{
                let isunliked = post.unlikes.includes(user.GID)
                // is already unliked
                if(isunliked){ // is user unlike removed
                let isunlikeremoved = (await rs.userreplys.updateOne({repid:rq.body.repid},{
                    $pull:{ 
                        unlikes:{$in:[UserHelper.getGID(rs)]}
                    }
                })).modifiedCount == 1
                    if(isunlikeremoved){
                      let isliked = (await rs.userreplys.updateOne({repid:rq.body.repid},{
                        $push:{
                           likes:UserHelper.getGID(rs)
                        }
                      })).modifiedCount == 1
                      let rpost = isliked ? (await rs.userreplys.findOne({repid:rq.body.repid})).likes.length : false
                      let rpost2 = isliked ? (await rs.userreplys.findOne({repid:rq.body.repid})).unlikes.length : false

                      SecurityV1.SendSecure({data:{l:rpost,u:rpost2}},rs,rq.body.pubkey);
                      //rs.send({data:{l:rpost,u:rpost2}})
                   }
                   else{
                    SecurityV1.SendSecure({data:"ERROR"},rs,rq.body.pubkey);
                    //rs.send({data:"ERROR"})
                   }
                }
                else{
                    let isliked = (await rs.userreplys.updateOne({repid:rq.body.repid},{
                        $push:{
                           likes:UserHelper.getGID(rs)
                        }
                      })).modifiedCount == 1
                      let rpost = isliked ? (await rs.userreplys.findOne({repid:rq.body.repid})).likes.length : false
                      let rpost2 = isliked ? (await rs.userreplys.findOne({repid:rq.body.repid})).unlikes.length : false

                      SecurityV1.SendSecure({data:{l:rpost,u:rpost2}},rs,rq.body.pubkey);
                      //rs.send({data:{l:rpost,u:rpost2}})
                }
            }    
        }
        else{
            SecurityV1.SendSecure({data:"POST_NOT_FOUND"},rs,rq.body.pubkey);
            //rs.send({data:"POST_NOT_FOUND"})
        }
    }
    else{
        SecurityV1.SendSecure({data:"UNKNOWN_ACCOUNT"},rs,rq.body.pubkey);
        //rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}
async function UnLikeReply(rq,rs){
    let user = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))
    let post = await rs.userreplys.findOne({repid:rq.body.repid})
    // Is user exist
    if(user != null){ // is post exist
        if(post != null){ // user already liked
            if(post.unlikes.includes(UserHelper.getGID(rs))){
                let isunlikeremoved = (await rs.userreplys.updateOne({repid:rq.body.repid},{
                    $pull:{ 
                        unlikes:{$in:[UserHelper.getGID(rs)]}
                    }
                })).modifiedCount == 1
                let rpost = isunlikeremoved ? (await rs.userreplys.findOne({repid:rq.body.repid})).likes.length : false
                let rpost2 = isunlikeremoved ? (await rs.userreplys.findOne({repid:rq.body.repid})).unlikes.length : false

                SecurityV1.SendSecure({data:{l:rpost,u:rpost2,initial:""}},rs,rq.body.pubkey);
                //rs.send({data:{l:rpost,u:rpost2,initial:""}})
            }// if user not alredy liked
            else{
                let isliked = post.likes.includes(user.GID)
                // is already unliked
                if(isliked){ // is user unlike removed
                let islikeremoved = (await rs.userreplys.updateOne({repid:rq.body.repid},{
                    $pull:{ 
                        likes:{$in:[UserHelper.getGID(rs)]}
                    }
                })).modifiedCount == 1
                    if(islikeremoved){
                      let isunliked = (await rs.userreplys.updateOne({repid:rq.body.repid},{
                        $push:{
                           unlikes:UserHelper.getGID(rs)
                        }
                      })).modifiedCount == 1
                      let rpost = isunliked ? (await rs.userreplys.findOne({repid:rq.body.repid})).likes.length : false
                      let rpost2 = isunliked ? (await rs.userreplys.findOne({repid:rq.body.repid})).unlikes.length : false

                      SecurityV1.SendSecure({data:{l:rpost,u:rpost2}},rs,rq.body.pubkey);
                      //rs.send({data:{l:rpost,u:rpost2}})
                   }
                   else{
                    SecurityV1.SendSecure({data:"ERROR"},rs,rq.body.pubkey);
                    //rs.send({data:"ERROR"})
                   }
                }
                else{
                    let isunliked = (await rs.userreplys.updateOne({repid:rq.body.repid},{
                        $push:{
                           unlikes:UserHelper.getGID(rs)
                        }
                      })).modifiedCount == 1
                      let rpost = isunliked ? (await rs.userreplys.findOne({repid:rq.body.repid})).likes.length : false
                      let rpost2 = isunliked ? (await rs.userreplys.findOne({repid:rq.body.repid})).unlikes.length : false

                      SecurityV1.SendSecure({data:{l:rpost,u:rpost2}},rs,rq.body.pubkey);
                      //rs.send({data:{l:rpost,u:rpost2}})
                }
            }    
        }
        else{
            SecurityV1.SendSecure({data:"POST_NOT_FOUND"},rs,rq.body.pubkey);
            //rs.send({data:"POST_NOT_FOUND"})
        }
    }
    else{
        SecurityV1.SendSecure({data:"UNKNOWN_ACCOUNT"},rs,rq.body.pubkey);
        //rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}
async function Follow(rq,rs){
    let followee = await rs.userprofiles.findOne({GID:rq.body.followeeID})
    let user = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))

    if(user != null){
        if(followee != null){
            let userUpdated = (await rs.userprofiles.updateOne({GID:user.GID},{
                $push:{
                    followings:followee.GID
                }
            })).modifiedCount == 1
            let followeeUpdated = (await rs.userprofiles.updateOne({GID:followee.GID},{
                $push:{
                    followers:user.GID
                }
            })).modifiedCount == 1
            SecurityV1.SendSecure({data:followeeUpdated && userUpdated},rs,rq.body.pubkey);
            //rs.send({data:followeeUpdated && userUpdated})
        }
        else{
            SecurityV1.SendSecure({data:"NO_FOLLOWEE_FOUND"},rs,rq.body.pubkey);
            //rs.send({data:"NO_FOLLOWEE_FOUND"})
        }
    }
    else{
        SecurityV1.SendSecure({data:"UNKNOWN_ACCOUNT"},rs,rq.body.pubkey);
        //rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}
async function UnFollow(rq,rs){
    let followee = await rs.userprofiles.findOne({GID:rq.body.followeeID})
    let user = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))

    if(user != null){
        if(followee != null){
            let userUpdated = (await rs.userprofiles.updateOne({GID:user.GID},{
                $pull:{
                    followings:followee.GID
                }
            })).modifiedCount == 1
            let followeeUpdated = (await rs.userprofiles.updateOne({GID:followee.GID},{
                $pull:{
                    followers:user.GID
                }
            })).modifiedCount == 1
            SecurityV1.SendSecure({data:followeeUpdated && userUpdated},rs,rq.body.pubkey);
            //rs.send({data:followeeUpdated && userUpdated})
        }
        else{
            SecurityV1.SendSecure({data:"NO_FOLLOWEE_FOUND"},rs,rq.body.pubkey);
            //rs.send({data:"NO_FOLLOWEE_FOUND"})
        }
    }
    else{
        SecurityV1.SendSecure({data:"UNKNOWN_ACCOUNT"},rs,rq.body.pubkey);
        //rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}
async function SetFollowersVsibility(rq,rs) {
    let user = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))
    try{
        await rs.userprofiles.updateOne({GID:user.GID},{
            $set:{
                "settings.followersVisiblity":(user.settings.followersVisiblity ? false : true)
            }
        })
        rs.send({data:true})
    }
    catch{
        rs.send({data:false})
    }
   
}
async function getAccount(rq,rs){
    let projection = rq.query.type == "private" ? ({_id:0,currentOTP:0,password:0})
    :({_id:0,name:1,GID:1,followers:1,followings:1,"settings.profileImage":1,created:1})

    let GID = rq.query.type == "private" ? UserHelper.getGID(rs) : rq.query.gid
    
    let account = await rs.userprofiles.findOne({GID:GID},{projection:projection})
    console.log(account)
    rs.send({data:account}) // May return null
}
async function getFollowerOrFollowings(rq,rs){
    let type = rq.query.type == "follower" ? "followers" : "followings"
    let credentials = await rs.userprofiles.findOne({GID:UserHelper.getGID(rs)})
    let datum = []
    let IsAnyFollowerNotFound = false
    if(credentials != null){
       for(let gid of credentials[type]){
          let followOrwings = await rs.userprofiles.findOne({GID:gid})
          if(followOrwings != null){
            let isFollowerRestricted = false
            if(type == "followers"){
                isFollowerRestricted = !followOrwings.settings.followersVisiblity
            }    

            if(!isFollowerRestricted){
                let data = {
                    img:followOrwings.settings.profileImage,
                    name:followOrwings.name,
                    gid:followOrwings.GID
                }
                datum.push(data)
            }
            isFollowerRestricted = false
          }
          else{
            IsAnyFollowerNotFound = true
          }
       }
       rs.send({data:datum,error:IsAnyFollowerNotFound})
    }  
    else{
        rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}

async function getPosts(rq,rs){
    let mainuser = await rs.userprofiles.findOne({GID:UserHelper.getGID(rs)})
    let gid = rq.query.type == "private" ? UserHelper.getGID(rs) : rq.query.gid
    let user = await rs.userprofiles.findOne({GID:gid})
    let rposts = []
    if(mainuser != null){
        if(user != null){
            let posts = await rs.userposts.find({owner:user.GID},{projection:{date:0,_id:0}}).sort({date:-1}).toArray()
            
            for(let post of posts){
                let noofreplys  = (await rs.userreplys.find({postid:post.postid}).toArray()).length
                let LorU = {
                    isLiked:  post.likes.includes(UserHelper.getGID(rs)) ,
                    isUnliked: post.unlikes.includes(UserHelper.getGID(rs))
                }
               rposts.push({
                img:user.settings.profileImage,
                name:user.name,
                post:post.post,
                postid:post.postid,
                owner:user.GID,
                noOflikes:post.likes.length,
                noOfUnlikes:post.unlikes.length,
                noOfreplys:noofreplys,
                IsViewerLiked:LorU.isLiked,
                IsViewerUnliked:LorU.isUnliked
               })
            }
            rs.send({data:rposts})
        }
        else{
            rs.send({data:"USER_NOT_FOUND"})
        }
    }
    else{
        rs.send({data:"UNKOWN_ACCOUNT"})
    }
}

async function getMainPost(rq,rs){
    let user = await rs.userprofiles.findOne({GID:UserHelper.getGID(rs) })
    console.log(user)
    let rreplys = []
    if(user != null){
        let post = await rs.userposts.findOne({postid:rq.query.postid},{projection:{date:0,_id:0}})
        if(post != null){
            let postusrprofile = await rs.userprofiles.findOne({GID:post.owner})
            if(postusrprofile != null){
                let LorUP = {
                    isLiked: post.likes.includes(UserHelper.getGID(rs)), 
                    isUnliked:  post.unlikes.includes(UserHelper.getGID(rs)) 
                }
                let postanduser = {
                    post:post.post,
                    name:postusrprofile.name,
                    img:postusrprofile.settings.profileImage,
                    gid:postusrprofile.GID,
                    postid:post.postid,
                    NoOflikes:post.likes.length,
                    NoOfUnlikes:post.unlikes.length,
                    IsViewerLiked:LorUP.isLiked,
                    IsViewerUnliked:LorUP.isUnliked
                }
                let replys  = (await rs.userreplys.find({postid:post.postid},{projection:{_id:0,date:0,postid:0}}).sort({date:-1}).toArray())
                
                for(let reply of replys){
                    let replyProfile = await rs.userprofiles.findOne({GID:reply.owner})
                    let LorU = {
                        isLiked:  reply.likes.includes(UserHelper.getGID(rs)) ,
                        isUnliked: reply.unlikes.includes(UserHelper.getGID(rs)) 
                    }
                    if(replyProfile != null){
                        rreplys.push(
                            {
                                img:replyProfile.settings.profileImage,
                                gid:replyProfile.GID,
                                name:replyProfile.name,
                                reply:reply.reply,
                                IsViewerLiked:LorU.isLiked,
                                IsViewerUnliked:LorU.isUnliked,
                                repid:reply.repid,
                                noOflikes:reply.likes.length,
                                noOfUnlikes:reply.unlikes.length,
                            })
                    }
                }
               
                rs.send({data:{post:postanduser,replys:rreplys}})
            }
            else{
                rs.send({data:"NO_POST_USER_FOUND"})
            }
        }
        else{
            rs.send({data:"NO_POST_FOUND"})
        }
           
    }
    else{
        rs.send({data:"USER_NOT_FOUND"})
    }
}
// for user analytics use post or get
async function Analytics(rq,rs){
    try{
        const USER_ANALYTICS = (await rs.userprofiles.findOne({GID:UserHelper.getGID(rs)})).Analytics 
        console.log(rq.body)
        const component = rq.body.comp
        const amount = 5
        if(USER_ANALYTICS[component].length == amount){
            let isremoved = (await rs.userprofiles.updateOne({GID:UserHelper.getGID(rs)},{
                $pop:{
                    ["Analytics."+component]:-1
                }
            })).modifiedCount == 1
            if(isremoved){
                let ispushed = (await rs.userprofiles.updateOne({GID:UserHelper.getGID(rs)},{
                    $push:{
                        ["Analytics."+component]:rq.body.postuserid
                    }
                })).modifiedCount == 1
                rs.send({data:ispushed})
            }
            else{
                rs.send({data:false})
            }
        }
        else{
            let ispushed = (await rs.userprofiles.updateOne({GID:UserHelper.getGID(rs)},{
                $push:{
                    ["Analytics."+component]:rq.body.postuserid
                }
            })).modifiedCount == 1
            rs.send({data:ispushed})
        }
    }
    catch(e){
        console.log(e.message)
        rs.send({data:"UNKNOWN_ACCOUNT"}) 
    }
}

// use post for this 
async function getHomePosts(rq,rs){
    let user = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))
try{
    const USER_ENAGEMENT_BASED_POSTS_GENERATION_QUERY = [
            {
              $sort:{
                date:-1
              }
            },
            {
              $match:{
                $and:[{
                    $or:[{
                        owner:{
                            $in:user.Analytics.recentViews
                        }}]
                    }
                ]
              }  
            },
            {
                $lookup:{
                    from:"Userreplys",
                    localField:"postid",
                    foreignField:"postid",
                    as:"replys"
                }
            },
            {
                $lookup:{
                    from:"Userprofiles",
                    localField:"owner",
                    foreignField:"GID",
                    as:"ownerProfile"
                }
            },
            {
                $unwind:"$ownerProfile"
            },
           {
                $project:{
                    _id:0,
                    name:"$ownerProfile.name",
                    img:"$ownerProfile.settings.profileImage",
                    post:1,owner:1,postid:1,
                    noOfreplys:{$size:"$replys"},
                    IsViewerLiked:{$in:[UserHelper.getGID(rs),"$likes"]},
                    IsViewerUnLiked:{$in:[UserHelper.getGID(rs),"$unlikes"]},
                    noOflikes:{$size:"$likes"},
                    noOfUnlikes:{$size:"$unlikes"}
                }
            },
            {
                $limit:5
            }
    ]

    if(Object.keys(rq.body).includes("recpostids")){
        const RECIEVED_POSTS_AVOIDER_QUERY = {
            postid:{
                $not:{
                    $in:rq.body.recpostids
                }
            }
            } 
        USER_ENAGEMENT_BASED_POSTS_GENERATION_QUERY[1].$match.$and.push(RECIEVED_POSTS_AVOIDER_QUERY)
    }

    let homeposts = await rs.userposts.aggregate(USER_ENAGEMENT_BASED_POSTS_GENERATION_QUERY).toArray()

    console.log(rq.body.recpostids)
    rs.send({data:homeposts})
}
catch(e){
    if(e.name === "TypeError") rs.send({data:"UNKNOWN_ACCOUNT"})
}    
}

/*  New update v2 */

async function UploadProfileImage(rq,rs){

    let user = await UserHelper.IsUser(rs.userprofiles,UserHelper.getGID(rs))

    if(user != null){
       let isUploaded = await Uploadmanager.UploadFile("profile",null,"image",UserHelper.getGID(rs))
       
       rs.send({data:isUploaded})   
    }
    else{
        rs.send({data:"UNKNOWN_ACCOUNT"})
    }
}
module.exports = {
    Signup,Signin,Signout,UpdateAccount,Deleteaccount,Forgetpassword,
    VerifyOTP,UploadProfileImage,Changepassword,NewPost,DeletePost,Reply,
    LikePost,UnLikePost,LikeReply,UnLikeReply,Follow,UnFollow,SetFollowersVsibility,getAccount,
    getFollowerOrFollowings,
    getPosts,getMainPost,Analytics,getHomePosts
}
/*

{
  "_id": {
    "$oid": "6769704e28aaa479ebca0833"
  },
  "name": "arul",
  "email": "perunkarunai@gmail.com",
  "password": "123",
  "GID": "Jothituld",
  "followers": [],
  "followings": [],
  "settings": {
    "postVisiblity": true,
    "followersVisiblity": true,
    "followingsVisiblity": true,
    "profileImage": "defualt"
  },
  "created":"12yj", 
  "currentOTP": null,
  "Analytics":{
            "likes":[],
            "recentViews":[]
            }
}*/