/**
 * Mentor Action Items - Predefined Templates
 * 
 * Templates categorizados de action items para feedback rápido.
 * Permite a mentores completar sesiones en <60 segundos con drag-and-drop.
 * 
 * Categorías:
 * - Technical Skills (Hard Skills)
 * - Soft Skills (Comunicación, Liderazgo, etc.)
 * - Career Development (Networking, Estrategia)
 * - Interview Preparation (Coding, Behavioral)
 * - Tools & Setup (Environment, Productivity)
 */

export interface ActionItemTemplate {
  id: string
  category: 'technical' | 'soft-skills' | 'career' | 'interview' | 'tools'
  title: string
  description: string
  estimatedTime: string // "1 week", "2 days", etc.
  priority: 'high' | 'medium' | 'low'
  resources?: string[] // Links opcionales
}

export const ACTION_ITEM_TEMPLATES: ActionItemTemplate[] = [
  // ===========================
  // TECHNICAL SKILLS (10 items)
  // ===========================
  {
    id: 'tech-01',
    category: 'technical',
    title: 'Review JavaScript fundamentals',
    description: 'Study closures, promises, async/await, and event loop. Complete FreeCodeCamp JavaScript course.',
    estimatedTime: '1 week',
    priority: 'high',
    resources: ['https://javascript.info', 'https://freecodecamp.org'],
  },
  {
    id: 'tech-02',
    category: 'technical',
    title: 'Build a full-stack project',
    description: 'Create a CRUD app with authentication using React + Node.js. Deploy to Vercel/Heroku.',
    estimatedTime: '2 weeks',
    priority: 'high',
    resources: ['https://fullstackopen.com'],
  },
  {
    id: 'tech-03',
    category: 'technical',
    title: 'Master Git and version control',
    description: 'Learn branching, merging, rebasing, and PR workflows. Practice with open source contributions.',
    estimatedTime: '3 days',
    priority: 'medium',
    resources: ['https://learngitbranching.js.org'],
  },
  {
    id: 'tech-04',
    category: 'technical',
    title: 'Learn TypeScript basics',
    description: 'Study types, interfaces, generics. Convert one JavaScript project to TypeScript.',
    estimatedTime: '1 week',
    priority: 'medium',
    resources: ['https://typescriptlang.org/docs'],
  },
  {
    id: 'tech-05',
    category: 'technical',
    title: 'Practice data structures & algorithms',
    description: 'Complete 20 LeetCode Easy problems. Focus on arrays, strings, and hash maps.',
    estimatedTime: '2 weeks',
    priority: 'high',
    resources: ['https://leetcode.com', 'https://neetcode.io'],
  },
  {
    id: 'tech-06',
    category: 'technical',
    title: 'Understand REST API design',
    description: 'Study HTTP methods, status codes, authentication. Build a RESTful API with Express.',
    estimatedTime: '1 week',
    priority: 'medium',
    resources: ['https://restfulapi.net'],
  },
  {
    id: 'tech-07',
    category: 'technical',
    title: 'Learn database fundamentals',
    description: 'Study SQL basics, normalization, indexes. Practice with PostgreSQL and ORMs (Prisma/TypeORM).',
    estimatedTime: '2 weeks',
    priority: 'medium',
    resources: ['https://sqlbolt.com'],
  },
  {
    id: 'tech-08',
    category: 'technical',
    title: 'Explore cloud platforms (AWS/Azure)',
    description: 'Complete AWS/Azure free tier tutorial. Deploy a simple app with serverless functions.',
    estimatedTime: '1 week',
    priority: 'low',
    resources: ['https://aws.amazon.com/free'],
  },
  {
    id: 'tech-09',
    category: 'technical',
    title: 'Master CSS and responsive design',
    description: 'Study Flexbox, Grid, mobile-first design. Build a responsive portfolio with Tailwind CSS.',
    estimatedTime: '1 week',
    priority: 'medium',
    resources: ['https://flexboxfroggy.com', 'https://cssgridgarden.com'],
  },
  {
    id: 'tech-10',
    category: 'technical',
    title: 'Learn testing fundamentals',
    description: 'Study unit testing, integration testing, TDD. Write tests with Jest and React Testing Library.',
    estimatedTime: '1 week',
    priority: 'medium',
    resources: ['https://jestjs.io', 'https://testing-library.com'],
  },

  // ===========================
  // SOFT SKILLS (8 items)
  // ===========================
  {
    id: 'soft-01',
    category: 'soft-skills',
    title: 'Improve communication skills',
    description: 'Practice explaining technical concepts to non-technical people. Record yourself and review.',
    estimatedTime: '2 weeks',
    priority: 'high',
    resources: [],
  },
  {
    id: 'soft-02',
    category: 'soft-skills',
    title: 'Develop time management habits',
    description: 'Use Pomodoro technique. Track daily tasks with Notion/Trello. Prioritize with Eisenhower Matrix.',
    estimatedTime: '1 week',
    priority: 'medium',
    resources: ['https://todoist.com'],
  },
  {
    id: 'soft-03',
    category: 'soft-skills',
    title: 'Build confidence in meetings',
    description: 'Speak up at least once per meeting. Prepare 2-3 questions beforehand. Practice active listening.',
    estimatedTime: '1 month',
    priority: 'high',
    resources: [],
  },
  {
    id: 'soft-04',
    category: 'soft-skills',
    title: 'Learn to handle feedback',
    description: 'Ask for specific feedback weekly. Reflect on criticism objectively. Implement one suggestion per week.',
    estimatedTime: '1 month',
    priority: 'medium',
    resources: [],
  },
  {
    id: 'soft-05',
    category: 'soft-skills',
    title: 'Improve problem-solving approach',
    description: 'Break problems into smaller parts. Document your thought process. Review solutions with peers.',
    estimatedTime: '2 weeks',
    priority: 'high',
    resources: [],
  },
  {
    id: 'soft-06',
    category: 'soft-skills',
    title: 'Develop leadership mindset',
    description: 'Volunteer to lead a small project. Mentor a junior developer. Practice delegation.',
    estimatedTime: '1 month',
    priority: 'low',
    resources: [],
  },
  {
    id: 'soft-07',
    category: 'soft-skills',
    title: 'Enhance collaboration skills',
    description: 'Participate in code reviews. Pair program weekly. Contribute to team retrospectives.',
    estimatedTime: '2 weeks',
    priority: 'medium',
    resources: [],
  },
  {
    id: 'soft-08',
    category: 'soft-skills',
    title: 'Build resilience and adaptability',
    description: 'Try a new technology outside comfort zone. Learn from failures without self-blame.',
    estimatedTime: '1 month',
    priority: 'medium',
    resources: [],
  },

  // ===========================
  // CAREER DEVELOPMENT (7 items)
  // ===========================
  {
    id: 'career-01',
    category: 'career',
    title: 'Update LinkedIn profile',
    description: 'Add recent projects, skills, and accomplishments. Write a compelling headline and summary.',
    estimatedTime: '2 hours',
    priority: 'high',
    resources: ['https://linkedin.com'],
  },
  {
    id: 'career-02',
    category: 'career',
    title: 'Build a portfolio website',
    description: 'Showcase 3-5 best projects with descriptions, tech stack, and live demos. Add contact form.',
    estimatedTime: '1 week',
    priority: 'high',
    resources: ['https://vercel.com', 'https://netlify.com'],
  },
  {
    id: 'career-03',
    category: 'career',
    title: 'Network with 5 professionals',
    description: 'Reach out to developers on LinkedIn. Attend 2 meetups/webinars. Join tech communities (Discord/Slack).',
    estimatedTime: '2 weeks',
    priority: 'medium',
    resources: ['https://meetup.com'],
  },
  {
    id: 'career-04',
    category: 'career',
    title: 'Research target companies',
    description: 'Identify 10 companies you want to work for. Study their tech stack, culture, and open positions.',
    estimatedTime: '3 days',
    priority: 'medium',
    resources: ['https://levels.fyi', 'https://glassdoor.com'],
  },
  {
    id: 'career-05',
    category: 'career',
    title: 'Prepare elevator pitch',
    description: 'Write 30-second intro covering: background, skills, what you\'re looking for. Practice 10 times.',
    estimatedTime: '2 days',
    priority: 'high',
    resources: [],
  },
  {
    id: 'career-06',
    category: 'career',
    title: 'Contribute to open source',
    description: 'Find 3 beginner-friendly projects. Fix a bug or improve documentation. Get your first PR merged.',
    estimatedTime: '2 weeks',
    priority: 'medium',
    resources: ['https://firstcontributions.github.io'],
  },
  {
    id: 'career-07',
    category: 'career',
    title: 'Define 6-month career goals',
    description: 'Write SMART goals: specific position, salary range, skills to acquire. Create action plan with milestones.',
    estimatedTime: '1 day',
    priority: 'high',
    resources: [],
  },

  // ===========================
  // INTERVIEW PREPARATION (8 items)
  // ===========================
  {
    id: 'interview-01',
    category: 'interview',
    title: 'Practice coding interview problems',
    description: 'Solve 3 LeetCode problems daily (1 Easy, 1 Medium, 1 Hard). Focus on patterns, not memorization.',
    estimatedTime: '1 month',
    priority: 'high',
    resources: ['https://neetcode.io/roadmap'],
  },
  {
    id: 'interview-02',
    category: 'interview',
    title: 'Prepare behavioral interview answers',
    description: 'Write STAR stories for: conflict, failure, leadership, teamwork. Practice with mock interviews.',
    estimatedTime: '1 week',
    priority: 'high',
    resources: ['https://biginterviewcom'],
  },
  {
    id: 'interview-03',
    category: 'interview',
    title: 'Master system design basics',
    description: 'Study scalability, load balancing, caching, databases. Design a simple system (e.g., URL shortener).',
    estimatedTime: '2 weeks',
    priority: 'medium',
    resources: ['https://github.com/donnemartin/system-design-primer'],
  },
  {
    id: 'interview-04',
    category: 'interview',
    title: 'Prepare questions for interviewers',
    description: 'Write 10 thoughtful questions about: team culture, tech stack, growth opportunities, challenges.',
    estimatedTime: '1 hour',
    priority: 'medium',
    resources: [],
  },
  {
    id: 'interview-05',
    category: 'interview',
    title: 'Do mock interviews',
    description: 'Schedule 3 mock technical interviews on Pramp or with peers. Get feedback and iterate.',
    estimatedTime: '2 weeks',
    priority: 'high',
    resources: ['https://pramp.com'],
  },
  {
    id: 'interview-06',
    category: 'interview',
    title: 'Study company-specific questions',
    description: 'Research interview patterns at target companies on Glassdoor and LeetCode Discuss.',
    estimatedTime: '3 days',
    priority: 'medium',
    resources: ['https://glassdoor.com/Interview'],
  },
  {
    id: 'interview-07',
    category: 'interview',
    title: 'Practice whiteboard coding',
    description: 'Solve problems on whiteboard/paper without autocomplete. Explain your thought process aloud.',
    estimatedTime: '1 week',
    priority: 'high',
    resources: [],
  },
  {
    id: 'interview-08',
    category: 'interview',
    title: 'Review past projects in depth',
    description: 'Prepare to discuss architecture, trade-offs, challenges, and learnings for each portfolio project.',
    estimatedTime: '2 days',
    priority: 'high',
    resources: [],
  },

  // ===========================
  // TOOLS & SETUP (7 items)
  // ===========================
  {
    id: 'tools-01',
    category: 'tools',
    title: 'Set up development environment',
    description: 'Install VS Code, Node.js, Git. Configure linting (ESLint), formatting (Prettier), and snippets.',
    estimatedTime: '1 day',
    priority: 'high',
    resources: ['https://code.visualstudio.com'],
  },
  {
    id: 'tools-02',
    category: 'tools',
    title: 'Learn keyboard shortcuts',
    description: 'Master 20 most-used shortcuts in VS Code/IDE. Use Vim motions for navigation (optional).',
    estimatedTime: '1 week',
    priority: 'low',
    resources: ['https://code.visualstudio.com/shortcuts'],
  },
  {
    id: 'tools-03',
    category: 'tools',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment. Learn basics of DevOps.',
    estimatedTime: '3 days',
    priority: 'medium',
    resources: ['https://github.com/features/actions'],
  },
  {
    id: 'tools-04',
    category: 'tools',
    title: 'Use productivity tools',
    description: 'Adopt Notion for notes, Todoist for tasks, Toggl for time tracking. Build a personal system.',
    estimatedTime: '1 week',
    priority: 'low',
    resources: ['https://notion.so', 'https://todoist.com'],
  },
  {
    id: 'tools-05',
    category: 'tools',
    title: 'Learn Docker basics',
    description: 'Understand containers, images, volumes. Dockerize a simple app and run it locally.',
    estimatedTime: '1 week',
    priority: 'medium',
    resources: ['https://docker.com/get-started'],
  },
  {
    id: 'tools-06',
    category: 'tools',
    title: 'Master browser DevTools',
    description: 'Learn debugging, network analysis, performance profiling. Use breakpoints and console effectively.',
    estimatedTime: '3 days',
    priority: 'medium',
    resources: ['https://developer.chrome.com/docs/devtools'],
  },
  {
    id: 'tools-07',
    category: 'tools',
    title: 'Optimize workspace ergonomics',
    description: 'Set up dual monitors, ergonomic chair, proper lighting. Use Pomodoro timer for breaks.',
    estimatedTime: '1 day',
    priority: 'low',
    resources: [],
  },
]

/**
 * Get action items by category
 */
export function getActionItemsByCategory(category: ActionItemTemplate['category']): ActionItemTemplate[] {
  return ACTION_ITEM_TEMPLATES.filter(item => item.category === category)
}

/**
 * Get high priority action items
 */
export function getHighPriorityItems(): ActionItemTemplate[] {
  return ACTION_ITEM_TEMPLATES.filter(item => item.priority === 'high')
}

/**
 * Search action items by keyword
 */
export function searchActionItems(keyword: string): ActionItemTemplate[] {
  const lowerKeyword = keyword.toLowerCase()
  return ACTION_ITEM_TEMPLATES.filter(
    item =>
      item.title.toLowerCase().includes(lowerKeyword) ||
      item.description.toLowerCase().includes(lowerKeyword)
  )
}

/**
 * Get action item by ID
 */
export function getActionItemById(id: string): ActionItemTemplate | undefined {
  return ACTION_ITEM_TEMPLATES.find(item => item.id === id)
}

/**
 * Get category statistics
 */
export function getCategoryStats() {
  const stats: Record<ActionItemTemplate['category'], number> = {
    technical: 0,
    'soft-skills': 0,
    career: 0,
    interview: 0,
    tools: 0,
  }

  ACTION_ITEM_TEMPLATES.forEach(item => {
    stats[item.category]++
  })

  return stats
}
