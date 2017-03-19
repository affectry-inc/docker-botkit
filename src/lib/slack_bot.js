'use strict';

function SlackBot(controller) {
  var slack_bot = {};

  /**
   * @param bot
   * @param message
   * @return choices of lunch
   */
  slack_bot.chooseLunch = function(bot, message) {
    var lunches = {
      'text': 'Hello. This is lunch-bot.',
      'attachments': [{
        'title': 'What do you want to eat?',
        'text': 'Choose one.',
        'fallback': 'What do you want to eat?',
        'callback_id': 'lunch',
        'color': 'good',
        'actions': [
          {
            'type': 'button',
            'name': 'pizza',
            'text': 'Pizza'
          },
          {
            'type': 'button',
            'name': 'pasta',
            'text': 'Pasta'
          },
          {
            'type': 'button',
            'name': 'ramen',
            'text': 'Ramen'
          }
        ]
      }]
    };

    if (message.command) {
      bot.replyPublic(message, lunches);
    } else {
      bot.reply(message, lunches);
    }
  };

  /**
   * @param bot
   * @param message
   * @param food: pizza/pasta/ramen
   * @return what bot says
   */
  slack_bot.eat = function(bot, message, food) {
    var bot_says = 'Oh, you love ' + food + '?';
    switch (food) {
      case 'pizza':
        bot_says += ' I love Chicago ones! :pizza:';
        break;
      case 'pasta':
        bot_says += ' No Italians please. :spaghetti:';
        break;
      case 'ramen':
        bot_says += ' I can\'t sip noodles. :ramen:';
        break;
    }
    recordLunch(message.team.id, message.user, food)
    bot.replyInteractive(message, bot_says);
  };

  /**
   * @param bot
   * @param message
   * @return favorite foods of the team mates
   */
  slack_bot.favorites = function(bot, message) {
    var team_id = message.command ? message.team_id : message.team;
    var cond = {team_id: team_id};
    var sort = {user_id: 1};
    controller.storage.lunches.select(cond, sort, function(err, lunches) {
      if (err) {
        console.log(err);
      } else {
        var reply = {}
        if (lunches.length == 0) {
          reply = 'I never had a lunch with your team mates yet. :pizza:';
        } else {
          var fields = [];
          for (var i = 0; i < lunches.length; i++) {
            var lunch = lunches[i];
            var field = {
              'value': '<@' + lunch.user_id + '> loves ' + lunch.food + '.',
              'short': false
            }
            fields.push(field);
          }

          reply = {
            'attachments': [{
              'title': 'Your team mates\' favorite foods!!',
              'fallback': 'Your team mates\' favorite foods!!',
              'color': 'good',
              'mrkdwn_in': ['fields'],
              'fields': fields
            }]
          };
        }

        if (message.command) {
          bot.replyPublic(message, reply);
        } else {
          bot.reply(message, reply);
        }
      }
    });
  };

  /**
   * @param team_id: team id of user
   * @param user_id: user id of user
   * @param food: pizza/pasta/ramen
   * @return null
   */
  function recordLunch(team_id, user_id, food) {
    controller.storage.lunches.get('L' + team_id + user_id, function(err, lunch) {
      if (err) {
        console.log(err);
      } else {
        if (!lunch) {
          lunch = {};
          lunch.id = 'L' +team_id + user_id;
          lunch.team_id = team_id;
          lunch.user_id = user_id;
        }
        lunch.food = food;

        controller.storage.lunches.save(lunch);
      }
    });
  };

  return slack_bot;
}

module.exports = SlackBot;
