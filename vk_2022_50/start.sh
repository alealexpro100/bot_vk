#!/bin/bash

# Requries jq, ffmpeg, bash and curl
# Tested on Archlinux

# https://oauth.vk.com/oauth/authorize?client_id=8214638&display=page&redirect_uri=https://oauth.vk.com/blank.html&scope=video&response_type=token&v=5.131
export VK_USER_TOKEN="vk1.a.Px8Rb6aUCtU8XPIOmpeeyYCRoBOeliTy-r4Na4GFojxjXhm76zYl1ZyRD2k1MQF4BiY4LWFkLqcBTKTk9unDyQ071Si8izRV1mw6_BHyIvgkDMsTJEN320e34Z95NuqICKLNXE2u6nX2lE9AP1LWAZLkafKevc47JcPPBBWI3cferp8J-mG3UtQ8tQrY8CkN"
export VK_GROUP_ID="-94671991"
export VK_API_VER="5.131"
list=$(curl -X POST -d "" "https://api.vk.com/method/video.get?access_token=${VK_USER_TOKEN}&v=${VK_API_VER}&owner_id=${VK_GROUP_ID}" | jq -r '.response.items[] | {title: .title, image: .image[-1].url} | .title + "\t" + .image')

it=$((0))

rm -rf temp
mkdir temp
cd temp

while IFS=$'\t' read -r -a line; do
    echo "${line[0]}"
    curl -o file_$it.jpg "${line[1]}"
    convert -resize 1024X768 file_$it.jpg file_$it.png
    ffmpeg -nostdin -y -loop 1 -framerate 24 -t 5 -i file_$it.png -f lavfi -t 5 -i aevalsrc=0 -vf settb=1/24000 -video_track_timescale 24000 -c:v libx264 -pix_fmt yuv420p \
        -vf "drawtext=fontfile=/usr/share/fonts/TTF/OpenSans-Regular.ttf:text='${line[0]}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=(h-text_h)/2"  "file_$it.mp4"
    echo "file 'file_$it.mp4'" >> mylist.txt
    it=$((it+1))
done <<< "$list"
ffmpeg -f concat -i mylist.txt -c copy ../output.mp4