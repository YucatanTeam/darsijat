
require('dotenv').config()
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

bot.start((ctx)=> ctx.reply('به بات جستجوی جزوه خوش آمدید, کلیدواژه های خود را وارد کرده تا جزوه مورد نظر خود را برای خرید پیدا کنید!'))

bot.startPolling()