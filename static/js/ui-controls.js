/**
 * UI Controls pour la Carte Interactive du Maroc
 * Gère les fonctionnalités d'interface utilisateur avancées
 */

document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const themeToggle = document.getElementById('theme-toggle');
    const heatmapToggle = document.getElementById('heatmap-toggle');
    const uvToggle = document.getElementById('uv-toggle');
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    const panelToggle = document.getElementById('panel-toggle');
    const closePanel = document.getElementById('close-panel');
    const infoPanel = document.getElementById('info-panel');
    const heatmapLegend = document.getElementById('heatmap-legend');
    const uvLegend = document.getElementById('uv-legend');
    
    // État initial
    let darkMode = false;
    let fullscreenMode = false;
    
    // Gestionnaire de thème (clair/sombre)
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            darkMode = !darkMode;
            document.body.classList.toggle('dark-theme', darkMode);
            themeToggle.innerHTML = darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            
            // Ajouter des classes CSS pour le thème sombre
            if (darkMode) {
                document.documentElement.style.setProperty('--bg-color', '#1a1a1a');
                document.documentElement.style.setProperty('--text-color', '#f0f0f0');
                document.documentElement.style.setProperty('--panel-bg', '#2a2a2a');
                document.documentElement.style.setProperty('--header-bg', '#222');
            } else {
                document.documentElement.style.setProperty('--bg-color', '#f4f4f4');
                document.documentElement.style.setProperty('--text-color', '#333');
                document.documentElement.style.setProperty('--panel-bg', '#fff');
                document.documentElement.style.setProperty('--header-bg', '#2c3e50');
            }
        });
    }
    
    // Gestionnaire de carte de chaleur
    if (heatmapToggle) {
        heatmapToggle.addEventListener('click', function() {
            const isActive = heatmapToggle.classList.toggle('active');
            
            // Afficher/masquer la légende
            if (heatmapLegend) {
                heatmapLegend.classList.toggle('visible', isActive);
            }
            
            // Désactiver l'autre mode si actif
            if (isActive && uvToggle.classList.contains('active')) {
                uvToggle.classList.remove('active');
                if (uvLegend) uvLegend.classList.remove('visible');
                
                // Appeler la fonction existante pour désactiver le mode UV
                if (typeof toggleUVMode === 'function') {
                    toggleUVMode(false);
                }
            }
            
            // Appeler la fonction existante pour activer/désactiver la carte de chaleur
            if (typeof toggleHeatmap === 'function') {
                toggleHeatmap(isActive);
            }
        });
    }
    
    // Gestionnaire d'indice UV
    if (uvToggle) {
        uvToggle.addEventListener('click', function() {
            const isActive = uvToggle.classList.toggle('active');
            
            // Afficher/masquer la légende
            if (uvLegend) {
                uvLegend.classList.toggle('visible', isActive);
            }
            
            // Désactiver l'autre mode si actif
            if (isActive && heatmapToggle.classList.contains('active')) {
                heatmapToggle.classList.remove('active');
                if (heatmapLegend) heatmapLegend.classList.remove('visible');
                
                // Appeler la fonction existante pour désactiver la carte de chaleur
                if (typeof toggleHeatmap === 'function') {
                    toggleHeatmap(false);
                }
            }
            
            // Appeler la fonction existante pour activer/désactiver le mode UV
            if (typeof toggleUVMode === 'function') {
                toggleUVMode(isActive);
            }
        });
    }
    
    // Gestionnaire de plein écran
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', function() {
            if (!fullscreenMode) {
                // Passer en plein écran
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                }
                fullscreenToggle.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                // Quitter le plein écran
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
            }
            fullscreenMode = !fullscreenMode;
        });
    }
    
    // Gestionnaire du panneau mobile
    if (panelToggle && infoPanel) {
        panelToggle.addEventListener('click', function() {
            infoPanel.classList.toggle('visible');
        });
    }
    
    // Fermer le panneau mobile
    if (closePanel && infoPanel) {
        closePanel.addEventListener('click', function() {
            infoPanel.classList.remove('visible');
        });
    }
    
    // Ajouter des variables CSS pour les thèmes
    document.documentElement.style.setProperty('--bg-color', '#f4f4f4');
    document.documentElement.style.setProperty('--text-color', '#333');
    document.documentElement.style.setProperty('--panel-bg', '#fff');
    document.documentElement.style.setProperty('--header-bg', '#2c3e50');
    
    // Adapter la hauteur de la carte sur mobile
    function adjustMapHeight() {
        if (window.innerWidth <= 768) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const footerHeight = document.querySelector('footer').offsetHeight;
            const mapHeight = window.innerHeight - headerHeight - footerHeight;
            document.getElementById('map').style.height = mapHeight + 'px';
        } else {
            document.getElementById('map').style.height = '100%';
        }
    }
    
    // Ajuster la hauteur de la carte au chargement et au redimensionnement
    window.addEventListener('resize', adjustMapHeight);
    adjustMapHeight();
    
    // Gestion de la barre de recherche
    const searchToggle = document.getElementById('search-toggle');
    const searchBar = document.getElementById('search-bar');
    
    if (searchToggle && searchBar) {
        searchToggle.addEventListener('click', function() {
            searchBar.classList.toggle('active');
            
            // Focus sur le champ de recherche lorsque la barre est affichée
            if (searchBar.classList.contains('active')) {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    setTimeout(() => {
                        searchInput.focus();
                    }, 300);
                }
            }
        });
        
        // Fermer la barre de recherche lorsque l'utilisateur clique en dehors
        document.addEventListener('click', function(e) {
            if (searchBar.classList.contains('active') && 
                !searchBar.contains(e.target) && 
                e.target !== searchToggle && 
                !searchToggle.contains(e.target)) {
                searchBar.classList.remove('active');
                
                // Supprimer également les résultats de recherche
                const searchResults = document.querySelector('.search-results-container');
                if (searchResults) {
                    searchResults.remove();
                }
            }
        });
    }
});

/**
 * Fonction pour activer/désactiver la carte de chaleur
 * Cette fonction est appelée par le gestionnaire d'événements du bouton de carte de chaleur
 * et peut être utilisée par d'autres scripts
 * @param {boolean} active - Indique si la carte de chaleur doit être activée ou désactivée
 */
function toggleHeatmap(active) {
    // Cette fonction sera définie ou remplacée dans le fichier principal map.js
    console.log('Carte de chaleur ' + (active ? 'activée' : 'désactivée'));
}

/**
 * Fonction pour activer/désactiver le mode UV
 * Cette fonction est appelée par le gestionnaire d'événements du bouton UV
 * et peut être utilisée par d'autres scripts
 * @param {boolean} active - Indique si le mode UV doit être activé ou désactivé
 */
function toggleUVMode(active) {
    // Cette fonction sera définie ou remplacée dans le fichier principal map.js
    console.log('Mode UV ' + (active ? 'activé' : 'désactivé'));
}

// Ajouter des styles CSS dynamiques pour le thème sombre
const darkThemeStyles = `
.dark-theme {
    --bg-color: #1a1a1a;
    --text-color: #f0f0f0;
    --panel-bg: #2a2a2a;
    --header-bg: #222;
}

.dark-theme body {
    background-color: var(--bg-color);
    color: var(--text-color);
}

.dark-theme header {
    background-color: var(--header-bg);
}

.dark-theme #info-panel {
    background-color: var(--panel-bg);
    color: var(--text-color);
}

.dark-theme #info-panel h2 {
    color: var(--text-color);
    border-bottom-color: #444;
}

.dark-theme .region-detail {
    background-color: rgba(255, 255, 255, 0.05);
}

.dark-theme .region-detail:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .map-control-button {
    background-color: var(--panel-bg);
    color: var(--text-color);
}

.dark-theme .map-legend {
    background-color: rgba(42, 42, 42, 0.9);
    color: var(--text-color);
}

.dark-theme .legend-title {
    color: var(--text-color);
}
`;

// Ajouter les styles pour le thème sombre
const styleElement = document.createElement('style');
styleElement.textContent = darkThemeStyles;
document.head.appendChild(styleElement);
