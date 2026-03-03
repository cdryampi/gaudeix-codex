import json
import os
import requests
import io
import time
from PIL import Image

JSON_PATH = os.path.join(os.path.dirname(__file__), '..', 'routes', 'seed', 'routes.json')
IMAGES_DIR = os.path.join(os.path.dirname(__file__), '..', 'routes', 'management', 'commands', 'images')

def generate_image(prompt, output_filename):
    print(f"Generating image for: {prompt}")
    url = "http://161.35.143.239:8000/generate"
    payload = {
        "prompt": prompt,
        "width": 1024,
        "height": 768,
        "num_inference_steps": 4,
        "guidance_scale": 0
    }
    
    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        
        image = Image.open(io.BytesIO(response.content))
        os.makedirs(IMAGES_DIR, exist_ok=True)
        img_path = os.path.join(IMAGES_DIR, output_filename)
        image.save(img_path)
        print(f"Saved: {img_path}")
        return True
    except Exception as e:
        print(f"Failed to generate/save image for '{prompt}': {e}")
        return False

def main():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        routes = json.load(f)
        
    modified = False
    
    for route in routes:
        if 'gallery' not in route:
            route['gallery'] = []
            
        # Target 2 images per route gallery for now
        num_existing = len(route['gallery'])
        target_images = 2
        
        if num_existing < target_images:
            for i in range(num_existing + 1, target_images + 1):
                prompt = f"Beautiful scenery photo, wide shot, hiking trail outdoors, nature landscape, sunny, {route['title']}. High quality, 8k resolution, vibrant colors."
                filename = f"gallery_{route['slug']}_{i}.png"
                
                success = generate_image(prompt, filename)
                if success:
                    route['gallery'].append(filename)
                    modified = True
                    time.sleep(2) # Give the API a break
                    
    if modified:
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(routes, f, indent=2, ensure_ascii=False)
        print("Updated routes.json with new gallery image paths.")
    else:
        print("No new gallery images were generated.")

if __name__ == '__main__':
    main()
