/* Disposable educational worker, not a security boundary for hostile code. */
const RUNTIME = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
const HARNESS = `
import io as _io, contextlib as _contextlib, traceback as _traceback, json as _json

def _assess(payload):
    request = _json.loads(payload)
    namespace = {'__name__': '__main__'}
    class LimitedOutput(_io.StringIO):
        def write(self, value):
            remaining = max(0, 9000 - self.tell())
            super().write(value[:remaining])
            return len(value)
    output = LimitedOutput()
    results, images, error = [], [], None
    with _contextlib.redirect_stdout(output), _contextlib.redirect_stderr(output):
        try:
            exec(compile(request['code'], '<learner>', 'exec'), namespace)
        except BaseException as exc:
            error = {'kind': type(exc).__name__, 'message': str(exc), 'trace': _traceback.format_exc(limit=5)}
        if error is None:
            for check in request['checks']:
                try:
                    value = eval(check['expression'], namespace)
                    results.append({'name': check['name'], 'pass': bool(value == check['expected']), 'got': repr(value)[:220], 'expected': repr(check['expected'])[:220]})
                except BaseException as exc:
                    results.append({'name': check['name'], 'pass': False, 'error': type(exc).__name__ + ': ' + str(exc)})
        import sys
        if 'matplotlib.pyplot' in sys.modules:
            import matplotlib.pyplot as plt, base64
            for number in plt.get_fignums()[:3]:
                buffer = _io.BytesIO()
                plt.figure(number).savefig(buffer, format='png', dpi=100, bbox_inches='tight')
                images.append(base64.b64encode(buffer.getvalue()).decode('ascii'))
            plt.close('all')
    return _json.dumps({'output': output.getvalue(), 'error': error, 'checks': results, 'images': images})
_assess(_request_payload)
`;
self.onmessage = async ({data: {code, checks = [], id}}) => {
  try {
    self.postMessage({id, phase: 'loading'});
    importScripts(RUNTIME + 'pyodide.js');
    const py = await loadPyodide({indexURL: RUNTIME});
    // Syntax errors belong to learner feedback, not runtime availability errors.
    try { await py.loadPackagesFromImports(code); }
    catch (error) { if (!String(error).includes('SyntaxError')) throw error; }
    if (py.loadedPackages.matplotlib) py.runPython("import matplotlib; matplotlib.use('agg')");
    self.postMessage({id, phase: 'running'});
    py.globals.set('_request_payload', JSON.stringify({code, checks}));
    const result = await py.runPythonAsync(HARNESS);
    self.postMessage({id, ok: true, ...JSON.parse(result)});
  } catch (error) {
    self.postMessage({id, ok: false, error: {kind: 'RuntimeLoadError', message: 'Python or a required package could not load. Check your connection and retry. ' + String(error)}});
  }
};
