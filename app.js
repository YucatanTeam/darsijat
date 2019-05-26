require('dotenv').config()

var request = require('request');
const express = require('express');
const path = require('path')
const body = require('body-parser');
var telegraf = require ('telegraf');
const bot = new telegraf(process.env.TOKEN);
const con = require('./db.js');
const fs = require('fs')
const tlg = require('telegraf/telegram')



 bot.start((ctx)=> ctx.reply(`به بات جستجوی جزوه خوش آمدید, کلیدواژه های خود را وارد کرده
                              تا جزوه مورد نظر خود را برای خرید پیدا کنید!
                             `))

bot.on("text",function(ctx){
  var msg = ctx.message.text
  if(msg[0] != "/"){
  ctx.reply("ina")
    con.query(`SELECT files.* FROM tags,files WHERE tags.files_id = files.id AND tags.tag LIKE ?`,[msg],function(err,rows){
      if(err){
        console.log(err)
      }
      else{
          for (var row of rows) {
          ctx.reply(`${process.env.HOST}/file/${row.id}/${ctx.message.from.id}`)
        }
      }
    })
  }
})
 bot.startPolling()
 //launch server
 bot.launch();

const app = express();

var PASSWORD = require("./password.json");
app.use(body.urlencoded({extended: false}));
app.use(body.json());

app.get("/", function(req,res){
  res.send("ok ")
})
app.use("/login", req => req.res.sendFile(path.join(__dirname, "./www/login.html")));

app.use("/admin", auth, req => req.res.sendFile(path.join(__dirname, "./www/admin.html")));

app.post("/login", auth, req => req.res.json({status: 1}));

app.post("/changePassword", auth, (req, res) => {
  PASSWORD = req.body.newpassword;
  // TODO update password.json
  res.redirect("/login");
  // TODO telegram notify admin that password has changed
})


var formidable = require('formidable'),
    http = require('http'),
    util = require('util');
    
app.post("/file", (req, res) => {

  var form = new formidable.IncomingForm();
  form.uploadDir = "./files/";
  form.keepExtensions = true;
  form.parse(req, function(err, fields, files) {
    if(fields.password == PASSWORD) {
      con.query("INSERT INTO files (name, amount, descr) VALUES(?, ?, ?)", [path.basename(files.file.path), parseInt(fields.amount), fields.desc], (err, row)=>{
        if(err){
          res.status(500).end("Internal Server Error!")
        } else {
          var fine = true;
          // TODO use mysql stmt syntax instead of for
          for(var tag of fields.tags.split(",")){
            con.query("INSERT INTO tags(files_id, tag) VALUES(?, ?)", [row.insertId, tag], (err, row) => {
              if(err) {
                console.log(err)
                fine = false;
              } else {
                console.log("done", tag)
              }
            })
          }
          setTimeout(e => {
            res.send(fine ?
              "<head><title>done</title><head><p>Done. go to <a href='/admin'>admin panel</a></p" :
              "<head><title>error</title><head><p>Error. go to <a href='/admin'>admin panel</a></p>");
          }, 2000);
        }
      })
    } else{
      res.redirect("/login")
    }
  });
})

app.get("/files", auth, (req, res) => {
  con.query("SELECT * FROM files", (err, files) => {
    if(err) {
      res.status(500).json({})
    } else {
      con.query("SELECT * FROM tags", (err, tags) => {
        if(err) {
          return res.status(500).json({});
        }
        for(var file of files) {
          file.tags = tags.filter(tag => tag.files_id == file.id);
        }
        return res.json(files);
      })
    }
  })
})

app.get("/delete/:id", auth, (req, res) => {
  const id = req.params.id;
  con.query("DELETE FROM tags WHERE files_id = ?", [id], (err, row) => {
    if(err) {
      console.log(err)
      res.send("<head><title>error</title><head><p>Error. go to <a href='/admin'>admin panel</a></p>")
    } else {
      con.query("DELETE FROM files WHERE id = ?", [id], (err, row) => {
        if(err) {
          console.log(err)
          res.send("<head><title>error</title><head><p>Error. go to <a href='/admin'>admin panel</a></p>")
        } else {
          res.send("<head><title>done</title><head><p>Done. go to <a href='/admin'>admin panel</a></p>")
        }
      })
    }
  })
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
              // console.log(error)
              res.send("به درگاه متصل نشد!")
            } else{
              // console.log(body.error_message)
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
          res.status(404).send("فایلی پیدا نشد")
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
          'X-API-KEY': process.env.APITOKEN,
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
            // sendig file here
            con.query(`SELECT * FROM files WHERE id = ?`, [body.order_id.split(".")[0]],function(err,rows){
              if(err){
                console.log(err)
              }
              else{
                const file = fs.readFileSync(`./files/${rows[0].name}`);
                bot.telegram.sendDocument(body.order_id.split(".")[1],{
                  source: file,
                  filename: `${rows[0].desc}.pdf`
                },[{caption:`${body.track_id}`}]).catch(console.log);
              }
            })

            //end
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

  if(req.body && req.body.password === PASSWORD) { // for POSTs
    return next();
  } else if(req.query && req.query.p === PASSWORD) { // for GETs
    return next();
  } else {
    res.redirect("/login")
  }
  
}
