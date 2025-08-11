// Level Data Module
// Contains all level definitions and configurations

export const LEVEL_DATA = {
    'audio-1': {
        title: 'Basic Microphone Setup',
        category: 'audio',
        difficulty: 'beginner',
        description: 'Learn to set up microphones for a live performance',
        objectives: [
            'Place 2 microphones on stage',
            'Connect microphones to mixing console',
            'Power the mixing console',
            'Connect speakers to the console'
        ],
        equipment: [
            {
                type: 'microphone',
                name: 'Wireless Vocal Mic',
                icon: 'fas fa-microphone',
                quantity: 2,
                wireless: true,
                requiresPower: false,
                connectors: [
                    { type: 'wireless-out', position: 'bottom', label: 'Wireless Out' }
                ]
            },
            {
                type: 'mic-receiver',
                name: 'Mic Receiver',
                icon: 'fas fa-broadcast-tower',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'wireless-in', position: 'top', label: 'Wireless In' },
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'mixing-console',
                name: 'Mixing Console',
                icon: 'fas fa-sliders-h',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 1' },
                    { type: 'xlr-out', position: 'bottom', label: 'Main Out' }
                ]
            },
            {
                type: 'speaker',
                name: 'Main Speaker',
                icon: 'fas fa-volume-up',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'Speaker In' }
                ]
            },
            {
                type: 'power-distro',
                name: 'Power Distribution',
                icon: 'fas fa-plug',
                quantity: 1,
                requiresPower: false,
                connectors: [
                    { type: 'power-out', position: 'right', label: 'Power Out 1' },
                    { type: 'power-out', position: 'right', label: 'Power Out 2' },
                    { type: 'power-out', position: 'right', label: 'Power Out 3' },
                    { type: 'power-out', position: 'right', label: 'Power Out 4' }
                ]
            }
        ],
        connections: [
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 4, color: '#ff4757' },
            { type: 'xlr-cable', name: 'XLR Cable', icon: 'fas fa-plug', quantity: 3, color: '#00ff88' },
            { type: 'wireless-cable', name: 'Wireless Signal', icon: 'fas fa-wifi', quantity: 2, color: '#a29bfe' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'wireless-out', to: 'wireless-in', cable: 'wireless-cable', animation: 'wireless-signal' },
            { from: 'xlr-out', to: 'xlr-in', cable: 'xlr-cable', animation: 'audio-pulse' }
        ],
        settings: [
            { type: 'gain', name: 'Gain Control', icon: 'fas fa-sliders-h' },
            { type: 'eq', name: 'EQ Settings', icon: 'fas fa-wave-square' }
        ],
        stageSetup: {
            width: 800,
            height: 600,
            zones: [
                { name: 'Stage Left', x: 100, y: 200, width: 200, height: 150 },
                { name: 'Stage Right', x: 500, y: 200, width: 200, height: 150 },
                { name: 'FOH', x: 350, y: 400, width: 100, height: 100 },
                { name: 'Power Station', x: 50, y: 400, width: 80, height: 80 }
            ]
        }
    },
    'audio-2': {
        title: 'Advanced Audio System',
        category: 'audio',
        difficulty: 'intermediate',
        description: 'Set up a complex audio system with effects and monitoring',
        objectives: [
            'Connect multiple microphones and instruments',
            'Set up effects processing chain',
            'Configure monitor system',
            'Power all equipment properly'
        ],
        equipment: [
            {
                type: 'microphone',
                name: 'Vocal Mic',
                icon: 'fas fa-microphone',
                quantity: 2,
                requiresPower: false,
                connectors: [
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'microphone',
                name: 'Instrument Mic',
                icon: 'fas fa-microphone',
                quantity: 2,
                requiresPower: false,
                connectors: [
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'mixing-console',
                name: '8-Channel Mixer',
                icon: 'fas fa-sliders-h',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 1' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 2' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 3' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 4' },
                    { type: 'xlr-out', position: 'bottom', label: 'Main Out' },
                    { type: 'xlr-out', position: 'bottom', label: 'Aux Out' }
                ]
            },
            {
                type: 'effects-processor',
                name: 'Effects Processor',
                icon: 'fas fa-magic',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'Input' },
                    { type: 'xlr-out', position: 'bottom', label: 'Output' }
                ]
            },
            {
                type: 'speaker',
                name: 'Main Speaker',
                icon: 'fas fa-volume-up',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'Speaker In' }
                ]
            },
            {
                type: 'speaker',
                name: 'Monitor Speaker',
                icon: 'fas fa-volume-up',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'Monitor In' }
                ]
            },
            {
                type: 'power-distro',
                name: 'Power Distribution',
                icon: 'fas fa-plug',
                quantity: 1,
                requiresPower: false,
                connectors: [
                    { type: 'power-out', position: 'right', label: 'Power Out 1' },
                    { type: 'power-out', position: 'right', label: 'Power Out 2' },
                    { type: 'power-out', position: 'right', label: 'Power Out 3' },
                    { type: 'power-out', position: 'right', label: 'Power Out 4' },
                    { type: 'power-out', position: 'right', label: 'Power Out 5' }
                ]
            }
        ],
        connections: [
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 5, color: '#ff4757' },
            { type: 'xlr-cable', name: 'XLR Cable', icon: 'fas fa-plug', quantity: 8, color: '#00ff88' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'xlr-out', to: 'xlr-in', cable: 'xlr-cable', animation: 'audio-pulse' }
        ],
        settings: [
            { type: 'gain', name: 'Gain Control', icon: 'fas fa-sliders-h' },
            { type: 'eq', name: 'EQ Settings', icon: 'fas fa-wave-square' },
            { type: 'pan', name: 'Pan Control', icon: 'fas fa-arrows-alt-h' },
            { type: 'effects', name: 'Effects', icon: 'fas fa-magic' }
        ]
    },
    'audio-3': {
        title: 'Professional Live Sound System',
        category: 'audio',
        difficulty: 'advanced',
        description: 'Set up a complex live sound system with multiple zones and wireless monitoring',
        objectives: [
            'Connect multiple input sources (mics, instruments, playback)',
            'Set up wireless in-ear monitoring system',
            'Configure multi-zone speaker system',
            'Power all equipment with proper distribution',
            'Create monitor mixes for performers'
        ],
        equipment: [
            {
                type: 'microphone',
                name: 'Vocal Mic',
                icon: 'fas fa-microphone',
                quantity: 3,
                requiresPower: false,
                connectors: [
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'microphone',
                name: 'Instrument Mic',
                icon: 'fas fa-microphone',
                quantity: 2,
                requiresPower: false,
                connectors: [
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'playback-device',
                name: 'Music Playback',
                icon: 'fas fa-music',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-out', position: 'bottom', label: 'Left Out' },
                    { type: 'xlr-out', position: 'bottom', label: 'Right Out' }
                ]
            },
            {
                type: 'mixing-console',
                name: '24-Channel Mixer',
                icon: 'fas fa-sliders-h',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'Input 1' },
                    { type: 'xlr-in', position: 'top', label: 'Input 2' },
                    { type: 'xlr-in', position: 'top', label: 'Input 3' },
                    { type: 'xlr-in', position: 'top', label: 'Input 4' },
                    { type: 'xlr-in', position: 'top', label: 'Input 5' },
                    { type: 'xlr-out', position: 'bottom', label: 'Main L Out' },
                    { type: 'xlr-out', position: 'bottom', label: 'Main R Out' },
                    { type: 'xlr-out', position: 'bottom', label: 'Aux 1 Out' },
                    { type: 'xlr-out', position: 'bottom', label: 'Aux 2 Out' }
                ]
            },
            {
                type: 'wireless-transmitter',
                name: 'Wireless Transmitter',
                icon: 'fas fa-broadcast-tower',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'Audio In' },
                    { type: 'wireless-out', position: 'bottom', label: 'RF Out' }
                ]
            },
            {
                type: 'wireless-receiver',
                name: 'Wireless Receiver',
                icon: 'fas fa-broadcast-tower',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'wireless-in', position: 'top', label: 'RF In' },
                    { type: 'xlr-out', position: 'bottom', label: 'Audio Out' }
                ]
            },
            {
                type: 'speaker',
                name: 'Main Speaker L',
                icon: 'fas fa-volume-up',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'Speaker In' }
                ]
            },
            {
                type: 'speaker',
                name: 'Main Speaker R',
                icon: 'fas fa-volume-up',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'Speaker In' }
                ]
            },
            {
                type: 'speaker',
                name: 'Monitor Speaker',
                icon: 'fas fa-volume-up',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'Monitor In' }
                ]
            },
            {
                type: 'power-distro',
                name: 'Power Distribution',
                icon: 'fas fa-plug',
                quantity: 1,
                requiresPower: false,
                connectors: [
                    { type: 'power-out', position: 'right', label: 'Power Out 1' },
                    { type: 'power-out', position: 'right', label: 'Power Out 2' },
                    { type: 'power-out', position: 'right', label: 'Power Out 3' },
                    { type: 'power-out', position: 'right', label: 'Power Out 4' },
                    { type: 'power-out', position: 'right', label: 'Power Out 5' },
                    { type: 'power-out', position: 'right', label: 'Power Out 6' }
                ]
            }
        ],
        connections: [
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 9, color: '#ff4757' },
            { type: 'xlr-cable', name: 'XLR Cable', icon: 'fas fa-plug', quantity: 11, color: '#00ff88' },
            { type: 'wireless-cable', name: 'Wireless Signal', icon: 'fas fa-wifi', quantity: 3, color: '#a29bfe' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'xlr-out', to: 'xlr-in', cable: 'xlr-cable', animation: 'audio-pulse' },
            { from: 'wireless-out', to: 'wireless-in', cable: 'wireless-cable', animation: 'wireless-signal' }
        ],
        settings: [
            { type: 'gain', name: 'Gain Control', icon: 'fas fa-sliders-h' },
            { type: 'eq', name: 'EQ Settings', icon: 'fas fa-wave-square' },
            { type: 'pan', name: 'Pan Control', icon: 'fas fa-arrows-alt-h' },
            { type: 'effects', name: 'Effects', icon: 'fas fa-magic' },
            { type: 'monitor-mix', name: 'Monitor Mix', icon: 'fas fa-headphones' },
            { type: 'wireless-freq', name: 'Wireless Frequency', icon: 'fas fa-wifi' }
        ],
        stageSetup: {
            width: 1000,
            height: 700,
            zones: [
                { name: 'Stage Front', x: 200, y: 100, width: 300, height: 150 },
                { name: 'Stage Back', x: 200, y: 300, width: 300, height: 150 },
                { name: 'FOH Position', x: 500, y: 200, width: 150, height: 100 },
                { name: 'Monitor Zone', x: 100, y: 500, width: 200, height: 100 },
                { name: 'Power Station', x: 50, y: 400, width: 80, height: 80 },
                { name: 'Wireless Zone', x: 700, y: 300, width: 150, height: 100 }
            ]
        }
    },
    'lighting-1': {
        title: 'Basic Stage Lighting',
        category: 'lighting',
        difficulty: 'beginner',
        description: 'Set up basic stage lighting with DMX control',
        objectives: [
            'Position 4 stage lights',
            'Connect DMX control system',
            'Power all lighting equipment',
            'Create basic lighting zones'
        ],
        equipment: [
            {
                type: 'stage-light',
                name: 'Front Light',
                icon: 'fas fa-lightbulb',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'dmx-in', position: 'bottom', label: 'DMX In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'stage-light',
                name: 'Side Light',
                icon: 'fas fa-lightbulb',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'dmx-in', position: 'bottom', label: 'DMX In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'lighting-stand',
                name: 'Light Stand',
                icon: 'fas fa-arrows-alt-v',
                quantity: 4,
                requiresPower: false,
                connectors: []
            },
            {
                type: 'dimmer',
                name: 'Dimmer Pack',
                icon: 'fas fa-sliders-h',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'dmx-out', position: 'top', label: 'DMX Out' },
                    { type: 'power-out', position: 'right', label: 'Power Out 1' },
                    { type: 'power-out', position: 'right', label: 'Power Out 2' },
                    { type: 'power-out', position: 'right', label: 'Power Out 3' },
                    { type: 'power-out', position: 'right', label: 'Power Out 4' }
                ]
            },
            {
                type: 'power-distro',
                name: 'Power Distribution',
                icon: 'fas fa-plug',
                quantity: 1,
                requiresPower: false,
                connectors: [
                    { type: 'power-out', position: 'right', label: 'Power Out 1' },
                    { type: 'power-out', position: 'right', label: 'Power Out 2' }
                ]
            }
        ],
        connections: [
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 6, color: '#ff4757' },
            { type: 'dmx-cable', name: 'DMX Cable', icon: 'fas fa-plug', quantity: 4, color: '#ffa502' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'dmx-out', to: 'dmx-in', cable: 'dmx-cable', animation: 'dmx-circle' }
        ],
        settings: [
            { type: 'intensity', name: 'Intensity', icon: 'fas fa-sliders-h' },
            { type: 'color', name: 'Color Temperature', icon: 'fas fa-palette' }
        ]
    }
};

// Export a function to get level data
export function getLevelData(levelId) {
    return LEVEL_DATA[levelId];
}

// Export level order for progression
export const LEVEL_ORDER = [
    'audio-1', 'audio-2', 'audio-3',
    'lighting-1', 'lighting-2', 'lighting-3',
    'video-1', 'video-2', 'video-3',
    'set-1', 'set-2', 'set-3'
];

// Export level categories
export const LEVEL_CATEGORIES = {
    'audio': ['audio-1', 'audio-2', 'audio-3'],
    'lighting': ['lighting-1', 'lighting-2', 'lighting-3'],
    'video': ['video-1', 'video-2', 'video-3'],
    'set': ['set-1', 'set-2', 'set-3']
};
