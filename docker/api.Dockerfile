FROM python:3.9-buster

WORKDIR /usr/src/app
ENV FLASK_APP=/usr/src/app

COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir psycopg2

COPY server/app .

EXPOSE 5000

VOLUME /usr/src/app

COPY docker/api_start.sh /api_start.sh

ENTRYPOINT ["/api_start.sh"]