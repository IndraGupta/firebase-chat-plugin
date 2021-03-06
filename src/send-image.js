const firebase = require('firebase');
const jimp = require('../vendor/jimp');

function sendFile(filePath, otherUserId, channelType, messageType, compress)
{
  return new Promise((resolve, reject)=>
  {
    var fileKey = firebase.database().ref().push().key;
    compressFile(this, filePath, otherUserId, messageType, fileKey, compress)
    .then((data)=>{
      if(channelType)
      {
        return this.sendMessage(otherUserId, data, channelType, messageType, fileKey);
      } 
      else
      {
        throw new Error("Please specify channelType while sending file.");
      }
    })
    .then((res)=> {
      resolve(res)
    })
    .catch(err =>{ reject(err)});
  });
}

function compressFile(self, file, otherUserId, messageType, fileKey, compress)
{
  return new Promise((resolve, reject)=>{
    if(compress === false)
    {
      uploadFile(self, fileKey, file).then(res=>resolve(file)).catch(err=>{reject(err);})
    } else{
      Jimp.read(file)
        .then((image) => {
          image.getBase64(image.getMIME(), (err, res)=>{ 
            if(err)
              reject(err)
            uploadFile(self, fileKey, res).catch((err)=>reject(err));
          });
          image.quality(60)
          .blur(10);
          image.getBase64(image.getMIME(), (err, res)=>{ 
            if(err)
              reject(err)
            else{
              resolve(res)
            }}
          );
        })
        .catch(function (err) {
          reject(err)
        })
    }
  });
}
function uploadFile(self, key, data)
{
  return self.db.ref('/file/' + key).set(data);
}

module.exports = sendFile;