/**
 * Vitest setup file to prevent hanging and symbol conflicts
 */

// Mock Astro components to prevent import issues
vi.mock('astro:container', () => ({
  experimental_AstroContainer: {
    create: vi.fn().mockResolvedValue({
      renderToString: vi.fn().mockResolvedValue('<div>Mock Component</div>')
    })
  }
}));

// Mock all Astro components to prevent parsing issues
vi.mock('../../src/components/MetricCard.astro', () => ({
  default: 'MetricCard'
}));

vi.mock('../../src/components/Footer.astro', () => ({
  default: 'Footer'
}));

vi.mock('../../src/components/SidebarNavigation.astro', () => ({
  default: 'SidebarNavigation'
}));

vi.mock('../../src/components/SkillTag.astro', () => ({
  default: 'SkillTag'
}));

vi.mock('../../src/components/TimelineNode.astro', () => ({
  default: 'TimelineNode'
}));

vi.mock('../../src/components/OptimizedImage.astro', () => ({
  default: 'OptimizedImage'
}));

vi.mock('../../src/components/KPICard.astro', () => ({
  default: 'KPICard'
}));

vi.mock('../../src/components/InlineMetric.astro', () => ({
  default: 'InlineMetric'
}));

vi.mock('../../src/components/Timeline.astro', () => ({
  default: 'Timeline'
}));

// Global test timeout
vi.setConfig({ testTimeout: 5000 });
