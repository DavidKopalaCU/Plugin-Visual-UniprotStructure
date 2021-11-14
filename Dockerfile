FROM synbiohub/docker-base-python:snapshot

COPY . .

EXPOSE 8080

RUN pip3 install -r requirements.txt

ENV FLASK_APP=app.py

CMD ["waitress-serve", "--port=8080", "app:app" ]
