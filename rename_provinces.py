#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os

# Charger le fichier province_details.json
file_path = 'static/data/province_details.json'
with open(file_path, 'r', encoding='utf-8') as f:
    province_details = json.load(f)

# Définir les correspondances de noms (ancien_nom: nouveau_nom)
name_mappings = {
    "El Kelâa Des-Sraghna": "El Kelaa des Sraghna",
    "Oued Ed-Dahab": "Oued Eddahab",
    "Sidi Ifni": "Sidi-Ifni",
    "Al Haouz": "Al-Haouz",
    "Fquih Ben Salah": "Fquih-Ben-Salah",
    "Béni Mellal": "Beni-Mellal",
    "Khénifra": "Khenifra",
    "Sidi Bennour": "Sidi-Bennour",
    "El Jadida": "El-Jadida",
    "Médiouna": "Mediouna",
    "Skhirate-Témara": "Skhirate--Temara",
    "Khémisset": "Khemisset",
    "Salé": "Sale",
    "Kénitra": "Kenitra",
    "Sidi Kacem": "Sidi-Kacem",
    "Sidi Slimane": "Sidi-Slimane"
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
backup_path = file_path + '.backup'
print(f"Création d'une sauvegarde: {backup_path}")
os.rename(file_path, backup_path)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(updated_province_details, f, ensure_ascii=False, indent=2)

print(f"Fichier {file_path} mis à jour avec succès.")
