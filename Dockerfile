FROM node:lts-alpine

# Install Python
# RUN apt-get update && apt-get install python -y
RUN apk add --no-cache python3 py3-pip

COPY package.json package.json
RUN npm install

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 8080

# Build the React app
RUN npm run build

ENTRYPOINT FLASK_APP=app.py flask run --host 0.0.0.0 --port 8080
