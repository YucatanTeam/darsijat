
require('dotenv').config()

var telegraf = require ('telegraf');
const session = require('telegraf/session')
const TelegrafInlineMenu = require('telegraf-inline-menu')
const bot = new telegraf(process.env.TOKEN);
const con = require('./config/db');

const mainMenu = new TelegrafInlineMenu(ctx => `سلام ${ctx.message.from.username}!`)
const fooMenu = new TelegrafInlineMenu('Foo Menu')
const barMenu = new TelegrafInlineMenu('Bar Menu')
mainMenu.setCommand('start')
mainMenu.submenu('Open Foo Menu', 'foo', fooMenu)
fooMenu.submenu('Open Bar Menu', 'bar', barMenu)
barMenu.simpleButton('Hit me', 'something', {
  doFunc: ctx => ctx.reply('As am I!')
})

bot.use(mainMenu.init())
bot.use(session({
    getSessionKey: (ctx) => {
      if (ctx.from && ctx.chat) {
        return `${ctx.from.id}:${ctx.chat.id}`
      } else if (ctx.from && ctx.inlineQuery) {
        return `${ctx.from.id}:${ctx.from.id}`
      }
      return null
    }
  }
))

bot.start(function(ctx){
    con.query(`SELECT * FROM user WHERE mId = ?` , [`${ctx.message.from.id}`],function(err,row){ 
      if(Object.entries(row).length === 0){
        // user use this bot for the first time
        con.query(`INSERT INTO user(mId) VALUES(?)`,[ctx.message.from.id])
      } else if(ctx.message.from.id != process.env.ADMIN_ID){ 
        // user already exists and is not admin
          ctx.session.isAdmin = false
      } else{
        // user id admin
        ctx.session.isAdmin = true
      }
    })
});

bot.startPolling()