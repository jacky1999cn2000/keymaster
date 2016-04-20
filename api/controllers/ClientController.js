/**
 * ClientController
 *
 * @description :: Server-side logic for managing Clients
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

var AWS = require('aws-sdk-promise');
var co = require('co');

AWS.config.update({
	region: sails.config.aws.region,
	endpoint: sails.config.aws.endpoint,
	accessKeyId: sails.config.aws.accessKeyId,
	secretAccessKey: sails.config.aws.secretAccessKey
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
	findOne: function(req, res){
		co(function* (){
			let params = {
			    TableName : "Client",
			    KeyConditionExpression: "client_id = :cid",
			    ExpressionAttributeValues: {
			        ":cid":req.params.id
			    }
			};
			return yield docClient.query(params).promise();
		})
		.then(function(response){
	    let client = response.data.Items[0] || {};
	    res.send(client);
	  })
	  .catch(function(err){
	    console.log('*** catch ***');
	    console.log(err);
	    res.badRequest(err);
	  });
	},

	create: function(req, res){
		let item = {
			'client_id':  req.body.client_id,
			'client_secret': req.body.client_secret,
			'redirect_uri':  req.body.redirect_uri,
			'api_key': req.body.api_key,
			'created_by': req.body.created_by
		};
		co(function* (){
			let params = {
	        TableName: 'Client',
	        Item: item
	    };
			return yield docClient.put(params).promise();
		})
		.then(function(response){
	    res.send(item);
	  })
	  .catch(function(err){
	    console.log('*** catch ***');
	    console.log(err);
	    res.badRequest(err);
	  });
	},

	destroy: function(req, res){
		co(function* (){
			let params = {
			    TableName : "Client",
					Key:{
						'client_id':req.params.id
					}
			};
			return yield docClient.delete(params).promise();
		})
		.then(function(response){
	    res.send({'client_id':req.params.id});
	  })
	  .catch(function(err){
	    console.log('*** catch ***');
	    console.log(err);
	    res.badRequest(err);
	  });
	}
};
