#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os

# Coordonnées des chefs-lieux des provinces du Maroc
province_coordinates = {
    "Tanger-Assilah": {"lat": 35.7595, "lon": -5.8340},
    "Mdiq-Fnidq": {"lat": 35.6839, "lon": -5.3213},
    "Tetouan": {"lat": 35.5889, "lon": -5.3626},
    "Fahs-Anjra": {"lat": 35.7619, "lon": -5.5598},
    "Larache": {"lat": 35.1914, "lon": -6.1567},
    "Al-Hoceima": {"lat": 35.2518, "lon": -3.9372},
    "Chefchaouen": {"lat": 35.1688, "lon": -5.2636},
    "Ouezzane": {"lat": 34.7956, "lon": -5.5782},
    
    # L'Oriental
    "Oujda-Angad": {"lat": 34.6805, "lon": -1.9112},
    "Nador": {"lat": 35.1667, "lon": -2.9333},
    "Driouch": {"lat": 34.9764, "lon": -3.3976},
    "Jerada": {"lat": 34.3100, "lon": -2.1800},
    "Berkane": {"lat": 34.9200, "lon": -2.3200},
    "Taourirt": {"lat": 34.4100, "lon": -2.8900},
    "Guercif": {"lat": 34.2256, "lon": -3.3532},
    "Figuig": {"lat": 32.1100, "lon": -1.2300},
    
    # Fès-Meknès
    "Fès": {"lat": 34.0333, "lon": -5.0000},
    "Meknès": {"lat": 33.8833, "lon": -5.5500},
    "El Hajeb": {"lat": 33.6900, "lon": -5.3700},
    "Ifrane": {"lat": 33.5333, "lon": -5.1000},
    "Moulay Yacoub": {"lat": 34.0872, "lon": -5.1792},
    "Séfrou": {"lat": 33.8300, "lon": -4.8300},
    "Boulemane": {"lat": 33.3628, "lon": -4.7300},
    "Taza": {"lat": 34.2100, "lon": -4.0100},
    "Taounate": {"lat": 34.5400, "lon": -4.6400},
    
    # Rabat-Salé-Kénitra
    "Rabat": {"lat": 34.0209, "lon": -6.8416},
    "Salé": {"lat": 34.0531, "lon": -6.7986},
    "Skhirate-Témara": {"lat": 33.9292, "lon": -6.9069},
    "Kénitra": {"lat": 34.2600, "lon": -6.5800},
    "Khémisset": {"lat": 33.8200, "lon": -6.0700},
    "Sidi Kacem": {"lat": 34.2200, "lon": -5.7100},
    "Sidi Slimane": {"lat": 34.2654, "lon": -5.9248},
    
    # Béni Mellal-Khénifra
    "Béni Mellal": {"lat": 32.3372, "lon": -6.3497},
    "Azilal": {"lat": 31.9600, "lon": -6.5700},
    "Fquih Ben Salah": {"lat": 32.5000, "lon": -6.6900},
    "Khénifra": {"lat": 32.9400, "lon": -5.6700},
    "Khouribga": {"lat": 32.8800, "lon": -6.9100},
    
    # Casablanca-Settat
    "Casablanca": {"lat": 33.5731, "lon": -7.5898},
    "Mohammadia": {"lat": 33.6861, "lon": -7.3828},
    "El Jadida": {"lat": 33.2316, "lon": -8.5006},
    "Nouaceur": {"lat": 33.3678, "lon": -7.5762},
    "Médiouna": {"lat": 33.4500, "lon": -7.5167},
    "Benslimane": {"lat": 33.6186, "lon": -7.1139},
    "Berrechid": {"lat": 33.2678, "lon": -7.5883},
    "Settat": {"lat": 33.0000, "lon": -7.6167},
    "Sidi Bennour": {"lat": 32.6500, "lon": -8.4200},
    
    # Marrakech-Safi
    "Marrakech": {"lat": 31.6295, "lon": -7.9811},
    "Chichaoua": {"lat": 31.5447, "lon": -8.7661},
    "Al Haouz": {"lat": 31.3000, "lon": -7.9000},
    "El Kelâa des Sraghna": {"lat": 32.0500, "lon": -7.4000},
    "Essaouira": {"lat": 31.5125, "lon": -9.7700},
    "Rehamna": {"lat": 32.2900, "lon": -7.9300},
    "Safi": {"lat": 32.3000, "lon": -9.2333},
    "Youssoufia": {"lat": 32.2464, "lon": -8.5289},
    
    # Drâa-Tafilalet
    "Errachidia": {"lat": 31.9314, "lon": -4.4247},
    "Ouarzazate": {"lat": 30.9200, "lon": -6.8900},
    "Midelt": {"lat": 32.6800, "lon": -4.7400},
    "Tinghir": {"lat": 31.5147, "lon": -5.5283},
    "Zagora": {"lat": 30.3300, "lon": -5.8400},
    
    # Souss-Massa
    "Agadir Ida-Outanane": {"lat": 30.4278, "lon": -9.5981},
    "Inezgane-Aït Melloul": {"lat": 30.3514, "lon": -9.5372},
    "Chtouka-Aït Baha": {"lat": 30.0667, "lon": -9.1500},
    "Taroudannt": {"lat": 30.4700, "lon": -8.8800},
    "Tiznit": {"lat": 29.7000, "lon": -9.7300},
    "Tata": {"lat": 29.7500, "lon": -7.9700},
    
    # Guelmim-Oued Noun
    "Guelmim": {"lat": 28.9864, "lon": -10.0572},
    "Assa-Zag": {"lat": 28.6078, "lon": -9.4294},
    "Tan-Tan": {"lat": 28.4378, "lon": -11.1028},
    "Sidi Ifni": {"lat": 29.3797, "lon": -10.1733},
    
    # Laâyoune-Sakia El Hamra
    "Laâyoune": {"lat": 27.1536, "lon": -13.2033},
    "Boujdour": {"lat": 26.1289, "lon": -14.4842},
    "Tarfaya": {"lat": 27.9392, "lon": -12.9261},
    "Es-Semara": {"lat": 26.7439, "lon": -11.6711},
    
    # Dakhla-Oued Ed-Dahab
    "Oued Ed-Dahab": {"lat": 23.6848, "lon": -15.9575},
    "Aousserd": {"lat": 22.5500, "lon": -14.3300}
}

def update_province_coordinates():
    """Ajoute les coordonnées géographiques aux provinces dans le fichier province_details.json"""
    try:
        # Charger le fichier province_details.json
        file_path = 'static/data/province_details.json'
        with open(file_path, 'r', encoding='utf-8') as f:
            provinces = json.load(f)
        
        # Compter les provinces mises à jour
        updated_count = 0
        missing_count = 0
        
        # Ajouter les coordonnées à chaque province
        for province_name, province_data in provinces.items():
            # Normaliser le nom pour la recherche
            normalized_name = province_name.replace('-', ' ').strip()
            
            # Chercher dans le dictionnaire de coordonnées
            found = False
            for coord_name, coords in province_coordinates.items():
                if normalized_name == coord_name.replace('-', ' ').strip():
                    province_data["coordinates"] = coords
                    updated_count += 1
                    found = True
                    break
            
            if not found:
                print(f"Coordonnées non trouvées pour: {province_name}")
                missing_count += 1
        
        # Sauvegarder le fichier mis à jour
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(provinces, f, ensure_ascii=False, indent=2)
        
        print(f"Mise à jour terminée! {updated_count} provinces mises à jour, {missing_count} provinces sans coordonnées.")
    except Exception as e:
        print(f"Erreur lors de la mise à jour des coordonnées: {e}")

if __name__ == "__main__":
    update_province_coordinates()
