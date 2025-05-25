/**
 * Script pour corriger les problèmes spécifiques avec certaines provinces
 * Ce script s'exécute après le chargement de la carte et ajoute des correctifs spécifiques
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Province-fixes.js chargé');
    
    // Fonction pour afficher manuellement la météo pour une province spécifique
    window.showSpecificProvinceWeather = function(provinceName) {
        console.log(`Affichage manuel de la météo pour ${provinceName}`);
        
        // Liste des provinces problématiques avec leurs noms exacts dans le fichier JSON
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
        
        // Vérifier si c'est une province problématique
        let apiProvinceName = provinceName;
        for (const [key, value] of Object.entries(problematicProvinces)) {
            if (provinceName.toLowerCase().includes(key.toLowerCase())) {
                apiProvinceName = value;
                console.log(`Province problématique détectée: ${provinceName} -> ${apiProvinceName}`);
                break;
            }
        }
        
        // Appeler l'API météo avec le nom correct
        fetch(`/api/weather/${apiProvinceName}`)
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
                    console.log('Météo ajoutée manuellement au panneau d\'information');
                } else {
                    console.error('Panneau d\'information non trouvé (ID: region-info)');
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données météo:', error);
            });
    };
    
    // Observer les changements dans le DOM pour détecter quand une province est sélectionnée
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.target.id === 'region-info') {
                const h3Element = mutation.target.querySelector('h3');
                if (h3Element) {
                    const provinceName = h3Element.textContent;
                    
                    // Vérifier si c'est une province problématique
                    if (provinceName.toLowerCase().includes('kelaa') || 
                        provinceName.toLowerCase().includes('kelâa') ||
                        provinceName.toLowerCase().includes('skhirate') ||
                        provinceName.toLowerCase().includes('skhirat') ||
                        provinceName.toLowerCase().includes('temara')) {
                        
                        console.log(`Province problématique détectée dans le DOM: ${provinceName}`);
                        setTimeout(() => {
                            // Vérifier si la météo est déjà affichée
                            const weatherCard = document.querySelector('.weather-card');
                            if (!weatherCard) {
                                console.log('Aucune météo affichée, affichage manuel...');
                                window.showSpecificProvinceWeather(provinceName);
                            }
                        }, 500); // Attendre un peu pour laisser le temps au code normal de s'exécuter
                    }
                }
            }
        });
    });
    
    // Observer les changements dans le panneau d'information
    observer.observe(document.getElementById('region-info'), { childList: true, subtree: true });
});
