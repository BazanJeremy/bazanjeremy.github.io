---
title: "AI in QA: start with the simple tasks"
date: 2026-07-16
tag: "AI & QA"
excerpt: "Reviewing a user story against the DOR, writing documentation: the fastest ROI on AI is not where people look for it."
lang: en
slug: ai-in-qa-simple-tasks
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

*Reviewing a user story against the DOR, writing documentation: the fastest ROI on AI is not where people look for it.*

Conversations about AI in QA rush to the spectacular: auto-generated test suites, autonomous end-to-end agents. On the ground, the fastest return on investment is elsewhere — on tasks that are simple, repetitive, and yet time-consuming. Two examples from my own practice: reviewing a user story against the Definition of Ready, and documentation.

## Reviewing a user story against the DOR

A Definition of Ready (DOR) is only worth something if it is applied to every user story. In practice, that check is the first one to be sacrificed: repetitive, unrewarding, and everyone assumes someone else has done it. The classic outcome: the story enters the sprint with acceptance criteria that cannot be verified, and the ambiguity is paid for later — in back-and-forth, in avoidable defects.

This is a textbook case for an LLM. You hand it the team's DOR checklist and the raw story; it flags the missing or vague criteria: an unidentified dependency, missing test data, a criterion that cannot be tested. It then proposes deriving the acceptance criteria into passing and failing scenarios — material that feeds the test strategy directly.

What the LLM does not see: the implicit business rules, the ones written down nowhere. That is exactly where QA judgment takes over: the QA decides whether the story is genuinely ready, and takes precise points back to the PO rather than a gut feeling.

## Generating documentation

Same logic for QA guidelines and documentation: the LLM produces a structured first draft in minutes; the QA validates the substance, corrects, decides. The time saved is not a comfort — it is reinvested where humans add the most: risk analysis, exploration, dialogue with the product.

## What it changes, measured

As the AI lead for my QA unit, I have built these practices into daily work. Measured result: −60 to −80% of the design time on the upstream phases an LLM can support — Definition-of-Ready checks, deriving acceptance criteria into passing and failing scenarios, high-level scoping of the test strategy.

The paradox is not one: it is precisely because these tasks are simple and well-scoped that AI excels at them with controlled risk. And they are the best ground on which to build sound governance before aiming higher. Deterministic first, AI where it earns its place — QA stays the arbiter.
