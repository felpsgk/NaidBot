const { Client, Location, List, Buttons, LocalAuth } = require('./index');
const express = require('express');
const http = require('http');
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { use } = require('chai');
const { JSDOM } = jsdom;
var priceStart;
var priceEnd;
var minOvr;
let DDD = '';
let MENSAGEM = '';
let PERSONALIZANDO = false;
//const db = require("./db");
var mysql = require('mysql');
const { Connection } = require('puppeteer');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'users'
});
connection.connect();

app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: __dirname
    });
});
server.listen(port, function () {

    console.log('App running on *: ' + port);
});
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }
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
    //select();
});
function User(id, link) {
    this.id = id;
    this.link = link;
}
function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}

function select(DDD, mensagem) {
    let sql = "select telefone from massaDados where telefone like '"+DDD+"%';";
    console.log(sql);
    connection.query
    (sql, function (errs, resultSelect, fields) {
        if (errs) throw errs;
        resultSelect.forEach(async elements => {
        client.sendMessage(elements.telefone+"@c.us",mensagem);
        await sleep(3000);
        });
    });
    //connection.end();
}

let inserido;
let atualizado;
let pegaLink;
client.on('message', async msg => {
    const contact = await msg.getContact();
    await insertMassaDados();
    async function insertMassaDados() {
        await sleep(1000);
        var sql = "SELECT COUNT(*) AS count FROM massaDados WHERE telefone = ?";
        var value = contact.number;
        var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
        var nomeContato = contact.pushname.replace(regex,'');
        //console.log(value);
        connection.query(sql, [value], function (err, result, fields) {
            if (result[0].count > 0) {
                //console.log('ja existe');
            } else {
                console.log('Novo número encontrado!');
                var sql = "INSERT INTO massaDados (telefone, nome) VALUES ?";
                var values = [
                    [contact.number, nomeContato]
                ];
                connection.query(sql, [values], function (err, result) {
                    if (err) throw err;
                    console.log("Inserido número: " + result.affectedRows);
                    return true;
                });
            }
            return true;
            //connection.end();
            //get(id);
        });
        return true;
    }
    async function inserirBanco(id, link) {
        await sleep(1000);
        inserido = await insert(id, link);
        pegaLink = await getLink(id);
    }
    async function updateBanco(id, link) {
        await sleep(1000);
        atualizado = await updateLink(id, link);
        pegaLink = await getLink(id);
    }
    async function insert(id, link) {
        await sleep(1000);
        var sql = "SELECT COUNT(*) AS count FROM usuarios WHERE id = ?";
        var value = [id];
        connection.query(sql, [value], function (err, result, fields) {
            if (result[0].count > 0) {
                console.log('maior q zero, sera update');

                var sql = "UPDATE usuarios SET link = '" + link + "' WHERE id = '" + id + "'";
                connection.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(result.affectedRows + " atualizado");
                    return true;
                });

            } else {
                console.log('igual a zero, sera insert');
                var sql = "INSERT INTO usuarios (id, link) VALUES ?";
                var values = [
                    [id, link]
                ];
                connection.query(sql, [values], function (err, result) {
                    if (err) throw err;
                    console.log("Inserido: " + result.affectedRows);
                    return true;
                });
            }
            return true;
            //connection.end();
            //get(id);
        });
        return true;
    }
    async function getLink(id) {
        await sleep(1000);

        const results = sqlQuery(connection)
        function sqlQuery(dbConnection) {
            return new Promise((resolve, reject) => {
                dbConnection.query('SELECT link FROM usuarios WHERE id = ' + mysql.escape(id), function (error, results, fields) {
                    if (error) {
                        console.log(error)
                        //Rejeita a promessa
                        reject(error)
                    }
                    //Conclui a promessa
                    resolve(results)
                    //dbConnection.end();
                })
            })
        }
        return results.then(
            function (r) {
                return r[0].link;
            }
        );
    }
    async function updateLink(id, newLink) {
        await sleep(1000);
        const results = sqlQuery(connection)
        function sqlQuery(dbConnection) {
            return new Promise((resolve, reject) => {
                dbConnection.query('SELECT link FROM usuarios WHERE id = ' + mysql.escape(id),
                    function (error, results, fields) {
                        if (error) {
                            console.log(error)
                            //Rejeita a promessa
                            reject(error)
                        }
                        //Conclui a promessa
                        resolve(results)
                        //dbConnection.end();
                    })
            })
        }
        //console.log(' results promisse ' +results) // Promise
        return results.then(
            function (r) {
                var oldLink = r[0].link;
                oldLink += newLink;
                var sql = "UPDATE usuarios SET link = '" + oldLink + "' WHERE id = '" + id + "'";
                connection.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(result.affectedRows + " atualizado");
                    return true;
                });
                return true;
            }

        );
        return true;
    }
    function startCon() {
        connection.connect();
    }
    function endCon() {
        connection.end();
    }

    var user = new User(contact.number, "");
    //console.log('MESSAGE RECEIVED', msg.from, ' __ ', msg.type);
    if (msg.body === 'Mensagem Personalizada') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            // Send a new message as a reply to the current one
            msg.reply(`Digite o numero a ser enviado, iniciando sempre com 55\n"+
            ", DDD e, se quiser especificar número, digite o numero também.\n"+
            "Exemplo: 5531 envia para todos 31\n55319707 envia para estes numeros?!`);
            // Limited to 5 buttons per message and limited to 3 buttons for each kind, in this case the third quick reply button will be remove

        }
    } else if (msg.body.startsWith('55')) {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            DDD = msg.body;
            // Send a new message as a reply to the current one
            msg.reply(`Qual a mensagem a ser enviada?!`);
            PERSONALIZANDO = true;
            
        }
    } else if (PERSONALIZANDO === true && msg.body != null) {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            MENSAGEM = msg.body;
            // Send a new message as a reply to the current one
            msg.reply(`Enviando mensagem`);
            select(DDD, MENSAGEM);
            PERSONALIZANDO = false;            
        }
    }
    else if (msg.body === 'Ativar') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            // Send a new message as a reply to the current one
            msg.reply(`Olá ${contact.name}!`);
            inserirBanco(user.id, '');
            msg.reply(user.id);
            let button = new Buttons(
                'Opções',
                [
                    { body: 'Bot Fifa UT' },
                    { body: 'Mais' },
                ],
                'Aqui vão algumas opções',
                'Escolha!'
            );
            client.sendMessage(msg.from, button);
            // Limited to 5 buttons per message and limited to 3 buttons for each kind, in this case the third quick reply button will be remove

        }
    } else if (msg.body === 'Bot Fifa UT') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            // Send a new message to the same chat
            msg.reply('Bem vindo ao bot do FUT. Sua sorte será sustentada!');
            let button = new Buttons(
                'Opções',
                [
                    { body: 'Personalizado' },
                    { body: '85+ até 50-100k' },
                    { body: '90+ até 100-200k' },
                ],
                'Aqui vão algumas opções',
                'Escolha!'
            );
            client.sendMessage(msg.from, button);
        }
    }
    else if (msg.body === '85+ até 50-100k') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            priceData = 4;
            precoJogador = "";
            minOvr = 85;
            maxOvr = 90;
            priceStart = 50000;
            priceEnd = 100000;
            got('https://www.futwiz.com/en/fifa22/players?page=0&order=rating&s=desc&minrating=' + minOvr + '&maxrating=' + maxOvr + '&minprice=' + priceStart + '&maxprice=' + priceEnd).then(response => {
                const dom = new JSDOM(response.body);
                var myNodeList = dom.window.document.querySelectorAll('td.player > p.name > a > b');
                Array.from(myNodeList).slice(0, 5).forEach(valor => {
                    precoJogador += "O " + valor.textContent + ' de OVR *' +
                        dom.window.document.querySelectorAll('tr.table-row > td')[2].textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim() + ', está valendo* ' + dom.window.document.
                            querySelectorAll('tr.table-row > td')[priceData].textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim() + "\n";
                    priceData += 16;
                });
                console.log('https://www.futwiz.com/en/fifa22/players?page=0&order=rating&s=desc&minrating=' + minOvr + '&maxrating=' + maxOvr + '&minprice=' + priceStart + '&maxprice=' + priceEnd);
                client.sendMessage(msg.from, precoJogador);
            });
        }
    }
    else if (msg.body === '90+ até 100-200k') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            priceData = 4;
            precoJogador = "";
            maxOvr = 99;
            minOvr = 90;
            priceStart = 100000;
            priceEnd = 200000;
            got('https://www.futwiz.com/en/fifa22/players?page=0&order=rating&s=desc&minrating=' + minOvr + '&maxrating=' + maxOvr + '&minprice=' + priceStart + '&maxprice=' + priceEnd).then(response => {
                const dom = new JSDOM(response.body);
                var myNodeList = dom.window.document.querySelectorAll('td.player > p.name > a > b');
                Array.from(myNodeList).slice(0, 5).forEach(valor => {
                    precoJogador += "O " + valor.textContent + ' de OVR *' +
                        dom.window.document.querySelectorAll('tr.table-row > td')[2].textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim() + ', está valendo* ' + dom.window.document.
                            querySelectorAll('tr.table-row > td')[priceData].textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim() + "\n";
                    priceData += 16;
                });
                console.log('https://www.futwiz.com/en/fifa22/players?page=0&order=rating&s=desc&minrating=' + minOvr + '&maxrating=' + maxOvr + '&minprice=' + priceStart + '&maxprice=' + priceEnd);
                client.sendMessage(msg.from, precoJogador);
            });
        }
    }
    else if (msg.body === 'Personalizado') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            // Send a new message to the same chat
            msg.reply('Escolha um intervalo de Overall. Encontraremos os melhores!');
            let button = new Buttons(
                'Opções',
                [
                    { body: 'OVR70' },
                    { body: 'OVR80' },
                    { body: 'OVR90' },
                ],
                'Aqui vão algumas opções',
                'Escolha!'
            );
            client.sendMessage(msg.from, button);
        }
    }
    else if (msg.body === 'OVR70') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            let sections =
                [
                    {
                        title: 'Overalls',
                        rows: [
                            { title: 'OVR', description: '70' },
                            { title: 'OVR', description: '71' },
                            { title: 'OVR', description: '72' },
                            { title: 'OVR', description: '73' },
                            { title: 'OVR', description: '74' },
                            { title: 'OVR', description: '75' },
                            { title: 'OVR', description: '76' },
                            { title: 'OVR', description: '77' },
                            { title: 'OVR', description: '78' },
                            { title: 'OVR', description: '79' }
                        ]
                    }
                ];
            let list = new List('Lista de Ovr', 'Escolher', sections, 'Listagem', 'footer');
            client.sendMessage(msg.from, list);
        }
    }
    else if (msg.body === 'OVR80') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            let sections =
                [
                    {
                        title: 'Overalls',
                        rows: [
                            { title: 'OVR', description: '80' },
                            { title: 'OVR', description: '81' },
                            { title: 'OVR', description: '82' },
                            { title: 'OVR', description: '83' },
                            { title: 'OVR', description: '84' },
                            { title: 'OVR', description: '85' },
                            { title: 'OVR', description: '86' },
                            { title: 'OVR', description: '87' },
                            { title: 'OVR', description: '88' },
                            { title: 'OVR', escription: '89' }
                        ]
                    }
                ];
            let list = new List('Lista de Ovr', 'Escolher', sections, 'Listagem', 'footer');
            client.sendMessage(msg.from, list);
        }
    }
    else if (msg.body === 'OVR90') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            let sections =
                [
                    {
                        title: 'Overalls',
                        rows: [
                            { title: 'OVR', description: '90' },
                            { title: 'OVR', description: '91' },
                            { title: 'OVR', description: '92' },
                            { title: 'OVR', description: '93' },
                            { title: 'OVR', description: '94' },
                            { title: 'OVR', description: '95' },
                            { title: 'OVR', description: '96' },
                            { title: 'OVR', description: '97' },
                            { title: 'OVR', description: '98' },
                            { title: 'OVR', description: '99' }
                        ]
                    }
                ];
            let list = new List('Lista de Ovr', 'Escolher', sections, 'Listagem', 'footer');
            client.sendMessage(msg.from, list);
        }
    }
    else if (msg.body.startsWith('OVR')) {
        OVR();
        async function OVR() {

            var ovrSelec = msg.body.slice(4);
            var ovrMax = Number(ovrSelec) + 5;
            var linkData = 'https://www.futwiz.com/en/fifa22/players?page=0&order=rating&s=desc&minrating=' + ovrSelec + '&maxrating=' + ovrMax;
            msg.reply('Escolhido ovr mínimo de ' + ovrSelec + '. Máximo será de ' + ovrMax + '\nAgora, informe um valor *INICIAL* desta forma: *"I-10000". PRECISA ser desta forma*');
            user.link = linkData;

            await inserirBanco(user.id, user.link);

            console.log(' --------------ATUALIZANDO OVERALL -------------- ');
            console.log('Foi inserido? --- ' + inserido);
            console.log('Qual o link --- ' + pegaLink);
        }
    }
    else if (msg.body.startsWith('I-')) {
        I();
        async function I() {
            const prcSelec = msg.body.slice(2);
            msg.reply('Escolhido preço mínimo de ' + prcSelec +
                '\nAgora, informe um valor *FINAL* desta forma: *"M-10000". PRECISA ser desta forma*');
            await updateBanco(user.id, '&minprice=' + prcSelec);

            console.log(' --------------ATUALIZANDO PREÇO MINIMO -------------- ');
            console.log('Foi atualizado? --- ' + atualizado);
            console.log('Qual o link --- ' + pegaLink);
        }
    }
    else if (msg.body.startsWith('M-')) {
        M();
        async function M() {
            let priceData = 4;
            let ovrData = 2;
            let precoJogador = '';
            const prcSelec = msg.body.slice(2);
            msg.reply('Escolhido preço máximo ' + prcSelec + '\nAgora, os resultados:');
            await updateBanco(user.id, '&maxprice=' + prcSelec);

            console.log(' --------------ATUALIZANDO PREÇO MÁXIMO -------------- ');
            console.log('Foi atualizado? --- ' + atualizado);
            console.log('Qual o link --- ' + pegaLink);
            got(pegaLink).then(response => {
                const dom = new JSDOM(response.body);
                var myNodeList = dom.window.document.querySelectorAll('td.player > p.name > a > b');
                if (myNodeList.length > 0) {
                    Array.from(myNodeList).slice(0, 10).forEach(valor => {
                        precoJogador += "O jogador *" + valor.textContent + '* de OVR *' +
                            dom.window.document.querySelectorAll('tr.table-row > td')[ovrData].textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim() + '*, está valendo *' + dom.window.document.
                                querySelectorAll('tr.table-row > td')[priceData].textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim() + "*\n";
                        priceData += 16;
                        ovrData += 16;
                    });
                    client.sendMessage(msg.from, precoJogador);
                    console.log('Lista enviada com sucesso');
                    link = '';
                } else {
                    client.sendMessage(msg.from, "Não encontramos jogadores nessas condições");
                }
            });
        }
    }
    else if (msg.body === 'Mais') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            // Send a new message to the same chat
            let button = new Buttons(
                'Opções',
                [
                    { body: 'Vão troca o golzin na space, vão??' },
                    { body: 'Quantos amiguin cê tem?' },
                    { body: 'Tem mais?' },
                ],
                'Aqui vão mais opções',
                'Sua decisão que se dane!'
            );
            let button2 = new Buttons(
                'Opções',
                [
                    { body: 'Eu to com um problema' },
                    { body: 'Seu Cuca ta aí?' },
                    { body: 'Tchau' },
                ],
                'Aqui vão mais opções',
                'Sua decisão que se dane!'
            );
            client.sendMessage(msg.from, button);
            client.sendMessage(msg.from, button2);
        }
    } else if (msg.body === 'Eu to com um problema') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            // Send a new message to the same chat
            client.sendMessage(msg.from, '"Existem 2 tipos de problema...", PIMENTA, Babosa');
        }
    } else if (msg.body === 'Seu Cuca ta aí?') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            // Send a new message to the same chat
            client.sendMessage(msg.from, 'Avisa lá que seu Cuca é eu!');
        }
    } else if (msg.body === 'Tchau') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            // Send a new message to the same chat
            client.sendMessage(msg.from, 'Até mais, cabaço!');
        }
    } else if (msg.body === 'Tem mais?') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            let button = new Buttons(
                'Opções',
                [
                    { body: 'Quanto tá o dolar?' },
                    { body: 'Quanto ta o Euro?' },
                ],
                'Aqui vão mais opções',
                'Sua decisão que se dane!'
            );
            client.sendMessage(msg.from, button);
        }
    }
    else if (msg.body === 'Quanto tá o dolar?') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            var valorDolar = "";
            got('https://www.melhorcambio.com/dolar-hoje').then(response => {
                const dom = new JSDOM(response.body);
                valorDolar += "O dólar está R$" + dom.window.document.querySelector('#comercial').value;
                client.sendMessage(msg.from, valorDolar);
            });
        }
    }
    else if (msg.body === 'Quanto ta o Euro?') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            var valorEuro = "";
            got('https://www.melhorcambio.com/euro-hoje').then(response => {
                const dom = new JSDOM(response.body);
                valorEuro += "O euro está R$" + dom.window.document.querySelector('#comercial').value;
                client.sendMessage(msg.from, valorEuro);
            });
        }
    }
    else if (msg.body === 'Vão troca o golzin na space, vão??') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            // Send a new message to the same chat.
            client.sendMessage(msg.from, 'Meia hora de açogue nos troca');
        }
    } else if (msg.body.startsWith('Fala isso: ')) {
        let chat = await msg.getChat();

        if (!chat.isGroup) {
            // Replies with the same message
            msg.reply(msg.body.slice(11));
        }
    }
    else if (msg.body === 'Quantos amiguin cê tem?') {

        let chat = await msg.getChat();
        if (!chat.isGroup) {
            const chats = await client.getChats();
            client.sendMessage(msg.from, `Tô conversando com mais de ${chats.length} otário agr.`);
        }
    }
    else if (msg.body === 'Deleta isso cara') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            if (msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                if (quotedMsg.fromMe) {
                    quotedMsg.delete(true);
                } else {
                    msg.reply("Cê é loco? Cê ta pixuruco?\nCê é biruleibe?" +
                        "\nSó posso deletar o que eu escrevo");
                }
            }
        }
    }
    else if (msg.body === 'Me manda o link do site') {
        let chat = await msg.getChat();
        if (!chat.isGroup) {
            // Send a new message to the same chat
            client.sendMessage(msg.from, '*USE COM MODERAÇÃO* https://felpsti.com.br/');
        }
    }




    // +
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
    //             'description',
    //             'footer'
    //         );
    //         client.sendMessage(msg.from, button);
    //     }
    // } 
    // else if (msg.body === '!list') {
    //     let chat = await msg.getChat();
    //     if(!chat.isGroup){
    //         let sections = [{description:'sectiondescription',rows:[{description:'ListItem1', description: 'desc'},{description:'ListItem2'}]}];
    //         let list = new List('List body','btnText',sections,'description','footer');
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

    if (ack == 3) {
        // The message was read
    }
});
/*
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
});*/

client.on('change_state', state => {
    console.log('CHANGE STATE', state);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});




//var sql = "CREATE TABLE usuarios (id VARCHAR(255), link VARCHAR(255))";
//connection.query(sql, function (err, result) {
//  if (err) throw err;
//   console.log("Table created");
//});
//var sql = "DELETE FROM usuarios WHERE id = '3EB097453F948CD6769F'";
//  connection.query(sql, function (err, result) {
//   if (err) throw err;
//   console.log("Number of records deleted: " + result.affectedRows);
// });
//select();
//insert('553197940351','https://www.futwiz.com/en/fifa22/players?page=0&order=rating&s=desc&minrating=91&maxrating=96');

    //connection.query("CREATE DATABASE users", function (err, result) {
    //    if (err) throw err;
    //    console.log("Database created");
    //  });
