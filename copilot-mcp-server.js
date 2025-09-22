#!/usr/bin/env node

/**
 * Blaze Intelligence Copilot MCP Server
 * 
 * This server provides coding assistance through the Model Context Protocol,
 * enabling AI assistants to help with development tasks, code analysis,
 * file management, and integration with the Blaze Intelligence platform.
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration
const SERVER_INFO = {
  name: "blaze-copilot-agent",
  version: "1.0.0",
  description: "Blaze Intelligence Copilot MCP Server for coding assistance and development tasks"
};

// Project configuration
const PROJECT_CONFIG = {
  root: process.env.BLAZE_PROJECT_ROOT || process.cwd(),
  name: "Blaze Intelligence",
  frameworks: ["node", "react", "vue", "cloudflare-workers"],
  languages: ["javascript", "typescript", "html", "css", "python", "shell"]
};

// Available tools for coding assistance
const TOOLS = [
  {
    name: "analyze_code",
    description: "Analyze code structure, patterns, and potential improvements",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the file to analyze"
        },
        analysisType: {
          type: "string",
          enum: ["structure", "performance", "security", "style", "dependencies"],
          description: "Type of analysis to perform"
        }
      },
      required: ["filePath"]
    }
  },
  {
    name: "generate_code",
    description: "Generate code based on specifications and existing patterns",
    inputSchema: {
      type: "object",
      properties: {
        specification: {
          type: "string",
          description: "Description of what code to generate"
        },
        language: {
          type: "string",
          enum: ["javascript", "typescript", "html", "css", "python", "shell"],
          description: "Programming language for the generated code"
        },
        framework: {
          type: "string",
          enum: ["react", "vue", "node", "cloudflare-workers", "vanilla"],
          description: "Framework context for code generation"
        },
        outputPath: {
          type: "string",
          description: "Optional path where to save the generated code"
        }
      },
      required: ["specification", "language"]
    }
  },
  {
    name: "refactor_code",
    description: "Refactor existing code for better performance, readability, or maintainability",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the file to refactor"
        },
        refactorType: {
          type: "string",
          enum: ["extract_function", "optimize_performance", "improve_readability", "update_syntax", "add_types"],
          description: "Type of refactoring to perform"
        },
        targetStandard: {
          type: "string",
          description: "Target coding standard or style guide"
        }
      },
      required: ["filePath", "refactorType"]
    }
  },
  {
    name: "run_tests",
    description: "Execute tests and provide detailed results",
    inputSchema: {
      type: "object",
      properties: {
        testPattern: {
          type: "string",
          description: "Pattern or specific test to run (optional)"
        },
        framework: {
          type: "string",
          enum: ["jest", "mocha", "vitest", "npm", "pytest"],
          description: "Test framework to use"
        },
        coverage: {
          type: "boolean",
          description: "Whether to generate coverage report"
        }
      }
    }
  },
  {
    name: "lint_and_format",
    description: "Lint code and apply formatting according to project standards",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to file or directory to lint/format"
        },
        fix: {
          type: "boolean",
          description: "Whether to automatically fix issues"
        },
        linter: {
          type: "string",
          enum: ["eslint", "prettier", "pylint", "black"],
          description: "Specific linter to use"
        }
      },
      required: ["filePath"]
    }
  },
  {
    name: "manage_dependencies",
    description: "Manage project dependencies (install, update, audit)",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["install", "update", "audit", "list", "clean"],
          description: "Action to perform on dependencies"
        },
        packageName: {
          type: "string",
          description: "Specific package name (for install/update)"
        },
        dev: {
          type: "boolean",
          description: "Whether this is a dev dependency"
        },
        packageManager: {
          type: "string",
          enum: ["npm", "yarn", "pnpm"],
          description: "Package manager to use"
        }
      },
      required: ["action"]
    }
  },
  {
    name: "build_project",
    description: "Build the project using configured build tools",
    inputSchema: {
      type: "object",
      properties: {
        environment: {
          type: "string",
          enum: ["development", "staging", "production"],
          description: "Build environment"
        },
        target: {
          type: "string",
          description: "Specific build target or script"
        },
        watch: {
          type: "boolean",
          description: "Whether to run in watch mode"
        }
      }
    }
  },
  {
    name: "deploy_project",
    description: "Deploy project to various platforms",
    inputSchema: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          enum: ["cloudflare-pages", "netlify", "vercel", "github-pages"],
          description: "Deployment platform"
        },
        environment: {
          type: "string",
          enum: ["staging", "production"],
          description: "Deployment environment"
        },
        config: {
          type: "string",
          description: "Specific deployment configuration file"
        }
      },
      required: ["platform"]
    }
  },
  {
    name: "analyze_project_structure",
    description: "Analyze and visualize project structure and dependencies",
    inputSchema: {
      type: "object",
      properties: {
        depth: {
          type: "integer",
          description: "Directory depth to analyze",
          minimum: 1,
          maximum: 5
        },
        includeHidden: {
          type: "boolean",
          description: "Whether to include hidden files and directories"
        },
        format: {
          type: "string",
          enum: ["tree", "json", "markdown"],
          description: "Output format"
        }
      }
    }
  },
  {
    name: "search_codebase",
    description: "Search for patterns, functions, or text across the codebase",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (text, regex, or code pattern)"
        },
        fileType: {
          type: "string",
          description: "Filter by file extension (e.g., 'js', 'ts', 'py')"
        },
        caseSensitive: {
          type: "boolean",
          description: "Whether search should be case sensitive"
        },
        includeTests: {
          type: "boolean",
          description: "Whether to include test files in search"
        }
      },
      required: ["query"]
    }
  }
];

// Initialize MCP server
const server = new Server(SERVER_INFO, {
  capabilities: {
    tools: {},
    resources: {},
    prompts: {}
  }
});

// Helper function to execute shell commands safely
async function executeCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: PROJECT_CONFIG.root,
      stdio: 'pipe',
      shell: true,
      ...options
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, exitCode: code });
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Helper function to read file content
async function readFileContent(filePath) {
  try {
    const fullPath = path.resolve(PROJECT_CONFIG.root, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

// Helper function to write file content
async function writeFileContent(filePath, content) {
  try {
    const fullPath = path.resolve(PROJECT_CONFIG.root, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
    return `File written successfully: ${filePath}`;
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error.message}`);
  }
}

// Tool implementations
const toolHandlers = {
  async analyze_code({ filePath, analysisType = "structure" }) {
    const content = await readFileContent(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    let analysis = {
      filePath,
      analysisType,
      fileSize: content.length,
      lineCount: content.split('\n').length,
      language: ext.substring(1),
      timestamp: new Date().toISOString()
    };

    switch (analysisType) {
      case "structure":
        // Analyze code structure
        const functions = (content.match(/function\s+\w+|const\s+\w+\s*=|class\s+\w+/g) || []).length;
        const imports = (content.match(/import.*from|require\(/g) || []).length;
        const exports = (content.match(/export\s+|module\.exports/g) || []).length;
        
        analysis.structure = {
          functions,
          imports,
          exports,
          complexity: functions > 10 ? "high" : functions > 5 ? "medium" : "low"
        };
        break;

      case "dependencies":
        // Analyze dependencies
        const dependencies = [];
        const importMatches = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
        const requireMatches = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
        
        importMatches.forEach(match => {
          const dep = match.match(/from\s+['"]([^'"]+)['"]/)?.[1];
          if (dep) dependencies.push(dep);
        });
        
        requireMatches.forEach(match => {
          const dep = match.match(/require\(['"]([^'"]+)['"]\)/)?.[1];
          if (dep) dependencies.push(dep);
        });

        analysis.dependencies = [...new Set(dependencies)];
        break;

      case "security":
        // Basic security analysis
        const securityIssues = [];
        if (content.includes('eval(')) securityIssues.push('Use of eval() detected');
        if (content.includes('innerHTML')) securityIssues.push('Use of innerHTML detected');
        if (content.includes('process.env') && !content.includes('dotenv')) {
          securityIssues.push('Environment variables used without proper loading');
        }
        
        analysis.security = {
          issues: securityIssues,
          risk: securityIssues.length > 2 ? "high" : securityIssues.length > 0 ? "medium" : "low"
        };
        break;
    }

    return analysis;
  },

  async generate_code({ specification, language, framework = "vanilla", outputPath }) {
    // This would typically integrate with AI models for code generation
    // For now, providing a template-based approach
    
    let generatedCode = "";
    const timestamp = new Date().toISOString();
    
    switch (language) {
      case "javascript":
        if (framework === "react") {
          generatedCode = `// Generated React component based on: ${specification}
// Generated at: ${timestamp}

import React, { useState, useEffect } from 'react';

const GeneratedComponent = () => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // TODO: Implement based on specification
    console.log('Component mounted');
  }, []);

  return (
    <div className="generated-component">
      {/* TODO: Implement UI based on specification */}
      <h1>Generated Component</h1>
      <p>Specification: ${specification}</p>
    </div>
  );
};

export default GeneratedComponent;`;
        } else {
          generatedCode = `// Generated JavaScript code based on: ${specification}
// Generated at: ${timestamp}

/**
 * TODO: Implement functionality based on specification
 * Specification: ${specification}
 */

function generatedFunction() {
  // TODO: Implement logic
  console.log('Generated function executed');
}

export { generatedFunction };`;
        }
        break;
        
      case "typescript":
        generatedCode = `// Generated TypeScript code based on: ${specification}
// Generated at: ${timestamp}

interface GeneratedInterface {
  // TODO: Define interface based on specification
  id: string;
  name: string;
}

class GeneratedClass implements GeneratedInterface {
  public id: string;
  public name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  // TODO: Implement methods based on specification
  public execute(): void {
    console.log(\`Executing for \${this.name}\`);
  }
}

export { GeneratedInterface, GeneratedClass };`;
        break;
        
      case "python":
        generatedCode = `# Generated Python code based on: ${specification}
# Generated at: ${timestamp}

from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class GeneratedClass:
    """
    TODO: Implement class based on specification
    Specification: ${specification}
    """
    
    def __init__(self, name: str):
        self.name = name
        logger.info(f"GeneratedClass initialized with name: {name}")
    
    def execute(self) -> Optional[Dict[str, Any]]:
        """TODO: Implement method based on specification"""
        logger.info(f"Executing for {self.name}")
        return {"status": "success", "name": self.name}

# TODO: Add more functionality based on specification
`;
        break;
    }

    if (outputPath) {
      await writeFileContent(outputPath, generatedCode);
      return {
        success: true,
        message: `Generated ${language} code saved to ${outputPath}`,
        specification,
        language,
        framework,
        filePath: outputPath,
        codeLength: generatedCode.length
      };
    }

    return {
      success: true,
      message: `Generated ${language} code based on specification`,
      specification,
      language,
      framework,
      generatedCode,
      codeLength: generatedCode.length
    };
  },

  async run_tests({ testPattern, framework = "npm", coverage = false }) {
    try {
      let command, args;
      
      switch (framework) {
        case "npm":
          command = "npm";
          args = ["test"];
          if (testPattern) args.push(`-- ${testPattern}`);
          break;
        case "jest":
          command = "npx";
          args = ["jest"];
          if (testPattern) args.push(testPattern);
          if (coverage) args.push("--coverage");
          break;
        case "pytest":
          command = "python";
          args = ["-m", "pytest"];
          if (testPattern) args.push(testPattern);
          if (coverage) args.push("--cov");
          break;
        default:
          throw new Error(`Unsupported test framework: ${framework}`);
      }

      const result = await executeCommand(command, args);
      
      return {
        success: true,
        framework,
        testPattern: testPattern || "all tests",
        coverage,
        output: result.stdout,
        errors: result.stderr,
        exitCode: result.exitCode
      };
    } catch (error) {
      return {
        success: false,
        framework,
        error: error.message,
        testPattern: testPattern || "all tests"
      };
    }
  },

  async build_project({ environment = "development", target, watch = false }) {
    try {
      let command = "npm";
      let args = ["run"];
      
      if (target) {
        args.push(target);
      } else {
        args.push("build");
      }
      
      // Set environment
      const env = { ...process.env, NODE_ENV: environment };
      
      const result = await executeCommand(command, args, { env });
      
      return {
        success: true,
        environment,
        target: target || "build",
        watch,
        output: result.stdout,
        errors: result.stderr,
        buildTime: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        environment,
        target: target || "build",
        error: error.message
      };
    }
  },

  async analyze_project_structure({ depth = 3, includeHidden = false, format = "tree" }) {
    try {
      const command = includeHidden ? "find" : "find";
      const args = [
        ".",
        "-maxdepth", depth.toString(),
        "-type", "f"
      ];
      
      if (!includeHidden) {
        args.push("!", "-path", "*/.*");
        args.push("!", "-path", "*/node_modules/*");
        args.push("!", "-path", "*/dist/*");
      }

      const result = await executeCommand(command, args);
      const files = result.stdout.trim().split('\n').filter(f => f);
      
      let structure;
      
      switch (format) {
        case "json":
          structure = {
            root: PROJECT_CONFIG.root,
            totalFiles: files.length,
            files: files.map(f => ({
              path: f,
              extension: path.extname(f),
              directory: path.dirname(f)
            }))
          };
          break;
          
        case "markdown":
          structure = `# Project Structure\n\n`;
          structure += `**Root:** ${PROJECT_CONFIG.root}\n`;
          structure += `**Total Files:** ${files.length}\n\n`;
          structure += files.map(f => `- ${f}`).join('\n');
          break;
          
        default: // tree
          structure = files.join('\n');
      }

      return {
        success: true,
        format,
        depth,
        includeHidden,
        fileCount: files.length,
        structure
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        format,
        depth
      };
    }
  },

  async search_codebase({ query, fileType, caseSensitive = false, includeTests = true }) {
    try {
      let command = "grep";
      let args = ["-r", "-n"];
      
      if (!caseSensitive) args.push("-i");
      
      args.push(query);
      args.push(".");
      
      // Exclude common directories
      args.push("--exclude-dir=node_modules");
      args.push("--exclude-dir=dist");
      args.push("--exclude-dir=.git");
      
      if (!includeTests) {
        args.push("--exclude-dir=test");
        args.push("--exclude-dir=tests");
        args.push("--exclude-dir=__tests__");
      }
      
      if (fileType) {
        args.push(`--include=*.${fileType}`);
      }

      const result = await executeCommand(command, args);
      const matches = result.stdout.trim().split('\n').filter(line => line);
      
      const parsedMatches = matches.map(match => {
        const [filePath, lineNumber, ...contentParts] = match.split(':');
        return {
          file: filePath,
          line: parseInt(lineNumber),
          content: contentParts.join(':').trim()
        };
      });

      return {
        success: true,
        query,
        fileType: fileType || "all",
        caseSensitive,
        includeTests,
        totalMatches: parsedMatches.length,
        matches: parsedMatches.slice(0, 100) // Limit to first 100 matches
      };
    } catch (error) {
      return {
        success: false,
        query,
        error: error.message
      };
    }
  }
};

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (!toolHandlers[name]) {
    throw new Error(`Unknown tool: ${name}`);
  }
  
  try {
    const result = await toolHandlers[name](args || {});
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    throw new Error(`Tool execution failed: ${error.message}`);
  }
});

// Start the server
async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🔥 Blaze Intelligence Copilot MCP Server started successfully");
  console.error(`📁 Project root: ${PROJECT_CONFIG.root}`);
  console.error(`🛠️  Available tools: ${TOOLS.length}`);
}

startServer().catch(console.error);