import VkBot from 'node-vk-bot-api';
import VkBotSession from 'node-vk-bot-api/lib/session.js';
import fs from 'fs';

const token="46890da5f3e63cf2c3ac0b674f9f465ac8a305b6b4a612301dbb78103e3366b280d9b0fa4306730d930ec";

const bot = new VkBot(token);
const session = new VkBotSession();
const card_limit=98;

var words = ["empty"];
var session_data= {};

try {
  const data = fs.readFileSync('words.txt', 'UTF-8');
  const lines = data.split(/\r?\n/);
  lines.forEach((line) => {
      words.push(line.split(" "));
  });
} catch (err) {
  console.error(err);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function find_uniq(cards_num) {
  var pic_num=getRandomInt(1, cards_num.length);
  var pic_id=cards_num[pic_num];
  console.log(pic_id);
  var str=words[pic_id][getRandomInt(0, words[pic_id].length)];
  console.log(str);
  var uniq;
  for (var i=0; i<cards_num.length; i++) {
    for (var j=0; j<words[cards_num[i]].length; j++) {
      uniq=true;
      for (var k=0; k<words.length; k++) {
        if (k!=pic_id && words[k].includes(str)) {
          uniq=false;
          break;
        }
      }
      if (uniq)
        break;
      pic_num=i;
      pic_id=cards_num[i];
      str=words[pic_id][j];
    }
  }
  return {"word": str, "pic": pic_num+1};
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
  var cards_num=[];
  var id=ctx.message.from_id;
  if (session_data[id]==undefined) {
    console.log("New session");
    session_data[id]={};
    session_data[id].cards=[];
    session_data[id].score=0;
  }
  for (var i=0; i<5; i++) {
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
    cards_num.push(num);
  }
  var word=find_uniq(cards_num);
  console.log(word);
  session_data[id].word=word;
  ctx.reply("Какой карте подходит ключевое слово?\n"+"Слово: "+word["word"], cards);
  ctx.reply("Какой карте подходит ключевое слово?", cards);
});

bot.on(async (ctx) => {
  var id=ctx.message.from_id;
  if (session_data[id]===undefined) {
    ctx.reply("Сначала наберите команду Старт");
    return;
  }
  console.log(ctx.message.text);
  if (ctx.message.text===session_data[id].word["pic"]) {
    session_data[id].score+=3;
    ctx.reply("Верно! Счет: "+session_data[id].score);
  } else {
    ctx.reply("Неверно! Счет: "+session_data[id].score);
  }
});

bot.startPolling((err) => {
  if (err) {
    console.error(err);
  }
});