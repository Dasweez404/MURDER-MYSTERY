#!/bin/sh
# Concatenates the source parts into the single-file artifact page.
cd "$(dirname "$0")" && cat 00_head.html 10_data.js 12_build.js 13_decor.js 20_host.js 25_bots.js 30_render.js 40_game.js 50_net.js 99_tail.html > ../index.html && wc -c ../index.html
