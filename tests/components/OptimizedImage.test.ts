import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import OptimizedImage from '../../src/components/OptimizedImage.astro';

describe('OptimizedImage', () => {
	test('renders with required props', async () => {
		const container = await AstroContainer.create();
		
		const result = await container.renderToString(OptimizedImage, {
			props: {
				src: '/test-image.jpg',
				alt: 'Test image description',
				width: 400,
				height: 300
			}
		});

		expect(result).toContain('alt="Test image description"');
		expect(result).toContain('loading="lazy"');
		expect(result).toContain('fetchpriority="auto"');
	});

	test('renders with priority prop for LCP optimization', async () => {
		const container = await AstroContainer.create();
		
		const result = await container.renderToString(OptimizedImage, {
			props: {
				src: '/hero-image.jpg',
				alt: 'Hero image',
				priority: true,
				width: 800,
				height: 600
			}
		});

		expect(result).toContain('loading="eager"');
		expect(result).toContain('fetchpriority="high"');
		expect(result).toContain('decoding="sync"');
	});

	test('renders with custom loading and fetchpriority', async () => {
		const container = await AstroContainer.create();
		
		const result = await container.renderToString(OptimizedImage, {
			props: {
				src: '/lazy-image.jpg',
				alt: 'Lazy loaded image',
				loading: 'lazy',
				fetchpriority: 'low',
				width: 400,
				height: 300
			}
		});

		expect(result).toContain('loading="lazy"');
		expect(result).toContain('fetchpriority="low"');
		expect(result).toContain('decoding="async"');
	});

	test('renders with width and height', async () => {
		const container = await AstroContainer.create();
		
		const result = await container.renderToString(OptimizedImage, {
			props: {
				src: '/sized-image.jpg',
				alt: 'Sized image',
				width: 400,
				height: 300
			}
		});

		expect(result).toContain('width="400"');
		expect(result).toContain('height="300"');
	});

	test('renders with custom class', async () => {
		const container = await AstroContainer.create();
		
		const result = await container.renderToString(OptimizedImage, {
			props: {
				src: '/styled-image.jpg',
				alt: 'Styled image',
				class: 'custom-class another-class',
				width: 400,
				height: 300
			}
		});

		expect(result).toContain('custom-class');
		expect(result).toContain('another-class');
	});

	test('renders with layout prop', async () => {
		const container = await AstroContainer.create();
		
		const result = await container.renderToString(OptimizedImage, {
			props: {
				src: '/full-width-image.jpg',
				alt: 'Full width image',
				layout: 'full-width',
				width: 1200,
				height: 600
			}
		});

		expect(result).toContain('data-astro-image="full-width"');
	});

	test('renders with format and quality', async () => {
		const container = await AstroContainer.create();
		
		const result = await container.renderToString(OptimizedImage, {
			props: {
				src: '/optimized-image.jpg',
				alt: 'Optimized image',
				format: 'avif',
				quality: 'high',
				width: 400,
				height: 300
			}
		});

		expect(result).toBeTruthy();
		// Format and quality are handled by Astro's Image component during build
		// We just verify the component renders without errors
	});
});
