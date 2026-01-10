/**
 * Advanced AI CV Auditor System
 * Evaluates CVs against 50+ professional criteria for IT roles
 */

export interface CVAuditCriteria {
  category: string
  criteria: string[]
}

export const CV_AUDIT_CRITERIA: CVAuditCriteria[] = [
  {
    category: "ATS Optimization",
    criteria: [
      "Uso de keywords específicas del rol IT solicitado",
      "Formato compatible con sistemas ATS (sin tablas complejas, gráficos embedded)",
      "Presencia de tecnologías y herramientas relevantes",
      "Match con job description típica del rol",
      "Uso de verbos de acción cuantificables"
    ]
  },
  {
    category: "Technical Skills",
    criteria: [
      "Listado claro de lenguajes de programación con nivel de expertise",
      "Frameworks y librerías relevantes para el rol",
      "Herramientas de desarrollo (Git, Docker, CI/CD, etc.)",
      "Cloud platforms (AWS, Azure, GCP) si aplica",
      "Databases y tecnologías de datos",
      "Metodologías ágiles y DevOps practices",
      "Testing frameworks y QA tools",
      "Certificaciones técnicas reconocidas en la industria"
    ]
  },
  {
    category: "Professional Experience",
    criteria: [
      "Descripción de logros con impacto medible (%, $, tiempo)",
      "Uso de métrica STAR (Situation, Task, Action, Result)",
      "Proyectos específicos con tecnologías mencionadas",
      "Escalabilidad y mejoras de performance documentadas",
      "Colaboración en equipos (tamaño, metodología)",
      "Liderazgo técnico o mentoría si aplica",
      "Contribuciones open source o proyectos personales",
      "Experiencia relevante para el nivel (junior, mid, senior)"
    ]
  },
  {
    category: "Impact & Results",
    criteria: [
      "Reducción de costos cuantificada",
      "Mejoras en tiempo de desarrollo o deployment",
      "Incremento en usuarios, tráfico o revenue",
      "Reducción de bugs o mejora en code quality",
      "Optimización de infraestructura o recursos",
      "Innovaciones implementadas con resultados",
      "ROI de proyectos liderados",
      "Premios, reconocimientos o promociones"
    ]
  },
  {
    category: "Structure & Format",
    criteria: [
      "Longitud apropiada (1 página para <5 años, 2 para >5 años)",
      "Orden cronológico inverso (más reciente primero)",
      "Secciones claras y bien definidas",
      "Bullet points vs párrafos (preferir bullets)",
      "Espaciado y legibilidad óptimos",
      "Tipografía profesional y consistente",
      "Márgenes y alignment correctos",
      "Sin errores de ortografía o gramática"
    ]
  },
  {
    category: "Contact & Profile",
    criteria: [
      "Email profesional (evitar @hotmail, @yahoo)",
      "LinkedIn URL optimizada",
      "GitHub/Portfolio/Website si es developer",
      "Ubicación y disponibilidad para trabajo remoto",
      "Professional summary conciso y orientado a resultados"
    ]
  },
  {
    category: "Education & Growth",
    criteria: [
      "Educación relevante para IT (CS, Engineering, Bootcamp)",
      "Cursos online recientes (Coursera, Udemy, Pluralsight)",
      "Hackathons, competencias o eventos tech",
      "Continuous learning demostrado"
    ]
  },
  {
    category: "Red Flags to Avoid",
    criteria: [
      "Foto personal (innecesaria en países como USA)",
      "Información personal irrelevante (edad, estado civil)",
      "Objetivos genéricos sin valor",
      "Responsabilidades en vez de logros",
      "Buzzwords sin contexto técnico",
      "Gaps temporales sin explicación",
      "Demasiadas posiciones cortas (<1 año)",
      "Lenguaje informal o emojis"
    ]
  }
]

export function buildAdvancedCVPrompt(
  cvText: string, 
  profession: string, 
  country: string,
  purpose?: string
): string {
  return `You are an expert IT recruiter and CV auditor with 15+ years of experience in ${profession} hiring for ${country} market.

TASK: Perform a comprehensive audit of this CV against 50+ professional criteria and provide actionable feedback.

TARGET ROLE: ${profession}
TARGET MARKET: ${country}
${purpose ? `USER GOAL: ${purpose}` : ''}

CV CONTENT:
${cvText}

EVALUATION CRITERIA (50+ points):

1. ATS OPTIMIZATION (Weight: 25%)
   - Keyword optimization for ${profession} roles
   - ATS-friendly format (no tables, embedded graphics, or complex layouts)
   - Technology stack alignment with job descriptions
   - Quantifiable action verbs

2. TECHNICAL SKILLS (Weight: 20%)
   - Programming languages with proficiency levels
   - Frameworks, libraries, and tools
   - Cloud platforms (AWS, Azure, GCP)
   - DevOps and CI/CD experience
   - Database and data technologies
   - Testing and QA practices
   - Relevant certifications

3. PROFESSIONAL EXPERIENCE (Weight: 25%)
   - Impact-driven achievements (use %, $, time savings)
   - STAR method (Situation, Task, Action, Result)
   - Specific projects with technologies used
   - Performance improvements and scalability
   - Team collaboration and leadership
   - Open source contributions
   - Appropriate experience level (junior/mid/senior)

4. MEASURABLE IMPACT (Weight: 15%)
   - Cost reduction quantified
   - Development/deployment time improvements
   - User growth, traffic, or revenue increases
   - Code quality improvements
   - Infrastructure optimization
   - ROI of led projects
   - Awards and recognitions

5. STRUCTURE & FORMAT (Weight: 10%)
   - Appropriate length (1 page <5yrs, 2 pages >5yrs)
   - Reverse chronological order
   - Clear sections with bullet points
   - Professional typography and spacing
   - No spelling or grammar errors
   - Clean, readable layout

6. PROFESSIONAL PROFILE (Weight: 3%)
   - Professional email address
   - LinkedIn URL optimized
   - GitHub/Portfolio for developers
   - Clear location and remote work availability

7. EDUCATION & CONTINUOUS LEARNING (Weight: 2%)
   - Relevant IT education
   - Recent online courses and certifications
   - Hackathons and tech events
   - Demonstrated continuous learning

8. RED FLAGS CHECK (Critical)
   - Avoid: personal photo (especially for US market)
   - Avoid: irrelevant personal info (age, marital status)
   - Avoid: generic objectives without value
   - Avoid: responsibilities instead of achievements
   - Avoid: buzzwords without technical context
   - Avoid: unexplained employment gaps
   - Avoid: too many short positions (<1 year)
   - Avoid: informal language or emojis

REQUIRED OUTPUT FORMAT (JSON):
{
  "overallScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "categoryScores": {
    "atsOptimization": <0-100>,
    "technicalSkills": <0-100>,
    "experience": <0-100>,
    "impact": <0-100>,
    "structure": <0-100>,
    "profile": <0-100>,
    "education": <0-100>
  },
  "strengths": [
    "Specific strength with example from CV",
    "Another strength...",
    <at least 5 strengths>
  ],
  "problems": [
    {
      "issue": "Specific problem identified",
      "severity": "high|medium|low",
      "location": "Where in CV this appears",
      "impact": "How this hurts the application"
    },
    <at least 10 problems>
  ],
  "improvements": [
    {
      "title": "Improvement title",
      "current": "What the CV currently says",
      "improved": "Specific rewrite suggestion",
      "reasoning": "Why this is better",
      "impact": "Expected improvement",
      "priority": "high|medium|low"
    },
    <at least 15 improvements>
  ],
  "recommendations": [
    {
      "category": "Category name",
      "action": "Specific actionable recommendation",
      "example": "Concrete example of implementation"
    },
    <at least 8 recommendations>
  ],
  "missingKeywords": [
    "Important ${profession} keyword not present",
    <list of 10-15 missing keywords>
  ],
  "competitiveAdvantage": [
    "What makes this candidate stand out or what should",
    <at least 3 points>
  ],
  "marketFit": {
    "score": <0-100>,
    "analysis": "How well this CV fits ${country} ${profession} market",
    "localizations": ["Specific adaptations needed for ${country}"]
  }
}

CRITICAL INSTRUCTIONS:
1. Be SPECIFIC - reference actual content from the CV, not generic advice
2. QUANTIFY everything - use numbers, percentages, metrics
3. Provide ACTIONABLE improvements - show exact before/after examples
4. Focus on ${profession} role requirements and ${country} market expectations
5. Evaluate ALL 50+ criteria systematically
6. Ensure at least 5 strengths, 10 problems, 15 improvements, 8 recommendations
7. Consider seniority level and adjust expectations accordingly
8. Return ONLY valid JSON, no markdown formatting or additional text

Begin your comprehensive 50-criteria audit now:`
}

export function buildEbookContent(): string {
  return `# CV Perfecto para IT - E-book Completo

## 📚 50+ Plantillas Profesionales

### Frontend Developer Templates
1. React/Next.js Specialist (Senior)
2. Vue.js Developer (Mid-level)
3. Angular Expert (Senior)
4. Frontend Architect (Lead)
5. UI/UX Developer (Junior-Mid)

### Backend Developer Templates
1. Node.js/Express Developer
2. Python/Django Specialist
3. Java/Spring Boot Engineer
4. Go Developer
5. PHP/Laravel Developer

### Full Stack Templates
1. MERN Stack Developer
2. MEAN Stack Developer
3. Python Full Stack
4. Ruby on Rails Developer
5. .NET Full Stack

### DevOps & Cloud Templates
1. AWS Solutions Architect
2. Azure DevOps Engineer
3. GCP Cloud Engineer
4. Kubernetes Specialist
5. CI/CD Pipeline Expert

### Data & AI Templates
1. Data Scientist
2. Machine Learning Engineer
3. Data Engineer
4. AI/ML Researcher
5. Data Analyst

## 🎯 Keywords ATS por Especialización

### Frontend Keywords
React, Vue, Angular, JavaScript, TypeScript, HTML5, CSS3, SASS, Tailwind, Redux, Next.js, Webpack, Babel, Jest, Responsive Design, Cross-browser Compatibility, Performance Optimization, Accessibility (WCAG), SEO

### Backend Keywords
Node.js, Python, Java, C#, Go, REST API, GraphQL, Microservices, Docker, Kubernetes, PostgreSQL, MongoDB, Redis, AWS Lambda, Azure Functions, Authentication, JWT, OAuth, API Gateway, Message Queues

### DevOps Keywords
CI/CD, Jenkins, GitLab CI, GitHub Actions, Docker, Kubernetes, Terraform, Ansible, AWS, Azure, GCP, Linux, Bash, Python, Monitoring, Logging, ELK Stack, Prometheus, Grafana, Infrastructure as Code

### Data Science Keywords
Python, R, Pandas, NumPy, Scikit-learn, TensorFlow, PyTorch, SQL, NoSQL, Data Visualization, Tableau, Power BI, Machine Learning, Deep Learning, NLP, Computer Vision, Statistical Analysis, A/B Testing

## 💼 Estrategias de Networking

### LinkedIn Optimization
- Profile headline formula: [Role] | [Specialty] | [Value Proposition]
- About section structure (3 paragraphs)
- Featured section best practices
- Endorsements and recommendations strategy
- Content posting schedule

### GitHub Presence
- Profile README optimization
- Pinned repositories selection
- Contribution graph strategy
- Open source contribution guide
- Portfolio projects showcase

### Professional Networking
- Industry events and conferences
- Online communities (Dev.to, Hashnode, Medium)
- Twitter/X for tech networking
- Slack communities and Discord servers
- Meetup.com local tech events

## 💰 Ejemplos Reales de CVs $100K+

### Case Study 1: Senior React Developer
- Before: Generic responsibilities, no metrics
- After: "Increased app performance by 40%, reducing load time from 3.2s to 1.9s"
- Result: Offer from FAANG company, $165K base salary

### Case Study 2: DevOps Engineer
- Before: Listed tools without context
- After: "Reduced deployment time by 75% (2 hours to 30 minutes) implementing CI/CD pipeline"
- Result: Multiple offers $140K-$180K range

### Case Study 3: Full Stack Developer
- Before: Job duties listed
- After: "Built feature reducing customer churn by 23%, saving $2.1M annually"
- Result: Promoted to Senior, $120K to $155K

### Case Study 4: Data Scientist
- Before: Academic-focused CV
- After: "Developed ML model improving prediction accuracy by 31%, impacting $5M revenue"
- Result: Offer from startup, $145K + equity

### Case Study 5: Frontend Architect
- Before: Technical buzzwords
- After: "Led team of 8 delivering design system adopted by 50+ projects, reducing dev time 40%"
- Result: Lead position, $180K package

## 📊 Action Plan Template

### Week 1: Audit & Analysis
- [ ] Run CV through ATS scanner
- [ ] Identify missing keywords for target role
- [ ] List 10 quantifiable achievements
- [ ] Check format for ATS compatibility

### Week 2: Content Optimization
- [ ] Rewrite experience using STAR method
- [ ] Add metrics to every bullet point
- [ ] Update skills section with proficiency levels
- [ ] Remove red flags and irrelevant info

### Week 3: Technical Showcase
- [ ] Update GitHub with 3 showcase projects
- [ ] Write detailed README files
- [ ] Create portfolio website if developer
- [ ] Add links to live demos

### Week 4: Application & Follow-up
- [ ] Apply to 20 targeted positions
- [ ] Customize CV for each role
- [ ] Send follow-up after 48 hours
- [ ] Track application status

## 🎓 Bonus Resources

- List of 100+ tech recruiters on LinkedIn
- Templates for cover letters
- Salary negotiation scripts
- Interview preparation guides
- Technical assessment practice problems
- Remote work job boards
- Freelance platforms comparison

---

**Access this E-book anytime**: Sent to your email immediately after purchase.
`
}
