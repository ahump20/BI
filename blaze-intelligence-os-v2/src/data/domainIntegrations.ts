export type DomainStatus = 'online' | 'degraded' | 'offline' | 'pending';

export interface DomainAction {
  label: string;
  url: string;
  type?: 'primary' | 'secondary';
}

export interface DomainIntegration {
  domain: string;
  label: string;
  status: DomainStatus;
  description: string;
  capabilities: string[];
  owner?: string;
  actions?: DomainAction[];
  notes?: string;
}

export const DOMAIN_INTEGRATIONS: DomainIntegration[] = [
  {
    domain: 'https://blaze-intelligence.netlify.app',
    label: 'Netlify Command Center',
    status: 'online',
    description: 'Production-grade React dashboard delivering the unified Blaze Intelligence experience.',
    capabilities: [
      'Real-time championship analytics views',
      'Interactive NIL & prediction tooling',
      'Integrated theming and status telemetry'
    ],
    owner: 'Netlify',
    actions: [
      { label: 'Open Production', url: 'https://blaze-intelligence.netlify.app', type: 'primary' }
    ],
    notes: 'Primary domain – all other environments are federated into this experience.'
  },
  {
    domain: 'https://blaze-intelligence.replit.app',
    label: 'Replit Prototype Hub',
    status: 'offline',
    description: 'Legacy sandbox used for rapid proof-of-concept demos and API experiments.',
    capabilities: [
      'Lightweight Node demos',
      'Experimental API endpoints',
      'Live coding collaboration'
    ],
    owner: 'Replit',
    actions: [
      { label: 'Review Prototype', url: 'https://blaze-intelligence.replit.app' }
    ],
    notes: 'Content migrated into the Netlify build; keep for future instant prototyping.'
  },
  {
    domain: 'https://70d41e32.blaze-intelligence-platform.pages.dev',
    label: 'Cloudflare Pages Automation',
    status: 'offline',
    description: 'Cloudflare Pages deployment housing automation workers and API mocks for integrations.',
    capabilities: [
      'Edge worker stubs',
      'Platform automation hooks',
      'Failover content routing'
    ],
    owner: 'Cloudflare',
    actions: [
      { label: 'Audit Deployment', url: 'https://70d41e32.blaze-intelligence-platform.pages.dev' }
    ],
    notes: 'Failed health checks replicated here so the Netlify UI can surface remediation guidance.'
  },
  {
    domain: 'https://airtable.com',
    label: 'Airtable Intelligence Base',
    status: 'degraded',
    description: 'Centralized Airtable workspace powering CRM, roster management, and automation data.',
    capabilities: [
      'Recruiting pipeline tracking',
      'Automated content scheduling',
      'Executive reporting views'
    ],
    owner: 'Airtable',
    actions: [
      { label: 'Sync Airtable Data', url: 'https://airtable.com' }
    ],
    notes: 'API credentials validated; re-authenticate to resume scheduled sync jobs.'
  },
  {
    domain: 'https://blaze-3d.netlify.app',
    label: '3D Immersive Experience',
    status: 'pending',
    description: 'High fidelity WebGL environment showcasing AR/VR-ready Blaze visualizations.',
    capabilities: [
      'Three.js championship arena',
      'Interactive biometric overlays',
      'Future AR headset support'
    ],
    owner: 'Netlify',
    actions: [
      { label: 'Launch 3D Experience', url: 'https://blaze-3d.netlify.app' }
    ],
    notes: 'Integrating hero assets into the React dashboard for a unified visual story.'
  },
  {
    domain: 'https://new.express.adobe.com',
    label: 'Adobe Express Brand Kit',
    status: 'offline',
    description: 'Brand storytelling templates and pitch collateral managed in Adobe Express.',
    capabilities: [
      'Executive-ready presentation templates',
      'Motion graphics presets',
      'Instant social cutdowns'
    ],
    owner: 'Adobe',
    actions: [
      { label: 'Open Brand Kit', url: 'https://new.express.adobe.com' }
    ],
    notes: 'Assets referenced inside the Netlify UI so creative stays in lockstep with analytics.'
  },
  {
    domain: 'https://j8r5k8b9j.wixsite.com',
    label: 'Legacy Wix Microsite',
    status: 'offline',
    description: 'Historical marketing microsite kept for archival content and testimonials.',
    capabilities: [
      'Archived case studies',
      'Legacy lead capture forms',
      'Transition content for alumni clients'
    ],
    owner: 'Wix',
    actions: [
      { label: 'Review Archive', url: 'https://j8r5k8b9j.wixsite.com' }
    ],
    notes: 'Key copy points already ported into the unified platform — keep as a content vault.'
  },
  {
    domain: 'https://a4dc795e.blaze-intelligence.pages.dev',
    label: 'Cloudflare Pages Fallback',
    status: 'offline',
    description: 'Failsafe static deployment mirroring the production dashboard for redundancy testing.',
    capabilities: [
      'Static export of dashboard UI',
      'Disaster recovery drill target',
      'Automated uptime probes'
    ],
    owner: 'Cloudflare',
    actions: [
      { label: 'Check Fallback', url: 'https://a4dc795e.blaze-intelligence.pages.dev' }
    ],
    notes: 'Health signals ingested by the Netlify build to highlight failed edge deployments.'
  }
];
