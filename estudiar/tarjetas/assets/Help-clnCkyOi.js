import{$ as e,At as t,C as n,N as r,Tt as i,U as a,X as o,Z as s,at as c,ct as l,dt as u,ft as d,kt as f,mt as p,pt as m,q as h,wt as g,xt as _}from"./app-CcWWgWi0.js";import{m as v,o as y}from"./render-h8VF8ZLP.js";var b=`# Nenrin user guide

Nenrin (年輪, "tree rings") is a free flashcard app that schedules your reviews with FSRS, a modern spaced-repetition algorithm. It runs in your browser, works offline, and keeps everything on your device. You don't need an account.

The same guide is built into the app: open **Help** with the ? button in the header (or from the footer, Settings, or the command palette, <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd>).

1. [Getting started](getting-started.md): install the app, make your first deck, study for the first time
2. [Studying](studying.md): the four buttons, learning cards, daily limits, bury and suspend
3. [Making cards](making-cards.md): basic, reversed and cloze cards, Markdown, math, diagrams, images
4. [Make cards with an LLM](llm.md): a prompt for ChatGPT, Claude or Gemini, and a skill for Claude
5. [Moving from Anki](from-anki.md): import your decks and history, and what's different
6. [Preview and custom study](custom-study.md): flip through a deck, study extra, review ahead
7. [Keyboard shortcuts](keyboard.md)
8. [Backups and your data](backups.md): where your cards live, and how not to lose them
9. [FAQ](faq.md)
`,x=`# Backups and your data

## Where your cards live

Everything (decks, cards, images, audio and your review history) is stored in your browser on this device. Nothing is uploaded, and Nenrin has no servers or accounts. That's private and fast, but it means **you** keep the copies.

## Back up regularly

**Settings → Backup → Export backup** downloads one \`.json\` file with everything, including review history and media. **Restore from file** brings it back on this or another device.

- On iPhone and iPad, choose **Save to Files** and pick **iCloud Drive**, so the backup lives off the device.
- Nenrin reminds you on the home screen when your last backup is two weeks old.
- The command palette (<kbd>⌘K</kbd>) has **Export backup** too.

## Keep the browser from clearing your cards

Browsers may clear a site's data when space runs low. To prevent it:

- **Install Nenrin** to your home screen or dock (see [Getting started](getting-started.md)). On iPhone this matters most: Safari can clear data of sites you haven't visited for a while, but not of installed apps.
- In **Settings → Storage**, choose **Ask for persistent storage** if it isn't already on.

## Moving to a new device

Export a backup on the old device, open Nenrin on the new one, and use **Restore from file**. Sync between devices is planned but not here yet.
`,S=`# Preview and custom study

## Preview a deck

On a deck, choose **Preview** (or press <kbd>P</kbd>) to flip through every card in the order they were added. Nothing is scheduled.

<kbd>Space</kbd> shows the answer and then moves on; <kbd>←</kbd> and <kbd>→</kbd> go back and forward; <kbd>1</kbd> (**Again**) puts the card at the end to see once more.

**Edit** (<kbd>E</kbd>) opens the note and brings you back to the same card. **Delete** (<kbd>Delete</kbd>) removes the note, all its cards and their review history, after asking.

## Read through

To learn cards before you study them, choose **Read through** next to **Study now** (or press <kbd>R</kbd> on a deck). It's a preview where every card shows its front and back together, so <kbd>Space</kbd> or <kbd>→</kbd> just moves to the next card. Nothing is scheduled.

In any preview or practice session, **Both sides** (<kbd>B</kbd>) switches between this and flipping each card.

## Custom study

On a deck, choose **Custom study** (or press <kbd>C</kbd>). It's also offered when you finish a deck for the day.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/custom-dark.webp"><img src="images/custom-light.webp" alt="The Custom study screen: more cards today, and the kinds of study session" width="300"></picture>

**More cards today** raises today's limit of new cards or reviews for this deck. Tomorrow the limits go back to the deck's settings.

**Study session** gathers a set of cards for one session:

- **Preview the deck:** every card, in the order added
- **Preview new cards:** cards you haven't studied, optionally only recent ones
- **Review forgotten cards:** cards you answered Again in the last few days
- **Review ahead:** cards due in the next few days
- **Study by tag:** cards with any of the tags you list

Choose how many cards and their order (as added, by due date, or random), and whether **answers count as reviews**:

- **On:** each answer is scheduled by FSRS like a normal review.
- **Off:** practice only. Nothing is saved and no due dates change.

A session remembers your place, so you can edit a card or reload the page and carry on.
`,C=`# FAQ

**Is Nenrin free?** Yes, and [open source](https://github.com/parmsam/nenrin) under the MIT license. There are no accounts, ads or limits.

**Does it work offline?** Yes. After the first visit, everything works without a connection, including importing and studying.

**Why did a card come back so soon?** You probably pressed **Again** or **Hard**, or it's a new card still in its first learning steps (minutes apart). Cards you know well come back after days, then weeks and months.

**I have too many reviews. What should I do?** Keep up a little every day rather than catching up all at once, and lower **New cards / day** in the deck's settings for a while. Fewer new cards today means fewer reviews next week.

**What's FSRS?** The _Free Spaced Repetition Scheduler_, an open algorithm that predicts when you'll forget each card from your past answers. Anki uses it too. With enough reviews, **Optimize** fits it to your own memory.

**Will my Anki progress come over?** Yes, if you export with scheduling: due dates, FSRS memory and review history are imported. See [Moving from Anki](from-anki.md).

**Can I use it on my phone and computer?** Yes, but each device keeps its own cards for now. Move them with a backup file. Sync is planned.

**Does Nenrin use AI?** No. You can use any LLM yourself to write cards and paste them in; see [Make cards with an LLM](llm.md).

**Something's wrong or missing.** Please [open an issue](https://github.com/parmsam/nenrin/issues).
`,w=`# Moving from Anki

## Import your decks

In Anki, use **File → Export**:

- **One deck:** choose _Anki Deck Package (.apkg)_. Tick _Include scheduling information_ to keep your progress, and _Include media_.
- **Everything:** choose _Anki Collection Package (.colpkg)_. Importing a collection **replaces** all decks and cards in Nenrin (your Nenrin backups and settings are kept), the way Anki does.

Then in Nenrin choose **Import** (<kbd>I</kbd>) and pick the file. Nenrin reads it on your device and shows what's inside before anything is saved.

On a computer you can also drop the file onto the Import page. On iPhone and iPad, first save the file to the Files app: a downloaded deck is already in **Downloads**, or use **Share → Save to Files** and pick **iCloud Drive** (which also puts it on your other devices). Then in Nenrin tap **Choose a file…**, then **Browse**, and open it. iPhone doesn't let web apps appear in the Share menu, so Nenrin can't be a Share target there.

On Android, and in Chrome or Edge on a computer, an installed Nenrin is in the **Share** menu: share a deck or text file to Nenrin and it opens on the Import page.

With scheduling on, cards keep their due dates and FSRS memory, and your review history comes along, so stats, streaks and the optimizer work right away. Without it, every card starts as new, which is usually right for a deck someone shared.

Importing a newer version of the same deck later updates changed notes, adds new cards, and keeps your progress.

Shared decks kept on GitHub in **CrowdAnki** format (for example [Ultimate Geography](https://github.com/anki-geo/ultimate-geography)) import too: choose the release \`.zip\`. Text files (\`.txt\`, \`.csv\`, \`.tsv\`, including Anki's _Notes in Plain Text_) work as well.

## What carries over

- Note types with their fields, templates and styling (kept inside the card, so it can't restyle the app)
- Sub-decks, tags, images and audio
- Furigana, hints, \`{{Tags}}\`, \`{{Deck}}\` and the other template features most decks use

## What's different

- **No add-ons, and no sync yet.** Nenrin keeps your cards on one device; see [Backups and your data](backups.md).
- **Filtered decks** become [custom study](custom-study.md) sessions; their cards return to their home decks on import.
- Imported learning cards restart their learning steps (their due time is kept).

## Going back

Choose **Export…** on a deck (or **Settings → Import and export → Export…** for every deck), then:

- **Anki package (.apkg):** notes, cards, sub-decks and media. Open it in Anki with _File → Import_. With **Include my progress** on, due dates, FSRS memory states and your review history come along, so Anki carries on where Nenrin left off. Turn it off to share a deck with someone else: every card starts as new.
- **Notes as text (.txt):** Anki's _Notes in Plain Text_, with note types, decks, tags and IDs.

Markdown becomes HTML and math becomes Anki's \`\\(…\\)\` and \`\\[…\\]\`. Notes keep their IDs, so exporting again updates the notes in Anki instead of duplicating them. Nenrin's built-in note types may show up in Anki as _Basic+_ or _Cloze+_ next to Anki's own.
`,T=`# Getting started

## Open or install Nenrin

Nenrin is a web app at [parmsam.github.io/nenrin](https://parmsam.github.io/nenrin/). After the first visit it works offline.

Installing it puts an icon on your home screen or dock, opens it in its own window, and protects your cards from the browser's storage clean-ups:

- **iPhone and iPad (Safari):** tap Share, then **Add to Home Screen**.
- **Android (Chrome):** open the menu, then **Install app** (or **Add to Home screen**).
- **Mac (Safari):** **File → Add to Dock**. **Chrome or Edge on any computer:** the install icon at the right of the address bar.

## Your first deck

On the first visit you have three ways to start:

<picture><source media="(prefers-color-scheme: dark)" srcset="images/start-dark.webp"><img src="images/start-light.webp" alt="The first-run screen with three choices: Import from Anki, Take the tour, Start from scratch" width="300"></picture>

- **Coming from Anki?** Choose **Import from Anki** and pick an \`.apkg\` or \`.colpkg\` file. See [Moving from Anki](from-anki.md).
- **Just looking?** Add the **Nenrin tour** sample deck. Its cards show you around the app as you study them.
- **Starting fresh?** Name a deck, then **Add cards**. Or let an LLM write them for you: see [Make cards with an LLM](llm.md).

## Welcome tips

Short tips on the main screens explain the name (Nenrin, 年輪, means "tree rings") and what each screen is for. Close one with **×**, or choose **Hide all tips**. To see them all again, turn on **Settings → Show welcome tips**.

## Your first study session

Open a deck and choose **Study now** (or press <kbd>S</kbd>).

1. Read the question and try to recall the answer.
2. Press **Show answer** (<kbd>Space</kbd>).
3. Rate how it went: **Again**, **Hard**, **Good** or **Easy** (<kbd>1</kbd>–<kbd>4</kbd>). Each button shows when you'll see the card next.

Be honest: if you didn't remember, press **Again**. The scheduler learns from your answers, and wrong guesses about yourself only cost you time later. See [Studying](studying.md) for what each button means.

## Come back tomorrow

A few minutes a day is the whole trick. The home screen shows how many cards are waiting and your streak, next to your tree: a cross-section where each ring is a day you studied, wider on days with more reviews. The trunk grows as the days add up; older days darken into heartwood at the center, and a break of more than a week leaves a dark scar. Today's ring closes around the outside as you finish today's cards. New days start at 4 AM by default; you can change that in **Settings → Studying**.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/home-dark.webp"><img src="images/home-light.webp" alt="The home screen: a tree cross-section of study days, the number of cards to study, and the Study now button" width="300"></picture>

## Get a daily reminder

In **Settings → Study reminder**, pick a time, then:

- **Add to calendar** downloads a daily event with an alert for your calendar app. It's the most reliable reminder, and the one to use on iPhone.
- **Also notify me** shows a notification at that time if cards are due and you haven't studied yet. It works while Nenrin is open, for example in a background tab. As an installed app in Chrome or Edge, the browser may also check now and then while it's closed. Nenrin has no server, so it can't wake your device on its own.
`,E=`# Keyboard shortcuts

Press <kbd>?</kbd> anywhere in Nenrin to see this list. On a Mac, <kbd>⌘</kbd> is the command key; elsewhere use <kbd>Ctrl</kbd>.

## Everywhere

| Keys           | Action                                       |
| -------------- | -------------------------------------------- |
| <kbd>⌘K</kbd>  | Command palette: jump anywhere, run anything |
| <kbd>?</kbd>   | Show keyboard shortcuts                      |
| <kbd>D</kbd>   | Decks (home)                                 |
| <kbd>A</kbd>   | Add cards                                    |
| <kbd>B</kbd>   | Browse notes                                 |
| <kbd>T</kbd>   | Stats                                        |
| <kbd>I</kbd>   | Import                                       |
| <kbd>⌘,</kbd>  | Settings                                     |
| <kbd>Esc</kbd> | Close a dialog                               |

## Decks

| Keys         | Action                                                   |
| ------------ | -------------------------------------------------------- |
| <kbd>S</kbd> | Study (the deck you're on, or the one with the most due) |
| <kbd>R</kbd> | Read through: every card with front and back together    |
| <kbd>P</kbd> | Preview every card in the deck                           |
| <kbd>C</kbd> | Custom study                                             |

## Reviewing

| Keys                                                | Action                                   |
| --------------------------------------------------- | ---------------------------------------- |
| <kbd>Space</kbd> or <kbd>Enter</kbd>                | Show answer, then rate Good              |
| <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> | Again, Hard, Good, Easy                  |
| <kbd>Z</kbd> or <kbd>⌘Z</kbd>                       | Undo last rating, bury or suspend        |
| <kbd>-</kbd>                                        | Bury card until tomorrow                 |
| <kbd>=</kbd>                                        | Bury note (all its cards) until tomorrow |
| <kbd>@</kbd>                                        | Suspend card                             |
| <kbd>!</kbd>                                        | Suspend note                             |
| <kbd>R</kbd>                                        | Replay audio                             |
| <kbd>E</kbd>                                        | Edit current note                        |
| <kbd>Esc</kbd>                                      | Back to deck                             |

## Preview and custom study

| Keys                                 | Action                                    |
| ------------------------------------ | ----------------------------------------- |
| <kbd>Space</kbd> or <kbd>Enter</kbd> | Show answer, then next card               |
| <kbd>←</kbd> <kbd>→</kbd>            | Previous / next card (preview)            |
| <kbd>1</kbd>                         | Again: see it again later in this session |
| <kbd>B</kbd>                         | Both sides: show front and back together  |
| <kbd>E</kbd>                         | Edit current note                         |
| <kbd>Delete</kbd>                    | Delete current note (asks first)          |

## Browsing

| Keys                         | Action                              |
| ---------------------------- | ----------------------------------- |
| <kbd>/</kbd>                 | Focus the search box                |
| <kbd>↓</kbd> or <kbd>J</kbd> | Next note                           |
| <kbd>↑</kbd> or <kbd>K</kbd> | Previous note                       |
| <kbd>Enter</kbd>             | Edit the focused note               |
| <kbd>X</kbd>                 | Select or unselect the focused note |

## Game controller

Connect a controller (Bluetooth or USB) and press any button; Nenrin picks it up. The face buttons follow the rating order. These are the defaults; change them in **Settings → Game controllers and remotes**.

| Button                                  | Action                                                 |
| --------------------------------------- | ------------------------------------------------------ |
| <kbd>Ⓐ</kbd>                            | Show answer, then rate Good (on other screens: study)  |
| <kbd>Ⓑ</kbd>                            | Again (with a short rumble, if the controller has one) |
| <kbd>Ⓧ</kbd>                            | Hard                                                   |
| <kbd>Ⓨ</kbd>                            | Easy                                                   |
| <kbd>LB</kbd>                           | Undo                                                   |
| <kbd>RB</kbd>                           | Replay audio                                           |
| <kbd>D-pad ↑</kbd> / <kbd>D-pad ↓</kbd> | Scroll a long card                                     |
| <kbd>D-pad ←</kbd> / <kbd>D-pad →</kbd> | Previous / next card (preview)                         |
| <kbd>View</kbd>                         | Back to deck                                           |

PlayStation controllers work the same way: ✕ is Ⓐ, ○ is Ⓑ, □ is Ⓧ and △ is Ⓨ.

## Page turners, clickers and media keys

Bluetooth page turners and presentation clickers send keys, so they work without setup:

| Key                                 | Action                                                    |
| ----------------------------------- | --------------------------------------------------------- |
| <kbd>PageDown</kbd> or <kbd>⏯</kbd> | Show answer, then rate Good                               |
| <kbd>PageUp</kbd>                   | Again (in preview: previous card)                         |
| <kbd>→</kbd> / <kbd>←</kbd>         | While reviewing: Good / Again (many clickers send arrows) |

Media keys (play/pause, next, previous) work where the browser passes them to the page.

## Adding and editing

| Keys              | Action                    |
| ----------------- | ------------------------- |
| <kbd>⌘Enter</kbd> | Add or save               |
| <kbd>⌘⇧C</kbd>    | Wrap selection in a cloze |
`,D=`# Make cards with an LLM

Any chat LLM (ChatGPT, Claude, Gemini, a local model) can write cards for you in a format Nenrin reads. There are two ways:

- **With your own API key**, Nenrin asks the model for you, right in **Add cards**.
- **With the prompt or the skill**, you copy instructions into your chat app and paste the reply back. Nenrin sends nothing anywhere.

## With your own API key

1. In **Settings → AI card generation**, choose a provider: **Anthropic (Claude)**, or **OpenAI or compatible** (OpenAI, OpenRouter, or a model on your own computer through Ollama or LM Studio). Enter your API key and, if you like, a model, then **Save**.
2. In **Add cards**, switch to **Paste** and open **Generate from text with AI**.
3. Paste your notes, a textbook section or an article. Choose question-and-answer or cloze cards (or let the model decide) and roughly how many, then press **Generate**.
4. The cards land in the Markdown box. Check them in the preview, fix or delete what's wrong, pick a deck, and press **Add**.

What gets sent: only the text you paste in, with the card-writing instructions, straight from your device to the provider you chose. Nenrin has no server. The provider bills your account. Your key is stored on this device only and is never included in backups; **Remove key** in Settings deletes it.

## With the prompt

1. Open **Settings → Make cards with an LLM** and choose **Copy prompt**. (Also in the command palette, and next to the Paste box in **Add cards**.)
2. Paste it into your LLM. Replace the last line with your notes, an article, or a topic, and say anything about your level or focus.
3. Copy the reply, the whole code block, including the \` \`\`\`\` \` lines.
4. In **Add cards**, switch to **Paste** and paste it. Check the detected cards and the preview, pick a deck, and press **Add**.

The prompt asks for one card per idea, short answers and enough context, and it tells the LLM to leave out facts it isn't sure of. Still check the cards: LLMs make mistakes.

## With the skill (Claude)

**Download skill (.zip)** gives you \`nenrin-cards\`, an [Agent Skill](https://agentskills.io) with the same instructions. Once it's installed, just ask Claude for flashcards about something.

- **Claude apps:** upload the zip in Claude's settings, where skills are listed.
- **Claude Code:** unzip it into \`~/.claude/skills/\`.
`,O='# Making cards\n\nOpen a deck and choose **Add cards** (or press <kbd>A</kbd> anywhere). Pick the deck and the type, fill in the fields, and press **Add** (<kbd>⌘Enter</kbd> / <kbd>Ctrl+Enter</kbd>). The preview shows the front and back as you type.\n\n<picture><source media="(prefers-color-scheme: dark)" srcset="images/add-dark.webp"><img src="images/add-light.webp" alt="Adding a cloze card: the text field with two hidden parts, and a live preview below" width="300"></picture>\n\n## Card types\n\n- **Basic:** a front and a back.\n- **Basic (and reversed card):** two cards, front → back and back → front. Good for vocabulary.\n- **Basic (optional reversed card):** like the reversed type, but the back → front card is made only when you type something (anything, such as `y`) in **Add Reverse**. Good when only some notes deserve both directions.\n- **Basic (type in the answer):** you type the answer before you see it, and Nenrin shows what you got right and wrong. Good for spelling and short exact answers.\n- **Cloze:** a sentence with parts hidden. Wrap each hidden part in `{{c1::…}}`. Use `c2`, `c3` … to make one card per part; parts with the same number are hidden together. Select text and press <kbd>⌘⇧C</kbd> / <kbd>Ctrl+Shift+C</kbd> to wrap it.\n\n  `The {{c1::mitochondria}} produce most of the cell\'s {{c2::ATP}}.` makes two cards.\n\n## Your own note types\n\n**Settings → Manage note types** (or _Note types_ in the command palette) lists every note type, with how many notes use it. Built-in types can\'t be changed; **Clone** one to make your own, then:\n\n- **Fields:** rename, reorder (↑ ↓), add or remove them. Renaming a field keeps every note\'s text and updates the templates that use it.\n- **Cards:** each card type has a front and back template. Fields go in double braces, like `{{Front}}`; `{{FrontSide}}` repeats the front on the back; `{{#Field}}…{{/Field}}` shows something only when the field has text. Add a card type to make another card from every note, or remove one to delete those cards.\n- **Styling:** CSS for the cards, applied only inside them.\n\nThe preview shows your first note of that type with the changes. **Save** applies everything at once. If saving would delete cards (and their review history) or text in removed fields, Nenrin says how much and asks first. A note type with no notes can be deleted.\n\nImported Anki note types can be edited directly.\n\n## Image occlusion\n\nHide parts of a picture and test yourself on them: labels on a diagram, bones, countries on a map.\n\n1. In **Add cards**, choose the **Image Occlusion** type.\n2. **Choose an image** (or paste one).\n3. Drag over each part to hide. Each mask becomes its own card, numbered on the image. Select a mask (click it, or Tab to it) and press **Delete mask** or <kbd>Delete</kbd> to remove it.\n4. Pick how cards look while you study:\n   - **Hide all, guess one:** every mask stays covered, and the one to guess is red. Best when the parts give each other away.\n   - **Hide one, guess one:** only the mask to guess is covered.\n5. Add a **Header** (shown above the image) and **Back Extra** (shown with the answer) if you like, then **Add**.\n\nOn the answer side, the mask you guessed turns into a dashed outline so you can see what was under it. Image occlusion notes from Anki import as they are, and export back to Anki as Anki\'s own image occlusion type.\n\n## Formatting\n\nFields use [Markdown](https://commonmark.org/help/): `**bold**`, `*italic*`, lists, `` `code` ``, tables and links.\n\n- **Math:** `$E = mc^2$` inline, or `$$…$$` on its own line, written in LaTeX. Anki\'s `\\(…\\)` and `\\[…\\]` work too, and so do its older `[$]…[/$]`, `[$$]…[/$$]` and `[latex]…[/latex]`, common in imported decks.\n- **Diagrams:** a [Mermaid](https://mermaid.js.org/intro/syntax-reference.html) code block draws a diagram that follows your theme:\n\n  ````markdown\n  ```mermaid\n  flowchart LR\n    Learn --> Review --> Remember\n  ```\n  ````\n\n- **Typst:** for math and layouts beyond LaTeX math (tables, aligned derivations, chemistry and more), put [Typst](https://typst.app/docs/) in a ` ```typst ` code block. Typst\'s compiler is a one-time download of about 32 MB, so it\'s off until you choose **Settings → Typst → Enable Typst** on each device. After that it works offline. Without it, the card shows the Typst source with a hint. Typst packages (`@preview/…`) aren\'t available.\n\n  ````markdown\n  ```typst\n  $ integral_0^oo e^(-x^2) dif x = sqrt(pi) / 2 $\n  ```\n  ````\n\n- **Images:** paste an image into a field. It\'s stored with your cards and works offline.\n\n## Paste mode\n\nSwitch the editor to **Paste** to turn a block of text into cards. Nenrin splits it for you:\n\n- `Q:` / `A:` lines (or `Question:` / `Answer:`, `Front:` / `Back:`)\n- a line with just `---` between front and back\n- a heading as the front and the rest as the back\n- `{{c1::…}}` anywhere makes a cloze card\n\nSeveral cards at once work too: repeated `Q:`/`A:` pairs, a two-column table, or several cloze paragraphs separated by blank lines. A last line like `Tags: biology exam` tags every card. This is the format to ask an LLM for: see [Make cards with an LLM](llm.md).\n\n## Editing and finding notes\n\n**Browse** (<kbd>B</kbd>) lists every note with Anki-style search: words, `"exact phrases"`, `-exclude`, `deck:Spanish`, `tag:verbs`, `is:due`, `is:new`, `is:suspended`, `added:7` and `*` wildcards. Select notes (<kbd>X</kbd>) to suspend, move, tag or delete them together.\n',k=`# Studying

## The four buttons

After you reveal the answer, rate how well you remembered it:

<picture><source media="(prefers-color-scheme: dark)" srcset="images/review-dark.webp"><img src="images/review-light.webp" alt="A card's answer with the Again, Hard, Good and Easy buttons, each showing when the card comes back" width="300"></picture>

| Button    | Key          | Use it when                                    | What happens                                                           |
| --------- | ------------ | ---------------------------------------------- | ---------------------------------------------------------------------- |
| **Again** | <kbd>1</kbd> | You forgot, or got it wrong                    | You'll see it again in a few minutes, and its next interval is shorter |
| **Hard**  | <kbd>2</kbd> | You remembered, but it was a real struggle     | A shorter interval than Good                                           |
| **Good**  | <kbd>3</kbd> | You remembered with some effort (most answers) | The normal next interval                                               |
| **Easy**  | <kbd>4</kbd> | It was effortless                              | A longer interval                                                      |

**Good** should be your usual answer. <kbd>Space</kbd> both reveals the answer and, pressed again, rates **Good**.

The small times above the buttons (like \`10m\`, \`3d\`, \`1.2mo\`) say when you'd see the card next with each choice.

## Typing the answer

Some cards ask you to type the answer (the **Basic (type in the answer)** note type, or Anki cards with \`{{type:…}}\`). Type it and press <kbd>Enter</kbd> to show the answer: what you typed appears above the correct answer, with wrong letters struck through in red and missed ones underlined. Case and accents count; extra spaces don't. Then rate yourself as usual: the comparison is a hint, the rating is your call.

## New, learning and review cards

The three numbers on a deck count today's cards:

- **Blue: new.** Cards you haven't studied yet. Each deck shows up to 20 a day by default.
- **Red: learning.** Cards you're learning or relearning today. They come back after a few minutes.
- **Green: review.** Cards you've learned that are due today. Up to 200 a day by default.

While you review, the same three numbers in the header count down what's left. Prefer a progress bar? Pick one in **Settings → Studying → Progress while reviewing**: a bar on its own, or with a percentage (40%) or a fraction (4 / 10). Cards you get wrong come back, so progress can step back a little.

You can change the daily limits, and the **desired retention** (how likely you want to be to remember a card when it comes due, 90% by default), under each deck's **Settings**. Higher retention means more reviews.

## How scheduling works

Nenrin uses [FSRS](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm), the same scheduler as modern Anki. It estimates how well you know each card and shows it again when you're about to forget it. Cards you know well come back after weeks or months; hard ones come back sooner.

After a few hundred reviews you can tune FSRS to your own memory: open a deck's **Settings → Optimize for my reviews**. It runs on your device.

## Undo, edit, bury and suspend

While reviewing:

- **Undo** (<kbd>Z</kbd>) takes back your last rating, bury or suspend.
- **Edit** (<kbd>E</kbd>) opens the current note, then brings you back.
- **Bury** hides a card until tomorrow: <kbd>-</kbd> for this card, <kbd>=</kbd> for every card of the note.
- **Suspend** hides a card until you unsuspend it in **Browse**: <kbd>@</kbd> for this card, <kbd>!</kbd> for the whole note.
- The **⋯** button has bury and suspend for mouse and touch.

Cards made from the same note (like the two directions of a reversed card) are spread over different days automatically.

## Rewards (optional)

Turn on **Settings → Appearance → Rewards** for a few quiet extras built around the tree. They count showing up and finishing, never which button you press, so they never tempt you to rate a card **Good** when it was **Again**.

- **Session marks:** as a review session grows, a mark appears next to the counts: <span lang="ja">木</span> (a tree) at 10 cards, <span lang="ja">林</span> (a grove) at 25, <span lang="ja">森</span> (a forest) at 50, then 100 and 200 with rings around it. Turn on the wood-block sound in the same place if you like.
- **Stamp book** (<span lang="ja">御朱印帳</span>), in **Stats**: a red seal on each day you finished everything due, and a light mark on days you studied. A missed day is just blank; nothing is taken away.
- **Milestones** (<span lang="ja">節目</span>): your first review, seven study days, the tree's first heartwood, a year of study, coming back after a long break, and 100, 1,000 and 10,000 mature cards. They show in the stamp book, and on "Done for now" the day you reach one.
- **Seasons:** the tree on the home screen gets cherry blossom in spring, leaves in summer, maple in autumn and snow in winter (northern-hemisphere seasons).

## Controllers and page turners

You can study without a keyboard: with a game controller (Ⓐ shows the answer and then rates Good, Ⓑ is Again, Ⓧ Hard, Ⓨ Easy), or with a Bluetooth page turner or presentation clicker (Page Down shows the answer and then rates Good, Page Up is Again). See [Keyboard shortcuts](keyboard.md) for every button, and **Settings → Game controllers and remotes** to change them.

## Audio

Cards with audio play it when they appear, and the answer's audio when you reveal it. <kbd>R</kbd> replays it. You can turn autoplay off in **Settings → Studying**. On iPhone, Safari may block autoplay; tap the player or press <kbd>R</kbd>.
`,A=new URL(`add-dark-CX5JqGOp.webp`,import.meta.url).href,j=new URL(`add-light-BENPULFY.webp`,import.meta.url).href,M=new URL(`custom-dark-CtFRGF8b.webp`,import.meta.url).href,N=new URL(`custom-light-JMi-VsyW.webp`,import.meta.url).href,P=new URL(`home-dark-DLUbTgs9.webp`,import.meta.url).href,ee=new URL(`home-light-BKvLeHq3.webp`,import.meta.url).href,F=new URL(`review-dark-iyb5fv6r.webp`,import.meta.url).href,I=new URL(`review-light-Cn3hd7a5.webp`,import.meta.url).href,L=new URL(`start-dark-BKWhxC9e.webp`,import.meta.url).href,R=new URL(`start-light-GTDEwMwd.webp`,import.meta.url).href,z=Object.assign({"../../docs/guide/README.md":b,"../../docs/guide/backups.md":x,"../../docs/guide/custom-study.md":S,"../../docs/guide/faq.md":C,"../../docs/guide/from-anki.md":w,"../../docs/guide/getting-started.md":T,"../../docs/guide/keyboard.md":E,"../../docs/guide/llm.md":D,"../../docs/guide/making-cards.md":O,"../../docs/guide/studying.md":k}),B=Object.assign({"../../docs/guide/images/add-dark.webp":A,"../../docs/guide/images/add-light.webp":j,"../../docs/guide/images/custom-dark.webp":M,"../../docs/guide/images/custom-light.webp":N,"../../docs/guide/images/home-dark.webp":P,"../../docs/guide/images/home-light.webp":ee,"../../docs/guide/images/review-dark.webp":F,"../../docs/guide/images/review-light.webp":I,"../../docs/guide/images/start-dark.webp":L,"../../docs/guide/images/start-light.webp":R}),V=Object.entries(z).map(([e,t])=>({slug:e.split(`/`).pop().replace(/\.md$/,``),title:/^#\s+(.+)$/m.exec(t)?.[1].trim()??`Help`,markdown:t}));function H(){return[...(U(`README`)?.markdown??``).matchAll(/\]\(([\w-]+)\.md\)/g)].map(e=>e[1]).map(U).filter(e=>!!e)}function U(e){return V.find(t=>t.slug===e)}function W(e){let t=v.parse(K(e.markdown),{async:!1});return y(t).replace(/<a href="([^"]+)"/g,(e,t)=>{let n=/^([\w-]+)\.md(?:#[\w-]*)?$/.exec(t);return n?`<a href="#/help/${n[1]===`README`?``:n[1]}"`:/^https?:/.test(t)?`<a target="_blank" rel="noreferrer" href="${t}"`:e})}var G=/<picture><source media="\(prefers-color-scheme: dark\)" srcset="images\/([\w-]+\.webp)"><img src="images\/([\w-]+\.webp)" alt="([^"]*)"[^>]*><\/picture>/g;function K(e){return e.replace(G,(e,t,n,r)=>{let i=(e,t)=>`<img class="shot shot-${t}" src="${q(e)}" alt="${r}">`;return i(n,`light`)+i(t,`dark`)})}function q(e){return B[`../../docs/guide/images/${e}`]}var J=e(`<a href="#/help">Help</a> / <span aria-current="page"> </span>`,1),Y=e(`<span aria-current="page">Help</span>`),X=e(`<h2>Page not found</h2> <p><a href="#/help">See all help pages</a></p>`,1),Z=e(`<a class="svelte-fjjr6b"> </a>`),Q=e(`<a href="#/help" class="svelte-fjjr6b">← Contents</a>`),$=e(`<a class="next svelte-fjjr6b"> </a>`),te=e(`<article class="guide svelte-fjjr6b"></article> <nav class="pager svelte-fjjr6b" aria-label="Guide pages"><!> <!></nav>`,1),ne=e(`<article class="guide svelte-fjjr6b"></article> <p class="muted small svelte-fjjr6b">Also on <a href="https://github.com/parmsam/nenrin/tree/main/docs/guide">GitHub</a>.</p>`,1),re=e(`<nav class="crumbs muted" aria-label="Breadcrumb"><a href="#/">Decks</a> / <!></nav> <!>`,1);function ie(e,v){i(v,!0);let y=n(v,`slug`,3,``),b=H(),x=_(()=>y()?U(y()):void 0),S=_(()=>c(x)?b.findIndex(e=>e.slug===c(x).slug):-1),C=U(`README`);var w=re(),T=d(w),E=p(u(T),2),D=e=>{var t=J(),n=p(d(t),2),r=m(n,!0);l(()=>o(r,c(x).title)),s(e,t)},O=e=>{var t=Y();s(e,t)};h(E,e=>{c(x)?e(D):e(O,-1)}),t(T);var k=p(T,2),A=e=>{var t=X();f(2),s(e,t)},j=e=>{var n=te(),i=d(n);a(i,()=>W(c(x)),!0),t(i);var f=p(i,2),g=u(f),_=e=>{var t=Z(),n=m(t);l(()=>{r(t,`href`,`#/help/${b[c(S)-1].slug??``}`),o(n,`← ${b[c(S)-1].title??``}`)}),s(e,t)},v=e=>{var t=Q();s(e,t)};h(g,e=>{c(S)>0?e(_):e(v,-1)});var y=p(g,2),C=e=>{var t=$(),n=m(t);l(()=>{r(t,`href`,`#/help/${b[c(S)+1].slug??``}`),o(n,`${b[c(S)+1].title??``} →`)}),s(e,t)};h(y,e=>{c(S)>=0&&c(S)<b.length-1&&e(C)}),t(f),s(e,n)},M=e=>{var n=ne(),r=d(n);a(r,()=>W(C),!0),t(r),f(2),s(e,n)};h(k,e=>{y()&&!c(x)?e(A):c(x)?e(j,1):C&&e(M,2)}),s(e,w),g()}export{ie as default};