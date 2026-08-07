---
title: "Flaky tests: who decides a test is unstable?"
date: 2026-08-07
tag: "Test reliability"
excerpt: "A deterministic score on three signals, a four-run floor, and an \"unknown\" answer when confidence is missing. What I learned building the diagnosis — and why the LLM decides nothing in it."
lang: en
slug: flaky-tests-who-decides
translationSlug: tests-flaky-qui-decide
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

A flaky test fails, then passes on the next run, without a single line of code moving in between. From a distance the incident looks minor: one test out of hundreds, a job to restart, move on.

The real cost lies elsewhere. It falls on the signal.

Once a suite holds enough unstable tests, "red" stops meaning "there is a defect". It means "restart the job". The blind re-run becomes a reflex, then a habit, then an unwritten procedure. From there, real regressions end up filed in the same place as the noise — in the column of failures nobody reads anymore.

It is a loss of trust before it is a loss of time. And it is not repaired test by test: it is repaired by giving red its meaning back.

## The problem is not the fix, it is the decision

In most teams, the answer to "is this test flaky?" lives in someone's head. A lead who *knows* that this one fails once in five since the migration. That is real knowledge, often right — but unwritten, unverifiable by anyone else, and lost the day that person changes team.

As long as the decision stays tacit, everything downstream is fragile: quarantining, prioritizing fixes, the "do we ship or not" call.

So I took the question from that end: **on what grounds can we state that a test is unstable, in a way that lets someone else redo the calculation?**

The tool that came out of it is called [flakysense](https://github.com/BazanJeremy/flakysense). In: a history of JUnit reports — the format just about every CI pipeline already produces. Out: an instability score, a probable cause family, an explanation and a corrective action.

What follows is not its documentation. It is the three choices that shaped it, and the objections those choices invite.

## Choice 1 — three signals, and nothing else

The score combines three measures, all deterministic:

- **intermittency** — does the test alternate between pass and fail over the observed period?
- **the flip rate between runs** — how often does it change state from one run to the next?
- **duration instability** — is its execution time erratic?

Three signals, computable by hand, checkable line by line by someone who did not write the code.

On top comes a constraint that weighs as much as the calculation itself: **below four runs of history, the score is damped.** Little data, no confident verdict.

That is the first thing a measuring instrument must know how to do — stay quiet when it does not know yet. A flakiness score computed on two runs is not a weak score, it is a score with no meaning; displaying it like the others would dress up an absence of data as information.

## Choice 2 — a cause, or `unknown`

A score on its own leads nowhere. It signals that there is a problem, not what to do with it. So the tool proposes one cause family out of four: timing, execution order, environment, contention.

Here again, nothing generative. Each heuristic scores independently, the strongest wins. And below a confidence floor, the answer is `unknown`.

That `unknown` is the most important part of the design — and the one that takes the most discipline to write, because it is always tempting to return the least-bad hypothesis rather than nothing.

A tool that always answers something is a tool you stop believing at the third wrong answer. A tool that can announce it does not know keeps its value on the cases where it does answer. The credibility of a diagnosis rests on its abstentions as much as on its verdicts.

## Choice 3 — the LLM only comes in after the decision

The architecture follows a four-stage pipeline, on the System 1 / System 2 pattern: a detector, a classifier, an explainer, a recommender.

The first two are entirely deterministic. They are the ones that decide.

The LLM only steps in at the last two, and under two cumulative conditions: the score must reach 0.5, and an API key must be configured. Its job is then limited to writing — explaining in natural language a verdict already handed down, and phrasing a readable corrective action.

Every stage ships its own deterministic fallback. The suite's 60 tests and the CI pipeline run with zero API key, and the output keeps exactly the same shape. The absence of an LLM degrades the readability of the report, never its structure nor its verdict.

This is not a comfort precaution. A quality tool whose test suite depends on an external service is not a quality tool — it is one more dependency in a chain we were precisely trying to make reliable.

## Three objections

These choices can be defended, but they are not self-evident. Here are the three questions that come up most often, and what I answer.

### "Why not a machine learning model?"

Because the calibration surface is too thin. A model demands a labelled corpus of flaky tests — precisely what most teams do not have, and what they can only build by first solving the problem we are trying to tool.

The three signals, by contrast, fit in a few dozen lines. Every decision is traceable, and a QA lead can redo the calculation on the back of an envelope to check they agree. It is a governance choice as much as a technical one: I prefer an instrument whose result can be contested to a model whose output can only be observed.

### "Where does the 0.5 threshold come from?"

From a cost trade-off, documented in a dedicated ADR, and held by a single constant on the orchestrator — the four stages themselves are unaware that escalation even exists.

The reasoning: below 0.5, the pattern is too weak to justify the cost of an LLM call; above it, the value of a natural-language explanation exceeds that cost. This threshold is distinct from the detection one, fixed at 0.3: "unstable enough to appear in the report" and "unstable enough to spend reasoning on" are two different questions.

The value is still calibrated against synthetic datasets — the ADR says so in writing, and plans to revisit it the day real CI histories replace the fixtures. The command line does expose an `--escalation-threshold` for whoever wants to explore, but the default is not tuned pipeline by pipeline: it only moves through an ADR that supersedes the previous one. A threshold adjusted project by project always ends up adjusted by the team in the biggest hurry, on a Friday. The stability of the decision contract is part of the contract.

### "60 tests, for a tool that judges tests?"

Deliberate. The suite covers the Pydantic models, every scoring heuristic, the deterministic fallback of each stage, and the command-line contract end to end.

Adding redundant tests dilutes the signal. I prefer 60 tests whose reason to exist I can name to 300 where half of them check that Python compiles. It is, incidentally, the same reasoning that produced the tool: a number is only worth something if you know what it measures.

## What I take from it

The most instructive part came while writing, by testing the opposite hypothesis.

Turned loose on a history of runs, an LLM always finds an interesting pattern. It finds them in genuinely unstable sequences — and it finds just as many in statistical noise, with the same confidence and the same quality of writing. Nothing in the shape of the answer lets you tell the two cases apart.

That is an excellent narrative faculty and a very poor faculty of judgment. The flakiness decision is not written in natural language: it is written in signals, thresholds and confidence floors.

**Statistics decide, AI narrates.**

The split of roles is not incidental. It determines what can be audited, what can be contested, and what stays true the day the external service is unavailable.

And on your side — what settles today that a test is flaky: a written rule, or the team's memory?

---

*The code is public: [github.com/BazanJeremy/flakysense](https://github.com/BazanJeremy/flakysense) — runs locally, no API key required.*
