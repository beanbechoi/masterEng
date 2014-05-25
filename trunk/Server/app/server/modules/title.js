var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID,
				fs = require("fs");
var MongoDb = require("mongodb");
var titleDB = cnMongoDB.title;
var locationDB = cnMongoDB.location;
var https = require('https'); //Https module of Node.js
var FormData = require('form-data'); //Pretty multipart form maker.

//--------------------------------
// Function Add Location
// Param input: List input from screen
// Param callback: funtion callback
//--------------------------------
exports.updatetitle = function(titlename, callback){
	titleDB.insert({
		"titlename": titlename,
		"level": 0,
		"parrentID": ""
	},function(err,result){
		if(err)
			callback(err,'Can insert title');
		else
			callback(null,result);
	});
}
//--------------------------------
//Get list  location
//Param userid: current user
//Param callback: funtion callback
//--------------------------------
exports.getListTitle = function(page,offset,callback){
	var iSkip = (page - 1)* offset;
	var iOffset = page * offset;
	titleDB.find({}).sort([['_id','desc']]).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list title');
		else
			callback(null,result);
	});
}
//--------------------------------
//Get count list location
//Param callback: funtion callback
//--------------------------------
exports.getCountListTitle = function(callback){
	titleDB.count({}, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}
//--------------------------------
// Get list recommend location
// Param userid: current user
// Param callback: funtion callback
//--------------------------------
exports.getRecommendLocation = function(userid,callback){
	locationDB.find({"isrecommend":"true"}).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get list location by distance
// Param distance: distance to location
// Param callback: funtion callback
//--------------------------------
exports.getLocationByDistance = function(idistance, lon, lat, callback){
	var distance 	= parseFloat(idistance/1000);
	var limit  		= 99;
	var skip		= 0;
	locationDB.find({coordinate: {$within: {$center:[[parseFloat(lon),parseFloat(lat)],distance]}}})
					.limit(limit)
					.skip(skip)
					.toArray(function(err, results) {
						if(results){
							callback(null, results);
						} else {
							callback(err,null);
						}
					});
}

//--------------------------------
// Get list location with country, city
// Param userid: current user
// Param country: country of location
// Param city: city of location
// Param callback: funtion callback
//--------------------------------
exports.getLocationByAddress = function(userid, country, city, callback){
	locationDB.find({"country":country,"city":city}).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get location info
// Param locationid: id of location
// Param callback: funtion callback
//--------------------------------
exports.getLocation = function(locationid, callback){
	locationDB.findOne({_id:new ObjectID(locationid)}, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Add number comment for location
// Param locationid: id of location
// Param callback: funtion callback
//--------------------------------
exports.addLocationComment = function(locationid, callback){
	locationDB.update({_id:new ObjectID(locationid)}, {$inc:{'comment':1}}, function(err,result){
		if(err)
			callback(err,'Can not add comment');
		else
			callback(null,result);
	});
}

//--------------------------------
// Add number like for location
// Param locationid: id of location
// Param callback: funtion callback
//--------------------------------
exports.addLocationLike = function(locationid, callback){
	locationDB.update({_id:new ObjectID(locationid)}, {$inc:{'like':1}}, function(err,result){
		if(err)
			callback(err,'Can not add like');
		else
			callback(null,result);
	});
}

//--------------------------------
// Update number comment for location
// Param locationid: id of location
// Param cmt: number comment
// Param callback: funtion callback
//--------------------------------
exports.updateLocationComment = function(locationid, cmt, callback){
	locationDB.update({ _id : new ObjectID(locationid) }, { $set : { comment : Number(cmt) } }, function(err,result){
		if(err)
			callback(err,'Can not update comment');
		else
			callback(null,result);
	});
}

//--------------------------------
// Update number like for location
// Param nlike: number like
// Param callback: funtion callback
//--------------------------------
exports.updateLocationLike = function(locationid, nlike, callback){
	locationDB.update({ _id : new ObjectID(locationid) }, { $set : { like : Number(nlike) } }, function(err,result){
		if(err)
			callback(err,'Can not update like');
		else
			callback(null,result);
	});
}

//--------------------------------
// Delete location
// Param nlike: number like
// Param callback: funtion callback
//--------------------------------
exports.deleteLocation = function(locationid, callback){
	locationDB.remove({ _id : new ObjectID(locationid) }, function(err,result){
		if(err)
			callback(err,'Can not delete location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Update number like and comment for location
// Param nlike: number like
// Param ncomment: number comment
// Param callback: funtion callback
//--------------------------------
exports.updateLocationLikeComment = function(locationid, nlike, ncomment, callback){
	locationDB.update({ _id : locationid }, 
					  { $set : { like : Number(nlike), comment : Number(ncomment) } }, function(err,result){
		if(err)
			callback(err,'Can not update');
		else
			callback(null,result);
	});
}


//--------------------------------
// Add user checkin
// Param userid: user checkin
// Param callback: funtion callback
//--------------------------------
exports.checkinLocation = function(userid, locationid, callback){
	locationDB.update( { _id : new ObjectID(locationid) },{ $push: { checkin : userid } }, function(err,resultUpdate){
		if(err){
			callback(err,'Can not add user checkin');
		} else {
			locationDB.findOne({_id:new ObjectID(locationid)}, function(err,resultFind){
				if(err) {
					callback(err,'Can not get location');
				} else {
					accountDB.update( { 'userid' : userid }, { $set : { lastcheckinid : resultFind._id,
																		lastcheckinname : resultFind.namelocation } }, function(err,result){
						if(err)
							callback(err,'Can not update user');
						else
							callback(null,result);
					});
				}
			});
		}
	});
}

//--------------------------------
// Get checkin location
// Param userid: user checkin
// Param callback: funtion callback
//--------------------------------
exports.getCheckinLocation = function(userid,page,offset,callback){
	var iSkip = (page - 1)* offset;
	var iOffset = page * offset;
	locationDB.find( { checkin: userid } ).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get list  location
// Param userid: current user
// Param callback: funtion callback
//--------------------------------
exports.getListLocation = function(page,offset,callback){
	var iSkip = (page - 1)* offset;
	var iOffset = page * offset;
	locationDB.find({}).sort([['_id','desc']]).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Delete  location
// Param locationid: id of location
// Param callback: funtion callback
//--------------------------------
exports.deleteLocation = function(locationid, callback){
	locationDB.remove( { _id : new ObjectID(locationid) }, function(err,result){
		if(err)
			callback(err,'Can not delete user');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get count list location
// Param callback: funtion callback
//--------------------------------
exports.getCountListLocation = function(callback){
	locationDB.count({}, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}