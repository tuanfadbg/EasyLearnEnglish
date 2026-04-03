function renderPreview({ dataUrl, meta }) {
  const status = document.getElementById('status');
  const img = document.getElementById('captureImage');
  const openRawLink = document.getElementById('openRawLink');

  if (!dataUrl) {
    status.textContent = 'No capture found. Try capturing again.';
    return;
  }

  img.src = dataUrl;
  img.style.display = '';
  openRawLink.href = dataUrl;
  openRawLink.style.display = '';

  const dims = meta?.width && meta?.height ? ` (${meta.width} x ${meta.height})` : '';
  status.textContent = `Captured${dims}.`;
}

document.addEventListener('DOMContentLoaded', function () {
  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) closeBtn.addEventListener('click', () => window.close());

  chrome.storage.local.get(['lastCaptureDataUrl', 'lastCaptureMeta'], function (result) {
    renderPreview({ dataUrl: result.lastCaptureDataUrl, meta: result.lastCaptureMeta });
  });
});

