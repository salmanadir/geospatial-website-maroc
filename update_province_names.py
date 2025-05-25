#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os

# Charger le fichier province_details.json
file_path = 'static/data/province_details.json'
with open(file_path, 'r', encoding='utf-8') as f:
    province_details = json.load(f)

# Définir les correspondances exactes entre les noms dans province_details.json et les noms dans les fichiers GeoJSON
name_mappings = {
    # Correspondances exactes identifiées par le script extract_province_names.py
    "Al Hoceima": "Al-Hoceima",
    "Chtouka-Aït Baha": "Chtouka--Ait-Baha",
    "El Hajeb": "El-Hajeb",
    "El Kelaa des Sraghna": "El-Kelâa-des--Sraghna",
    "Fès": "Fes",
    "Inezgane-Aït Melloul": "Inezgane--Ait-Melloul",
    "Laâyoune": "Laayoune",
    "M'diq-Fnideq": "Mdiq-Fnidq",
    "Meknès": "Meknes",
    "Moulay Yacoub": "Moulay-Yacoub",
    "Oued Eddahab": "Oued-Ed-Dahab",
    "Tétouan": "Tetouan"
}

# Créer un nouveau dictionnaire avec les noms mis à jour
updated_province_details = {}

for province_name, province_data in province_details.items():
    # Si le nom est dans notre liste de correspondances, utiliser le nouveau nom
    if province_name in name_mappings:
        new_name = name_mappings[province_name]
        print(f"Renommage: {province_name} -> {new_name}")
        updated_province_details[new_name] = province_data
    else:
        # Sinon, conserver le nom original
        updated_province_details[province_name] = province_data

# Sauvegarder le fichier mis à jour
backup_path = file_path + '.backup2'
print(f"Création d'une sauvegarde: {backup_path}")
os.rename(file_path, backup_path)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(updated_province_details, f, ensure_ascii=False, indent=2)

print(f"Fichier {file_path} mis à jour avec succès.")
