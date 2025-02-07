function getJWT(request) {
   return request.headers.authorization.split(" ")[1]
}

function getGID(response){
    
    return response.credFromJWT.gid
}
async function IsUser(userCollection,gid) {
    return (await userCollection.findOne({GID:gid})) 
}

module.exports = {
    getJWT,IsUser,getGID
}