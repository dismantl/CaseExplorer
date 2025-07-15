#!/bin/sh

if [ $FLASK_ENV = "production" ]; then
    echo "Starting API in production mode..."
    gunicorn -b 0.0.0.0:5000 -w 4 -k gthread --chdir /usr/src app:app
else
    echo "Starting API in development mode..."
    flask run -h 0.0.0.0
fi