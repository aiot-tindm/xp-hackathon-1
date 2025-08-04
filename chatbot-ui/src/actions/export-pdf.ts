import { toast } from 'src/components/snackbar';

export async function exportToPDF(type: string = 'all'): Promise<void> {
  try {
    const response = await fetch('http://localhost:3000/api/export/direct', {
      method: 'POST',
      headers: {
        'accept': 'application/pdf',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error('Failed to export PDF');
    }

    const pdfBlob = await response.blob();
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export-data-${type}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('PDF exported successfully');
  } catch (error) {
    console.error('Export PDF failed:', error);
    toast.error('Failed to export PDF');
    throw error;
  }
}
