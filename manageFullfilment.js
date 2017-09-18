'use strict';

const lexResponses = require('./lexResponses');
const databaseManager = require('./databaseManager');
const request = require('request');
const promisify = require('es6-promisify');

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

function getNewsHeadLines(intentRequest)
{
   var newsurl = process.env.newsapiurl+"?source="+process.env.newsapisource+"&apiKey="+process.env.newsapikey;
     return Promise.resolve( request(newsurl, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    
                     console.log("body ::: "+body); 
                     console.log("response ::: "+JSON.stringify(response)) ;
                     var newsbody = JSON.parse(body);
                     var buttons = [];
                     var titles = [];

                    for(var key in newsbody)
                    {
                        if(key === "articles")
                        {
                          console.log("newsbody[key].length ::: "+newsbody[key].length);
                          for(var idx=0 ; idx<newsbody[key].length ; idx++ )
                          {
                            console.log("#### title ::: "+newsbody[key][idx].title);
                            titles[ titles.length ] = newsbody[key][idx].title;
                             buttons[ idx ] = {"text":newsbody[key][idx].title , "value":newsbody[key][idx].title};
                          }
                        }
                     }
                     if( buttons.length > 0 )
                     {
                       //return  {"title":"News Updates","imageurl":process.env.respcardimg,"buttons":buttons};
                       return lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', 'News Updated...');
                       //lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', 'Thanks.. your user has been registered.');
                       //console.log("I am here 2222222222222222222222222222 ::: ");
                       //return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', 'News updates generated'));
                    }
                     return lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', 'News Updated qqq...');
                     //var vOptions = {"title":"Amount/Quantity Based ","imageurl":process.env.respcardimg,"buttons":[{"text":"AMOUNT BASED","value":"amount"},{"text":"QUANTITY BASED","value":"quantity"}]} ; 
                    
                 }
            }));
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
  else if(  intentname == "NewHeadLines" )   
  {
    //return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', 'News updates generated'));
    return Promise.resolve(getNewsHeadLines(intentRequest).then(response => {
      console.log("Inside call back *&*&*&*&*&*&*& "+JSON.stringify(response));
    
    }));
  }

};
