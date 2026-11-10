# Python Flight School

A browser-based Python learning app for graduate Business Analytics students in K531 Data Mining and S575 Foundations of AI & Machine Learning. No account, personal API key, paid AI subscription, or local Python installation is required for learners.

Version 0.4.0 contains 36 activities: 16 executable coding/debugging labs and 20 interpretation activities, each with a distinct transfer task. It preserves the original 24 course-session mappings. New hands-on labs cover pandas aggregation, matplotlib visualization, and scikit-learn regression. The Python Sandbox supports free experimentation without awarding progress.

See [VERIFICATION.md](VERIFICATION.md) for actual test outcomes and [COVERAGE.md](COVERAGE.md) for scope and remaining curriculum limitations. The attached personal coaching guide informed instructional design; this classroom app does not claim to implement its entire personal Salesforce training program.

## Develop in VS Code

Install Node.js 22 or later with npm. The Python and Playwright VS Code extensions do not install these runtimes or Chromium. Open this project folder in VS Code, then run in its terminal:

```sh
node --version
npm --version
python3 --version
npm ci
npx playwright install chromium
npm run dev
```

Open the localhost URL printed by Vite. Python 3 is optional for development utilities; browser code runs through Pyodide. The official Playwright extension discovers `playwright.config.js` and the tests under `tests/e2e` after dependencies are installed.

The development work in this delivery used a workspace-local Node/npm runtime. To reuse it on this Mac from this project directory:

```sh
export PATH="$(pwd)/../../work/node-v22.16.0-darwin-arm64/bin:$PATH"
export PLAYWRIGHT_BROWSERS_PATH="$(pwd)/../../work/playwright-browsers"
```

For regular use, install Node on your normal shell PATH. The portable runtime is outside the source archive and is not a learner requirement.

## Verify a release

```sh
npm test
npm run build
npm run test:e2e
# Or run all three:
npm run test:all
```

Playwright launches a production preview server on port 4173 and Chromium automatically. Real Pyodide/package downloads require access to `https://cdn.jsdelivr.net/pyodide/v0.27.7/full/`. Tests intentionally fail when execution is unavailable; runtime failures do not become fake passes. The first package download may take up to two minutes. Code execution has a separate 20–25-second limit. Use Stop to terminate the worker immediately.

`npm run preview -- --host 127.0.0.1` serves the built application. Do not open `index.html` via `file://`. See the HTML test report with `npx playwright show-report`.

## Publish

The `dist` folder is a complete static website. It includes course data and external notebooks. Host its contents on an HTTPS static host; there is no application backend or secret to configure. Relative asset paths support a GitHub Pages project subdirectory.

For GitHub Pages:

1. Put the source in your chosen repository, excluding node_modules, reports, and learner backups.
2. In Settings → Pages, choose **GitHub Actions** as the source.
3. Open Actions → **Deploy GitHub Pages** → **Run workflow**.
4. The workflow installs dependencies and Chromium, runs unit and browser tests, builds, and publishes `dist` only after success.
5. Open the resulting URL in a clean browser, run a lesson and transfer, check a chart, and export/import progress before sharing with classmates.

The separate Verify application workflow checks pushes and pull requests. Deployment runs on pushes to main and can also be manually triggered. The publishing destination is https://github.com/jhw-hub/KDK531_S575. See VERIFICATION.md for the verified deployment status.

## Learning and progress

Each activity follows micro-lesson → challenge → feedback → fresh transfer. Students must edit starter code before assessment. Behavioral checks accept different implementations that satisfy the specified contract. Hints mark assistance, and worked explanations become available after three initial attempts. Interpretation corrections also retain assistance history. Open-ended business reasoning is explicitly self-assessed.

Successful initial and transfer checks provide one independent demonstration. Replaying the same task does not produce repeated mastery; the current fixed challenge bank cannot establish that highest coaching category. The review queue is a reminder, not evidence of new assessment. Advanced topics remain short interpretation activities and external notebook practice.

## Runtime and privacy

Python executes in a fresh disposable worker on every run. The app loads supported packages from imports and displays up to three matplotlib figures. It captures limited stdout/stderr, reports syntax/runtime exceptions, tests logic, and terminates stopped or timed-out runs without grading them. Learner variable names are separated from harness variables to avoid accidental collisions.

This is an educational interpreter, not a hardened hostile-code sandbox or secure exam system. Only run trusted code; do not enter credentials or private class datasets. A fresh runtime means files and variables from the previous run are gone. Use `print(...)` for expression output; interactive `input()` is not supported.

Profiles, drafts, attempts and journals remain in localStorage unless exported. Profiles are not authenticated accounts. Guest profiles are excluded from persistence, including when switching back to another profile. Backup import validates structure and creates a new profile after preview. Browser storage can be cleared; export regularly. A backup contains private notes and submitted code. CDN and static-host providers receive ordinary network metadata. No AI provider is called.

## Architecture

- `src/curriculum.js`: lessons, checks, hints and course maps.
- `src/main.js`, `src/style.css`: interface, sandbox, feedback and profile flows.
- `src/runner.js`, `src/runtime-worker.js`: lifecycle, Pyodide, packages, execution and charts.
- `src/state.js`: profiles, backups, assistance and progress.
- `src/disclosures.js`: visible limitations and version.
- `data/`, `notebooks/`: original synthetic assets; `scripts/prepare-public.js` copies them before building.
- `tests/`: unit tests and official Playwright browser tests.

Original app content is MIT licensed; Pyodide and Python packages retain their own licenses. No university endorsement or official grading is claimed.

Implementation references: [Pyodide worker documentation](https://pyodide.org/en/0.27.7/usage/webworker.html), [Playwright test web servers](https://playwright.dev/docs/test-webserver).
