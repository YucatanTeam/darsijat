require('dotenv').config()

const express = require('express');
const body = require('body-parser');
const path = require('path');
var telegraf = require ('telegraf');
const session = require('telegraf/session')
const TelegrafInlineMenu = require('telegraf-inline-menu')
const bot = new telegraf(process.env.TOKEN);
const con = require('./config/db');

const mainMenu = new TelegrafInlineMenu(ctx => `سلام ${ctx.message.from.username}!`)
const fooMenu = new TelegrafInlineMenu('Foo Menu')
const barMenu = new TelegrafInlineMenu('Bar Menu')
mainMenu.setCommand('start')
mainMenu.submenu('Open Foo Menu', 'foo', fooMenu)
fooMenu.submenu('Open Bar Menu', 'bar', barMenu)
barMenu.simpleButton('Hit me', 'something', {
  doFunc: ctx => ctx.reply('As am I!')
})

bot.use(mainMenu.init())
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

bot.start((ctx)=> ctx.reply(`به بات جستجوی جزوه خوش آمدید, کلیدواژه های خود را وارد کرده
                             تا جزوه مورد نظر خود را برای خرید پیدا کنید!
                            `))

bot.startPolling()
//launch server
bot.launch();

const app = express();

var PASSWORD = require("./password.json");
app.use(body.urlencoded({extended: false}));
app.use(body.json());

app.get("/", req => req.res.send("ok"))
app.use("/login", express.static(path.join(__dirname, "login")));
app.use("/admin", auth, express.static(path.join(__dirname, "admin")));
app.post("/login", auth, req => req.res.json({status: 1}));
app.post("/changePassword", auth, (req, res) => {
  PASSWORD = req.body.newpassword;
  // TODO update password.json
  res.redirect("/login");
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
  if(req.body && req.body.password === PASSWORD) {
    next();
  } else if(req.query && req.query.p === PASSWORD) {
    next();
  } else {
    res.redirect("/login")
  }
}
