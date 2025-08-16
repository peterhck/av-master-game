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
        resourceRequirements: {
            'microphone': ['singer', 'speaker'],
            'mic-receiver': ['a1-audio-tech', 'a2-audio-tech'],
            'mixing-console': ['a1-audio-tech'],
            'speaker': ['a2-audio-tech'],
            'power-distro': ['stage-hand']
        },
        availableResources: [
            { id: 'singer', name: 'Singer', icon: 'fas fa-music', description: 'Vocal performer' },
            { id: 'speaker', name: 'Speaker', icon: 'fas fa-user-tie', description: 'Public speaker' },
            { id: 'a1-audio-tech', name: 'A1 Audio Tech', icon: 'fas fa-headphones', description: 'Lead audio technician' },
            { id: 'a2-audio-tech', name: 'A2 Audio Tech', icon: 'fas fa-microchip', description: 'Assistant audio technician' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' },
            { id: 'stage-manager', name: 'Stage Manager', icon: 'fas fa-clipboard-list', description: 'Stage coordination' },
            { id: 'grip', name: 'Grip', icon: 'fas fa-tools', description: 'Equipment setup specialist' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '35%', y: '5%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Control Zone', x: '65%', y: '5%', width: '30%', height: '30%' }
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
        ],
        resourceRequirements: {
            'microphone': ['singer', 'speaker', 'instrumentalist'],
            'mixing-console': ['a1-audio-tech'],
            'effects-processor': ['a2-audio-tech'],
            'speaker': ['a2-audio-tech'],
            'power-distro': ['stage-hand']
        },
        availableResources: [
            { id: 'singer', name: 'Singer', icon: 'fas fa-music', description: 'Vocal performer' },
            { id: 'speaker', name: 'Speaker', icon: 'fas fa-user-tie', description: 'Public speaker' },
            { id: 'instrumentalist', name: 'Instrumentalist', icon: 'fas fa-guitar', description: 'Musical instrument player' },
            { id: 'a1-audio-tech', name: 'A1 Audio Tech', icon: 'fas fa-headphones', description: 'Lead audio technician' },
            { id: 'a2-audio-tech', name: 'A2 Audio Tech', icon: 'fas fa-microchip', description: 'Assistant audio technician' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' },
            { id: 'stage-manager', name: 'Stage Manager', icon: 'fas fa-clipboard-list', description: 'Stage coordination' },
            { id: 'grip', name: 'Grip', icon: 'fas fa-tools', description: 'Equipment setup specialist' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '35%', y: '5%', width: '25%', height: '20%' },
                { name: 'Monitor Zone', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '35%', y: '55%', width: '25%', height: '20%' },
                { name: 'Wireless Zone', x: '65%', y: '5%', width: '30%', height: '30%' }
            ]
        }
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
            { type: 'wireless-cable', name: 'Wireless Signal', icon: 'fas fa-wifi', quantity: 2, color: '#a29bfe' }
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
        resourceRequirements: {
            'microphone': ['singer', 'speaker', 'instrumentalist'],
            'playback-device': ['dj', 'media-operator'],
            'mixing-console': ['a1-audio-tech'],
            'wireless-transmitter': ['a2-audio-tech'],
            'wireless-receiver': ['a2-audio-tech'],
            'speaker': ['a2-audio-tech'],
            'power-distro': ['stage-hand']
        },
        availableResources: [
            { id: 'singer', name: 'Singer', icon: 'fas fa-music', description: 'Vocal performer' },
            { id: 'speaker', name: 'Speaker', icon: 'fas fa-user-tie', description: 'Public speaker' },
            { id: 'instrumentalist', name: 'Instrumentalist', icon: 'fas fa-guitar', description: 'Musical instrument player' },
            { id: 'dj', name: 'DJ', icon: 'fas fa-compact-disc', description: 'Disc jockey' },
            { id: 'media-operator', name: 'Media Operator', icon: 'fas fa-play-circle', description: 'Media playback operator' },
            { id: 'a1-audio-tech', name: 'A1 Audio Tech', icon: 'fas fa-headphones', description: 'Lead audio technician' },
            { id: 'a2-audio-tech', name: 'A2 Audio Tech', icon: 'fas fa-microchip', description: 'Assistant audio technician' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' },
            { id: 'stage-manager', name: 'Stage Manager', icon: 'fas fa-clipboard-list', description: 'Stage coordination' },
            { id: 'grip', name: 'Grip', icon: 'fas fa-tools', description: 'Equipment setup specialist' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '35%', y: '5%', width: '25%', height: '20%' },
                { name: 'Monitor Zone', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '35%', y: '55%', width: '25%', height: '20%' },
                { name: 'Wireless Zone', x: '65%', y: '5%', width: '30%', height: '30%' }
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
        resourceRequirements: {
            'stage-light': ['performer', 'actor'],
            'lighting-stand': ['stage-hand', 'grip'],
            'dimmer': ['l1-lighting-tech'],
            'power-distro': ['stage-hand']
        },
        availableResources: [
            { id: 'performer', name: 'Performer', icon: 'fas fa-star', description: 'Stage performer' },
            { id: 'actor', name: 'Actor', icon: 'fas fa-theater-masks', description: 'Theatrical actor' },
            { id: 'l1-lighting-tech', name: 'L1 Lighting Tech', icon: 'fas fa-lightbulb', description: 'Lead lighting technician' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' },
            { id: 'grip', name: 'Grip', icon: 'fas fa-tools', description: 'Equipment setup specialist' },
            { id: 'stage-manager', name: 'Stage Manager', icon: 'fas fa-clipboard-list', description: 'Stage coordination' },
            { id: 'lighting-designer', name: 'Lighting Designer', icon: 'fas fa-palette', description: 'Lighting design specialist' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '35%', y: '5%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Control Zone', x: '65%', y: '5%', width: '30%', height: '30%' }
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
        resourceRequirements: {
            'moving-head': ['performer', 'actor', 'dancer'],
            'dimmer': ['l1-lighting-tech'],
            'power-distro': ['stage-hand']
        },
        availableResources: [
            { id: 'performer', name: 'Performer', icon: 'fas fa-star', description: 'Stage performer' },
            { id: 'actor', name: 'Actor', icon: 'fas fa-theater-masks', description: 'Theatrical actor' },
            { id: 'dancer', name: 'Dancer', icon: 'fas fa-running', description: 'Dance performer' },
            { id: 'l1-lighting-tech', name: 'L1 Lighting Tech', icon: 'fas fa-lightbulb', description: 'Lead lighting technician' },
            { id: 'l2-lighting-tech', name: 'L2 Lighting Tech', icon: 'fas fa-lightbulb', description: 'Assistant lighting technician' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' },
            { id: 'grip', name: 'Grip', icon: 'fas fa-tools', description: 'Equipment setup specialist' },
            { id: 'stage-manager', name: 'Stage Manager', icon: 'fas fa-clipboard-list', description: 'Stage coordination' },
            { id: 'lighting-designer', name: 'Lighting Designer', icon: 'fas fa-palette', description: 'Lighting design specialist' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '35%', y: '5%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Control Zone', x: '65%', y: '5%', width: '30%', height: '30%' }
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
        resourceRequirements: {
            'moving-head': ['performer', 'actor', 'dancer'],
            'par-light': ['performer', 'actor', 'dancer'],
            'dimmer': ['l1-lighting-tech'],
            'power-distro': ['stage-hand']
        },
        availableResources: [
            { id: 'performer', name: 'Performer', icon: 'fas fa-star', description: 'Stage performer' },
            { id: 'actor', name: 'Actor', icon: 'fas fa-theater-masks', description: 'Theatrical actor' },
            { id: 'dancer', name: 'Dancer', icon: 'fas fa-running', description: 'Dance performer' },
            { id: 'l1-lighting-tech', name: 'L1 Lighting Tech', icon: 'fas fa-lightbulb', description: 'Lead lighting technician' },
            { id: 'l2-lighting-tech', name: 'L2 Lighting Tech', icon: 'fas fa-lightbulb', description: 'Assistant lighting technician' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' },
            { id: 'grip', name: 'Grip', icon: 'fas fa-tools', description: 'Equipment setup specialist' },
            { id: 'stage-manager', name: 'Stage Manager', icon: 'fas fa-clipboard-list', description: 'Stage coordination' },
            { id: 'lighting-designer', name: 'Lighting Designer', icon: 'fas fa-palette', description: 'Lighting design specialist' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '35%', y: '5%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Control Zone', x: '65%', y: '5%', width: '30%', height: '30%' }
            ]
        }
    },
    'video-1': {
        title: 'Corporate Presentation Setup',
        category: 'video',
        difficulty: 'beginner',
        description: 'Set up professional corporate presentation system with multiple inputs and backup',
        objectives: [
            'Position main and backup projectors',
            'Connect laptop and backup media sources',
            'Set up video switcher for seamless transitions',
            'Power all video equipment with redundancy',
            'Create presentation zones with proper sightlines'
        ],
        equipment: [
            {
                type: 'projector',
                name: 'Main Projector',
                icon: 'fas fa-tv',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In 1' },
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In 2' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'projector',
                name: 'Backup Projector',
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
                name: 'Main Screen',
                icon: 'fas fa-square',
                quantity: 1,
                requiresPower: false,
                connectors: []
            },
            {
                type: 'video-switcher',
                name: 'HDMI Switcher',
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
                type: 'laptop',
                name: 'Presenter Laptop',
                icon: 'fas fa-laptop',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'right', label: 'HDMI Out' }
                ]
            },
            {
                type: 'media-player',
                name: 'Backup Media Player',
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
            { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 6, color: '#00ccff' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-pulse' }
        ],
        settings: [
            { type: 'brightness', name: 'Brightness', icon: 'fas fa-sliders-h' },
            { type: 'resolution', name: 'Resolution', icon: 'fas fa-expand' },
            { type: 'switching', name: 'Switching', icon: 'fas fa-random' },
            { type: 'backup', name: 'Backup Mode', icon: 'fas fa-shield-alt' }
        ],
        resourceRequirements: {
            'projector': ['v1-video-tech'],
            'screen': ['stage-hand'],
            'video-switcher': ['v1-video-tech'],
            'laptop': ['presenter'],
            'media-player': ['media-operator'],
            'power-distro': ['stage-hand']
        },
        availableResources: [
            { id: 'v1-video-tech', name: 'V1 Video Tech', icon: 'fas fa-video', description: 'Lead video technician' },
            { id: 'presenter', name: 'Presenter', icon: 'fas fa-user-tie', description: 'Corporate presenter' },
            { id: 'media-operator', name: 'Media Operator', icon: 'fas fa-play-circle', description: 'Media playback operator' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' },
            { id: 'grip', name: 'Grip', icon: 'fas fa-tools', description: 'Equipment setup specialist' },
            { id: 'stage-manager', name: 'Stage Manager', icon: 'fas fa-clipboard-list', description: 'Stage coordination' },
            { id: 'video-designer', name: 'Video Designer', icon: 'fas fa-palette', description: 'Video design specialist' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '35%', y: '5%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Video Control', x: '65%', y: '5%', width: '30%', height: '30%' },
                { name: 'Camera Position 1', x: '35%', y: '30%', width: '20%', height: '20%' },
                { name: 'Camera Position 2', x: '60%', y: '30%', width: '20%', height: '20%' },
                { name: 'Camera Position 3', x: '60%', y: '55%', width: '20%', height: '20%' }
            ]
        }
    },
    'video-2': {
        title: 'Live Streaming Multi-Camera Setup',
        category: 'video',
        difficulty: 'intermediate',
        description: 'Set up professional live streaming system with multiple cameras and graphics',
        objectives: [
            'Position multiple cameras for different angles',
            'Connect live video switcher with graphics overlay',
            'Set up streaming encoder and backup recording',
            'Power all video equipment with redundancy',
            'Create live streaming zones with proper coverage'
        ],
        equipment: [
            {
                type: 'camera',
                name: 'Main Camera',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' }
                ]
            },
            {
                type: 'camera',
                name: 'Wide Shot Camera',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' }
                ]
            },
            {
                type: 'camera',
                name: 'Close-up Camera',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' }
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
                    { type: 'hdmi-in', position: 'back', label: 'Graphics Input' },
                    { type: 'hdmi-out', position: 'front', label: 'Program Out' },
                    { type: 'hdmi-out', position: 'front', label: 'Preview Out' }
                ]
            },
            {
                type: 'graphics-computer',
                name: 'Graphics Computer',
                icon: 'fas fa-desktop',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' }
                ]
            },
            {
                type: 'streaming-encoder',
                name: 'Streaming Encoder',
                icon: 'fas fa-broadcast-tower',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'ethernet-out', position: 'back', label: 'Network Out' }
                ]
            },
            {
                type: 'recorder',
                name: 'Backup Recorder',
                icon: 'fas fa-hdd',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' }
                ]
            },
            {
                type: 'screen',
                name: 'Monitor Screen',
                icon: 'fas fa-tv',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
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
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 8, color: '#ff4757' },
            { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 10, color: '#00ccff' },
            { type: 'ethernet-cable', name: 'Ethernet Cable', icon: 'fas fa-plug', quantity: 1, color: '#ffa502' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-pulse' },
            { from: 'ethernet-out', to: 'ethernet-in', cable: 'ethernet-cable', animation: 'network-pulse' }
        ],
        settings: [
            { type: 'brightness', name: 'Brightness', icon: 'fas fa-sliders-h' },
            { type: 'resolution', name: 'Resolution', icon: 'fas fa-expand' },
            { type: 'switching', name: 'Switching', icon: 'fas fa-random' },
            { type: 'streaming', name: 'Streaming', icon: 'fas fa-broadcast-tower' },
            { type: 'graphics', name: 'Graphics', icon: 'fas fa-palette' }
        ],
        resourceRequirements: {
            'camera': ['camera-operator'],
            'video-switcher': ['v1-video-tech'],
            'graphics-computer': ['graphics-operator'],
            'streaming-encoder': ['v1-video-tech'],
            'recorder': ['v2-video-tech'],
            'screen': ['v2-video-tech'],
            'power-distro': ['stage-hand']
        },
        availableResources: [
            { id: 'v1-video-tech', name: 'V1 Video Tech', icon: 'fas fa-video', description: 'Lead video technician' },
            { id: 'v2-video-tech', name: 'V2 Video Tech', icon: 'fas fa-video', description: 'Assistant video technician' },
            { id: 'camera-operator', name: 'Camera Operator', icon: 'fas fa-camera', description: 'Video camera operator' },
            { id: 'graphics-operator', name: 'Graphics Operator', icon: 'fas fa-palette', description: 'Graphics and overlay operator' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' },
            { id: 'grip', name: 'Grip', icon: 'fas fa-tools', description: 'Equipment setup specialist' },
            { id: 'stage-manager', name: 'Stage Manager', icon: 'fas fa-clipboard-list', description: 'Stage coordination' },
            { id: 'video-designer', name: 'Video Designer', icon: 'fas fa-palette', description: 'Video design specialist' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '35%', y: '5%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Video Control', x: '65%', y: '5%', width: '30%', height: '30%' },
                { name: 'Camera Position 1', x: '35%', y: '30%', width: '20%', height: '20%' },
                { name: 'Camera Position 2', x: '60%', y: '30%', width: '20%', height: '20%' },
                { name: 'Camera Position 3', x: '60%', y: '55%', width: '20%', height: '20%' }
            ]
        }
    },
    'video-3': {
        title: 'Professional Broadcast Studio',
        category: 'video',
        difficulty: 'advanced',
        description: 'Set up complete professional broadcast studio with multi-camera production, graphics, and live streaming',
        objectives: [
            'Position professional broadcast cameras and robotic systems',
            'Connect advanced video switcher with effects and graphics',
            'Set up multi-format recording and streaming systems',
            'Power all broadcast equipment with UPS backup',
            'Create professional broadcast zones with proper workflow'
        ],
        equipment: [
            {
                type: 'camera',
                name: 'Studio Camera A',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' },
                    { type: 'tally-in', position: 'back', label: 'Tally In' }
                ]
            },
            {
                type: 'camera',
                name: 'Studio Camera B',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' },
                    { type: 'tally-in', position: 'back', label: 'Tally In' }
                ]
            },
            {
                type: 'camera',
                name: 'Robotic Camera',
                icon: 'fas fa-robot',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' },
                    { type: 'control-in', position: 'back', label: 'Control In' }
                ]
            },
            {
                type: 'video-switcher',
                name: 'Professional Video Switcher',
                icon: 'fas fa-random',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 1' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 2' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 3' },
                    { type: 'hdmi-in', position: 'back', label: 'Graphics Input' },
                    { type: 'hdmi-in', position: 'back', label: 'VTR Input' },
                    { type: 'hdmi-out', position: 'front', label: 'Program Out' },
                    { type: 'hdmi-out', position: 'front', label: 'Preview Out' },
                    { type: 'hdmi-out', position: 'front', label: 'Clean Out' }
                ]
            },
            {
                type: 'graphics-computer',
                name: 'Graphics Workstation',
                icon: 'fas fa-desktop',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'ethernet-out', position: 'back', label: 'Network Out' }
                ]
            },
            {
                type: 'vtr',
                name: 'Video Tape Recorder',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' }
                ]
            },
            {
                type: 'streaming-encoder',
                name: 'Multi-Stream Encoder',
                icon: 'fas fa-broadcast-tower',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'ethernet-out', position: 'back', label: 'Network Out' }
                ]
            },
            {
                type: 'recorder',
                name: 'Multi-Format Recorder',
                icon: 'fas fa-hdd',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' }
                ]
            },
            {
                type: 'screen',
                name: 'Program Monitor',
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
                name: 'Preview Monitor',
                icon: 'fas fa-tv',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'ups',
                name: 'Uninterruptible Power Supply',
                icon: 'fas fa-battery-full',
                quantity: 1,
                requiresPower: false,
                connectors: [
                    { type: 'power-out', position: 'right', label: 'UPS Out 1' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 2' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 3' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 4' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 5' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 6' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 7' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 8' }
                ]
            }
        ],
        connections: [
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 10, color: '#ff4757' },
            { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 15, color: '#00ccff' },
            { type: 'ethernet-cable', name: 'Ethernet Cable', icon: 'fas fa-plug', quantity: 2, color: '#ffa502' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-pulse' },
            { from: 'ethernet-out', to: 'ethernet-in', cable: 'ethernet-cable', animation: 'network-pulse' }
        ],
        settings: [
            { type: 'brightness', name: 'Brightness', icon: 'fas fa-sliders-h' },
            { type: 'resolution', name: 'Resolution', icon: 'fas fa-expand' },
            { type: 'switching', name: 'Switching', icon: 'fas fa-random' },
            { type: 'streaming', name: 'Streaming', icon: 'fas fa-broadcast-tower' },
            { type: 'graphics', name: 'Graphics', icon: 'fas fa-palette' },
            { type: 'recording', name: 'Recording', icon: 'fas fa-hdd' },
            { type: 'robotic', name: 'Robotic Control', icon: 'fas fa-robot' }
        ],
        resourceRequirements: {
            'camera': ['camera-operator'],
            'video-switcher': ['v1-video-tech'],
            'graphics-computer': ['graphics-operator'],
            'vtr': ['v2-video-tech'],
            'streaming-encoder': ['v1-video-tech'],
            'recorder': ['v2-video-tech'],
            'screen': ['v2-video-tech'],
            'ups': ['stage-hand']
        },
        availableResources: [
            { id: 'v1-video-tech', name: 'V1 Video Tech', icon: 'fas fa-video', description: 'Lead video technician' },
            { id: 'v2-video-tech', name: 'V2 Video Tech', icon: 'fas fa-video', description: 'Assistant video technician' },
            { id: 'camera-operator', name: 'Camera Operator', icon: 'fas fa-camera', description: 'Video camera operator' },
            { id: 'graphics-operator', name: 'Graphics Operator', icon: 'fas fa-palette', description: 'Graphics and overlay operator' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' },
            { id: 'grip', name: 'Grip', icon: 'fas fa-tools', description: 'Equipment setup specialist' },
            { id: 'stage-manager', name: 'Stage Manager', icon: 'fas fa-clipboard-list', description: 'Stage coordination' },
            { id: 'video-designer', name: 'Video Designer', icon: 'fas fa-palette', description: 'Video design specialist' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '35%', y: '5%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Video Control', x: '65%', y: '5%', width: '30%', height: '30%' },
                { name: 'Camera Position 1', x: '35%', y: '30%', width: '20%', height: '20%' },
                { name: 'Camera Position 2', x: '60%', y: '30%', width: '20%', height: '20%' },
                { name: 'Camera Position 3', x: '60%', y: '55%', width: '20%', height: '20%' }
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
        resourceRequirements: {
            'stage-prop': ['performer', 'actor', 'dancer'],
            'stage-curtain': ['stage-hand'],
            'stage-platform': ['stage-hand', 'grip'],
            'stage-ladder': ['stage-hand', 'grip'],
            'stage-rigging': ['rigger']
        },
        availableResources: [
            { id: 'performer', name: 'Performer', icon: 'fas fa-star', description: 'Stage performer' },
            { id: 'actor', name: 'Actor', icon: 'fas fa-theater-masks', description: 'Theatrical actor' },
            { id: 'dancer', name: 'Dancer', icon: 'fas fa-running', description: 'Dance performer' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' },
            { id: 'grip', name: 'Grip', icon: 'fas fa-tools', description: 'Equipment setup specialist' },
            { id: 'rigger', name: 'Rigger', icon: 'fas fa-link', description: 'Stage rigging specialist' },
            { id: 'stage-manager', name: 'Stage Manager', icon: 'fas fa-clipboard-list', description: 'Stage coordination' },
            { id: 'set-designer', name: 'Set Designer', icon: 'fas fa-palette', description: 'Set design specialist' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '35%', y: '5%', width: '25%', height: '20%' },
                { name: 'Storage Area', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Set Control', x: '65%', y: '5%', width: '30%', height: '30%' }
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
            }
        ],
        connections: [],
        validConnections: [],
        settings: [
            { type: 'position', name: 'Position', icon: 'fas fa-arrows-alt' },
            { type: 'rotation', name: 'Rotation', icon: 'fas fa-redo' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '35%', y: '5%', width: '25%', height: '20%' },
                { name: 'Storage Area', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Set Control', x: '65%', y: '5%', width: '30%', height: '30%' }
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
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '35%', y: '5%', width: '25%', height: '20%' },
                { name: 'Storage Area', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Set Control', x: '65%', y: '5%', width: '30%', height: '30%' }
            ]
        }
    },
    'streaming-1': {
        title: 'Social Media Live Stream',
        category: 'streaming',
        difficulty: 'beginner',
        description: 'Set up multi-platform social media live streaming with chat integration',
        objectives: [
            'Position streaming cameras and mobile devices',
            'Connect multi-platform streaming encoder',
            'Set up chat overlay and engagement tools',
            'Power all streaming equipment',
            'Create interactive streaming zones'
        ],
        equipment: [
            {
                type: 'camera',
                name: 'Streaming Camera',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'usb-out', position: 'back', label: 'USB Out' }
                ]
            },
            {
                type: 'mobile-device',
                name: 'Mobile Phone',
                icon: 'fas fa-mobile-alt',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'bottom', label: 'Power In' },
                    { type: 'usb-out', position: 'bottom', label: 'USB Out' }
                ]
            },
            {
                type: 'streaming-encoder',
                name: 'Multi-Platform Encoder',
                icon: 'fas fa-broadcast-tower',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'usb-in', position: 'back', label: 'USB In 1' },
                    { type: 'usb-in', position: 'back', label: 'USB In 2' },
                    { type: 'ethernet-out', position: 'back', label: 'Network Out' }
                ]
            },
            {
                type: 'chat-computer',
                name: 'Chat Management PC',
                icon: 'fas fa-desktop',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'ethernet-out', position: 'back', label: 'Network Out' }
                ]
            },
            {
                type: 'light-fixture',
                name: 'Ring Light',
                icon: 'fas fa-lightbulb',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'dmx-in', position: 'back', label: 'DMX In' }
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
            { type: 'usb-cable', name: 'USB Cable', icon: 'fas fa-plug', quantity: 3, color: '#00ccff' },
            { type: 'ethernet-cable', name: 'Ethernet Cable', icon: 'fas fa-plug', quantity: 2, color: '#ffa502' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'usb-out', to: 'usb-in', cable: 'usb-cable', animation: 'data-pulse' },
            { from: 'ethernet-out', to: 'ethernet-in', cable: 'ethernet-cable', animation: 'network-pulse' }
        ],
        settings: [
            { type: 'platforms', name: 'Streaming Platforms', icon: 'fas fa-globe' },
            { type: 'chat', name: 'Chat Integration', icon: 'fas fa-comments' },
            { type: 'overlay', name: 'Graphics Overlay', icon: 'fas fa-palette' }
        ],
        resourceRequirements: {
            'camera': ['streamer'],
            'mobile-device': ['streamer'],
            'streaming-encoder': ['streaming-tech'],
            'chat-computer': ['chat-moderator'],
            'light-fixture': ['lighting-tech'],
            'power-distro': ['stage-hand']
        },
        availableResources: [
            { id: 'streamer', name: 'Content Creator', icon: 'fas fa-user', description: 'Social media streamer' },
            { id: 'streaming-tech', name: 'Streaming Tech', icon: 'fas fa-broadcast-tower', description: 'Streaming technician' },
            { id: 'chat-moderator', name: 'Chat Moderator', icon: 'fas fa-shield-alt', description: 'Chat moderation specialist' },
            { id: 'lighting-tech', name: 'Lighting Tech', icon: 'fas fa-lightbulb', description: 'Lighting technician' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Streaming Area', x: '5%', y: '5%', width: '30%', height: '25%' },
                { name: 'FOH Position', x: '40%', y: '5%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '5%', y: '35%', width: '25%', height: '20%' },
                { name: 'Streaming Control', x: '70%', y: '5%', width: '25%', height: '30%' },
                { name: 'Chat Station', x: '40%', y: '30%', width: '25%', height: '20%' }
            ]
        }
    },
    'streaming-2': {
        title: 'Gaming Tournament Stream',
        category: 'streaming',
        difficulty: 'intermediate',
        description: 'Set up professional gaming tournament streaming with multiple players and commentators',
        objectives: [
            'Position multiple gaming stations and cameras',
            'Connect tournament streaming system',
            'Set up commentator audio and video',
            'Power all gaming and streaming equipment',
            'Create tournament streaming zones'
        ],
        equipment: [
            {
                type: 'gaming-pc',
                name: 'Gaming PC 1',
                icon: 'fas fa-desktop',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'usb-out', position: 'back', label: 'USB Out' }
                ]
            },
            {
                type: 'gaming-pc',
                name: 'Gaming PC 2',
                icon: 'fas fa-desktop',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'usb-out', position: 'back', label: 'USB Out' }
                ]
            },
            {
                type: 'camera',
                name: 'Player Camera 1',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'usb-out', position: 'back', label: 'USB Out' }
                ]
            },
            {
                type: 'camera',
                name: 'Player Camera 2',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'usb-out', position: 'back', label: 'USB Out' }
                ]
            },
            {
                type: 'microphone',
                name: 'Commentator Mic',
                icon: 'fas fa-microphone',
                quantity: 1,
                requiresPower: false,
                connectors: [
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'streaming-encoder',
                name: 'Tournament Encoder',
                icon: 'fas fa-broadcast-tower',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In 1' },
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In 2' },
                    { type: 'usb-in', position: 'back', label: 'USB In 1' },
                    { type: 'usb-in', position: 'back', label: 'USB In 2' },
                    { type: 'xlr-in', position: 'back', label: 'XLR In' },
                    { type: 'ethernet-out', position: 'back', label: 'Network Out' }
                ]
            },
            {
                type: 'screen',
                name: 'Tournament Monitor',
                icon: 'fas fa-tv',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
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
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 6, color: '#ff4757' },
            { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 4, color: '#00ccff' },
            { type: 'usb-cable', name: 'USB Cable', icon: 'fas fa-plug', quantity: 4, color: '#a29bfe' },
            { type: 'xlr-cable', name: 'XLR Cable', icon: 'fas fa-plug', quantity: 1, color: '#00ff88' },
            { type: 'ethernet-cable', name: 'Ethernet Cable', icon: 'fas fa-plug', quantity: 1, color: '#ffa502' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-pulse' },
            { from: 'usb-out', to: 'usb-in', cable: 'usb-cable', animation: 'data-pulse' },
            { from: 'xlr-out', to: 'xlr-in', cable: 'xlr-cable', animation: 'audio-pulse' },
            { from: 'ethernet-out', to: 'ethernet-in', cable: 'ethernet-cable', animation: 'network-pulse' }
        ],
        settings: [
            { type: 'tournament', name: 'Tournament Mode', icon: 'fas fa-trophy' },
            { type: 'commentary', name: 'Commentary Audio', icon: 'fas fa-microphone' },
            { type: 'overlay', name: 'Score Overlay', icon: 'fas fa-chart-bar' }
        ],
        resourceRequirements: {
            'gaming-pc': ['gamer'],
            'camera': ['camera-operator'],
            'microphone': ['commentator'],
            'streaming-encoder': ['streaming-tech'],
            'screen': ['tournament-director'],
            'power-distro': ['stage-hand']
        },
        availableResources: [
            { id: 'gamer', name: 'Gamer', icon: 'fas fa-gamepad', description: 'Tournament player' },
            { id: 'camera-operator', name: 'Camera Operator', icon: 'fas fa-camera', description: 'Video camera operator' },
            { id: 'commentator', name: 'Commentator', icon: 'fas fa-microphone', description: 'Tournament commentator' },
            { id: 'streaming-tech', name: 'Streaming Tech', icon: 'fas fa-broadcast-tower', description: 'Streaming technician' },
            { id: 'tournament-director', name: 'Tournament Director', icon: 'fas fa-trophy', description: 'Tournament coordinator' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Streaming Area', x: '5%', y: '5%', width: '30%', height: '25%' },
                { name: 'FOH Position', x: '40%', y: '5%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '5%', y: '35%', width: '25%', height: '20%' },
                { name: 'Streaming Control', x: '70%', y: '5%', width: '25%', height: '30%' },
                { name: 'Chat Station', x: '40%', y: '30%', width: '25%', height: '20%' }
            ]
        }
    },
    'streaming-3': {
        title: 'Professional Esports Arena',
        category: 'streaming',
        difficulty: 'advanced',
        description: 'Set up complete professional esports arena with multi-camera production, live audience, and global streaming',
        objectives: [
            'Position professional esports gaming stations',
            'Connect multi-camera production system',
            'Set up live audience audio and video',
            'Power all arena equipment with redundancy',
            'Create professional esports production zones'
        ],
        equipment: [
            {
                type: 'gaming-pc',
                name: 'Pro Gaming PC 1',
                icon: 'fas fa-desktop',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'usb-out', position: 'back', label: 'USB Out' },
                    { type: 'ethernet-out', position: 'back', label: 'Network Out' }
                ]
            },
            {
                type: 'gaming-pc',
                name: 'Pro Gaming PC 2',
                icon: 'fas fa-desktop',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'usb-out', position: 'back', label: 'USB Out' },
                    { type: 'ethernet-out', position: 'back', label: 'Network Out' }
                ]
            },
            {
                type: 'camera',
                name: 'Player Camera 1',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' }
                ]
            },
            {
                type: 'camera',
                name: 'Player Camera 2',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' }
                ]
            },
            {
                type: 'camera',
                name: 'Audience Camera',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' }
                ]
            },
            {
                type: 'microphone',
                name: 'Commentator Mic 1',
                icon: 'fas fa-microphone',
                quantity: 1,
                requiresPower: false,
                connectors: [
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'microphone',
                name: 'Commentator Mic 2',
                icon: 'fas fa-microphone',
                quantity: 1,
                requiresPower: false,
                connectors: [
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'video-switcher',
                name: 'Production Switcher',
                icon: 'fas fa-random',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 1' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 2' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 3' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 4' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 5' },
                    { type: 'hdmi-out', position: 'front', label: 'Program Out' },
                    { type: 'hdmi-out', position: 'front', label: 'Preview Out' }
                ]
            },
            {
                type: 'streaming-encoder',
                name: 'Multi-Platform Encoder',
                icon: 'fas fa-broadcast-tower',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'ethernet-out', position: 'back', label: 'Network Out' }
                ]
            },
            {
                type: 'screen',
                name: 'Arena Display',
                icon: 'fas fa-tv',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'speaker',
                name: 'Arena Speaker',
                icon: 'fas fa-volume-up',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'Speaker In' }
                ]
            },
            {
                type: 'ups',
                name: 'Uninterruptible Power Supply',
                icon: 'fas fa-battery-full',
                quantity: 1,
                requiresPower: false,
                connectors: [
                    { type: 'power-out', position: 'right', label: 'UPS Out 1' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 2' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 3' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 4' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 5' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 6' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 7' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 8' }
                ]
            }
        ],
        connections: [
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 10, color: '#ff4757' },
            { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 8, color: '#00ccff' },
            { type: 'usb-cable', name: 'USB Cable', icon: 'fas fa-plug', quantity: 2, color: '#a29bfe' },
            { type: 'xlr-cable', name: 'XLR Cable', icon: 'fas fa-plug', quantity: 3, color: '#00ff88' },
            { type: 'ethernet-cable', name: 'Ethernet Cable', icon: 'fas fa-plug', quantity: 3, color: '#ffa502' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-pulse' },
            { from: 'usb-out', to: 'usb-in', cable: 'usb-cable', animation: 'data-pulse' },
            { from: 'xlr-out', to: 'xlr-in', cable: 'xlr-cable', animation: 'audio-pulse' },
            { from: 'ethernet-out', to: 'ethernet-in', cable: 'ethernet-cable', animation: 'network-pulse' }
        ],
        settings: [
            { type: 'esports', name: 'Esports Mode', icon: 'fas fa-trophy' },
            { type: 'production', name: 'Production Control', icon: 'fas fa-sliders-h' },
            { type: 'streaming', name: 'Multi-Platform', icon: 'fas fa-globe' },
            { type: 'audience', name: 'Audience Audio', icon: 'fas fa-users' }
        ],
        resourceRequirements: {
            'gaming-pc': ['pro-gamer'],
            'camera': ['camera-operator'],
            'microphone': ['commentator'],
            'video-switcher': ['production-director'],
            'streaming-encoder': ['streaming-tech'],
            'screen': ['arena-manager'],
            'speaker': ['audio-tech'],
            'ups': ['stage-hand']
        },
        availableResources: [
            { id: 'pro-gamer', name: 'Pro Gamer', icon: 'fas fa-gamepad', description: 'Professional esports player' },
            { id: 'camera-operator', name: 'Camera Operator', icon: 'fas fa-camera', description: 'Video camera operator' },
            { id: 'commentator', name: 'Commentator', icon: 'fas fa-microphone', description: 'Esports commentator' },
            { id: 'production-director', name: 'Production Director', icon: 'fas fa-video', description: 'Production coordinator' },
            { id: 'streaming-tech', name: 'Streaming Tech', icon: 'fas fa-broadcast-tower', description: 'Streaming technician' },
            { id: 'arena-manager', name: 'Arena Manager', icon: 'fas fa-trophy', description: 'Arena operations manager' },
            { id: 'audio-tech', name: 'Audio Tech', icon: 'fas fa-volume-up', description: 'Audio technician' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Streaming Area', x: '5%', y: '5%', width: '30%', height: '25%' },
                { name: 'FOH Position', x: '40%', y: '5%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '5%', y: '35%', width: '25%', height: '20%' },
                { name: 'Streaming Control', x: '70%', y: '5%', width: '25%', height: '30%' },
                { name: 'Chat Station', x: '40%', y: '30%', width: '25%', height: '20%' }
            ]
        }
    },
    'advanced-1': {
        title: 'Concert Hall Production',
        category: 'advanced',
        difficulty: 'expert',
        description: 'Set up complete concert hall production with professional audio, lighting, video, and streaming',
        objectives: [
            'Position professional concert audio system',
            'Connect advanced lighting and video systems',
            'Set up multi-camera live streaming',
            'Power all production equipment with redundancy',
            'Create professional concert production zones'
        ],
        equipment: [
            {
                type: 'microphone',
                name: 'Vocal Mic',
                icon: 'fas fa-microphone',
                quantity: 4,
                requiresPower: false,
                connectors: [
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'microphone',
                name: 'Instrument Mic',
                icon: 'fas fa-microphone',
                quantity: 6,
                requiresPower: false,
                connectors: [
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'mixing-console',
                name: 'Professional Mixer',
                icon: 'fas fa-sliders-h',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 1' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 2' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 3' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 4' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 5' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 6' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 7' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 8' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 9' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 10' },
                    { type: 'xlr-out', position: 'bottom', label: 'Main Out L' },
                    { type: 'xlr-out', position: 'bottom', label: 'Main Out R' },
                    { type: 'xlr-out', position: 'bottom', label: 'Monitor Out' }
                ]
            },
            {
                type: 'speaker',
                name: 'Main Speaker',
                icon: 'fas fa-volume-up',
                quantity: 4,
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
                quantity: 6,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'Speaker In' }
                ]
            },
            {
                type: 'moving-head',
                name: 'Moving Head Light',
                icon: 'fas fa-lightbulb',
                quantity: 8,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'dmx-in', position: 'back', label: 'DMX In' }
                ]
            },
            {
                type: 'dmx-controller',
                name: 'DMX Controller',
                icon: 'fas fa-sliders-h',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'dmx-out', position: 'back', label: 'DMX Out' }
                ]
            },
            {
                type: 'camera',
                name: 'Stage Camera',
                icon: 'fas fa-video',
                quantity: 3,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' }
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
                    { type: 'hdmi-out', position: 'front', label: 'Program Out' },
                    { type: 'hdmi-out', position: 'front', label: 'Preview Out' }
                ]
            },
            {
                type: 'streaming-encoder',
                name: 'Live Stream Encoder',
                icon: 'fas fa-broadcast-tower',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'ethernet-out', position: 'back', label: 'Network Out' }
                ]
            },
            {
                type: 'screen',
                name: 'Video Wall',
                icon: 'fas fa-tv',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'ups',
                name: 'Uninterruptible Power Supply',
                icon: 'fas fa-battery-full',
                quantity: 1,
                requiresPower: false,
                connectors: [
                    { type: 'power-out', position: 'right', label: 'UPS Out 1' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 2' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 3' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 4' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 5' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 6' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 7' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 8' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 9' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 10' }
                ]
            }
        ],
        connections: [
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 20, color: '#ff4757' },
            { type: 'xlr-cable', name: 'XLR Cable', icon: 'fas fa-plug', quantity: 25, color: '#00ff88' },
            { type: 'dmx-cable', name: 'DMX Cable', icon: 'fas fa-plug', quantity: 8, color: '#ffa502' },
            { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 6, color: '#00ccff' },
            { type: 'ethernet-cable', name: 'Ethernet Cable', icon: 'fas fa-plug', quantity: 1, color: '#a29bfe' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'xlr-out', to: 'xlr-in', cable: 'xlr-cable', animation: 'audio-pulse' },
            { from: 'dmx-out', to: 'dmx-in', cable: 'dmx-cable', animation: 'dmx-circle' },
            { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-pulse' },
            { from: 'ethernet-out', to: 'ethernet-in', cable: 'ethernet-cable', animation: 'network-pulse' }
        ],
        settings: [
            { type: 'audio', name: 'Audio Mixing', icon: 'fas fa-sliders-h' },
            { type: 'lighting', name: 'Lighting Control', icon: 'fas fa-lightbulb' },
            { type: 'video', name: 'Video Production', icon: 'fas fa-video' },
            { type: 'streaming', name: 'Live Streaming', icon: 'fas fa-broadcast-tower' }
        ],
        resourceRequirements: {
            'microphone': ['musician'],
            'mixing-console': ['a1-audio-tech'],
            'speaker': ['a2-audio-tech'],
            'moving-head': ['lighting-tech'],
            'dmx-controller': ['lighting-tech'],
            'camera': ['camera-operator'],
            'video-switcher': ['video-tech'],
            'streaming-encoder': ['streaming-tech'],
            'screen': ['video-tech'],
            'ups': ['stage-hand']
        },
        availableResources: [
            { id: 'musician', name: 'Musician', icon: 'fas fa-music', description: 'Band member or performer' },
            { id: 'a1-audio-tech', name: 'A1 Audio Tech', icon: 'fas fa-sliders-h', description: 'Lead audio technician' },
            { id: 'a2-audio-tech', name: 'A2 Audio Tech', icon: 'fas fa-volume-up', description: 'Assistant audio technician' },
            { id: 'lighting-tech', name: 'Lighting Tech', icon: 'fas fa-lightbulb', description: 'Lighting technician' },
            { id: 'camera-operator', name: 'Camera Operator', icon: 'fas fa-camera', description: 'Video camera operator' },
            { id: 'video-tech', name: 'Video Tech', icon: 'fas fa-video', description: 'Video technician' },
            { id: 'streaming-tech', name: 'Streaming Tech', icon: 'fas fa-broadcast-tower', description: 'Streaming technician' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Main Stage', x: '5%', y: '5%', width: '35%', height: '30%' },
                { name: 'Side Stage', x: '45%', y: '5%', width: '25%', height: '25%' },
                { name: 'FOH Position', x: '5%', y: '40%', width: '30%', height: '20%' },
                { name: 'Lighting Grid', x: '40%', y: '35%', width: '30%', height: '20%' },
                { name: 'Video Control', x: '75%', y: '10%', width: '20%', height: '25%' },
                { name: 'Power Station', x: '75%', y: '40%', width: '20%', height: '15%' },
                { name: 'Production Office', x: '75%', y: '60%', width: '20%', height: '25%' }
            ]
        }
    },
    'advanced-2': {
        title: 'Broadcast Studio Complex',
        category: 'advanced',
        difficulty: 'expert',
        description: 'Set up complete broadcast studio complex with multiple studios, control rooms, and production facilities',
        objectives: [
            'Position multiple broadcast studios and control rooms',
            'Connect advanced broadcast equipment and routing',
            'Set up multi-studio production and switching',
            'Power all broadcast equipment with redundancy',
            'Create professional broadcast complex zones'
        ],
        equipment: [
            {
                type: 'camera',
                name: 'Studio Camera A',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' },
                    { type: 'tally-in', position: 'back', label: 'Tally In' }
                ]
            },
            {
                type: 'camera',
                name: 'Studio Camera B',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' },
                    { type: 'tally-in', position: 'back', label: 'Tally In' }
                ]
            },
            {
                type: 'camera',
                name: 'Studio Camera C',
                icon: 'fas fa-video',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' },
                    { type: 'tally-in', position: 'back', label: 'Tally In' }
                ]
            },
            {
                type: 'microphone',
                name: 'Anchor Mic',
                icon: 'fas fa-microphone',
                quantity: 2,
                requiresPower: false,
                connectors: [
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'microphone',
                name: 'Guest Mic',
                icon: 'fas fa-microphone',
                quantity: 4,
                requiresPower: false,
                connectors: [
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'mixing-console',
                name: 'Broadcast Mixer',
                icon: 'fas fa-sliders-h',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 1' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 2' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 3' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 4' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 5' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 6' },
                    { type: 'xlr-out', position: 'bottom', label: 'Main Out' }
                ]
            },
            {
                type: 'video-switcher',
                name: 'Master Control Switcher',
                icon: 'fas fa-random',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 1' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 2' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 3' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 4' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 5' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 6' },
                    { type: 'hdmi-out', position: 'front', label: 'Program Out' },
                    { type: 'hdmi-out', position: 'front', label: 'Preview Out' },
                    { type: 'hdmi-out', position: 'front', label: 'Clean Out' }
                ]
            },
            {
                type: 'graphics-computer',
                name: 'Graphics Workstation',
                icon: 'fas fa-desktop',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'ethernet-out', position: 'back', label: 'Network Out' }
                ]
            },
            {
                type: 'vtr',
                name: 'Video Tape Recorder',
                icon: 'fas fa-video',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' }
                ]
            },
            {
                type: 'streaming-encoder',
                name: 'Broadcast Encoder',
                icon: 'fas fa-broadcast-tower',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'ethernet-out', position: 'back', label: 'Network Out' }
                ]
            },
            {
                type: 'screen',
                name: 'Program Monitor',
                icon: 'fas fa-tv',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'screen',
                name: 'Preview Monitor',
                icon: 'fas fa-tv',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'light-fixture',
                name: 'Studio Light',
                icon: 'fas fa-lightbulb',
                quantity: 12,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'dmx-in', position: 'back', label: 'DMX In' }
                ]
            },
            {
                type: 'dmx-controller',
                name: 'Lighting Controller',
                icon: 'fas fa-sliders-h',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'dmx-out', position: 'back', label: 'DMX Out' }
                ]
            },
            {
                type: 'ups',
                name: 'Uninterruptible Power Supply',
                icon: 'fas fa-battery-full',
                quantity: 1,
                requiresPower: false,
                connectors: [
                    { type: 'power-out', position: 'right', label: 'UPS Out 1' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 2' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 3' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 4' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 5' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 6' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 7' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 8' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 9' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 10' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 11' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 12' }
                ]
            }
        ],
        connections: [
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 25, color: '#ff4757' },
            { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 15, color: '#00ccff' },
            { type: 'xlr-cable', name: 'XLR Cable', icon: 'fas fa-plug', quantity: 8, color: '#00ff88' },
            { type: 'dmx-cable', name: 'DMX Cable', icon: 'fas fa-plug', quantity: 12, color: '#ffa502' },
            { type: 'ethernet-cable', name: 'Ethernet Cable', icon: 'fas fa-plug', quantity: 2, color: '#a29bfe' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-pulse' },
            { from: 'xlr-out', to: 'xlr-in', cable: 'xlr-cable', animation: 'audio-pulse' },
            { from: 'dmx-out', to: 'dmx-in', cable: 'dmx-cable', animation: 'dmx-circle' },
            { from: 'ethernet-out', to: 'ethernet-in', cable: 'ethernet-cable', animation: 'network-pulse' }
        ],
        settings: [
            { type: 'broadcast', name: 'Broadcast Control', icon: 'fas fa-broadcast-tower' },
            { type: 'studio', name: 'Studio Management', icon: 'fas fa-tv' },
            { type: 'lighting', name: 'Studio Lighting', icon: 'fas fa-lightbulb' },
            { type: 'audio', name: 'Audio Production', icon: 'fas fa-sliders-h' }
        ],
        resourceRequirements: {
            'camera': ['camera-operator'],
            'microphone': ['anchor'],
            'mixing-console': ['audio-tech'],
            'video-switcher': ['technical-director'],
            'graphics-computer': ['graphics-operator'],
            'vtr': ['vtr-operator'],
            'streaming-encoder': ['broadcast-tech'],
            'screen': ['technical-director'],
            'light-fixture': ['lighting-tech'],
            'dmx-controller': ['lighting-tech'],
            'ups': ['stage-hand']
        },
        availableResources: [
            { id: 'anchor', name: 'News Anchor', icon: 'fas fa-user-tie', description: 'Broadcast news anchor' },
            { id: 'camera-operator', name: 'Camera Operator', icon: 'fas fa-camera', description: 'Studio camera operator' },
            { id: 'audio-tech', name: 'Audio Tech', icon: 'fas fa-sliders-h', description: 'Broadcast audio technician' },
            { id: 'technical-director', name: 'Technical Director', icon: 'fas fa-video', description: 'Technical director' },
            { id: 'graphics-operator', name: 'Graphics Operator', icon: 'fas fa-palette', description: 'Graphics and overlay operator' },
            { id: 'vtr-operator', name: 'VTR Operator', icon: 'fas fa-video', description: 'Video tape recorder operator' },
            { id: 'broadcast-tech', name: 'Broadcast Tech', icon: 'fas fa-broadcast-tower', description: 'Broadcast technician' },
            { id: 'lighting-tech', name: 'Lighting Tech', icon: 'fas fa-lightbulb', description: 'Studio lighting technician' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' }
        ],        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Main Stage', x: '5%', y: '5%', width: '35%', height: '30%' },
                { name: 'Side Stage', x: '45%', y: '5%', width: '25%', height: '25%' },
                { name: 'FOH Position', x: '5%', y: '40%', width: '30%', height: '20%' },
                { name: 'Lighting Grid', x: '40%', y: '35%', width: '30%', height: '20%' },
                { name: 'Video Control', x: '75%', y: '10%', width: '20%', height: '25%' },
                { name: 'Power Station', x: '75%', y: '40%', width: '20%', height: '15%' },
                { name: 'Production Office', x: '75%', y: '60%', width: '20%', height: '25%' }
            ]
        }
    },
    'advanced-3': {
        title: 'Major Event Production',
        category: 'advanced',
        difficulty: 'expert',
        description: 'Set up complete major event production with multiple stages, live streaming, and global broadcast',
        objectives: [
            'Position multiple stages and production areas',
            'Connect comprehensive audio, lighting, and video systems',
            'Set up multi-platform live streaming and broadcast',
            'Power all production equipment with full redundancy',
            'Create professional major event production zones'
        ],
        equipment: [
            {
                type: 'microphone',
                name: 'Vocal Mic',
                icon: 'fas fa-microphone',
                quantity: 8,
                requiresPower: false,
                connectors: [
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'microphone',
                name: 'Instrument Mic',
                icon: 'fas fa-microphone',
                quantity: 12,
                requiresPower: false,
                connectors: [
                    { type: 'xlr-out', position: 'bottom', label: 'XLR Out' }
                ]
            },
            {
                type: 'mixing-console',
                name: 'Main Stage Mixer',
                icon: 'fas fa-sliders-h',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 1' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 2' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 3' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 4' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 5' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 6' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 7' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 8' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 9' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 10' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 11' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 12' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 13' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 14' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 15' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 16' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 17' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 18' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 19' },
                    { type: 'xlr-in', position: 'top', label: 'XLR In 20' },
                    { type: 'xlr-out', position: 'bottom', label: 'Main Out L' },
                    { type: 'xlr-out', position: 'bottom', label: 'Main Out R' },
                    { type: 'xlr-out', position: 'bottom', label: 'Monitor Out 1' },
                    { type: 'xlr-out', position: 'bottom', label: 'Monitor Out 2' },
                    { type: 'xlr-out', position: 'bottom', label: 'Monitor Out 3' },
                    { type: 'xlr-out', position: 'bottom', label: 'Monitor Out 4' }
                ]
            },
            {
                type: 'speaker',
                name: 'Main Speaker',
                icon: 'fas fa-volume-up',
                quantity: 8,
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
                quantity: 12,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'xlr-in', position: 'top', label: 'Speaker In' }
                ]
            },
            {
                type: 'moving-head',
                name: 'Moving Head Light',
                icon: 'fas fa-lightbulb',
                quantity: 16,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'dmx-in', position: 'back', label: 'DMX In' }
                ]
            },
            {
                type: 'par-light',
                name: 'PAR Light',
                icon: 'fas fa-lightbulb',
                quantity: 24,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'dmx-in', position: 'back', label: 'DMX In' }
                ]
            },
            {
                type: 'dmx-controller',
                name: 'Professional DMX Controller',
                icon: 'fas fa-sliders-h',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'dmx-out', position: 'back', label: 'DMX Out 1' },
                    { type: 'dmx-out', position: 'back', label: 'DMX Out 2' },
                    { type: 'dmx-out', position: 'back', label: 'DMX Out 3' }
                ]
            },
            {
                type: 'camera',
                name: 'Stage Camera',
                icon: 'fas fa-video',
                quantity: 6,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' }
                ]
            },
            {
                type: 'camera',
                name: 'Audience Camera',
                icon: 'fas fa-video',
                quantity: 4,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-out', position: 'back', label: 'HDMI Out' },
                    { type: 'sdi-out', position: 'back', label: 'SDI Out' }
                ]
            },
            {
                type: 'video-switcher',
                name: 'Production Switcher',
                icon: 'fas fa-random',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 1' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 2' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 3' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 4' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 5' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 6' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 7' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 8' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 9' },
                    { type: 'hdmi-in', position: 'back', label: 'Input 10' },
                    { type: 'hdmi-out', position: 'front', label: 'Program Out' },
                    { type: 'hdmi-out', position: 'front', label: 'Preview Out' },
                    { type: 'hdmi-out', position: 'front', label: 'Clean Out' }
                ]
            },
            {
                type: 'streaming-encoder',
                name: 'Multi-Platform Encoder',
                icon: 'fas fa-broadcast-tower',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'power-in', position: 'left', label: 'Power In' },
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'ethernet-out', position: 'back', label: 'Network Out' }
                ]
            },
            {
                type: 'screen',
                name: 'Video Wall',
                icon: 'fas fa-tv',
                quantity: 2,
                requiresPower: true,
                connectors: [
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'screen',
                name: 'Jumbotron',
                icon: 'fas fa-tv',
                quantity: 1,
                requiresPower: true,
                connectors: [
                    { type: 'hdmi-in', position: 'back', label: 'HDMI In' },
                    { type: 'power-in', position: 'left', label: 'Power In' }
                ]
            },
            {
                type: 'ups',
                name: 'Uninterruptible Power Supply',
                icon: 'fas fa-battery-full',
                quantity: 2,
                requiresPower: false,
                connectors: [
                    { type: 'power-out', position: 'right', label: 'UPS Out 1' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 2' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 3' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 4' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 5' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 6' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 7' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 8' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 9' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 10' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 11' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 12' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 13' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 14' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 15' },
                    { type: 'power-out', position: 'right', label: 'UPS Out 16' }
                ]
            }
        ],
        connections: [
            { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 40, color: '#ff4757' },
            { type: 'xlr-cable', name: 'XLR Cable', icon: 'fas fa-plug', quantity: 50, color: '#00ff88' },
            { type: 'dmx-cable', name: 'DMX Cable', icon: 'fas fa-plug', quantity: 40, color: '#ffa502' },
            { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 20, color: '#00ccff' },
            { type: 'ethernet-cable', name: 'Ethernet Cable', icon: 'fas fa-plug', quantity: 4, color: '#a29bfe' }
        ],
        validConnections: [
            { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
            { from: 'xlr-out', to: 'xlr-in', cable: 'xlr-cable', animation: 'audio-pulse' },
            { from: 'dmx-out', to: 'dmx-in', cable: 'dmx-cable', animation: 'dmx-circle' },
            { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-pulse' },
            { from: 'ethernet-out', to: 'ethernet-in', cable: 'ethernet-cable', animation: 'network-pulse' }
        ],
        settings: [
            { type: 'audio', name: 'Audio Production', icon: 'fas fa-sliders-h' },
            { type: 'lighting', name: 'Lighting Design', icon: 'fas fa-lightbulb' },
            { type: 'video', name: 'Video Production', icon: 'fas fa-video' },
            { type: 'streaming', name: 'Multi-Platform Streaming', icon: 'fas fa-broadcast-tower' }
        ],
        resourceRequirements: {
            'microphone': ['musician'],
            'mixing-console': ['a1-audio-tech'],
            'speaker': ['a2-audio-tech'],
            'moving-head': ['lighting-tech'],
            'par-light': ['lighting-tech'],
            'dmx-controller': ['lighting-tech'],
            'camera': ['camera-operator'],
            'video-switcher': ['technical-director'],
            'streaming-encoder': ['streaming-tech'],
            'screen': ['video-tech'],
            'ups': ['stage-hand']
        },
        availableResources: [
            { id: 'musician', name: 'Musician', icon: 'fas fa-music', description: 'Band member or performer' },
            { id: 'a1-audio-tech', name: 'A1 Audio Tech', icon: 'fas fa-sliders-h', description: 'Lead audio technician' },
            { id: 'a2-audio-tech', name: 'A2 Audio Tech', icon: 'fas fa-volume-up', description: 'Assistant audio technician' },
            { id: 'lighting-tech', name: 'Lighting Tech', icon: 'fas fa-lightbulb', description: 'Lighting technician' },
            { id: 'camera-operator', name: 'Camera Operator', icon: 'fas fa-camera', description: 'Video camera operator' },
            { id: 'technical-director', name: 'Technical Director', icon: 'fas fa-video', description: 'Technical director' },
            { id: 'streaming-tech', name: 'Streaming Tech', icon: 'fas fa-broadcast-tower', description: 'Streaming technician' },
            { id: 'video-tech', name: 'Video Tech', icon: 'fas fa-video', description: 'Video technician' },
            { id: 'stage-hand', name: 'Stage Hand', icon: 'fas fa-hard-hat', description: 'Stage setup and maintenance' }
        ],
        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Main Stage', x: '5%', y: '5%', width: '35%', height: '30%' },
                { name: 'Side Stage', x: '45%', y: '5%', width: '25%', height: '25%' },
                { name: 'FOH Position', x: '5%', y: '40%', width: '30%', height: '20%' },
                { name: 'Lighting Grid', x: '40%', y: '35%', width: '30%', height: '20%' },
                { name: 'Video Control', x: '75%', y: '10%', width: '20%', height: '25%' },
                { name: 'Power Station', x: '75%', y: '40%', width: '20%', height: '15%' },
                { name: 'Production Office', x: '75%', y: '60%', width: '20%', height: '25%' }
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
    'set-1', 'set-2', 'set-3',
    'streaming-1', 'streaming-2', 'streaming-3',
    'advanced-1', 'advanced-2', 'advanced-3'
];

// Export level categories
export const LEVEL_CATEGORIES = {
    'audio': ['audio-1', 'audio-2', 'audio-3'],
    'lighting': ['lighting-1', 'lighting-2', 'lighting-3'],
    'video': ['video-1', 'video-2', 'video-3'],
    'set': ['set-1', 'set-2', 'set-3'],
    'streaming': ['streaming-1', 'streaming-2', 'streaming-3'],
    'advanced': ['advanced-1', 'advanced-2', 'advanced-3']
};
