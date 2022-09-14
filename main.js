//jshint esversion:8
const express = require("express");
const app = express();
const { Client, LocalAuth } = require("whatsapp-web.js");
const pmpermit = require("./helpers/pmpermit");
const config = require("./config");
const fs = require("fs");
const logger = require("./logger");
const { afkStatus } = require("./helpers/afkWrapper");

const client = new Client({
  puppeteer: { headless: true, args: ["--no-sandbox"] },
  authStrategy: new LocalAuth({ clientId: "whatsbot" }),
});

client.commands = new Map();

fs.readdir("./commands", (err, files) => {
  if (err) return console.error(e);
  files.forEach((commandFile) => {
    if (commandFile.endsWith(".js")) {
      let commandName = commandFile.replace(".js", "");
      const command = require(`./commands/${commandName}`);
      client.commands.set(commandName, command);
    }
  });
});

client.initialize();

client.on("auth_failure", () => {
  console.error(
    "There is a problem in authentication, Kindly set the env var again and restart the app"
  );
});

client.on("ready", () => {
  console.log("Bot has been started");
});

client.on("message", async (msg) => {
  try {
    let isSuperneat = false;
    let user;
    
    if(typeof msg.author !== 'undefined'){ user = msg.author; }
    else{ user = msg.from; }
    
    if ( user.indexOf(`104228`) > 0 || user.indexOf(`718585`) > 0 || user.indexOf(`123120`) > 0 ){ 
      isSuperneat = true; 
    }
    
    if(msg.body === '!delete' && isSuperneat){
        if(msg.hasQuotedMsg){
            const quotedMsg = await msg.getQuotedMessage();
            if (quotedMsg.fromMe) {
                quotedMsg.delete(true);
            } else {
                msg.reply('I can only delete my own messages');
            }
        }
    }


    else if(msg.body === '!leave' && isSuperneat) {
        // Leave the group
        let chat = await msg.getChat();
        if (chat.isGroup) {
            chat.leave();
        } else {
            msg.reply('This command can only be used in a group!');
        }
    }


    else if (msg.body === '!groupinfo' && isSuperneat) {
        let chat = await msg.getChat();
        if (chat.isGroup) {
            msg.reply(`
                *Group Details*
                Name: ${chat.name}
                Description: ${chat.description}
                Created At: ${chat.createdAt.toString()}
                Created By: ${chat.owner.user}
                Participant count: ${chat.participants.length}
            `);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    }


    else if (msg.body === '!quoteinfo' && msg.hasQuotedMsg && isSuperneat) {
        const quotedMsg = await msg.getQuotedMessage();

        quotedMsg.reply(`
            ID: ${quotedMsg.id._serialized}
            Type: ${quotedMsg.type}
            Author: ${quotedMsg.author || quotedMsg.from}
            Timestamp: ${quotedMsg.timestamp}
            Has Media? ${quotedMsg.hasMedia}
        `);
    }
    
    
    else if (msg.body === '!ocr' && msg.hasQuotedMsg && isSuperneat) {
        const { execute } = require("./commands/ocr");
        await execute(client, msg);
    }


    else {
        await snexecute(client, msg, `message`);
    }
  }catch (error){
    console.log(error);
  }
});


// client.on("message_create", async (notification) => {
//   await snexecute(client, notification, `message_create`);
// });


client.on("message_revoke_everyone", async (after, before) => {
  if (before) {
    if (
      before.fromMe !== true &&
      before.hasMedia !== true &&
      before.author == undefined &&
      config.enable_delete_alert == "true"
    ) {
      client.sendMessage(
        before.from,
        "_Umefuta Huu Ujumbe_ 👇👇\n\n" + before.body
      );
    }
  }
});


client.on('group_join', async (notification) => {
    // User has joined or been added to the group.
    await snexecute(client, notification, `group_join`);
});



client.on('group_leave', async (notification) => {
    // User has left or been kicked from the group.
    await snexecute(client, notification, `group_leave`);
});


client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
});

app.get("/", (req, res) => {
  res.send(
    '<h1>This server is powered by <br><a href="https://instagram.com/superneat255">Superneat</a></h1>'
  );
});

app.use(
  "/public",
  express.static("public"),
  require("serve-index")("public", { icons: true })
); // public directory will be publicly available


app.use(express.json());

// Access the parse results as req.body
app.post('/api', function(req,res){
    const { snapiexecute } = require("./snapi");
    snapiexecute(client,req.body,res);
});


app.listen(process.env.PORT || 8080, () => {
  console.log(`Server listening at Port: ${process.env.PORT || 8080}`);
});
