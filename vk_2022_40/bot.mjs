import axios from 'axios';

const userToken = process.env.VK_USER_TOKEN;
const groupId = process.env.VK_GROUP_ID;
const videoId = process.env.VK_VIDEO_ID;
const regExp = process.env.REGEX;
const vkApiVer = process.env.VK_API_VER;

async function analyze_comments() {
  var data;
  await axios.post("https://api.vk.com/method/video.getComments?"
    +"access_token="+userToken
    +"&owner_id="+groupId
    +"&video_id="+videoId
    +"&v="+vkApiVer
  ).then(function (response) {
    data=response.data.response.items;
  }).catch(function (error) {
    console.log(error);
  });
  var to_process = data.filter( ( el ) => el.text.match(regExp) );
  console.log("Matched comments: "+to_process.length);
  for (var i=0; i<to_process.length; i++)
      console.log("Comment "+(i+1)+": "+to_process[i].text);
}

async function start() {
  await analyze_comments();
}

start();