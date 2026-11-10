export function executePython(code, checks = [], onStart = () => {}, timeout = 20000, onPhase = () => {}) {
  return new Promise(resolve => {
    let worker, timer, done = false;
    const finish = result => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      worker?.terminate();
      resolve(result);
    };
    const arm = (ms, message) => {
      clearTimeout(timer);
      timer = setTimeout(() => finish({ok: false, error: {kind: 'Timeout', message}}), ms);
    };
    try {
      worker = new Worker(new URL('./runtime-worker.js', import.meta.url));
      worker.onmessage = ({data}) => {
        if (data.phase) {
          onPhase(data.phase);
          if (data.phase === 'running') arm(timeout, 'The code took too long; execution stopped. No assessment was recorded.');
          return;
        }
        finish(data);
      };
      worker.onerror = event => finish({ok: false, error: {kind: 'RuntimeLoadError', message: event.message || 'Unable to load Python.'}});
      arm(120000, 'Python loading timed out. Check your connection and retry. No assessment was recorded.');
      onStart(() => finish({ok: false, error: {kind: 'Stopped', message: 'Execution stopped. Your draft is preserved.'}}));
      if (!done) worker.postMessage({id: 1, code, checks});
    } catch (error) {
      finish({ok: false, error: {kind: 'RuntimeLoadError', message: String(error)}});
    }
  });
}
