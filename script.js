const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const autoSuggestionsList = document.getElementById("auto-suggestions");


const API_KEY = "ad795fd8a756fe5656cd82f39e39e7fb"; 
cityInput.addEventListener("input", () => {
  const inputText = cityInput.value.trim();

  
  autoSuggestionsList.innerHTML = "";

  if (inputText.length > 2) {
      
      fetchAutoSuggestions(inputText);
  }
});

const fetchAutoSuggestions = (inputText) => {
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${inputText}&limit=5&appid=${API_KEY}`;

  fetch(API_URL)
      .then(response => response.json())
      .then(data => {
          displayAutoSuggestions(data);
      })
      .catch(() => {
          console.error("An error occurred while fetching auto-suggestions");
      });
};

const displayAutoSuggestions = (suggestions) => {
  suggestions.forEach(suggestion => {
      const li = document.createElement("li");
      li.textContent = suggestion.name;
      li.addEventListener("click", () => {
          
          cityInput.value = suggestion.name;
        
          autoSuggestionsList.innerHTML = "";
    
          getCityCoordinates();
      });

      autoSuggestionsList.appendChild(li);
  });
};



const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) { 
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { 
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
    cityName == "";
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; 
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => { 
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}


const scales = ['Celsius', 'Fahrenheit', 'Kelvin'];
let currentIndex = 0;
let initialScaleIndex = 0;

const toggleTemperatureScale = () => {
  currentIndex = (currentIndex + 1) % (scales.length * 2);
  const nextScale = getNextScale(currentIndex);
  updateTemperatureScale(nextScale);
};

const getNextScale = (nextIndex) => {
  if (nextIndex < scales.length) {
    initialScaleIndex = nextIndex; 
    return scales[nextIndex];
  } else {
    const scaledIndex = (nextIndex - scales.length) % scales.length;
    return scales[scaledIndex];
  }
};

const updateTemperatureScale = (scale) => {
  const temperatureElements = document.querySelectorAll('.weather-data h6:nth-child(2)');
  temperatureElements.forEach((element) => {
    const currentTemperature = parseFloat(element.textContent.split(' ')[1]);
    element.textContent = `Temperature: ${convertTemperature(currentTemperature, scale)}°${getTemperatureSymbol(scale)}`;
  });
};

const convertTemperature = (temperature, toScale) => {
  switch (toScale) {
    case 'Celsius':
      return temperature;
    case 'Fahrenheit':
      return (temperature * 9/5) + 32;
    case 'Kelvin':
      return temperature + 273.15;
    default:
      return temperature;
  }
};

const getTemperatureSymbol = (scale) => {
  switch (scale) {
    case 'Celsius':
      return 'C';
    case 'Fahrenheit':
      return 'F';
    case 'Kelvin':
      return 'K';
    default:
      return 'C';
  }
};




locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
