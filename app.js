
require('dotenv').config()

var telegraf = require ('telegraf');
const session = require('telegraf/session')
const bot = new telegraf(process.env.TOKEN);
const con = require('./config/db');

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
          ctx.reply('`از منوی زیر برای خرید جزوه های موجود استفاده کنید`')
      } else{
        // user id admin
        ctx.session.isAdmin = true
        ctx.reply(`از منوی زیر برای تنظیم ربات خود استفاده کنید`)
      }
    })
});

//launch server
bot.launch();