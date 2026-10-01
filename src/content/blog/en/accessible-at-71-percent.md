---
title: "“71% accessible”: what the rate doesn't tell you"
date: 2026-10-01
tag: "QA practice"
excerpt: "A website can meet 71% of accessibility criteria and still be unusable for someone navigating by keyboard. What a rate measures, what it hides, and how to test accessibility as a risk, one journey at a time."
lang: en
slug: accessible-at-71-percent
translationSlug: accessible-a-71-pourcent
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

On 4 June 2026, ruling in summary proceedings, the court of first instance in
Caen ordered a major retailer to make its website and app fully accessible to
people with disabilities, within six months and subject to daily penalties. The
retailer argued a 71% conformance rate. The judge recalled that digital
accessibility is an obligation of result: an online store cannot be "a little"
accessible.

That 71% deserves a closer look. It resembles many quality indicators:
reassuring, computable, and silent on what matters.

## The framework, in a few lines

For a long time, digital accessibility obligations mainly targeted the public
sector. Since 28 June 2025, the European Accessibility Act (EAA) has extended
them to a range of products and services, including e-commerce, consumer
banking services, electronic communications, e-books and some passenger
transport services. Micro-enterprises providing services are exempt.

In France, the decree of 24 August 2026 updated the regime covering the public
sector and certain companies, notably those with a turnover of at least EUR 250
million. It creates no new general obligation: it aligns the French framework
with the European timeline and refers to the harmonised European standards,
which the French reference framework, the RGAA, will have to match at least.

## A rate counts criteria, a user lives a journey

A conformance rate answers one question: how many criteria are met? A user asks
another one: can I get to the end?

Take a six-step purchase journey. Five steps are flawless. At the sixth, the
payment button cannot be used by keyboard. The rate still looks good. For the
person navigating by keyboard, the journey is worth zero: they cannot pay.

Accessibility defects do not offset each other. An average dilutes them; a journey
adds them up, and a single blocking defect is enough to stop everything.

## What an automated tool sees, and what it doesn't

Automated checkers such as axe are valuable. In seconds they flag an image
without a text alternative, text with insufficient contrast, a form field
without a label, a page without a declared language. They are fast, repeatable,
and plug into existing tests: the Playwright documentation shows how to add
axe-core to an end-to-end suite, so that the check runs on every execution.

What they cannot judge is meaning. They see that an image has an alternative;
they cannot tell whether it describes what matters. They cannot tell whether the
focus order follows the logic of the page, whether you can leave a modal dialog by keyboard,
whether an error message says how to fix the problem, or whether the screen
reader announces that the basket has just been updated.

The Playwright documentation says so itself: many problems can only be found
through manual testing, and it recommends combining automated tests, manual
assessments and inclusive user testing. As for the accessibility score out of
100 that Lighthouse computes, it is one more rate: useful to track a trend,
silent about a journey.

A recent analysis of the websites of the ten French universities with the most
students noted, among other issues, insufficient contrast and poor keyboard
navigation. The first defect is usually detected automatically. The second almost always
needs someone at the keyboard.

An automated tool gives you a floor, not a verdict.

## Testing accessibility as a risk

Risk-based testing, which the ISTQB syllabus puts at the heart of prioritisation,
applies here without adaptation: start with what would block the most people, on
the journeys that matter most.

If I had only one hour to assess an online service, I would not compute a rate.
I would take the main journey and do it twice.

Keyboard only first: reach everything, activate everything, see the focus at
every step, never get trapped. Then with a screen reader, NVDA or VoiceOver on
desktop, TalkBack or VoiceOver on mobile: every field announced with its name,
every error announced and understandable. Then come zoom, contrast, and automated
checks in continuous integration, so that a detectable regression does not come
back.

The best return still comes from writing accessibility into the user story, as
criteria everyone understands: "payment can be completed entirely by keyboard,
with the focus visible at every step"; "every input error is announced by the
screen reader and says how to fix it". Written there, the criterion is tested
every sprint. The same defect, discovered at audit time, gets fixed under
pressure.

For the major journeys, nothing replaces a session with people who use
assistive technologies every day.

## In banking, the journey goes through authentication

Banking is among the most directly affected sectors. The directive explicitly
covers banking services for consumers in the EU, including when they are
provided by an institution established outside the Union. And it does not stop
at information pages: identification methods, electronic signatures, security
and payment features must also be perceivable, operable, understandable and
robust.

That is where the journey can break. A one-time code that expires before it can
be entered. A virtual keypad with shuffled digits, if it only works with a
mouse. A bank statement delivered as an untagged PDF that the screen reader
renders poorly. Each of these defects weighs little in a conformance rate; each
is enough to lock someone out of their account.

The directive adds a lesser-known requirement: information about these services
must remain understandable, without exceeding level B2 of the Common European
Framework of Reference for Languages. No accessibility checker verifies that. A
review by someone outside the project does.

## What remains with the business

Testing can tell you whether a journey is usable. It cannot tell you which one
matters most. The list of critical journeys — paying, signing in,
opening an account, booking a medical appointment — belongs to the business. The obligation, for
its part, covers the whole service: the list sets the order in which you check
it, not its scope.

A conformance rate remains useful to track progress. It does not tell you whether
someone can pay.

In your teams, is accessibility written into the acceptance criteria, or
discovered at audit time?

---

Sources: decree no. 2026-816 of 24 August 2026 and the university websites
analysis, [Handicap.fr, 3 September 2026](https://informations.handicap.fr/a-accessibilite-numerique-ce-qui-change-en-france-et-en-ue-39631.php) (in French);
order of the Caen court of 4 June 2026, [Handicap.fr](https://informations.handicap.fr/a-accessibilite-web-carrefour-condamne-par-la-justice-39309.php) (in French);
banking-specific requirements,
[Directive (EU) 2019/882, Annex I](https://eur-lex.europa.eu/eli/dir/2019/882/oj/eng);
scope of the directive for institutions established outside the Union,
[Oberson Abels, November 2025](https://obersonabels.com/wp-content/uploads/2025/11/OASA-Legal-Update-Accessibility-Act.pdf) (in French);
axe-core integration and limits of automated testing,
[Playwright documentation](https://playwright.dev/docs/accessibility-testing).
