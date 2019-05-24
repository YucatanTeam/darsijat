
require('dotenv').config()

var telegraf = require ('telegraf');
const bot = new telegraf(process.env.TOKEN);
const con = require('./config/db');

bot.start(function(ctx){
    
    
    con.query(`SELECT * FROM user WHERE mId = ?` , [`${ctx.message.from.id}`],function(err,row){ 
      if(Object.entries(row).length === 0 && ctx.message.from.id != process.env.ADMIN_ID){ 
          con.query(`INSERT INTO user(mId) VALUES(?)`,[ctx.message.from.id])
        }
    })
    ctx.reply(`test commands:
    /motevassete
    /ebtedaii`)
});

bot.command("motevassete",function(ctx) {
    ctx.reply("holy momy fucking shit :)")
})

//launch server
bot.launch();