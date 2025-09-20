# Contributing to Blaze Intelligence

Thank you for your interest in contributing to Blaze Intelligence! This document provides guidelines for contributing to our sports analytics platform.

## 🏗️ Development Setup

### Prerequisites
- Node.js 16+ and npm 8+
- Git
- Access to development environment

### Local Development
```bash
# Clone the repository
git clone https://github.com/ahump20/BI.git
cd BI

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📋 Development Workflow

### Branch Strategy
- `main` - Production branch
- `development` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes

### Pull Request Process
1. Create feature branch from `development`
2. Make your changes with appropriate tests
3. Run linting and tests: `npm run lint && npm run test`
4. Submit PR with clear description
5. Ensure CI/CD checks pass
6. Request review from maintainers

## 🎯 Focus Areas

### Supported Sports
- **MLB** - Cardinals primary focus
- **NFL** - Titans coverage
- **NCAA** - Longhorns basketball/football
- **NBA** - Grizzlies integration
- **High School** - Perfect Game baseball data
- **International** - Latin American, Japan, South Korea prospects

### Key Technologies
- **Frontend**: Three.js, React, HTML5, CSS3
- **Backend**: Node.js, Express, Python
- **AI Integration**: Claude, ChatGPT, Gemini APIs
- **Deployment**: Cloudflare Pages, Workers
- **Mobile**: React Native

## 🔒 Security Guidelines

### Data Protection
- Never commit API keys or secrets
- Use environment variables for sensitive data
- Follow secure coding practices
- Implement proper input validation

### Content Standards
- No false claims or fabricated data
- Verify all statistics and metrics
- Use factual savings claims (67-80% range)
- Include "Methods & Definitions" for benchmarks

## 🧪 Testing

### Test Requirements
- Unit tests for all new functions
- Integration tests for API endpoints
- Performance tests for analytics components
- Visual regression tests for UI components

### Running Tests
```bash
npm run test                # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:visual        # Visual regression tests
```

## 📱 Mobile App Development

The mobile app is located in `/mobile-app/` with its own development cycle:

```bash
cd mobile-app
npm install
npm run test
npm run build
```

## 🚀 Deployment

### Staging Deployment
```bash
npm run deploy:staging
```

### Production Deployment
```bash
npm run deploy:production
```

## 📊 Performance Standards

- **Load Time**: < 2 seconds first meaningful paint
- **Frame Rate**: 60+ FPS for animations
- **Bundle Size**: < 1MB initial load
- **Lighthouse Score**: 90+ across all metrics

## 🤖 AI Integration Guidelines

### Multi-AI Orchestration
- Follow MCP (Model Context Protocol) standards
- Implement proper error handling for AI services
- Cache responses appropriately
- Monitor API usage and costs

### Supported AI Platforms
- **Claude** - Primary analytics and reasoning
- **ChatGPT** - Content generation and analysis
- **Gemini** - Data processing and insights

## 📚 Documentation

### Code Documentation
- JSDoc comments for all functions
- README updates for new features
- API documentation updates
- Architecture decision records (ADRs)

### Content Guidelines
- Use "Blaze Intelligence" as canonical company name
- Focus on supported sports teams
- Maintain professional, factual tone
- No exaggerated claims or marketing hype

## 🐛 Bug Reports

### Issue Template
- Clear description of problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

### Labels
- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation updates
- `performance` - Performance improvements
- `security` - Security-related issues

## 🏆 Recognition

Contributors will be recognized in:
- Repository contributors list
- Release notes for significant contributions
- Company acknowledgments for major features

## 📞 Questions?

- **Technical Issues**: Create GitHub issue
- **Development Questions**: Contact Austin Humphrey
- **Security Concerns**: Email ahump20@outlook.com

---

Thank you for helping make Blaze Intelligence the premier sports analytics platform!