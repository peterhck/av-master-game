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
        ],
        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Left', x: '5%', y: '10%', width: '25%', height: '30%' },
                { name: 'Stage Right', x: '70%', y: '10%', width: '25%', height: '30%' },
                { name: 'FOH', x: '35%', y: '50%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '5%', y: '50%', width: '20%', height: '15%' }
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
        ],
        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '40%', y: '10%', width: '20%', height: '15%' },
                { name: 'Monitor Zone', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '35%', y: '55%', width: '20%', height: '15%' },
                { name: 'Wireless Zone', x: '70%', y: '10%', width: '25%', height: '25%' }
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
        ],
        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '40%', y: '10%', width: '20%', height: '15%' },
                { name: 'Monitor Zone', x: '5%', y: '55%', width: '25%', height: '20%' },
                { name: 'Power Station', x: '35%', y: '55%', width: '20%', height: '15%' },
                { name: 'Wireless Zone', x: '70%', y: '10%', width: '25%', height: '25%' }
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
        ],
        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '40%', y: '10%', width: '20%', height: '15%' },
                { name: 'Power Station', x: '5%', y: '55%', width: '20%', height: '15%' },
                { name: 'Lighting Control', x: '70%', y: '10%', width: '25%', height: '25%' }
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
        ],
        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '40%', y: '10%', width: '20%', height: '15%' },
                { name: 'Power Station', x: '5%', y: '55%', width: '20%', height: '15%' },
                { name: 'Lighting Control', x: '70%', y: '10%', width: '25%', height: '25%' }
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
        ],
        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '40%', y: '10%', width: '20%', height: '15%' },
                { name: 'Power Station', x: '5%', y: '55%', width: '20%', height: '15%' },
                { name: 'Lighting Control', x: '70%', y: '10%', width: '25%', height: '25%' }
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
        ],
        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '40%', y: '10%', width: '20%', height: '15%' },
                { name: 'Power Station', x: '5%', y: '55%', width: '20%', height: '15%' },
                { name: 'Video Control', x: '70%', y: '10%', width: '25%', height: '25%' },
                { name: 'Presenter Area', x: '40%', y: '30%', width: '20%', height: '15%' }
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
        ],
        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '40%', y: '10%', width: '20%', height: '15%' },
                { name: 'Power Station', x: '5%', y: '55%', width: '20%', height: '15%' },
                { name: 'Video Control', x: '70%', y: '10%', width: '25%', height: '25%' },
                { name: 'Camera Position 1', x: '35%', y: '5%', width: '15%', height: '15%' },
                { name: 'Camera Position 2', x: '50%', y: '5%', width: '15%', height: '15%' },
                { name: 'Camera Position 3', x: '65%', y: '5%', width: '15%', height: '15%' }
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
        ],
        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '40%', y: '10%', width: '20%', height: '15%' },
                { name: 'Power Station', x: '5%', y: '55%', width: '20%', height: '15%' },
                { name: 'Video Control', x: '70%', y: '10%', width: '25%', height: '25%' },
                { name: 'Camera Position A', x: '30%', y: '5%', width: '12%', height: '12%' },
                { name: 'Camera Position B', x: '45%', y: '5%', width: '12%', height: '12%' },
                { name: 'Robotic Camera', x: '60%', y: '5%', width: '12%', height: '12%' },
                { name: 'Graphics Station', x: '75%', y: '40%', width: '20%', height: '15%' }
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
        ],
        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '40%', y: '10%', width: '20%', height: '15%' },
                { name: 'Storage Area', x: '5%', y: '55%', width: '20%', height: '15%' },
                { name: 'Set Control', x: '70%', y: '10%', width: '25%', height: '25%' }
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
        ],
        stageSetup: {
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '40%', y: '10%', width: '20%', height: '15%' },
                { name: 'Storage Area', x: '5%', y: '55%', width: '20%', height: '15%' },
                { name: 'Set Control', x: '70%', y: '10%', width: '25%', height: '25%' }
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
            width: '100%',
            height: '100%',
            zones: [
                { name: 'Stage Front', x: '5%', y: '5%', width: '25%', height: '20%' },
                { name: 'Stage Back', x: '5%', y: '30%', width: '25%', height: '20%' },
                { name: 'FOH Position', x: '40%', y: '10%', width: '20%', height: '15%' },
                { name: 'Storage Area', x: '5%', y: '55%', width: '20%', height: '15%' },
                { name: 'Set Control', x: '70%', y: '10%', width: '25%', height: '25%' }
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
