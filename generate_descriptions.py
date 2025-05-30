import json
from pathlib import Path

# Chemins vers vos fichiers existants
province_file = Path('static/data/province_details.json')
region_file   = Path('static/data/region_details.json')

# Charge les données
with province_file.open('r', encoding='utf-8') as f:
    province_details = json.load(f)
with region_file.open('r', encoding='utf-8') as f:
    region_details = json.load(f)

# Prépare la structure de sortie
descriptions = {
    "regions": {},
    "provinces": {}
}

# Pour chaque région, on récupère le nom (champ "nom") et on crée une description générique
for code, info in region_details.items():
    name = info.get("nom")
    descriptions["regions"][name] = f"Description de la région {name}."

# Pour chaque province (clés de province_details.json)
for pname in province_details.keys():
    descriptions["provinces"][pname] = f"Description de la province {pname}."

# Sauvegarde dans descriptions.json
output = Path('static/data/descriptions.json')
output.parent.mkdir(parents=True, exist_ok=True)
with output.open('w', encoding='utf-8') as f:
    json.dump(descriptions, f, ensure_ascii=False, indent=2)

print(f"✔ descriptions.json généré dans {output}")
