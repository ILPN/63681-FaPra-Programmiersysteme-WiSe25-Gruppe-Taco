export abstract class SavingService {
    protected triggerDownload(content: string, fileName: string): void {
        const fileType = fileName.endsWith('.pnml') ? 'application/xml' : 'application/json';
        const blob = new Blob([content], { type: fileType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}
