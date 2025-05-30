// Graphiques pour la carte interactive du Maroc
let regionChart = null; // Variable globale pour stocker l'instance du graphique

/**
 * Crée un graphique à barres montrant la population des provinces d'une région
 * @param {Array} provinces - Liste des provinces avec leurs données
 * @param {string} regionName - Nom de la région
 */
function createRegionChart(provinces, regionName) {
    // Récupérer l'élément canvas
    const ctx = document.getElementById('regionChart').getContext('2d');
    
    // Si un graphique existe déjà, le détruire
    if (regionChart) {
        regionChart.destroy();
    }
    
    // Trier les provinces par population (de la plus peuplée à la moins peuplée)
    const sortedProvinces = [...provinces].sort((a, b) => b.population - a.population);
    
    // Limiter à 10 provinces maximum pour la lisibilité
    const limitedProvinces = sortedProvinces.slice(0, 10);
    
    // Préparer les données pour le graphique
    const labels = limitedProvinces.map(p => p.nom);
    const data = limitedProvinces.map(p => p.population);
    
    // Générer des couleurs dans un dégradé de bleu à violet
    const colors = generateGradientColors(limitedProvinces.length, '#4682B4', '#9370DB');
    
    // Créer le graphique
    regionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Population par province',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(color => adjustColor(color, -20)),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Population des provinces - ${regionName}`,
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatNumber(context.parsed.y) + ' habitants';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
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
    document.getElementById('region-graph-container').style.display = 'block';
}

/**
 * Génère un dégradé de couleurs entre deux couleurs hexadécimales
 * @param {number} count - Nombre de couleurs à générer
 * @param {string} startColor - Couleur de départ (format hexadécimal)
 * @param {string} endColor - Couleur de fin (format hexadécimal)
 * @returns {Array} - Tableau de couleurs au format hexadécimal
 */
function generateGradientColors(count, startColor, endColor) {
    // Convertir les couleurs hexadécimales en RGB
    const start = hexToRgb(startColor);
    const end = hexToRgb(endColor);
    
    // Générer le dégradé
    const colors = [];
    for (let i = 0; i < count; i++) {
        const ratio = i / (count - 1);
        const r = Math.round(start.r + ratio * (end.r - start.r));
        const g = Math.round(start.g + ratio * (end.g - start.g));
        const b = Math.round(start.b + ratio * (end.b - start.b));
        colors.push(`rgb(${r}, ${g}, ${b})`);
    }
    
    return colors;
}

/**
 * Convertit une couleur hexadécimale en RGB
 * @param {string} hex - Couleur au format hexadécimal
 * @returns {Object} - Objet contenant les composantes r, g, b
 */
function hexToRgb(hex) {
    // Supprimer le # si présent
    hex = hex.replace('#', '');
    
    // Convertir en RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

/**
 * Ajuste une couleur RGB en l'éclaircissant ou l'assombrissant
 * @param {string} color - Couleur au format rgb(r, g, b)
 * @param {number} amount - Montant d'ajustement (-255 à 255)
 * @returns {string} - Couleur ajustée au format rgb(r, g, b)
 */
function adjustColor(color, amount) {
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return color;
    
    let r = parseInt(rgbMatch[1]);
    let g = parseInt(rgbMatch[2]);
    let b = parseInt(rgbMatch[3]);
    
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Formate un nombre pour l'affichage (ajoute des séparateurs de milliers)
 * @param {number} num - Nombre à formater
 * @returns {string} - Nombre formaté
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

/**
 * Cache le graphique de la région
 */
function hideRegionChart() {
    document.getElementById('region-graph-container').style.display = 'none';
}
