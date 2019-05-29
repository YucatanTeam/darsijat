require('dotenv').config()
process.env.NODE_ENV = process.env.NODE_ENV || "development";

var request = require('request');
var formidable = require('formidable')
const express = require('express');
const path = require('path')
const body = require('body-parser');
var telegraf = require ('telegraf');
const bot = new telegraf(process.env.TOKEN);
const con = require('./db.js');
const fs = require('fs')
const Fuse = require('fuse.js')

// global cache for search in tags
var fuse = null;
con.query("SELECT * FROM tags;", (err, rows) => {
  if(err) {
    console.error("unable to initialize search", err)
    process.exit(1);
  }
  fuse = new Fuse(rows, {
    keys: ["tag"],
    id: "files_id"
  });
});

bot.start((ctx)=> ctx.reply(`به بات جستجوی جزوه خوش آمدید,
                               کلیدواژه های خود را وارد کرده
                              تا جزوه مورد نظر خود را برای خرید پیدا کنید!
                             `))

bot.on("text",function(ctx){
  var msg = ctx.message.text
  if(msg[0] != "/"){
    var q = `SELECT * FROM files WHERE id in (${msg.split(" ").map(word => fuse.search(word)).flat().concat([-1]).join(", ")})`;
    con.query(q, (err,rows) => {
      if(err){
        ctx.reply("سرور موقتا در دسترس نیست")
      } else if(rows.length) {
        ctx.reply(`${rows.length} جزوه یافت شد`);
        for (var row of rows) {
          ctx.reply(`${row.descr}
          ${process.env.HOST}/file/${row.id}/${process.env.ADMIN_CHAT_ID}`);
        }
      } else { 
        ctx.reply("جزوه ای پیدا نشد!");
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

app.get("/", req => req.res.redirect(`https://t.me/${process.env.BOT_NAME}`))
app.use("/login", req => req.res.sendFile(path.join(__dirname, "./www/login.html")));

app.use("/admin", auth, req => req.res.sendFile(path.join(__dirname, "./www/admin.html")));

app.post("/login", auth, req => req.res.json({status: 1}));

app.post("/changePassword", auth, (req, res) => {
  const OLDPASSWORD = req.body.password
  const NEWPASSWORD = req.body.newpassword;

  if(OLDPASSWORD === PASSWORD){
      fs.writeFile ("./password.json", JSON.stringify(NEWPASSWORD), (err) => {
        if (err){
            res.send("<head><title>error</title><head><p>can't change. go to <a href='/admin'>admin panel</a></p>");
        } else{
          PASSWORD = NEWPASSWORD;
          const file = fs.readFileSync('./password.json');
          bot.telegram.sendDocument(process.env.ADMIN_CHAT_ID,{
            source: file,
            filename: "password.txt"
          },[]).catch(console.log);
          res.redirect("/login");
        }
      }
    );
  } else{
    telegram.sendMessage(process.env.ADMIN_CHAT_ID, 
      "تلاش ناموفق در تغییر پسوورد!"
      ).catch(console.log)
    res.send("<head><title>error</title><head><p>old password required. go to <a href='/admin'>admin panel</a></p>");
  }
})


    
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
          const query = `INSERT INTO tags(files_id, tag) VALUES ${fields.tags.split(",").map(tag => `(${row.insertId},${con.escape(tag)})`).join(',')}`;
          con.query(query, (err, row) => {
            res.send(`<head><title>${err ? "Error" : "Done"}</title><head><p>${err ? "Error" : "Done"}. go to <a href='/admin'>admin panel</a></p>`);
            con.query("SELECT * FROM tags;", (err, rows) => {
              fuse = new Fuse(rows, {
                keys: ["tag"],
                id: "files_id"
              });
            })
          })
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

app.get("/query", auth, (req, res) => {
  var msg = req.query.text
  // perform fuzzysearch for msg against tags
  var q = `SELECT * FROM files WHERE id in (${msg.split(" ").map(word => fuse.search(word)).flat().concat([-1]).join(", ")})`;
  con.query(q, (err,rows) => {
    if(err){
      console.log(err)
      return res.status(500).send("server error")
    }
    if(rows.length) {
      var reply = "";
      reply += `<span>${rows.length} جزوه یافت شد</span><br>`;
      for (var row of rows) {
        reply += `<span>${row.descr} ( <a href="${process.env.HOST}/file/${row.id}/${process.env.ADMIN_CHAT_ID}">خرید</a> )</span><br>`;
      }
      return res.json({reply});
    }
    return res.json({reply: "جزوه ای پیدا نشد!"});
  })
})

app.get("/delete/:id", auth, (req, res) => {
  const id = req.params.id;
  con.query("DELETE FROM tags WHERE files_id = ?", [id], (err, row) => {
    if(err) {
      console.log(err)
      res.send("<head><title>error</title><head><p>Error. go to <a href='/admin'>admin panel</a></p>")
    } else {
      con.query("SELECT * FROM tags;", (err, rows) => {
        if(err) {
          console.error("unable to initialize search")
          process.exit(1);
        }
        fuse = new Fuse(rows, {
          keys: ["tag"],
          id: "files_id"
        });
      });
      con.query("SELECT * FROM files WHERE id = ?", [id], (err, row) => {
        con.query("DELETE FROM files WHERE id = ?", [id], (err, arow) => {
          if(err) {
            console.log(err)
            res.send("<head><title>error</title><head><p>Error. go to <a href='/admin'>admin panel</a></p>")
          } else {
            fs.unlinkSync(path.join(__dirname, "./files/" + row[0].name));
            res.send("<head><title>done</title><head><p>Done. go to <a href='/admin'>admin panel</a></p>")
          }
        })
      })
    }
  })
})

app.get("/file/:fid/:uid", (req, res) => {
  const q = `SELECT * FROM transactions WHERE order_id LIKE CONCAT(?, '.%') AND verify = ${1}`
  con.query(q, [`${req.params.fid}.${req.params.uid}`], (err, tr)=>{
    if(tr.length){
      // send the file to user without payment process
      const file_id = req.params.fid
      con.query("SELECT * FROM files WHERE id = ?", [file_id], (err, fi)=>{
        if(fi.length){
          const chat_id = req.params.uid
          const file = fs.readFileSync(`./files/${fi[0].name}`);
            bot.telegram.sendDocument(chat_id,{
              source: file,
              filename: `${fi[0].descr}.pdf`
            },[{caption:`${tr.track_id}`}]).catch(console.log);
        } else{
          // tell user pm admin for the file , perhaps admin delete the file
          // and user want to take it cause she/he paid for it before!
          telegram.sendMessage(req.params.uid,`
              فایل مورد نظر پیدا نشد,
              لطفا با ادمین تماس بگیرید.
              این جزوه خریده داری شده است ! کد رهگیری شما :
          `, [{parse_mode: `<strong>${tr.track_id}</strong>`}]
            ).catch(console.log)
          res.status(404).send("فایل مورد نظر پیدا نشد!")
        }
      })
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
              'X-SANDBOX': process.env.NODE_ENV == "development",
            },
            body: {
              'order_id': order_id,
              'amount': row[0].amount,
              'desc': row[0].descr,
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
          res.status(404).send("فایل مورد نظر پیدا نشد!")
        }
      })
    }
  })
})

app.get("/callback", req => req.res.redirect(`https://t.me/${process.env.BOT_NAME}`));

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
          'X-SANDBOX': process.env.NODE_ENV == "development",
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
                  filename: `${rows[0].descr}.pdf`
                },[{caption:`${body.track_id}`}]).catch(console.log);
              }
            })

            //end
            con.query("UPDATE transactions SET status = ?, track_id = ?, card_no = ?, hash_card_no = ?, date = ?, verify = ? WHERE order_id = ?",
            [body.status, body.track_id+"."+body.payment.track_id,body.payment.card_no, body.payment.hash_card_no, body.verify.date, 1, req.body.order_id], (err, row)=>{
              if(err) {
                telegram.sendMessage(process.env.ADMIN_CHAT_ID, 
                  "مشکلی در سرور پیش آمده است , لطفا با تیم اجرایی تماس بگیرید!"
                  ).catch(console.log)
              }
              res.end()
              // console.log(row)
            })
          }
        }
      });
  } else res.end()
})




app.listen(process.env.PORT,e=>console.log(`listening to ${process.env.PORT}`));

function auth(req, res, next) {

  if(req.body && req.body.password === PASSWORD) { // for POSTs
    return next();
  } else if(req.query && req.query.p === PASSWORD) { // for GETs
    return next();
  } else {
    res.redirect("/login")
  }
  
}
