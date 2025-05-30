// Initialisation de la carte
const map = L.map('map');

// Ajout de la couche de carte OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Ajouter un bouton de retour (initialement caché)
const backButton = L.control({ position: 'topleft' });
backButton.onAdd = function() {
    const div = L.DomUtil.create('div', 'back-button');
    div.innerHTML = '<button onclick="showRegions()" style="padding: 8px; background-color: white; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; display: none;" id="back-to-regions">Retour aux régions</button>';
    return div;
};
backButton.addTo(map);

// Obtenir les informations générales sur le Maroc pour centrer la carte
fetch('/api/maroc')
    .then(response => response.json())
    .then(data => {
        // Centrer la carte sur les coordonnées exactes du Maroc
        map.setView([data.coordonnees.latitude, data.coordonnees.longitude], 6);
    })
    .catch(error => {
        console.error('Erreur lors du chargement des informations sur le Maroc:', error);
        // Valeurs par défaut si l'API échoue
        map.setView([34.025278, -6.836111], 6);
    });

// Variables pour stocker les couches GeoJSON actives
let regionsLayer;
let provincesLayer;
let selectedRegion = null;
let selectedProvince = null;
let currentView = 'regions'; // 'regions' ou 'provinces'

// Variables globales pour stocker les détails des provinces et des régions
let provinceDetails = {};
let regionDetails = {};
let economieData = {};

fetch("/static/data/economie_provinces_normalise_static.json")
  .then(res => res.json())
  .then(data => {
    economieData = data;
  });
let economieRegionData = {};

fetch("/static/data/economie_regions_normalise.json")
  .then(res => res.json())
  .then(data => {
    economieRegionData = data;
  });

let educationRegionData = {};
let educationProvinceData = {};

fetch("/static/data/education_regions_normalise.json")
  .then(res => res.json())
  .then(data => {
    educationRegionData = data;
  });

fetch("/static/data/education_provinces_normalise.json")
  .then(res => res.json())
  .then(data => {
    educationProvinceData = data;
  });
let energieClimatData = {};

fetch("/static/data/energie_climat_regions_normalise.json")
  .then(res => res.json())
  .then(data => {
    energieClimatData = data;
  });
let energieClimatProvinceData = {};

fetch("/static/data/energie_climat_provinces_normalise.json")
  .then(res => res.json())
  .then(data => {
    energieClimatProvinceData = data;
  });





// Table de correspondance pour les noms de provinces
const provinceNameMapping = {
    // Variations de noms pour El Kelâa des Sraghna
    "El Kelaa des Sraghna": "El-Kelâa-des--Sraghna",
    "El Kelaa des Sraghnas": "El-Kelâa-des--Sraghna",
    "Kelaa des Sraghna": "El-Kelâa-des--Sraghna",
    "El Kelaa": "El-Kelâa-des--Sraghna",
    "Kelaa": "El-Kelâa-des--Sraghna",
    "El Kelaa Sraghna": "El-Kelâa-des--Sraghna",
    "El Kelâa Des-Sraghna": "El-Kelâa-des--Sraghna",
    "El-Kelâa-des-Sraghna": "El-Kelâa-des--Sraghna",

    // Variations pour Agadir
    "Agadir": "Agadir-Ida-Ou-Tanane",
    "Agadir Ida Outanane": "Agadir-Ida-Ou-Tanane",
    "Agadir-Ida-Outanane": "Agadir-Ida-Ou-Tanane",
    "Agadir Ida-Outanane": "Agadir-Ida-Ou-Tanane",

    // Variations pour Laâyoune
    "Laayoune": "Laayoune",
    "Laâyoune": "Laayoune",
    "El Aaiun": "Laayoune",
    "El Aaiün": "Laayoune",
    "El Ayoun": "Laayoune",
    "El-Aaiun": "Laayoune",
    "Layoune": "Laayoune",

    // Variations pour Al Hoceima
    "Al Hoceïma": "Al-Hoceima",
    "Hoceima": "Al-Hoceima",
    "Al Hoceima": "Al-Hoceima",
    "Al-Hoceïma": "Al-Hoceima",
    "Al-Hoceima": "Al-Hoceima",

    // Variations pour Oued Ed-Dahab (Dakhla)
    "Dakhla": "Oued-Ed-Dahab",
    "Oued Eddahab": "Oued-Ed-Dahab",
    "Oued Ed-Dahab": "Oued-Ed-Dahab",
    "Oued-Eddahab": "Oued-Ed-Dahab",

    // Variations pour Taroudannt
    "Taroudant": "Taroudannt",

    // Variations pour Inezgane
    "Inezgane": "Inezgane--Ait-Melloul",
    "Inezgane-Aït Melloul": "Inezgane--Ait-Melloul",

    // Variations pour Chtouka
    "Chtouka": "Chtouka--Ait-Baha",
    "Chtouka Ait Baha": "Chtouka--Ait-Baha",
    "Chtouka-Aït Baha": "Chtouka--Ait-Baha",

    // Variations pour Assa-Zag
    "Assa": "Assa-Zag",
    "Zag": "Assa-Zag",

    // Variations pour Sidi Ifni
    "Sidi Ifni": "Sidi-Ifni",
    "Ifni": "Sidi-Ifni",

    // Variations pour Al Haouz
    "Al Haouz": "Al-Haouz",
    "Haouz": "Al-Haouz",

    // Variations pour Fquih Ben Salah
    "Fquih Ben Salah": "Fquih-Ben-Salah",
    "Fkih Ben Salah": "Fquih-Ben-Salah",
    "Fkih-Ben-Salah": "Fquih-Ben-Salah",

    // Variations pour Beni Mellal
    "Beni Mellal": "Beni-Mellal",

    // Variations pour Khenifra
    "Khenifra": "Khenifra",
    "Khénifra": "Khenifra",

    // Variations pour Sidi Bennour
    "Sidi Bennour": "Sidi-Bennour",

    // Variations pour El Jadida
    "El Jadida": "El-Jadida",
    "Jadida": "El-Jadida",

    // Variations pour Mediouna
    "Mediouna": "Mediouna",

    // Variations pour Skhirate-Temara
    "Skhirate-Temara": "Skhirate--Temara",
    "Skhirate Temara": "Skhirate--Temara",
    "Temara": "Skhirate--Temara",

    // Variations pour Khemisset
    "Khemisset": "Khemisset",

    // Variations pour Sale
    "Sale": "Sale",
    "Salé": "Sale",

    // Variations pour Kenitra
    "Kenitra": "Kenitra",
    "Kénitra": "Kenitra",

    // Variations pour Sidi Slimane
    "Sidi Slimane": "Sidi-Slimane",

    // Variations pour Sidi Kacem
    "Sidi Kacem": "Sidi-Kacem",

    // Variations pour M'diq-Fnideq
    "M'diq-Fnideq": "Mdiq-Fnidq",
    "Mdiq-Fnidq": "Mdiq-Fnidq",
    "M'diq Fnideq": "Mdiq-Fnidq",
    "Mdiq Fnidq": "Mdiq-Fnidq",

    // Variations pour Tétouan
    "Tétouan": "Tetouan",
    "Tetouan": "Tetouan",

    // Variations pour Fès
    "Fès": "Fes",
    "Fes": "Fes",

    // Variations pour Meknès
    "Meknès": "Meknes",
    "Meknes": "Meknes",

    // Variations pour El Hajeb
    "El Hajeb": "El-Hajeb",

    // Variations pour Moulay Yacoub
    "Moulay Yacoub": "Moulay-Yacoub",

    // Ajouter d'autres variations selon les besoins
};

// Table de correspondance pour les noms de régions
const regionNameMapping = {
    // Variations pour Tanger-Tétouan-Al Hoceïma
    "Tanger-Tetouan-Al Hoceima": "Tanger-Tétouan-Al Hoceïma",
    "Tanger Tetouan Al Hoceima": "Tanger-Tétouan-Al Hoceïma",
    "Tanger-Tetouan": "Tanger-Tétouan-Al Hoceïma",

    // Variations pour L'Oriental
    "Oriental": "L'Oriental",

    // Variations pour Fès-Meknès
    "Fes-Meknes": "Fès-Meknès",
    "Fes Meknes": "Fès-Meknès",

    // Variations pour Rabat-Salé-Kénitra
    "Rabat-Sale-Kenitra": "Rabat-Salé-Kénitra",
    "Rabat Sale Kenitra": "Rabat-Salé-Kénitra",

    // Variations pour Béni Mellal-Khénifra
    "Beni Mellal-Khenifra": "Béni Mellal-Khénifra",
    "Beni-Mellal-Khenifra": "Béni Mellal-Khénifra",
    "Beni Mellal Khenifra": "Béni Mellal-Khénifra",

    // Variations pour Marrakech-Safi
    "Marrakech Safi": "Marrakech-Safi",

    // Variations pour Drâa-Tafilalet
    "Draa-Tafilalet": "Drâa-Tafilalet",
    "Draa Tafilalet": "Drâa-Tafilalet",

    // Variations pour Souss-Massa
    "Souss Massa": "Souss-Massa",

    // Variations pour Guelmim-Oued Noun
    "Guelmim Oued Noun": "Guelmim-Oued Noun",

    // Variations pour Laâyoune-Sakia El Hamra
    "Laayoune-Sakia El Hamra": "Laâyoune-Sakia El Hamra",
    "Laayoune Sakia El Hamra": "Laâyoune-Sakia El Hamra",

    // Variations pour Dakhla-Oued Ed-Dahab
    "Dakhla-Oued Ed Dahab": "Dakhla-Oued Ed-Dahab",
    "Dakhla Oued Ed Dahab": "Dakhla-Oued Ed-Dahab",
    "Oued Ed-Dahab-Lagouira": "Dakhla-Oued Ed-Dahab"
};

// Fonction pour normaliser les noms de provinces
function normalizeProvinceName(name) {
    if (!name) return '';

    // Nettoyer le nom (enlever les espaces superflus, etc.)
    const cleanName = name.trim();

    // Vérifier si le nom est dans la table de correspondance
    if (provinceNameMapping[cleanName]) {
        return provinceNameMapping[cleanName];
    }

    // Si le nom n'est pas dans la table de correspondance, essayer de trouver une correspondance partielle
    for (const key in provinceNameMapping) {
        if (cleanName.includes(key) || key.includes(cleanName)) {
            return provinceNameMapping[key];
        }
    }

    // Si aucune correspondance n'est trouvée, retourner le nom original
    return cleanName;
}

// Fonction pour normaliser le nom de la province pour la comparaison
function normalizeProvinceName(name) {
    if (!name) return '';

    const cleanName = name.trim();

    // Table de correspondance spécifique pour les provinces problématiques
    const provinceFixMapping = {
        "El-Kelâa-des-Sraghna": "El-Kelâa-des--Sraghna",
        "El Kelâa des Sraghna": "El-Kelâa-des--Sraghna",
        "El Kelaa des Sraghna": "El-Kelâa-des--Sraghna",
        "El-Kelâa-des--Sraghna": "El-Kelâa-des--Sraghna"
    };

    // Vérifier d'abord dans la table de correspondance spécifique
    if (provinceFixMapping[cleanName]) {
        return provinceFixMapping[cleanName];
    }

    // Cas spécial pour El-Kelâa-des-Sraghna
    if (cleanName.toLowerCase().includes("el kelaa") || cleanName.toLowerCase().includes("kelaa")) {
        return "El-Kelâa-des--Sraghna";
    }

    // Sinon, retourner le nom nettoyé
    return cleanName;
}

// Fonction pour normaliser le nom de la région pour la comparaison
function normalizeRegionName(name) {
    if (!name) return '';

    const cleanName = name.trim();

    console.log(`normalizeRegionName - Nom original: '${name}', nettoyé: '${cleanName}'`);

    // Table de correspondance spécifique pour les régions problématiques
    const regionFixMapping = {
        "Tangier-Tetouan-Al Hoceima": "Tanger-Tétouan-Al Hoceïma",
        "Rabat-Sale-Kenitra": "Rabat-Salé-Kénitra",
        "Rabat Sale Kenitra": "Rabat-Salé-Kénitra",
        "Rabat": "Rabat-Salé-Kénitra",
        "Beni Mellal-Khenifra": "Béni Mellal-Khénifra",
        "Laayoune-Sakia El Hamra": "Laâyoune-Sakia El Hamra",
        "Dakhla-Oued Ed Dahab": "Dakhla-Oued Ed-Dahab",
        "Fez-Meknes": "Fès-Meknès",
        "Fes-Meknes": "Fès-Meknès",
        "Fes Meknes": "Fès-Meknès"
    };

    // Vérifier d'abord dans la table de correspondance spécifique
    if (regionFixMapping[cleanName]) {
        return regionFixMapping[cleanName];
    }

    // Vérifier si le nom est dans la table de correspondance générale
    if (regionNameMapping[cleanName]) {
        return regionNameMapping[cleanName];
    }

    // Si le nom n'est pas dans la table de correspondance, essayer de trouver une correspondance partielle
    for (const key in regionNameMapping) {
        if (cleanName.includes(key) || key.includes(cleanName)) {
            return regionNameMapping[key];
        }
    }

    // Si aucune correspondance n'est trouvée, retourner le nom original
    return cleanName;
}

// Charger les détails des provinces
function loadProvinceDetails() {
    fetch('static/data/province_details.json')
        .then(response => response.json())
        .then(data => {
            provinceDetails = data;
            console.log('Détails des provinces chargés:', provinceDetails);
        })
        .catch(error => console.error('Erreur lors du chargement des détails des provinces:', error));
}

// Table de correspondance entre les noms des régions et leurs codes
const regionCodeMapping = {
    "Tanger-Tétouan-Al Hoceïma": "01",
    "L'Oriental": "02",
    "Fès-Meknès": "03",
    "Rabat-Salé-Kenitra": "04",
    "Béni Mellal-Khénifra": "05",
    "Casablanca-Settat": "06",
    "Marrakech-Safi": "07",
    "Drâa-Tafilalet": "08",
    "Souss-Massa": "09",
    "Guelmim-Oued Noun": "10",
    "Laâyoune-Sakia El Hamra": "11",
    "Dakhla-Oued Ed-Dahab": "12",

    // Noms en anglais
    "Tangier-Tetouan-Al Hoceima": "01",
    "Oriental": "02",
    "Fez-Meknes": "03",
    "Rabat-Sale-Kenitra": "04",
    "Beni Mellal-Khenifra": "05",
    "Casablanca-Settat": "06",
    "Marrakech-Safi": "07",
    "Draa-Tafilalet": "08",
    "Souss-Massa": "09",
    "Guelmim-Oued Noun": "10",
    "Laayoune-Sakia El Hamra": "11",
    "Dakhla-Oued Ed-Dahab": "12"
};

// Table de correspondance des provinces par région (pour les régions qui n'ont pas de provinces dans le fichier province_details.json)
const regionProvincesMapping = {
    // Ajout d'une entrée spécifique pour "Rabat" (pour gérer le cas où la région est détectée comme "Rabat" et non "Rabat-Salé-Kénitra")
    "Rabat": [
        { nom: "Rabat", population: 577827 },
        { nom: "Salé", population: 982163 },
        { nom: "Skhirate-Témara", population: 574694 },
        { nom: "Kénitra", population: 1061435 },
        { nom: "Khémisset", population: 542428 },
        { nom: "Sidi Kacem", population: 492299 },
        { nom: "Sidi Slimane", population: 320407 }
    ],
    "Tanger-Tétouan-Al Hoceïma": [
        { nom: "Tanger-Assilah", population: 1494413 },
        { nom: "M'diq-Fnidq", population: 254064 },
        { nom: "Tétouan", population: 611928 },
        { nom: "Fahs-Anjra", population: 76447 },
        { nom: "Larache", population: 496687 },
        { nom: "Al Hoceima", population: 400304 },
        { nom: "Chefchaouen", population: 457432 },
        { nom: "Ouezzane", population: 300637 }
    ],
    "L'Oriental": [
        { nom: "Oujda-Angad", population: 551767 },
        { nom: "Nador", population: 565426 },
        { nom: "Driouch", population: 223784 },
        { nom: "Jerada", population: 107489 },
        { nom: "Berkane", population: 289137 },
        { nom: "Taourirt", population: 206762 },
        { nom: "Guercif", population: 216717 },
        { nom: "Figuig", population: 138325 }
    ],
    "Fès-Meknès": [
        { nom: "Fès", population: 1150131 },
        { nom: "Meknès", population: 835695 },
        { nom: "El Hajeb", population: 247016 },
        { nom: "Ifrane", population: 155221 },
        { nom: "Moulay Yacoub", population: 174593 },
        { nom: "Séfrou", population: 286206 },
        { nom: "Boulemane", population: 197596 },
        { nom: "Taza", population: 528419 },
        { nom: "Taounate", population: 662943 }
    ],
    "Rabat-Salé-Kénitra": [
        { nom: "Rabat", population: 577827 },
        { nom: "Salé", population: 982163 },
        { nom: "Skhirate-Témara", population: 574694 },
        { nom: "Kénitra", population: 1061435 },
        { nom: "Khémisset", population: 542428 },
        { nom: "Sidi Kacem", population: 492299 },
        { nom: "Sidi Slimane", population: 320407 }
    ],
    "Béni Mellal-Khénifra": [
        { nom: "Béni Mellal", population: 549775 },
        { nom: "Azilal", population: 554064 },
        { nom: "Fquih Ben Salah", population: 502676 },
        { nom: "Khénifra", population: 564855 },
        { nom: "Khouribga", population: 542125 }
    ],
    "Casablanca-Settat": [
        { nom: "Casablanca", population: 3359818 },
        { nom: "Mohammadia", population: 336740 },
        { nom: "El Jadida", population: 786716 },
        { nom: "Nouaceur", population: 333604 },
        { nom: "Médiouna", population: 172680 },
        { nom: "Benslimane", population: 242696 },
        { nom: "Berrechid", population: 484518 },
        { nom: "Settat", population: 634184 },
        { nom: "Sidi Bennour", population: 452448 }
    ],
    "Marrakech-Safi": [
        { nom: "Marrakech", population: 1330468 },
        { nom: "Chichaoua", population: 339818 },
        { nom: "Al Haouz", population: 573128 },
        { nom: "El Kelâa des Sraghna", population: 529601 },
        { nom: "Essaouira", population: 450527 },
        { nom: "Rehamna", population: 315077 },
        { nom: "Safi", population: 691983 },
        { nom: "Youssoufia", population: 251943 }
    ],
    "Drâa-Tafilalet": [
        { nom: "Errachidia", population: 418451 },
        { nom: "Ouarzazate", population: 297502 },
        { nom: "Midelt", population: 289337 },
        { nom: "Tinghir", population: 322412 },
        { nom: "Zagora", population: 300758 }
    ],
    "Souss-Massa": [
        { nom: "Agadir Ida-Outanane", population: 600599 },
        { nom: "Inezgane-Aït Melloul", population: 541118 },
        { nom: "Chtouka-Aït Baha", population: 371103 },
        { nom: "Taroudannt", population: 838820 },
        { nom: "Tiznit", population: 344941 },
        { nom: "Tata", population: 121618 }
    ],
    "Guelmim-Oued Noun": [
        { nom: "Guelmim", population: 166685 },
        { nom: "Assa-Zag", population: 36931 },
        { nom: "Tan-Tan", population: 86134 },
        { nom: "Sidi Ifni", population: 107784 }
    ],
    "Laâyoune-Sakia El Hamra": [
        { nom: "Laâyoune", population: 217732 },
        { nom: "Boujdour", population: 42776 },
        { nom: "Tarfaya", population: 9836 },
        { nom: "Es-Semara", population: 60426 }
    ],
    "Dakhla-Oued Ed-Dahab": [
        { nom: "Oued Ed-Dahab", population: 106277 },
        { nom: "Aousserd", population: 13446 }
    ]
};

// Charger les détails des régions
function loadRegionDetails() {
    fetch('static/data/region_details.json')
        .then(response => response.json())
        .then(data => {
            regionDetails = data;
            console.log('Détails des régions chargés:', regionDetails);
        })
        .catch(error => console.error('Erreur lors du chargement des détails des régions:', error));
}

// Fonction pour récupérer les provinces d'une région et calculer les statistiques
function getProvincesForRegion(regionName) {
    if (!provinceDetails) return { provinces: [], stats: null };

    // Normaliser le nom de la région pour la comparaison
    const normalizedRegionName = normalizeRegionName(regionName);
    console.log(`Recherche des provinces pour la région: ${regionName}, normalisé: ${normalizedRegionName}`);

    // Liste pour stocker les provinces de la région
    const provinces = [];

    // Variables pour calculer les statistiques de la région
    let totalPopulation = 0;
    let totalSuperficie = 0;
    let chefLieu = '';
    let maxPopulation = 0;

    // Parcourir toutes les provinces
    for (const provinceName in provinceDetails) {
        const provinceData = provinceDetails[provinceName];

        // Vérifier si la province appartient à la région
        if (provinceData.region) {
            const provinceRegion = normalizeRegionName(provinceData.region);

            if (provinceRegion === normalizedRegionName) {
                // Ajouter la province à la liste
                provinces.push({
                    nom: provinceName,
                    population: provinceData.population || 0,
                    superficie: provinceData.superficie || 0,
                    densite: provinceData.densite || 0,
                    chef_lieu: provinceData.chef_lieu || ''
                });

                // Mettre à jour les statistiques de la région
                if (provinceData.population) {
                    totalPopulation += provinceData.population;
                }

                if (provinceData.superficie) {
                    totalSuperficie += provinceData.superficie;
                }

                // Déterminer le chef-lieu de la région (la province avec la plus grande population)
                if (provinceData.population > maxPopulation) {
                    maxPopulation = provinceData.population;
                    chefLieu = provinceData.chef_lieu || '';
                }
            }
        }
    }

    // Si aucune province n'a été trouvée dans le fichier province_details.json,
    // utiliser la table de correspondance des provinces par région
    if (provinces.length === 0) {
        console.log(`Aucune province trouvée dans province_details.json pour la région ${normalizedRegionName}`);

        // Correction spécifique pour la région de Rabat
        let lookupRegionName = normalizedRegionName;
        if (normalizedRegionName.includes('Rabat') || normalizedRegionName === 'Rabat') {
            lookupRegionName = 'Rabat-Salé-Kénitra';
            console.log(`Application de la correction spécifique pour Rabat: utilisation de '${lookupRegionName}'`);
        }

        console.log(`Vérification si la région existe dans regionProvincesMapping: ${regionProvincesMapping[lookupRegionName] ? 'Oui' : 'Non'}`);

        if (regionProvincesMapping[lookupRegionName]) {
            console.log(`Utilisation de la table de correspondance pour la région ${lookupRegionName}`);

            // Ajouter les provinces de la table de correspondance
            const mappedProvinces = regionProvincesMapping[lookupRegionName];
            provinces.push(...mappedProvinces);

            // Recalculer les statistiques de la région
            totalPopulation = 0;
            let chefLieuProvince = null;

            for (const province of mappedProvinces) {
                if (province.population) {
                    totalPopulation += province.population;

                    // Déterminer le chef-lieu de la région (la province avec la plus grande population)
                    if (province.population > maxPopulation) {
                        maxPopulation = province.population;
                        chefLieuProvince = province;
                    }
                }
            }

            // Utiliser le nom de la province la plus peuplée comme chef-lieu de la région
            if (chefLieuProvince) {
                chefLieu = chefLieuProvince.nom;
            }
        }
    }

    // Calculer la densité de population de la région
    const densite = totalSuperficie > 0 ? Math.round(totalPopulation / totalSuperficie) : 0;

    // Créer l'objet de statistiques de la région
    const stats = {
        population: totalPopulation,
        superficie: totalSuperficie,
        densite: densite,
        chef_lieu: chefLieu
    };

    // Trier les provinces par population décroissante
    provinces.sort((a, b) => b.population - a.population);

    console.log(`Provinces trouvées pour la région ${normalizedRegionName}:`, provinces);
    console.log(`Statistiques calculées pour la région ${normalizedRegionName}:`, stats);

    return { provinces, stats };
}

// Appeler les fonctions au chargement de la page
loadProvinceDetails();
loadRegionDetails();

// Fonction pour styliser les régions
function style(feature) {
    return {
        fillColor: '#9370DB', // Couleur violet clair comme sur l'image
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Fonction pour mettre en évidence la région survolée
function highlightFeature(e) {
    const layer = e.target;

    if (selectedRegion !== layer) {
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
    }

    layer.bringToFront();
}

// Fonction pour réinitialiser le style d'une région
function resetHighlight(e) {
    if (selectedRegion !== e.target) {
        regionsLayer.resetStyle(e.target);
    }
}

// Fonction pour sélectionner une région
function selectRegion(e) {
    // Réinitialiser le style de la région précédemment sélectionnée
    if (selectedRegion) {
        regionsLayer.resetStyle(selectedRegion);
    }

    const layer = e.target;
    selectedRegion = layer;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.9
    });

    showRegionInfo(e);

    // Charger les provinces de la région sélectionnée
    const properties = e.target.feature.properties;
    const regionName = properties.name_2 || properties.localnam_2;
    if (regionName) {
        loadProvinces(regionName);
    }
}

// Fonction pour afficher les informations d'une région
function showRegionInfo(e) {
    const properties = e.target.feature.properties;
    // Utiliser name_2 ou id comme identifiant de région
    let regionName = properties.name_2 || properties.localnam_2;
    const regionId = properties.id || properties.cartodb_id;

    // Correction spécifique pour la région de Rabat
    if (regionName && (regionName.includes('Rabat') || regionId === '04')) {
        console.log('Détection de la région de Rabat, application de la correction spécifique');
        regionName = 'Rabat-Salé-Kénitra';
    }

    // Afficher toutes les propriétés pour débogage
    console.log('Toutes les propriétés de la région:', properties);

    // Normaliser le nom de la région
    const normalizedRegionName = normalizeRegionName(regionName);
    console.log(`Nom de région détecté: ${regionName}, normalisé: ${normalizedRegionName}`);
    regionName = normalizedRegionName; // Utiliser le nom normalisé

    // Afficher directement le nom de la région depuis les propriétés GeoJSON
    let html = `<h3>${regionName}</h3>`;

    // Récupérer les provinces et les statistiques de la région
    const { provinces, stats } = getProvincesForRegion(regionName);

    // Récupérer le code de la région pour accéder aux données du fichier region_details.json
    const regionCode = regionCodeMapping[regionName];
    const regionData = regionCode && regionDetails[regionCode] ? regionDetails[regionCode] : null;

    // Déterminer les valeurs à afficher
    // Pour la population, prioriser les statistiques calculées à partir des provinces
    const population = stats && stats.population ? stats.population : (regionData && regionData.population ? regionData.population : null);

    // Pour la superficie, utiliser uniquement les données du fichier region_details.json
    const superficie = regionData && regionData.superficie ? regionData.superficie : null;

    // Pour la densité, recalculer en fonction de la population et de la superficie
    const densite = population && superficie ? Math.round(population / superficie) : (regionData && regionData.densite ? regionData.densite : null);

    // Pour le chef-lieu, prioriser les données du fichier region_details.json
    const chefLieu = regionData && regionData.chef_lieu ? regionData.chef_lieu : (stats && stats.chef_lieu ? stats.chef_lieu : null);

    // Ajouter les détails de la région
    html += `
        <div class="region-detail"><strong>Population:</strong> ${population ? population.toLocaleString() : 'Non disponible'} habitants</div>
        <div class="region-detail"><strong>Superficie:</strong> ${superficie ? superficie.toLocaleString() : 'Non disponible'} km²</div>
        <div class="region-detail"><strong>Densité:</strong> ${densite ? densite.toLocaleString() : 'Non disponible'} hab/km²</div>
        <div class="region-detail"><strong>Chef-lieu:</strong> ${chefLieu || 'Non disponible'}</div>
    `;


    // Ajouter les provinces de la région
    if (provinces && provinces.length > 0) {
        html += `
        <h4>Provinces de la région:</h4>
        <ul class="provinces-list">
        `;

        provinces.forEach(province => {
            html += `<li>${province.nom} <span class="province-population">(${province.population.toLocaleString()} hab.)</span></li>`;
        });

        html += `</ul>`;
    } else {
        console.error(`Aucune province trouvée pour la région ${regionName}`);
    }
    // Normaliser le nom pour la recherche dans le JSON
const econKey = regionName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const econ = economieRegionData[econKey];

if (econ) {
    html += `
        <div class="region-detail"><strong>PIB régional:</strong> ${econ.pib_milliards_mad} milliards MAD</div>
        <div class="region-detail"><strong>Taux de chômage:</strong> ${econ.taux_chomage}%</div>
        <div class="region-detail"><strong>Secteur principal:</strong> ${econ.secteur_principal}</div>
    `;
}
const eduKey = regionName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const edu = educationRegionData[eduKey];

if (edu) {
    html += `
      <div class="region-detail"><strong>Taux d'alphabétisation:</strong> ${edu.taux_alphabétisation}%</div>
      <div class="region-detail"><strong>Taux de scolarisation (secondaire):</strong> ${edu.taux_scolarisation_secondaire}%</div>
    `;
}
const ecoKey = regionName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const energie = energieClimatData[ecoKey];

if (energie) {
  html += `
    <div class="region-detail"><strong>Énergie solaire produite:</strong> ${energie.energie_solaire_mw} MW</div>
    <div class="region-detail"><strong>Énergie éolienne produite:</strong> ${energie.energie_eolienne_mw} MW</div>
    <div class="region-detail"><strong>Zone à risque climatique:</strong> ${energie.zone_sensible}</div>
  `;
}




    // Afficher les informations dans le panneau latéral
    document.getElementById('region-info').innerHTML = html;
    
    // Créer et afficher le graphique des provinces pour cette région
    if (provinces && provinces.length > 0) {
        // Ajouter à nouveau le conteneur pour le graphique qui a été remplacé par innerHTML
        const graphContainer = document.createElement('div');
        graphContainer.id = 'region-graph-container';
        graphContainer.style.marginTop = '20px';
        
        const canvas = document.createElement('canvas');
        canvas.id = 'regionChart';
        canvas.width = 400;
        canvas.height = 300;
        
        graphContainer.appendChild(canvas);
        document.getElementById('region-info').appendChild(graphContainer);
        
        // Créer le graphique avec les données des provinces
        createRegionChart(provinces, regionName);
    }
}

// Fonction pour gérer les interactions avec chaque région
function onEachFeature(feature, layer) {
    const props = feature.properties;
    const regionName = props.name_2 || props.localnam_2 || 'Région inconnue';
    const normalizedName = normalizeRegionName(regionName);
    const regionCode = regionCodeMapping[normalizedName];
    const regionData = regionCode ? regionDetails[regionCode] : null;

    // Récupération des données à afficher
    const population = regionData?.population?.toLocaleString() || 'Non dispo';
    const superficie = regionData?.superficie?.toLocaleString() || 'Non dispo';
    const chefLieu = regionData?.chef_lieu || 'Non dispo';

    const tooltipContent = `
        <strong>${normalizedName}</strong><br>
        Population : ${population}<br>
        Superficie : ${superficie} km²<br>
        Chef-lieu : ${chefLieu}
    `;
    console.log("🟡 REGION NAME:", regionName);
console.log("🟢 NORMALIZED NAME:", normalizedName);
console.log("🔵 REGION CODE:", regionCode);
console.log("🟣 REGION DATA:", regionData);


    layer.bindTooltip(tooltipContent, {
        sticky: true,
        direction: 'top',
        offset: [0, -10],
        opacity: 0.9,
        className: 'custom-tooltip'
    });

    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: selectRegion
    });
}



// Fonction pour charger et afficher les provinces d'une région
function loadProvinces(regionName) {
    // D'abord normaliser le nom de la région
    const normalizedRegionName = normalizeRegionName(regionName);
    console.log(`Chargement des provinces pour la région: ${regionName}, normalisé: ${normalizedRegionName}`);

    // Table de correspondance entre les noms des régions normalisés et les noms de fichiers
    const regionFileMapping = {
        // Noms en français
        "Dakhla-Oued Ed-Dahab": "eddakhla-oued-eddahab",
        "Fès-Meknès": "fes-meknes",
        "Tanger-Tétouan-Al Hoceïma": "tanger-tetouan-al-hoceima",
        "Laâyoune-Sakia El Hamra": "laayoune-sakia-el-hamra",
        "Guelmim-Oued Noun": "guelmim-oued-noun",
        "Souss-Massa": "souss-massa",
        "Drâa-Tafilalet": "draa-tafilalet",
        "Marrakech-Safi": "marrakech-safi",
        "Béni Mellal-Khénifra": "beni-mellal-khenifra",
        "Casablanca-Settat": "casablanca-settat",
        "Rabat-Salé-Kénitra": "rabat-sale-kenitra",
        "L'Oriental": "oriental",

        // Noms en anglais
        "Dakhla-Oued Ed Dahab": "eddakhla-oued-eddahab",
        "Fez-Meknes": "fes-meknes",
        "Fes-Meknes": "fes-meknes",
        "Tangier-Tetouan-Al Hoceima": "tanger-tetouan-al-hoceima",
        "Laayoune-Sakia El Hamra": "laayoune-sakia-el-hamra",
        "Guelmim-Oued Noun": "guelmim-oued-noun",
        "Souss-Massa": "souss-massa",
        "Draa-Tafilalet": "draa-tafilalet",
        "Marrakech-Safi": "marrakech-safi",
        "Beni Mellal-Khenifra": "beni-mellal-khenifra",
        "Casablanca-Settat": "casablanca-settat",
        "Rabat-Sale-Kenitra": "rabat-sale-kenitra",
        "Oriental": "oriental"
    };

    // Utiliser la table de correspondance ou formater le nom de la région
    let formattedRegionName;
    if (regionFileMapping[normalizedRegionName]) {
        formattedRegionName = regionFileMapping[normalizedRegionName];
    } else {
        formattedRegionName = normalizedRegionName.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
            .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
            .replace(/[^a-z0-9-]/g, ''); // Supprimer les caractères spéciaux
    }

    // Construire le chemin du fichier GeoJSON des provinces
    const provincesFile = `/static/data/provinces/${formattedRegionName}_provinces.geojson`;

    // Charger le fichier GeoJSON des provinces
    fetch(provincesFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Fichier non trouvé: ${provincesFile}`);
            }
            return response.json();
        })
        .then(data => {
            // Masquer la couche des régions
            if (regionsLayer) {
                map.removeLayer(regionsLayer);
            }

            // Afficher la couche des provinces
            provincesLayer = L.geoJSON(data, {
                style: style,
                onEachFeature: function(feature, layer) {
                    layer.on({
                        mouseover: highlightFeature,
                        mouseout: resetHighlight,
                        click: function(e) {
                            // Réinitialiser le style de la province précédemment sélectionnée
                            if (selectedProvince) {
                                provincesLayer.resetStyle(selectedProvince);
                            }

                            selectedProvince = e.target;

                            e.target.setStyle({
                                weight: 5,
                                color: '#666',
                                dashArray: '',
                                fillOpacity: 0.9
                            });

                            // Afficher les informations de la province
                            const properties = e.target.feature.properties;

                            // Afficher les propriétés dans la console pour débogage
                            console.log('Propriétés de la province:', properties);

                            // Essayer de trouver le nom de la province dans différentes propriétés possibles
                            let provinceName = 'Province';

                            // Parcourir toutes les propriétés pour trouver celle qui contient le nom
                            console.log('Toutes les propriétés disponibles:', properties);

                            for (const key in properties) {
                                // Rechercher des clés qui pourraient contenir le nom de la province
                                if (key.toLowerCase().includes('name') ||
                                    key.toLowerCase().includes('nom') ||
                                    key.toLowerCase().includes('province') ||
                                    key.toLowerCase() === 'id_2') {
                                    if (properties[key] && typeof properties[key] === 'string') {
                                        provinceName = properties[key];
                                        console.log(`Nom de province trouvé dans la propriété '${key}': ${provinceName}`);
                                        break;
                                    }
                                }
                            }

                            // Si aucun nom n'a été trouvé, essayer d'utiliser d'autres propriétés
                            if (provinceName === 'Province') {
                                provinceName = properties.name || properties.Province || properties.NAME ||
                                               properties.name_2 || properties.localnam_2 || properties.id_2 ||
                                               'Province ' + (properties.id || '');
                            }

                            // Créer un HTML plus détaillé pour la province
                            let html = `<h3>${provinceName}</h3>`;



                            // Ajouter la région parente
                            if (selectedRegion && selectedRegion.feature && selectedRegion.feature.properties) {
                                const regionName = selectedRegion.feature.properties.name_2 ||
                                                  selectedRegion.feature.properties.localnam_2 ||
                                                  'Région';
                                html += `<div class="province-detail"><strong>Région:</strong> ${regionName}</div>`;
                            }



                            // Normaliser le nom de la province pour la recherche dans le fichier JSON
                            const normalizedProvinceName = normalizeProvinceName(provinceName);
                            console.log(`Nom de province détecté: ${provinceName}, normalisé: ${normalizedProvinceName}`);

                            // Chercher des informations supplémentaires dans le fichier province_details.json
                            let provinceInfo = provinceDetails[normalizedProvinceName];

                            // Vérifications spéciales pour les provinces problématiques
                            let specialProvinceName = null; // Variable pour stocker le nom spécial de la province

                            if (!provinceInfo) {
                                // Cas spécial pour El-Kelâa-des-Sraghna
                                if (provinceName.toLowerCase().includes("el kelaa") ||
                                    provinceName.toLowerCase().includes("kelaa") ||
                                    provinceName.toLowerCase().includes("kelâa")) {
                                    specialProvinceName = "El-Kelâa-des--Sraghna";
                                    provinceInfo = provinceDetails[specialProvinceName];
                                    console.log(`Utilisation des données pour ${specialProvinceName}`);
                                }

                                // Cas spécial pour Skhirate--Temara
                                else if (provinceName.toLowerCase().includes("skhirate") ||
                                         provinceName.toLowerCase().includes("skhirat") ||
                                         provinceName.toLowerCase().includes("temara")) {
                                    specialProvinceName = "Skhirate--Temara";
                                    provinceInfo = provinceDetails[specialProvinceName];
                                    console.log(`Utilisation des données pour ${specialProvinceName}`);
                                }

                                // Cas spécial pour Inezgane--Ait-Melloul
                                else if (provinceName.toLowerCase().includes("inezgane") ||
                                         provinceName.toLowerCase().includes("ait melloul")) {
                                    specialProvinceName = "Inezgane--Ait-Melloul";
                                    provinceInfo = provinceDetails[specialProvinceName];
                                    console.log(`Utilisation des données pour ${specialProvinceName}`);
                                }

                                // Cas spécial pour Chtouka--Ait-Baha
                                else if (provinceName.toLowerCase().includes("chtouka") ||
                                         provinceName.toLowerCase().includes("ait baha")) {
                                    specialProvinceName = "Chtouka--Ait-Baha";
                                    provinceInfo = provinceDetails[specialProvinceName];
                                    console.log(`Utilisation des données pour ${specialProvinceName}`);
                                }
                            }

                            if (provinceInfo) {
                                // Utiliser les informations du fichier province_details.json
                                // Ajouter les données économiques harmonisées
const econKey = normalizedProvinceName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const econ = economieData[econKey];

if (econ) {
    html += `<div class="province-detail"><strong>PIB:</strong> ${econ.pib_milliards_mad} milliards MAD</div>`;
    html += `<div class="province-detail"><strong>Taux de chômage:</strong> ${econ.taux_chomage}%</div>`;
    html += `<div class="province-detail"><strong>Secteur principal:</strong> ${econ.secteur_principal}</div>`;
}
const edu = educationProvinceData[econKey]; // utiliser la même clé que pour économie

if (edu) {
    html += `<div class="province-detail"><strong>Alphabétisation:</strong> ${edu.taux_alphabétisation}%</div>`;
    html += `<div class="province-detail"><strong>Scolarisation secondaire:</strong> ${edu.taux_scolarisation_secondaire}%</div>`;
}
const energie = energieClimatProvinceData[econKey]; // réutilise econKey

if (energie) {
    html += `<div class="province-detail"><strong>Énergie solaire:</strong> ${energie.energie_solaire_mw} MW</div>`;
    html += `<div class="province-detail"><strong>Énergie éolienne:</strong> ${energie.energie_eolienne_mw} MW</div>`;
    html += `<div class="province-detail"><strong>Zone à risque:</strong> ${energie.zone_sensible}</div>`;
}


                                if (provinceInfo.population) {
                                    html += `<div class="province-detail"><strong>Population:</strong> ${Number(provinceInfo.population).toLocaleString()} habitants</div>`;
                                }

                                if (provinceInfo.superficie) {
                                    html += `<div class="province-detail"><strong>Superficie:</strong> ${Number(provinceInfo.superficie).toLocaleString()} km²</div>`;
                                }

                                if (provinceInfo.densite) {
                                    html += `<div class="province-detail"><strong>Densité:</strong> ${Number(provinceInfo.densite).toLocaleString()} hab/km²</div>`;
                                }

                                if (provinceInfo.chef_lieu) {
                                    html += `<div class="province-detail"><strong>Chef-lieu:</strong> ${provinceInfo.chef_lieu}</div>`;
                                }
                            } else {
                                // Utiliser les propriétés du GeoJSON si disponibles
                                if (properties.population) {
                                    html += `<div class="province-detail"><strong>Population:</strong> ${Number(properties.population).toLocaleString()} habitants</div>`;
                                }

                                if (properties.area || properties.superficie) {
                                    const area = properties.area || properties.superficie;
                                    html += `<div class="province-detail"><strong>Superficie:</strong> ${Number(area).toLocaleString()} km²</div>`;
                                }

                                if (properties.chef_lieu || properties.capital) {
                                    const capital = properties.chef_lieu || properties.capital;
                                    html += `<div class="province-detail"><strong>Chef-lieu:</strong> ${capital}</div>`;
                                }
                            }

                            // Ajouter un bouton pour voir toutes les propriétés (pour débogage)
                            html += `<div class="province-detail" style="margin-top: 15px;">
                                        <button onclick="showAllProperties()" style="padding: 5px; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">Voir toutes les propriétés</button>
                                     </div>`;

                            document.getElementById('region-info').innerHTML = html;
                            // Clear and draw the province chart separately
// Render the province chart into its separate container (outside of region-info)








                            // Stocker les propriétés dans une variable globale pour le débogage
                            window.currentProperties = properties;

                            // Afficher les informations météo pour cette province
                            // Si nous avons détecté une province spéciale, utiliser son nom pour la météo
                            if (specialProvinceName) {
                                console.log(`Utilisation du nom spécial pour la météo: ${specialProvinceName}`);
                                showProvinceWeather(specialProvinceName);
                            } else {
                                showProvinceWeather(normalizedProvinceName);
                            }
                        }
                    });
                }
            }).addTo(map);

            // Ajuster la vue de la carte pour montrer toutes les provinces
            map.fitBounds(provincesLayer.getBounds());

            // Mettre à jour l'état de la vue
            currentView = 'provinces';

            // Afficher le bouton de retour
            document.getElementById('back-to-regions').style.display = 'block';
        })
        .catch(error => {
            console.error('Erreur lors du chargement des provinces:', error);
            alert(`Impossible de charger les provinces pour la région ${regionName}. Erreur: ${error.message}`);
        });
}

// Fonction pour revenir à la vue des régions
function showRegions() {
    // Masquer la couche des provinces si elle existe
    if (provincesLayer) {
        map.removeLayer(provincesLayer);
    }

    // Réinitialiser les sélections
    selectedProvince = null;

    // Afficher la couche des régions
    if (regionsLayer) {
        regionsLayer.addTo(map);
        map.fitBounds(regionsLayer.getBounds());
    } else {
        // Si la couche des régions n'existe pas, la charger
        loadRegions();
    }

    // Mettre à jour l'état de la vue
    currentView = 'regions';

    // Masquer le bouton de retour
    document.getElementById('back-to-regions').style.display = 'none';

    // Effacer les informations affichées et cacher le graphique
    document.getElementById('region-info').innerHTML = '<p>Sélectionnez une région sur la carte pour afficher ses informations.</p>';
    
    // Si la fonction hideRegionChart existe (définie dans charts.js), l'appeler
    if (typeof hideRegionChart === 'function') {
        hideRegionChart();
    }
}

// Fonction pour charger les régions
function loadRegions() {
    // Charger directement les données GeoJSON des régions du Maroc depuis le fichier ma.geojson
    fetch('/static/data/ma.geojson')
        .then(response => response.json())
        .then(data => {
            // Ajouter les régions à la carte
            regionsLayer = L.geoJSON(data, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);

            // Ajuster la vue de la carte pour montrer toutes les régions
            map.fitBounds(regionsLayer.getBounds());
        })
        .catch(error => {
            console.error('Erreur lors du chargement des régions:', error);
            document.getElementById('region-info').innerHTML = '<p>Erreur lors du chargement des régions</p>';
        });
}

// Variable pour stocker les informations de la province avant d'afficher toutes les propriétés
let savedProvinceInfo = '';

// Fonction pour afficher toutes les propriétés d'une province (pour débogage)
function showAllProperties() {
    if (window.currentProperties) {
        // Sauvegarder le contenu actuel pour pouvoir y revenir
        savedProvinceInfo = document.getElementById('region-info').innerHTML;

        // Créer le contenu avec toutes les propriétés
        let html = '<h3>Toutes les propriétés</h3>';

        // Ajouter le bouton de retour en haut
        html += `<div class="province-detail" style="margin-bottom: 15px;">
                    <button onclick="backToProvinceInfo()" style="padding: 5px; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">
                        <i class="fas fa-arrow-left" style="margin-right: 5px;"></i> Retour
                    </button>
                 </div><ul>`;

        // Afficher toutes les propriétés
        for (const key in window.currentProperties) {
            html += `<li><strong>${key}:</strong> ${window.currentProperties[key]}</li>`;
        }

        html += '</ul>';

        document.getElementById('region-info').innerHTML = html;
    }
}

// Fonction pour revenir aux informations principales de la province
function backToProvinceInfo() {
    if (savedProvinceInfo) {
        document.getElementById('region-info').innerHTML = savedProvinceInfo;
    }
}

// Charger les régions au démarrage
loadRegions();