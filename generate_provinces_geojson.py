#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour générer les fichiers GeoJSON des provinces du Maroc
en utilisant la bibliothèque geomaroc.
"""

import os
import geomaroc
import json

# Créer un dossier pour stocker les fichiers GeoJSON des provinces
provinces_dir = 'static/data/provinces'
os.makedirs(provinces_dir, exist_ok=True)

# Obtenir la liste des régions du Maroc
regions = geomaroc.Regions()

# Pour chaque région, générer un fichier GeoJSON des provinces
for region_name, region_id in regions.items():
    print(f"Génération du fichier GeoJSON pour les provinces de la région {region_name}...")
    
    # Obtenir les données GeoJSON des provinces de la région
    provinces_data = geomaroc.getProvince(region_name)
    
    # Sauvegarder en GeoJSON
    output_file = os.path.join(provinces_dir, f"{region_name.lower().replace(' ', '_')}_provinces.geojson")
    provinces_data.to_file(output_file, driver="GeoJSON")
    
    print(f"Fichier GeoJSON créé : {output_file}")

print("Terminé ! Tous les fichiers GeoJSON des provinces ont été générés.")
