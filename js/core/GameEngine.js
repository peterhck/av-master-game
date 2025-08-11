// Main Game Engine
// Imports and coordinates all game modules

import { AudioSystem } from '../modules/AudioSystem.js';
import { getLevelData, LEVEL_ORDER } from '../data/LevelData.js';
import {
    getConnectorColor,
    calculateRequiredConnections,
    getEquipmentInfo,
    saveToStorage,
    loadFromStorage,
    generateId
} from '../utils/Helpers.js';

export class AVMasterGame {
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
            dmx: { current: 0, required: 0 },
            hdmi: { current: 0, required: 0 }
        };

        // Initialize audio system
        this.audioSystem = new AudioSystem();

        // Don't initialize immediately - wait for DOM to be ready
        // this.init();
    }

    /**
     * Initialize the game
     */
    init() {
        try {
            console.log('GameEngine.init() - Step 1: Loading game state...');
            this.loadGameState();
            console.log('✓ Game state loaded');

            console.log('GameEngine.init() - Step 2: Setting up event listeners...');
            this.setupEventListeners();
            console.log('✓ Event listeners set up');

            console.log('GameEngine.init() - Step 3: Showing loading screen...');
            this.showLoadingScreen();
            console.log('✓ Loading screen shown');

            // Simulate loading time with progress updates
            console.log('GameEngine.init() - Step 4: Starting loading sequence...');
            this.startLoadingSequence();
            console.log('✓ Loading sequence started');

            console.log('GameEngine.init() - Initialization sequence completed');
        } catch (error) {
            console.error('❌ Error in GameEngine.init():', error);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        try {
            console.log('setupEventListeners() - Setting up main menu events...');

            // Main menu events
            const startGameBtn = document.getElementById('start-game-btn');
            console.log('🔍 Looking for start-game-btn:', startGameBtn);
            if (startGameBtn) {
                console.log('✅ Found start-game-btn, adding event listener...');
                startGameBtn.addEventListener('click', (e) => {
                    console.log('🎯 start-game-btn clicked!');
                    e.preventDefault();
                    e.stopPropagation();
                    // Initialize audio system on first user interaction
                    this.audioSystem.initializeOnUserInteraction();
                    this.showLevelSelect();
                });

                // Add mouse events for debugging
                startGameBtn.addEventListener('mouseenter', () => {
                    console.log('🖱️ Mouse entered start-game-btn');
                });

                startGameBtn.addEventListener('mouseleave', () => {
                    console.log('🖱️ Mouse left start-game-btn');
                });

                startGameBtn.addEventListener('mousedown', () => {
                    console.log('🖱️ Mouse down on start-game-btn');
                });

                startGameBtn.addEventListener('mouseup', () => {
                    console.log('🖱️ Mouse up on start-game-btn');
                });
                console.log('✓ start-game-btn event listener added');

                // Test if the button is clickable
                console.log('🔍 Button properties:', {
                    disabled: startGameBtn.disabled,
                    style: startGameBtn.style.display,
                    className: startGameBtn.className,
                    innerHTML: startGameBtn.innerHTML.substring(0, 50) + '...'
                });
            } else {
                console.log('⚠ start-game-btn not found');
                console.log('🔍 Available buttons:', document.querySelectorAll('button').length);
                console.log('🔍 All button IDs:', Array.from(document.querySelectorAll('button')).map(b => b.id));
            }

            const tutorialBtn = document.getElementById('tutorial-btn');
            if (tutorialBtn) {
                tutorialBtn.addEventListener('click', () => {
                    console.log('🎯 tutorial-btn clicked!');
                    this.showTutorial();
                });
                console.log('✓ tutorial-btn event listener added');
            } else {
                console.log('⚠ tutorial-btn not found');
            }

            const settingsBtn = document.getElementById('settings-btn');
            if (settingsBtn) {
                settingsBtn.addEventListener('click', () => {
                    console.log('🎯 settings-btn clicked!');
                    this.showSettings();
                });
                console.log('✓ settings-btn event listener added');
            } else {
                console.log('⚠ settings-btn not found');
            }

            console.log('setupEventListeners() - Setting up level select events...');
            // Level select events
            document.addEventListener('click', (e) => {
                console.log('🌐 Document click detected on:', e.target.tagName, e.target.className);
                if (e.target.closest('.level-card')) {
                    const levelCard = e.target.closest('.level-card');
                    const levelId = levelCard.dataset.level;
                    console.log('🎯 Level card clicked:', levelId);
                    console.log('🔍 Unlocked levels:', this.gameState.unlockedLevels);
                    if (levelId && this.gameState.unlockedLevels.includes(levelId)) {
                        console.log('✅ Level is unlocked, selecting:', levelId);
                        this.selectLevel(levelId);
                    } else {
                        console.log('❌ Level is locked or invalid:', levelId);
                    }
                } else {
                    console.log('❌ Click was not on a level card');
                }
            });
            console.log('✓ level-card click event listener added');

            console.log('setupEventListeners() - Setting up game controls...');
            // Game controls
            document.addEventListener('keydown', (e) => {
                this.handleKeyPress(e);
            });
            console.log('✓ keydown event listener added');

            console.log('setupEventListeners() - Setting up detailed hint button...');
            // Detailed hint button
            const detailedHintBtn = document.getElementById('detailed-hint');
            if (detailedHintBtn) {
                detailedHintBtn.addEventListener('click', () => {
                    this.showDetailedHint();
                });
                console.log('✓ detailed-hint event listener added');
            } else {
                console.log('⚠ detailed-hint button not found');
            }

            console.log('setupEventListeners() - All event listeners set up successfully');
        } catch (error) {
            console.error('❌ Error in setupEventListeners():', error);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    }

    /**
     * Validate level data is accessible
     */
    validateLevelData() {
        try {
            // Test that we can access level data
            const testLevel = getLevelData('audio-1');
            if (!testLevel) {
                throw new Error('Cannot access level data');
            }

            // Test that required properties exist
            if (!testLevel.equipment || !testLevel.connections || !testLevel.validConnections) {
                throw new Error('Level data missing required properties');
            }

            console.log('✓ Level data validation passed');
        } catch (error) {
            console.error('❌ Level data validation failed:', error);
            throw error;
        }
    }

    /**
     * Start loading sequence with progress updates
     */
    startLoadingSequence() {
        const loadingProgress = document.querySelector('.loading-progress');
        let progress = 0;

        const updateProgress = (newProgress) => {
            progress = newProgress;
            if (loadingProgress) {
                loadingProgress.style.width = `${progress}%`;
            }
        };

        // Simulate loading steps
        const loadingSteps = [
            { progress: 20, message: 'Loading game modules...' },
            { progress: 40, message: 'Initializing game systems...' },
            { progress: 60, message: 'Loading level data...' },
            { progress: 80, message: 'Setting up game interface...' },
            { progress: 100, message: 'Ready to play!' }
        ];

        let currentStep = 0;

        const nextStep = () => {
            if (currentStep < loadingSteps.length) {
                const step = loadingSteps[currentStep];
                updateProgress(step.progress);

                // Update loading message if available
                const loadingMessage = document.querySelector('.loading-content p');
                if (loadingMessage) {
                    loadingMessage.textContent = step.message;
                }

                currentStep++;

                if (currentStep < loadingSteps.length) {
                    setTimeout(nextStep, 400);
                } else {
                    // Loading complete, show main menu
                    setTimeout(() => {
                        console.log('GameEngine.init() - Step 6: Showing main menu...');
                        this.showMainMenu();
                        console.log('✓ Main menu shown');

                        // Debug: Check if button is available after showing main menu
                        setTimeout(() => {
                            const debugBtn = document.getElementById('start-game-btn');
                            console.log('🔍 Debug: Button after showMainMenu:', debugBtn);
                            if (debugBtn) {
                                console.log('🔍 Debug: Button properties:', {
                                    disabled: debugBtn.disabled,
                                    style: debugBtn.style.display,
                                    className: debugBtn.className,
                                    parentElement: debugBtn.parentElement?.id
                                });
                            }
                        }, 100);
                    }, 500);
                }
            }
        };

        nextStep();
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        this.switchScreen('loading-screen');
        this.currentScreen = 'loading-screen';
    }

    /**
     * Show main menu
     */
    showMainMenu() {
        this.switchScreen('main-menu');
        this.currentScreen = 'main-menu';
        this.updatePlayerStats();
    }

    /**
     * Show level select screen
     */
    showLevelSelect() {
        try {
            console.log('Showing level select screen...');
            this.switchScreen('level-select');
            this.currentScreen = 'level-select';

            // Add a small delay to ensure the screen is visible before updating
            setTimeout(() => {
                this.updateLevelStatus();
            }, 100);
        } catch (error) {
            console.error('Error showing level select:', error);
        }
    }

    /**
     * Switch between screens
     */
    switchScreen(screenId) {
        try {
            console.log(`switchScreen() - Switching to: ${screenId}`);

            // Hide all screens by removing active class
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });

            // Show target screen by adding active class
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                console.log(`✓ Screen ${screenId} activated`);
            } else {
                console.error(`❌ Screen ${screenId} not found`);
            }
        } catch (error) {
            console.error('❌ Error in switchScreen():', error);
            throw error;
        }
    }

    /**
     * Update player statistics display
     */
    updatePlayerStats() {
        const scoreEl = document.getElementById('player-score');
        const livesEl = document.getElementById('player-lives');
        const timeEl = document.getElementById('player-time');

        if (scoreEl) scoreEl.textContent = this.gameState.score;
        if (livesEl) livesEl.textContent = this.gameState.lives;
        if (timeEl) timeEl.textContent = this.formatTime(this.gameState.time);
    }

    /**
     * Update level status display
     */
    updateLevelStatus() {
        try {
            console.log('Updating level status...');
            console.log('🔍 LEVEL_ORDER:', LEVEL_ORDER);
            console.log('🔍 Game state:', this.gameState);

            // Update existing level cards instead of replacing content
            LEVEL_ORDER.forEach(levelId => {
                const levelCard = document.querySelector(`[data-level="${levelId}"]`);
                if (!levelCard) {
                    console.log(`Level card not found for: ${levelId}`);
                    return;
                }
                
                console.log(`🔍 Found level card for: ${levelId}`);
                console.log(`🔍 Level card element:`, levelCard);

                const isUnlocked = this.gameState.unlockedLevels.includes(levelId);
                const isCompleted = this.gameState.completedLevels.includes(levelId);

                // Update level status
                const levelStatus = levelCard.querySelector('.level-status');
                if (levelStatus) {
                    levelStatus.className = 'level-status';
                    if (isCompleted) {
                        levelStatus.classList.add('completed');
                        levelStatus.innerHTML = '<i class="fas fa-check"></i>';
                    } else if (!isUnlocked) {
                        levelStatus.classList.add('locked');
                        levelStatus.innerHTML = '<i class="fas fa-lock"></i>';
                    } else {
                        levelStatus.classList.add('unlocked');
                        levelStatus.innerHTML = '<i class="fas fa-play"></i>';
                    }
                }

                // Add click event if unlocked
                if (isUnlocked) {
                    levelCard.style.cursor = 'pointer';
                    levelCard.addEventListener('click', () => this.selectLevel(levelId));
                } else {
                    levelCard.style.cursor = 'not-allowed';
                    levelCard.removeEventListener('click', () => this.selectLevel(levelId));
                }
            });

            console.log('Level status update completed');
        } catch (error) {
            console.error('Error updating level status:', error);
        }
    }

    /**
     * Select a level to play
     */
    selectLevel(levelId) {
        console.log('🎯 selectLevel() called with:', levelId);
        console.log('🔍 Unlocked levels:', this.gameState.unlockedLevels);
        console.log('🔍 Completed levels:', this.gameState.completedLevels);
        
        // Allow access to both unlocked and completed levels
        if (this.gameState.unlockedLevels.includes(levelId) || this.gameState.completedLevels.includes(levelId)) {
            console.log('✅ Level is accessible, loading:', levelId);
            this.loadLevel(levelId);
        } else {
            console.log('❌ Level is not accessible:', levelId);
        }
    }

    /**
     * Load a specific level
     */
    loadLevel(levelId) {
        this.currentLevel = levelId;
        this.successfulConnections = 0;
        this.totalRequiredConnections = 0;

        const levelData = getLevelData(levelId);
        if (!levelData) {
            console.error('Level data not found:', levelId);
            return;
        }

        this.switchScreen('game');
        this.currentScreen = 'game';

        // Reset game state for this level
        this.connections = [];
        this.equipment = [];
        this.connectionProgress = {
            power: { current: 0, required: 0 },
            xlr: { current: 0, required: 0 },
            wireless: { current: 0, required: 0 },
            ethernet: { current: 0, required: 0 },
            dmx: { current: 0, required: 0 },
            hdmi: { current: 0, required: 0 }
        };

        this.setupStage(levelData);
        this.setupToolbar(levelData);
        this.updateConnectionProgress();
        this.startGameTimer();
    }

    /**
     * Get level data (delegates to LevelData module)
     */
    getLevelData(levelId) {
        return getLevelData(levelId);
    }

    /**
     * Setup the game stage
     */
    setupStage(levelData) {
        const stageArea = document.getElementById('stage-area');
        if (!stageArea) return;

        stageArea.innerHTML = '';
        stageArea.style.width = levelData.stageSetup?.width || 800 + 'px';
        stageArea.style.height = levelData.stageSetup?.height || 600 + 'px';

        // Add stage zones if defined
        if (levelData.stageSetup?.zones) {
            levelData.stageSetup.zones.forEach(zone => {
                const zoneEl = document.createElement('div');
                zoneEl.className = 'stage-zone';
                zoneEl.style.left = zone.x + 'px';
                zoneEl.style.top = zone.y + 'px';
                zoneEl.style.width = zone.width + 'px';
                zoneEl.style.height = zone.height + 'px';
                zoneEl.textContent = zone.name;
                stageArea.appendChild(zoneEl);
            });
        }
    }

    /**
     * Setup the toolbar with equipment
     */
    setupToolbar(levelData) {
        this.setupEquipmentTools(levelData.equipment);
        this.setupConnectionTools(levelData.connections);
        this.setupSettingsTools(levelData.settings);
    }

    /**
     * Setup equipment tools in toolbar
     */
    setupEquipmentTools(equipment) {
        const equipmentContainer = document.getElementById('equipment-tools');
        if (!equipmentContainer) return;

        equipmentContainer.innerHTML = '';

        equipment.forEach(item => {
            for (let i = 0; i < item.quantity; i++) {
                const toolElement = document.createElement('div');
                toolElement.className = 'tool-item';
                toolElement.draggable = true;
                toolElement.dataset.type = item.type;
                toolElement.dataset.name = item.name;

                toolElement.innerHTML = `
                    <i class="${item.icon}"></i>
                    <span>${item.name}</span>
                `;

                toolElement.addEventListener('dragstart', (e) => this.handleDragStart(e));
                equipmentContainer.appendChild(toolElement);
            }
        });
    }

    /**
     * Setup connection tools in toolbar
     */
    setupConnectionTools(connections) {
        const connectionContainer = document.getElementById('connection-tools');
        if (!connectionContainer) return;

        connectionContainer.innerHTML = '';

        connections.forEach(connection => {
            const toolElement = document.createElement('div');
            toolElement.className = 'tool-item';
            toolElement.dataset.type = connection.type;
            toolElement.style.color = connection.color;

            toolElement.innerHTML = `
                <i class="${connection.icon}"></i>
                <span>${connection.name}</span>
            `;

            connectionContainer.appendChild(toolElement);
        });
    }

    /**
     * Setup settings tools in toolbar
     */
    setupSettingsTools(settings) {
        const settingsContainer = document.getElementById('settings-tools');
        if (!settingsContainer) return;

        settingsContainer.innerHTML = '';

        settings.forEach(setting => {
            const toolElement = document.createElement('div');
            toolElement.className = 'tool-item';
            toolElement.dataset.type = setting.type;

            toolElement.innerHTML = `
                <i class="${setting.icon}"></i>
                <span>${setting.name}</span>
            `;

            settingsContainer.appendChild(toolElement);
        });
    }

    /**
     * Handle drag start event
     */
    handleDragStart(e) {
        this.draggedElement = e.target;
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
    }

    /**
     * Handle drag over event
     */
    handleDragOver(e) {
        e.preventDefault();
    }

    /**
     * Handle drop event
     */
    handleDrop(e) {
        e.preventDefault();
        const stageArea = document.getElementById('stage-area');
        if (!stageArea || !this.draggedElement) return;

        const rect = stageArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.placeEquipment(this.draggedElement, x, y);
        this.draggedElement = null;
    }

    /**
     * Place equipment on the stage
     */
    placeEquipment(toolElement, x, y) {
        const stageArea = document.getElementById('stage-area');
        if (!stageArea) return;

        const equipmentType = toolElement.dataset.type;
        const equipmentName = toolElement.dataset.name;

        const equipmentElement = document.createElement('div');
        equipmentElement.className = 'equipment';
        equipmentElement.dataset.type = equipmentType;
        equipmentElement.dataset.name = equipmentName;
        equipmentElement.style.left = x + 'px';
        equipmentElement.style.top = y + 'px';

        // Get equipment data
        const levelData = getLevelData(this.currentLevel);
        const equipmentData = levelData.equipment.find(eq => eq.name === equipmentName);

        if (equipmentData) {
            equipmentElement.innerHTML = `
                <div class="equipment-icon">
                    <i class="${equipmentData.icon}"></i>
                </div>
                <div class="equipment-label">${equipmentName}</div>
                <div class="equipment-help">?</div>
                ${this.createConnectorsHTML(equipmentData.connectors)}
            `;

            // Add equipment info click handler
            const helpBtn = equipmentElement.querySelector('.equipment-help');
            if (helpBtn) {
                helpBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEquipmentInfo(equipmentType, equipmentName);
                });
            }

            // Make equipment draggable
            this.makeEquipmentDraggable(equipmentElement);

            // Add to equipment array
            this.equipment.push({
                element: equipmentElement,
                type: equipmentType,
                name: equipmentName,
                data: equipmentData
            });

            stageArea.appendChild(equipmentElement);
        }
    }

    /**
     * Create connectors HTML
     */
    createConnectorsHTML(connectors) {
        if (!connectors || connectors.length === 0) return '';

        return connectors.map(connector => {
            const color = getConnectorColor(connector.type);
            return `
                <div class="connector ${connector.type}" 
                     data-type="${connector.type}" 
                     data-position="${connector.position}"
                     style="background-color: ${color};">
                    <span class="connector-label">${connector.label}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Handle connector click
     */
    handleConnectorClick(connector, equipment) {
        if (this.connectionMode && this.selectedConnector) {
            // Create connection
            this.createConnection(this.selectedConnector, { connector, equipment });
            this.connectionMode = false;
            this.selectedConnector = null;
            this.resetConnectorStates();
        } else {
            // Start connection mode
            this.connectionMode = true;
            this.selectedConnector = { connector, equipment };
            connector.classList.add('selected');
        }
    }

    /**
     * Reset connector states
     */
    resetConnectorStates() {
        document.querySelectorAll('.connector').forEach(connector => {
            connector.classList.remove('selected');
        });
    }

    /**
     * Create a connection between two connectors
     */
    createConnection(from, to) {
        const levelData = getLevelData(this.currentLevel);
        this.showCableSelectionDialog(from, to, levelData);
    }

    /**
     * Show cable selection dialog
     */
    showCableSelectionDialog(from, to, levelData) {
        const dialog = document.createElement('div');
        dialog.className = 'cable-selection-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Select Cable Type</h3>
                <div class="cable-options">
                    ${levelData.connections.map(connection => `
                        <button class="cable-option" data-type="${connection.type}">
                            <i class="${connection.icon}" style="color: ${connection.color}"></i>
                            ${connection.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Add event listeners
        dialog.querySelectorAll('.cable-option').forEach(option => {
            option.addEventListener('click', () => {
                const cableType = option.dataset.type;
                this.validateAndCreateConnection(from, to, cableType, levelData);
                document.body.removeChild(dialog);
            });
        });

        // Close dialog on outside click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        });
    }

    /**
     * Validate and create connection
     */
    validateAndCreateConnection(from, to, cableType, levelData) {
        const validConnection = levelData.validConnections.find(conn =>
            conn.from === from.connector.dataset.type &&
            conn.to === to.connector.dataset.type &&
            conn.cable === cableType
        );

        if (validConnection) {
            this.createValidConnection(from, to, validConnection);
            this.audioSystem.playCorrectSound();
        } else {
            this.createInvalidConnection(from, to, cableType);
            this.audioSystem.playWrongSound();
        }
    }

    /**
     * Create valid connection
     */
    createValidConnection(from, to, validConnection) {
        const connectionData = {
            id: generateId(),
            from: from,
            to: to,
            cableType: validConnection.cable,
            animation: validConnection.animation,
            line: null
        };

        this.connections.push(connectionData);

        // Create the connection line immediately
        const fromCoords = this.getConnectorCoordinates(from.connector);
        const toCoords = this.getConnectorCoordinates(to.connector);

        if (fromCoords && toCoords) {
            connectionData.line = this.drawConnectionLineWithCoordinates(fromCoords, toCoords, getConnectorColor(from.connector.dataset.type));
            connectionData.fromCoords = fromCoords;
            connectionData.toCoords = toCoords;
        }

        // Apply animation
        this.applyConnectionAnimation(from.equipment, validConnection.animation);
        this.applyConnectionAnimation(to.equipment, validConnection.animation);

        // Update progress
        this.updateConnectionProgress();
        this.checkLevelCompletion();
    }

    /**
     * Create invalid connection
     */
    createInvalidConnection(from, to, cableType) {
        const fromCoords = this.getConnectorCoordinates(from.connector);
        const toCoords = this.getConnectorCoordinates(to.connector);

        if (fromCoords && toCoords) {
            this.drawConnectionLineWithCoordinates(fromCoords, toCoords, '#ff0000');
        }

        this.showMessage('Invalid connection! Check your cable type and connector compatibility.', 'error');
    }

    /**
     * Apply connection animation
     */
    applyConnectionAnimation(equipment, animationType) {
        const element = equipment.element;
        if (!element) return;

        element.classList.add(`animation-${animationType}`);
        setTimeout(() => {
            element.classList.remove(`animation-${animationType}`);
        }, 1000);
    }

    /**
     * Draw connection line with coordinates
     */
    drawConnectionLineWithCoordinates(fromCoords, toCoords, color) {
        const stageArea = document.getElementById('stage-area');
        if (!stageArea) return null;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '1000';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${fromCoords.x} ${fromCoords.y} L ${toCoords.x} ${toCoords.y}`;
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '3');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#arrowhead)');

        svg.appendChild(path);
        stageArea.appendChild(svg);

        return svg;
    }

    /**
     * Get connector coordinates
     */
    getConnectorCoordinates(connector) {
        const stageArea = document.getElementById('stage-area');
        if (!stageArea || !connector) return null;

        const connectorRect = connector.getBoundingClientRect();
        const stageRect = stageArea.getBoundingClientRect();

        return {
            x: connectorRect.left - stageRect.left + connectorRect.width / 2,
            y: connectorRect.top - stageRect.top + connectorRect.height / 2
        };
    }

    /**
     * Update connection progress
     */
    updateConnectionProgress() {
        const levelData = getLevelData(this.currentLevel);
        if (!levelData) return;

        const required = calculateRequiredConnections(levelData);

        this.connectionProgress.power.required = required.power;
        this.connectionProgress.xlr.required = required.xlr;
        this.connectionProgress.wireless.required = required.wireless;
        this.connectionProgress.ethernet.required = required.ethernet;
        this.connectionProgress.dmx.required = required.dmx;
        this.connectionProgress.hdmi.required = required.hdmi;

        // Count current connections
        this.connectionProgress.power.current = this.connections.filter(c => c.cableType === 'power-cable').length;
        this.connectionProgress.xlr.current = this.connections.filter(c => c.cableType === 'xlr-cable').length;
        this.connectionProgress.wireless.current = this.connections.filter(c => c.cableType === 'wireless-cable').length;
        this.connectionProgress.ethernet.current = this.connections.filter(c => c.cableType === 'ethernet-cable').length;
        this.connectionProgress.dmx.current = this.connections.filter(c => c.cableType === 'dmx-cable').length;
        this.connectionProgress.hdmi.current = this.connections.filter(c => c.cableType === 'hdmi-cable').length;

        this.updateProgressUI();
    }

    /**
     * Update progress UI
     */
    updateProgressUI() {
        const progressContainer = document.getElementById('connection-progress');
        if (!progressContainer) return;

        progressContainer.innerHTML = '';

        Object.entries(this.connectionProgress).forEach(([type, progress]) => {
            if (progress.required > 0) {
                const progressEl = document.createElement('div');
                progressEl.className = 'progress-item';
                progressEl.innerHTML = `
                    <span class="progress-label">${type.toUpperCase()}</span>
                    <span class="progress-count ${progress.current >= progress.required ? 'complete' : ''}">
                        ${progress.current}/${progress.required}
                    </span>
                `;
                progressContainer.appendChild(progressEl);
            }
        });
    }

    /**
     * Check if level is complete
     */
    checkLevelCompletion() {
        const allComplete = Object.values(this.connectionProgress).every(progress =>
            progress.current >= progress.required
        );

        if (allComplete) {
            this.completeLevel();
        }
    }

    /**
     * Complete the current level
     */
    completeLevel() {
        if (!this.currentLevel) return;

        this.gameState.completedLevels.push(this.currentLevel);
        this.gameState.score += 100;

        if (!this.gameState.unlockedLevels.includes(this.currentLevel)) {
            this.gameState.unlockedLevels.push(this.currentLevel);
        }

        this.unlockNextLevel();
        this.saveGameState();
        this.showWinnerCelebration();
    }

    /**
     * Unlock next level
     */
    unlockNextLevel() {
        const currentIndex = LEVEL_ORDER.indexOf(this.currentLevel);
        if (currentIndex >= 0 && currentIndex < LEVEL_ORDER.length - 1) {
            const nextLevel = LEVEL_ORDER[currentIndex + 1];
            if (!this.gameState.unlockedLevels.includes(nextLevel)) {
                this.gameState.unlockedLevels.push(nextLevel);
            }
        }
    }

    /**
     * Show winner celebration
     */
    showWinnerCelebration() {
        this.audioSystem.playVictorySound();

        const celebration = document.createElement('div');
        celebration.className = 'winner-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <h2>🎉 Level Complete! 🎉</h2>
                <p>Congratulations! You've successfully completed this level.</p>
                <div class="celebration-stats">
                    <p>Score: ${this.gameState.score}</p>
                    <p>Connections: ${this.successfulConnections}/${this.totalRequiredConnections}</p>
                </div>
                <div class="celebration-buttons">
                    <button id="next-level-btn">Next Level</button>
                    <button id="restart-level-btn">Restart Level</button>
                    <button id="exit-to-menu-btn">Exit to Menu</button>
                </div>
            </div>
        `;

        document.body.appendChild(celebration);

        // Add event listeners
        celebration.querySelector('#next-level-btn').addEventListener('click', () => {
            this.nextLevel();
            document.body.removeChild(celebration);
        });

        celebration.querySelector('#restart-level-btn').addEventListener('click', () => {
            this.restartLevel();
            document.body.removeChild(celebration);
        });

        celebration.querySelector('#exit-to-menu-btn').addEventListener('click', () => {
            this.exitToMenu();
            document.body.removeChild(celebration);
        });
    }

    /**
     * Show equipment information
     */
    showEquipmentInfo(equipmentType, equipmentName) {
        const info = getEquipmentInfo(equipmentType, equipmentName);

        const popup = document.createElement('div');
        popup.className = 'equipment-info-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h3>${equipmentName}</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="popup-body">
                    <p><strong>Description:</strong> ${info.description}</p>
                    <p><strong>Purpose:</strong> ${info.purpose}</p>
                    <p><strong>Usage:</strong> ${info.usage}</p>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Close popup
        popup.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(popup);
        });

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                document.body.removeChild(popup);
            }
        });
    }

    /**
     * Show message
     */
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;

        document.body.appendChild(messageEl);

        setTimeout(() => {
            if (messageEl.parentNode) {
                document.body.removeChild(messageEl);
            }
        }, 3000);
    }

    /**
     * Handle key press events
     */
    handleKeyPress(e) {
        switch (e.key.toLowerCase()) {
            case 'escape':
                if (this.currentScreen === 'game') {
                    this.pauseGame();
                }
                break;
            case 'h':
                this.showHint();
                break;
            case 'i':
                this.showDetailedHint();
                break;
        }
    }

    /**
     * Show hint
     */
    showHint() {
        const levelData = getLevelData(this.currentLevel);
        if (!levelData) return;

        const hint = this.generateHint(levelData);
        this.showMessage(hint, 'hint');
    }

    /**
     * Show detailed hint
     */
    showDetailedHint() {
        const levelData = getLevelData(this.currentLevel);
        if (!levelData) return;

        const hint = this.generateDetailedHint(levelData);
        this.showMessage(hint, 'detailed-hint');

        // Deduct points for using detailed hint
        this.gameState.score = Math.max(0, this.gameState.score - 50);
        this.updatePlayerStats();
    }

    /**
     * Generate hint
     */
    generateHint(levelData) {
        const required = calculateRequiredConnections(levelData);
        const missing = [];

        Object.entries(required).forEach(([type, count]) => {
            const current = this.connectionProgress[type].current;
            if (current < count) {
                missing.push(`${count - current} ${type.toUpperCase()} connections`);
            }
        });

        if (missing.length === 0) {
            return "All connections are complete! Great job!";
        }

        return `You still need: ${missing.join(', ')}`;
    }

    /**
     * Generate detailed hint
     */
    generateDetailedHint(levelData) {
        // This would contain more specific guidance
        return "Check the equipment connectors and make sure you're using the correct cable types for each connection.";
    }

    /**
     * Make equipment draggable
     */
    makeEquipmentDraggable(equipment) {
        let isDragging = false;
        let startX, startY;

        equipment.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - equipment.offsetLeft;
            startY = e.clientY - equipment.offsetTop;
            equipment.style.zIndex = '1000';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const newX = e.clientX - startX;
            const newY = e.clientY - startY;

            equipment.style.left = newX + 'px';
            equipment.style.top = newY + 'px';

            // Update connection lines
            this.updateConnectionLines();
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                equipment.style.zIndex = 'auto';
                this.updateConnectionLines();
            }
        });
    }

    /**
     * Update connection lines
     */
    updateConnectionLines() {
        this.connections.forEach(connection => {
            if (connection.line && connection.from && connection.to) {
                const fromCoords = this.getConnectorCoordinates(connection.from.connector);
                const toCoords = this.getConnectorCoordinates(connection.to.connector);

                if (fromCoords && toCoords) {
                    this.updateConnectionLinePosition(connection.line, fromCoords, toCoords);
                }
            }
        });
    }

    /**
     * Update connection line position
     */
    updateConnectionLinePosition(lineElement, fromCoords, toCoords) {
        const path = lineElement.querySelector('path');
        if (path) {
            const d = `M ${fromCoords.x} ${fromCoords.y} L ${toCoords.x} ${toCoords.y}`;
            path.setAttribute('d', d);
        }
    }

    /**
     * Start game timer
     */
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.gameState.time++;
            this.updatePlayerStats();
        }, 1000);
    }

    /**
     * Stop game timer
     */
    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    /**
     * Pause game
     */
    pauseGame() {
        this.stopGameTimer();
        this.showMessage('Game paused. Press any key to resume.', 'info');
    }

    /**
     * Resume game
     */
    resumeGame() {
        this.startGameTimer();
    }

    /**
     * Restart level
     */
    restartLevel() {
        if (this.currentLevel) {
            this.loadLevel(this.currentLevel);
        }
    }

    /**
     * Next level
     */
    nextLevel() {
        const currentIndex = LEVEL_ORDER.indexOf(this.currentLevel);
        if (currentIndex >= 0 && currentIndex < LEVEL_ORDER.length - 1) {
            const nextLevel = LEVEL_ORDER[currentIndex + 1];
            if (this.gameState.unlockedLevels.includes(nextLevel)) {
                this.loadLevel(nextLevel);
            }
        }
    }

    /**
     * Exit to menu
     */
    exitToMenu() {
        this.stopGameTimer();
        this.showMainMenu();
    }

    /**
     * Show tutorial
     */
    showTutorial() {
        this.showMessage('Tutorial coming soon!', 'info');
    }

    /**
     * Show settings
     */
    showSettings() {
        this.showMessage('Settings coming soon!', 'info');
    }

    /**
     * Format time
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Load game state from localStorage
     */
    loadGameState() {
        try {
            console.log('loadGameState() - Loading from localStorage...');
            const saved = loadFromStorage('avMasterGameState');
            console.log('loadGameState() - Retrieved data:', saved);

            if (saved && typeof saved === 'object') {
                // Only merge if saved data is a valid object
                this.gameState = { ...this.gameState, ...saved };
                console.log('loadGameState() - Game state updated:', this.gameState);
            } else {
                console.log('loadGameState() - No saved data found, using default state');
                // Ensure default state is preserved
                this.gameState = {
                    score: 0,
                    lives: 3,
                    time: 0,
                    completedLevels: [],
                    unlockedLevels: ['audio-1']
                };
            }
        } catch (error) {
            console.error('❌ Error in loadGameState():', error);
            console.error('Stack trace:', error.stack);
            // Ensure default state is preserved even on error
            this.gameState = {
                score: 0,
                lives: 3,
                time: 0,
                completedLevels: [],
                unlockedLevels: ['audio-1']
            };
        }
    }

    /**
     * Save game state to localStorage
     */
    saveGameState() {
        saveToStorage('avMasterGameState', this.gameState);
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.audioSystem.cleanup();
        this.stopGameTimer();
    }
}
