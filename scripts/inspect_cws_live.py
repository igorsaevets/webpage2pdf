import urllib.request
import re
import os

url = 'https://chromewebstore.google.com/detail/webpage2pdf/cegjlapelggifcbenhbbannadlajccbn'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

# Find all image tags
img_tags = re.findall(r'<img\s+[^>]*src="([^"]+)"[^>]*>', html)

os.makedirs('temp_cws_imgs', exist_ok=True)
idx = 0
for src in img_tags:
    if 'googleusercontent.com' in src:
        idx += 1
        print(f"Image {idx}: {src}")
        # Try downloading to inspect dimensions
        try:
            filename = f"temp_cws_imgs/img_{idx}.png"
            urllib.request.urlretrieve(src, filename)
            from PIL import Image
            with Image.open(filename) as im:
                print(f"   Saved {filename}: format={im.format}, size={im.size}")
        except Exception as e:
            print(f"   Failed to download/open: {e}")
