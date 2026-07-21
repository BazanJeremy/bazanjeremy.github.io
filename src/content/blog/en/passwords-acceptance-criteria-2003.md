---
title: "\"Strong\" passwords: what if your acceptance criteria dated back to 2003?"
date: 2026-07-21
tag: "Security & QA"
excerpt: "NIST has inverted the rules inherited from 2003: composition banned, rotation forbidden, length first. How many test suites still validate the old model?"
lang: en
slug: passwords-acceptance-criteria-2003
translationSlug: mots-de-passe-criteres-2003
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

One uppercase letter, one digit, one special character. Renewal every 90 days.

I have come across this acceptance criterion on most of the applications I have tested. It reassures everyone: the product owner, the auditor, the user who feels they are doing the right thing. Just one problem — the source that inspired it has buried it.

## What NIST actually says

NIST — the American institute whose recommendations set the standard far beyond federal agencies — finalized revision 4 of its Digital Identity Guidelines (SP 800-63B-4) in July 2025. It does not soften the old rules: it inverts them.

- **Composition rules are banned.** Requiring an uppercase letter, a digit or a special character is no longer "discouraged": it is a SHALL NOT.
- **Periodic rotation is forbidden.** Forced changes are only legitimate on evidence of compromise — a database leak, fraudulent activity.
- **Length comes first.** A 15-character minimum when the password is the only authentication factor, 8 when it is backed by MFA. And the field must accept at least 64 characters: the passphrase becomes the norm.
- **Screening replaces composition.** Every candidate password is checked against a list of commonly used, expected or compromised values.
- **Password managers are allies.** Pasting must be allowed, Unicode accepted.
- **Security questions are out**, including for reset. "Your first pet's name" is not a secret.
- And a useful dose of lucidity: **a password is not phishing-resistant**. It is a security floor, not a ceiling.

## Why the old model failed

Not because of cryptography. Because of human behavior.

The story deserves to be known: composition rules and 90-day rotation go back to a 2003 NIST guide — eight pages written by an engineer named Bill Burr, which became the template for password policies worldwide. In 2017, Burr publicly admitted to the Wall Street Journal that he regretted most of his recommendations.

What those rules underestimated: faced with a composition constraint, users apply the minimal, predictable transformation — uppercase at the front, "1!" at the end. Faced with forced rotation, they increment the last digit. The outcome fits in an example NIST itself cites: `Password1!` satisfies every classic composition rule… and ranks among the most used passwords in the world.

Those rules measured compliance. Not security.

## The QA translation: what our tests should verify

This is where the topic becomes a testing topic. How many test suites still rigorously validate, on every pipeline, requirements the standard has inverted?

| Inherited requirement | NIST SP 800-63B-4 | The test case to write today |
|---|---|---|
| Uppercase, digit and special character required | Composition rules banned | A long passphrase with no special character is accepted |
| Forced expiry every 90 days | Change only on compromise | No periodic expiry; the forced change does trigger after a report |
| Field capped at 12-16 characters, paste blocked | At least 64 characters, paste allowed | A 64-character passphrase, pasted from a manager, with Unicode characters |
| No check against common passwords | Mandatory screening against a blocklist | `Password1!` is rejected — even though it ticks every old rule |
| Security questions for reset | Forbidden, including for reset | The reset flow relies on no knowledge-based question |
| Unlimited login attempts | Rate limiting required | Throttling kicks in and bounds guessing attacks |

Every line in the left-hand column is, somewhere right now, a test passing green. Green on an obsolete requirement.

## The real lesson goes beyond passwords

A requirement can outlive the source that produced it by years. And our test suites are the exact place where it fossilizes: automated, versioned, executed on every pipeline — never questioned.

A test that passes on an obsolete requirement does not produce quality. It produces false assurance.

That is why I consider reviewing acceptance criteria a testing act in its own right. In my practice, risk assessment starts at framing, across all the sprint's user stories — before the first line of code. Questioning how fresh a requirement is belongs to the same gesture: shift-left does not start at the code, it starts at the specification.

How old are the acceptance criteria on your authentication form?

---

### Sources

- NIST SP 800-63B-4, *Digital Identity Guidelines: Authentication and Authenticator Management* — final version, July 2025: [csrc.nist.gov/pubs/sp/800/63/b/4/final](https://csrc.nist.gov/pubs/sp/800/63/b/4/final)
- NIST SP 800-63 FAQ (detailed rationale for the revisions): [pages.nist.gov/800-63-FAQ](https://pages.nist.gov/800-63-FAQ/)
- Bill Burr interview, *The Wall Street Journal*, August 2017.
