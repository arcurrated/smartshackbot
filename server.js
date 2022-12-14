const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv')

dotenv.config({ path: __dirname + '/.env.local' })

const five = require('johnny-five');
const board = new five.Board({
	repl: false,
});

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TG_TOKEN;
console.log(token)
const admins = [ 1249342787, 1027435130 ]
const isAdmin = (tgId) => {
    if(admins.indexOf(tgId) !== -1){
        return true
    }
    return false
}

// ๐ก๐๐
let relay1 = null
let relay2 = null

const currentState = {
    relay1: {
        title: '๐ก ะัะฝะพะฒะฝะพะน ัะฒะตั',
        isActive: false,
        toggle: () => {
            if(relay1 !== null){
                if(currentState.relay1.isActive){
                    relay1.close()
                } else {
                    relay1.open()
                }
            }
            currentState.relay1.isActive = !currentState.relay1.isActive
        }
    },
    relay2: {
        title: '๐ก ะัะฐ',
        isActive: false,
        toggle: () => {
            if(relay2 !== null){
                if(currentState.relay2.isActive){
                    relay2.close()
                } else {
                    relay2.open()
                }
                //relay2.toggle()
            }
            currentState.relay2.isActive = !currentState.relay2.isActive
        }
    }
}

board.on('ready', function(){
    relay1 = new five.Relay(7)
    relay2 = new five.Relay(8)
});

const getKeyboard = () => {
    const keyboard = []
    for(let i in currentState){
        const val = currentState[i]
        if(val.isActive){
            keyboard.push([ val.title + ' ๐' ])
        } else {
            keyboard.push([ val.title + ' ๐' ])
        }
    }
    return JSON.stringify( { keyboard } )
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;
    if(!isAdmin(chatId)){
        return bot.sendMessage(chatId, 'Forbidden')
    }
    bot.sendMessage(chatId, 'ะ?ะฐะฑะพัะฐะนัะต ะฑัะฐััั', {
        reply_markup: getKeyboard(),
    })
})

// Listen for any kind of message. There are different kinds of
// messages.

bot.on('message', (msg) => {
    //console.log(msg)
    const chatId = msg.chat.id;
    if(!isAdmin(chatId)){
        return bot.sendMessage(chatId, 'Forbidden')
    }
    if(msg.sticker){
        return bot.sendMessage(chatId, msg.from.first_name + ', ะฝะต ะฑะฐะปัะนัั!')
    }
    if(msg.text == '/start'){
        return
    }
    let isDone = false
    const text = msg.text
    for(let i in currentState){
        const val = currentState[i]
        if(text.indexOf(val.title) !== -1){
            currentState[i].toggle()
            isDone = true
        }
    }

    let ansText = 'ะะธัะตะณะพ ะฝะต ะฟะพะฝัะป ๐ณ'
    if(isDone){
        ansText = 'ะัะต ัะดะตะปะฐะป ะฑะพัั ๐'
    }
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, ansText, {
        reply_markup: getKeyboard(),
    });
});

bot.on('polling_error', (err) => {
    console.log(Date(), err)
    //console.log(relay1)
})

bot.on('error', (err) => {
    console.log(Date(), err)
})

process.on('uncaughtException', function(err){
	console.log(Date(), err);
})
