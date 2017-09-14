'use strict';

module.exports.delegate = function(sessionAttributes, slots) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'Delegate',
      slots
    }
  };
};

module.exports.elicitSlot = function(sessionAttributes, intentName, slots, slotToElicit, message) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'ElicitSlot',
      intentName,
      slots,
      slotToElicit,
      message:{contentType: 'PlainText', content: message}
    }
  };
};

module.exports.elicitSlotResponseCard = function(sessionAttributes, intentName, slots, slotToElicit, message,title,imgurl,buttons) {

  console.log("imgurl :::: "+imgurl);
  console.log("buttons :::: "+buttons);
  console.log("getResponseCards :: "+JSON.stringify(getResponseCards(title,imgurl,buttons)));
  return {
    sessionAttributes,
    dialogAction: {
      type: 'ElicitSlot',
      intentName,
      slots,
      slotToElicit,
      message:{contentType: 'PlainText', content: message},
      responseCard:getResponseCards(title,imgurl,buttons)
    }
  };
};


module.exports.close = function(sessionAttributes, fulfillmentState, message) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'Close',
      fulfillmentState,
      message:{contentType: 'PlainText', content: message}
    }
  };
};

module.exports.confirmIntent = function(sessionAttributes, intentName, slots, message) {
   console.log('Inside LEX reponse confirmIntent ..... '+message );
  return {
    sessionAttributes,
    dialogAction: {
      type: 'ConfirmIntent',
      intentName,
      slots,
      message:{contentType: 'PlainText', content: message}
    }
  };
};

function getResponseCards(title,imgurl,buttons)
{
  //return {"contentType":"application/vnd.amazonaws.card.generic","genericAttachments":[{"title":"Client Accounts List","buttons":[{"text":"EIP14531","value":"EIP14531"},{"text":"EIP14532","value":"EIP14532"},{"text":"EIP14533","value":"EIP14533"}]},{"title":"Client Accounts List","buttons":[{"text":"EIP912","value":"EIP912"},{"text":"EIP913","value":"EIP913"},{"text":"EIP914","value":"EIP914"}]}]};
  var genAttach = [];
  var genObj={};
  genObj.buttons=[];
  var cnt=0;
  for( var i=0 ; i<(buttons.length) ; i++ )
  {
    //genObj = {"buttons":buttons[ i ]};
    genObj.buttons[genObj.buttons.length] = buttons[ i ];

    cnt ++ 
    if( cnt%3 == 0 || i == buttons.length-1  )
    {
        genObj.title=title;
        genObj.imageUrl=process.env.respcardimg;
        genAttach[ genAttach.length ] = genObj;
        genObj={};
        genObj.buttons=[];
    }

  }

  console.log( "genAttach ::::::::::::: "+JSON.stringify(genAttach));
  
  return {
    "contentType":'application/vnd.amazonaws.card.generic',
    "genericAttachments":genAttach

  };
}