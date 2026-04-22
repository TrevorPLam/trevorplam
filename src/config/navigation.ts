export interface NavigationItem {
  name: string;
  href: string;
  slug: string;
  children?: NavigationItem[];
}

export const navigationConfig = {
  main: [
    { name: 'Dashboard', href: '/', slug: 'dashboard' },
    { name: 'About', href: '/about', slug: 'about' },
    { 
      name: 'Capabilities', 
      href: '/capabilities', 
      slug: 'capabilities',
      children: [
        { name: 'Operations & Supply Chain', href: '/capabilities/operations-supply-chain' },
        { name: 'People, HR & Compliance', href: '/capabilities/people-hr-compliance' },
        { name: 'Financial Control & P&L', href: '/capabilities/financial-control-pl' },
        { name: 'Customer & Growth', href: '/capabilities/customer-growth' },
        { name: 'Systems & Tooling', href: '/capabilities/systems-tooling' }
      ]
    },
    {
      name: 'Case Studies',
      href: '/cases',
      slug: 'cases',
      children: [
        { name: 'Quick Service Restaurant', href: '/cases/sonic' },
        { name: 'Nail & Beauty Services', href: '/cases/grandlux' },
        { name: 'Financial Services', href: '/cases/klw' }
      ]
    },
    { 
      name: 'Lab', 
      href: '/lab', 
      slug: 'lab',
      children: [
        { name: 'Learning Log', href: '/lab/learning-log' },
        { name: 'Projects', href: '/lab/projects' },
        { name: 'Tech Stack', href: '/lab/tech-stack' }
      ]
    },
    { 
      name: 'Resources', 
      href: '/resources', 
      slug: 'resources',
      children: [
        { name: 'Playbooks', href: '/resources/playbooks' },
        { name: 'Templates', href: '/resources/templates' },
        { name: 'Skills Matrix', href: '/resources/skills-matrix' }
      ]
    },
    { name: 'Search', href: '/search', slug: 'search' },
    { name: 'Archive', href: '/archive', slug: 'archive' }
  ]
};

export type NavigationConfig = typeof navigationConfig;
