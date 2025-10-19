/**
 * ============================================
 * BLAZE SPORTS INTEL - DESIGN SYSTEM JS
 * Enhanced Interactivity & Accessibility
 * ============================================
 */

class BlazeDesignSystem {
  constructor() {
    this.theme = 'dark';
    this.sportMode = 'all';
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    this.init();
  }

  init() {
    this.setupThemeSystem();
    this.setupAccessibility();
    this.setupSportModes();
    this.setupPerformanceObserver();
    this.setupAnimations();
    this.initializeComponents();
  }

  // ============================================
  // THEME SYSTEM
  // ============================================

  setupThemeSystem() {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('bsi-theme') || 'dark';
    this.setTheme(savedTheme);

    // Listen for theme toggle
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-theme-toggle]')) {
        this.toggleTheme();
      }
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('bsi-theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bsi-theme', theme);

    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = theme === 'dark' ? '#0A0A0F' : '#FFFFFF';
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('bsi-theme-change', { detail: { theme } }));
  }

  toggleTheme() {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  // ============================================
  // ACCESSIBILITY ENHANCEMENTS
  // ============================================

  setupAccessibility() {
    // Keyboard Navigation Enhancement
    this.setupKeyboardNavigation();

    // Screen Reader Announcements
    this.setupLiveRegions();

    // Focus Management
    this.setupFocusManagement();

    // ARIA Labels and Descriptions
    this.enhanceARIA();

    // Color Contrast Checker
    if (this.highContrast) {
      document.body.classList.add('bsi-high-contrast');
    }
  }

  setupKeyboardNavigation() {
    // Tab trap for modals
    document.addEventListener('keydown', (e) => {
      const modal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
      if (modal && e.key === 'Tab') {
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }

      // Escape key closes modals
      if (e.key === 'Escape' && modal) {
        this.closeModal(modal);
      }
    });

    // Arrow key navigation for menus
    document.querySelectorAll('[role="menu"]').forEach(menu => {
      const items = menu.querySelectorAll('[role="menuitem"]');

      menu.addEventListener('keydown', (e) => {
        const currentIndex = Array.from(items).indexOf(document.activeElement);

        switch(e.key) {
          case 'ArrowDown':
            e.preventDefault();
            items[(currentIndex + 1) % items.length].focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            items[(currentIndex - 1 + items.length) % items.length].focus();
            break;
          case 'Home':
            e.preventDefault();
            items[0].focus();
            break;
          case 'End':
            e.preventDefault();
            items[items.length - 1].focus();
            break;
        }
      });
    });
  }

  setupLiveRegions() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.className = 'bsi-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);

    // Create assertive live region for important announcements
    const assertiveRegion = document.createElement('div');
    assertiveRegion.className = 'bsi-live-region';
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(assertiveRegion);
  }

  announce(message, priority = 'polite') {
    const region = document.querySelector(`.bsi-live-region[aria-live="${priority}"]`);
    if (region) {
      region.textContent = message;
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }

  setupFocusManagement() {
    // Save and restore focus for modals
    let previousFocus = null;

    document.addEventListener('bsi-modal-open', (e) => {
      previousFocus = document.activeElement;
      const modal = e.detail.modal;
      const firstFocusable = modal.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) {
        firstFocusable.focus();
      }
    });

    document.addEventListener('bsi-modal-close', () => {
      if (previousFocus) {
        previousFocus.focus();
        previousFocus = null;
      }
    });

    // Skip to main content
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'bsi-skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  enhanceARIA() {
    // Add ARIA labels to icon buttons
    document.querySelectorAll('button:not([aria-label])').forEach(button => {
      const icon = button.querySelector('i, svg');
      if (icon && !button.textContent.trim()) {
        // Try to infer label from class names or data attributes
        const label = button.getAttribute('data-label') ||
                     button.className.match(/btn-(\w+)/)?.[1] ||
                     'Button';
        button.setAttribute('aria-label', label);
      }
    });

    // Add ARIA descriptions for complex components
    document.querySelectorAll('.bsi-player-card').forEach(card => {
      const playerName = card.querySelector('.bsi-player-name')?.textContent;
      const position = card.querySelector('.bsi-player-position')?.textContent;
      if (playerName) {
        card.setAttribute('aria-label', `Player card for ${playerName}${position ? ', ' + position : ''}`);
      }
    });

    // Enhance form fields
    document.querySelectorAll('input, textarea, select').forEach(field => {
      if (!field.hasAttribute('aria-label') && !field.hasAttribute('aria-labelledby')) {
        const label = field.closest('label') ||
                     document.querySelector(`label[for="${field.id}"]`);
        if (label) {
          field.setAttribute('aria-label', label.textContent.trim());
        }
      }

      // Add aria-invalid for validation
      field.addEventListener('invalid', () => {
        field.setAttribute('aria-invalid', 'true');
      });

      field.addEventListener('input', () => {
        if (field.validity.valid) {
          field.removeAttribute('aria-invalid');
        }
      });
    });
  }

  // ============================================
  // SPORT MODE SYSTEM
  // ============================================

  setupSportModes() {
    // Sport mode switcher
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-sport-mode]')) {
        const sport = e.target.getAttribute('data-sport-mode');
        this.setSportMode(sport);
      }
    });
  }

  setSportMode(sport) {
    this.sportMode = sport;
    document.documentElement.setAttribute('data-sport', sport);

    // Update all sport-specific components
    this.updateSportComponents(sport);

    // Announce to screen readers
    this.announce(`Switched to ${sport} mode`);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('bsi-sport-change', { detail: { sport } }));
  }

  updateSportComponents(sport) {
    // Update color schemes
    const sportThemes = {
      baseball: {
        primary: 'var(--bsi-cardinals-red)',
        secondary: 'var(--bsi-baseball-diamond)',
        accent: 'var(--bsi-baseball-dirt)'
      },
      football: {
        primary: 'var(--bsi-titans-navy)',
        secondary: 'var(--bsi-football-grass)',
        accent: 'var(--bsi-football-field)'
      },
      basketball: {
        primary: 'var(--bsi-grizzlies-blue)',
        secondary: 'var(--bsi-basketball-court)',
        accent: 'var(--bsi-basketball-hardwood)'
      },
      track: {
        primary: 'var(--bsi-longhorns-orange)',
        secondary: 'var(--bsi-track-surface)',
        accent: 'var(--bsi-track-lane)'
      }
    };

    if (sportThemes[sport]) {
      const theme = sportThemes[sport];
      document.documentElement.style.setProperty('--sport-primary', theme.primary);
      document.documentElement.style.setProperty('--sport-secondary', theme.secondary);
      document.documentElement.style.setProperty('--sport-accent', theme.accent);
    }
  }

  // ============================================
  // PERFORMANCE OPTIMIZATION
  // ============================================

  setupPerformanceObserver() {
    // Lazy load images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Reduce animations if requested
    if (this.reducedMotion) {
      document.documentElement.style.setProperty('--bsi-duration-instant', '0ms');
      document.documentElement.style.setProperty('--bsi-duration-fast', '0ms');
      document.documentElement.style.setProperty('--bsi-duration-normal', '0ms');
      document.documentElement.style.setProperty('--bsi-duration-slow', '0ms');
      document.documentElement.style.setProperty('--bsi-duration-slower', '0ms');
    }

    // Optimize scroll performance
    let ticking = false;
    const updateScrollProgress = () => {
      const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      document.documentElement.style.setProperty('--scroll-progress', scrollProgress);
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    }, { passive: true });
  }

  // ============================================
  // ANIMATION SYSTEM
  // ============================================

  setupAnimations() {
    // Number counter animation
    this.animateNumbers();

    // Stagger animations on scroll
    this.setupScrollAnimations();

    // Sport-specific animations
    this.setupSportAnimations();
  }

  animateNumbers() {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };

    const numberObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          const target = entry.target;
          const finalValue = parseFloat(target.textContent);
          const duration = 2000; // 2 seconds
          const start = performance.now();

          const updateNumber = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = finalValue * easeOutQuart;

            target.textContent = target.dataset.format === 'decimal'
              ? currentValue.toFixed(1)
              : Math.floor(currentValue).toLocaleString();

            if (progress < 1) {
              requestAnimationFrame(updateNumber);
            } else {
              target.dataset.animated = 'true';
            }
          };

          if (!this.reducedMotion) {
            requestAnimationFrame(updateNumber);
          } else {
            target.dataset.animated = 'true';
          }
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-animate-number]').forEach(el => {
      numberObserver.observe(el);
    });
  }

  setupScrollAnimations() {
    if (this.reducedMotion) return;

    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('bsi-animate-in');
          }, index * 100); // Stagger by 100ms
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px'
    });

    document.querySelectorAll('[data-animate]').forEach(el => {
      scrollObserver.observe(el);
    });
  }

  setupSportAnimations() {
    // Baseball swing animation
    document.querySelectorAll('.bsi-baseball-swing').forEach(el => {
      el.addEventListener('click', () => {
        el.style.animation = 'none';
        el.offsetHeight; // Trigger reflow
        el.style.animation = 'baseball-swing 0.5s var(--bsi-motion-swing)';
      });
    });

    // Football tackle animation
    document.querySelectorAll('.bsi-football-tackle').forEach(el => {
      el.addEventListener('click', () => {
        el.style.animation = 'none';
        el.offsetHeight; // Trigger reflow
        el.style.animation = 'football-tackle 0.3s var(--bsi-motion-tackle)';
      });
    });

    // Basketball shot animation
    document.querySelectorAll('.bsi-basketball-shot').forEach(el => {
      el.addEventListener('click', () => {
        el.style.animation = 'none';
        el.offsetHeight; // Trigger reflow
        el.style.animation = 'basketball-shot 0.6s var(--bsi-motion-shot)';
      });
    });
  }

  // ============================================
  // COMPONENT INITIALIZATION
  // ============================================

  initializeComponents() {
    this.initializeSportToggles();
    this.initializePerformanceMeters();
    this.initializeCharts();
    this.initializeTooltips();
  }

  initializeSportToggles() {
    document.querySelectorAll('.bsi-sport-toggle').forEach(toggle => {
      const options = toggle.querySelectorAll('.bsi-toggle-option');

      options.forEach(option => {
        option.addEventListener('click', () => {
          options.forEach(opt => opt.classList.remove('active'));
          option.classList.add('active');

          const sport = option.dataset.sport;
          if (sport) {
            this.setSportMode(sport);
          }
        });
      });
    });
  }

  initializePerformanceMeters() {
    document.querySelectorAll('.bsi-performance-meter').forEach(meter => {
      const fill = meter.querySelector('.bsi-meter-fill');
      const value = parseFloat(meter.dataset.value) || 0;
      const max = parseFloat(meter.dataset.max) || 100;
      const percentage = (value / max) * 100;

      // Calculate rotation (-90 to 90 degrees)
      const rotation = (percentage * 1.8) - 90;

      if (fill) {
        // Delay for animation effect
        setTimeout(() => {
          fill.style.transform = `rotate(${rotation}deg)`;
        }, 100);
      }
    });
  }

  initializeCharts() {
    // Initialize Chart.js charts with sport-specific themes
    const charts = document.querySelectorAll('[data-chart]');

    charts.forEach(canvas => {
      const type = canvas.dataset.chartType || 'line';
      const sport = canvas.dataset.sport || this.sportMode;

      // Sport-specific color palettes
      const sportColors = {
        baseball: ['#C41E3A', '#0C2340', '#6B8E23', '#8B7355'],
        football: ['#002244', '#4B92DB', '#228B22', '#355E3B'],
        basketball: ['#5D76A9', '#FDB927', '#E25822', '#8B4513'],
        track: ['#FF6600', '#FFFFFF', '#DC143C', '#FFD700']
      };

      const colors = sportColors[sport] || sportColors.baseball;

      // Chart configuration would go here
      // This is a placeholder for actual Chart.js implementation
    });
  }

  initializeTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
      const tooltip = document.createElement('div');
      tooltip.className = 'bsi-tooltip';
      tooltip.textContent = element.dataset.tooltip;
      tooltip.style.display = 'none';
      document.body.appendChild(tooltip);

      element.addEventListener('mouseenter', (e) => {
        const rect = element.getBoundingClientRect();
        tooltip.style.display = 'block';
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
        tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
      });

      element.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });

      // Accessibility: show tooltip on focus
      element.addEventListener('focus', () => {
        const rect = element.getBoundingClientRect();
        tooltip.style.display = 'block';
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
        tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
      });

      element.addEventListener('blur', () => {
        tooltip.style.display = 'none';
      });
    });
  }

  // ============================================
  // PUBLIC API
  // ============================================

  // Method to update live sports data
  updateLiveData(data) {
    // Update score tickers
    document.querySelectorAll('.bsi-score-ticker').forEach(ticker => {
      const teamId = ticker.dataset.teamId;
      if (data[teamId]) {
        const scoreElement = ticker.querySelector('.bsi-score-value');
        if (scoreElement) {
          scoreElement.textContent = data[teamId].score;
        }
      }
    });

    // Announce score updates to screen readers
    if (data.announcement) {
      this.announce(data.announcement, 'polite');
    }
  }

  // Method to show notifications
  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `bsi-notification bsi-notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.textContent = message;

    const container = document.getElementById('notification-container') || document.body;
    container.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Auto dismiss
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }

  // Method to validate form fields
  validateField(field) {
    const validators = {
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      phone: (value) => /^\d{10}$/.test(value.replace(/\D/g, '')),
      required: (value) => value.trim().length > 0
    };

    const type = field.dataset.validate || field.type;
    const validator = validators[type];

    if (validator && !validator(field.value)) {
      field.setAttribute('aria-invalid', 'true');
      return false;
    }

    field.removeAttribute('aria-invalid');
    return true;
  }
}

// Initialize the design system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.BlazeDS = new BlazeDesignSystem();
  });
} else {
  window.BlazeDS = new BlazeDesignSystem();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlazeDesignSystem;
}