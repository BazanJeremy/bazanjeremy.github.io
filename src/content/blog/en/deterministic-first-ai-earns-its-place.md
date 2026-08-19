---
title: "Deterministic first, AI where it earns its place"
date: 2026-08-19
tag: "AI & QA"
excerpt: "Seven tools, the same architecture decision taken seven times: forbid the LLM from settling anything. Where I draw the line, what the rule cost me, and the case where it is not enough."
lang: en
slug: deterministic-first-ai-earns-its-place
translationSlug: deterministe-dabord-ia-ou-elle-apporte
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

I have published seven QA × AI tools. Rereading them, I realised I had taken the same architecture decision seven times over, without ever having stated it: **the LLM is allowed to decide nothing.**

The first time, it was a design accident. The times after that, it became a method. Here is what I learned from it, including what it costs.

## The opposite reflex

When you add AI to a quality tool, the reflex is to put the LLM at the centre and add guardrails around it. You hand it the problem, it produces a verdict, and you then write rules to catch its deviations.

It looks logical. The LLM is the impressive part: might as well give it the interesting work. And it works — during the phase where you look at the outputs one by one.

The problem shows up later, when the tool runs on its own. An LLM turned loose on a history of test runs will always find an interesting pattern to narrate. Including in pure statistical noise. It will never spontaneously say "I don't know": that is not in its nature as a generator. It will produce a plausible cause, well written, in the tone of the self-evident.

A plausible, wrong cause costs more than no cause at all. It steers an investigation, it reassures, and nobody is going to check it since the wording is convincing.

## Where the line falls

The rule I now apply fits in one sentence: **what must be reproducible cannot be probabilistic.**

In practice, I ask three questions of every feature that could call a model.

**Will I have to justify this output to someone in six months?** If yes, it must be computed, not generated. An auditor asking why a test was classified as unstable wants to see a calculation, not an explanation.

**Must two identical runs produce the same thing?** If yes, the LLM is disqualified outright, whatever the temperature.

**Would a mistake here be visible, or would it hide?** That is the most useful question. A bad rewording is visible immediately. A bad severity score is not — it blends into a dashboard and nobody will ever find it again.

What is left after that sorting is where the LLM works well: rewording, explaining, proposing, enriching. Tasks where its output is immediately assessable by the person reading it.

## Three ways of applying the same rule

In **flakysense**, the instability score combines three computed signals, and it is damped proportionally below four runs of history: little data, no confident score. The refusal to conclude comes one step further — below a confidence floor, the cause classification answers `unknown` instead of guessing. The LLM only comes in from the escalation threshold upwards, and only to explain a decision already made. Sixty tests and the integration pipeline run with zero API keys.

In **ReleaseGuard**, the release verdict comes out of two non-compensable gates and a weighted score. The AI layer writes the text accompanying a conditional verdict — never the verdict, never the score. This is not a team convention: it is locked by tests, and the repository applies its own gate to itself on every push.

The most interesting case is **EvalForge**, because it evaluates LLM systems with an LLM judge. The rule holds anyway: the judge is measured against human labels via Cohen's kappa, and until it has passed that calibration, its ratings stay visible but drop out of the score. A sycophantic judge that rates everything at maximum fails calibration by construction, because the human labels deliberately span the whole scale. The invariant lives in the data models: a report that violates it literally cannot be built.

## A corollary I had not anticipated

If the decision is deterministic, then the tool must work without the LLM. Not "in degraded mode" — really work, with the same shape of output.

It looks like an implementation detail. It is one at first, when you write the fallback to make the integration pipeline run without an API key. Then you realise it is a requirement: a quality tool whose test suite depends on an external service is not a quality tool.

And there is a side effect I had not seen coming. That constraint, taken for reproducibility reasons, incidentally settles the question that most often blocks AI adoption in regulated sectors: nothing leaves the network until you have explicitly decided it should. Compliance was not my starting objective. It fell into the basket.

## What the rule costs

I do not want to present it as free.

It costs code. Every deterministic heuristic is work the LLM would have done on its own, and it has to be maintained.

It costs in subtlety. For duplicate detection in **testscribe**, the default path — and the one the integration pipeline takes — is TF-IDF, not the semantic model. TF-IDF captures closeness of meaning poorly, that is a fact: "crash" and "freeze" remain two foreign words to it, and I lose duplicates worded differently. But it runs without a network, without a model to download and version, reproducibly. The neural model stays reachable behind a configuration flag; what is locked is that the default behaviour, at least, is reproducible. I chose reproducibility over subtlety, and it is documented as such.

Finally, it costs cases where the LLM would objectively do better. Below a confidence floor, my tools answer `unknown`. A model would have proposed something. Sometimes it would have been right.

I take that cost because the opposite — a tool that is often right, without anyone knowing when — is not usable in a quality pipeline.

## Where the rule stops

There remain areas with no writable rule.

Behavioural anomaly detection is one. A sequence of operations where every single step is legitimate, but where the chain of them does not add up: that is what an auditor looks for, and it is very hard to cover with static rules. That is the ground **anomaly-sentinel** works on, and there, the LLM brings something the deterministic path cannot do.

Natural language is another. Turning "the button doesn't work" into structured reproduction steps — no rule set will do that well.

In those areas, the LLM comes in — but it comes in under constraint. Its output carries the trace of who produced it and at what confidence level, it is presented as a proposal, and the final decision stays with a human who can refuse it without having to justify themselves.

## What this says about the job

I am sometimes asked whether this position is not distrust of AI. I see it differently.

I have delegated a significant share of my upstream phases to LLMs — entry criteria verification, derivation of acceptance criteria into scenarios, strategy framing. The gain is real and I am not going back on it. This is not written by someone who distrusts the tool.

But a test going green is only information if you know why it is green. That is the core of the job, and it does not get delegated to a system whose reasoning you cannot replay.

Deterministic first, AI where it earns its place — QA stays the referee.

---

*The seven tools mentioned here are public: [github.com/BazanJeremy](https://github.com/BazanJeremy). Each one documents its thresholds and its architecture choices.*
