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
        this.currentConversationId = null;
        this.backendUrl = 'http://localhost:3001';

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

            // Try backend API first, fallback to local responses
            try {
                return await this.callBackendAPI(userMessage);
            } catch (apiError) {
                console.log('Backend API unavailable, using local responses:', apiError.message);
                return this.getIntelligentResponse(userMessage);
            }
        } catch (error) {
            console.error('🤖 Error generating AI response:', error);
            // Fallback to predefined responses if anything fails
            return this.getFallbackResponse(userMessage);
        }
    }

    async callBackendAPI(userMessage) {
        const backendUrl = 'http://localhost:3001'; // Backend API URL
        
        try {
            // Get current conversation ID or start new one
            let conversationId = this.currentConversationId;
            if (!conversationId) {
                const sessionResponse = await fetch(`${backendUrl}/api/ai/conversation/start`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.getAuthToken()}`
                    },
                    body: JSON.stringify({
                        sessionId: this.getCurrentSessionId()
                    })
                });

                if (!sessionResponse.ok) {
                    throw new Error('Failed to start conversation');
                }

                const sessionData = await sessionResponse.json();
                conversationId = sessionData.conversation_id;
                this.currentConversationId = conversationId;
            }

            // Send message to backend
            const response = await fetch(`${backendUrl}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationId: conversationId,
                    equipmentContext: this.currentEquipment
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Backend API error');
            }

            const data = await response.json();
            return data.response;

        } catch (error) {
            console.error('Backend API call failed:', error);
            throw new Error(`Backend API unavailable: ${error.message}`);
        }
    }

    async callChatGPTAPI(userMessage) {
        // For security, we'll use a backend proxy instead of direct API calls
        // This would require a server-side implementation
        throw new Error('API calls require a secure backend proxy. Using fallback responses for now.');
    }

    getAuthToken() {
        // Get JWT token from localStorage (set by login)
        return localStorage.getItem('auth_token');
    }

    getCurrentSessionId() {
        // Get current game session ID
        return localStorage.getItem('game_session_id');
    }

    getAPIKey() {
        // For security reasons, we don't store API keys in the browser
        // Instead, we'll use a backend proxy or fallback to predefined responses
        return null;
    }

    showAPISettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'ai-settings-modal';
        modal.innerHTML = `
            <div class="ai-settings-content">
                <div class="ai-settings-header">
                    <h3><i class="fas fa-shield-alt"></i> AI Tutor Security Notice</h3>
                    <button class="ai-settings-close">&times;</button>
                </div>
                <div class="ai-settings-body">
                    <div class="security-notice">
                        <h4>🔒 Security First</h4>
                        <p>For security reasons, the AI Tutor currently uses intelligent fallback responses instead of external API calls. This protects your privacy and ensures no sensitive data is transmitted.</p>
                    </div>
                    <div class="ai-capabilities">
                        <h4>🤖 Current AI Capabilities</h4>
                        <ul>
                            <li>✅ Equipment information and explanations</li>
                            <li>✅ Audio-visual industry knowledge</li>
                            <li>✅ Best practices and troubleshooting</li>
                            <li>✅ Real-world equipment shopping links</li>
                            <li>✅ Voice interaction and speech synthesis</li>
                        </ul>
                    </div>
                    <div class="future-enhancement">
                        <h4>🚀 Future Enhancement</h4>
                        <p>To enable full ChatGPT integration, a secure backend proxy would need to be implemented. This would:</p>
                        <ul>
                            <li>Keep API keys secure on the server</li>
                            <li>Protect user privacy</li>
                            <li>Provide enhanced AI responses</li>
                        </ul>
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

    getIntelligentResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // Check for equipment-related queries
        if (this.currentEquipment) {
            if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('explain')) {
                return this.handleEquipmentInfoQuery();
            }
        }

        // Enhanced keyword matching with context awareness
        if (lowerMessage.includes('microphone') || lowerMessage.includes('mic')) {
            return this.getMicrophoneInfo();
        }
        if (lowerMessage.includes('speaker') || lowerMessage.includes('audio') || lowerMessage.includes('sound')) {
            return this.getSpeakerInfo();
        }
        if (lowerMessage.includes('light') || lowerMessage.includes('dmx') || lowerMessage.includes('illumination')) {
            return this.getLightingInfo();
        }
        if (lowerMessage.includes('cable') || lowerMessage.includes('connection') || lowerMessage.includes('wire')) {
            return this.getCableInfo();
        }
        if (lowerMessage.includes('mixer') || lowerMessage.includes('console') || lowerMessage.includes('mixing')) {
            return this.getMixerInfo();
        }
        if (lowerMessage.includes('camera') || lowerMessage.includes('video') || lowerMessage.includes('recording')) {
            return this.getVideoInfo();
        }
        if (lowerMessage.includes('projector') || lowerMessage.includes('display') || lowerMessage.includes('screen')) {
            return this.getProjectorInfo();
        }
        if (lowerMessage.includes('wireless') || lowerMessage.includes('bluetooth') || lowerMessage.includes('radio')) {
            return this.getWirelessInfo();
        }
        if (lowerMessage.includes('power') || lowerMessage.includes('electrical') || lowerMessage.includes('voltage')) {
            return this.getPowerInfo();
        }
        if (lowerMessage.includes('troubleshoot') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
            return this.getTroubleshootingInfo();
        }

        // Default response
        return this.getDefaultResponse();
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

    getMixerInfo() {
        return `Mixing consoles are the heart of audio production:

• Analog mixers: Traditional knobs and faders for hands-on control
• Digital mixers: Advanced features with recall and automation
• Live sound mixers: Optimized for real-time performance mixing
• Recording mixers: Studio-grade preamps and processing
• Monitor mixers: Dedicated to stage monitoring systems

Key features include EQ, compression, effects, and routing capabilities.`;
    }

    getVideoInfo() {
        return `Video equipment is essential for modern productions:

• Professional cameras: High-quality recording and streaming
• PTZ cameras: Remote-controlled pan/tilt/zoom for live events
• Video switchers: Seamless transitions between multiple sources
• Video recorders: Capture and playback of video content
• Streaming encoders: Real-time video distribution online

Modern video systems support 4K, HDR, and various streaming protocols.`;
    }

    getProjectorInfo() {
        return `Projectors and displays create visual impact:

• Video projectors: Large-scale image projection for audiences
• LED displays: Bright, high-contrast screens for any environment
• Video walls: Multiple displays combined for massive visuals
• Interactive displays: Touch-enabled screens for engagement
• Video processors: Signal management and image enhancement

Consider brightness, resolution, and throw distance for optimal setup.`;
    }

    getWirelessInfo() {
        return `Wireless technology provides freedom of movement:

• Wireless microphones: Freedom for performers and presenters
• Wireless in-ear monitors: Personal monitoring without cables
• Wireless video transmission: Camera feeds without physical connections
• Wireless control systems: Remote operation of equipment
• Frequency coordination: Managing multiple wireless devices

Always check frequency compatibility and local regulations.`;
    }

    getPowerInfo() {
        return `Power management is critical for reliable operation:

• Power distribution: Safe electrical supply to all equipment
• UPS systems: Uninterruptible power for critical systems
• Power conditioners: Clean, stable power for sensitive equipment
• Grounding: Proper electrical safety and noise reduction
• Load calculation: Ensuring adequate power capacity

Always use professional-grade power equipment for live events.`;
    }

    getTroubleshootingInfo() {
        return `Common AV troubleshooting techniques:

• Check connections: Ensure all cables are properly seated
• Power cycle: Restart equipment to clear temporary issues
• Signal flow: Trace audio/video from source to destination
• Ground loops: Identify and eliminate electrical interference
• Frequency conflicts: Resolve wireless interference issues

Systematic troubleshooting saves time and prevents further problems.`;
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
