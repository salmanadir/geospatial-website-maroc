// weather_improved.js

// Fonction partagée
function normalizeName(name) {
  if (!name) return '';
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/--/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Afficher météo avec loader & gestion erreur
function showProvinceWeather(provinceName) {
  const infoPanel = document.getElementById('region-info');
  if (!infoPanel) return;

  // Supprime météo précédente
  const oldWeather = infoPanel.querySelector('.weather-card');
  if (oldWeather) oldWeather.remove();

  // Ajout loader
  const loader = document.createElement('p');
  loader.className = 'loading';
  loader.textContent = `Chargement météo pour ${provinceName}...`;
  infoPanel.appendChild(loader);

  fetch(`/api/weather/${normalizeName(provinceName)}`)
    .then(res => {
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      return res.json();
    })
    .then(data => {
      loader.remove();
      if (data.error) throw new Error(data.error);

      const weatherHtml = `
        <div class="weather-card">
          <h4>Météo à ${data.city} <span class="weather-time">${data.timestamp}</span></h4>
          <div class="weather-content">
            <div class="weather-icon">
              <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png" alt="${data.description}" />
            </div>
            <div class="weather-details">
              <div class="temperature">${data.temperature}°C</div>
              <div class="description">${data.description}</div>
              <div class="feels-like">Ressenti: ${data.feels_like}°C</div>
              <div class="extra-info">
                <span><i class="fas fa-tint"></i> ${data.humidity}%</span>
                <span><i class="fas fa-wind"></i> ${data.wind_speed} m/s</span>
              </div>
            </div>
          </div>
        </div>
      `;
      infoPanel.innerHTML += weatherHtml;
    })
    .catch(err => {
      loader.remove();
      const errMsg = document.createElement('p');
      errMsg.style.color = 'red';
      errMsg.textContent = `Impossible de charger la météo : ${err.message}`;
      infoPanel.appendChild(errMsg);
      console.error(err);
    });
}
