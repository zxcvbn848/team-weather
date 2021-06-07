
let rainingModels = {
	records: null,
	fetchAPI: function() {
		const src = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0002-001?Authorization=${CWB_API_KEY}`;

		return fetch(src)
			.then(response => response.json())
			.then(data => {
				this.records = data.records;
			});
	}
};

let rainingViews = {
	renderRaining: function(page) {
		let startIndex = page * 10;
		let endIndex = (page + 1) * 10;
		const container = document.querySelector('#raining');

		const spinner = document.querySelector('.spinner');
		container.removeChild(spinner);
	
		for (let i = startIndex; i < endIndex; i++) {
			const location = rainingModels.records.location[i];
			const item = document.createElement('div');
			item.className = 'location';
	
			const town = document.createElement('div');
			town.className='town';
			town.textContent = location.parameter[0].parameterValue + '、' + location.parameter[2].parameterValue;
	
			const amount = document.createElement('amount');
			amount.className = 'amount';
			amount.textContent = location.weatherElement[6].elementValue + ' mm';
	
			item.appendChild(town);
			item.appendChild(amount);
			container.appendChild(item);
		}
	},
	// 天氣預報，待放 loading
	createLoadingElement: function() {
      const rainingElement = document.querySelector('#raining');

      const spinner = document.createElement('div');
      spinner.classList.add('spinner');

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
      rainingElement.appendChild(spinner);
	}
};

let rainingControllers = {
	init: function() {
		rainingViews.createLoadingElement();

		rainingModels.fetchAPI()
			.then(() => {
				rainingViews.renderRaining(0);
			})
			.catch(err => console.log(err));
	}
};

rainingControllers.init();