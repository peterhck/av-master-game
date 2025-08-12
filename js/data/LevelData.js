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
            width: 800,
            height: 600,
            zones: [
                { name: 'Stage Front', x: 150, y: 100, width: 250, height: 120 },
                { name: 'Stage Back', x: 150, y: 250, width: 250, height: 120 },
                { name: 'FOH Position', x: 400, y: 150, width: 120, height: 80 },
                { name: 'Monitor Zone', x: 80, y: 400, width: 150, height: 80 },
                { name: 'Power Station', x: 40, y: 320, width: 60, height: 60 },
                { name: 'Wireless Zone', x: 550, y: 250, width: 120, height: 80 }
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
        ],
        stageSetup: {
            width: 800,
            height: 600,
            zones: [
                { name: 'Stage Front', x: 150, y: 100, width: 250, height: 120 },
                { name: 'Stage Back', x: 150, y: 250, width: 250, height: 120 },
                { name: 'FOH Position', x: 400, y: 150, width: 120, height: 80 },
                { name: 'Power Station', x: 40, y: 320, width: 60, height: 60 },
                { name: 'Lighting Control', x: 550, y: 250, width: 120, height: 80 }
            ]
        }
    },
    'lighting-2': {
        title: 'Advanced Stage Lighting',
        category: 'lighting',
        difficulty: 'intermediate',
        description: 'Set up advanced stage lighting with moving heads and effects',
        objectives: [
            'Position moving head lights',
            'Connect advanced DMX control system',
            'Power all lighting equipment',
            'Create dynamic lighting zones'
        ],
        equipment: [
            {
                type: 'moving-head',
                name: 'Moving Head Light',
                icon: 'fas fa-lightbulb',
                quantity: 4,
                requiresPower: true,
                connectors: [
                    { type: 'dmx-in', position: 'bottom', label: 'DMX In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'dimmer',
                name: 'Advanced Dimmer',
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
            { type: 'color', name: 'Color Temperature', icon: 'fas fa-palette' },
            { type: 'movement', name: 'Movement', icon: 'fas fa-arrows-alt' }
        ],
        stageSetup: {
            width: 800,
            height: 600,
            zones: [
                { name: 'Stage Front', x: 150, y: 100, width: 250, height: 120 },
                { name: 'Stage Back', x: 150, y: 250, width: 250, height: 120 },
                { name: 'FOH Position', x: 400, y: 150, width: 120, height: 80 },
                { name: 'Power Station', x: 40, y: 320, width: 60, height: 60 },
                { name: 'Lighting Control', x: 550, y: 250, width: 120, height: 80 }
            ]
        }
    },
    'lighting-3': {
        title: 'Professional Lighting System',
        category: 'lighting',
        difficulty: 'advanced',
        description: 'Set up a complete professional lighting system with multiple fixture types',
        objectives: [
            'Position multiple fixture types',
            'Connect complex DMX control system',
            'Power all lighting equipment',
            'Create comprehensive lighting zones'
        ],
        equipment: [
            {
                type: 'moving-head',
                name: 'Moving Head Light',
                icon: 'fas fa-lightbulb',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'dmx-in', position: 'bottom', label: 'DMX In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'par-light',
                name: 'PAR Light',
                icon: 'fas fa-lightbulb',
                quantity: 4,
                requiresPower: true,
                connectors: [
                    { type: 'dmx-in', position: 'bottom', label: 'DMX In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'dimmer',
                name: 'Professional Dimmer',
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
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 8, color: '#ff4757' },
            { type: 'dmx-cable', name: 'DMX Cable', icon: 'fas fa-plug', quantity: 6, color: '#ffa502' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'dmx-out', to: 'dmx-in', cable: 'dmx-cable', animation: 'dmx-circle' }
        ],
        settings: [
            { type: 'intensity', name: 'Intensity', icon: 'fas fa-sliders-h' },
            { type: 'color', name: 'Color Temperature', icon: 'fas fa-palette' },
            { type: 'movement', name: 'Movement', icon: 'fas fa-arrows-alt' }
        ],
        stageSetup: {
            width: 800,
            height: 600,
            zones: [
                { name: 'Stage Front', x: 150, y: 100, width: 250, height: 120 },
                { name: 'Stage Back', x: 150, y: 250, width: 250, height: 120 },
                { name: 'FOH Position', x: 400, y: 150, width: 120, height: 80 },
                { name: 'Power Station', x: 40, y: 320, width: 60, height: 60 },
                { name: 'Lighting Control', x: 550, y: 250, width: 120, height: 80 }
            ]
        }
    },
    'video-1': {
        title: 'Basic Video System',
        category: 'video',
        difficulty: 'beginner',
        description: 'Set up basic video projection system',
        objectives: [
            'Position projector and screen',
            'Connect video sources',
            'Power all video equipment',
            'Create basic video zones'
        ],
        equipment: [
            {
                type: 'projector',
                name: 'Video Projector',
                icon: 'fas fa-tv',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'screen',
                name: 'Projection Screen',
                icon: 'fas fa-square',
                quantity: 1,
                requiresPower: false,
                connectors: []
            },
            {
                type: 'media-player',
                name: 'Media Player',
                icon: 'fas fa-play',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' }
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
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 3, color: '#ff4757' },
            { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 1, color: '#00ccff' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-pulse' }
        ],
        settings: [
            { type: 'brightness', name: 'Brightness', icon: 'fas fa-sliders-h' },
            { type: 'resolution', name: 'Resolution', icon: 'fas fa-expand' }
        ],
        stageSetup: {
            width: 800,
            height: 600,
            zones: [
                { name: 'Stage Front', x: 150, y: 100, width: 250, height: 120 },
                { name: 'Stage Back', x: 150, y: 250, width: 250, height: 120 },
                { name: 'FOH Position', x: 400, y: 150, width: 120, height: 80 },
                { name: 'Power Station', x: 40, y: 320, width: 60, height: 60 },
                { name: 'Video Control', x: 550, y: 250, width: 120, height: 80 }
            ]
        }
    },
    'video-2': {
        title: 'Multi-Screen Video System',
        category: 'video',
        difficulty: 'intermediate',
        description: 'Set up multi-screen video system with switching',
        objectives: [
            'Position multiple screens',
            'Connect video switcher',
            'Power all video equipment',
            'Create multi-screen zones'
        ],
        equipment: [
            {
                type: 'screen',
                name: 'LED Screen',
                icon: 'fas fa-tv',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'video-switcher',
                name: 'Video Switcher',
                icon: 'fas fa-random',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 1' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 2' },
                    { type: 'hdmi-out', position: 'front', label: 'Output 1' },
                    { type: 'hdmi-out', position: 'front', label: 'Output 2' }
                ]
            },
            {
                type: 'media-player',
                name: 'Media Player',
                icon: 'fas fa-play',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' }
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
                    { type: 'power-out', position: 'right', label: 'Power Out 3' }
                ]
            }
        ],
        connections: [
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 5, color: '#ff4757' },
            { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 4, color: '#00ccff' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-pulse' }
        ],
        settings: [
            { type: 'brightness', name: 'Brightness', icon: 'fas fa-sliders-h' },
            { type: 'resolution', name: 'Resolution', icon: 'fas fa-expand' },
            { type: 'switching', name: 'Switching', icon: 'fas fa-random' }
        ],
        stageSetup: {
            width: 800,
            height: 600,
            zones: [
                { name: 'Stage Front', x: 150, y: 100, width: 250, height: 120 },
                { name: 'Stage Back', x: 150, y: 250, width: 250, height: 120 },
                { name: 'FOH Position', x: 400, y: 150, width: 120, height: 80 },
                { name: 'Power Station', x: 40, y: 320, width: 60, height: 60 },
                { name: 'Video Control', x: 550, y: 250, width: 120, height: 80 }
            ]
        }
    },
    'video-3': {
        title: 'Professional Video System',
        category: 'video',
        difficulty: 'advanced',
        description: 'Set up professional video system with live switching and effects',
        objectives: [
            'Position professional video equipment',
            'Connect live video switcher',
            'Power all video equipment',
            'Create professional video zones'
        ],
        equipment: [
            {
                type: 'screen',
                name: 'Professional LED Wall',
                icon: 'fas fa-tv',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'video-switcher',
                name: 'Live Video Switcher',
                icon: 'fas fa-random',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 1' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 2' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 3' },
                    { type: 'hdmi-out', position: 'front', label: 'Output' }
                ]
            },
            {
                type: 'camera',
                name: 'Video Camera',
                icon: 'fas fa-video',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' }
                ]
            },
            {
                type: 'media-player',
                name: 'Media Player',
                icon: 'fas fa-play',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' }
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
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 5, color: '#ff4757' },
            { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 5, color: '#00ccff' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-pulse' }
        ],
        settings: [
            { type: 'brightness', name: 'Brightness', icon: 'fas fa-sliders-h' },
            { type: 'resolution', name: 'Resolution', icon: 'fas fa-expand' },
            { type: 'switching', name: 'Switching', icon: 'fas fa-random' }
        ],
        stageSetup: {
            width: 800,
            height: 600,
            zones: [
                { name: 'Stage Front', x: 150, y: 100, width: 250, height: 120 },
                { name: 'Stage Back', x: 150, y: 250, width: 250, height: 120 },
                { name: 'FOH Position', x: 400, y: 150, width: 120, height: 80 },
                { name: 'Power Station', x: 40, y: 320, width: 60, height: 60 },
                { name: 'Video Control', x: 550, y: 250, width: 120, height: 80 }
            ]
        }
    },
    'set-1': {
        title: 'Basic Stage Set',
        category: 'set',
        difficulty: 'beginner',
        description: 'Set up basic stage set with props and staging',
        objectives: [
            'Position basic stage props',
            'Set up staging elements',
            'Create basic set zones',
            'Organize stage layout'
        ],
        equipment: [
            {
                type: 'stage-prop',
                name: 'Stage Prop',
                icon: 'fas fa-cube',
                quantity: 3,
                requiresPower: false,
                connectors: []
            },
            {
                type: 'stage-curtain',
                name: 'Stage Curtain',
                icon: 'fas fa-scroll',
                quantity: 1,
                requiresPower: false,
                connectors: []
            },
            {
                type: 'stage-platform',
                name: 'Stage Platform',
                icon: 'fas fa-square',
                quantity: 2,
                requiresPower: false,
                connectors: []
            }
        ],
        connections: [],
        validConnections: [],
        settings: [
            { type: 'position', name: 'Position', icon: 'fas fa-arrows-alt' },
            { type: 'rotation', name: 'Rotation', icon: 'fas fa-redo' }
        ],
        stageSetup: {
            width: 800,
            height: 600,
            zones: [
                { name: 'Stage Front', x: 150, y: 100, width: 250, height: 120 },
                { name: 'Stage Back', x: 150, y: 250, width: 250, height: 120 },
                { name: 'FOH Position', x: 400, y: 150, width: 120, height: 80 },
                { name: 'Storage Area', x: 40, y: 320, width: 60, height: 60 },
                { name: 'Set Control', x: 550, y: 250, width: 120, height: 80 }
            ]
        }
    },
    'set-2': {
        title: 'Intermediate Stage Set',
        category: 'set',
        difficulty: 'intermediate',
        description: 'Set up intermediate stage set with multiple elements',
        objectives: [
            'Position multiple stage elements',
            'Set up complex staging',
            'Create intermediate set zones',
            'Organize complex layout'
        ],
        equipment: [
            {
                type: 'stage-prop',
                name: 'Stage Prop',
                icon: 'fas fa-cube',
                quantity: 5,
                requiresPower: false,
                connectors: []
            },
            {
                type: 'stage-curtain',
                name: 'Stage Curtain',
                icon: 'fas fa-scroll',
                quantity: 2,
                requiresPower: false,
                connectors: []
            },
            {
                type: 'stage-platform',
                name: 'Stage Platform',
                icon: 'fas fa-square',
                quantity: 3,
                requiresPower: false,
                connectors: []
            },
            {
                type: 'stage-ladder',
                name: 'Stage Ladder',
                icon: 'fas fa-arrows-alt-v',
                quantity: 1,
                requiresPower: false,
                connectors: []
            }
        ],
        connections: [],
        validConnections: [],
        settings: [
            { type: 'position', name: 'Position', icon: 'fas fa-arrows-alt' },
            { type: 'rotation', name: 'Rotation', icon: 'fas fa-redo' }
        ],
        stageSetup: {
            width: 800,
            height: 600,
            zones: [
                { name: 'Stage Front', x: 150, y: 100, width: 250, height: 120 },
                { name: 'Stage Back', x: 150, y: 250, width: 250, height: 120 },
                { name: 'FOH Position', x: 400, y: 150, width: 120, height: 80 },
                { name: 'Storage Area', x: 40, y: 320, width: 60, height: 60 },
                { name: 'Set Control', x: 550, y: 250, width: 120, height: 80 }
            ]
        }
    },
    'set-3': {
        title: 'Professional Stage Set',
        category: 'set',
        difficulty: 'advanced',
        description: 'Set up professional stage set with complex staging',
        objectives: [
            'Position professional stage elements',
            'Set up complex staging system',
            'Create professional set zones',
            'Organize complex layout'
        ],
        equipment: [
            {
                type: 'stage-prop',
                name: 'Stage Prop',
                icon: 'fas fa-cube',
                quantity: 8,
                requiresPower: false,
                connectors: []
            },
            {
                type: 'stage-curtain',
                name: 'Stage Curtain',
                icon: 'fas fa-scroll',
                quantity: 3,
                requiresPower: false,
                connectors: []
            },
            {
                type: 'stage-platform',
                name: 'Stage Platform',
                icon: 'fas fa-square',
                quantity: 4,
                requiresPower: false,
                connectors: []
            },
            {
                type: 'stage-ladder',
                name: 'Stage Ladder',
                icon: 'fas fa-arrows-alt-v',
                quantity: 2,
                requiresPower: false,
                connectors: []
            },
            {
                type: 'stage-rigging',
                name: 'Stage Rigging',
                icon: 'fas fa-link',
                quantity: 1,
                requiresPower: false,
                connectors: []
            }
        ],
        connections: [],
        validConnections: [],
        settings: [
            { type: 'position', name: 'Position', icon: 'fas fa-arrows-alt' },
            { type: 'rotation', name: 'Rotation', icon: 'fas fa-redo' }
        ],
        stageSetup: {
            width: 800,
            height: 600,
            zones: [
                { name: 'Stage Front', x: 150, y: 100, width: 250, height: 120 },
                { name: 'Stage Back', x: 150, y: 250, width: 250, height: 120 },
                { name: 'FOH Position', x: 400, y: 150, width: 120, height: 80 },
                { name: 'Storage Area', x: 40, y: 320, width: 60, height: 60 },
                { name: 'Set Control', x: 550, y: 250, width: 120, height: 80 }
            ]
        }
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
