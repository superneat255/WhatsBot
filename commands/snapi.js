const axios = require("axios");





async function leftNotAllowedGroup(client, msg) {
    try {
        let chat = await msg.getChat();
        
        if (chat.isGroup) {
            let res = await axios.get('https://superneatech.com/allowed_group.json');
            let o = JSON.parse( JSON.stringify(res.data) );
            
            if ( o.indexOf(chat.id._serialized) === -1 ) {
                chat.leave();
                chat.delete();
            }
        }
    } catch (e) {
        console.log(e);
    }
}




async function leftNotAllowedAnnounceGroup(client, msg) {
    try {
        let chat = await msg.getChat();
        
        if (chat.isGroup && chat.groupMetadata.announce) {
            let res = await axios.get('https://superneatech.com/allowed_group.json');
            let o = JSON.parse( JSON.stringify(res.data) );
            
            if ( o.indexOf(chat.id._serialized) === -1 ) {
                chat.leave();
                chat.delete();
            }
        }
    } catch (e) {
        console.log(e);
    }
}




async function leftIfNotGroupAdmin(client, msg) {
    try {
        let chat = await msg.getChat();
        
        if (chat.isGroup) {
            for(let participant of chat.participants) {
                if(participant.id._serialized == client.info.wid._serialized && !participant.isAdmin) {
                    chat.leave();
                    chat.delete();
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
}



async function leftReadOnlyGroup(client, msg) {
    try {
        let chat = await msg.getChat();
        if (chat.isGroup && chat.groupMetadata.announce) {
            const {isAdmin, isSuperAdmin} = chat.participants.find(a => a.id._serialized == client.info.wid._serialized);
            if (!isAdmin) {
                chat.leave();
                chat.delete();
            }
            
//             for(let participant of chat.participants) {
//                 if(participant.id._serialized == client.info.wid._serialized && !participant.isAdmin) {
//                     chat.leave();
//                     chat.delete();
//                 }
//             }
        }
    } catch (e) {
        console.log(e);
    }
}


async function snapi(msg, action) {
  let res;
  let my_url = `https://superneatech.com/api/whatsapp_bot/${action}.php`;
  
  try {
    res = await axios.post( my_url, JSON.stringify(msg) );
    return res.data;
    
  } catch (error) {
    if( msg.hasOwnProperty('_data') ){
       try {
          delete msg._data;
          res = await axios.post( my_url, JSON.stringify(msg) );
          return res.data;
        
       } catch (error2){
          console.log(error2);
       }
    } else {
      console.log(error);
    }
    return "error";
  }
}




const snexecute = async (client, msg, action) => {
    let data = await snapi(msg, action);

    if (data == "error") {
        await msg.reply(`🙇‍♂️ *Error*\n\n` + "```Something Unexpected Happened```");
      
    } else if (data !== "noreply") {
        await msg.reply(data);
    }
    
    
    let res = await axios.get('https://superneatech.com/whatsbot_setting.json');
    let o = JSON.parse( JSON.stringify(res.data) );
    
    if (o.groups_management.state == "on") {
        await eval(o.groups_management.function)(client, msg);
    }
};


module.exports = {
  name: "SNAPI MESSAGE",
  description: "Forward incoming message data to snapi",
  command: "uknown",
  commandType: "plugin",
  isDependent: false,
  help: "nothing",
  snexecute,
};
