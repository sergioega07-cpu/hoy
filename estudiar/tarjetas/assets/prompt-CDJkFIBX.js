import{Nt as e}from"./app-CcWWgWi0.js";var t=e({CARD_RULES:()=>n,SKILL_NAME:()=>i,cardPrompt:()=>r,skillMarkdown:()=>a}),n=`## How to write good cards

- One idea per card. Split lists and multi-part facts into several cards.
- Ask a specific question with one clear answer. Avoid yes/no questions.
- Keep answers short: a word, a phrase, or one sentence. Put extra detail after the answer.
- Use cloze deletions for definitions, sentences and facts in context.
- Give context so the card makes sense on its own months later (the subject, a unit, a date).
- Prefer understanding over trivia: ask why and how, not only what.
- Don't invent facts. If unsure, leave the card out.

## Output format (Nenrin reads this exactly)

Reply with only the cards, in one code block fenced with four backticks (\`\`\`\`markdown), so it
copies cleanly. Use one of these layouts per reply, not a mix:

**Question and answer cards**: one pair per card, a blank line between pairs.

\`\`\`\`markdown
Q: What does FSRS stand for?
A: Free Spaced Repetition Scheduler

Q: Why do spaced reviews beat cramming?
A: Recalling just before you'd forget strengthens memory the most.

Tags: memory fsrs
\`\`\`\`

**Cloze cards**: one paragraph per card, a blank line between them. Hide each answer as
{{c1::answer}}; use c2, c3 … in the same paragraph to make one card per hidden part.

\`\`\`\`markdown
The {{c1::mitochondria}} produce most of the cell's {{c2::ATP}}.

{{c1::Canberra}} is the capital of Australia.

Tags: biology geography
\`\`\`\`

**A two-column table** also works: the first column is the front, the second the back.

Formatting inside a card:

- Markdown: **bold**, *italic*, lists, \`code\`, links.
- Math: $inline$ or $$display$$ (KaTeX / LaTeX syntax).
- Diagrams: a \`\`\`mermaid code block inside the card (flowchart, sequence, etc.).
- Tags: one last line \`Tags: a b c\`, applying to every card in the reply. Use \`::\` for
  hierarchy, e.g. \`spanish::verbs\`. No spaces inside a tag.`;function r(){return`You are helping me make flashcards for Nenrin, a spaced-repetition app (like Anki).

${n}

## My request

Make about 15 cards from the material below. Pick the most important ideas first.

[Paste your notes, an article, or a topic here. Mention your level and anything to focus on.]`}var i=`nenrin-cards`;function a(){return`---
name: ${i}
description: Write spaced-repetition flashcards (question/answer or cloze) from notes, articles or a topic, formatted to paste into the Nenrin app (Add cards → Paste). Use when the user asks for flashcards, Anki-style cards, cloze deletions, or a deck to study.
---

# Nenrin flashcards

Turn the user's material into flashcards they can paste into Nenrin (Add cards → Paste,
then Add). Ask for the material if none is given. Unless the user says otherwise, make
about 15 cards and cover the most important ideas first.

${n}

## After the cards

In one or two sentences outside the code block, say what you left out, if anything, and
offer to make more cards or a cloze version.
`}export{r as n,t as r,n as t};