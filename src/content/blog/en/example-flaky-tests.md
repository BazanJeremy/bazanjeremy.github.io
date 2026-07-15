---
title: "[EXAMPLE] Taming flaky tests with CI history analysis"
date: 2026-07-02
tag: "Test reliability"
excerpt: "A demo article — replace the title, summary and body with your own notes. The content is Markdown."
lang: en
slug: example-flaky-tests
linkedin: https://www.linkedin.com/in/jeremy-bazan
draft: false
---

> **This is an example article.** It shows the layout. Replace it (or delete it)
> and add your real notes in `src/content/blog/en/`. Each `.md` file becomes a
> `/en/blog/<slug>` page.

## The problem

A *flaky* test fails without any code change. Instead of re-running it on loop,
query the CI history to separate noise from real signal.

## A deterministic baseline

The analysis starts without AI: a plain failure rate over the recent window.

```python
def flakiness(runs):
    fails = [r for r in runs if r.status == "fail"]
    return len(fails) / len(runs)
```

The AI layer stays **optional**: it explains, it does not decide. QA keeps the
final call.

## What you can put here

- lists,
- `inline code`,
- links to your repos or a LinkedIn post,
- section headings.

Happy watching.
