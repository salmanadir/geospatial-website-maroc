#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import requests
import pandas as pd
from io import BytesIO

# URL du fichier Excel du HCP (RGPH 2024)
HCP_EXCEL_URL = "https://www.hcp.ma/file/242341/"

# Chemins des fichiers de sortie
REGION_DETAILS_FILE = "static/data/region_details.json"
PROVINCE_DETAILS_FILE = "static/data/province_details.json"

def download_hcp_data():
    """Télécharge les données du HCP au format Excel"""
    print("Téléchargement des données du HCP...")
    response = requests.get(HCP_EXCEL_URL)
    
    if response.status_code == 200:
        print("Téléchargement réussi!")
        return BytesIO(response.content)
    else:
        print(f"Erreur lors du téléchargement: {response.status_code}")
        return None

def process_excel_data(excel_data):
    """Traite les données Excel pour extraire les informations sur les régions et provinces"""
    print("Traitement des données Excel...")
    
    # Charger le fichier Excel
    try:
        df = pd.read_excel(excel_data, sheet_name="Régions et provinces")
        print("Données Excel chargées avec succès!")
    except Exception as e:
        print(f"Erreur lors du chargement des données Excel: {e}")
        # Essayer avec un autre nom de feuille
        try:
            df = pd.read_excel(excel_data)
            print("Données Excel chargées avec succès (feuille par défaut)!")
        except Exception as e:
            print(f"Erreur lors du chargement des données Excel: {e}")
            return None, None
    
    # Afficher les noms des colonnes pour le débogage
    print("Colonnes disponibles:", df.columns.tolist())
    
    # Initialiser les dictionnaires pour les régions et provinces
    region_details = {}
    province_details = {}
    
    # Traiter les données
    try:
        # Supposons que le DataFrame a une structure avec des colonnes pour la région, la province et la population
        # Adapter ces noms de colonnes en fonction de la structure réelle du fichier Excel
        for _, row in df.iterrows():
            # Extraire les informations de la ligne
            try:
                region_name = row.get('Région', row.get('REGION', ''))
                province_name = row.get('Province/Préfecture', row.get('PROVINCE', ''))
                population = row.get('Population', row.get('POPULATION', 0))
                
                # Ignorer les lignes sans région ou province
                if not region_name or not province_name:
                    continue
                
                # Nettoyer les noms
                region_name = region_name.strip()
                province_name = province_name.strip()
                
                # Ajouter la région si elle n'existe pas encore
                if region_name not in region_details:
                    region_details[region_name] = {
                        "nom": region_name,
                        "population": 0,
                        "superficie": 0,  # À compléter manuellement
                        "densite": 0,     # À calculer plus tard
                        "chef_lieu": "",  # À compléter manuellement
                        "provinces": []
                    }
                
                # Ajouter la province
                province_details[province_name] = {
                    "nom": province_name,
                    "region": region_name,
                    "population": int(population) if isinstance(population, (int, float)) else 0,
                    "superficie": 0,  # À compléter manuellement
                    "densite": 0      # À calculer plus tard
                }
                
                # Ajouter la province à la liste des provinces de la région
                if province_name not in region_details[region_name]["provinces"]:
                    region_details[region_name]["provinces"].append(province_name)
                
                # Ajouter la population de la province à la population totale de la région
                region_details[region_name]["population"] += province_details[province_name]["population"]
            
            except Exception as e:
                print(f"Erreur lors du traitement d'une ligne: {e}")
                continue
        
        print(f"Traitement terminé: {len(region_details)} régions et {len(province_details)} provinces extraites.")
        
        return region_details, province_details
    
    except Exception as e:
        print(f"Erreur lors du traitement des données: {e}")
        return None, None

def save_json_files(region_details, province_details):
    """Sauvegarde les données extraites dans des fichiers JSON"""
    print("Sauvegarde des fichiers JSON...")
    
    # Créer les répertoires si nécessaire
    os.makedirs(os.path.dirname(REGION_DETAILS_FILE), exist_ok=True)
    os.makedirs(os.path.dirname(PROVINCE_DETAILS_FILE), exist_ok=True)
    
    # Sauvegarder les détails des régions
    with open(REGION_DETAILS_FILE, 'w', encoding='utf-8') as f:
        json.dump(region_details, f, ensure_ascii=False, indent=2)
    
    # Sauvegarder les détails des provinces
    with open(PROVINCE_DETAILS_FILE, 'w', encoding='utf-8') as f:
        json.dump(province_details, f, ensure_ascii=False, indent=2)
    
    print(f"Fichiers sauvegardés: {REGION_DETAILS_FILE} et {PROVINCE_DETAILS_FILE}")

def main():
    """Fonction principale"""
    # Télécharger les données
    excel_data = download_hcp_data()
    if not excel_data:
        print("Impossible de télécharger les données. Arrêt du script.")
        return
    
    # Traiter les données
    region_details, province_details = process_excel_data(excel_data)
    if not region_details or not province_details:
        print("Impossible de traiter les données. Arrêt du script.")
        return
    
    # Sauvegarder les fichiers JSON
    save_json_files(region_details, province_details)
    
    print("Traitement des données HCP terminé avec succès!")

if __name__ == "__main__":
    main()
