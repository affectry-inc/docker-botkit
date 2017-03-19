# Dockerized Botkit with MongoDB

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE.md)

This repository includes basic elements to develop a Slack bot such as:
* Botkit
* MongoDB
* Docker w/ Compose
* Slash commands
* Action buttons

You may use this as a boilerplate for your new Slack bot app.

To get you started easily, this repo contains some logics that work as a lunch pal bot.
If you ask the bot `lunch?`, it asks you back what you want to eat.
Depends on what you reply, it goes or does not go with you.
You may know favorites foods of your team mates by asking the bot `favorites?`.

## For developers
### Setup a local dev environment on Docker
#### 1. Create a new Slack app
Create new app at [Slack apps](https://api.slack.com/apps) page.

Add the Redirect URL: `http://localhost:${PORT}/oauth` at the OAuth setting.

#### 2. Fill in .env file
Set PORT as you like.

Obtain CLIENT_ID, CLIENT_SECRET and VERIFICATION_TOKEN at the Basic Information page of your Slack app.

#### 3. Docker build
```
$ docker-compose build
```

#### 4. Start app
```
$ docker-compose up
```

### Setup bot app on Heroku
#### 1. Create a new Slack app
Create new app at [Slack apps](https://api.slack.com/apps) page.

Add the Redirect URL: `https://${APP_NAME}.herokuapp.com/oauth` at the OAuth setting.

Add the Request URL: `https://${APP_NAME}.herokuapp.com/slack/receive` at the Interactive Messages setting.

Add slash commands with the above Request URL above at the Slash Commands setting.

#### 2. Tracking new app in git
Initiate your app in git.
```
$ git init
$ git add .
$ git commit -m "initial commit"
```

#### 3. Deploy and run app on Heroku
Go to the [dashboard](https://dashboard.heroku.com) or follow the commands below.

```
$ heroku login
$ heroku create ${APP_NAME}
$ heroku addons:create mongolab:sandbox
$ heroku config:set CLIENT_ID=${YOUR_CLIENT_ID}
$ heroku config:set CLIENT_SECRET=${YOUR_CLIENT_SECRET}
$ heroku config:set VERIFICATION_TOKEN={$YOUR_VERIFICATION_TOKEN}
$ git push heroku master
```

#### 4. Install the app into your team
Add the app to your team by visiting `https://${APP_NAME}.herokuapp.com/login`.


### Dev tips
#### To use custom db name
Set MongoUrl at the beginning of src/index.html with your db name like `mongodb://db:27017/${DB_NAME}`

#### To use custom collectsions
Add custom collections to the collections array of the storage attribute at the beginning of src/index.html.

#### To access MongoDB from host
The port 27017 is forwarded. Then just access as usual.
```
$ mongo
```

#### To execute `npm install`
Login to app container first, then execute.
```
$ docker-compose run --rm app /bin/bash
app@XXXXXXXXX: ~/bot$ npm install
app@XXXXXXXXX: ~/bot$ exit
```

## License
This software is released under the [MIT license](LICENSE.md).
