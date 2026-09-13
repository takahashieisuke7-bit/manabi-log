// Apply the saved preference before the first paint. No study-data keys are touched.
(() => {
  let theme = 'dark';
  try {
    if (localStorage.getItem('study-theme-v1') === 'light') theme = 'light';
  } catch { /* The default theme remains usable when storage is unavailable. */ }
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#101113' : '#f5f5f7';
})();
