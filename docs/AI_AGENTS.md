# AI Agents Integration Guide

## Overview

OpenDev's AI Agents system allows you to assign specialized development tasks to AI agents powered by GPT-4.

## Available Agents

### 1. Frontend Engineer 🎨
- Builds React components
- Optimizes UI/UX
- Manages state with Redux/Zustand
- Handles responsive design

### 2. Backend Engineer ⚙️
- Creates REST APIs
- Designs database schemas
- Implements authentication
- Optimizes database queries

### 3. Mobile Engineer 📱
- Develops React Native apps
- Builds iOS/Android features
- Optimizes mobile performance
- Handles device-specific issues

### 4. QA Engineer ✅
- Writes unit tests
- Creates integration tests
- Identifies edge cases
- Ensures code quality

### 5. Security Engineer 🔒
- Audits code for vulnerabilities
- Recommends security best practices
- Implements authentication
- Fixes security issues

### 6. DevOps Engineer 🚀
- Sets up CI/CD pipelines
- Configures Docker containers
- Deploys to production
- Monitors applications

## How to Use

### 1. Open Agent Chat

Navigate to `/agents/chat` and select an agent.

### 2. Describe Your Task

Provide a clear description of what you need:

```
"Create a React component for a user profile form with name, email, and avatar fields. Include validation and submit handling."
```

### 3. Get AI Response

The agent will stream back code and recommendations in real-time.

### 4. Review and Integrate

Copy the code or use the integrated version control to save it.

## API Endpoints

### Get Available Agents
```bash
GET /api/ai-agents/available
```

### Assign Task to Agent
```bash
POST /api/ai-agents/assign-task

{
  "agentId": "frontend-engineer",
  "projectId": "project-123",
  "task": "Create a login form",
  "context": "Optional context about the project"
}
```

### Get Task History
```bash
GET /api/ai-agents/:projectId/tasks
```

### Get Task Details
```bash
GET /api/ai-agents/:projectId/tasks/:taskId
```

### Orchestrate Multi-Agent Workflow
```bash
POST /api/ai-agents/orchestrate

{
  "projectId": "project-123",
  "workflow": [
    { "agent": "backend-engineer", "task": "Create API endpoints" },
    { "agent": "qa-engineer", "task": "Write tests for API" },
    { "agent": "devops-engineer", "task": "Setup CI/CD" }
  ]
}
```

## Code Generation Features

### Generate Code
```bash
POST /api/code-gen/generate

{
  "description": "Create a login form",
  "language": "typescript",
  "framework": "react"
}
```

### Analyze Code
```bash
POST /api/code-gen/analyze

{
  "code": "function hello() { ... }",
  "language": "typescript"
}
```

### Refactor Code
```bash
POST /api/code-gen/refactor

{
  "code": "function hello() { ... }",
  "language": "typescript",
  "objective": "improve readability"
}
```

### Fix Bugs
```bash
POST /api/code-gen/fix-bugs

{
  "code": "function hello() { ... }",
  "error": "Cannot read property 'name' of undefined",
  "language": "typescript"
}
```

### Generate Documentation
```bash
POST /api/code-gen/generate-docs

{
  "code": "function hello() { ... }",
  "language": "typescript"
}
```

## Best Practices

1. **Be Specific**: Provide detailed task descriptions
2. **Include Context**: Share relevant project information
3. **Use Workflows**: Chain agents for complex projects
4. **Review Code**: Always review AI-generated code
5. **Iterate**: Refine tasks based on initial responses

## Limitations

- Token limits: ~2000 tokens per response
- Model: GPT-4 (requires OpenAI API key)
- Streaming: Real-time responses for better UX
- Context: Limited project context in single requests

## Environment Setup

```bash
# .env
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
```

## Troubleshooting

**Q: Agent is not responding**
A: Check your OpenAI API key and usage limits

**Q: Code quality is poor**
A: Provide more context and be more specific in task description

**Q: Rate limits exceeded**
A: Implement request queuing or upgrade your OpenAI plan
