//v1
async function SendOTP(admin_email,email,subject){
    // OTP length is 6 digits
    const OTP = Math.round(Math.random() + (new Date()).getSeconds() * 1110454545445).toString().substring(0,7)
    var nodemail = require("nodemailer")
    var mailer = nodemail.createTransport({
        service:"gmail",
        auth:{user:admin_email,
        pass:"liqu yaxg nziv gvaq"
    }})
   try{
    await mailer.sendMail({
        from:admin_email,
        to:email,
        subject:subject,
        html:`
           <html>
    <body>
    
      <b style="display:block;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color:blue;font-size:1.10rem">Galaxy</h3>
        <b style="display:block;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color:green;font-size:1rem">${subject}</b>
        <b style="display:block;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color:black;font-size:0.95rem">${OTP}</b>
     </body>
     </html>   
        `
    })
    return OTP
   }
  catch(e){
    console.log(e.message)
    return false
  }
} 

//v1
async function SendGID(admin_email,email,subject,gid){
  
  var nodemail = require("nodemailer")
  var mailer = nodemail.createTransport({
      service:"gmail",
      auth:{user:admin_email,
      pass:"liqu yaxg nziv gvaq"
  }})
 try{
  await mailer.sendMail({
      from:admin_email,
      to:email,
      subject:subject,
      html:`
         <html>
  <body>
  
    <b style="display:block;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color:blue;font-size:1.10rem">Galaxy</h3>
      <b style="display:block;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color:green;font-size:1rem">Your GID is </b>
      <b style="display:block;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color:black;font-size:0.95rem">${gid}</b>
   </body>
   </html>   
      `
  })
  return true
 }
catch(e){
  console.log(e.message)
  return false
}
} 
module.exports = {
    SendOTP,SendGID
}