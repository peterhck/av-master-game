import { config } from '../config.js';

export class TutorialManager {
    constructor() {
        this.currentStep = 0;
        this.tutorialSteps = [
            {
                id: 1,
                title: "Welcome to AV Master! 🎵",
                subtitle: "Your Journey to Live Production Excellence",
                content: `
                    <div class="tutorial-welcome">
                        <div class="tutorial-hero">
                            <i class="fas fa-microphone-alt"></i>
                            <h2>Master the Art of Live Events</h2>
                        </div>
                        <p>Welcome to AV Master, where you'll learn the fundamentals of audio-visual installation and live event production through hands-on, interactive challenges.</p>
                        <div class="tutorial-highlights">
                            <div class="highlight">
                                <i class="fas fa-gamepad"></i>
                                <span>Interactive Learning</span>
                            </div>
                            <div class="highlight">
                                <i class="fas fa-industry"></i>
                                <span>Real-World Skills</span>
                            </div>
                            <div class="highlight">
                                <i class="fas fa-certificate"></i>
                                <span>Professional Knowledge</span>
                            </div>
                        </div>
                    </div>
                `,
                image: "fas fa-microphone-alt",
                realWorld: "In real live events, every piece of equipment must work together seamlessly. This game teaches you the same principles used by professional AV technicians worldwide."
            },
            {
                id: 2,
                title: "Understanding the Game Interface 🎮",
                subtitle: "Navigate Like a Pro",
                content: `
                    <div class="tutorial-interface">
                        <h3>Key Areas of the Game:</h3>
                        <div class="interface-grid">
                            <div class="interface-item">
                                <i class="fas fa-toolbox"></i>
                                <h4>Equipment Toolbar</h4>
                                <p>Drag equipment from here to the stage. Each piece has specific functions and connections.</p>
                            </div>
                            <div class="interface-item">
                                <i class="fas fa-tv"></i>
                                <h4>Stage Area</h4>
                                <p>This is your workspace where you'll place and connect equipment to complete challenges.</p>
                            </div>
                            <div class="interface-item">
                                <i class="fas fa-cog"></i>
                                <h4>Settings Panel</h4>
                                <p>Configure equipment settings, adjust levels, and fine-tune your setup for optimal performance.</p>
                            </div>
                            <div class="interface-item">
                                <i class="fas fa-chart-line"></i>
                                <h4>Performance Monitor</h4>
                                <p>Real-time feedback on your setup's performance, just like professional monitoring systems.</p>
                            </div>
                        </div>
                    </div>
                `,
                image: "fas fa-mouse-pointer",
                realWorld: "Professional AV technicians use similar interfaces in real mixing consoles, lighting boards, and video switchers. Learning this layout helps you transition to real equipment."
            },
            {
                id: 3,
                title: "Equipment Fundamentals 🔌",
                subtitle: "Know Your Tools",
                content: `
                    <div class="tutorial-equipment">
                        <h3>Essential Equipment Types:</h3>
                        <div class="equipment-grid">
                            <div class="equipment-category">
                                <h4><i class="fas fa-microphone"></i> Audio Equipment</h4>
                                <ul>
                                    <li><strong>Microphones:</strong> Dynamic, condenser, wireless systems</li>
                                    <li><strong>Speakers:</strong> Main PA, monitors, subwoofers</li>
                                    <li><strong>Mixers:</strong> Analog and digital mixing consoles</li>
                                    <li><strong>Processors:</strong> Equalizers, compressors, effects</li>
                                </ul>
                            </div>
                            <div class="equipment-category">
                                <h4><i class="fas fa-lightbulb"></i> Lighting Equipment</h4>
                                <ul>
                                    <li><strong>Fixtures:</strong> LED panels, moving heads, spotlights</li>
                                    <li><strong>Controllers:</strong> DMX controllers, lighting boards</li>
                                    <li><strong>Effects:</strong> Fog machines, lasers, strobes</li>
                                </ul>
                            </div>
                            <div class="equipment-category">
                                <h4><i class="fas fa-video"></i> Video Equipment</h4>
                                <ul>
                                    <li><strong>Cameras:</strong> PTZ, handheld, broadcast cameras</li>
                                    <li><strong>Displays:</strong> LED walls, projectors, monitors</li>
                                    <li><strong>Switchers:</strong> Video mixers, scalers, converters</li>
                                </ul>
                            </div>
                            <div class="equipment-category">
                                <h4><i class="fas fa-plug"></i> Cables & Connectors</h4>
                                <ul>
                                    <li><strong>Audio:</strong> XLR, TRS, RCA, SpeakON</li>
                                    <li><strong>Video:</strong> HDMI, SDI, VGA, DVI</li>
                                    <li><strong>Power:</strong> IEC, Edison, PowerCON</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                image: "fas fa-cogs",
                realWorld: "Understanding equipment types and their functions is crucial in live production. Each piece serves a specific purpose, and knowing when and how to use them is what separates amateurs from professionals."
            },
            {
                id: 4,
                title: "Connection Principles 🔗",
                subtitle: "Signal Flow Fundamentals",
                content: `
                    <div class="tutorial-connections">
                        <h3>Signal Flow Basics:</h3>
                        <div class="signal-flow">
                            <div class="flow-step">
                                <div class="flow-icon">
                                    <i class="fas fa-microphone"></i>
                                </div>
                                <div class="flow-text">
                                    <h4>1. Source</h4>
                                    <p>Audio/video originates from input devices (microphones, cameras, instruments)</p>
                                </div>
                            </div>
                            <div class="flow-arrow">
                                <i class="fas fa-arrow-right"></i>
                            </div>
                            <div class="flow-step">
                                <div class="flow-icon">
                                    <i class="fas fa-cog"></i>
                                </div>
                                <div class="flow-text">
                                    <h4>2. Processing</h4>
                                    <p>Signals are mixed, enhanced, and controlled through consoles and processors</p>
                                </div>
                            </div>
                            <div class="flow-arrow">
                                <i class="fas fa-arrow-right"></i>
                            </div>
                            <div class="flow-step">
                                <div class="flow-icon">
                                    <i class="fas fa-volume-up"></i>
                                </div>
                                <div class="flow-text">
                                    <h4>3. Output</h4>
                                    <p>Processed signals are sent to speakers, displays, and recording devices</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="connection-tips">
                            <h4>Pro Tips:</h4>
                            <ul>
                                <li><strong>Always check signal flow:</strong> Source → Processing → Output</li>
                                <li><strong>Use proper connectors:</strong> Match impedance and signal types</li>
                                <li><strong>Label everything:</strong> Clear labeling prevents confusion during shows</li>
                                <li><strong>Test connections:</strong> Verify each connection before the show starts</li>
                            </ul>
                        </div>
                    </div>
                `,
                image: "fas fa-project-diagram",
                realWorld: "Signal flow is the foundation of all live production. Understanding how audio and video signals travel through your system is essential for troubleshooting and creating optimal setups."
            },
            {
                id: 5,
                title: "Level Management 📊",
                subtitle: "Getting the Right Levels",
                content: `
                    <div class="tutorial-levels">
                        <h3>Understanding Audio & Video Levels:</h3>
                        <div class="level-guide">
                            <div class="level-section">
                                <h4><i class="fas fa-wave-square"></i> Audio Levels</h4>
                                <div class="level-meter">
                                    <div class="meter-segment green" data-level="0-60">-60 to -20 dB</div>
                                    <div class="meter-segment yellow" data-level="-20-0">-20 to 0 dB</div>
                                    <div class="meter-segment red" data-level="0-20">0 to +20 dB</div>
                                </div>
                                <ul>
                                    <li><strong>Green Zone (-60 to -20 dB):</strong> Safe levels, good headroom</li>
                                    <li><strong>Yellow Zone (-20 to 0 dB):</strong> Approaching peak, monitor closely</li>
                                    <li><strong>Red Zone (0 to +20 dB):</strong> Clipping! Reduce immediately</li>
                                </ul>
                            </div>
                            
                            <div class="level-section">
                                <h4><i class="fas fa-tv"></i> Video Levels</h4>
                                <div class="video-levels">
                                    <div class="video-level">
                                        <span class="level-label">Black Level:</span>
                                        <span class="level-value">0-7.5 IRE</span>
                                    </div>
                                    <div class="video-level">
                                        <span class="level-label">White Level:</span>
                                        <span class="level-value">100 IRE</span>
                                    </div>
                                    <div class="video-level">
                                        <span class="level-label">Chroma:</span>
                                        <span class="level-value">±20 IRE</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="level-tips">
                            <h4>Professional Level Management:</h4>
                            <ul>
                                <li><strong>Gain staging:</strong> Set proper input levels before processing</li>
                                <li><strong>Headroom:</strong> Leave 6-10 dB of headroom for dynamics</li>
                                <li><strong>Consistency:</strong> Maintain consistent levels across all channels</li>
                                <li><strong>Monitoring:</strong> Use meters and your ears/eyes to verify levels</li>
                            </ul>
                        </div>
                    </div>
                `,
                image: "fas fa-chart-line",
                realWorld: "Proper level management is critical in live production. Too low levels result in poor signal-to-noise ratio, while too high levels cause distortion and equipment damage."
            },
            {
                id: 6,
                title: "Troubleshooting Skills 🔧",
                subtitle: "Solving Problems Like a Pro",
                content: `
                    <div class="tutorial-troubleshooting">
                        <h3>Common Issues and Solutions:</h3>
                        <div class="troubleshooting-grid">
                            <div class="trouble-item">
                                <h4><i class="fas fa-volume-mute"></i> No Audio</h4>
                                <div class="trouble-checklist">
                                    <label><input type="checkbox"> Check power connections</label>
                                    <label><input type="checkbox"> Verify input/output routing</label>
                                    <label><input type="checkbox"> Test with known good cable</label>
                                    <label><input type="checkbox"> Check mute buttons and faders</label>
                                    <label><input type="checkbox"> Verify source is active</label>
                                </div>
                            </div>
                            
                            <div class="trouble-item">
                                <h4><i class="fas fa-exclamation-triangle"></i> Audio Distortion</h4>
                                <div class="trouble-checklist">
                                    <label><input type="checkbox"> Reduce input gain</label>
                                    <label><input type="checkbox"> Check for clipping indicators</label>
                                    <label><input type="checkbox"> Verify speaker impedance</label>
                                    <label><input type="checkbox"> Check amplifier settings</label>
                                </div>
                            </div>
                            
                            <div class="trouble-item">
                                <h4><i class="fas fa-video-slash"></i> No Video</h4>
                                <div class="trouble-checklist">
                                    <label><input type="checkbox"> Check video source power</label>
                                    <label><input type="checkbox"> Verify cable connections</label>
                                    <label><input type="checkbox"> Test different input ports</label>
                                    <label><input type="checkbox"> Check display settings</label>
                                </div>
                            </div>
                            
                            <div class="trouble-item">
                                <h4><i class="fas fa-bolt"></i> Power Issues</h4>
                                <div class="trouble-checklist">
                                    <label><input type="checkbox"> Check circuit breakers</label>
                                    <label><input type="checkbox"> Verify power cable integrity</label>
                                    <label><input type="checkbox"> Test power outlets</label>
                                    <label><input type="checkbox"> Check power requirements</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="troubleshooting-method">
                            <h4>Systematic Troubleshooting Method:</h4>
                            <ol>
                                <li><strong>Identify the problem:</strong> What's not working?</li>
                                <li><strong>Isolate the issue:</strong> Is it one piece or the whole system?</li>
                                <li><strong>Check the obvious:</strong> Power, connections, settings</li>
                                <li><strong>Test components:</strong> Swap with known good equipment</li>
                                <li><strong>Document solutions:</strong> Keep notes for future reference</li>
                            </ol>
                        </div>
                    </div>
                `,
                image: "fas fa-tools",
                realWorld: "Troubleshooting is a critical skill in live production. Equipment fails, connections come loose, and settings get changed. Being able to quickly identify and fix problems is what keeps shows running smoothly."
            },
            {
                id: 7,
                title: "Real-World Applications 🌍",
                subtitle: "From Game to Professional",
                content: `
                    <div class="tutorial-realworld">
                        <h3>How This Game Prepares You for Real Live Events:</h3>
                        <div class="realworld-scenarios">
                            <div class="scenario">
                                <h4><i class="fas fa-music"></i> Concert Production</h4>
                                <p>Apply your knowledge to set up PA systems, monitor mixes, and lighting rigs for live performances. Learn stage layout, cable management, and artist requirements.</p>
                                <div class="scenario-tips">
                                    <strong>Key Skills:</strong> Audio mixing, stage monitoring, lighting design, crowd management
                                </div>
                            </div>
                            
                            <div class="scenario">
                                <h4><i class="fas fa-chalkboard-teacher"></i> Corporate Events</h4>
                                <p>Master presentation systems, video conferencing, and professional audio for business meetings, conferences, and corporate presentations.</p>
                                <div class="scenario-tips">
                                    <strong>Key Skills:</strong> Video switching, presentation audio, wireless microphones, backup systems
                                </div>
                            </div>
                            
                            <div class="scenario">
                                <h4><i class="fas fa-church"></i> Houses of Worship</h4>
                                <p>Learn to set up systems for churches, synagogues, and other religious venues. Focus on clear speech reinforcement and musical accompaniment.</p>
                                <div class="scenario-tips">
                                    <strong>Key Skills:</strong> Speech clarity, musical mixing, acoustic considerations, volunteer training
                                </div>
                            </div>
                            
                            <div class="scenario">
                                <h4><i class="fas fa-graduation-cap"></i> Educational Institutions</h4>
                                <p>Set up classroom audio, lecture capture systems, and distance learning setups for schools and universities.</p>
                                <div class="scenario-tips">
                                    <strong>Key Skills:</strong> Classroom audio, video recording, streaming, accessibility compliance
                                </div>
                            </div>
                        </div>
                        
                        <div class="career-path">
                            <h4>Career Opportunities in Live Production:</h4>
                            <ul>
                                <li><strong>Live Sound Engineer:</strong> Mix concerts, events, and performances</li>
                                <li><strong>Video Technician:</strong> Operate cameras, switchers, and projection systems</li>
                                <li><strong>Lighting Designer:</strong> Create lighting designs for shows and events</li>
                                <li><strong>Systems Integrator:</strong> Design and install permanent AV systems</li>
                                <li><strong>Event Producer:</strong> Coordinate entire event production</li>
                            </ul>
                        </div>
                    </div>
                `,
                image: "fas fa-globe",
                realWorld: "The skills you learn in this game directly translate to real-world live production. Many professional AV technicians started with similar training and practice scenarios."
            },
            {
                id: 8,
                title: "Advanced Techniques 🚀",
                subtitle: "Taking Your Skills to the Next Level",
                content: `
                    <div class="tutorial-advanced">
                        <h3>Professional Techniques You'll Master:</h3>
                        <div class="advanced-techniques">
                            <div class="technique">
                                <h4><i class="fas fa-sliders-h"></i> Advanced Mixing</h4>
                                <ul>
                                    <li>Parallel processing and side-chaining</li>
                                    <li>Multi-band compression and EQ</li>
                                    <li>Automation and scene recall</li>
                                    <li>Monitor mixing and in-ear systems</li>
                                </ul>
                            </div>
                            
                            <div class="technique">
                                <h4><i class="fas fa-palette"></i> Lighting Design</h4>
                                <ul>
                                    <li>Color theory and mood creation</li>
                                    <li>DMX programming and automation</li>
                                    <li>Moving light programming</li>
                                    <li>Video integration and mapping</li>
                                </ul>
                            </div>
                            
                            <div class="technique">
                                <h4><i class="fas fa-film"></i> Video Production</h4>
                                <ul>
                                    <li>Multi-camera switching</li>
                                    <li>Graphics and lower thirds</li>
                                    <li>Streaming and recording</li>
                                    <li>Video wall configuration</li>
                                </ul>
                            </div>
                            
                            <div class="technique">
                                <h4><i class="fas fa-network-wired"></i> System Integration</h4>
                                <ul>
                                    <li>Network audio (Dante, AVB)</li>
                                    <li>Video over IP</li>
                                    <li>Centralized control systems</li>
                                    <li>Redundancy and backup systems</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="professional-tips">
                            <h4>Pro Tips for Success:</h4>
                            <ul>
                                <li><strong>Always have a backup plan:</strong> Equipment fails, be prepared</li>
                                <li><strong>Document everything:</strong> Settings, connections, and procedures</li>
                                <li><strong>Communicate clearly:</strong> With clients, artists, and crew</li>
                                <li><strong>Stay current:</strong> Technology evolves rapidly</li>
                                <li><strong>Practice regularly:</strong> Skills improve with use</li>
                            </ul>
                        </div>
                    </div>
                `,
                image: "fas fa-rocket",
                realWorld: "Advanced techniques separate good technicians from great ones. These skills are highly valued in the professional AV industry and can significantly increase your earning potential."
            },
            {
                id: 9,
                title: "Safety First! ⚠️",
                subtitle: "Protecting Yourself and Equipment",
                content: `
                    <div class="tutorial-safety">
                        <h3>Essential Safety Guidelines:</h3>
                        <div class="safety-grid">
                            <div class="safety-category">
                                <h4><i class="fas fa-bolt"></i> Electrical Safety</h4>
                                <ul>
                                    <li>Always check power requirements before connecting</li>
                                    <li>Use proper grounding and GFCI protection</li>
                                    <li>Never overload circuits or power strips</li>
                                    <li>Keep cables away from water and heat sources</li>
                                    <li>Use only UL-listed equipment and cables</li>
                                </ul>
                            </div>
                            
                            <div class="safety-category">
                                <h4><i class="fas fa-weight-hanging"></i> Rigging Safety</h4>
                                <ul>
                                    <li>Always use rated rigging hardware</li>
                                    <li>Check weight limits and load calculations</li>
                                    <li>Use proper knots and securing methods</li>
                                    <li>Never exceed manufacturer specifications</li>
                                    <li>Have a qualified rigger for complex setups</li>
                                </ul>
                            </div>
                            
                            <div class="safety-category">
                                <h4><i class="fas fa-volume-up"></i> Hearing Protection</h4>
                                <ul>
                                    <li>Use earplugs in loud environments</li>
                                    <li>Monitor sound levels with SPL meters</li>
                                    <li>Take regular breaks from loud noise</li>
                                    <li>Educate others about hearing protection</li>
                                    <li>Follow OSHA guidelines for workplace noise</li>
                                </ul>
                            </div>
                            
                            <div class="safety-category">
                                <h4><i class="fas fa-users"></i> Crowd Safety</h4>
                                <ul>
                                    <li>Ensure clear emergency exits</li>
                                    <li>Monitor crowd density and flow</li>
                                    <li>Have emergency procedures in place</li>
                                    <li>Coordinate with security personnel</li>
                                    <li>Follow venue safety protocols</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="safety-reminder">
                            <h4>Remember:</h4>
                            <p><strong>Safety is everyone's responsibility.</strong> If you see something unsafe, speak up. It's better to be cautious than to risk injury or damage to equipment.</p>
                        </div>
                    </div>
                `,
                image: "fas fa-shield-alt",
                realWorld: "Safety is paramount in live production. Accidents can cause serious injury, equipment damage, and legal liability. Professional AV technicians always prioritize safety in their work."
            },
            {
                id: 10,
                title: "You're Ready! 🎉",
                subtitle: "Start Your AV Master Journey",
                content: `
                    <div class="tutorial-complete">
                        <div class="completion-celebration">
                            <i class="fas fa-trophy"></i>
                            <h2>Congratulations!</h2>
                            <p>You've completed the AV Master tutorial and are ready to begin your journey into live production excellence.</p>
                        </div>
                        
                        <div class="next-steps">
                            <h3>What's Next?</h3>
                            <div class="steps-grid">
                                <div class="step">
                                    <i class="fas fa-play"></i>
                                    <h4>Start Playing</h4>
                                    <p>Begin with Level 1 and work your way through increasingly complex challenges.</p>
                                </div>
                                <div class="step">
                                    <i class="fas fa-robot"></i>
                                    <h4>Use the AI Tutor</h4>
                                    <p>Ask questions about equipment, techniques, and real-world applications.</p>
                                </div>
                                <div class="step">
                                    <i class="fas fa-redo"></i>
                                    <h4>Practice Regularly</h4>
                                    <p>Replay levels to perfect your skills and try different approaches.</p>
                                </div>
                                <div class="step">
                                    <i class="fas fa-book"></i>
                                    <h4>Continue Learning</h4>
                                    <p>Read manuals, watch tutorials, and stay updated with industry trends.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="final-encouragement">
                            <h3>Remember:</h3>
                            <ul>
                                <li>Every expert was once a beginner</li>
                                <li>Practice makes perfect</li>
                                <li>Don't be afraid to make mistakes</li>
                                <li>Ask questions and seek help</li>
                                <li>Stay passionate about your craft</li>
                            </ul>
                            <p><strong>Welcome to the world of live production!</strong> 🎵</p>
                        </div>
                    </div>
                `,
                image: "fas fa-star",
                realWorld: "You now have the foundation to begin a career in live production. The skills you develop in this game will serve you well in real-world scenarios, from small events to major productions."
            }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('📚 Tutorial Manager initialized');
    }

    setupEventListeners() {
        // Tutorial navigation
        const prevBtn = document.getElementById('prev-tutorial');
        const nextBtn = document.getElementById('next-tutorial');
        const closeBtn = document.getElementById('close-tutorial');
        const dots = document.querySelectorAll('.tutorial-dots .dot');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousStep());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeTutorial());
        }

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToStep(index));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isTutorialOpen()) {
                if (e.key === 'ArrowLeft') {
                    this.previousStep();
                } else if (e.key === 'ArrowRight') {
                    this.nextStep();
                } else if (e.key === 'Escape') {
                    this.closeTutorial();
                }
            }
        });
    }

    showTutorial() {
        const modal = document.getElementById('tutorial-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.currentStep = 0;
            this.updateTutorialDisplay();
            console.log('📚 Tutorial opened');
        }
    }

    closeTutorial() {
        const modal = document.getElementById('tutorial-modal');
        if (modal) {
            modal.style.display = 'none';
            console.log('📚 Tutorial closed');
        }
    }

    isTutorialOpen() {
        const modal = document.getElementById('tutorial-modal');
        return modal && modal.style.display === 'flex';
    }

    nextStep() {
        if (this.currentStep < this.tutorialSteps.length - 1) {
            this.currentStep++;
            this.updateTutorialDisplay();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateTutorialDisplay();
        }
    }

    goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < this.tutorialSteps.length) {
            this.currentStep = stepIndex;
            this.updateTutorialDisplay();
        }
    }

    updateTutorialDisplay() {
        const step = this.tutorialSteps[this.currentStep];
        const modalBody = document.querySelector('#tutorial-modal .modal-body');
        const prevBtn = document.getElementById('prev-tutorial');
        const nextBtn = document.getElementById('next-tutorial');
        const dots = document.querySelectorAll('.tutorial-dots .dot');

        if (modalBody && step) {
            // Update content
            modalBody.innerHTML = `
                <div class="tutorial-step-content">
                    <div class="tutorial-header">
                        <h3>${step.title}</h3>
                        <p class="tutorial-subtitle">${step.subtitle}</p>
                    </div>
                    <div class="tutorial-body">
                        ${step.content}
                    </div>
                    <div class="tutorial-realworld-note">
                        <i class="fas fa-globe"></i>
                        <strong>Real-World Connection:</strong> ${step.realWorld}
                    </div>
                </div>
            `;

            // Update navigation
            if (prevBtn) {
                prevBtn.disabled = this.currentStep === 0;
            }

            if (nextBtn) {
                const isLastStep = this.currentStep === this.tutorialSteps.length - 1;
                nextBtn.innerHTML = isLastStep ? 
                    'Finish <i class="fas fa-check"></i>' : 
                    'Next <i class="fas fa-chevron-right"></i>';
            }

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentStep);
            });

            // Handle last step
            if (this.currentStep === this.tutorialSteps.length - 1) {
                nextBtn.addEventListener('click', () => this.closeTutorial(), { once: true });
            }
        }
    }
}
