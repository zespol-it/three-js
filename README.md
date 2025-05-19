# Three.js Interactive Projects

This repository contains three interactive Three.js projects: an Advanced Example, a Magical Kingdom scene, and a House Coloring application.

## Projects Overview

### 1. Advanced Example
A sophisticated 3D scene featuring:
- Animated torus knot with metallic green material
- Dynamic particle system
- Post-processing effects (bloom)
- Interactive controls
- Custom 3D text "zespół-IT.pl"

### 2. Magical Kingdom
A Disney-inspired magical scene featuring:
- Floating castle with glowing windows
- Magical particles and butterflies
- Rainbow bridge
- Magical portal
- Interactive controls for various effects

### 3. House Coloring
An interactive house coloring application featuring:
- 3D house model with multiple sections
- Color picker for each section
- Real-time color updates
- Orbit controls for viewing
- Section highlighting on hover

## Project Structure
```
.
├── advanced-example/
│   ├── index.html
│   └── main.js
├── magical-kingdom/
│   ├── index.html
│   └── main.js
├── house-coloring/
│   ├── index.html
│   └── main.js
├── screenshots/
│   ├── advanced-example/
│   │   ├── main.png
│   │   ├── closeup.png
│   │   └── controls.png
│   ├── magical-kingdom/
│   │   ├── main.png
│   │   ├── bridge.png
│   │   ├── portal.png
│   │   └── controls.png
│   └── house-coloring/
│       ├── main.png
│       ├── coloring.png
│       └── controls.png
└── README.md
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

2. Install a local server (if not already installed):
   ```bash
   npm install -g http-server
   ```

3. Start the server:
   ```bash
   http-server
   ```

4. Open your browser and navigate to:
   - Advanced Example: `http://localhost:8000/advanced-example/`
   - Magical Kingdom: `http://localhost:8000/magical-kingdom/`
   - House Coloring: `http://localhost:8000/house-coloring/`

## Controls

### Advanced Example
- Mouse: Orbit around the scene
- Scroll: Zoom in/out
- Click and drag: Move the camera

### Magical Kingdom
- Mouse: Orbit around the scene
- Scroll: Zoom in/out
- Click and drag: Move the camera
- Sliders:
  - Magic Sparkles: Adjust particle visibility
  - Castle Glow: Control castle's emissive intensity
  - Floating Speed: Modify animation speed

### House Coloring
- Mouse: Orbit around the house
- Scroll: Zoom in/out
- Click and drag: Move the camera
- Color Pickers: Select colors for different house sections
- Hover: Highlight selectable sections

## Technical Features

### Advanced Example
- Three.js core features
  - Scene, Camera, and Renderer setup
  - OrbitControls for camera manipulation
  - Post-processing with EffectComposer
  - UnrealBloomPass for glow effects
- Custom geometry and materials
  - TorusKnotGeometry with MeshPhysicalMaterial
  - Particle system with BufferGeometry
  - TextGeometry with custom font
- Performance optimizations
  - Efficient particle system
  - Optimized post-processing
  - Responsive design

### Magical Kingdom
- Complex scene composition
  - Hierarchical object structure
  - Multiple animated elements
  - Dynamic lighting system
- Interactive controls
  - Real-time parameter adjustment
  - Smooth animations
  - Responsive UI
- Advanced materials
  - Clearcoat materials
  - Emissive materials
  - Transparent materials
- Particle systems
  - Magical particles
  - Butterfly animations
  - Portal effects

### House Coloring
- Interactive 3D model
  - Sectioned house geometry
  - Material management
  - Raycasting for selection
- Color management
  - Color picker integration
  - Real-time material updates
  - Section highlighting
- User interface
  - Intuitive color controls
  - Section selection feedback
  - Responsive design

## Screenshots

### Capturing Screenshots
1. Start the local server:
   ```bash
   http-server
   ```

2. Open the applications in your browser:
   - Advanced Example: http://localhost:8000/advanced-example/
   - Magical Kingdom: http://localhost:8000/magical-kingdom/
   - House Coloring: http://localhost:8000/house-coloring/

3. For each application, capture:
   - Main view (default camera position)
   - Close-up views of key elements
   - Control panel interface
   - Special effects and animations

4. Save screenshots in the appropriate directories:
   ```bash
   screenshots/
   ├── advanced-example/
   │   ├── main.png
   │   ├── closeup.png
   │   └── controls.png
   ├── magical-kingdom/
   │   ├── main.png
   │   ├── bridge.png
   │   ├── portal.png
   │   └── controls.png
   └── house-coloring/
       ├── main.png
       ├── coloring.png
       └── controls.png
   ```

### Automated Screenshot Capture
Use the provided script to automatically capture screenshots:
```bash
./capture-screenshots.sh
```

## Dependencies
- Three.js v0.162.0
- Modern web browser with WebGL support
- Node.js and npm (for local server)

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance Considerations
- WebGL support required
- Dedicated graphics card recommended
- Minimum 4GB RAM
- Modern CPU (2GHz+)
- Fullscreen mode recommended
- Close other GPU-intensive applications

## Development
- ES6+ JavaScript
- Three.js documentation: https://threejs.org/docs/
- Local development server required
- CORS policy considerations
- WebGL debugging tools recommended

## License
MIT License

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 