// province-fixes_improved.js

document.addEventListener('DOMContentLoaded', () => {
  const problematicProvinces = {
    'El-Kelâa-des-Sraghna': 'El-Kelâa-des--Sraghna',
    'El Kelâa des Sraghna': 'El-Kelâa-des--Sraghna',
    'Kelaa': 'El-Kelâa-des--Sraghna',
    'El Kelaa': 'El-Kelâa-des--Sraghna',
    'Skhirate-Temara': 'Skhirate--Temara',
    'Skhirate Temara': 'Skhirate--Temara',
    'Temara': 'Skhirate--Temara',
    'Skhirat': 'Skhirate--Temara'
  };

  function normalizeName(name) {
    if (!name) return '';
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/--/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function showSpecificProvinceWeather(provinceName) {
    let apiProvinceName = provinceName;
    for (const [key, value] of Object.entries(problematicProvinces)) {
      if (provinceName.toLowerCase().includes(key.toLowerCase())) {
        apiProvinceName = value;
        break;
      }
    }
    fetch(`/api/weather/${normalizeName(apiProvinceName)}`)
      .then(res => {
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.error) return;

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

        const infoPanel = document.getElementById('region-info');
        if (infoPanel) {
          const existing = infoPanel.querySelector('.weather-card');
          if (existing) existing.remove();
          infoPanel.innerHTML += weatherHtml;
        }
      })
      .catch(console.error);
  }

  // Observer mutations pour détecter changement province sélectionnée
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.target.id === 'region-info') {
        const h3 = mutation.target.querySelector('h3');
        if (!h3) return;
        const provinceName = h3.textContent;
        if (provinceName.toLowerCase().match(/kelaa|kelâa|skhirate|skhirat|temara/)) {
          setTimeout(() => {
            if (!document.querySelector('.weather-card')) {
              showSpecificProvinceWeather(provinceName);
            }
          }, 500);
        }
      }
    });
  });

  observer.observe(document.getElementById('region-info'), { childList: true, subtree: true });
});
