// AI Tutor Module
// Handles AI chat functionality, voice recognition, and equipment information display

export class AITutor {
    constructor() {
        this.isActive = false;
        this.isVoiceMode = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentEquipment = null;
        this.chatHistory = [];

        this.init();
    }

    init() {
        this.setupVoiceRecognition();
        this.setupEventListeners();
        console.log('🤖 AI Tutor initialized');
    }

    setupVoiceRecognition() {
        // Check if browser supports speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

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
                // Restart if still in voice mode
                if (this.isVoiceMode && this.isActive) {
                    this.startVoiceRecognition();
                }
            };
        } else {
            console.warn('🎤 Voice recognition not supported in this browser');
        }
    }

    setupEventListeners() {
        // AI Tutor toggle button
        const aiTutorToggle = document.getElementById('ai-tutor-toggle');
        if (aiTutorToggle) {
            aiTutorToggle.addEventListener('click', () => this.toggleAITutor());
        }

        // Voice toggle button
        const aiVoiceToggle = document.getElementById('ai-voice-toggle');
        if (aiVoiceToggle) {
            aiVoiceToggle.addEventListener('click', () => this.toggleVoiceMode());
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

        // Chat input
        const aiChatInput = document.getElementById('ai-chat-input-field');
        if (aiChatInput) {
            aiChatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        const aiChatSend = document.getElementById('ai-chat-send');
        if (aiChatSend) {
            aiChatSend.addEventListener('click', () => this.sendMessage());
        }

        // Popup browser close
        const aiPopupClose = document.getElementById('ai-popup-close');
        if (aiPopupClose) {
            aiPopupClose.addEventListener('click', () => this.closePopupBrowser());
        }
    }

    toggleAITutor() {
        this.isActive = !this.isActive;
        const aiTutorToggle = document.getElementById('ai-tutor-toggle');
        const aiVoiceToggle = document.getElementById('ai-voice-toggle');
        const aiTutorChat = document.getElementById('ai-tutor-chat');

        if (this.isActive) {
            aiTutorToggle.classList.add('active');
            aiTutorToggle.querySelector('.ai-status').textContent = 'ON';
            aiVoiceToggle.style.display = 'flex';
            aiTutorChat.style.display = 'flex';
            console.log('🤖 AI Tutor activated');
        } else {
            aiTutorToggle.classList.remove('active');
            aiTutorToggle.querySelector('.ai-status').textContent = 'OFF';
            aiVoiceToggle.style.display = 'none';
            aiTutorChat.style.display = 'none';
            this.stopVoiceRecognition();
            console.log('🤖 AI Tutor deactivated');
        }
    }

    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        const aiVoiceToggle = document.getElementById('ai-voice-toggle');
        const aiChatVoice = document.getElementById('ai-chat-voice');

        if (this.isVoiceMode) {
            aiVoiceToggle.classList.add('active');
            aiVoiceToggle.querySelector('.voice-status').textContent = 'VOICE';
            aiChatVoice.classList.add('active');
            this.startVoiceRecognition();
            console.log('🎤 Voice mode activated');
        } else {
            aiVoiceToggle.classList.remove('active');
            aiVoiceToggle.querySelector('.voice-status').textContent = 'VOICE';
            aiChatVoice.classList.remove('active');
            this.stopVoiceRecognition();
            console.log('🎤 Voice mode deactivated');
        }
    }

    startVoiceRecognition() {
        if (this.recognition && this.isActive && this.isVoiceMode) {
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
        this.hideVoiceStatus();
    }

    handleVoiceInput(transcript) {
        this.addUserMessage(transcript);
        this.processAIResponse(transcript);
    }

    sendMessage() {
        const inputField = document.getElementById('ai-chat-input-field');
        const message = inputField.value.trim();

        if (message) {
            this.addUserMessage(message);
            this.processAIResponse(message);
            inputField.value = '';
        }
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
        aiMessage.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-message-content">
                <p>${message}</p>
            </div>
        `;
        chatMessages.appendChild(aiMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        this.chatHistory.push({ role: 'assistant', content: message });

        // Speak the response if in voice mode
        if (this.isVoiceMode) {
            this.speakMessage(message);
        }
    }

    async processAIResponse(userMessage) {
        // Show typing indicator
        this.addTypingIndicator();

        try {
            // Simulate AI processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Remove typing indicator
            this.removeTypingIndicator();

            // Generate AI response based on user message
            const response = await this.generateAIResponse(userMessage);
            this.addAIMessage(response);

        } catch (error) {
            console.error('🤖 Error processing AI response:', error);
            this.removeTypingIndicator();
            this.addAIMessage('I apologize, but I encountered an error processing your request. Please try again.');
        }
    }

    async generateAIResponse(userMessage) {
        try {
            // First, check for equipment-specific actions that don't need API calls
            if (this.currentEquipment) {
                const lowerMessage = userMessage.toLowerCase();
                if (lowerMessage.includes('show') || lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
                    return this.handleEquipmentPurchaseQuery();
                }
            }

            // Use ChatGPT API for all other responses
            return await this.callChatGPTAPI(userMessage);
        } catch (error) {
            console.error('🤖 Error generating AI response:', error);
            // Fallback to predefined responses if API fails
            return this.getFallbackResponse(userMessage);
        }
    }

    async callChatGPTAPI(userMessage) {
        const apiKey = this.getAPIKey();
        if (!apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const systemPrompt = this.buildSystemPrompt();
        const messages = this.buildMessageHistory(userMessage);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Using GPT-4o (latest model)
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    getAPIKey() {
        // Check for API key in localStorage
        let apiKey = localStorage.getItem('openai_api_key');
        
        // If not in localStorage, show settings modal
        if (!apiKey) {
            this.showAPISettingsModal();
            return null;
        }
        
        return apiKey;
    }

    showAPISettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'ai-settings-modal';
        modal.innerHTML = `
            <div class="ai-settings-content">
                <div class="ai-settings-header">
                    <h3><i class="fas fa-cog"></i> AI Tutor Settings</h3>
                    <button class="ai-settings-close">&times;</button>
                </div>
                <div class="ai-settings-body">
                    <p>To use the AI Tutor with ChatGPT, you need to provide your OpenAI API key.</p>
                    <div class="api-key-input">
                        <label for="api-key-input">OpenAI API Key:</label>
                        <input type="password" id="api-key-input" placeholder="sk-..." />
                        <button id="save-api-key" class="save-btn">Save API Key</button>
                    </div>
                    <div class="api-key-info">
                        <p><strong>How to get an API key:</strong></p>
                        <ol>
                            <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a></li>
                            <li>Sign in or create an account</li>
                            <li>Click "Create new secret key"</li>
                            <li>Copy the key and paste it above</li>
                        </ol>
                        <p><small>Your API key is stored locally and never shared.</small></p>
                    </div>
                    <div class="api-key-actions">
                        <button id="use-fallback" class="fallback-btn">Use Fallback Mode (No API)</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        const closeBtn = modal.querySelector('.ai-settings-close');
        const saveBtn = modal.querySelector('#save-api-key');
        const fallbackBtn = modal.querySelector('#use-fallback');
        const apiKeyInput = modal.querySelector('#api-key-input');

        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        saveBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey && apiKey.startsWith('sk-')) {
                localStorage.setItem('openai_api_key', apiKey);
                document.body.removeChild(modal);
                this.addAIMessage('API key saved! You can now use the full AI Tutor functionality.');
            } else {
                alert('Please enter a valid OpenAI API key (starts with sk-)');
            }
        });

        fallbackBtn.addEventListener('click', () => {
            localStorage.setItem('ai_tutor_fallback_mode', 'true');
            document.body.removeChild(modal);
            this.addAIMessage('Using fallback mode. Some features may be limited, but I can still help with basic questions.');
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    buildSystemPrompt() {
        let prompt = `You are an expert AI tutor specializing in audio-visual equipment and live event production. You have extensive knowledge of:

- Professional audio equipment (microphones, speakers, mixing consoles, amplifiers)
- Video equipment (cameras, projectors, displays, streaming gear)
- Lighting systems (LED fixtures, moving lights, DMX control)
- Cables and connectors (XLR, DMX, HDMI, power, etc.)
- Live event production best practices
- Industry standards and protocols
- Troubleshooting common AV issues

Current context: `;

        if (this.currentEquipment) {
            prompt += `The user is currently working with a ${this.currentEquipment.name} (${this.currentEquipment.type}) in an AV learning game. `;
        }

        prompt += `

Provide helpful, educational responses that:
- Are concise but informative (max 2-3 sentences)
- Use simple language suitable for learners
- Include practical tips when relevant
- Reference real-world applications
- Encourage further learning

If the user asks about purchasing equipment, suggest they ask "show me where to buy [equipment name]" to see shopping results.`;

        return prompt;
    }

    buildMessageHistory(userMessage) {
        const messages = [
            { role: 'system', content: this.buildSystemPrompt() }
        ];

        // Add recent chat history for context (last 5 exchanges)
        const recentHistory = this.chatHistory.slice(-10);
        messages.push(...recentHistory);

        // Add current user message
        messages.push({ role: 'user', content: userMessage });

        return messages;
    }

    getFallbackResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // Check for equipment-related queries
        if (this.currentEquipment) {
            if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('explain')) {
                return this.handleEquipmentInfoQuery();
            }
        }

        // General AV industry knowledge
        if (lowerMessage.includes('microphone') || lowerMessage.includes('mic')) {
            return this.getMicrophoneInfo();
        }
        if (lowerMessage.includes('speaker') || lowerMessage.includes('audio')) {
            return this.getSpeakerInfo();
        }
        if (lowerMessage.includes('light') || lowerMessage.includes('dmx')) {
            return this.getLightingInfo();
        }
        if (lowerMessage.includes('cable') || lowerMessage.includes('connection')) {
            return this.getCableInfo();
        }

        // Default response
        return this.getDefaultResponse();
    }

    handleEquipmentPurchaseQuery() {
        const equipmentName = this.currentEquipment.name;
        const searchQuery = encodeURIComponent(`${equipmentName} professional audio visual equipment`);
        const searchUrl = `https://www.google.com/search?q=${searchQuery}&tbm=shop`;

        this.showPopupBrowser(`Where to buy ${equipmentName}`, searchUrl);

        return `I've opened a browser window showing where you can purchase ${equipmentName}. You can find professional-grade equipment from reputable audio-visual suppliers.`;
    }

    handleEquipmentInfoQuery() {
        const equipmentName = this.currentEquipment.name;
        const equipmentType = this.currentEquipment.type;

        return `The ${equipmentName} is a ${equipmentType} commonly used in professional audio-visual setups. It's designed for ${this.getEquipmentDescription(equipmentType)}. Would you like me to show you where to purchase this equipment?`;
    }

    getEquipmentDescription(type) {
        const descriptions = {
            'microphone': 'capturing high-quality audio in live performance and recording environments',
            'speaker': 'reproducing clear, powerful sound for audiences of various sizes',
            'mixing-console': 'controlling and mixing multiple audio sources for live events',
            'light-fixture': 'providing dynamic lighting effects and stage illumination',
            'camera': 'capturing high-definition video for live streaming and recording',
            'projector': 'displaying visual content on large screens or surfaces'
        };
        return descriptions[type] || 'professional audio-visual applications';
    }

    getMicrophoneInfo() {
        return `Microphones are essential tools in audio production. There are several types:

• Dynamic microphones: Rugged, great for live vocals and instruments
• Condenser microphones: Sensitive, excellent for studio recording
• Wireless microphones: Freedom of movement for performers
• Shotgun microphones: Directional pickup for film and broadcast

Each type has specific applications and characteristics. What would you like to know more about?`;
    }

    getSpeakerInfo() {
        return `Speakers are crucial for sound reproduction in any audio system:

• Main speakers: Primary sound reinforcement for the audience
• Monitor speakers: Stage monitors for performers to hear themselves
• Subwoofers: Low-frequency reproduction for bass and impact
• Line arrays: Large-scale sound systems for big venues

Proper speaker placement and configuration are essential for optimal sound quality.`;
    }

    getLightingInfo() {
        return `Lighting is a key component of live event production:

• LED fixtures: Energy-efficient, color-changing capabilities
• Moving lights: Automated fixtures for dynamic effects
• DMX control: Digital protocol for lighting automation
• Wash lights: Broad coverage for general illumination
• Spot lights: Focused beams for highlighting performers

Lighting design can dramatically enhance the visual impact of any event.`;
    }

    getCableInfo() {
        return `Cables are the backbone of any audio-visual system:

• XLR cables: Balanced audio connections for microphones and speakers
• Power cables: Electrical supply for equipment
• DMX cables: Lighting control and automation
• HDMI cables: High-definition video and audio transmission
• Ethernet cables: Network connectivity and digital audio

Proper cable management and quality are essential for reliable performance.`;
    }

    getDefaultResponse() {
        return `I'm here to help you learn about audio-visual equipment and the live events industry! 

You can ask me about:
• Specific equipment and its functions
• Where to purchase professional gear
• Best practices for setup and operation
• Industry standards and protocols
• Troubleshooting common issues

What would you like to know more about?`;
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
    }

    setCurrentEquipment(equipment) {
        this.currentEquipment = equipment;
        if (this.isActive && equipment) {
            this.addAIMessage(`I see you're working with a ${equipment.name}. I can help you understand this equipment, show you where to buy it, or answer any questions you have about it.`);
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

    speakMessage(message) {
        if (this.synthesis) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            this.synthesis.speak(utterance);
        }
    }

    showVoiceStatus(text) {
        const voiceStatusIndicator = document.getElementById('voice-status-indicator');
        const voiceStatusText = document.getElementById('voice-status-text');

        voiceStatusText.textContent = text;
        voiceStatusIndicator.style.display = 'flex';
    }

    hideVoiceStatus() {
        const voiceStatusIndicator = document.getElementById('voice-status-indicator');
        voiceStatusIndicator.style.display = 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
