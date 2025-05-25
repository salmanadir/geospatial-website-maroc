#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import glob
import os

# Liste pour stocker tous les noms de provinces trouvés
all_province_names = []

# Parcourir tous les fichiers GeoJSON des provinces
for geojson_file in glob.glob('static/data/provinces/*_provinces.geojson'):
    print(f"Analyse du fichier: {geojson_file}")
    
    # Charger le fichier GeoJSON
    with open(geojson_file, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
            
            # Parcourir toutes les entités (features) du GeoJSON
            for feature in data.get('features', []):
                properties = feature.get('properties', {})
                
                # Chercher les propriétés qui pourraient contenir le nom de la province
                province_name = None
                
                # Essayer différentes clés possibles pour le nom de la province
                for key in properties:
                    if any(term in key.lower() for term in ['name', 'nom', 'province', 'id_2']):
                        if properties[key] and isinstance(properties[key], str) and len(properties[key]) > 2:
                            province_name = properties[key]
                            all_province_names.append(province_name)
                            print(f"  Nom de province trouvé: {province_name} (clé: {key})")
                            break
        
        except json.JSONDecodeError:
            print(f"Erreur de décodage JSON dans le fichier: {geojson_file}")
        except Exception as e:
            print(f"Erreur lors de l'analyse du fichier {geojson_file}: {str(e)}")

# Afficher tous les noms de provinces uniques trouvés
unique_names = sorted(set(all_province_names))
print("\nListe de tous les noms de provinces trouvés dans les fichiers GeoJSON:")
for name in unique_names:
    print(f"  - {name}")

# Charger le fichier province_details.json pour comparer
try:
    with open('static/data/province_details.json', 'r', encoding='utf-8') as f:
        province_details = json.load(f)
        
    # Comparer les noms des provinces
    print("\nComparaison avec les noms dans province_details.json:")
    
    # Noms dans province_details.json mais pas dans les fichiers GeoJSON
    json_only = set(province_details.keys()) - set(unique_names)
    if json_only:
        print("\nNoms présents uniquement dans province_details.json:")
        for name in sorted(json_only):
            print(f"  - {name}")
    
    # Noms dans les fichiers GeoJSON mais pas dans province_details.json
    geojson_only = set(unique_names) - set(province_details.keys())
    if geojson_only:
        print("\nNoms présents uniquement dans les fichiers GeoJSON:")
        for name in sorted(geojson_only):
            print(f"  - {name}")
            
            # Suggérer des correspondances possibles
            suggestions = []
            for json_name in province_details.keys():
                # Vérifier si le nom GeoJSON est inclus dans le nom JSON ou vice versa
                if name.lower() in json_name.lower() or json_name.lower() in name.lower():
                    suggestions.append(json_name)
            
            if suggestions:
                print(f"    Correspondances possibles dans province_details.json:")
                for suggestion in suggestions:
                    print(f"    -> {suggestion}")
    
except Exception as e:
    print(f"Erreur lors de la comparaison avec province_details.json: {str(e)}")
