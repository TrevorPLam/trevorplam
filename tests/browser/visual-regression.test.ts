import { expect, test, describe } from 'vitest';
import { page } from 'vitest/browser';
import { metricCardFactory } from '../utils/test-factories';

describe('Visual Regression Tests', () => {
  test('MetricCard visual consistency', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const metricData = metricCardFactory.build({
      title: 'Visual Consistency Test',
      before: '$100K',
      after: '$500K',
      context: 'Consistent visual appearance across browsers',
      skillTag: 'Growth'
    });

    container.innerHTML = `
      <div class="metric-card bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-mono text-lg font-semibold text-gray-900">${metricData.title}</h3>
          <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">${metricData.skillTag}</span>
        </div>
        <div class="flex justify-between items-center mb-3">
          <div class="text-center">
            <p class="text-sm text-gray-500 mb-1">Before</p>
            <p class="text-lg font-semibold text-red-600">${metricData.before}</p>
          </div>
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-500 mb-1">After</p>
            <p class="text-lg font-semibold text-green-600">${metricData.after}</p>
          </div>
        </div>
        <p class="text-gray-600 text-sm leading-relaxed">${metricData.context}</p>
      </div>
    `;

    const card = container.querySelector('.metric-card') as HTMLElement;
    await expect.element(card).toMatchScreenshot({
      threshold: 0.2,
      maxDiffPixels: 100
    });
  });

  test('SkillTag visual appearance', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const skills = ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'];
    
    container.innerHTML = `
      <div class="skill-tags-container">
        ${skills.map(skill => `
          <span class="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2 mb-2">
            ${skill}
          </span>
        `).join('')}
      </div>
    `;

    const tagsContainer = container.querySelector('.skill-tags-container') as HTMLElement;
    await expect.element(tagsContainer).toMatchScreenshot({
      threshold: 0.15,
      maxDiffPixels: 50
    });
  });

  test('Timeline component visual layout', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    container.innerHTML = `
      <div class="timeline-container">
        <div class="flex items-start mb-8">
          <div class="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            1
          </div>
          <div class="ml-4 flex-1">
            <h4 class="text-lg font-semibold text-gray-900">Project Kickoff</h4>
            <p class="text-sm text-gray-500 mb-2">January 2024</p>
            <p class="text-gray-600">Initiated project planning and team formation</p>
          </div>
        </div>
        <div class="flex items-start">
          <div class="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
            2
          </div>
          <div class="ml-4 flex-1">
            <h4 class="text-lg font-semibold text-gray-900">Implementation</h4>
            <p class="text-sm text-gray-500 mb-2">March 2024</p>
            <p class="text-gray-600">Completed core development and testing phases</p>
          </div>
        </div>
      </div>
    `;

    const timeline = container.querySelector('.timeline-container') as HTMLElement;
    await expect.element(timeline).toMatchScreenshot({
      threshold: 0.2,
      maxDiffPixels: 80
    });
  });

  test('Navigation component responsive design', async () => {
    // Test desktop navigation
    page.setViewportSize({ width: 1280, height: 720 });
    
    const container = document.createElement('div');
    document.body.appendChild(container);

    container.innerHTML = `
      <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <span class="text-xl font-bold text-gray-900">Trevor Lam</span>
            </div>
            <div class="hidden md:flex items-center space-x-8">
              <a href="#about" class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">About</a>
              <a href="#experience" class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">Experience</a>
              <a href="#cases" class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">Case Studies</a>
              <a href="#contact" class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">Contact</a>
            </div>
          </div>
        </div>
      </nav>
    `;

    const nav = container.querySelector('nav') as HTMLElement;
    await expect.element(nav).toMatchScreenshot({
      threshold: 0.2,
      maxDiffPixels: 100
    });

    // Test mobile navigation
    page.setViewportSize({ width: 375, height: 667 });
    
    await expect.element(nav).toMatchScreenshot({
      threshold: 0.2,
      maxDiffPixels: 100
    });
  });

  test('Footer component visual consistency', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    container.innerHTML = `
      <footer class="bg-gray-900 text-white">
        <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 class="text-lg font-semibold mb-4">Trevor Lam</h3>
              <p class="text-gray-300 text-sm">Chief of Staff specializing in strategic operations and process optimization.</p>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
              <ul class="space-y-2 text-sm">
                <li><a href="#about" class="text-gray-300 hover:text-white">About</a></li>
                <li><a href="#experience" class="text-gray-300 hover:text-white">Experience</a></li>
                <li><a href="#cases" class="text-gray-300 hover:text-white">Case Studies</a></li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-4">Connect</h3>
              <div class="flex space-x-4">
                <a href="#" class="text-gray-300 hover:text-white">LinkedIn</a>
                <a href="#" class="text-gray-300 hover:text-white">Email</a>
                <a href="#" class="text-gray-300 hover:text-white">GitHub</a>
              </div>
            </div>
          </div>
          <div class="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; 2024 Trevor Lam. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;

    const footer = container.querySelector('footer') as HTMLElement;
    await expect.element(footer).toMatchScreenshot({
      threshold: 0.25,
      maxDiffPixels: 150
    });
  });

  test('Form component visual validation', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    container.innerHTML = `
      <form class="bg-white p-6 rounded-lg shadow-md">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input type="text" id="name" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="John Doe">
        </div>
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input type="email" id="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="john@example.com">
        </div>
        <div class="mb-4">
          <label for="message" class="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea id="message" name="message" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your message here..."></textarea>
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200">
          Send Message
        </button>
      </form>
    `;

    const form = container.querySelector('form') as HTMLElement;
    await expect.element(form).toMatchScreenshot({
      threshold: 0.2,
      maxDiffPixels: 100
    });
  });
});
