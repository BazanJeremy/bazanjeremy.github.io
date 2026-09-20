---
title: "From no rule to one rule too many"
date: 2026-09-20
tag: "QA practice"
excerpt: "An agent loses its chest and writes \"never again\". A regex rejects a legitimate identifier. Both rules came from an observation, not a specification — and only one of the two ever changed its mind."
lang: en
slug: from-no-rule-to-one-rule-too-many
translationSlug: de-zero-regle-a-la-regle-de-trop
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

On 15 September, the evaluation company Vals AI shared an account of an
experiment: GPT-6 Astra, OpenAI's latest model, played 141 hours of Minecraft
live, driving nothing but the screen, the keyboard and the mouse. The model got
further than any system the company had tested before: a semi-automatic blaze
farm, endermen killed, pearls collected.

Then it stored its entire haul in a chest, next to its bed. A creeper blew up
both.

What the model wrote for itself next was left as it stood, missing spaces
included: "ALWAYS CARRY CRITICALITEMS withkeepInventory;
don'tstoreinunguardedchesteveragain." Always. Never again. According to Vals AI,
it then spent hours doing little else than farming potatoes.

Whether the rule explains what followed, nobody can say: one run, one incident,
no counterfactual. What interests me is elsewhere. It is the rule itself.

## The same rule, without AI

I did not need an agent to run into this pattern.

On a business application, a field expected a number: two letters, then digits.
At the start there was no input validation at all — and the unpleasant surprises
piled up. So we added a strict regex: two letters, seven digits. Seven, because
that was the format of every identifier we had in front of us.

One day a product turned up with an eight-digit identifier. The regex blocked
its rollouts. We widened it to fit the context.

## An observation is not a specification

Both rules have the same origin: an observation. An incident for Astra, a
population of identifiers for us. Neither came from a specification. Both were
written as laws.

A rule drawn from what you observe is a hypothesis. It becomes a law the day it
blocks something.

There is a difference, though, and it does not favour the code. Astra did end up
correcting itself: faced with a tall green shape, it noted that this was
sugarcane, not a creeper. The alert was lifted.

A regex never changes its mind. It rejects the same identifier on every attempt,
without exception, until a human changes the rule. That is exactly its value: it
is reproducible. It is also why its source matters more than its wording.
Deterministic first, AI where it earns its place — the QA stays the arbiter.

## Three questions to ask any validation rule

**Where does it come from?** From a specification that has an owner, or from the
sample you happened to have? Both are acceptable. Only one of the two has to be
written down in black and white, with its date.

**What does its error cost?** A rule that is too permissive costs a ticket. A
rule that is too strict rejects legitimate input and costs a rollout. The second
case is rarely tested: you test what you know, and you do not yet know the format
that does not exist.

**How does it change?** Through a traced decision, or through a fix applied in
the heat of the moment by whoever is on call?

That is what I apply to the tools I publish. In flakysense, the flakiness score
is damped below four runs of history: little data, no confident verdict. And the
escalation threshold is indeed exposed on the command line, for whoever wants to
explore — but its default value only moves through an ADR that supersedes the
previous one. This is not bureaucracy: it is what keeps a rule from turning into
a custom whose origin nobody remembers.

## What is left

We did not stand up a reference registry after the incident. We widened the
rule. So the lesson is not a process, it is a status: knowing, at the moment you
write a rule, whether it describes a specification or only what you have in front
of you.

The agents we deploy today write their own rules, in their own memory, in the
heat of the moment, right after an incident. Nobody dates them, nobody reviews
them. Astra, at least, had several thousand spectators to watch it take up
potato farming.
