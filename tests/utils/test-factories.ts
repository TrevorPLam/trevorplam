/**
 * Type-safe test factory interface
 * Provides consistent object creation for testing
 */
export type Factory<T> = {
  build(overrides?: Partial<T>): T;
  buildList(count: number, overrides?: Partial<T>): T[];
};

/**
 * Creates a type-safe factory for building test objects
 * Reduces hardcoded test data and improves maintainability
 */
export function createFactory<T>(defaults: T): Factory<T> {
  return {
    build: (overrides = {}) => ({
      ...defaults,
      ...overrides
    }),
    buildList: (count, overrides = {}) => 
      Array.from({ length: count }, () => ({
        ...defaults,
        ...overrides
      }))
  };
}

// Component-specific factories
export const metricCardFactory = createFactory({
  title: 'Test Metric',
  before: '$100K',
  after: '$200K',
  context: 'Test context for unit testing',
  skillTag: 'Testing',
  caseStudySlug: 'test-case'
});

export const skillTagFactory = createFactory({
  label: 'Test Skill'
});

export const timelineNodeFactory = createFactory({
  year: '2021',
  title: 'Test Role',
  description: 'Test description for unit testing',
  type: 'role' as const
});

export const optimizedImageFactory = createFactory({
  src: '/test-image.jpg',
  alt: 'Test image description',
  width: 400,
  height: 300
});

export const navigationFactory = createFactory({
  currentPath: '/',
  isMobileMenuOpen: false
});

export const footerFactory = createFactory({
  currentYear: new Date().getFullYear(),
  showContactInfo: true
});
