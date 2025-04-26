#!/bin/sh

./node_modules/.bin/prisma migrate deploy || exit 1

./node_modules/.bin/react-router-serve build/server/index.js
