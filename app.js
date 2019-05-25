var telegraf = require ('telegraf');
const bot = new telegraf('780218594:AAFYGdHotytGkkBBE37C19YvKqFgIWR7zWs');
const con = require('./config/db');

//on start text


bot.start(function(ctx){
    
    console.log(typeof(ctx.message.from.id))
    con.query(`SELECT * FROM user WHERE mId = ?` , [`${ctx.message.from.id}`],function(err,row){     
      if(Object.entries(row).length === 0){
        con.query(`INSERT INTO user(isPayed,mId) VALUES(?,?)`,[0,ctx.message.from.id])
      }
      else{
  
      }
    })

});



//launch server
bot.launch();