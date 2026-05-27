
// Extracted Hide and Show functions outside of startCaptureSelection and ensureSideboard
let hideSideboardPanel, showSideboardPanel, expandSideboardPanel, collapseSideboardPanel;

function startCaptureSelection() {
    // Prevent multiple overlays at once.
    const existing = document.getElementById('__captureOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = '__captureOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '2147483647';
    // overlay.style.background = 'rgba(0,0,0,0.15)';
    overlay.style.cursor = 'crosshair';
    overlay.tabIndex = 0;

    const hint = document.createElement('div');
    hint.textContent = 'Drag to select. Drag inside to move. Enter to capture, Esc to cancel.';
    hint.style.position = 'fixed';
    hint.style.left = '14px';
    hint.style.top = '14px';
    hint.style.padding = '8px 10px';
    hint.style.background = 'rgba(0,0,0,0.65)';
    hint.style.color = '#fff';
    hint.style.borderRadius = '8px';
    hint.style.fontSize = '12px';
    hint.style.maxWidth = 'calc(100vw - 28px)';
    overlay.appendChild(hint);

    const rectEl = document.createElement('div');
    rectEl.style.position = 'fixed';
    rectEl.style.border = '2px solid #00aaff';
    // rectEl.style.background = 'rgba(0,170,255,0.12)';
    rectEl.style.boxSizing = 'border-box';
    rectEl.style.display = 'none';
    overlay.appendChild(rectEl);

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.textContent = 'Capture';
    confirmBtn.style.position = 'fixed';
    confirmBtn.style.right = '14px';
    confirmBtn.style.top = '14px';
    confirmBtn.style.zIndex = '2147483647';
    confirmBtn.style.background = '#00aaff';
    confirmBtn.style.color = '#fff';
    confirmBtn.style.border = '0';
    confirmBtn.style.borderRadius = '8px';
    confirmBtn.style.padding = '8px 12px';
    confirmBtn.style.cursor = 'pointer';
    confirmBtn.style.display = 'none';
    overlay.appendChild(confirmBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.position = 'fixed';
    cancelBtn.style.right = '14px';
    cancelBtn.style.top = '56px';
    cancelBtn.style.zIndex = '2147483647';
    cancelBtn.style.background = '#6c757d';
    cancelBtn.style.color = '#fff';
    cancelBtn.style.border = '0';
    cancelBtn.style.borderRadius = '8px';
    cancelBtn.style.padding = '8px 12px';
    cancelBtn.style.cursor = 'pointer';
    overlay.appendChild(cancelBtn);

    document.body.appendChild(overlay);
    overlay.focus();

    // Debug capture selection sizing issues (rect staying at 1x1).
    const DEBUG_CAPTURE = true;
    if (DEBUG_CAPTURE) {
        console.log('[capture] viewport', { innerWidth: window.innerWidth, innerHeight: window.innerHeight, devicePixelRatio: window.devicePixelRatio });
    }

    const viewport = () => ({
        w: window.innerWidth,
        h: window.innerHeight
    });

    const clampRectToViewport = (r) => {
        const v = viewport();
        const x = Math.max(0, Math.min(r.x, v.w - 1));
        const y = Math.max(0, Math.min(r.y, v.h - 1));
        const w = Math.max(1, Math.min(r.width, v.w - x));
        const h = Math.max(1, Math.min(r.height, v.h - y));
        return { x, y, width: w, height: h };
    };

    const setRectUI = (r) => {
        const rect = clampRectToViewport(r);
        rectEl.style.left = rect.x + 'px';
        rectEl.style.top = rect.y + 'px';
        rectEl.style.width = rect.width + 'px';
        rectEl.style.height = rect.height + 'px';
        rectEl.style.display = 'block';
        // Hide confirm while the user is actively dragging/resizing.
        // It will be re-shown on `mouseup` once the rect is finalized.
        confirmBtn.style.display = 'none';
        return rect;
    };

    const isNearBottomRight = (clientX, clientY, r) => {
        const handleSize = 12; // px
        const brX = r.x + r.width;
        const brY = r.y + r.height;
        return Math.abs(clientX - brX) <= handleSize && Math.abs(clientY - brY) <= handleSize;
    };

    const isPointInsideRect = (clientX, clientY, r) => {
        return (
            clientX >= r.x &&
            clientX <= r.x + r.width &&
            clientY >= r.y &&
            clientY <= r.y + r.height
        );
    };

    let rect = null; // {x,y,width,height} in CSS pixels
    let mode = null; // 'draw' | 'move' | 'resize'
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;

    const cleanup = () => {
        const el = document.getElementById('__captureOverlay');
        if (el) el.remove();
    };

    const cleanupRectUI = () => {
        if (rectEl) rectEl.style.display = 'none';
    };

    // This function receives a canvas and returns a promise of its PNG base64 (without the data URL prefix)
    function getCanvasBase64Strict(canvas) {
        return new Promise((resolve, reject) => {
            try {
                canvas.toBlob(function (blob) {
                    if (!blob) return reject(new Error('Failed to get canvas blob'));
                    const reader = new FileReader();
                    reader.onloadend = function () {
                        const result = reader.result || '';
                        console.log('Canvas to base64:', { canvas, readerResult: reader.result });
                        // Should be "data:image/png;base64,...."
                        if (!result.startsWith('data:image/png;base64,')) {
                            return reject(new Error('Canvas did not produce PNG data URL'));
                        }
                        resolve(result.substring('data:image/png;base64,'.length));
                    };
                    reader.readAsDataURL(blob);
                }, 'image/png');
            } catch (err) {
                reject(err);
            }
        });
    }

    const captureAndPreview = async () => {
        firstTokenTime = 0;
        callTime = Date.now();
        
        if (mode) {
            console.warn('captureAndPreview ignored: selection interaction still in progress:', mode);
            return;
        }
        if (!rect || rect.width < 1 || rect.height < 1) return;
        if (rect.width === 1 && rect.height === 1) {
            console.warn('captureAndPreview aborted: selection is 1x1. Drag to select a larger area.');
            return;
        }

        cleanupRectUI();
        try {
            // Step 1: Capture the full visible tab as a data URL
            const data = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE_TAB' }, (res) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    if (!res || res.error) return reject(new Error(res?.error || 'Capture failed'));
                    resolve(res);
                });
            });

            const dataUrl = data.dataUrl;
            const img = new window.Image();
            img.src = dataUrl;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            // Step 2: Draw captured image on a canvas, crop to user selection

            // --- Improved handling: use window.devicePixelRatio to convert CSS pixels to device pixels ---
            const canvas = document.createElement('canvas');
            const dpr = window.devicePixelRatio || 1;

            // Map CSS pixel coords (rect) to captured image pixels.
            // `img.naturalWidth/Height` are in device pixels; `window.innerWidth/Height` are in CSS pixels.
            const scaleX = img.naturalWidth / window.innerWidth;
            const scaleY = img.naturalHeight / window.innerHeight;

            // Compute selection in *image* coordinates (device pixels)
            const sx = rect.x * scaleX;
            const sy = rect.y * scaleY;
            const sw = rect.width * scaleX;
            const sh = rect.height * scaleY;

            // Reduce the canvas size by half
            reduceFactor = 1;
            const size = sw*sh;
            if (size > 3000000) {
                reduceFactor = 5;
            } else if (size > 1500000) {
                reduceFactor = 4;
            } else if (size > 800000) {
                reduceFactor = 3;
            } else if (size > 200000) {
                reduceFactor = 2;
            }
            console.log('size:', size); 
            console.log('reduceFactor:', reduceFactor);
            canvas.width = Math.max(1, Math.round(sw / reduceFactor));
            canvas.height = Math.max(1, Math.round(sh / reduceFactor));

            const ctx = canvas.getContext('2d');
            ctx.drawImage(
                img,
                sx, sy, sw, sh, // source rect in image coordinates
                0, 0, canvas.width, canvas.height // dest rect (now half size) // 
            );

// base64 length: 134124 | first token time: 4787ms
// base64 length: 553508 | first token time: 8720ms
// base64 length: 1966488 | first token time: 13521ms (reduceFactor = 2)
// base64 length: 7311860 | first token time: 33725ms (reduceFactor = 1)
// base64 length: 1004428 | first token time: 7388ms (reduceFactor = 3)
// base64 length: 396984 | first token time: 5438ms (reduceFactor = 5)
            // Extract its base64 using getCanvasBase64Strict so it matches the visible cropped area
            // const croppedDataUrl = canvas.toDataURL('image/png');
            const base64 = await getCanvasBase64Strict(canvas);

            // Store cropping metadata in both CSS and device pixels
            const croppedMeta = {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                deviceX: Math.round(sx),
                deviceY: Math.round(sy),
                deviceWidth: canvas.width,
                deviceHeight: canvas.height,
                devicePixelRatio: dpr,
                base64: base64 // This is strictly the cropped image base64
            };
            console.log('croppedMeta:', croppedMeta);

            const promptContent = document.getElementById('promt-content')?.value || '';
            callDescribeImage(base64, promptContent);

       

        } catch (e) {
            console.error('Capture failed:', e);
            // Quick feedback on failure.
            try {
                chrome.storage.local.set({ lastCaptureDataUrl: null, lastCaptureMeta: null });
            } catch (err) { }
        }
        cleanup();
    };

    overlay.addEventListener('keydown', (e) => {
        if (DEBUG_CAPTURE) {
            console.log('[capture] overlay keydown', e.key, { mode, rect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null });
        }
        if (e.key === 'Escape') {
            cleanup();
        } else if (e.key === 'Enter') {
            captureAndPreview();
        }
    });

    cancelBtn.addEventListener('click', cleanup);
    confirmBtn.addEventListener('click', () => {
        console.log('[capture] confirmBtn clicked', { mode, rect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null });
        captureAndPreview();
    });

    overlay.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();

        // Do NOT start a new selection when clicking the control buttons.
        if (e.target === confirmBtn || e.target === cancelBtn) {
            if (DEBUG_CAPTURE) {
                console.log('[capture] mousedown on control button ignored');
            }
            return;
        }

        const clientX = e.clientX;
        const clientY = e.clientY;

        if (rect && isPointInsideRect(clientX, clientY, rect)) {
            if (isNearBottomRight(clientX, clientY, rect)) {
                mode = 'resize';
            } else {
                mode = 'move';
            }
            startX = clientX;
            startY = clientY;
            lastX = clientX;
            lastY = clientY;
            return;
        }

        mode = 'draw';
        startX = clientX;
        startY = clientY;
        lastX = clientX;
        lastY = clientY;
        if (DEBUG_CAPTURE) {
            console.log('[capture] mousedown draw start', { clientX: startX, clientY: startY });
        }
        rect = setRectUI({ x: startX, y: startY, width: 1, height: 1 });
    });

    overlay.addEventListener('mousemove', (e) => {
        if (!mode) return;
        const clientX = e.clientX;
        const clientY = e.clientY;

        if (mode === 'draw') {
            const x = Math.min(startX, clientX);
            const y = Math.min(startY, clientY);
            const width = Math.abs(clientX - startX);
            const height = Math.abs(clientY - startY);
            if (DEBUG_CAPTURE && (width !== rect?.width || height !== rect?.height)) {
                console.log('[capture] mousemove draw', { clientX, clientY, rectX: x, rectY: y, width, height });
            }
            rect = setRectUI({ x, y, width, height });
        } else if (mode === 'move' && rect) {
            const dx = clientX - lastX;
            const dy = clientY - lastY;
            lastX = clientX;
            lastY = clientY;
            rect = setRectUI({ x: rect.x + dx, y: rect.y + dy, width: rect.width, height: rect.height });
        } else if (mode === 'resize' && rect) {
            const dx = clientX - lastX;
            const dy = clientY - lastY;
            lastX = clientX;
            lastY = clientY;
            rect = setRectUI({
                x: rect.x,
                y: rect.y,
                width: rect.width + dx,
                height: rect.height + dy
            });
        }
    });

    overlay.addEventListener('mouseup', () => {
        // Finalize the selection rect; only then allow capture.
        mode = null;
        if (DEBUG_CAPTURE) {
            console.log('[capture] mouseup finalize', {
                x: rect?.x,
                y: rect?.y,
                width: rect?.width,
                height: rect?.height
            });
        }
        if (rect && rect.width >= 1 && rect.height >= 1) {
            confirmBtn.style.display = 'block';
            captureAndPreview();
        }
    });
}

const describeImageContent = 'Describe what you see in the image like casual conversation in 50 words.';

async function callDescribeImage(base64Image, content) {
    content = (typeof content === 'string' && content.trim() !== '') ? content : describeImageContent;
    await ensureSideboard();
    const imgEl = document.getElementById(SIDEBOARD_ID + 'Img');
    const metaEl = document.getElementById(SIDEBOARD_ID +'Meta');
    const textEl = document.getElementById(SIDEBOARD_ID +'Text');

    if (!base64Image) {
        console.warn('callDescribeImage(): base64Image is empty; aborting describeImage call.');
        return;
    }

    // Update side board UI for this request.
    try {
        if (imgEl) imgEl.src = `data:image/png;base64,${base64Image}`;
        if (metaEl)
            metaEl.innerHTML = `base64 length: ${base64Image.length} ` + loadingIcon;
       
        if (textEl) textEl.textContent = '';
    } catch (e) {
        console.warn('Failed to render base64 image in sideboard:', e);
    }

    createImageDisplayHalfScreenLeft();
    updateImageDisplayHalfScreenLeft(base64Image);
    describeImage(base64Image, content, MODEL_NAME_DEFAULT)
        .then(result => {
            console.log('describeImage resolved, model:', result.modelName);
            return result.stream({
                onToken: (token, accumulated, meta) => {
                    if (firstTokenTime === 0) {
                        firstTokenTime = Date.now();
                        firstTokenTime = Date.now() - callTime;
                        metaEl.textContent =
                            `base64 length: ${base64Image.length} | ` +
                            `first token time: ${firstTokenTime}ms | reduceFactor: ${reduceFactor}`;
                    }
                    console.log('onToken:', { token, accumulated, meta });
                    if (textEl) textEl.innerHTML = markdownToHtml(accumulated ?? '', true);
                    // INSERT_YOUR_CODE
                    // If meta and meta.usage exists, display duration and token count in the meta sideboard element
                    

                    if (meta && meta.usage && meta.usage.total_duration !== undefined) {
                        // Duration may be in nanoseconds, so convert to ms 
                        const durationMs = Math.round((meta.usage.total_duration ?? 0) / 1e9);
                        const load_duration = Math.round(meta.usage.load_duration/ 1e9) ?? 0;
                        const eval_duration = Math.round(meta.usage.eval_duration/ 1e9) ?? 0;
                        const promptTokens = meta.usage.prompt_eval_count ?? meta.usage.prompt_tokens ?? 0;
                        const completionTokens = meta.usage.eval_count ?? meta.usage.completion_tokens ?? 0;
                        const totalTokens = meta.usage.total_tokens ?? (promptTokens + completionTokens);

                        if (metaEl) {
                            metaEl.textContent =
                                `base64 length: ${base64Image.length} | first token time: ${firstTokenTime}ms | reduceFactor: ${reduceFactor} | ` +
                                `duration: ${durationMs}s (load: ${load_duration}s, eval: ${eval_duration}s) | ` +
                                `tokens: ${totalTokens} (prompt_eval_count: ${promptTokens}, eval_count: ${completionTokens})`;
                        }
                    }
                    return accumulated;
                },
                onThinking: (token, accumulated) => {
                    console.debug('[thinking]', token);
                    if (textEl) textEl.innerHTML = markdownToHtml(accumulated ?? '', true);
                }
            });
        })
        .catch(err => {
            console.error('describeImage error:', err);
            return Promise.reject(err);
        });
}
let firstTokenTime = 0;
let callTime = 0;
let reduceFactor = 1;
const SIDEBOARD_ID = '__describeImageSideboard';
const SIDEBOARD_ANIMATION_DURATION = 0;
let sideboardHtmlPromise = null;

function loadSideboardHtml() {
    if (!sideboardHtmlPromise) {
        sideboardHtmlPromise = fetch(chrome.runtime.getURL('sideboard.html'))
            .then((r) => r.text())
            .catch((err) => {
                console.warn('Failed to load sideboard.html:', err);
                return '';
            });
    }
    return sideboardHtmlPromise;
}

// Preload markup so the first capture does not wait on fetch.
loadSideboardHtml();

function ensureSideboardStyles() {
    if (document.getElementById('__sideboard_css')) return;
    const link = document.createElement('link');
    link.id = '__sideboard_css';
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('resources/sideboard.css');
    document.head.appendChild(link);
}

function wireSideboard(el) {
    const showBtn = document.getElementById('__sideboardShowBtn');
    const hideBtn = document.getElementById('__sideboardHideBtn');
    const captureBtn = document.getElementById('__sideboardCaptureBtn');

    hideSideboardPanel = function () {
        if (!el) return;
        el.classList.remove('sideboard-show');
        el.classList.add('sideboard-hide');
        setTimeout(() => {
            el.style.display = 'none';
            if (showBtn) showBtn.classList.remove('sideboardShowBtn-hidden');
        }, SIDEBOARD_ANIMATION_DURATION);
    };

    showSideboardPanel = function () {
        if (!el) return;
        el.style.display = '';
        void el.offsetWidth;
        el.classList.remove('sideboard-hide');
        el.classList.add('sideboard-show');
        if (showBtn) showBtn.classList.add('sideboardShowBtn-hidden');
    };

    expandSideboardPanel = function () {
        if (!el) return;
        el.classList.add('halfscreen');
    };

    collapseSideboardPanel = function () {
        if (!el) return;
        el.classList.remove('halfscreen');
    };

    if (hideBtn) hideBtn.addEventListener('click', hideSideboardPanel);
    if (showBtn) showBtn.onclick = showSideboardPanel;
    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            if (typeof startCaptureSelection === 'function') startCaptureSelection();
            if (typeof hideSideboardPanel === 'function') hideSideboardPanel();
            if (typeof hideImageDisplayHalfScreenLeft === 'function') hideImageDisplayHalfScreenLeft();
        });
    }

    window.hideSideboardPanel = hideSideboardPanel;
    window.showSideboardPanel = showSideboardPanel;

    el.addEventListener('transitionend', function (e) {
        if (
            el.classList.contains('sideboard-hide') &&
            (e.propertyName === 'transform' || e.propertyName === 'opacity')
        ) {
            el.style.display = 'none';
        }
    });
}

async function ensureSideboard() {
    let el = document.getElementById(SIDEBOARD_ID);

    if (el) {
        el.classList.remove('sideboard-hide');
        void el.offsetWidth;
        el.classList.add('sideboard-show');
        const showBtn = document.getElementById('__sideboardShowBtn');
        if (showBtn) showBtn.classList.add('sideboardShowBtn-hidden');
        el.style.display = '';
        return el;
    }

    ensureSideboardStyles();
    const html = await loadSideboardHtml();
    if (!html) {
        console.error('Sideboard HTML not available');
        return null;
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    while (wrapper.firstChild) {
        document.body.appendChild(wrapper.firstChild);
    }

    el = document.getElementById(SIDEBOARD_ID);
    if (!el) {
        console.error('Sideboard panel element missing after HTML injection');
        return null;
    }

    wireSideboard(el);
    el.classList.add('sideboard-show');
    return el;
}

function isSideboardVisible() {
    let el = document.getElementById(SIDEBOARD_ID);
    return el && el.style.display !== 'none';
}

function isSideboardExpanded() {
    let el = document.getElementById(SIDEBOARD_ID);
    return el && el.classList.contains('halfscreen');
}
// Adds a function to show an "image display" half screen on the left.

// Left Panel constants and setup (styles added once)
const LEFT_IMAGE_PANEL_ID = '__leftHalfScreenImagePanel';

(function setupLeftImagePanelStyles() {
    if (!document.getElementById('__leftHalfScreenImagePanel_style')) {
        const style = document.createElement('style');
        style.id = '__leftHalfScreenImagePanel_style';
        style.textContent = `
            #${LEFT_IMAGE_PANEL_ID} {
                position: fixed;
                left: 0;
                top: 0;
                width: 40vw;
                background: rgba(250,250,250,0.97);
                z-index: 9995;
                box-shadow: 2px 0 18px rgba(0,0,0,0.09);
                display: none;
                flex-direction: column;
                align-items: center;
                padding: 20px 12px 14px 12px;
                gap: 18px;
                border-radius: 8px;
                transition: transform 350ms cubic-bezier(.3,1.2,.4,1),
                            opacity 350ms cubic-bezier(.3,1.2,.4,1);
                transform: translateX(-100%);
                opacity: 0;
            }
            #${LEFT_IMAGE_PANEL_ID}.show {
                display: flex;
                transform: translateX(0%);
                opacity: 1;
            }
            #${LEFT_IMAGE_PANEL_ID} .image-panel-header {
                font-size: 1.05rem;
                font-weight: bold;
                margin-bottom: 6px;
                color: #232323;
                text-align: left;
                width: 100%;
            }
            #${LEFT_IMAGE_PANEL_ID} img {
                max-width: 100%;
                max-height: 80vh;
                border-radius: 8px;
                box-shadow: 0 2px 12px #0002;
            }
            #${LEFT_IMAGE_PANEL_ID} .close-btn {
                position: absolute;
                right: 18px;
                top: 14px;
                background: #e44;
                color: #fff;
                border: none;
                border-radius: 7px;
                cursor: pointer;
                font-weight: bold;
                font-size: 1.07rem;
                z-index: 1;
                transition: background 0.18s;
            }
            #${LEFT_IMAGE_PANEL_ID} .close-btn:hover {
                background: #b11;
            }
        `;
        document.head.appendChild(style);
    }
})();

// Create (once, hidden by default) left panel DOM node
function createImageDisplayHalfScreenLeft() {
    let panel = document.getElementById(LEFT_IMAGE_PANEL_ID);
    if (panel)  {  // already exists
        return panel;
     }
    
    panel = document.createElement('div');
    panel.id = LEFT_IMAGE_PANEL_ID;
    panel.style.display = 'none';

    // Header, image, closeBtn elements (populated later by show function)
    const header = document.createElement('div');
    header.className = 'image-panel-header';
    panel.appendChild(header);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => {
        panel.classList.remove('show');
        setTimeout(() => {
            panel.style.display = 'none';
            panel.tabIndex = -1;
        }, 350);
    };
    panel.appendChild(closeBtn);

    const img = document.createElement('img');
    img.id = LEFT_IMAGE_PANEL_ID + 'Img';
    panel.appendChild(img);

    // Remove panel from view on Escape
    function onEsc(e) {
        if (e.key === 'Escape') closeBtn.click();
    }
    panel.addEventListener('keydown', onEsc);

    panel.tabIndex = -1;
    document.body.appendChild(panel);

    return panel;
}

function updateImageDisplayHalfScreenLeft(base64Image) {
    const img = document.getElementById(LEFT_IMAGE_PANEL_ID + 'Img');
    if (img) {
        img.src = base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`;
        img.alt = "Image Preview";
    }
}


// API: Show the image preview in the left halfscreen panel
function showImageDisplayHalfScreenLeft() {
    // Either create or reuse the same panel
    let panel = document.getElementById(LEFT_IMAGE_PANEL_ID);
    if (!panel) panel = createImageDisplayHalfScreenLeft();

    // Reset panel position and display
    panel.style.display = 'flex';
    const imgEl = document.getElementById(SIDEBOARD_ID + 'Img');    
    imgEl.style.display = 'none';
    setTimeout(() => {
        panel.classList.add('show');
        panel.tabIndex = 0;
        panel.focus();
    }, 5);
}

function hideImageDisplayHalfScreenLeft() {
    let panel = document.getElementById(LEFT_IMAGE_PANEL_ID);
    if (panel) {
        panel.classList.remove('show');
        const imgEl = document.getElementById(SIDEBOARD_ID + 'Img');    
        imgEl.style.display = '';
        setTimeout(() => {
            panel.style.display = 'none';
            panel.tabIndex = -1;
        }, 350);
    }
}

function isImageDisplayHalfScreenLeftVisible() {
    let panel = document.getElementById(LEFT_IMAGE_PANEL_ID);
    return panel && panel.style.display === 'flex';
}
