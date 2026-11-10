# Verification — November 10, 2026

## Environment

- macOS ARM64; system Python 3.9.6.
- Node.js 22.16.0 and npm 10.9.2 installed in an isolated workspace directory because neither was on the original shell PATH.
- Vite 6.4.6 and the official `@playwright/test` 1.65.0 runner installed with a committed dependency lockfile.
- Playwright Chromium 158 installed separately; the VS Code extension was not treated as a browser/runtime installation.
- Local Vite preview server and real Chromium successfully ran the production build.

## Completed checks

- Nine Node unit/content tests passed: 24 course session references, lesson/transfer structure, disclosures, backup validation, assistance tracking, prevention of repeated mastery inflation, malformed nested backups, and guest persistence.
- Production build passed. Worker, data CSV, dictionary, and external notebooks are included in `dist` with relative asset paths.
- Full first browser suite: **23 passed**, no skips, in approximately 4.6 minutes.
- All **16 coding activities** passed real Pyodide initial and fresh transfer checks, including pandas, matplotlib figures, and scikit-learn regression. These checks used browser WebAssembly Python, not CPython substitution or mocked execution.
- All **20 interpretation activities** passed initial and fresh transfer flows.
- Browser tests passed syntax and runtime error reporting, hard-coded wrong-answer rejection, an alternate valid loop implementation, Unicode, learner names overlapping harness names, stop, actual infinite-loop timeout, recovery, and clean state across runs.
- Browser tests passed assistance tracking after wrong transfer answers, guest persistence across switching, saved drafts, journal/export/import, course maps, public downloads, and a 390-pixel mobile viewport without page overflow.
- Desktop screenshots inspected; code editor contrast and layout were corrected. Native keyboard controls, skip link, and live feedback regions are present.

Final-build regression checks passed: blocked-runtime handling, navigation cancellation, corrected worked-solution availability after three attempts, assistance retention, changed reference inputs, import/export, and mobile layout. The three final affected tests passed in 35.7 seconds after fixing a redraw defect found by the new test. Across the suites, all 26 distinct browser tests passed; the original full run contained 23 and the three additions were checked separately.

CPython verification passed **33 reference behaviors for all 16 coding modules** using an isolated Python environment with pandas, matplotlib and scikit-learn. Initial missing-package and cloud-hydration failures were resolved before this result.

## Limits of this evidence

- Browser checks ran on Chromium on this Mac. Safari, Firefox, real mobile hardware, full screen-reader audit and WCAG conformance are not certified.
- Runtime requires access to the pinned jsDelivr Pyodide distribution. A blocked network must report unavailable rather than record a learner failure. Offline operation is not guaranteed.
- Educational behavioral tests are not a secure examination system, hostile-code isolation, proof of arbitrary program correctness, or a business judgment grade.
- Repeating this fixed bank cannot prove repeated independent mastery. Progress reports one independent demonstration per task version.
- Advanced topics remain interpretation exercises or external notebooks; external notebook execution is not counted as browser mastery.
- The supplied AGENTS.md is a personal coaching specification. Its pedagogical constraints informed this work; its entire Salesforce-oriented training program is not claimed as classroom-app coverage.
- The original classroom build brief and original instructor materials were not present in the supplied source folder. Existing README, curriculum and explicit user requirements were used; private syllabus details were not invented.
- Public hosting and GitHub Actions require a separate successful publish and clean-browser live smoke check. Local success alone is not a live deployment claim.
