interface PrintElementOptions {
  documentTitle?: string;
}

const cleanupIframe = (iframe: HTMLIFrameElement) => {
  if (iframe.parentNode) {
    iframe.parentNode.removeChild(iframe);
  }
};

const copyDocumentStyles = (targetDocument: Document) => {
  Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).forEach((node) => {
    targetDocument.head.appendChild(node.cloneNode(true));
  });
};

export const printElement = (element: HTMLElement | null, options: PrintElementOptions = {}) => {
  if (!element) {
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const printWindow = iframe.contentWindow;
  if (!printWindow) {
    cleanupIframe(iframe);
    return;
  }

  const printDocument = printWindow.document;
  printDocument.open();
  printDocument.write('<!DOCTYPE html><html><head></head><body></body></html>');
  printDocument.close();

  if (options.documentTitle) {
    printDocument.title = options.documentTitle;
  }

  copyDocumentStyles(printDocument);
  printDocument.body.appendChild(element.cloneNode(true));

  const cleanup = () => cleanupIframe(iframe);

  printWindow.onafterprint = cleanup;
  window.setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    window.setTimeout(cleanup, 1000);
  }, 50);
};
