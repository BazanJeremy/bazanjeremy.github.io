---
title: "\"The button doesn't work\": rebuilding what someone already knew"
date: 2026-09-08
tag: "AI & QA"
excerpt: "A one-line report costs ten to thirty minutes to rebuild, and the lost context never comes back whole. I tooled that rebuilding — the tool started out by getting itself wrong three times."
lang: en
slug: the-button-does-not-work
translationSlug: le-bouton-ne-marche-pas
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

A few days ago I wrote that the QA who arrives at refinement is already too late, and that I had chosen to move up to framing. That is one door into the cycle.

There is a second one, and we watch it far less closely: the one problems come back through.

"The button doesn't work."
"The page crashes."
"Search doesn't work, sometimes."

The "sometimes" is the worst of the three. It is the word that holds all the useful information and delivers none of it.

## What one line costs

Rebuilding a workable ticket from a report like that takes between ten and thirty minutes. Which button, which screen, which version, which account, which data, reproducible or not.

What strikes me is not the time. It is that the person who wrote the line **knew** all of it at the moment they wrote it. They had it in front of them. They did not write it because there was no place set aside for it, and because nothing asked them for it.

So somebody else reconstructs it, later, with less information. Multiply by the number of reports in a week.

In a regulated context there is an extra cost, a quieter one: the regulatory qualification of a defect almost always arrives at the end of the line. The ticket has already been prioritised on a hunch, often by someone who did not have what they needed to do it.

## What I wanted to remove, and what I did not want to touch

I wanted to remove the writing time. Not the judgement.

That distinction structured everything else. It is what produced testscribe: four agents that take a raw report and return a structured bug report.

- An **enricher** that normalises the title and lays out the steps in Given/When/Then.
- A **severity scorer**, on a CVSS-lite with four dimensions calibrated for QA. It is not full CVSS 3.1, and that is explicit: the output is a pre-qualification for prioritising a day's work, not a regulatory opinion.
- A **duplicate classifier**, on ChromaDB and TF-IDF.
- A **compliance tagger**, which assigns an IEC 62304 class on the medical device side, or a PSD2 mapping on the payment side.

Three of these agents run in two modes: the language model for semantic subtlety, and a deterministic rule-based fallback for continuous integration. The fourth, the duplicate classifier, calls no language model at all: it compares TF-IDF vectors, and falls back to keywords when similarity is too low.

That fallback is not a spare wheel. It is an architecture requirement. A quality tool whose own test suite depends on an external service is not a quality tool — it is just green for as long as the network holds.

And every enriched report carries two fields: what produced it, and with what confidence. You always know who wrote what.

## The three times the tool got itself wrong

This is the part I had not planned for when I started.

**One.** A report saying "it doesn't *always* crash" came out classified as consistently reproducible. The tool had caught the word and left the negation behind. Exactly the opposite of what the sentence said. Fixed with a negative lookbehind.

**Two.** An infusion pump alarm scored high severity instead of critical. On a medical device, the gap between the two is not a nuance of vocabulary: it is the ticket's position in the queue. Threshold lowered from 8.5 to 8.0.

**Three.** A purely cosmetic defect classified as class B under IEC 62304. A display problem promoted to the rank of patient risk. Regular expression tightened.

None of the three was found by rereading the code. All three were found by the tool's own test suite, which counts 144 tests today.

The third is the one that bothered me most, and not for the reason you would expect. An underrated severity eventually corrects itself: someone complains, the ticket climbs. A regulatory tag assigned in error does not correct itself, because it **reassures**. Nobody is going to reopen a classification that looks serious.

That is the real risk of this kind of tooling. Not the obviously wrong proposal, which you dismiss in three seconds. The plausible proposal nobody checks.

## What stays human, and why

The final severity. The decision to merge two tickets. The regulatory class. Those three never leave the tool as decisions — only as proposals, with their confidence level displayed next to them.

And the deterministic fallback does not fill gaps with the plausible. When no compliance rule matches, the PSD2 article stays empty, and the traceability tag comes out marked `UNTRACED` — not an invented requirement ID. Where the field has to hold a value — the four severity dimensions, for instance — the fallback does not improvise either: it applies a conservative default, written into the code and commented as such, chosen so as not to underestimate.

It sounds trivial. It is the rule that catches all the others. An empty field, or a default announced as one, is visible. A wrong and credible value is not.

## What this does not fix

It does not make people write better reports. The person who types "the button doesn't work" will keep typing it — and they are right, writing bug reports is not their job.

Nor does it replace reproduction. A well-structured report built from a vague line is still a report built on a vague line: better filed, not better informed.

What changed is how the time is split. The formatting time is gone. The decision time is still there in full, and that is the only trade that strikes me as honest.

Deterministic first, AI where it earns its place — the QA stays the arbiter.

And on your side, who rebuilds the context of a one-line report, and how many times a week?

---

*Public repository: [github.com/BazanJeremy/testscribe](https://github.com/BazanJeremy/testscribe)*
