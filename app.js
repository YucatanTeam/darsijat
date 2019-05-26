require('dotenv').config()

var request = require('request');
const express = require('express');
const path = require('path')
const body = require('body-parser');
var telegraf = require ('telegraf');
const bot = new telegraf(process.env.TOKEN);
const con = require('./db.js');



bot.start((ctx)=> ctx.reply(`به بات جستجوی جزوه خوش آمدید, کلیدواژه های خود را وارد کرده
                             تا جزوه مورد نظر خود را برای خرید پیدا کنید!
                            `))
bot.help(function(ctx){
  ctx.reply(`به عنوان مثال :
  دین و زندگی یازدهم`)

})
bot.startPolling()
//launch server
bot.launch();

const app = express();

var PASSWORD = require("./password.json");
app.use(body.urlencoded({extended: false}));
app.use(body.json());

app.get("/", req => req.res.send("ok"))
app.use("/login", req => req.res.sendFile(path.join(__dirname, "./www/login.html")));

app.use("/admin", auth, req => req.res.sendFile(path.join(__dirname, "./www/admin.html")));

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
      // TODO
      console.log("send file to user from bot without payment process...")
    } else { // payment process
      con.query("SELECT * FROM files WHERE id = ? ", [req.params.fid], (err, row)=>{
        if(row.length){
          const order_id = `${req.params.fid}.${req.params.uid}.${Math.round(Math.random()*10e10).toString()}`
          var options = {
            method: 'POST',
            url: 'https://api.idpay.ir/v1.1/payment',
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': process.env.APITOKEN,
              'X-SANDBOX': 1,
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
              console.log(error)
              res.send("به درگاه متصل نشد!")
            } else{
              console.log(body.error_message)
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
    console.log("redirect to bot..")
})

// bank <-> idpay <-> we ..... :)
app.post("/callback", (req, res) => {
  // console.log(req.body.status)
  if(req.body.status == 10){
      
      const bodyit = {
        'id': req.body.id,
        'order_id': req.body.order_id,
      }
  
      var options = {
        method: 'POST',
        url: 'https://api.idpay.ir/v1.1/payment/verify',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.APITOKEN,
          'X-SANDBOX': 1,
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
            // TODO
            console.log("bot send file with track_id and other infos...")
            con.query("UPDATE transactions SET status = ?, track_id = ?, card_no = ?, hash_card_no = ?, date = ?, verify = ? WHERE order_id = ?",
            [body.status, body.track_id+"."+body.payment.track_id,body.payment.card_no, body.payment.hash_card_no, body.verify.date, 1, req.body.order_id], (err, row)=>{
              if(err) {
                // TODO
                console.log("bot tell khei to pm to dev")
              }
              res.end()
              // console.log(row)
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
