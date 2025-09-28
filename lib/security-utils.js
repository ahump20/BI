/**
 * Security Utilities for Blaze Intelligence
 * Input validation, XSS protection, and sanitization
 */

export class SecurityUtils {
    static sanitize(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        // Remove HTML tags and encode special characters
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    
    static sanitizeText(input) {
        return this.sanitize(input);
    }
    
    static sanitizeHTML(input) {
        return this.escapeHtml(input);
    }
    
    static validateGameData(data) {
        const errors = [];
        
        if (!data) {
            errors.push('Game data is required');
            return { isValid: false, errors };
        }
        
        if (!data.gameId) {
            errors.push('Game ID is required');
        }
        
        if (!data.teams || !data.teams.home || !data.teams.away) {
            errors.push('Team data is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    static validateInput(input, rules = {}) {
        const errors = [];
        
        if (rules.required && (!input || input.trim() === '')) {
            errors.push('This field is required');
        }
        
        if (rules.minLength && input.length < rules.minLength) {
            errors.push(`Minimum length is ${rules.minLength} characters`);
        }
        
        if (rules.maxLength && input.length > rules.maxLength) {
            errors.push(`Maximum length is ${rules.maxLength} characters`);
        }
        
        if (rules.pattern && !rules.pattern.test(input)) {
            errors.push('Invalid format');
        }
        
        if (rules.email && !this.isValidEmail(input)) {
            errors.push('Invalid email format');
        }
        
        return errors;
    }
    
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
    
    static preventXSS(data) {
        if (typeof data === 'string') {
            return this.escapeHtml(data);
        }
        
        if (Array.isArray(data)) {
            return data.map(item => this.preventXSS(item));
        }
        
        if (typeof data === 'object' && data !== null) {
            const cleaned = {};
            for (const [key, value] of Object.entries(data)) {
                cleaned[key] = this.preventXSS(value);
            }
            return cleaned;
        }
        
        return data;
    }
    
    static checkDangerousPatterns(input) {
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i
        ];
        
        return dangerousPatterns.some(pattern => pattern.test(input));
    }
    
    static removeAttribute(element, attribute) {
        if (element && element.removeAttribute) {
            element.removeAttribute(attribute);
        }
        return element;
    }
    
    static validateApiInput(data, schema) {
        const errors = {};
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            const fieldErrors = this.validateInput(value, rules);
            
            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

export default SecurityUtils;