#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import glob

# Fonction pour extraire le nom exact de Al-Hoceima du fichier GeoJSON
def extract_al_hoceima_name():
    geojson_file = 'static/data/provinces/tanger-tetouan-al-hoceima_provinces.geojson'
    
    with open(geojson_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
        for feature in data.get('features', []):
            properties = feature.get('properties', {})
            
            # Vérifier si c'est la province Al-Hoceima
            for key, value in properties.items():
                if isinstance(value, str) and 'hoceima' in value.lower():
                    print(f"Trouvé Al-Hoceima dans la propriété '{key}': {value}")
                    return key, value
    
    return None, None

# Charger le fichier province_details.json
file_path = 'static/data/province_details.json'
with open(file_path, 'r', encoding='utf-8') as f:
    province_details = json.load(f)

# Extraire le nom exact de Al-Hoceima du fichier GeoJSON
key_name, exact_name = extract_al_hoceima_name()

if exact_name:
    print(f"Nom exact de Al-Hoceima dans le GeoJSON: {exact_name}")
    
    # Vérifier si ce nom existe déjà dans province_details.json
    if exact_name in province_details:
        print(f"Le nom '{exact_name}' existe déjà dans province_details.json")
    else:
        # Vérifier si Al-Hoceima existe sous un autre nom
        hoceima_keys = [k for k in province_details.keys() if 'hoceima' in k.lower()]
        
        if hoceima_keys:
            print(f"Al-Hoceima existe sous les noms: {hoceima_keys}")
            
            # Créer une copie des données avec le nom exact
            for hoceima_key in hoceima_keys:
                province_details[exact_name] = province_details[hoceima_key].copy()
                print(f"Copié les données de '{hoceima_key}' vers '{exact_name}'")
            
            # Sauvegarder le fichier mis à jour
            backup_path = file_path + '.backup_hoceima'
            print(f"Création d'une sauvegarde: {backup_path}")
            os.rename(file_path, backup_path)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(province_details, f, ensure_ascii=False, indent=2)
            
            print(f"Fichier {file_path} mis à jour avec succès.")
        else:
            print("Aucune entrée pour Al-Hoceima trouvée dans province_details.json")
else:
    print("Impossible de trouver Al-Hoceima dans le fichier GeoJSON")
