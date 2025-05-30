// stats-controls.js
document.addEventListener('DOMContentLoaded', () => {
  // 1) On récupère les éléments du menu
  const toggle   = document.querySelector('.nav-item.dropdown .dropdown-toggle');
  const menu     = document.querySelector('.nav-item.dropdown .dropdown-menu');

  // 2) Toggle du menu Statistiques
  toggle.addEventListener('click', e => {
    e.preventDefault();
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });

  // 3) Helper pour rafraîchir le panneau latéral
  function refreshStatsPanel(type) {
    if (!window.currentRegionName) {
      return alert('▶ Sélectionnez d’abord une région sur la carte.');
    }
    const region = window.currentRegionName;
    // on calcule la clé pour les JSON
    const key = region.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    let html = `<h3>${region}</h3>
                <div class="info-card"><div class="info-card-body">`;

    if (type === 'demo') {
      // démographie via getProvincesForRegion
      const { stats } = getProvincesForRegion(region);
      html += `
        <div><strong>Population :</strong> ${stats.population.toLocaleString()}</div>
        <div><strong>Superficie :</strong> ${stats.superficie.toLocaleString()} km²</div>
        <div><strong>Densité :</strong> ${stats.densite.toLocaleString()} hab/km²</div>
      `;
    }
    else if (type === 'econ') {
      const econ = economieRegionData[key] || {};
      html += `
        <div><strong>PIB :</strong> ${econ.pib_milliards_mad || 'N/A'} Md MAD</div>
        <div><strong>Taux de chômage :</strong> ${econ.taux_chomage || 'N/A'} %</div>
      `;
    }
    else if (type === 'edu') {
      const edu = educationRegionData[key] || {};
      html += `
        <div><strong>Alphabétisation :</strong> ${edu.taux_alphabétisation || 'N/A'} %</div>
        <div><strong>Scolarisation secondaire :</strong> ${edu.taux_scolarisation_secondaire || 'N/A'} %</div>
      `;
    }
    else if (type === 'clim') {
      const clim = energieClimatData[key] || {};
      html += `
        <div><strong>Solaire :</strong> ${clim.energie_solaire_mw || 'N/A'} MW</div>
        <div><strong>Éolienne :</strong> ${clim.energie_eolienne_mw || 'N/A'} MW</div>
      `;
    }
html += `
  <div class="info-card">
    <div class="info-card-header">Graphique</div>
    <div class="info-card-body">
      <canvas id="statsChart" width="400" height="300"></canvas>
    </div>
  </div>`;
    html += `</div></div>`;
    // on injecte dans le panneau
    document.getElementById('region-info').innerHTML = html;
    // on referme le menu
    menu.style.display = 'none';

     drawStatsChart(type);
  }
function drawStatsChart(type) {
  const ctx = document.getElementById('statsChart').getContext('2d');
  let labels = [], data = [], config = {};

  // Exemples de datasets
  if (type === 'demo') {
    // on récupère les provinces et leurs populations
    const { provinces } = getProvincesForRegion(window.currentRegionName);
    labels = provinces.map(p => p.nom);
    data   = provinces.map(p => p.population);
    config = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Population par province',
          data,
          borderWidth: 1
        }]
      },
      options: { responsive: true }
    };
  }
  else if (type === 'econ') {
    const key = window.currentRegionName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const econ = economieRegionData[key] || {};
    labels = ['PIB (Md MAD)', 'Chômage (%)'];
    data   = [econ.pib_milliards_mad || 0, econ.taux_chomage || 0];
    config = {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data }]
      },
      options: { responsive: true }
    };
  }
  else if (type === 'edu') {
    const key = window.currentRegionName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const edu = educationRegionData[key] || {};
    labels = ['Alphabétisation', 'Scolarisation secondaire'];
    data   = [edu.taux_alphabétisation || 0, edu.taux_scolarisation_secondaire || 0];
    config = {
      type: 'doughnut',
      data: { labels, datasets:[{ data }] },
      options: { responsive: true }
    };
  }
  else if (type === 'clim') {
    const key = window.currentRegionName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const clim = energieClimatData[key] || {};
    labels = ['Solaire (MW)', 'Éolien (MW)'];
    data   = [clim.energie_solaire_mw || 0, clim.energie_eolienne_mw || 0];
    config = {
      type: 'bar',
      data: { labels, datasets:[{ label: 'Production', data, borderWidth:1 }] },
      options:{ responsive:true }
    };
  }

  // ➌ Initialisation du chart (déjà inclus via <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>)
  new Chart(ctx, config);
}

  // 4) Branchement des clics sur vos IDs existants
  document.getElementById('population-stats').addEventListener('click', e => {
    e.preventDefault(); refreshStatsPanel('demo');
  });
  document.getElementById('economic-stats').addEventListener('click', e => {
    e.preventDefault(); refreshStatsPanel('econ');
  });
  document.getElementById('education-stats').addEventListener('click', e => {
    e.preventDefault(); refreshStatsPanel('edu');
  });
  document.getElementById('climate-stats').addEventListener('click', e => {
    e.preventDefault(); refreshStatsPanel('clim');
  });
});
