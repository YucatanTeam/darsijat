require('dotenv').config()

const express = require('express');
var telegraf = require ('telegraf');
const bot = new telegraf(process.env.TOKEN);
const con = require('./config/db');
const session = require('telegraf/session')

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

bot.start((ctx)=>{
  ctx.reply('Welcome')
});

bot.startPolling()
//launch server
bot.launch();

const app = express();



var PASSWORD = process.env.PASSWORD;
app.get("/admin", auth, express.static(path.join(__dirname, "admin")));
app.get("/login", express.static(path.join(__dirname, "login")));
app.post("/login", auth, req => req.res.json({status: 1}));
app.post("/changePassword", auth, req => {
  PASSWORD = req.body.newpassword;
  req.res.json({status: 1});
  // TODO telegram notify admin that password has changed
})


app.listen(process.env.PORT);

function auth(req, res, next) {
  if(req.body.username === "admin" && req.body.password === PASSWORD) {
    next();
  } else {
    res.redirect("/login")
  }
}
