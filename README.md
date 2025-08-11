# AV Master - Live Event Learning Game

## Overview

AV Master is an interactive web-based educational game designed to teach students aged 11-18 about Audio-Visual (AV) installation and live event production. The game provides hands-on experience with real-world AV equipment and scenarios through an engaging, gamified learning environment.

## Features

### 🎮 Interactive Learning Experience
- **Drag-and-Drop Interface**: Intuitive equipment placement and connection system
- **Real-time Feedback**: Immediate validation of setups and configurations
- **Progressive Difficulty**: Levels designed for different skill levels and age groups
- **Gamification Elements**: Points, achievements, and progress tracking

### 🎵 Learning Areas

#### Audio Systems
- **Microphone Setup**: Learn proper microphone placement and types
- **Mixing Console Mastery**: Understand channel routing and EQ settings
- **Sound Design**: Advanced audio processing and effects

#### Lighting Systems
- **Basic Stage Lighting**: Position lights and understand color theory
- **Color Theory**: Learn color mixing and mood lighting
- **Moving Lights**: Program moving lights and complex patterns

#### Video Systems
- **Camera Setup**: Position cameras and basic video routing
- **Video Switching**: Learn video switching and transitions
- **Projection Mapping**: Advanced projection and mapping techniques

#### Set Design
- **Basic Set**: Design simple stage layouts and props
- **Creative Design**: Create themed sets and visual effects
- **Complex Sets**: Design multi-level and interactive sets

### 🎯 Educational Objectives

The game teaches students:
- **Technical Skills**: Equipment identification, setup, and operation
- **Problem Solving**: Troubleshooting and optimization
- **Safety Awareness**: Proper handling and safety procedures
- **Creative Thinking**: Design and artistic considerations
- **Teamwork**: Understanding roles in live event production

## How to Play

### Getting Started
1. **Launch the Game**: Open `index.html` in a modern web browser
2. **Tutorial**: Click "Tutorial" to learn the basics
3. **Start Playing**: Click "Start New Game" to begin your AV journey

### Game Mechanics

#### Equipment Placement
- **Drag Equipment**: Click and drag equipment from the toolbar to the stage
- **Positioning**: Place equipment in designated zones for optimal setup
- **Selection**: Click on equipment to select it for configuration

#### Connections
- **Cable Management**: Use appropriate cables to connect equipment
- **Signal Flow**: Understand audio/video signal routing
- **Power Distribution**: Ensure proper power connections

#### Configuration
- **Settings Panel**: Double-click equipment to open settings
- **Parameter Adjustment**: Use sliders and controls to configure equipment
- **Real-time Testing**: Test your setup to see if it works correctly

#### Level Completion
- **Objectives**: Complete all required tasks for each level
- **Testing**: Use the "Test Setup" button to validate your configuration
- **Scoring**: Earn points based on accuracy and efficiency
- **Progression**: Unlock new levels as you complete current ones

### Controls

#### Mouse Controls
- **Left Click**: Select equipment
- **Double Click**: Open settings panel
- **Drag**: Move equipment or tools
- **Right Click**: Context menu (future feature)

#### Keyboard Shortcuts
- **Escape**: Pause game
- **Delete**: Remove selected equipment
- **Space**: Test setup (alternative)

## Technical Requirements

### Browser Compatibility
- **Chrome**: 80+ (Recommended)
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50MB free space
- **Display**: 1024x768 minimum resolution
- **Internet**: Required for external fonts and icons

## Installation

### Local Development
1. **Clone or Download**: Get the game files
2. **No Build Required**: The game runs directly in the browser
3. **Open**: Double-click `index.html` or open in your preferred browser

### Web Server (Optional)
For the best experience, serve the files through a local web server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Game Structure

### File Organization
```
av-master/
├── index.html          # Main game interface
├── styles.css          # Game styling and animations
├── game.js            # Game logic and mechanics
└── README.md          # This documentation
```

### Code Architecture

#### HTML Structure
- **Screen Management**: Multiple game screens (loading, menu, level select, gameplay)
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Keyboard navigation and screen reader support

#### CSS Features
- **Modern Design**: Gradient backgrounds and smooth animations
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects and visual feedback
- **Custom Animations**: Loading sequences and transitions

#### JavaScript Game Engine
- **Object-Oriented**: Clean, maintainable code structure
- **State Management**: Persistent game progress
- **Event Handling**: Comprehensive user interaction system
- **Level System**: Dynamic level loading and progression

## Educational Value

### Learning Outcomes

#### Technical Knowledge
- **Equipment Recognition**: Identify different types of AV equipment
- **Setup Procedures**: Learn proper installation and configuration
- **Troubleshooting**: Develop problem-solving skills
- **Safety Protocols**: Understand safe handling practices

#### Soft Skills
- **Critical Thinking**: Analyze problems and find solutions
- **Attention to Detail**: Focus on precise setup requirements
- **Time Management**: Complete tasks efficiently
- **Creativity**: Design effective and appealing setups

#### Career Preparation
- **Industry Awareness**: Understand live event production roles
- **Equipment Familiarity**: Gain confidence with professional gear
- **Workflow Understanding**: Learn standard industry procedures
- **Problem Solving**: Develop troubleshooting mindset

### Age-Appropriate Content

#### Ages 11-13 (Beginner)
- Basic equipment identification
- Simple setup procedures
- Safety fundamentals
- Introduction to concepts

#### Ages 14-16 (Intermediate)
- More complex configurations
- Advanced equipment types
- Troubleshooting scenarios
- Creative applications

#### Ages 17-18 (Advanced)
- Professional-level challenges
- Complex system integration
- Real-world scenarios
- Industry best practices

## Future Enhancements

### Planned Features
- **Multiplayer Mode**: Collaborative setup challenges
- **Virtual Reality**: Immersive 3D environment
- **Real Equipment Integration**: Connect to actual AV hardware
- **Assessment Tools**: Detailed progress tracking and reporting
- **Custom Levels**: Level editor for educators

### Educational Expansions
- **Curriculum Integration**: Align with educational standards
- **Teacher Dashboard**: Progress monitoring and assessment tools
- **Certification System**: Industry-recognized skill validation
- **Industry Partnerships**: Real-world equipment and scenarios

## Contributing

### For Educators
- **Feedback**: Share your experience and suggestions
- **Content**: Contribute level ideas and educational content
- **Testing**: Help test with different age groups
- **Integration**: Provide curriculum alignment suggestions

### For Developers
- **Code**: Submit improvements and bug fixes
- **Features**: Propose new game mechanics
- **Documentation**: Help improve this documentation
- **Testing**: Test on different browsers and devices

## Support

### Getting Help
- **Documentation**: Check this README for common questions
- **Browser Issues**: Ensure you're using a supported browser
- **Performance**: Close other applications if the game runs slowly
- **Progress**: Game progress is saved automatically in your browser

### Troubleshooting

#### Game Won't Load
- Check browser compatibility
- Ensure JavaScript is enabled
- Try refreshing the page
- Clear browser cache if needed

#### Equipment Won't Place
- Make sure you're dragging to the stage area
- Check that the equipment is unlocked for the level
- Try clicking and dragging more slowly

#### Settings Won't Open
- Double-click on equipment (not single click)
- Ensure the equipment is properly placed on stage
- Check that the level includes settings options

## License

This project is designed for educational use. Please respect the educational nature of the content and use it appropriately in learning environments.

## Acknowledgments

- **Font Awesome**: Icons used throughout the interface
- **Google Fonts**: Typography (Orbitron, Roboto)
- **Educational Community**: Feedback and testing from educators
- **AV Industry**: Real-world scenarios and equipment knowledge

---

**AV Master** - Empowering the next generation of live event professionals through interactive learning.
