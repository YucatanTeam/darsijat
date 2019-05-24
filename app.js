
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
      if(Object.entries(row).length === 0 && ctx.message.from.id != process.env.ADMIN_ID){ 
          con.query(`INSERT INTO user(mId) VALUES(?)`,[ctx.message.from.id])
          ctx.session.isAdmin = false
          ctx.reply('`HELLO USER :)`')
      }
      else{
        ctx.session.isAdmin = true
        ctx.reply(`HELLO ADMIN :)`)
      }
    })

});

//launch server
bot.launch();