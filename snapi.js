const { MessageMedia, Buttons, List } = require('whatsapp-web.js');



async function urldecode(text) {
  return decodeURIComponent(text).replace(/\+/g, ' ');
}


async function template1(client,body) { //to, text, quotedMessageId#optional
  try{
    let response;
    let quotedMessageId = (body.hasOwnProperty('quotedMessageId')? body.quotedMessageId: '');

    response = await client.sendMessage(body.to, body.text, {quotedMessageId:quotedMessageId});
    return response;
    
  } catch (error) { 
    console.log(error);
    return "error"; 
  }
}




async function template2(client,body) { //url, to, caption, quotedMessageId#optional
  try{
    let response;
    let quotedMessageId = (body.hasOwnProperty('quotedMessageId')? body.quotedMessageId: '');

    const media = await MessageMedia.fromUrl(body.url);
    response = await client.sendMessage(body.to,media,{caption:body.caption, quotedMessageId:quotedMessageId});
    return response;
    
  } catch (error) { 
    console.log(error);
    return "error"; 
  }
}




async function template3(client,body) { //buttons, text, to, quotedMessageId#optional
  try{
    let response;
    let quotedMessageId = (body.hasOwnProperty('quotedMessageId')? body.quotedMessageId: '');

    //body.buttons = [{"id":"customId","body":"button1"},{"body":"button2"},{"body":"button3"},{"body":"button4"}]
  //   const formattedButtonSpec = await Buttons._format(JSON.parse(body.buttons));
    const formattedButtonSpec = JSON.parse(body.buttons);
    const button = new Buttons(body.text, formattedButtonSpec, ``, ``);

    response = await client.sendMessage(body.to, button, {quotedMessageId:quotedMessageId});
    return response;
    
  } catch (error) { 
    console.log(error);
    return "error"; 
  }
}




async function template4(client,body) { //buttons, url, to, caption, quotedMessageId#optional
  try{
    let response;
    let quotedMessageId = (body.hasOwnProperty('quotedMessageId')? body.quotedMessageId: '');

    //body.buttons = [{"id":"customId","body":"button1"},{"body":"button2"},{"body":"button3"},{"body":"button4"}]
  //   const formattedButtonSpec = await Buttons._format(JSON.parse(body.buttons));
    const formattedButtonSpec = JSON.parse(body.buttons);
    const media = await MessageMedia.fromUrl(body.url);
    const button = new Buttons(media, formattedButtonSpec, ``, ``);

    response = await client.sendMessage(body.to, button, {caption:body.caption, quotedMessageId:quotedMessageId});
    return response;
    
  } catch (error) { 
    console.log(error);
    return "error"; 
  }
}




async function template5(client,body) { //sections, text, buttonText, to, quotedMessageId#optional
  try{
    let response;
    let quotedMessageId = (body.hasOwnProperty('quotedMessageId')? body.quotedMessageId: '');

    //body.sections = [{"title":"sectionTitle","rows":[{"id":"customId","title":"ListItem2","description":"desc"},{"title":"ListItem2"}]}]
  //   let sections = await List._format(JSON.parse(body.sections));
    let sections = JSON.parse(body.sections);
    const list = new List(body.text, body.buttonText, sections, ``, ``);

    response = await client.sendMessage(body.to, list, {quotedMessageId:quotedMessageId});
    return response;
    
  } catch (error) { 
    console.log(error);
    return "error"; 
  }
}




async function template6(client,body) { //sections, url, buttonText, to, caption, quotedMessageId#optional
  try{
    
    let response;
    let quotedMessageId = (body.hasOwnProperty('quotedMessageId')? body.quotedMessageId: '');

    //body.sections = [{"title":"sectionTitle","rows":[{"id":"customId","title":"ListItem2","description":"desc"},{"title":"ListItem2"}]}]
  //   let sections = await List._format(JSON.parse(body.sections));
    let sections = JSON.parse(body.sections);
    const media = await MessageMedia.fromUrl(body.url);
    const list = new List(media, body.buttonText, sections, ``, ``);

    response = await client.sendMessage(body.to, list, {caption:body.caption, quotedMessageId:quotedMessageId});
    return response;
    
  } catch (error) { 
    console.log(error);
    return "error"; 
  }
}


async function joinGroup(client,body) { //inviteCode
  try {
      let response = await client.acceptInvite(body.inviteCode);
      return response;
    
  } catch (error) {
      console.log(error);
      return "error";
  }
}


async function left(chat) {
  try {
      if (chat.isGroup) {
        return chat.leave();
      }else{
        return {"error":"This command can only be used in a group!"};
      }
  } catch (e) {
      console.log(e);
      return "error";
  }
}


async function leaveGroup(client,body) { //name
  try {
    let thisChat = await client.getChats().find(chat => chat.name == body.name);
    return await left(thisChat);
    
  } catch (error) { 
    console.log(error);
    return "error"; 
  }
}


async function klient(client, body) {
  try {
    let r, r2, r3;
    
    if( body.hasOwnProperty('eval') ) {
      eval(body.eval);
    }
    
    
    if( body.hasOwnProperty('return') ) {
      if( body.return == 'r' ) {
        return JSON.stringify(r);
        
      }else{
        return eval(body.return);
      }
    }
    
    
    if( body.hasOwnProperty('client') ) {
      return await eval(body.client);
    }
    
    
    if( body.hasOwnProperty('term') ) {
      r = eval(body.term);
      r2 = eval(body.term2);
      return JSON.stringify(r2);
    }
    
  } catch (error) { 
    console.log(error);
    return "error"; 
  }
}




const snapiexecute = async (client,body,res) => {
    let response = await eval(body.template)(client, body);
  
    if (response == "error") {
        res.send(response);
      
    } else if (response !== "noreply") {
        res.send(JSON.stringify(response));
    }
};


module.exports = {
  snapiexecute
};
