import VkBot from 'node-vk-bot-api';
import VkBotSession from 'node-vk-bot-api/lib/session.js';
import fs from 'fs';

const token="46890da5f3e63cf2c3ac0b674f9f465ac8a305b6b4a612301dbb78103e3366b280d9b0fa4306730d930ec";

const bot = new VkBot(token);
const session = new VkBotSession();
const card_limit=99;

var words = ["empty"];
var session_data= {};

try {
  const data = fs.readFileSync('words.txt', 'UTF-8');
  const lines = data.split(/\r?\n/);
  lines.forEach((line) => {
      words.push(line);
  });
} catch (err) {
  console.error(err);
}

function get_card(num) {
  //Count from 1
  var str="photo-213718186_457239"+
    ((100>16+num) ? "0" : "")+(16+num);
  console.log(str);
  return str;
}

bot.use(session.middleware());

bot.command('Старт', async (ctx) => {
  var cards=[];
  var id=ctx.message.from_id;
  if (session_data[id]==undefined) {
    console.log("New session");
    session_data[id]={};
    session_data[id].cards=[];
  }
  for (var i=0; i<5; i++) {
    if (session_data[id].length>card_limit) {
      ctx.reply("Нет больше карт. Сбрасываю количество карт.");
      session_data[id].cards=[];
      return;
    }
    var num;
    var cont=true;
    while (cont) {
      cont=false;
      num=Math.floor(Math.random() * (card_limit-1))+1;
      for (var j=0; j<session_data[id].length; j++) {
        if (session_data[id].cards[j]===num) {
          cont=true;
          break;
        }
      }
      if (!cont) {
        for (var j=0; j<cards.length; j++) {
          if (cards[j]===num) {
            cont=true;
            break;
          }
        }
      }
    }
    session_data[id].cards.push(num);
    cards.push(get_card(num));
  }
  //var word=find_uniq();
  ctx.reply(""+session_data[id].cards.length, cards);
});

bot.startPolling((err) => {
  if (err) {
    console.error(err);
  }
});