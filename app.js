
require('dotenv').config()

var telegraf = require ('telegraf');
const bot = new telegraf(TOKEN);
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

<<<<<<< HEAD
=======
bot.command("motevassete",function(ctx) {
    ctx.reply("holy momy fucking shit :)")
})

//launch server
>>>>>>> 8472e9b6e8a4e3b876cb799a342f0ad69b4190eb
bot.launch();