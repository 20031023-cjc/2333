// 🌐 多语言支持
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
  error: { en: "⚠️ Could not fetch weather data.", zh: "⚠️ 无法获取天气信息。", ja: "⚠️ 天気情報を取得できませんでした。" }
};

// ✅ 加载完成后隐藏 loading
window.addEventListener("load", () => {
  document.getElementById("loadingOverlay")?.style.display = "none";
});

// 🌍 初始化地图
const map = L.map("map").setView([20, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Map data © OpenStreetMap contributors",
}).addTo(map);

// ☀️ 背景样式切换
function setWeatherBackground(icon) {
  const body = document.body;
  body.className = "";
  if (icon.includes("01")) body.classList.add("sunny");
  else if (icon.includes("02") || icon.includes("03") || icon.includes("04")) body.classList.add("cloudy");
  else if (icon.includes("09") || icon.includes("10")) body.classList.add("rainy");
  else if (icon.includes("13")) body.classList.add("snowy");
  else body.classList.add("night");
}

// 🌤 获取天气和文化信息
async function getWeather(city = null, lat = null, lon = null) {
  const input = document.getElementById("cityInput");
  const weatherInfo = document.getElementById("weatherInfo");
  const cultureInfo = document.getElementById("cultureInfo");
  city = city || input.value;
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
    const { temp } = data.main;
    const condition = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    const { country } = data.sys;
    const latUsed = data.coord.lat;
    const lonUsed = data.coord.lon;

    map.setView([latUsed, lonUsed], 8);
    L.marker([latUsed, lonUsed]).addTo(map);
    setWeatherBackground(icon);

    weatherInfo.innerHTML = `
      <h2>${i18n.weatherTitle[currentLang]} ${city}</h2>
      <img src="${iconUrl}" alt="${condition}" style="width: 80px;" />
      <p>🌡 ${temp}°C, ${condition}</p>`;

    const countryRes = await fetch(`https://restcountries.com/v3.1/alpha/${country}`);
    const countryData = await countryRes.json();
    const c = countryData[0];
    const flag = c.flags.svg;
    const language = Object.values(c.languages).join(", ");
    const countryName = c.name.common;

    const cultureTemplates = {
      JP: { food: "Sushi 🍣", greeting: "こんにちは", etiquette: "Bowing 🙇‍♂️" },
      CN: { food: "Dumplings 🥟", greeting: "你好", etiquette: "Respect with both hands 🤲" },
      US: { food: "Burger 🍔", greeting: "Hello", etiquette: "Handshake 🤝" },
      FR: { food: "Baguette 🥖", greeting: "Bonjour", etiquette: "Cheek kissing 👋" },
      KR: { food: "Kimchi 🥬", greeting: "안녕하세요", etiquette: "Two hands for everything 🙇" },
      TH: { food: "Pad Thai 🍜", greeting: "สวัสดีครับ/ค่ะ", etiquette: "Wai greeting 🙏" },
    };
    const culture = cultureTemplates[country] || { food: "N/A", greeting: "N/A", etiquette: "N/A" };

    cultureInfo.innerHTML = `
      <h3>🌍 ${i18n.culturalInfo[currentLang]}: ${countryName}</h3>
      <img src="${flag}" alt="Flag" style="width: 100px;" />
      <p><strong>${i18n.languageLabel[currentLang]}</strong> ${language}</p>
      <p><strong>${i18n.food[currentLang]}</strong> ${culture.food}</p>
      <p><strong>${i18n.greeting[currentLang]}</strong> ${culture.greeting}</p>
      <p><strong>${i18n.etiquette[currentLang]}</strong> ${culture.etiquette}</p>`;
  } catch (err) {
    weatherInfo.innerHTML = i18n.error[currentLang];
    cultureInfo.innerHTML = "";
    console.error(err);
  }
}

// 地图点击获取天气
map.on("click", async (e) => {
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await res.json();
    const city = data.address.city || data.address.town || data.address.village || data.address.state;
    if (city) {
      document.getElementById("cityInput").value = city;
      getWeather(city, lat, lon);
    } else {
      alert("No city found at this location.");
    }
  } catch (err) {
    console.error("Reverse geocoding failed", err);
  }
});

// 使用定位
function getLocationWeather() {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
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
    alert("Unable to retrieve your location.");
  });
}

// 语言切换逻辑
function highlightActiveLanguage() {
  document.querySelectorAll(".language-switch button").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === currentLang);
  });
}

document.querySelectorAll(".language-switch button").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentLang = btn.getAttribute("data-lang");
    localStorage.setItem("language", currentLang);
    applyTranslations();
  });
});

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
applyTranslations();

// ⭐ 收藏城市功能（可选扩展）
function saveCurrentCity() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Please enter a city first.");
  let saved = JSON.parse(localStorage.getItem("savedCities") || "[]");
  if (!saved.includes(city)) {
    saved.push(city);
    localStorage.setItem("savedCities", JSON.stringify(saved));
    alert("City saved!");
  } else {
    alert("City already saved.");
  }
}

function showSavedCities() {
  const popup = document.getElementById("savedCitiesPopup");
  const list = document.getElementById("savedCitiesList");
  const saved = JSON.parse(localStorage.getItem("savedCities") || "[]");
  list.innerHTML = "";
  if (saved.length === 0) {
    list.innerHTML = "<li>No cities saved.</li>";
  } else {
    saved.forEach((city) => {
      const li = document.createElement("li");
      li.textContent = city;
      li.onclick = () => {
        document.getElementById("cityInput").value = city;
        getWeather(city);
        closeSavedCities();
      };
      list.appendChild(li);
    });
  }
  popup.classList.remove("hidden");
}

function closeSavedCities() {
  document.getElementById("savedCitiesPopup").classList.add("hidden");
}

// 🔄 卡片翻转控制函数
function toggleFlip(cardElement) {
  cardElement.classList.toggle("flipped");
}
