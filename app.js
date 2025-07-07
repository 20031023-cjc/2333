// 🌐 多语言支持
let currentLang = localStorage.getItem("language") || "en";
const i18n = {
  title: { en: "WorldView", zh: "世界视图", ja: "ワールドビュー" },
  inputPlaceholder: { en: "Enter city name", zh: "输入城市名称", ja: "都市名を入力" },
  search: { en: "Search", zh: "搜索", ja: "検索" },
  useLocation: { en: "📍 Use My Location", zh: "📍 使用当前位置", ja: "📍 現在地を使う" },
  save: { en: "⭐ Save this city", zh: "⭐ 收藏此城市", ja: "⭐ この都市を保存" },
  viewSaved: { en: "📂 View Saved Cities", zh: "📂 查看收藏城市", ja: "📂 保存都市を見る" },
  compare: { en: "🆚 Compare Cities", zh: "🆚 城市对比", ja: "🆚 都市比較" },
  mapStyle: { en: "🗺️ Map Style", zh: "🗺️ 地图样式", ja: "🗺️ 地図スタイル" },
  nightMode: { en: "🌙 Toggle Night Mode", zh: "🌙 夜间模式", ja: "🌙 ナイトモード" },
  savedCitiesTitle: { en: "⭐ Saved Cities", zh: "⭐ 收藏城市", ja: "⭐ 保存都市" },
  close: { en: "✖ Close", zh: "✖ 关闭", ja: "✖ 閉じる" },
  cancelCompare: { en: "❌ Cancel Comparison", zh: "❌ 取消比较", ja: "❌ 比較をやめる" },
  footer: { en: "Made by Cai Jiacheng | Hosted on GitHub", zh: "制作：蔡嘉诚 | 托管于GitHub", ja: "作成：蔡嘉誠 | GitHubでホスト中" },
  weatherTitle: { en: "Weather in", zh: "天气：", ja: "天気：" },
  humidity: { en: "Humidity", zh: "湿度", ja: "湿度" },
  temp: { en: "Temperature", zh: "温度", ja: "気温" },
  description: { en: "Description", zh: "天气", ja: "説明" },
  culturalInfo: { en: "Cultural Info", zh: "文化信息", ja: "文化情報" },
  languageLabel: { en: "Official Language(s):", zh: "官方语言：", ja: "公用語：" },
  food: { en: "Famous Food:", zh: "代表食物：", ja: "名物料理：" },
  greeting: { en: "Greeting:", zh: "问候语：", ja: "挨拶：" },
  etiquette: { en: "Etiquette:", zh: "礼仪：", ja: "マナー：" },
  noData: { en: "No data available.", zh: "暂无数据。", ja: "データなし。" },
  // ...可拓展更多文本
};

// 🌟 页面初始化
window.addEventListener("DOMContentLoaded", () => {
  bindLangSwitch();
  updateAllTexts();
  bindBtnEvents();
  setupTyping();
  hideCompareCards();
  hideLoading();
  initMap();
  // 默认加载一个城市，比如 Tokyo
  getWeather("Tokyo");
});

function bindLangSwitch() {
  document.getElementById("langEn").onclick = () => setLanguage("en");
  document.getElementById("langZh").onclick = () => setLanguage("zh");
  document.getElementById("langJa").onclick = () => setLanguage("ja");
}
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("language", lang);
  updateAllTexts();
  updateCardContents();
  updateCompareCardContents();
  updatePopupTexts();
}

function updateAllTexts() {
  document.getElementById("dynamicTitle").innerText = i18n.title[currentLang];
  document.getElementById("cityInput").placeholder = i18n.inputPlaceholder[currentLang];
  document.getElementById("searchBtn").innerText = `🔍 ${i18n.search[currentLang]}`;
  document.getElementById("locationBtn").innerText = i18n.useLocation[currentLang];
  document.getElementById("saveBtn").innerText = i18n.save[currentLang];
  document.getElementById("viewSavedBtn").innerText = i18n.viewSaved[currentLang];
  document.getElementById("compareBtn").innerText = i18n.compare[currentLang];
  document.getElementById("mapStyleBtn").innerText = i18n.mapStyle[currentLang];
  document.getElementById("nightModeBtn").innerText = i18n.nightMode[currentLang];
  document.getElementById("savedCitiesTitle").innerText = i18n.savedCitiesTitle[currentLang];
  document.getElementById("closeSavedBtn").innerText = i18n.close[currentLang];
  document.getElementById("cancelCompareBtn").innerText = i18n.cancelCompare[currentLang];
  document.getElementById("footerText").innerText = i18n.footer[currentLang];
}

function updatePopupTexts() {
  document.getElementById("savedCitiesTitle").innerText = i18n.savedCitiesTitle[currentLang];
  document.getElementById("closeSavedBtn").innerText = i18n.close[currentLang];
}

// ========== 卡片翻转相关 ===========
function bindBtnEvents() {
  document.getElementById("searchBtn").onclick = () => getWeather();
  document.getElementById("locationBtn").onclick = () => getLocationWeather();
  document.getElementById("saveBtn").onclick = () => saveCurrentCity();
  document.getElementById("viewSavedBtn").onclick = () => showSavedCities();
  document.getElementById("closeSavedBtn").onclick = () => closeSavedCities();
  document.getElementById("compareBtn").onclick = () => compareCities();
  document.getElementById("cancelCompareBtn").onclick = () => cancelCompare();
  document.getElementById("mainCard").onclick = () => toggleFlip("mainFlip");
  document.getElementById("compareFlip1").onclick = () => toggleFlip("compareFlip1");
  document.getElementById("compareFlip2").onclick = () => toggleFlip("compareFlip2");
}

function toggleFlip(id) {
  const flip = document.getElementById(id);
  if (flip) flip.classList.toggle("flipped");
}

// ========== 主卡片 & 比较卡片显示隐藏 ===========
function showMainCard() {
  document.getElementById("mainCard").style.display = "";
}
function hideMainCard() {
  document.getElementById("mainCard").style.display = "none";
}
function showCompareCards() {
  document.getElementById("compareCards").classList.remove("hidden");
}
function hideCompareCards() {
  document.getElementById("compareCards").classList.add("hidden");
  // 保证翻转状态重置
  document.getElementById("compareFlip1").classList.remove("flipped");
  document.getElementById("compareFlip2").classList.remove("flipped");
}

// ========== 加载动画 ===========
function showLoading() {
  document.getElementById("loadingOverlay").classList.add("active");
}
function hideLoading() {
  document.getElementById("loadingOverlay").classList.remove("active");
}

// ========== 打字动效 ===========
function setupTyping() {
  const textArr = [
    i18n.inputPlaceholder["en"],
    i18n.inputPlaceholder["zh"],
    i18n.inputPlaceholder["ja"]
  ];
  let i = 0;
  function typing() {
    document.getElementById("typingText").innerText = textArr[i];
    i = (i + 1) % textArr.length;
    setTimeout(typing, 2200);
  }
  typing();
}

// ========== 地图相关 ===========
let map, marker, currentCoords;
function initMap() {
  map = L.map('map').setView([35.6895, 139.6917], 5); // 默认东京
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
  map.on('click', function(e) {
    getWeatherByCoords(e.latlng.lat, e.latlng.lng);
  });
}

function setMapMarker(lat, lng) {
  if (marker) map.removeLayer(marker);
  marker = L.marker([lat, lng]).addTo(map);
  map.setView([lat, lng], 10);
}

// ========== 天气与文化API相关 ===========
let currentCityInfo = null;
function getWeather(cityName) {
  showLoading();
  if (!cityName) cityName = document.getElementById("cityInput").value || "Tokyo";
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=YOUR_OPENWEATHERMAP_KEY&units=metric&lang=${currentLang}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.cod === 200) {
        currentCoords = [data.coord.lat, data.coord.lon];
        setMapMarker(data.coord.lat, data.coord.lon);
        fetchCultureAndRender(cityName, data);
      } else {
        renderMainCard({error: true});
        hideLoading();
      }
    }).catch(() => {
      renderMainCard({error: true});
      hideLoading();
    });
}

function getWeatherByCoords(lat, lng) {
  showLoading();
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=YOUR_OPENWEATHERMAP_KEY&units=metric&lang=${currentLang}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.cod === 200) {
        setMapMarker(lat, lng);
        fetchCultureAndRender(data.name, data);
      } else {
        renderMainCard({error: true});
        hideLoading();
      }
    }).catch(() => {
      renderMainCard({error: true});
      hideLoading();
    });
}

function getLocationWeather() {
  if (navigator.geolocation) {
    showLoading();
    navigator.geolocation.getCurrentPosition(
      pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => { alert("Location access denied."); hideLoading(); }
    );
  } else {
    alert("Geolocation not supported.");
  }
}

function fetchCultureAndRender(city, weatherData) {
  fetch(`https://restcountries.com/v3.1/alpha/${weatherData.sys.country}`)
    .then(res => res.json())
    .then(countries => {
      let country = countries[0] || {};
      currentCityInfo = {city, weather: weatherData, country};
      renderMainCard({city, weather: weatherData, country});
      hideLoading();
    }).catch(() => {
      renderMainCard({city, weather: weatherData});
      hideLoading();
    });
}

// ========== 卡片内容渲染 ===========
function renderMainCard({city, weather, country, error}) {
  const front = document.getElementById("mainCardFront");
  const back = document.getElementById("mainCardBack");
  if (error) {
    front.innerHTML = `<b>${i18n.noData[currentLang]}</b>`;
    back.innerHTML = `<b>${i18n.noData[currentLang]}</b>`;
    return;
  }
  // Emoji简易判定
  let weatherEmoji = weather && weather.weather && weather.weather[0] ? getWeatherEmoji(weather.weather[0].main) : "❓";
  front.innerHTML = `
    <div style="font-size:2.3rem">${weatherEmoji}</div>
    <div style="margin-top:0.2em"><b>${i18n.weatherTitle[currentLang]} ${city}</b></div>
    <div>${i18n.temp[currentLang]}: <b>${Math.round(weather.main.temp)}°C</b></div>
    <div>${i18n.humidity[currentLang]}: <b>${weather.main.humidity}%</b></div>
    <div>${i18n.description[currentLang]}: <b>${weather.weather[0].description}</b></div>
  `;
  back.innerHTML = `
    <div><b>${i18n.culturalInfo[currentLang]}</b></div>
    <div>${i18n.languageLabel[currentLang]} ${(country.languages ? Object.values(country.languages).join(", ") : "-")}</div>
    <div>${i18n.food[currentLang]} ${country && country.name ? guessFood(country.name.common) : "-"}</div>
    <div>${i18n.greeting[currentLang]} ${countryTranslations[country.cca2]?.[currentLang]?.greeting || "-"}</div>
    <div>${i18n.etiquette[currentLang]} ${countryTranslations[country.cca2]?.[currentLang]?.etiquette || "-"}</div>
  `;
}

// 比较功能
let compareCityData = [null, null];
function compareCities() {
  if (!currentCityInfo) return alert("Get a city first!");
  compareCityData[0] = {...currentCityInfo};
  showLoading();
  const city2 = prompt("Enter the city to compare:");
  if (!city2) { hideLoading(); return; }
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city2}&appid=YOUR_OPENWEATHERMAP_KEY&units=metric&lang=${currentLang}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.cod === 200) {
        fetch(`https://restcountries.com/v3.1/alpha/${data.sys.country}`)
          .then(r => r.json())
          .then(countries => {
            let country = countries[0] || {};
            compareCityData[1] = {
              city: city2,
              weather: data,
              country
            };
            renderCompareCards();
            hideMainCard();
            showCompareCards();
            hideLoading();
          }).catch(() => { hideLoading(); });
      } else {
        hideLoading();
        alert(i18n.noData[currentLang]);
      }
    }).catch(() => { hideLoading(); });
}

function renderCompareCards() {
  for (let i = 0; i < 2; i++) {
    const front = document.getElementById(`compareCard${i + 1}Front`);
    const back = document.getElementById(`compareCard${i + 1}Back`);
    const data = compareCityData[i];
    if (!data) {
      front.innerHTML = i18n.noData[currentLang];
      back.innerHTML = i18n.noData[currentLang];
      continue;
    }
    let weatherEmoji = data.weather && data.weather.weather && data.weather.weather[0] ? getWeatherEmoji(data.weather.weather[0].main) : "❓";
    front.innerHTML = `
      <div style="font-size:2.3rem">${weatherEmoji}</div>
      <div style="margin-top:0.2em"><b>${i18n.weatherTitle[currentLang]} ${data.city}</b></div>
      <div>${i18n.temp[currentLang]}: <b>${Math.round(data.weather.main.temp)}°C</b></div>
      <div>${i18n.humidity[currentLang]}: <b>${data.weather.main.humidity}%</b></div>
      <div>${i18n.description[currentLang]}: <b>${data.weather.weather[0].description}</b></div>
    `;
    back.innerHTML = `
      <div><b>${i18n.culturalInfo[currentLang]}</b></div>
      <div>${i18n.languageLabel[currentLang]} ${(data.country.languages ? Object.values(data.country.languages).join(", ") : "-")}</div>
      <div>${i18n.food[currentLang]} ${data.country && data.country.name ? guessFood(data.country.name.common) : "-"}</div>
      <div>${i18n.greeting[currentLang]} ${countryTranslations[data.country.cca2]?.[currentLang]?.greeting || "-"}</div>
      <div>${i18n.etiquette[currentLang]} ${countryTranslations[data.country.cca2]?.[currentLang]?.etiquette || "-"}</div>
    `;
  }
}
function updateCardContents() {
  if (currentCityInfo) renderMainCard(currentCityInfo);
}
function updateCompareCardContents() {
  if (compareCityData[0] && compareCityData[1]) renderCompareCards();
}
function cancelCompare() {
  hideCompareCards();
  showMainCard();
}

// ========== 简易文化模板 ===========
const countryTranslations = {
  JP: {
    en: { greeting: "Hello (こんにちは Konnichiwa)", etiquette: "Take off shoes indoors" },
    zh: { greeting: "你好（こんにちは）", etiquette: "进屋脱鞋" },
    ja: { greeting: "こんにちは", etiquette: "家に入るとき靴を脱ぐ" }
  },
  CN: {
    en: { greeting: "Hello (你好 Nǐ hǎo)", etiquette: "Respect elders" },
    zh: { greeting: "你好", etiquette: "尊重长辈" },
    ja: { greeting: "ニーハオ", etiquette: "年長者を敬う" }
  },
  // 可继续丰富其他国家
};

// 菜单食物小功能（可拓展）
function guessFood(name) {
  if (name === "Japan") return currentLang === "ja" ? "寿司・ラーメン" : currentLang === "zh" ? "寿司，拉面" : "Sushi, Ramen";
  if (name === "China") return currentLang === "ja" ? "餃子・火鍋" : currentLang === "zh" ? "饺子，火锅" : "Dumplings, Hotpot";
  if (name === "France") return currentLang === "ja" ? "パン・ワイン" : currentLang === "zh" ? "面包，红酒" : "Bread, Wine";
  if (name === "United States") return currentLang === "ja" ? "ハンバーガー" : currentLang === "zh" ? "汉堡包" : "Burger";
  return "-";
}

// 天气Emoji辅助
function getWeatherEmoji(main) {
  if (!main) return "❓";
  if (/cloud/i.test(main)) return "⛅️";
  if (/rain/i.test(main)) return "🌧️";
  if (/sun|clear/i.test(main)) return "☀️";
  if (/snow/i.test(main)) return "❄️";
  if (/storm|thunder/i.test(main)) return "⛈️";
  return "🌈";
}

// ========== 收藏城市 =============
function saveCurrentCity() {
  if (!currentCityInfo || !currentCityInfo.city) return;
  let saved = JSON.parse(localStorage.getItem("savedCities") || "[]");
  if (!saved.find(c => c.city === currentCityInfo.city)) {
    saved.push({ ...currentCityInfo, lang: currentLang });
    localStorage.setItem("savedCities", JSON.stringify(saved));
    alert("Saved!");
  } else {
    alert("Already saved.");
  }
}
function showSavedCities() {
  const popup = document.getElementById("savedCitiesPopup");
  const list = document.getElementById("savedCitiesList");
  list.innerHTML = "";
  let saved = JSON.parse(localStorage.getItem("savedCities") || "[]");
  saved.forEach(c => {
    const li = document.createElement("li");
    li.innerText = c.city;
    li.onclick = () => { getWeather(c.city); closeSavedCities(); };
    list.appendChild(li);
  });
  popup.classList.remove("hidden");
}
function closeSavedCities() {
  document.getElementById("savedCitiesPopup").classList.add("hidden");
}
