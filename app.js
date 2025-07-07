// 🌐 多语言定义
let currentLang = localStorage.getItem("language") || "en";

const i18n = {
  title: { en: "WorldView", zh: "世界视图", ja: "ワールドビュー" },
  inputPlaceholder: { en: "Enter city name", zh: "输入城市名称", ja: "都市名を入力" },
  search: { en: "Search", zh: "搜索", ja: "検索" },
  useLocation: { en: "📍 Use My Location", zh: "📍 使用当前位置", ja: "📍 現在地を使う" },
  weatherTitle: { en: "Weather in", zh: "天气：", ja: "天気：" },
  culturalInfo: { en: "Cultural Info", zh: "文化信息", ja: "文化情報" },
  languageLabel: { en: "Official Language(s):", zh: "官方语言：", ja: "公用語：" },
  food: { en: "Famous Food:", zh: "代表食物：", ja: "名物料理：" },
  greeting: { en: "Greeting:", zh: "问候语：", ja: "あいさつ：" },
  etiquette: { en: "Etiquette:", zh: "礼仪：", ja: "マナー：" },
  error: { en: "⚠️ Could not fetch weather data.", zh: "⚠️ 无法获取天气信息。", ja: "⚠️ 天気情報を取得できませんでした。" },
};

// 📦 本地存储 KEY
const HISTORY_KEY = "worldview_history";
const FAVORITES_KEY = "worldview_favorites";

// 初始化地图（默认样式）
let baseTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
});
const map = L.map('map', { layers: [baseTileLayer] }).setView([20, 0], 2);

// 🌙 夜间模式切换
document.getElementById("toggleMode").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// 🗺️ 地图风格切换（改用 Carto 免费地图）
function setMapStyle(type) {
  map.removeLayer(baseTileLayer);
  if (type === "dark") {
    baseTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
    });
  } else if (type === "light") {
    baseTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
    });
  } else {
    baseTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    });
  }
  map.addLayer(baseTileLayer);
}

// 🌤 动态天气图标（emoji）
function getWeatherIcon(condition) {
  const lower = condition.toLowerCase();
  if (lower.includes("clear")) return "🌞";
  if (lower.includes("cloud")) return "☁️";
  if (lower.includes("rain")) return "🌧️";
  if (lower.includes("storm")) return "⛈️";
  if (lower.includes("snow")) return "❄️";
  if (lower.includes("mist") || lower.includes("fog")) return "🌫️";
  return "🌡️";
}

// 🌤 获取天气和文化信息
async function getWeather(city = null, lat = null, lon = null) {
  const cityInput = document.getElementById("cityInput");
  const weatherInfo = document.getElementById("weatherInfo");
  const cultureInfo = document.getElementById("cultureInfo");

  city = city || cityInput.value;
  if (!city) {
    weatherInfo.innerHTML = i18n.error[currentLang];
    cultureInfo.innerHTML = "";
    return;
  }

  const apiKey = "d0c82cf6ceae567537e0079215ab67dd";
  const url = lat && lon
    ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();

    const temperature = data.main.temp;
    const condition = data.weather[0].description;
    const iconEmoji = getWeatherIcon(condition);
    const countryCode = data.sys.country;
    const latUsed = data.coord.lat;
    const lonUsed = data.coord.lon;

    map.setView([latUsed, lonUsed], 8);
    L.marker([latUsed, lonUsed]).addTo(map);

    weatherInfo.innerHTML = `
      <h2>${i18n.weatherTitle[currentLang]} ${city}</h2>
      <div style="font-size: 3rem;">${iconEmoji}</div>
      <p>🌡 ${temperature}°C, ${condition}</p>
      <button onclick="addFavorite('${city}')">⭐ Add to Favorites</button>
    `;

    const countryRes = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    const countryData = await countryRes.json();
    const country = countryData[0];
    const flag = country.flags.svg;
    const language = Object.values(country.languages).join(", ");
    const countryName = country.name.common;

    const cultureTemplates = {
      JP: { food: "Sushi 🍣", greeting: "こんにちは", etiquette: "Bowing 🙇‍♂️" },
      CN: { food: "Dumplings 🥟", greeting: "你好", etiquette: "Respect with both hands 🤲" },
      US: { food: "Burger 🍔", greeting: "Hello", etiquette: "Handshake 🤝" },
      FR: { food: "Baguette 🥖", greeting: "Bonjour", etiquette: "Cheek kissing 👋" },
      KR: { food: "Kimchi 🥬", greeting: "안녕하세요", etiquette: "Two hands for everything 🙇" },
      TH: { food: "Pad Thai 🍜", greeting: "สวัสดีครับ/ค่ะ", etiquette: "Wai greeting 🙏" },
    };

    const culture = cultureTemplates[countryCode] || { food: "N/A", greeting: "N/A", etiquette: "N/A" };

    cultureInfo.innerHTML = `
      <h3>🌍 ${i18n.culturalInfo[currentLang]}: ${countryName}</h3>
      <img src="${flag}" alt="Flag of ${countryName}" style="width: 100px; margin: 10px 0;" />
      <p><strong>${i18n.languageLabel[currentLang]}</strong> ${language}</p>
      <p><strong>${i18n.food[currentLang]}</strong> ${culture.food}</p>
      <p><strong>${i18n.greeting[currentLang]}</strong> ${culture.greeting}</p>
      <p><strong>${i18n.etiquette[currentLang]}</strong> ${culture.etiquette}</p>
    `;

    updateHistory(city);
  } catch (err) {
    weatherInfo.innerHTML = i18n.error[currentLang];
    cultureInfo.innerHTML = "";
    console.error(err);
  }
}

// 📍 当前定位
function getLocationWeather() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      const city = data.address.city || data.address.town || data.address.village || data.address.state;

      if (city) {
        document.getElementById("cityInput").value = city;
        getWeather(city, lat, lon);
      } else {
        alert("Could not determine city.");
      }
    } catch (err) {
      console.error("Location fetch failed", err);
    }
  }, () => {
    alert("Location access denied.");
  });
}

// 💬 多语言应用
function applyTranslations() {
  document.title = i18n.title[currentLang];
  document.querySelector("h1").textContent = i18n.title[currentLang];
  document.getElementById("cityInput").placeholder = i18n.inputPlaceholder[currentLang];
  const buttons = document.querySelectorAll(".search-box button");
  buttons[0].textContent = `🔍 ${i18n.search[currentLang]}`;
  buttons[1].textContent = i18n.useLocation[currentLang];
  highlightActiveLanguage();

  if (document.getElementById("weatherInfo").innerHTML) {
    const city = document.getElementById("cityInput").value;
    getWeather(city);
  }
}

// 🌐 多语言切换绑定
document.querySelectorAll(".language-switch button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-lang");
    currentLang = lang;
    localStorage.setItem("language", lang);
    applyTranslations();
  });
});

function highlightActiveLanguage() {
  document.querySelectorAll(".language-switch button").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === currentLang);
  });
}

// 📜 搜索历史记录
function updateHistory(city) {
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  history = history.filter(c => c !== city);
  history.unshift(city);
  if (history.length > 5) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const historyDiv = document.getElementById("searchHistory");
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  historyDiv.innerHTML = "Recent: " + history.map(city =>
    `<button onclick="getWeather('${city}')">${city}</button>`
  ).join(" ");
}

// ⭐ 收藏功能
function addFavorite(city) {
  let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    renderFavorites();
  }
}

function renderFavorites() {
  const list = document.getElementById("favoritesList");
  const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  list.innerHTML = favorites.map(city =>
    `<li onclick="getWeather('${city}')">${city}</li>`
  ).join("");
}

// 🚀 初始化
applyTranslations();
renderHistory();
renderFavorites();
