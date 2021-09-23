FROM python:3.7-buster

WORKDIR /usr/src/app
ENV FLASK_APP=/usr/src/app

COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir psycopg2

COPY server/app .

CMD ["flask", "--help"]