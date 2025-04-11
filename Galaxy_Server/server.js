var mongodb = require("mongodb").MongoClient
var express = require("express")
var fs = require("fs")
var jwt = require("jsonwebtoken")
var cors = require("cors")
var UserAPI = require("./UserAPI/UserAPIv1.js")
var SecurityV1 = require("./Security/Securityv1.js")

require("dotenv").config({path:"./Security/.env"})

var server = express()

server.use(cors())
server.use(express.static("./UserProfileImages"))
server.use(express.json({limit:'10mb'}))
server.use(async(rq,rs,nxt)=>{
    let mongo = new mongodb(process.env.MONGODB_URL)
    let db = (await mongo.connect()).db("Galaxy")
    rs.db = db
    rs.signupauth = db.collection("SignupAuth")
    rs.userprofiles = db.collection("Userprofiles")
    rs.userreplys = db.collection("Userreplys")
    rs.userposts = db.collection("Userposts")
    rs.signoutedJWTS = db.collection("SignoutedJWTS")
    nxt()
})
server.use(async(r,rs,nxt)=>{

  // for checking that are this incoming request non authenticatable request
  let Is_non_authenticatable_request
  for(let req of ["signin","signup","forgetpassword","verifyotp",
    "changepassword","defualt.png","security","assets",".apk"]){
        if(r.url.includes(req)){
          Is_non_authenticatable_request = r.url.includes(req)
          break
        }
  }
  if(Is_non_authenticatable_request || r.url.length == 1){
    console.log("this worked !")
    nxt()
  }
  else{
    console.log(r.headers)
    if(Object.keys(r.headers).includes("authorization")){
      try{
          let jwttoken = r.headers.authorization.split(" ")[1]
          let credentials = jwt.verify(jwttoken,process.env.JWT_SECRET)
          
          let isLoggedout = (await rs.signoutedJWTS.findOne({JWTS:{$in:[jwttoken]}})) != null
          if(!isLoggedout){
            
            rs.credFromJWT = credentials
            nxt()
          }
          else{
            throw new Error("Logged out")
          }
      }
      catch(er){
          if(er.message == "jwt expired"){
              rs.send({data:"EXPIRED"})
          }
          else if(er.message == "invalid signature"){
              rs.send({data:"INVALID"})
          }
          else if(er.message == "Logged out"){
              rs.send({data:"LOGGED_OUT"})
          }
          else{
              rs.send({data:"JWT_ERROR"})
          }
      }
    }
    else{
      rs.send({data:"AUTHORIZATION_FAILED"})
    }
  }
})

server.use(async(rq,rs,next)=>{
  // Body text must be json format : {"RsaEncryptedAeskey":"ttashccucudvfu..somethin","AesEncryptedData":"ddfccddfzdkio..something"}
  let Is_non_securable_requests 
  for(let comp of ["security","deleteaccount","postanalytics","homeposts"]){
     if(rq.url.includes(comp)){
       Is_non_securable_requests = true
       break
     }
  }

  if(Is_non_securable_requests || rq.method === "GET"){
    next()
  }
  else{
    let securityReq 
    
    let DecryptedJSON = await SecurityV1.DecryptAESEncryptedData(rq.body)
    securityReq = JSON.parse(DecryptedJSON)
    securityReq.pubkey = rq.body.pubkey
    rq.body = securityReq
    next()
  }
})
server.use(express.static("./Galaxy"))

// Galaxy application (Vuejs applicaion)
server.get("/",(rq,rs)=>{
  rs.sendFile("./index.html")
})

// Galaxy REST API v1
server.post("/api/signup",UserAPI.Signup)
server.post("/api/signin",UserAPI.Signin)
server.get("/api/signout",UserAPI.Signout)
server.put("/api/updateaccount",UserAPI.UpdateAccount)
server.delete("/api/deleteaccount",UserAPI.Deleteaccount)
server.post("/api/forgetpassword",UserAPI.Forgetpassword)
server.post("/api/verifyotp",UserAPI.VerifyOTP)
server.put("/api/changepassword",UserAPI.Changepassword)
server.post("/api/uploadprofileimage",UserAPI.UploadProfileImage)
server.post("/api/newpost",UserAPI.NewPost)
server.delete("/api/deletepost",UserAPI.DeletePost)
server.post("/api/reply",UserAPI.Reply)
server.post("/api/likepost",UserAPI.LikePost)
server.post("/api/unlikepost",UserAPI.UnLikePost)
server.post("/api/likereply",UserAPI.LikeReply)
server.post("/api/unlikereply",UserAPI.UnLikeReply)
server.post("/api/follow",UserAPI.Follow)
server.post("/api/unfollow",UserAPI.UnFollow)
server.get("/api/setfollowervisible",UserAPI.SetFollowersVsibility)
server.get("/api/account",UserAPI.getAccount)
server.get("/api/followdetails",UserAPI.getFollowerOrFollowings)
server.get("/api/posts",UserAPI.getPosts)
server.get("/api/mainpost",UserAPI.getMainPost)

// for user analytics
server.post("/api/postanalytics",UserAPI.Analytics)
server.post("/api/homeposts",UserAPI.getHomePosts)
server.get("/api/lp/p/p",(r,rs)=>{
  rs.send("sd")
})

// for security 
server.get("/security/RsaPublicKey",async(rq,rs)=>{
  let RSAprivatekey = await fs.promises.readFile("./Security/publickey.rsa",{encoding:"utf8"})
  rs.send(RSAprivatekey)
})

server.listen(process.env.PORT)