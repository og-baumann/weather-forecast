var express = require('express');
var router = express.Router();
var request = require('request');

// Define API location and key
const apiTarget = 'http://api.openweathermap.org/data/2.5/forecast', apiKey = '2bfab74fd423c7741ee0ad0d9c90c345';

// Render app
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Weather Forecast' });
});

// Proxy API request and pipe response
router.get('/weather', function(req, res, next) {
	request({
		uri: apiTarget,
		qs: {
	  		q: req.query.dest,
	  		APPID: apiKey,
	  		units: 'imperial'
		}
	}, function(err, resp, body){
		if(!err) {
			if(JSON.parse(body).cod === '200') {
				res.send(body);
			} else {
				res.send({'error' : 404});
			}
		}
	});
});

module.exports = router;
