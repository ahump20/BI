/**
 * Championship Mobile Enhancements
 * Advanced mobile optimizations for Blaze Intelligence platforms
 * Touch gestures, responsive behavior, and mobile-specific features
 */

class ChampionshipMobileEnhancements {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        this.touchSupported = 'ontouchstart' in window;
        this.orientation = this.getOrientation();
        this.scrollPosition = 0;
        this.lastScrollTime = 0;
        this.rafId = null;

        this.init();
    }

    init() {
        console.log('🏆 Initializing Championship Mobile Enhancements...');

        if (this.isMobile || this.isTablet) {
            this.setupMobileNavigation();
            this.setupTouchGestures();
            this.setupResponsiveImages();
            this.setupPerformanceOptimizations();
            this.setupAccessibilityFeatures();
            this.setupPullToRefresh();

            console.log('✅ Mobile enhancements active');
        }

        this.setupOrientationChange();
        this.setupScrollOptimizations();
        this.setupToastNotifications();
        this.setupConnectionStatus();

        console.log(`📱 Device: ${this.getDeviceInfo()}`);
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    detectTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    getOrientation() {
        if (screen.orientation) {
            return screen.orientation.angle === 0 || screen.orientation.angle === 180 ? 'portrait' : 'landscape';
        }
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    getDeviceInfo() {
        const info = [];
        if (this.isMobile) info.push('Mobile');
        if (this.isTablet) info.push('Tablet');
        if (this.touchSupported) info.push('Touch');
        info.push(this.orientation);
        return info.join(' | ');
    }

    setupMobileNavigation() {
        const mobileNav = this.createMobileNavigation();
        document.body.insertBefore(mobileNav, document.body.firstChild);

        // Mobile menu toggle
        const menuButton = document.querySelector('.mobile-menu-button');
        const menu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');
        const closeButton = document.querySelector('.mobile-menu-close');

        if (menuButton && menu && overlay) {
            menuButton.addEventListener('click', () => this.toggleMobileMenu(true));
            closeButton?.addEventListener('click', () => this.toggleMobileMenu(false));
            overlay.addEventListener('click', () => this.toggleMobileMenu(false));

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && menu.classList.contains('open')) {
                    this.toggleMobileMenu(false);
                }
            });
        }

        // Auto-hide nav on scroll
        this.setupAutoHideNavigation();
    }

    createMobileNavigation() {
        const nav = document.createElement('div');
        nav.className = 'mobile-nav-container';
        nav.innerHTML = `
            <a href="/" class="mobile-logo">
                🏆 Blaze Intelligence
            </a>
            <button class="mobile-menu-button" aria-label="Open menu">
                <i class="fas fa-bars"></i>
            </button>
        `;

        const menu = document.createElement('div');
        menu.className = 'mobile-menu';
        menu.innerHTML = `
            <button class="mobile-menu-close" aria-label="Close menu">×</button>
            <nav>
                <ul class="mobile-nav-links">
                    <li><a href="/"><span class="icon">🏠</span>Championship Hub</a></li>
                    <li><a href="/video-intelligence.html"><span class="icon">📹</span>Video Intelligence</a></li>
                    <li><a href="/ar-coach.html"><span class="icon">🥽</span>AR Coaching</a></li>
                    <li><a href="/analytics.html"><span class="icon">📊</span>Live Analytics</a></li>
                    <li><a href="/dashboard.html"><span class="icon">📈</span>Dashboard</a></li>
                    <li><a href="/contact.html"><span class="icon">📞</span>Contact</a></li>
                </ul>
            </nav>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';

        document.body.appendChild(menu);
        document.body.appendChild(overlay);

        return nav;
    }

    toggleMobileMenu(open) {
        const menu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');

        if (open) {
            menu.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        } else {
            menu.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    setupAutoHideNavigation() {
        const nav = document.querySelector('.mobile-nav-container');
        if (!nav) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateNavVisibility = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                nav.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                nav.style.transform = 'translateY(0)';

                // Add scrolled class for styling
                if (currentScrollY > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
            }

            lastScrollY = currentScrollY;
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateNavVisibility);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    setupTouchGestures() {
        if (!this.touchSupported) return;

        let startY = 0;
        let startX = 0;
        let isScrolling = false;

        // Swipe to navigate
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
            isScrolling = false;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!startY || !startX) return;

            const currentY = e.touches[0].clientY;
            const currentX = e.touches[0].clientX;
            const diffY = Math.abs(currentY - startY);
            const diffX = Math.abs(currentX - startX);

            if (diffY > diffX) {
                isScrolling = true;
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!startY || !startX || isScrolling) return;

            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const diffY = startY - endY;
            const diffX = startX - endX;

            // Horizontal swipe detection
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - next page
                    this.handleSwipeLeft();
                } else {
                    // Swipe right - previous page or menu
                    this.handleSwipeRight();
                }
            }

            startY = 0;
            startX = 0;
        }, { passive: true });
    }

    handleSwipeLeft() {
        // Could navigate to next section or close menu
        const menu = document.querySelector('.mobile-menu');
        if (menu?.classList.contains('open')) {
            this.toggleMobileMenu(false);
        }
    }

    handleSwipeRight() {
        // Could open menu or navigate back
        const menu = document.querySelector('.mobile-menu');
        if (!menu?.classList.contains('open')) {
            this.toggleMobileMenu(true);
        }
    }

    setupResponsiveImages() {
        // Lazy loading for images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));

        // Responsive image sizing
        this.optimizeImageSizes();
    }

    optimizeImageSizes() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('data-responsive')) {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.setAttribute('data-responsive', 'true');
            }
        });
    }

    setupPerformanceOptimizations() {
        // Throttle resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Optimize scroll performance
        this.setupScrollOptimizations();

        // Preload critical resources
        this.preloadCriticalResources();

        // Service worker for caching
        this.registerServiceWorker();
    }

    setupScrollOptimizations() {
        let ticking = false;

        const optimizedScroll = () => {
            this.scrollPosition = window.pageYOffset;
            this.lastScrollTime = performance.now();

            // Add/remove classes based on scroll position
            const elements = document.querySelectorAll('.championship-card');
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.classList.add('in-viewport');
                } else {
                    el.classList.remove('in-viewport');
                }
            });

            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(optimizedScroll);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    setupAccessibilityFeatures() {
        // Focus management for mobile menu
        const menu = document.querySelector('.mobile-menu');
        const menuButton = document.querySelector('.mobile-menu-button');

        if (menu && menuButton) {
            menu.addEventListener('keydown', (e) => {
                const focusableElements = menu.querySelectorAll(
                    'a, button, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.key === 'Tab') {
                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }

        // Improve touch targets
        this.improveTouchTargets();

        // Add ARIA labels where needed
        this.addAriaLabels();
    }

    improveTouchTargets() {
        const buttons = document.querySelectorAll('button, a, input, select, textarea');
        buttons.forEach(button => {
            const rect = button.getBoundingClientRect();
            if (rect.height < 44 || rect.width < 44) {
                button.style.minHeight = '44px';
                button.style.minWidth = '44px';
                button.style.display = 'inline-flex';
                button.style.alignItems = 'center';
                button.style.justifyContent = 'center';
            }
        });
    }

    addAriaLabels() {
        // Add missing aria-labels
        const elements = document.querySelectorAll('[data-needs-aria]');
        elements.forEach(el => {
            if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) {
                const text = el.textContent.trim() || el.getAttribute('title') || 'Interactive element';
                el.setAttribute('aria-label', text);
            }
        });
    }

    setupPullToRefresh() {
        if (!this.touchSupported) return;

        let startY = 0;
        let currentY = 0;
        let isRefreshing = false;
        let pullDistance = 0;

        const refreshIndicator = this.createRefreshIndicator();

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (window.scrollY === 0 && startY > 0) {
                currentY = e.touches[0].clientY;
                pullDistance = currentY - startY;

                if (pullDistance > 0 && pullDistance < 100) {
                    const progress = pullDistance / 100;
                    refreshIndicator.style.transform = `translateY(${pullDistance}px) scale(${progress})`;
                    refreshIndicator.style.opacity = progress;
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (pullDistance > 80 && !isRefreshing) {
                this.triggerRefresh(refreshIndicator);
            } else {
                refreshIndicator.style.transform = 'translateY(-100px) scale(0)';
                refreshIndicator.style.opacity = '0';
            }

            startY = 0;
            currentY = 0;
            pullDistance = 0;
        }, { passive: true });
    }

    createRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'pull-refresh-indicator';
        indicator.innerHTML = '🔄';
        indicator.style.cssText = `
            position: fixed;
            top: -50px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px) scale(0);
            background: var(--championship-gradient);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            z-index: 1000;
            transition: all 0.3s ease;
            opacity: 0;
        `;

        document.body.appendChild(indicator);
        return indicator;
    }

    triggerRefresh(indicator) {
        indicator.innerHTML = '⟳';
        indicator.style.animation = 'spin 1s linear infinite';

        // Simulate refresh
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    setupOrientationChange() {
        const handleOrientationChange = () => {
            setTimeout(() => {
                this.orientation = this.getOrientation();
                this.handleResize();

                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('orientationchange', {
                    detail: { orientation: this.orientation }
                }));
            }, 100);
        };

        window.addEventListener('orientationchange', handleOrientationChange);
        screen.orientation?.addEventListener('change', handleOrientationChange);
    }

    handleResize() {
        // Update mobile detection
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();

        // Optimize layout
        this.optimizeImageSizes();

        // Update viewport meta tag
        this.updateViewportMeta();

        console.log(`📱 Resize: ${window.innerWidth}x${window.innerHeight} (${this.orientation})`);
    }

    updateViewportMeta() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }

        const content = [
            'width=device-width',
            'initial-scale=1.0',
            'maximum-scale=5.0',
            'user-scalable=yes',
            'viewport-fit=cover'
        ].join(', ');

        viewport.content = content;
    }

    setupToastNotifications() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        this.toastContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 16px;
            right: 16px;
            z-index: 1050;
            pointer-events: none;
        `;
        document.body.appendChild(this.toastContainer);
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `mobile-toast ${type}`;
        toast.textContent = message;
        toast.style.pointerEvents = 'auto';

        this.toastContainer.appendChild(toast);

        // Trigger show animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    this.toastContainer.removeChild(toast);
                }
            }, 300);
        }, duration);

        return toast;
    }

    setupConnectionStatus() {
        const showConnectionStatus = (online) => {
            const message = online ? 'Connection restored' : 'Connection lost';
            const type = online ? 'success' : 'error';
            this.showToast(message, type);
        };

        window.addEventListener('online', () => showConnectionStatus(true));
        window.addEventListener('offline', () => showConnectionStatus(false));
    }

    preloadCriticalResources() {
        const criticalResources = [
            '/css/championship-mobile-responsive.css',
            '/js/championship-websocket-client.js',
            '/api/analytics'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';

            if (resource.endsWith('.css')) {
                link.as = 'style';
            } else if (resource.endsWith('.js')) {
                link.as = 'script';
            } else {
                link.as = 'fetch';
                link.crossOrigin = 'anonymous';
            }

            link.href = resource;
            document.head.appendChild(link);
        });
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered:', registration.scope);
                })
                .catch(error => {
                    console.log('❌ Service Worker registration failed:', error);
                });
        }
    }

    // Public API
    isDeviceMobile() {
        return this.isMobile;
    }

    isDeviceTablet() {
        return this.isTablet;
    }

    getCurrentOrientation() {
        return this.orientation;
    }

    getScrollPosition() {
        return this.scrollPosition;
    }

    smoothScrollTo(element, offset = 0) {
        const targetPosition = element.offsetTop - offset;

        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            // Fallback for older browsers
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 500;
            let start = null;

            const animation = (currentTime) => {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const progress = Math.min(timeElapsed / duration, 1);

                const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                window.scrollTo(0, startPosition + distance * ease(progress));

                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            };

            requestAnimationFrame(animation);
        }
    }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.championshipMobile = new ChampionshipMobileEnhancements();
    });
} else {
    window.championshipMobile = new ChampionshipMobileEnhancements();
}

// Global access
window.ChampionshipMobileEnhancements = ChampionshipMobileEnhancements;

export default ChampionshipMobileEnhancements;