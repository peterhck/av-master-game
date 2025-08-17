// Helper Utilities Module
// Contains common utility functions used throughout the game

/**
 * Get connector color based on connector type
 */
export function getConnectorColor(connectorType) {
    const colors = {
        'power-in': '#ff4757',
        'power-out': '#ff4757',
        'xlr-in': '#00ff88',
        'xlr-out': '#00ff88',
        'wireless-in': '#a29bfe',
        'wireless-out': '#a29bfe',
        'dmx-in': '#ffa502',
        'dmx-out': '#ffa502',
        'hdmi-in': '#00d2d3',
        'hdmi-out': '#00d2d3',
        'ethernet-in': '#ffdd59',
        'ethernet-out': '#ffdd59'
    };
    return colors[connectorType] || '#ffffff';
}

/**
 * Calculate required connections for a level
 */
export function calculateRequiredConnections(levelData) {
    const required = {
        power: 0,
        xlr: 0,
        wireless: 0,
        ethernet: 0,
        dmx: 0,
        hdmi: 0,
        usb: 0
    };

    if (levelData.connections) {
        levelData.connections.forEach(connection => {
            switch (connection.type) {
                case 'power-cable':
                    required.power = connection.quantity;
                    break;
                case 'xlr-cable':
                    required.xlr = connection.quantity;
                    break;
                case 'wireless-cable':
                    required.wireless = connection.quantity;
                    break;
                case 'ethernet-cable':
                    required.ethernet = connection.quantity;
                    break;
                case 'dmx-cable':
                    required.dmx = connection.quantity;
                    break;
                case 'hdmi-cable':
                    required.hdmi = connection.quantity;
                    break;
                case 'usb-cable':
                    required.usb = connection.quantity;
                    break;
            }
        });
    }

    return required;
}

/**
 * Get equipment information for tooltips
 */
export function getEquipmentInfo(equipmentType, equipmentName) {
    const equipmentInfo = {
        'microphone': {
            'Wireless Vocal Mic': {
                description: 'Wireless microphone for vocal performances',
                purpose: 'Captures vocal audio and transmits it wirelessly to receivers',
                usage: 'Used by singers and speakers for hands-free operation'
            },
            'Vocal Mic': {
                description: 'Standard wired vocal microphone',
                purpose: 'Captures vocal audio with high fidelity',
                usage: 'Used by singers and speakers, requires XLR cable connection'
            },
            'Instrument Mic': {
                description: 'Microphone designed for instrument amplification',
                purpose: 'Captures acoustic instrument sounds',
                usage: 'Used for guitars, drums, pianos, and other acoustic instruments'
            }
        },
        'mixing-console': {
            'Mixing Console': {
                description: 'Basic mixing console for audio control',
                purpose: 'Combines and processes multiple audio inputs',
                usage: 'Central control unit for live sound systems'
            },
            '8-Channel Mixer': {
                description: '8-channel mixing console',
                purpose: 'Handles multiple audio sources with individual control',
                usage: 'Used for small to medium live performances'
            },
            '24-Channel Mixer': {
                description: 'Professional 24-channel mixing console',
                purpose: 'Handles complex audio setups with extensive routing',
                usage: 'Used for large productions and professional events'
            }
        },
        'speaker': {
            'Main Speaker': {
                description: 'Primary speaker for audience audio',
                purpose: 'Delivers main audio to the audience',
                usage: 'Positioned to provide even coverage to the audience'
            },
            'Monitor Speaker': {
                description: 'Stage monitor for performers',
                purpose: 'Provides audio feedback to performers on stage',
                usage: 'Helps performers hear themselves and the band'
            }
        },
        'power-distro': {
            'Power Distribution': {
                description: 'Power distribution unit',
                purpose: 'Safely distributes electrical power to multiple devices',
                usage: 'Essential for powering all electrical equipment safely'
            }
        },
        'light-fixture': {
            'Moving Head Light': {
                description: 'Automated moving light fixture',
                purpose: 'Provides dynamic lighting with movement and color control',
                usage: 'Creates dramatic lighting effects and patterns'
            },
            'LED Par Light': {
                description: 'LED par can light fixture',
                purpose: 'Provides colored lighting with energy efficiency',
                usage: 'Used for stage lighting and atmospheric effects'
            }
        },
        'dmx-controller': {
            'DMX Controller': {
                description: 'Digital lighting control system',
                purpose: 'Controls multiple lighting fixtures via DMX protocol',
                usage: 'Essential for professional lighting automation'
            }
        }
    };

    return equipmentInfo[equipmentType]?.[equipmentName] || {
        description: 'Equipment information not available',
        purpose: 'Used in live event production',
        usage: 'Follow manufacturer guidelines for proper setup'
    };
}

/**
 * Generate random position within bounds
 */
export function getRandomPosition(minX, maxX, minY, maxY) {
    return {
        x: Math.random() * (maxX - minX) + minX,
        y: Math.random() * (maxY - minY) + minY
    };
}

/**
 * Check if two elements overlap
 */
export function elementsOverlap(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}

/**
 * Debounce function for performance optimization
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance optimization
 */
export function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Deep clone an object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Save data to localStorage
 */
export function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

/**
 * Load data from localStorage
 */
export function loadFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

/**
 * Remove data from localStorage
 */
export function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}
