/**
 * Module pour la gestion des données météorologiques
 * Utilise l'API OpenWeatherMap pour récupérer les données météo en temps réel
 */

// Fonction pour récupérer et afficher la météo d'une province
function showProvinceWeather(provinceName) {
    console.log(`Récupération de la météo pour: ${provinceName}`);
    
    // Normaliser le nom de la province pour l'API
    const normalizedProvinceName = normalizeProvinceName(provinceName);
    
    fetch(`/api/weather/${normalizedProvinceName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Erreur météo:', data.error);
                return;
            }
            
            // Créer l'élément HTML pour afficher la météo
            const weatherHtml = `
                <div class="weather-card">
                    <h4>Météo à ${data.city} <span class="weather-time">${data.timestamp}</span></h4>
                    <div class="weather-content">
                        <div class="weather-icon">
                            <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png" alt="${data.description}">
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
            
            // Ajouter la météo au panneau d'information
            const infoPanel = document.getElementById('region-info');
            if (infoPanel) {
                // Supprimer les cartes météo existantes
                const existingWeatherCards = infoPanel.querySelectorAll('.weather-card');
                existingWeatherCards.forEach(card => card.remove());
                
                // Ajouter la nouvelle carte météo après les informations principales
                infoPanel.innerHTML += weatherHtml;
                console.log('Météo ajoutée au panneau d\'information');
            } else {
                console.error('Panneau d\'information non trouvé (ID: region-info)');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données météo:', error);
        });
}

// Fonction pour normaliser le nom de la province pour l'API
function normalizeProvinceName(name) {
    // Remplacer les caractères spéciaux et les espaces multiples
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
               .replace(/--/g, "-")
               .replace(/-+/g, "-")
               .trim();
}

// Fonction pour afficher la météo d'une région (utilise la capitale de la région)
function showRegionWeather(regionName, capitalName) {
    if (capitalName) {
        showProvinceWeather(capitalName);
    } else {
        console.log("Pas de capitale définie pour cette région");
    }
}
