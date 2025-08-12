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
            console.log('GameEngine.init() - Step 1: Clearing all screens...');
            this.clearAllScreens();
            console.log('✓ All screens cleared');

            console.log('GameEngine.init() - Step 2: Loading game state...');
            this.loadGameState();
            console.log('✓ Game state loaded');

            console.log('GameEngine.init() - Step 3: Setting up event listeners...');
            this.setupEventListeners();
            console.log('✓ Event listeners set up');

            console.log('GameEngine.init() - Step 4: Showing loading screen...');
            this.showLoadingScreen();
            console.log('✓ Loading screen shown');

            // Simulate loading time with progress updates
            console.log('GameEngine.init() - Step 5: Starting loading sequence...');
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
                console.log('🌐 Document click detected on:', e.target.tagName, e.target.className, e.target.id);
                console.log('🔍 Click target element:', e.target);
                console.log('🔍 Click coordinates:', e.clientX, e.clientY);

                // Check if click is on a level card or its children
                const levelCard = e.target.closest('.level-card');
                if (levelCard) {
                    const levelId = levelCard.dataset.level;
                    console.log('🎯 Level card clicked:', levelId);
                    console.log('🔍 Level card element:', levelCard);
                    console.log('🔍 Unlocked levels:', this.gameState.unlockedLevels);
                    if (levelId && this.gameState.unlockedLevels.includes(levelId)) {
                        console.log('✅ Level is unlocked, selecting:', levelId);
                        this.selectLevel(levelId);
                    } else {
                        console.log('❌ Level is locked or invalid:', levelId);
                    }
                } else {
                    console.log('❌ Click was not on a level card');
                    console.log('🔍 Closest level card:', e.target.closest('.level-card'));
                }
            });
            console.log('✓ level-card click event listener added');

            console.log('setupEventListeners() - Setting up game controls...');
            // Game controls
            document.addEventListener('keydown', (e) => {
                this.handleKeyPress(e);
            });
            console.log('✓ keydown event listener added');

            console.log('setupEventListeners() - Setting up hint buttons...');
            // Hint button
            const hintBtn = document.getElementById('hint');
            if (hintBtn) {
                hintBtn.addEventListener('click', () => {
                    this.showHint();
                });
                console.log('✓ hint event listener added');
            } else {
                console.log('⚠ hint button not found');
            }

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

            // Pause button
            const pauseBtn = document.getElementById('pause-game');
            if (pauseBtn) {
                pauseBtn.addEventListener('click', () => {
                    this.pauseGame();
                });
                console.log('✓ pause-game event listener added');
            } else {
                console.log('⚠ pause-game button not found');
            }

            // Test setup button
            const testSetupBtn = document.getElementById('test-setup');
            if (testSetupBtn) {
                testSetupBtn.addEventListener('click', () => {
                    this.testSetup();
                });
                console.log('✓ test-setup event listener added');
            } else {
                console.log('⚠ test-setup button not found');
            }

            // Reset level button
            const resetLevelBtn = document.getElementById('reset-level');
            if (resetLevelBtn) {
                resetLevelBtn.addEventListener('click', () => {
                    this.resetLevel();
                });
                console.log('✓ reset-level event listener added');
            } else {
                console.log('⚠ reset-level button not found');
            }

            // Level complete screen buttons
            const nextLevelBtn = document.getElementById('next-level');
            if (nextLevelBtn) {
                nextLevelBtn.addEventListener('click', () => {
                    this.goToNextLevel();
                });
                console.log('✓ next-level event listener added');
            } else {
                console.log('⚠ next-level button not found');
            }

            const replayLevelBtn = document.getElementById('replay-level');
            if (replayLevelBtn) {
                replayLevelBtn.addEventListener('click', () => {
                    this.replayLevel();
                });
                console.log('✓ replay-level event listener added');
            } else {
                console.log('⚠ replay-level button not found');
            }

            const levelSelectBtn = document.getElementById('level-select-btn');
            if (levelSelectBtn) {
                levelSelectBtn.addEventListener('click', () => {
                    this.showLevelSelect();
                });
                console.log('✓ level-select-btn event listener added');
            } else {
                console.log('⚠ level-select-btn button not found');
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

            // Verify screen switching worked
            this.verifyScreenState('level-select');

            // Add a small delay to ensure the screen is visible before updating
            setTimeout(() => {
                this.updateLevelStatus();
                // Verify level cards are accessible
                this.verifyLevelCardsAccessible();
            }, 100);
        } catch (error) {
            console.error('Error showing level select:', error);
        }
    }

    /**
     * Clear all screens to ensure clean state
     */
    clearAllScreens() {
        try {
            console.log('clearAllScreens() - Clearing all screen states...');

            // Remove all active classes and set display to none
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
                screen.style.display = 'none';
                screen.style.zIndex = '1';
                console.log(`🔍 Cleared screen: ${screen.id}`);
            });

            // Verify no screens are active
            const activeScreens = document.querySelectorAll('.screen.active');
            if (activeScreens.length > 0) {
                console.warn(`⚠️ Warning: ${activeScreens.length} screens still active after clear:`,
                    Array.from(activeScreens).map(s => s.id));
            } else {
                console.log('✅ All screens cleared successfully');
            }
        } catch (error) {
            console.error('❌ Error in clearAllScreens():', error);
        }
    }

    /**
     * Verify screen state is correct
     */
    verifyScreenState(expectedScreenId) {
        try {
            const activeScreens = document.querySelectorAll('.screen.active');
            console.log(`🔍 Screen state verification:`);
            console.log(`  Expected active screen: ${expectedScreenId}`);
            console.log(`  Currently active screens:`, Array.from(activeScreens).map(s => s.id));

            if (activeScreens.length === 0) {
                console.error(`❌ No screens are active!`);
                return false;
            } else if (activeScreens.length > 1) {
                console.error(`❌ Multiple screens active:`, Array.from(activeScreens).map(s => s.id));
                return false;
            } else if (activeScreens[0].id !== expectedScreenId) {
                console.error(`❌ Wrong screen active. Expected: ${expectedScreenId}, Got: ${activeScreens[0].id}`);
                return false;
            } else {
                console.log(`✅ Screen state correct - ${expectedScreenId} is active`);
                return true;
            }
        } catch (error) {
            console.error('❌ Error in verifyScreenState():', error);
            return false;
        }
    }

    /**
     * Verify level cards are accessible
     */
    verifyLevelCardsAccessible() {
        try {
            const levelCards = document.querySelectorAll('.level-card');
            console.log(`🔍 Level cards accessibility check:`);
            console.log(`  Total level cards found: ${levelCards.length}`);

            levelCards.forEach((card, index) => {
                const levelId = card.dataset.level;
                const isUnlocked = this.gameState.unlockedLevels.includes(levelId);
                const computedStyle = window.getComputedStyle(card);

                console.log(`  Card ${index + 1} (${levelId}):`);
                console.log(`    - Unlocked: ${isUnlocked}`);
                console.log(`    - Display: ${computedStyle.display}`);
                console.log(`    - Visibility: ${computedStyle.visibility}`);
                console.log(`    - Z-index: ${computedStyle.zIndex}`);
                console.log(`    - Cursor: ${computedStyle.cursor}`);
                console.log(`    - Pointer-events: ${computedStyle.pointerEvents}`);
            });
        } catch (error) {
            console.error('❌ Error in verifyLevelCardsAccessible():', error);
        }
    }

    /**
     * Switch between screens
     */
    switchScreen(screenId) {
        try {
            console.log(`switchScreen() - Switching to: ${screenId}`);

            // First, check if there are multiple active screens (this shouldn't happen)
            const currentlyActive = document.querySelectorAll('.screen.active');
            if (currentlyActive.length > 1) {
                console.warn(`⚠️ Multiple active screens detected:`, Array.from(currentlyActive).map(s => s.id));
            }

            // Hide all screens by removing active class and setting display to none
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
                screen.style.display = 'none';
                screen.style.zIndex = '1';
                console.log(`🔍 Hidden screen: ${screen.id}`);
            });

            // Show target screen by adding active class
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                targetScreen.style.display = 'flex';
                targetScreen.style.zIndex = '10';
                console.log(`✓ Screen ${screenId} activated`);

                // Debug: Check which screens are currently active
                const activeScreens = document.querySelectorAll('.screen.active');
                console.log(`🔍 Active screens after switch:`, Array.from(activeScreens).map(s => s.id));

                // Verify only one screen is active
                if (activeScreens.length !== 1) {
                    console.error(`❌ Screen switching failed - ${activeScreens.length} screens are active!`);
                    console.error(`Active screens:`, Array.from(activeScreens).map(s => s.id));
                } else {
                    console.log(`✅ Screen switching successful - only ${screenId} is active`);
                }
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
                    // Remove any existing click listeners to prevent duplicates
                    levelCard.removeEventListener('click', () => this.selectLevel(levelId));
                    levelCard.addEventListener('click', () => {
                        console.log('🎯 Level card clicked directly:', levelId);
                        this.selectLevel(levelId);
                    });
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

        // Update level name display
        this.updateLevelNameDisplay(levelData);

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
     * Update level name display in level title area
     */
    updateLevelNameDisplay(levelData) {
        const levelTitleElement = document.getElementById('current-level-title');
        if (levelTitleElement && levelData.title) {
            levelTitleElement.textContent = levelData.title;
        }
    }

    /**
     * Pause game and return to level selector
     */
    pauseGame() {
        console.log('⏸️ Pausing game and returning to level selector');

        // Stop the game timer
        this.stopGameTimer();

        // Clear any active connection mode
        this.connectionMode = false;
        this.selectedConnector = null;
        this.resetConnectorStates();

        // Clear any open popups
        const popups = document.querySelectorAll('.equipment-info-popup, .hint-popup, .equipment-settings-popup');
        popups.forEach(popup => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        });

        // Switch to level selection screen
        this.showLevelSelect();
    }

    /**
     * Test the current setup
     */
    testSetup() {
        console.log('🧪 Testing setup for level:', this.currentLevel);

        const levelData = getLevelData(this.currentLevel);
        if (!levelData) {
            console.error('❌ No level data found for:', this.currentLevel);
            return;
        }

        // Validate all connections
        const validationResult = this.validateLevelCompletion(levelData);

        if (validationResult.isComplete) {
            console.log('✅ Setup test passed! All connections are valid.');
            this.showMessage('✅ Setup test passed! All connections are valid.', 'success');

            // Show celebration if level is complete
            if (!this.gameState.completedLevels.includes(this.currentLevel)) {
                this.showLevelComplete();
            }
        } else {
            console.log('❌ Setup test failed. Missing connections:', validationResult.missingConnections);
            this.showMessage(`❌ Setup test failed. Missing: ${validationResult.missingConnections.join(', ')}`, 'error');

            // Highlight missing connections
            this.highlightMissingConnections(validationResult.missingConnections);
        }
    }

    /**
     * Reset the current level
     */
    resetLevel() {
        console.log('🔄 Resetting level:', this.currentLevel);

        // Confirm with user
        if (!confirm('Are you sure you want to reset this level? All progress will be lost.')) {
            return;
        }

        // Stop the game timer
        this.stopGameTimer();

        // Clear all connections
        this.connections = [];
        this.successfulConnections = 0;
        this.totalRequiredConnections = 0;

        // Clear connection lines
        this.clearAllConnectionLines();

        // Reset connection progress
        this.connectionProgress = {
            power: { current: 0, required: 0 },
            xlr: { current: 0, required: 0 },
            wireless: { current: 0, required: 0 },
            ethernet: { current: 0, required: 0 },
            dmx: { current: 0, required: 0 },
            hdmi: { current: 0, required: 0 }
        };

        // Clear any active connection mode
        this.connectionMode = false;
        this.selectedConnector = null;
        this.resetConnectorStates();

        // Clear any open popups
        const popups = document.querySelectorAll('.equipment-info-popup, .hint-popup, .equipment-settings-popup');
        popups.forEach(popup => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        });

        // Reload the level
        this.loadLevel(this.currentLevel);

        console.log('🔄 Level reset complete');
        this.showMessage('Level reset complete. Start fresh!', 'info');
    }

    /**
     * Validate level completion
     */
    validateLevelCompletion(levelData) {
        const required = calculateRequiredConnections(levelData);
        const missingConnections = [];
        let isComplete = true;

        // Check each connection type
        Object.entries(required).forEach(([type, count]) => {
            const current = this.connectionProgress[type].current;
            if (current < count) {
                isComplete = false;
                const missing = count - current;
                missingConnections.push(`${missing} ${type} connection${missing > 1 ? 's' : ''}`);
            }
        });

        return {
            isComplete,
            missingConnections
        };
    }

    /**
     * Highlight missing connections
     */
    highlightMissingConnections(missingConnections) {
        // Remove any existing highlights
        document.querySelectorAll('.equipment').forEach(equipment => {
            equipment.style.border = '';
        });

        // Add red border to equipment that need connections
        this.equipment.forEach(equipment => {
            const equipmentType = equipment.type;
            const equipmentName = equipment.name;

            // Check if this equipment needs connections based on missing types
            const needsConnection = missingConnections.some(missing => {
                if (missing.includes('power') && equipmentType === 'power-distro') return true;
                if (missing.includes('xlr') && (equipmentType === 'microphone' || equipmentType === 'mixing-console' || equipmentType === 'speaker')) return true;
                if (missing.includes('wireless') && (equipmentType === 'microphone' || equipmentType === 'speaker')) return true;
                if (missing.includes('ethernet') && equipmentType === 'mixing-console') return true;
                if (missing.includes('dmx') && (equipmentType === 'light-fixture' || equipmentType === 'dmx-controller')) return true;
                if (missing.includes('hdmi') && equipmentType === 'video-equipment') return true;
                return false;
            });

            if (needsConnection) {
                equipment.element.style.border = '3px solid #e74c3c';
                equipment.element.style.boxShadow = '0 0 10px rgba(231, 76, 60, 0.5)';
            }
        });

        // Remove highlights after 5 seconds
        setTimeout(() => {
            document.querySelectorAll('.equipment').forEach(equipment => {
                equipment.style.border = '';
                equipment.style.boxShadow = '';
            });
        }, 5000);
    }

    /**
     * Clear all connection lines
     */
    clearAllConnectionLines() {
        // Clear only SVG elements with connection-line class
        const stageArea = document.getElementById('stage-area');
        if (stageArea) {
            const svgLines = stageArea.querySelectorAll('svg.connection-line');
            svgLines.forEach(svg => {
                if (svg.parentNode) {
                    svg.parentNode.removeChild(svg);
                }
            });
        }
        
        // Clear any other elements with connection-line class
        const connectionLines = document.querySelectorAll('.connection-line:not(svg)');
        connectionLines.forEach(line => {
            if (line.parentNode) {
                line.parentNode.removeChild(line);
            }
        });
    }

    /**
     * Redraw all connection lines
     */
    redrawAllConnectionLines() {
        console.log('🔄 Redrawing all connection lines...');
        
        // Clear existing lines
        this.clearAllConnectionLines();
        
        // Redraw all valid connections
        this.connections.forEach(connection => {
            if (connection.from && connection.to) {
                const fromCoords = this.getConnectorCoordinates(connection.from.connector);
                const toCoords = this.getConnectorCoordinates(connection.to.connector);
                
                if (fromCoords && toCoords) {
                    connection.line = this.drawConnectionLineWithCoordinates(fromCoords, toCoords, getConnectorColor(connection.from.connector.dataset.type));
                    connection.fromCoords = fromCoords;
                    connection.toCoords = toCoords;
                }
            }
        });
        
        console.log(`✅ Redrew ${this.connections.length} connection lines`);
    }

    /**
     * Show level complete popup
     */
    showLevelComplete() {
        console.log('🎉 Showing level complete popup');

        // Stop the game timer
        this.stopGameTimer();

        // Calculate final stats
        const finalScore = this.gameState.score;
        const finalTime = this.gameState.time;
        const stars = Math.min(3, Math.floor(finalScore / 100));

        // Update the level complete screen with final stats
        const finalScoreEl = document.getElementById('final-score');
        const finalTimeEl = document.getElementById('final-time');
        const finalStarsEl = document.getElementById('final-stars');

        if (finalScoreEl) finalScoreEl.textContent = finalScore;
        if (finalTimeEl) {
            const minutes = Math.floor(finalTime / 60);
            const seconds = (finalTime % 60).toString().padStart(2, '0');
            finalTimeEl.textContent = `${minutes}:${seconds}`;
        }
        if (finalStarsEl) finalStarsEl.textContent = stars;

        // Mark level as completed
        if (!this.gameState.completedLevels.includes(this.currentLevel)) {
            this.gameState.completedLevels.push(this.currentLevel);
            this.saveToStorage();
        }

        // Unlock next level
        this.unlockNextLevel();

        // Switch to level complete screen
        this.switchScreen('level-complete');

        console.log('🎉 Level complete popup shown');
    }

    /**
     * Go to next level
     */
    goToNextLevel() {
        console.log('➡️ Going to next level');

        const levelOrder = [
            'audio-1', 'audio-2', 'audio-3',
            'lighting-1', 'lighting-2', 'lighting-3',
            'video-1', 'video-2', 'video-3',
            'set-1', 'set-2', 'set-3'
        ];

        const currentIndex = levelOrder.indexOf(this.currentLevel);
        if (currentIndex !== -1 && currentIndex < levelOrder.length - 1) {
            const nextLevel = levelOrder[currentIndex + 1];
            console.log('➡️ Loading next level:', nextLevel);
            this.loadLevel(nextLevel);
        } else {
            console.log('🎉 All levels completed!');
            this.showMessage('Congratulations! You have completed all levels!', 'success');
            this.showLevelSelect();
        }
    }

    /**
     * Replay current level
     */
    replayLevel() {
        console.log('🔄 Replaying level:', this.currentLevel);
        this.loadLevel(this.currentLevel);
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
        console.log('🔧 Setting up toolbar with level data:', levelData);
        this.setupEquipmentTools(levelData.equipment);
        // Don't show connections in toolbar - they should only appear when connecting
        // this.setupConnectionTools(levelData.connections);
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

            // Add click event listeners to connectors
            const connectors = equipmentElement.querySelectorAll('.connector');
            connectors.forEach(connector => {
                connector.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('🔌 Connector clicked:', connector.dataset.type, connector.dataset.position);
                    this.handleConnectorClick(connector, equipmentElement);
                });

                // Ensure connector is properly initialized
                connector.style.pointerEvents = 'auto';
                connector.classList.remove('disabled', 'inactive');
            });

            // Add equipment info click handler
            const helpBtn = equipmentElement.querySelector('.equipment-help');
            if (helpBtn) {
                helpBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEquipmentInfo(equipmentType, equipmentName);
                });
            }

            // Add double-click handler for equipment settings
            equipmentElement.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.showEquipmentSettings(equipmentType, equipmentName, equipmentElement);
            });

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

            // Remove the equipment from the toolbar after placement
            if (toolElement && toolElement.parentNode) {
                toolElement.parentNode.removeChild(toolElement);
            }

            // Ensure all connectors are properly set up
            this.setupConnectorEventListeners();
        }
    }

    /**
     * Create connectors HTML
     */
    createConnectorsHTML(connectors) {
        if (!connectors || connectors.length === 0) return '';

        // Group connectors by type to ensure unique connector types per equipment
        const uniqueConnectors = [];
        const seenTypes = new Set();

        connectors.forEach(connector => {
            if (!seenTypes.has(connector.type)) {
                seenTypes.add(connector.type);
                uniqueConnectors.push(connector);
            }
        });

        return uniqueConnectors.map(connector => {
            const color = getConnectorColor(connector.type);
            return `
                <div class="connector ${connector.position}" 
                     data-type="${connector.type}" 
                     data-position="${connector.position}">
                    <div class="connector-dot" style="background-color: ${color};"></div>
                    <span class="connector-label">${connector.label}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Handle connector click
     */
    handleConnectorClick(connector, equipment) {
        console.log(`🔌 Connector clicked: ${connector.dataset.type}, connectionMode: ${this.connectionMode}`);
        console.log(`🔌 Connector pointer-events: ${connector.style.pointerEvents}, computed: ${window.getComputedStyle(connector).pointerEvents}`);
        console.log(`🔌 Connector z-index: ${window.getComputedStyle(connector).zIndex}`);
        console.log(`🔌 Connector position: ${connector.offsetLeft}, ${connector.offsetTop}`);
        console.log(`🔌 Equipment: ${equipment.dataset.name}, type: ${equipment.dataset.type}`);

        // Debug clickability if there are issues
        this.debugConnectorClickability(connector);

        if (this.connectionMode && this.selectedConnector) {
            // Don't allow connecting to the same connector
            if (this.selectedConnector.connector === connector) {
                console.log('🔌 Cannot connect to the same connector');
                this.connectionMode = false;
                this.selectedConnector = null;
                this.resetConnectorStates();
                return;
            }

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
            console.log('🔌 Started connection mode with:', connector.dataset.type);
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
     * Update connector visual state based on connection count
     */
    updateConnectorVisualState(connector) {
        // Count how many connections this connector has
        const connectionCount = this.connections.filter(conn =>
            conn.from.connector === connector || conn.to.connector === connector
        ).length;

        console.log(`🔌 Updating connector visual state: ${connector.dataset.type} has ${connectionCount} connections`);

        // Remove existing connection count classes
        connector.classList.remove('connected-1', 'connected-2', 'connected-3', 'connected-many');

        // Add appropriate class based on connection count
        if (connectionCount === 1) {
            connector.classList.add('connected-1');
        } else if (connectionCount === 2) {
            connector.classList.add('connected-2');
        } else if (connectionCount === 3) {
            connector.classList.add('connected-3');
        } else if (connectionCount > 3) {
            connector.classList.add('connected-many');
        }

        // Update connection count display
        let countDisplay = connector.querySelector('.connection-count');

        // Remove existing count display if no connections
        if (connectionCount <= 1 && countDisplay) {
            countDisplay.remove();
            countDisplay = null;
        }

        // Create count display if multiple connections
        if (connectionCount > 1 && !countDisplay) {
            countDisplay = document.createElement('div');
            countDisplay.className = 'connection-count';
            countDisplay.style.pointerEvents = 'none'; // Prevent interference with clicks
            connector.appendChild(countDisplay);
        }

        // Update count text
        if (countDisplay) {
            countDisplay.textContent = connectionCount;
        }

        // Ensure connector remains clickable
        connector.style.pointerEvents = 'auto';
        console.log(`🔌 Connector ${connector.dataset.type} pointer-events: ${connector.style.pointerEvents}`);
    }

    /**
     * Update all connectors on a piece of equipment to ensure they remain clickable
     */
    updateAllConnectorsOnEquipment(equipment) {
        const connectors = equipment.querySelectorAll('.connector');
        console.log(`🔧 Found ${connectors.length} connectors on ${equipment.dataset.name}`);

        connectors.forEach((connector, index) => {
            // Ensure each connector has proper pointer-events
            connector.style.pointerEvents = 'auto';

            // Remove any potentially problematic classes that might interfere
            connector.classList.remove('disabled', 'inactive');

            console.log(`🔧 Connector ${index + 1}: ${connector.dataset.type} - pointer-events: ${connector.style.pointerEvents}`);
        });
    }

    /**
     * Refresh all connectors on all equipment to ensure they remain clickable
     */
    refreshAllConnectors() {
        console.log(`🔄 Refreshing connectors on ${this.equipment.length} equipment pieces...`);
        this.equipment.forEach((equipmentData, index) => {
            if (equipmentData.element) {
                console.log(`🔧 Refreshing equipment ${index + 1}: ${equipmentData.name}`);
                this.updateAllConnectorsOnEquipment(equipmentData.element);
            }
        });
        console.log('✅ All equipment connectors refreshed');
    }

    /**
     * Force refresh all connector states and ensure they're working
     */
    forceRefreshConnectors() {
        console.log('🔧 Force refreshing all connectors...');

        // Remove all existing connector event listeners
        document.querySelectorAll('.connector').forEach(connector => {
            const newConnector = connector.cloneNode(true);
            connector.parentNode.replaceChild(newConnector, connector);
        });

        // Re-setup connector event listeners
        this.setupConnectorEventListeners();

        // Force update all connector visual states
        this.equipment.forEach(equipmentData => {
            if (equipmentData.element) {
                const connectors = equipmentData.element.querySelectorAll('.connector');
                connectors.forEach(connector => {
                    this.updateConnectorVisualState(connector);
                });
            }
        });

        console.log('✅ Force refresh complete');
    }

    /**
     * Setup connector event listeners
     */
    setupConnectorEventListeners() {
        document.querySelectorAll('.connector').forEach(connector => {
            // Remove existing listeners
            connector.removeEventListener('click', this.handleConnectorClick);

            // Add new click listener
            connector.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const equipment = connector.closest('.equipment');
                if (equipment) {
                    this.handleConnectorClick(connector, equipment);
                }
            });

            // Add hover effects
            connector.addEventListener('mouseenter', () => {
                connector.style.transform = 'scale(1.2)';
            });

            connector.addEventListener('mouseleave', () => {
                connector.style.transform = 'scale(1)';
            });
        });
    }

    /**
     * Debug connector clickability issues
     */
    debugConnectorClickability(connector) {
        console.log('🔍 Debugging connector clickability...');

        const rect = connector.getBoundingClientRect();
        const elementsAtPoint = document.elementsFromPoint(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
        );

        console.log('🔍 Elements at connector center point:');
        elementsAtPoint.forEach((el, index) => {
            console.log(`  ${index + 1}. ${el.tagName}${el.className ? '.' + el.className.split(' ').join('.') : ''} - z-index: ${window.getComputedStyle(el).zIndex}`);
        });

        // Check if connector is the top element
        if (elementsAtPoint[0] === connector || elementsAtPoint[0].contains(connector)) {
            console.log('✅ Connector is clickable - it\'s the top element');
        } else {
            console.log('❌ Connector is blocked by:', elementsAtPoint[0]);
        }
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

        // Get unique cable types from connections (not the connection instances)
        const cableTypes = [...new Set(levelData.connections.map(conn => conn.type))];
        const cableOptions = cableTypes.map(cableType => {
            const connection = levelData.connections.find(conn => conn.type === cableType);
            return {
                type: cableType,
                name: connection.name,
                icon: connection.icon,
                color: connection.color
            };
        });

        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Select Cable Type</h3>
                <p>Choose the appropriate cable to connect ${from.connector.dataset.type} to ${to.connector.dataset.type}</p>
                <div class="cable-options">
                    ${cableOptions.map(cable => `
                        <button class="cable-option" data-type="${cable.type}">
                            <i class="${cable.icon}" style="color: ${cable.color}"></i>
                            ${cable.name}
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

                // Reset connection mode after any connection attempt (valid or invalid)
                this.connectionMode = false;
                this.selectedConnector = null;
                this.resetConnectorStates();
            });
        });

        // Close dialog on outside click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);

                // Reset connection mode when dialog is closed without selection
                this.connectionMode = false;
                this.selectedConnector = null;
                this.resetConnectorStates();
            }
        });
    }

    /**
     * Validate and create connection
     */
    validateAndCreateConnection(from, to, cableType, levelData) {
        console.log('🔍 Validating connection:', {
            from: from.connector.dataset.type,
            to: to.connector.dataset.type,
            cableType: cableType
        });

        console.log('🔍 From connector element:', from.connector);
        console.log('🔍 To connector element:', to.connector);

        console.log('🔍 Available valid connections:', levelData.validConnections);

        // Check for valid connection in both directions
        let validConnection = levelData.validConnections.find(conn =>
            conn.from === from.connector.dataset.type &&
            conn.to === to.connector.dataset.type &&
            conn.cable === cableType
        );

        // If not found, check the reverse direction
        if (!validConnection) {
            validConnection = levelData.validConnections.find(conn =>
                conn.from === to.connector.dataset.type &&
                conn.to === from.connector.dataset.type &&
                conn.cable === cableType
            );
        }

        console.log('🔍 Found valid connection:', validConnection);

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

        // Update connector visual state to show connection count
        console.log('🎨 Updating visual state for connected connectors...');
        this.updateConnectorVisualState(from.connector);
        this.updateConnectorVisualState(to.connector);

        // Update ALL connectors on both equipment to ensure they remain clickable
        console.log('🔧 Ensuring all connectors remain clickable...');
        this.updateAllConnectorsOnEquipment(from.equipment);
        this.updateAllConnectorsOnEquipment(to.equipment);

        // Update progress
        this.updateConnectionProgress();
        this.checkLevelCompletion();

        // Update connector states to ensure they remain clickable
        console.log('🔄 Updating connector states after connection...');
        this.refreshAllConnectors();
        console.log('✅ All connectors updated');
    }

    /**
     * Create invalid connection
     */
    createInvalidConnection(from, to, cableType) {
        const fromCoords = this.getConnectorCoordinates(from.connector);
        const toCoords = this.getConnectorCoordinates(to.connector);

        if (fromCoords && toCoords) {
            const invalidLine = this.drawConnectionLineWithCoordinates(fromCoords, toCoords, '#ff0000');

            // Remove the invalid connection line after 2 seconds
            setTimeout(() => {
                if (invalidLine && invalidLine.parentNode) {
                    invalidLine.parentNode.removeChild(invalidLine);
                }
            }, 2000);
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
        svg.style.zIndex = '5';
        svg.classList.add('connection-line');

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

        console.log('🎉 Level completed! Showing level complete popup...');
        this.showLevelComplete();
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
        console.log('🔍 Showing equipment info for:', equipmentType, equipmentName);

        const info = getEquipmentInfo(equipmentType, equipmentName);
        console.log('🔍 Equipment info:', info);

        const popup = document.createElement('div');
        popup.className = 'equipment-info-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h3>${equipmentName}</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="popup-body">
                    <div class="info-section">
                        <h4>📋 Description</h4>
                        <p>${info.description}</p>
                    </div>
                    <div class="info-section">
                        <h4>🎯 Purpose</h4>
                        <p>${info.purpose}</p>
                    </div>
                    <div class="info-section">
                        <h4>🔧 Usage</h4>
                        <p>${info.usage}</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        console.log('🔍 Equipment info popup added to DOM');

        // Close popup
        popup.querySelector('.close-btn').addEventListener('click', () => {
            console.log('🔍 Closing equipment info popup');
            document.body.removeChild(popup);
        });

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                console.log('🔍 Closing equipment info popup (click outside)');
                document.body.removeChild(popup);
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                console.log('🔍 Closing equipment info popup (Escape key)');
                document.body.removeChild(popup);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Show equipment settings popup
     */
    showEquipmentSettings(equipmentType, equipmentName, equipmentElement) {
        console.log('⚙️ Showing equipment settings for:', equipmentType, equipmentName);

        const settings = this.getEquipmentSettings(equipmentType, equipmentName);
        console.log('⚙️ Equipment settings:', settings);

        const popup = document.createElement('div');
        popup.className = 'equipment-settings-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h3>${equipmentName} Settings</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="popup-body">
                    <div class="settings-content">
                        ${this.generateSettingsHTML(settings, equipmentElement)}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        console.log('⚙️ Equipment settings popup added to DOM');

        // Add event listeners to settings controls
        this.setupSettingsEventListeners(popup, equipmentElement);

        // Close popup
        popup.querySelector('.close-btn').addEventListener('click', () => {
            console.log('⚙️ Closing equipment settings popup');
            document.body.removeChild(popup);
        });

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                console.log('⚙️ Closing equipment settings popup (click outside)');
                document.body.removeChild(popup);
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                console.log('⚙️ Closing equipment settings popup (Escape key)');
                document.body.removeChild(popup);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
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
            case 'r':
                if (this.currentScreen === 'game') {
                    console.log('🔧 Force refreshing connectors (R key pressed)');
                    this.forceRefreshConnectors();
                }
                break;
        }
    }

    /**
     * Show hint
     */
    showHint() {
        console.log('💡 Showing hint for level:', this.currentLevel);
        const levelData = getLevelData(this.currentLevel);
        if (!levelData) {
            console.log('❌ No level data found for:', this.currentLevel);
            return;
        }

        const hint = this.generateHint(levelData);
        console.log('💡 Generated hint:', hint);
        this.showHintPopup(hint);
    }

    /**
     * Show detailed hint
     */
    showDetailedHint() {
        console.log('🔍 Showing detailed hint for level:', this.currentLevel);
        const levelData = getLevelData(this.currentLevel);
        if (!levelData) {
            console.log('❌ No level data found for:', this.currentLevel);
            return;
        }

        const hint = this.generateDetailedHint(levelData);
        console.log('🔍 Generated detailed hint:', hint);
        this.showHintPopup(hint, true);

        // Deduct points for using detailed hint
        this.gameState.score = Math.max(0, this.gameState.score - 50);
        this.updatePlayerStats();
    }

    /**
     * Show hint popup
     */
    showHintPopup(message, isDetailed = false) {
        console.log('📋 Creating hint popup:', isDetailed ? 'detailed' : 'basic');
        console.log('📋 Message:', message);

        const popup = document.createElement('div');
        popup.className = 'hint-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h3>${isDetailed ? 'Detailed Hint' : 'Hint'}</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="popup-body">
                    <div class="hint-content">
                        ${message.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
                    </div>
                    ${isDetailed ? '<div class="hint-cost">💸 Cost: 50 points</div>' : ''}
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        console.log('📋 Hint popup added to DOM');

        // Close popup
        popup.querySelector('.close-btn').addEventListener('click', () => {
            console.log('📋 Closing hint popup (X button)');
            document.body.removeChild(popup);
        });

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                console.log('📋 Closing hint popup (click outside)');
                document.body.removeChild(popup);
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                console.log('📋 Closing hint popup (Escape key)');
                document.body.removeChild(popup);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Generate hint
     */
    generateHint(levelData) {
        const required = calculateRequiredConnections(levelData);
        const hints = [];

        // Check each connection type
        Object.entries(required).forEach(([type, count]) => {
            const current = this.connectionProgress[type].current;
            if (current < count) {
                const missing = count - current;
                switch (type) {
                    case 'power':
                        hints.push(`🔌 <strong>Power Connections:</strong> You need ${missing} more power connection${missing > 1 ? 's' : ''}. Connect equipment to power sources.`);
                        break;
                    case 'xlr':
                        hints.push(`🎤 <strong>XLR Connections:</strong> You need ${missing} more XLR connection${missing > 1 ? 's' : ''}. Connect audio equipment with XLR cables.`);
                        break;
                    case 'wireless':
                        hints.push(`📡 <strong>Wireless Connections:</strong> You need ${missing} more wireless connection${missing > 1 ? 's' : ''}. Connect wireless equipment.`);
                        break;
                    case 'ethernet':
                        hints.push(`🌐 <strong>Ethernet Connections:</strong> You need ${missing} more Ethernet connection${missing > 1 ? 's' : ''}. Connect network equipment.`);
                        break;
                    case 'dmx':
                        hints.push(`💡 <strong>DMX Connections:</strong> You need ${missing} more DMX connection${missing > 1 ? 's' : ''}. Connect lighting equipment.`);
                        break;
                    case 'hdmi':
                        hints.push(`📺 <strong>HDMI Connections:</strong> You need ${missing} more HDMI connection${missing > 1 ? 's' : ''}. Connect video equipment.`);
                        break;
                }
            }
        });

        // Level-specific hints
        if (this.currentLevel === 'audio-1') {
            hints.push(`🎵 <strong>Level 1 Strategy:</strong> Connect wireless mics → receivers → mixer → speakers`);
        } else if (this.currentLevel === 'audio-2') {
            hints.push(`🎵 <strong>Level 2 Strategy:</strong> Connect XLR mics → mixer → effects processor → speakers`);
        } else if (this.currentLevel === 'audio-3') {
            hints.push(`🎵 <strong>Level 3 Strategy:</strong> Connect mics + playback → mixer → wireless monitoring + multi-zone speakers`);
        }

        return hints.length > 0 ? hints.join('\n\n') : '🎉 <strong>Great job!</strong> All connections look good! Try testing the system.';
    }

    /**
     * Generate detailed hint
     */
    generateDetailedHint(levelData) {
        const required = calculateRequiredConnections(levelData);
        const detailedHints = [];

        // Check each connection type with specific guidance
        Object.entries(required).forEach(([type, count]) => {
            const current = this.connectionProgress[type].current;
            if (current < count) {
                const missing = count - current;
                switch (type) {
                    case 'power':
                        detailedHints.push(`🔌 <strong>POWER CONNECTIONS MISSING: ${missing}</strong>`);
                        detailedHints.push(`📊 <em>Required: ${count} | Current: ${current}</em>`);
                        detailedHints.push(`💡 <strong>Solution:</strong> Connect power distribution outputs to equipment power inputs.`);
                        break;
                    case 'xlr':
                        detailedHints.push(`🎤 <strong>XLR CONNECTIONS MISSING: ${missing}</strong>`);
                        detailedHints.push(`📊 <em>Required: ${count} | Current: ${current}</em>`);
                        if (this.currentLevel === 'audio-1') {
                            detailedHints.push(`💡 <strong>Solution:</strong> Connect mic receivers to mixer inputs, then mixer outputs to speakers.`);
                        } else if (this.currentLevel === 'audio-2') {
                            detailedHints.push(`💡 <strong>Solution:</strong> Connect XLR mics to mixer inputs, mixer to effects processor, effects to speakers.`);
                        } else {
                            detailedHints.push(`💡 <strong>Solution:</strong> Connect audio equipment using XLR cables for high-quality signal transmission.`);
                        }
                        break;
                    case 'wireless':
                        detailedHints.push(`📡 <strong>WIRELESS CONNECTIONS MISSING: ${missing}</strong>`);
                        detailedHints.push(`📊 <em>Required: ${count} | Current: ${current}</em>`);
                        detailedHints.push(`💡 <strong>Solution:</strong> Connect wireless mics to mic receivers using wireless cables.`);
                        break;
                    case 'ethernet':
                        detailedHints.push(`🌐 <strong>ETHERNET CONNECTIONS MISSING: ${missing}</strong>`);
                        detailedHints.push(`📊 <em>Required: ${count} | Current: ${current}</em>`);
                        detailedHints.push(`💡 <strong>Solution:</strong> Connect network equipment using Ethernet cables.`);
                        break;
                    case 'dmx':
                        detailedHints.push(`💡 <strong>DMX CONNECTIONS MISSING: ${missing}</strong>`);
                        detailedHints.push(`📊 <em>Required: ${count} | Current: ${current}</em>`);
                        detailedHints.push(`💡 <strong>Solution:</strong> Connect lighting equipment using DMX cables.`);
                        break;
                    case 'hdmi':
                        detailedHints.push(`📺 <strong>HDMI CONNECTIONS MISSING: ${missing}</strong>`);
                        detailedHints.push(`📊 <em>Required: ${count} | Current: ${current}</em>`);
                        detailedHints.push(`💡 <strong>Solution:</strong> Connect video equipment using HDMI cables.`);
                        break;
                }
            }
        });

        if (detailedHints.length === 0) {
            return "🎉 <strong>ALL CONNECTIONS COMPLETE!</strong> The system should be ready to test.";
        }

        return detailedHints.join('\n\n');
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
     * Pause game and return to level selector
     */
    pauseGame() {
        console.log('⏸️ Pausing game and returning to level selector');

        // Stop the game timer
        this.stopGameTimer();

        // Clear any active connection mode
        this.connectionMode = false;
        this.selectedConnector = null;
        this.resetConnectorStates();

        // Clear any open popups
        const popups = document.querySelectorAll('.equipment-info-popup, .hint-popup, .equipment-settings-popup');
        popups.forEach(popup => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        });

        // Switch to level selection screen
        this.showLevelSelect();
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
     * Get equipment settings based on type
     */
    getEquipmentSettings(equipmentType, equipmentName) {
        const settings = {
            'microphone': {
                'Wireless Vocal Mic': {
                    volume: { type: 'slider', min: 0, max: 100, value: 75, label: 'Volume' },
                    gain: { type: 'slider', min: 0, max: 60, value: 30, label: 'Gain' },
                    battery: { type: 'display', value: '85%', label: 'Battery' },
                    channel: { type: 'select', options: ['1', '2', '3', '4'], value: '1', label: 'Channel' }
                },
                'Vocal Mic': {
                    volume: { type: 'slider', min: 0, max: 100, value: 80, label: 'Volume' },
                    gain: { type: 'slider', min: 0, max: 60, value: 35, label: 'Gain' },
                    phantom: { type: 'toggle', value: true, label: 'Phantom Power' }
                },
                'Instrument Mic': {
                    volume: { type: 'slider', min: 0, max: 100, value: 70, label: 'Volume' },
                    gain: { type: 'slider', min: 0, max: 60, value: 25, label: 'Gain' },
                    phantom: { type: 'toggle', value: false, label: 'Phantom Power' }
                }
            },
            'mixing-console': {
                'Mixing Console': {
                    masterVolume: { type: 'slider', min: 0, max: 100, value: 60, label: 'Master Volume' },
                    eq: { type: 'slider', min: -12, max: 12, value: 0, label: 'EQ' },
                    effects: { type: 'toggle', value: false, label: 'Effects' }
                },
                '8-Channel Mixer': {
                    masterVolume: { type: 'slider', min: 0, max: 100, value: 65, label: 'Master Volume' },
                    channel1: { type: 'slider', min: 0, max: 100, value: 70, label: 'Channel 1' },
                    channel2: { type: 'slider', min: 0, max: 100, value: 65, label: 'Channel 2' },
                    effects: { type: 'toggle', value: true, label: 'Effects' }
                },
                '24-Channel Mixer': {
                    masterVolume: { type: 'slider', min: 0, max: 100, value: 70, label: 'Master Volume' },
                    channel1: { type: 'slider', min: 0, max: 100, value: 75, label: 'Channel 1' },
                    channel2: { type: 'slider', min: 0, max: 100, value: 70, label: 'Channel 2' },
                    channel3: { type: 'slider', min: 0, max: 100, value: 65, label: 'Channel 3' },
                    effects: { type: 'toggle', value: true, label: 'Effects' },
                    recording: { type: 'toggle', value: false, label: 'Recording' }
                }
            },
            'speaker': {
                'Main Speaker': {
                    volume: { type: 'slider', min: 0, max: 100, value: 80, label: 'Volume' },
                    crossover: { type: 'slider', min: 50, max: 200, value: 100, label: 'Crossover (Hz)' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Monitor Speaker': {
                    volume: { type: 'slider', min: 0, max: 100, value: 75, label: 'Volume' },
                    eq: { type: 'slider', min: -12, max: 12, value: 0, label: 'EQ' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'power-distro': {
                'Power Distribution': {
                    mainPower: { type: 'toggle', value: true, label: 'Main Power' },
                    circuit1: { type: 'toggle', value: true, label: 'Circuit 1' },
                    circuit2: { type: 'toggle', value: true, label: 'Circuit 2' },
                    circuit3: { type: 'toggle', value: true, label: 'Circuit 3' },
                    load: { type: 'display', value: '45%', label: 'Load' }
                }
            },
            'light-fixture': {
                'Moving Head Light': {
                    intensity: { type: 'slider', min: 0, max: 100, value: 80, label: 'Intensity' },
                    pan: { type: 'slider', min: 0, max: 360, value: 180, label: 'Pan' },
                    tilt: { type: 'slider', min: -90, max: 90, value: 0, label: 'Tilt' },
                    color: { type: 'select', options: ['White', 'Red', 'Blue', 'Green', 'Yellow'], value: 'White', label: 'Color' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'LED Par Light': {
                    intensity: { type: 'slider', min: 0, max: 100, value: 75, label: 'Intensity' },
                    color: { type: 'select', options: ['White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple'], value: 'White', label: 'Color' },
                    strobe: { type: 'toggle', value: false, label: 'Strobe' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'dmx-controller': {
                'DMX Controller': {
                    masterFader: { type: 'slider', min: 0, max: 100, value: 80, label: 'Master Fader' },
                    scene1: { type: 'toggle', value: true, label: 'Scene 1' },
                    scene2: { type: 'toggle', value: false, label: 'Scene 2' },
                    scene3: { type: 'toggle', value: false, label: 'Scene 3' },
                    auto: { type: 'toggle', value: false, label: 'Auto Mode' }
                }
            }
        };

        return settings[equipmentType]?.[equipmentName] || {};
    }

    /**
     * Generate HTML for settings controls
     */
    generateSettingsHTML(settings, equipmentElement) {
        if (Object.keys(settings).length === 0) {
            return '<p class="no-settings">No settings available for this equipment.</p>';
        }

        let html = '';
        Object.entries(settings).forEach(([key, setting]) => {
            html += '<div class="setting-item">';
            html += `<label>${setting.label}</label>`;

            switch (setting.type) {
                case 'slider':
                    html += `<input type="range" min="${setting.min}" max="${setting.max}" value="${setting.value}" data-setting="${key}" class="setting-slider">`;
                    html += `<span class="setting-value">${setting.value}</span>`;
                    break;
                case 'toggle':
                    html += `<input type="checkbox" ${setting.value ? 'checked' : ''} data-setting="${key}" class="setting-toggle">`;
                    html += `<span class="setting-value">${setting.value ? 'ON' : 'OFF'}</span>`;
                    break;
                case 'select':
                    html += `<select data-setting="${key}" class="setting-select">`;
                    setting.options.forEach(option => {
                        html += `<option value="${option}" ${option === setting.value ? 'selected' : ''}>${option}</option>`;
                    });
                    html += '</select>';
                    break;
                case 'display':
                    html += `<span class="setting-display">${setting.value}</span>`;
                    break;
            }

            html += '</div>';
        });

        return html;
    }

    /**
     * Setup event listeners for settings controls
     */
    setupSettingsEventListeners(popup, equipmentElement) {
        // Slider controls
        popup.querySelectorAll('.setting-slider').forEach(slider => {
            const valueDisplay = slider.nextElementSibling;
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                valueDisplay.textContent = value;
                this.updateEquipmentSetting(equipmentElement, e.target.dataset.setting, value);
            });
        });

        // Toggle controls
        popup.querySelectorAll('.setting-toggle').forEach(toggle => {
            const valueDisplay = toggle.nextElementSibling;
            toggle.addEventListener('change', (e) => {
                const value = e.target.checked;
                valueDisplay.textContent = value ? 'ON' : 'OFF';
                this.updateEquipmentSetting(equipmentElement, e.target.dataset.setting, value);
            });
        });

        // Select controls
        popup.querySelectorAll('.setting-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const value = e.target.value;
                this.updateEquipmentSetting(equipmentElement, e.target.dataset.setting, value);
            });
        });
    }

    /**
     * Update equipment setting
     */
    updateEquipmentSetting(equipmentElement, setting, value) {
        console.log('⚙️ Updating setting:', setting, 'to', value, 'for equipment:', equipmentElement.dataset.name);

        // Store setting in equipment element
        if (!equipmentElement.dataset.settings) {
            equipmentElement.dataset.settings = '{}';
        }
        const settings = JSON.parse(equipmentElement.dataset.settings);
        settings[setting] = value;
        equipmentElement.dataset.settings = JSON.stringify(settings);

        // Apply visual effects based on settings
        this.applyEquipmentSettings(equipmentElement, settings);
    }

    /**
     * Apply equipment settings visually
     */
    applyEquipmentSettings(equipmentElement, settings) {
        const equipmentType = equipmentElement.dataset.type;
        const equipmentName = equipmentElement.dataset.name;

        // Apply different visual effects based on equipment type and settings
        if (equipmentType === 'light-fixture') {
            if (settings.intensity !== undefined) {
                const intensity = parseInt(settings.intensity) / 100;
                equipmentElement.style.opacity = 0.3 + (intensity * 0.7);
            }
            if (settings.power !== undefined && !settings.power) {
                equipmentElement.style.filter = 'grayscale(100%)';
            } else {
                equipmentElement.style.filter = 'none';
            }
        } else if (equipmentType === 'speaker') {
            if (settings.volume !== undefined) {
                const volume = parseInt(settings.volume) / 100;
                equipmentElement.style.transform = `scale(${0.8 + (volume * 0.2)})`;
            }
            if (settings.power !== undefined && !settings.power) {
                equipmentElement.style.filter = 'grayscale(100%)';
            } else {
                equipmentElement.style.filter = 'none';
            }
        } else if (equipmentType === 'mixing-console') {
            if (settings.masterVolume !== undefined) {
                const volume = parseInt(settings.masterVolume) / 100;
                equipmentElement.style.opacity = 0.5 + (volume * 0.5);
            }
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.audioSystem.cleanup();
        this.stopGameTimer();
    }
}
