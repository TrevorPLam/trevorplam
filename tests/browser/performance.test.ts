import { expect, test, describe } from 'vitest';
import { page } from 'vitest/browser';
import { metricCardFactory } from '../utils/test-factories';

describe('Browser Performance Tests', () => {
  test('MetricCard render performance', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Measure render time
    const startTime = performance.now();
    
    const metricData = metricCardFactory.build();
    
    container.innerHTML = `
      <div class="metric-card">
        <h3 class="font-mono text-lg">${metricData.title}</h3>
        <div class="flex justify-between">
          <span class="text-red-500">${metricData.before}</span>
          <span class="text-green-500">${metricData.after}</span>
        </div>
        <p>${metricData.context}</p>
      </div>
    `;
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Performance assertion - should render within 50ms
    expect(renderTime).toBeLessThan(50);
    
    // Memory usage check
    const memoryUsage = (performance as any).memory;
    if (memoryUsage) {
      expect(memoryUsage.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024); // 50MB
    }
  });

  test('Large list rendering performance', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Generate 100 metric cards
    const metrics = Array.from({ length: 100 }, () => metricCardFactory.build());
    
    const startTime = performance.now();
    
    container.innerHTML = `
      <div class="metrics-grid">
        ${metrics.map(metric => `
          <div class="metric-card">
            <h3 class="font-mono text-lg">${metric.title}</h3>
            <div class="flex justify-between">
              <span class="text-red-500">${metric.before}</span>
              <span class="text-green-500">${metric.after}</span>
            </div>
            <p>${metric.context}</p>
          </div>
        `).join('')}
      </div>
    `;
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Large list should render within 500ms
    expect(renderTime).toBeLessThan(500);
    
    // Check that all elements are rendered
    const cards = container.querySelectorAll('.metric-card');
    expect(cards).toHaveLength(100);
  });

  test('Animation performance', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    container.innerHTML = `
      <style>
        .animate-card {
          transition: transform 0.3s ease-in-out;
        }
        .animate-card:hover {
          transform: scale(1.05);
        }
      </style>
      <div class="animate-card bg-white p-4 rounded-lg shadow-md">
        <h3>Animated Card</h3>
        <p>Hover me to see animation</p>
      </div>
    `;
    
    const card = container.querySelector('.animate-card') as HTMLElement;
    
    // Measure animation performance
    const startTime = performance.now();
    
    // Trigger hover animation
    card.style.transform = 'scale(1.05)';
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const endTime = performance.now();
    const animationTime = endTime - startTime;
    
    // Animation should complete within 350ms (300ms + buffer)
    expect(animationTime).toBeLessThan(350);
    
    // Reset animation
    card.style.transform = 'scale(1)';
  });

  test('Scroll performance with many elements', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Create scrollable content with many elements
    container.innerHTML = `
      <div style="height: 200px; overflow-y: auto;">
        ${Array.from({ length: 50 }, (_, i) => `
          <div class="py-4 px-6 border-b border-gray-200">
            <h3 class="font-semibold">Item ${i + 1}</h3>
            <p class="text-gray-600">Content for item ${i + 1}</p>
          </div>
        `).join('')}
      </div>
    `;
    
    const scrollContainer = container.querySelector('div') as HTMLElement;
    
    // Measure scroll performance
    const startTime = performance.now();
    
    // Scroll to bottom
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
    
    // Wait for scroll to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = performance.now();
    const scrollTime = endTime - startTime;
    
    // Scroll should be smooth and fast
    expect(scrollTime).toBeLessThan(200);
  });

  test('Image loading performance', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    container.innerHTML = `
      <div class="image-container">
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VGVzdCBJbWFnZTwvdGV4dD4KPC9zdmc+" alt="Test Image" class="w-full h-auto rounded-lg shadow-md" loading="lazy">
      </div>
    `;
    
    const img = container.querySelector('img') as HTMLImageElement;
    
    // Measure image load time
    const startTime = performance.now();
    
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(true);
      img.onerror = reject;
    });
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // Image should load quickly (it's a small SVG)
    expect(loadTime).toBeLessThan(100);
    
    // Verify image dimensions
    expect(img.naturalWidth).toBe(300);
    expect(img.naturalHeight).toBe(200);
  });

  test('Form interaction performance', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    container.innerHTML = `
      <form class="space-y-4">
        <input type="text" name="name" placeholder="Name" class="w-full px-3 py-2 border rounded">
        <input type="email" name="email" placeholder="Email" class="w-full px-3 py-2 border rounded">
        <textarea name="message" placeholder="Message" class="w-full px-3 py-2 border rounded" rows="4"></textarea>
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
      </form>
    `;
    
    const form = container.querySelector('form') as HTMLFormElement;
    const inputs = form.querySelectorAll('input, textarea');
    
    // Measure form filling performance
    const startTime = performance.now();
    
    // Fill all form fields
    (inputs[0] as HTMLInputElement).value = 'John Doe';
    (inputs[1] as HTMLInputElement).value = 'john@example.com';
    (inputs[2] as HTMLTextAreaElement).value = 'This is a test message';
    
    const endTime = performance.now();
    const fillTime = endTime - startTime;
    
    // Form filling should be instant
    expect(fillTime).toBeLessThan(10);
    
    // Verify values are set
    expect((inputs[0] as HTMLInputElement).value).toBe('John Doe');
    expect((inputs[1] as HTMLInputElement).value).toBe('john@example.com');
    expect((inputs[2] as HTMLTextAreaElement).value).toBe('This is a test message');
  });

  test('Core Web Vitals simulation', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Simulate page content
    container.innerHTML = `
      <div class="page-content">
        <header class="bg-blue-600 text-white p-6">
          <h1 class="text-2xl font-bold">Page Title</h1>
        </header>
        <main class="p-6">
          <section class="mb-8">
            <h2 class="text-xl font-semibold mb-4">Main Content</h2>
            <p class="text-gray-700 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              ${Array.from({ length: 6 }, (_, i) => `
                <div class="bg-white p-4 rounded-lg shadow">
                  <h3 class="font-semibold mb-2">Card ${i + 1}</h3>
                  <p class="text-gray-600">Card content ${i + 1}</p>
                </div>
              `).join('')}
            </div>
          </section>
        </main>
      </div>
    `;
    
    // Measure Largest Contentful Paint (LCP) simulation
    const startTime = performance.now();
    
    // Wait for main content to be visible
    const mainContent = container.querySelector('main') as HTMLElement;
    await expect.element(mainContent).toBeInViewport();
    
    const lcpTime = performance.now() - startTime;
    
    // LCP should be under 2.5s (good performance)
    expect(lcpTime).toBeLessThan(2500);
    
    // Measure First Input Delay (FID) simulation
    const fidStartTime = performance.now();
    
    // Simulate user interaction
    const firstCard = container.querySelector('.bg-white') as HTMLElement;
    firstCard.click();
    
    const fidTime = performance.now() - fidStartTime;
    
    // FID should be under 100ms (good performance)
    expect(fidTime).toBeLessThan(100);
    
    // Measure Cumulative Layout Shift (CLS) simulation
    // In this test, we verify no unexpected layout shifts
    const initialLayout = container.getBoundingClientRect();
    
    // Add content dynamically
    const dynamicContent = document.createElement('div');
    dynamicContent.className = 'mt-4 p-4 bg-gray-100 rounded';
    dynamicContent.textContent = 'Dynamic content added';
    mainContent.appendChild(dynamicContent);
    
    // Wait for layout to settle
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const finalLayout = container.getBoundingClientRect();
    
    // Layout should be stable (no significant shifts)
    expect(Math.abs(finalLayout.height - initialLayout.height)).toBeLessThan(200);
  });

  test('Memory leak detection', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Get initial memory usage
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Create and destroy many elements
    for (let i = 0; i < 100; i++) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
        <div class="temp-card">
          <h3>Temp Card ${i}</h3>
          <p>Temporary content ${i}</p>
        </div>
      `;
      container.appendChild(tempDiv);
      
      // Remove the element
      container.removeChild(tempDiv);
    }
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
    
    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check final memory usage
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be minimal (no significant leaks)
    if (initialMemory > 0) {
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // 5MB increase threshold
    }
  });
});
