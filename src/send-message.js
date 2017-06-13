const firebase = require('firebase');

var getChannelIdForUser = require('./get-channelid');
var createNewChannel = require('./create-channel');

function sendMessage(otherUserId, message, messageType, fileKey)
{
  console.log("Sending message");
  if(!messageType){
    messageType = 'text';
  }
  return new Promise((resolve, reject)=>{
    var channelId = getChannelIdForUser(otherUserId, this.user.channelList);
    var lastActivity = firebase.database.ServerValue.TIMESTAMP;
    console.log("ChannelId :: " + channelId);
    if(channelId)
    {
      var time = Date.now() + this.serverTimeOffset;
      var messageObj;
      messageObj = {
        uid: this.user.uid,
        userName: this.user.displayName,
        displayPhoto: this.user.displayPhoto,
        message: message,
        messageType: messageType,
        timestamp: time,
        negativetimestamp: - time
      };
      if(messageType === 'image'){
        messageObj.fileKey =  fileKey;
      }
      this.db.ref('/channel/' + channelId + '/lastMessage').set(messageObj);
      this.db.ref('/channel/' + channelId + '/lastActivity').set(lastActivity);
      this.db.ref('/channel/' + channelId + '/messages/').push(messageObj)
      .then(messageSentResponse=> { 
        resolve(messageObj); 
      })
      .catch(errorMessage=> { reject(errorMessage) });
    } else{
      console.log("Channel Does not exist");
      // Creating channel if channel does not exist;
      createNewChannel(this,this.user.uid, otherUserId)
      .then(res=>this.sendMessage(otherUserId, message, messageType, fileKey)
        .then(res=>resolve(res)).catch(err => reject(err))
      )
      .catch(err=> reject(err));
      
    }
  });
}

module.exports = sendMessage;