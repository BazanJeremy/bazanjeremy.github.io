---
title: "Who decides a release can ship?"
date: 2026-09-29
tag: "Test reliability"
excerpt: "Green tests authorise nothing. The release decision combines signals that live in three different tools, plus a share of memory that lives nowhere. Hard gates first, score second: a release verdict you can reread."
lang: en
slug: who-decides-a-release-can-ship
translationSlug: qui-decide-release-peut-partir
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

In every team, there is a moment when someone says "okay, we can ship". That
moment is almost never documented. You look at the test report, glance at the
coverage dashboard, and remember that a certain test has been failing one run in
three for months. Then you decide.

That synthesis is often right. It is also unauditable, unrepeatable, and missing
on the day the person who makes it is.

I wanted to see what it would take to write it down. The result is
**ReleaseGuard**: three CI artefacts in — a JUnit report, a Cobertura coverage
report, a [flakysense](https://bazanjeremy.github.io/en/blog/flaky-tests-who-decides)
report, only the first being mandatory — and a **GO / CONDITIONAL GO / NO GO**
verdict out, with its reasoning.

## Green tests authorise nothing

A JUnit report says what failed. It does not say whether the failure is a defect
or noise. Coverage at 78% says how many lines were executed. It does not say which
ones matter.

The real decision crosses those two sources with a third one that is written down
nowhere: the knowledge of what is "usually unstable". That third source is what
makes the decision fragile, not the first two.

## Averaging is the anti-pattern

The natural reflex is to weight the three signals and set a threshold. That is
exactly what should not come first.

The chosen order is the reverse: **hard gates first, score second.** Two
non-compensable gates. A real failure, not identified as unstable, triggers NO GO.
Line coverage below 60% triggers NO GO. Only if neither trips does the score come
into play: half tests, a quarter coverage, a quarter flakiness. GO from 0.80,
CONDITIONAL GO below.

Compute the score first, and excellent coverage arithmetically offsets a failing
smoke test. The verdict becomes an average, and an average ignores that a smoke
test is not just another test.

Symmetry matters just as much: **a NO GO requires a named blocker.** The score
alone can never veto. Average quality with no identifiable defect is a degraded
delivery, not a blocker. A team that receives an unnamed refusal soon stops
respecting it.

The settings follow the same caution: thresholds can be tuned per run, weights
cannot. A changed weight is a governance decision, not a command-line option.
Otherwise the first team in a hurry will push the test weight to 0.9 to get its
release through.

## A decision that only exists in the merge

A failing test that flakysense identifies as unstable is excused. With two
safeguards.

First, the excuse is **named**. The excused test appears in the verdict's
conditions, not in a log. A reviewer sees exactly which failures were set aside,
and can challenge them.

Second, an excused failure **caps the verdict at CONDITIONAL GO**, never GO. The
release goes out, with an explicit reliability-debt signal.

The interesting part is elsewhere. No parser can produce that decision on its own.
The JUnit parser sees a failure. The flakysense report sees an unstable test.
"This failure is excusable" only exists once both are merged: it is a decision
that belongs to none of the sources it rests on.

## What the AI is not allowed to do

The AI layer is optional. It writes the reasoning for CONDITIONAL GO verdicts,
nothing else: never the verdict, never the score, never the conditions. Tests lock
this down, like everything else.

Without an API key, a deterministic rationale is shown instead, and the verdict is
identical. **The verdict never depends on an LLM**: its role is limited to making
readable a decision the logic has already made.

## The real trap was elsewhere

The trap was not in computing the score. It was in the join.

To excuse a failure, you have to match the test in the JUnit report with the test
in the flakiness report. The naive design joins on the short name. It works, until
two files contain a test with the same name. I verified that case live: a real
failure in one file, a same-named unstable test in another, and the short-name
join turns a NO GO into a CONDITIONAL GO. A green light by mistake. A regression
test now pins that case.

Matching therefore uses full pytest node ids, reconstructed from the JUnit report.
And the fallback rule is asymmetric: **a failed join can only harden the verdict,
never wrongly excuse.** When in doubt, the tool refuses rather than authorises.

One last detail, which is not one: on every push, the repository's CI runs
ReleaseGuard on its own artefacts. The tool is the project's release gate, not a
showcase standing beside it.

## What it shifts

The decision stays human. What changes is that it is written down: rereadable,
transferable, contestable, and the same whether or not the person who "knows" is
there.

The code is public: [github.com/BazanJeremy/ReleaseGuard](https://github.com/BazanJeremy/ReleaseGuard), 89 tests.

In your team, does the release decision rest on a written rule, or on someone who
knows?
