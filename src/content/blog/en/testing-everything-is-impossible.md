---
title: "Testing everything is impossible: who decides what doesn't get tested?"
date: 2026-10-06
tag: "QA practice"
excerpt: "Exhaustive testing is impossible: it is the second principle of the ISTQB syllabus, and automation does not lift that limit. Some things will always go untested. The real question is who chose them: the business, QA or the calendar."
lang: en
slug: testing-everything-is-impossible
translationSlug: tout-tester-est-impossible
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

Before a release, the question comes up sooner or later: "Have we tested
everything?"

The honest answer is no, in every team and on any real product. That is not an
admission of failure. The real issue lies elsewhere: knowing what was not
tested, and who decided it.

## A principle, not an exam rule

The ISTQB Foundation Level syllabus sets out seven testing principles. The
second fits in one sentence: "Testing everything is not feasible except in
trivial cases."

It is sometimes filed under certification rules. Yet the syllabus traces it to
a 1978 reference, and immediately draws the practical consequence: since you
cannot test everything, you focus the effort with three levers, test
techniques, test case prioritisation and risk-based testing.

## Why "faster" does not solve it

Take a bank transfer form. The amount field alone, to the cent, between
CHF 0.01 and CHF 100,000, accepts ten million values. Add three currencies, two
channels, web and mobile, and four interface languages: 240 million
combinations, for a single screen. Not counting the account balance, the
limits, the order of actions or the free-text reference field.

Test techniques exist precisely for this. Equivalence partitioning groups the
values the system should process in the same way: valid amounts, amounts above
the limit, zero or negative amounts. You test one value per partition,
then the boundary values. Ten million amounts become a handful of test cases.

Combinations, however, keep multiplying. The syllabus says so about decision
tables: the number of rules grows exponentially with the number of conditions.
Its answer is to minimise the table, or to take a risk-based approach.

This is where automation, and now AI, disappoint those who hoped to be done
with choosing. They divide execution time. Each added parameter, on the other
hand, multiplies the number of cases. And every case, whether it runs in a
millisecond or an hour, needs an expected result: someone must have defined the
correct behaviour. Running faster does not tell you what is right.

## When nobody chooses, the calendar does

So some things will always go untested, or be tested less than others. That
choice is made either way. The only question is whether someone makes it.

Without an explicit decision, testing often follows the order in which things
arrive: the feature delivered first, the scenario written first, the most
visible ticket. When time runs short, what gets left out is the bottom of the
list: the criterion was position, not risk.

The result can even look reassuring: plenty of tests, nearly all green. But a
pass rate says nothing about what nobody looked at.

## Two voices in the decision

The syllabus offers a simple tool to make that choice visible: the risk
register, a list in which each risk carries its likelihood, its impact and the
planned mitigation. The more likely a risk and the heavier its impact, the
earlier and deeper it deserves to be tested.

Those two dimensions do not belong to the same people. Likelihood is best
judged on the technical side: a complex module, changed often, that has already
concentrated defects. The syllabus makes that one of its principles too:
defects cluster together. Impact is best judged on the business side: what a
failure would cost in money, reputation or compliance.

So QA should not decide alone what goes untested. Nor should the business,
without the risk map that testing can provide. The syllabus lists among the
objectives of testing "providing information to stakeholders to allow them to
make informed decisions".

## The missing list

In practice, the essentials fit on one page: the list of what is not
tested, or tested less. Each line answers four questions.

**What.** The scope left out, phrased as risks everyone understands, not as
test case IDs.

**Why.** A risk level judged low, an environment that cannot reproduce it, data
that is not available.

**Who.** The person who accepts that risk, on the business side.

**Until when.** The event that reopens the decision: a new version of a
component, a production incident, a regulatory change.

If I could keep only one test document, it would be that one. It is what lets
you talk about residual risk at release time, rather than a percentage of
passed tests. The syllabus puts it its own way: tracing test results to risks
makes it possible to evaluate the level of residual risk.

And it changes the answer to the opening question. "Have we tested everything?"
calls for an awkward no. "Here is what we did not test, why, and who accepted
it" is an answer you can stand behind in front of any committee.

## In medtech, the choice is already written down

Some sectors did not wait. In medtech, IEC 62304 scales the required
activities, documentation and verification included, to the software safety
class: A, B or C, depending on the severity of harm the software can contribute
to, taking into account risk control measures external to the software. Testing
less never means testing nothing: since the 2015 amendment, system testing is
required even for class A.

What the standard imposes, any team can apply to itself: decide the level of
testing according to the possible harm, and write it down.

## What testing cannot decide alone

Testing everything is impossible. Letting the calendar choose is not
inevitable.

Testing can tell where the risks are and what it has checked. It cannot decide
alone which risks the company is willing to take.

In your teams, who decides what doesn't get tested: the business, QA or the
calendar?

---

Sources: testing principles (§1.3), test objectives (§1.1.1), risk register and
traceability (§1.4.3 and §1.4.4), decision tables (§4.2.3),
[ISTQB Certified Tester Foundation Level syllabus v4.0.1](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf);
IEC 62304 safety classes and system testing in class A,
[Johner Institute](https://blog.johner-institute.com/iec-62304-medical-software/safety-class-iec-62304/).
