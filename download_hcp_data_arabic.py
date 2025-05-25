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
    """Traite les données Excel pour extraire les informations sur les provinces"""
    print("Traitement des données Excel...")
    
    # Charger le fichier Excel
    try:
        # Essayer de charger la première feuille
        df = pd.read_excel(excel_data)
        print("Données Excel chargées avec succès!")
        
        # Afficher les premières lignes pour comprendre la structure
        print("Premières lignes du fichier Excel:")
        print(df.head())
        
        # Afficher les noms des colonnes
        print("Colonnes disponibles:", df.columns.tolist())
        
        # Initialiser le dictionnaire pour les provinces
        province_details = {}
        
        # Supposons que le fichier Excel contient des colonnes pour la province, la population, etc.
        # Nous allons essayer de trouver ces colonnes en fonction de leur contenu
        
        # Chercher les colonnes pertinentes
        province_col = None
        population_col = None
        
        for col in df.columns:
            # Afficher les premières valeurs de chaque colonne pour aider au débogage
            print(f"Colonne '{col}': {df[col].head().tolist()}")
            
            # Essayer de déterminer quelle colonne contient quoi
            # Ceci est une approche simplifiée, vous devrez peut-être l'ajuster
            if isinstance(df[col].iloc[0], str) and len(df[col].iloc[0]) > 5:
                province_col = col
                print(f"Colonne des provinces identifiée: {col}")
            elif isinstance(df[col].iloc[0], (int, float)) and df[col].iloc[0] > 1000:
                population_col = col
                print(f"Colonne de population identifiée: {col}")
        
        if province_col and population_col:
            print(f"Colonnes identifiées: Province={province_col}, Population={population_col}")
            
            # Traiter les données
            for _, row in df.iterrows():
                province_name = row[province_col]
                population = row[population_col]
                
                # Ignorer les lignes sans province ou population
                if not isinstance(province_name, str) or not isinstance(population, (int, float)):
                    continue
                
                # Nettoyer le nom de la province
                province_name = province_name.strip()
                
                # Ajouter la province au dictionnaire
                province_details[province_name] = {
                    "nom": province_name,
                    "population": int(population),
                    # Ces valeurs seront à compléter manuellement ou à partir d'autres sources
                    "superficie": 0,
                    "densite": 0,
                    "chef_lieu": ""
                }
            
            print(f"Traitement terminé: {len(province_details)} provinces extraites.")
            return province_details
        else:
            print("Impossible d'identifier les colonnes nécessaires.")
            return None
    
    except Exception as e:
        print(f"Erreur lors du traitement des données Excel: {e}")
        return None

def save_json_file(province_details):
    """Sauvegarde les données extraites dans un fichier JSON"""
    if not province_details:
        print("Aucune donnée à sauvegarder.")
        return
    
    print("Sauvegarde du fichier JSON...")
    
    # Créer le répertoire si nécessaire
    os.makedirs(os.path.dirname(PROVINCE_DETAILS_FILE), exist_ok=True)
    
    # Sauvegarder les détails des provinces
    with open(PROVINCE_DETAILS_FILE, 'w', encoding='utf-8') as f:
        json.dump(province_details, f, ensure_ascii=False, indent=2)
    
    print(f"Fichier sauvegardé: {PROVINCE_DETAILS_FILE}")

def main():
    """Fonction principale"""
    # Télécharger les données
    excel_data = download_hcp_data()
    if not excel_data:
        print("Impossible de télécharger les données. Arrêt du script.")
        return
    
    # Traiter les données
    province_details = process_excel_data(excel_data)
    if not province_details:
        print("Impossible de traiter les données. Arrêt du script.")
        return
    
    # Sauvegarder le fichier JSON
    save_json_file(province_details)
    
    print("Traitement des données HCP terminé avec succès!")

if __name__ == "__main__":
    main()
