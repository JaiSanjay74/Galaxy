// RSA Key Generator v1

// Run this js file only for once for getting private and public keys.

var rsa = require("node-forge")
let keys = rsa.pki.rsa.generateKeyPair({bits:2024})
let pubpem = rsa.pki.publicKeyToPem(keys.publicKey)
let prpem = rsa.pki.privateKeyToPem(keys.privateKey)

var fs = require("fs")
fs.writeFileSync("./privatekey.rsa",prpem)
fs.writeFileSync("./publickey.rsa",pubpem)
