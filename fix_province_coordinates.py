#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os

# Correspondances pour les provinces manquantes
missing_provinces_coordinates = {
    "Fes": {"lat": 34.0333, "lon": -5.0000},
    "Meknes": {"lat": 33.8833, "lon": -5.5500},
    "Sefrou": {"lat": 33.8300, "lon": -4.8300},
    "Sale": {"lat": 34.0531, "lon": -6.7986},
    "Skhirate--Temara": {"lat": 33.9292, "lon": -6.9069},
    "Kenitra": {"lat": 34.2600, "lon": -6.5800},
    "Khemisset": {"lat": 33.8200, "lon": -6.0700},
    "Mediouna": {"lat": 33.4500, "lon": -7.5167},
    "El-Kelâa-des--Sraghna": {"lat": 32.0500, "lon": -7.4000},
    "Agadir-Ida-Ou-Tanane": {"lat": 30.4278, "lon": -9.5981},
    "Inezgane--Ait-Melloul": {"lat": 30.3514, "lon": -9.5372},
    "Chtouka--Ait-Baha": {"lat": 30.0667, "lon": -9.1500},
    "Laayoune": {"lat": 27.1536, "lon": -13.2033},
    "Beni-Mellal": {"lat": 32.3372, "lon": -6.3497},
    "Khenifra": {"lat": 32.9400, "lon": -5.6700},
    "Tanger-Tetouan-Al-Hoceima": {"lat": 35.7595, "lon": -5.8340}  # Utiliser les coordonnées de Tanger
}

def fix_missing_coordinates():
    """Ajoute les coordonnées géographiques aux provinces manquantes"""
    try:
        # Charger le fichier province_details.json
        file_path = 'static/data/province_details.json'
        with open(file_path, 'r', encoding='utf-8') as f:
            provinces = json.load(f)
        
        # Compter les provinces mises à jour
        updated_count = 0
        
        # Ajouter les coordonnées aux provinces manquantes
        for province_name, province_data in provinces.items():
            if "coordinates" not in province_data and province_name in missing_provinces_coordinates:
                province_data["coordinates"] = missing_provinces_coordinates[province_name]
                updated_count += 1
                print(f"Coordonnées ajoutées pour: {province_name}")
        
        # Sauvegarder le fichier mis à jour
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(provinces, f, ensure_ascii=False, indent=2)
        
        print(f"Correction terminée! {updated_count} provinces manquantes mises à jour.")
    except Exception as e:
        print(f"Erreur lors de la correction des coordonnées: {e}")

if __name__ == "__main__":
    fix_missing_coordinates()
