---
title: "71% accessible: what the rate doesn't tell you"
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

Since 28 June 2025, digital accessibility no longer concerns only the public
sector: the European Accessibility Act extends it to the private sector. It
applies in particular to e-commerce, banking services, transport and media, with
an exemption for micro-enterprises.

In France, the decree of 24 August 2026 updated the regime covering the public
sector and large companies. It creates no new general obligation: it aligns the
French framework with the European timeline and refers to the harmonised European
standards, which the French reference framework will have to match at least.

In Switzerland, the Disability Discrimination Act (LHand) is being revised in
Parliament. The Federal Council's draft would require private service providers
to take appropriate measures to make their services accessible. Nothing is in
force yet. But the EAA applies regardless of where a provider is established: a
Swiss bank offering online services to consumers in the EU already falls within
its scope.

## A rate counts criteria, a user lives a journey

A conformance rate answers one question: how many criteria are met? A user asks
another one: can I get to the end?

Take a six-step purchase journey. Five steps are flawless. At the sixth, the
payment button cannot be reached by keyboard. The rate still looks good. For the
person navigating by keyboard, the journey is worth zero: they cannot pay.

Accessibility defects do not offset each other. An average dilutes them; a journey
adds them up, and a single one is enough to stop everything.

## What an automated tool sees, and what it doesn't

Automated checkers such as axe or Lighthouse are valuable. In seconds they flag
an image without a text alternative, text with insufficient contrast, a form
field without a label, a page without a declared language. They are fast,
repeatable, and belong in continuous integration.

What they cannot judge is meaning. They see that an image has an alternative;
they cannot tell whether it describes what matters. They cannot tell whether the
focus order follows the logic of the page, whether a modal traps the keyboard,
whether an error message says how to fix the problem, or whether the screen
reader announces that the basket has just been updated.

A recent analysis of the websites of the ten French universities with the most
students noted, among other issues, insufficient contrast and poor keyboard
navigation. The first defect is detected automatically. The second almost always
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

For the major journeys, nothing replaces a session with people who use these
technologies every day.

## What remains with the business

Testing can tell you whether a journey is usable. It cannot tell you which one
matters most. The list of critical journeys — paying, opening an account, filing
a claim, booking an appointment — belongs to the business, and it is what gives
meaning to everything else.

A conformance rate remains useful to track progress. It does not tell you whether
someone can pay.

In your teams, is accessibility written into the acceptance criteria, or
discovered at audit time?

---

Sources (in French): decree no. 2026-816 of 24 August 2026 and the university
websites analysis,
[Handicap.fr, 3 September 2026](https://informations.handicap.fr/a-accessibilite-numerique-ce-qui-change-en-france-et-en-ue-39631.php);
order of the Caen court of 4 June 2026,
[Handicap.fr](https://informations.handicap.fr/a-accessibilite-web-carrefour-condamne-par-la-justice-39309.php);
scope of the EAA for Swiss institutions,
[Oberson Abels, November 2025](https://obersonabels.com/wp-content/uploads/2025/11/OASA-Legal-Update-Accessibility-Act.pdf);
LHand revision,
[Federal Bureau for the Equality of People with Disabilities](https://www.ebgb.admin.ch/fr/loi-sur-legalite-pour-les-personnes-handicapees-lhand).
