// RSA Key Generator v1

// Run this js file only for once for getting private and public keys.

//var rsa = require("node-forge")
import rsa from "node-forge"
let keys = rsa.pki.rsa.generateKeyPair({bits:2024})

const publicKey_pem = rsa.pki.publicKeyToPem(keys.publicKey)
const privateKey_pem = rsa.pki.privateKeyToPem(keys.privateKey)

export  {
    publicKey_pem,privateKey_pem
}
