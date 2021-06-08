const rainingElement = document.querySelector('#raining');
const weatherElement = document.querySelector('#weather');
const forecastTitle = document.getElementsByTagName('h3')[1];

let rainingModels = {
	page: 0,
	rainingRecords: null,
	weatherForecast: null,
	fetchRainingAPI: function() {
		const src = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0002-001?Authorization=${CWB_API_KEY}`;

		return fetch(src)
			.then(response => response.json())
			.then(data => this.rainingRecords = data.records);
	},
	fetchWeatherAPI: function() {
		const src = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${CWB_API_KEY}`;

		return fetch(src)
			.then(response => response.json())
			.then(data => {
				this.weatherForecast = data.records;
			});
	},
	nextPage: function() {
		if (this.page >= this.rainingRecords.location.length / 10) return;
		this.page++;
	},
	lastPage: function() {
		if (this.page === 0) return;
		this.page--;
	}
};

let rainingViews = {
	removeAllChildNodes: function(parent) {
      while (parent.firstChild) {
         parent.removeChild(parent.firstChild);
      }
   },
	renderRaining: function(page) {
		let startIndex = page * 10;
		let endIndex = (page + 1) * 10;

		const spinner = document.querySelector('#spinner-raining');
		rainingElement.removeChild(spinner);

		console.log(rainingModels.rainingRecords.location.length);
	
		for (let i = startIndex; i < endIndex; i++) {
			const location = rainingModels.rainingRecords.location[i];
			if (!location) return;

			const item = document.createElement('div');
			item.className = 'location';
	
			const town = document.createElement('div');
			town.className = 'town';
			town.textContent = location.parameter[0].parameterValue + '、' + location.parameter[2].parameterValue;
	
			const amount = document.createElement('amount');
			amount.className = 'amount';
			amount.textContent = location.weatherElement[6].elementValue + ' mm';
	
			item.appendChild(town);
			item.appendChild(amount);
			rainingElement.appendChild(item);
		}
	},
	renderButton: function() {
		const nextPageButton = document.createElement('button');
		nextPageButton.textContent = '下一頁';
		nextPageButton.id = 'next-page';

		const lastPageButton = document.createElement('button');
		lastPageButton.textContent = '上一頁';
		lastPageButton.id = 'last-page';

		document.body.insertBefore(nextPageButton, forecastTitle);
		document.body.insertBefore(lastPageButton, nextPageButton);
	},
	renderWeather: function() {
		const spinner = document.querySelector('#spinner-weather');
		weatherElement.removeChild(spinner);

		const locationArray = rainingModels.weatherForecast.location;

		for (let location of locationArray) {
			const item = document.createElement('div');
			item.classList.add('location');

			const town = document.createElement('div');
			town.classList.add('town');
			town.textContent = location.locationName;

			const time = document.createElement('div');
			time.classList.add('time');
			const timeData = location.weatherElement[0].time[0]
			time.textContent = `${timeData.startTime} ~ ${timeData.endTime}`;

			const rainDesc = document.createElement('div');
			rainDesc.classList.add('Wx');
			const rainDescData = location.weatherElement[0].time[0].parameter;
			rainDesc.textContent = `${rainDescData.parameterName}`;

			const rainProbability = document.createElement('div');
			rainProbability.classList.add('PoP');
			const rainProbData = location.weatherElement[1].time[0].parameter;
			rainProbability.textContent = `降雨機率：${rainProbData.parameterName}%`;

			const tempDesc = document.createElement('div');
			tempDesc.classList.add('CI');
			const tempDescData = location.weatherElement[3].time[0].parameter;
			tempDesc.textContent = `${tempDescData.parameterName}`;

			const minT = document.createElement('div');
			minT.classList.add('MinT');
			const minTData = location.weatherElement[2].time[0].parameter;
			minT.textContent = `${minTData.parameterName}°${minTData.parameterUnit}`;

			const maxT = document.createElement('div');
			maxT.classList.add('MaxT');
			const maxTData = location.weatherElement[4].time[0].parameter;
			maxT.textContent = `${maxTData.parameterName}°${maxTData.parameterUnit}`;

			item.appendChild(town);
			item.appendChild(time);
			item.appendChild(rainDesc);
			item.appendChild(rainProbability);
			item.appendChild(tempDesc);
			item.appendChild(minT);
			item.appendChild(maxT);
			weatherElement.appendChild(item);
		}
	},
	createLoadingElement: function(element) {
      const spinner = document.createElement('div');
      spinner.classList.add('spinner');
		spinner.id = `spinner-${element.id}`;

      const spinnerText = document.createElement('div');
      spinnerText.classList.add('spinner-text');
      spinnerText.innerText = 'Loading';

      const spinnerSectorRed = document.createElement('div');
      spinnerSectorRed.classList.add('spinner-sector');
      spinnerSectorRed.classList.add('spinner-sector-red');

      const spinnerSectorBlue = document.createElement('div');
      spinnerSectorBlue.classList.add('spinner-sector');
      spinnerSectorBlue.classList.add('spinner-sector-blue');

      const spinnerSectorGreen = document.createElement('div');
      spinnerSectorGreen.classList.add('spinner-sector');
      spinnerSectorGreen.classList.add('spinner-sector-green');

      spinner.appendChild(spinnerText);
      spinner.appendChild(spinnerSectorRed);
      spinner.appendChild(spinnerSectorBlue);
      spinner.appendChild(spinnerSectorGreen);
      element.appendChild(spinner);
	}
};

let rainingControllers = {
	init: function() {
		this.showRaining()
			.then(() => rainingViews.renderButton())
			.then(() => {
				this.goNextPage();
				this.goLastPage();
			});

		this.showWeather();
	},
	showRaining: function() {
		rainingViews.createLoadingElement(rainingElement);

		return rainingModels.fetchRainingAPI()
			.then(() => rainingViews.renderRaining(rainingModels.page));
	},
	showWeather: function() {
		rainingViews.createLoadingElement(weatherElement);

		rainingModels.fetchWeatherAPI()
			.then(() => rainingViews.renderWeather())
			.catch(err => console.log(err));
	},
	goNextPage: function() {
		const nextPageButton = document.querySelector('#next-page');
		const lastPageButton = document.querySelector('#last-page');
		rainingModels.nextPage();
		this.nextbuttonDisabled(nextPageButton);
		this.lastButtonDisabled(lastPageButton);

		nextPageButton.addEventListener('click', e => {
			e.preventDefault();

			rainingViews.removeAllChildNodes(rainingElement);
			rainingModels.nextPage();
			this.nextbuttonDisabled(nextPageButton);
			this.lastButtonDisabled(lastPageButton);
			this.showRaining();
		});
	},
	goLastPage: function() {
		const nextPageButton = document.querySelector('#next-page');
		const lastPageButton = document.querySelector('#last-page');
		rainingModels.lastPage();
		this.nextbuttonDisabled(nextPageButton);
		this.lastButtonDisabled(lastPageButton);

		lastPageButton.addEventListener('click', e => {
			e.preventDefault();

			rainingViews.removeAllChildNodes(rainingElement);
			rainingModels.lastPage();
			this.lastButtonDisabled(lastPageButton);
			this.nextbuttonDisabled(nextPageButton);
			this.showRaining();
		});
	},
	nextbuttonDisabled: function(nextPageButton) {
		if (rainingModels.page >= Math.floor(rainingModels.rainingRecords.location.length / 10)) {
			nextPageButton.disabled = true;
			return;
		}
		nextPageButton.disabled = false;
		return;
	},
	lastButtonDisabled: function(lastPageButton) {
		if (rainingModels.page === 0) {
			lastPageButton.disabled = true;
			return;
		} 
		lastPageButton.disabled = false;
		return;
	},
};

rainingControllers.init();