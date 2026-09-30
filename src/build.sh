#!/bin/sh
# Concatenates the source parts into the single-file artifact page.
cd "$(dirname "$0")" && cat 00_head.html 10_world.js 20_host.js 30_render.js 40_game.js 50_net.js 99_tail.html > ../index.html && wc -c ../index.html
