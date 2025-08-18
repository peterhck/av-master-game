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
        const lowerMessage = userMessage.toLowerCase();
        
        // Check for equipment-related queries
        if (this.currentEquipment) {
            if (lowerMessage.includes('show') || lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
                return this.handleEquipmentPurchaseQuery();
            }
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
