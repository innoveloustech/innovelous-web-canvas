export interface SolutionData {
  slug: string;
  label: string;
  category: string;
  title: string;
  description: string;
  stats: { value: string; label: string }[];
  features: string[];
  ctaText: string;
  threeDConfig: {
    geometry: 'torus' | 'icosahedron' | 'grid' | 'particles' | 'ring' | 'cube';
    color: string;
    wireframe: boolean;
  };
}

export const solutionsData: SolutionData[] = [
  {
    slug: 'social-media',
    label: '01 // GROWTH',
    category: 'Social Media Expert',
    title: 'Algorithmic\nDominance.',
    description: 'We engineer high-retention content ecosystems and data-driven growth loops. Our AI-augmented strategies ensure your brand commands attention across every digital touchpoint.',
    stats: [
      { value: '3.2x', label: 'Avg. Engagement' },
      { value: '45%', label: 'Viral Coefficient' },
      { value: '1.2M', label: 'Impressions/Mo' },
    ],
    features: [
      'Predictive Trend Analysis',
      'Automated Content Pipelines',
      'Cross-Platform Sync',
      'Real-time Sentiment Tracking',
    ],
    ctaText: 'Start Campaign',
    threeDConfig: { geometry: 'ring', color: '#a855f7', wireframe: false },
  },
  {
    slug: 'iot',
    label: '02 // CONNECT',
    category: 'IoT Solutions',
    title: 'Hardware\nNeural Networks.',
    description: 'Seamless integration between physical devices and cloud infrastructure. We build secure, low-latency telemetry pipelines for industrial and consumer IoT ecosystems.',
    stats: [
      { value: '<5ms', label: 'Latency' },
      { value: '99.9%', label: 'Uptime' },
      { value: '10k+', label: 'Concurrent Devices' },
    ],
    features: [
      'Edge Computing Architecture',
      'Real-time Telemetry Dashboards',
      'Secure Firmware Over-the-Air (FOTA)',
      'Predictive Maintenance Models',
    ],
    ctaText: 'Deploy Sensors',
    threeDConfig: { geometry: 'grid', color: '#06b6d4', wireframe: true },
  },
  {
    slug: 'machine-learning',
    label: '03 // INTELLIGENCE',
    category: 'Machine Learning',
    title: 'Data-Driven\nEvolution.',
    description: 'Transform raw data into predictive power. We design custom ML models that optimize decision-making, automate complex workflows, and unlock hidden business value.',
    stats: [
      { value: '98.7%', label: 'Model Accuracy' },
      { value: '10x', label: 'Efficiency Gain' },
      { value: '24/7', label: 'Continuous Learning' },
    ],
    features: [
      'Custom Neural Network Training',
      'Automated Feature Engineering',
      'Model Deployment & Monitoring',
      'Explainable AI Frameworks',
    ],
    ctaText: 'Train Models',
    threeDConfig: { geometry: 'icosahedron', color: '#10b981', wireframe: true },
  },
  {
    slug: 'ai-integration',
    label: '04 // AUTOMATION',
    category: 'AI Integration',
    title: 'Enterprise\nCognitive Cores.',
    description: 'Embed LLMs and autonomous agents directly into your business logic. We build secure, scalable AI pipelines that enhance productivity and customer experience.',
    stats: [
      { value: '70%', label: 'Task Automation' },
      { value: '3.5x', label: 'Productivity Boost' },
      { value: 'Secure', label: 'Data Privacy' },
    ],
    features: [
      'Custom RAG Pipelines',
      'Autonomous Agent Orchestration',
      'Multimodal AI Processing',
      'Legacy System AI Wrappers',
    ],
    ctaText: 'Integrate AI',
    threeDConfig: { geometry: 'torus', color: '#a855f7', wireframe: false },
  },
  {
    slug: 'web-development',
    label: '05 // ENGINEERING',
    category: 'Web Development',
    title: 'High-Performance\nDigital Platforms.',
    description: 'Next-generation full-stack web applications engineered for sub-millisecond response times, perfect Core Web Vitals, and flawless user experiences.',
    stats: [
      { value: '<0.1s', label: 'TTFB' },
      { value: '100', label: 'Lighthouse Score' },
      { value: 'Global', label: 'Edge Delivery' },
    ],
    features: [
      'Next.js / React Architecture',
      'Serverless & Edge Functions',
      'Advanced SEO & Structured Data',
      'CI/CD & Automated Testing',
    ],
    ctaText: 'Build Platform',
    threeDConfig: { geometry: 'cube', color: '#f43f5e', wireframe: true },
  },
  {
    slug: 'app-development',
    label: '06 // MOBILE',
    category: 'App Development',
    title: 'Native-Grade\nMobile Experiences.',
    description: 'Cross-platform mobile applications that feel native. We craft fluid, gesture-driven interfaces backed by robust offline-first architectures.',
    stats: [
      { value: '60fps', label: 'Frame Rate' },
      { value: 'iOS/Android', label: 'Dual Platform' },
      { value: '50k+', label: 'Installs/Day' },
    ],
    features: [
      'React Native / Swift / Kotlin',
      'Offline-First Synchronization',
      'Push Notification Ecosystems',
      'App Store Optimization (ASO)',
    ],
    ctaText: 'Launch App',
    threeDConfig: { geometry: 'ring', color: '#f59e0b', wireframe: true },
  },
  {
    slug: 'custom-software',
    label: '07 // SCALE',
    category: 'Custom Software',
    title: 'Bespoke\nEngineering Systems.',
    description: 'Tailored software architectures built from the ground up to solve your most complex operational challenges. No templates, just pure engineering.',
    stats: [
      { value: '100%', label: 'Custom Fit' },
      { value: 'Modular', label: 'Scalable Codebase' },
      { value: 'Agile', label: 'Delivery Method' },
    ],
    features: [
      'Microservices Architecture',
      'Enterprise API Integration',
      'Database Optimization & Migration',
      'Security & Compliance Audits',
    ],
    ctaText: 'Scope Project',
    threeDConfig: { geometry: 'grid', color: '#a855f7', wireframe: true },
  },
  {
    slug: 'ui-ux',
    label: '08 // DESIGN',
    category: 'UI/UX Design',
    title: 'Human-Centric\nInterface Systems.',
    description: 'Immersive, accessible, and conversion-focused design systems. We map user journeys to create interfaces that are as beautiful as they are functional.',
    stats: [
      { value: '4.8/5', label: 'User Satisfaction' },
      { value: '+35%', label: 'Conversion Lift' },
      { value: 'WCAG', label: 'AA Compliant' },
    ],
    features: [
      'Design System Architecture',
      'Interactive Prototyping',
      'User Research & Testing',
      'Accessibility & Inclusive Design',
    ],
    ctaText: 'Start Design',
    threeDConfig: { geometry: 'icosahedron', color: '#6366f1', wireframe: false },
  },
];

export function getSolutionData(slug: string): SolutionData | undefined {
  return solutionsData.find((s) => s.slug === slug);
}