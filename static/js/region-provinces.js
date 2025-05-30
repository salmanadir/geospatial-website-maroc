/**
 * Gestion des interactions avec les provinces dans le panneau d'information
 */

document.addEventListener('DOMContentLoaded', function() {
    // Délégation d'événements pour les interactions avec les provinces
    document.body.addEventListener('click', function(e) {
        // Gestion du clic sur le bouton toggle des provinces
        if (e.target.closest('#toggle-provinces')) {
            const toggleBtn = document.getElementById('toggle-provinces');
            const provincesContainer = document.getElementById('provinces-container');
            const provincesList = document.getElementById('provinces-list');
            
            toggleBtn.classList.toggle('active');
            
            if (provincesList.style.maxHeight === '0px' || !provincesList.style.maxHeight) {
                // Afficher la liste avec une animation
                provincesList.style.maxHeight = provincesList.scrollHeight + 'px';
                provincesList.style.overflow = 'auto';
            } else {
                // Masquer la liste avec une animation
                provincesList.style.maxHeight = '0px';
                // Attendre la fin de l'animation pour masquer le scroll
                setTimeout(() => {
                    if (provincesList.style.maxHeight === '0px') {
                        provincesList.style.overflow = 'hidden';
                    }
                }, 400);
            }
        }
        
        // Gestion du clic sur une carte de province
        const provinceCard = e.target.closest('.province-card');
        if (provinceCard) {
            const provinceName = provinceCard.getAttribute('data-province');
            if (provinceName) {
                // Simuler un clic sur la province correspondante sur la carte
                selectProvinceByName(provinceName);
            }
        }
        
        // Gestion du clic sur le bouton "Voir toutes les provinces"
        if (e.target.closest('#show-all-provinces')) {
            showAllProvinces();
        }
    });
    
    /**
     * Affiche toutes les provinces de la région sélectionnée dans une fenêtre modale
     */
    function showAllProvinces() {
        // Vérifier si une région est sélectionnée
        if (!selectedRegion) {
            showNotification('Aucune région sélectionnée.');
            return;
        }
        
        // Récupérer le nom de la région
        const regionName = selectedRegion.feature.properties.name_2 || 
                          selectedRegion.feature.properties.localnam_2 || 
                          'Région';
                          
        // Récupérer les provinces de la région
        const { provinces } = getProvincesForRegion(normalizeRegionName(regionName));
        
        if (!provinces || provinces.length === 0) {
            showNotification('Aucune province trouvée pour cette région.');
            return;
        }
        
        // Créer le contenu HTML pour la fenêtre modale
        let modalHTML = `
            <div class="modal-header">
                <h3>Provinces de ${regionName}</h3>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="provinces-grid">
        `;
        
        // Trier les provinces par population (de la plus peuplée à la moins peuplée)
        const sortedProvinces = [...provinces].sort((a, b) => b.population - a.population);
        
        sortedProvinces.forEach(province => {
            modalHTML += `
                <div class="province-modal-card" data-province="${province.nom}">
                    <div class="province-modal-name">${province.nom}</div>
                    <div class="province-modal-stats">
                        <div class="province-modal-stat">
                            <i class="fas fa-users"></i>
                            <span>${province.population.toLocaleString()} hab.</span>
                        </div>
                    </div>
                    <button class="view-province-details-btn" data-province="${province.nom}">
                        <i class="fas fa-info-circle"></i> Détails
                    </button>
                </div>
            `;
        });
        
        modalHTML += `
                </div>
            </div>
        `;
        
        // Créer la fenêtre modale
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                ${modalHTML}
            </div>
        `;
        
        // Ajouter la fenêtre modale au document
        document.body.appendChild(modal);
        
        // Afficher la fenêtre modale avec une animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Gérer la fermeture de la fenêtre modale
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
        
        // Gérer le clic sur le bouton "Détails" d'une province
        modal.querySelectorAll('.view-province-details-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const provinceName = this.getAttribute('data-province');
                selectProvinceByName(provinceName);
                
                // Fermer la fenêtre modale
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });
        });
    }
    
    /**
     * Affiche une notification
     */
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Afficher la notification
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Masquer et supprimer la notification après 3 secondes
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});

/**
 * Sélectionne une province par son nom
 * @param {string} provinceName - Nom de la province à sélectionner
 */
function selectProvinceByName(provinceName) {
    console.log(`Sélection de la province: ${provinceName}`);
    
    // Si nous sommes actuellement en vue des régions, nous devons d'abord charger les provinces
    if (currentView === 'regions' && selectedRegion) {
        // Stocker le nom de la province à sélectionner dans une variable globale
        window.provinceToSelect = provinceName;
        
        // Charger les provinces de la région sélectionnée
        loadProvinces(selectedRegion.properties.name_2 || selectedRegion.properties.localnam_2);
        
        // Attendre que les provinces soient chargées avant de sélectionner la province spécifique
        // Utiliser un intervalle pour vérifier régulièrement si les provinces sont chargées
        const checkInterval = setInterval(() => {
            if (provincesLayer) {
                clearInterval(checkInterval);
                setTimeout(() => {
                    findAndSelectProvince(provinceName);
                }, 300);
            }
        }, 100);
    } else if (currentView === 'provinces') {
        // Si nous sommes déjà en vue des provinces, sélectionner directement la province
        findAndSelectProvince(provinceName);
    }
}

/**
 * Trouve et sélectionne une province dans la couche des provinces
 * @param {string} provinceName - Nom de la province à sélectionner
 */
function findAndSelectProvince(provinceName) {
    if (!provincesLayer) {
        console.warn('La couche des provinces n\'est pas disponible');
        return;
    }
    
    let found = false;
    let bestMatch = null;
    let bestMatchScore = 0;
    
    // Normaliser le nom de province recherché
    const normalizedSearchName = normalizeProvinceName(provinceName);
    console.log(`Recherche de la province normalisée: ${normalizedSearchName}`);
    
    // Parcourir toutes les provinces pour trouver la meilleure correspondance
    provincesLayer.eachLayer(function(layer) {
        // Essayer de trouver le nom de la province dans différentes propriétés
        const props = layer.feature.properties;
        let layerProvinceName = '';
        
        // Parcourir toutes les propriétés pour trouver celle qui contient le nom
        for (const key in props) {
            if (key.toLowerCase().includes('name') || 
                key.toLowerCase().includes('nom') || 
                key.toLowerCase().includes('province')) {
                if (props[key] && typeof props[key] === 'string') {
                    layerProvinceName = props[key];
                    break;
                }
            }
        }
        
        // Si aucun nom n'a été trouvé, essayer d'utiliser d'autres propriétés
        if (!layerProvinceName) {
            layerProvinceName = props.name_2 || props.localnam_2 || props.NAME_2 || 
                               props.name || props.Province || props.NAME || '';
        }
        
        if (layerProvinceName) {
            const normalizedLayerName = normalizeProvinceName(layerProvinceName);
            
            // Vérifier si les noms correspondent exactement
            if (normalizedLayerName === normalizedSearchName) {
                bestMatch = layer;
                bestMatchScore = 100; // Score parfait
                return; // Sortir de la boucle, nous avons trouvé une correspondance exacte
            }
            
            // Vérifier si le nom de la province contient le nom recherché ou vice versa
            if (normalizedLayerName.includes(normalizedSearchName) || normalizedSearchName.includes(normalizedLayerName)) {
                const score = Math.min(normalizedLayerName.length, normalizedSearchName.length) / 
                              Math.max(normalizedLayerName.length, normalizedSearchName.length) * 90;
                if (score > bestMatchScore) {
                    bestMatch = layer;
                    bestMatchScore = score;
                }
            }
        }
    });
    
    // Si nous avons trouvé une correspondance, simuler un clic sur cette province
    if (bestMatch) {
        console.log(`Province trouvée avec un score de ${bestMatchScore}%: ${bestMatch.feature.properties.name_2 || bestMatch.feature.properties.localnam_2 || bestMatch.feature.properties.NAME_2}`);
        bestMatch.fire('click');
        
        // Centrer la carte sur cette province
        map.fitBounds(bestMatch.getBounds());
        found = true;
    }
    
    if (!found) {
        console.warn(`Province non trouvée sur la carte: ${provinceName}`);
    }
}

/**
 * Améliore les infobulles pour afficher des informations plus détaillées
 * @param {Object} feature - Caractéristique GeoJSON
 * @param {Object} layer - Couche Leaflet
 */
function enhanceTooltip(feature, layer) {
    const props = feature.properties;
    const name = props.name_2 || props.localnam_2 || props.NAME_2 || 'Non disponible';
    
    // Récupérer les données détaillées de la province ou région
    let population = 'Non disponible';
    let superficie = 'Non disponible';
    let densite = 'Non disponible';
    
    if (currentView === 'regions') {
        // Pour les régions
        const normalizedName = normalizeRegionName(name);
        const regionCode = regionCodeMapping[normalizedName];
        const regionData = regionCode ? regionDetails[regionCode] : null;
        
        if (regionData) {
            population = regionData.population ? regionData.population.toLocaleString() : 'Non disponible';
            superficie = regionData.superficie ? regionData.superficie.toLocaleString() : 'Non disponible';
            densite = regionData.densite ? regionData.densite.toLocaleString() : 'Non disponible';
        }
    } else {
        // Pour les provinces
        const normalizedName = normalizeProvinceName(name);
        const provinceData = provinceDetails[normalizedName];
        
        if (provinceData) {
            population = provinceData.population ? provinceData.population.toLocaleString() : 'Non disponible';
            superficie = provinceData.superficie ? provinceData.superficie.toLocaleString() : 'Non disponible';
            densite = provinceData.densite ? provinceData.densite.toLocaleString() : 'Non disponible';
        }
    }
    
    // Créer un contenu d'infobulle amélioré
    const tooltipContent = `
        <div class="enhanced-tooltip">
            <div class="tooltip-header">${name}</div>
            <div class="tooltip-data">
                <div class="tooltip-row">
                    <span class="tooltip-label">Population:</span>
                    <span class="tooltip-value">${population} hab.</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Superficie:</span>
                    <span class="tooltip-value">${superficie} km²</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Densité:</span>
                    <span class="tooltip-value">${densite} hab/km²</span>
                </div>
            </div>
        </div>
    `;
    
    // Appliquer l'infobulle améliorée
    layer.bindTooltip(tooltipContent, {
        sticky: true,
        direction: 'top',
        offset: [0, -10],
        opacity: 0.9,
        className: 'custom-tooltip'
    });
}
