var Botkit = require('botkit');
var MongoUrl = process.env.MONGODB_URI || 'mongodb://db:27017/lunchbot';

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.VERIFICATION_TOKEN || !process.env.PORT) {
  console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
  process.exit(1);
}

var controller = Botkit.slackbot(
  {
    // interactive_replies: true, // tells botkit to send button clicks into conversations
    hostname: '0.0.0.0',
    storage: require('./lib/botkit-custom-mongo')(
      {
        collections: ['lunches'], // Add custom collections
        mongoUri: MongoUrl
      }
    )
  }
).configureSlackApp(
  {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scopes: ['bot','commands'],
  }
);

controller.setupWebserver(process.env.PORT,function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

// To avoid connecting to the RTM twice for the same team
var _bots = {};
function trackBot(bot) {
  _bots[bot.config.token] = bot;
}

controller.storage.teams.all(function(err,teams) {
  if (err) {
    throw new Error(err);
  }

  // To connect all teams with bots up to slack!
  for (var t  in teams) {
    if (teams[t].bot) {
      controller.spawn(teams[t]).startRTM(function(err, bot) {
        if (err) {
          console.log('Error connecting bot to Slack:',err);
        } else {
          trackBot(bot);
        }
      });
    }
  }
});

controller.on('create_bot',function(bot,config) {
  if (_bots[bot.config.token]) {
    // Do nothing. (online already)
  } else {
    bot.startRTM(function(err) {
      if (!err) {
        trackBot(bot);
      }

      bot.startPrivateConversation({user: config.createdBy},function(err,convo) {
        if (err) {
          console.log(err);
        } else {
          convo.say('Konnichiwa!! I am lunchbot that has just joined your team. :robot_face:');
          convo.say('Please /invite me to a channel to got lunch with me!');
        }
      });
    });
  }
});

// Handle events related to the websocket connection to Slack
controller.on('rtm_open',function(bot) {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close',function(bot) {
  console.log('** The RTM api just closed');
});

var SlackBot = require('./lib/slack_bot')(controller);

/*~~~~~~~~~~ MAIN START ~~~~~~~~~~*/

controller.hears('hello',['direct_message','direct_mention'],function(bot,message) {
  bot.reply(message, 'Hello. I am a bot. :robot_face:');
});

controller.hears('lunch',['direct_message','direct_mention'],function(bot,message) {
  if (message.text.match(/^\//)) return; // Avoid slash_command

  SlackBot.chooseLunch(bot, message);
});

controller.hears('favorite|favorites',['direct_message','direct_mention'],function(bot,message) {
  if (message.text.match(/^\//)) return; // Avoid slash_command

  SlackBot.favorites(bot, message);
});

controller.on('interactive_message_callback', function(bot, message) {
  if (message.token !== process.env.VERIFICATION_TOKEN) return;

  if (message.callback_id === 'lunch') {
    SlackBot.eat(bot, message, message.actions[0].name);
  }
});

controller.on('slash_command', function(bot, message) {
  if (message.token !== process.env.VERIFICATION_TOKEN) return;

  switch (message.text.split(' ')[0]) {
    case 'choose':
      SlackBot.chooseLunch(bot, message);
      break;
    case 'favorite':
    case 'favorites':
      SlackBot.favorites(bot, message);
      break;
    case 'help':
      var choose_help = '`/lunch choose` gives you choices of lunch.';
      var favorite_help = '`/lunch favorite` replys your team mates\' favorite foods.';
      var help_message = 'Use `/lunch` to have a lunch with lunchbot.'
        + '\n Available commands are:'
        + '\n • ' + choose_help
        + '\n • ' + favorite_help;
      bot.replyPrivate(message, help_message);
      break;
    default:
      bot.replyPrivate(message, 'Illegal command!! :ghost:\n');
      break;
  }
});

/*~~~~~~~~~~ MAIN END ~~~~~~~~~~*/
