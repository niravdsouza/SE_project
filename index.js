/*
#########################################################
                      References
https://github.com/slackapi/sample-message-menus-node
https://api.slack.com/
https://docs.npmjs.com/files/package.json
#########################################################
*/
require('dotenv').config();

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const normalizePort = require('normalize-port');

const slackEventsAPI = require('@slack/events-api');
const slackInteractiveMessages = require('@slack/interactive-messages');

const cloneDeep = require('lodash.clonedeep');
const bot = require('./modules/bot');
var sched = require('node-cron');


// --- Slack Events ---
const slackEvents = slackEventsAPI.createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);
/* Not needed for now
slackEvents.on('team_join', (event) => {
  bot.introduceToUser(event.user.id);
});
*/
//------Replace by scheduling code------ 

// Scheduling code created
sched.schedule('0 9 * * 1,2,3,4,5', function(){
  //console.log('running a task every minute');
  //condoel.log("Test");
  //bot.sendMessage("D7JBPKD8B","Calvin is awesome");
  bot.sendMessage("D7JBPKD8B",bot.introduceToUser("U6WEA6ULA"))
});


slackEvents.on('message', (event) => {
  console.log("Event Received");
  // Filter out messages from this bot itself or updates to messages
  if (event.subtype === 'bot_message' || event.subtype === 'message_changed') {
    return;
  }
  bot.handleDirectMessage(event);
});

// --- Slack Interactive Messages ---
const slackMessages =
  slackInteractiveMessages.createMessageAdapter(process.env.SLACK_VERIFICATION_TOKEN);

// Helper functions

function findAttachment(message, actionCallbackId) {
  return message.attachments.find(a => a.callback_id === actionCallbackId);
}

function acknowledgeActionFromMessage(originalMessage, actionCallbackId, ackText) {
  const message = cloneDeep(originalMessage);
  const attachment = findAttachment(message, actionCallbackId);
  delete attachment.actions;
  attachment.text = `:white_check_mark: ${ackText}`;
  return message;
}

function findSelectedOption(originalMessage, actionCallbackId, selectedValue) {
  const attachment = findAttachment(originalMessage, actionCallbackId);
  return attachment.actions[0].options.find(o => o.value === selectedValue);
}

// Action handling

slackMessages.action('standup:start', (payload, respond) => {
  // Create an updated message that acknowledges the user's action (even if the result of that
  // action is not yet complete).
  var optionName = payload.actions[0].name;
  console.log(optionName);
  console.log(payload);
  const channel = payload.channel.id;
  console.log(payload.channel);
  
  if (optionName=="Start")
  {
      var updatedMessage = acknowledgeActionFromMessage(payload.original_message, 'standup:start',
                                                      'I\'m getting the standup started.');
    
  }
   else if (optionName=="Snooze")
  {
      var updatedMessage = acknowledgeActionFromMessage(payload.original_message, 'standup:start',
                                                      'I will remind you in 15 minutes');
  }
   else
  {
      var updatedMessage = acknowledgeActionFromMessage(payload.original_message, 'standup:start',
                                                      'See you tomorrow');
  }
  console.log(updatedMessage);
  return updatedMessage;
});

// Create the server to listen for events
const port = normalizePort(process.env.PORT || '3000');
const app = express();
app.use(bodyParser.json());
app.use('/slack/events', slackEvents.expressMiddleware());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/slack/actions', slackMessages.expressMiddleware());
// Start the server
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});