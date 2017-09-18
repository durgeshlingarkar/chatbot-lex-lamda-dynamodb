'use strict';

const DeRegisterUser = require('./DeRegisterUser');
const RegisterUser = require('./RegisterUser');
const AddOrder = require('./AddOrder');
const newsUpdates = require('./newsUpdates');
module.exports = function(intentRequest) {
	
	console.log('dispatch userId='+intentRequest.userId+', intentName='+intentRequest.currentIntent.name);
	const intentName = intentRequest.currentIntent.name;
	if (intentName === 'RegisterUser'){
		console.log(intentName + ' was called');
		return RegisterUser(intentRequest);
	}
	else if (intentName === 'UnsubscribeRegistration'){
		console.log(intentName + ' was called');
		return DeRegisterUser(intentRequest);
	}
	else if (intentName === 'AddOrder'){
		console.log(intentName + ' was called');
		return AddOrder(intentRequest);	
	}
	else if (intentName === 'NewHeadLines'){
		console.log(intentName + ' was called');
		return newsUpdates(intentRequest);	
	}
	
	throw new Error('Intent with name '+intentName+' not supported');
}