#!/bin/bash
npm update && npm install
npm run build
cp public/bootstrap.min.css dist/
cp public/favicon.ico dist/

npm install serve -g
serve -s dist -l 4000
