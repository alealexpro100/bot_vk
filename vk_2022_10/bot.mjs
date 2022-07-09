import axios from 'axios';
import VkBot from 'node-vk-bot-api';
import VkBotSession from 'node-vk-bot-api/lib/session.js';
import Markup from 'node-vk-bot-api/lib/markup.js';

// Data from environment
const token = process.env.VK_TOKEN;
const userToken = process.env.VK_USER_TOKEN;
const groupId = process.env.VK_GROUP_ID;

// Bot setup
const group_id = process.env.GROUP_ID;
const bot = new VkBot(token);
const session = new VkBotSession();


// Setup session data
bot.use(session.middleware());
var session_data= {};

bot.command('Звонок', async (ctx) => {
  var id=ctx.message.from_id;
  var link_call;
  axios.post("https://api.vk.com/method/messages.startCall?"
    +"access_token="+userToken
    +"&group_id="+groupId
  ).then(function (response) {
    link_call=response.data.join_link;
  });
  session_data[id].link_call=link_call;
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