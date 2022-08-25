const { Client, Location, List, Buttons, LocalAuth} = require('./index');
const express = require('express');
const http = require('http');
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);

app.get('/', (req, res) => {
    res.sendFile('index.html', {
      root: __dirname
    });
  });

server.listen(port, function() {

    console.log('App running on *: ' + port);
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
});


client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});

client.on('message', async msg => {
    console.log('MESSAGE RECEIVED', msg.from,' __ ', msg.type);
    const contact = await msg.getContact();

    if (msg.body === 'Ola BOT Felps!') {
        let chat = await msg.getChat();
        if(!chat.isGroup){
            // Send a new message as a reply to the current one
            msg.reply(`Hi ${contact.number}!`);
            // Limited to 5 buttons per message and limited to 3 buttons for each kind, in this case the third quick reply button will be removed
            let button = new Buttons(
                'Opções',
                [
                    { body: 'Bem' },
                    { body: 'Legal'},
                    { body: 'Quantos amiguin cê tem?'},
                ],
                'Aqui vão algumas opções',
                'Escolha bem!'
            );
            client.sendMessage(msg.from, button);
        }

    } else if (msg.body === 'Bem') {
        let chat = await msg.getChat();
        if(!chat.isGroup){
        // Send a new message to the same chat
        client.sendMessage(msg.from, 'Certa resposta');
        }
    } else if (msg.body === 'Legal') {
        let chat = await msg.getChat();
        if(!chat.isGroup){
        // Send a new message to the same chat
        client.sendMessage(msg.from, 'Resposta errada. Tente novamente mais tarde');
        }
    } else if (msg.body.startsWith('Fala isso: ')) {
        let chat = await msg.getChat();
        if(!chat.isGroup){
        // Replies with the same message
        msg.reply(msg.body.slice(11));
        }
    }  
    
    else if (msg.body === 'Quantos amiguin cê tem?') {

        let chat = await msg.getChat();
        if(!chat.isGroup){
            const chats = await client.getChats();
            client.sendMessage(msg.from, `Tô cv com mais de ${chats.length} otário agr.`);
        }
    } 
    else if (msg.body === 'deleta isso cara') {
        let chat = await msg.getChat();
        if(!chat.isGroup){
            if (msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                if (quotedMsg.fromMe) {
                    quotedMsg.delete(true);
                } else {
                    msg.reply('Cê é loco? só posso deletar o que eu escrevo');
                }
            }
        }
    }  
    // else if (msg.body.startsWith('!join ')) {
    //     const inviteCode = msg.body.split(' ')[1];
    //     try {
    //         await client.acceptInvite(inviteCode);
    //         msg.reply('Joined the group!');
    //     } catch (e) {
    //         msg.reply('That invite code seems to be invalid.');
    //     }
    // } 
    // else if (msg.body === '!groupinfo') {
    //     let chat = await msg.getChat();
    //     if(!chat.isGroup){
    //         msg.reply('This command can only be used in a group!');
    //     }
    //} 
    // else if (msg.body === '!mention') {
    //     let chat = await msg.getChat();
    //     if(!chat.isGroup){
    //         const contact = await msg.getContact();
    //         const chat = await msg.getChat();
    //         chat.sendMessage(`Hi @${contact.number}!`, {
    //             mentions: [contact]
    //         });
    //     }
    // } 
    // else if (msg.body === '!buttons') {
    //     let chat = await msg.getChat();
    //     if(!chat.isGroup){
    //         // Limited to 5 buttons per message and limited to 3 buttons for each kind, in this case the third quick reply button will be removed
    //         let button = new Buttons(
    //             'Button body',
    //             [
    //                 { body: 'Some text' },
    //                 { body: 'Try clicking me (id:test)', id: 'test'},
    //             ],
    //             'title',
    //             'footer'
    //         );
    //         client.sendMessage(msg.from, button);
    //     }
    // } 
    // else if (msg.body === '!list') {
    //     let chat = await msg.getChat();
    //     if(!chat.isGroup){
    //         let sections = [{title:'sectionTitle',rows:[{title:'ListItem1', description: 'desc'},{title:'ListItem2'}]}];
    //         let list = new List('List body','btnText',sections,'Title','footer');
    //         client.sendMessage(msg.from, list);
    //     }
    // } 
});

client.on('message_create', (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // do stuff here
    }
});

client.on('message_revoke_everyone', async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    console.log(after); // message after it was deleted.
    if (before) {
        console.log(before); // message before it was deleted.
    }
});

client.on('message_revoke_me', async (msg) => {
    // Fired whenever a message is only deleted in your own view.
    console.log(msg.body); // message before it was deleted.
});

client.on('message_ack', (msg, ack) => {
    /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

    if(ack == 3) {
        // The message was read
    }
});

client.on('group_join', (notification) => {
    // User has joined or been added to the group.
    console.log('join', notification);
    notification.reply('User joined.');
});

client.on('group_leave', (notification) => {
    // User has left or been kicked from the group.
    console.log('leave', notification);
    notification.reply('User left.');
});

client.on('group_update', (notification) => {
    // Group picture, subject or description has been updated.
    console.log('update', notification);
});

client.on('change_state', state => {
    console.log('CHANGE STATE', state );
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

