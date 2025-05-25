#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import glob

# Fonction pour extraire les noms des provinces d'un fichier GeoJSON
def extract_province_names(geojson_file):
    print(f"Analyse du fichier: {geojson_file}")
    
    with open(geojson_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
        for feature in data.get('features', []):
            properties = feature.get('properties', {})
            
            # Afficher toutes les propriétés pour déboguer
            print(f"Propriétés disponibles: {list(properties.keys())}")
            
            # Chercher spécifiquement la propriété Province_fr
            if 'Province_fr' in properties:
                print(f"Province_fr: {properties['Province_fr']}")
            
            # Chercher d'autres propriétés qui pourraient contenir le nom de la province
            for key, value in properties.items():
                if isinstance(value, str) and ('province' in key.lower() or 'name' in key.lower() or 'nom' in key.lower()):
                    print(f"Propriété '{key}': {value}")
            
            # Ajouter une ligne vide pour séparer les entités
            print()
            
            # Limiter à 3 entités pour ne pas surcharger la sortie
            break

# Analyser le fichier GeoJSON de la région Tanger-Tétouan-Al Hoceïma
extract_province_names('static/data/provinces/tanger-tetouan-al-hoceima_provinces.geojson')
