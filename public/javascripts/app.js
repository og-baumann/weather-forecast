/*

	We are going to use VannilaJS for this app since the reqs said try not to use a UI library! If using a UI library, I would use React

*/

!function (w, d) {
	
	// Hoist Variables
	var loader, form, clear, location, today, forecast, ajax = false, months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

	// Inititalize all parts of the app and listeners
	function init () {
		form 		= d.getElementById('form');
		clear 		= d.getElementById('clear');
		location	= d.getElementById('location');
		today		= d.getElementById('app-now');
		forecast	= d.getElementById('app-forecast');
		loader	    = d.getElementById('loader');

		form.addEventListener('submit', fetch);
		clear.addEventListener('click', reset);
	}

	// XHR request to express backend
	function fetch (e) {
		e.preventDefault();

		var qry = location.value.trim(), res;

		if(!qry || ajax) {
			return;
		} else {
			qry = 'dest=' + encodeURIComponent(qry);
			ajax = true;
			today.innerHTML = '';
			forecast.innerHTML = '';
			loader.innerHTML = '<div class="loader"></div>';
		}

		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function () {
			if(xhr.readyState === 4 && xhr.status === 200) {
				res = JSON.parse(xhr.responseText);
				if(res.error) {
					loader.innerHTML = 'No Results';
				} else {
					parse(JSON.parse(xhr.responseText).list);
				}
				ajax = false;
			} 
 		}

		xhr.open('GET', '/weather?' + qry, true);
		xhr.send();
	}

	// Reset form and view
	function reset (e) {
		location.value = '';
		today.innerHTML = '';
		forecast.innerHTML = '';
		loader.innerHTML = 'Enter City Name';
	}

	// Handle a response from the API. Because the free API sends back a forecast with 3 hour intervals, we need to cherry pick data to get 
	// temp his and lows. Also, we are going to pull the weather condition from mid-day.
	function parse (arr) {
		var obj = [];

		arr.forEach(function(a){
			var d = new Date(a.dt*1000), n = months[d.getMonth()] + ' ' + d.getDate(), h = d.getHours() + 1;

			if(!obj[n]) {
				obj[n] = a;
				obj.push(n);
			} else  {
				obj[n].main.temp_max   	      = obj[n].main.temp_max < a.main.temp_max ? a.main.temp_max : obj[n].main.temp_max;
				obj[n].main.temp_min   		  = obj[n].main.temp_min > a.main.temp_min ? a.main.temp_min : obj[n].main.temp_min;
				obj[n].weather[0].icon 		  = h === 12 ? a.weather[0].icon : obj[n].weather[0].icon;
				obj[n].weather[0].description = h === 12 ? a.weather[0].description : obj[n].weather[0].description
			}
		});

		loader.innerHTML = '';
		today.innerHTML = componentToday(obj[obj[0]]);
		forecast.innerHTML = componentForecast(obj);
	}

	function componentToday (obj) {
		return '<div class="today"><div class="temp">'+Math.round(obj.main.temp)+'</div><div class="deg">&deg;</div><div class="desc"><div>F</div><div>'+obj.weather[0].description+'</div><div>'+obj.main.humidity+'% Humidity</div></div></div>';
	}

	function componentForecast (obj) {
		var ele = '', img;

		for(var i = 1; i < obj.length; i++){
			img  = '<img src="http://openweathermap.org/img/w/'+obj[obj[i]].weather[0].icon+'.png" alt="'+obj[obj[i]].weather[0].description+'">';
			ele += '<div><div>'+obj[i]+'</div><div>'+img+'</div><div>'+Math.round(obj[obj[i]].main.temp_max)+'</div><div>'+Math.round(obj[obj[i]].main.temp_min)+'</div></div>';
		}

		return ele;
	}

	// Inititalize
	w.addEventListener('load', init);

} (window, document);