// map_improved.js

const map = L.map('map');
let regionsLayer = null;
let provincesLayer = null;
let selectedRegion = null;
let selectedProvince = null;
let currentView = 'regions'; // 'regions' or 'provinces'

// Cache GeoJSON loaded
const geoCache = {
  regions: null,
  provinces: {}
};

// Loader UI
function showLoader(message = "Chargement...") {
  const infoPanel = document.getElementById('region-info');
  infoPanel.innerHTML = `<p class="loading">${message}</p>`;
}
function hideLoader() {
  const infoPanel = document.getElementById('region-info');
  // clear loading message only if present
  if (infoPanel.querySelector('.loading')) infoPanel.innerHTML = '';
}

// Normalize name utility (shared by weather.js too)
function normalizeName(name) {
  if (!name) return '';
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/--/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Initialize map view on Maroc center
fetch('/api/maroc').then(r => r.json()).then(data => {
  map.setView([data.coordonnees.latitude, data.coordonnees.longitude], 6);
}).catch(() => {
  map.setView([34.025278, -6.836111], 6); // default fallback
});

// Add OSM tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Style for regions and provinces
function style(feature) {
  return {
    fillColor: '#4caf50',
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

// Highlight styles
function highlightFeature(e) {
  const layer = e.target;
  if (selectedRegion !== layer && selectedProvince !== layer) {
    layer.setStyle({
      weight: 5,
      color: '#2e7d32',
      dashArray: '',
      fillOpacity: 0.8
    });
  }
  layer.bringToFront();
}

function resetHighlight(e) {
  const layer = e.target;
  if (layer !== selectedRegion && layer !== selectedProvince) {
    if (regionsLayer && regionsLayer.hasLayer(layer)) {
      regionsLayer.resetStyle(layer);
    }
    if (provincesLayer && provincesLayer.hasLayer(layer)) {
      provincesLayer.resetStyle(layer);
    }
  }
}

function showRegionInfoHTML(regionName, data) {
  let html = `<h3>${regionName}</h3>`;
  html += `<div class="region-detail"><strong>Population:</strong> ${data.population?.toLocaleString() || 'N/A'} hab.</div>`;
  html += `<div class="region-detail"><strong>Superficie:</strong> ${data.superficie?.toLocaleString() || 'N/A'} km²</div>`;
  html += `<div class="region-detail"><strong>Densité:</strong> ${data.densite?.toLocaleString() || 'N/A'} hab/km²</div>`;
  html += `<div class="region-detail"><strong>Chef-lieu:</strong> ${data.chef_lieu || 'N/A'}</div>`;
  if (data.provinces && data.provinces.length > 0) {
    html += `<h4>Provinces :</h4><ul class="provinces-list">`;
    data.provinces.forEach(p => {
      html += `<li>${p.nom} <span class="province-population">(${p.population.toLocaleString()} hab.)</span></li>`;
    });
    html += '</ul>';
  }
  document.getElementById('region-info').innerHTML = html;
}

function onEachRegionFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: e => selectRegion(e.target)
  });
}

function selectRegion(layer) {
  if (selectedRegion) {
    regionsLayer.resetStyle(selectedRegion);
  }
  selectedRegion = layer;
  selectedProvince = null;
  layer.setStyle({
    weight: 5,
    color: '#2e7d32',
    dashArray: '',
    fillOpacity: 0.9
  });

  const regionName = layer.feature.properties.name_2 || layer.feature.properties.localnam_2 || 'Région inconnue';
  loadRegionData(regionName);
  loadProvinces(regionName);
}

function loadRegionData(regionName) {
  showLoader("Chargement des données...");
  fetch('/static/data/region_details.json')
    .then(r => r.json())
    .then(regionDetails => {
      const regionData = Object.values(regionDetails).find(r =>
        normalizeName(r.nom || r.name) === normalizeName(regionName)
      ) || {};

      // Add provinces info
      fetch('/static/data/province_details.json')
        .then(r => r.json())
        .then(provinceDetails => {
          // Filter provinces for this region
          const provinces = Object.entries(provinceDetails)
            .filter(([_, d]) => normalizeName(d.region) === normalizeName(regionName))
            .map(([nom, d]) => ({ nom, population: d.population || 0 }));

          regionData.provinces = provinces;
          showRegionInfoHTML(regionName, regionData);
          hideLoader();
        });
    })
    .catch(() => {
      document.getElementById('region-info').innerHTML = `<p>Erreur lors du chargement des données.</p>`;
    });
}

function loadProvinces(regionName) {
  const regionFileName = normalizeName(regionName)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
  const geojsonPath = `/static/data/provinces/${regionFileName}_provinces.geojson`;

  if (provincesLayer) {
    map.removeLayer(provincesLayer);
  }
  showLoader("Chargement des provinces...");

  fetch(geojsonPath)
    .then(r => {
      if (!r.ok) throw new Error('Fichier provinces non trouvé');
      return r.json();
    })
    .then(data => {
      provincesLayer = L.geoJSON(data, {
        style,
        onEachFeature: function (feature, layer) {
          layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: e => {
              if (selectedProvince) provincesLayer.resetStyle(selectedProvince);
              selectedProvince = e.target;
              e.target.setStyle({
                weight: 5,
                color: '#2e7d32',
                dashArray: '',
                fillOpacity: 0.9
              });
              showProvinceInfo(e.target.feature.properties);
            }
          });
        }
      }).addTo(map);
      map.fitBounds(provincesLayer.getBounds());
      hideLoader();
      currentView = 'provinces';
      updateBackButton();
    })
    .catch(err => {
      document.getElementById('region-info').innerHTML = `<p>Impossible de charger les provinces.</p>`;
      hideLoader();
      console.error(err);
    });
}

function showProvinceInfo(properties) {
  const name =
    properties.name ||
    properties.nom ||
    properties.localnam_2 ||
    properties.name_2 ||
    "Province";
  let html = `<h3>${name}</h3>`;
  if (properties.population) {
    html += `<div class="region-detail"><strong>Population:</strong> ${Number(properties.population).toLocaleString()} hab.</div>`;
  }
  if (properties.area) {
    html += `<div class="region-detail"><strong>Superficie:</strong> ${Number(properties.area).toLocaleString()} km²</div>`;
  }
  document.getElementById('region-info').innerHTML = html;

  // Optionnel : afficher la météo pour cette province
  showProvinceWeather(normalizeName(name));
}

// Bouton retour
function updateBackButton() {
  const backBtn = document.getElementById('back-to-regions');
  if (!backBtn) return;
  backBtn.style.display = currentView === 'regions' ? 'none' : 'block';
}

function showRegions() {
  if (provincesLayer) {
    map.removeLayer(provincesLayer);
    provincesLayer = null;
  }
  if (regionsLayer) {
    regionsLayer.addTo(map);
    map.fitBounds(regionsLayer.getBounds());
  }
  selectedRegion = null;
  selectedProvince = null;
  currentView = 'regions';
  updateBackButton();
  document.getElementById('region-info').innerHTML =
    '<p>Sélectionnez une région pour voir ses informations</p>';
}

// Initialisation du bouton retour
L.control
  .custom({
    position: "topleft",
    content:
      '<button id="back-to-regions" title="Retour aux régions" aria-label="Retour aux régions" style="display:none; padding: 8px 12px; background: #4caf50; color: white; border:none; border-radius: 5px; cursor: pointer;">← Retour</button>',
    classes: "",
    style: {
      margin: "10px",
      padding: "0",
      cursor: "pointer"
    },
    events: {
      click: showRegions
    }
  })
  .addTo(map);

// Chargement des régions GeoJSON et ajout à la carte
function loadRegions() {
  showLoader("Chargement des régions...");
  fetch("/static/data/ma.geojson")
    .then(r => r.json())
    .then(data => {
      regionsLayer = L.geoJSON(data, {
        style,
        onEachFeature: onEachRegionFeature
      }).addTo(map);
      map.fitBounds(regionsLayer.getBounds());
      hideLoader();
      updateBackButton();
    })
    .catch(err => {
      document.getElementById("region-info").innerHTML =
        "<p>Erreur lors du chargement des régions.</p>";
      hideLoader();
      console.error(err);
    });
}

loadRegions();
