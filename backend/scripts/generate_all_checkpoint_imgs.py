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
        response = requests.post(url, json=payload)
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
        if 'checkpoints' not in route:
            continue
            
        for cp in route['checkpoints']:
            if 'image' not in cp:
                # Generate prompt based on checkpoint info
                prompt = f"Wide shot scenic photo. {cp['title']}. {cp.get('description', '')}. Beautiful nature photography, 8k resolution, sunny day, vibrant colors."
                filename = f"cp_{route['slug']}_{cp['order']}.png"
                
                success = generate_image(prompt, filename)
                if success:
                    cp['image'] = filename
                    modified = True
                    time.sleep(1) # Small delay to not overwhelm API
                    
    if modified:
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(routes, f, indent=2, ensure_ascii=False)
        print("Updated routes.json with new image paths.")
    else:
        print("No new images were generated.")

if __name__ == '__main__':
    main()
