'use strict';

const lexResponses = require('./lexResponses');
const databaseManager = require('./databaseManager');

function buildFulfilmentResult(fullfilmentState, messageContent) {
  return {
    fullfilmentState,
    message: { contentType: 'PlainText', content: messageContent }
  };
}

function userRegistered(userId, shallregister) {

  console.log( " Inside function userRegistered @ @ ");
  return databaseManager.registerToDatabase(userId, shallregister).then(item => {
    return buildFulfilmentResult('Fulfilled', 'Thanks.. your user has been registered.');
  });
}

function userDeRegistered(userId, dounsubscribe) {

  console.log( " Inside function userDeRegistered @ @ ");
  return databaseManager.deregisterToDatabase(userId, dounsubscribe).then(item => {
    return buildFulfilmentResult('Fulfilled', 'Thanks.. your user has been deregistered.');
  });
}

function postOrder( userId, intentRequest )
{
    console.log( " Inside function postOrder @ @ ");
    return databaseManager.postOrderToDatabase(userId, intentRequest).then(item => {
      console.log("New Orderid is :: "+item.orderid);
    return buildFulfilmentResult('Fulfilled', 'Your order with order id '+item.orderid+' is posted successfully. Please use this orderid for all future references.');
  });
}

function rateUser(userId,intentRequest)
{
    console.log( " Inside function rateUser @ @ ");
    return databaseManager.rateUser(userId, intentRequest.currentIntent.slots.rating).then(item => {
    return buildFulfilmentResult('Fulfilled', 'Your rating is captured.');
  }); 
}

module.exports = function(intentRequest) {
  console.log("Inside Manage Fullfiment @ @");
  var intentname = intentRequest.currentIntent.name;
  var userId = intentRequest.userId;
  if( intentname == "RegisterUser" )
  { 
    var shallregister = "";
    if( intentRequest.currentIntent.slots.shallregister.toUpperCase() == "YES" || intentRequest.currentIntent.slots.shallregister.toUpperCase() == "YEP" || intentRequest.currentIntent.slots.shallregister.toUpperCase() == "YEAH" || intentRequest.currentIntent.slots.shallregister.toUpperCase() == "YEA" || intentRequest.currentIntent.slots.shallregister.toUpperCase() == "YO" )
        shallregister = "Yes";
      {
        return userRegistered(userId, shallregister).then(fullfiledOrder => {
            return lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', 'Thanks.. your user has been registered.');
        });
      }

     if( intentRequest.currentIntent.slots.shallregister == null ) 
     {
        if( intentRequest.currentIntent.slots.toberated.toUpperCase() == "YES" )
        {
            return rateUser(userId, intentRequest).then(fullfiledOrder => {
            return lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', 'Thanks for rating us.');
            });   
        }
        else
        {
            return lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', 'Thanks.. Good Bye.');
        }
     }

  }
  else if(  intentname == "UnsubscribeRegistration" )   
  {
      var dounsubscribe="";
      if( intentRequest.currentIntent.slots.dounsubscribe.toUpperCase() == "YES" || intentRequest.currentIntent.slots.dounsubscribe.toUpperCase() == "YEP" || intentRequest.currentIntent.slots.dounsubscribe.toUpperCase() == "YEAH" || intentRequest.currentIntent.slots.dounsubscribe.toUpperCase() == "YEA" || intentRequest.currentIntent.slots.dounsubscribe.toUpperCase() == "YO" )
        dounsubscribe = "Yes";    

      return userDeRegistered(userId, dounsubscribe).then(fullfiledOrder => {
      return lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', 'Thanks.. your user has been de registered.');
    });

  }
  else if(  intentname == "AddOrder" )   
  {
      return postOrder(userId, intentRequest).then(fullfiledOrder => {
      return lexResponses.close(intentRequest.sessionAttributes, fullfiledOrder.fullfilmentState, fullfiledOrder.message.content);
    });

  }

};
