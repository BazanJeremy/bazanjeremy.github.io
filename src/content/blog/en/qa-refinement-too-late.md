---
title: "The QA who arrives at refinement is already too late"
date: 2026-09-03
tag: "QA practice"
excerpt: "When the QA function does not exist yet, nobody has decided when QA enters the cycle. I chose framing over refinement — what that changes, what it costs, and what it does not fix."
lang: en
slug: qa-refinement-too-late
translationSlug: qa-refinement-trop-tard
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

When I took my current role, the function did not exist. I was the company's first QA engineer. The team staffed up to seven people afterwards, but at the start there was nothing — and above all, nobody had decided at what point a QA entered the cycle.

It is a question you stop asking once the answer is inherited. QA comes in at refinement, because that is where it came in last year.

I had the luck of having to settle it. I settled it: framing, not refinement.

## What actually happens at refinement

Refinement is the moment the team reads the story together. The QA asks good questions there. Three always come back: what if the field is empty? what if the user goes back? what if the neighbouring service does not answer?

They are the right questions. They arrive at the wrong moment.

By that stage, the story is written. Someone phrased it, someone prioritised it, often someone has already announced it. The QA's questions no longer shape the story: they attack it. The difference is not semantic. An ambiguity found at framing is settled by writing one sentence. The same ambiguity found at refinement is settled by rewriting an already approved criterion — and you have to win people over.

## What I do instead

A risk assessment from the framing stage, on 100% of the sprint's user stories. Before the first line of code.

This is not a quality review. It is short. You look at what can go wrong, what is left unsaid, and above all what depends on somewhere else.

That last point pays off the most. The risk I raise most often is almost never inside the story: it sits between two teams who do not know they are working on the same object. So I map the siloed dependencies before the sprint starts. A perfectly written story that assumes another team will have delivered its endpoint is still a story that will not ship.

## The serious objection: it takes time

Yes. It is the only objection that holds, and it is well founded.

Doing it on one story is pleasant. Doing it on 100% of a sprint's stories, every sprint, is a recurring cost in direct competition with running the tests. That is exactly why the practice dies in most teams that try it: it gets adopted, it is sound, and it is dropped by the third busy sprint.

What made it sustainable is tooling. Three upstream tasks are largely automatable: Definition-of-Ready checks, deriving acceptance criteria into passing and failing scenarios, and high-level scoping of the test strategy. On those phases, I measure between 60 and 80% less time.

With one limit I hold firmly: the model produces the material, it does not decide what is risky. It derives scenarios from an acceptance criterion; it does not know that the neighbouring module broke twice this quarter. The sorting stays with me. What is delegated is the drafting — never the judgment.

Without that gain, I would not hold the 100%. I would have gone back to refinement within a month, like everyone else.

## What this does not fix

Three things, and I would rather say them.

It only covers the sprint's stories. Whatever comes in mid-flight — the emergency, the hotfix, the request that landed on a Thursday evening — misses the mechanism by construction.

It does not replace testing. A risk identified at framing remains an identified risk: it will have to be executed to know.

And being upstream does not make you more right. A flagged risk that never materialises costs something. Three sprints of false alarms, and nobody reads the column anymore. That is the real danger of this practice — not that it takes time, but that it turns into noise people learn to ignore.

## Why this matters more than it used to

One last point, which strikes me as underrated.

When code generation speeds up, writing is no longer the bottleneck. What costs is discovering late in the cycle that the behaviour produced was not the one you wanted — because nobody had written down what you wanted with enough precision.

Put another way: the faster code gets written, the more the quality of what was asked for becomes the limiting factor. A QA positioned downstream of that writing arrives after the moment where they would have helped.

Refinement is not the wrong ritual. It is the second chance, not the first.

And on your side — at what point does a QA enter a story? And who decided that moment?
