import json
import os
import random

JSON_PATH = os.path.join(os.path.dirname(__file__), '..', 'routes', 'seed', 'routes.json')
EXISTING_IMAGES = [
    "cp_cala.png", 
    "cp_passeig.png", 
    "cp_pineda.png", 
    "cp_regreso.png", 
    "cp_torre.png"
]

def main():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        routes = json.load(f)
        
    modified = False
    
    for route in routes:
        if 'gallery' not in route:
            route['gallery'] = []
            
        num_existing = len(route['gallery'])
        target_images = 2
        
        if num_existing < target_images:
            for i in range(num_existing + 1, target_images + 1):
                route['gallery'].append(random.choice(EXISTING_IMAGES))
                modified = True
                    
    if modified:
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(routes, f, indent=2, ensure_ascii=False)
        print("Updated routes.json with existing gallery image paths.")
    else:
        print("No new gallery images needed.")

if __name__ == '__main__':
    main()
