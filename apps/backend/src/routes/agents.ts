import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';
import { APIError } from '../middleware/errorHandler';
import { OpenAI } from '@openai/api';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

const router = Router();

interface AgentContext {
  projectId: string;
  projectType: string;
  projectLanguage: string;
  projectFramework: string;
  files: string[];
  userMessage: string;
}

const AGENT_PROMPTS: Record<string, string> = {
  'frontend-engineer': `You are an expert frontend engineer specializing in UI/UX and React development.
    You help users build beautiful, responsive user interfaces.
    Provide code examples in React/TypeScript when asked.`,

  'backend-engineer': `You are an expert backend engineer specializing in API design and Node.js/Express.
    You help users build scalable, secure backend systems.
    Provide code examples in TypeScript/Node.js when asked.`,

  'mobile-engineer': `You are an expert mobile engineer specializing in React Native and Flutter.
    You help users build cross-platform mobile applications.
    Provide code examples in React Native/TypeScript when asked.`,

  'qa-engineer': `You are an expert QA engineer specializing in testing and quality assurance.
    You help users write tests and ensure code quality.
    Provide testing strategies and code examples using Jest/Vitest.`,

  'security-engineer': `You are an expert security engineer specializing in vulnerability detection and best practices.
    You help users secure their applications and infrastructure.
    Provide security recommendations and fixes.`,

  'devops-engineer': `You are an expert DevOps engineer specializing in deployment and infrastructure.
    You help users set up CI/CD pipelines and deploy applications.
    Provide Docker and Kubernetes examples when needed.`,
};

// Get available agents
router.get('/available', authenticateToken, async (req: AuthRequest, res: Response) => {
  const agents = [
    {
      id: 'frontend-engineer',
      name: 'Frontend Engineer',
      emoji: '🎨',
      description: 'Specializes in UI/UX and frontend development',
      capabilities: ['React Components', 'Responsive Design', 'State Management'],
      model: 'gpt-4',
      status: 'available',
    },
    {
      id: 'backend-engineer',
      name: 'Backend Engineer',
      emoji: '⚙️',
      description: 'Specializes in APIs and backend infrastructure',
      capabilities: ['API Design', 'Database Schema', 'Authentication'],
      model: 'gpt-4',
      status: 'available',
    },
    {
      id: 'mobile-engineer',
      name: 'Mobile Engineer',
      emoji: '📱',
      description: 'Specializes in iOS and Android development',
      capabilities: ['React Native', 'Mobile UI', 'Performance'],
      model: 'gpt-4',
      status: 'available',
    },
    {
      id: 'qa-engineer',
      name: 'QA Engineer',
      emoji: '✅',
      description: 'Specializes in testing and quality assurance',
      capabilities: ['Unit Testing', 'Integration Testing', 'Bug Detection'],
      model: 'gpt-4',
      status: 'available',
    },
    {
      id: 'security-engineer',
      name: 'Security Engineer',
      emoji: '🔒',
      description: 'Specializes in security and vulnerability detection',
      capabilities: ['Security Audit', 'Vulnerability Scan', 'Best Practices'],
      model: 'gpt-4',
      status: 'available',
    },
    {
      id: 'devops-engineer',
      name: 'DevOps Engineer',
      emoji: '🚀',
      description: 'Specializes in deployment and infrastructure',
      capabilities: ['Docker & K8s', 'CI/CD Pipelines', 'Monitoring'],
      model: 'gpt-4',
      status: 'available',
    },
  ];

  res.json(agents);
});

// Assign task to AI agent (streaming)
router.post('/assign-task', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { agentId, projectId, task, context } = req.body;

  try {
    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== req.userId) {
      throw new APIError(403, 'Unauthorized');
    }

    // Get agent system prompt
    const systemPrompt = AGENT_PROMPTS[agentId] || AGENT_PROMPTS['backend-engineer'];

    // Build context
    const agentContext = `
Project Information:
- Type: ${project.type}
- Language: ${project.language}
- Framework: ${project.framework}
- Database: ${project.database}

User Task: ${task}

Context: ${context || 'N/A'}

Provide a detailed response with code examples where applicable.`;

    // Create AI task record
    const aiTask = await prisma.aITask.create({
      data: {
        projectId,
        agent: agentId,
        task,
        status: 'processing',
      },
    });

    // Set response headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream response from OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: agentContext,
        },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    });

    let fullResponse = '';

    for await (const event of stream) {
      if (event.choices[0]?.delta?.content) {
        const content = event.choices[0].delta.content;
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}

`);
      }
    }

    // Update task status
    await prisma.aITask.update({
      where: { id: aiTask.id },
      data: {
        status: 'completed',
        result: fullResponse,
      },
    });

    res.write('data: {"status": "completed"}\n\n');
    res.end();
  } catch (error) {
    console.error('Agent task error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Task processing failed' })}

`);
    res.end();
  }
});

// Get task history
router.get('/:projectId/tasks', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
    });

    if (!project || project.userId !== req.userId) {
      throw new APIError(403, 'Unauthorized');
    }

    const tasks = await prisma.aITask.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(tasks);
  } catch (error) {
    throw new APIError(400, 'Failed to fetch tasks');
  }
});

// Get task details
router.get('/:projectId/tasks/:taskId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.aITask.findUnique({
      where: { id: req.params.taskId },
    });

    if (!task) {
      throw new APIError(404, 'Task not found');
    }

    res.json(task);
  } catch (error) {
    throw new APIError(400, 'Failed to fetch task');
  }
});

// Multi-agent orchestration
router.post('/orchestrate', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { projectId, workflow } = req.body;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== req.userId) {
      throw new APIError(403, 'Unauthorized');
    }

    // workflow: array of { agent, task } objects
    // Execute agents in sequence
    const results = [];

    for (const step of workflow) {
      // TODO: Execute each agent task
      results.push({
        agent: step.agent,
        status: 'pending',
      });
    }

    res.json({
      message: 'Workflow orchestration started',
      workflowId: 'workflow-123',
      results,
    });
  } catch (error) {
    throw new APIError(400, 'Orchestration failed');
  }
});

export default router;
