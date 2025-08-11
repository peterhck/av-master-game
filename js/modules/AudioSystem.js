// Audio System Module
// Handles all audio-related functionality including Web Audio API, sound effects, and real audio

export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.microphoneStream = null;
        this.audioAnalyser = null;
        this.audioSource = null;
        this.isAudioActive = false;
        this.audioAnimationFrame = null;

        this.initAudio();
    }

    /**
     * Initialize the audio context
     */
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioAnalyser = this.audioContext.createAnalyser();
            this.audioAnalyser.fftSize = 256;
        } catch (e) {
            console.log('Audio context not supported');
        }
    }

    /**
     * Request microphone access
     */
    async requestMicrophoneAccess() {
        try {
            this.microphoneStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
            return true;
        } catch (error) {
            console.log('Microphone access denied:', error);
            return false;
        }
    }

    /**
     * Start real audio processing
     */
    async startRealAudio() {
        if (!this.audioContext || !this.microphoneStream) return;

        try {
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.audioSource = this.audioContext.createMediaStreamSource(this.microphoneStream);
            this.audioSource.connect(this.audioAnalyser);
            this.audioAnalyser.connect(this.audioContext.destination);

            this.isAudioActive = true;
            this.animateAudioOutput();

            return true;
        } catch (error) {
            console.log('Error starting real audio:', error);
            return false;
        }
    }

    /**
     * Stop real audio processing
     */
    stopRealAudio() {
        if (this.audioAnimationFrame) {
            cancelAnimationFrame(this.audioAnimationFrame);
            this.audioAnimationFrame = null;
        }

        if (this.audioSource) {
            this.audioSource.disconnect();
            this.audioSource = null;
        }

        this.isAudioActive = false;
    }

    /**
     * Animate audio output visualization
     */
    animateAudioOutput() {
        if (!this.isAudioActive) return;

        const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        this.audioAnalyser.getByteFrequencyData(dataArray);

        // Calculate average audio level
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const audioLevel = average / 255; // Normalize to 0-1

        // Animate speakers based on audio level
        this.animateSpeakers(audioLevel);

        this.audioAnimationFrame = requestAnimationFrame(() => this.animateAudioOutput());
    }

    /**
     * Animate speakers based on audio level
     */
    animateSpeakers(audioLevel) {
        const speakers = document.querySelectorAll('.speaker');
        speakers.forEach(speaker => {
            const scale = 1 + (audioLevel * 0.2); // Scale up to 20% based on audio level
            speaker.style.transform = `scale(${scale})`;

            // Add glow effect based on audio level
            const glowIntensity = audioLevel * 50;
            speaker.style.boxShadow = `0 0 ${glowIntensity}px rgba(0, 255, 136, ${audioLevel})`;
        });
    }

    /**
     * Play a sound with specified frequency and duration
     */
    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    }

    /**
     * Play correct connection sound
     */
    playCorrectSound() {
        this.playSound(800, 0.2, 'sine');
    }

    /**
     * Play wrong connection sound
     */
    playWrongSound() {
        this.playSound(200, 0.3, 'sawtooth');
    }

    /**
     * Play victory sound
     */
    playVictorySound() {
        // Play a sequence of ascending notes
        const notes = [523, 659, 784, 1047]; // C, E, G, C
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playSound(note, 0.3, 'sine');
            }, index * 200);
        });
    }

    /**
     * Play test sound for audio system testing
     */
    playTestSound(frequency, duration, type) {
        this.playSound(frequency, duration, type);
    }

    /**
     * Play background music (placeholder)
     */
    playBackgroundMusic() {
        // This would be implemented with actual background music
        console.log('Background music would play here');
    }

    /**
     * Get audio context state
     */
    getAudioContextState() {
        return this.audioContext ? this.audioContext.state : 'unsupported';
    }

    /**
     * Check if audio is supported
     */
    isAudioSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }

    /**
     * Resume audio context if suspended
     */
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Suspend audio context to save resources
     */
    suspendAudioContext() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }

    /**
     * Clean up audio resources
     */
    cleanup() {
        this.stopRealAudio();
        if (this.microphoneStream) {
            this.microphoneStream.getTracks().forEach(track => track.stop());
        }
    }
}
