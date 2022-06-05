import VkBot from 'node-vk-bot-api';
import VkBotSession from 'node-vk-bot-api/lib/session.js';
import Markup from 'node-vk-bot-api/lib/markup.js';
import fs from 'fs';

const token="46890da5f3e63cf2c3ac0b674f9f465ac8a305b6b4a612301dbb78103e3366b280d9b0fa4306730d930ec";

const bot = new VkBot(token);
const session = new VkBotSession();
const card_limit=98;

var words = [[]];
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
  var pic_num=getRandomInt(0, cards_num.length-1);
  var pic_id=cards_num[pic_num];
  console.log(pic_id);
  var str=words[pic_id][getRandomInt(0, words[pic_id].length-1)];
  console.log(str);
  var uniq;
  for (var i=1; i<cards_num.length-1; i++) {
    for (var j=1; j<words[cards_num[i]].length-1; j++) {
      uniq=true;
      for (var k=1; k<cards_num.length-1; k++) {
        if (cards_num[k]!=pic_id && words[cards_num[k]].includes(str)) {
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
    session_data[id].done=false;
  } else {
    console.log("Session continued");
    session_data[id].done=false;
  }
  for (var i=0; i<5; i++) {
    var num;
    var cont=true;
    while (cont) {
      cont=false;
      num=Math.floor(Math.random() * (card_limit-1))+1;
      if (session_data[id].cards.includes(num)) {
        cont=true;
      }
      if (!cont) {
        if (cards.includes(num)) {
          cont=true;
        }
      }
    }
    session_data[id].cards.push(num);
    cards.push(get_card(num));
    cards_num.push(num);
  }
  console.log(cards_num);
  var word=find_uniq(cards_num);
  console.log(word);
  session_data[id].word=word;
  ctx.reply("Какой карте подходит ключевое слово?\n"+"Слово: "+word["word"], cards, Markup
  .keyboard([
    Markup.button('1', 'primary'),
    Markup.button('2', 'primary'),
    Markup.button('3', 'primary'),
    Markup.button('4', 'primary'),
    Markup.button('5', 'primary')
  ]));
});

bot.command('/mood', (ctx) => {
  ctx.reply('How are you doing?', null, Markup
    .keyboard([
      [
        Markup.button('Normally', 'primary'),
      ],
      [
        Markup.button('Fine', 'positive'),
        Markup.button('Bad', 'negative'),
      ],
    ]));
});

bot.on(async (ctx) => {
  var id=ctx.message.from_id;
  if (session_data[id]===undefined || session_data[id].done) {
    ctx.reply("Сначала наберите команду Старт", null, Markup
    .keyboard([
      Markup.button('Старт', 'primary'),
    ]));
    return;
  }
  console.log(ctx.message.text);
  if (ctx.message.text==session_data[id].word["pic"]) {
    session_data[id].score+=3;
    session_data[id].done=true;
    ctx.reply("Верно! Счет: "+session_data[id].score, null, Markup
    .keyboard([
      Markup.button('Старт', 'primary'),
    ]));
  } else {
    session_data[id].done=true;
    ctx.reply("Неверно! Счет: "+session_data[id].score, null, Markup
    .keyboard([
      Markup.button('Старт', 'primary'),
    ]));
  }
});

bot.startPolling((err) => {
  if (err) {
    console.error(err);
  }
});