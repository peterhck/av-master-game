// AI Tutor Module
// Handles AI chat functionality, voice recognition, and equipment information display

import { config } from '../config.js';

export class AITutor {
    constructor() {
        this.isActive = false;
        this.isVoiceMode = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentEquipment = null;
        this.chatHistory = [];
        this.currentConversationId = null;
        this.backendUrl = config.BACKEND_URL; // Backend API URL
        this.linkPreviewQueue = []; // Queue for link preview requests
        this.isProcessingLinkPreview = false;
        this.currentLanguage = 'en'; // Default language
        this.languageMap = {
            'en': { name: 'English', code: 'en-US', voice: 'en-US' },
            'es': { name: 'Spanish', code: 'es-ES', voice: 'es-ES' },
            'fr': { name: 'French', code: 'fr-FR', voice: 'fr-FR' },
            'zh': { name: 'Mandarin', code: 'zh-CN', voice: 'zh-CN' },
            'ht': { name: 'Haitian Creole', code: 'ht-HT', voice: 'ht-HT' },
            'de': { name: 'German', code: 'de-DE', voice: 'de-DE' },
            'ja': { name: 'Japanese', code: 'ja-JP', voice: 'ja-JP' },
            'bn': { name: 'Bengali', code: 'bn-BD', voice: 'bn-BD' },
            'hi': { name: 'Hindi', code: 'hi-IN', voice: 'hi-IN' },
            'ar': { name: 'Arabic', code: 'ar-SA', voice: 'ar-SA' }
        };

        this.init();
    }

    init() {
        this.setupVoiceRecognition();
        this.setupEventListeners();
        this.initializeVoices();
        console.log('🤖 AI Tutor initialized');
    }

    initializeVoices() {
        // Initialize speech synthesis voices
        if (this.synthesis) {
            // Some browsers need time to load voices
            const loadVoices = () => {
                const voices = this.synthesis.getVoices();
                console.log('🎤 Available voices:', voices.length);
                voices.forEach(voice => {
                    console.log('🎤 Voice:', voice.name, voice.lang);
                });
            };

            // Try to load voices immediately
            loadVoices();

            // Also listen for voices loaded event
            this.synthesis.onvoiceschanged = loadVoices;
        }
    }

    setupVoiceRecognition() {
        // Check if browser supports speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = this.languageMap[this.currentLanguage].code;

            this.recognition.onstart = () => {
                console.log('🎤 Voice recognition started');
                this.showVoiceStatus('Listening...');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('🎤 Voice input:', transcript);
                this.handleVoiceInput(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('🎤 Voice recognition error:', event.error);
                this.hideVoiceStatus();
            };

            this.recognition.onend = () => {
                console.log('🎤 Voice recognition ended');
                this.hideVoiceStatus();
                // Only restart if still in voice mode and not paused by AI speaking
                // The resumeVoiceRecognition function will handle restarting when needed
            };
        } else {
            console.warn('🎤 Voice recognition not supported in this browser');
        }
    }

    setupEventListeners() {
        // AI Tutor toggle button
        const aiTutorToggle = document.getElementById('ai-tutor-toggle');
        if (aiTutorToggle) {
            aiTutorToggle.addEventListener('click', () => this.toggleAITutor().catch(error => {
                console.error('🤖 Error toggling AI Tutor:', error);
            }));
        }

        // Voice toggle button
        const aiVoiceToggle = document.getElementById('ai-voice-toggle');
        if (aiVoiceToggle) {
            aiVoiceToggle.addEventListener('click', () => this.toggleVoiceMode());
        }

        // Language selection dropdown
        const aiLanguageSelect = document.getElementById('ai-language-select');
        if (aiLanguageSelect) {
            aiLanguageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
        }

        // Chat interface controls
        const aiChatSettings = document.getElementById('ai-chat-settings');
        if (aiChatSettings) {
            aiChatSettings.addEventListener('click', () => this.showAPISettingsModal());
        }

        const aiChatVoice = document.getElementById('ai-chat-voice');
        if (aiChatVoice) {
            aiChatVoice.addEventListener('click', () => this.toggleVoiceMode());
        }

        const aiChatMinimize = document.getElementById('ai-chat-minimize');
        if (aiChatMinimize) {
            aiChatMinimize.addEventListener('click', () => this.minimizeChat());
        }

        const aiChatClose = document.getElementById('ai-chat-close');
        if (aiChatClose) {
            aiChatClose.addEventListener('click', () => this.closeChat());
        }

        // Chat collapse button
        const aiChatCollapse = document.getElementById('ai-chat-collapse');
        if (aiChatCollapse) {
            aiChatCollapse.addEventListener('click', () => this.collapseChat());
        }

        // Chat input
        const aiChatInput = document.getElementById('ai-chat-input-field');
        if (aiChatInput) {
            // Prevent game shortcuts from interfering with chat input
            aiChatInput.addEventListener('keydown', (e) => {
                // Stop propagation to prevent game shortcuts from triggering
                e.stopPropagation();
            });

            aiChatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const message = aiChatInput.value.trim();
                    if (message) {
                        this.handleUserMessage(message);
                        aiChatInput.value = '';
                    }
                }
            });

            // Focus the input when AI tutor is opened
            aiChatInput.addEventListener('focus', () => {
                console.log('🤖 Chat input focused');
            });
        }

        // Send button
        const aiChatSend = document.getElementById('ai-chat-send');
        if (aiChatSend) {
            aiChatSend.addEventListener('click', () => {
                const message = aiChatInput.value.trim();
                if (message) {
                    this.handleUserMessage(message);
                    aiChatInput.value = '';
                }
            });
        }

        // Popup browser close
        const aiPopupClose = document.getElementById('ai-popup-close');
        if (aiPopupClose) {
            aiPopupClose.addEventListener('click', () => this.closePopupBrowser());
        }

        // Add click event for microphone icon to show voice status
        const micIcon = document.querySelector('.ai-voice-toggle i.fa-microphone, .ai-voice-toggle i.fa-microphone-slash');
        if (micIcon) {
            micIcon.addEventListener('click', () => {
                this.showVoiceClickIndicator();
            });
        }
    }

    async toggleAITutor() {
        const aiTutorChat = document.getElementById('ai-tutor-chat');
        const aiTutorToggle = document.getElementById('ai-tutor-toggle');
        const aiVoiceToggle = document.getElementById('ai-voice-toggle');

        if (this.isActive) {
            aiTutorChat.style.display = 'none';
            aiTutorToggle.classList.remove('active');
            aiVoiceToggle.style.display = 'none'; // Hide voice toggle when AI is off
            this.isActive = false;
            this.isVoiceMode = false; // Turn off voice mode when AI is deactivated
            this.stopVoiceRecognition();
            this.stopAISpeech();
        } else {
            aiTutorChat.style.display = 'flex';
            aiTutorToggle.classList.add('active');
            aiVoiceToggle.style.display = 'flex'; // Show voice toggle when AI is on
            this.isActive = true;

            // Add welcome message if chat is empty
            const chatMessages = document.getElementById('ai-chat-messages');
            if (chatMessages.children.length === 0) {
                // Test backend API call to verify it's working
                this.addAIMessage('🤖 Connecting to AI backend...');
                try {
                    const testResponse = await this.callBackendAPI('Hello, please introduce yourself as AVA');
                    this.addAIMessage(testResponse);
                } catch (error) {
                    console.error('🤖 Backend test failed:', error);
                    this.addAIMessage('Backend connection failed. Please check the server.');
                }
            }
        }
    }

    changeLanguage(languageCode) {
        this.currentLanguage = languageCode;
        console.log('🌍 Language changed to:', this.languageMap[languageCode].name);
        
        // Update voice recognition language
        if (this.recognition) {
            this.recognition.lang = this.languageMap[languageCode].code;
        }
        
        // If AI is active, send a message to inform about language change
        if (this.isActive) {
            const languageName = this.languageMap[languageCode].name;
            this.addMessageToChat('system', `Language changed to ${languageName}. I will now communicate in ${languageName}.`);
        }
    }

    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        const aiVoiceToggle = document.getElementById('ai-voice-toggle');
        const aiChatVoice = document.getElementById('ai-chat-voice');
        const voiceStatus = aiVoiceToggle.querySelector('.voice-status');

        if (this.isVoiceMode) {
            aiVoiceToggle.classList.add('active');
            aiChatVoice.classList.add('active');
            voiceStatus.textContent = 'ON';
            this.startVoiceRecognition();
            this.showVoiceStatus('Voice mode enabled');
        } else {
            aiVoiceToggle.classList.remove('active');
            aiChatVoice.classList.remove('active');
            voiceStatus.textContent = 'VOICE';
            this.stopVoiceRecognition();
            this.stopAISpeech(); // Immediately stop AI speech
            this.showVoiceStatus('Voice mode disabled');
        }
    }

    startVoiceRecognition() {
        if (this.recognition && this.isActive) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('🎤 Error starting voice recognition:', error);
            }
        }
    }

    stopVoiceRecognition() {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('🎤 Error stopping voice recognition:', error);
            }
        }
    }

    pauseVoiceRecognition() {
        if (this.recognition && this.isVoiceMode && this.isActive) {
            try {
                console.log('🎤 Pausing voice recognition to prevent feedback loop');
                this.recognition.stop();
            } catch (error) {
                console.error('🎤 Error pausing voice recognition:', error);
            }
        }
    }

    resumeVoiceRecognition() {
        if (this.recognition && this.isVoiceMode && this.isActive) {
            try {
                console.log('🎤 Resuming voice recognition');
                // Add a small delay to ensure speech is completely finished
                setTimeout(() => {
                    this.recognition.start();
                }, 500);
            } catch (error) {
                console.error('🎤 Error resuming voice recognition:', error);
            }
        }
    }

    handleVoiceInput(transcript) {
        this.handleUserMessage(transcript);
    }

    handleUserMessage(message) {
        if (!message.trim()) return;

        this.addUserMessage(message);
        this.processAIResponse(message);
    }

    addUserMessage(message) {
        const chatMessages = document.getElementById('ai-chat-messages');
        const userMessage = document.createElement('div');
        userMessage.className = 'user-message';
        userMessage.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-message-content">
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
        chatMessages.appendChild(userMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        this.chatHistory.push({ role: 'user', content: message });
    }

    addAIMessage(message) {
        const chatMessages = document.getElementById('ai-chat-messages');
        const aiMessage = document.createElement('div');
        aiMessage.className = 'ai-message';

        // Check if message contains URLs
        const urls = this.extractUrls(message);
        const hasUrls = urls.length > 0;

        // Format the message for better readability (display version)
        const formattedMessage = this.formatMessageForDisplay(message);

        // Create clean version for speech synthesis
        const speechText = this.formatMessageForSpeech(message);

        aiMessage.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-message-content">
                <div class="ai-message-text">${formattedMessage}</div>
                ${hasUrls ? this.createWebContentSection(urls) : ''}
            </div>
        `;

        chatMessages.appendChild(aiMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        this.chatHistory.push({ role: 'assistant', content: message });

        // Speak the cleaned response if in voice mode
        if (this.isVoiceMode && speechText) {
            this.speakMessage(speechText);
        }

        // Expand chat window if URLs are present
        if (hasUrls) {
            this.expandChatForWebContent();
        }
    }

    async processAIResponse(userMessage) {
        // Show progress spinner
        this.showProgressSpinner();

        // Check if pricing search is needed first
        const needsPricingSearch = this.detectPricingSearchNeeded(userMessage);
        const needsWebSearch = this.detectWebSearchNeeded(userMessage);

        // Show appropriate indicator
        if (needsPricingSearch) {
            this.addPricingSearchIndicator();
        } else if (needsWebSearch) {
            this.addWebSearchIndicator();
        } else {
            this.addTypingIndicator();
        }

        try {
            // Remove all indicators
            this.removeTypingIndicator();
            this.removeWebSearchIndicator();
            this.removePricingSearchIndicator();

            // Generate AI response using hybrid approach
            const response = await this.generateAIResponse(userMessage);
            this.addAIMessage(response);

        } catch (error) {
            console.error('🤖 Error processing AI response:', error);
            this.removeTypingIndicator();
            this.removeWebSearchIndicator();
            this.removePricingSearchIndicator();
            this.addAIMessage('Error processing your request. Please try again.');
        } finally {
            // Always hide progress spinner
            this.hideProgressSpinner();
        }
    }

    async generateAIResponse(userMessage) {
        try {
            // Check if the message requires pricing search first
            const needsPricingSearch = this.detectPricingSearchNeeded(userMessage);

            if (needsPricingSearch) {
                console.log('💰 Pricing search detected, using specialized pricing search');
                return await this.callPricingSearchAPI(userMessage);
            }

            // Check if the message requires general web search
            const needsWebSearch = this.detectWebSearchNeeded(userMessage);

            if (needsWebSearch) {
                console.log('🌐 Web search detected, using real web search with GPT-4o');
                return await this.callWebSearchAPI(userMessage);
            } else {
                console.log('💬 Regular conversation, using GPT-4o for voice');
                return await this.callBackendAPI(userMessage);
            }
        } catch (error) {
            console.error('🤖 Error generating AI response:', error);
            throw new Error(`AI service unavailable: ${error.message}`);
        }
    }

    detectWebSearchNeeded(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // Keywords that indicate web search is needed
        const webSearchKeywords = [
            'latest', 'current', 'recent', 'new', 'updated', 'price', 'cost', 'buy', 'purchase',
            'where to buy', 'best price', 'compare', 'reviews', 'specifications', 'specs',
            'release date', 'availability', 'stock', 'in stock', 'out of stock',
            'manufacturer', 'brand', 'model', 'version', 'generation',
            'trends', 'industry news', 'market', 'competition',
            'real-time', 'live', 'streaming', 'broadcast'
        ];

        // Check if message contains web search keywords
        const hasWebSearchKeywords = webSearchKeywords.some(keyword =>
            lowerMessage.includes(keyword)
        );

        // Check for specific patterns that indicate web search
        const hasWebSearchPatterns =
            lowerMessage.includes('search for') ||
            lowerMessage.includes('find') ||
            lowerMessage.includes('look up') ||
            lowerMessage.includes('current price') ||
            lowerMessage.includes('latest model') ||
            lowerMessage.includes('new release') ||
            lowerMessage.includes('where can i') ||
            lowerMessage.includes('how much does') ||
            lowerMessage.includes('what is the price') ||
            lowerMessage.includes('compare prices') ||
            lowerMessage.includes('best deals') ||
            lowerMessage.includes('availability') ||
            lowerMessage.includes('in stock');

        return hasWebSearchKeywords || hasWebSearchPatterns;
    }

    detectPricingSearchNeeded(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // Keywords that specifically indicate pricing search
        const pricingKeywords = [
            'price', 'cost', 'how much', 'pricing', 'dollars', 'usd', '$',
            'buy', 'purchase', 'where to buy', 'best price', 'cheapest',
            'compare prices', 'price comparison', 'cost comparison',
            'deal', 'discount', 'sale', 'on sale', 'clearance',
            'retailer', 'store', 'shop', 'vendor', 'supplier'
        ];

        // Check for pricing-specific patterns
        const hasPricingPatterns =
            lowerMessage.includes('what is the price') ||
            lowerMessage.includes('how much does') ||
            lowerMessage.includes('how much is') ||
            lowerMessage.includes('current price') ||
            lowerMessage.includes('latest price') ||
            lowerMessage.includes('price of') ||
            lowerMessage.includes('cost of') ||
            lowerMessage.includes('where can i buy') ||
            lowerMessage.includes('best place to buy') ||
            lowerMessage.includes('compare prices') ||
            lowerMessage.includes('price comparison');

        return pricingKeywords.some(keyword => lowerMessage.includes(keyword)) || hasPricingPatterns;
    }

    async callBackendAPI(userMessage) {
        const backendUrl = this.backendUrl || ''; // Backend API URL
        console.log('🤖 Attempting to call backend API...');

        try {
            // Get current conversation ID or start new one
            let conversationId = this.currentConversationId;
            if (!conversationId) {
                console.log('🤖 Starting new conversation...');
                const sessionResponse = await fetch(`${backendUrl}/api/ai/conversation/start`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sessionId: this.getCurrentSessionId()
                    })
                });

                console.log('🤖 Session response status:', sessionResponse.status);
                if (!sessionResponse.ok) {
                    const errorText = await sessionResponse.text();
                    console.error('🤖 Session response error:', errorText);
                    throw new Error(`Failed to start conversation: ${sessionResponse.status} ${errorText}`);
                }

                const sessionData = await sessionResponse.json();
                console.log('🤖 Session data:', sessionData);
                conversationId = sessionData.conversation_id;
                this.currentConversationId = conversationId;
            }

            console.log('🤖 Sending message to backend with conversation ID:', conversationId);
            // Send message to backend
            const response = await fetch(`${backendUrl}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationId: conversationId,
                    equipmentContext: this.currentEquipment || null,
                    language: this.currentLanguage
                })
            });

            console.log('🤖 Chat response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('🤖 Chat response error:', errorText);
                throw new Error(`Backend API error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('🤖 Chat response data:', data);
            return data.response;

        } catch (error) {
            console.error('🤖 Backend API call failed:', error);
            throw new Error(`Backend API unavailable: ${error.message}`);
        }
    }

    async callWebSearchAPI(userMessage) {
        const backendUrl = this.backendUrl || ''; // Backend API URL
        console.log('🌐 Attempting web search with GPT-5...');

        try {
            // Get current conversation ID or start new one
            let conversationId = this.currentConversationId;
            if (!conversationId) {
                console.log('🌐 Starting new conversation for web search...');
                const sessionResponse = await fetch(`${backendUrl}/api/ai/conversation/start`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sessionId: this.getCurrentSessionId()
                    })
                });

                console.log('🌐 Session response status:', sessionResponse.status);
                if (!sessionResponse.ok) {
                    const errorText = await sessionResponse.text();
                    console.error('🌐 Session response error:', errorText);
                    throw new Error(`Failed to start conversation: ${sessionResponse.status} ${errorText}`);
                }

                const sessionData = await sessionResponse.json();
                console.log('🌐 Session data:', sessionData);
                conversationId = sessionData.conversation_id;
                this.currentConversationId = conversationId;
            }

            console.log('🌐 Sending web search request with conversation ID:', conversationId);

            // Send web search request to backend
            const response = await fetch(`${backendUrl}/api/ai/web-search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: userMessage,
                    conversationId: conversationId,
                    language: this.currentLanguage
                })
            });

            console.log('🌐 Web search response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('🌐 Web search response error:', errorText);
                throw new Error(`Web search API error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('🌐 Web search response data:', data);
            return data.response;

        } catch (error) {
            console.error('🌐 Web search API call failed:', error);
            throw new Error(`Web search API unavailable: ${error.message}`);
        }
    }

    async callPricingSearchAPI(userMessage) {
        const backendUrl = this.backendUrl || ''; // Backend API URL
        console.log('💰 Attempting pricing search...');

        try {
            // Get current conversation ID or start new one
            let conversationId = this.currentConversationId;
            if (!conversationId) {
                console.log('💰 Starting new conversation for pricing search...');
                const sessionResponse = await fetch(`${backendUrl}/api/ai/conversation/start`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sessionId: this.getCurrentSessionId()
                    })
                });

                console.log('💰 Session response status:', sessionResponse.status);
                if (!sessionResponse.ok) {
                    const errorText = await sessionResponse.text();
                    console.error('💰 Session response error:', errorText);
                    throw new Error(`Failed to start conversation: ${sessionResponse.status} ${errorText}`);
                }

                const sessionData = await sessionResponse.json();
                console.log('💰 Session data:', sessionData);
                conversationId = sessionData.conversation_id;
                this.currentConversationId = conversationId;
            }

            console.log('💰 Sending pricing search request with conversation ID:', conversationId);

            // Send pricing search request to backend
            const response = await fetch(`${backendUrl}/api/ai/pricing-search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: userMessage,
                    conversationId: conversationId,
                    language: this.currentLanguage
                })
            });

            console.log('💰 Pricing search response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('💰 Pricing search response error:', errorText);
                throw new Error(`Pricing search API error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('💰 Pricing search response data:', data);
            return data.response;

        } catch (error) {
            console.error('💰 Pricing search API call failed:', error);
            throw new Error(`Pricing search API unavailable: ${error.message}`);
        }
    }

    getCurrentSessionId() {
        // Get current game session ID or generate a new one
        let sessionId = localStorage.getItem('game_session_id');
        if (!sessionId) {
            // Generate a proper UUID
            sessionId = this.generateUUID();
            localStorage.setItem('game_session_id', sessionId);
        }
        return sessionId;
    }

    generateUUID() {
        // Generate a proper UUID v4
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    showAPISettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'ai-settings-modal';

        // Get available voices for voice selection
        const voices = this.synthesis ? this.synthesis.getVoices() : [];
        const voiceOptions = voices.map(voice =>
            `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`
        ).join('');

        modal.innerHTML = `
            <div class="ai-settings-content">
                <div class="ai-settings-header">
                    <h3><i class="fas fa-robot"></i> AVA Settings</h3>
                    <button class="ai-settings-close">&times;</button>
                </div>
                <div class="ai-settings-body">
                    <div class="ai-status">
                        <h4>🤖 AVA (Audio Visual Assistant) Active</h4>
                        <p>AVA is now connected to OpenAI's GPT-4 and can provide real-time, intelligent responses about audio-visual equipment and live event production.</p>
                    </div>
                    <div class="voice-settings">
                        <h4>🎤 Voice Settings</h4>
                        <div class="voice-controls">
                            <label for="voice-select">Select Voice:</label>
                            <select id="voice-select" class="voice-select">
                                ${voiceOptions}
                            </select>
                            <button id="test-voice" class="test-voice-btn">
                                <i class="fas fa-play"></i> Test Voice
                            </button>
                        </div>
                        <div class="voice-params">
                            <label for="voice-rate">Speed: <span id="rate-value">0.85</span></label>
                            <input type="range" id="voice-rate" min="0.5" max="2" step="0.1" value="0.85">
                            
                            <label for="voice-pitch">Pitch: <span id="pitch-value">1.1</span></label>
                            <input type="range" id="voice-pitch" min="0.5" max="2" step="0.1" value="1.1">
                            
                            <label for="voice-volume">Volume: <span id="volume-value">0.9</span></label>
                            <input type="range" id="voice-volume" min="0" max="1" step="0.1" value="0.9">
                        </div>
                    </div>
                    <div class="ai-capabilities">
                        <h4>🚀 Current Capabilities</h4>
                        <ul>
                            <li>✅ Real OpenAI GPT-4 responses</li>
                            <li>✅ Equipment-specific information</li>
                            <li>✅ Audio-visual industry expertise</li>
                            <li>✅ Best practices and troubleshooting</li>
                            <li>✅ Voice interaction and speech synthesis</li>
                            <li>✅ Conversation history and context</li>
                        </ul>
                    </div>
                    <div class="ai-security">
                        <h4>🔒 Security & Privacy</h4>
                        <p>All AI interactions are processed securely through our backend server with proper authentication and data protection measures in place.</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        const closeBtn = modal.querySelector('.ai-settings-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Voice settings event listeners
        const voiceSelect = modal.querySelector('#voice-select');
        const testVoiceBtn = modal.querySelector('#test-voice');
        const rateSlider = modal.querySelector('#voice-rate');
        const pitchSlider = modal.querySelector('#voice-pitch');
        const volumeSlider = modal.querySelector('#voice-volume');
        const rateValue = modal.querySelector('#rate-value');
        const pitchValue = modal.querySelector('#pitch-value');
        const volumeValue = modal.querySelector('#volume-value');

        // Update display values
        rateSlider.addEventListener('input', () => {
            rateValue.textContent = rateSlider.value;
        });

        pitchSlider.addEventListener('input', () => {
            pitchValue.textContent = pitchSlider.value;
        });

        volumeSlider.addEventListener('input', () => {
            volumeValue.textContent = volumeSlider.value;
        });

        // Test voice button
        testVoiceBtn.addEventListener('click', () => {
            const selectedVoiceName = voiceSelect.value;
            const testMessage = "Hello! This is AVA, your Audio Visual Assistant. How does my voice sound?";
            this.speakTestMessage(testMessage, selectedVoiceName, rateSlider.value, pitchSlider.value, volumeSlider.value);
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    showPopupBrowser(title, url) {
        const popupBrowser = document.getElementById('ai-popup-browser');
        const popupTitle = document.getElementById('ai-popup-title');
        const popupIframe = document.getElementById('ai-popup-iframe');

        popupTitle.textContent = title;
        popupIframe.src = url;
        popupBrowser.style.display = 'flex';
    }

    closePopupBrowser() {
        const popupBrowser = document.getElementById('ai-popup-browser');
        const popupIframe = document.getElementById('ai-popup-iframe');

        popupIframe.src = 'about:blank';
        popupBrowser.style.display = 'none';
    }

    minimizeChat() {
        const aiTutorChat = document.getElementById('ai-tutor-chat');
        aiTutorChat.style.display = 'none';
    }

    closeChat() {
        this.toggleAITutor();
        this.collapseChat(); // Reset to normal size when closing
    }

    async setCurrentEquipment(equipment) {
        this.currentEquipment = equipment;
        if (this.isActive && equipment) {
            // Use backend API instead of hardcoded message
            try {
                const response = await this.callBackendAPI(`I'm now working with a ${equipment.name} (${equipment.type}). Please introduce yourself and tell me about this equipment.`);
                this.addAIMessage(response);
            } catch (error) {
                console.error('🤖 Error getting equipment introduction:', error);
                // No fallback - let the error propagate
                throw error;
            }
        }
    }

    addTypingIndicator() {
        const chatMessages = document.getElementById('ai-chat-messages');
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'ai-message typing-indicator';
        typingIndicator.id = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    addWebSearchIndicator() {
        const chatMessages = document.getElementById('ai-chat-messages');
        const webSearchIndicator = document.createElement('div');
        webSearchIndicator.className = 'ai-message web-search-indicator';
        webSearchIndicator.id = 'web-search-indicator';
        webSearchIndicator.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-globe"></i>
            </div>
            <div class="ai-message-content">
                <div class="web-search-status">
                    <i class="fas fa-search"></i>
                    <span>Searching the web with GPT-5...</span>
                </div>
            </div>
        `;
        chatMessages.appendChild(webSearchIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    removeWebSearchIndicator() {
        const webSearchIndicator = document.getElementById('web-search-indicator');
        if (webSearchIndicator) {
            webSearchIndicator.remove();
        }
    }

    addPricingSearchIndicator() {
        const chatMessages = document.getElementById('ai-chat-messages');
        const pricingSearchIndicator = document.createElement('div');
        pricingSearchIndicator.className = 'ai-message pricing-search-indicator';
        pricingSearchIndicator.id = 'pricing-search-indicator';
        pricingSearchIndicator.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="ai-message-content">
                <div class="pricing-search-status">
                    <i class="fas fa-search-dollar"></i>
                    <span>Searching for current pricing...</span>
                </div>
            </div>
        `;
        chatMessages.appendChild(pricingSearchIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    removePricingSearchIndicator() {
        const pricingSearchIndicator = document.getElementById('pricing-search-indicator');
        if (pricingSearchIndicator) {
            pricingSearchIndicator.remove();
        }
    }

    stopAISpeech() {
        if (this.synthesis) {
            try {
                console.log('🎤 Stopping AI speech immediately');
                this.synthesis.cancel();
                this.hideVoiceStatus();
            } catch (error) {
                console.error('🎤 Error stopping AI speech:', error);
            }
        }
    }

    showVoiceClickIndicator() {
        const status = this.isVoiceMode ? 'Voice mode active' : 'Voice mode inactive';
        this.showVoiceStatus(status);

        // Auto-hide after 2 seconds
        setTimeout(() => {
            this.hideVoiceStatus();
        }, 2000);
    }

    showVoiceStatus(message) {
        // Remove existing status indicator
        this.hideVoiceStatus();

        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'voice-status-indicator';
        statusIndicator.id = 'voice-status-indicator';

        const icon = this.isVoiceMode ? 'fa-microphone' : 'fa-microphone-slash';
        statusIndicator.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(statusIndicator);
    }

    hideVoiceStatus() {
        const statusIndicator = document.getElementById('voice-status-indicator');
        if (statusIndicator) {
            statusIndicator.remove();
        }
    }

    extractUrls(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(urlRegex);
        let urls = matches ? matches.slice(0, 3) : []; // Limit to 3 URLs

        // Clean up URLs by removing trailing punctuation
        urls = urls.map(url => {
            // Remove trailing punctuation that's not part of the URL
            return url.replace(/[.,;:!?)\]}>]+$/, '');
        });

        console.log('Extracted URLs from text:', urls);
        return urls;
    }

    createWebContentSection(urls) {
        const backendUrl = this.backendUrl || '';
        const itemsHtml = urls.map((url) => {
            const domain = this.getDomainFromUrl(url);
            const isImage = this.isImageUrl(url);
            const itemId = `web-item-${Math.random().toString(36).slice(2)}`;

            // Base skeleton; we will fetch preview asynchronously and replace thumbnail
            const base = `
                <div class="web-content-item" id="${itemId}" data-url="${url}">
                    <div class="web-content-header">
                        <i class="fas ${isImage ? 'fa-image' : 'fa-globe'}"></i>
                        <span class="web-content-domain">${domain}</span>
                        <a href="${url}" target="_blank" class="web-content-link" title="Open in new tab">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                        <button class="web-content-toggle" onclick="this.parentElement.parentElement.classList.toggle('expanded')">
                            <i class="fas fa-expand-alt"></i>
                        </button>
                    </div>
                    <div class="web-content-preview">
                        ${isImage ?
                    `<div class="image-preview">
                                <img src="${url}" alt="Image" onerror="this.parentElement.innerHTML='<div class=\\'preview-error\\'><i class=\\'fas fa-image\\'></i><span>Image not available</span></div>'">
                            </div>` :
                    `<div class="website-preview">
                                <div class="preview-placeholder">
                                    <i class="fas fa-globe"></i>
                                    <span>${domain}</span>
                                    <a href="${url}" target="_blank" class="preview-link">Open Website</a>
                                </div>
                            </div>`
                }
                    </div>
                </div>`;

            // Add to queue and process
            this.linkPreviewQueue.push({
                itemId,
                url,
                domain,
                isImage,
                backendUrl
            });

            // Start processing queue if not already processing
            if (!this.isProcessingLinkPreview) {
                this.processLinkPreviewQueue();
            }

            return base;
        }).join('');

        return `
            <div class="web-content-section">
                <div class="web-content-title">
                    <i class="fas fa-external-link-alt"></i>
                    <span>Related Links & Resources</span>
                </div>
                <div class="web-content-list">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    getDomainFromUrl(url) {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            return domain.length > 20 ? domain.substring(0, 20) + '...' : domain;
        } catch {
            return 'Unknown';
        }
    }

    isImageUrl(url) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        return imageExtensions.some(ext => url.toLowerCase().includes(ext));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    expandChatForWebContent() {
        const aiTutorChat = document.getElementById('ai-tutor-chat');
        const collapseBtn = document.getElementById('ai-chat-collapse');

        if (aiTutorChat) {
            aiTutorChat.classList.add('expanded');
            aiTutorChat.style.width = '600px';
            aiTutorChat.style.height = '700px';
        }

        if (collapseBtn) {
            collapseBtn.style.display = 'flex';
        }
    }

    collapseChat() {
        const aiTutorChat = document.getElementById('ai-tutor-chat');
        const collapseBtn = document.getElementById('ai-chat-collapse');

        if (aiTutorChat) {
            aiTutorChat.classList.remove('expanded');
            aiTutorChat.style.width = '';
            aiTutorChat.style.height = '';
        }

        if (collapseBtn) {
            collapseBtn.style.display = 'none';
        }
    }

    formatMessageForDisplay(message) {
        // Convert URLs to clickable links
        let formattedMessage = message.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" class="message-link">$1</a>'
        );

        // Convert markdown-style formatting
        formattedMessage = formattedMessage
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic text
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Headers
            .replace(/^### (.*$)/gm, '<h4>$1</h4>')
            .replace(/^## (.*$)/gm, '<h3>$1</h3>')
            .replace(/^# (.*$)/gm, '<h2>$1</h2>')
            // Lists
            .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        // Wrap in paragraphs if not already wrapped
        if (!formattedMessage.includes('<p>')) {
            formattedMessage = `<p>${formattedMessage}</p>`;
        }

        return formattedMessage;
    }

    formatMessageForSpeech(message) {
        // Remove URLs completely for speech
        let speechText = message.replace(/(https?:\/\/[^\s]+)/g, '');

        // Remove markdown formatting but keep the text content
        speechText = speechText
            // Remove bold/italic markers but keep text
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            // Remove header markers but keep text
            .replace(/^### (.*$)/gm, '$1')
            .replace(/^## (.*$)/gm, '$1')
            .replace(/^# (.*$)/gm, '$1')
            // Remove list markers but keep text
            .replace(/^\d+\. (.*$)/gm, '$1')
            .replace(/^- (.*$)/gm, '$1')
            // Clean up extra whitespace
            .replace(/\n\s*\n/g, '. ')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Remove any remaining special characters that might cause speech issues
        speechText = speechText
            .replace(/[<>]/g, '') // Remove HTML-like tags
            .replace(/[^\w\s.,!?;:()\-'"]/g, '') // Keep only readable characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        return speechText;
    }

    addAIMessage(message) {
        const chatMessages = document.getElementById('ai-chat-messages');
        const aiMessage = document.createElement('div');
        aiMessage.className = 'ai-message';

        // Check if message contains URLs
        const urls = this.extractUrls(message);
        const hasUrls = urls.length > 0;

        // Format the message for better readability (display version)
        const formattedMessage = this.formatMessageForDisplay(message);

        // Create clean version for speech synthesis
        const speechText = this.formatMessageForSpeech(message);

        aiMessage.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-message-content">
                <div class="ai-message-text">${formattedMessage}</div>
                ${hasUrls ? this.createWebContentSection(urls) : ''}
            </div>
        `;

        chatMessages.appendChild(aiMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        this.chatHistory.push({ role: 'assistant', content: message });

        // Speak the cleaned response if in voice mode
        if (this.isVoiceMode && speechText) {
            this.speakMessage(speechText);
        }

        // Expand chat window if URLs are present
        if (hasUrls) {
            this.expandChatForWebContent();
        }
    }

    speakMessage(message) {
        if (this.synthesis && this.isVoiceMode) {
            this.speakWithSettings(message);
        }
    }

    speakTestMessage(message, voiceName, rate, pitch, volume) {
        if (this.synthesis) {
            this.speakWithSettings(message, voiceName, rate, pitch, volume);
        }
    }

    speakWithSettings(message, voiceName = null, rate = 0.85, pitch = 1.1, volume = 0.9) {
        if (!this.synthesis) return;

        // Get available voices and select the best one
        const voices = this.synthesis.getVoices();
        let selectedVoice = null;

        if (voiceName) {
            // Use the specified voice
            selectedVoice = voices.find(voice => voice.name === voiceName);
        } else {
            // Try to find a voice for the current language
            const languageCode = this.languageMap[this.currentLanguage].voice;
            selectedVoice = voices.find(voice => voice.lang.startsWith(languageCode.split('-')[0]));
            
            // If no voice found for current language, fall back to English
            if (!selectedVoice) {
                const preferredVoices = [
                    'Google UK English Female',
                    'Google UK English Male',
                    'Google US English Female',
                    'Google US English Male',
                    'Samantha',
                    'Alex',
                    'Victoria',
                    'Daniel'
                ];

                // First try to find a preferred voice
                for (const preferredVoiceName of preferredVoices) {
                    selectedVoice = voices.find(voice => voice.name === preferredVoiceName);
                    if (selectedVoice) break;
                }

                // If no preferred voice found, try to find any natural-sounding voice
                if (!selectedVoice) {
                    selectedVoice = voices.find(voice =>
                        voice.name.includes('Google') ||
                        voice.name.includes('Samantha') ||
                        voice.name.includes('Alex') ||
                        voice.name.includes('Victoria') ||
                        voice.name.includes('Daniel')
                    );
                }

                // If still no voice found, use the first available
                if (!selectedVoice && voices.length > 0) {
                    selectedVoice = voices[0];
                }
            }
        }

        const utterance = new SpeechSynthesisUtterance(message);

        // Set voice if found
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log('🎤 Using voice:', selectedVoice.name);
        }

        // Set speech parameters
        utterance.rate = parseFloat(rate);
        utterance.pitch = parseFloat(pitch);
        utterance.volume = parseFloat(volume);

        // Add event listeners for better control
        utterance.onstart = () => {
            console.log('🎤 Speech started');
            this.showVoiceStatus('Speaking...');
            // Pause voice recognition to prevent feedback loop
            this.pauseVoiceRecognition();
        };

        utterance.onend = () => {
            console.log('🎤 Speech ended');
            this.hideVoiceStatus();
            // Resume voice recognition after AI finishes speaking
            this.resumeVoiceRecognition();
        };

        utterance.onerror = (event) => {
            console.error('🎤 Speech error:', event.error);
            this.hideVoiceStatus();
            // Resume voice recognition even if speech fails
            this.resumeVoiceRecognition();
        };

        // Stop any current speech before starting new one
        this.synthesis.cancel();

        // Start speaking
        this.synthesis.speak(utterance);
    }

    showVoiceStatus(status) {
        const voiceStatus = document.getElementById('voice-status');
        if (voiceStatus) {
            voiceStatus.textContent = status;
            voiceStatus.style.display = 'block';
        }
    }

    hideVoiceStatus() {
        const voiceStatus = document.getElementById('voice-status');
        if (voiceStatus) {
            voiceStatus.style.display = 'none';
        }
    }

    showProgressSpinner() {
        const chatMessages = document.getElementById('ai-chat-messages');
        if (!chatMessages) return;

        // Remove any existing spinner
        this.hideProgressSpinner();

        const spinnerMessage = document.createElement('div');
        spinnerMessage.className = 'ai-message progress-spinner-message';
        spinnerMessage.id = 'progress-spinner';

        spinnerMessage.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-message-content">
                <div class="progress-spinner-container">
                    <div class="progress-spinner"></div>
                    <div class="progress-text">AI is thinking...</div>
                </div>
            </div>
        `;

        chatMessages.appendChild(spinnerMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideProgressSpinner() {
        const spinner = document.getElementById('progress-spinner');
        if (spinner) {
            spinner.remove();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Test function for debugging link preview
    async testLinkPreview() {
        console.log('Testing link preview functionality...');
        const testUrl = 'https://www.amazon.com';
        const backendUrl = this.backendUrl || '';

        try {
            console.log('Testing backend health...');
            const healthCheck = await fetch(`${backendUrl}/health`);
            console.log('Health check status:', healthCheck.status);

            console.log('Testing link preview API...');
            const resp = await fetch(`${backendUrl}/api/ai/link-preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: testUrl })
            });

            console.log('Link preview response status:', resp.status);
            const data = await resp.json();
            console.log('Link preview data:', data);

            return data;
        } catch (error) {
            console.error('Link preview test failed:', error);
            return null;
        }
    }

    async processLinkPreviewQueue() {
        if (this.isProcessingLinkPreview || this.linkPreviewQueue.length === 0) {
            return;
        }

        this.isProcessingLinkPreview = true;
        console.log(`🔄 Processing link preview queue (${this.linkPreviewQueue.length} items)`);

        while (this.linkPreviewQueue.length > 0) {
            const item = this.linkPreviewQueue.shift();
            await this.fetchLinkPreview(item);

            // Add delay between requests to prevent overwhelming the backend
            if (this.linkPreviewQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
            }
        }

        this.isProcessingLinkPreview = false;
        console.log('✅ Link preview queue processing complete');
    }

    async fetchLinkPreview({ itemId, url, domain, isImage, backendUrl }) {
        try {
            const el = document.getElementById(itemId);
            if (!el || isImage) return; // no preview needed for direct images

            // Show loading state for link preview
            const previewContainer = el.querySelector('.website-preview .preview-placeholder');
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <div class="link-preview-loading">
                        <div class="link-preview-spinner"></div>
                        <div class="link-preview-loading-text">Loading preview...</div>
                    </div>`;
            }

            console.log('Fetching link preview for:', url);

            // Add timeout to prevent stuck loading state
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.warn('Link preview timeout for:', url);
                controller.abort();
            }, 8000); // 8 second timeout

            console.log('Making link preview request to:', `${backendUrl}/api/ai/link-preview`);

            let resp;
            try {
                resp = await fetch(`${backendUrl}/api/ai/link-preview`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url }),
                    signal: controller.signal
                });
            } catch (fetchError) {
                console.error('Fetch error details:', fetchError);
                throw fetchError;
            }

            clearTimeout(timeoutId);
            console.log('Link preview response status:', resp.status);

            if (!resp.ok) {
                console.warn('Link preview response not ok:', resp.status);
                // Show fallback state instead of leaving loading
                if (previewContainer) {
                    previewContainer.innerHTML = `
                        <div class="preview-placeholder">
                            <i class="fas fa-globe"></i>
                            <span>${domain}</span>
                            <a href="${url}" target="_blank" class="preview-link">Open Website</a>
                        </div>`;
                }
                return;
            }

            const data = await resp.json();
            console.log('Link preview data:', data);
            const preview = data.preview || {};

            if (previewContainer) {
                const imgHtml = preview.image ? `<img src="${preview.image}" alt="${domain}" class="link-thumb" onerror="this.remove()">` : '';
                const faviconHtml = preview.favicon ? `<img src="${preview.favicon}" class="favicon" alt="">` : '';
                previewContainer.innerHTML = `
                    <div class="link-preview-card">
                        <div class="link-preview-media">${imgHtml}</div>
                        <div class="link-preview-meta">
                            <div class="link-preview-title">${this.escapeHtml(preview.title || domain)}</div>
                            <div class="link-preview-domain">${faviconHtml}<span>${domain}</span></div>
                            ${preview.description ? `<div class="link-preview-desc">${this.escapeHtml(preview.description)}</div>` : ''}
                            <a href="${url}" target="_blank" class="preview-link">Open Website</a>
                        </div>
                    </div>`;
                console.log('Link preview updated for:', url);
            }
        } catch (e) {
            console.warn('Link preview fetch failed:', e);
            // Show fallback state on error
            const el = document.getElementById(itemId);
            if (el) {
                const previewContainer = el.querySelector('.website-preview .preview-placeholder');
                if (previewContainer) {
                    previewContainer.innerHTML = `
                        <div class="preview-placeholder">
                            <i class="fas fa-globe"></i>
                            <span>${domain}</span>
                            <a href="${url}" target="_blank" class="preview-link">Open Website</a>
                        </div>`;
                }
            }
        }
    }
}
