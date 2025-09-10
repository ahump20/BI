#!/bin/bash

# Blaze Visual Engine - Cloudinary Setup Script
# This script configures Cloudinary and uploads base assets

echo "🔥 Blaze Visual Engine - Cloudinary Setup"
echo "========================================="

# Check if Cloudinary CLI is installed
if ! command -v cloudinary &> /dev/null; then
    echo "Installing Cloudinary CLI..."
    npm install -g cloudinary-cli
fi

# Set Cloudinary credentials
echo "Configuring Cloudinary credentials..."
export CLOUDINARY_URL=${CLOUDINARY_URL:-"cloudinary://api_key:api_secret@blaze-intelligence"}

# Create folder structure
echo "Creating Cloudinary folder structure..."
cloudinary admin create_folder blaze/base
cloudinary admin create_folder blaze/athletes
cloudinary admin create_folder blaze/moments
cloudinary admin create_folder blaze/badges
cloudinary admin create_folder blaze/effects
cloudinary admin create_folder blaze/overlays
cloudinary admin create_folder blaze/icons
cloudinary admin create_folder blaze/shapes
cloudinary admin create_folder blaze/charts
cloudinary admin create_folder blaze/teams
cloudinary admin create_folder blaze/predictions
cloudinary admin create_folder blaze/heatmaps
cloudinary admin create_folder blaze/meters
cloudinary admin create_folder blaze/biometrics
cloudinary admin create_folder blaze/ai

# Create base assets directory
mkdir -p ./cloudinary-assets/{base,effects,overlays,icons,shapes}

# Generate base canvases
echo "Generating base canvases..."

# Evolution canvas (1600x900 gradient)
cat > ./cloudinary-assets/base/evolution_canvas.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
<style>
body {
  margin: 0;
  width: 1600px;
  height: 900px;
  background: linear-gradient(0deg, #000033 0%, #000066 50%, #000033 100%);
}
</style>
</head>
<body></body>
</html>
EOF

# Badge base (400x400 circle)
cat > ./cloudinary-assets/base/badge_base.svg << 'EOF'
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="badge-gradient">
      <stop offset="0%" style="stop-color:#333;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000;stop-opacity:1" />
    </radialGradient>
  </defs>
  <circle cx="200" cy="200" r="190" fill="url(#badge-gradient)" stroke="#666" stroke-width="10"/>
</svg>
EOF

# Create effects
echo "Creating visual effects..."

# Energy burst effect
cat > ./cloudinary-assets/effects/energy_burst.svg << 'EOF'
<svg width="2200" height="1350" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="burst">
      <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ff0;stop-opacity:0.5" />
      <stop offset="100%" style="stop-color:#f00;stop-opacity:0" />
    </radialGradient>
  </defs>
  <circle cx="1100" cy="675" r="600" fill="url(#burst)"/>
</svg>
EOF

# Shockwave rings
cat > ./cloudinary-assets/effects/shockwave_rings.svg << 'EOF'
<svg width="2000" height="2000" xmlns="http://www.w3.org/2000/svg">
  <circle cx="1000" cy="1000" r="300" fill="none" stroke="#fff" stroke-width="20" opacity="0.8"/>
  <circle cx="1000" cy="1000" r="600" fill="none" stroke="#fff" stroke-width="15" opacity="0.5"/>
  <circle cx="1000" cy="1000" r="900" fill="none" stroke="#fff" stroke-width="10" opacity="0.3"/>
</svg>
EOF

# Lightning strikes
cat > ./cloudinary-assets/effects/lightning_strikes.svg << 'EOF'
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <path d="M960,0 L880,400 L1040,400 L960,1080" fill="none" stroke="#00ffff" stroke-width="5" opacity="0.9"/>
  <path d="M480,0 L440,300 L520,300 L480,540" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.7"/>
  <path d="M1440,0 L1400,300 L1480,300 L1440,540" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.7"/>
</svg>
EOF

# Create overlays
echo "Creating overlay patterns..."

# Hologram grid
cat > ./cloudinary-assets/overlays/hologram_grid.svg << 'EOF'
<svg width="1000" height="1400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#00ffff" stroke-width="0.5" opacity="0.3"/>
    </pattern>
  </defs>
  <rect width="1000" height="1400" fill="url(#grid)"/>
</svg>
EOF

# Neural network pattern
cat > ./cloudinary-assets/overlays/neural_network.svg << 'EOF'
<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
  <circle cx="500" cy="200" r="10" fill="#00ff00" opacity="0.8"/>
  <circle cx="300" cy="400" r="10" fill="#00ff00" opacity="0.8"/>
  <circle cx="700" cy="400" r="10" fill="#00ff00" opacity="0.8"/>
  <circle cx="200" cy="600" r="10" fill="#00ff00" opacity="0.8"/>
  <circle cx="500" cy="600" r="10" fill="#00ff00" opacity="0.8"/>
  <circle cx="800" cy="600" r="10" fill="#00ff00" opacity="0.8"/>
  <circle cx="500" cy="800" r="10" fill="#00ff00" opacity="0.8"/>
  <line x1="500" y1="200" x2="300" y2="400" stroke="#00ff00" stroke-width="1" opacity="0.4"/>
  <line x1="500" y1="200" x2="700" y2="400" stroke="#00ff00" stroke-width="1" opacity="0.4"/>
  <line x1="300" y1="400" x2="200" y2="600" stroke="#00ff00" stroke-width="1" opacity="0.4"/>
  <line x1="300" y1="400" x2="500" y2="600" stroke="#00ff00" stroke-width="1" opacity="0.4"/>
  <line x1="700" y1="400" x2="500" y2="600" stroke="#00ff00" stroke-width="1" opacity="0.4"/>
  <line x1="700" y1="400" x2="800" y2="600" stroke="#00ff00" stroke-width="1" opacity="0.4"/>
  <line x1="200" y1="600" x2="500" y2="800" stroke="#00ff00" stroke-width="1" opacity="0.4"/>
  <line x1="500" y1="600" x2="500" y2="800" stroke="#00ff00" stroke-width="1" opacity="0.4"/>
  <line x1="800" y1="600" x2="500" y2="800" stroke="#00ff00" stroke-width="1" opacity="0.4"/>
</svg>
EOF

# Create icons
echo "Creating dimension icons..."

# Fire icon (Clutch Gene)
cat > ./cloudinary-assets/icons/fire.svg << 'EOF'
<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <path d="M75,130 C45,130 25,110 25,80 C25,50 45,20 75,20 C75,50 95,50 95,80 C95,110 75,130 75,130 Z" 
        fill="#ff0000" opacity="0.9"/>
</svg>
EOF

# Sword icon (Killer Instinct)
cat > ./cloudinary-assets/icons/sword.svg << 'EOF'
<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <rect x="70" y="20" width="10" height="100" fill="#8b0000"/>
  <rect x="50" y="100" width="50" height="10" fill="#8b0000"/>
  <rect x="65" y="110" width="20" height="20" fill="#8b0000"/>
</svg>
EOF

# Wave icon (Flow State)
cat > ./cloudinary-assets/icons/wave.svg << 'EOF'
<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <path d="M10,75 Q37.5,25 75,75 T140,75" fill="none" stroke="#00ced1" stroke-width="10"/>
</svg>
EOF

# Shield icon (Mental Fortress)
cat > ./cloudinary-assets/icons/shield.svg << 'EOF'
<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <path d="M75,20 L115,40 L115,80 Q115,120 75,130 Q35,120 35,80 L35,40 Z" 
        fill="#4b0082" opacity="0.9"/>
</svg>
EOF

# Eye icon (Predator Mindset)
cat > ./cloudinary-assets/icons/eye.svg << 'EOF'
<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="75" cy="75" rx="60" ry="30" fill="#ff8c00" opacity="0.9"/>
  <circle cx="75" cy="75" r="20" fill="#000"/>
</svg>
EOF

# Crown icon (Champion Aura)
cat > ./cloudinary-assets/icons/crown.svg << 'EOF'
<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <path d="M30,100 L30,60 L50,80 L75,40 L100,80 L120,60 L120,100 Z" 
        fill="#ffd700" opacity="0.9"/>
</svg>
EOF

# DNA icon (Winner DNA)
cat > ./cloudinary-assets/icons/dna.svg << 'EOF'
<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <path d="M50,20 Q75,40 100,20 T100,60 Q75,80 50,60 T50,100 Q75,120 100,100 T100,140" 
        fill="none" stroke="#32cd32" stroke-width="8"/>
  <path d="M100,20 Q75,40 50,20 T50,60 Q75,80 100,60 T100,100 Q75,120 50,100 T50,140" 
        fill="none" stroke="#32cd32" stroke-width="8"/>
</svg>
EOF

# Beast icon (Beast Mode)
cat > ./cloudinary-assets/icons/beast.svg << 'EOF'
<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="15" fill="#dc143c"/>
  <circle cx="100" cy="50" r="15" fill="#dc143c"/>
  <path d="M40,80 Q75,120 110,80" fill="none" stroke="#dc143c" stroke-width="10"/>
</svg>
EOF

# Create shapes
echo "Creating shape overlays..."

# Hexagon shape
cat > ./cloudinary-assets/shapes/hexagon.svg << 'EOF'
<svg width="380" height="380" xmlns="http://www.w3.org/2000/svg">
  <polygon points="190,50 330,140 330,240 190,330 50,240 50,140" 
           fill="none" stroke="#fff" stroke-width="5" opacity="0.5"/>
</svg>
EOF

# Upload assets to Cloudinary
echo "Uploading assets to Cloudinary..."

# Upload base canvases
cloudinary uploader upload ./cloudinary-assets/base/*.* \
  --folder=blaze/base \
  --use_filename=true \
  --unique_filename=false \
  --overwrite=true \
  --resource_type=auto

# Upload effects
cloudinary uploader upload ./cloudinary-assets/effects/*.svg \
  --folder=blaze/effects \
  --use_filename=true \
  --unique_filename=false \
  --overwrite=true

# Upload overlays
cloudinary uploader upload ./cloudinary-assets/overlays/*.svg \
  --folder=blaze/overlays \
  --use_filename=true \
  --unique_filename=false \
  --overwrite=true

# Upload icons
cloudinary uploader upload ./cloudinary-assets/icons/*.svg \
  --folder=blaze/icons \
  --use_filename=true \
  --unique_filename=false \
  --overwrite=true

# Upload shapes
cloudinary uploader upload ./cloudinary-assets/shapes/*.svg \
  --folder=blaze/shapes \
  --use_filename=true \
  --unique_filename=false \
  --overwrite=true

# Create upload presets
echo "Creating upload presets..."

cloudinary admin create_upload_preset \
  name=blaze_athletes_auto \
  folder=blaze/athletes \
  allowed_formats=jpg,png,webp \
  eager='[{"width": 300, "height": 450, "crop": "fill"}, {"width": 1000, "height": 1400, "crop": "fill"}]' \
  auto_tagging=80 \
  categorization='google_tagging,80'

cloudinary admin create_upload_preset \
  name=blaze_moments_hd \
  folder=blaze/moments \
  allowed_formats=jpg,png,webp,mp4 \
  eager='[{"width": 1920, "height": 1080, "crop": "fill"}, {"width": 1280, "height": 720, "crop": "fill"}]' \
  auto_tagging=80

cloudinary admin create_upload_preset \
  name=blaze_badges_3d \
  folder=blaze/badges \
  allowed_formats=png,svg \
  eager='[{"width": 400, "height": 400, "crop": "fill"}]'

cloudinary admin create_upload_preset \
  name=blaze_predictions_ai \
  folder=blaze/predictions \
  allowed_formats=jpg,png,webp \
  eager='[{"width": 1000, "height": 1400, "crop": "fill"}]' \
  auto_tagging=90

echo "✅ Cloudinary setup complete!"
echo ""
echo "Next steps:"
echo "1. Set your Cloudinary credentials as environment variables"
echo "2. Upload athlete images to blaze/athletes/{athleteId}/"
echo "3. Upload game moments to blaze/moments/{gameId}/"
echo "4. Test the API at https://blaze-intelligence.pages.dev/api/visuals/health"
echo ""
echo "🔥 Blaze Visual Engine is ready!"