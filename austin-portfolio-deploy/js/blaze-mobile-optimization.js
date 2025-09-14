/**
 * BLAZE INTELLIGENCE MOBILE OPTIMIZATION
 * Advanced Mobile Touch Interactions & Responsive Experience
 * Optimized for iOS, Android, and Progressive Web App capabilities
 */

class BlazeMobileOptimization {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTouch = this.detectTouch();
        this.orientation = this.getOrientation();
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.initialized = false;
        
        // Touch interaction state
        this.touchState = {
            activeTouch: null,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            isScrolling: false,
            lastTouchTime: 0
        };
        
        // Gesture recognition
        this.gestures = {
            swipe: { threshold: 50, timeLimit: 300 },
            pinch: { threshold: 0.1 },
            tap: { threshold: 10, timeLimit: 200 },
            longPress: { timeLimit: 500 }
        };
        
        // Performance optimization
        this.performance = {
            isLowEndDevice: this.detectLowEndDevice(),
            reducedMotion: this.preferReducedMotion(),
            enableHaptics: this.supportsHaptics()
        };
        
        this.init();
    }
    
    async init() {
        try {
            if (this.isMobile) {
                this.setupMobileViewport();
                this.setupTouchEvents();
                this.setupMobileNavigation();
                this.optimizeForMobile();
                this.setupPWAFeatures();
            }
            
            this.setupResponsiveElements();
            this.setupAccessibilityFeatures();
            this.setupPerformanceOptimizations();
            
            this.initialized = true;
            console.log('📱 Blaze Mobile Optimization initialized');
        } catch (error) {
            console.error('❌ Mobile optimization failed:', error);
        }
    }
    
    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(userAgent);
    }
    
    detectTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }
    
    detectLowEndDevice() {
        const memory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        return memory <= 2 || cores <= 2;
    }
    
    preferReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    supportsHaptics() {
        return 'vibrate' in navigator;
    }
    
    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }
    
    setupMobileViewport() {
        // Ensure proper viewport configuration
        let viewport = document.querySelector('meta[name=viewport]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
        
        // Add mobile-specific meta tags
        this.addMobileMetaTags();
        
        // Handle viewport changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Handle resize events
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }
    
    addMobileMetaTags() {
        const mobileMetaTags = [
            { name: 'mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
            { name: 'apple-mobile-web-app-title', content: 'Blaze Intelligence' },
            { name: 'application-name', content: 'Blaze Intelligence' },
            { name: 'msapplication-TileColor', content: '#BF5700' },
            { name: 'theme-color', content: '#BF5700' }
        ];
        
        mobileMetaTags.forEach(tag => {
            let meta = document.querySelector(`meta[name="${tag.name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = tag.name;
                meta.content = tag.content;
                document.head.appendChild(meta);
            }
        });
    }
    
    setupTouchEvents() {
        // Improve touch responsiveness
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: true });
        
        // Add gesture recognition
        this.setupGestureRecognition();
        
        // Optimize button interactions
        this.optimizeTouchTargets();
    }
    
    handleTouchStart(event) {
        const touch = event.touches[0];
        if (!touch) return;
        
        this.touchState.activeTouch = touch.identifier;
        this.touchState.startPosition = { x: touch.clientX, y: touch.clientY };
        this.touchState.currentPosition = { x: touch.clientX, y: touch.clientY };
        this.touchState.lastTouchTime = Date.now();
        
        // Add active state for better feedback
        const target = event.target.closest('.blaze-interactive, button, .blaze-cta-primary, .blaze-cta-secondary');
        if (target) {
            target.classList.add('blaze-touch-active');
            this.triggerHapticFeedback('light');
        }
    }
    
    handleTouchMove(event) {
        const touch = Array.from(event.touches).find(t => t.identifier === this.touchState.activeTouch);
        if (!touch) return;
        
        this.touchState.currentPosition = { x: touch.clientX, y: touch.clientY };
        
        // Calculate velocity
        const deltaX = touch.clientX - this.touchState.startPosition.x;
        const deltaY = touch.clientY - this.touchState.startPosition.y;
        const deltaTime = Date.now() - this.touchState.lastTouchTime;
        
        this.touchState.velocity = {
            x: deltaX / deltaTime,
            y: deltaY / deltaTime
        };
        
        // Detect scrolling
        if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
            this.touchState.isScrolling = true;
        }
    }
    
    handleTouchEnd(event) {
        // Remove active states
        document.querySelectorAll('.blaze-touch-active').forEach(el => {
            el.classList.remove('blaze-touch-active');
        });
        
        if (!this.touchState.activeTouch) return;
        
        const deltaX = this.touchState.currentPosition.x - this.touchState.startPosition.x;
        const deltaY = this.touchState.currentPosition.y - this.touchState.startPosition.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = Date.now() - this.touchState.lastTouchTime;
        
        // Detect gestures
        this.detectGesture(deltaX, deltaY, distance, duration);
        
        // Reset touch state
        this.resetTouchState();
    }
    
    handleTouchCancel(event) {
        document.querySelectorAll('.blaze-touch-active').forEach(el => {
            el.classList.remove('blaze-touch-active');
        });
        this.resetTouchState();
    }
    
    resetTouchState() {
        this.touchState = {
            activeTouch: null,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            isScrolling: false,
            lastTouchTime: 0
        };
    }
    
    setupGestureRecognition() {
        let gestureStartTime = 0;
        let gestureTimeout = null;
        
        document.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                gestureStartTime = Date.now();
                gestureTimeout = setTimeout(() => {
                    this.triggerLongPress(event);
                }, this.gestures.longPress.timeLimit);
            } else if (event.touches.length === 2) {
                clearTimeout(gestureTimeout);
                this.startPinchGesture(event);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            clearTimeout(gestureTimeout);
        }, { passive: true });
    }
    
    detectGesture(deltaX, deltaY, distance, duration) {
        // Tap gesture
        if (distance < this.gestures.tap.threshold && duration < this.gestures.tap.timeLimit) {
            this.triggerHapticFeedback('medium');
            return 'tap';
        }
        
        // Swipe gesture
        if (distance > this.gestures.swipe.threshold && duration < this.gestures.swipe.timeLimit) {
            const direction = Math.abs(deltaX) > Math.abs(deltaY) 
                ? (deltaX > 0 ? 'right' : 'left')
                : (deltaY > 0 ? 'down' : 'up');
            
            this.triggerSwipe(direction);
            return `swipe-${direction}`;
        }
        
        return 'none';
    }
    
    triggerSwipe(direction) {
        this.triggerHapticFeedback('medium');
        
        // Handle swipe navigation
        if (direction === 'left') {
            this.navigateToNext();
        } else if (direction === 'right') {
            this.navigateToPrevious();
        }
        
        // Emit custom event
        window.dispatchEvent(new CustomEvent('blazeSwipe', {
            detail: { direction }
        }));
    }
    
    triggerLongPress(event) {
        this.triggerHapticFeedback('heavy');
        
        const target = event.target.closest('.blaze-interactive, .chart-section, .blaze-metric-card');
        if (target) {
            this.showContextMenu(target, event.touches[0]);
        }
        
        window.dispatchEvent(new CustomEvent('blazeLongPress', {
            detail: { target: event.target }
        }));
    }
    
    optimizeTouchTargets() {
        // Ensure minimum 44px touch targets
        const style = document.createElement('style');
        style.textContent = `
            @media (pointer: coarse) {
                .blaze-cta-primary,
                .blaze-cta-secondary,
                button,
                .blaze-interactive {
                    min-height: 44px;
                    min-width: 44px;
                    padding: 12px 24px;
                }
                
                .blaze-metric-card {
                    padding: 20px;
                    margin: 8px;
                }
                
                .control-group select {
                    min-height: 44px;
                    font-size: 16px; /* Prevent zoom on iOS */
                }
            }
            
            .blaze-touch-active {
                transform: scale(0.95);
                opacity: 0.8;
                transition: all 0.1s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupMobileNavigation() {
        // Create mobile-friendly navigation
        const nav = document.querySelector('nav, .navbar, .blaze-navigation');
        if (nav && this.isMobile) {
            nav.classList.add('mobile-optimized');
            this.createMobileMenu(nav);
        }
        
        // Implement smooth scrolling for mobile
        this.setupSmoothScrolling();
    }
    
    createMobileMenu(nav) {
        const hamburger = document.createElement('button');
        hamburger.className = 'mobile-menu-toggle';
        hamburger.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        hamburger.setAttribute('aria-label', 'Toggle navigation menu');
        
        const menuItems = nav.querySelector('ul, .nav-items, .menu-items');
        if (menuItems) {
            menuItems.classList.add('mobile-menu-items');
            nav.insertBefore(hamburger, menuItems);
            
            hamburger.addEventListener('click', () => {
                const isOpen = menuItems.classList.toggle('mobile-menu-open');
                hamburger.classList.toggle('active', isOpen);
                hamburger.setAttribute('aria-expanded', isOpen);
                this.triggerHapticFeedback('light');
            });
        }
        
        this.addMobileMenuStyles();
    }
    
    addMobileMenuStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .mobile-menu-toggle {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    width: 30px;
                    height: 30px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    z-index: 1000;
                }
                
                .mobile-menu-toggle span {
                    width: 100%;
                    height: 3px;
                    background: var(--blaze-burnt-orange, #BF5700);
                    border-radius: 2px;
                    transition: all 0.3s ease;
                    transform-origin: center;
                }
                
                .mobile-menu-toggle.active span:nth-child(1) {
                    transform: rotate(45deg) translate(6px, 6px);
                }
                
                .mobile-menu-toggle.active span:nth-child(2) {
                    opacity: 0;
                }
                
                .mobile-menu-toggle.active span:nth-child(3) {
                    transform: rotate(-45deg) translate(6px, -6px);
                }
                
                .mobile-menu-items {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100vh;
                    background: rgba(26, 26, 26, 0.95);
                    backdrop-filter: blur(20px);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    transform: translateX(-100%);
                    transition: transform 0.3s ease;
                    z-index: 999;
                }
                
                .mobile-menu-items.mobile-menu-open {
                    transform: translateX(0);
                }
                
                .mobile-menu-items li {
                    margin: 1rem 0;
                    list-style: none;
                }
                
                .mobile-menu-items a {
                    font-size: 1.5rem;
                    color: white;
                    text-decoration: none;
                    padding: 1rem 2rem;
                    border-radius: 0.5rem;
                    transition: all 0.3s ease;
                }
                
                .mobile-menu-items a:hover {
                    background: var(--blaze-burnt-orange, #BF5700);
                    transform: scale(1.05);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    setupSmoothScrolling() {
        // Enhanced smooth scrolling for mobile
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    this.triggerHapticFeedback('light');
                }
            });
        });
    }
    
    optimizeForMobile() {
        // Optimize Three.js performance for mobile
        if (window.blazeStadium) {
            window.blazeStadium.optimizeForMobile(this.performance.isLowEndDevice);
        }
        
        // Optimize data visualizations
        if (window.blazeDataViz) {
            this.optimizeChartsForMobile();
        }
        
        // Lazy load images
        this.setupLazyLoading();
        
        // Optimize animations
        this.optimizeAnimations();
    }
    
    optimizeChartsForMobile() {
        // Reduce chart complexity for mobile
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: this.performance.reducedMotion ? false : {
                duration: this.performance.isLowEndDevice ? 500 : 1000
            },
            elements: {
                point: {
                    radius: this.isMobile ? 3 : 4,
                    hoverRadius: this.isMobile ? 5 : 6
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        };
        
        // Apply to existing charts
        if (window.Chart && window.Chart.defaults) {
            Object.assign(window.Chart.defaults, chartOptions);
        }
    }
    
    setupLazyLoading() {
        // Intersection Observer for lazy loading
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    optimizeAnimations() {
        if (this.performance.reducedMotion) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        } else if (this.performance.isLowEndDevice) {
            document.documentElement.style.setProperty('--animation-duration', '200ms');
        }
    }
    
    setupPWAFeatures() {
        // Install prompt handling
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton(deferredPrompt);
        });
        
        // Service worker registration
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('🔧 Service Worker registered');
                })
                .catch(error => {
                    console.error('❌ Service Worker registration failed:', error);
                });
        }
    }
    
    showInstallButton(deferredPrompt) {
        const installButton = document.createElement('button');
        installButton.className = 'pwa-install-button blaze-cta-primary';
        installButton.textContent = '📱 Install App';
        installButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            border-radius: 25px;
            box-shadow: 0 4px 12px rgba(191, 87, 0, 0.3);
        `;
        
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    this.triggerHapticFeedback('heavy');
                }
                
                deferredPrompt = null;
                installButton.remove();
            }
        });
        
        document.body.appendChild(installButton);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (installButton.parentNode) {
                installButton.remove();
            }
        }, 10000);
    }
    
    setupAccessibilityFeatures() {
        // Enhanced focus management
        this.setupFocusManagement();
        
        // Screen reader optimizations
        this.setupScreenReaderSupport();
        
        // Keyboard navigation
        this.setupKeyboardNavigation();
    }
    
    setupFocusManagement() {
        // Focus trap for mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusableElements = document.querySelectorAll(
                    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                const firstFocusable = focusableElements[0];
                const lastFocusable = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }
    
    setupScreenReaderSupport() {
        // Add ARIA labels for charts and data visualizations
        document.querySelectorAll('canvas').forEach((canvas, index) => {
            if (!canvas.getAttribute('aria-label')) {
                canvas.setAttribute('aria-label', `Data visualization chart ${index + 1}`);
            }
        });
        
        // Live region for dynamic updates
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-updates';
        document.body.appendChild(liveRegion);
        
        this.liveRegion = liveRegion;
    }
    
    setupKeyboardNavigation() {
        // Enhanced keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case '1':
                        this.focusSection('metrics');
                        break;
                    case '2':
                        this.focusSection('charts');
                        break;
                    case '3':
                        this.focusSection('controls');
                        break;
                    case 'r':
                        this.refreshData();
                        break;
                }
            }
        });
    }
    
    setupPerformanceOptimizations() {
        // Reduce resource usage on low-end devices
        if (this.performance.isLowEndDevice) {
            this.reducePerfomanceLevel();
        }
        
        // Monitor performance
        this.setupPerformanceMonitoring();
    }
    
    reducePerfomanceLevel() {
        // Reduce particle count
        if (window.blazeStadium) {
            window.blazeStadium.setParticleCount(500);
        }
        
        // Reduce update frequency
        this.updateInterval = 10000; // 10 seconds instead of 5
    }
    
    setupPerformanceMonitoring() {
        // Monitor FPS
        let lastTime = performance.now();
        let frames = 0;
        
        const measureFPS = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                
                if (fps < 30 && !this.performance.isLowEndDevice) {
                    this.adaptPerformance();
                }
                
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }
    
    adaptPerformance() {
        console.log('📊 Adapting performance for better experience');
        this.performance.isLowEndDevice = true;
        this.reducePerfomanceLevel();
    }
    
    triggerHapticFeedback(intensity = 'light') {
        if (!this.performance.enableHaptics) return;
        
        const patterns = {
            light: 10,
            medium: 50,
            heavy: 100
        };
        
        if (navigator.vibrate) {
            navigator.vibrate(patterns[intensity] || patterns.light);
        }
    }
    
    handleOrientationChange() {
        const newOrientation = this.getOrientation();
        
        if (newOrientation !== this.orientation) {
            this.orientation = newOrientation;
            
            // Resize charts
            if (window.blazeDataViz && window.blazeDataViz.charts) {
                setTimeout(() => {
                    window.blazeDataViz.charts.forEach(chart => {
                        if (chart.resize) chart.resize();
                    });
                }, 300);
            }
            
            // Adjust Three.js renderer
            if (window.blazeStadium) {
                window.blazeStadium.handleResize();
            }
            
            this.announceToScreenReader(`Orientation changed to ${newOrientation}`);
        }
    }
    
    handleResize() {
        // Efficient resize handling
        this.handleOrientationChange();
        
        // Update layout calculations
        if (this.initialized) {
            this.updateResponsiveElements();
        }
    }
    
    updateResponsiveElements() {
        // Update grid layouts
        const grids = document.querySelectorAll('.blaze-charts-grid, .blaze-metrics-header');
        grids.forEach(grid => {
            const width = grid.offsetWidth;
            const columns = width < 768 ? 1 : width < 1024 ? 2 : width < 1440 ? 3 : 4;
            grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        });
    }
    
    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }
    
    showContextMenu(target, touch) {
        // Create context menu for long press
        const menu = document.createElement('div');
        menu.className = 'blaze-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${touch.clientX}px;
            top: ${touch.clientY}px;
            background: rgba(26, 26, 26, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(191, 87, 0, 0.3);
            border-radius: 8px;
            padding: 8px 0;
            z-index: 10000;
            min-width: 200px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        const menuItems = [
            { text: '📊 View Details', action: () => this.viewDetails(target) },
            { text: '📤 Share', action: () => this.share(target) },
            { text: '🔄 Refresh', action: () => this.refreshData() },
            { text: '⚙️ Settings', action: () => this.openSettings() }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('button');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.text;
            menuItem.style.cssText = `
                width: 100%;
                padding: 12px 16px;
                background: none;
                border: none;
                color: white;
                text-align: left;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.2s ease;
            `;
            
            menuItem.addEventListener('click', () => {
                item.action();
                menu.remove();
            });
            
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.background = 'rgba(191, 87, 0, 0.2)';
            });
            
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.background = 'none';
            });
            
            menu.appendChild(menuItem);
        });
        
        document.body.appendChild(menu);
        
        // Remove menu on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
    }
    
    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    focusSection(section) {
        const sections = {
            metrics: '.blaze-metrics-header',
            charts: '.blaze-charts-grid',
            controls: '.blaze-control-panel'
        };
        
        const element = document.querySelector(sections[section]);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            element.focus();
        }
    }
    
    navigateToNext() {
        // Implement section-based navigation
        console.log('🔄 Navigate to next section');
    }
    
    navigateToPrevious() {
        // Implement section-based navigation
        console.log('🔄 Navigate to previous section');
    }
    
    viewDetails(target) {
        console.log('📊 View details for:', target);
    }
    
    share(target) {
        if (navigator.share) {
            navigator.share({
                title: 'Blaze Intelligence Analytics',
                text: 'Check out these sports analytics from Blaze Intelligence',
                url: window.location.href
            });
        }
    }
    
    refreshData() {
        if (window.blazeDataViz && window.blazeDataViz.refreshAllData) {
            window.blazeDataViz.refreshAllData();
        }
    }
    
    openSettings() {
        console.log('⚙️ Open settings panel');
    }
    
    destroy() {
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
        
        if (this.chartUpdateInterval) {
            clearInterval(this.chartUpdateInterval);
        }
        
        console.log('🧹 Mobile optimization cleaned up');
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    window.blazeMobile = new BlazeMobileOptimization();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeMobileOptimization;
}