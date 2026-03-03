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
        if 'checkpoints' not in route:
            continue
            
        for cp in route['checkpoints']:
            if 'image' not in cp:
                cp['image'] = random.choice(EXISTING_IMAGES)
                modified = True
                    
    if modified:
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(routes, f, indent=2, ensure_ascii=False)
        print("Updated routes.json with existing image paths.")
    else:
        print("No new images needed.")

if __name__ == '__main__':
    main()
