---
title: "The same check was right, then wrong"
date: 2026-10-13
tag: "Test reliability"
excerpt: "The scroll reveal on my site never worked in production, and nobody noticed. The test suite I set up last week found it. Once the defect was fixed, the same check declared it dead a second time — wrongly. What that says about the trust we place in a test, especially one we did not write ourselves."
lang: en
slug: same-check-right-then-wrong
translationSlug: meme-verification-raison-puis-tort
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

My site has an animation: sections fade in as you scroll down the page. At least, that was the plan.

It never worked. Not a single day since the site went live in mid-July. I did not notice, and nobody told me: the content displayed normally, it simply arrived without the effect. A defect that takes nothing away goes unnoticed.

I found out on 8 October, while putting an automated test suite in place on the site — Playwright, with an Allure report. I did not write it: a coding agent did. I approved the plan, and every change waits for my go-ahead before it gets in. I also set one condition from the very first version, and it is the subject of this article: see every check fail before trusting it.

## The code was right, the file served was not

The animation's CSS rule came down to three declarations, all correct. But the site does not serve the source. It serves the minifier's output, and the minifier had merged two of them into a single `animation` shorthand, scroll-driven timeline included: a form the specification allows, but that none of the major browsers supports yet.

When that happens, the browser does not keep the parts it understands: it ignores the whole declaration. No animation at all.

The reviews read the source. The browser read the minified file. Nobody looked at the second one.

The fix is a few lines: write each property separately, which the minifier does not merge back. The test that guards it does what the browser does: it reads the CSS the build produces, not the source, and it blocks deployment.

## The same check, wrong this time

The fix still had to be checked on the real site, not on a local copy.

The check that had found the animation dead declared it dead a second time. Two runs out of two. Yet the CSS served was byte-for-byte identical to the local build. So it was not the site.

It was the test. The site has no JavaScript. With no script to hold it back, the browser can declare the document ready before the main stylesheet has loaded, and the test read the styles at that very moment. It only saw the small stylesheet embedded in the page, and concluded there was no animation. Locally, the server answers so fast that the stylesheet always arrives in time. The suite was green locally, green in continuous integration, and wrong on the real site.

The remedy waits for the stylesheet to be applied before reading anything. And when it is not, the failure message says the external stylesheet is not applied, instead of blaming the site. A test that blames the wrong culprit costs an investigation every time.

## Watching tests fail, on purpose

The condition I had set fits in one sentence: a green suite proves nothing about the suite. Every test file must have been seen red at least once, on a defect introduced deliberately and then removed. That is the principle of mutation testing, applied by hand: fourteen mutations for the first version of the suite, more since.

Most of them confirm what you expect: break something, it turns red. Some teach you something. Two examples.

Four mutations in a row on a module that transforms the tables in articles stayed green. The code was broken, and the suite saw nothing: it was testing HTML kept in a cache, not the modified code. Once the cache was cleared, the same mutations turned red immediately. Without them, that green would have passed for proof.

The second example is about accessibility. With the stylesheet cut off, the audit tool reported zero violations and 85 compliant elements. It was measuring the contrast of the browser's default black on white, on a bare page. What protects here is waiting for the stylesheet, not the audit.

The false alarm in production and these two mutations share the same shape. The assertion was not lying. The conditions it ran in decided its verdict, and you only find out by forcing the test to fail, or by running it where the truth lives.

## When you did not write the tests yourself

The agent wrote most of the suite in three days. Writing tests has become cheap. Trusting them has not.

What stayed with me is what cannot be delegated. Deciding what we test, and [what we do not](https://bazanjeremy.github.io/en/blog/testing-everything-is-impossible): no visual screen comparison, for instance, because reference images would not stay stable between my machine and continuous integration. Demanding proof that every check can fail. And settling what measurement does not settle: the accessibility tool refuses to rule on the contrast of ten elements on the home page. They stay marked "unknown", not "compliant". The decision is mine, and I have not made it yet.

A test I have never seen fail, I do not know what it checks. A test I have only run locally, I do not know where it is right.

And you — when did you last see one of your tests fail on purpose?

---

*The suite is public, mutations included: [tests/README.md](https://github.com/BazanJeremy/bazanjeremy.github.io/blob/main/tests/README.md), section "Prouver que les tests savent échouer" (in French). Sources: timelines in the `animation` shorthand and browser support, [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation); what `DOMContentLoaded` does not wait for, [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event).*
