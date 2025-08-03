// utils/chartGeneratorLocal.ts
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const scale = 2; // scale factor để tăng chất lượng hình ảnh
const width = 800 * scale;
const height = 400 * scale;

const chartCallback = (ChartJS: any) => {
  ChartJS.defaults.font.family = 'Arial';
  ChartJS.defaults.font.size = 14 * scale;
  ChartJS.defaults.color = '#2c3e50';

  ChartJS.defaults.plugins.title.font = {
    size: 18 * scale,
    weight: 'bold',
  };
};

const canvasRenderService = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour: 'white',
  chartCallback
});

export class ChartGenerator {
  static async getBarChartBuffer(labels: string[], data: number[], title: string): Promise<Buffer> {
    return canvasRenderService.renderToBuffer({
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: title,
          data,
          backgroundColor: 'rgba(52, 152, 219, 0.8)',
          borderColor: '#2980b9',
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: title,
            padding: { top: 10 * scale, bottom: 20 * scale }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 20, font: { size: 12 * scale } },
            grid: { color: '#ecf0f1' }
          },
          x: {
            ticks: { font: { size: 12 * scale }, maxRotation: 45, minRotation: 30 },
            grid: { display: false }
          }
        }
      }
    });
  }

  static async getHorizontalBarChartBuffer(labels: string[], data: number[], title: string): Promise<Buffer> {
    return canvasRenderService.renderToBuffer({
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: title,
          data,
          backgroundColor: 'rgba(231, 76, 60, 0.8)',
          borderColor: '#c0392b',
          borderWidth: 1,
          maxBarThickness: 30 * scale
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: title,
            padding: { top: 10 * scale, bottom: 20 * scale }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#bdc3c7' }
          },
          y: {
            ticks: { font: { size: 12 * scale } },
            grid: { display: false }
          }
        }
      }
    });
  }

  static async getLineChartBuffer(labels: string[], data: number[], title: string): Promise<Buffer> {
    return canvasRenderService.renderToBuffer({
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: title,
          data,
          fill: false,
          borderColor: '#2ecc71',
          backgroundColor: '#2ecc71',
          tension: 0.3,
          pointBackgroundColor: '#27ae60',
          pointRadius: 4 * scale
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            padding: { top: 10 * scale, bottom: 20 * scale }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { font: { size: 12 * scale } },
            grid: { color: '#ecf0f1' }
          },
          x: {
            ticks: { font: { size: 12 * scale } },
            grid: { display: false }
          }
        }
      }
    });
  }

  static async getPieChartBuffer(labels: string[], data: number[], title: string): Promise<Buffer> {
    return canvasRenderService.renderToBuffer({
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: title,
          data,
          backgroundColor: [
            '#1abc9c', '#2ecc71', '#3498db', '#9b59b6',
            '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6'
          ],
          borderColor: '#ffffff',
          borderWidth: 2 * scale
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            padding: { top: 10 * scale, bottom: 20 * scale }
          },
          legend: {
            position: 'right',
            labels: {
              font: { size: 12 * scale },
              color: '#2c3e50'
            }
          }
        }
      }
    });
  }
}
