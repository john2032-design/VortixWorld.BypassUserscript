const TOAST_CONTAINER_CSS = `
  #vwToastContainer {
    position: fixed !important; top: calc(72px + 12px) !important; right: calc(14px + env(safe-area-inset-right)) !important;
    padding: 0 !important; display: flex !important; flex-direction: column !important; align-items: flex-end !important;
    gap: 10px !important; z-index: 2147483649 !important; pointer-events: none !important; box-sizing: border-box !important;
    max-width: calc(100vw - 28px) !important;
  }
  .vw-toast {
    padding: 10px 18px !important; border-radius: 40px !important; background: #1e1e1e !important;
    box-shadow: 6px 6px 12px #141414, -6px -6px 12px #282828 !important; color: #e0e0e0 !important;
    font-weight: 700 !important; font-size: 13px !important; animation: vw-toast-in 0.22s ease-out !important;
    pointer-events: none !important; font-family: inherit !important; word-break: break-word !important;
    border-left: 4px solid #16a34a !important; max-width: 100% !important;
  }
  .vw-toast-content { display: flex !important; align-items: center !important; gap: 8px !important; white-space: normal !important; }
  .vw-toast-emoji { display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 24px !important; height: 24px !important; background: transparent !important; font-size: 16px !important; flex: 0 0 auto !important; }
  .vw-toast-text { color: #e0e0e0 !important; font-weight: 700 !important; line-height: 1.25 !important; }
  .vw-toast-progress { height: 3px !important; background: #141414 !important; width: 100% !important; animation: vw-toast-progress 5s linear forwards !important; margin-top: 8px !important; border-radius: 999px !important; box-shadow: inset 1px 1px 2px #0a0a0a; }
  @keyframes vw-toast-progress { from { width: 100%; } to { width: 0%; } }
  @keyframes vw-toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 768px) { #vwToastContainer { top: calc(60px + 12px) !important; } }
`;

function ensureToastContainer() {
  let container = document.getElementById('vwToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'vwToastContainer';
    const styleId = 'vwToastStyles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = TOAST_CONTAINER_CSS;
      (document.head || document.documentElement).appendChild(style);
    }
    (document.body || document.documentElement).appendChild(container);
  }
  return container;
}

function showToast(message, isError = false, emoji = null) {
  if (window.top !== window.self) return;

  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = 'vw-toast';
  if (isError) toast.style.borderLeftColor = '#b91c1c';
  const emojiChar = emoji || (isError ? '⚠️' : '✓');
  toast.innerHTML = `
    <div class="vw-toast-content">
      <span class="vw-toast-emoji">${emojiChar}</span>
      <span class="vw-toast-text">${message}</span>
    </div>
    <div class="vw-toast-progress"></div>
  `;
  container.appendChild(toast);
  const progressBar = toast.querySelector('.vw-toast-progress');
  progressBar.style.animation = 'vw-toast-progress 5s linear forwards';
  const removeToast = () => { if (toast && toast.remove) toast.remove(); };
  const timeoutId = setTimeout(removeToast, 5000);
  progressBar.addEventListener('animationend', () => {
    clearTimeout(timeoutId);
    removeToast();
  });
}

window.showToast = showToast;