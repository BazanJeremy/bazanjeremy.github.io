---
title: "No acceptance criteria, no way for me to test"
date: 2026-11-05
tag: "QA practice"
excerpt: "A user story with no acceptance criteria can only be watched working. What a criterion gives a test: at least two cases, a boundary to question, and a link that tells you what to rerun when it changes."
lang: en
slug: no-acceptance-criteria-no-test
translationSlug: sans-critere-dacceptation-pas-de-test
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

A user story with no acceptance criteria, I don't know how to test it. I can
only watch it work.

Without a criterion, no expected behaviour is written down. Everyone tests what
they imagine, and a test with no expected result can never fail: it can only
pass.

## What the syllabus says

For the ISTQB Foundation syllabus, acceptance criteria are the conditions an
implementation must meet to be accepted by stakeholders. They set the scope of
the story, and they describe positive as well as negative scenarios. They are
the basis for acceptance tests.

The syllabus names two formats as the most common: scenario-oriented (the
"Given / When / Then" format) and rule-oriented (a bullet list of verifications
or a table of input-output mappings). It allows a custom format, as long as it
is well defined and unambiguous.

## One criterion, two cases at least

Each criterion gives me at least two cases: the one that must pass, and the one
that must fail cleanly. Everyone writes the nominal case. The failing case is
where the questions start.

Take a criterion that sets a range: "the quantity is between 1 and 100". For
integer quantities, the domain splits into three equivalence partitions: 0 and
below (invalid), 1 to 100 (valid), 101 and above (invalid). The syllabus rests
on the assumption that values in the same partition are handled the same way:
one test per partition is enough.

But errors hide at the edges. Boundary value analysis tests the boundaries of
the partitions. In its two-value form, it takes for each boundary the value
itself and its nearest neighbour in the adjacent partition: 0, 1, 100 and 101.
In its three-value form, it takes the boundary and both its neighbours: for the
boundaries 1 and 100, that gives 0, 1, 2, 99, 100 and 101.

Why not 50? It represents the valid partition, and a value like that is enough
for it. It tells me almost nothing about the boundaries, which is where
errors are most likely.

The syllabus gives an example of a defect that only the three-value form
catches: a condition specified as `x ≤ 10` and implemented as `x = 10`. The
values 10 and 11 give the same result in both cases. It is 9 that reveals the
difference.

## Looking for the boundary is where the real question comes up

When picking 100 and 101, two questions arrive. Is 100 included? What does the
user see at 101: an error message, or nothing at all?

The criterion "between 1 and 100" answers neither. The scenario format
forces an answer. For example: "Given a quantity of 101, when the user
submits, then a message says the maximum quantity is 100." That text is a
writing example, not a behaviour I attribute to any application.

An ambiguity found at that point is settled by writing one sentence, before the
first line of code. It is the same logic as in
[the article on when QA enters the cycle](/en/blog/qa-refinement-too-late).
Found later, it is settled by rewriting a criterion that has already been
approved, and tests that have already been written.

## Each case stays attached to its criterion

Once the cases are written, I keep them attached to their criterion. One simple
way to do it: carry the criterion's identifier in the test's name or tag.

The syllabus calls this traceability between the test basis and the testware.
It lists several uses: checking that each requirement is covered, running the
impact analysis of a change, making audits easier.

For me, traceability is not primarily a table for the audit. It is the
answer to a question that comes back at every change: what do we rerun? The day
the criterion changes, I know which tests to rerun, and which ones become
wrong.

## What this does not settle

Tests derived from the criteria are only as good as the criteria. A forgotten
criterion gives a forgotten case, and a criterion that is too vague gives a test
nobody can contradict.

Partitions and boundary values deal with one input at a time. They say nothing
about combinations or the sequence of journeys: for that, you still have to
choose, as I wrote in
[the article on what we do not test](/en/blog/testing-everything-is-impossible).

A clear criterion therefore replaces neither exploration nor risk analysis. It
only gives the test a starting point that can fail.

When a criterion stays vague on a boundary, who settles it where you work: the
PO, the dev or QA?

---

Sources: acceptance criteria (§4.5.2), equivalence partitioning (§4.2.1),
boundary value analysis, two-value and three-value (§4.2.2), traceability
between the test basis and testware (§1.4.4), ISTQB Foundation Level syllabus,
[English version v4.0.1, ISTQB](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
(numbering of that version);
[boundary value analysis white paper, ISTQB](https://istqb.org/wp-content/uploads/2025/10/Boundary-Value-Analysis-white-paper.pdf).
