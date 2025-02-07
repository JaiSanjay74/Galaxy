var  file = require("fs")
var  busboy = require("busboy")


async function UploadFile(purpose,POSTID,gid){
  let handl = (name,redablestream,info)=>{

    let FILE_TYPE = info.filename.substring(info.filename.indexOf("."))
    let FOLDER = purpose === "profile" ? "UserProfileImages" : "Media posts"
    let FILE_NAME = POSTID === null ? gid : POSTID

    let fileWritableStream = file.createWriteStream("./" + FOLDER + "/" + FILE_NAME + "/" + FILE_TYPE)

    redablestream.pipe(fileWritableStream)

    
    redablestream.on("end",(ch)=>{
      res(true)
      
    })
  
    redablestream.on("error",(e)=>{
      rej(false)
    })
   }
    return new Promise((res,rej)=>{
       
     busboy().on("error",(e)=>{
      rej(false)
     })  
    
     busboy().on("file",handl)
    })
}

module.exports = {
  UploadFile
}
