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
            
            # Chercher spécifiquement la propriété Province_fr
            if 'Province_fr' in properties and 'aayoune' in properties['Province_fr'].lower():
                print(f"Province_fr: {properties['Province_fr']}")
                print(f"Toutes les propriétés: {properties}")
                
                # Ajouter une ligne vide pour séparer les entités
                print()

# Analyser le fichier GeoJSON de la région Laâyoune-Sakia El Hamra
extract_province_names('static/data/provinces/laayoune-sakia-el-hamra_provinces.geojson')
