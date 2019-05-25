require('dotenv').config()

const express = require('express');
const path = require('path');
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

const USERNAME = process.env.USERNAME;
var PASSWORD = process.env.PASSWORD;

app.get("/admin", auth, express.static(path.join(__dirname, "admin")));
app.get("/login", express.static(path.join(__dirname, "login")));
app.post("/login", auth, req => req.res.json({status: 1}));
app.post("/changePassword", auth, req => {
  PASSWORD = req.body.newpassword;
  req.res.json({status: 1});
  // TODO telegram notify admin that password has changed
})

app.post("/file", auth, (req, res) => {
  // upload the file and tags
  // save the file and rename
  // add to db
})

app.get("/files", auth, (req, res) => {
  // list of all files
})

app.get("/file/:uid", (req, res) => {
  // if user(uid) bought redirect to bot and resend file
  // else redirect to idpay with callback /callback/:uid
})

app.get("/callback/:uid", (req, res) => {
  // if status = fail set transaction.status = 0
  // and bot.send failure to user(uid)
  // else set transaction.status = 1
  // and bot.send file to user(uid)
})



app.listen(process.env.PORT);

// TODO use passport
function auth(req, res, next) {
  if(req.body.username === USERNAME && req.body.password === PASSWORD) {
    next();
  } else if(req.query.u === USERNAME && req.query.p === PASSWORD) {
    next();
  } else {
    res.redirect("/login")
  }
}
