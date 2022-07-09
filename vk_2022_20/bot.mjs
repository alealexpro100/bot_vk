import axios from 'axios';
import VkBot from 'node-vk-bot-api';
import VkBotSession from 'node-vk-bot-api/lib/session.js';
import Markup from 'node-vk-bot-api/lib/markup.js';

// Data from environment
const token = process.env.VK_TOKEN;
const userToken = process.env.VK_USER_TOKEN;
const groupId = process.env.VK_GROUP_ID;
const operatorIds = process.env.VK_OPERATOR_IDS.split(" ");

// Bot setup
const group_id = process.env.GROUP_ID;
const bot = new VkBot(token);
const session = new VkBotSession();

// Setup session data
bot.use(session.middleware());
var session_data= {};

// Data of operators
var operators_data = {};
for (const operatorId of operatorIds) {
  operators_data[operatorId] = {};
  operators_data[operatorId].is_busy=0;
}

// Useful functions
function getOperatorFree() {
  operators_data.sort((a,b) => a.is_busy - b.is_busy);
  for (const operatorId of operatorIds) {
    if (session_data[operatorId].is_busy===0) {
      return operatorId;
    }
  }
  return null;
}

function startCall(operatorId) {
  operatorId.is_busy++;
  var link_call;
  axios.post("https://api.vk.com/method/messages.startCall", {
    params: {
      access_token: userToken,
      group_id: groupId
    }
  }).then(function (response) {
    link_call=response.data.join_link;
  });
  return link_call;
}

bot.command('Звонок', async (ctx) => {
  var id=ctx.message.from_id;
  if (!(session_data[id].link_call===undefined)) {
    ctx.reply("Вы уже звонили.");
    ctx.reply("Ваша ссылка (повторно): "+session_data[id].link_call);
    return;
  }
  var link_call=startCall();
  if (link_call===null)
    ctx.reply("Нет свободных операторов. Ожидайте.");
  else
    ctx.reply("Ваша ссылка: "+link_call);
});

bot.on(async (ctx) => {
  var id=ctx.message.from_id;
  if (session_data[id]===undefined) {
    session_data[id].stupid=true;
    ctx.reply("Сначала наберите команду Звонок", null, Markup
    .keyboard([
      Markup.button('Звонок', 'primary'),
    ]));
    return;
  }
  console.log(ctx.message.text);
});

bot.startPolling((err) => {
  if (err) {
    console.error(err);
  }
});