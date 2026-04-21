/**
 * Enhanced type-safe test factory interface with 2026 patterns
 * Provides consistent object creation for testing
 */
export type Factory<T> = {
  build(overrides?: Partial<T>): T;
  buildList(count: number, overrides?: Partial<T>): T[];
  buildWithSequence(overrides?: Partial<T>, sequenceField?: keyof T): T;
  extend<U>(traits: U): Factory<T & U>;
};

/**
 * Creates a type-safe factory for building test objects
 * Enhanced with 2026 patterns: sequence generation and trait composition
 * Reduces hardcoded test data and improves maintainability
 */
export function createFactory<T>(defaults: T): Factory<T> {
  let sequenceCounter = 0;
  
  return {
    build: (overrides = {}) => ({
      ...defaults,
      ...overrides
    }),
    
    buildList: (count, overrides = {}) => 
      Array.from({ length: count }, () => ({
        ...defaults,
        ...overrides
      })),
    
    // Generate unique values for fields like `id`, `email`, etc.
    buildWithSequence: (overrides = {}, sequenceField) => {
      const seq = ++sequenceCounter;
      const result = { ...defaults, ...overrides };
      if (sequenceField && typeof defaults[sequenceField] === 'string') {
        (result as any)[sequenceField] = `${defaults[sequenceField]}-${seq}`;
      }
      return result;
    },
    
    // Compose traits for variant creation
    extend: <U>(traits: U) => createFactory({ ...defaults, ...traits })
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

// Example usage of enhanced factories:
// export const userFactory = createFactory({
//   id: 'user',
//   name: 'Test User',
//   email: 'test@example.com',
//   role: 'user'
// });
// 
// export const adminUserFactory = userFactory.extend({ role: 'admin' });
// 
// // Usage:
// const user1 = userFactory.buildWithSequence({}, 'id'); // { id: 'user-1', name: 'Test User', ... }
// const admin = adminUserFactory.build({ name: 'Admin User' }); // { id: 'user', name: 'Admin User', role: 'admin', ... }
