# 🔥 Blaze Intelligence Copilot MCP Configuration

This document provides setup and usage instructions for the Blaze Intelligence Copilot MCP (Model Context Protocol) server, designed specifically for coding assistance and development tasks.

## Overview

The Copilot MCP server provides AI-powered coding assistance through a comprehensive set of tools that integrate with your development workflow. It enables intelligent code analysis, generation, refactoring, testing, and project management directly from your AI assistant.

## Quick Start

### 1. Install Dependencies

```bash
# Install MCP SDK if not already installed
npm install @modelcontextprotocol/sdk

# Install additional development dependencies
npm install --save-dev eslint prettier jest
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.copilot.example .env.copilot

# Edit with your settings
nano .env.copilot
```

### 3. Start the Copilot Server

```bash
# Using npm script
npm run mcp-copilot

# Or directly
./start-copilot-server.sh
```

### 4. Configure Claude Desktop

Copy the Copilot configuration to your Claude Desktop:

**macOS:**
```bash
cp claude_desktop_config_copilot.json ~/.config/claude/claude_desktop_config.json
# or
cp claude_desktop_config_copilot.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Linux:**
```bash
cp claude_desktop_config_copilot.json ~/.config/claude/claude_desktop_config.json
```

**Windows:**
```bash
copy claude_desktop_config_copilot.json %APPDATA%\Claude\claude_desktop_config.json
```

## Available Tools

### 📊 Code Analysis
- **`analyze_code`** - Analyze code structure, performance, security, and dependencies
  - Structure analysis (functions, imports, exports)
  - Dependency mapping
  - Security vulnerability detection
  - Performance bottleneck identification

### 🔧 Code Generation
- **`generate_code`** - Generate code based on specifications
  - Supports JavaScript, TypeScript, Python, HTML, CSS
  - Framework-aware generation (React, Vue, Node.js)
  - Template-based code scaffolding
  - Custom output path configuration

### ♻️ Code Refactoring
- **`refactor_code`** - Intelligent code refactoring
  - Function extraction
  - Performance optimization
  - Readability improvements
  - Syntax modernization
  - Type annotation addition

### 🧪 Testing & Quality
- **`run_tests`** - Execute and manage tests
  - Multiple framework support (Jest, Mocha, Pytest)
  - Coverage report generation
  - Pattern-based test execution
  - Detailed result analysis

- **`lint_and_format`** - Code linting and formatting
  - ESLint integration
  - Prettier formatting
  - Auto-fix capabilities
  - Custom rule configuration

### 📦 Project Management
- **`manage_dependencies`** - Dependency management
  - Install, update, audit packages
  - Multi-package manager support (npm, yarn, pnpm)
  - Security vulnerability scanning
  - Dependency tree analysis

- **`build_project`** - Project building
  - Environment-specific builds
  - Watch mode support
  - Custom build targets
  - Build optimization

- **`deploy_project`** - Deployment automation
  - Multi-platform support (Cloudflare, Netlify, Vercel)
  - Environment-specific deployments
  - Configuration management
  - Deployment status tracking

### 🔍 Navigation & Discovery
- **`analyze_project_structure`** - Project structure visualization
  - Directory tree generation
  - File type analysis
  - Dependency mapping
  - Architecture overview

- **`search_codebase`** - Intelligent code search
  - Pattern matching
  - File type filtering
  - Case-sensitive options
  - Test inclusion controls

## Configuration Options

### Environment Variables

Key configuration options in `.env.copilot`:

```bash
# Core settings
NODE_ENV=development
BLAZE_PROJECT_ROOT=/path/to/project
DEFAULT_LANGUAGE=typescript
DEFAULT_FRAMEWORK=react

# Tool preferences
PACKAGE_MANAGER=npm
TEST_FRAMEWORK=jest
LINTER=eslint

# Security settings
SECURITY_SCAN=true
MAX_EXECUTION_TIME=30
ALLOWED_EXTENSIONS=js,ts,jsx,tsx,html,css,py,sh

# Performance settings
ENABLE_CACHE=true
MAX_CONCURRENT_OPS=5
```

### Claude Desktop Configuration

The `claude_desktop_config_copilot.json` includes:

- **Copilot Server**: Main coding assistance server
- **Filesystem Server**: File system access
- **GitHub Server**: Repository integration
- **Cardinals Analytics**: Sports data integration

## Usage Examples

### Code Analysis

```bash
# Analyze code structure
analyze_code(filePath="src/components/Dashboard.tsx", analysisType="structure")

# Security analysis
analyze_code(filePath="api/auth.js", analysisType="security")

# Dependency analysis
analyze_code(filePath="package.json", analysisType="dependencies")
```

### Code Generation

```bash
# Generate React component
generate_code(
  specification="Create a responsive dashboard component with charts",
  language="typescript",
  framework="react",
  outputPath="src/components/Dashboard.tsx"
)

# Generate API endpoint
generate_code(
  specification="Create REST API for user authentication",
  language="javascript",
  framework="node",
  outputPath="api/auth.js"
)
```

### Testing & Quality

```bash
# Run all tests with coverage
run_tests(framework="jest", coverage=true)

# Run specific test pattern
run_tests(testPattern="auth", framework="jest")

# Lint and fix code
lint_and_format(filePath="src/", fix=true, linter="eslint")
```

### Project Management

```bash
# Install dependencies
manage_dependencies(action="install", packageName="react-router-dom")

# Build for production
build_project(environment="production", target="build:prod")

# Deploy to Cloudflare Pages
deploy_project(platform="cloudflare-pages", environment="production")
```

### Navigation & Discovery

```bash
# Analyze project structure
analyze_project_structure(depth=3, format="tree")

# Search for function usage
search_codebase(query="useEffect", fileType="tsx", includeTests=false)

# Find security patterns
search_codebase(query="process.env", caseSensitive=true)
```

## Integration with Development Workflow

### IDE Integration

The Copilot MCP server works seamlessly with:

- **Claude Desktop**: Primary interface for AI assistance
- **VS Code**: Through Claude extension
- **Command Line**: Direct tool execution
- **CI/CD Pipelines**: Automated code analysis and testing

### Workflow Examples

#### 1. Code Review Workflow
```bash
# Analyze code for review
analyze_code(filePath="src/new-feature.ts", analysisType="security")
lint_and_format(filePath="src/new-feature.ts", fix=true)
run_tests(testPattern="new-feature")
```

#### 2. Feature Development
```bash
# Generate boilerplate
generate_code(specification="User profile component", language="typescript", framework="react")

# Refactor existing code
refactor_code(filePath="src/old-component.tsx", refactorType="improve_readability")

# Test and deploy
run_tests(coverage=true)
build_project(environment="staging")
deploy_project(platform="netlify", environment="staging")
```

#### 3. Project Maintenance
```bash
# Audit dependencies
manage_dependencies(action="audit")

# Update packages
manage_dependencies(action="update")

# Analyze project structure
analyze_project_structure(depth=2, format="json")
```

## Security Considerations

### File Access Controls
- Limited to project root directory
- Configurable file extension whitelist
- Maximum file size limits
- Execution timeout protection

### Command Execution
- Sandboxed execution environment
- Limited to safe development commands
- No system-level modifications
- Audit logging for all operations

### Sensitive Data Protection
- Environment variable isolation
- No credential storage in logs
- Secure API key handling
- Optional security scanning

## Troubleshooting

### Common Issues

1. **Server Won't Start**
   ```bash
   # Check Node.js version
   node --version  # Should be 18+
   
   # Install dependencies
   npm install @modelcontextprotocol/sdk
   ```

2. **Tools Not Available in Claude**
   ```bash
   # Restart Claude Desktop after configuration
   # Check configuration file location
   # Verify server is running
   ```

3. **Command Execution Failures**
   ```bash
   # Check file permissions
   chmod +x start-copilot-server.sh
   
   # Verify working directory
   echo $BLAZE_PROJECT_ROOT
   ```

### Debugging

Enable debug logging:
```bash
export DEBUG=copilot:*
./start-copilot-server.sh
```

Check server logs:
```bash
tail -f logs/copilot-server-*.log
```

### Performance Optimization

1. **Enable Caching**
   ```bash
   ENABLE_CACHE=true
   CACHE_TTL=3600
   ```

2. **Limit Concurrent Operations**
   ```bash
   MAX_CONCURRENT_OPS=3
   ```

3. **Optimize Analysis Depth**
   ```bash
   MAX_ANALYSIS_DEPTH=3
   MAX_FILE_SIZE=524288  # 512KB
   ```

## Contributing

### Adding New Tools

1. Define tool schema in `TOOLS` array
2. Implement handler in `toolHandlers`
3. Update documentation
4. Add tests (when available)

### Custom Extensions

Create custom tools in the `tools/` directory:

```javascript
// tools/custom-tool.js
export async function customTool(args) {
  // Implementation
  return { success: true, result: "Custom tool executed" };
}
```

### Integration Testing

```bash
# Test server startup
npm run mcp-copilot

# Test tool execution (when test framework is available)
npm run test-copilot
```

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review server logs
3. Create an issue in the repository
4. Contact: ahump20@outlook.com

## License

This configuration is part of the Blaze Intelligence platform and follows the same licensing terms as the main project.