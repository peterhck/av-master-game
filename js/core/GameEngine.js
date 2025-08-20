// Main Game Engine
// Imports and coordinates all game modules

import { AudioSystem } from '../modules/AudioSystem.js';
import { AITutor } from '../modules/AITutor.js';
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
            hdmi: { current: 0, required: 0 },
            usb: { current: 0, required: 0 }
        };

        // Initialize audio system
        this.audioSystem = new AudioSystem();

        // Initialize AI Tutor
        this.aiTutor = new AITutor();

        // Flag to prevent multiple completion triggers
        this.levelCompleted = false;

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

                    // Check if user is authenticated (temporarily disabled for testing)
                    if (window.authManager && !window.authManager.isAuthenticated) {
                        console.log('⚠️ Authentication temporarily disabled for testing');
                        // window.authManager.setPendingGameAction('start-game');
                        // this.showAuthenticationRequired();
                        // return;
                    }

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

                    // Check if user is authenticated (temporarily disabled for testing)
                    if (window.authManager && !window.authManager.isAuthenticated) {
                        console.log('⚠️ Authentication temporarily disabled for testing');
                        // window.authManager.setPendingGameAction('tutorial');
                        // this.showAuthenticationRequired();
                        // return;
                    }

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

                    // Check if user is authenticated (temporarily disabled for testing)
                    if (window.authManager && !window.authManager.isAuthenticated) {
                        console.log('⚠️ Authentication temporarily disabled for testing');
                        // window.authManager.setPendingGameAction('settings');
                        // this.showAuthenticationRequired();
                        // return;
                    }

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
        // Update both main menu and game screen stats
        const scoreEl = document.getElementById('player-score');
        const gameScoreEl = document.getElementById('game-score');
        const livesEl = document.getElementById('player-lives');
        const gameLivesEl = document.getElementById('game-lives');
        const timeEl = document.getElementById('player-time');
        const gameTimeEl = document.getElementById('game-time');

        // Update score (both locations)
        if (scoreEl) {
            scoreEl.textContent = this.gameState.score;
        }
        if (gameScoreEl) {
            gameScoreEl.textContent = this.gameState.score;
        }

        // Update lives (both locations)
        if (livesEl) {
            livesEl.textContent = this.gameState.lives;
        }
        if (gameLivesEl) {
            gameLivesEl.textContent = this.gameState.lives;
        }

        // Update time (both locations)
        const formattedTime = this.formatTime(this.gameState.time);

        if (timeEl) {
            timeEl.textContent = formattedTime;
        }

        if (gameTimeEl) {
            gameTimeEl.textContent = formattedTime;
        }
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
     * Update the level selection UI (public method for external calls)
     */
    updateLevelSelectionUI() {
        console.log('🔄 Updating level selection UI...');
        this.updateLevelStatus();
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
        // Stop any existing timer first
        this.stopGameTimer();

        this.currentLevel = levelId;
        this.successfulConnections = 0;
        this.totalRequiredConnections = 0;
        this.levelCompleted = false; // Reset completion flag for new level

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
            hdmi: { current: 0, required: 0 },
            usb: { current: 0, required: 0 }
        };

        // Reset timer for this level
        this.gameState.time = 0;
        this.updatePlayerStats();

        this.setupStage(levelData);
        this.setupToolbar(levelData);
        this.setupConnectorEventListeners(); // Set up event delegation
        this.updateConnectionProgress();

        // Start timer after a short delay to ensure everything is set up
        setTimeout(() => {
            this.startGameTimer();
        }, 100);
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
            console.log('✅ Setup test passed! All connections and resource assignments are valid.');

            let successMessage = '✅ Setup test passed! All connections are valid.';
            if (validationResult.resourceAssignmentComplete !== undefined) {
                successMessage += ' All resources are correctly assigned.';
            }

            this.showMessage(successMessage, 'success');

            // Show celebration if level is complete
            if (!this.gameState.completedLevels.includes(this.currentLevel)) {
                this.showLevelComplete();
            }
        } else {
            console.log('❌ Setup test failed. Missing:', validationResult.missingConnections, validationResult.missingResources);

            let errorMessage = '❌ Setup test failed. Missing: ';
            const missingItems = [...validationResult.missingConnections, ...validationResult.missingResources];
            errorMessage += missingItems.join(', ');

            this.showMessage(errorMessage, 'error');

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
        this.levelCompleted = false; // Reset completion flag

        // Clear connection lines
        this.clearAllConnectionLines();

        // Reset connection progress
        this.connectionProgress = {
            power: { current: 0, required: 0 },
            xlr: { current: 0, required: 0 },
            wireless: { current: 0, required: 0 },
            ethernet: { current: 0, required: 0 },
            dmx: { current: 0, required: 0 },
            hdmi: { current: 0, required: 0 },
            usb: { current: 0, required: 0 }
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

        // Clear activate test button if it exists
        const activateButton = document.getElementById('activate-test-btn');
        if (activateButton) {
            activateButton.remove();
        }

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

        // Check resource assignments if this level has resource requirements
        let resourceAssignmentComplete = true;
        let missingResources = [];

        if (levelData.resourceRequirements) {
            resourceAssignmentComplete = this.checkResourceAssignments();

            if (!resourceAssignmentComplete) {
                missingResources.push('Resource assignments');
                isComplete = false;
            }
        }

        return {
            isComplete,
            missingConnections,
            missingResources,
            resourceAssignmentComplete
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

        // Redraw all valid connections using stored coordinates
        this.connections.forEach(connection => {
            if (connection.fromCoords && connection.toCoords) {
                // Use stored coordinates instead of recalculating
                connection.line = this.drawConnectionLineWithCoordinates(
                    connection.fromCoords,
                    connection.toCoords,
                    getConnectorColor(connection.fromConnectorType)
                );
            }
        });

        console.log(`✅ Redrew ${this.connections.length} connection lines`);
    }

    /**
     * Close any open cable selection dialog
     */
    closeCableSelectionDialog() {
        const cableDialog = document.querySelector('.cable-selection-dialog');
        if (cableDialog) {
            console.log('🔌 Closing cable selection dialog');
            document.body.removeChild(cableDialog);

            // Reset connection mode when dialog is closed
            this.connectionMode = false;
            this.selectedConnector = null;
            this.resetConnectorStates();
        }
    }



    /**
     * Check if current level has testing challenges
     */
    hasTestingChallenges() {
        const levelData = this.getLevelData(this.currentLevel);
        return levelData && levelData.testingChallenges && levelData.testingChallenges.length > 0;
    }



    /**
 * Start testing challenges flow
 */
    startTestingChallenges() {
        console.log('🔬 Starting testing challenges flow...');
        console.log('🔬 Current level:', this.currentLevel);

        // Close any existing winner popup first
        const winnerPopup = document.querySelector('.winner-celebration-overlay');
        if (winnerPopup) {
            console.log('🔬 Closing winner popup');
            document.body.removeChild(winnerPopup);
        }

        // Show the "Activate Test" button at the bottom of the game screen
        this.showActivateTestButton();
    }

    /**
     * Show "Activate Test" button at bottom of game screen
     */
    showActivateTestButton() {
        console.log('🔬 Showing activate test button...');

        // Remove any existing activate test button
        const existingButton = document.getElementById('activate-test-btn');
        if (existingButton) {
            existingButton.remove();
        }

        // Create the activate test button
        const activateButton = document.createElement('button');
        activateButton.id = 'activate-test-btn';
        activateButton.className = 'activate-test-button';
        activateButton.innerHTML = `
            <i class="fas fa-flask"></i>
            Activate Test
        `;

        // Add event listener
        activateButton.addEventListener('click', () => {
            console.log('🔬 Activate test button clicked');
            console.log('🔬 About to call activateTestingChallenges()...');
            this.activateTestingChallenges();
            console.log('🔬 activateTestingChallenges() called successfully');
        });

        // Add to the game screen (bottom of stage area)
        const stageArea = document.getElementById('stage-area');
        if (stageArea) {
            stageArea.appendChild(activateButton);
            console.log('🔬 Activate test button added to stage area');
        } else {
            console.error('❌ Stage area not found for activate test button');
        }
    }

    /**
     * Activate testing challenges (called when "Activate Test" button is clicked)
     */
    activateTestingChallenges() {
        console.log('🔬 ===== ACTIVATE TESTING CHALLENGES FUNCTION CALLED =====');
        console.log('🔬 Activating testing challenges...');

        // Remove the activate test button safely
        const activateButton = document.getElementById('activate-test-btn');
        if (activateButton && activateButton.parentNode) {
            activateButton.parentNode.removeChild(activateButton);
        }

        const levelData = this.getLevelData(this.currentLevel);
        console.log('🔬 Level data:', levelData);

        if (!levelData || !levelData.testingChallenges) {
            console.error('❌ No testing challenges found for level:', this.currentLevel);
            alert('No testing challenges available for this level.');
            return;
        }

        console.log('🔬 Testing challenges found:', levelData.testingChallenges);
        console.log('🔬 Number of challenges:', levelData.testingChallenges.length);

        this.currentTestingChallenges = [...levelData.testingChallenges];
        this.currentChallengeIndex = 0;
        this.testingResults = [];

        console.log('🔬 About to show first challenge...');
        console.log('🔬 Calling showCurrentChallenge()...');
        try {
            this.showCurrentChallenge();
            console.log('🔬 showCurrentChallenge() completed successfully');
        } catch (error) {
            console.error('❌ Error in showCurrentChallenge():', error);
        }
    }

    /**
 * Show current testing challenge - SIMPLE WORKING MODAL
 */
    showCurrentChallenge() {
        console.log('🔬 ===== SHOW CURRENT CHALLENGE FUNCTION CALLED =====');
        console.log('🔬 Showing current challenge...');
        console.log('🔬 Current challenge index:', this.currentChallengeIndex);
        console.log('🔬 Total challenges:', this.currentTestingChallenges.length);

        if (this.currentChallengeIndex >= this.currentTestingChallenges.length) {
            console.log('🔬 All challenges completed!');
            this.showCompletionMessage();
            return;
        }

        const challenge = this.currentTestingChallenges[this.currentChallengeIndex];
        this.currentChallenge = challenge;

        console.log('🔬 Current challenge:', challenge);

        // Create a simple, clean modal that will definitely work
        this.createSimpleModal(challenge);
    }

    /**
     * Create a simple modal that will definitely work
     */
    createSimpleModal(challenge) {
        // Remove any existing modal first
        const existingModal = document.getElementById('simple-test-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'simple-test-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
        `;

        // Create modal content
        const content = document.createElement('div');
        content.style.cssText = `
            background: #2c3e50;
            border-radius: 15px;
            padding: 30px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            color: white;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #3498db;
        `;
        header.innerHTML = `
            <h2 style="margin: 0; color: #3498db; font-size: 24px;">🎯 Testing Challenge ${this.currentChallengeIndex + 1}/${this.currentTestingChallenges.length}</h2>
            <h3 style="margin: 10px 0 0 0; color: #ecf0f1; font-size: 18px;">${challenge.title}</h3>
            <p style="margin: 10px 0 0 0; color: #bdc3c7; font-size: 14px;">${challenge.description}</p>
        `;

        // Create instructions
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            background: rgba(52, 152, 219, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        `;
        instructions.innerHTML = `
            <h4 style="margin: 0 0 15px 0; color: #3498db;">📝 Instructions:</h4>
            <ol style="margin: 0; padding-left: 20px; color: #ecf0f1;">
                ${challenge.instructions.map(instruction => `<li style="margin-bottom: 8px;">${instruction}</li>`).join('')}
            </ol>
        `;

        // Create controls based on challenge type
        const controls = this.createChallengeControls(challenge);

        // Create buttons
        const buttons = document.createElement('div');
        buttons.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
        `;

        const skipBtn = document.createElement('button');
        skipBtn.textContent = '⏭️ Skip Challenge';
        skipBtn.style.cssText = `
            background: #95a5a6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        `;
        skipBtn.onmouseover = () => skipBtn.style.background = '#7f8c8d';
        skipBtn.onmouseout = () => skipBtn.style.background = '#95a5a6';
        skipBtn.onclick = () => {
            modal.remove();
            this.currentChallengeIndex++;
            this.showCurrentChallenge();
        };

        const nextBtn = document.createElement('button');
        nextBtn.textContent = '✅ Complete Challenge';
        nextBtn.style.cssText = `
            background: #27ae60;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        `;
        nextBtn.onmouseover = () => nextBtn.style.background = '#229954';
        nextBtn.onmouseout = () => nextBtn.style.background = '#27ae60';
        nextBtn.onclick = () => {
            modal.remove();
            this.currentChallengeIndex++;
            this.showCurrentChallenge();
        };

        buttons.appendChild(skipBtn);
        buttons.appendChild(nextBtn);

        // Assemble modal
        content.appendChild(header);
        content.appendChild(instructions);
        content.appendChild(controls);
        content.appendChild(buttons);
        modal.appendChild(content);

        // Add to page
        document.body.appendChild(modal);
        console.log('🔬 Simple modal created and added to DOM');

        // Add event listeners to the controls
        this.setupModalEventListeners(modal, challenge);
    }

    /**
     * Setup event listeners for modal controls
     */
    setupModalEventListeners(modal, challenge) {
        if (challenge.type === 'microphone-test') {
            this.setupMicrophoneListeners(modal);
        } else if (challenge.type === 'speaker-test') {
            this.setupSpeakerListeners(modal);
        } else if (challenge.type === 'channel-test') {
            this.setupChannelListeners(modal);
        }
    }

    /**
     * Setup microphone control event listeners
     */
    setupMicrophoneListeners(modal) {
        const muteBtn = modal.querySelector('#mute-btn');
        const unmuteBtn = modal.querySelector('#unmute-btn');
        const micStatus = modal.querySelector('#mic-status');
        const visualizer = modal.querySelector('#audio-visualizer');
        const vizBars = visualizer.querySelectorAll('.viz-bar');

        let isMuted = false;
        let audioInterval;

        // Start audio visualizer animation
        const startVisualizer = () => {
            audioInterval = setInterval(() => {
                if (!isMuted) {
                    vizBars.forEach(bar => {
                        const height = Math.random() * 30 + 5;
                        bar.style.height = height + 'px';
                    });
                }
            }, 100);
        };

        // Stop audio visualizer animation
        const stopVisualizer = () => {
            if (audioInterval) {
                clearInterval(audioInterval);
                vizBars.forEach(bar => {
                    bar.style.height = '5px';
                });
            }
        };

        // Start visualizer immediately
        startVisualizer();

        // Mute button functionality
        muteBtn.addEventListener('click', () => {
            isMuted = true;
            micStatus.textContent = 'Muted';
            micStatus.style.background = '#e74c3c';
            stopVisualizer();
            console.log('🔇 Microphone muted');
        });

        // Unmute button functionality
        unmuteBtn.addEventListener('click', () => {
            isMuted = false;
            micStatus.textContent = 'Active';
            micStatus.style.background = '#27ae60';
            startVisualizer();
            console.log('🔊 Microphone unmuted');
        });
    }

    /**
     * Setup speaker control event listeners
     */
    setupSpeakerListeners(modal) {
        const volumeSlider = modal.querySelector('#volume-slider');
        const volumeDisplay = modal.querySelector('#volume-display');
        const playBtn = modal.querySelector('#play-test-audio-btn');
        const stopBtn = modal.querySelector('#stop-test-audio-btn');
        const speakerStatus = modal.querySelector('#speaker-status');

        let isPlaying = false;
        let audioInterval;

        // Volume control
        volumeSlider.addEventListener('input', () => {
            const volume = volumeSlider.value;
            volumeDisplay.textContent = volume + '%';
            console.log('🔊 Volume set to:', volume + '%');
        });

        // Play test audio
        playBtn.addEventListener('click', () => {
            const selectedSpeakers = [];
            const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');

            if (checkboxes.length === 0) {
                speakerStatus.innerHTML = '<div style="color: #e74c3c; font-size: 14px;">⚠️ Please select at least one speaker first!</div>';
                return;
            }

            checkboxes.forEach(checkbox => {
                selectedSpeakers.push(checkbox.id.replace('speaker-', '').replace('-', ' '));
            });

            isPlaying = true;
            playBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';

            // Update status with selected speakers
            speakerStatus.innerHTML = `
                <div style="color: #27ae60; font-size: 14px; margin-bottom: 10px;">🎵 Playing test audio on: ${selectedSpeakers.join(', ')}</div>
                <div style="display: flex; gap: 5px; justify-content: center;">
                    ${selectedSpeakers.map(speaker => `
                        <div style="width: 20px; height: 20px; background: #3498db; border-radius: 50%; animation: pulse 1s infinite;"></div>
                    `).join('')}
                </div>
            `;

            // Add pulse animation for active speakers
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);

            console.log('🔊 Playing test audio on:', selectedSpeakers);
        });

        // Stop test audio
        stopBtn.addEventListener('click', () => {
            isPlaying = false;
            playBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';

            speakerStatus.innerHTML = '<div style="color: #ecf0f1; font-size: 14px;">Audio stopped. Select speakers and click "Play Test Audio" to begin testing</div>';

            console.log('🔊 Test audio stopped');
        });
    }

    /**
     * Setup channel control event listeners
     */
    setupChannelListeners(modal) {
        const routeBtn = modal.querySelector('#route-audio-btn');
        const clearBtn = modal.querySelector('#clear-routing-btn');
        const channelStatus = modal.querySelector('#channel-status');

        // Route audio to selected channels
        routeBtn.addEventListener('click', () => {
            const selectedChannels = [];
            const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');

            if (checkboxes.length === 0) {
                channelStatus.innerHTML = '<div style="color: #e74c3c; font-size: 14px;">⚠️ Please select at least one channel first!</div>';
                return;
            }

            checkboxes.forEach(checkbox => {
                selectedChannels.push(checkbox.id.replace('channel-', 'Channel '));
            });

            // Update status with active channels
            channelStatus.innerHTML = `
                <div style="color: #27ae60; font-size: 14px; margin-bottom: 10px;">🎛️ Audio routed to: ${selectedChannels.join(', ')}</div>
                <div style="display: flex; gap: 5px; justify-content: center;">
                    ${selectedChannels.map(channel => `
                        <div style="width: 30px; height: 20px; background: #e67e22; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: bold;">${channel.split(' ')[1]}</div>
                    `).join('')}
                </div>
            `;

            console.log('🎛️ Audio routed to channels:', selectedChannels);
        });

        // Clear all routing
        clearBtn.addEventListener('click', () => {
            const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });

            channelStatus.innerHTML = '<div style="color: #ecf0f1; font-size: 14px;">All routing cleared. Select channels and click "Route Audio" to test routing</div>';

            console.log('🎛️ All channel routing cleared');
        });
    }

    /**
     * Create challenge-specific controls
     */
    createChallengeControls(challenge) {
        const controls = document.createElement('div');
        controls.style.cssText = `
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        `;

        if (challenge.type === 'microphone-test') {
            controls.innerHTML = this.createMicrophoneControls();
        } else if (challenge.type === 'speaker-test') {
            controls.innerHTML = this.createSpeakerControls();
        } else if (challenge.type === 'channel-test') {
            controls.innerHTML = this.createChannelControls();
        }

        return controls;
    }

    /**
     * Create microphone controls
     */
    createMicrophoneControls() {
        return `
            <h4 style="margin: 0 0 15px 0; color: #3498db;">🎤 Microphone Controls:</h4>
            <div style="text-align: center;">
                <div style="margin-bottom: 15px;">
                    <span style="color: #ecf0f1; margin-right: 10px;">Status:</span>
                    <span id="mic-status" style="background: #27ae60; color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold;">Ready</span>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 20px;">
                    <button id="mute-btn" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">🔇 Mute</button>
                    <button id="unmute-btn" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">🔊 Unmute</button>
                </div>
                <div id="audio-visualizer" style="display: flex; gap: 3px; justify-content: center; height: 40px; align-items: end;">
                    <div class="viz-bar" style="width: 8px; background: #3498db; border-radius: 2px; transition: height 0.3s;"></div>
                    <div class="viz-bar" style="width: 8px; background: #3498db; border-radius: 2px; transition: height 0.3s;"></div>
                    <div class="viz-bar" style="width: 8px; background: #3498db; border-radius: 2px; transition: height 0.3s;"></div>
                    <div class="viz-bar" style="width: 8px; background: #3498db; border-radius: 2px; transition: height 0.3s;"></div>
                    <div class="viz-bar" style="width: 8px; background: #3498db; border-radius: 2px; transition: height 0.3s;"></div>
                </div>
            </div>
        `;
    }

    /**
     * Create speaker controls
     */
    createSpeakerControls() {
        return `
            <h4 style="margin: 0 0 15px 0; color: #3498db;">🔊 Speaker Controls:</h4>
            <div style="text-align: center;">
                <!-- Speaker Selection -->
                <div style="margin-bottom: 20px; text-align: left;">
                    <h5 style="color: #ecf0f1; margin: 0 0 10px 0;">Select Speakers to Test:</h5>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <label style="display: flex; align-items: center; gap: 5px; color: #ecf0f1; cursor: pointer;">
                            <input type="checkbox" id="speaker-front-left" style="margin: 0;"> Front Left
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px; color: #ecf0f1; cursor: pointer;">
                            <input type="checkbox" id="speaker-front-right" style="margin: 0;"> Front Right
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px; color: #ecf0f1; cursor: pointer;">
                            <input type="checkbox" id="speaker-monitor-left" style="margin: 0;"> Monitor Left
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px; color: #ecf0f1; cursor: pointer;">
                            <input type="checkbox" id="speaker-monitor-right" style="margin: 0;"> Monitor Right
                        </label>
                    </div>
                </div>

                <!-- Volume Control -->
                <div style="margin-bottom: 20px;">
                    <label style="color: #ecf0f1; display: block; margin-bottom: 5px;">Volume: <span id="volume-display">50%</span></label>
                    <input type="range" id="volume-slider" min="0" max="100" value="50" style="width: 200px;">
                </div>

                <!-- Audio Controls -->
                <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 20px;">
                    <button id="play-test-audio-btn" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">▶️ Play Test Audio</button>
                    <button id="stop-test-audio-btn" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; display: none;">⏹️ Stop Audio</button>
                </div>

                <!-- Speaker Status Display -->
                <div id="speaker-status" style="margin-top: 15px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 5px; min-height: 40px;">
                    <div style="color: #ecf0f1; font-size: 14px;">Select speakers and click "Play Test Audio" to begin testing</div>
                </div>
            </div>
        `;
    }

    /**
     * Create channel controls
     */
    createChannelControls() {
        return `
            <h4 style="margin: 0 0 15px 0; color: #3498db;">🎛️ Channel Controls:</h4>
            <div style="text-align: center;">
                <!-- Channel Selection -->
                <div style="margin-bottom: 20px; text-align: left;">
                    <h5 style="color: #ecf0f1; margin: 0 0 10px 0;">Select Audio Channels:</h5>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <label style="display: flex; align-items: center; gap: 5px; color: #ecf0f1; cursor: pointer;">
                            <input type="checkbox" id="channel-1" style="margin: 0;"> Channel 1 (Vocals)
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px; color: #ecf0f1; cursor: pointer;">
                            <input type="checkbox" id="channel-2" style="margin: 0;"> Channel 2 (Music)
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px; color: #ecf0f1; cursor: pointer;">
                            <input type="checkbox" id="channel-3" style="margin: 0;"> Channel 3 (Effects)
                        </label>
                    </div>
                </div>

                <!-- Channel Controls -->
                <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 20px;">
                    <button id="route-audio-btn" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">🎛️ Route Audio</button>
                    <button id="clear-routing-btn" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">🗑️ Clear Routing</button>
                </div>

                <!-- Channel Status Display -->
                <div id="channel-status" style="margin-top: 15px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 5px; min-height: 40px;">
                    <div style="color: #ecf0f1; font-size: 14px;">Select channels and click "Route Audio" to test routing</div>
                </div>
            </div>
        `;
    }

    /**
     * Show completion message
     */
    showCompletionMessage() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: #2c3e50;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            color: white;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;

        content.innerHTML = `
            <h2 style="color: #27ae60; margin-bottom: 20px;">🎉 All Challenges Completed!</h2>
            <p style="color: #ecf0f1; margin-bottom: 30px; font-size: 16px;">You have successfully tested your audio setup!</p>
            <button id="close-completion" style="background: #3498db; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 16px;">Close</button>
        `;

        content.querySelector('#close-completion').onclick = () => modal.remove();

        modal.appendChild(content);
        document.body.appendChild(modal);
    }



    /**
     * Generate challenge-specific controls
     */
    generateChallengeControls(challenge) {
        switch (challenge.type) {
            case 'microphone-test':
                return `
                    <div class="mic-test-controls">
                        <div class="mic-status">
                            <span>Microphone Status: </span>
                            <span id="mic-status" class="status-indicator">Ready</span>
                        </div>
                        <div class="mic-controls">
                            <button id="mute-mic-btn" class="control-btn">Mute Microphone</button>
                            <button id="unmute-mic-btn" class="control-btn">Unmute Microphone</button>
                        </div>
                        <div class="audio-visualizer" id="audio-visualizer">
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                        </div>
                    </div>
                `;
            case 'speaker-test':
                return `
                    <div class="speaker-test-controls">
                        <div class="speaker-selection">
                            <h4>Select Speakers to Test:</h4>
                            <div id="speaker-list" class="speaker-list"></div>
                        </div>
                        <div class="audio-controls">
                            <button id="play-test-audio-btn" class="control-btn">Play Test Audio</button>
                            <button id="stop-test-audio-btn" class="control-btn">Stop Audio</button>
                        </div>
                        <div class="volume-control">
                            <label>Volume: <span id="volume-display">50%</span></label>
                            <input type="range" id="volume-slider" min="0" max="100" value="50">
                        </div>
                    </div>
                `;
            case 'channel-test':
                return `
                    <div class="channel-test-controls">
                        <div class="channel-selection">
                            <h4>Select Audio Channels:</h4>
                            <div id="channel-list" class="channel-list"></div>
                        </div>
                        <div class="channel-controls">
                            <button id="route-audio-btn" class="control-btn">Route Audio</button>
                            <button id="clear-routing-btn" class="control-btn">Clear Routing</button>
                        </div>
                        <div class="channel-status" id="channel-status"></div>
                    </div>
                `;
            default:
                return '<p>Challenge controls will be generated here.</p>';
        }
    }

    /**
     * Test current challenge
     */
    testCurrentChallenge() {
        const challenge = this.currentChallenge;
        const feedback = document.getElementById('challenge-feedback');

        switch (challenge.type) {
            case 'microphone-test':
                this.testMicrophoneChallenge(feedback);
                break;
            case 'speaker-test':
                this.testSpeakerChallenge(feedback);
                break;
            case 'channel-test':
                this.testChannelChallenge(feedback);
                break;
            default:
                feedback.innerHTML = '<p class="feedback-info">Testing challenge...</p>';
        }
    }

    /**
     * Test microphone challenge
     */
    testMicrophoneChallenge(feedback) {
        const muteBtn = document.getElementById('mute-mic-btn');
        const unmuteBtn = document.getElementById('unmute-mic-btn');
        const micStatus = document.getElementById('mic-status');
        const visualizer = document.getElementById('audio-visualizer');

        let isMuted = false;
        let testPassed = false;

        // Simulate microphone testing
        muteBtn.addEventListener('click', () => {
            isMuted = true;
            micStatus.textContent = 'Muted';
            micStatus.className = 'status-indicator muted';
            visualizer.style.display = 'none';
        });

        unmuteBtn.addEventListener('click', () => {
            isMuted = false;
            micStatus.textContent = 'Active';
            micStatus.className = 'status-indicator active';
            visualizer.style.display = 'flex';
        });

        // Simulate audio input detection
        setTimeout(() => {
            if (isMuted) {
                feedback.innerHTML = `
                    <div class="feedback-success">
                        <i class="fas fa-check-circle"></i>
                        <p>Perfect! Microphone is muted and no audio is detected.</p>
                    </div>
                `;
                testPassed = true;
            } else {
                feedback.innerHTML = `
                    <div class="feedback-error">
                        <i class="fas fa-times-circle"></i>
                        <p>Audio detected! Try muting the microphone first.</p>
                    </div>
                `;
            }
            this.showNextChallengeButton(testPassed);
        }, 2000);
    }

    /**
     * Test speaker challenge
     */
    testSpeakerChallenge(feedback) {
        const speakerList = document.getElementById('speaker-list');
        const playBtn = document.getElementById('play-test-audio-btn');
        const stopBtn = document.getElementById('stop-test-audio-btn');
        const volumeSlider = document.getElementById('volume-slider');
        const volumeDisplay = document.getElementById('volume-display');

        let isPlaying = false;
        let selectedSpeakers = [];

        // Generate speaker list
        const speakers = this.getEquipmentByType('speaker');
        speakerList.innerHTML = speakers.map(speaker => `
            <div class="speaker-item">
                <input type="checkbox" id="speaker-${speaker.id}" data-speaker-id="${speaker.id}">
                <label for="speaker-${speaker.id}">${speaker.name}</label>
            </div>
        `).join('');

        // Handle speaker selection
        speakerList.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const speakerId = e.target.dataset.speakerId;
                if (e.target.checked) {
                    selectedSpeakers.push(speakerId);
                } else {
                    selectedSpeakers = selectedSpeakers.filter(id => id !== speakerId);
                }
            }
        });

        // Handle volume control
        volumeSlider.addEventListener('input', (e) => {
            volumeDisplay.textContent = `${e.target.value}%`;
        });

        // Handle play/stop
        playBtn.addEventListener('click', () => {
            if (selectedSpeakers.length === 0) {
                feedback.innerHTML = '<p class="feedback-error">Please select at least one speaker.</p>';
                return;
            }

            isPlaying = true;
            this.simulateSpeakerAudio(selectedSpeakers, volumeSlider.value);
            feedback.innerHTML = `
                <div class="feedback-success">
                    <i class="fas fa-check-circle"></i>
                    <p>Audio playing through selected speakers! Check the speaker colors.</p>
                </div>
            `;
            this.showNextChallengeButton(true);
        });

        stopBtn.addEventListener('click', () => {
            isPlaying = false;
            this.stopSpeakerAudio();
            feedback.innerHTML = '<p class="feedback-info">Audio stopped.</p>';
        });
    }

    /**
     * Test channel challenge
     */
    testChannelChallenge(feedback) {
        const channelList = document.getElementById('channel-list');
        const routeBtn = document.getElementById('route-audio-btn');
        const clearBtn = document.getElementById('clear-routing-btn');
        const channelStatus = document.getElementById('channel-status');

        let routedChannels = [];

        // Generate channel list
        const channels = this.getAudioChannels();
        channelList.innerHTML = channels.map(channel => `
            <div class="channel-item">
                <input type="checkbox" id="channel-${channel.id}" data-channel-id="${channel.id}">
                <label for="channel-${channel.id}">${channel.name}</label>
            </div>
        `).join('');

        // Handle channel routing
        routeBtn.addEventListener('click', () => {
            const selectedChannels = Array.from(channelList.querySelectorAll('input:checked'))
                .map(input => input.dataset.channelId);

            if (selectedChannels.length === 0) {
                feedback.innerHTML = '<p class="feedback-error">Please select at least one channel.</p>';
                return;
            }

            routedChannels = selectedChannels;
            this.simulateChannelRouting(selectedChannels);

            channelStatus.innerHTML = `
                <div class="channel-status-success">
                    <i class="fas fa-check-circle"></i>
                    <p>Audio routed to: ${selectedChannels.join(', ')}</p>
                </div>
            `;

            feedback.innerHTML = `
                <div class="feedback-success">
                    <i class="fas fa-check-circle"></i>
                    <p>Channel routing successful! Audio is now controlled.</p>
                </div>
            `;
            this.showNextChallengeButton(true);
        });

        clearBtn.addEventListener('click', () => {
            routedChannels = [];
            this.clearChannelRouting();
            channelStatus.innerHTML = '<p>Routing cleared.</p>';
            feedback.innerHTML = '<p class="feedback-info">Channel routing cleared.</p>';
        });
    }

    /**
     * Show next challenge button
     */
    showNextChallengeButton(passed) {
        const nextBtn = document.querySelector('#next-challenge-btn');
        const testBtn = document.querySelector('#test-challenge-btn');

        if (passed) {
            this.testingResults.push({
                challenge: this.currentChallenge,
                passed: true,
                timestamp: Date.now()
            });
        }

        testBtn.style.display = 'none';
        nextBtn.style.display = 'block';
    }

    /**
     * Complete testing challenges
     */
    completeTestingChallenges() {
        const passedCount = this.testingResults.filter(result => result.passed).length;
        const totalCount = this.currentTestingChallenges.length;

        const completionModal = document.createElement('div');
        completionModal.className = 'testing-completion-modal';
        completionModal.innerHTML = `
            <div class="completion-content">
                <h2>🎯 Testing Complete!</h2>
                <div class="completion-stats">
                    <p>Challenges Passed: ${passedCount}/${totalCount}</p>
                    <p>Success Rate: ${Math.round((passedCount / totalCount) * 100)}%</p>
                </div>
                <div class="completion-results">
                    ${this.testingResults.map(result => `
                        <div class="result-item ${result.passed ? 'passed' : 'failed'}">
                            <i class="fas ${result.passed ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            <span>${result.challenge.title}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="completion-buttons">
                    <button id="continue-btn" class="primary-btn">Continue</button>
                </div>
            </div>
        `;

        document.body.appendChild(completionModal);

        completionModal.querySelector('#continue-btn').addEventListener('click', () => {
            document.body.removeChild(completionModal);
            // Return to level complete screen and hide the testing button since it's been completed
            const testingBtn = document.getElementById('testing-challenge-btn');
            if (testingBtn) {
                testingBtn.style.display = 'none';
            }
        });
    }

    /**
     * Get equipment by type
     */
    getEquipmentByType(type) {
        return this.equipment.filter(item => item.type === type);
    }

    /**
     * Get audio channels
     */
    getAudioChannels() {
        return [
            { id: 'main', name: 'Main Output' },
            { id: 'aux1', name: 'Auxiliary 1' },
            { id: 'aux2', name: 'Auxiliary 2' },
            { id: 'monitor', name: 'Monitor Mix' },
            { id: 'sub', name: 'Subwoofer' }
        ];
    }

    /**
     * Simulate speaker audio
     */
    simulateSpeakerAudio(speakerIds, volume) {
        speakerIds.forEach(speakerId => {
            const speakerElement = document.querySelector(`[data-equipment-id="${speakerId}"]`);
            if (speakerElement) {
                speakerElement.style.animation = 'speaker-pulse 0.5s infinite';
                speakerElement.style.filter = `brightness(${1 + (volume / 100) * 0.5})`;
            }
        });
    }

    /**
     * Stop speaker audio
     */
    stopSpeakerAudio() {
        const speakers = document.querySelectorAll('[data-equipment-id]');
        speakers.forEach(speaker => {
            speaker.style.animation = '';
            speaker.style.filter = '';
        });
    }

    /**
     * Simulate channel routing
     */
    simulateChannelRouting(channelIds) {
        // Visual feedback for channel routing
        channelIds.forEach(channelId => {
            const channelElement = document.querySelector(`[data-channel="${channelId}"]`);
            if (channelElement) {
                channelElement.classList.add('channel-active');
            }
        });
    }

    /**
     * Clear channel routing
     */
    clearChannelRouting() {
        const channels = document.querySelectorAll('[data-channel]');
        channels.forEach(channel => {
            channel.classList.remove('channel-active');
        });
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
        // Canvas is now responsive - no need to set fixed dimensions
        // stageArea.style.width = (levelData.stageSetup?.width || 1000) + 'px';
        // stageArea.style.height = (levelData.stageSetup?.height || 800) + 'px';

        // Add stage zones if defined
        if (levelData.stageSetup?.zones) {
            levelData.stageSetup.zones.forEach(zone => {
                const zoneEl = document.createElement('div');
                zoneEl.className = 'stage-zone';
                zoneEl.style.left = zone.x;
                zoneEl.style.top = zone.y;
                zoneEl.style.width = zone.width;
                zoneEl.style.height = zone.height;
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

        // Generate unique ID for this equipment instance
        const uniqueId = generateId();
        equipmentElement.dataset.uniqueId = uniqueId;

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
            <div class="equipment-resource" title="Click to assign resource">
                <i class="fas fa-user-plus"></i>
            </div>
            ${this.createConnectorsHTML(equipmentData.connectors)}
        `;

            // Ensure connectors are properly initialized with unique identifiers
            const connectors = equipmentElement.querySelectorAll('.connector');
            connectors.forEach((connector, index) => {
                // Ensure connector is properly initialized
                connector.style.pointerEvents = 'auto';
                connector.classList.remove('disabled', 'inactive', 'hovered');

                // Add unique connector identifier using the connector key
                const connectorKey = connector.dataset.connectorKey;
                connector.dataset.connectorId = `${uniqueId}-${connectorKey}`;
                connector.dataset.equipmentId = uniqueId;

                // Ensure stable positioning - let CSS handle transforms
                connector.classList.remove('selected');

                // Force a reflow to ensure proper rendering
                connector.offsetHeight;

                console.log(`🔧 Initialized connector ${index}: ${connector.dataset.type} (${connector.dataset.connectorId})`);
            });

            // Add equipment info click handler
            const helpBtn = equipmentElement.querySelector('.equipment-help');
            if (helpBtn) {
                helpBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEquipmentInfo(equipmentType, equipmentName, uniqueId);
                });
            }

            // Add right-click handler for resource assignment
            const resourceBtn = equipmentElement.querySelector('.equipment-resource');
            if (resourceBtn) {
                // Right-click (context menu) event
                resourceBtn.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('👥 Right-click detected on resource button');
                    this.showResourceMenu(e, equipmentType, equipmentElement, uniqueId);
                });

                // Also add regular click as fallback for testing
                resourceBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('👥 Click detected on resource button (fallback)');
                    this.showResourceMenu(e, equipmentType, equipmentElement, uniqueId);
                });
            }

            // Add double-click handler for equipment settings
            equipmentElement.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.showEquipmentSettings(equipmentType, equipmentName, equipmentElement, uniqueId);
            });

            // Make equipment draggable
            this.makeEquipmentDraggable(equipmentElement);

            // Add to equipment array
            this.equipment.push({
                element: equipmentElement,
                type: equipmentType,
                name: equipmentName,
                uniqueId: uniqueId,
                data: equipmentData
            });

            stageArea.appendChild(equipmentElement);

            // Remove the equipment from the toolbar after placement
            if (toolElement && toolElement.parentNode) {
                toolElement.parentNode.removeChild(toolElement);
            }
        }
    }

    /**
     * Create connectors HTML
     */
    createConnectorsHTML(connectors) {
        if (!connectors || connectors.length === 0) return '';

        return connectors.map((connector, index) => {
            const color = getConnectorColor(connector.type);
            // Create a unique connector identifier based on type, label, and index
            const connectorKey = `${connector.type}-${connector.label.replace(/\s+/g, '-')}-${index}`;
            return `
                <div class="connector ${connector.position}" 
                     data-type="${connector.type}" 
                     data-position="${connector.position}"
                     data-connector-index="${index}"
                     data-connector-key="${connectorKey}">
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
        // Verify we have the correct equipment and connector with unique IDs
        const equipmentId = equipment.dataset.uniqueId;
        const connectorId = connector.dataset.connectorId;

        console.log('🔌 Connector click debug info:');
        console.log('  - Connector element:', connector);
        console.log('  - Equipment element:', equipment);
        console.log('  - Connector type:', connector.dataset.type);
        console.log('  - Connector position:', connector.dataset.position);
        console.log('  - Connector key:', connector.dataset.connectorKey);
        console.log('  - Equipment ID:', equipmentId);
        console.log('  - Connector ID:', connectorId);

        if (!equipmentId || !connectorId) {
            console.error('❌ Missing unique identifiers:', { equipmentId, connectorId });
            return;
        }

        console.log(`🔌 Connector clicked: ${connector.dataset.type} (${connectorId})`);
        console.log(`🔌 Equipment: ${equipment.dataset.name} (${equipmentId})`);
        console.log(`🔌 Connection mode: ${this.connectionMode}`);

        // Ensure connector is properly initialized
        connector.style.pointerEvents = 'auto';
        connector.classList.remove('disabled', 'inactive');

        if (this.connectionMode && this.selectedConnector) {
            // Don't allow connecting to the same connector
            if (this.selectedConnector.connectorId === connectorId) {
                console.log('🔌 Cannot connect to the same connector');
                this.connectionMode = false;
                this.selectedConnector = null;
                this.resetConnectorStates();
                return;
            }

            // Create connection using unique identifiers
            this.createConnection(this.selectedConnector, {
                connector,
                equipment,
                connectorId,
                equipmentId
            });
            this.connectionMode = false;
            this.selectedConnector = null;
            this.resetConnectorStates();
        } else {
            // Start connection mode with unique identifiers
            this.connectionMode = true;
            this.selectedConnector = {
                connector,
                equipment,
                connectorId,
                equipmentId
            };
            connector.classList.add('selected');
            console.log('🔌 Started connection mode with:', connector.dataset.type, connectorId);
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
        // Count how many connections this connector has using unique connector IDs
        const connectionCount = this.connections.filter(conn => {
            const connectorId = connector.dataset.connectorId;

            return (conn.fromConnectorId === connectorId) || (conn.toConnectorId === connectorId);
        }).length;

        console.log(`🔌 Updating connector visual state: ${connector.dataset.type} (${connector.dataset.connectorId}) has ${connectionCount} connections`);

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

        // Instead of cloning and replacing, just refresh the existing connectors
        this.equipment.forEach(equipmentData => {
            if (equipmentData.element) {
                const connectors = equipmentData.element.querySelectorAll('.connector');
                connectors.forEach((connector, index) => {
                    // Preserve unique identifiers and just refresh the state
                    const connectorId = connector.dataset.connectorId;
                    const equipmentId = connector.dataset.equipmentId;
                    const connectorKey = connector.dataset.connectorKey;

                    // Ensure proper initialization without destroying unique IDs
                    connector.style.pointerEvents = 'auto';
                    connector.classList.remove('disabled', 'inactive', 'hovered');
                    connector.classList.remove('selected');

                    // Re-apply unique identifiers if they were lost
                    if (!connector.dataset.connectorId && connectorId) {
                        connector.dataset.connectorId = connectorId;
                    }
                    if (!connector.dataset.equipmentId && equipmentId) {
                        connector.dataset.equipmentId = equipmentId;
                    }
                    if (!connector.dataset.connectorKey && connectorKey) {
                        connector.dataset.connectorKey = connectorKey;
                    }

                    // Update visual state
                    this.updateConnectorVisualState(connector);

                    console.log(`🔧 Refreshed connector ${index + 1}: ${connector.dataset.type} (${connector.dataset.connectorId})`);
                });
            }
        });

        // Re-setup connector event listeners
        this.setupConnectorEventListeners();

        console.log('✅ Force refresh complete');
    }

    /**
     * Setup connector event listeners using event delegation
     */
    setupConnectorEventListeners() {
        // Clean up any existing event listeners
        this.cleanupConnectorEventListeners();

        // Remove any existing event delegation listener
        const stageArea = document.getElementById('stage-area');
        if (stageArea) {
            if (this.handleStageClick) {
                stageArea.removeEventListener('click', this.handleStageClick);
            }

            // Add event delegation listener to stage area
            this.handleStageClick = (e) => {
                const connector = e.target.closest('.connector');
                if (connector) {
                    e.preventDefault();
                    e.stopPropagation();
                    const equipment = connector.closest('.equipment');
                    if (equipment) {
                        console.log('🔌 Connector clicked via delegation:', connector.dataset.type);
                        console.log('🔌 Connector position:', connector.dataset.position);
                        console.log('🔌 Connector ID:', connector.dataset.connectorId);
                        console.log('🔌 Equipment:', equipment.dataset.name, equipment.dataset.uniqueId);
                        console.log('🔌 Click target:', e.target.tagName, e.target.className);
                        this.handleConnectorClick(connector, equipment);
                    }
                }
            };

            stageArea.addEventListener('click', this.handleStageClick);
        }

        // Remove JavaScript hover effects - use CSS-only hover for stability
        // This prevents flickering and ensures click events work properly
    }

    /**
     * Clean up connector event listeners
     */
    cleanupConnectorEventListeners() {
        const stageArea = document.getElementById('stage-area');
        if (stageArea) {
            if (this.handleStageClick) {
                stageArea.removeEventListener('click', this.handleStageClick);
                this.handleStageClick = null;
            }
            if (this.mouseMoveThrottle) {
                cancelAnimationFrame(this.mouseMoveThrottle);
                this.mouseMoveThrottle = null;
            }
        }
    }

    /**
 * Refresh XLR connectors - now uses universal connector refresh
 */
    refreshXLRConnectors() {
        console.log('🔧 Refreshing XLR connectors using universal method...');
        this.forceRefreshConnectors();
    }

    /**
     * Debug all connectors on equipment
     */
    debugEquipmentConnectors(equipment) {
        console.log('🔍 Debugging all connectors on equipment:', equipment.dataset.name);
        const connectors = equipment.querySelectorAll('.connector');
        console.log(`🔍 Found ${connectors.length} connectors:`);

        connectors.forEach((connector, index) => {
            const rect = connector.getBoundingClientRect();
            console.log(`  ${index + 1}. ${connector.dataset.type} (${connector.dataset.position})`);
            console.log(`     Position: ${rect.left}, ${rect.top}, ${rect.width}x${rect.height}`);
            console.log(`     Z-index: ${window.getComputedStyle(connector).zIndex}`);
            console.log(`     Pointer-events: ${window.getComputedStyle(connector).pointerEvents}`);
            console.log(`     Display: ${window.getComputedStyle(connector).display}`);
            console.log(`     Visibility: ${window.getComputedStyle(connector).visibility}`);
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

        // Additional debugging for connector state
        console.log('🔍 Connector state:');
        console.log('  - Pointer events:', window.getComputedStyle(connector).pointerEvents);
        console.log('  - Z-index:', window.getComputedStyle(connector).zIndex);
        console.log('  - Display:', window.getComputedStyle(connector).display);
        console.log('  - Visibility:', window.getComputedStyle(connector).visibility);
        console.log('  - Connector ID:', connector.dataset.connectorId);
        console.log('  - Equipment ID:', connector.dataset.equipmentId);
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
        // Store connection with unique equipment IDs and connector IDs
        const connectionData = {
            id: generateId(),
            fromEquipmentId: from.equipment.dataset.uniqueId,
            fromEquipmentName: from.equipment.dataset.name,
            fromEquipmentType: from.equipment.dataset.type,
            fromConnectorId: from.connector.dataset.connectorId,
            fromConnectorType: from.connector.dataset.type,
            toEquipmentId: to.equipment.dataset.uniqueId,
            toEquipmentName: to.equipment.dataset.name,
            toEquipmentType: to.equipment.dataset.type,
            toConnectorId: to.connector.dataset.connectorId,
            toConnectorType: to.connector.dataset.type,
            cableType: validConnection.cable,
            animation: validConnection.animation,
            line: null,
            fromCoords: null,
            toCoords: null
        };

        // Check for duplicate connections before adding
        const isDuplicate = this.connections.some(existingConn =>
            (existingConn.fromConnectorId === connectionData.fromConnectorId &&
                existingConn.toConnectorId === connectionData.toConnectorId) ||
            (existingConn.fromConnectorId === connectionData.toConnectorId &&
                existingConn.toConnectorId === connectionData.fromConnectorId)
        );

        if (isDuplicate) {
            console.warn('⚠️ Duplicate connection detected, not adding:', connectionData);
            this.showMessage('Connection already exists!', 'warning');

            // Don't draw any visual line for duplicate connections
            console.log('🚫 Skipping visual line creation for duplicate connection');
            return;
        }

        // Calculate and store coordinates immediately
        const fromCoords = this.getConnectorCoordinates(from.connector);
        const toCoords = this.getConnectorCoordinates(to.connector);

        if (fromCoords && toCoords) {
            connectionData.fromCoords = fromCoords;
            connectionData.toCoords = toCoords;

            // Create the connection line
            connectionData.line = this.drawConnectionLineWithCoordinates(fromCoords, toCoords, getConnectorColor(from.connector.dataset.type));
        }

        this.connections.push(connectionData);
        console.log('🔗 Connection stored:', connectionData);
        console.log('🔗 Total connections:', this.connections.length);

        // Increment score for successful connection
        this.gameState.score += 100;
        this.updatePlayerStats();
        console.log('🎯 Score increased to:', this.gameState.score);

        // Update progress and check completion IMMEDIATELY
        console.log('📊 Updating connection progress...');
        this.updateConnectionProgress();
        console.log('🔍 Checking level completion immediately...');
        this.checkLevelCompletion();

        // Debug: Verify visual lines match connections
        const visualLines = document.querySelectorAll('.connection-line');
        console.log('🎨 Visual connection lines count:', visualLines.length);
        console.log('🔗 Stored connections count:', this.connections.length);

        if (visualLines.length !== this.connections.length) {
            console.warn('⚠️ Mismatch between visual lines and stored connections!');
            console.warn('⚠️ Visual lines:', visualLines.length, 'Stored connections:', this.connections.length);
        }

        // Apply animation (non-blocking)
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
 * Find connector element by equipment unique ID and connector type
 */
    findConnectorElement(equipmentId, connectorType) {
        const equipment = document.querySelector(`[data-unique-id="${equipmentId}"]`);
        if (!equipment) return null;

        return equipment.querySelector(`[data-type="${connectorType}"]`);
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
        this.connectionProgress.usb.required = required.usb;

        // Count current connections with safeguards
        const powerCount = this.connections.filter(c => c.cableType === 'power-cable').length;
        const xlrCount = this.connections.filter(c => c.cableType === 'xlr-cable').length;
        const wirelessCount = this.connections.filter(c => c.cableType === 'wireless-cable').length;
        const ethernetCount = this.connections.filter(c => c.cableType === 'ethernet-cable').length;
        const dmxCount = this.connections.filter(c => c.cableType === 'dmx-cable').length;
        const hdmiCount = this.connections.filter(c => c.cableType === 'hdmi-cable').length;
        const usbCount = this.connections.filter(c => c.cableType === 'usb-cable').length;

        // Apply safeguards to prevent counts from exceeding requirements
        this.connectionProgress.power.current = Math.min(powerCount, required.power);
        this.connectionProgress.xlr.current = Math.min(xlrCount, required.xlr);
        this.connectionProgress.wireless.current = Math.min(wirelessCount, required.wireless);
        this.connectionProgress.ethernet.current = Math.min(ethernetCount, required.ethernet);
        this.connectionProgress.dmx.current = Math.min(dmxCount, required.dmx);
        this.connectionProgress.hdmi.current = Math.min(hdmiCount, required.hdmi);
        this.connectionProgress.usb.current = Math.min(usbCount, required.usb);

        // Debug: Log if counts exceed requirements
        if (powerCount > required.power) console.warn(`⚠️ Power count (${powerCount}) exceeds requirement (${required.power})`);
        if (xlrCount > required.xlr) console.warn(`⚠️ XLR count (${xlrCount}) exceeds requirement (${required.xlr})`);
        if (wirelessCount > required.wireless) console.warn(`⚠️ Wireless count (${wirelessCount}) exceeds requirement (${required.wireless})`);
        if (ethernetCount > required.ethernet) console.warn(`⚠️ Ethernet count (${ethernetCount}) exceeds requirement (${required.ethernet})`);
        if (dmxCount > required.dmx) console.warn(`⚠️ DMX count (${dmxCount}) exceeds requirement (${required.dmx})`);
        if (hdmiCount > required.hdmi) console.warn(`⚠️ HDMI count (${hdmiCount}) exceeds requirement (${required.hdmi})`);
        if (usbCount > required.usb) console.warn(`⚠️ USB count (${usbCount}) exceeds requirement (${required.usb})`);

        // Clean up orphaned visual lines that don't correspond to actual connections
        this.cleanupOrphanedVisualLines();

        // Debug: Log all connections and their types
        console.log('🔍 All connections:', this.connections);
        console.log('🔍 Connection types found:', [...new Set(this.connections.map(c => c.cableType))]);
        console.log('🔍 Required connections:', required);
        console.log('🔍 Current progress:', this.connectionProgress);

        console.log('🔍 CONNECTION COUNTS:', {
            power: powerCount,
            xlr: xlrCount,
            wireless: wirelessCount,
            ethernet: ethernetCount,
            dmx: dmxCount,
            hdmi: hdmiCount,
            usb: usbCount
        });

        this.updateProgressUI();
    }

    /**
     * Clean up orphaned visual lines that don't correspond to actual connections
     */
    cleanupOrphanedVisualLines() {
        const visualLines = document.querySelectorAll('.connection-line');
        const storedConnections = this.connections.length;

        console.log('🧹 Cleaning up orphaned visual lines...');
        console.log('🧹 Visual lines found:', visualLines.length);
        console.log('🧹 Stored connections:', storedConnections);

        if (visualLines.length > storedConnections) {
            console.warn('🧹 Found orphaned visual lines, cleaning up...');

            // Remove excess visual lines (keep only the first ones that match stored connections)
            const linesToRemove = visualLines.length - storedConnections;
            for (let i = 0; i < linesToRemove; i++) {
                const lastLine = visualLines[visualLines.length - 1 - i];
                if (lastLine && lastLine.parentNode) {
                    console.log('🧹 Removing orphaned visual line:', lastLine);
                    lastLine.parentNode.removeChild(lastLine);
                }
            }

            console.log('🧹 Cleanup complete. Visual lines now match stored connections.');
        }
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
        // Prevent multiple completion triggers
        if (this.levelCompleted) {
            return;
        }

        // Simple check: are all required connections made?
        const allComplete = Object.values(this.connectionProgress).every(progress =>
            progress.current >= progress.required
        );

        if (allComplete) {
            console.log('🎉 LEVEL COMPLETE! Triggering celebration...');
            this.levelCompleted = true;

            // Close any open dialogs
            this.closeCableSelectionDialog();

            // Stop game timer
            this.stopGameTimer();

            // Play victory sound
            this.playVictorySound();

            // Start confetti
            this.startConfetti();

            // Show winner popup
            this.showWinnerCelebration();

            // Mark level as completed and add bonus score
            if (!this.gameState.completedLevels.includes(this.currentLevel)) {
                this.gameState.completedLevels.push(this.currentLevel);

                // Add bonus score for completing the level
                const timeBonus = Math.max(0, 300 - this.gameState.time) * 2; // Time bonus (faster = more points)
                const completionBonus = 500; // Base completion bonus
                const totalBonus = timeBonus + completionBonus;

                this.gameState.score += totalBonus;
                this.updatePlayerStats();

                console.log('🎯 Level completion bonus:', {
                    timeBonus: timeBonus,
                    completionBonus: completionBonus,
                    totalBonus: totalBonus,
                    finalScore: this.gameState.score
                });

                this.saveToStorage();
            }

            // Unlock next level
            this.unlockNextLevel();
        }
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
     * Show winner celebration overlay popup
     */
    showWinnerCelebration() {
        console.log('🎉 Creating winner celebration overlay popup');

        // Create overlay popup
        const celebration = document.createElement('div');
        celebration.className = 'winner-celebration-overlay';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-header">
                    <i class="fas fa-trophy"></i>
                    <h2>Level Complete!</h2>
                </div>
                
                <div class="celebration-stats">
                    <div class="stat">
                        <span class="label">Score</span>
                        <span class="value">${this.gameState.score}</span>
                </div>
                    <div class="stat">
                        <span class="label">Time</span>
                        <span class="value">${this.formatTime(this.gameState.time)}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Stars</span>
                        <span class="value">${Math.min(3, Math.floor(this.gameState.score / 100))}</span>
                    </div>
                </div>

                <div class="celebration-buttons">
                    <button id="next-level-btn" class="menu-btn primary">
                        <i class="fas fa-arrow-right"></i>
                        Next Level
                    </button>
                    <button id="testing-challenge-btn" class="menu-btn testing" style="display: none;">
                        <i class="fas fa-flask"></i>
                        Test Setup
                    </button>
                    <button id="replay-level-btn" class="menu-btn secondary">
                        <i class="fas fa-redo"></i>
                        Replay Level
                    </button>
                    <button id="level-select-btn" class="menu-btn secondary">
                        <i class="fas fa-list"></i>
                        Level Select
                    </button>
                </div>
            </div>
        `;

        // Add to body
        document.body.appendChild(celebration);

        // Show testing challenge button if available
        const testingBtn = celebration.querySelector('#testing-challenge-btn');
        if (testingBtn && this.hasTestingChallenges()) {
            testingBtn.style.display = 'block';
            console.log('🔬 Testing challenge button shown in overlay');
        }

        // Add event listeners
        const nextLevelBtn = celebration.querySelector('#next-level-btn');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                console.log('🎯 Next level button clicked');
                try {
                    this.nextLevel();
                    console.log('🎯 Next level method completed successfully');
                } catch (error) {
                    console.error('❌ Error in nextLevel():', error);
                }

                try {
                    document.body.removeChild(celebration);
                    console.log('🎯 Celebration popup removed successfully');
                } catch (error) {
                    console.error('❌ Error removing celebration popup:', error);
                }
            });
            console.log('🎯 Next level button event listener added');
        } else {
            console.error('❌ Next level button not found in celebration popup');
        }

        if (testingBtn) {
            testingBtn.addEventListener('click', () => {
                console.log('🔬 Testing challenge button clicked from overlay');
                this.startTestingChallenges();
                document.body.removeChild(celebration);
            });
        }

        const replayBtn = celebration.querySelector('#replay-level-btn');
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                console.log('🔄 Replay level button clicked');
                this.restartLevel();
                document.body.removeChild(celebration);
            });
        }

        const levelSelectBtn = celebration.querySelector('#level-select-btn');
        if (levelSelectBtn) {
            levelSelectBtn.addEventListener('click', () => {
                console.log('📋 Level select button clicked');
                this.exitToMenu();
                document.body.removeChild(celebration);
            });
        }

        console.log('🎉 Winner celebration overlay popup created and displayed');
    }

    /**
     * Show equipment information
     */
    showEquipmentInfo(equipmentType, equipmentName, uniqueId = null) {
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
    showEquipmentSettings(equipmentType, equipmentName, equipmentElement, uniqueId = null) {
        console.log('⚙️ Showing equipment settings for:', equipmentType, equipmentName);

        // Notify AI Tutor about the selected equipment
        if (this.aiTutor) {
            this.aiTutor.setCurrentEquipment({
                type: equipmentType,
                name: equipmentName,
                element: equipmentElement,
                uniqueId: uniqueId
            }).catch(error => {
                console.error('🤖 Error setting current equipment:', error);
            });
        }

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
        // Don't process game shortcuts if user is typing in an input field
        const activeElement = document.activeElement;
        const isTyping = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true' ||
            activeElement.id === 'ai-chat-input-field'
        );

        if (isTyping) {
            return; // Don't process game shortcuts when typing
        }

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
            case 'x':
                if (this.currentScreen === 'game') {
                    console.log('🔧 Refreshing XLR connectors (X key pressed)');
                    this.refreshXLRConnectors();
                }
                break;
            case 'e':
                if (this.currentScreen === 'game') {
                    console.log('🔍 Debugging all equipment connectors (E key pressed)');
                    this.equipment.forEach(equipmentData => {
                        if (equipmentData.element) {
                            this.debugEquipmentConnectors(equipmentData.element);
                        }
                    });
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
        // Prevent multiple timers - if timer is already running, don't start another
        if (this.gameTimer) {
            return;
        }

        // Ensure time is initialized
        if (this.gameState.time === undefined || this.gameState.time === null) {
            this.gameState.time = 0;
        }

        // Start the timer immediately
        this.gameTimer = setInterval(() => {
            this.gameState.time++;
            this.updatePlayerStats();
        }, 1000);

        // Force an immediate update
        this.updatePlayerStats();
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
        console.log('🎯 nextLevel() called');
        console.log('🎯 Current level:', this.currentLevel);
        console.log('🎯 Unlocked levels:', this.gameState.unlockedLevels);

        const currentIndex = LEVEL_ORDER.indexOf(this.currentLevel);
        console.log('🎯 Current index in LEVEL_ORDER:', currentIndex);

        if (currentIndex >= 0 && currentIndex < LEVEL_ORDER.length - 1) {
            const nextLevel = LEVEL_ORDER[currentIndex + 1];
            console.log('🎯 Next level found:', nextLevel);

            // Always unlock the next level if it exists
            if (!this.gameState.unlockedLevels.includes(nextLevel)) {
                this.gameState.unlockedLevels.push(nextLevel);
                console.log('🎯 Next level unlocked:', nextLevel);
            }

            // Load the next level
            console.log('🎯 Loading next level:', nextLevel);
            this.loadLevel(nextLevel);
        } else {
            console.log('🎯 No next level available - this is the last level');
            // If this is the last level, go back to level select
            this.showLevelSelect();
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
        if (window.tutorialManager) {
            window.tutorialManager.showTutorial();
        } else {
            this.showMessage('Tutorial system loading...', 'info');
        }
    }

    /**
     * Show settings
     */
    showSettings() {
        this.showMessage('Settings coming soon!', 'info');
    }

    /**
     * Show authentication required modal
     */
    showAuthenticationRequired() {
        console.log('🔐 Showing authentication required message...');

        // Create a modal to inform user they need to login
        const modal = document.createElement('div');
        modal.className = 'auth-required-modal';
        modal.innerHTML = `
            <div class="auth-required-content">
                <div class="auth-required-header">
                    <i class="fas fa-lock" style="color: #ff4757; font-size: 2rem;"></i>
                    <h2>Authentication Required</h2>
                </div>
                <div class="auth-required-body">
                    <p>You need to log in or create an account to start playing AV Master.</p>
                    <p>This helps us save your progress and provide personalized learning experiences.</p>
                </div>
                <div class="auth-required-actions">
                    <button id="auth-login-btn" class="auth-btn primary">
                        <i class="fas fa-sign-in-alt"></i>
                        Login
                    </button>
                    <button id="auth-register-btn" class="auth-btn secondary">
                        <i class="fas fa-user-plus"></i>
                        Create Account
                    </button>
                    <button id="auth-cancel-btn" class="auth-btn cancel">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                </div>
            </div>
        `;

        // Add styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        // Add to page
        document.body.appendChild(modal);

        // Add event listeners
        const loginBtn = modal.querySelector('#auth-login-btn');
        const registerBtn = modal.querySelector('#auth-register-btn');
        const cancelBtn = modal.querySelector('#auth-cancel-btn');

        loginBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            if (window.authManager) {
                window.authManager.showLoginModal();
            }
        });

        registerBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            if (window.authManager) {
                window.authManager.showRegisterModal();
            }
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
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
                // Only merge if saved data is a valid object, but preserve time as 0
                this.gameState = { ...this.gameState, ...saved, time: 0 };
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
            },
            'stage-light': {
                'Front Light': {
                    intensity: { type: 'slider', min: 0, max: 100, value: 80, label: 'Intensity' },
                    color: { type: 'select', options: ['White', 'Warm', 'Cool'], value: 'White', label: 'Color Temperature' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Side Light': {
                    intensity: { type: 'slider', min: 0, max: 100, value: 75, label: 'Intensity' },
                    color: { type: 'select', options: ['White', 'Warm', 'Cool'], value: 'White', label: 'Color Temperature' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'moving-head': {
                'Moving Head Light': {
                    intensity: { type: 'slider', min: 0, max: 100, value: 80, label: 'Intensity' },
                    pan: { type: 'slider', min: 0, max: 360, value: 180, label: 'Pan' },
                    tilt: { type: 'slider', min: -90, max: 90, value: 0, label: 'Tilt' },
                    color: { type: 'select', options: ['White', 'Red', 'Blue', 'Green', 'Yellow'], value: 'White', label: 'Color' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'par-light': {
                'PAR Light': {
                    intensity: { type: 'slider', min: 0, max: 100, value: 75, label: 'Intensity' },
                    color: { type: 'select', options: ['White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple'], value: 'White', label: 'Color' },
                    strobe: { type: 'toggle', value: false, label: 'Strobe' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'dimmer': {
                'Dimmer Pack': {
                    masterFader: { type: 'slider', min: 0, max: 100, value: 80, label: 'Master Fader' },
                    channel1: { type: 'slider', min: 0, max: 100, value: 75, label: 'Channel 1' },
                    channel2: { type: 'slider', min: 0, max: 100, value: 70, label: 'Channel 2' },
                    channel3: { type: 'slider', min: 0, max: 100, value: 65, label: 'Channel 3' },
                    channel4: { type: 'slider', min: 0, max: 100, value: 60, label: 'Channel 4' }
                },
                'Advanced Dimmer': {
                    masterFader: { type: 'slider', min: 0, max: 100, value: 80, label: 'Master Fader' },
                    channel1: { type: 'slider', min: 0, max: 100, value: 75, label: 'Channel 1' },
                    channel2: { type: 'slider', min: 0, max: 100, value: 70, label: 'Channel 2' },
                    channel3: { type: 'slider', min: 0, max: 100, value: 65, label: 'Channel 3' },
                    channel4: { type: 'slider', min: 0, max: 100, value: 60, label: 'Channel 4' },
                    auto: { type: 'toggle', value: false, label: 'Auto Mode' }
                },
                'Professional Dimmer': {
                    masterFader: { type: 'slider', min: 0, max: 100, value: 80, label: 'Master Fader' },
                    channel1: { type: 'slider', min: 0, max: 100, value: 75, label: 'Channel 1' },
                    channel2: { type: 'slider', min: 0, max: 100, value: 70, label: 'Channel 2' },
                    channel3: { type: 'slider', min: 0, max: 100, value: 65, label: 'Channel 3' },
                    channel4: { type: 'slider', min: 0, max: 100, value: 60, label: 'Channel 4' },
                    auto: { type: 'toggle', value: false, label: 'Auto Mode' },
                    dmx: { type: 'toggle', value: true, label: 'DMX Control' }
                }
            },
            'projector': {
                'Video Projector': {
                    brightness: { type: 'slider', min: 0, max: 100, value: 80, label: 'Brightness' },
                    contrast: { type: 'slider', min: 0, max: 100, value: 70, label: 'Contrast' },
                    resolution: { type: 'select', options: ['720p', '1080p', '4K'], value: '1080p', label: 'Resolution' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Main Projector': {
                    brightness: { type: 'slider', min: 0, max: 100, value: 85, label: 'Brightness' },
                    contrast: { type: 'slider', min: 0, max: 100, value: 75, label: 'Contrast' },
                    resolution: { type: 'select', options: ['720p', '1080p', '4K'], value: '1080p', label: 'Resolution' },
                    keystone: { type: 'slider', min: -20, max: 20, value: 0, label: 'Keystone' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Backup Projector': {
                    brightness: { type: 'slider', min: 0, max: 100, value: 80, label: 'Brightness' },
                    contrast: { type: 'slider', min: 0, max: 100, value: 70, label: 'Contrast' },
                    resolution: { type: 'select', options: ['720p', '1080p', '4K'], value: '1080p', label: 'Resolution' },
                    power: { type: 'toggle', value: false, label: 'Power' }
                }
            },
            'screen': {
                'Projection Screen': {
                    position: { type: 'slider', min: 0, max: 100, value: 50, label: 'Position' },
                    angle: { type: 'slider', min: -45, max: 45, value: 0, label: 'Angle' }
                },
                'Video Screen': {
                    brightness: { type: 'slider', min: 0, max: 100, value: 80, label: 'Brightness' },
                    contrast: { type: 'slider', min: 0, max: 100, value: 70, label: 'Contrast' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Professional LED Wall': {
                    brightness: { type: 'slider', min: 0, max: 100, value: 80, label: 'Brightness' },
                    contrast: { type: 'slider', min: 0, max: 100, value: 70, label: 'Contrast' },
                    colorTemp: { type: 'slider', min: 3000, max: 7000, value: 5500, label: 'Color Temp (K)' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Main Screen': {
                    position: { type: 'slider', min: 0, max: 100, value: 50, label: 'Position' },
                    angle: { type: 'slider', min: -45, max: 45, value: 0, label: 'Angle' },
                    tension: { type: 'slider', min: 0, max: 100, value: 75, label: 'Tension' }
                },
                'Monitor Screen': {
                    brightness: { type: 'slider', min: 0, max: 100, value: 80, label: 'Brightness' },
                    contrast: { type: 'slider', min: 0, max: 100, value: 70, label: 'Contrast' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Program Monitor': {
                    brightness: { type: 'slider', min: 0, max: 100, value: 85, label: 'Brightness' },
                    contrast: { type: 'slider', min: 0, max: 100, value: 75, label: 'Contrast' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Preview Monitor': {
                    brightness: { type: 'slider', min: 0, max: 100, value: 80, label: 'Brightness' },
                    contrast: { type: 'slider', min: 0, max: 100, value: 70, label: 'Contrast' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'video-switcher': {
                'Video Switcher': {
                    input1: { type: 'toggle', value: true, label: 'Input 1' },
                    input2: { type: 'toggle', value: false, label: 'Input 2' },
                    output1: { type: 'toggle', value: true, label: 'Output 1' },
                    output2: { type: 'toggle', value: false, label: 'Output 2' },
                    transition: { type: 'select', options: ['Cut', 'Fade', 'Dissolve'], value: 'Cut', label: 'Transition' }
                },
                'Live Video Switcher': {
                    input1: { type: 'toggle', value: true, label: 'Input 1' },
                    input2: { type: 'toggle', value: false, label: 'Input 2' },
                    input3: { type: 'toggle', value: false, label: 'Input 3' },
                    output: { type: 'toggle', value: true, label: 'Output' },
                    transition: { type: 'select', options: ['Cut', 'Fade', 'Dissolve', 'Wipe'], value: 'Cut', label: 'Transition' },
                    effects: { type: 'toggle', value: false, label: 'Effects' }
                },
                'HDMI Switcher': {
                    input1: { type: 'toggle', value: true, label: 'Input 1' },
                    input2: { type: 'toggle', value: false, label: 'Input 2' },
                    output1: { type: 'toggle', value: true, label: 'Output 1' },
                    output2: { type: 'toggle', value: false, label: 'Output 2' },
                    transition: { type: 'select', options: ['Cut', 'Fade'], value: 'Cut', label: 'Transition' }
                },
                'Professional Video Switcher': {
                    input1: { type: 'toggle', value: true, label: 'Input 1' },
                    input2: { type: 'toggle', value: false, label: 'Input 2' },
                    input3: { type: 'toggle', value: false, label: 'Input 3' },
                    graphics: { type: 'toggle', value: false, label: 'Graphics' },
                    vtr: { type: 'toggle', value: false, label: 'VTR' },
                    program: { type: 'toggle', value: true, label: 'Program' },
                    preview: { type: 'toggle', value: false, label: 'Preview' },
                    clean: { type: 'toggle', value: false, label: 'Clean' },
                    transition: { type: 'select', options: ['Cut', 'Fade', 'Dissolve', 'Wipe', 'DVE'], value: 'Cut', label: 'Transition' },
                    effects: { type: 'toggle', value: false, label: 'Effects' }
                }
            },
            'camera': {
                'Video Camera': {
                    focus: { type: 'slider', min: 0, max: 100, value: 50, label: 'Focus' },
                    zoom: { type: 'slider', min: 1, max: 10, value: 1, label: 'Zoom' },
                    iris: { type: 'slider', min: 1, max: 16, value: 8, label: 'Iris' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Main Camera': {
                    focus: { type: 'slider', min: 0, max: 100, value: 60, label: 'Focus' },
                    zoom: { type: 'slider', min: 1, max: 20, value: 1, label: 'Zoom' },
                    iris: { type: 'slider', min: 1, max: 16, value: 8, label: 'Iris' },
                    whiteBalance: { type: 'select', options: ['Auto', '3200K', '5600K', 'Manual'], value: 'Auto', label: 'White Balance' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Wide Shot Camera': {
                    focus: { type: 'slider', min: 0, max: 100, value: 40, label: 'Focus' },
                    zoom: { type: 'slider', min: 1, max: 15, value: 1, label: 'Zoom' },
                    iris: { type: 'slider', min: 1, max: 16, value: 11, label: 'Iris' },
                    whiteBalance: { type: 'select', options: ['Auto', '3200K', '5600K', 'Manual'], value: 'Auto', label: 'White Balance' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Close-up Camera': {
                    focus: { type: 'slider', min: 0, max: 100, value: 80, label: 'Focus' },
                    zoom: { type: 'slider', min: 1, max: 25, value: 5, label: 'Zoom' },
                    iris: { type: 'slider', min: 1, max: 16, value: 5, label: 'Iris' },
                    whiteBalance: { type: 'select', options: ['Auto', '3200K', '5600K', 'Manual'], value: 'Auto', label: 'White Balance' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Studio Camera A': {
                    focus: { type: 'slider', min: 0, max: 100, value: 70, label: 'Focus' },
                    zoom: { type: 'slider', min: 1, max: 30, value: 1, label: 'Zoom' },
                    iris: { type: 'slider', min: 1, max: 16, value: 8, label: 'Iris' },
                    whiteBalance: { type: 'select', options: ['Auto', '3200K', '5600K', 'Manual'], value: 'Auto', label: 'White Balance' },
                    tally: { type: 'toggle', value: false, label: 'Tally Light' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Studio Camera B': {
                    focus: { type: 'slider', min: 0, max: 100, value: 65, label: 'Focus' },
                    zoom: { type: 'slider', min: 1, max: 30, value: 1, label: 'Zoom' },
                    iris: { type: 'slider', min: 1, max: 16, value: 8, label: 'Iris' },
                    whiteBalance: { type: 'select', options: ['Auto', '3200K', '5600K', 'Manual'], value: 'Auto', label: 'White Balance' },
                    tally: { type: 'toggle', value: false, label: 'Tally Light' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Robotic Camera': {
                    focus: { type: 'slider', min: 0, max: 100, value: 60, label: 'Focus' },
                    zoom: { type: 'slider', min: 1, max: 25, value: 1, label: 'Zoom' },
                    pan: { type: 'slider', min: -180, max: 180, value: 0, label: 'Pan' },
                    tilt: { type: 'slider', min: -45, max: 45, value: 0, label: 'Tilt' },
                    whiteBalance: { type: 'select', options: ['Auto', '3200K', '5600K', 'Manual'], value: 'Auto', label: 'White Balance' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'media-player': {
                'Media Player': {
                    volume: { type: 'slider', min: 0, max: 100, value: 75, label: 'Volume' },
                    play: { type: 'toggle', value: false, label: 'Play' },
                    loop: { type: 'toggle', value: false, label: 'Loop' },
                    shuffle: { type: 'toggle', value: false, label: 'Shuffle' }
                },
                'Music Playback': {
                    volume: { type: 'slider', min: 0, max: 100, value: 75, label: 'Volume' },
                    play: { type: 'toggle', value: false, label: 'Play' },
                    loop: { type: 'toggle', value: false, label: 'Loop' },
                    playlist: { type: 'select', options: ['Playlist 1', 'Playlist 2', 'Playlist 3'], value: 'Playlist 1', label: 'Playlist' }
                },
                'Backup Media Player': {
                    volume: { type: 'slider', min: 0, max: 100, value: 75, label: 'Volume' },
                    play: { type: 'toggle', value: false, label: 'Play' },
                    loop: { type: 'toggle', value: false, label: 'Loop' },
                    source: { type: 'select', options: ['USB', 'Network', 'Blu-ray'], value: 'USB', label: 'Source' }
                }
            },
            'playback-device': {
                'Music Playback': {
                    volume: { type: 'slider', min: 0, max: 100, value: 75, label: 'Volume' },
                    play: { type: 'toggle', value: false, label: 'Play' },
                    loop: { type: 'toggle', value: false, label: 'Loop' },
                    playlist: { type: 'select', options: ['Playlist 1', 'Playlist 2', 'Playlist 3'], value: 'Playlist 1', label: 'Playlist' }
                }
            },
            'wireless-transmitter': {
                'Wireless Transmitter': {
                    frequency: { type: 'slider', min: 500, max: 600, value: 550, label: 'Frequency (MHz)' },
                    power: { type: 'slider', min: 0, max: 100, value: 80, label: 'Power' },
                    battery: { type: 'display', value: '90%', label: 'Battery' }
                }
            },
            'wireless-receiver': {
                'Wireless Receiver': {
                    frequency: { type: 'slider', min: 500, max: 600, value: 550, label: 'Frequency (MHz)' },
                    squelch: { type: 'slider', min: 0, max: 100, value: 50, label: 'Squelch' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'effects-processor': {
                'Effects Processor': {
                    reverb: { type: 'slider', min: 0, max: 100, value: 30, label: 'Reverb' },
                    delay: { type: 'slider', min: 0, max: 100, value: 20, label: 'Delay' },
                    chorus: { type: 'slider', min: 0, max: 100, value: 15, label: 'Chorus' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'mic-receiver': {
                'Mic Receiver': {
                    frequency: { type: 'slider', min: 500, max: 600, value: 550, label: 'Frequency (MHz)' },
                    squelch: { type: 'slider', min: 0, max: 100, value: 50, label: 'Squelch' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'laptop': {
                'Presenter Laptop': {
                    brightness: { type: 'slider', min: 0, max: 100, value: 80, label: 'Brightness' },
                    volume: { type: 'slider', min: 0, max: 100, value: 75, label: 'Volume' },
                    presentation: { type: 'toggle', value: false, label: 'Presentation Mode' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'graphics-computer': {
                'Graphics Computer': {
                    brightness: { type: 'slider', min: 0, max: 100, value: 85, label: 'Brightness' },
                    graphics: { type: 'toggle', value: false, label: 'Graphics Overlay' },
                    templates: { type: 'select', options: ['Lower Third', 'Full Screen', 'Logo', 'Custom'], value: 'Lower Third', label: 'Template' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Graphics Workstation': {
                    brightness: { type: 'slider', min: 0, max: 100, value: 90, label: 'Brightness' },
                    graphics: { type: 'toggle', value: false, label: 'Graphics Overlay' },
                    templates: { type: 'select', options: ['Lower Third', 'Full Screen', 'Logo', 'Custom', 'Chyron'], value: 'Lower Third', label: 'Template' },
                    effects: { type: 'toggle', value: false, label: 'Effects' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'streaming-encoder': {
                'Streaming Encoder': {
                    bitrate: { type: 'slider', min: 1000, max: 10000, value: 5000, label: 'Bitrate (kbps)' },
                    resolution: { type: 'select', options: ['720p', '1080p', '4K'], value: '1080p', label: 'Resolution' },
                    streaming: { type: 'toggle', value: false, label: 'Streaming' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Multi-Stream Encoder': {
                    bitrate: { type: 'slider', min: 1000, max: 15000, value: 8000, label: 'Bitrate (kbps)' },
                    resolution: { type: 'select', options: ['720p', '1080p', '4K'], value: '1080p', label: 'Resolution' },
                    stream1: { type: 'toggle', value: false, label: 'Stream 1' },
                    stream2: { type: 'toggle', value: false, label: 'Stream 2' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'recorder': {
                'Backup Recorder': {
                    recording: { type: 'toggle', value: false, label: 'Recording' },
                    format: { type: 'select', options: ['MP4', 'MOV', 'AVI'], value: 'MP4', label: 'Format' },
                    quality: { type: 'select', options: ['Low', 'Medium', 'High'], value: 'Medium', label: 'Quality' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Multi-Format Recorder': {
                    recording: { type: 'toggle', value: false, label: 'Recording' },
                    format: { type: 'select', options: ['MP4', 'MOV', 'AVI', 'ProRes'], value: 'MP4', label: 'Format' },
                    quality: { type: 'select', options: ['Low', 'Medium', 'High', 'Professional'], value: 'High', label: 'Quality' },
                    backup: { type: 'toggle', value: true, label: 'Backup Recording' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'vtr': {
                'Video Tape Recorder': {
                    play: { type: 'toggle', value: false, label: 'Play' },
                    record: { type: 'toggle', value: false, label: 'Record' },
                    format: { type: 'select', options: ['HDCAM', 'Digital Betacam', 'DVCAM'], value: 'HDCAM', label: 'Format' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'ups': {
                'Uninterruptible Power Supply': {
                    mainPower: { type: 'toggle', value: true, label: 'Main Power' },
                    battery: { type: 'display', value: '95%', label: 'Battery' },
                    load: { type: 'display', value: '65%', label: 'Load' },
                    runtime: { type: 'display', value: '45 min', label: 'Runtime' }
                }
            },
            'mobile-device': {
                'Mobile Phone': {
                    battery: { type: 'display', value: '85%', label: 'Battery' },
                    streaming: { type: 'toggle', value: false, label: 'Streaming' },
                    camera: { type: 'toggle', value: true, label: 'Camera' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'chat-computer': {
                'Chat Management PC': {
                    brightness: { type: 'slider', min: 0, max: 100, value: 80, label: 'Brightness' },
                    chat: { type: 'toggle', value: false, label: 'Chat Management' },
                    moderation: { type: 'toggle', value: false, label: 'Moderation' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                }
            },
            'gaming-pc': {
                'Gaming PC 1': {
                    performance: { type: 'select', options: ['Low', 'Medium', 'High', 'Ultra'], value: 'High', label: 'Performance' },
                    streaming: { type: 'toggle', value: false, label: 'Streaming' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Gaming PC 2': {
                    performance: { type: 'select', options: ['Low', 'Medium', 'High', 'Ultra'], value: 'High', label: 'Performance' },
                    streaming: { type: 'toggle', value: false, label: 'Streaming' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Pro Gaming PC 1': {
                    performance: { type: 'select', options: ['Low', 'Medium', 'High', 'Ultra'], value: 'Ultra', label: 'Performance' },
                    streaming: { type: 'toggle', value: false, label: 'Streaming' },
                    tournament: { type: 'toggle', value: false, label: 'Tournament Mode' },
                    power: { type: 'toggle', value: true, label: 'Power' }
                },
                'Pro Gaming PC 2': {
                    performance: { type: 'select', options: ['Low', 'Medium', 'High', 'Ultra'], value: 'Ultra', label: 'Performance' },
                    streaming: { type: 'toggle', value: false, label: 'Streaming' },
                    tournament: { type: 'toggle', value: false, label: 'Tournament Mode' },
                    power: { type: 'toggle', value: true, label: 'Power' }
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

    /**
     * Start confetti animation
     */
    startConfetti() {
        console.log('🎊 Starting confetti animation');
        const colors = ['#ff6b35', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];

        for (let i = 0; i < 150; i++) {
            setTimeout(() => {
                this.createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 20);
        }
    }

    /**
     * Create individual confetti piece
     */
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

    /**
     * Play victory sound
     */
    playVictorySound() {
        console.log('🎵 Playing victory sound');
        // Play a victory melody using the audio system
        if (this.audioSystem) {
            this.audioSystem.playVictorySound();
        } else {
            // Fallback if audio system is not available
            this.playSound(523, 0.2, 'sine'); // C
            setTimeout(() => this.playSound(659, 0.2, 'sine'), 200); // E
            setTimeout(() => this.playSound(784, 0.2, 'sine'), 400); // G
            setTimeout(() => this.playSound(1047, 0.4, 'sine'), 600); // C (high)
        }
    }

    /**
     * Play a simple sound (fallback method)
     */
    playSound(frequency, duration, type = 'sine') {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            console.log('🔇 Could not play sound:', error);
        }
    }

    /**
     * Show resource assignment menu
     */
    showResourceMenu(event, equipmentType, equipmentElement, uniqueId) {
        console.log('👥 Showing resource menu for:', equipmentType);
        console.log('👥 Event type:', event.type);
        console.log('👥 Equipment element:', equipmentElement);

        // Remove any existing resource menu
        const existingMenu = document.querySelector('.resource-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const levelData = this.getLevelData(this.currentLevel);
        if (!levelData || !levelData.resourceRequirements || !levelData.availableResources) {
            console.log('❌ No resource requirements defined for this level');
            console.log('❌ Level data:', levelData);
            return;
        }

        // Get required resources for this equipment type
        const requiredResources = levelData.resourceRequirements[equipmentType] || [];
        const availableResources = levelData.availableResources;

        // Create menu
        const menu = document.createElement('div');
        menu.className = 'resource-context-menu';
        menu.style.left = event.pageX + 'px';
        menu.style.top = event.pageY + 'px';

        // Check if resource is already assigned
        const currentResource = equipmentElement.dataset.assignedResource;
        const currentResourceName = equipmentElement.dataset.assignedResourceName;

        // Add header
        const header = document.createElement('div');
        header.className = 'resource-menu-header';
        if (currentResource) {
            header.textContent = `Change Resource for ${equipmentElement.dataset.name} (Currently: ${currentResourceName})`;
        } else {
            header.textContent = `Assign Resource to ${equipmentElement.dataset.name}`;
        }
        menu.appendChild(header);

        // Add resource options
        availableResources.forEach(resource => {
            const menuItem = document.createElement('div');
            menuItem.className = 'resource-menu-item';

            // Add visual indicator if this is the currently assigned resource
            const isCurrentlyAssigned = currentResource === resource.id;
            const assignedIndicator = isCurrentlyAssigned ? ' ✅' : '';

            menuItem.innerHTML = `
                <i class="${resource.icon}"></i>
                <span class="resource-name">${resource.name}${assignedIndicator}</span>
                <span class="resource-description">${resource.description}</span>
            `;

            // Highlight currently assigned resource
            if (isCurrentlyAssigned) {
                menuItem.style.backgroundColor = '#e8f5e8';
                menuItem.style.fontWeight = 'bold';
            }

            menuItem.addEventListener('click', () => {
                this.assignResourceToEquipment(resource, equipmentElement, requiredResources);
                menu.remove();
            });

            menu.appendChild(menuItem);
        });

        // Add "Remove Assignment" option if a resource is currently assigned
        if (currentResource) {
            const removeItem = document.createElement('div');
            removeItem.className = 'resource-menu-item';
            removeItem.style.borderTop = '2px solid #ddd';
            removeItem.style.marginTop = '5px';
            removeItem.style.paddingTop = '15px';
            removeItem.innerHTML = `
                <i class="fas fa-times" style="color: #e74c3c;"></i>
                <span class="resource-name" style="color: #e74c3c;">Remove Assignment</span>
                <span class="resource-description" style="color: #e74c3c;">Clear current resource</span>
            `;

            removeItem.addEventListener('click', () => {
                this.removeResourceAssignment(equipmentElement);
                menu.remove();
            });

            menu.appendChild(removeItem);
        }

        document.body.appendChild(menu);

        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };

        // Delay adding the listener to prevent immediate closure
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 100);
    }

    /**
     * Assign resource to equipment
     */
    assignResourceToEquipment(resource, equipmentElement, requiredResources) {
        console.log('👥 Assigning resource:', resource.name, 'to equipment:', equipmentElement.dataset.name);

        // Check if this is a valid resource for this equipment
        const isValidResource = requiredResources.includes(resource.id);

        if (isValidResource) {
            // Valid resource - add it to the equipment
            this.addResourceIconToEquipment(resource, equipmentElement);
            console.log('✅ Resource assigned successfully');

            // Increment score for successful resource assignment
            this.gameState.score += 50;
            this.updatePlayerStats();
            console.log('🎯 Score increased to:', this.gameState.score);

            // Play success sound
            this.playSound(800, 0.2, 'sine');
            setTimeout(() => this.playSound(1000, 0.3, 'sine'), 200);
        } else {
            // Invalid resource - show error
            console.log('❌ Invalid resource for this equipment');
            this.showMessage(`❌ ${resource.name} cannot be assigned to ${equipmentElement.dataset.name}`, 'error');

            // Play error sound
            this.playSound(200, 0.3, 'sawtooth');
            setTimeout(() => this.playSound(150, 0.3, 'sawtooth'), 100);
        }
    }

    /**
 * Add resource icon to equipment
 */
    addResourceIconToEquipment(resource, equipmentElement) {
        const resourceBtn = equipmentElement.querySelector('.equipment-resource');
        if (resourceBtn) {
            // Update the icon
            const resourceIcon = resourceBtn.querySelector('i');
            if (resourceIcon) {
                resourceIcon.className = resource.icon;
                resourceIcon.title = resource.name;
            }

            // Update styling to show it's assigned
            resourceBtn.style.background = '#27ae60';
            resourceBtn.title = `Assigned: ${resource.name} (Click to change)`;

            // Keep it clickable so users can change the assignment
            resourceBtn.style.pointerEvents = 'auto';
        }

        // Store the assigned resource in the equipment data
        equipmentElement.dataset.assignedResource = resource.id;
        equipmentElement.dataset.assignedResourceName = resource.name;
    }

    /**
     * Check if all equipment has correct resources assigned
     */
    checkResourceAssignments() {
        const levelData = this.getLevelData(this.currentLevel);
        if (!levelData || !levelData.resourceRequirements) {
            return true; // No resource requirements for this level
        }

        let allAssigned = true;
        let correctAssignments = 0;
        let totalRequired = 0;

        this.equipment.forEach(equipmentData => {
            const equipmentType = equipmentData.type;
            const requiredResources = levelData.resourceRequirements[equipmentType];

            if (requiredResources && requiredResources.length > 0) {
                totalRequired++;
                const assignedResource = equipmentData.element.dataset.assignedResource;

                if (assignedResource && requiredResources.includes(assignedResource)) {
                    correctAssignments++;
                } else {
                    allAssigned = false;
                }
            }
        });

        console.log(`👥 Resource Assignment Check: ${correctAssignments}/${totalRequired} correct assignments`);
        return allAssigned && totalRequired > 0;
    }

    /**
     * Remove resource assignment from equipment
     */
    removeResourceAssignment(equipmentElement) {
        console.log('👥 Removing resource assignment from:', equipmentElement.dataset.name);

        const resourceBtn = equipmentElement.querySelector('.equipment-resource');
        if (resourceBtn) {
            // Reset to default state
            const resourceIcon = resourceBtn.querySelector('i');
            if (resourceIcon) {
                resourceIcon.className = 'fas fa-user-plus';
                resourceIcon.title = '';
            }

            // Reset styling
            resourceBtn.style.background = '#27ae60';
            resourceBtn.title = 'Click to assign resource';

            // Keep it clickable
            resourceBtn.style.pointerEvents = 'auto';
        }

        // Clear the assigned resource data
        delete equipmentElement.dataset.assignedResource;
        delete equipmentElement.dataset.assignedResourceName;

        console.log('✅ Resource assignment removed');
        this.showMessage('Resource assignment removed', 'info');
    }
}
