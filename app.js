var telegraf = require ('telegraf');
const bot = new telegraf('780218594:AAFYGdHotytGkkBBE37C19YvKqFgIWR7zWs');



//on start text


bot.start(function(ctx){
    ctx.reply(`سلام ${ctx.message.from.first_name}`);
    console.log(ctx.message.from.first_name)
});



//launch server
bot.launch();