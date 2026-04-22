// =======================
// WEATHER APP SCRIPT
// =======================

// Replace this with your own OpenWeatherMap API key
const API_KEY = "38e1fa900f9e78db5d61d36e1c4986a9";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");

const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");

const weatherCard = document.getElementById("weatherCard");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const weatherIcon = document.getElementById("weatherIcon");

// Show loading
function showLoading() {
  loading.classList.remove("hidden");
}

// Hide loading
function hideLoading() {
  loading.classList.add("hidden");
}

// Show error
function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  weatherCard.classList.add("hidden");
}

// Hide error
function hideError() {
  errorBox.classList.add("hidden");
}

// Display weather data
function displayWeather(data) {
  weatherCard.classList.remove("hidden");

  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = `${Math.round(data.main.temp)}°C`;
  condition.textContent = data.weather[0].description;

  humidity.textContent = data.main.humidity;
  wind.textContent = Math.round(data.wind.speed * 3.6); // convert m/s to km/h
  feelsLike.textContent = Math.round(data.main.feels_like);

  const iconCode = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// Fetch weather by city name
async function getWeatherByCity(city) {
  try {
    hideError();
    showLoading();

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "City not found");
    }

    displayWeather(data);

    // Save last searched city
    localStorage.setItem("lastCity", city);

  } catch (err) {
    showError("Location not found – please try again.");
  } finally {
    hideLoading();
  }
}

// Fetch weather by coordinates
async function getWeatherByCoords(lat, lon) {
  try {
    hideError();
    showLoading();

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Unable to get location weather");
    }

    displayWeather(data);

    // Save last searched location name
    localStorage.setItem("lastCity", data.name);

  } catch (err) {
    showError("Unable to detect your location weather.");
  } finally {
    hideLoading();
  }
}

// Search button event
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (city === "") {
    showError("Please enter a location name.");
    return;
  }

  getWeatherByCity(city);
});

// Enter key event
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// Geolocation button event
geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported in your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeatherByCoords(lat, lon);
    },
    () => {
      showError("Permission denied. Please allow location access.");
    }
  );
});

// Auto-load last searched city on page reload
window.addEventListener("load", () => {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    cityInput.value = lastCity;
    getWeatherByCity(lastCity);
  }
});