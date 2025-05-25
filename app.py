from flask import Flask, render_template, jsonify, request
import json
import os
import requests
from datetime import datetime, timedelta

# Clé API OpenWeatherMap
OPENWEATHERMAP_API_KEY = "0f51d0038bff6d25217af7883d058b9a"

# Cache pour les données météo
weather_cache = {}

app = Flask(__name__)

# Informations générales sur le Maroc
maroc_info = {
    "nom": "Royaume du Maroc",
    "superficie": 710850,  # en km² (Sahara occidental inclus)
    "coordonnees": {
        "latitude": 34.025278,  # 34° 01′ 31″ N
        "longitude": -6.836111   # 6° 50′ 10″ O
    },
    "capitale": "Rabat",
    "population": 37000000,  # approximatif
    "nombre_regions": 12
}

# Charger les données des régions du Maroc
@app.route('/')
def index():
    return render_template('index.html')

# API pour obtenir les informations générales sur le Maroc
@app.route('/api/maroc')
def get_maroc_info():
    return jsonify(maroc_info)

# API pour obtenir les données géographiques des régions
@app.route('/api/regions')
def get_regions():
    try:
        with open('static/data/regions.json', 'r', encoding='utf-8') as f:
            regions_data = json.load(f)
        return jsonify(regions_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API pour obtenir les informations d'une région spécifique
@app.route('/api/region/<region_id>')
def get_region_info(region_id):
    try:
        with open('static/data/region_details.json', 'r', encoding='utf-8') as f:
            regions_details = json.load(f)
        
        if region_id in regions_details:
            return jsonify(regions_details[region_id])
        else:
            return jsonify({"error": "Région non trouvée"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API pour obtenir les données météo d'une province
@app.route('/api/weather/<province_name>')
def get_weather(province_name):
    try:
        # Normaliser le nom de la province
        province_name = province_name.strip()
        
        # Vérifier si les données sont en cache et encore valides (moins de 1 heure)
        current_time = datetime.now()
        if province_name in weather_cache:
            cache_time, cache_data = weather_cache[province_name]
            if current_time - cache_time < timedelta(hours=1):
                print(f"Utilisation du cache météo pour {province_name}")
                return jsonify(cache_data)
        
        # Charger les détails de la province pour obtenir les coordonnées
        with open('static/data/province_details.json', 'r', encoding='utf-8') as f:
            provinces = json.load(f)
        
        # Vérifier si la province existe
        if province_name not in provinces:
            print(f"Province non trouvée: {province_name}")
            # Essayer de trouver une correspondance approximative
            for p_name in provinces.keys():
                if province_name.lower() in p_name.lower() or p_name.lower() in province_name.lower():
                    province_name = p_name
                    print(f"Correspondance trouvée: {province_name}")
                    break
            else:
                return jsonify({"error": "Province non trouvée"}), 404
        
        # Vérifier si les coordonnées sont disponibles
        if "coordinates" not in provinces[province_name]:
            return jsonify({"error": "Coordonnées non disponibles pour cette province"}), 404
        
        # Récupérer les coordonnées
        lat = provinces[province_name]["coordinates"]["lat"]
        lon = provinces[province_name]["coordinates"]["lon"]
        
        # Appeler l'API OpenWeatherMap
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&lang=fr&appid={OPENWEATHERMAP_API_KEY}"
        
        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({"error": f"Erreur API OpenWeatherMap: {response.status_code}"}), 500
            
        weather_data = response.json()
        
        # Extraire les informations pertinentes
        
        # Utiliser le chef-lieu officiel de la province au lieu du nom renvoyé par OpenWeatherMap
        city_name = provinces[province_name].get("chef_lieu", weather_data["name"])
        
        # Pour certaines villes spécifiques, forcer le nom officiel
        city_name_mapping = {
            "Le Polo": "Casablanca",
            "Medina De Rabat": "Rabat",
            "Sidi Moussa": "El Kelâa des Sraghna",
            "Temara": "Témara",
            "Ain Harrouda": "Mohammadia",
            "Meknes": "Meknès",
            "Fes": "Fès"
        }
        
        # Si le nom de la ville renvoyé par OpenWeatherMap est dans notre mapping, utiliser le nom officiel
        if weather_data["name"] in city_name_mapping:
            city_name = city_name_mapping[weather_data["name"]]
        
        weather = {
            "temperature": round(weather_data["main"]["temp"]),
            "feels_like": round(weather_data["main"]["feels_like"]),
            "description": weather_data["weather"][0]["description"],
            "humidity": weather_data["main"]["humidity"],
            "wind_speed": round(weather_data["wind"]["speed"]),
            "icon": weather_data["weather"][0]["icon"],
            "city": city_name,
            "timestamp": current_time.strftime("%H:%M")
        }
        
        # Mettre en cache les données
        weather_cache[province_name] = (current_time, weather)
        
        return jsonify(weather)
    except Exception as e:
        print(f"Erreur météo: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
