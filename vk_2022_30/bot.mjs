import axios from 'axios';

const userToken = process.env.VK_USER_TOKEN;
const groupId = process.env.VK_GROUP_ID;
const vkApiVer = process.env.VK_API_VER;

var last_process=[];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function iterate() {
  var data;
  await axios.post("https://api.vk.com/method/video.get?"
    +"access_token="+userToken
    +"&owner_id="+groupId
    +"&v="+vkApiVer
  ).then(function (response) {
    data=response.data.response.items;
  }).catch(function (error) {
    console.log(error);
  });
  var to_process=[];
  for (const item of data) {
    if (item.live===1)
      to_process.push(item.id);
  }
  to_process = to_process.filter( ( el ) => !last_process.includes( el ) );
  if (last_process.length<1) {
    console.log("First iteration!");
  } else {
    if (to_process.length>0) {
      for (const video in to_process)
        console.log("New video: https://vk.com/video"+groupId+"_"+to_process[video]);
    }
  }
  for (var i=0; i<data.length; i++) {
    last_process[i]=data[i].id;
  }
}

async function cycle() {
  while (true) {
    await sleep(1000*5);
    await iterate();
  }
}

cycle();