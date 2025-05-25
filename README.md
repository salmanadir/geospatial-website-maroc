# Website Maroc - Carte Interactive

Une application web interactive qui affiche une carte du Maroc et permet aux utilisateurs de cliquer sur les différentes régions et provinces pour obtenir des informations détaillées (population, superficie, chef-lieu, etc.) ainsi que les données météorologiques en temps réel.


## Fonctionnalités

- **Carte interactive du Maroc** avec les 12 régions administratives officielles
- **Navigation hiérarchique** permettant d'explorer les régions puis leurs provinces
- **Informations démographiques détaillées** pour chaque région et province :
  - Population
  - Superficie
  - Densité de population
  - Chef-lieu
- **Données météorologiques en temps réel** pour chaque province :
  - Température actuelle et ressenti
  - Description des conditions météo avec icônes
  - Taux d'humidité
  - Vitesse du vent
- **Système de cache** pour optimiser les appels à l'API météo
- **Normalisation des noms de provinces** pour gérer les variations orthographiques
- **Interface responsive** adaptée aux mobiles et ordinateurs

## Technologies utilisées

- **Backend**: 
  - Flask (Python) - Framework web léger
  - Flask-Caching - Pour la mise en cache des données météo
  
- **Frontend**: 
  - HTML5 / CSS3 - Structure et style
  - JavaScript (ES6+) - Interactivité et manipulation de la carte
  - Font Awesome - Icônes pour l'interface
  
- **Cartographie**: 
  - Leaflet.js - Bibliothèque JavaScript open-source pour les cartes interactives
  
- **Données**: 
  - GeoJSON - Format pour les données géographiques
  - JSON - Stockage des données démographiques
  
- **API**: 
  - OpenWeatherMap - Données météorologiques en temps réel

## Installation

1. Clonez ce dépôt :
```bash
git clone <url-du-repo>
cd website-maroc
```

2. Créez un environnement virtuel et activez-le :
```bash
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

3. Installez les dépendances :
```bash
pip install -r requirements.txt
```

## Configuration

1. Créez un fichier `.env` à la racine du projet en vous basant sur le fichier `.env.example` :
```bash
cp .env.example .env
```

2. Obtenez une clé API gratuite sur [OpenWeatherMap](https://openweathermap.org/api) et ajoutez-la dans votre fichier `.env` :
```
OPENWEATHERMAP_API_KEY=votre_clé_api_ici
```

## Utilisation

1. Lancez l'application :
```bash
python -m flask run --port=5009
```
Ou plus simplement :
```bash
python app.py
```

2. Ouvrez votre navigateur à l'adresse : `http://localhost:5009` ou `http://127.0.0.1:5009`

3. Navigation dans l'application :
   - Cliquez sur une région pour voir ses provinces
   - Cliquez sur une province pour voir ses informations détaillées et la météo
   - Utilisez le bouton "Retour aux régions" pour revenir à la vue des régions

## Déploiement

L'application peut être déployée sur diverses plateformes comme Heroku, PythonAnywhere, ou tout serveur prenant en charge Flask.

### Exemple de déploiement sur Heroku :

1. Installez le CLI Heroku et connectez-vous :
```bash
heroku login
```

2. Créez une application Heroku :
```bash
heroku create website-maroc
```

3. Ajoutez votre clé API comme variable d'environnement :
```bash
heroku config:set OPENWEATHERMAP_API_KEY=votre_clé_api_ici
```

4. Déployez l'application :
```bash
git push heroku main
```

5. Ouvrez l'application dans votre navigateur :
```bash
heroku open
```

## Structure du projet

```
website-maroc/
├── app.py                  # Application Flask principale
├── static/
│   ├── css/
│   │   ├── style.css       # Styles CSS principaux
│   │   └── weather.css     # Styles pour l'affichage météo
│   ├── js/
│   │   ├── map.js          # Gestion de la carte interactive
│   │   ├── weather.js      # Gestion des données météo
│   │   └── province-fixes.js # Correctifs pour les provinces problématiques
│   ├── data/
│   │   ├── regions.json    # Données GeoJSON des régions
│   │   ├── provinces/      # Données GeoJSON des provinces par région
│   │   ├── region_details.json # Détails démographiques des régions
│   │   └── province_details.json # Détails démographiques des provinces
│   └── img/
│       └── screenshot.png  # Capture d'écran de l'application
├── templates/
│   └── index.html       # Template principal
├── debug_provinces.py    # Utilitaire pour déboguer les provinces
├── rename_provinces.py   # Utilitaire pour normaliser les noms de provinces
├── requirements.txt      # Dépendances Python
├── .env.example          # Exemple de configuration des variables d'environnement
└── README.md             # Documentation du projet
```

## Fonctionnalités spécifiques

### Normalisation des noms de provinces

L'application gère les variations orthographiques des noms de provinces marocaines, notamment pour les cas spéciaux comme :
- **El-Kelâa-des-Sraghna** (avec différentes orthographes comme "El Kelaa", "Kelaa", "Kelâa")
- **Skhirate-Temara** (avec différentes orthographes comme "Skhirate", "Skhirat", "Temara")
- **Inezgane-Ait-Melloul** (avec différentes orthographes)
- **Chtouka-Ait-Baha** (avec différentes orthographes)

Une solution spécifique a été implémentée pour résoudre le problème des provinces avec des doubles tirets dans le fichier JSON (comme "El-Kelâa-des--Sraghna" et "Skhirate--Temara"). Le script `province-fixes.js` détecte automatiquement ces provinces problématiques et assure l'affichage correct des données météorologiques.

### Système de cache météo

Pour respecter les limites de l'API gratuite d'OpenWeatherMap (1000 appels par jour), l'application met en cache les données météo pendant une durée configurable (par défaut 30 minutes).

## Contribution

Les contributions à ce projet sont les bienvenues ! Voici comment contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## Remerciements

- Données démographiques fournies par le Haut-Commissariat au Plan (HCP) du Maroc
- Données météorologiques fournies par [OpenWeatherMap](https://openweathermap.org/)
- Cartographie propulsée par [Leaflet](https://leafletjs.com/)

## Licence

Ce projet est sous licence MIT.
