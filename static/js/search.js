/**
 * Gestion de la recherche de régions et provinces
 */

document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const searchToggle = document.getElementById('search-toggle');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // Liste de toutes les régions et provinces pour la recherche
    let searchData = {
        regions: [],
        provinces: []
    };

    // Charger les données pour la recherche
    loadSearchData();

    // Afficher/masquer la barre de recherche
    searchToggle.addEventListener('click', function() {
        searchBar.classList.toggle('active');
        if (searchBar.classList.contains('active')) {
            setTimeout(() => searchInput.focus(), 300);
        }
    });

    // Gérer la soumission de la recherche
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    /**
     * Charge les données des régions et provinces pour la recherche
     */
    function loadSearchData() {
        // Charger les données des régions
        fetch('/static/data/regions.json')
            .then(response => response.json())
            .then(data => {
                searchData.regions = data.map(region => ({
                    id: region.id,
                    name: region.nom,
                    type: 'region'
                }));
                console.log('Données des régions chargées pour la recherche:', searchData.regions);
            })
            .catch(error => console.error('Erreur lors du chargement des régions pour la recherche:', error));

        // Charger les données des provinces
        fetch('/static/data/province_details.json')
            .then(response => response.json())
            .then(data => {
                // Convertir l'objet en tableau
                searchData.provinces = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    name: key,
                    region: value.region,
                    type: 'province'
                }));
                console.log('Données des provinces chargées pour la recherche:', searchData.provinces);
            })
            .catch(error => console.error('Erreur lors du chargement des provinces pour la recherche:', error));
    }

    /**
     * Effectue la recherche et affiche les résultats
     */
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (query.length < 2) {
            showNotification('Veuillez entrer au moins 2 caractères pour la recherche.');
            return;
        }

        // Rechercher dans les régions
        const matchingRegions = searchData.regions.filter(region => 
            normalizeText(region.name).includes(normalizeText(query))
        );

        // Rechercher dans les provinces
        const matchingProvinces = searchData.provinces.filter(province => 
            normalizeText(province.name).includes(normalizeText(query))
        );

        // Afficher les résultats
        if (matchingRegions.length > 0 || matchingProvinces.length > 0) {
            showSearchResults(matchingRegions, matchingProvinces);
        } else {
            showNotification('Aucun résultat trouvé pour votre recherche.');
        }
    }

    /**
     * Affiche les résultats de la recherche
     */
    function showSearchResults(regions, provinces) {
        // Créer le contenu HTML pour les résultats
        let resultsHTML = '<div class="search-results">';
        
        // Ajouter les régions trouvées
        if (regions.length > 0) {
            resultsHTML += '<div class="search-category"><h4>Régions</h4>';
            regions.forEach(region => {
                resultsHTML += `
                    <div class="search-result-item" data-type="region" data-id="${region.id}">
                        <i class="fas fa-map-marked-alt"></i>
                        <span>${region.name}</span>
                    </div>
                `;
            });
            resultsHTML += '</div>';
        }
        
        // Ajouter les provinces trouvées
        if (provinces.length > 0) {
            resultsHTML += '<div class="search-category"><h4>Provinces</h4>';
            provinces.forEach(province => {
                resultsHTML += `
                    <div class="search-result-item" data-type="province" data-id="${province.id}" data-region="${province.region}">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${province.name}</span>
                        <small>(${province.region})</small>
                    </div>
                `;
            });
            resultsHTML += '</div>';
        }
        
        resultsHTML += '</div>';
        
        // Afficher les résultats
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results-container';
        resultsContainer.innerHTML = resultsHTML;
        
        // Supprimer les résultats précédents s'ils existent
        const oldResults = document.querySelector('.search-results-container');
        if (oldResults) {
            oldResults.remove();
        }
        
        // Ajouter les nouveaux résultats
        searchBar.appendChild(resultsContainer);
        
        // Ajouter les écouteurs d'événements pour les résultats
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                const id = this.getAttribute('data-id');
                
                if (type === 'region') {
                    selectRegionByName(id);
                } else if (type === 'province') {
                    const regionName = this.getAttribute('data-region');
                    selectProvinceInRegion(id, regionName);
                }
                
                // Fermer les résultats de recherche
                resultsContainer.remove();
                searchBar.classList.remove('active');
            });
        });
    }

    /**
     * Sélectionne une région par son nom
     */
    function selectRegionByName(regionName) {
        // Trouver la région sur la carte et simuler un clic
        if (regionsLayer) {
            let found = false;
            
            regionsLayer.eachLayer(function(layer) {
                const layerRegionName = layer.feature.properties.name_2 || 
                                      layer.feature.properties.localnam_2;
                
                if (layerRegionName && normalizeText(layerRegionName) === normalizeText(regionName)) {
                    // Simuler un clic sur cette région
                    layer.fire('click');
                    found = true;
                    return;
                }
            });
            
            if (!found) {
                showNotification(`Région "${regionName}" non trouvée sur la carte.`);
            }
        } else {
            showNotification('La carte des régions n\'est pas disponible.');
        }
    }

    /**
     * Sélectionne une province dans une région
     */
    function selectProvinceInRegion(provinceName, regionName) {
        // D'abord sélectionner la région
        selectRegionByName(regionName);
        
        // Attendre que les provinces soient chargées
        setTimeout(() => {
            // Puis sélectionner la province
            selectProvinceByName(provinceName);
        }, 1000); // Attendre 1 seconde pour que les provinces se chargent
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

    /**
     * Normalise un texte (supprime les accents, met en minuscule)
     */
    function normalizeText(text) {
        return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }
});
