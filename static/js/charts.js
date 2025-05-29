// Variables pour le graphique
let provincesChart = null;

// Définir currentView s'il n'existe pas encore
if (typeof window.currentView === 'undefined') {
    window.currentView = 'regions';
}

// Fonction pour créer un graphique à barres des provinces d'une région
function createProvincesChart(provinces) {
    console.log('Création du graphique pour', provinces.length, 'provinces');
    
    // Trier les provinces par population (du plus grand au plus petit)
    provinces.sort((a, b) => b.population - a.population);
    
    // Limiter à 10 provinces maximum pour la lisibilité
    const displayProvinces = provinces.slice(0, 10);
    
    // Extraire les noms et populations des provinces
    const labels = displayProvinces.map(province => province.nom);
    const populations = displayProvinces.map(province => province.population);
    
    // Générer des couleurs pour chaque barre
    const colors = generateColors(displayProvinces.length);
    
    // S'assurer que le conteneur du graphique est visible
    const chartContainer = document.getElementById('chart-container');
    if (chartContainer) {
        chartContainer.style.display = 'block';
    } else {
        console.error('Conteneur du graphique introuvable');
        return; // Sortir si le conteneur n'existe pas
    }
    
    // Récupérer le contexte du canvas
    const canvas = document.getElementById('provinces-chart');
    if (!canvas) {
        console.error('Canvas du graphique introuvable');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Détruire le graphique existant s'il y en a un
    if (provincesChart) {
        provincesChart.destroy();
    }
    
    // Créer le nouveau graphique
    provincesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Population par province',
                data: populations,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Population des provinces',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw.toLocaleString() + ' habitants';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(0) + 'k';
                            }
                            return value;
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
    
    // Afficher le conteneur du graphique
    document.getElementById('chart-container').style.display = 'block';
}

// Fonction pour générer des couleurs pour le graphique
function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        // Générer une couleur dans un dégradé de bleu à violet
        const hue = 220 + (i * 20) % 60; // Variation de teinte entre 220 (bleu) et 280 (violet)
        colors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
    }
    return colors;
}

// Fonction pour mettre à jour le graphique lorsqu'une région est sélectionnée
function updateChartForRegion(regionName) {
    console.log('Mise à jour du graphique pour la région:', regionName);
    
    // Toujours afficher le graphique pour les régions, quelle que soit la vue actuelle
    // Récupérer les provinces de la région
    const result = getProvincesForRegion(regionName);
    
    if (!result) {
        console.error('Impossible de récupérer les provinces pour', regionName);
        return;
    }
    
    const provinces = result.provinces;
    console.log('Provinces trouvées:', provinces ? provinces.length : 0);
    
    if (provinces && provinces.length > 0) {
        // Forcer l'affichage du conteneur du graphique
        const chartContainer = document.getElementById('chart-container');
        if (chartContainer) {
            chartContainer.style.display = 'block';
            console.log('Conteneur du graphique affiché');
        } else {
            console.error('Conteneur du graphique introuvable');
            return;
        }
        
        // Créer le graphique avec les données des provinces
        setTimeout(() => {
            try {
                createProvincesChart(provinces);
                console.log('Graphique créé avec succès');
            } catch (error) {
                console.error('Erreur lors de la création du graphique:', error);
            }
        }, 100); // Délai pour s'assurer que le DOM est prêt
    } else {
        // Masquer le graphique s'il n'y a pas de données
        hideChart();
        console.log('Pas de provinces, graphique masqué');
    }
}

// Fonction pour masquer le graphique
function hideChart() {
    console.log('Masquage du graphique');
    const chartContainer = document.getElementById('chart-container');
    if (chartContainer) {
        chartContainer.style.display = 'none';
        console.log('Conteneur du graphique masqué');
    } else {
        console.error('Conteneur du graphique introuvable lors de la tentative de masquage');
    }
}

// Ajouter un écouteur d'événements pour redimensionner le graphique lorsque la fenêtre change de taille
window.addEventListener('resize', function() {
    if (provincesChart) {
        provincesChart.resize();
    }
});