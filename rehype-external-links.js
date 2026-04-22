/**
 * Rehype plugin to add security attributes to external links
 * Automatically adds rel="noopener noreferrer" and target="_blank" to external links in MDX content
 */

export default function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      // Only process <a> tags
      if (node.tagName !== 'a') {
        return;
      }

      const href = node.properties?.href;

      // Skip if no href
      if (!href || typeof href !== 'string') {
        return;
      }

      // Check if it's an external link (starts with http:// or https://)
      const isExternal = href.startsWith('http://') || href.startsWith('https://');

      // Skip internal links
      if (!isExternal) {
        return;
      }

      // Skip if already has rel attribute with noopener
      const existingRel = node.properties?.rel;
      if (existingRel && (typeof existingRel === 'string' ? existingRel : existingRel.join(' ')).includes('noopener')) {
        return;
      }

      // Add security attributes
      node.properties = node.properties || {};
      node.properties.target = '_blank';
      node.properties.rel = ['noopener', 'noreferrer'];
    });
  };
}

// Helper function to visit nodes in the tree
function visit(node, type, visitor) {
  if (node.type === type) {
    visitor(node);
  }

  if (node.children) {
    for (const child of node.children) {
      visit(child, type, visitor);
    }
  }
}
