/*var aes = require("crypto-js")
var rsa = require("node-forge")
var RSAkeyGenerator = require("./RSAkeyGenerator.js")
var cuid = require("cuid")
*/
import aes from "crypto-js"
import rsa from "node-forge"
import * as RSAkeyGenerator from "./RSAkeyGenerator.js"
import cuid from "cuid"

async function configureSecurity() {
    const KEY = cuid() + cuid() + cuid()
    sessionStorage.setItem("ClientAESKey",KEY.substring(0,33).substring(0,32))
    sessionStorage.setItem("ClientRSAPublicKey",rsa.util.encode64(RSAkeyGenerator.publicKey_pem))
    sessionStorage.setItem("ClientRSAPrivateKey",RSAkeyGenerator.privateKey_pem)
  
    fetch("http://localhost:7000/security/RsaPublicKey").then(async(v)=>{
      let Server_Public_Key = await v.text()       // response should be content type text/plain
      sessionStorage.setItem("ServerRsaPublicKey",Server_Public_Key)
    })
}

function AESEncryptData(data){
    const server_public_key = sessionStorage.getItem("ServerRsaPublicKey")
    const client_aes_key  = sessionStorage.getItem("ClientAESKey")
    if(server_public_key != null){
        let encryptedData = aes.AES.encrypt(data,client_aes_key).toString()
        let Encryptset = {
            RsaEncryptedAeskey: rsa.util.encode64(rsa.pki.publicKeyFromPem(server_public_key).encrypt(client_aes_key)),
            AesEncryptedData:encryptedData,
            pubkey:sessionStorage.getItem("ClientRSAPublicKey")
        }
    
        return Encryptset
    }
    else{
        return null
    }
}

async function DecryptAESEncryptedData(encset){

    let privatekey = sessionStorage.getItem("ClientRSAPrivateKey")
    let DecryptedData
    if(privatekey != null){
        let RsaEncryptedAeskey = rsa.util.decode64(encset.RsaEncryptedAeskey)
        let RSAdecryptedAesKey = rsa.pki.privateKeyFromPem(privatekey).decrypt(RsaEncryptedAeskey).toString()  // this convert defualt utf8
        DecryptedData = aes.AES.decrypt(encset.AesEncryptedData,RSAdecryptedAesKey).toString(aes.enc.Utf8)
    }
    else{
        DecryptedData = null
    } 
    return DecryptedData
}

export  {
    AESEncryptData,DecryptAESEncryptedData,configureSecurity
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
