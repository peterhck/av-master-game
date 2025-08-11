// Main Entry Point
// Initializes the AV Master Game with proper loading sequence

import { AVMasterGame } from './core/GameEngine.js';
import { getLevelData } from './data/LevelData.js';
import { getConnectorColor, saveToStorage, loadFromStorage } from './utils/Helpers.js';

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

        // Step 3: Create game instance
        console.log('\n🎮 Step 3: Creating game instance...');
        game = new AVMasterGame();
        console.log('✅ Step 3 complete: Game instance created');

        // Step 4: Initialize game engine
        console.log('\n⚙️ Step 4: Initializing game engine...');
        game.init();
        console.log('✅ Step 4 complete: Game engine initialized');

        // Step 5: Setup global event listeners
        console.log('\n🎯 Step 5: Setting up global event listeners...');
        setupGlobalEventListeners();
        console.log('✅ Step 5 complete: Global event listeners set up');

        // Step 6: Make game globally accessible
        console.log('\n🌐 Step 6: Making game globally accessible...');
        window.game = game;
        console.log('✅ Step 6 complete: Game made globally accessible');

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

    // Setup connector click events
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('connector')) {
            const equipment = e.target.closest('.equipment');
            if (equipment) {
                const equipmentData = game.equipment.find(eq => eq.element === equipment);
                if (equipmentData) {
                    game.handleConnectorClick(e.target, equipmentData);
                }
            }
        }
    });
    console.log('✓ Connector click events set up');
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
