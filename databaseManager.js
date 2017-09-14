'use strict';

const uuidV1 = require('uuid/v1');
const AWS = require('aws-sdk');
const promisify = require('es6-promisify');
const _ = require('lodash');
const dynamo = new AWS.DynamoDB.DocumentClient();
const request = require('request');
const dateTime = require('node-datetime');
//const appacctoken="EAABtasT5EioBAO8Nhbe0dj1A12QsDw04HUYddEHNZBPImpXCRQiRXmr8PDKHdqiECZCHByhWGSXxZCdJaNtKsbZBP1QUZBUcuFc4OMXRdMR9qA5jvWZCtRY24snGZCLf9JV6ca9PyLpClfguw6EJQJFeEoDeuz8ZCM2QWr40CHN93AZDZD"; // store in dynamo db

module.exports.registerToDatabase = function(userid, shallregister) {
  console.log('Inside registerToDatabase @@ ');
   console.log('process.env.appacctoken @@ '+process.env.appacctoken); 
  const item = {};
  //item.orderId = uuidV1();
  
  var fburl = "https://graph.facebook.com/v2.6/"+userid+"?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token="+process.env.appacctoken;

  return Promise.resolve(request(fburl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log("User Profile Details "+body) // Print the google web page.

        var profilebody = JSON.parse(body);

        for(var key in profilebody)
        {
            console.log("key ::: "+key);  
            console.log("profilebody ::: "+profilebody[key]);
            item[key] = profilebody[key];
         }

        item.userid = userid;
        item.registered = shallregister;
        item.rating_available = "N";
        item.rating=null;
        console.log("Final item ::: "+JSON.stringify(item));
        return saveItemToTable('user_details', item);
     }
}))
  
  
};


module.exports.postOrderToDatabase = function(userid, intentRequest) {
  console.log('Inside postOrderToDatabase @@ ');
  const item = {};
  item.orderid = uuidV1();
  item.userid = userid;
  item.clientaccount = intentRequest.currentIntent.slots.clientaccount;
  item.security_code = intentRequest.currentIntent.slots.securities;
  item.transaction_type_code = intentRequest.currentIntent.slots.orderside;
  if( intentRequest.currentIntent.slots.ordertype == "amount" )
  {
    item.amount = intentRequest.currentIntent.slots.amount;
    item.quantity = "0";
  }
  else
  {
    item.amount = "0" ;
    item.quantity = intentRequest.currentIntent.slots.quantity; 
  }
  item.ordertype = intentRequest.currentIntent.slots.ordertype;

  var dt = dateTime.create();
  console.log("New Date is :: "+dt.now());
  dt.format('dd-mm-yyyy H:M:S');
  console.log("New formatted Date is :: "+dt.now());
  //item.orderdate = new Date(dt.now());
  item.orderdate = new Date(dt.now()).toUTCString()+"";
  item.orderstatus = "PND";
  
  return saveItemToTable('order_details', item);
};


module.exports.deregisterToDatabase = function(userid, dounsubscribe) {
  console.log('Inside deregisterToDatabase @@ ');
   console.log('process.env.appacctoken @@ '+process.env.appacctoken); 
  const item = {};
  item.userid = userid;
  return deleteItemFromTable('user_details', item);
  
};

/*module.exports.saveUserToDatabase = function(userId, coffeeType, coffeeSize) {
  console.log('saveUserToDatabase');

  const item = {};
  item.drink = coffeeType;
  item.size = coffeeSize;
  item.userId = userId;

  return saveItemToTable('coffee-user-table', item);
};*/

module.exports.isUserRegistered = function(userId) {
  console.log("Inside function isUserRegistered ::: "+userId);
  const params = {
    TableName: 'user_details',
    Key: {
      "userid":userId
    } 
  };
  
  const getAsync = promisify(dynamo.get, dynamo);

  return getAsync(params).then(response => {

    console.log("isEmpty ::: "+_.isEmpty(response));
    if (_.isEmpty(response)) {
      console.log('User with userId : '+userId+' not found.');
      return {};
    }
    return response.Item;
  });
};



module.exports.doesTransactionExists = function(userId) {
  console.log("Inside function doesTransactionExists ::: "+userId);
  const params = {
    TableName: "order_details",
    FilterExpression: "#userid = :userid_val",
    ExpressionAttributeNames: {
        "#userid": "userid",
    },
    ExpressionAttributeValues: { ":userid_val": userId }

};
  
  const getAsync = promisify(dynamo.scan, dynamo);
  return getAsync(params).then(response => {
    console.log("Inside callback ");
    return onScan(null,response,'orderid','orderid');
  });
};



/*module.exports.fetchClientAccounts = function(userId) {
  console.log("Inside function fetchClientAccounts ::: "+userId);
  const params = {
    TableName: 'client_acccounts',
    Key: {
      "userid":userId
    } 
  };
  
  const getAsync = promisify(dynamo.get, dynamo);

  return getAsync(params).then(responseclient_acccounts => {

    console.log("response ::: "+JSON.stringify(response));
    if (_.isEmpty(response)) {  
      console.log('No client accounts found for user '+userId);
      return {};
    }
    return response.Item;
  });
};*/


module.exports.fetchClientAccounts = function(userId) {
  console.log("Inside function fetchClientAccounts ::: "+userId);
  const params = {
    TableName: "client_acccounts",
    FilterExpression: "#userid = :userid_val",
    ExpressionAttributeNames: {
        "#userid": "userid",
    },
    ExpressionAttributeValues: { ":userid_val": userId }

};
  
  const getAsync = promisify(dynamo.scan, dynamo);
  return getAsync(params).then(response => {
    console.log("Inside callback ");
    return onScan(null,response,'client_account_id','client_account_id');
  });

};


module.exports.fetchSecurities = function() {
  console.log("Inside function fetchSecurities ::: ");
  const params = {
    TableName: "security_master",
};
  
  const getAsync = promisify(dynamo.scan, dynamo);
  return getAsync(params).then(response => {
    console.log("Inside callback ");
    return onScan(null,response,'security_code','security_name');
  });

};


module.exports.fetchTransTypes = function() {
  console.log("Inside function fetchTransTypes ::: ");
  const params = {
    TableName: "trans_type_master",
};
  
  const getAsync = promisify(dynamo.scan, dynamo);
  return getAsync(params).then(response => {
    console.log("Inside callback ");
    return onScan(null,response,'trans_type_code','trans_type_name');
  });

};

module.exports.fetchReasons = function() {
  console.log("Inside function fetchReasons ::: ");
  const params = {
    TableName: "reason_master",
};
  
  const getAsync = promisify(dynamo.scan, dynamo);
  return getAsync(params).then(response => {
    console.log("Inside callback ");
    return onScan(null,response,'reason_code','reson_desc');
  });

};



function onScan(err, data,itemcode,itemname) {
  var count = 0;
  var resArr=[];
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {        
        console.log("Scan succeeded.");
        data.Items.forEach(function(itemdata) {
          resArr[resArr.length] =  {"name":itemdata[itemname],"code":itemdata[itemcode]};
           //console.log("Item fetched @@@@@@@@@@@@:", ++count,JSON.stringify(itemdata));

        });

    }
    console.log("Scan succeeded resArr ."+resArr);
    return resArr
}

/*module.exports.fetchSecurities = function(currency) {
  console.log("Inside function fetchSecurities ::: ");
  const params = {
    TableName: 'security_master',
    Key: {
      "currency":"USD"
    } 
  };
  
  const getAsync = promisify(dynamo.get, dynamo);

  return getAsync(params).then(response => {

    console.log("isEmpty ::: "+_.isEmpty(response));
    if (_.isEmpty(response)) {
      console.log('No client accounts found for user '+userId);
      return {};
    }
    return response.Item;
  });
};*/


module.exports.rateUser = function (userid,rating)
{
  console.log("Inside function rateUser ::: "+userid);
  const params = {
    TableName: "user_details",
    Key: {
          userid : userid
        },
    UpdateExpression: "set rating_available = :rating_available , rating = :rating ",
    ExpressionAttributeValues:{
        ":rating_available":"Y",
        ":rating":rating
    },
    ReturnValues:"UPDATED_NEW"

  };

  const getAsync = promisify(dynamo.update, dynamo);

  return getAsync(params).then(response => {

        console.log('Update response .... '+JSON.stringify(response));
      return response
    });
  
  
};

function saveItemToTable(tableName, item) {
  console.log("Inside function saveItemToTable @@ ");
  const params = {
    TableName: tableName,
    Item: item
  };

  const putAsync = promisify(dynamo.put, dynamo);

  return putAsync(params)
    .then(() => {
      console.log('Saving item '+JSON.stringify(item));
      return item;
    })
    .catch(error => {
      Promise.reject(error);
    });
}

function deleteItemFromTable(tableName, item) {
  console.log("Inside function deleteItemFromTable @@ ");
  const params = {
    TableName: tableName,
    Key: {
      "userid":item.userid
    }
  };

console.log("params @@ "+JSON.stringify(params));
  const putAsync = promisify(dynamo.delete, dynamo);

  return putAsync(params)
    .then(() => {
      console.log('Deleting item '+JSON.stringify(item));
            var dt = dateTime.create();
            dt.format('dd-mm-yyyy H:M:S');
            var nitem = {};
            nitem.userid = item.userid;
            nitem.reason = intentRequest.currentIntent.slots.reason;
            nitem.unsubscribed_on = new Date(dt.now()).toUTCString()+"";
            saveItemToTable("unsubscribe_details",nitem);

      return item;
    })
    .catch(error => {
      Promise.reject(error);
    });
}

