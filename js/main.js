// Main Entry Point
// Initializes the AV Master Game

import { AVMasterGame } from './core/GameEngine.js';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('AV Master Game - Initializing...');
    
    // Create game instance
    const game = new AVMasterGame();
    
    // Make game globally accessible for debugging
    window.game = game;
    
    // Setup drag and drop for stage area
    const stageArea = document.getElementById('stage-area');
    if (stageArea) {
        stageArea.addEventListener('dragover', (e) => game.handleDragOver(e));
        stageArea.addEventListener('drop', (e) => game.handleDrop(e));
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
    
    console.log('AV Master Game - Initialized successfully!');
});

// Handle page unload to cleanup resources
window.addEventListener('beforeunload', () => {
    if (window.game) {
        window.game.cleanup();
    }
});
