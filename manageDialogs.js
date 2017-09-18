'use strict';

const lexResponses = require('./lexResponses');
const databaseManager = require('./databaseManager');
const _ = require('lodash');


module.exports = function(intentRequest) {

	var intentname = intentRequest.currentIntent.name;
	if( intentname == "RegisterUser")
	{
		console.log('intentRequest.currentIntent.slots.shallregister 11111 ::: '+intentRequest.currentIntent.slots.shallregister);
		var shallregister = intentRequest.currentIntent.slots.shallregister;
		const slots = intentRequest.currentIntent.slots;
		
		return databaseManager.isUserRegistered(intentRequest.userId).then(responseObj => {
			console.log('responseObj :::::::::: '+JSON.stringify(responseObj));
			console.log('if cond :::::::::: '+( responseObj.userid &&  responseObj.registered.toUpperCase() == "YES" ));
			if( responseObj.userid &&  responseObj.registered.toUpperCase() == "YES" )
			{
				if( responseObj.rating_available == "Y" )
				{
					return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, "Fulfilled","Hello "+responseObj.first_name+" "+responseObj.last_name+" you have a subscription for credence's chatbot services. How may i help you ?"));	
				}
				else
				{
						return databaseManager.doesTransactionExists(intentRequest.userId).then(respObj =>{
							console.log("After doesTransactionExists respObj.length :: "+respObj.length);
							if( respObj.length > 0 )
							{
									if( slots.toberated == null )
									{
										var vOptions = {"title":"Rate App","imageurl":"","buttons":[{"text":"Rate Now","value":"Yes"},{"text":"Remind me later","value":"No"}]};

											return Promise.resolve(lexResponses.elicitSlotResponseCard(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "toberated", "Hello "+responseObj.first_name+" "+responseObj.last_name+". Do you want to rate credence's chat bot ?",vOptions.title,vOptions.imageurl,vOptions.buttons));

										//return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "toberated", "Do you want to rate credence's chat bot ?"));
									}
									else if( slots.toberated.toUpperCase() == "NO" || slots.toberated.toUpperCase() == "NA" || slots.toberated.toUpperCase() == "NOPE" || slots.toberated.toUpperCase() == "NOOOO")	
									{
										return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, "Fulfilled","You have a subscription for credence's chatbot services. How may i help you ?"));	
									}
									else if( slots.toberated.toUpperCase() == "YES" || slots.toberated.toUpperCase() == "YEP" || slots.toberated.toUpperCase() == "YEAH" || slots.toberated.toUpperCase() == "YEA" || slots.toberated.toUpperCase() == "YO" )
									{
										if(slots.rating == null )
										{
											
											var vOptions = {"title":"Ratings List","imageurl":"","buttons":[{"text":"1 Star ","value":"1"},{"text":"2 Stars","value":"2"},{"text":"3 Stars","value":"3"},{"text":"4 Stars","value":"4"},{"text":"5 Stars","value":"5"}]};

											return Promise.resolve(lexResponses.elicitSlotResponseCard(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "rating", "Please select ratings from below list.",vOptions.title,vOptions.imageurl,vOptions.buttons));	

											
										}
										else
										{

											return databaseManager.rateUser(intentRequest.userId, slots.rating).then(item => {
    											return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, "Fulfilled","Thank you for rating us.  How may i help you ?"));
  											});	

											
											//return Promise.resolve(lexResponses.delegate(intentRequest.sessionAttributes, slots));
										}
									}
							}

						});	
				}
			}
			else
				{
					if( shallregister == null )
						return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "shallregister", "Hello! Greetings from credence. Do you want to register with credence chat bot ?"));
							
					else if( shallregister.toUpperCase() == "NO" || shallregister.toUpperCase() == "NA" || shallregister.toUpperCase() == "NOPE" || shallregister.toUpperCase() == "NOOOO")
						return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, "Fulfilled","Ok. Good Bye!! Have a nice day."));
							 
					else if( shallregister.toUpperCase() == "YES" || shallregister.toUpperCase() == "YEP" || shallregister.toUpperCase() == "YEAH" || shallregister.toUpperCase() == "YEA" || shallregister.toUpperCase() == "YO")
						return Promise.resolve(lexResponses.delegate(intentRequest.sessionAttributes, slots));

					else
						return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "shallregister", "Sorry couldnt understand. Do you want to register with credence chat bot ?"));

				}
			
		});
	
	}
	else if( intentname == "UnsubscribeRegistration" )
	{
		console.log('intentRequest.currentIntent.slots.dounsubscribe 11111 ::: '+intentRequest.currentIntent.slots.dounsubscribe);
		var dounsubscribe = intentRequest.currentIntent.slots.dounsubscribe;
		var reason = intentRequest.currentIntent.slots.reason;
		const slots = intentRequest.currentIntent.slots;
		return databaseManager.isUserRegistered(intentRequest.userId).then(responseObj => {
			console.log('responseObj :::::::::: '+JSON.stringify(responseObj));
			console.log('if cond :::::::::: '+( responseObj.userid &&  responseObj.registered.toUpperCase() == "YES" ));
			if( responseObj.userid &&  responseObj.registered.toUpperCase() == "YES" )
			{
				console.log("dounsubscribe ::: "+dounsubscribe);
				if( dounsubscribe == null )
					return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "dounsubscribe", "Hello "+responseObj.first_name+" "+responseObj.last_name+". Do you want to unsubscribe from credence chat bot ?"));
				else if( dounsubscribe.toUpperCase() == "NO" || dounsubscribe.toUpperCase() == "NA" || dounsubscribe.toUpperCase() == "NOPE" ||dounsubscribe.toUpperCase() == "NOOOO")
					return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, "Fulfilled","Ok. Good Bye!! Have a nice day."));
				else if ( dounsubscribe.toUpperCase() == "YES" || dounsubscribe.toUpperCase() == "YEP" || dounsubscribe.toUpperCase() == "YEAH" || dounsubscribe.toUpperCase() == "YEA" || dounsubscribe.toUpperCase() == "YO" )
				{	

					if( reason == null )	
					{
						return databaseManager.fetchReasons().then(respObj =>{
							console.log("respObj :: "+respObj);
							var vOptions = getOptions("Reason List",respObj);
							console.log("vOptions :: "+JSON.stringify(vOptions));

							return Promise.resolve(lexResponses.elicitSlotResponseCard(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "reason", "Please select reason from below list.",vOptions.title,vOptions.imageurl,vOptions.buttons));	

						});

					}
					else
						return Promise.resolve(lexResponses.delegate(intentRequest.sessionAttributes, slots));
				}
				else
					return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "dounsubscribe", "Sorry couldnt understand. Do you want to unsubscribe from credence chat bot ?"));	
				
			}
			else
				return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, "Your user is not registered with credence's chatbot service. Thanks.. Good bye."));

			
			
		});
	}
	else if( intentname == "AddOrder" )
	{
		console.log("intentname is ############# "+intentname);
		return databaseManager.isUserRegistered(intentRequest.userId).then(responseObj => {
			if( responseObj.userid &&  responseObj.registered.toUpperCase() == "YES" )
			{
				console.log("intentRequest ::: "+JSON.stringify(intentRequest));
				const slots = intentRequest.currentIntent.slots;
				var clientaccount = slots.clientaccount;
				var securities = slots.securities;
				var orderside = slots.orderside;
				var ordertype = slots.ordertype;
				var amount = slots.amount;
				var quantity = slots.quantity;
				
				if( clientaccount == null )
				{
					//return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "clientaccount", "For which client account would you like to place order ?"));

					return databaseManager.fetchClientAccounts( responseObj.userid ).then(respObj =>{
							console.log("respObj :: "+respObj);
							var vOptions = getOptions("Client Accounts List",respObj);
							console.log("vOptions :: "+JSON.stringify(vOptions));

							//vOptions = {"title":"Client Accounts List","imageurl":"","buttons":[{"text":"EIP14531","value":"EIP14531"},{"text":"EIP14532","value":"EIP14532"},{"text":"EIP14542","value":"EIP14542"},{"text":"EIP14552","value":"EIP14552"}]}

							//return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "clientaccount", "For which client account would you like to place order ?"));

							return Promise.resolve(lexResponses.elicitSlotResponseCard(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "clientaccount", "Please select client account from below list.",vOptions.title,vOptions.imageurl,vOptions.buttons));	

					});
					
					
					//return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "clientaccount", "For which client account would you like to place order ?"));
				}

				else if ( securities == null )
				{
					var validClientAcc = false;
					return databaseManager.fetchClientAccounts( responseObj.userid ).then(respObj =>{
							_.forEach(respObj, option => {
										console.log("code @@@@@ "+option["code"]);
										console.log("clientaccount @@@@@ "+clientaccount);
										if( option["code"] == clientaccount )
											validClientAcc = true;
										
									});

							console.log("validClientAcc @@@@@ "+validClientAcc);	
							if( validClientAcc )
							{
								console.log("Inside here 11 @@@@@ ");	
										return databaseManager.fetchSecurities().then(respObj =>{
													console.log("respObj :: "+respObj);
													var vOptions = getOptions("Security List",respObj);
													console.log("vOptions :: "+JSON.stringify(vOptions));

													return Promise.resolve(lexResponses.elicitSlotResponseCard(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "securities", "Please select security from below list.",vOptions.title,vOptions.imageurl,vOptions.buttons));	

											});
							}
							else
							{
								console.log("Inside here 22 @@@@@ ");	
								var vOptions = getOptions("Client Accounts List",respObj);
								return Promise.resolve(lexResponses.elicitSlotResponseCard(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "clientaccount", "Invalid input. Please select client account from below list.",vOptions.title,vOptions.imageurl,vOptions.buttons));
							}
					});

					
					

					//return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "securities", "In what security would you like to place the order ?"));
				}

				else if ( orderside == null )
				{
					var validSecurity = false;
					return databaseManager.fetchSecurities().then(respObj =>{
										_.forEach(respObj, option => {
												if( option["code"] == securities )
													validSecurity = true;
												
										});

										if( validSecurity )
										{
												return databaseManager.fetchTransTypes().then(respObj =>{
															console.log("respObj :: "+respObj);
															var vOptions = getOptions("Transaction Type List",respObj);
															console.log("vOptions :: "+JSON.stringify(vOptions));

															return Promise.resolve(lexResponses.elicitSlotResponseCard(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "orderside", "Please select transction types from below list.",vOptions.title,vOptions.imageurl,vOptions.buttons));	

													});	
										}
										else
										{
													return databaseManager.fetchSecurities().then(respObj =>{
																	console.log("respObj :: "+respObj);
																	var vOptions = getOptions("Security List",respObj);
																	console.log("vOptions :: "+JSON.stringify(vOptions));

																	return Promise.resolve(lexResponses.elicitSlotResponseCard(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "securities", "Invalid input. Please select security from below list.",vOptions.title,vOptions.imageurl,vOptions.buttons));	

															});
										}

					});

					


					//var vOptions = {"title":"Transaction Types ","imageurl":process.env.respcardimg,"buttons":[{"text":"BUY","value":"BUY"},{"text":"SELL","value":"SELL"}]}

					//return Promise.resolve(lexResponses.elicitSlotResponseCard(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "orderside", "Please select transaction type from below list",vOptions.title,vOptions.imageurl,vOptions.buttons));		
					//return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "orderside", "Please select transaction type"));
				}

				else if ( ordertype == null )
				{

					var validOrderside = false	
					return databaseManager.fetchTransTypes().then(respObj =>{
									_.forEach(respObj, option => {
												if( option["code"] == orderside )
													validOrderside = true;
												
										});

										if( validOrderside )
										{


												var vOptions = {"title":"Amount/Quantity Based ","imageurl":process.env.respcardimg,"buttons":[{"text":"AMOUNT BASED","value":"amount"},{"text":"QUANTITY BASED","value":"quantity"}]} ;

												return Promise.resolve(lexResponses.elicitSlotResponseCard(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "ordertype", "Please select  amount/quantity based order from below list",vOptions.title,vOptions.imageurl,vOptions.buttons));	
										}
										else
										{
													return databaseManager.fetchTransTypes().then(respObj =>{
															console.log("respObj :: "+respObj);
															var vOptions = getOptions("Transaction Type List",respObj);
															console.log("vOptions :: "+JSON.stringify(vOptions));

															return Promise.resolve(lexResponses.elicitSlotResponseCard(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "orderside", "Invalid input. Please select transction types from below list.",vOptions.title,vOptions.imageurl,vOptions.buttons));	

													});
										}



					});
						
					//return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "ordertype", "Do you want to place amount/quantity based order ?"));
				}
				else
				{
					if ( ordertype == 'amount' )
					{
						if ( amount == null )	
						{
							return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "amount", "Please specify the amount for your order "));		
						}
						else
						{
							if(isNaN(amount))
								return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "amount", "Please specify a numerical value for amount."));	
							else
								return Promise.resolve(lexResponses.delegate(intentRequest.sessionAttributes, slots));			
						}
					}
					else if ( ordertype == 'quantity' ) 
					{
						if ( quantity == null )	
						{
							return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "quantity", "Please specify the quantity for your order "));		
						}
						else
						{
							if(isNaN(quantity))
								return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "quantity", "Please specify a numerical value for quantity."));
							else
								return Promise.resolve(lexResponses.delegate(intentRequest.sessionAttributes, slots));
						}
					}
					else
					{
							var vOptions = {"title":"Amount/Quantity Based ","imageurl":process.env.respcardimg,"buttons":[{"text":"AMOUNT BASED","value":"amount"},{"text":"QUANTITY BASED","value":"quantity"}]} ;

							return Promise.resolve(lexResponses.elicitSlotResponseCard(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, "ordertype", "Invalid input. Please select  amount/quantity based order from below list",vOptions.title,vOptions.imageurl,vOptions.buttons));
					}
						
				}
				
			}
			else
				return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, "Your user is not registered with credence's chatbot service. Thanks..Good bye."));

			
			
		});
	}
	else if( intentname == "NewHeadLines" )
	{
		return Promise.resolve(lexResponses.delegate(intentRequest.sessionAttributes, slots));
	}
		
	

	
	 
	
}

function getOptions(title,types)
{
	return {
		"title":title,
		"imageurl":process.env.respcardimg,
		"buttons":getButtons(types)
	};
}

function getButtons(options)
{
	var buttons = [];
	_.forEach(options, option => {
		
		buttons.push({
			"text":option["name"],
			"value":option["code"]
		});
	});
	return buttons;
}