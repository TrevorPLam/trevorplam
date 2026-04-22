import type { ChartData } from './metrics';

export interface ChartContext {
  dataset: {
    label: string;
  };
  parsed: {
    y: number | null;
  };
}

export interface ChartInstance {
  canvas: HTMLCanvasElement;
}

export function generateDataTable(data: ChartData): string {
  const headers = data.labels.join(', ');
  const rows = data.datasets.map(dataset => 
    `${dataset.label}: ${dataset.data.join(', ')}`
  ).join(' | ');
  
  return `<table><caption>${headers}</caption><tbody><tr><td>${rows}</td></tr></tbody></table>`;
}

export function createTooltipLabel(context: ChartContext): string {
  let label = context.dataset.label || '';
  if (label) {
    label += ': ';
  }
  if (context.parsed.y !== null) {
    label += new Intl.NumberFormat('en-US').format(context.parsed.y);
  }
  return label;
}

export function formatTickValue(value: any): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function createAccessibilityPlugin(chartId: string, config: any) {
  return {
    id: 'accessibility',
    beforeDraw: (chart: ChartInstance) => {
      // Add ARIA attributes for screen readers
      const canvas = chart.canvas;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `${config.title} chart`);
      
      // Generate data table for screen readers
      const dataTable = generateDataTable(config.data);
      canvas.setAttribute('aria-describedby', `${chartId}-table`);
      
      // Create or update hidden data table
      let table = document.getElementById(`${chartId}-table`);
      if (!table) {
        table = document.createElement('div');
        table.id = `${chartId}-table`;
        table.className = 'sr-only';
        table.setAttribute('aria-hidden', 'true');
        canvas.parentNode?.insertBefore(table, canvas.nextSibling);
      }
      table.innerHTML = dataTable;
    }
  };
}
