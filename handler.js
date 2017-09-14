'use strict';

const processIntents = require('./processIntents');
module.exports.intents= (event, context, callback) => {
	
	console.log("event 1111::: "+JSON.stringify(event));

try {
    console.log('event.bot.name='+event.bot.name);
    //var response = processIntents(event);
    //callback(null, response);
    processIntents(event).then(response => {callback(null, response);});
  } catch (err) {
    callback(err);
  }

};

