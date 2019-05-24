
require('dotenv').config()

var telegraf = require ('telegraf');
const bot = new telegraf(process.env.TOKEN);
const con = require('./config/db');

bot.start(function(ctx){
    
    
    con.query(`SELECT * FROM user WHERE mId = ?` , [`${ctx.message.from.id}`],function(err,row){     
        for (var i in row){
          if(row[i].mId != ctx.message.from.id){
            con.query(`INSERT INTO user(isPayed,mId) VALUES(?,?)`,[0,ctx.message.from.id])
          }
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