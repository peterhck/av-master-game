# AV Master - Live Event Learning Game

An interactive web-based educational game designed to teach live event production concepts through hands-on equipment setup and connection challenges.

## 🎮 Game Overview

AV Master is an educational game that simulates real-world live event production scenarios. Players learn about audio, lighting, video, and set design by placing equipment on a virtual stage and making the correct connections between components.

## ✨ Features

### 🎵 Audio Levels (1-3)
- **Audio Level 1**: Basic wireless microphone setup
- **Audio Level 2**: Traditional wired microphone system
- **Audio Level 3**: Advanced live sound system with monitoring

### 💡 Lighting Levels (1-3)
- **Lighting Level 1**: Basic stage lighting setup
- **Lighting Level 2**: Advanced lighting with dimmers
- **Lighting Level 3**: Complex lighting system with DMX control

### 📹 Video Levels (1-3)
- **Video Level 1**: Basic video projection setup
- **Video Level 2**: Multi-camera system
- **Video Level 3**: Advanced video production setup

### 🎭 Set Design Levels (1-3)
- **Set Level 1**: Basic stage setup
- **Set Level 2**: Advanced set design
- **Set Level 3**: Complex production setup

## 🎯 Gameplay Features

### Interactive Equipment System
- **Drag & Drop**: Place equipment on the virtual stage
- **Real-time Dragging**: Equipment can be moved after placement
- **Connection Lines**: Dynamic SVG-based connection visualization
- **Equipment Info**: Click question marks for detailed equipment explanations

### Connection Types
- **Power Cables**: Red cables for electrical connections
- **XLR Cables**: Green cables for audio connections
- **Wireless Signals**: Purple signals for wireless equipment
- **DMX Cables**: Blue cables for lighting control
- **HDMI Cables**: Orange cables for video connections
- **Ethernet Cables**: Yellow cables for network connections

### Smart Validation System
- **Real-time Feedback**: Immediate validation of connections
- **Visual Indicators**: Missing connections highlighted with red borders
- **Progress Tracking**: Live connection count updates
- **Level Completion**: Automatic detection of successful setups

### Help System
- **Basic Hints**: General guidance for each level
- **Detailed Hints**: Step-by-step instructions (costs points)
- **Equipment Information**: Detailed explanations of each component
- **Debug Tools**: Advanced debugging accessible via keyboard shortcuts

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (Python, Node.js, or any HTTP server)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/av-master-game.git
   cd av-master-game
   ```

2. **Start the local server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js
   npx http-server -p 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🎮 How to Play

### Basic Controls
- **Mouse**: Click and drag equipment from toolbar to stage
- **Connectors**: Click colored dots on equipment to make connections
- **Cable Selection**: Choose appropriate cable type when prompted
- **Equipment Info**: Click question mark icons for equipment details

### Keyboard Shortcuts
- **H**: Show basic hint
- **I**: Show detailed hint (costs points)
- **V**: Manual validation check
- **D**: Debug level validation
- **P**: Debug connection progress
- **M**: Highlight missing connections
- **Z**: Debug connection lines
- **Delete/Backspace**: Delete selected equipment or connection
- **Escape**: Pause game

### Game Progression
1. **Select Level**: Choose from available levels in the level select screen
2. **Place Equipment**: Drag equipment from the toolbar to the stage
3. **Make Connections**: Click connector dots and select appropriate cables
4. **Validate Setup**: Ensure all required connections are made
5. **Complete Level**: Successfully complete the level to unlock the next one

## 🛠️ Technical Details

### Architecture
- **Frontend**: Pure HTML5, CSS3, and JavaScript (ES6+)
- **Graphics**: SVG for dynamic connection lines
- **Audio**: Web Audio API for sound effects
- **Storage**: Local Storage for game state persistence
- **Responsive**: Mobile-friendly design with touch support

### Key Components

#### Game Engine (`game.js`)
- **AVMasterGame Class**: Main game controller
- **Level Management**: Dynamic level loading and validation
- **Connection System**: Real-time connection tracking and visualization
- **Audio System**: Sound effects and audio context management
- **State Management**: Game progress and settings persistence

#### Styling (`styles.css`)
- **Modern UI**: Clean, professional interface design
- **Animations**: Smooth transitions and visual feedback
- **Responsive Layout**: Adapts to different screen sizes
- **Theme System**: Consistent color scheme and typography

#### Structure (`index.html`)
- **Semantic HTML**: Proper document structure
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Optimized asset loading

### File Structure
```
av-master-game/
├── index.html          # Main HTML file
├── game.js            # Game logic and engine
├── styles.css         # Styling and animations
├── README.md          # Project documentation
└── .gitignore         # Git ignore rules
```

## 🎨 Design Philosophy

### Educational Focus
- **Real-world Equipment**: Authentic representation of actual AV equipment
- **Practical Skills**: Teaches real connection types and setups
- **Progressive Learning**: Levels build upon previous knowledge
- **Immediate Feedback**: Instant validation and correction

### User Experience
- **Intuitive Interface**: Easy-to-understand controls and feedback
- **Visual Learning**: Rich visual cues and animations
- **Accessible Design**: Works across different devices and abilities
- **Engaging Gameplay**: Rewarding progression and achievement system

## 🔧 Development

### Adding New Levels
1. Add level data to `getLevelData()` function
2. Define equipment, connections, and validation rules
3. Update level progression in `unlockNextLevel()`
4. Test validation logic thoroughly

### Adding New Equipment
1. Define equipment properties in level data
2. Add connector definitions
3. Update validation logic if needed
4. Add equipment information to `getEquipmentInfo()`

### Adding New Connection Types
1. Define cable properties in level data
2. Add validation logic in appropriate validation functions
3. Update progress tracking
4. Add visual styling for new cable types

## 🐛 Debugging

### Console Commands
The game includes extensive debugging tools accessible via keyboard shortcuts:

- **V**: Manual validation check
- **D**: Debug level validation (detailed console output)
- **P**: Debug connection progress
- **M**: Highlight missing connections visually
- **Z**: Debug connection lines

### Common Issues
- **Equipment not placing**: Check browser console for errors
- **Connections not working**: Verify connector event listeners
- **Level not completing**: Use debug tools to check validation
- **Audio not working**: Check browser permissions for microphone access

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions:
1. Check the debugging section above
2. Review the console for error messages
3. Open an issue on GitHub with detailed information

## 🎯 Roadmap

### Planned Features
- [ ] Multiplayer mode for collaborative learning
- [ ] Additional equipment types and connection scenarios
- [ ] Advanced lighting programming interface
- [ ] Video switching and routing challenges
- [ ] Mobile app version
- [ ] Integration with real AV equipment APIs

### Performance Improvements
- [ ] WebGL rendering for complex scenes
- [ ] Optimized asset loading
- [ ] Progressive web app features
- [ ] Offline functionality

---

**AV Master** - Making live event production education interactive and engaging! 🎭🎵💡
