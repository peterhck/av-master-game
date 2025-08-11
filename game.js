// AV Master Game - Main JavaScript File
class AVMasterGame {
    constructor() {
        this.currentScreen = 'loading';
        this.currentLevel = null;
        this.gameState = {
            score: 0,
            lives: 3,
            time: 0,
            completedLevels: [],
            unlockedLevels: ['audio-1']
        };
        this.gameTimer = null;
        this.draggedElement = null;
        this.selectedEquipment = null;
        this.connections = [];
        this.equipment = [];
        this.connectionMode = false;
        this.selectedConnector = null;
        this.connectionLines = [];
        this.successfulConnections = 0;
        this.totalRequiredConnections = 0;

        // Progress tracking
        this.connectionProgress = {
            power: { current: 0, required: 0 },
            xlr: { current: 0, required: 0 },
            wireless: { current: 0, required: 0 },
            ethernet: { current: 0, required: 0 },
            dmx: { current: 0, required: 0 }
        };

        // Audio context for sound effects and real audio
        this.audioContext = null;
        this.microphoneStream = null;
        this.audioAnalyser = null;
        this.audioSource = null;
        this.isAudioActive = false;
        this.audioAnimationFrame = null;

        this.initAudio();
        this.init();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioAnalyser = this.audioContext.createAnalyser();
            this.audioAnalyser.fftSize = 256;
        } catch (e) {
            console.log('Audio context not supported');
        }
    }

    async requestMicrophoneAccess() {
        try {
            this.microphoneStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
            return true;
        } catch (error) {
            console.log('Microphone access denied:', error);
            return false;
        }
    }

    async startRealAudio() {
        if (!this.audioContext || !this.microphoneStream) return;

        try {
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.audioSource = this.audioContext.createMediaStreamSource(this.microphoneStream);
            this.audioSource.connect(this.audioAnalyser);
            this.audioAnalyser.connect(this.audioContext.destination);

            this.isAudioActive = true;
            this.animateAudioOutput();

            this.showMessage('🎤 Microphone active! Speak into your mic to test the system.', 'success');
        } catch (error) {
            console.log('Error starting real audio:', error);
        }
    }

    stopRealAudio() {
        if (this.audioAnimationFrame) {
            cancelAnimationFrame(this.audioAnimationFrame);
            this.audioAnimationFrame = null;
        }

        if (this.audioSource) {
            this.audioSource.disconnect();
            this.audioSource = null;
        }

        this.isAudioActive = false;
    }

    animateAudioOutput() {
        if (!this.isAudioActive || !this.audioAnalyser) return;

        const bufferLength = this.audioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.audioAnalyser.getByteFrequencyData(dataArray);

        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;

        // Animate speakers based on audio level
        this.animateSpeakers(average);

        // Continue animation
        this.audioAnimationFrame = requestAnimationFrame(() => this.animateAudioOutput());
    }

    animateSpeakers(audioLevel) {
        const speakers = this.equipment.filter(eq => eq.dataset.type === 'speaker');

        speakers.forEach(speaker => {
            const intensity = audioLevel / 255; // Normalize to 0-1
            const glowIntensity = Math.max(0.2, intensity);

            speaker.style.boxShadow = `0 0 ${20 + intensity * 40}px rgba(0, 255, 136, ${glowIntensity})`;

            // Add pulsing effect based on audio
            if (intensity > 0.3) {
                speaker.style.transform = `scale(${1 + intensity * 0.1})`;
            } else {
                speaker.style.transform = 'scale(1)';
            }
        });
    }

    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playCorrectSound() {
        this.playSound(800, 0.2, 'sine');
        setTimeout(() => this.playSound(1000, 0.2, 'sine'), 100);
    }

    playWrongSound() {
        this.playSound(200, 0.3, 'sawtooth');
        setTimeout(() => this.playSound(150, 0.3, 'sawtooth'), 150);
    }

    init() {
        this.loadGameState();
        this.setupEventListeners();
        this.showLoadingScreen();
        this.loadLevelData();
    }

    setupEventListeners() {
        // Main menu events
        document.getElementById('start-game').addEventListener('click', () => this.showLevelSelect());
        document.getElementById('continue-game').addEventListener('click', () => this.showLevelSelect());
        document.getElementById('tutorial').addEventListener('click', () => this.showTutorial());
        document.getElementById('settings').addEventListener('click', () => this.showSettings());

        // Level selection events
        document.getElementById('back-to-menu').addEventListener('click', () => this.showMainMenu());
        document.querySelectorAll('.level-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectLevel(e.currentTarget.dataset.level));
        });

        // Game play events
        document.getElementById('pause-game').addEventListener('click', () => this.pauseGame());
        document.getElementById('test-setup').addEventListener('click', () => this.testSetup());
        document.getElementById('reset-level').addEventListener('click', () => this.resetLevel());
        document.getElementById('hint').addEventListener('click', () => this.showHint());
        document.getElementById('detailed-hint').addEventListener('click', () => this.showDetailedHint());

        // Pause menu events
        document.getElementById('resume-game').addEventListener('click', () => this.resumeGame());
        document.getElementById('restart-level').addEventListener('click', () => this.restartLevel());
        document.getElementById('exit-to-menu').addEventListener('click', () => this.exitToMenu());

        // Level complete events
        document.getElementById('next-level').addEventListener('click', () => this.nextLevel());
        document.getElementById('replay-level').addEventListener('click', () => this.replayLevel());
        document.getElementById('level-select-btn').addEventListener('click', () => this.showLevelSelect());

        // Tutorial events
        document.getElementById('close-tutorial').addEventListener('click', () => this.closeTutorial());
        document.getElementById('next-tutorial').addEventListener('click', () => this.nextTutorialStep());
        document.getElementById('prev-tutorial').addEventListener('click', () => this.prevTutorialStep());
        document.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', (e) => this.goToTutorialStep(parseInt(e.target.dataset.step)));
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    showLoadingScreen() {
        this.switchScreen('loading-screen');
        setTimeout(() => {
            this.showMainMenu();
        }, 3000);
    }

    showMainMenu() {
        this.switchScreen('main-menu');
        this.updatePlayerStats();
    }

    showLevelSelect() {
        this.switchScreen('level-select');
        this.updateLevelStatus();
    }

    switchScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    updatePlayerStats() {
        document.getElementById('total-score').textContent = this.gameState.score;
        document.getElementById('level-completed').textContent = this.gameState.completedLevels.length;
    }

    updateLevelStatus() {
        document.querySelectorAll('.level-card').forEach(card => {
            const levelId = card.dataset.level;
            const status = card.querySelector('.level-status');

            if (this.gameState.completedLevels.includes(levelId)) {
                card.classList.add('completed');
                status.innerHTML = '<i class="fas fa-check"></i>';
                status.classList.add('completed');
            } else if (this.gameState.unlockedLevels.includes(levelId)) {
                card.classList.add('unlocked');
                status.innerHTML = '<i class="fas fa-play"></i>';
                status.classList.add('unlocked');
            } else {
                card.classList.remove('unlocked', 'completed');
                status.innerHTML = '<i class="fas fa-lock"></i>';
                status.classList.remove('unlocked', 'completed');
            }
        });
    }

    selectLevel(levelId) {
        // Allow access to both unlocked and completed levels
        if (!this.gameState.unlockedLevels.includes(levelId) && !this.gameState.completedLevels.includes(levelId)) {
            this.showMessage('This level is locked! Complete previous levels to unlock it.', 'error');
            return;
        }

        this.currentLevel = levelId;
        this.loadLevel(levelId);
        this.switchScreen('game-play');
        this.startGameTimer();
    }

    loadLevel(levelId) {
        const levelData = this.getLevelData(levelId);
        if (!levelData) return;

        // Update level title
        document.getElementById('current-level-title').textContent = levelData.title;

        // Clear previous level
        this.clearStage();

        // Setup stage
        this.setupStage(levelData);

        // Setup toolbar
        this.setupToolbar(levelData);

        // Reset game state
        this.gameState.lives = 3;
        this.gameState.time = 0;
        this.successfulConnections = 0;
        this.totalRequiredConnections = this.calculateRequiredConnections(levelData);

        // Initialize progress tracking
        this.updateConnectionProgress();

        this.updateGameStats();
    }

    getLevelData(levelId) {
        const levelData = {
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
            'set-1': {
                title: 'Basic Set Design',
                category: 'set',
                difficulty: 'beginner',
                description: 'Design simple stage layouts and props',
                objectives: [
                    'Place basic stage elements',
                    'Create a simple backdrop',
                    'Position props for optimal visibility'
                ],
                equipment: [
                    {
                        type: 'backdrop',
                        name: 'Stage Backdrop',
                        icon: 'fas fa-image',
                        quantity: 1,
                        connectors: []
                    },
                    {
                        type: 'prop',
                        name: 'Stage Prop',
                        icon: 'fas fa-cube',
                        quantity: 3,
                        connectors: []
                    },
                    {
                        type: 'curtain',
                        name: 'Stage Curtain',
                        icon: 'fas fa-theater-masks',
                        quantity: 2,
                        connectors: []
                    }
                ],
                connections: [],
                validConnections: [],
                settings: [
                    { type: 'position', name: 'Position', icon: 'fas fa-arrows-alt' },
                    { type: 'rotation', name: 'Rotation', icon: 'fas fa-redo' },
                    { type: 'scale', name: 'Scale', icon: 'fas fa-expand-arrows-alt' }
                ]
            },
            'lighting-2': {
                title: 'Advanced Lighting Setup',
                category: 'lighting',
                difficulty: 'intermediate',
                description: 'Set up complex lighting systems with multiple fixtures and effects',
                objectives: [
                    'Configure multiple lighting fixtures',
                    'Set up DMX control system',
                    'Create lighting effects and patterns',
                    'Coordinate with audio system'
                ],
                equipment: [
                    {
                        type: 'light-fixture',
                        name: 'Moving Head Light',
                        icon: 'fas fa-lightbulb',
                        quantity: 2,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' },
                            { type: 'dmx-in', position: 'top', label: 'DMX In' },
                            { type: 'dmx-out', position: 'bottom', label: 'DMX Out' }
                        ]
                    },
                    {
                        type: 'light-fixture',
                        name: 'LED Par Light',
                        icon: 'fas fa-lightbulb',
                        quantity: 4,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' },
                            { type: 'dmx-in', position: 'top', label: 'DMX In' }
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
                            { type: 'dmx-out', position: 'bottom', label: 'DMX Out' }
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
                            { type: 'power-out', position: 'right', label: 'Power Out 6' },
                            { type: 'power-out', position: 'right', label: 'Power Out 7' }
                        ]
                    }
                ],
                connections: [
                    { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 7, color: '#ff4757' },
                    { type: 'dmx-cable', name: 'DMX Cable', icon: 'fas fa-plug', quantity: 6, color: '#ffa502' }
                ],
                validConnections: [
                    { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
                    { from: 'dmx-out', to: 'dmx-in', cable: 'dmx-cable', animation: 'dmx-pulse' }
                ],
                settings: [
                    { type: 'intensity', name: 'Intensity', icon: 'fas fa-sliders-h' },
                    { type: 'color', name: 'Color', icon: 'fas fa-palette' },
                    { type: 'pattern', name: 'Pattern', icon: 'fas fa-magic' }
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
            'lighting-3': {
                title: 'Professional Lighting System',
                category: 'lighting',
                difficulty: 'advanced',
                description: 'Master complex lighting systems with advanced effects and automation',
                objectives: [
                    'Set up automated lighting sequences',
                    'Configure advanced DMX programming',
                    'Create synchronized light shows',
                    'Integrate with audio and video systems'
                ],
                equipment: [
                    {
                        type: 'light-fixture',
                        name: 'Intelligent Moving Head',
                        icon: 'fas fa-lightbulb',
                        quantity: 3,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' },
                            { type: 'dmx-in', position: 'top', label: 'DMX In' },
                            { type: 'dmx-out', position: 'bottom', label: 'DMX Out' }
                        ]
                    },
                    {
                        type: 'light-fixture',
                        name: 'Laser Effect',
                        icon: 'fas fa-lightbulb',
                        quantity: 2,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' },
                            { type: 'dmx-in', position: 'top', label: 'DMX In' }
                        ]
                    },
                    {
                        type: 'dmx-controller',
                        name: 'Advanced DMX Controller',
                        icon: 'fas fa-sliders-h',
                        quantity: 1,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' },
                            { type: 'dmx-out', position: 'bottom', label: 'DMX Out' }
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
                    { type: 'dmx-cable', name: 'DMX Cable', icon: 'fas fa-plug', quantity: 5, color: '#ffa502' }
                ],
                validConnections: [
                    { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
                    { from: 'dmx-out', to: 'dmx-in', cable: 'dmx-cable', animation: 'dmx-pulse' }
                ],
                settings: [
                    { type: 'intensity', name: 'Intensity', icon: 'fas fa-sliders-h' },
                    { type: 'color', name: 'Color', icon: 'fas fa-palette' },
                    { type: 'pattern', name: 'Pattern', icon: 'fas fa-magic' },
                    { type: 'automation', name: 'Automation', icon: 'fas fa-robot' }
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
            'video-1': {
                title: 'Basic Video Setup',
                category: 'video',
                difficulty: 'beginner',
                description: 'Learn to set up basic video projection and display systems',
                objectives: [
                    'Connect video sources to displays',
                    'Set up basic projection system',
                    'Configure video routing',
                    'Power all video equipment'
                ],
                equipment: [
                    {
                        type: 'video-source',
                        name: 'Video Player',
                        icon: 'fas fa-play',
                        quantity: 1,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' },
                            { type: 'hdmi-out', position: 'bottom', label: 'HDMI Out' }
                        ]
                    },
                    {
                        type: 'video-display',
                        name: 'Projector',
                        icon: 'fas fa-tv',
                        quantity: 1,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' },
                            { type: 'hdmi-in', position: 'top', label: 'HDMI In' }
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
                    { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 2, color: '#ff4757' },
                    { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 1, color: '#00d2d3' }
                ],
                validConnections: [
                    { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
                    { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-signal' }
                ],
                settings: [
                    { type: 'resolution', name: 'Resolution', icon: 'fas fa-expand' },
                    { type: 'brightness', name: 'Brightness', icon: 'fas fa-sun' }
                ],
                stageSetup: {
                    width: 800,
                    height: 600,
                    zones: [
                        { name: 'Video Source', x: 100, y: 200, width: 150, height: 100 },
                        { name: 'Projection Area', x: 550, y: 200, width: 200, height: 150 },
                        { name: 'Power Station', x: 50, y: 400, width: 80, height: 80 }
                    ]
                }
            },
            'video-2': {
                title: 'Multi-Display Video System',
                category: 'video',
                difficulty: 'intermediate',
                description: 'Set up complex multi-display video systems with switching',
                objectives: [
                    'Configure multiple video displays',
                    'Set up video switching system',
                    'Create video routing matrix',
                    'Synchronize multiple video sources'
                ],
                equipment: [
                    {
                        type: 'video-source',
                        name: 'Video Player',
                        icon: 'fas fa-play',
                        quantity: 2,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' },
                            { type: 'hdmi-out', position: 'bottom', label: 'HDMI Out' }
                        ]
                    },
                    {
                        type: 'video-switcher',
                        name: 'Video Switcher',
                        icon: 'fas fa-exchange-alt',
                        quantity: 1,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' },
                            { type: 'hdmi-in', position: 'top', label: 'HDMI In 1' },
                            { type: 'hdmi-in', position: 'top', label: 'HDMI In 2' },
                            { type: 'hdmi-out', position: 'bottom', label: 'HDMI Out 1' },
                            { type: 'hdmi-out', position: 'bottom', label: 'HDMI Out 2' }
                        ]
                    },
                    {
                        type: 'video-display',
                        name: 'LED Display',
                        icon: 'fas fa-tv',
                        quantity: 2,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' },
                            { type: 'hdmi-in', position: 'top', label: 'HDMI In' }
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
                    { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 6, color: '#00d2d3' }
                ],
                validConnections: [
                    { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
                    { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-signal' }
                ],
                settings: [
                    { type: 'resolution', name: 'Resolution', icon: 'fas fa-expand' },
                    { type: 'brightness', name: 'Brightness', icon: 'fas fa-sun' },
                    { type: 'switching', name: 'Switching', icon: 'fas fa-exchange-alt' }
                ],
                stageSetup: {
                    width: 800,
                    height: 600,
                    zones: [
                        { name: 'Video Sources', x: 100, y: 200, width: 200, height: 150 },
                        { name: 'Display Area', x: 500, y: 200, width: 200, height: 150 },
                        { name: 'Power Station', x: 50, y: 400, width: 80, height: 80 }
                    ]
                }
            },
            'video-3': {
                title: 'Advanced Video Production',
                category: 'video',
                difficulty: 'advanced',
                description: 'Master complex video production systems with live streaming',
                objectives: [
                    'Set up live video streaming system',
                    'Configure advanced video processing',
                    'Create multi-camera production setup',
                    'Integrate with audio and lighting systems'
                ],
                equipment: [
                    {
                        type: 'video-camera',
                        name: 'HD Camera',
                        icon: 'fas fa-video',
                        quantity: 3,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' },
                            { type: 'hdmi-out', position: 'bottom', label: 'HDMI Out' }
                        ]
                    },
                    {
                        type: 'video-mixer',
                        name: 'Video Mixer',
                        icon: 'fas fa-sliders-h',
                        quantity: 1,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' },
                            { type: 'hdmi-in', position: 'top', label: 'HDMI In 1' },
                            { type: 'hdmi-in', position: 'top', label: 'HDMI In 2' },
                            { type: 'hdmi-in', position: 'top', label: 'HDMI In 3' },
                            { type: 'hdmi-out', position: 'bottom', label: 'HDMI Out' }
                        ]
                    },
                    {
                        type: 'video-display',
                        name: 'Large LED Wall',
                        icon: 'fas fa-tv',
                        quantity: 1,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' },
                            { type: 'hdmi-in', position: 'top', label: 'HDMI In' }
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
                    { type: 'hdmi-cable', name: 'HDMI Cable', icon: 'fas fa-plug', quantity: 4, color: '#00d2d3' }
                ],
                validConnections: [
                    { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' },
                    { from: 'hdmi-out', to: 'hdmi-in', cable: 'hdmi-cable', animation: 'video-signal' }
                ],
                settings: [
                    { type: 'resolution', name: 'Resolution', icon: 'fas fa-expand' },
                    { type: 'brightness', name: 'Brightness', icon: 'fas fa-sun' },
                    { type: 'mixing', name: 'Video Mixing', icon: 'fas fa-sliders-h' },
                    { type: 'streaming', name: 'Streaming', icon: 'fas fa-broadcast-tower' }
                ],
                stageSetup: {
                    width: 800,
                    height: 600,
                    zones: [
                        { name: 'Camera Area', x: 100, y: 200, width: 200, height: 150 },
                        { name: 'Display Area', x: 500, y: 200, width: 200, height: 150 },
                        { name: 'Power Station', x: 50, y: 400, width: 80, height: 80 }
                    ]
                }
            },
            'set-2': {
                title: 'Advanced Set Design',
                category: 'set',
                difficulty: 'intermediate',
                description: 'Create complex stage designs with multiple elements and effects',
                objectives: [
                    'Design multi-level stage layouts',
                    'Create atmospheric effects',
                    'Coordinate set elements with lighting',
                    'Build modular stage components'
                ],
                equipment: [
                    {
                        type: 'backdrop',
                        name: 'Multi-Layer Backdrop',
                        icon: 'fas fa-image',
                        quantity: 2,
                        connectors: []
                    },
                    {
                        type: 'prop',
                        name: 'Stage Prop',
                        icon: 'fas fa-cube',
                        quantity: 5,
                        connectors: []
                    },
                    {
                        type: 'curtain',
                        name: 'Stage Curtain',
                        icon: 'fas fa-theater-masks',
                        quantity: 3,
                        connectors: []
                    },
                    {
                        type: 'effect',
                        name: 'Fog Machine',
                        icon: 'fas fa-smog',
                        quantity: 1,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' }
                        ]
                    }
                ],
                connections: [
                    { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 1, color: '#ff4757' }
                ],
                validConnections: [
                    { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' }
                ],
                settings: [
                    { type: 'position', name: 'Position', icon: 'fas fa-arrows-alt' },
                    { type: 'rotation', name: 'Rotation', icon: 'fas fa-redo' },
                    { type: 'scale', name: 'Scale', icon: 'fas fa-expand-arrows-alt' },
                    { type: 'effects', name: 'Effects', icon: 'fas fa-magic' }
                ],
                stageSetup: {
                    width: 800,
                    height: 600,
                    zones: [
                        { name: 'Stage Left', x: 100, y: 200, width: 200, height: 150 },
                        { name: 'Stage Right', x: 500, y: 200, width: 200, height: 150 },
                        { name: 'Backstage', x: 350, y: 400, width: 100, height: 100 }
                    ]
                }
            },
            'set-3': {
                title: 'Professional Stage Production',
                category: 'set',
                difficulty: 'advanced',
                description: 'Master complex stage productions with full integration',
                objectives: [
                    'Create complete stage productions',
                    'Integrate all technical systems',
                    'Design immersive environments',
                    'Coordinate complex stage movements'
                ],
                equipment: [
                    {
                        type: 'backdrop',
                        name: 'Dynamic Backdrop',
                        icon: 'fas fa-image',
                        quantity: 3,
                        connectors: []
                    },
                    {
                        type: 'prop',
                        name: 'Stage Prop',
                        icon: 'fas fa-cube',
                        quantity: 8,
                        connectors: []
                    },
                    {
                        type: 'curtain',
                        name: 'Stage Curtain',
                        icon: 'fas fa-theater-masks',
                        quantity: 4,
                        connectors: []
                    },
                    {
                        type: 'effect',
                        name: 'Fog Machine',
                        icon: 'fas fa-smog',
                        quantity: 2,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' }
                        ]
                    },
                    {
                        type: 'effect',
                        name: 'Bubble Machine',
                        icon: 'fas fa-bubbles',
                        quantity: 1,
                        requiresPower: true,
                        connectors: [
                            { type: 'power-in', position: 'left', label: 'Power In' }
                        ]
                    }
                ],
                connections: [
                    { type: 'power-cable', name: 'Power Cable', icon: 'fas fa-plug', quantity: 3, color: '#ff4757' }
                ],
                validConnections: [
                    { from: 'power-out', to: 'power-in', cable: 'power-cable', animation: 'power-glow' }
                ],
                settings: [
                    { type: 'position', name: 'Position', icon: 'fas fa-arrows-alt' },
                    { type: 'rotation', name: 'Rotation', icon: 'fas fa-redo' },
                    { type: 'scale', name: 'Scale', icon: 'fas fa-expand-arrows-alt' },
                    { type: 'effects', name: 'Effects', icon: 'fas fa-magic' },
                    { type: 'automation', name: 'Automation', icon: 'fas fa-robot' }
                ],
                stageSetup: {
                    width: 800,
                    height: 600,
                    zones: [
                        { name: 'Stage Left', x: 100, y: 200, width: 200, height: 150 },
                        { name: 'Stage Right', x: 500, y: 200, width: 200, height: 150 },
                        { name: 'Backstage', x: 350, y: 400, width: 100, height: 100 },
                        { name: 'Effects Area', x: 50, y: 400, width: 80, height: 80 }
                    ]
                }
            }
        };

        return levelData[levelId];
    }

    setupStage(levelData) {
        const stageArea = document.getElementById('stage-area');
        stageArea.style.width = levelData.stageSetup?.width + 'px' || '800px';
        stageArea.style.height = levelData.stageSetup?.height + 'px' || '600px';

        // Add stage zones if defined
        if (levelData.stageSetup?.zones) {
            levelData.stageSetup.zones.forEach(zone => {
                const zoneElement = document.createElement('div');
                zoneElement.className = 'stage-zone';
                zoneElement.style.position = 'absolute';
                zoneElement.style.left = zone.x + 'px';
                zoneElement.style.top = zone.y + 'px';
                zoneElement.style.width = zone.width + 'px';
                zoneElement.style.height = zone.height + 'px';
                zoneElement.style.border = '2px dashed rgba(255, 255, 255, 0.3)';
                zoneElement.style.borderRadius = '10px';
                zoneElement.style.display = 'flex';
                zoneElement.style.alignItems = 'center';
                zoneElement.style.justifyContent = 'center';
                zoneElement.style.color = 'rgba(255, 255, 255, 0.5)';
                zoneElement.style.fontSize = '0.9rem';
                zoneElement.textContent = zone.name;
                stageArea.appendChild(zoneElement);
            });
        }
    }

    setupToolbar(levelData) {
        this.setupEquipmentTools(levelData.equipment);
        this.setupSettingsTools(levelData.settings);
    }

    setupEquipmentTools(equipment) {
        const container = document.getElementById('equipment-tools');
        container.innerHTML = '';

        equipment.forEach(item => {
            for (let i = 0; i < item.quantity; i++) {
                const toolElement = document.createElement('div');
                toolElement.className = 'tool-item';
                toolElement.draggable = true;
                toolElement.dataset.type = item.type;
                toolElement.dataset.name = item.name;
                toolElement.dataset.index = i;

                toolElement.innerHTML = `
                    <i class="${item.icon}"></i>
                    <span>${item.name} ${item.quantity > 1 ? (i + 1) : ''}</span>
                `;

                toolElement.addEventListener('dragstart', (e) => this.handleDragStart(e));
                container.appendChild(toolElement);
            }
        });
    }

    setupConnectionTools(connections) {
        // Connection tools are now handled by equipment connectors
        // This method is kept for future use if needed
    }

    setupSettingsTools(settings) {
        const container = document.getElementById('settings-tools');
        container.innerHTML = '';

        settings.forEach(item => {
            const toolElement = document.createElement('div');
            toolElement.className = 'tool-item';
            toolElement.dataset.type = item.type;
            toolElement.dataset.name = item.name;

            toolElement.innerHTML = `
                <i class="${item.icon}"></i>
                <span>${item.name}</span>
            `;

            toolElement.addEventListener('click', () => this.openSettings(item));
            container.appendChild(toolElement);
        });
    }

    handleDragStart(e) {
        this.draggedElement = e.target;
        e.dataTransfer.setData('text/plain', '');
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDrop(e) {
        e.preventDefault();
        if (!this.draggedElement) return;

        const stageArea = document.getElementById('stage-area');
        const rect = stageArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.placeEquipment(this.draggedElement, x, y);
        this.draggedElement = null;
    }

    placeEquipment(toolElement, x, y) {
        const equipmentElement = document.createElement('div');
        equipmentElement.className = 'equipment';

        // Position equipment exactly at mouse position (top-left corner)
        equipmentElement.style.left = x + 'px';
        equipmentElement.style.top = y + 'px';
        equipmentElement.dataset.type = toolElement.dataset.type;
        equipmentElement.dataset.name = toolElement.dataset.name;

        // Get equipment data for connectors
        const levelData = this.getLevelData(this.currentLevel);
        const equipmentData = levelData.equipment.find(eq => eq.type === toolElement.dataset.type);

        equipmentElement.innerHTML = `
            <div class="equipment-icon">
                <i class="${toolElement.querySelector('i').className}"></i>
            </div>
            <div class="equipment-label">${toolElement.dataset.name}</div>
            <div class="equipment-help" title="Click for equipment information">
                <i class="fas fa-question-circle"></i>
            </div>
            ${this.createConnectorsHTML(equipmentData?.connectors || [])}
        `;

        equipmentElement.addEventListener('click', () => this.selectEquipment(equipmentElement));
        equipmentElement.addEventListener('dblclick', () => this.openEquipmentSettings(equipmentElement));

        // Add help button event listener
        const helpButton = equipmentElement.querySelector('.equipment-help');
        helpButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showEquipmentInfo(toolElement.dataset.type, toolElement.dataset.name);
        });

        // Make equipment draggable
        this.makeEquipmentDraggable(equipmentElement);

        // UNIVERSAL CONNECTOR SETUP - Works for ALL equipment types
        equipmentElement.querySelectorAll('.connector').forEach(connector => {
            console.log('Setting up UNIVERSAL connector for:', connector.dataset.type, 'on equipment:', equipmentElement.dataset.type);

            // UNIVERSAL CONNECTOR STYLING with extreme high priority to override equipment animations
            connector.style.cssText = `
                position: absolute !important;
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 99999 !important;
                border: 2px solid transparent !important;
                border-radius: 50% !important;
                transition: all 0.3s ease !important;
                transform: none !important;
                background: transparent !important;
                width: 30px !important;
                height: 30px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            `;

            // Add multiple event listeners with different approaches
            const clickHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                e.stopImmediatePropagation();
                console.log('UNIVERSAL CONNECTOR CLICKED:', connector.dataset.type, 'on', equipmentElement.dataset.type);
                this.handleConnectorClick(connector, equipmentElement);
            };

            const mousedownHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                e.stopImmediatePropagation();
                console.log('UNIVERSAL CONNECTOR MOUSEDOWN:', connector.dataset.type, 'on', equipmentElement.dataset.type);
            };

            const mouseenterHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                connector.style.zIndex = '100000';
                connector.style.transform = 'scale(1.3)';
                connector.style.border = '3px solid #00ff88';
                connector.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.8)';
                console.log('UNIVERSAL CONNECTOR HOVER ENTER:', connector.dataset.type, 'on', equipmentElement.dataset.type);
            };

            const mouseleaveHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                connector.style.zIndex = '99999';
                connector.style.transform = 'scale(1)';
                connector.style.border = '2px solid transparent';
                connector.style.boxShadow = '';
                console.log('UNIVERSAL CONNECTOR HOVER LEAVE:', connector.dataset.type, 'on', equipmentElement.dataset.type);
            };

            // Add multiple event listeners with capture phase
            connector.addEventListener('click', clickHandler, true);
            connector.addEventListener('mousedown', mousedownHandler, true);
            connector.addEventListener('mouseenter', mouseenterHandler, true);
            connector.addEventListener('mouseleave', mouseleaveHandler, true);

            // Add backup event listeners
            connector.onclick = clickHandler;
            connector.onmousedown = mousedownHandler;
            connector.onmouseenter = mouseenterHandler;
            connector.onmouseleave = mouseleaveHandler;

            // UNIVERSAL DOT SETUP with extreme high priority
            const connectorDot = connector.querySelector('.connector-dot');
            if (connectorDot) {
                connectorDot.style.cssText = `
                    width: 16px !important;
                    height: 16px !important;
                    background: #00ff88 !important;
                    border: 3px solid white !important;
                    border-radius: 50% !important;
                    box-shadow: 0 0 10px rgba(0, 255, 136, 0.6) !important;
                    transition: all 0.3s ease !important;
                    cursor: pointer !important;
                    pointer-events: auto !important;
                    z-index: 100001 !important;
                    position: relative !important;
                `;

                const dotClickHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('UNIVERSAL DOT CLICKED:', connector.dataset.type, 'on', equipmentElement.dataset.type);
                    this.handleConnectorClick(connector, equipmentElement);
                };

                const dotMousedownHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('UNIVERSAL DOT MOUSEDOWN:', connector.dataset.type, 'on', equipmentElement.dataset.type);
                };

                const dotMouseenterHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    connectorDot.style.transform = 'scale(1.4)';
                    connectorDot.style.boxShadow = '0 0 15px rgba(0, 255, 136, 1)';
                    console.log('UNIVERSAL DOT HOVER ENTER:', connector.dataset.type, 'on', equipmentElement.dataset.type);
                };

                const dotMouseleaveHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    connectorDot.style.transform = 'scale(1)';
                    connectorDot.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.6)';
                    console.log('UNIVERSAL DOT HOVER LEAVE:', connector.dataset.type, 'on', equipmentElement.dataset.type);
                };

                // Add multiple event listeners for dot
                connectorDot.addEventListener('click', dotClickHandler, true);
                connectorDot.addEventListener('mousedown', dotMousedownHandler, true);
                connectorDot.addEventListener('mouseenter', dotMouseenterHandler, true);
                connectorDot.addEventListener('mouseleave', dotMouseleaveHandler, true);

                // Add backup event listeners for dot
                connectorDot.onclick = dotClickHandler;
                connectorDot.onmousedown = dotMousedownHandler;
                connectorDot.onmouseenter = dotMouseenterHandler;
                connectorDot.onmouseleave = dotMouseleaveHandler;
            }

            // EQUIPMENT-SPECIFIC ENHANCEMENTS
            // MIXER USES UNIVERSAL RULES - NO SPECIAL ENHANCEMENTS
            if (equipmentElement.dataset.type === 'speaker') {
                console.log('Adding SPEAKER-SPECIFIC enhancements for:', connector.dataset.type);
                connector.style.zIndex = '75';
                if (connectorDot) connectorDot.style.zIndex = '85';
            } else if (equipmentElement.dataset.type === 'mic-receiver') {
                console.log('Adding RECEIVER-SPECIFIC enhancements for:', connector.dataset.type);
                connector.style.zIndex = '70';
                if (connectorDot) connectorDot.style.zIndex = '80';
            } else if (equipmentElement.dataset.type === 'microphone') {
                console.log('Adding MICROPHONE-SPECIFIC enhancements for:', connector.dataset.type);
                connector.style.zIndex = '65';
                if (connectorDot) connectorDot.style.zIndex = '75';
            } else if (equipmentElement.dataset.type === 'power-distro') {
                console.log('Adding POWER-DISTRO-SPECIFIC enhancements for:', connector.dataset.type);
                connector.style.zIndex = '60';
                if (connectorDot) connectorDot.style.zIndex = '70';
            }

            console.log('UNIVERSAL connector setup complete for:', connector.dataset.type, 'on', equipmentElement.dataset.type);
        });

        document.getElementById('stage-area').appendChild(equipmentElement);
        this.equipment.push(equipmentElement);

        // Make equipment draggable with boundary constraints
        this.makeEquipmentDraggable(equipmentElement);

        // Remove from toolbar
        toolElement.remove();

        // Award points for equipment placement
        this.awardPoints(50, 'Equipment placed correctly');

        // Debug: Log connector setup
        console.log('Equipment placed with connectors:', {
            equipmentType: equipmentElement.dataset.type,
            connectorCount: equipmentElement.querySelectorAll('.connector').length,
            connectors: Array.from(equipmentElement.querySelectorAll('.connector')).map(c => ({
                type: c.dataset.type,
                label: c.dataset.label,
                position: c.className.split(' ')[1]
            }))
        });

        // Special debugging for mixers
        if (equipmentElement.dataset.type === 'mixing-console') {
            console.log('Mixer placed - checking output connector...');
            const outputConnector = equipmentElement.querySelector('.connector[data-type="xlr-out"]');
            if (outputConnector) {
                console.log('Mixer output connector found:', {
                    type: outputConnector.dataset.type,
                    label: outputConnector.dataset.label,
                    position: outputConnector.className.split(' ')[1],
                    rect: outputConnector.getBoundingClientRect()
                });
            } else {
                console.log('Mixer output connector NOT found!');
            }
        }
    }

    createConnectorsHTML(connectors) {
        if (!connectors || connectors.length === 0) return '';

        return connectors.map(connector => `
            <div class="connector ${connector.position}" 
                 data-type="${connector.type}" 
                 data-label="${connector.label}"
                 title="${connector.label}">
                <div class="connector-dot"></div>
                <div class="connector-label">${connector.label}</div>
            </div>
        `).join('');
    }

    handleConnectorClick(connector, equipment) {
        console.log('Handling connector click:', {
            connectorType: connector.dataset.type,
            connectorLabel: connector.dataset.label,
            equipmentType: equipment.dataset.type,
            selectedConnector: this.selectedConnector
        });

        // Get the exact coordinates of the connector dot
        const connectorRect = connector.getBoundingClientRect();
        const stageArea = document.getElementById('stage-area');
        const stageRect = stageArea.getBoundingClientRect();

        const connectorX = connectorRect.left + connectorRect.width / 2 - stageRect.left;
        const connectorY = connectorRect.top + connectorRect.height / 2 - stageRect.top;

        console.log('Connector coordinates:', { x: connectorX, y: connectorY });

        if (!this.selectedConnector) {
            // First connector selected
            this.selectedConnector = {
                connector,
                equipment,
                coordinates: { x: connectorX, y: connectorY }
            };
            connector.classList.add('selected');
            this.showMessage(`Selected ${connector.dataset.label}. Click another connector to connect.`, 'info');
        } else if (this.selectedConnector.connector === connector) {
            // Same connector clicked, deselect
            this.selectedConnector.connector.classList.remove('selected');
            this.selectedConnector = null;
            this.showMessage('Connection cancelled.', 'info');
        } else {
            // Second connector selected, attempt connection
            console.log('Attempting connection between:', {
                from: this.selectedConnector.connector.dataset.type,
                to: connector.dataset.type,
                fromCoords: this.selectedConnector.coordinates,
                toCoords: { x: connectorX, y: connectorY }
            });

            // Store references to equipment and coordinates before clearing selectedConnector
            const firstEquipment = this.selectedConnector.equipment;
            const secondEquipment = equipment;
            const fromCoordinates = this.selectedConnector.coordinates;
            const toCoordinates = { x: connectorX, y: connectorY };

            this.createConnection(this.selectedConnector, {
                connector,
                equipment,
                coordinates: toCoordinates
            });

            // Reset connector states
            this.selectedConnector.connector.classList.remove('selected');
            this.selectedConnector = null;

            // Force reset connectors on the equipment that was involved in the connection
            setTimeout(() => {
                this.resetConnectorsOnEquipment(firstEquipment);
                this.resetConnectorsOnEquipment(secondEquipment);
            }, 100);
        }
    }

    resetConnectorStates() {
        console.log('=== RESETTING ALL CONNECTOR STATES ===');

        // Remove selected class from all connectors
        document.querySelectorAll('.connector.selected').forEach(connector => {
            connector.classList.remove('selected');
        });

        // Re-setup all connector event listeners to ensure they work after connections
        document.querySelectorAll('.equipment').forEach(equipment => {
            this.resetConnectorsOnEquipment(equipment);
        });

        console.log('All connector states reset - all connectors should be clickable with fresh event listeners');
    }

    resetConnectorsOnEquipment(equipment) {
        if (!equipment) return;

        console.log(`=== RESETTING CONNECTORS ON ${equipment.dataset.type} ===`);

        equipment.querySelectorAll('.connector').forEach(connector => {
            // Remove any existing event listeners by cloning
            const newConnector = connector.cloneNode(true);
            connector.parentNode.replaceChild(newConnector, connector);

            // Apply extreme high-priority styling to ensure connectors work even when equipment is animated
            newConnector.style.cssText = `
                position: absolute !important;
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 99999 !important;
                border: 2px solid transparent !important;
                border-radius: 50% !important;
                transition: all 0.3s ease !important;
                transform: none !important;
                background: transparent !important;
                width: 30px !important;
                height: 30px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            `;

            // Add multiple event listeners with different approaches
            const clickHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                e.stopImmediatePropagation();
                console.log('UNIVERSAL CONNECTOR CLICKED (reset):', newConnector.dataset.type, 'on', equipment.dataset.type);
                this.handleConnectorClick(newConnector, equipment);
            };

            const mousedownHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                e.stopImmediatePropagation();
                console.log('UNIVERSAL CONNECTOR MOUSEDOWN (reset):', newConnector.dataset.type, 'on', equipment.dataset.type);
            };

            const mouseenterHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                newConnector.style.zIndex = '100000';
                newConnector.style.transform = 'scale(1.3)';
                newConnector.style.border = '3px solid #00ff88';
                newConnector.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.8)';
                console.log('UNIVERSAL CONNECTOR HOVER ENTER (reset):', newConnector.dataset.type, 'on', equipment.dataset.type);
            };

            const mouseleaveHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                newConnector.style.zIndex = '99999';
                newConnector.style.transform = 'scale(1)';
                newConnector.style.border = '2px solid transparent';
                newConnector.style.boxShadow = '';
                console.log('UNIVERSAL CONNECTOR HOVER LEAVE (reset):', newConnector.dataset.type, 'on', equipment.dataset.type);
            };

            // Add multiple event listeners with capture phase
            newConnector.addEventListener('click', clickHandler, true);
            newConnector.addEventListener('mousedown', mousedownHandler, true);
            newConnector.addEventListener('mouseenter', mouseenterHandler, true);
            newConnector.addEventListener('mouseleave', mouseleaveHandler, true);

            // Add backup event listeners
            newConnector.onclick = clickHandler;
            newConnector.onmousedown = mousedownHandler;
            newConnector.onmouseenter = mouseenterHandler;
            newConnector.onmouseleave = mouseleaveHandler;

            // Re-setup connector dot with extreme high priority
            const connectorDot = newConnector.querySelector('.connector-dot');
            if (connectorDot) {
                connectorDot.style.cssText = `
                    width: 16px !important;
                    height: 16px !important;
                    background: #00ff88 !important;
                    border: 3px solid white !important;
                    border-radius: 50% !important;
                    box-shadow: 0 0 10px rgba(0, 255, 136, 0.6) !important;
                    transition: all 0.3s ease !important;
                    cursor: pointer !important;
                    pointer-events: auto !important;
                    z-index: 100001 !important;
                    position: relative !important;
                `;

                const dotClickHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('UNIVERSAL DOT CLICKED (reset):', newConnector.dataset.type, 'on', equipment.dataset.type);
                    this.handleConnectorClick(newConnector, equipment);
                };

                const dotMousedownHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('UNIVERSAL DOT MOUSEDOWN (reset):', newConnector.dataset.type, 'on', equipment.dataset.type);
                };

                const dotMouseenterHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    connectorDot.style.transform = 'scale(1.4)';
                    connectorDot.style.boxShadow = '0 0 15px rgba(0, 255, 136, 1)';
                    console.log('UNIVERSAL DOT HOVER ENTER (reset):', newConnector.dataset.type, 'on', equipment.dataset.type);
                };

                const dotMouseleaveHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    connectorDot.style.transform = 'scale(1)';
                    connectorDot.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.6)';
                    console.log('UNIVERSAL DOT HOVER LEAVE (reset):', newConnector.dataset.type, 'on', equipment.dataset.type);
                };

                // Add multiple event listeners for dot
                connectorDot.addEventListener('click', dotClickHandler, true);
                connectorDot.addEventListener('mousedown', dotMousedownHandler, true);
                connectorDot.addEventListener('mouseenter', dotMouseenterHandler, true);
                connectorDot.addEventListener('mouseleave', dotMouseleaveHandler, true);

                // Add backup event listeners for dot
                connectorDot.onclick = dotClickHandler;
                connectorDot.onmousedown = dotMousedownHandler;
                connectorDot.onmouseenter = dotMouseenterHandler;
                connectorDot.onmouseleave = dotMouseleaveHandler;
            }
        });

        console.log(`Connectors reset on ${equipment.dataset.type}`);
    }

    forceFixMixerConnectorsAfterConnection() {
        console.log('=== FIXING MIXER CONNECTORS AFTER CONNECTION ===');

        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        if (mixers.length === 0) {
            console.log('No mixers found - skipping mixer connector fix');
            return;
        }

        mixers.forEach((mixer, index) => {
            console.log(`Fixing mixer ${index + 1} connectors after connection...`);

            const connectors = mixer.querySelectorAll('.connector');
            console.log(`Found ${connectors.length} connectors on mixer ${index + 1}`);

            connectors.forEach((connector, connIndex) => {
                const connectorType = connector.dataset.type;
                console.log(`Fixing mixer connector ${connIndex + 1} (${connectorType})...`);

                // Remove any existing event listeners by cloning
                const newConnector = connector.cloneNode(true);
                connector.parentNode.replaceChild(newConnector, connector);

                // Apply proper styling to the new connector
                newConnector.style.pointerEvents = 'auto';
                newConnector.style.cursor = 'pointer';
                newConnector.style.zIndex = '50';
                newConnector.style.border = '2px solid transparent';
                newConnector.style.borderRadius = '50%';
                newConnector.style.transition = 'all 0.3s ease';

                // Re-add universal event listeners
                newConnector.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('MIXER CONNECTOR CLICKED (after connection):', newConnector.dataset.type, 'on', mixer.dataset.type);
                    this.handleConnectorClick(newConnector, mixer);
                }, true); // Capture phase

                newConnector.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    console.log('MIXER CONNECTOR MOUSEDOWN (after connection):', newConnector.dataset.type, 'on', mixer.dataset.type);
                }, true);

                newConnector.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    newConnector.style.zIndex = '60';
                    newConnector.style.transform = 'scale(1.3)';
                    newConnector.style.border = '3px solid #00ff88';
                    newConnector.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.8)';
                    console.log('MIXER CONNECTOR HOVER ENTER (after connection):', newConnector.dataset.type, 'on', mixer.dataset.type);
                }, true);

                newConnector.addEventListener('mouseleave', (e) => {
                    e.stopPropagation();
                    newConnector.style.zIndex = '50';
                    newConnector.style.transform = 'scale(1)';
                    newConnector.style.border = '2px solid transparent';
                    newConnector.style.boxShadow = '';
                    console.log('MIXER CONNECTOR HOVER LEAVE (after connection):', newConnector.dataset.type, 'on', mixer.dataset.type);
                }, true);

                // Re-setup connector dot
                const connectorDot = newConnector.querySelector('.connector-dot');
                if (connectorDot) {
                    connectorDot.style.zIndex = '70';
                    connectorDot.style.pointerEvents = 'auto';
                    connectorDot.style.cursor = 'pointer';
                    connectorDot.style.border = '3px solid white';
                    connectorDot.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.6)';
                    connectorDot.style.transition = 'all 0.3s ease';

                    connectorDot.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('MIXER DOT CLICKED (after connection):', newConnector.dataset.type, 'on', mixer.dataset.type);
                        this.handleConnectorClick(newConnector, mixer);
                    }, true);

                    connectorDot.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                        console.log('MIXER DOT MOUSEDOWN (after connection):', newConnector.dataset.type, 'on', mixer.dataset.type);
                    }, true);

                    connectorDot.addEventListener('mouseenter', (e) => {
                        e.stopPropagation();
                        connectorDot.style.transform = 'scale(1.4)';
                        connectorDot.style.boxShadow = '0 0 15px rgba(0, 255, 136, 1)';
                        console.log('MIXER DOT HOVER ENTER (after connection):', newConnector.dataset.type, 'on', mixer.dataset.type);
                    }, true);

                    connectorDot.addEventListener('mouseleave', (e) => {
                        e.stopPropagation();
                        connectorDot.style.transform = 'scale(1)';
                        connectorDot.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.6)';
                        console.log('MIXER DOT HOVER LEAVE (after connection):', newConnector.dataset.type, 'on', mixer.dataset.type);
                    }, true);
                }

                console.log(`Mixer connector ${connIndex + 1} (${connectorType}) fixed after connection!`);
            });

            console.log(`Mixer ${index + 1} connectors fixed after connection!`);
        });

        console.log('All mixer connectors fixed after connection!');
    }

    forceResetConnectors() {
        console.log('=== FORCE RESETTING ALL CONNECTORS ===');

        // Reset selected connector state
        this.selectedConnector = null;

        // Remove all selected classes
        document.querySelectorAll('.connector.selected').forEach(connector => {
            connector.classList.remove('selected');
        });

        // Re-setup all connector event listeners
        document.querySelectorAll('.equipment').forEach(equipment => {
            equipment.querySelectorAll('.connector').forEach(connector => {
                // Remove existing event listeners by cloning
                const newConnector = connector.cloneNode(true);
                connector.parentNode.replaceChild(newConnector, connector);

                // Re-add event listeners
                newConnector.style.pointerEvents = 'auto';
                newConnector.style.cursor = 'pointer';

                newConnector.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('Connector clicked (reset):', newConnector.dataset.type, newConnector.dataset.label);
                    this.handleConnectorClick(newConnector, equipment);
                });

                newConnector.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    console.log('Connector mousedown (reset):', newConnector.dataset.type, newConnector.dataset.label);
                });

                // Add hover effects
                newConnector.addEventListener('mouseenter', () => {
                    newConnector.style.zIndex = '20';
                    console.log('Connector hover enter (reset):', newConnector.dataset.type);
                });

                newConnector.addEventListener('mouseleave', () => {
                    newConnector.style.zIndex = '15';
                    console.log('Connector hover leave (reset):', newConnector.dataset.type);
                });

                // Also setup connector dot
                const connectorDot = newConnector.querySelector('.connector-dot');
                if (connectorDot) {
                    connectorDot.style.pointerEvents = 'auto';
                    connectorDot.style.cursor = 'pointer';

                    connectorDot.addEventListener('click', (e) => {
                        e.stopPropagation();
                        console.log('Connector dot clicked (reset):', newConnector.dataset.type, newConnector.dataset.label);
                        this.handleConnectorClick(newConnector, equipment);
                    });

                    connectorDot.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                        console.log('Connector dot mousedown (reset):', newConnector.dataset.type, newConnector.dataset.label);
                    });
                }
            });
        });

        this.showMessage('All connectors force reset and re-initialized', 'info');
    }

    createConnection(from, to) {
        const levelData = this.getLevelData(this.currentLevel);
        const fromType = from.connector.dataset.type;
        const toType = to.connector.dataset.type;

        // Show cable selection dialog
        this.showCableSelectionDialog(from, to, levelData);
    }

    showCableSelectionDialog(from, to, levelData) {
        const dialog = document.createElement('div');
        dialog.className = 'cable-selection-dialog';
        dialog.innerHTML = `
            <div class="cable-dialog-content">
                <h3>Select Cable Type</h3>
                <p>Choose the appropriate cable for this connection:</p>
                <div class="cable-options">
                    ${levelData.connections.map(cable => `
                        <div class="cable-option" data-cable="${cable.type}" style="border-color: ${cable.color}">
                            <div class="cable-icon" style="background: ${cable.color}">
                                <i class="${cable.icon}"></i>
                            </div>
                            <span>${cable.name}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="cancel-btn">Cancel</button>
            </div>
        `;

        document.body.appendChild(dialog);

        // Add event listeners
        dialog.querySelectorAll('.cable-option').forEach(option => {
            option.addEventListener('click', () => {
                const cableType = option.dataset.cable;
                this.validateAndCreateConnection(from, to, cableType, levelData);
                dialog.remove();
            });
        });

        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            dialog.remove();
        });
    }

    validateAndCreateConnection(from, to, cableType, levelData) {
        console.log('validateAndCreateConnection called:', { from, to, cableType, levelData });

        const fromType = from.connector.dataset.type;
        const toType = to.connector.dataset.type;

        console.log('Connector types:', { fromType, toType });

        // Check if connection is valid with the selected cable
        const validConnection = levelData.validConnections.find(valid =>
            ((valid.from === fromType && valid.to === toType) ||
                (valid.from === toType && valid.to === fromType)) &&
            valid.cable === cableType
        );

        console.log('Valid connection found:', validConnection);

        if (validConnection) {
            console.log('Creating valid connection...');
            this.createValidConnection(from, to, validConnection);
            this.playCorrectSound();
            this.awardPoints(100, 'Valid connection made');
        } else {
            console.log('Creating invalid connection...');
            this.createInvalidConnection(from, to, cableType);
            this.playWrongSound();
            this.showMessage('Invalid connection! Check your equipment manual.', 'error');
        }
    }

    createValidConnection(from, to, validConnection) {
        console.log('createValidConnection called:', { from, to, validConnection });

        // Get the connector color based on the connector type
        const connectorColor = this.getConnectorColor(from.connector.dataset.type);
        console.log('Connector color:', connectorColor);

        // Use the saved coordinates for drawing the line
        const fromCoords = from.coordinates;
        const toCoords = to.coordinates;

        console.log('Using saved coordinates:', { fromCoords, toCoords });

        // Create the connection line immediately
        const connectionLine = this.drawConnectionLineWithCoordinates(fromCoords, toCoords, connectorColor);
        console.log('Connection line created immediately:', connectionLine);

        // Add connection to array with the line
        const connectionData = {
            from: from,
            to: to,
            line: connectionLine,
            valid: true,
            cableType: validConnection.cable,
            animation: validConnection.animation
        };

        this.connections.push(connectionData);
        console.log('Connection added to array:', connectionData);

        // Apply animation to connected equipment
        this.applyConnectionAnimation(from.equipment, validConnection.animation);
        this.applyConnectionAnimation(to.equipment, validConnection.animation);

        // Remove red borders from connected equipment
        from.equipment.classList.remove('missing-connection-border');
        to.equipment.classList.remove('missing-connection-border');

        // Track successful connections
        this.successfulConnections++;

        // Update progress tracking
        this.updateConnectionProgress();

        // Check for level completion
        this.checkLevelCompletion();
    }

    getConnectorColor(connectorType) {
        // Return the same colors as defined in CSS for connector dots
        switch (connectorType) {
            case 'power-in':
            case 'power-out':
                return '#ff4757'; // Red for power
            case 'xlr-in':
            case 'xlr-out':
                return '#00ff88'; // Green for XLR/audio
            case 'wireless-in':
            case 'wireless-out':
                return '#a29bfe'; // Purple for wireless
            case 'ethernet-in':
            case 'ethernet-out':
                return '#00ccff'; // Blue for ethernet
            case 'dmx-in':
            case 'dmx-out':
                return '#ffa502'; // Orange for DMX
            default:
                return '#00ff88'; // Default green
        }
    }

    calculateRequiredConnections(levelData) {
        let connections = {
            power: 0,
            audio: 0,
            wireless: 0,
            dmx: 0,
            hdmi: 0,
            total: 0
        };

        // Use the level data connections array for accurate counts
        if (levelData.connections) {
            levelData.connections.forEach(conn => {
                switch (conn.type) {
                    case 'power-cable':
                        connections.power = conn.quantity;
                        connections.total += conn.quantity;
                        break;
                    case 'xlr-cable':
                        connections.audio = conn.quantity;
                        connections.total += conn.quantity;
                        break;
                    case 'wireless-cable':
                        connections.wireless = conn.quantity;
                        connections.total += conn.quantity;
                        break;
                    case 'dmx-cable':
                        connections.dmx = conn.quantity;
                        connections.total += conn.quantity;
                        break;
                    case 'hdmi-cable':
                        connections.hdmi = conn.quantity;
                        connections.total += conn.quantity;
                        break;
                }
            });
        } else {
            // Fallback to equipment-based calculation for older levels
            levelData.equipment.forEach(equipment => {
                // Power connections
                if (equipment.requiresPower) {
                    connections.power++;
                    connections.total++;
                }

                // Audio connections
                if (equipment.type === 'microphone') {
                    if (equipment.wireless) {
                        connections.wireless++; // Wireless mic to receiver
                        connections.audio++; // Receiver to mixer
                        connections.total += 2;
                    } else {
                        connections.audio++; // Direct XLR to mixer
                        connections.total++;
                    }
                }

                if (equipment.type === 'speaker') {
                    connections.audio++; // Mixer to speaker
                    connections.total++;
                }

                if (equipment.type === 'mic-receiver') {
                    connections.audio++; // Receiver to mixer
                    connections.total++;
                }
            });
        }

        this.requiredConnections = connections;
        return connections.total;
    }

    updateConnectionProgress() {
        // Reset current counts
        this.connectionProgress = {
            power: { current: 0, required: 0 },
            xlr: { current: 0, required: 0 },
            wireless: { current: 0, required: 0 },
            ethernet: { current: 0, required: 0 },
            dmx: { current: 0, required: 0 },
            hdmi: { current: 0, required: 0 }
        };

        // Calculate required connections from level data
        const levelData = this.getLevelData(this.currentLevel);
        if (levelData && levelData.connections) {
            levelData.connections.forEach(conn => {
                switch (conn.type) {
                    case 'power-cable':
                        this.connectionProgress.power.required = conn.quantity;
                        break;
                    case 'xlr-cable':
                        this.connectionProgress.xlr.required = conn.quantity;
                        break;
                    case 'wireless-cable':
                        this.connectionProgress.wireless.required = conn.quantity;
                        break;
                    case 'ethernet-cable':
                        this.connectionProgress.ethernet.required = conn.quantity;
                        break;
                    case 'dmx-cable':
                        this.connectionProgress.dmx.required = conn.quantity;
                        break;
                    case 'hdmi-cable':
                        this.connectionProgress.hdmi.required = conn.quantity;
                        break;
                }
            });
        }

        // Count current valid connections
        this.connections.forEach(conn => {
            if (conn.valid) {
                switch (conn.cableType) {
                    case 'power-cable':
                        this.connectionProgress.power.current++;
                        break;
                    case 'xlr-cable':
                        this.connectionProgress.xlr.current++;
                        break;
                    case 'wireless-cable':
                        this.connectionProgress.wireless.current++;
                        break;
                    case 'ethernet-cable':
                        this.connectionProgress.ethernet.current++;
                        break;
                    case 'dmx-cable':
                        this.connectionProgress.dmx.current++;
                        break;
                    case 'hdmi-cable':
                        this.connectionProgress.hdmi.current++;
                        break;
                }
            }
        });

        console.log('Connection progress updated:', this.connectionProgress);

        // Update UI
        this.updateProgressUI();
    }

    updateProgressUI() {
        const powerEl = document.getElementById('power-connections');
        const xlrEl = document.getElementById('xlr-connections');
        const wirelessEl = document.getElementById('wireless-connections');
        const ethernetEl = document.getElementById('ethernet-connections');
        const dmxEl = document.getElementById('dmx-connections');
        const hdmiEl = document.getElementById('hdmi-connections');

        if (powerEl) {
            powerEl.textContent = `${this.connectionProgress.power.current}/${this.connectionProgress.power.required}`;
            powerEl.parentElement.classList.toggle('complete', this.connectionProgress.power.current >= this.connectionProgress.power.required);
        }
        if (xlrEl) {
            xlrEl.textContent = `${this.connectionProgress.xlr.current}/${this.connectionProgress.xlr.required}`;
            xlrEl.parentElement.classList.toggle('complete', this.connectionProgress.xlr.current >= this.connectionProgress.xlr.required);
        }
        if (wirelessEl) {
            wirelessEl.textContent = `${this.connectionProgress.wireless.current}/${this.connectionProgress.wireless.required}`;
            wirelessEl.parentElement.classList.toggle('complete', this.connectionProgress.wireless.current >= this.connectionProgress.wireless.required);
        }
        if (ethernetEl) {
            ethernetEl.textContent = `${this.connectionProgress.ethernet.current}/${this.connectionProgress.ethernet.required}`;
            ethernetEl.parentElement.classList.toggle('complete', this.connectionProgress.ethernet.current >= this.connectionProgress.ethernet.required);
        }
        if (dmxEl) {
            dmxEl.textContent = `${this.connectionProgress.dmx.current}/${this.connectionProgress.dmx.required}`;
            dmxEl.parentElement.classList.toggle('complete', this.connectionProgress.dmx.current >= this.connectionProgress.dmx.required);
        }
        if (hdmiEl) {
            hdmiEl.textContent = `${this.connectionProgress.hdmi.current}/${this.connectionProgress.hdmi.required}`;
            hdmiEl.parentElement.classList.toggle('complete', this.connectionProgress.hdmi.current >= this.connectionProgress.hdmi.required);
        }
    }

    generateHint() {
        const hints = [];
        const levelData = this.getLevelData(this.currentLevel);

        if (!levelData) {
            return 'No level data available.';
        }

        console.log('Generating hints for level:', this.currentLevel);

        // Count current connections by type
        const powerConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'power-cable').length;
        const xlrConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'xlr-cable').length;
        const wirelessConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'wireless-cable').length;
        const ethernetConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'ethernet-cable').length;
        const dmxConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'dmx-cable').length;

        // Get required connections from level data
        const requiredConnections = levelData.connections || [];
        const powerRequired = requiredConnections.find(c => c.type === 'power-cable')?.quantity || 0;
        const xlrRequired = requiredConnections.find(c => c.type === 'xlr-cable')?.quantity || 0;
        const wirelessRequired = requiredConnections.find(c => c.type === 'wireless-cable')?.quantity || 0;
        const ethernetRequired = requiredConnections.find(c => c.type === 'ethernet-cable')?.quantity || 0;
        const dmxRequired = requiredConnections.find(c => c.type === 'dmx-cable')?.quantity || 0;

        console.log('Connection counts:', {
            power: `${powerConnections}/${powerRequired}`,
            xlr: `${xlrConnections}/${xlrRequired}`,
            wireless: `${wirelessConnections}/${wirelessRequired}`,
            ethernet: `${ethernetConnections}/${ethernetRequired}`,
            dmx: `${dmxConnections}/${dmxRequired}`
        });

        // Check power connections
        if (powerConnections < powerRequired) {
            const missing = powerRequired - powerConnections;
            hints.push(`🔌 You need ${missing} more power connection${missing > 1 ? 's' : ''}. Connect equipment to power sources.`);
        }

        // Check XLR connections
        if (xlrConnections < xlrRequired) {
            const missing = xlrRequired - xlrConnections;
            hints.push(`🎤 You need ${missing} more XLR connection${missing > 1 ? 's' : ''}. Connect audio equipment with XLR cables.`);
        }

        // Check wireless connections
        if (wirelessConnections < wirelessRequired) {
            const missing = wirelessRequired - wirelessConnections;
            hints.push(`📡 You need ${missing} more wireless connection${missing > 1 ? 's' : ''}. Connect wireless equipment.`);
        }

        // Check Ethernet connections
        if (ethernetConnections < ethernetRequired) {
            const missing = ethernetRequired - ethernetConnections;
            hints.push(`🌐 You need ${missing} more Ethernet connection${missing > 1 ? 's' : ''}. Connect network equipment.`);
        }

        // Check DMX connections
        if (dmxConnections < dmxRequired) {
            const missing = dmxRequired - dmxConnections;
            hints.push(`💡 You need ${missing} more DMX connection${missing > 1 ? 's' : ''}. Connect lighting equipment.`);
        }

        // Check for unpowered equipment
        const unpoweredEquipment = this.equipment.filter(eq => {
            const equipmentData = this.getEquipmentData(eq.dataset.type);
            return equipmentData && equipmentData.requiresPower && !this.hasPowerConnection(eq);
        });

        if (unpoweredEquipment.length > 0) {
            const equipmentNames = unpoweredEquipment.map(eq => eq.dataset.name || eq.dataset.type).join(', ');
            hints.push(`⚡ Equipment needing power: ${equipmentNames}`);
        }

        // Level-specific hints
        if (this.currentLevel === 'audio-1') {
            hints.push(`🎵 Level 1: Connect wireless mics → receivers → mixer → speakers`);
        } else if (this.currentLevel === 'audio-2') {
            hints.push(`🎵 Level 2: Connect XLR mics → mixer → effects processor → speakers`);
        } else if (this.currentLevel === 'audio-3') {
            hints.push(`🎵 Level 3: Connect mics + playback → mixer → wireless monitoring + multi-zone speakers`);
        }

        return hints.length > 0 ? hints.join('\n\n') : '🎉 All connections look good! Try testing the system.';
    }

    generateDetailedHint() {
        const levelData = this.getLevelData(this.currentLevel);
        if (!levelData) {
            return 'No level data available.';
        }

        console.log('Generating detailed hints for level:', this.currentLevel);

        const detailedHints = [];
        const missingConnections = [];

        // Count current connections by type
        const powerConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'power-cable').length;
        const xlrConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'xlr-cable').length;
        const wirelessConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'wireless-cable').length;
        const ethernetConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'ethernet-cable').length;
        const dmxConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'dmx-cable').length;

        // Get required connections from level data
        const requiredConnections = levelData.connections || [];
        const powerRequired = requiredConnections.find(c => c.type === 'power-cable')?.quantity || 0;
        const xlrRequired = requiredConnections.find(c => c.type === 'xlr-cable')?.quantity || 0;
        const wirelessRequired = requiredConnections.find(c => c.type === 'wireless-cable')?.quantity || 0;
        const ethernetRequired = requiredConnections.find(c => c.type === 'ethernet-cable')?.quantity || 0;
        const dmxRequired = requiredConnections.find(c => c.type === 'dmx-cable')?.quantity || 0;

        // Level 3 specific step-by-step guidance
        if (this.currentLevel === 'audio-3') {
            detailedHints.push(`🎵 **LEVEL 3 - PROFESSIONAL LIVE SOUND SYSTEM**`);
            detailedHints.push(`This is a complex multi-zone system with wireless monitoring. Follow these steps:`);

            detailedHints.push(`\n**STEP 1: POWER ALL EQUIPMENT**`);
            const poweredEquipment = this.equipment.filter(eq => {
                const equipmentData = this.getEquipmentData(eq.dataset.type);
                return equipmentData && equipmentData.requiresPower;
            });
            const unpoweredEquipment = poweredEquipment.filter(eq => !this.hasPowerConnection(eq));

            if (unpoweredEquipment.length > 0) {
                detailedHints.push(`🔌 Connect these to Power Distribution:`);
                unpoweredEquipment.forEach(eq => {
                    detailedHints.push(`   • ${eq.dataset.name} (${eq.dataset.type})`);
                });
            } else {
                detailedHints.push(`✅ All equipment is powered`);
            }

            detailedHints.push(`\n**STEP 2: CONNECT INPUT SOURCES TO MIXER**`);
            const mics = this.equipment.filter(eq => eq.dataset.type === 'microphone');
            const playbackDevices = this.equipment.filter(eq => eq.dataset.type === 'playback-device');
            const mixer = this.equipment.find(eq => eq.dataset.type === 'mixing-console');

            if (mixer) {
                // Check mic connections
                mics.forEach((mic, index) => {
                    const hasMixerConnection = this.connections.some(conn =>
                        conn.valid && conn.cableType === 'xlr-cable' &&
                        (conn.from.equipment === mic || conn.to.equipment === mic) &&
                        (conn.from.equipment === mixer || conn.to.equipment === mixer)
                    );
                    if (!hasMixerConnection) {
                        detailedHints.push(`🎤 Connect ${mic.dataset.name} XLR Out → Mixer Input ${index + 1}`);
                    } else {
                        detailedHints.push(`✅ ${mic.dataset.name} connected to mixer`);
                    }
                });

                // Check playback device connections
                playbackDevices.forEach((playback, index) => {
                    const hasMixerConnection = this.connections.some(conn =>
                        conn.valid && conn.cableType === 'xlr-cable' &&
                        (conn.from.equipment === playback || conn.to.equipment === playback) &&
                        (conn.from.equipment === mixer || conn.to.equipment === mixer)
                    );
                    if (!hasMixerConnection) {
                        detailedHints.push(`🎵 Connect ${playback.dataset.name} XLR Out → Mixer Input ${mics.length + index + 1}`);
                    } else {
                        detailedHints.push(`✅ ${playback.dataset.name} connected to mixer`);
                    }
                });
            }

            detailedHints.push(`\n**STEP 3: CONNECT MIXER TO WIRELESS MONITORING**`);
            const wirelessTransmitter = this.equipment.find(eq => eq.dataset.type === 'wireless-transmitter');
            const wirelessReceivers = this.equipment.filter(eq => eq.dataset.type === 'wireless-receiver');

            if (wirelessTransmitter && mixer) {
                const hasMixerToTransmitter = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === wirelessTransmitter || conn.to.equipment === wirelessTransmitter) &&
                    (conn.from.equipment === mixer || conn.to.equipment === mixer)
                );
                if (!hasMixerToTransmitter) {
                    detailedHints.push(`📡 Connect Mixer Aux 1 Out → Wireless Transmitter XLR In`);
                } else {
                    detailedHints.push(`✅ Wireless transmitter connected to mixer`);
                }
            }

            if (wirelessTransmitter && wirelessReceivers.length > 0) {
                wirelessReceivers.forEach((receiver, index) => {
                    const hasWirelessConnection = this.connections.some(conn =>
                        conn.valid && conn.cableType === 'wireless-cable' &&
                        (conn.from.equipment === wirelessTransmitter || conn.to.equipment === wirelessTransmitter) &&
                        (conn.from.equipment === receiver || conn.to.equipment === receiver)
                    );
                    if (!hasWirelessConnection) {
                        detailedHints.push(`📡 Connect Wireless Transmitter RF Out → Wireless Receiver ${index + 1} RF In`);
                    } else {
                        detailedHints.push(`✅ Wireless receiver ${index + 1} connected to transmitter`);
                    }
                });
            }

            detailedHints.push(`\n**STEP 4: CONNECT MIXER TO SPEAKERS**`);
            const mainSpeakers = this.equipment.filter(eq =>
                eq.dataset.type === 'speaker' && eq.dataset.name && eq.dataset.name.includes('Main Speaker')
            );
            const monitorSpeakers = this.equipment.filter(eq =>
                eq.dataset.type === 'speaker' && eq.dataset.name && eq.dataset.name.includes('Monitor Speaker')
            );

            if (mixer) {
                // Main speakers
                mainSpeakers.forEach((speaker, index) => {
                    const hasMainOutput = this.connections.some(conn =>
                        conn.valid && conn.cableType === 'xlr-cable' &&
                        (conn.from.equipment === speaker || conn.to.equipment === speaker) &&
                        (conn.from.equipment === mixer || conn.to.equipment === mixer)
                    );
                    if (!hasMainOutput) {
                        const outputName = index === 0 ? 'Main L Out' : 'Main R Out';
                        detailedHints.push(`🔊 Connect Mixer ${outputName} → ${speaker.dataset.name} XLR In`);
                    } else {
                        detailedHints.push(`✅ ${speaker.dataset.name} connected to mixer main output`);
                    }
                });

                // Monitor speakers - they get audio from wireless receivers, not mixer
                monitorSpeakers.forEach((speaker, index) => {
                    const hasWirelessReceiverConnection = this.connections.some(conn =>
                        conn.valid && conn.cableType === 'xlr-cable' &&
                        (conn.from.equipment === speaker || conn.to.equipment === speaker) &&
                        (wirelessReceivers.some(receiver => conn.from.equipment === receiver || conn.to.equipment === receiver))
                    );
                    if (!hasWirelessReceiverConnection) {
                        detailedHints.push(`🔊 Connect Wireless Receiver ${index + 1} XLR Out → ${speaker.dataset.name} XLR In`);
                    } else {
                        detailedHints.push(`✅ ${speaker.dataset.name} connected to wireless receiver`);
                    }
                });
            }

            // Summary
            detailedHints.push(`\n**CONNECTION SUMMARY:**`);
            detailedHints.push(`Power: ${powerConnections}/${powerRequired}`);
            detailedHints.push(`XLR: ${xlrConnections}/${xlrRequired}`);
            detailedHints.push(`Wireless: ${wirelessConnections}/${wirelessRequired}`);

            if (powerConnections < powerRequired || xlrConnections < xlrRequired || wirelessConnections < wirelessRequired) {
                detailedHints.push(`\n⚠️ **STILL MISSING CONNECTIONS** - Complete the steps above!`);
            } else {
                detailedHints.push(`\n🎉 **ALL CONNECTIONS COMPLETE!** The system should be ready to test.`);
            }

            return detailedHints.join('\n\n');
        }

        // For other levels, use the original detailed hint logic
        // Analyze missing connections in detail
        if (powerConnections < powerRequired) {
            const missing = powerRequired - powerConnections;
            const poweredEquipment = levelData.equipment.filter(eq => eq.requiresPower);
            const unpoweredEquipment = this.equipment.filter(eq => {
                const equipmentData = this.getEquipmentData(eq.dataset.type);
                return equipmentData && equipmentData.requiresPower && !this.hasPowerConnection(eq);
            });

            detailedHints.push(`🔌 **POWER CONNECTIONS MISSING: ${missing}**`);
            detailedHints.push(`Required: ${powerRequired} | Current: ${powerConnections}`);
            if (unpoweredEquipment.length > 0) {
                const equipmentNames = unpoweredEquipment.map(eq => eq.dataset.name || eq.dataset.type).join(', ');
                detailedHints.push(`Equipment needing power: ${equipmentNames}`);
            }
            detailedHints.push(`Connect power distribution outputs to equipment power inputs.`);
            missingConnections.push({ type: 'power', missing, equipment: unpoweredEquipment });
        }

        if (xlrConnections < xlrRequired) {
            const missing = xlrRequired - xlrConnections;
            detailedHints.push(`🎤 **XLR CONNECTIONS MISSING: ${missing}**`);
            detailedHints.push(`Required: ${xlrRequired} | Current: ${xlrConnections}`);

            // Level-specific XLR guidance
            if (this.currentLevel === 'audio-1') {
                detailedHints.push(`Connect mic receivers to mixer inputs, then mixer outputs to speakers.`);
            } else if (this.currentLevel === 'audio-2') {
                detailedHints.push(`Connect XLR mics to mixer inputs, mixer to effects processor, effects to speakers.`);
            }
            missingConnections.push({ type: 'xlr', missing });
        }

        if (wirelessConnections < wirelessRequired) {
            const missing = wirelessRequired - wirelessConnections;
            detailedHints.push(`📡 **WIRELESS CONNECTIONS MISSING: ${missing}**`);
            detailedHints.push(`Required: ${wirelessRequired} | Current: ${wirelessConnections}`);

            if (this.currentLevel === 'audio-1') {
                detailedHints.push(`Connect wireless mics to mic receivers using wireless cables.`);
            }
            missingConnections.push({ type: 'wireless', missing });
        }

        if (ethernetConnections < ethernetRequired) {
            const missing = ethernetRequired - ethernetConnections;
            detailedHints.push(`🌐 **ETHERNET CONNECTIONS MISSING: ${missing}**`);
            detailedHints.push(`Required: ${ethernetRequired} | Current: ${ethernetConnections}`);
            detailedHints.push(`Connect network equipment using Ethernet cables.`);
            missingConnections.push({ type: 'ethernet', missing });
        }

        if (dmxConnections < dmxRequired) {
            const missing = dmxRequired - dmxConnections;
            detailedHints.push(`💡 **DMX CONNECTIONS MISSING: ${missing}**`);
            detailedHints.push(`Required: ${dmxRequired} | Current: ${dmxConnections}`);
            detailedHints.push(`Connect lighting equipment using DMX cables.`);
            missingConnections.push({ type: 'dmx', missing });
        }

        // Add specific connection guidance
        if (missingConnections.length > 0) {
            detailedHints.push(`\n**SPECIFIC CONNECTION GUIDANCE:**`);

            // Check for specific missing connections
            const mics = this.equipment.filter(eq => eq.dataset.type === 'microphone');
            const mixers = this.equipment.filter(eq => eq.dataset.type === 'mixing-console');
            const speakers = this.equipment.filter(eq => eq.dataset.type === 'speaker');
            const powerDistros = this.equipment.filter(eq => eq.dataset.type === 'power-distro');

            // Check mic connections
            mics.forEach((mic, index) => {
                const hasConnection = this.connections.some(conn =>
                    conn.valid && (conn.from.equipment === mic || conn.to.equipment === mic)
                );
                if (!hasConnection) {
                    detailedHints.push(`• Microphone ${index + 1} (${mic.dataset.name || 'Mic'}) needs connection`);
                }
            });

            // Check mixer connections
            mixers.forEach((mixer, index) => {
                const hasPower = this.hasPowerConnection(mixer);
                const hasInputs = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === mixer || conn.to.equipment === mixer)
                );
                const hasOutputs = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === mixer || conn.to.equipment === mixer)
                );

                if (!hasPower) {
                    detailedHints.push(`• Mixer ${index + 1} needs power connection`);
                }
                if (!hasInputs) {
                    detailedHints.push(`• Mixer ${index + 1} needs input connections (from mics/receivers)`);
                }
                if (!hasOutputs) {
                    detailedHints.push(`• Mixer ${index + 1} needs output connections (to speakers/effects)`);
                }
            });

            // Check speaker connections
            speakers.forEach((speaker, index) => {
                const hasPower = this.hasPowerConnection(speaker);
                const hasAudio = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === speaker || conn.to.equipment === speaker)
                );

                if (!hasPower) {
                    detailedHints.push(`• Speaker ${index + 1} (${speaker.dataset.name || 'Speaker'}) needs power`);
                }
                if (!hasAudio) {
                    detailedHints.push(`• Speaker ${index + 1} (${speaker.dataset.name || 'Speaker'}) needs audio input`);
                }
            });
        }

        if (detailedHints.length === 0) {
            return '🎉 All connections are complete! The system should be ready to test.';
        }

        return detailedHints.join('\n\n');
    }

    hasPowerConnection(equipment) {
        return this.connections.some(conn =>
            conn.valid &&
            conn.cableType === 'power-cable' &&
            (conn.from.equipment === equipment || conn.to.equipment === equipment)
        );
    }

    getEquipmentData(equipmentType) {
        const levelData = this.getLevelData(this.currentLevel);
        if (!levelData) return null;

        return levelData.equipment.find(eq => eq.type === equipmentType);
    }

    checkLevelCompletion() {
        if (this.validateAllConnections()) {
            setTimeout(() => {
                this.completeLevel();
                this.showWinnerCelebration();
            }, 1000);
        }
    }

    validateAllConnections() {
        const levelData = this.getLevelData(this.currentLevel);
        if (!levelData) return false;

        console.log('Validating connections for level:', this.currentLevel);
        console.log('Current connections:', this.connections);

        const validation = {
            power: this.validatePowerConnections(levelData),
            audio: this.validateAudioConnections(levelData),
            wireless: this.validateWirelessConnections(levelData),
            dmx: this.validateDMXConnections(levelData),
            hdmi: this.validateHDMIConnections(levelData),
            allValid: false
        };

        // Different validation requirements for each level type
        if (this.currentLevel.startsWith('audio-')) {
            // Audio levels: Power + Audio + Wireless (if applicable)
            if (this.currentLevel === 'audio-2') {
                validation.allValid = validation.power && validation.audio;
                console.log('Audio Level 2 validation (no wireless):', validation);
            } else {
                validation.allValid = validation.power && validation.audio && validation.wireless;
                console.log('Audio Level validation (with wireless):', validation);
            }
        } else if (this.currentLevel.startsWith('lighting-')) {
            // Lighting levels: Power + DMX
            validation.allValid = validation.power && validation.dmx;
            console.log('Lighting Level validation:', validation);
        } else if (this.currentLevel.startsWith('video-')) {
            // Video levels: Power + HDMI
            validation.allValid = validation.power && validation.hdmi;
            console.log('Video Level validation:', validation);
        } else if (this.currentLevel.startsWith('set-')) {
            // Set levels: Power only (effects equipment)
            validation.allValid = validation.power;
            console.log('Set Level validation:', validation);
        } else {
            // Default fallback
            validation.allValid = validation.power && validation.audio && validation.wireless;
            console.log('Default validation:', validation);
        }

        return validation.allValid;
    }

    validatePowerConnections(levelData) {
        const poweredEquipment = levelData.equipment.filter(eq => eq.requiresPower);
        const powerConnections = this.connections.filter(conn =>
            conn.valid && conn.cableType === 'power-cable'
        );

        console.log('Power validation - Equipment found:', {
            poweredEquipment: poweredEquipment.length,
            powerConnections: powerConnections.length
        });

        // Check if each powered equipment has a power connection
        for (let equipment of poweredEquipment) {
            const equipmentElements = this.equipment.filter(eq => eq.dataset.type === equipment.type);
            console.log(`Checking power for ${equipment.name} (${equipment.type}):`, equipmentElements.length, 'elements');

            for (let element of equipmentElements) {
                const hasPower = powerConnections.some(conn =>
                    conn.from.equipment === element || conn.to.equipment === element
                );
                if (!hasPower) {
                    this.showMessage(`⚠ ${equipment.name} needs power connection`, 'error');
                    return false;
                }
            }
        }

        console.log('Power validation passed');
        return true;
    }

    validateAudioConnections(levelData) {
        // Check microphone to mixer connections
        const mics = this.equipment.filter(eq => eq.dataset.type === 'microphone');
        const receivers = this.equipment.filter(eq => eq.dataset.type === 'mic-receiver');
        const mixers = this.equipment.filter(eq => eq.dataset.type === 'mixing-console');
        const speakers = this.equipment.filter(eq => eq.dataset.type === 'speaker');
        const effects = this.equipment.filter(eq => eq.dataset.type === 'effects-processor');

        console.log('Audio validation - Equipment found:', {
            mics: mics.length,
            receivers: receivers.length,
            mixers: mixers.length,
            speakers: speakers.length,
            effects: effects.length
        });

        // Level 2 has regular XLR mics, Level 1 has wireless mics, Level 3 has complex multi-zone system
        if (this.currentLevel === 'audio-2') {
            // Check regular XLR mics to mixer
            for (let mic of mics) {
                const hasXLRToMixer = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === mic || conn.to.equipment === mic) &&
                    (mixers.some(mixer => conn.from.equipment === mixer || conn.to.equipment === mixer))
                );
                if (!hasXLRToMixer) {
                    this.showMessage(`⚠ ${mic.dataset.name || 'Microphone'} needs XLR connection to mixer`, 'error');
                    return false;
                }
            }

            // Check mixer to effects processor (if present)
            if (effects.length > 0) {
                for (let effect of effects) {
                    const hasMixerToEffect = this.connections.some(conn =>
                        conn.valid && conn.cableType === 'xlr-cable' &&
                        (conn.from.equipment === effect || conn.to.equipment === effect) &&
                        (mixers.some(mixer => conn.from.equipment === mixer || conn.to.equipment === mixer))
                    );
                    if (!hasMixerToEffect) {
                        this.showMessage('⚠ Effects processor needs XLR connection from mixer', 'error');
                        return false;
                    }
                }
            }

            // Check effects processor to speakers (if present) or mixer to speakers
            for (let speaker of speakers) {
                let hasAudioConnection = false;

                // Check if effects processor is connected to speaker
                if (effects.length > 0) {
                    hasAudioConnection = this.connections.some(conn =>
                        conn.valid && conn.cableType === 'xlr-cable' &&
                        (conn.from.equipment === speaker || conn.to.equipment === speaker) &&
                        (effects.some(effect => conn.from.equipment === effect || conn.to.equipment === effect))
                    );
                }

                // If no effects processor connection, check mixer to speaker
                if (!hasAudioConnection) {
                    hasAudioConnection = this.connections.some(conn =>
                        conn.valid && conn.cableType === 'xlr-cable' &&
                        (conn.from.equipment === speaker || conn.to.equipment === speaker) &&
                        (mixers.some(mixer => conn.from.equipment === mixer || conn.to.equipment === mixer))
                    );
                }

                if (!hasAudioConnection) {
                    this.showMessage(`⚠ ${speaker.dataset.name || 'Speaker'} needs XLR connection from audio source`, 'error');
                    return false;
                }
            }
        } else if (this.currentLevel === 'audio-3') {
            // Level 3 - Complex multi-zone system with wireless monitoring
            const playbackDevices = this.equipment.filter(eq => eq.dataset.type === 'playback-device');
            const wirelessTransmitters = this.equipment.filter(eq => eq.dataset.type === 'wireless-transmitter');
            const wirelessReceivers = this.equipment.filter(eq => eq.dataset.type === 'wireless-receiver');

            console.log('Level 3 validation - Equipment found:', {
                mics: mics.length,
                playbackDevices: playbackDevices.length,
                wirelessTransmitters: wirelessTransmitters.length,
                wirelessReceivers: wirelessReceivers.length,
                mixers: mixers.length,
                speakers: speakers.length
            });

            // Check all mics to mixer
            for (let mic of mics) {
                const hasXLRToMixer = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === mic || conn.to.equipment === mic) &&
                    (mixers.some(mixer => conn.from.equipment === mixer || conn.to.equipment === mixer))
                );
                if (!hasXLRToMixer) {
                    this.showMessage(`⚠ ${mic.dataset.name || 'Microphone'} needs XLR connection to mixer`, 'error');
                    return false;
                }
            }

            // Check playback device to mixer
            for (let playback of playbackDevices) {
                const hasXLRToMixer = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === playback || conn.to.equipment === playback) &&
                    (mixers.some(mixer => conn.from.equipment === mixer || conn.to.equipment === mixer))
                );
                if (!hasXLRToMixer) {
                    this.showMessage('⚠ Music playback needs XLR connection to mixer', 'error');
                    return false;
                }
            }

            // Check mixer to wireless transmitter
            for (let transmitter of wirelessTransmitters) {
                const hasMixerToTransmitter = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === transmitter || conn.to.equipment === transmitter) &&
                    (mixers.some(mixer => conn.from.equipment === mixer || conn.to.equipment === mixer))
                );
                if (!hasMixerToTransmitter) {
                    this.showMessage('⚠ Wireless transmitter needs XLR connection from mixer', 'error');
                    return false;
                }
            }

            // Check wireless transmitter to receivers
            for (let transmitter of wirelessTransmitters) {
                const hasWirelessToReceivers = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'wireless-cable' &&
                    (conn.from.equipment === transmitter || conn.to.equipment === transmitter) &&
                    (wirelessReceivers.some(receiver => conn.from.equipment === receiver || conn.to.equipment === receiver))
                );
                if (!hasWirelessToReceivers) {
                    this.showMessage('⚠ Wireless transmitter needs RF connection to receivers', 'error');
                    return false;
                }
            }

            // Check mixer main outputs to main speakers
            const mainSpeakers = speakers.filter(speaker =>
                speaker.dataset.name && speaker.dataset.name.includes('Main Speaker')
            );
            for (let speaker of mainSpeakers) {
                const hasMainOutput = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === speaker || conn.to.equipment === speaker) &&
                    (mixers.some(mixer => conn.from.equipment === mixer || conn.to.equipment === mixer))
                );
                if (!hasMainOutput) {
                    this.showMessage(`⚠ ${speaker.dataset.name} needs XLR connection from mixer main output`, 'error');
                    return false;
                }
            }

            // Check monitor speakers - they should get audio from wireless receivers, NOT directly from mixer
            const monitorSpeakers = speakers.filter(speaker =>
                speaker.dataset.name && speaker.dataset.name.includes('Monitor Speaker')
            );
            for (let speaker of monitorSpeakers) {
                // Monitor speakers should be connected to wireless receivers, not directly to mixer
                const hasWirelessReceiverConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === speaker || conn.to.equipment === speaker) &&
                    (wirelessReceivers.some(receiver => conn.from.equipment === receiver || conn.to.equipment === receiver))
                );
                if (!hasWirelessReceiverConnection) {
                    this.showMessage(`⚠ ${speaker.dataset.name} needs XLR connection from wireless receiver (not mixer)`, 'error');
                    return false;
                }
            }

        } else {
            // Level 1 - Check wireless mics to receivers
            for (let mic of mics) {
                const hasWirelessConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'wireless-cable' &&
                    (conn.from.equipment === mic || conn.to.equipment === mic)
                );
                if (!hasWirelessConnection) {
                    this.showMessage('⚠ Wireless mics need connection to receiver', 'error');
                    return false;
                }
            }

            // Check receiver to mixer
            for (let receiver of receivers) {
                const hasXLRToMixer = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === receiver || conn.to.equipment === receiver) &&
                    (mixers.some(mixer => conn.from.equipment === mixer || conn.to.equipment === mixer))
                );
                if (!hasXLRToMixer) {
                    this.showMessage('⚠ Mic receiver needs XLR connection to mixer', 'error');
                    return false;
                }
            }

            // Check mixer to speakers
            for (let speaker of speakers) {
                const hasXLRFromMixer = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === speaker || conn.to.equipment === speaker) &&
                    (mixers.some(mixer => conn.from.equipment === mixer || conn.to.equipment === mixer))
                );
                if (!hasXLRFromMixer) {
                    this.showMessage('⚠ Speakers need XLR connection from mixer', 'error');
                    return false;
                }
            }
        }

        console.log('Audio validation passed');
        return true;
    }

    validateWirelessConnections(levelData) {
        // Only validate wireless connections for levels that have wireless equipment
        if (this.currentLevel !== 'audio-1' && this.currentLevel !== 'audio-3') {
            console.log('Skipping wireless validation for level:', this.currentLevel);
            return true;
        }

        if (this.currentLevel === 'audio-1') {
            // Level 1: Wireless mics to receivers
            const wirelessMics = this.equipment.filter(eq => eq.dataset.type === 'microphone');
            const receivers = this.equipment.filter(eq => eq.dataset.type === 'mic-receiver');

            console.log('Level 1 Wireless validation - Equipment found:', {
                wirelessMics: wirelessMics.length,
                receivers: receivers.length
            });

            // Each wireless mic should connect to a receiver
            for (let mic of wirelessMics) {
                const hasReceiverConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'wireless-cable' &&
                    (conn.from.equipment === mic || conn.to.equipment === mic) &&
                    (receivers.some(receiver => conn.from.equipment === receiver || conn.to.equipment === receiver))
                );
                if (!hasReceiverConnection) {
                    this.showMessage('⚠ Wireless mic needs connection to receiver', 'error');
                    return false;
                }
            }
        } else if (this.currentLevel === 'audio-3') {
            // Level 3: Wireless transmitter to receivers (monitoring system)
            const wirelessTransmitters = this.equipment.filter(eq => eq.dataset.type === 'wireless-transmitter');
            const wirelessReceivers = this.equipment.filter(eq => eq.dataset.type === 'wireless-receiver');

            console.log('Level 3 Wireless validation - Equipment found:', {
                wirelessTransmitters: wirelessTransmitters.length,
                wirelessReceivers: wirelessReceivers.length
            });

            // Each wireless transmitter should connect to receivers
            for (let transmitter of wirelessTransmitters) {
                const hasReceiverConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'wireless-cable' &&
                    (conn.from.equipment === transmitter || conn.to.equipment === transmitter) &&
                    (wirelessReceivers.some(receiver => conn.from.equipment === receiver || conn.to.equipment === receiver))
                );
                if (!hasReceiverConnection) {
                    this.showMessage('⚠ Wireless transmitter needs RF connection to receivers', 'error');
                    return false;
                }
            }
        }

        console.log('Wireless validation passed');
        return true;
    }

    validateDMXConnections(levelData) {
        // Only validate DMX connections for lighting levels
        if (!this.currentLevel.includes('lighting')) {
            console.log('Skipping DMX validation for level:', this.currentLevel);
            return true;
        }

        const dmxControllers = this.equipment.filter(eq => eq.dataset.type === 'dmx-controller');
        const lightFixtures = this.equipment.filter(eq => eq.dataset.type === 'light-fixture');

        console.log('DMX validation - Equipment found:', {
            dmxControllers: dmxControllers.length,
            lightFixtures: lightFixtures.length
        });

        // Check if DMX controller is connected to light fixtures
        for (let controller of dmxControllers) {
            const hasDMXConnections = this.connections.some(conn =>
                conn.valid && conn.cableType === 'dmx-cable' &&
                (conn.from.equipment === controller || conn.to.equipment === controller) &&
                (lightFixtures.some(fixture => conn.from.equipment === fixture || conn.to.equipment === fixture))
            );
            if (!hasDMXConnections) {
                this.showMessage('⚠ DMX controller needs connection to light fixtures', 'error');
                return false;
            }
        }

        // Check that all light fixtures are part of the DMX chain
        // A fixture is valid if it has any DMX connection (input or output)
        for (let fixture of lightFixtures) {
            const hasDMXConnection = this.connections.some(conn =>
                conn.valid && conn.cableType === 'dmx-cable' &&
                (conn.from.equipment === fixture || conn.to.equipment === fixture)
            );

            if (!hasDMXConnection) {
                this.showMessage(`⚠ ${fixture.dataset.name || 'Light fixture'} needs to be part of DMX chain`, 'error');
                return false;
            }
        }

        // Verify that the DMX chain is properly connected
        // Check if all fixtures are reachable from the controller through the chain
        const connectedFixtures = this.getConnectedDMXFixtures(dmxControllers[0], lightFixtures);
        const unconnectedFixtures = lightFixtures.filter(fixture => !connectedFixtures.includes(fixture));

        if (unconnectedFixtures.length > 0) {
            const fixtureNames = unconnectedFixtures.map(f => f.dataset.name || 'Light fixture').join(', ');
            this.showMessage(`⚠ Light fixtures not in DMX chain: ${fixtureNames}`, 'error');
            return false;
        }

        console.log('DMX validation passed');
        return true;
    }

    getConnectedDMXFixtures(controller, allFixtures) {
        const connectedFixtures = new Set();
        const visited = new Set();

        // Start from the controller and trace through all DMX connections
        this.traceDMXChain(controller, connectedFixtures, visited);

        // Convert Set to Array and filter to only include fixtures (not controllers)
        return Array.from(connectedFixtures).filter(fixture =>
            fixture.dataset.type === 'light-fixture'
        );
    }

    traceDMXChain(equipment, connectedFixtures, visited) {
        if (visited.has(equipment)) return; // Prevent infinite loops
        visited.add(equipment);

        // Find all DMX connections from this equipment
        const dmxConnections = this.connections.filter(conn =>
            conn.valid && conn.cableType === 'dmx-cable' &&
            (conn.from.equipment === equipment || conn.to.equipment === equipment)
        );

        // For each connection, trace to the connected equipment
        dmxConnections.forEach(conn => {
            const connectedEquipment = conn.from.equipment === equipment ? conn.to.equipment : conn.from.equipment;
            connectedFixtures.add(connectedEquipment);

            // Continue tracing from the connected equipment
            this.traceDMXChain(connectedEquipment, connectedFixtures, visited);
        });
    }

    validateHDMIConnections(levelData) {
        // Only validate HDMI connections for video levels
        if (!this.currentLevel.includes('video')) {
            console.log('Skipping HDMI validation for level:', this.currentLevel);
            return true;
        }

        const videoSources = this.equipment.filter(eq =>
            eq.dataset.type === 'video-source' || eq.dataset.type === 'video-camera'
        );
        const videoDisplays = this.equipment.filter(eq => eq.dataset.type === 'video-display');
        const videoSwitchers = this.equipment.filter(eq => eq.dataset.type === 'video-switcher');
        const videoMixers = this.equipment.filter(eq => eq.dataset.type === 'video-mixer');

        console.log('HDMI validation - Equipment found:', {
            videoSources: videoSources.length,
            videoDisplays: videoDisplays.length,
            videoSwitchers: videoSwitchers.length,
            videoMixers: videoMixers.length
        });

        // For video-1: Simple source to display
        if (this.currentLevel === 'video-1') {
            for (let source of videoSources) {
                const hasDisplayConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'hdmi-cable' &&
                    (conn.from.equipment === source || conn.to.equipment === source) &&
                    (videoDisplays.some(display => conn.from.equipment === display || conn.to.equipment === display))
                );
                if (!hasDisplayConnection) {
                    this.showMessage('⚠ Video source needs HDMI connection to display', 'error');
                    return false;
                }
            }
        }

        // For video-2: Sources to switcher to displays
        if (this.currentLevel === 'video-2') {
            // Check sources to switcher
            for (let source of videoSources) {
                const hasSwitcherConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'hdmi-cable' &&
                    (conn.from.equipment === source || conn.to.equipment === source) &&
                    (videoSwitchers.some(switcher => conn.from.equipment === switcher || conn.to.equipment === switcher))
                );
                if (!hasSwitcherConnection) {
                    this.showMessage('⚠ Video source needs HDMI connection to switcher', 'error');
                    return false;
                }
            }

            // Check switcher to displays
            for (let switcher of videoSwitchers) {
                const hasDisplayConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'hdmi-cable' &&
                    (conn.from.equipment === switcher || conn.to.equipment === switcher) &&
                    (videoDisplays.some(display => conn.from.equipment === display || conn.to.equipment === display))
                );
                if (!hasDisplayConnection) {
                    this.showMessage('⚠ Video switcher needs HDMI connection to displays', 'error');
                    return false;
                }
            }
        }

        // For video-3: Cameras to mixer to display
        if (this.currentLevel === 'video-3') {
            // Check cameras to mixer
            for (let camera of videoSources) {
                const hasMixerConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'hdmi-cable' &&
                    (conn.from.equipment === camera || conn.to.equipment === camera) &&
                    (videoMixers.some(mixer => conn.from.equipment === mixer || conn.to.equipment === mixer))
                );
                if (!hasMixerConnection) {
                    this.showMessage('⚠ Video camera needs HDMI connection to mixer', 'error');
                    return false;
                }
            }

            // Check mixer to display
            for (let mixer of videoMixers) {
                const hasDisplayConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'hdmi-cable' &&
                    (conn.from.equipment === mixer || conn.to.equipment === mixer) &&
                    (videoDisplays.some(display => conn.from.equipment === display || conn.to.equipment === display))
                );
                if (!hasDisplayConnection) {
                    this.showMessage('⚠ Video mixer needs HDMI connection to display', 'error');
                    return false;
                }
            }
        }

        console.log('HDMI validation passed');
        return true;
    }

    createInvalidConnection(from, to, cableType) {
        const cableData = this.getLevelData(this.currentLevel).connections.find(c => c.type === cableType);

        // Use coordinates if available, otherwise fall back to old method
        if (from.coordinates && to.coordinates) {
            const connectionLine = this.drawConnectionLineWithCoordinates(from.coordinates, to.coordinates, '#ff4757');
            this.connections.push({
                from: from,
                to: to,
                line: connectionLine,
                valid: false,
                cableType: cableType
            });
        } else {
            // Fallback for cases where coordinates aren't available
            const connectionLine = this.drawConnectionLine(from, to, '#ff4757');
            this.connections.push({
                from: from,
                to: to,
                line: connectionLine,
                valid: false,
                cableType: cableType
            });
        }
    }

    applyConnectionAnimation(equipment, animationType) {
        if (!animationType) return;

        const equipmentElement = equipment;

        switch (animationType) {
            case 'power-glow':
                equipmentElement.classList.add('power-connected');
                break;
            case 'audio-pulse':
                equipmentElement.classList.add('audio-connected');
                break;
            case 'dmx-circle':
                equipmentElement.classList.add('dmx-connected');
                break;
            case 'ethernet-data':
                equipmentElement.classList.add('ethernet-connected');
                break;
            case 'wireless-signal':
                equipmentElement.classList.add('wireless-connected');
                break;
        }
    }

    // Legacy drawConnectionLine function - disabled to prevent double lines
    drawConnectionLine(from, to, color) {
        console.warn('Legacy drawConnectionLine called - this should not happen. Using coordinate-based drawing instead.');
        return null; // Return null to prevent double lines
    }

    drawConnectionLineWithCoordinates(fromCoords, toCoords, color) {
        const stageArea = document.getElementById('stage-area');

        console.log('Drawing connection line with exact coordinates:', {
            from: fromCoords,
            to: toCoords,
            color: color
        });

        // Create connection line container
        const connectionLine = document.createElement('div');
        connectionLine.className = 'connection-line';
        connectionLine.style.position = 'absolute';
        connectionLine.style.top = '0';
        connectionLine.style.left = '0';
        connectionLine.style.width = '100%';
        connectionLine.style.height = '100%';
        connectionLine.style.zIndex = '1000';
        connectionLine.style.pointerEvents = 'none';

        // Create SVG line using exact coordinates
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '1001';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${fromCoords.x} ${fromCoords.y} L ${toCoords.x} ${toCoords.y}`);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '5');
        path.setAttribute('fill', 'none');

        // Add dashed pattern for invalid connections (red)
        if (color === '#ff4757') {
            path.setAttribute('stroke-dasharray', '5,5');
        }

        svg.appendChild(path);
        connectionLine.appendChild(svg);

        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-connection-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete connection';
        deleteBtn.style.pointerEvents = 'auto';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.deleteConnection(connectionLine, null, null);
        });
        connectionLine.appendChild(deleteBtn);

        // Add click event to select connection
        connectionLine.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectConnection(connectionLine);
        });

        stageArea.appendChild(connectionLine);
        console.log('Connection line created and appended:', connectionLine);

        return connectionLine;
    }

    debugLevel3Validation() {
        console.log('=== LEVEL 3 VALIDATION DEBUG ===');

        const levelData = this.getLevelData(this.currentLevel);
        console.log('Current level:', this.currentLevel);
        console.log('Level data:', levelData);

        // Special debug for lighting levels
        if (this.currentLevel.includes('lighting')) {
            this.debugLightingLevel();
        }

        // Check equipment on stage
        console.log('Equipment on stage:', this.equipment.length);
        this.equipment.forEach((eq, index) => {
            console.log(`Equipment ${index + 1}:`, {
                type: eq.dataset.type,
                name: eq.dataset.name,
                hasPower: this.hasPowerConnection(eq)
            });
        });

        // Check connections
        console.log('Current connections:', this.connections.length);
        this.connections.forEach((conn, index) => {
            console.log(`Connection ${index + 1}:`, {
                valid: conn.valid,
                cableType: conn.cableType,
                from: {
                    type: conn.from.connector.dataset.type,
                    equipment: conn.from.equipment.dataset.type,
                    name: conn.from.equipment.dataset.name
                },
                to: {
                    type: conn.to.connector.dataset.type,
                    equipment: conn.to.equipment.dataset.type,
                    name: conn.to.equipment.dataset.name
                }
            });
        });

        // Run individual validations with detailed output
        console.log('=== INDIVIDUAL VALIDATIONS ===');
        const powerValid = this.validatePowerConnections(levelData);
        const audioValid = this.validateAudioConnections(levelData);
        const wirelessValid = this.validateWirelessConnections(levelData);

        console.log('Power validation:', powerValid);
        console.log('Audio validation:', audioValid);
        console.log('Wireless validation:', wirelessValid);

        // Check what should be required
        const poweredEquipment = levelData.equipment.filter(eq => eq.requiresPower);
        console.log('Powered equipment required:', poweredEquipment.length);
        poweredEquipment.forEach(eq => {
            console.log('-', eq.name, eq.type);
        });

        // Detailed connection analysis
        console.log('=== DETAILED CONNECTION ANALYSIS ===');

        // Count connections by type
        const powerConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'power-cable').length;
        const xlrConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'xlr-cable').length;
        const wirelessConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'wireless-cable').length;

        console.log('Connection counts:', {
            power: powerConnections,
            xlr: xlrConnections,
            wireless: wirelessConnections
        });

        // Check required vs actual
        const requiredConnections = levelData.connections || [];
        const powerRequired = requiredConnections.find(c => c.type === 'power-cable')?.quantity || 0;
        const xlrRequired = requiredConnections.find(c => c.type === 'xlr-cable')?.quantity || 0;
        const wirelessRequired = requiredConnections.find(c => c.type === 'wireless-cable')?.quantity || 0;

        console.log('Required vs Actual:', {
            power: `${powerConnections}/${powerRequired}`,
            xlr: `${xlrConnections}/${xlrRequired}`,
            wireless: `${wirelessConnections}/${wirelessRequired}`
        });

        // Check specific equipment connections
        console.log('=== EQUIPMENT CONNECTION STATUS ===');

        const mics = this.equipment.filter(eq => eq.dataset.type === 'microphone');
        const mixers = this.equipment.filter(eq => eq.dataset.type === 'mixing-console');
        const speakers = this.equipment.filter(eq => eq.dataset.type === 'speaker');
        const wirelessTransmitters = this.equipment.filter(eq => eq.dataset.type === 'wireless-transmitter');
        const wirelessReceivers = this.equipment.filter(eq => eq.dataset.type === 'wireless-receiver');
        const playbackDevices = this.equipment.filter(eq => eq.dataset.type === 'playback-device');

        console.log('Equipment found:', {
            mics: mics.length,
            mixers: mixers.length,
            speakers: speakers.length,
            wirelessTransmitters: wirelessTransmitters.length,
            wirelessReceivers: wirelessReceivers.length,
            playbackDevices: playbackDevices.length
        });

        // Check each piece of equipment
        mics.forEach((mic, index) => {
            const connections = this.connections.filter(conn =>
                conn.valid && (conn.from.equipment === mic || conn.to.equipment === mic)
            );
            console.log(`Mic ${index + 1} (${mic.dataset.name}):`, {
                hasConnections: connections.length,
                connections: connections.map(conn => ({
                    type: conn.cableType,
                    to: conn.from.equipment === mic ? conn.to.equipment.dataset.name : conn.from.equipment.dataset.name
                }))
            });
        });

        mixers.forEach((mixer, index) => {
            const connections = this.connections.filter(conn =>
                conn.valid && (conn.from.equipment === mixer || conn.to.equipment === mixer)
            );
            console.log(`Mixer ${index + 1} (${mixer.dataset.name}):`, {
                hasPower: this.hasPowerConnection(mixer),
                totalConnections: connections.length,
                connections: connections.map(conn => ({
                    type: conn.cableType,
                    to: conn.from.equipment === mixer ? conn.to.equipment.dataset.name : conn.from.equipment.dataset.name
                }))
            });
        });

        speakers.forEach((speaker, index) => {
            const connections = this.connections.filter(conn =>
                conn.valid && (conn.from.equipment === speaker || conn.to.equipment === speaker)
            );
            console.log(`Speaker ${index + 1} (${speaker.dataset.name}):`, {
                hasPower: this.hasPowerConnection(speaker),
                hasAudio: connections.some(conn => conn.cableType === 'xlr-cable'),
                totalConnections: connections.length,
                connections: connections.map(conn => ({
                    type: conn.cableType,
                    to: conn.from.equipment === speaker ? conn.to.equipment.dataset.name : conn.from.equipment.dataset.name
                }))
            });
        });

        wirelessTransmitters.forEach((transmitter, index) => {
            const connections = this.connections.filter(conn =>
                conn.valid && (conn.from.equipment === transmitter || conn.to.equipment === transmitter)
            );
            console.log(`Wireless Transmitter ${index + 1} (${transmitter.dataset.name}):`, {
                hasPower: this.hasPowerConnection(transmitter),
                hasAudio: connections.some(conn => conn.cableType === 'xlr-cable'),
                hasWireless: connections.some(conn => conn.cableType === 'wireless-cable'),
                totalConnections: connections.length,
                connections: connections.map(conn => ({
                    type: conn.cableType,
                    to: conn.from.equipment === transmitter ? conn.to.equipment.dataset.name : conn.from.equipment.dataset.name
                }))
            });
        });

        wirelessReceivers.forEach((receiver, index) => {
            const connections = this.connections.filter(conn =>
                conn.valid && (conn.from.equipment === receiver || conn.to.equipment === receiver)
            );
            console.log(`Wireless Receiver ${index + 1} (${receiver.dataset.name}):`, {
                hasPower: this.hasPowerConnection(receiver),
                hasWireless: connections.some(conn => conn.cableType === 'wireless-cable'),
                totalConnections: connections.length,
                connections: connections.map(conn => ({
                    type: conn.cableType,
                    to: conn.from.equipment === receiver ? conn.to.equipment.dataset.name : conn.from.equipment.dataset.name
                }))
            });
        });

        playbackDevices.forEach((playback, index) => {
            const connections = this.connections.filter(conn =>
                conn.valid && (conn.from.equipment === playback || conn.to.equipment === playback)
            );
            console.log(`Playback Device ${index + 1} (${playback.dataset.name}):`, {
                hasPower: this.hasPowerConnection(playback),
                hasAudio: connections.some(conn => conn.cableType === 'xlr-cable'),
                totalConnections: connections.length,
                connections: connections.map(conn => ({
                    type: conn.cableType,
                    to: conn.from.equipment === playback ? conn.to.equipment.dataset.name : conn.from.equipment.dataset.name
                }))
            });
        });

        this.showMessage('Level 3 debug info logged to console', 'info');
    }

    highlightMissingConnections() {
        console.log('=== HIGHLIGHTING MISSING CONNECTIONS ===');

        // Remove any existing red borders from all equipment
        this.equipment.forEach(equipment => {
            equipment.classList.remove('missing-connection-border');
        });

        const levelData = this.getLevelData(this.currentLevel);
        if (!levelData) return;

        // Check each piece of equipment for missing connections
        this.equipment.forEach(equipment => {
            const equipmentType = equipment.dataset.type;
            const equipmentName = equipment.dataset.name;
            const missingConnections = [];

            // Check power connections
            const equipmentData = this.getEquipmentData(equipmentType);
            if (equipmentData && equipmentData.requiresPower && !this.hasPowerConnection(equipment)) {
                missingConnections.push('Power');
            }

            // Check audio connections based on equipment type
            if (equipmentType === 'microphone') {
                const hasAudioConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === equipment || conn.to.equipment === equipment)
                );
                if (!hasAudioConnection) {
                    missingConnections.push('XLR Audio');
                }
            }

            if (equipmentType === 'speaker') {
                const hasAudioConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === equipment || conn.to.equipment === equipment)
                );
                if (!hasAudioConnection) {
                    missingConnections.push('XLR Audio');
                }
            }

            if (equipmentType === 'wireless-transmitter') {
                const hasAudioConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === equipment || conn.to.equipment === equipment)
                );
                const hasWirelessConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'wireless-cable' &&
                    (conn.from.equipment === equipment || conn.to.equipment === equipment)
                );

                if (!hasAudioConnection) {
                    missingConnections.push('XLR Audio');
                }
                if (!hasWirelessConnection) {
                    missingConnections.push('Wireless');
                }
            }

            if (equipmentType === 'wireless-receiver') {
                const hasWirelessConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'wireless-cable' &&
                    (conn.from.equipment === equipment || conn.to.equipment === equipment)
                );

                if (!hasWirelessConnection) {
                    missingConnections.push('Wireless');
                }
            }

            if (equipmentType === 'playback-device') {
                const hasAudioConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'xlr-cable' &&
                    (conn.from.equipment === equipment || conn.to.equipment === equipment)
                );

                if (!hasAudioConnection) {
                    missingConnections.push('XLR Audio');
                }
            }

            // Check lighting equipment
            if (equipmentType === 'light-fixture') {
                const hasDMXConnection = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'dmx-cable' &&
                    (conn.from.equipment === equipment || conn.to.equipment === equipment)
                );

                if (!hasDMXConnection) {
                    missingConnections.push('DMX Control');
                } else {
                    // Check if this fixture is part of a valid DMX chain
                    const dmxControllers = this.equipment.filter(eq => eq.dataset.type === 'dmx-controller');
                    if (dmxControllers.length > 0) {
                        const connectedFixtures = this.getConnectedDMXFixtures(dmxControllers[0], this.equipment.filter(eq => eq.dataset.type === 'light-fixture'));
                        if (!connectedFixtures.includes(equipment)) {
                            missingConnections.push('DMX Chain');
                        }
                    }
                }
            }

            if (equipmentType === 'dmx-controller') {
                const hasDMXConnections = this.connections.some(conn =>
                    conn.valid && conn.cableType === 'dmx-cable' &&
                    (conn.from.equipment === equipment || conn.to.equipment === equipment)
                );

                if (!hasDMXConnections) {
                    missingConnections.push('DMX Output');
                }
            }

            // Add red border if missing connections
            if (missingConnections.length > 0) {
                equipment.classList.add('missing-connection-border');
                console.log(`${equipmentName} missing: ${missingConnections.join(', ')}`);
            }
        });

        this.showMessage('Missing connections highlighted with red borders', 'info');
    }

    debugLightingLevel() {
        console.log('=== LIGHTING LEVEL DEBUG ===');

        const levelData = this.getLevelData(this.currentLevel);
        console.log('Lighting level:', this.currentLevel);

        // Check lighting-specific equipment
        const dmxControllers = this.equipment.filter(eq => eq.dataset.type === 'dmx-controller');
        const lightFixtures = this.equipment.filter(eq => eq.dataset.type === 'light-fixture');
        const powerDistros = this.equipment.filter(eq => eq.dataset.type === 'power-distro');

        console.log('Lighting equipment found:', {
            dmxControllers: dmxControllers.length,
            lightFixtures: lightFixtures.length,
            powerDistros: powerDistros.length
        });

        // Check each light fixture
        lightFixtures.forEach((fixture, index) => {
            const hasPower = this.hasPowerConnection(fixture);
            const hasDMX = this.connections.some(conn =>
                conn.valid && conn.cableType === 'dmx-cable' &&
                (conn.from.equipment === fixture || conn.to.equipment === fixture)
            );

            console.log(`Light fixture ${index + 1} (${fixture.dataset.name}):`, {
                hasPower: hasPower,
                hasDMX: hasDMX,
                missing: []
            });

            if (!hasPower) console.log(`  - Missing power connection`);
            if (!hasDMX) console.log(`  - Missing DMX connection`);
        });

        // Check DMX chain connectivity
        if (dmxControllers.length > 0) {
            const connectedFixtures = this.getConnectedDMXFixtures(dmxControllers[0], lightFixtures);
            const unconnectedFixtures = lightFixtures.filter(fixture => !connectedFixtures.includes(fixture));

            console.log('DMX Chain Analysis:', {
                totalFixtures: lightFixtures.length,
                connectedFixtures: connectedFixtures.length,
                unconnectedFixtures: unconnectedFixtures.length,
                chainValid: unconnectedFixtures.length === 0
            });

            if (unconnectedFixtures.length > 0) {
                console.log('Unconnected fixtures:', unconnectedFixtures.map(f => f.dataset.name));
            }
        }

        // Check DMX controller
        dmxControllers.forEach((controller, index) => {
            const hasPower = this.hasPowerConnection(controller);
            const dmxConnections = this.connections.filter(conn =>
                conn.valid && conn.cableType === 'dmx-cable' &&
                (conn.from.equipment === controller || conn.to.equipment === controller)
            );

            console.log(`DMX Controller ${index + 1} (${controller.dataset.name}):`, {
                hasPower: hasPower,
                dmxConnections: dmxConnections.length,
                connectedTo: dmxConnections.map(conn => {
                    const otherEquipment = conn.from.equipment === controller ? conn.to.equipment : conn.from.equipment;
                    return otherEquipment.dataset.name;
                })
            });
        });

        // Check power distribution
        powerDistros.forEach((distro, index) => {
            const powerConnections = this.connections.filter(conn =>
                conn.valid && conn.cableType === 'power-cable' &&
                (conn.from.equipment === distro || conn.to.equipment === distro)
            );

            console.log(`Power Distribution ${index + 1} (${distro.dataset.name}):`, {
                powerConnections: powerConnections.length,
                connectedTo: powerConnections.map(conn => {
                    const otherEquipment = conn.from.equipment === distro ? conn.to.equipment : conn.from.equipment;
                    return otherEquipment.dataset.name;
                })
            });
        });

        // Run lighting-specific validations
        console.log('=== LIGHTING VALIDATIONS ===');
        const powerValid = this.validatePowerConnections(levelData);
        const dmxValid = this.validateDMXConnections(levelData);

        console.log('Power validation:', powerValid);
        console.log('DMX validation:', dmxValid);

        // Check required vs actual connections
        const powerConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'power-cable').length;
        const dmxConnections = this.connections.filter(conn => conn.valid && conn.cableType === 'dmx-cable').length;

        const powerRequired = levelData.connections.find(c => c.type === 'power-cable')?.quantity || 0;
        const dmxRequired = levelData.connections.find(c => c.type === 'dmx-cable')?.quantity || 0;

        console.log('Connection counts:', {
            power: `${powerConnections}/${powerRequired}`,
            dmx: `${dmxConnections}/${dmxRequired}`
        });

        console.log('=== LIGHTING DEBUG COMPLETE ===');
    }

    debugConnectionProgress() {
        console.log('=== CONNECTION PROGRESS DEBUG ===');

        const levelData = this.getLevelData(this.currentLevel);
        console.log('Current level:', this.currentLevel);
        console.log('Level data connections:', levelData?.connections);

        console.log('Current connection progress:', this.connectionProgress);

        console.log('All connections:', this.connections.length);
        this.connections.forEach((conn, index) => {
            console.log(`Connection ${index + 1}:`, {
                valid: conn.valid,
                cableType: conn.cableType,
                from: conn.from?.equipment?.dataset?.type,
                to: conn.to?.equipment?.dataset?.type
            });
        });

        // Count by type
        const powerCount = this.connections.filter(conn => conn.valid && conn.cableType === 'power-cable').length;
        const xlrCount = this.connections.filter(conn => conn.valid && conn.cableType === 'xlr-cable').length;
        const wirelessCount = this.connections.filter(conn => conn.valid && conn.cableType === 'wireless-cable').length;
        const ethernetCount = this.connections.filter(conn => conn.valid && conn.cableType === 'ethernet-cable').length;
        const dmxCount = this.connections.filter(conn => conn.valid && conn.cableType === 'dmx-cable').length;

        console.log('Connection counts by type:', {
            power: powerCount,
            xlr: xlrCount,
            wireless: wirelessCount,
            ethernet: ethernetCount,
            dmx: dmxCount
        });

        this.showMessage('Connection progress debug logged to console', 'info');
    }

    awardPoints(points, reason) {
        this.gameState.score += points;
        this.updateGameStats();
        this.showMessage(`+${points} points: ${reason}`, 'success');
    }

    selectEquipment(equipment) {
        // Deselect previous
        document.querySelectorAll('.equipment').forEach(eq => eq.classList.remove('selected'));

        // Select new
        equipment.classList.add('selected');
        this.selectedEquipment = equipment;
    }

    openEquipmentSettings(equipment) {
        // Create settings panel
        const settingsPanel = document.createElement('div');
        settingsPanel.className = 'settings-panel';
        settingsPanel.style.left = (equipment.offsetLeft + 70) + 'px';
        settingsPanel.style.top = equipment.offsetTop + 'px';

        const levelData = this.getLevelData(this.currentLevel);
        const settings = levelData.settings || [];

        settingsPanel.innerHTML = `
            <h4>${equipment.dataset.name} Settings</h4>
            ${settings.map(setting => `
                <div class="setting-item">
                    <label>${setting.name}</label>
                    <input type="range" min="0" max="100" value="50" data-setting="${setting.type}">
                </div>
            `).join('')}
            <button onclick="this.parentElement.remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #00ff88; border: none; border-radius: 5px; color: white; cursor: pointer;">Close</button>
        `;

        document.getElementById('stage-area').appendChild(settingsPanel);
    }

    openSettings(setting) {
        this.showMessage(`Opening ${setting.name} settings...`, 'info');
    }

    makeEquipmentDraggable(equipment) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        let animationFrameId = null;
        let lastUpdateTime = 0;
        const UPDATE_THROTTLE = 16; // ~60fps

        equipment.addEventListener('mousedown', (e) => {
            // Don't start drag if clicking on connector, connector dot, or help button
            if (e.target.closest('.connector') || e.target.closest('.connector-dot') || e.target.closest('.equipment-help')) {
                console.log('Connector or help button clicked - preventing drag');
                return;
            }

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(equipment.style.left) || 0;
            startTop = parseInt(equipment.style.top) || 0;

            equipment.style.cursor = 'grabbing';
            equipment.style.zIndex = '100';
            equipment.classList.add('dragging');

            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const currentTime = Date.now();
            if (currentTime - lastUpdateTime < UPDATE_THROTTLE) return;
            lastUpdateTime = currentTime;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            // Calculate new position
            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;

            // Get stage boundaries
            const stageArea = document.getElementById('stage-area');
            const stageRect = stageArea.getBoundingClientRect();
            const equipmentRect = equipment.getBoundingClientRect();
            const equipmentWidth = equipmentRect.width;
            const equipmentHeight = equipmentRect.height;

            // Constrain to stage boundaries
            const maxLeft = stageRect.width - equipmentWidth;
            const maxTop = stageRect.height - equipmentHeight;

            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));

            equipment.style.left = newLeft + 'px';
            equipment.style.top = newTop + 'px';

            // Add visual feedback when at boundaries
            const isAtBoundary = newLeft <= 0 || newLeft >= maxLeft || newTop <= 0 || newTop >= maxTop;
            equipment.classList.toggle('at-boundary', isAtBoundary);

            // Update connection lines in real-time during drag
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = requestAnimationFrame(() => {
                this.updateConnectionLinesDuringDrag(equipment);
            });
        });

        document.addEventListener('mouseup', (e) => {
            if (isDragging) {
                console.log('Mouse up detected - ending drag for equipment:', equipment);
                isDragging = false;
                equipment.style.cursor = 'move';
                equipment.style.zIndex = '10';
                equipment.classList.remove('dragging', 'at-boundary');

                // Cancel any pending animation frame
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }

                // Force a complete redraw of all connection lines after drop
                console.log('Triggering complete line redraw after drop');
                setTimeout(() => {
                    this.updateConnectionLines();
                    console.log('Line redraw completed after drop');
                }, 10);

                // Ensure connectors remain clickable after updating lines
                this.resetConnectorStates();

                // Update progress after moving
                this.updateConnectionProgress();
            }
        });

        // Also listen for the drop event on the stage area
        const stageArea = document.getElementById('stage-area');
        if (stageArea) {
            stageArea.addEventListener('drop', (e) => {
                if (isDragging) {
                    console.log('Drop event detected on stage area');
                    // The mouseup handler will handle the line redraw
                }
            });
        }

        // Listen for mouseleave on the document to handle edge cases
        document.addEventListener('mouseleave', (e) => {
            if (isDragging) {
                console.log('Mouse left document - ending drag');
                isDragging = false;
                equipment.style.cursor = 'move';
                equipment.style.zIndex = '10';
                equipment.classList.remove('dragging', 'at-boundary');

                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }

                // Force redraw when mouse leaves document
                setTimeout(() => {
                    this.updateConnectionLines();
                }, 10);
            }
        });
    }

    updateConnectionLinesDuringDrag(draggedEquipment) {
        console.log('updateConnectionLinesDuringDrag called for equipment:', draggedEquipment);

        // Only update lines that are connected to the dragged equipment
        this.connections.forEach((conn, index) => {
            if (conn.valid && (conn.from.equipment === draggedEquipment || conn.to.equipment === draggedEquipment)) {
                console.log(`Updating connection ${index} during drag:`, conn);

                // Check if connectors still exist
                if (!conn.from.connector || !conn.to.connector) {
                    console.log(`Connection ${index} has missing connectors, skipping`);
                    return;
                }

                // Get current coordinates for both ends
                const fromCoords = this.getConnectorCoordinates(conn.from.connector);
                const toCoords = this.getConnectorCoordinates(conn.to.connector);

                console.log(`Connection ${index} current coordinates:`, { fromCoords, toCoords });

                // Update the stored coordinates
                conn.from.coordinates = fromCoords;
                conn.to.coordinates = toCoords;

                // Update the existing line if it exists
                if (conn.line && fromCoords && toCoords) {
                    this.updateConnectionLinePosition(conn.line, fromCoords, toCoords);
                    console.log(`Connection ${index} line position updated`);
                } else {
                    console.log(`Connection ${index} line not found or coordinates invalid`);
                }
            }
        });
    }

    updateConnectionLinePosition(lineElement, fromCoords, toCoords) {
        if (!lineElement) return;

        const svg = lineElement.querySelector('svg');
        if (!svg) return;

        const path = svg.querySelector('path');
        if (!path) return;

        // Update the SVG path with new coordinates
        path.setAttribute('d', `M ${fromCoords.x} ${fromCoords.y} L ${toCoords.x} ${toCoords.y}`);
    }

    updateConnectionLines() {
        console.log('updateConnectionLines called, connections count:', this.connections.length);

        // Remove old connection lines
        const oldLines = document.querySelectorAll('.connection-line');
        console.log('Removing old lines:', oldLines.length);
        oldLines.forEach(line => line.remove());

        // Force a small delay to ensure DOM is updated
        setTimeout(() => {
            this.redrawAllConnectionLines();
        }, 5);
    }

    redrawAllConnectionLines() {
        console.log('redrawAllConnectionLines called');

        // Redraw all connections with updated coordinates
        this.connections.forEach((conn, index) => {
            if (conn.valid) {
                console.log(`Processing connection ${index}:`, {
                    from: conn.from,
                    to: conn.to,
                    fromConnector: conn.from.connector,
                    toConnector: conn.to.connector,
                    fromEquipment: conn.from.equipment,
                    toEquipment: conn.to.equipment
                });

                // Check if connectors still exist
                if (!conn.from.connector || !conn.to.connector) {
                    console.log(`Connection ${index} has missing connectors, skipping`);
                    return;
                }

                // Use connector color instead of cable color
                const connectorColor = this.getConnectorColor(conn.from.connector.dataset.type);

                // Recalculate coordinates for both ends of the connection
                const fromCoords = this.getConnectorCoordinates(conn.from.connector);
                const toCoords = this.getConnectorCoordinates(conn.to.connector);

                console.log(`Connection ${index} coordinates:`, { fromCoords, toCoords });

                // Update the stored coordinates
                conn.from.coordinates = fromCoords;
                conn.to.coordinates = toCoords;

                // Draw the line with updated coordinates
                if (fromCoords && toCoords) {
                    conn.line = this.drawConnectionLineWithCoordinates(fromCoords, toCoords, connectorColor);
                    console.log(`Connection ${index} line drawn:`, conn.line);
                } else {
                    // Fallback to old method if coordinates can't be calculated
                    console.log(`Connection ${index} using fallback method`);
                    conn.line = this.drawConnectionLine(conn.from, conn.to, connectorColor);
                }
            } else {
                console.log(`Connection ${index} is not valid, skipping`);
            }
        });

        // Check final result
        const newLines = document.querySelectorAll('.connection-line');
        console.log('New lines created:', newLines.length);
    }

    debugConnectionLines() {
        console.log('=== CONNECTION LINES DEBUG ===');
        console.log('Total connections:', this.connections.length);

        this.connections.forEach((conn, index) => {
            console.log(`Connection ${index}:`, {
                valid: conn.valid,
                from: conn.from,
                to: conn.to,
                line: conn.line,
                fromConnector: conn.from?.connector,
                toConnector: conn.to?.connector,
                fromCoords: conn.from?.coordinates,
                toCoords: conn.to?.coordinates
            });
        });

        const visibleLines = document.querySelectorAll('.connection-line');
        console.log('Visible connection lines:', visibleLines.length);
        visibleLines.forEach((line, index) => {
            console.log(`Visible line ${index}:`, line);
        });
    }

    getConnectorCoordinates(connector) {
        if (!connector) {
            console.log('getConnectorCoordinates: connector is null');
            return null;
        }

        console.log('getConnectorCoordinates: processing connector:', connector);

        const stageArea = document.getElementById('stage-area');
        if (!stageArea) {
            console.log('getConnectorCoordinates: stage area not found');
            return null;
        }

        const stageRect = stageArea.getBoundingClientRect();
        const connectorRect = connector.getBoundingClientRect();

        console.log('getConnectorCoordinates: rects:', {
            stageRect: { left: stageRect.left, top: stageRect.top, width: stageRect.width, height: stageRect.height },
            connectorRect: { left: connectorRect.left, top: connectorRect.top, width: connectorRect.width, height: connectorRect.height }
        });

        // Calculate center point of the connector relative to the stage
        const centerX = connectorRect.left + connectorRect.width / 2 - stageRect.left;
        const centerY = connectorRect.top + connectorRect.height / 2 - stageRect.top;

        const coords = { x: centerX, y: centerY };
        console.log('getConnectorCoordinates: calculated coords:', coords);

        return coords;
    }

    deleteConnection(connectionLine, from, to) {
        // Remove from connections array
        const connectionIndex = this.connections.findIndex(conn =>
            (conn.from === from && conn.to === to) || (conn.from === to && conn.to === from)
        );

        if (connectionIndex !== -1) {
            const connection = this.connections[connectionIndex];

            // Remove animations from equipment
            this.removeConnectionAnimation(from.equipment, connection.cableType);
            this.removeConnectionAnimation(to.equipment, connection.cableType);

            // Remove connection
            this.connections.splice(connectionIndex, 1);

            // Remove visual line
            connectionLine.remove();

            // Update progress
            this.updateConnectionProgress();

            // Show message
            this.showMessage('Connection deleted', 'info');
        }
    }

    selectConnection(connectionLine) {
        // Deselect other connections
        document.querySelectorAll('.connection-line').forEach(line => {
            line.classList.remove('selected');
        });

        // Select this connection
        connectionLine.classList.add('selected');
    }

    removeConnectionAnimation(equipment, cableType) {
        // Remove specific animation class based on cable type
        switch (cableType) {
            case 'power-cable':
                equipment.classList.remove('power-connected');
                break;
            case 'xlr-cable':
                equipment.classList.remove('audio-connected');
                break;
            case 'wireless-cable':
                equipment.classList.remove('wireless-connected');
                break;
            case 'dmx-cable':
                equipment.classList.remove('dmx-connected');
                break;
            case 'ethernet-cable':
                equipment.classList.remove('ethernet-connected');
                break;
        }
    }

    clearStage() {
        document.getElementById('stage-area').innerHTML = '';
        this.equipment = [];
        this.connections = [];
        this.selectedEquipment = null;
        this.selectedConnector = null;
        this.connectionLines = [];
        this.successfulConnections = 0;

        // Stop any active audio
        this.stopRealAudio();
    }

    showWinnerCelebration() {
        this.stopGameTimer();

        // Play victory sound
        this.playVictorySound();

        // Play background music
        this.playBackgroundMusic();

        // Create winner overlay
        const winnerOverlay = document.createElement('div');
        winnerOverlay.className = 'winner-overlay';
        winnerOverlay.innerHTML = `
            <div class="winner-content">
                <div class="winner-icon">🏆</div>
                <h1 class="winner-title">YOU ARE A WINNER!</h1>
                <div class="winner-score">
                    <div class="score-item">
                        <span class="label">Total Score:</span>
                        <span class="value">${this.gameState.score}</span>
                    </div>
                    <div class="score-item">
                        <span class="label">Connections:</span>
                        <span class="value">${this.successfulConnections}/${this.totalRequiredConnections}</span>
                    </div>
                    <div class="score-item">
                        <span class="label">Time:</span>
                        <span class="value">${Math.floor(this.gameState.time / 60)}:${(this.gameState.time % 60).toString().padStart(2, '0')}</span>
                    </div>
                </div>
                <div class="winner-buttons">
                    <button id="next-level-btn" class="winner-btn primary">
                        <i class="fas fa-arrow-right"></i>
                        Next Level
                    </button>
                    <button id="restart-game-btn" class="winner-btn secondary">
                        <i class="fas fa-redo"></i>
                        Restart Game
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(winnerOverlay);

        // Add event listeners
        document.getElementById('next-level-btn').addEventListener('click', () => {
            winnerOverlay.remove();
            this.nextLevel();
        });

        document.getElementById('restart-game-btn').addEventListener('click', () => {
            winnerOverlay.remove();
            this.restartLevel();
        });

        // Start confetti animation
        this.startConfetti();
    }

    startConfetti() {
        const colors = ['#ff6b35', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];

        for (let i = 0; i < 150; i++) {
            setTimeout(() => {
                this.createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 20);
        }
    }

    createConfettiPiece(color) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = color;
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';

        document.body.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 5000);
    }

    playVictorySound() {
        // Play a victory melody
        this.playSound(523, 0.2, 'sine'); // C
        setTimeout(() => this.playSound(659, 0.2, 'sine'), 200); // E
        setTimeout(() => this.playSound(784, 0.2, 'sine'), 400); // G
        setTimeout(() => this.playSound(1047, 0.4, 'sine'), 600); // C (high)
    }

    restartGame() {
        // Reset all game state
        this.gameState = {
            score: 0,
            lives: 3,
            time: 0,
            completedLevels: [],
            unlockedLevels: ['audio-1']
        };

        // Clear stage and return to main menu
        this.clearStage();
        this.showMainMenu();
    }

    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.gameState.time++;
            this.updateGameStats();
        }, 1000);
    }

    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    updateGameStats() {
        document.getElementById('game-score').textContent = this.gameState.score;
        document.getElementById('game-lives').textContent = this.gameState.lives;

        const minutes = Math.floor(this.gameState.time / 60);
        const seconds = this.gameState.time % 60;
        document.getElementById('game-time').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    testSetup() {
        const levelData = this.getLevelData(this.currentLevel);
        if (!levelData) return;

        // First validate all connections
        if (!this.validateAllConnections()) {
            this.showMessage('❌ System test failed! Check all connections before testing.', 'error');
            return;
        }

        // Start audio system test
        this.startAudioSystemTest();
    }

    async startAudioSystemTest() {
        this.showMessage('🎵 Testing audio system...', 'info');

        // Request microphone access first
        const micAccess = await this.requestMicrophoneAccess();

        // Create test overlay
        const testOverlay = document.createElement('div');
        testOverlay.className = 'test-overlay';
        testOverlay.innerHTML = `
            <div class="test-content">
                <h2>🎵 Audio System Test</h2>
                <div class="test-progress">
                    <div class="test-step" data-step="1">
                        <i class="fas fa-microphone"></i>
                        <span>Testing microphone input...</span>
                    </div>
                    <div class="test-step" data-step="2">
                        <i class="fas fa-sliders-h"></i>
                        <span>Testing mixer processing...</span>
                    </div>
                    <div class="test-step" data-step="3">
                        <i class="fas fa-volume-up"></i>
                        <span>Testing speaker output...</span>
                    </div>
                </div>
                <div class="test-result">
                    <div class="result-icon">⏳</div>
                    <div class="result-text">Running tests...</div>
                </div>
            </div>
        `;

        document.body.appendChild(testOverlay);

        // Start test sequence
        setTimeout(() => this.runTestStep(1, testOverlay, micAccess), 1000);
        setTimeout(() => this.runTestStep(2, testOverlay, micAccess), 3000);
        setTimeout(() => this.runTestStep(3, testOverlay, micAccess), 5000);
        setTimeout(() => this.completeAudioTest(testOverlay, micAccess), 7000);
    }

    runTestStep(step, overlay, micAccess) {
        const stepElement = overlay.querySelector(`[data-step="${step}"]`);
        stepElement.classList.add('active');

        switch (step) {
            case 1:
                if (micAccess) {
                    this.playTestSound(800, 0.5, 'sine'); // Mic test
                    stepElement.querySelector('span').textContent = 'Microphone access granted!';
                } else {
                    stepElement.querySelector('span').textContent = 'Microphone access denied - using test tones';
                    this.playTestSound(800, 0.5, 'sine');
                }
                break;
            case 2:
                this.playTestSound(600, 0.5, 'square'); // Mixer test
                stepElement.querySelector('span').textContent = 'Mixer processing audio signal...';
                break;
            case 3:
                this.playTestSound(400, 0.5, 'triangle'); // Speaker test
                stepElement.querySelector('span').textContent = 'Speakers outputting audio...';
                break;
        }
    }

    completeAudioTest(overlay, micAccess) {
        const resultElement = overlay.querySelector('.test-result');

        if (micAccess) {
            resultElement.innerHTML = `
                <div class="result-icon">✅</div>
                <div class="result-text">All tests passed! Audio system working perfectly!</div>
                <div class="audio-controls">
                    <button id="start-live-audio" class="test-btn primary">🎤 Start Live Audio</button>
                    <button id="close-test" class="test-btn secondary">Continue</button>
                </div>
            `;

            // Add event listeners
            document.getElementById('start-live-audio').addEventListener('click', () => {
                this.startRealAudio();
                resultElement.innerHTML = `
                    <div class="result-icon">🎵</div>
                    <div class="result-text">Live audio active! Speak into your microphone to test the system.</div>
                    <div class="audio-controls">
                        <button id="stop-live-audio" class="test-btn secondary">Stop Audio</button>
                        <button id="close-test" class="test-btn primary">Continue</button>
                    </div>
                `;

                document.getElementById('stop-live-audio').addEventListener('click', () => {
                    this.stopRealAudio();
                    this.completeAudioTest(overlay, micAccess);
                });
            });
        } else {
            resultElement.innerHTML = `
                <div class="result-icon">✅</div>
                <div class="result-text">All tests passed! (Microphone access not available)</div>
                <button id="close-test" class="test-btn">Continue</button>
            `;
        }

        // Play success sound
        this.playVictorySound();

        // Add event listener to close test
        document.getElementById('close-test').addEventListener('click', () => {
            this.stopRealAudio();
            overlay.remove();
            this.showWinnerCelebration();
        });
    }

    playTestSound(frequency, duration, type) {
        this.playSound(frequency, duration, type);
    }

    playBackgroundMusic() {
        // Create a simple background music using Web Audio API
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Create a simple melody
        const notes = [523, 659, 784, 1047, 784, 659]; // C, E, G, C, G, E
        let currentNote = 0;

        oscillator.frequency.setValueAtTime(notes[currentNote], this.audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);

        oscillator.start(this.audioContext.currentTime);

        // Change notes every 2 seconds
        const noteInterval = setInterval(() => {
            currentNote = (currentNote + 1) % notes.length;
            oscillator.frequency.setValueAtTime(notes[currentNote], this.audioContext.currentTime);
        }, 2000);

        // Stop after 10 seconds
        setTimeout(() => {
            clearInterval(noteInterval);
            oscillator.stop();
        }, 10000);
    }

    completeLevel() {
        this.stopGameTimer();

        // Add to completed levels
        if (!this.gameState.completedLevels.includes(this.currentLevel)) {
            this.gameState.completedLevels.push(this.currentLevel);
        }

        // Unlock next level
        this.unlockNextLevel();

        // Save game state
        this.saveGameState();

        // Update level status
        this.updateLevelStatus();

        // Show completion screen
        this.showLevelComplete();
    }

    unlockNextLevel() {
        const levelOrder = [
            'audio-1', 'audio-2', 'audio-3',
            'lighting-1', 'lighting-2', 'lighting-3',
            'video-1', 'video-2', 'video-3',
            'set-1', 'set-2', 'set-3'
        ];

        const currentIndex = levelOrder.indexOf(this.currentLevel);
        if (currentIndex >= 0 && currentIndex < levelOrder.length - 1) {
            const nextLevel = levelOrder[currentIndex + 1];
            if (!this.gameState.unlockedLevels.includes(nextLevel)) {
                this.gameState.unlockedLevels.push(nextLevel);
                console.log(`Unlocked level: ${nextLevel}`);
            }
        }
    }

    showLevelComplete() {
        const finalScore = this.gameState.score;
        const finalTime = this.gameState.time;
        const stars = Math.min(3, Math.floor(finalScore / 100));

        document.getElementById('final-score').textContent = finalScore;
        document.getElementById('final-time').textContent =
            `${Math.floor(finalTime / 60)}:${(finalTime % 60).toString().padStart(2, '0')}`;
        document.getElementById('final-stars').textContent = stars;

        this.switchScreen('level-complete');
    }

    pauseGame() {
        this.stopGameTimer();
        this.switchScreen('pause-menu');
    }

    resumeGame() {
        this.switchScreen('game-play');
        this.startGameTimer();
    }

    restartLevel() {
        this.loadLevel(this.currentLevel);
        this.switchScreen('game-play');
    }

    resetLevel() {
        this.clearStage();
        this.loadLevel(this.currentLevel);
    }

    showHint() {
        const hint = this.generateHint();
        this.showHintPopup(hint);
    }

    showDetailedHint() {
        const detailedHint = this.generateDetailedHint();
        this.showHintPopup(detailedHint, true);

        // Apply point penalty
        const penalty = 50;
        this.gameState.score = Math.max(0, this.gameState.score - penalty);
        this.updateGameStats();

        // Show penalty message
        this.showMessage(`-${penalty} points for using detailed hint`, 'error');
    }

    showHintPopup(message, isDetailed = false) {
        // Remove any existing hint popup
        const existingPopup = document.querySelector('.hint-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create hint popup container
        const popup = document.createElement('div');
        popup.className = 'hint-popup';

        // Create popup content with different headers based on hint type
        const headerTitle = isDetailed ? '🔍 Detailed Hint' : '💡 Hint';
        const headerClass = isDetailed ? 'hint-header detailed' : 'hint-header';

        popup.innerHTML = `
            <div class="hint-content">
                <div class="${headerClass}">
                    <h3>${headerTitle}</h3>
                    <button class="hint-close-btn" title="Close hint">×</button>
                </div>
                <div class="hint-body">
                    ${message.replace(/\n\n/g, '<br><br>')}
                </div>
                ${isDetailed ? '<div class="hint-penalty">⚠️ -50 points for using detailed hint</div>' : ''}
            </div>
        `;

        // Add close button functionality
        const closeBtn = popup.querySelector('.hint-close-btn');
        closeBtn.addEventListener('click', () => {
            popup.classList.add('hint-fade-out');
            setTimeout(() => popup.remove(), 300);
        });

        // Add click outside to close
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closeBtn.click();
            }
        });

        // Add escape key to close
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeBtn.click();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Add to page
        document.body.appendChild(popup);

        // Animate in
        setTimeout(() => popup.classList.add('hint-show'), 100);
    }

    showEquipmentInfo(equipmentType, equipmentName) {
        const equipmentInfo = this.getEquipmentInfo(equipmentType, equipmentName);

        // Remove any existing equipment info popup
        const existingPopup = document.querySelector('.equipment-info-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create equipment info popup
        const popup = document.createElement('div');
        popup.className = 'equipment-info-popup';

        popup.innerHTML = `
            <div class="equipment-info-content">
                <div class="equipment-info-header">
                    <h3>${equipmentName}</h3>
                    <button class="equipment-info-close-btn" title="Close">×</button>
                </div>
                <div class="equipment-info-body">
                    <div class="equipment-info-description">
                        <strong>What is it?</strong><br>
                        ${equipmentInfo.description}
                    </div>
                    <div class="equipment-info-purpose">
                        <strong>Why is it needed?</strong><br>
                        ${equipmentInfo.purpose}
                    </div>
                    <div class="equipment-info-usage">
                        <strong>How is it used?</strong><br>
                        ${equipmentInfo.usage}
                    </div>
                </div>
            </div>
        `;

        // Add close button functionality
        const closeBtn = popup.querySelector('.equipment-info-close-btn');
        closeBtn.addEventListener('click', () => {
            popup.classList.add('equipment-info-fade-out');
            setTimeout(() => popup.remove(), 300);
        });

        // Add click outside to close
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closeBtn.click();
            }
        });

        // Add escape key to close
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeBtn.click();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Add to page
        document.body.appendChild(popup);

        // Animate in
        setTimeout(() => popup.classList.add('equipment-info-show'), 100);
    }

    getEquipmentInfo(equipmentType, equipmentName) {
        const equipmentInfo = {
            'microphone': {
                description: 'A device that converts sound waves into electrical signals. It captures audio from performers, speakers, or instruments.',
                purpose: 'Essential for capturing live audio. Without microphones, the audience can\'t hear performers clearly, especially in large venues.',
                usage: 'Positioned near sound sources (voices, instruments) and connected to the mixing console via XLR cables for processing and amplification.'
            },
            'mixing-console': {
                description: 'The central hub of the audio system that receives, processes, and routes audio signals from multiple sources.',
                purpose: 'Controls volume levels, applies effects, balances different audio sources, and sends the final mix to speakers. It\'s the "brain" of the sound system.',
                usage: 'Receives inputs from microphones and other sources, processes the audio (volume, EQ, effects), then sends the mixed signal to speakers and recording devices.'
            },
            'speaker': {
                description: 'A device that converts electrical audio signals back into sound waves that the audience can hear.',
                purpose: 'Amplifies the audio so everyone in the venue can hear clearly. Speakers are what actually produce the sound that reaches the audience.',
                usage: 'Connected to the mixing console and positioned strategically around the venue to provide even sound coverage to all audience members.'
            },
            'power-distro': {
                description: 'A power distribution unit that safely distributes electrical power to multiple pieces of equipment.',
                purpose: 'Provides reliable, clean power to all equipment. Prevents electrical overloads and ensures consistent performance of all devices.',
                usage: 'Connected to the main power source and distributes power to individual pieces of equipment through power cables.'
            },
            'mic-receiver': {
                description: 'Receives wireless radio signals from wireless microphones and converts them back to audio signals.',
                purpose: 'Enables wireless microphone operation, giving performers freedom to move around the stage without being tethered by cables.',
                usage: 'Connected to the mixing console and receives signals from wireless microphones, converting them to standard audio signals for processing.'
            },
            'effects-processor': {
                description: 'A device that adds audio effects like reverb, delay, compression, and EQ to enhance the sound.',
                purpose: 'Improves audio quality and adds professional polish to the sound. Effects can make voices and instruments sound more natural and appealing.',
                usage: 'Connected between the mixing console and speakers (or as an insert on the console) to process the audio signal before it reaches the audience.'
            },
            'playback-device': {
                description: 'A device that plays pre-recorded audio content like music, sound effects, or backing tracks.',
                purpose: 'Provides additional audio content during performances, such as background music, sound effects, or backing tracks for live bands.',
                usage: 'Connected to the mixing console to integrate pre-recorded audio with live performances seamlessly.'
            },
            'wireless-transmitter': {
                description: 'A device that converts audio signals into radio waves for wireless transmission to receivers.',
                purpose: 'Enables wireless audio transmission, allowing performers to move freely without cables while maintaining audio quality.',
                usage: 'Connected to audio sources (like instruments or microphones) and transmits the signal wirelessly to receivers connected to the mixing console.'
            },
            'wireless-receiver': {
                description: 'Receives wireless radio signals from transmitters and converts them back to audio signals.',
                purpose: 'Completes the wireless audio chain, receiving signals from wireless transmitters and providing standard audio outputs for the mixing console.',
                usage: 'Connected to the mixing console and receives wireless signals from transmitters, converting them to standard audio signals for processing.'
            },
            'light-fixture': {
                description: 'A lighting device that produces light for stage illumination, effects, and atmosphere.',
                purpose: 'Provides lighting for visibility, creates mood and atmosphere, highlights performers, and adds visual impact to performances.',
                usage: 'Connected to power sources and DMX controllers for control. Positioned around the stage to provide appropriate lighting coverage and effects.'
            },
            'dmx-controller': {
                description: 'A device that controls lighting fixtures by sending digital control signals through DMX cables.',
                purpose: 'Allows precise control of lighting fixtures, including color, intensity, movement, and timing. Essential for creating dynamic lighting shows.',
                usage: 'Connected to lighting fixtures via DMX cables and programmed to control various lighting parameters and create lighting sequences.'
            },
            'video-source': {
                description: 'A device that provides video content such as cameras, media players, or computers.',
                purpose: 'Provides visual content for performances, presentations, or entertainment. Enhances the audience experience with visual elements.',
                usage: 'Connected to video displays or switchers via HDMI cables to deliver video content to screens or projectors.'
            },
            'video-display': {
                description: 'A device that shows video content, such as LED screens, projectors, or monitors.',
                purpose: 'Displays visual content to the audience, providing additional information, entertainment, or visual effects during performances.',
                usage: 'Connected to video sources or switchers and positioned to be visible to the audience for maximum impact.'
            },
            'video-switcher': {
                description: 'A device that selects and switches between multiple video sources for display.',
                purpose: 'Allows seamless switching between different video sources during performances, enabling dynamic visual presentations.',
                usage: 'Connected to multiple video sources and displays, allowing operators to switch between different video feeds as needed.'
            },
            'video-mixer': {
                description: 'A device that combines and processes multiple video sources, similar to an audio mixer but for video signals.',
                purpose: 'Enables complex video productions by combining multiple camera feeds, graphics, and effects into a single output.',
                usage: 'Connected to multiple video sources and processes them to create professional video productions with transitions and effects.'
            },
            'video-camera': {
                description: 'A device that captures live video footage for recording or live streaming.',
                purpose: 'Provides live video content for performances, presentations, or streaming. Essential for capturing and sharing live events.',
                usage: 'Connected to video mixers or displays via HDMI cables to provide live video feeds for production or display.'
            },
            'backdrop': {
                description: 'A large background element that provides visual context and atmosphere for performances.',
                purpose: 'Creates the visual setting and atmosphere for performances, helping to establish the mood and theme of the event.',
                usage: 'Positioned behind performers and lit appropriately to create the desired visual impact and atmosphere.'
            },
            'prop': {
                description: 'Physical objects used on stage to enhance performances, tell stories, or create visual interest.',
                purpose: 'Adds visual elements and helps tell stories or create specific atmospheres during performances.',
                usage: 'Positioned strategically on stage to support the performance and create the desired visual environment.'
            },
            'curtain': {
                description: 'Fabric panels used to frame the stage, hide equipment, or create dramatic reveals.',
                purpose: 'Provides stage framing, hides backstage areas, and creates dramatic effects during performances.',
                usage: 'Positioned around the stage perimeter and operated to reveal or conceal different areas as needed.'
            },
            'effect': {
                description: 'Special effects equipment like fog machines, bubble machines, or other atmospheric devices.',
                purpose: 'Creates atmospheric effects that enhance the visual impact and mood of performances.',
                usage: 'Connected to power sources and positioned to create the desired atmospheric effects without interfering with performers or audience.'
            }
        };

        return equipmentInfo[equipmentType] || {
            description: 'This equipment is used in live production systems.',
            purpose: 'It serves a specific function in the overall production setup.',
            usage: 'Connect it according to the level requirements to complete the system.'
        };
    }

    testConnectors() {
        const connectors = document.querySelectorAll('.connector');
        console.log('Testing connectors:', connectors.length);

        connectors.forEach((connector, index) => {
            console.log(`Connector ${index + 1}:`, {
                type: connector.dataset.type,
                label: connector.dataset.label,
                visible: connector.offsetParent !== null,
                clickable: connector.style.pointerEvents !== 'none',
                position: connector.className.split(' ')[1],
                rect: connector.getBoundingClientRect()
            });

            // Add a temporary visual indicator
            connector.style.border = '2px solid yellow';
            setTimeout(() => {
                connector.style.border = '';
            }, 2000);
        });

        // Specifically test mixer connectors
        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        console.log('Found mixers:', mixers.length);
        mixers.forEach((mixer, index) => {
            const mixerConnectors = mixer.querySelectorAll('.connector');
            console.log(`Mixer ${index + 1} connectors:`, mixerConnectors.length);
            mixerConnectors.forEach((connector, connIndex) => {
                console.log(`  Mixer connector ${connIndex + 1}:`, {
                    type: connector.dataset.type,
                    label: connector.dataset.label,
                    position: connector.className.split(' ')[1],
                    rect: connector.getBoundingClientRect()
                });
            });
        });

        this.showMessage(`Found ${connectors.length} connectors. Check console for details.`, 'info');
    }

    testConnectionColors() {
        console.log('Testing connection colors:');

        // Test all connector types
        const connectorTypes = [
            'power-in', 'power-out',
            'xlr-in', 'xlr-out',
            'wireless-in', 'wireless-out',
            'ethernet-in', 'ethernet-out',
            'dmx-in', 'dmx-out'
        ];

        connectorTypes.forEach(type => {
            const color = this.getConnectorColor(type);
            console.log(`${type}: ${color}`);
        });

        // Test with actual connectors on stage
        const connectors = document.querySelectorAll('.connector');
        connectors.forEach((connector, index) => {
            const type = connector.dataset.type;
            const color = this.getConnectorColor(type);
            console.log(`Connector ${index + 1} (${type}): ${color}`);
        });

        this.showMessage('Connection colors logged to console', 'info');
    }

    testMixerOutput() {
        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        if (mixers.length === 0) {
            this.showMessage('No mixers found on stage', 'error');
            return;
        }

        mixers.forEach((mixer, index) => {
            const outputConnector = mixer.querySelector('.connector[data-type="xlr-out"]');
            if (outputConnector) {
                console.log(`Mixer ${index + 1} output connector:`, {
                    type: outputConnector.dataset.type,
                    label: outputConnector.dataset.label,
                    position: outputConnector.className.split(' ')[1],
                    rect: outputConnector.getBoundingClientRect(),
                    visible: outputConnector.offsetParent !== null,
                    clickable: outputConnector.style.pointerEvents !== 'none'
                });

                // Highlight the output connector
                outputConnector.style.border = '3px solid red';
                outputConnector.style.boxShadow = '0 0 10px red';

                setTimeout(() => {
                    outputConnector.style.border = '';
                    outputConnector.style.boxShadow = '';
                }, 3000);

                this.showMessage(`Mixer ${index + 1} output connector highlighted in red`, 'info');
            } else {
                console.log(`Mixer ${index + 1} has no output connector`);
                this.showMessage(`Mixer ${index + 1} has no output connector`, 'error');
            }
        });
    }

    testMixerConnectors() {
        console.log('=== COMPREHENSIVE MIXER CONNECTOR TEST ===');

        // Test all equipment for mixers
        const allEquipment = document.querySelectorAll('.equipment');
        console.log('Total equipment on stage:', allEquipment.length);

        allEquipment.forEach((eq, index) => {
            console.log(`Equipment ${index + 1}:`, {
                type: eq.dataset.type,
                name: eq.dataset.name,
                isMixer: eq.dataset.type === 'mixing-console'
            });

            if (eq.dataset.type === 'mixing-console') {
                console.log('=== MIXER FOUND ===');

                // Check HTML structure
                console.log('Mixer HTML:', eq.outerHTML);

                // Check all connectors
                const connectors = eq.querySelectorAll('.connector');
                console.log('Connectors found:', connectors.length);

                connectors.forEach((conn, i) => {
                    console.log(`Connector ${i + 1}:`, {
                        type: conn.dataset.type,
                        label: conn.dataset.label,
                        position: conn.className.split(' ')[1],
                        rect: conn.getBoundingClientRect(),
                        zIndex: conn.style.zIndex,
                        computedZIndex: window.getComputedStyle(conn).zIndex,
                        isVisible: conn.offsetParent !== null,
                        clickable: conn.style.pointerEvents !== 'none'
                    });

                    // Add visual test
                    conn.style.border = '2px solid yellow';
                    conn.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                });

                // Test specific connectors
                const powerConnector = eq.querySelector('.connector[data-type="power-in"]');
                const xlrInConnector = eq.querySelector('.connector[data-type="xlr-in"]');
                const xlrOutConnector = eq.querySelector('.connector[data-type="xlr-out"]');

                console.log('Specific connectors:', {
                    power: powerConnector ? 'FOUND' : 'NOT FOUND',
                    xlrIn: xlrInConnector ? 'FOUND' : 'NOT FOUND',
                    xlrOut: xlrOutConnector ? 'FOUND' : 'NOT FOUND'
                });

                // Test click events
                if (xlrOutConnector) {
                    console.log('Testing XLR out click...');
                    xlrOutConnector.click();
                }

                if (xlrInConnector) {
                    console.log('Testing XLR in click...');
                    xlrInConnector.click();
                }

                if (powerConnector) {
                    console.log('Testing power in click...');
                    powerConnector.click();
                }
            }
        });

        // Clean up visual tests after 5 seconds
        setTimeout(() => {
            document.querySelectorAll('.connector').forEach(conn => {
                conn.style.border = '';
                conn.style.backgroundColor = '';
            });
        }, 5000);

        this.showMessage('Comprehensive mixer test completed. Check console for details.', 'info');
    }

    debugMixerConnectors() {
        console.log('=== DEEP MIXER CONNECTOR DEBUG ===');

        // Find all mixers
        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        console.log('Mixers found:', mixers.length);

        if (mixers.length === 0) {
            console.log('No mixers found! Checking for alternative selectors...');
            const allEquipment = document.querySelectorAll('.equipment');
            allEquipment.forEach((eq, i) => {
                console.log(`Equipment ${i + 1}:`, {
                    type: eq.dataset.type,
                    name: eq.dataset.name,
                    className: eq.className,
                    outerHTML: eq.outerHTML.substring(0, 200) + '...'
                });
            });
            return;
        }

        mixers.forEach((mixer, index) => {
            console.log(`=== MIXER ${index + 1} DEBUG ===`);

            // Check mixer properties
            console.log('Mixer properties:', {
                type: mixer.dataset.type,
                name: mixer.dataset.name,
                className: mixer.className,
                style: {
                    width: mixer.style.width,
                    height: mixer.style.height,
                    zIndex: mixer.style.zIndex,
                    position: mixer.style.position
                },
                rect: mixer.getBoundingClientRect()
            });

            // Check all connectors in detail
            const connectors = mixer.querySelectorAll('.connector');
            console.log(`Connectors found: ${connectors.length}`);

            connectors.forEach((conn, i) => {
                const rect = conn.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(conn);

                console.log(`Connector ${i + 1} (${conn.dataset.type}):`, {
                    type: conn.dataset.type,
                    label: conn.dataset.label,
                    position: conn.className.split(' ')[1],
                    rect: {
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height
                    },
                    style: {
                        zIndex: conn.style.zIndex,
                        pointerEvents: conn.style.pointerEvents,
                        cursor: conn.style.cursor
                    },
                    computed: {
                        zIndex: computedStyle.zIndex,
                        pointerEvents: computedStyle.pointerEvents,
                        cursor: computedStyle.cursor,
                        display: computedStyle.display,
                        visibility: computedStyle.visibility
                    },
                    isVisible: rect.width > 0 && rect.height > 0,
                    isClickable: computedStyle.pointerEvents !== 'none'
                });

                // Check connector dot
                const dot = conn.querySelector('.connector-dot');
                if (dot) {
                    const dotRect = dot.getBoundingClientRect();
                    const dotStyle = window.getComputedStyle(dot);

                    console.log(`  Connector dot:`, {
                        rect: {
                            left: dotRect.left,
                            top: dotRect.top,
                            width: dotRect.width,
                            height: dotRect.height
                        },
                        style: {
                            pointerEvents: dot.style.pointerEvents,
                            cursor: dot.style.cursor
                        },
                        computed: {
                            pointerEvents: dotStyle.pointerEvents,
                            cursor: dotStyle.cursor
                        },
                        isClickable: dotStyle.pointerEvents !== 'none'
                    });
                }

                // Test event listeners
                console.log(`  Testing event listeners for connector ${i + 1}...`);

                // Simulate click and check if handlers are called
                const originalClick = conn.onclick;
                let clickHandled = false;

                conn.onclick = (e) => {
                    clickHandled = true;
                    console.log(`  Click event fired for connector ${i + 1} (${conn.dataset.type})`);
                    if (originalClick) originalClick.call(conn, e);
                };

                // Trigger click
                conn.click();

                setTimeout(() => {
                    if (!clickHandled) {
                        console.log(`  WARNING: Click event NOT handled for connector ${i + 1} (${conn.dataset.type})`);
                    }
                    conn.onclick = originalClick;
                }, 100);

                // Add visual debugging
                conn.style.border = '3px solid red';
                conn.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';

                if (dot) {
                    dot.style.border = '2px solid blue';
                    dot.style.backgroundColor = 'rgba(0, 0, 255, 0.3)';
                }
            });
        });

        // Clean up after 10 seconds
        setTimeout(() => {
            document.querySelectorAll('.connector').forEach(conn => {
                conn.style.border = '';
                conn.style.backgroundColor = '';
                const dot = conn.querySelector('.connector-dot');
                if (dot) {
                    dot.style.border = '';
                    dot.style.backgroundColor = '';
                }
            });
        }, 10000);

        this.showMessage('Deep mixer debug completed. Check console for detailed analysis.', 'info');
    }

    testMixerPowerAndAudio() {
        console.log('=== TESTING ALL MIXER CONNECTORS (POWER-IN, XLR-IN, XLR-OUT) ===');

        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        if (mixers.length === 0) {
            this.showMessage('No mixers found on stage', 'error');
            return;
        }

        mixers.forEach((mixer, index) => {
            console.log(`=== TESTING MIXER ${index + 1} ===`);

            // Find ALL mixer connectors
            const powerIn = mixer.querySelector('.connector[data-type="power-in"]');
            const xlrIn = mixer.querySelector('.connector[data-type="xlr-in"]');
            const xlrOut = mixer.querySelector('.connector[data-type="xlr-out"]');

            console.log('All mixer connectors found:', {
                powerIn: powerIn ? 'FOUND' : 'NOT FOUND',
                xlrIn: xlrIn ? 'FOUND' : 'NOT FOUND',
                xlrOut: xlrOut ? 'FOUND' : 'NOT FOUND'
            });

            // Test power-in connector
            if (powerIn) {
                console.log('Testing power-in connector...');

                // Visual highlight
                powerIn.style.border = '4px solid #ff4757';
                powerIn.style.backgroundColor = 'rgba(255, 71, 87, 0.3)';
                powerIn.style.boxShadow = '0 0 20px rgba(255, 71, 87, 0.8)';

                // Test click
                console.log('Clicking power-in connector...');
                powerIn.click();

                // Test hover
                console.log('Testing power-in hover...');
                powerIn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                setTimeout(() => {
                    powerIn.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                }, 1000);

                // Test dot
                const powerDot = powerIn.querySelector('.connector-dot');
                if (powerDot) {
                    powerDot.style.border = '3px solid #ff4757';
                    powerDot.style.backgroundColor = 'rgba(255, 71, 87, 0.5)';
                    console.log('Clicking power-in dot...');
                    powerDot.click();
                }
            }

            // Test xlr-in connector (audio input)
            if (xlrIn) {
                console.log('Testing xlr-in connector (audio input)...');

                // Visual highlight
                xlrIn.style.border = '4px solid #00ff88';
                xlrIn.style.backgroundColor = 'rgba(0, 255, 136, 0.3)';
                xlrIn.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.8)';

                // Test click
                console.log('Clicking xlr-in connector...');
                xlrIn.click();

                // Test hover
                console.log('Testing xlr-in hover...');
                xlrIn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                setTimeout(() => {
                    xlrIn.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                }, 1000);

                // Test dot
                const xlrInDot = xlrIn.querySelector('.connector-dot');
                if (xlrInDot) {
                    xlrInDot.style.border = '3px solid #00ff88';
                    xlrInDot.style.backgroundColor = 'rgba(0, 255, 136, 0.5)';
                    console.log('Clicking xlr-in dot...');
                    xlrInDot.click();
                }
            }

            // Test xlr-out connector (audio output)
            if (xlrOut) {
                console.log('Testing xlr-out connector (audio output)...');

                // Visual highlight
                xlrOut.style.border = '4px solid #00ff88';
                xlrOut.style.backgroundColor = 'rgba(0, 255, 136, 0.3)';
                xlrOut.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.8)';

                // Test click
                console.log('Clicking xlr-out connector...');
                xlrOut.click();

                // Test hover
                console.log('Testing xlr-out hover...');
                xlrOut.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                setTimeout(() => {
                    xlrOut.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                }, 1000);

                // Test dot
                const xlrOutDot = xlrOut.querySelector('.connector-dot');
                if (xlrOutDot) {
                    xlrOutDot.style.border = '3px solid #00ff88';
                    xlrOutDot.style.backgroundColor = 'rgba(0, 255, 136, 0.5)';
                    console.log('Clicking xlr-out dot...');
                    xlrOutDot.click();
                }
            }

            // List all connectors for reference
            const allConnectors = mixer.querySelectorAll('.connector');
            console.log('All connectors on this mixer:', Array.from(allConnectors).map(c => ({
                type: c.dataset.type,
                label: c.dataset.label,
                position: c.className.split(' ')[1]
            })));
        });

        // Clean up after 5 seconds
        setTimeout(() => {
            document.querySelectorAll('.connector').forEach(conn => {
                conn.style.border = '';
                conn.style.backgroundColor = '';
                conn.style.boxShadow = '';
                const dot = conn.querySelector('.connector-dot');
                if (dot) {
                    dot.style.border = '';
                    dot.style.backgroundColor = '';
                }
            });
        }, 5000);

        this.showMessage('All mixer connector test completed (power-in, xlr-in, xlr-out). Check console for details.', 'info');
    }

    testAllConnectors() {
        console.log('=== TESTING ALL CONNECTORS ===');

        // Reset all connector states first
        this.resetConnectorStates();

        const allConnectors = document.querySelectorAll('.connector');
        console.log('Total connectors found:', allConnectors.length);

        allConnectors.forEach((connector, index) => {
            console.log(`Connector ${index + 1}:`, {
                type: connector.dataset.type,
                label: connector.dataset.label,
                equipment: connector.closest('.equipment')?.dataset.type,
                position: connector.className.split(' ')[1],
                pointerEvents: connector.style.pointerEvents,
                cursor: connector.style.cursor,
                isSelected: connector.classList.contains('selected'),
                rect: connector.getBoundingClientRect()
            });

            // Test click functionality
            console.log(`Testing click for connector ${index + 1} (${connector.dataset.type})`);
            connector.click();

            // Add visual indicator
            connector.style.border = '3px solid green';
            connector.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
        });

        // Clean up after 3 seconds
        setTimeout(() => {
            document.querySelectorAll('.connector').forEach(conn => {
                conn.style.border = '';
                conn.style.backgroundColor = '';
            });
        }, 3000);

        this.showMessage(`Tested ${allConnectors.length} connectors. Check console for details.`, 'info');
    }

    testAllMixerConnectors() {
        console.log('=== COMPREHENSIVE MIXER CONNECTOR TEST ===');

        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        if (mixers.length === 0) {
            this.showMessage('No mixers found on stage', 'error');
            return;
        }

        mixers.forEach((mixer, index) => {
            console.log(`=== COMPREHENSIVE TEST FOR MIXER ${index + 1} ===`);

            // Get all connectors on this mixer
            const connectors = mixer.querySelectorAll('.connector');
            console.log(`Mixer ${index + 1} has ${connectors.length} connectors`);

            connectors.forEach((connector, connIndex) => {
                const rect = connector.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(connector);
                const dot = connector.querySelector('.connector-dot');

                console.log(`Connector ${connIndex + 1} (${connector.dataset.type}):`, {
                    type: connector.dataset.type,
                    label: connector.dataset.label,
                    position: connector.className.split(' ')[1],
                    rect: {
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height
                    },
                    style: {
                        zIndex: connector.style.zIndex,
                        pointerEvents: connector.style.pointerEvents,
                        cursor: connector.style.cursor
                    },
                    computed: {
                        zIndex: computedStyle.zIndex,
                        pointerEvents: computedStyle.pointerEvents,
                        cursor: computedStyle.cursor,
                        display: computedStyle.display,
                        visibility: computedStyle.visibility
                    },
                    isVisible: rect.width > 0 && rect.height > 0,
                    isClickable: computedStyle.pointerEvents !== 'none',
                    hasDot: !!dot
                });

                // Test connector click
                console.log(`Testing click for ${connector.dataset.type}...`);
                connector.click();

                // Test connector hover
                console.log(`Testing hover for ${connector.dataset.type}...`);
                connector.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                setTimeout(() => {
                    connector.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                }, 500);

                // Test dot if it exists
                if (dot) {
                    const dotRect = dot.getBoundingClientRect();
                    const dotStyle = window.getComputedStyle(dot);

                    console.log(`  Dot for ${connector.dataset.type}:`, {
                        rect: {
                            left: dotRect.left,
                            top: dotRect.top,
                            width: dotRect.width,
                            height: dotRect.height
                        },
                        style: {
                            pointerEvents: dot.style.pointerEvents,
                            cursor: dot.style.cursor
                        },
                        computed: {
                            pointerEvents: dotStyle.pointerEvents,
                            cursor: dotStyle.cursor
                        },
                        isClickable: dotStyle.pointerEvents !== 'none'
                    });

                    // Test dot click
                    console.log(`Testing dot click for ${connector.dataset.type}...`);
                    dot.click();

                    // Test dot hover
                    console.log(`Testing dot hover for ${connector.dataset.type}...`);
                    dot.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                    setTimeout(() => {
                        dot.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                    }, 500);
                }

                // Add visual debugging
                connector.style.border = '4px solid #ff6b35';
                connector.style.backgroundColor = 'rgba(255, 107, 53, 0.2)';

                if (dot) {
                    dot.style.border = '3px solid #ff6b35';
                    dot.style.backgroundColor = 'rgba(255, 107, 53, 0.4)';
                }
            });
        });

        // Clean up after 8 seconds
        setTimeout(() => {
            document.querySelectorAll('.connector').forEach(conn => {
                conn.style.border = '';
                conn.style.backgroundColor = '';
                const dot = conn.querySelector('.connector-dot');
                if (dot) {
                    dot.style.border = '';
                    dot.style.backgroundColor = '';
                }
            });
        }, 8000);

        this.showMessage('Comprehensive mixer connector test completed. Check console for detailed analysis.', 'info');
    }

    debugXlrOutConnector() {
        console.log('=== SPECIFIC XLR-OUT CONNECTOR DEBUG ===');

        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        if (mixers.length === 0) {
            this.showMessage('No mixers found on stage', 'error');
            return;
        }

        mixers.forEach((mixer, index) => {
            console.log(`=== DEBUGGING MIXER ${index + 1} XLR-OUT ===`);

            // Find the XLR-out connector specifically
            const xlrOut = mixer.querySelector('.connector[data-type="xlr-out"]');

            if (!xlrOut) {
                console.log('XLR-OUT CONNECTOR NOT FOUND!');
                console.log('Available connectors:', Array.from(mixer.querySelectorAll('.connector')).map(c => c.dataset.type));
                return;
            }

            console.log('XLR-OUT CONNECTOR FOUND!');

            // Detailed analysis of the XLR-out connector
            const rect = xlrOut.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(xlrOut);
            const dot = xlrOut.querySelector('.connector-dot');

            console.log('XLR-OUT Connector Details:', {
                type: xlrOut.dataset.type,
                label: xlrOut.dataset.label,
                position: xlrOut.className.split(' ')[1],
                rect: {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height
                },
                style: {
                    zIndex: xlrOut.style.zIndex,
                    pointerEvents: xlrOut.style.pointerEvents,
                    cursor: xlrOut.style.cursor,
                    position: xlrOut.style.position
                },
                computed: {
                    zIndex: computedStyle.zIndex,
                    pointerEvents: computedStyle.pointerEvents,
                    cursor: computedStyle.cursor,
                    display: computedStyle.display,
                    visibility: computedStyle.visibility,
                    position: computedStyle.position
                },
                isVisible: rect.width > 0 && rect.height > 0,
                isClickable: computedStyle.pointerEvents !== 'none',
                hasDot: !!dot
            });

            // Check if the connector is being covered by other elements
            const elementsAtPoint = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
            console.log('Elements at XLR-out connector point:', elementsAtPoint.map(el => ({
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                dataset: el.dataset
            })));

            // Test the connector with multiple methods
            console.log('Testing XLR-out connector...');

            // Method 1: Direct click
            console.log('Method 1: Direct click');
            xlrOut.click();

            // Method 2: MouseEvent
            console.log('Method 2: MouseEvent click');
            xlrOut.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

            // Method 3: Mousedown + mouseup
            console.log('Method 3: Mousedown + mouseup');
            xlrOut.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            xlrOut.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

            // Test hover
            console.log('Testing XLR-out hover...');
            xlrOut.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            setTimeout(() => {
                xlrOut.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            }, 1000);

            // Test dot if it exists
            if (dot) {
                console.log('XLR-OUT DOT FOUND!');
                const dotRect = dot.getBoundingClientRect();
                const dotStyle = window.getComputedStyle(dot);

                console.log('XLR-OUT Dot Details:', {
                    rect: {
                        left: dotRect.left,
                        top: dotRect.top,
                        width: dotRect.width,
                        height: dotRect.height
                    },
                    style: {
                        pointerEvents: dot.style.pointerEvents,
                        cursor: dot.style.cursor
                    },
                    computed: {
                        pointerEvents: dotStyle.pointerEvents,
                        cursor: dotStyle.cursor
                    },
                    isClickable: dotStyle.pointerEvents !== 'none'
                });

                // Test dot click
                console.log('Testing XLR-out dot click...');
                dot.click();
                dot.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            } else {
                console.log('XLR-OUT DOT NOT FOUND!');
            }

            // Add extreme visual debugging
            xlrOut.style.border = '6px solid #ff0000';
            xlrOut.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            xlrOut.style.boxShadow = '0 0 30px rgba(255, 0, 0, 1)';
            xlrOut.style.zIndex = '9999';

            if (dot) {
                dot.style.border = '4px solid #ff0000';
                dot.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
                dot.style.boxShadow = '0 0 20px rgba(255, 0, 0, 1)';
                dot.style.zIndex = '10000';
            }

            // Log the HTML structure
            console.log('XLR-OUT HTML:', xlrOut.outerHTML);
        });

        // Clean up after 10 seconds
        setTimeout(() => {
            document.querySelectorAll('.connector').forEach(conn => {
                conn.style.border = '';
                conn.style.backgroundColor = '';
                conn.style.boxShadow = '';
                conn.style.zIndex = '';
                const dot = conn.querySelector('.connector-dot');
                if (dot) {
                    dot.style.border = '';
                    dot.style.backgroundColor = '';
                    dot.style.boxShadow = '';
                    dot.style.zIndex = '';
                }
            });
        }, 10000);

        this.showMessage('XLR-out connector debug completed. Check console for detailed analysis.', 'info');
    }

    forceFixXlrOutConnector() {
        console.log('=== FORCE FIXING XLR-OUT CONNECTOR ===');

        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        if (mixers.length === 0) {
            this.showMessage('No mixers found on stage', 'error');
            return;
        }

        mixers.forEach((mixer, index) => {
            console.log(`=== FORCE FIXING MIXER ${index + 1} XLR-OUT ===`);

            // Find the XLR-out connector
            const xlrOut = mixer.querySelector('.connector[data-type="xlr-out"]');

            if (!xlrOut) {
                console.log('XLR-OUT CONNECTOR NOT FOUND - cannot fix');
                return;
            }

            console.log('FORCE FIXING XLR-OUT CONNECTOR...');

            // Force extreme styling
            xlrOut.style.zIndex = '9999';
            xlrOut.style.pointerEvents = 'auto';
            xlrOut.style.cursor = 'pointer';
            xlrOut.style.border = '4px solid #00ff88';
            xlrOut.style.backgroundColor = 'rgba(0, 255, 136, 0.3)';
            xlrOut.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.9)';
            xlrOut.style.transform = 'scale(1.2)';

            // Remove all existing event listeners by cloning
            const newXlrOut = xlrOut.cloneNode(true);
            xlrOut.parentNode.replaceChild(newXlrOut, xlrOut);

            // Apply the same styling to the new element
            newXlrOut.style.zIndex = '9999';
            newXlrOut.style.pointerEvents = 'auto';
            newXlrOut.style.cursor = 'pointer';
            newXlrOut.style.border = '4px solid #00ff88';
            newXlrOut.style.backgroundColor = 'rgba(0, 255, 136, 0.3)';
            newXlrOut.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.9)';
            newXlrOut.style.transform = 'scale(1.2)';

            // Add multiple event listeners
            newXlrOut.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('FORCE FIXED XLR-OUT CLICKED!');
                this.handleConnectorClick(newXlrOut, mixer);
            }, true);

            newXlrOut.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                console.log('FORCE FIXED XLR-OUT MOUSEDOWN!');
            }, true);

            newXlrOut.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                newXlrOut.style.transform = 'scale(1.5)';
                newXlrOut.style.boxShadow = '0 0 35px rgba(0, 255, 136, 1)';
                console.log('FORCE FIXED XLR-OUT HOVER ENTER!');
            }, true);

            newXlrOut.addEventListener('mouseleave', (e) => {
                e.stopPropagation();
                newXlrOut.style.transform = 'scale(1.2)';
                newXlrOut.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.9)';
                console.log('FORCE FIXED XLR-OUT HOVER LEAVE!');
            }, true);

            // Handle the dot
            const dot = newXlrOut.querySelector('.connector-dot');
            if (dot) {
                dot.style.zIndex = '10000';
                dot.style.pointerEvents = 'auto';
                dot.style.cursor = 'pointer';
                dot.style.border = '5px solid white';
                dot.style.backgroundColor = 'rgba(0, 255, 136, 0.8)';
                dot.style.boxShadow = '0 0 20px rgba(0, 255, 136, 1)';

                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('FORCE FIXED XLR-OUT DOT CLICKED!');
                    this.handleConnectorClick(newXlrOut, mixer);
                }, true);

                dot.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    console.log('FORCE FIXED XLR-OUT DOT MOUSEDOWN!');
                }, true);
            }

            console.log('XLR-OUT CONNECTOR FORCE FIXED!');
        });

        this.showMessage('XLR-out connector force fixed! Try clicking it now.', 'info');
    }

    testAllEquipmentConnectors() {
        console.log('=== COMPREHENSIVE ALL EQUIPMENT CONNECTOR TEST ===');

        const allEquipment = document.querySelectorAll('.equipment');
        if (allEquipment.length === 0) {
            this.showMessage('No equipment found on stage', 'error');
            return;
        }

        console.log(`Found ${allEquipment.length} equipment pieces on stage`);

        allEquipment.forEach((equipment, eqIndex) => {
            const equipmentType = equipment.dataset.type;
            const equipmentName = equipment.dataset.name;

            console.log(`=== TESTING EQUIPMENT ${eqIndex + 1}: ${equipmentType} (${equipmentName}) ===`);

            const connectors = equipment.querySelectorAll('.connector');
            console.log(`Equipment has ${connectors.length} connectors`);

            connectors.forEach((connector, connIndex) => {
                const connectorType = connector.dataset.type;
                const connectorLabel = connector.dataset.label;
                const rect = connector.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(connector);
                const dot = connector.querySelector('.connector-dot');

                console.log(`Connector ${connIndex + 1} (${connectorType}):`, {
                    type: connectorType,
                    label: connectorLabel,
                    position: connector.className.split(' ')[1],
                    rect: {
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height
                    },
                    style: {
                        zIndex: connector.style.zIndex,
                        pointerEvents: connector.style.pointerEvents,
                        cursor: connector.style.cursor
                    },
                    computed: {
                        zIndex: computedStyle.zIndex,
                        pointerEvents: computedStyle.pointerEvents,
                        cursor: computedStyle.cursor,
                        display: computedStyle.display,
                        visibility: computedStyle.visibility
                    },
                    isVisible: rect.width > 0 && rect.height > 0,
                    isClickable: computedStyle.pointerEvents !== 'none',
                    hasDot: !!dot
                });

                // Test connector functionality
                console.log(`Testing connector ${connIndex + 1} (${connectorType}) on ${equipmentType}...`);

                // Test click
                console.log('  Testing click...');
                connector.click();

                // Test hover
                console.log('  Testing hover...');
                connector.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                setTimeout(() => {
                    connector.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                }, 500);

                // Test dot if it exists
                if (dot) {
                    const dotRect = dot.getBoundingClientRect();
                    const dotStyle = window.getComputedStyle(dot);

                    console.log(`  Dot for ${connectorType}:`, {
                        rect: {
                            left: dotRect.left,
                            top: dotRect.top,
                            width: dotRect.width,
                            height: dotRect.height
                        },
                        style: {
                            pointerEvents: dot.style.pointerEvents,
                            cursor: dot.style.cursor
                        },
                        computed: {
                            pointerEvents: dotStyle.pointerEvents,
                            cursor: dotStyle.cursor
                        },
                        isClickable: dotStyle.pointerEvents !== 'none'
                    });

                    // Test dot click
                    console.log('  Testing dot click...');
                    dot.click();

                    // Test dot hover
                    console.log('  Testing dot hover...');
                    dot.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                    setTimeout(() => {
                        dot.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                    }, 500);
                }

                // Add visual debugging with equipment-specific colors
                let debugColor = '#ff6b35'; // Default orange
                if (equipmentType === 'mixing-console') debugColor = '#00ff88'; // Green for mixer
                else if (equipmentType === 'speaker') debugColor = '#ff4757'; // Red for speaker
                else if (equipmentType === 'mic-receiver') debugColor = '#a29bfe'; // Purple for receiver
                else if (equipmentType === 'microphone') debugColor = '#00ccff'; // Blue for mic
                else if (equipmentType === 'power-distro') debugColor = '#ffa502'; // Orange for power

                connector.style.border = `4px solid ${debugColor}`;
                connector.style.backgroundColor = `${debugColor}20`;
                connector.style.boxShadow = `0 0 20px ${debugColor}80`;

                if (dot) {
                    dot.style.border = `3px solid ${debugColor}`;
                    dot.style.backgroundColor = `${debugColor}40`;
                    dot.style.boxShadow = `0 0 15px ${debugColor}`;
                }
            });
        });

        // Clean up after 10 seconds
        setTimeout(() => {
            document.querySelectorAll('.connector').forEach(conn => {
                conn.style.border = '';
                conn.style.backgroundColor = '';
                conn.style.boxShadow = '';
                const dot = conn.querySelector('.connector-dot');
                if (dot) {
                    dot.style.border = '';
                    dot.style.backgroundColor = '';
                    dot.style.boxShadow = '';
                }
            });
        }, 10000);

        this.showMessage(`Comprehensive test completed for ${allEquipment.length} equipment pieces. Check console for details.`, 'info');
    }

    forceFixAllConnectors() {
        console.log('=== FORCE FIXING ALL CONNECTORS ===');

        const allEquipment = document.querySelectorAll('.equipment');
        if (allEquipment.length === 0) {
            this.showMessage('No equipment found on stage', 'error');
            return;
        }

        let totalConnectorsFixed = 0;

        allEquipment.forEach((equipment, eqIndex) => {
            const equipmentType = equipment.dataset.type;
            const connectors = equipment.querySelectorAll('.connector');

            console.log(`Force fixing ${connectors.length} connectors on ${equipmentType}...`);

            connectors.forEach((connector, connIndex) => {
                const connectorType = connector.dataset.type;
                console.log(`Force fixing connector ${connIndex + 1} (${connectorType}) on ${equipmentType}...`);

                // Force extreme styling
                connector.style.zIndex = '9999';
                connector.style.pointerEvents = 'auto';
                connector.style.cursor = 'pointer';
                connector.style.border = '3px solid #00ff88';
                connector.style.backgroundColor = 'rgba(0, 255, 136, 0.3)';
                connector.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.9)';
                connector.style.transform = 'scale(1.1)';

                // Remove all existing event listeners by cloning
                const newConnector = connector.cloneNode(true);
                connector.parentNode.replaceChild(newConnector, connector);

                // Apply the same styling to the new element
                newConnector.style.zIndex = '9999';
                newConnector.style.pointerEvents = 'auto';
                newConnector.style.cursor = 'pointer';
                newConnector.style.border = '3px solid #00ff88';
                newConnector.style.backgroundColor = 'rgba(0, 255, 136, 0.3)';
                newConnector.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.9)';
                newConnector.style.transform = 'scale(1.1)';

                // Add multiple event listeners
                newConnector.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('FORCE FIXED CONNECTOR CLICKED:', connectorType, 'on', equipmentType);
                    this.handleConnectorClick(newConnector, equipment);
                }, true);

                newConnector.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    console.log('FORCE FIXED CONNECTOR MOUSEDOWN:', connectorType, 'on', equipmentType);
                }, true);

                newConnector.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    newConnector.style.transform = 'scale(1.3)';
                    newConnector.style.boxShadow = '0 0 35px rgba(0, 255, 136, 1)';
                    console.log('FORCE FIXED CONNECTOR HOVER ENTER:', connectorType, 'on', equipmentType);
                }, true);

                newConnector.addEventListener('mouseleave', (e) => {
                    e.stopPropagation();
                    newConnector.style.transform = 'scale(1.1)';
                    newConnector.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.9)';
                    console.log('FORCE FIXED CONNECTOR HOVER LEAVE:', connectorType, 'on', equipmentType);
                }, true);

                // Handle the dot
                const dot = newConnector.querySelector('.connector-dot');
                if (dot) {
                    dot.style.zIndex = '10000';
                    dot.style.pointerEvents = 'auto';
                    dot.style.cursor = 'pointer';
                    dot.style.border = '4px solid white';
                    dot.style.backgroundColor = 'rgba(0, 255, 136, 0.8)';
                    dot.style.boxShadow = '0 0 20px rgba(0, 255, 136, 1)';

                    dot.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('FORCE FIXED DOT CLICKED:', connectorType, 'on', equipmentType);
                        this.handleConnectorClick(newConnector, equipment);
                    }, true);

                    dot.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                        console.log('FORCE FIXED DOT MOUSEDOWN:', connectorType, 'on', equipmentType);
                    }, true);
                }

                totalConnectorsFixed++;
            });
        });

        console.log(`Force fixed ${totalConnectorsFixed} connectors total`);
        this.showMessage(`Force fixed ${totalConnectorsFixed} connectors across all equipment!`, 'info');
    }

    forceFixMixerConnectors() {
        console.log('=== FORCE FIXING MIXER CONNECTORS ONLY ===');

        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        if (mixers.length === 0) {
            this.showMessage('No mixers found on stage', 'error');
            return;
        }

        mixers.forEach((mixer, index) => {
            console.log(`=== FORCE FIXING MIXER ${index + 1} ===`);

            // Find all connectors on this mixer
            const connectors = mixer.querySelectorAll('.connector');
            console.log(`Found ${connectors.length} connectors on mixer ${index + 1}`);

            connectors.forEach((connector, connIndex) => {
                const connectorType = connector.dataset.type;
                console.log(`Force fixing mixer connector ${connIndex + 1} (${connectorType})...`);

                // COMPLETE ELEMENT RECREATION
                const newConnector = document.createElement('div');
                newConnector.className = connector.className;
                newConnector.dataset.type = connector.dataset.type;
                newConnector.dataset.label = connector.dataset.label;
                newConnector.title = connector.title;

                // Copy the inner HTML (connector dot and label)
                newConnector.innerHTML = connector.innerHTML;

                // Replace the old connector
                connector.parentNode.replaceChild(newConnector, connector);

                // FORCE EXTREME STYLING
                newConnector.style.cssText = `
                    position: absolute !important;
                    z-index: 9999 !important;
                    pointer-events: auto !important;
                    cursor: pointer !important;
                    border: 4px solid #00ff88 !important;
                    background-color: rgba(0, 255, 136, 0.4) !important;
                    box-shadow: 0 0 25px rgba(0, 255, 136, 0.9) !important;
                    transform: scale(1.2) !important;
                    transition: all 0.3s ease !important;
                    border-radius: 50% !important;
                    width: 30px !important;
                    height: 30px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                `;

                // FORCE DOT STYLING
                const dot = newConnector.querySelector('.connector-dot');
                if (dot) {
                    dot.style.cssText = `
                        width: 16px !important;
                        height: 16px !important;
                        border-radius: 50% !important;
                        background-color: #00ff88 !important;
                        border: 4px solid white !important;
                        box-shadow: 0 0 15px rgba(0, 255, 136, 1) !important;
                        z-index: 10000 !important;
                        pointer-events: auto !important;
                        cursor: pointer !important;
                        transition: all 0.3s ease !important;
                    `;
                }

                // FORCE EVENT LISTENERS WITH CAPTURE PHASE
                newConnector.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('FORCE FIXED MIXER CONNECTOR CLICKED:', connectorType);
                    this.handleConnectorClick(newConnector, mixer);
                }, true);

                newConnector.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('FORCE FIXED MIXER CONNECTOR MOUSEDOWN:', connectorType);
                }, true);

                newConnector.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    newConnector.style.transform = 'scale(1.5)';
                    newConnector.style.boxShadow = '0 0 35px rgba(0, 255, 136, 1)';
                    newConnector.style.border = '5px solid #00ff88';
                    console.log('FORCE FIXED MIXER CONNECTOR HOVER ENTER:', connectorType);
                }, true);

                newConnector.addEventListener('mouseleave', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    newConnector.style.transform = 'scale(1.2)';
                    newConnector.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.9)';
                    newConnector.style.border = '4px solid #00ff88';
                    console.log('FORCE FIXED MIXER CONNECTOR HOVER LEAVE:', connectorType);
                }, true);

                // FORCE DOT EVENT LISTENERS
                if (dot) {
                    dot.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        console.log('FORCE FIXED MIXER DOT CLICKED:', connectorType);
                        this.handleConnectorClick(newConnector, mixer);
                    }, true);

                    dot.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        console.log('FORCE FIXED MIXER DOT MOUSEDOWN:', connectorType);
                    }, true);

                    dot.addEventListener('mouseenter', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        dot.style.transform = 'scale(1.6)';
                        dot.style.boxShadow = '0 0 25px rgba(0, 255, 136, 1)';
                        console.log('FORCE FIXED MIXER DOT HOVER ENTER:', connectorType);
                    }, true);

                    dot.addEventListener('mouseleave', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        dot.style.transform = 'scale(1)';
                        dot.style.boxShadow = '0 0 15px rgba(0, 255, 136, 1)';
                        console.log('FORCE FIXED MIXER DOT HOVER LEAVE:', connectorType);
                    }, true);
                }

                // ADDITIONAL BACKUP EVENT LISTENERS
                newConnector.onclick = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('BACKUP MIXER CONNECTOR CLICK:', connectorType);
                    this.handleConnectorClick(newConnector, mixer);
                };

                if (dot) {
                    dot.onclick = (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('BACKUP MIXER DOT CLICK:', connectorType);
                        this.handleConnectorClick(newConnector, mixer);
                    };
                }

                console.log(`Mixer connector ${connIndex + 1} (${connectorType}) FORCE FIXED!`);
            });
        });

        this.showMessage('Mixer connectors force fixed! They should now be bright green and highly clickable.', 'info');
    }

    testMixerConnectorsOnly() {
        console.log('=== TESTING MIXER CONNECTORS ONLY ===');

        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        if (mixers.length === 0) {
            this.showMessage('No mixers found on stage', 'error');
            return;
        }

        mixers.forEach((mixer, index) => {
            console.log(`=== TESTING MIXER ${index + 1} ===`);

            const connectors = mixer.querySelectorAll('.connector');
            console.log(`Mixer ${index + 1} has ${connectors.length} connectors`);

            connectors.forEach((connector, connIndex) => {
                const connectorType = connector.dataset.type;
                const rect = connector.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(connector);
                const dot = connector.querySelector('.connector-dot');

                console.log(`Mixer Connector ${connIndex + 1} (${connectorType}):`, {
                    type: connectorType,
                    label: connector.dataset.label,
                    position: connector.className.split(' ')[1],
                    rect: {
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height
                    },
                    style: {
                        zIndex: connector.style.zIndex,
                        pointerEvents: connector.style.pointerEvents,
                        cursor: connector.style.cursor,
                        border: connector.style.border,
                        backgroundColor: connector.style.backgroundColor
                    },
                    computed: {
                        zIndex: computedStyle.zIndex,
                        pointerEvents: computedStyle.pointerEvents,
                        cursor: computedStyle.cursor,
                        display: computedStyle.display,
                        visibility: computedStyle.visibility
                    },
                    isVisible: rect.width > 0 && rect.height > 0,
                    isClickable: computedStyle.pointerEvents !== 'none',
                    hasDot: !!dot
                });

                // Test connector with multiple methods
                console.log(`Testing mixer connector ${connIndex + 1} (${connectorType})...`);

                // Method 1: Direct click
                console.log('  Method 1: Direct click');
                connector.click();

                // Method 2: MouseEvent
                console.log('  Method 2: MouseEvent click');
                connector.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

                // Method 3: Mousedown + mouseup
                console.log('  Method 3: Mousedown + mouseup');
                connector.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                connector.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

                // Test hover
                console.log('  Testing hover...');
                connector.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                setTimeout(() => {
                    connector.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                }, 1000);

                // Test dot if it exists
                if (dot) {
                    console.log('  Testing dot...');
                    dot.click();
                    dot.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                }

                // Add extreme visual debugging
                connector.style.border = '6px solid #ff0000';
                connector.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                connector.style.boxShadow = '0 0 30px rgba(255, 0, 0, 1)';
                connector.style.zIndex = '9999';
                connector.style.transform = 'scale(1.5)';

                if (dot) {
                    dot.style.border = '4px solid #ff0000';
                    dot.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
                    dot.style.boxShadow = '0 0 20px rgba(255, 0, 0, 1)';
                    dot.style.zIndex = '10000';
                }

                // Log the HTML structure
                console.log('Mixer Connector HTML:', connector.outerHTML);
            });
        });

        // Clean up after 8 seconds
        setTimeout(() => {
            document.querySelectorAll('.equipment[data-type="mixing-console"] .connector').forEach(conn => {
                conn.style.border = '';
                conn.style.backgroundColor = '';
                conn.style.boxShadow = '';
                conn.style.zIndex = '';
                conn.style.transform = '';
                const dot = conn.querySelector('.connector-dot');
                if (dot) {
                    dot.style.border = '';
                    dot.style.backgroundColor = '';
                    dot.style.boxShadow = '';
                    dot.style.zIndex = '';
                }
            });
        }, 8000);

        this.showMessage('Mixer connector test completed. Check console for detailed analysis.', 'info');
    }

    nuclearFixMixerConnectors() {
        console.log('=== NUCLEAR FIX FOR MIXER CONNECTORS ===');

        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        if (mixers.length === 0) {
            this.showMessage('No mixers found on stage', 'error');
            return;
        }

        mixers.forEach((mixer, index) => {
            console.log(`=== NUCLEAR FIXING MIXER ${index + 1} ===`);

            // STEP 1: Remove all existing connectors
            const existingConnectors = mixer.querySelectorAll('.connector');
            console.log(`Removing ${existingConnectors.length} existing connectors...`);
            existingConnectors.forEach(conn => conn.remove());

            // STEP 2: Create completely new connectors from scratch
            const connectorTypes = ['power-in', 'xlr-in', 'xlr-out'];
            const connectorLabels = ['Power In', 'Audio In', 'Audio Out'];
            const connectorPositions = ['top', 'left', 'bottom'];

            connectorTypes.forEach((type, i) => {
                console.log(`Creating new connector: ${type}`);

                // Create connector container
                const newConnector = document.createElement('div');
                newConnector.className = `connector ${connectorPositions[i]}`;
                newConnector.dataset.type = type;
                newConnector.dataset.label = connectorLabels[i];
                newConnector.title = connectorLabels[i];

                // Create connector dot
                const dot = document.createElement('div');
                dot.className = 'connector-dot';

                // Create connector label
                const label = document.createElement('div');
                label.className = 'connector-label';
                label.textContent = connectorLabels[i];

                // Assemble connector
                newConnector.appendChild(dot);
                newConnector.appendChild(label);

                // NUCLEAR STYLING
                newConnector.style.cssText = `
                    position: absolute !important;
                    z-index: 99999 !important;
                    pointer-events: auto !important;
                    cursor: pointer !important;
                    border: 5px solid #ff0000 !important;
                    background-color: rgba(255, 0, 0, 0.5) !important;
                    box-shadow: 0 0 40px rgba(255, 0, 0, 1) !important;
                    transform: scale(1.5) !important;
                    transition: all 0.3s ease !important;
                    border-radius: 50% !important;
                    width: 40px !important;
                    height: 40px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 8px !important;
                    color: white !important;
                    font-weight: bold !important;
                `;

                // Position the connector
                if (connectorPositions[i] === 'top') {
                    newConnector.style.top = '-20px';
                    newConnector.style.left = '50%';
                    newConnector.style.transform = 'translateX(-50%) scale(1.5)';
                } else if (connectorPositions[i] === 'left') {
                    newConnector.style.left = '-20px';
                    newConnector.style.top = '50%';
                    newConnector.style.transform = 'translateY(-50%) scale(1.5)';
                } else if (connectorPositions[i] === 'bottom') {
                    newConnector.style.bottom = '-20px';
                    newConnector.style.left = '50%';
                    newConnector.style.transform = 'translateX(-50%) scale(1.5)';
                }

                // NUCLEAR DOT STYLING
                dot.style.cssText = `
                    width: 20px !important;
                    height: 20px !important;
                    border-radius: 50% !important;
                    background-color: #ff0000 !important;
                    border: 5px solid white !important;
                    box-shadow: 0 0 20px rgba(255, 0, 0, 1) !important;
                    z-index: 100000 !important;
                    pointer-events: auto !important;
                    cursor: pointer !important;
                    transition: all 0.3s ease !important;
                    position: relative !important;
                `;

                // NUCLEAR EVENT LISTENERS
                const clickHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('NUCLEAR MIXER CONNECTOR CLICKED:', type);
                    this.handleConnectorClick(newConnector, mixer);
                };

                const mousedownHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('NUCLEAR MIXER CONNECTOR MOUSEDOWN:', type);
                };

                const mouseenterHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    newConnector.style.transform = 'translateX(-50%) scale(2.0)';
                    newConnector.style.boxShadow = '0 0 50px rgba(255, 0, 0, 1)';
                    newConnector.style.border = '6px solid #ff0000';
                    console.log('NUCLEAR MIXER CONNECTOR HOVER ENTER:', type);
                };

                const mouseleaveHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    newConnector.style.transform = 'translateX(-50%) scale(1.5)';
                    newConnector.style.boxShadow = '0 0 40px rgba(255, 0, 0, 1)';
                    newConnector.style.border = '5px solid #ff0000';
                    console.log('NUCLEAR MIXER CONNECTOR HOVER LEAVE:', type);
                };

                // Add multiple event listeners
                newConnector.addEventListener('click', clickHandler, true);
                newConnector.addEventListener('mousedown', mousedownHandler, true);
                newConnector.addEventListener('mouseenter', mouseenterHandler, true);
                newConnector.addEventListener('mouseleave', mouseleaveHandler, true);

                // Add backup event listeners
                newConnector.onclick = clickHandler;
                newConnector.onmousedown = mousedownHandler;
                newConnector.onmouseenter = mouseenterHandler;
                newConnector.onmouseleave = mouseleaveHandler;

                // Add dot event listeners
                dot.addEventListener('click', clickHandler, true);
                dot.addEventListener('mousedown', mousedownHandler, true);
                dot.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    dot.style.transform = 'scale(1.8)';
                    dot.style.boxShadow = '0 0 30px rgba(255, 0, 0, 1)';
                    console.log('NUCLEAR MIXER DOT HOVER ENTER:', type);
                }, true);
                dot.addEventListener('mouseleave', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    dot.style.transform = 'scale(1)';
                    dot.style.boxShadow = '0 0 20px rgba(255, 0, 0, 1)';
                    console.log('NUCLEAR MIXER DOT HOVER LEAVE:', type);
                }, true);

                dot.onclick = clickHandler;
                dot.onmousedown = mousedownHandler;

                // Add to mixer
                mixer.appendChild(newConnector);

                console.log(`NUCLEAR connector ${type} created and added to mixer`);
            });

            console.log(`NUCLEAR fix completed for mixer ${index + 1}`);
        });

        this.showMessage('NUCLEAR fix applied! Mixer connectors should now be bright red and impossible to miss.', 'info');
    }

    debugMixerConnectorIssues() {
        console.log('=== DEEP DIAGNOSTIC OF MIXER CONNECTOR ISSUES ===');

        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        if (mixers.length === 0) {
            this.showMessage('No mixers found on stage', 'error');
            return;
        }

        mixers.forEach((mixer, index) => {
            console.log(`=== DIAGNOSING MIXER ${index + 1} ===`);

            // Check mixer properties
            console.log('Mixer properties:', {
                type: mixer.dataset.type,
                name: mixer.dataset.name,
                className: mixer.className,
                id: mixer.id,
                style: {
                    position: mixer.style.position,
                    zIndex: mixer.style.zIndex,
                    pointerEvents: mixer.style.pointerEvents
                }
            });

            // Check if mixer has any event listeners
            const mixerRect = mixer.getBoundingClientRect();
            console.log('Mixer bounding rect:', mixerRect);

            // Check for overlapping elements
            const elementsAtMixerCenter = document.elementsFromPoint(
                mixerRect.left + mixerRect.width / 2,
                mixerRect.top + mixerRect.height / 2
            );
            console.log('Elements at mixer center:', elementsAtMixerCenter.map(el => ({
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                dataset: el.dataset
            })));

            // Check connectors
            const connectors = mixer.querySelectorAll('.connector');
            console.log(`Found ${connectors.length} connectors on mixer ${index + 1}`);

            connectors.forEach((connector, connIndex) => {
                const connectorType = connector.dataset.type;
                const rect = connector.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(connector);

                console.log(`Connector ${connIndex + 1} (${connectorType}) diagnostic:`, {
                    type: connectorType,
                    label: connector.dataset.label,
                    position: connector.className.split(' ')[1],
                    rect: {
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height
                    },
                    style: {
                        zIndex: connector.style.zIndex,
                        pointerEvents: connector.style.pointerEvents,
                        cursor: connector.style.cursor,
                        border: connector.style.border,
                        backgroundColor: connector.style.backgroundColor,
                        display: connector.style.display,
                        visibility: connector.style.visibility,
                        position: connector.style.position
                    },
                    computed: {
                        zIndex: computedStyle.zIndex,
                        pointerEvents: computedStyle.pointerEvents,
                        cursor: computedStyle.cursor,
                        display: computedStyle.display,
                        visibility: computedStyle.visibility,
                        position: computedStyle.position
                    },
                    isVisible: rect.width > 0 && rect.height > 0,
                    isClickable: computedStyle.pointerEvents !== 'none',
                    hasParent: !!connector.parentNode,
                    parentType: connector.parentNode?.tagName,
                    eventListeners: connector.onclick ? 'Has onclick' : 'No onclick'
                });

                // Check if connector is being covered
                if (rect.width > 0 && rect.height > 0) {
                    const elementsAtConnector = document.elementsFromPoint(
                        rect.left + rect.width / 2,
                        rect.top + rect.height / 2
                    );
                    console.log(`Elements at connector ${connectorType}:`, elementsAtConnector.map(el => ({
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        dataset: el.dataset
                    })));
                }

                // Test if connector is actually clickable
                console.log(`Testing clickability of ${connectorType}...`);
                try {
                    connector.click();
                    console.log(`  Direct click on ${connectorType} executed`);
                } catch (error) {
                    console.log(`  Error clicking ${connectorType}:`, error);
                }

                // Check dot
                const dot = connector.querySelector('.connector-dot');
                if (dot) {
                    const dotRect = dot.getBoundingClientRect();
                    const dotStyle = window.getComputedStyle(dot);

                    console.log(`  Dot for ${connectorType}:`, {
                        rect: {
                            left: dotRect.left,
                            top: dotRect.top,
                            width: dotRect.width,
                            height: dotRect.height
                        },
                        style: {
                            pointerEvents: dot.style.pointerEvents,
                            cursor: dot.style.cursor
                        },
                        computed: {
                            pointerEvents: dotStyle.pointerEvents,
                            cursor: dotStyle.cursor
                        },
                        isClickable: dotStyle.pointerEvents !== 'none'
                    });

                    try {
                        dot.click();
                        console.log(`  Direct click on ${connectorType} dot executed`);
                    } catch (error) {
                        console.log(`  Error clicking ${connectorType} dot:`, error);
                    }
                }

                // Add diagnostic highlighting
                connector.style.border = '8px solid #ff0000';
                connector.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
                connector.style.boxShadow = '0 0 50px rgba(255, 0, 0, 1)';
                connector.style.zIndex = '99999';
                connector.style.transform = 'scale(2.0)';

                if (dot) {
                    dot.style.border = '6px solid #ff0000';
                    dot.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
                    dot.style.boxShadow = '0 0 30px rgba(255, 0, 0, 1)';
                    dot.style.zIndex = '100000';
                }
            });
        });

        // Clean up after 15 seconds
        setTimeout(() => {
            document.querySelectorAll('.equipment[data-type="mixing-console"] .connector').forEach(conn => {
                conn.style.border = '';
                conn.style.backgroundColor = '';
                conn.style.boxShadow = '';
                conn.style.zIndex = '';
                conn.style.transform = '';
                const dot = conn.querySelector('.connector-dot');
                if (dot) {
                    dot.style.border = '';
                    dot.style.backgroundColor = '';
                    dot.style.boxShadow = '';
                    dot.style.zIndex = '';
                }
            });
        }, 15000);

        this.showMessage('Deep diagnostic completed. Check console for detailed analysis.', 'info');
    }

    createFloatingMixerConnectors() {
        console.log('=== CREATING FLOATING MIXER CONNECTORS ===');

        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        if (mixers.length === 0) {
            this.showMessage('No mixers found on stage', 'error');
            return;
        }

        mixers.forEach((mixer, index) => {
            console.log(`=== CREATING FLOATING CONNECTORS FOR MIXER ${index + 1} ===`);

            const mixerRect = mixer.getBoundingClientRect();
            console.log('Mixer position:', mixerRect);

            // Remove any existing floating connectors for this mixer
            document.querySelectorAll('.floating-mixer-connector').forEach(conn => {
                if (conn.dataset.mixerIndex === index.toString()) {
                    conn.remove();
                }
            });

            // Create floating connectors that are NOT children of the mixer
            const connectorTypes = ['power-in', 'xlr-in', 'xlr-out'];
            const connectorLabels = ['Power In', 'Audio In', 'Audio Out'];
            const connectorPositions = [
                { top: mixerRect.top - 30, left: mixerRect.left + mixerRect.width / 2 - 20 }, // Top
                { top: mixerRect.top + mixerRect.height / 2 - 20, left: mixerRect.left - 30 }, // Left
                { top: mixerRect.bottom + 10, left: mixerRect.left + mixerRect.width / 2 - 20 } // Bottom
            ];

            connectorTypes.forEach((type, i) => {
                console.log(`Creating floating connector: ${type}`);

                // Create floating connector container
                const floatingConnector = document.createElement('div');
                floatingConnector.className = 'floating-mixer-connector';
                floatingConnector.dataset.type = type;
                floatingConnector.dataset.label = connectorLabels[i];
                floatingConnector.dataset.mixerIndex = index.toString();
                floatingConnector.title = connectorLabels[i];

                // Create connector dot
                const dot = document.createElement('div');
                dot.className = 'floating-connector-dot';

                // Create connector label
                const label = document.createElement('div');
                label.className = 'floating-connector-label';
                label.textContent = connectorLabels[i];

                // Assemble connector
                floatingConnector.appendChild(dot);
                floatingConnector.appendChild(label);

                // FLOATING STYLING - Positioned absolutely on the page
                floatingConnector.style.cssText = `
                    position: fixed !important;
                    z-index: 999999 !important;
                    pointer-events: auto !important;
                    cursor: pointer !important;
                    border: 6px solid #00ff00 !important;
                    background-color: rgba(0, 255, 0, 0.6) !important;
                    box-shadow: 0 0 50px rgba(0, 255, 0, 1) !important;
                    transform: scale(1.8) !important;
                    transition: all 0.3s ease !important;
                    border-radius: 50% !important;
                    width: 50px !important;
                    height: 50px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 10px !important;
                    color: white !important;
                    font-weight: bold !important;
                    top: ${connectorPositions[i].top}px !important;
                    left: ${connectorPositions[i].left}px !important;
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                `;

                // FLOATING DOT STYLING
                dot.style.cssText = `
                    width: 25px !important;
                    height: 25px !important;
                    border-radius: 50% !important;
                    background-color: #00ff00 !important;
                    border: 6px solid white !important;
                    box-shadow: 0 0 25px rgba(0, 255, 0, 1) !important;
                    z-index: 1000000 !important;
                    pointer-events: auto !important;
                    cursor: pointer !important;
                    transition: all 0.3s ease !important;
                    position: relative !important;
                `;

                // FLOATING LABEL STYLING
                label.style.cssText = `
                    position: absolute !important;
                    top: 60px !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    background-color: rgba(0, 0, 0, 0.8) !important;
                    color: white !important;
                    padding: 4px 8px !important;
                    border-radius: 4px !important;
                    font-size: 12px !important;
                    white-space: nowrap !important;
                    z-index: 1000001 !important;
                    pointer-events: none !important;
                `;

                // FLOATING EVENT LISTENERS
                const clickHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('FLOATING MIXER CONNECTOR CLICKED:', type, 'for mixer', index);
                    this.handleConnectorClick(floatingConnector, mixer);
                };

                const mousedownHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('FLOATING MIXER CONNECTOR MOUSEDOWN:', type, 'for mixer', index);
                };

                const mouseenterHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    floatingConnector.style.transform = 'scale(2.2)';
                    floatingConnector.style.boxShadow = '0 0 60px rgba(0, 255, 0, 1)';
                    floatingConnector.style.border = '8px solid #00ff00';
                    console.log('FLOATING MIXER CONNECTOR HOVER ENTER:', type, 'for mixer', index);
                };

                const mouseleaveHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    floatingConnector.style.transform = 'scale(1.8)';
                    floatingConnector.style.boxShadow = '0 0 50px rgba(0, 255, 0, 1)';
                    floatingConnector.style.border = '6px solid #00ff00';
                    console.log('FLOATING MIXER CONNECTOR HOVER LEAVE:', type, 'for mixer', index);
                };

                // Add multiple event listeners
                floatingConnector.addEventListener('click', clickHandler, true);
                floatingConnector.addEventListener('mousedown', mousedownHandler, true);
                floatingConnector.addEventListener('mouseenter', mouseenterHandler, true);
                floatingConnector.addEventListener('mouseleave', mouseleaveHandler, true);

                // Add backup event listeners
                floatingConnector.onclick = clickHandler;
                floatingConnector.onmousedown = mousedownHandler;
                floatingConnector.onmouseenter = mouseenterHandler;
                floatingConnector.onmouseleave = mouseleaveHandler;

                // Add dot event listeners
                dot.addEventListener('click', clickHandler, true);
                dot.addEventListener('mousedown', mousedownHandler, true);
                dot.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    dot.style.transform = 'scale(1.5)';
                    dot.style.boxShadow = '0 0 35px rgba(0, 255, 0, 1)';
                    console.log('FLOATING MIXER DOT HOVER ENTER:', type, 'for mixer', index);
                }, true);
                dot.addEventListener('mouseleave', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    dot.style.transform = 'scale(1)';
                    dot.style.boxShadow = '0 0 25px rgba(0, 255, 0, 1)';
                    console.log('FLOATING MIXER DOT HOVER LEAVE:', type, 'for mixer', index);
                }, true);

                dot.onclick = clickHandler;
                dot.onmousedown = mousedownHandler;

                // Add to the body (not the mixer)
                document.body.appendChild(floatingConnector);

                console.log(`FLOATING connector ${type} created and added to body for mixer ${index}`);
            });

            console.log(`FLOATING connectors created for mixer ${index + 1}`);
        });

        this.showMessage('Floating mixer connectors created! They should now be bright green and floating above the mixers.', 'info');
    }

    testFloatingConnectors() {
        console.log('=== TESTING FLOATING MIXER CONNECTORS ===');

        const floatingConnectors = document.querySelectorAll('.floating-mixer-connector');
        if (floatingConnectors.length === 0) {
            this.showMessage('No floating connectors found', 'error');
            return;
        }

        console.log(`Found ${floatingConnectors.length} floating connectors`);

        floatingConnectors.forEach((connector, index) => {
            const connectorType = connector.dataset.type;
            const mixerIndex = connector.dataset.mixerIndex;
            const rect = connector.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(connector);
            const dot = connector.querySelector('.floating-connector-dot');

            console.log(`Floating Connector ${index + 1} (${connectorType} for mixer ${mixerIndex}):`, {
                type: connectorType,
                label: connector.dataset.label,
                mixerIndex: mixerIndex,
                rect: {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height
                },
                style: {
                    zIndex: connector.style.zIndex,
                    pointerEvents: connector.style.pointerEvents,
                    cursor: connector.style.cursor,
                    position: connector.style.position
                },
                computed: {
                    zIndex: computedStyle.zIndex,
                    pointerEvents: computedStyle.pointerEvents,
                    cursor: computedStyle.cursor,
                    position: computedStyle.position
                },
                isVisible: rect.width > 0 && rect.height > 0,
                isClickable: computedStyle.pointerEvents !== 'none',
                hasParent: !!connector.parentNode,
                parentType: connector.parentNode?.tagName
            });

            // Test connector functionality
            console.log(`Testing floating connector ${index + 1} (${connectorType})...`);

            // Test click
            console.log('  Testing click...');
            connector.click();

            // Test hover
            console.log('  Testing hover...');
            connector.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            setTimeout(() => {
                connector.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            }, 1000);

            // Test dot if it exists
            if (dot) {
                console.log('  Testing dot...');
                dot.click();
                dot.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                setTimeout(() => {
                    dot.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                }, 500);
            }

            // Add test highlighting
            connector.style.border = '8px solid #ffff00';
            connector.style.backgroundColor = 'rgba(255, 255, 0, 0.7)';
            connector.style.boxShadow = '0 0 60px rgba(255, 255, 0, 1)';

            if (dot) {
                dot.style.border = '6px solid #ffff00';
                dot.style.backgroundColor = 'rgba(255, 255, 0, 0.9)';
                dot.style.boxShadow = '0 0 35px rgba(255, 255, 0, 1)';
            }
        });

        // Clean up after 10 seconds
        setTimeout(() => {
            document.querySelectorAll('.floating-mixer-connector').forEach(conn => {
                conn.style.border = '';
                conn.style.backgroundColor = '';
                conn.style.boxShadow = '';
                const dot = conn.querySelector('.floating-connector-dot');
                if (dot) {
                    dot.style.border = '';
                    dot.style.backgroundColor = '';
                    dot.style.boxShadow = '';
                }
            });
        }, 10000);

        this.showMessage('Floating connector test completed. Check console for details.', 'info');
    }

    removeFloatingConnectors() {
        console.log('=== REMOVING FLOATING MIXER CONNECTORS ===');

        const floatingConnectors = document.querySelectorAll('.floating-mixer-connector');
        console.log(`Removing ${floatingConnectors.length} floating connectors`);

        floatingConnectors.forEach(connector => {
            connector.remove();
        });

        this.showMessage('Floating connectors removed.', 'info');
    }

    testMixerAsEquipment() {
        console.log('=== TESTING MIXER AS REGULAR EQUIPMENT ===');

        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        if (mixers.length === 0) {
            this.showMessage('No mixers found on stage', 'error');
            return;
        }

        mixers.forEach((mixer, index) => {
            console.log(`=== TESTING MIXER ${index + 1} AS EQUIPMENT ===`);

            // Test basic equipment properties
            console.log('Mixer equipment properties:', {
                type: mixer.dataset.type,
                name: mixer.dataset.name,
                className: mixer.className,
                style: {
                    position: mixer.style.position,
                    left: mixer.style.left,
                    top: mixer.style.top,
                    zIndex: mixer.style.zIndex
                }
            });

            // Test if mixer has the same structure as other equipment
            const icon = mixer.querySelector('.equipment-icon');
            const label = mixer.querySelector('.equipment-label');
            const connectors = mixer.querySelectorAll('.connector');

            console.log('Mixer structure:', {
                hasIcon: !!icon,
                hasLabel: !!label,
                connectorCount: connectors.length,
                iconClass: icon?.querySelector('i')?.className,
                labelText: label?.textContent
            });

            // Test connectors
            connectors.forEach((connector, connIndex) => {
                const connectorType = connector.dataset.type;
                const rect = connector.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(connector);
                const dot = connector.querySelector('.connector-dot');

                console.log(`Connector ${connIndex + 1} (${connectorType}):`, {
                    type: connectorType,
                    label: connector.dataset.label,
                    position: connector.className.split(' ')[1],
                    rect: {
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height
                    },
                    style: {
                        zIndex: connector.style.zIndex,
                        pointerEvents: connector.style.pointerEvents,
                        cursor: connector.style.cursor
                    },
                    computed: {
                        zIndex: computedStyle.zIndex,
                        pointerEvents: computedStyle.pointerEvents,
                        cursor: computedStyle.cursor
                    },
                    isVisible: rect.width > 0 && rect.height > 0,
                    isClickable: computedStyle.pointerEvents !== 'none',
                    hasDot: !!dot
                });

                // Test if connector is actually clickable
                console.log(`Testing clickability of ${connectorType}...`);
                try {
                    connector.click();
                    console.log(`  Direct click on ${connectorType} executed successfully`);
                } catch (error) {
                    console.log(`  Error clicking ${connectorType}:`, error);
                }

                // Test dot if it exists
                if (dot) {
                    try {
                        dot.click();
                        console.log(`  Direct click on ${connectorType} dot executed successfully`);
                    } catch (error) {
                        console.log(`  Error clicking ${connectorType} dot:`, error);
                    }
                }

                // Add simple visual test
                connector.style.border = '4px solid #00ff00';
                connector.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';

                if (dot) {
                    dot.style.border = '3px solid #00ff00';
                    dot.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
                }
            });

            // Test if mixer responds to equipment events
            console.log('Testing mixer equipment events...');
            try {
                mixer.click();
                console.log('  Mixer click event executed successfully');
            } catch (error) {
                console.log('  Error with mixer click event:', error);
            }

            // Test if mixer can be dragged
            console.log('Testing mixer drag functionality...');
            const mixerRect = mixer.getBoundingClientRect();
            console.log('Mixer position before test:', mixerRect);

            // Simulate a drag start (but not on a connector)
            const mousedownEvent = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                clientX: mixerRect.left + 10,
                clientY: mixerRect.top + 10
            });

            try {
                mixer.dispatchEvent(mousedownEvent);
                console.log('  Mixer mousedown event executed successfully');
            } catch (error) {
                console.log('  Error with mixer mousedown event:', error);
            }
        });

        // Clean up after 8 seconds
        setTimeout(() => {
            document.querySelectorAll('.equipment[data-type="mixing-console"] .connector').forEach(conn => {
                conn.style.border = '';
                conn.style.backgroundColor = '';
                const dot = conn.querySelector('.connector-dot');
                if (dot) {
                    dot.style.border = '';
                    dot.style.backgroundColor = '';
                }
            });
        }, 8000);

        this.showMessage('Mixer equipment test completed. Check console for details.', 'info');
    }

    verifyMixerSetup() {
        console.log('=== VERIFYING MIXER SETUP ===');

        // Check if mixer is in level data
        const levelData = this.getLevelData(this.currentLevel);
        const mixerData = levelData.equipment.find(eq => eq.type === 'mixing-console');

        if (!mixerData) {
            console.log('ERROR: Mixer not found in level data!');
            this.showMessage('Mixer not found in level data!', 'error');
            return;
        }

        console.log('Mixer found in level data:', mixerData);

        // Check if mixer is in toolbar
        const mixerTool = document.querySelector('.tool[data-type="mixing-console"]');
        if (!mixerTool) {
            console.log('ERROR: Mixer tool not found in toolbar!');
            this.showMessage('Mixer tool not found in toolbar!', 'error');
            return;
        }

        console.log('Mixer tool found in toolbar:', mixerTool);

        // Check if mixer is on stage
        const mixersOnStage = document.querySelectorAll('.equipment[data-type="mixing-console"]');
        console.log(`Found ${mixersOnStage.length} mixers on stage`);

        mixersOnStage.forEach((mixer, index) => {
            console.log(`Mixer ${index + 1} on stage:`, {
                type: mixer.dataset.type,
                name: mixer.dataset.name,
                connectors: mixer.querySelectorAll('.connector').length
            });
        });

        this.showMessage(`Mixer setup verification complete. Found ${mixersOnStage.length} mixers on stage.`, 'info');
    }

    comparePowerAndMixerConnectors() {
        console.log('=== COMPARING POWER-DISTRO AND MIXER CONNECTORS ===');

        const powerDistros = document.querySelectorAll('.equipment[data-type="power-distro"]');
        const mixers = document.querySelectorAll('.equipment[data-type="mixing-console"]');

        console.log(`Found ${powerDistros.length} power distros and ${mixers.length} mixers`);

        if (powerDistros.length === 0) {
            this.showMessage('No power distros found on stage', 'error');
            return;
        }

        if (mixers.length === 0) {
            this.showMessage('No mixers found on stage', 'error');
            return;
        }

        // Test power distro connectors
        powerDistros.forEach((powerDistro, index) => {
            console.log(`=== POWER DISTRO ${index + 1} CONNECTORS ===`);

            const connectors = powerDistro.querySelectorAll('.connector');
            console.log(`Power distro has ${connectors.length} connectors`);

            connectors.forEach((connector, connIndex) => {
                const connectorType = connector.dataset.type;
                const rect = connector.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(connector);
                const dot = connector.querySelector('.connector-dot');

                console.log(`Power Connector ${connIndex + 1} (${connectorType}):`, {
                    type: connectorType,
                    label: connector.dataset.label,
                    position: connector.className.split(' ')[1],
                    rect: {
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height
                    },
                    style: {
                        zIndex: connector.style.zIndex,
                        pointerEvents: connector.style.pointerEvents,
                        cursor: connector.style.cursor
                    },
                    computed: {
                        zIndex: computedStyle.zIndex,
                        pointerEvents: computedStyle.pointerEvents,
                        cursor: computedStyle.cursor
                    },
                    isVisible: rect.width > 0 && rect.height > 0,
                    isClickable: computedStyle.pointerEvents !== 'none',
                    hasDot: !!dot
                });

                // Test power connector click
                console.log(`Testing power connector ${connIndex + 1} (${connectorType})...`);
                try {
                    connector.click();
                    console.log(`  Power connector ${connectorType} click executed successfully`);
                } catch (error) {
                    console.log(`  Error clicking power connector ${connectorType}:`, error);
                }

                // Add visual test for power connectors
                connector.style.border = '4px solid #ff4757';
                connector.style.backgroundColor = 'rgba(255, 71, 87, 0.3)';

                if (dot) {
                    dot.style.border = '3px solid #ff4757';
                    dot.style.backgroundColor = 'rgba(255, 71, 87, 0.5)';
                }
            });
        });

        // Test mixer connectors
        mixers.forEach((mixer, index) => {
            console.log(`=== MIXER ${index + 1} CONNECTORS ===`);

            const connectors = mixer.querySelectorAll('.connector');
            console.log(`Mixer has ${connectors.length} connectors`);

            connectors.forEach((connector, connIndex) => {
                const connectorType = connector.dataset.type;
                const rect = connector.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(connector);
                const dot = connector.querySelector('.connector-dot');

                console.log(`Mixer Connector ${connIndex + 1} (${connectorType}):`, {
                    type: connectorType,
                    label: connector.dataset.label,
                    position: connector.className.split(' ')[1],
                    rect: {
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height
                    },
                    style: {
                        zIndex: connector.style.zIndex,
                        pointerEvents: connector.style.pointerEvents,
                        cursor: connector.style.cursor
                    },
                    computed: {
                        zIndex: computedStyle.zIndex,
                        pointerEvents: computedStyle.pointerEvents,
                        cursor: computedStyle.cursor
                    },
                    isVisible: rect.width > 0 && rect.height > 0,
                    isClickable: computedStyle.pointerEvents !== 'none',
                    hasDot: !!dot
                });

                // Test mixer connector click
                console.log(`Testing mixer connector ${connIndex + 1} (${connectorType})...`);
                try {
                    connector.click();
                    console.log(`  Mixer connector ${connectorType} click executed successfully`);
                } catch (error) {
                    console.log(`  Error clicking mixer connector ${connectorType}:`, error);
                }

                // Add visual test for mixer connectors
                connector.style.border = '4px solid #00ff88';
                connector.style.backgroundColor = 'rgba(0, 255, 136, 0.3)';

                if (dot) {
                    dot.style.border = '3px solid #00ff88';
                    dot.style.backgroundColor = 'rgba(0, 255, 136, 0.5)';
                }
            });
        });

        // Clean up after 10 seconds
        setTimeout(() => {
            document.querySelectorAll('.connector').forEach(conn => {
                conn.style.border = '';
                conn.style.backgroundColor = '';
                const dot = conn.querySelector('.connector-dot');
                if (dot) {
                    dot.style.border = '';
                    dot.style.backgroundColor = '';
                }
            });
        }, 10000);

        this.showMessage('Power and mixer connector comparison completed. Check console for details.', 'info');
    }

    nextLevel() {
        const levelOrder = [
            'audio-1', 'audio-2', 'audio-3',
            'lighting-1', 'lighting-2', 'lighting-3',
            'video-1', 'video-2', 'video-3',
            'set-1', 'set-2', 'set-3'
        ];

        const currentIndex = levelOrder.indexOf(this.currentLevel);
        if (currentIndex >= 0 && currentIndex < levelOrder.length - 1) {
            const nextLevel = levelOrder[currentIndex + 1];
            if (this.gameState.unlockedLevels.includes(nextLevel)) {
                this.selectLevel(nextLevel);
            } else {
                this.showLevelSelect();
            }
        } else {
            this.showLevelSelect();
        }
    }

    replayLevel() {
        this.selectLevel(this.currentLevel);
    }

    exitToMenu() {
        this.stopGameTimer();
        this.showMainMenu();
    }

    showTutorial() {
        document.getElementById('tutorial-modal').classList.add('active');
    }

    closeTutorial() {
        document.getElementById('tutorial-modal').classList.remove('active');
    }

    nextTutorialStep() {
        const currentStep = document.querySelector('.tutorial-step.active');
        const nextStep = currentStep.nextElementSibling;

        if (nextStep && nextStep.classList.contains('tutorial-step')) {
            currentStep.classList.remove('active');
            nextStep.classList.add('active');
            this.updateTutorialNavigation();
        }
    }

    prevTutorialStep() {
        const currentStep = document.querySelector('.tutorial-step.active');
        const prevStep = currentStep.previousElementSibling;

        if (prevStep && prevStep.classList.contains('tutorial-step')) {
            currentStep.classList.remove('active');
            prevStep.classList.add('active');
            this.updateTutorialNavigation();
        }
    }

    goToTutorialStep(step) {
        document.querySelectorAll('.tutorial-step').forEach(s => s.classList.remove('active'));
        document.querySelector(`[data-step="${step}"]`).classList.add('active');
        this.updateTutorialNavigation();
    }

    updateTutorialNavigation() {
        const steps = document.querySelectorAll('.tutorial-step');
        const currentStep = document.querySelector('.tutorial-step.active');
        const currentIndex = Array.from(steps).indexOf(currentStep);

        document.getElementById('prev-tutorial').disabled = currentIndex === 0;
        document.getElementById('next-tutorial').disabled = currentIndex === steps.length - 1;

        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    showSettings() {
        this.showMessage('Settings panel coming soon!', 'info');
    }

    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        document.body.appendChild(messageElement);

        setTimeout(() => messageElement.classList.add('show'), 100);
        setTimeout(() => {
            messageElement.classList.remove('show');
            setTimeout(() => messageElement.remove(), 300);
        }, 3000);
    }

    handleKeyPress(e) {
        // Check if hint popup is open - if so, let the popup handle the key
        const hintPopup = document.querySelector('.hint-popup');
        if (hintPopup && !hintPopup.classList.contains('hint-fade-out')) {
            return; // Let the hint popup handle its own keys
        }

        if (this.currentScreen === 'game-play') {
            switch (e.key) {
                case 'Escape':
                    this.pauseGame();
                    break;
                case 'Delete':
                case 'Backspace':
                    if (this.selectedEquipment) {
                        this.selectedEquipment.remove();
                        this.equipment = this.equipment.filter(eq => eq !== this.selectedEquipment);
                        this.selectedEquipment = null;
                    } else {
                        this.deleteSelectedConnection();
                    }
                    break;
                case 'h':
                case 'H':
                    this.showHint();
                    break;
                case 't':
                case 'T':
                    this.testSetup();
                    break;
                case 'c':
                case 'C':
                    this.testConnectors();
                    break;
                case 'm':
                case 'M':
                    this.testMixerOutput();
                    break;
                case 'l':
                case 'L':
                    this.testConnectionColors();
                    break;
                case 'n':
                case 'N':
                    this.testMixerConnectors();
                    break;
                case 'a':
                case 'A':
                    this.testAllConnectors();
                    break;
                case 'r':
                case 'R':
                    this.forceResetConnectors();
                    break;
                case 'd':
                case 'D':
                    this.debugMixerConnectors();
                    break;
                case 'p':
                case 'P':
                    this.testMixerPowerAndAudio();
                    break;
                case 't':
                case 'T':
                    this.testAllMixerConnectors();
                    break;
                case 'x':
                case 'X':
                    this.debugXlrOutConnector();
                    break;
                case 'f':
                case 'F':
                    this.forceFixXlrOutConnector();
                    break;
                case 'e':
                case 'E':
                    this.testAllEquipmentConnectors();
                    break;
                case 'g':
                case 'G':
                    this.forceFixAllConnectors();
                    break;
                case 'm':
                case 'M':
                    this.forceFixMixerConnectors();
                    break;
                case 'n':
                case 'N':
                    this.testMixerConnectorsOnly();
                    break;
                case 'u':
                case 'U':
                    this.nuclearFixMixerConnectors();
                    break;
                case 'i':
                case 'I':
                    this.debugMixerConnectorIssues();
                    break;
                case 'l':
                case 'L':
                    this.createFloatingMixerConnectors();
                    break;
                case 'k':
                case 'K':
                    this.testFloatingConnectors();
                    break;
                case 'j':
                case 'J':
                    this.removeFloatingConnectors();
                    break;
                case 'v':
                case 'V':
                    this.verifyMixerSetup();
                    break;
                case 'w':
                case 'W':
                    this.testMixerAsEquipment();
                    break;
                case 'c':
                case 'C':
                    this.comparePowerAndMixerConnectors();
                    break;
                case 't':
                case 'T':
                    this.testConnectionLine();
                    break;
                case 'v':
                case 'V':
                    console.log('Manual validation check triggered');
                    this.checkLevelCompletion();
                    break;
                case 'd':
                case 'D':
                    console.log('Debug level 3 validation');
                    this.debugLevel3Validation();
                    break;
                case 'h':
                case 'H':
                    console.log('Manual hint triggered');
                    this.showHint();
                    break;
                case 'i':
                case 'I':
                    console.log('Detailed hint triggered');
                    this.showDetailedHint();
                    break;
                case 'p':
                case 'P':
                    console.log('Debug connection progress');
                    this.debugConnectionProgress();
                    break;
                case 'm':
                case 'M':
                    console.log('Highlight missing connections');
                    this.highlightMissingConnections();
                    break;
                case 'z':
                case 'Z':
                    console.log('Debug connection lines');
                    this.debugConnectionLines();
                    break;
            }
        }
    }

    deleteSelectedConnection() {
        const selectedConnection = document.querySelector('.connection-line.selected');
        if (selectedConnection) {
            // Find the connection data
            const connectionIndex = this.connections.findIndex(conn => conn.line === selectedConnection);
            if (connectionIndex !== -1) {
                const connection = this.connections[connectionIndex];
                this.deleteConnection(selectedConnection, connection.from, connection.to);
            }
        }
    }

    loadGameState() {
        const saved = localStorage.getItem('avMasterGameState');
        if (saved) {
            this.gameState = { ...this.gameState, ...JSON.parse(saved) };
        }
    }

    saveGameState() {
        localStorage.setItem('avMasterGameState', JSON.stringify(this.gameState));
    }

    loadLevelData() {
        // This would typically load level data from a server
        // For now, we're using the hardcoded data in getLevelData()
        console.log('Level data loaded');
    }

    // Test function to manually create a connection line
    testConnectionLine() {
        console.log('Testing connection line creation...');

        // Find two connectors to test with
        const connectors = document.querySelectorAll('.connector');
        if (connectors.length < 2) {
            console.log('Not enough connectors found for testing');
            return;
        }

        const from = { connector: connectors[0] };
        const to = { connector: connectors[1] };
        const color = '#00ff88';

        console.log('Testing with connectors:', from.connector, to.connector);

        const line = this.drawConnectionLine(from, to, color);
        console.log('Test line created:', line);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Setup drag and drop for stage area
    const stageArea = document.getElementById('stage-area');
    stageArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });
    stageArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (window.game && window.game.draggedElement) {
            const rect = stageArea.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            // Constrain drop position to stage boundaries
            const equipmentWidth = 80; // Default equipment width
            const equipmentHeight = 80; // Default equipment height
            const maxX = rect.width - equipmentWidth;
            const maxY = rect.height - equipmentHeight;

            x = Math.max(0, Math.min(x, maxX));
            y = Math.max(0, Math.min(y, maxY));

            window.game.placeEquipment(window.game.draggedElement, x, y);
            window.game.draggedElement = null;
        }
    });

    // Start the game
    window.game = new AVMasterGame();
});
