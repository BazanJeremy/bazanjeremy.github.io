---
title: "A detection AI's right to be wrong"
date: 2026-09-22
tag: "AI & QA"
excerpt: "A detection AI will get things wrong. The useful question is where it is allowed to, and to write down beforehand, as blocking thresholds, what it has no right to miss."
lang: en
slug: detection-ai-right-to-be-wrong
translationSlug: droit-a-lerreur-ia-de-detection
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

anomaly-sentinel was born neither from an incident nor from a client request. It
came from a question that stayed with me through my reading and my industry
watch. LLM-based anomaly classifiers are reaching sectors where a false negative
has a real cost: an unreported oxygen desaturation, a wire-transfer fraud that
goes unblocked. Yet these components are not deterministic. How do you impose
requirements on them that are?

My answer starts from the principle behind all my tools: deterministic first, AI
where it earns its place — QA stays the arbiter. In practice, the classifier does
not help write the tests. It is the thing being tested, as a system under test.

## Writing down the right to be wrong before testing

A detection AI will get things wrong. The useful question is not whether it will,
but where it is allowed to, and where it is not.

In anomaly-sentinel, that right is written down as blocking thresholds. Out of a
hundred normal cases, the classifier is allowed to flag five wrongly, at most. It
must also hold at least 85% precision and 85% recall. On critical cases, the
tolerance drops to zero: an oxygen desaturation must be detected ten times out of
ten, and a degraded sensor must never be classified as a clinical emergency.
Finally, a prediction announced with a confidence of 0.85 or more must be right.

Two sectors are simulated, fintech and medtech, with scenarios labelled from
public reference sources. Every prediction is checked against the expected label.

## The prompt is a configuration artefact

A prompt that changes can degrade a classifier without a single line of code
having moved. Prompts are therefore versioned: every version is replayed on the
same corpus and must pass the same blocking thresholds. This check only covers
the LLM mode: without a key, no prompt is read.

Upstream, data contracts reject invalid inputs before they reach the LLM, and
strip direct identifiers (patient, account, device) from the context sent to it.

## Rules as an executable specification

Without an API key, the full suite — 182 tests — runs in deterministic mode. The
LLM is replaced there by rules that describe the expected behaviour: not a stub,
an executable specification. With a key, it is the LLM that is put through
exactly the same tests. If it strays from the specification, a test fails and
triggers a prompt revision.

During development, the suite caught five real defects before any manual review:
four fixed in the scenario generators, one in the rules themselves. That one: a
low-battery sensor classified as a clinical alert, because the battery rule was
evaluated after the one that watches the change in saturation. An executable
specification gets tested too.

## What this framework does not prove

The data is simulated, generated from public reference sources: no real
production stream. The public CI validates the deterministic mode; the LLM's
metrics are only measured when a key is provided, and I have not done that yet.
Processing is batch-only, with no real time and no load testing. And ten
detections out of ten remain a non-regression guardrail, not a proof of safety.

anomaly-sentinel shows a method, not a performance on real streams. It fits in
one sentence: an AI has the right to be wrong, but what it has no right to miss
must be written down beforehand, and made blocking.
