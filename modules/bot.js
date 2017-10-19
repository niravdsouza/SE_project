/*
#########################################################
                      References
https://github.com/slackapi/node-slack-sdk
#########################################################
*/
const { WebClient } = require('@slack/client');

const slackClientOptions = {};
if (process.env.SLACK_ENV) {
  slackClientOptions.slackAPIUrl = process.env.SLACK_ENV;
}
//Bot module
const bot = {
  web: new WebClient(process.env.SLACK_BOT_TOKEN, slackClientOptions),
  orders: {},

  //Initial question with options
  introduceToUser(userId) {
    this.web.im.open(userId)
      .then(resp => this.web.chat.postMessage(resp.channel.id, 'Good Morning!', {
        attachments: [
          {
            color: '#5A352D',
            title: 'We are starting with the standup\n',
            callback_id: 'standup:start',
            actions: [
              {
                name: 'Start',
                text: 'Start',
                type: 'button',
                value: 'standup:start',
              },
              {
                name: 'Snooze',
                text: 'Snooze',
                type: 'button',
                value: 'standup:snooze',
              },
              {
                name: 'Ignore',
                text: 'Ignore',
                type: 'button',
                value: 'standup:ignore',
              },
            ],
          },
        ],
      }))
      .catch(console.error);
  },
    handleDirectMessage(message) {
      this.introduceToUser(message.user);
      console.log("Message", message.user)
      
  },

  //Function to send any message to the user
  sendMessage(channel,text) 
  {
	// Send message using Slack Web Client
    var token = process.env.SLACK_API_TOKEN || ''
    var web = new WebClient(token);
    console.log(text);
    console.log(channel);
	this.web.chat.postMessage(channel, text, function(err, res) {
  if (err) {
    console.log('Error:', err);
  } else {
    console.log('Message sent: ', res);
  }
});
  }
}
module.exports = bot;