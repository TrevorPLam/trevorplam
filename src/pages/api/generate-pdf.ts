import type { APIRoute } from 'astro';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { slug } = await request.json();
    
    if (!slug || typeof slug !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Valid slug required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate slug contains only safe characters
    if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid slug format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if case study exists
    const caseStudyPath = path.join(process.cwd(), 'src', 'content', 'cases', `${slug}.mdx`);
    if (!fs.existsSync(caseStudyPath)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Case study not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if PDF already exists
    const pdfPath = path.join(process.cwd(), 'public', 'pdfs', `${slug}.pdf`);
    if (fs.existsSync(pdfPath)) {
      const stats = fs.statSync(pdfPath);
      const lastModified = new Date(stats.mtime);
      const caseModified = new Date(fs.statSync(caseStudyPath).mtime);
      
      // If PDF is newer than case study, return existing
      if (lastModified > caseModified) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'PDF already exists and is up to date',
            url: `/pdfs/${slug}.pdf`
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate PDF in background
    console.log(`Generating PDF for case study: ${slug}`);
    
    try {
      // Run PDF generation script
      const { execSync } = await import('child_process');
      execSync(`node scripts/generate-case-pdf.mjs single "${slug}"`, {
        cwd: process.cwd(),
        stdio: 'pipe',
        timeout: 120000 // 2 minutes timeout
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'PDF generated successfully',
          url: `/pdfs/${slug}.pdf`
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('PDF generation failed:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'PDF generation failed. Please try again.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
