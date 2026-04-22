import { expect, test, describe } from 'vitest';
import { page } from 'vitest/browser';
import { BrowserTestHelper } from '../browser/browser-test-utils';

describe('Component Visual Regression Tests', () => {
  test('Navigation component visual consistency', async () => {
    await BrowserTestHelper.setup({ viewport: { width: 1280, height: 720 } });
    
    const container = BrowserTestHelper.createTestContainer('nav-test');
    
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
    await BrowserTestHelper.takeScreenshot(nav, 'navigation-desktop');
    
    await BrowserTestHelper.cleanup(container);
  });

  test('Footer component visual consistency', async () => {
    await BrowserTestHelper.setup({ viewport: { width: 1280, height: 720 } });
    
    const container = BrowserTestHelper.createTestContainer('footer-test');
    
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
    await BrowserTestHelper.takeScreenshot(footer, 'footer-desktop');
    
    await BrowserTestHelper.cleanup(container);
  });

  test('Button component states', async () => {
    await BrowserTestHelper.setup({ viewport: { width: 1280, height: 720 } });
    
    const container = BrowserTestHelper.createTestContainer('button-test');
    
    container.innerHTML = `
      <div class="space-x-4">
        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Primary Button</button>
        <button class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Secondary Button</button>
        <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Success Button</button>
        <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Danger Button</button>
        <button class="bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed" disabled>Disabled Button</button>
      </div>
    `;

    const buttonContainer = container.querySelector('.space-x-4') as HTMLElement;
    await BrowserTestHelper.takeScreenshot(buttonContainer, 'button-states');
    
    await BrowserTestHelper.cleanup(container);
  });

  test('Form component visual consistency', async () => {
    await BrowserTestHelper.setup({ viewport: { width: 1280, height: 720 } });
    
    const container = BrowserTestHelper.createTestContainer('form-test');
    
    container.innerHTML = `
      <form class="bg-white p-6 rounded-lg shadow-md max-w-md">
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
    await BrowserTestHelper.takeScreenshot(form, 'form-component');
    
    await BrowserTestHelper.cleanup(container);
  });

  test('Card component variations', async () => {
    await BrowserTestHelper.setup({ viewport: { width: 1280, height: 720 } });
    
    const container = BrowserTestHelper.createTestContainer('card-test');
    
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-2">Standard Card</h3>
          <p class="text-gray-600">This is a standard card with basic styling.</p>
        </div>
        <div class="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
          <h3 class="text-lg font-semibold mb-2 text-blue-800">Highlighted Card</h3>
          <p class="text-blue-600">This card has a blue theme and border.</p>
        </div>
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg shadow-md text-white">
          <h3 class="text-lg font-semibold mb-2">Gradient Card</h3>
          <p class="text-purple-100">This card has a gradient background.</p>
        </div>
      </div>
    `;

    const cardGrid = container.querySelector('.grid') as HTMLElement;
    await BrowserTestHelper.takeScreenshot(cardGrid, 'card-variations');
    
    await BrowserTestHelper.cleanup(container);
  });

  test('Responsive design verification', async () => {
    // Test mobile view
    await BrowserTestHelper.setup({ viewport: { width: 375, height: 667 } });
    
    const container = BrowserTestHelper.createTestContainer('responsive-test');
    
    container.innerHTML = `
      <div class="p-4">
        <h1 class="text-2xl md:text-3xl font-bold mb-4">Responsive Heading</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded shadow">Item 1</div>
          <div class="bg-white p-4 rounded shadow">Item 2</div>
          <div class="bg-white p-4 rounded shadow">Item 3</div>
        </div>
      </div>
    `;

    const responsiveContent = container.querySelector('.p-4') as HTMLElement;
    await BrowserTestHelper.takeScreenshot(responsiveContent, 'responsive-mobile');
    
    // Test tablet view
    await BrowserTestHelper.setup({ viewport: { width: 768, height: 1024 } });
    await BrowserTestHelper.takeScreenshot(responsiveContent, 'responsive-tablet');
    
    // Test desktop view
    await BrowserTestHelper.setup({ viewport: { width: 1280, height: 720 } });
    await BrowserTestHelper.takeScreenshot(responsiveContent, 'responsive-desktop');
    
    await BrowserTestHelper.cleanup(container);
  });
});
