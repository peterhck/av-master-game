// Main Entry Point
// Initializes the AV Master Game with proper loading sequence

import { config } from './config.js';
import { AVMasterGame } from './core/GameEngine.js';
import { getLevelData } from './data/LevelData.js';
import { getConnectorColor, saveToStorage, loadFromStorage } from './utils/Helpers.js';
import { AuthManager } from './modules/AuthManager.js';
import { TutorialManager } from './modules/TutorialManager.js';

// Global game instance
let game = null;

/**
 * Validate that all required modules are loaded
 */
function validateModules() {
    console.log('🔍 Validating modules...');

    try {
        // Test GameEngine - just check if it's a function
        if (typeof AVMasterGame !== 'function') {
            throw new Error('GameEngine module not loaded properly');
        }
        console.log('✓ GameEngine module validated');

        // Test LevelData - just check if function exists, don't call it yet
        if (typeof getLevelData !== 'function') {
            throw new Error('LevelData module not loaded properly');
        }
        console.log('✓ LevelData module validated');

        // Test Helpers - just check if functions exist
        if (typeof getConnectorColor !== 'function' ||
            typeof saveToStorage !== 'function' ||
            typeof loadFromStorage !== 'function') {
            throw new Error('Helpers module not loaded properly');
        }
        console.log('✓ Helpers module validated');

        return true;
    } catch (error) {
        console.error('❌ Module validation failed:', error);
        return false;
    }
}

/**
 * Validate DOM elements are present
 */
function validateDOM() {
    console.log('🔍 Validating DOM elements...');

    const requiredElements = [
        'loading-screen',
        'main-menu',
        'level-select',
        'game',
        'start-game-btn',
        'tutorial-btn',
        'settings-btn',
        'level-container'
    ];

    const missingElements = [];

    for (const elementId of requiredElements) {
        const element = document.getElementById(elementId);
        if (!element) {
            missingElements.push(elementId);
        }
    }

    if (missingElements.length > 0) {
        console.error('❌ Missing DOM elements:', missingElements);
        return false;
    }

    console.log('✓ All required DOM elements found');
    return true;
}

/**
 * Initialize the game with proper loading sequence
 */
async function initializeGame() {
    console.log('🚀 AV Master Game - Starting initialization...');

    try {
        // Step 1: Validate modules (just function existence)
        console.log('\n📦 Step 1: Validating modules...');
        if (!validateModules()) {
            throw new Error('Module validation failed');
        }
        console.log('✅ Step 1 complete: All modules validated');

        // Step 2: Validate DOM
        console.log('\n🏗️ Step 2: Validating DOM...');
        if (!validateDOM()) {
            throw new Error('DOM validation failed');
        }
        console.log('✅ Step 2 complete: All DOM elements validated');

        // Step 3: Initialize authentication
        console.log('\n🔐 Step 3: Initializing authentication...');
        window.authManager = new AuthManager();
        console.log('✅ Step 3 complete: Authentication initialized');

        // Step 3.5: Initialize tutorial system
        console.log('\n📚 Step 3.5: Initializing tutorial system...');
        window.tutorialManager = new TutorialManager();
        console.log('✅ Step 3.5 complete: Tutorial system initialized');

        // Step 4: Create game instance
        console.log('\n🎮 Step 4: Creating game instance...');
        game = new AVMasterGame();
        console.log('✅ Step 4 complete: Game instance created');

        // Step 5: Initialize game engine
        console.log('\n⚙️ Step 5: Initializing game engine...');
        console.log('🔍 DOM state before init:', {
            mainMenu: !!document.getElementById('main-menu'),
            startGameBtn: !!document.getElementById('start-game-btn'),
            currentScreen: document.querySelector('.screen.active')?.id
        });
        game.init();
        console.log('✅ Step 5 complete: Game engine initialized');
        console.log('🔍 DOM state after init:', {
            mainMenu: !!document.getElementById('main-menu'),
            startGameBtn: !!document.getElementById('start-game-btn'),
            currentScreen: document.querySelector('.screen.active')?.id
        });

        // Step 6: Setup global event listeners
        console.log('\n🎯 Step 6: Setting up global event listeners...');
        setupGlobalEventListeners();
        console.log('✅ Step 6 complete: Global event listeners set up');

        // Step 7: Make game globally accessible
        console.log('\n🌐 Step 7: Making game globally accessible...');
        window.game = game;
        console.log('✅ Step 7 complete: Game made globally accessible');

        // Step 8: Test button clickability
        console.log('\n🧪 Step 8: Testing button clickability...');
        setTimeout(() => {
            const testBtn = document.getElementById('start-game-btn');
            if (testBtn) {
                console.log('🔍 Adding direct test click listener...');
                testBtn.onclick = (e) => {
                    console.log('🧪 DIRECT CLICK DETECTED!');
                    e.preventDefault();
                    e.stopPropagation();
                };
                console.log('✅ Direct click listener added');
            } else {
                console.log('❌ Test button not found in timeout');
            }
        }, 1000);

        console.log('✅ Button testing setup complete');

        console.log('\n🎉 AV Master Game - Initialization completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Game initialization failed:', error);
        console.error('Stack trace:', error.stack);

        // Show error message to user
        showInitializationError(error.message);
        return false;
    }
}

/**
 * Setup global event listeners that are not part of the game engine
 */
function setupGlobalEventListeners() {
    // Setup drag and drop for stage area
    const stageArea = document.getElementById('stage-area');
    if (stageArea) {
        stageArea.addEventListener('dragover', (e) => game.handleDragOver(e));
        stageArea.addEventListener('drop', (e) => game.handleDrop(e));
        console.log('✓ Stage area drag/drop events set up');
    }

    // Connector click events are handled by the game engine via event delegation
    console.log('✓ Connector click events will be set up by game engine');

    // Setup global event listener for testing challenge button
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'testing-challenge-btn') {
            console.log('🔬 Global testing challenge button clicked!');
            if (game && typeof game.startTestingChallenges === 'function') {
                game.startTestingChallenges();
            } else {
                console.error('❌ Game or startTestingChallenges not available');
            }
        }
    });

    // Setup keyboard shortcuts for testing
    setupKeyboardShortcuts();
}

/**
 * Setup keyboard shortcuts for testing and debugging
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't process shortcuts if user is typing in an input field
        const activeElement = document.activeElement;
        const isTyping = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true' ||
            activeElement.id === 'ai-chat-input-field'
        );

        if (isTyping) {
            return; // Don't process shortcuts when typing
        }

        // Ctrl+Shift+U (or Cmd+Shift+U on Mac) - Unlock all levels
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'u') {
            e.preventDefault();
            unlockAllLevels();
        }

        // Ctrl+Shift+N (or Cmd+Shift+N on Mac) - Lock/Reset game state
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            resetGameState();
        }
    });

    console.log('✓ Keyboard shortcuts set up (Ctrl+Shift+U: Unlock All, Ctrl+Shift+N: Lock/Reset)');
}

/**
 * Unlock all levels for testing purposes
 */
function unlockAllLevels() {
    if (!game) {
        console.warn('⚠️ Game not initialized yet');
        return;
    }

    // Import LEVEL_ORDER to get all available levels
    import('./data/LevelData.js').then(({ LEVEL_ORDER }) => {
        // Unlock all levels
        game.gameState.unlockedLevels = [...LEVEL_ORDER];

        // Save to localStorage
        game.saveGameState();

        // Update the level selection UI if it's currently visible
        if (game.currentScreen === 'level-select') {
            game.updateLevelSelectionUI();
        }

        console.log('🎉 All levels unlocked for testing!');
        console.log('📋 Unlocked levels:', game.gameState.unlockedLevels);

        // Show a brief notification
        showNotification('All levels unlocked for testing!', 'success');
    }).catch(error => {
        console.error('❌ Failed to unlock levels:', error);
        showNotification('Failed to unlock levels', 'error');
    });
}

/**
 * Reset game state to initial state
 */
function resetGameState() {
    if (!game) {
        console.warn('⚠️ Game not initialized yet');
        return;
    }

    // Reset to initial state
    game.gameState = {
        unlockedLevels: ['audio-1'],
        completedLevels: [],
        currentLevel: null,
        score: 0,
        lives: 3,
        totalTime: 0,
        settings: {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'normal'
        }
    };

    // Save to localStorage
    game.saveGameState();

    // Update UI if on level selection screen
    if (game.currentScreen === 'level-select') {
        game.updateLevelSelectionUI();
    }

    console.log('🔄 Game state reset to initial state');
    showNotification('Game state reset', 'info');
}

/**
 * Show a brief notification to the user
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4757' : '#00ccff'};
        color: #1a1a2e;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Show initialization error to user
 */
function showInitializationError(errorMessage) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div class="loading-content">
                <div class="logo">
                    <i class="fas fa-exclamation-triangle" style="color: #ff4757;"></i>
                    <h1>Initialization Error</h1>
                </div>
                <div style="color: #ff4757; margin: 2rem 0; text-align: center;">
                    <p><strong>Failed to initialize the game:</strong></p>
                    <p>${errorMessage}</p>
                    <p>Please refresh the page and try again.</p>
                </div>
                <button onclick="location.reload()" style="
                    background: #00ff88;
                    color: #1a1a2e;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    <i class="fas fa-redo"></i> Refresh Page
                </button>
            </div>
        `;
    }
}

/**
 * Handle page unload to cleanup resources
 */
function cleanup() {
    if (game) {
        game.cleanup();
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Content Loaded - Starting game initialization...');
    initializeGame();
});

// Handle page unload
window.addEventListener('beforeunload', cleanup);

// Handle page visibility change (pause/resume)
document.addEventListener('visibilitychange', () => {
    if (game) {
        if (document.hidden) {
            console.log('⏸️ Page hidden - pausing game');
            game.pauseGame();
        } else {
            console.log('▶️ Page visible - resuming game');
            game.resumeGame();
        }
    }
});

// Export for debugging
window.initializeGame = initializeGame;
window.validateModules = validateModules;
window.validateDOM = validateDOM;
