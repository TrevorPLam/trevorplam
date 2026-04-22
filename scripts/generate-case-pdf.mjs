#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate PDF for a case study using Puppeteer with print CSS
 * @param {string} slug - Case study slug
 * @param {string} outputDir - Output directory for PDFs
 */
async function generateCasePDF(slug, outputDir = 'public/pdfs') {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Build site first to ensure latest content
    console.log('Building site...');
    const { execSync } = await import('child_process');
    execSync('npm run build', { stdio: 'inherit' });

    // Path to the built case study HTML
    const caseStudyPath = path.join(process.cwd(), 'dist', 'cases', `${slug}`, 'index.html');
    
    if (!fs.existsSync(caseStudyPath)) {
      throw new Error(`Case study HTML not found: ${caseStudyPath}`);
    }

    // Output PDF path
    const pdfPath = path.join(outputDir, `${slug}.pdf`);

    // Generate PDF using Puppeteer directly
    console.log(`Generating PDF for ${slug}...`);
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set viewport to A4 size
      await page.setViewport({
        width: 794,  // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        deviceScaleFactor: 1
      });

      // Load the HTML file
      const fileUrl = `file://${caseStudyPath}`;
      await page.goto(fileUrl, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Add print styles
      await page.addStyleTag({
        content: fs.readFileSync(path.join(process.cwd(), 'src/styles/print.css'), 'utf8')
      });

      // Generate PDF with print settings
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: {
          top: '2cm',
          right: '2cm',
          bottom: '2cm',
          left: '2cm'
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
            Trevor Lam - Case Study
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        `,
        preferCSSPageSize: true
      });

      console.log(`✅ PDF generated: ${pdfPath}`);
      return pdfPath;

    } catch (error) {
      console.error(`PDF generation failed: ${error.message}`);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }

  } catch (error) {
    console.error(`❌ Error generating PDF for ${slug}:`, error.message);
    throw error;
  }
}

/**
 * Generate PDFs for all case studies
 */
async function generateAllPDFs() {
  try {
    // Get all case study files
    const casesDir = path.join(process.cwd(), 'src', 'content', 'cases');
    const caseFiles = fs.readdirSync(casesDir).filter(file => file.endsWith('.mdx'));
    
    console.log(`Found ${caseFiles.length} case studies`);

    for (const file of caseFiles) {
      const slug = path.basename(file, '.mdx');
      await generateCasePDF(slug);
    }

    console.log('🎉 All case study PDFs generated successfully!');
  } catch (error) {
    console.error('❌ Error generating PDFs:', error.message);
    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];
const slug = args[1];

if (command === 'all') {
  generateAllPDFs();
} else if (command === 'single' && slug) {
  generateCasePDF(slug);
} else {
  console.log(`
Usage:
  node scripts/generate-case-pdf.mjs all                    # Generate PDFs for all case studies
  node scripts/generate-case-pdf.mjs single <slug>          # Generate PDF for specific case study
  
Examples:
  node scripts/generate-case-pdf.mjs single sonic
  node scripts/generate-case-pdf.mjs all
  `);
}
