const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TG_TOKEN;

const admins = [ 1249342787, 1027435130 ]
const isAdmin = (tgId) => {
    if(admins.indexOf(tgId) !== -1){
        return true
    }
    return false
}

// 💡🔔🔕
const currentState = {
    relay1: {
        title: '💡 Основной свет',
        isActive: false,
    },
    relay2: {
        title: '💡 Бра',
        isActive: false,
    }
}

const getKeyboard = () => {
    const keyboard = []
    for(let i in currentState){
        const val = currentState[i]
        if(val.isActive){
            keyboard.push([ val.title + ' 🔔' ])
        } else {
            keyboard.push([ val.title + ' 🔕' ])
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
    bot.sendMessage(chatId, 'Работайте братья', {
        reply_markup: getKeyboard(),
    })
})

// Listen for any kind of message. There are different kinds of
// messages.

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if(!isAdmin(chatId)){
        return bot.sendMessage(chatId, 'Forbidden')
    }
    if(msg.text == '/start'){
        return
    }
    let isDone = false
    const text = msg.text
    for(let i in currentState){
        const val = currentState[i]
        if(text.indexOf(val.title) !== -1){
            currentState[i].isActive = !currentState[i].isActive // toggle
            isDone = true
        }
    }

    let ansText = 'Ничего не понял 😳'
    if(isDone){
        ansText = 'Все сделал босс 😎'
    }
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, ansText, {
        reply_markup: getKeyboard(),
    });
});