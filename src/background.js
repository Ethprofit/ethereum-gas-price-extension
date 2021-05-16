var appData = {
  gasData: {}
};

chrome.alarms.create('fetch_gas_price',{
  "periodInMinutes": 2
});

chrome.alarms.onAlarm.addListener(alarm => {
  fetchGasPrice();
});

function updateBadge() {
  chrome.storage.sync.get({
    gasPriceOption: "standard",
  }, function(items) {
    const gasPrice = appData.gasData[items.gasPriceOption].gwei;
    chrome.browserAction.setBadgeText({text: String(gasPrice)});
  });
}

function getProviderUrl(provider) {
  switch(provider) {
    case 'ethgasstation':
      // return "https://gasprice-proxy.herokuapp.com/"; // Firefox specific proxy
      return "https://ethgasstation.info/api/ethgasAPI.json?api-key=d216b81e8ed8f5c8a82744be99b22b2d1757098f40df3c2ea5bb40b3912b";
      break;
    case 'gasnow':
      return "https://www.gasnow.org/api/v3/gas/price?utm_source=EthGasPriceExtension";
      break;
    case 'ethgaswatch':
      return "https://gasprice-proxy.herokuapp.com/provider/ethgaswatch";
      break;
  }
}

function fetchGasPrice() {
  return new Promise((resolve, reject)=>{
    chrome.storage.sync.get({
      provider: "ethgasstation",
    }, function(items) {
      const url = getProviderUrl(items.provider);

      fetch(url).then((res) => {return res.json()})
      .then(data => {
        // Store the current data for the popup page
        appData.gasData = parseApiData(data, items.provider);
        // Update badge
        updateBadge();

        // Resolve promise on success
        resolve();
      })
      .catch((error) => {
        reject();
      });
    });
  });
}

		//Fetch the price of Ethereum
		const eth_api_url = 'https://api.gemini.com/v1/pubticker/ethusd';
		function ethereumHttpObject() {
			try { return new XMLHttpRequest(); }
			catch (error) { }
		}
		function ethereumGetData() {
			var request = ethereumHttpObject();
			request.open("GET", eth_api_url, false);
			request.send(null);
			console.log(request.responseText);
			return request.responseText;
		}
		function ethereumDataHandler() {
			var raw_data_string = ethereumGetData();

			var data = JSON.parse(raw_data_string);


			var price = data.bid;

			return price;
		}

// Create a consistent structure for data so we can use multiple providers
function parseApiData(apiData, provider) {
  if(provider === "ethgasstation") {
    return {
      "slow": {
        "gwei": parseInt(apiData.safeLow, 10)/10,
        "wait": "~"+apiData.safeLowWait + " minutes",
		"USD": "$"+parseInt((apiData.safeLow/476190476000000)*ethereumDataHandler())
      },
      "standard": {
        "gwei": parseInt(apiData.average, 10)/10,
        "wait": "~"+apiData.avgWait + " minutes",
		"USD": "$"+parseInt((apiData.average/476190476000000)*ethereumDataHandler())
      },
      "fast": {
        "gwei": parseInt(apiData.fast, 10)/10,
        "wait": "~"+apiData.fastWait + " minutes",
		"USD": "$"+parseInt((apiData.fast/476190476000000)*ethereumDataHandler())
      },
      "rapid": {
        "gwei": parseInt(apiData.fastest, 10)/10,
        "wait": "~"+apiData.fastestWait + " minutes",
		"USD": "$"+parseInt((apiData.fastest/476190476000000)*ethereumDataHandler())
      }
    }
  }

  if(provider === "gasnow") {
    return {
      "slow": {
        "gwei": Math.floor(parseInt(apiData.data.slow, 10)/1000000000),
        "wait": ">10 minutes",
		"USD": "$"+parseInt((apiData.data.slow/476190476000000000000000)*ethereumDataHandler())
      },
      "standard": {
        "gwei": Math.floor(parseInt(apiData.data.standard, 10)/1000000000),
        "wait": "~3 minutes",
		"USD": "$"+parseInt((apiData.data.standard/476190476000000000000000)*ethereumDataHandler())
      },
      "fast": {
        "gwei": Math.floor(parseInt(apiData.data.fast, 10)/1000000000),
        "wait": "~1 minute",
		"USD": "$"+parseInt((apiData.data.fast/476190476000000000000000)*ethereumDataHandler())
      },
      "rapid": {
        "gwei": Math.floor(parseInt(apiData.data.rapid, 10)/1000000000),
        "wait": "ASAP",
		"USD": "$"+parseInt((apiData.data.rapid/476190476000000000000000)*ethereumDataHandler())
      }
    }
  }

  if(provider === "ethgaswatch") {
    return {
      "slow": {
        "gwei": parseInt(apiData.slow.gwei, 10),
        "wait": "<30 minutes",
		"USD": "$"+parseInt((apiData.slow.gwei/47619047600000)*ethereumDataHandler())
      },
      "standard": {
        "gwei": parseInt(apiData.normal.gwei, 10),
        "wait": "<5 minutes",
		"USD": "$"+parseInt((apiData.normal.gwei/47619047600000)*ethereumDataHandler())
      },
      "fast": {
        "gwei": parseInt(apiData.fast.gwei, 10),
        "wait": "<2 minutes",
		"USD": "$"+parseInt((apiData.fast.gwei/47619047600000)*ethereumDataHandler())
      },
      "rapid": {
        "gwei": parseInt(apiData.instant.gwei, 10),
        "wait": "ASAP",
		"USD": "$"+parseInt((apiData.instant.gwei/47619047600000)*ethereumDataHandler())
      }
    }
  }
  
}

fetchGasPrice(); // Initial fetch
