
require('dotenv').config()
// make a .env file
// DB_HOST=localhost
// DB_NAME=kheibot
// DB_USER=root
// DB_PASS=root
// PORT=3000
// TOKEN=780218594:AAFYGdHotytGkkBBE37C19YvKqFgIWR7zWs

var telegraf = require ('telegraf');
const bot = new telegraf(TOKEN);
const con = require('./config/db');

//on start text


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