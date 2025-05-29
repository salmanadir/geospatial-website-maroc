
// Initialisation de la carte centrée sur le Maroc
let map = L.map('map', {
    minZoom: 5,
    maxZoom: 10,
    maxBounds: [
        [27.0, -17.5],
        [36.0, -0.5]
    ],
    maxBoundsViscosity: 1.0
}).setView([31.5, -7.5], 6.5);

// Fond de carte clair
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap & Carto',
    subdomains: 'abcd',
    maxZoom: 10
}).addTo(map);

// Données de chaleur simulées (ex : taux de chômage normalisé entre 0 et 1)
let heatData = [
  [31.63, -8.0, 0.7],   // Marrakech
  [35.0, -1.9, 0.5],    // Oujda
  [30.42, -9.6, 0.8],   // Agadir
  [34.03, -5.0, 0.4],   // Fès
  [33.57, -7.58, 0.6]   // Casablanca
];

// Ajout de la couche de chaleur
let heat = L.heatLayer(heatData, {
    radius: 25,
    blur: 15,
    maxZoom: 10,
    gradient: {
        0.2: 'blue',
        0.4: 'lime',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red'
    }
}).addTo(map);

// Chargement de la couche des frontières du Maroc
fetch("/static/data/ma.geojson")
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#3b82f6",
        weight: 2,
        fillOpacity: 0.2
      },
      onEachFeature: (feature, layer) => {
        const regionName = feature.properties.nom || "Région inconnue";
        layer.on({
          click: () => {
            showRegionInfo(regionName);
          },
          mouseover: (e) => {
            e.target.setStyle({ fillOpacity: 0.5 });
          },
          mouseout: (e) => {
            e.target.setStyle({ fillOpacity: 0.2 });
          }
        });
      }
    }).addTo(map);
  });

// Affichage d'informations régionales
function showRegionInfo(name) {
  const infoPanel = document.getElementById('region-info');
  infoPanel.innerHTML = `<p><strong>Région :</strong> ${name}</p><p>(Données détaillées à venir...)</p>`;
}
