#!/bin/sh

vim -c "set ro" -c "args ./*.html" -c "argdo syn off | hardcopy! >%:p.ps" -c "q"
vim -c "set ro" -c "args ./*.js" -c "argdo syn off | hardcopy! >%:p.ps" -c "q"
vim -c "set ro" -c "args ./lib/*.js" -c "argdo syn off | hardcopy! >%:p.ps" -c "q"
vim -c "set ro" -c "args ./test/*.js" -c "argdo syn off | hardcopy! >%:p.ps" -c "q"
vim -c "set ro" -c "args ./public/hanabi-client.js" -c "argdo syn off | hardcopy! >%:p.ps" -c "q"
vim -c "set ro" -c "args ./public/style.css" -c "argdo syn off | hardcopy! >%:p.ps" -c "q"

for f in *.ps; do pstopdf -p "$f"; done
rm *.ps

cd lib/

for f in *.ps; do pstopdf -p "$f"; done
rm *.ps

cd ../test/

for f in *.ps; do pstopdf -p "$f"; done
rm *.ps

cd ..

mkdir pdf_out
/System/Library/Automator/Combine\ PDF\ Pages.action/Contents/Resources/join.py -o ./pdf_out/joined.pdf ./*.pdf ./lib/*.pdf ./test/*.pdf

rm ./lib/*.pdf
rm ./test/*.pdf
rm *.pdf
