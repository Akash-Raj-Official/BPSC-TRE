# BPSC TRE Mock Test Platform

A free, offline-friendly mock test platform for the **BPSC TRE Preliminary examination**, built as a
client-side React application. It reproduces the feel of a real computer-based test: a 120-minute
countdown, a question palette, bilingual question papers, the official-style marking scheme
(including negative marks for unanswered questions) and a detailed post-submission analysis.

No backend, no login, no sign-up. Everything runs in the browser and is stored in local storage.

> **About the questions.** Every question shipped with this project is *practice material written
> for this platform*, modelled on the pattern, difficulty and topic distribution of previous BPSC
> examinations (TRE 1/2/3 and the 67th–70th CCE). They are **not** verbatim reproductions of any
> official BPSC paper and are badged as practice questions throughout the UI. The `source` field on
> a question records the exam pattern it follows, not a claim of authorship by BPSC.

---

## Features

### Examination
- **Seven complete practice sets**, each a full 150-question paper — Paper I (30 language questions)
  plus Paper II (120 general studies questions across all seven subjects). All 1,050 questions are
  distinct: no question appears in more than one set.
- **Candidate name** entered before the paper starts and printed on the score card. No account
  required.
- **Five options per question** — A, B, C, D and a generated **E — "Not Known"**.
- **Exact marking scheme**, configurable in one file:

  | User action | Marks |
  | --- | ---: |
  | Correct A–D | **+1** |
  | Incorrect A–D | **−1/3** |
  | Option E (Not Known) | **0** |
  | Left unanswered | **−1/3** |

- **Unanswered ≠ Option E.** These are two distinct states throughout the whole application — in the
  store, in the palette, in the scoring engine and in the review screen.
- **Refresh-safe 120-minute timer** driven by a stored end timestamp rather than a tick counter, so
  refreshing, sleeping the device or switching tabs cannot add time.
- **Question order never changes on refresh.** Randomisation is off by default; when enabled, the
  shuffled order is generated once and persisted.
- **Question palette** with five visual states plus a legend, shown as a sidebar on desktop and a
  drawer on mobile.
- **Save & Next, Previous, Clear Response and Mark for Review**, with answered-and-marked supported
  as a combined state.
- **Two independent language switches** (हिन्दी / English):
  - **Site** — the website's own labels, navigation, buttons and instructions. Lives in the site
    header (and in the exam header, since the site header is hidden during an attempt). Defaults to
    English (`examConfig.defaultUiLanguage`).
  - **Paper** — the medium of the question stem, options and explanations. Chosen on the
    instructions page and switchable mid-attempt. Defaults to Hindi (`examConfig.defaultLanguage`).

  Changing one never changes the other, so an English interface over a Hindi paper (or the reverse)
  is a supported combination. Switching the paper language never touches your answer, position or
  clock.
- **Submit confirmation** listing answered / I-don't-know / unanswered / marked counts, with an
  explicit warning about the penalty for blank questions.
- **Automatic submission** when the timer reaches zero, plus 10-minute and 5-minute warnings.
- **Resume an unfinished attempt** after a refresh or a browser restart, with the remaining time
  shown.
- **Leave-page warning** while an attempt is in progress.

### After submission
- **Score card** with the candidate's name, final score, accuracy, time taken and a personalised
  message.
- **Score benchmarks** — Excellent / Good / Average / Needs improvement bands rendered on a scale
  with the candidate's position marked, plus an indicative study target.
- **One-line answer key**: every question on a single row — your answer, the correct answer, the
  verdict and the marks awarded.
- **Detailed review** with all five options, your answer, the correct answer and a bilingual
  explanation, filterable by All / Correct / Incorrect / Not Known / Unanswered / Marked.
- **Subject-wise and topic-wise analysis** with weak topics flagged "Needs improvement".
- **Results history** for every past attempt, stored locally.

### Platform
- **Light / dark / system theme** with an instant, flash-free first paint.
- **Fully responsive** — the exam screen is laid out differently on mobile rather than merely
  shrunk; no horizontal scrolling at any width.
- **Accessible** — semantic HTML, native radio inputs for options, keyboard-navigable tabs and
  dialogs, visible focus rings, ARIA labels, and state conveyed by shape and text as well as colour.
- **Error handling** for invalid test ids, empty banks, corrupt local storage and unavailable
  storage — always with a friendly message, never a raw stack trace.
- **Development-time question validation** plus a CI script.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| UI | React 18 + TypeScript (strict) |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 with CSS-variable design tokens |
| Routing | React Router 6 (data router, lazy routes) |
| State | Zustand + `persist` middleware |
| Icons | lucide-react |
| Tests | Vitest |
| Persistence | `localStorage` (no backend) |

---

## Installation

```bash
git clone <repository-url>
cd <project-folder>
npm install
npm run dev
```

The dev server prints a local URL (usually `http://localhost:5173`).

## Production build

```bash
npm run build
```

The build runs `tsc -b` first, so any type error fails the build. Output goes to `dist/`, including
a `404.html` copy of `index.html` for GitHub Pages deep links.

## Preview the production build

```bash
npm run preview
```

## Other scripts

```bash
npm test                  # scoring engine acceptance tests (Vitest)
npm run validate:questions # validates the whole question bank, exits non-zero on error
npm run typecheck          # type-check without emitting
```

---

## GitHub Pages deployment

### 1. Push the repository

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Enable Pages

In the repository: **Settings → Pages → Build and deployment → Source → GitHub Actions**.

### 3. That is all

`.github/workflows/deploy.yml` runs on every push to `main`. It installs dependencies, validates the
question bank, runs the tests, builds and deploys.

### Where the base path is configured

Vite needs to know the sub-path the site is served from. It is read from the `VITE_BASE_PATH`
environment variable in **`vite.config.ts`**:

```ts
const basePath = process.env.VITE_BASE_PATH ?? '/';
```

The workflow sets it automatically from the repository name, so **you do not need to edit any
file** — renaming or forking the repository just works:

- Project site `https://<user>.github.io/<repo>/` → `VITE_BASE_PATH=/<repo>/`
- User/organisation site `https://<user>.github.io/` → `VITE_BASE_PATH=/`

To build for Pages locally:

```bash
VITE_BASE_PATH="/your-repo-name/" npm run build     # macOS / Linux
$env:VITE_BASE_PATH="/your-repo-name/"; npm run build   # PowerShell
```

React Router picks the same value up automatically through `import.meta.env.BASE_URL`
(see `src/App.tsx`), so no route strings contain the repository name.

### Deploying somewhere other than Pages

Any static host works. Build with the correct `VITE_BASE_PATH` and serve `dist/`, making sure
unknown paths fall back to `index.html`.

---

## Adding questions

Question data lives in `src/data/questions/`, one file (or part-file) per subject. Questions are
authored in a compact seed format and expanded by `buildQuestions`.

1. Open the right bank file, e.g. `src/data/questions/mathematics.ts` (or add
   `mathematicsPart3.ts` and register it in `src/data/questions/index.ts`).
2. Append a seed to the `seeds` array:

```ts
{
  id: 'MATH-061',            // must be unique across the whole project
  topic: 'percentage',       // must exist under this subject in src/data/subjects.ts
  hi: 'किसी संख्या का 20% यदि 50 है, तो वह संख्या है:',
  en: 'If 20% of a number is 50, then the number is:',
  options: [
    ['200', '200'],          // [hindi, english] — always four options, in A, B, C, D order
    ['250', '250'],
    ['300', '300'],
    ['400', '400'],
  ],
  answer: 'B',               // must be 'A' | 'B' | 'C' | 'D' — never 'E'
  exHi: '50 ÷ 0.20 = 250।',
  exEn: '50 ÷ 0.20 = 250.',
  source: { exam: 'BPSC TRE-2', year: 2023 },  // optional: the pattern it follows
}
```

3. Validate:

```bash
npm run validate:questions
```

The validator checks that ids are unique, that the subject and topic exist, that all four options
have text, that `correctOption` is A–D, and it warns about missing translations, duplicated option
text and missing explanations.

**Option E is never stored.** It is generated by the UI for every question and always means
"Not Known", so `answer` must never be `'E'`.

### Adding a subject or topic

Edit `src/data/subjects.ts`. Every subject has a `key`, a `paper`, bilingual labels and a topic
list. Questions reference `subject` and `topic` by key; unknown keys are reported by the validator.

---

## Creating a new practice set

Each set draws from the same shared bank at a different offset, so no question ever appears in two
sets.

1. Make sure the banks are large enough. Set *N* needs `count × N` questions in every bank listed in
   `src/data/mockTests/blueprint.ts` (the current blueprint needs 45 Hindi, 45 English, 60 maths,
   60 reasoning, 60 general awareness, 60 science, 39 social studies, 42 geography and 39 national
   movement questions per three sets).
2. Create `src/data/mockTests/practiceSet04.ts`:

```ts
import type { MockTest } from '@/types/exam';
import { buildPracticeSet } from './blueprint';

const TEST_ID = 'practice-set-08';

export const practiceSet08: MockTest = {
  id: TEST_ID,
  title: { hindi: 'BPSC TRE प्रैक्टिस सेट 8', english: 'BPSC TRE Practice Set 8' },
  description: { hindi: '…', english: '…' },
  difficulty: 'moderate',
  demo: true,
  questions: buildPracticeSet(TEST_ID, 7), // 0-based set index
};
```

3. Register it in `src/data/mockTests/index.ts`:

```ts
export const mockTests: MockTest[] = [practiceSet01, practiceSet02, practiceSet03, practiceSet04];
```

Routing, the listing page, the instructions page and the results history all read from that array —
nothing else needs to change. A set whose banks are short still works: it simply contains fewer
questions, its duration scales proportionally, and a development warning names the bank to top up.

### Changing the blueprint

`src/data/mockTests/blueprint.ts` holds the per-subject question counts of a paper. Change a `count`
there and every set follows.

---

## Changing exam rules

All marking and timing rules live in **`src/config/examConfig.ts`**. Nothing in the UI hard-codes a
mark value.

```ts
export const examConfig = {
  paper1Questions: 30,
  paper2Questions: 120,
  totalQuestions: 150,
  durationMinutes: 120,

  correctMarks: 1,
  incorrectMarks: -1 / 3,
  unansweredMarks: -1 / 3,
  dontKnowMarks: 0,

  languages: ['hindi', 'english'],
  defaultLanguage: 'hindi',      // question paper
  defaultUiLanguage: 'english',  // website interface

  randomizeQuestions: false,
  randomizeOptions: false,

  timerWarningSeconds: 10 * 60,
  timerDangerSeconds: 5 * 60,
  weakTopicThreshold: 50,
  strongTopicThreshold: 75,
  scorePrecision: 2,
  maxStoredResults: 25,

  requireCandidateName: true,
  minCandidateNameLength: 2,
  maxCandidateNameLength: 40,
};
```

The **score benchmarks** (Excellent / Good / Average / Needs improvement) and the indicative target
are exported from the same file as `scoreBenchmarks` and `indicativeCutoffPercentage`. Change a
band's `minPercentage`, label or message there and the result page follows.

### Enabling randomisation

Set `randomizeQuestions: true` and/or `randomizeOptions: true`. The order is generated once from a
seed derived from the test id and start time, then persisted, so a refresh can never reshuffle a
paper that is already in progress.

---

## How scoring is implemented

The scoring engine (`src/utils/scoring.ts`) is a pure module — no React, no storage, no DOM — so it
is unit-tested in isolation (`src/utils/scoring.test.ts`, 17 tests).

**1. Classify each response.** `evaluateAnswer(selected, correctOption)` returns one of four
verdicts, and the `'E'` / `null` distinction is enforced here:

```ts
selected === 'E'                      -> 'dontKnow'    // explicit "Not Known"
selected === null || undefined        -> 'unanswered'  // never answered
selected === correctOption            -> 'correct'
otherwise                             -> 'incorrect'
```

**2. Award marks.** `marksForVerdict` reads the value straight from `examConfig`, so the engine has
no literals of its own.

**3. Aggregate.**

```
positiveMarks = correct × correctMarks
negativeMarks = |incorrect × incorrectMarks + unanswered × unansweredMarks|
finalScore    = positiveMarks − negativeMarks
accuracy      = correct ÷ (correct + incorrect) × 100
```

Questions answered with E contribute to neither side. Every total passes through `roundMarks`,
which rounds to six decimals to remove binary floating-point noise — three wrong answers score
exactly `−1.00`, not `−0.9999999999999999`.

**Worked example** (from the brief): 80 correct, 20 incorrect, 10 E, 10 unanswered
→ `80 − (20/3) − (10/3)` = **70.00**. This is asserted by the test suite.

**4. Analyse.** The same aggregation is reused per paper, per subject and per `subject/topic`, so
the headline score and the analysis tables can never disagree.

---

## How resume works

The exam session is persisted by Zustand's `persist` middleware under
`bpsc-tre-mock:v1:exam-session`. Only **identifiers** are stored — question ids, the answer map, the
marked/visited maps, the language, the timestamps and the status — never question objects, which
keeps the payload small and lets a corrected question reach an in-progress attempt.

**The timer.** At start the app stores `examStartTime` and `examEndTime` (a wall-clock timestamp).
The countdown is recomputed from `Date.now()` on every tick and whenever the tab becomes visible
again, so refreshing, sleeping the laptop or changing the language cannot add a single second. When
the remaining time hits zero the paper is submitted automatically.

**On return.** If a session with `status: 'in-progress'` exists for a test, its instructions page
shows a resume banner with the live remaining time and two actions — **Resume test** (continues
exactly where you were) and **Restart test** (discards the attempt). Navigating straight to
`/mock-tests/:id/exam` without a live session redirects back to the instructions page rather than
rendering an empty paper.

**Corrupt data.** Every read goes through `src/utils/storage.ts`, which swallows storage errors, and
through a `merge` guard in the store that shape-checks the persisted object. Anything malformed is
discarded in favour of a clean session (the language and name preferences are kept), so a hand-edited
`localStorage` entry can never crash the app.

**Results.** Submitting writes a full `ExamResult` to `bpsc-tre-mock:v1:results` (newest first,
capped at `maxStoredResults`) and clears the live session, which is why the result and review pages
survive a refresh while the resume banner correctly disappears.

---

## Project structure

```
bpsc-tre-mock-test/
├── .github/workflows/deploy.yml   GitHub Pages build + deploy
├── public/favicon.svg
├── scripts/validateQuestions.ts   CI question-bank validation
├── src/
│   ├── components/
│   │   ├── common/                Button, Card, Badge, Modal, Alert, Meter, Tabs,
│   │   │                          ErrorBoundary, ThemeToggle, LanguageToggle, …
│   │   ├── exam/                  ExamHeader, ExamTimer, ExamControls,
│   │   │                          QuestionNavigator, NavigatorPanel, SubmitConfirmDialog
│   │   ├── layout/                RootLayout, SiteHeader, SiteFooter, Page
│   │   ├── question/              QuestionCard, OptionList, QuestionMeta
│   │   └── result/                ScoreCard, StatGrid, PerformanceTable,
│   │                              AnswerKeyList, ReviewQuestionCard
│   ├── config/
│   │   ├── examConfig.ts          every marking / timing rule + score benchmarks
│   │   └── routes.ts              every URL in the application
│   ├── data/
│   │   ├── subjects.ts            bilingual syllabus taxonomy
│   │   ├── questions/             the shared question bank (per subject, part files)
│   │   └── mockTests/             blueprint, composer and the practice sets
│   ├── hooks/                     useExamSession, useExamTimer, useStoredResult,
│   │                              useBeforeUnload, useMediaQuery
│   ├── pages/                     Home, MockTests, MockTestDetail, Instructions,
│   │                              Exam, Result, Review, Results, Practice, About, NotFound
│   ├── store/                     examStore (persisted), themeStore
│   ├── types/exam.ts              domain types
│   ├── utils/                     scoring, timer, storage, validation, format, random, cn
│   ├── App.tsx                    router
│   ├── main.tsx
│   └── index.css                  design tokens (light + dark)
├── index.html
├── tailwind.config.ts
├── vite.config.ts
└── vitest.config.ts
```

---

## Routes

| Path | Page |
| --- | --- |
| `/` | Landing page |
| `/mock-tests` | Practice set listing |
| `/mock-tests/:testId` | Set details and syllabus breakdown |
| `/mock-tests/:testId/instructions` | Instructions, name entry, start / resume |
| `/mock-tests/:testId/exam` | Examination screen (guarded) |
| `/mock-tests/:testId/result` | Score card and analysis |
| `/mock-tests/:testId/review` | Answer key and detailed review |
| `/results` | Attempt history |
| `/practice` | Syllabus and question-bank coverage |
| `/about` | Marking scheme, data policy, disclaimer |
| `*` | Not found |

Unknown test ids render a friendly "practice set not found" page, and the exam route redirects to the
instructions page unless a live session exists for that test.

---

## Security notes

- No API keys, secrets or credentials exist in this repository, and `.env*` files are git-ignored.
- Scoring happens in the browser, so it is **not tamper-proof**. This is a self-practice tool, not a
  proctored assessment.
- The architecture is ready for server-side validation later: the scoring engine is a pure function
  of `(questions, answers)` and the store already keeps only ids, so moving evaluation behind an API
  means replacing one call in `useFinishExam` rather than rewriting the UI.

---

## Assumptions

1. **Question provenance.** Verbatim official BPSC papers could not be reproduced reliably, so the
   bank is original practice material written to the pattern of past papers, labelled as such in the
   UI and in the `source` field.
2. **Unanswered questions carry −1/3**, exactly as specified in the brief. This is unusual for a real
   paper, so it is stated prominently on the instructions page and in the submit dialog.
3. **Paper language toggle** is offered on both papers rather than only Paper II, since the whole
   bank is bilingual and restricting it would be surprising.
4. **Score benchmarks are indicative.** The real BPSC cut-off varies by cycle, subject and category
   and is not published in advance, so the bands are a self-assessment aid and are labelled that way.
5. **Duration** is 120 minutes for a full 150-question set; a set that is short of the blueprint gets
   a proportionally scaled duration so the time per question stays realistic.
6. **All seven sets are disjoint** — every bank holds exactly seven times its blueprint share
   (1,050 questions in total), so no question is reused across sets. An eighth set needs each bank
   grown by one more share; `npm run validate:questions` and the blueprint offsets make the
   shortfall obvious if it is not.
7. **The 2026 current-affairs questions are deliberately narrow.** Current affairs go stale faster
   than a bundled question bank can track, so those items stick to scheduled or structural facts
   (sporting hosts, constitutional timelines, commission award periods) rather than results,
   rankings or appointments. Each carries a `source.note` telling the candidate to re-verify against
   a current source. Treat them as pattern practice, not as a current-affairs digest.

---

## Disclaimer

This is an independent practice project. It is **not affiliated with, endorsed by or connected to the
Bihar Public Service Commission (BPSC)**. Always refer to the official BPSC notification for the
authoritative examination pattern, syllabus and marking scheme.
