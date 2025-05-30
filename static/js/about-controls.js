// about-controls.js
document.addEventListener('DOMContentLoaded', () => {
  const aboutLink = document.getElementById('about-link');

  aboutLink.addEventListener('click', e => {
    e.preventDefault();

    // Texte descriptif du site web
    const html = `
      <h3>À propos de ce portail géospatial</h3>
      <p>
        Ce site est un portail interactif dédié à la découverte du Maroc.
        Vous pouvez cliquer sur chaque région ou province pour afficher:
      </p>
      <ul>
        <li>Une carte détaillée et les limites géographiques</li>
        <li>Des statistiques démographiques, économiques, éducatives et énergétiques</li>
        <li>Des graphiques dynamiques</li>
        <li>Les conditions météorologiques en temps réel</li>
      </ul>
      
    `;

    document.getElementById('region-info').innerHTML = html;
  });
});
