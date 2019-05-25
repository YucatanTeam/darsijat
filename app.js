require('dotenv').config()

var request = require('request');
const express = require('express');
const body = require('body-parser');
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

app.get("/file/:fid/:uid", (req, res) => {
  con.query("SELECT * FROM transactions WHERE order_id = ? AND verify = ?", [`${req.params.fid}.${req.params.uid}`, 0], (err, row)=>{
    if(row.length){
      // TODO send file to user from bot without payment process
    } else { // payment process
      con.query("SELECT * FROM files WHERE id = ? ", [req.params.fid], (err, row)=>{
        if(row.length){
          const order_id = `${req.params.fid}.${req.params.uid}.${Math.round(Math.random()*10e10).toString()}`
          var options = {
            method: 'POST',
            url: 'https://api.idpay.ir/v1.1/payment',
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': '6a7f99eb-7c20-4412-a972-6dfb7cd253a4', // TODO
              'X-SANDBOX': 1, // TODO
            },
            body: {
              'order_id': order_id,
              'amount': row[0].amount,
              'desc': row[0].desc,
              'callback': `${process.env.HOST}/callback/`,
            },
            json: true,
          };
          
          request(options, function (error, response, body) {
            if (error) {
              res.send("به درگاه متصل نشد!")
            } else{
              if(body.error_code) res.send("به درگاه متصل نشد!")
              else{
                con.query("INSERT INTO transactions(id, order_id, amount, verify) VALUES(?,?,?,?) ", [body.id, order_id, row[0].amount, 0], (err, row)=>{
                  if(err) {
                    res.status(500).send("server error!")
                  } else{
                      res.redirect(body.link)
                  }
                })
              }
            }
         })
        } else{
          res.status(404).send("فایل پیدا نشد")
        }
      })
    }
  })
})

app.get("/callback", (req, res)=>{
    // TODO redirect to bot
})

// we are talking to bank..... :)
app.post("/callback", (req, res) => {

  if(req.body.status == 100){
      
      const bodyit = {
        'id': req.body.id,
        'order_id': req.body.order_id,
      }
  
      var options = {
        method: 'POST',
        url: 'https://api.idpay.ir/v1.1/payment/verify',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': '6a7f99eb-7c20-4412-a972-6dfb7cd253a4', // TODO
          'X-SANDBOX': 1, // TODO
        },
        body: bodyit,
        json: true,
      };
      
      request(options, function (error, response, body) {
        if (error) {
          res.end()
        } else{
          if(body.error_code){
            res.end()
          } else {
            // TODO bot send file with track_id and other infos
            con.query("UPDATE transactions SET status = ?, track_id = ?, card_no = ?, hash_card_no = ?, date = ?, verify = ? WHERE order_id = ?",
            [body.status, body.track_id+"."+body.payment.track_id,body.payment.card_no, body.payment.hash_card_no, body.verify.date, 1, req.params.ufid], (err, row)=>{
              if(err) {
                // TODO bot tell khei to pm to dev
              }
              res.end()
            })
          }
        }
      });
  } else res.end()
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
