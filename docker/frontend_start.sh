#!/bin/sh

if [ $NODE_ENV = "production" ]; then
    echo "Starting frontend in production mode..."
    caddy run -c /usr/src/app/Caddyfile
else
    echo "Starting frontend in development mode..."
    npm run start
fi