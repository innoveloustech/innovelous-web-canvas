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
    slug: 'hardware',
    label: '01 // HARDWARE',
    category: 'Hardware & IoT Solutions',
    title: 'Physical\nInfrastructure.',
    description: 'We bridge the gap between physical devices and digital intelligence. From embedded firmware to global IoT telemetry networks, we engineer the hardware layer that powers your operational reality.',
    stats: [
      { value: '<5ms', label: 'Telemetry Latency' },
      { value: '99.9%', label: 'Hardware Uptime' },
      { value: '10k+', label: 'Connected Devices' },
    ],
    features: [
      'IoT Ecosystem Architecture',
      'Embedded Firmware & RTOS',
      'Edge Computing Nodes',
      'Sensor Integration & Prototyping',
      'Real-time Telemetry Dashboards',
      'Predictive Maintenance Models',
      'Secure OTA (Over-The-Air) Updates',
      'Industrial Control Systems (ICS)',
    ],
    ctaText: 'Deploy Hardware',
    // Cyan wireframe grid for a technical, hardware feel
    threeDConfig: { geometry: 'grid', color: '#06b6d4', wireframe: true }, 
  },
  {
    slug: 'software',
    label: '02 // SOFTWARE',
    category: 'Software & Digital Engineering',
    title: 'Digital\nEcosystems.',
    description: 'End-to-end digital engineering. We build high-performance web platforms, native mobile applications, and enterprise AI pipelines that scale seamlessly with your business logic.',
    stats: [
      { value: '<0.1s', label: 'Response Time' },
      { value: '100', label: 'Lighthouse Score' },
      { value: '24/7', label: 'Global Edge Delivery' },
    ],
    features: [
      'Web & Mobile App Engineering',
      'AI Integration & LLM Pipelines',
      'Custom Microservices Architecture',
      'UI/UX Design Systems',
      'Cloud Infrastructure & DevOps',
      'Enterprise API Integration',
      'Machine Learning Models',
      'Database Optimization & Security',
    ],
    ctaText: 'Build Software',
    // Purple solid icosahedron for a modern, software/AI feel
    threeDConfig: { geometry: 'icosahedron', color: '#a855f7', wireframe: false }, 
  },
];

export function getSolutionData(slug: string): SolutionData | undefined {
  return solutionsData.find((s) => s.slug === slug);
}