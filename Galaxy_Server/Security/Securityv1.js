var aes = require("crypto-js")
var rsa = require("node-forge")
var files = require("fs")

require("dotenv").config({path:"./Security/.env"})

function AESEncryptData(data,clientpublic){
    let encryptedData = aes.AES.encrypt(data,process.env.AES_KEY).toString()
    let base64DecodedCclientpublicKey = rsa.util.decode64(clientpublic)
    let Encryptset = {
        RsaEncryptedAeskey: rsa.util.encode64(rsa.pki.publicKeyFromPem(base64DecodedCclientpublicKey).encrypt(process.env.AES_KEY)),
        AesEncryptedData:encryptedData
    }
    console.log(Encryptset)
    return Encryptset
}

async function DecryptAESEncryptedData(encset){
    let DecryptedData 
    let RSAprivatekey = await files.promises.readFile("./Security/privatekey.rsa",{encoding:"utf8"})

    let decoded = rsa.util.decode64(encset.RsaEncryptedAeskey)
    let RSAdecryptedAesKey = rsa.pki.privateKeyFromPem(RSAprivatekey).decrypt(decoded).toString()  // this convert defualt utf8
  
    DecryptedData = aes.AES.decrypt(encset.AesEncryptedData,RSAdecryptedAesKey).toString(aes.enc.Utf8)
    
    return DecryptedData
}

async function SendSecure(data,response,clientpublicKey){
    let secured = AESEncryptData(JSON.stringify(data),clientpublicKey)
    response.send(secured)
}
module.exports = {
    AESEncryptData,DecryptAESEncryptedData,SendSecure
}

/*
let encryptedData 

files.promises.readFile("./publickey.rsa",{encoding:"utf8"}).then(async(v)=>{
 
    encryptedData = AESEncryptData('{"gid":"Jothituld","password":"123"}',v)
    console.log(encryptedData)
    console.log(await DecryptAESEncryptedData(encryptedData))
    
    
    let l = ""
    let arr = v.split("")
    for(let itm in arr){
        if(arr[itm] === '\r'){
            arr.splice(itm,2)
        }
    }
    for(let itm of arr){
        l = l + itm
    }
    console.log(l)
})
*/
