/**
 * Blaze Intelligence Modern UI System
 * Championship-level design components and interactions
 * Version 2.0
 */

class BlazeModernUI {
    constructor() {
        this.version = "2.0.0";
        this.theme = {
            colors: {
                primary: '#FF6B35',
                primaryDark: '#CC5500',
                secondary: '#00B2A9',
                accent: '#FFD700',
                dark: '#0A0A0A',
                darker: '#1A1A1A',
                light: '#FFFFFF',
                gray: '#9CA3AF',
                lightGray: '#E5E7EB',
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444'
            },
            gradients: {
                primary: 'linear-gradient(135deg, #FF6B35 0%, #CC5500 100%)',
                secondary: 'linear-gradient(135deg, #00B2A9 0%, #008B84 100%)',
                dark: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
                accent: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
            },
            shadows: {
                sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                glow: '0 0 20px rgba(255, 107, 53, 0.3)'
            },
            typography: {
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                headingFamily: '"Oswald", sans-serif',
                monoFamily: '"JetBrains Mono", monospace'
            },
            breakpoints: {
                mobile: '640px',
                tablet: '768px',
                laptop: '1024px',
                desktop: '1280px'
            }
        };
        
        this.components = new Map();
        this.animations = new Map();
        this.isInitialized = false;
        
        this.init();
    }
    
    /**
     * Initialize the modern UI system
     */
    async init() {
        if (this.isInitialized) return;
        
        console.log(`🎨 Initializing Blaze Modern UI v${this.version}`);
        
        // Inject base styles
        this.injectBaseStyles();
        
        // Initialize components
        this.initializeComponents();
        
        // Setup global event handlers
        this.bindGlobalEvents();
        
        // Initialize animations
        this.initializeAnimations();
        
        this.isInitialized = true;
        console.log('✨ Modern UI System activated');
    }
    
    /**
     * Inject base CSS styles
     */
    injectBaseStyles() {
        const styleId = 'blaze-modern-ui-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Blaze Modern UI Base Styles */
            :root {
                --blaze-primary: ${this.theme.colors.primary};
                --blaze-primary-dark: ${this.theme.colors.primaryDark};
                --blaze-secondary: ${this.theme.colors.secondary};
                --blaze-accent: ${this.theme.colors.accent};
                --blaze-dark: ${this.theme.colors.dark};
                --blaze-darker: ${this.theme.colors.darker};
                --blaze-light: ${this.theme.colors.light};
                --blaze-gray: ${this.theme.colors.gray};
                --blaze-light-gray: ${this.theme.colors.lightGray};
                
                --blaze-gradient-primary: ${this.theme.gradients.primary};
                --blaze-gradient-secondary: ${this.theme.gradients.secondary};
                --blaze-gradient-dark: ${this.theme.gradients.dark};
                --blaze-gradient-accent: ${this.theme.gradients.accent};
                
                --blaze-shadow-sm: ${this.theme.shadows.sm};
                --blaze-shadow-md: ${this.theme.shadows.md};
                --blaze-shadow-lg: ${this.theme.shadows.lg};
                --blaze-shadow-xl: ${this.theme.shadows.xl};
                --blaze-shadow-glow: ${this.theme.shadows.glow};
                
                --blaze-font-family: ${this.theme.typography.fontFamily};
                --blaze-heading-family: ${this.theme.typography.headingFamily};
                --blaze-mono-family: ${this.theme.typography.monoFamily};
            }
            
            /* Modern UI Components */
            .blaze-card {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 24px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: var(--blaze-shadow-lg);
            }
            
            .blaze-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--blaze-shadow-xl), var(--blaze-shadow-glow);
                border-color: rgba(255, 107, 53, 0.3);
            }
            
            .blaze-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px 24px;
                border: none;
                border-radius: 100px;
                font-family: var(--blaze-font-family);
                font-weight: 600;
                font-size: 14px;
                text-decoration: none;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }
            
            .blaze-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            
            .blaze-btn:hover::before {
                left: 100%;
            }
            
            .blaze-btn-primary {
                background: var(--blaze-gradient-primary);
                color: white;
                box-shadow: var(--blaze-shadow-md);
            }
            
            .blaze-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: var(--blaze-shadow-lg), var(--blaze-shadow-glow);
            }
            
            .blaze-btn-secondary {
                background: var(--blaze-gradient-secondary);
                color: white;
                box-shadow: var(--blaze-shadow-md);
            }
            
            .blaze-btn-outline {
                background: transparent;
                border: 2px solid var(--blaze-primary);
                color: var(--blaze-primary);
            }
            
            .blaze-btn-outline:hover {
                background: var(--blaze-primary);
                color: white;
            }
            
            .blaze-input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.05);
                color: white;
                font-family: var(--blaze-font-family);
                font-size: 14px;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            
            .blaze-input:focus {
                outline: none;
                border-color: var(--blaze-primary);
                box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
            }
            
            .blaze-input::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }
            
            .blaze-badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 12px;
                border-radius: 100px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .blaze-badge-success {
                background: rgba(16, 185, 129, 0.2);
                color: #10B981;
                border: 1px solid rgba(16, 185, 129, 0.3);
            }
            
            .blaze-badge-warning {
                background: rgba(245, 158, 11, 0.2);
                color: #F59E0B;
                border: 1px solid rgba(245, 158, 11, 0.3);
            }
            
            .blaze-badge-error {
                background: rgba(239, 68, 68, 0.2);
                color: #EF4444;
                border: 1px solid rgba(239, 68, 68, 0.3);
            }
            
            .blaze-metric-card {
                background: var(--blaze-gradient-dark);
                border: 1px solid rgba(255, 107, 53, 0.2);
                border-radius: 20px;
                padding: 24px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .blaze-metric-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: var(--blaze-gradient-primary);
            }
            
            .blaze-metric-value {
                font-family: var(--blaze-mono-family);
                font-size: 2.5rem;
                font-weight: 900;
                color: var(--blaze-primary);
                margin-bottom: 8px;
                text-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
            }
            
            .blaze-metric-label {
                font-size: 0.875rem;
                color: var(--blaze-gray);
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 600;
            }
            
            .blaze-progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            }
            
            .blaze-progress-fill {
                height: 100%;
                background: var(--blaze-gradient-primary);
                border-radius: 4px;
                transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }
            
            .blaze-progress-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                background-image: linear-gradient(
                    -45deg,
                    rgba(255, 255, 255, 0.2) 25%,
                    transparent 25%,
                    transparent 50%,
                    rgba(255, 255, 255, 0.2) 50%,
                    rgba(255, 255, 255, 0.2) 75%,
                    transparent 75%,
                    transparent
                );
                background-size: 20px 20px;
                animation: blaze-progress-animate 1s linear infinite;
            }
            
            @keyframes blaze-progress-animate {
                0% { background-position: 0 0; }
                100% { background-position: 20px 0; }
            }
            
            .blaze-loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255, 107, 53, 0.2);
                border-left-color: var(--blaze-primary);
                border-radius: 50%;
                animation: blaze-spin 1s linear infinite;
            }
            
            @keyframes blaze-spin {
                to { transform: rotate(360deg); }
            }
            
            .blaze-tooltip {
                position: absolute;
                background: rgba(10, 10, 10, 0.95);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                pointer-events: none;
                z-index: 10000;
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 107, 53, 0.3);
                box-shadow: var(--blaze-shadow-lg);
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .blaze-tooltip.show {
                opacity: 1;
            }
            
            .blaze-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -5px;
                border-width: 5px;
                border-style: solid;
                border-color: rgba(10, 10, 10, 0.95) transparent transparent transparent;
            }
            
            .blaze-glass {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .blaze-glow {
                box-shadow: var(--blaze-shadow-glow);
            }
            
            .blaze-animate-fade-in {
                animation: blaze-fade-in 0.6s ease-out;
            }
            
            .blaze-animate-slide-up {
                animation: blaze-slide-up 0.6s ease-out;
            }
            
            .blaze-animate-scale-in {
                animation: blaze-scale-in 0.4s ease-out;
            }
            
            @keyframes blaze-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes blaze-slide-up {
                from { 
                    opacity: 0;
                    transform: translateY(30px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes blaze-scale-in {
                from { 
                    opacity: 0;
                    transform: scale(0.9);
                }
                to { 
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .blaze-card {
                    padding: 16px;
                    border-radius: 12px;
                }
                
                .blaze-metric-value {
                    font-size: 2rem;
                }
                
                .blaze-btn {
                    padding: 10px 20px;
                    font-size: 13px;
                }
            }
            
            /* Dark mode enhancements */
            @media (prefers-color-scheme: dark) {
                .blaze-glass {
                    background: rgba(255, 255, 255, 0.02);
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .blaze-btn,
                .blaze-input,
                .blaze-card,
                .blaze-progress-fill {
                    transition: none;
                }
                
                .blaze-animate-fade-in,
                .blaze-animate-slide-up,
                .blaze-animate-scale-in {
                    animation: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Initialize UI components
     */
    initializeComponents() {
        // Auto-enhance existing elements
        this.enhanceButtons();
        this.enhanceCards();
        this.enhanceInputs();
        this.initializeTooltips();
        this.initializeProgressBars();
    }
    
    /**
     * Enhance existing buttons
     */
    enhanceButtons() {
        const buttons = document.querySelectorAll('button, .btn, [data-blaze-btn]');
        buttons.forEach(btn => {
            if (!btn.classList.contains('blaze-btn')) {
                btn.classList.add('blaze-btn');
                
                // Add appropriate variant class
                if (btn.classList.contains('primary') || btn.hasAttribute('data-primary')) {
                    btn.classList.add('blaze-btn-primary');
                } else if (btn.classList.contains('secondary') || btn.hasAttribute('data-secondary')) {
                    btn.classList.add('blaze-btn-secondary');
                } else if (btn.classList.contains('outline') || btn.hasAttribute('data-outline')) {
                    btn.classList.add('blaze-btn-outline');
                } else {
                    btn.classList.add('blaze-btn-primary');
                }
            }
        });
    }
    
    /**
     * Enhance existing cards
     */
    enhanceCards() {
        const cards = document.querySelectorAll('.card, [data-blaze-card]');
        cards.forEach(card => {
            if (!card.classList.contains('blaze-card')) {
                card.classList.add('blaze-card', 'blaze-animate-fade-in');
            }
        });
    }
    
    /**
     * Enhance existing inputs
     */
    enhanceInputs() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea, [data-blaze-input]');
        inputs.forEach(input => {
            if (!input.classList.contains('blaze-input')) {
                input.classList.add('blaze-input');
            }
        });
    }
    
    /**
     * Initialize tooltips
     */
    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            this.createTooltip(element);
        });
    }
    
    /**
     * Create tooltip for element
     */
    createTooltip(element) {
        const tooltipText = element.getAttribute('data-tooltip');
        if (!tooltipText) return;
        
        let tooltip = null;
        
        element.addEventListener('mouseenter', (e) => {
            tooltip = document.createElement('div');
            tooltip.className = 'blaze-tooltip';
            tooltip.textContent = tooltipText;
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 + 'px';
            tooltip.style.top = rect.top + 'px';
            
            setTimeout(() => tooltip.classList.add('show'), 10);
        });
        
        element.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.classList.remove('show');
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 300);
            }
        });
    }
    
    /**
     * Initialize progress bars
     */
    initializeProgressBars() {
        const progressBars = document.querySelectorAll('[data-progress]');
        progressBars.forEach(bar => {
            this.createProgressBar(bar);
        });
    }
    
    /**
     * Create progress bar
     */
    createProgressBar(element) {
        const value = parseFloat(element.getAttribute('data-progress')) || 0;
        const max = parseFloat(element.getAttribute('data-max')) || 100;
        const percentage = Math.min((value / max) * 100, 100);
        
        if (!element.classList.contains('blaze-progress-bar')) {
            element.classList.add('blaze-progress-bar');
            
            const fill = document.createElement('div');
            fill.className = 'blaze-progress-fill';
            element.appendChild(fill);
            
            // Animate in
            setTimeout(() => {
                fill.style.width = percentage + '%';
            }, 100);
        }
    }
    
    /**
     * Create metric card component
     */
    createMetricCard(container, data) {
        const card = document.createElement('div');
        card.className = 'blaze-metric-card blaze-animate-scale-in';
        
        card.innerHTML = `
            <div class="blaze-metric-value">${data.value}</div>
            <div class="blaze-metric-label">${data.label}</div>
            ${data.trend ? `<div class="blaze-badge blaze-badge-${data.trend.type}">${data.trend.text}</div>` : ''}
        `;
        
        container.appendChild(card);
        return card;
    }
    
    /**
     * Create loading spinner
     */
    createLoadingSpinner(container) {
        const spinner = document.createElement('div');
        spinner.className = 'blaze-loading-spinner';
        container.appendChild(spinner);
        return spinner;
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `blaze-notification blaze-notification-${type} blaze-animate-slide-up`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? this.theme.colors.success : 
                       type === 'error' ? this.theme.colors.error :
                       type === 'warning' ? this.theme.colors.warning : this.theme.colors.primary};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: var(--blaze-shadow-lg);
            z-index: 10000;
            max-width: 300px;
            backdrop-filter: blur(20px);
        `;
        
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">${type.toUpperCase()}</div>
            <div>${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        return notification;
    }
    
    /**
     * Create dashboard grid
     */
    createDashboardGrid(container, columns = 3) {
        container.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            padding: 24px;
        `;
        
        container.classList.add('blaze-dashboard-grid');
    }
    
    /**
     * Bind global event handlers
     */
    bindGlobalEvents() {
        // Intersection Observer for animations
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('blaze-animate-fade-in');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            // Observe elements with animation classes
            document.querySelectorAll('[data-animate]').forEach(el => {
                observer.observe(el);
            });
        }
        
        // Global click handler for enhanced interactions
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.blaze-btn');
            if (target) {
                this.createRippleEffect(target, e);
            }
        });
    }
    
    /**
     * Create ripple effect on button click
     */
    createRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: blaze-ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        // Add ripple animation if not exists
        if (!document.getElementById('blaze-ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'blaze-ripple-styles';
            style.textContent = `
                @keyframes blaze-ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    /**
     * Initialize animations with GSAP if available
     */
    initializeAnimations() {
        if (window.gsap) {
            // Register ScrollTrigger animations
            if (window.ScrollTrigger) {
                gsap.registerPlugin(ScrollTrigger);
                
                // Animate cards on scroll
                gsap.utils.toArray('.blaze-card').forEach(card => {
                    gsap.fromTo(card, 
                        { y: 50, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.8,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: card,
                                start: "top 80%",
                                toggleActions: "play none none reverse"
                            }
                        }
                    );
                });
            }
        }
    }
    
    /**
     * Update theme colors
     */
    updateTheme(newColors) {
        Object.assign(this.theme.colors, newColors);
        
        // Update CSS custom properties
        const root = document.documentElement;
        Object.entries(this.theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--blaze-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
        });
    }
    
    /**
     * Get current theme
     */
    getTheme() {
        return { ...this.theme };
    }
    
    /**
     * Destroy UI system and cleanup
     */
    destroy() {
        // Remove styles
        const styleElement = document.getElementById('blaze-modern-ui-styles');
        if (styleElement) {
            styleElement.remove();
        }
        
        // Clear components
        this.components.clear();
        this.animations.clear();
        
        console.log('🧹 Modern UI System destroyed');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.blazeModernUI) {
        window.blazeModernUI = new BlazeModernUI();
        console.log('🎨 Blaze Modern UI System activated');
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeModernUI;
}