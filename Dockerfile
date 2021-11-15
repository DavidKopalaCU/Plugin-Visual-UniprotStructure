FROM node:lts-alpine

# Install Python
# RUN apt-get update && apt-get install python -y
RUN apk add --no-cache python3 py3-pip


COPY . .

EXPOSE 8080

# Build the React app
RUN npm install
RUN npm run build

RUN pip3 install -r requirements.txt

ENTRYPOINT FLASK_APP=app.py flask run --host 0.0.0.0 --port 8080
