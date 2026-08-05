---
name: start
description: "First-time onboarding â€” asks where you are, then guides you to the right workflow. No assumptions."
argument-hint: "[no arguments]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, AskUserQuestion
model: sonnet
---

# Guided Onboarding

This skill writes one file: `production/review-mode.txt` (review mode config set in Phase 3b).

This skill is the entry point for new users. It does NOT assume you have a game idea, an engine preference, or any prior experience. It asks first, then routes you to the right workflow.

---

## Phase 1: Detect Project State

Before asking anything, silently gather context so you can tailor your guidance. Do NOT show these results unprompted â€” they inform your recommendations, not the conversation opener.

Check:
- **Engine configured?** Read `.claude/docs/technical-preferences.md`. If the Engine field contains `[TO BE CONFIGURED]`, the engine is not set.
- **Game concept exists?** Check for `design/gdd/game-concept.md`.
- **Source code exists?** Glob for source files in `src/` (`*.gd`, `*.cs`, `*.cpp`, `*.h`, `*.rs`, `*.py`, `*.js`, `*.ts`).
- **Prototypes exist?** Check for subdirectories in `prototypes/`.
- **Design docs exist?** Count markdown files in `design/gdd/`.
- **Production artifacts?** Check for files in `production/sprints/` or `production/milestones/`.

Store these findings internally to validate the user's self-assessment and tailor recommendations.

---

## Phase 2: Ask Where the User Is

This is the first thing the user sees. Use `AskUserQuestion` with these exact options so the user can click rather than type:

- **Prompt**: "Welcome to Ken Game Studio! Before I suggest anything, I'd like to understand where you're starting from. Where are you at with your game idea right now?"
- **Options**:
  - `A) No idea yet` â€” I don't have a game concept at all. I want to explore and figure out what to make.
  - `B) Vague idea` â€” I have a rough theme, feeling, or genre in mind (e.g., "something with space" or "a cozy farming game") but nothing concrete.
  - `C) Clear concept` â€” I know the core idea â€” genre, basic mechanics, maybe a pitch sentence â€” but haven't formalized it into documents yet.
  - `D) Existing work` â€” I already have design docs, prototypes, code, or significant planning done. I want to organize or continue the work.

Wait for the user's selection. Do not proceed until they respond.

---

## Phase 3: Route Based on Answer

#### If A: No idea yet

The user needs creative exploration before anything else.

1. Acknowledge that starting from zero is completely fine
2. Briefly explain what `/brainstorm` does (guided ideation using professional frameworks â€” MDA, player psychology, verb-first design). Mention that it has two modes: `/brainstorm open` for fully open exploration, or `/brainstorm [hint]` if they have even a vague theme (e.g., "space", "cozy", "horror").
3. Recommend running `/brainstorm open` as the next step, but invite them to use a hint if something comes to mind
4. Show the recommended path:
   **Concept phase:**
   - `/brainstorm open` â€” discover your game concept
   - `/setup-engine` â€” configure the engine (brainstorm will recommend one)
   - `/prototype` â€” throwaway concept build: validate the core idea is fun before designing (1â€“3 days)
   - `/art-bible` â€” define visual identity (uses the Visual Identity Anchor brainstorm produces)
   - `/map-systems` â€” decompose the concept into systems
   - `/design-system` â€” author a GDD for each MVP system
   - `/review-all-gdds` â€” cross-system consistency check
   - `/gate-check` â€” validate readiness before architecture work
   **Architecture phase:**
   - `/create-architecture` â€” produce the master architecture blueprint and Required ADR list
   - `/architecture-decision (Ã—N)` â€” record key technical decisions, following the Required ADR list
   - `/create-control-manifest` â€” compile decisions into an actionable rules sheet
   - `/architecture-review` â€” validate architecture coverage
   **Pre-Production phase:**
   - `/ux-design` â€” author UX specs for key screens (main menu, HUD, core interactions)
   - `/vertical-slice` â€” production-quality end-to-end build to validate the full game loop
   - `/playtest-report (Ã—1+)` â€” document each vertical slice playtest session
   - `/create-epics` â€” map systems to epics
   - `/create-stories` â€” break epics into implementable stories
   - `/sprint-plan` â€” plan the first sprint
   **Production phase:** â†’ pick up stories with `/dev-story`

#### If B: Vague idea

1. Ask them to share their vague idea â€” even a few words is enough
2. Validate the idea as a starting point (don't judge or redirect)
3. Recommend running `/brainstorm [their hint]` to develop it
4. Show the recommended path:
   **Concept phase:**
   - `/brainstorm [hint]` â€” develop the idea into a full concept
   - `/setup-engine` â€” configure the engine
   - `/prototype` â€” throwaway concept build: validate the core idea is fun before designing (1â€“3 days)
   - `/art-bible` â€” define visual identity (uses the Visual Identity Anchor brainstorm produces)
   - `/map-systems` â€” decompose the concept into systems
   - `/design-system` â€” author a GDD for each MVP system
   - `/review-all-gdds` â€” cross-system consistency check
   - `/gate-check` â€” validate readiness before architecture work
   **Architecture phase:**
   - `/create-architecture` â€” produce the master architecture blueprint and Required ADR list
   - `/architecture-decision (Ã—N)` â€” record key technical decisions, following the Required ADR list
   - `/create-control-manifest` â€” compile decisions into an actionable rules sheet
   - `/architecture-review` â€” validate architecture coverage
   **Pre-Production phase:**
   - `/ux-design` â€” author UX specs for key screens (main menu, HUD, core interactions)
   - `/vertical-slice` â€” production-quality end-to-end build to validate the full game loop
   - `/playtest-report (Ã—1+)` â€” document each vertical slice playtest session
   - `/create-epics` â€” map systems to epics
   - `/create-stories` â€” break epics into implementable stories
   - `/sprint-plan` â€” plan the first sprint
   **Production phase:** â†’ pick up stories with `/dev-story`

#### If C: Clear concept

1. Ask them to describe their concept in one sentence â€” genre and core mechanic. Use plain text, not AskUserQuestion (it's an open response).
2. Acknowledge the concept, then use `AskUserQuestion` to offer two paths:
   - **Prompt**: "How would you like to proceed?"
   - **Options**:
     - `Formalize it first` â€” Run `/brainstorm [concept]` to structure it into a proper game concept document
     - `Jump straight in` â€” Go to `/setup-engine` now and write the GDD manually afterward
3. Show the recommended path:
   **Concept phase:**
   - `/brainstorm` or `/setup-engine` â€” (their pick from step 2)
   - `/prototype` â€” throwaway concept build: validate the core idea is fun before designing (1â€“3 days)
   - `/art-bible` â€” define visual identity (after brainstorm if run, or after concept doc exists)
   - `/design-review` â€” validate the concept doc
   - `/map-systems` â€” decompose the concept into individual systems
   - `/design-system` â€” author a GDD for each MVP system
   - `/review-all-gdds` â€” cross-system consistency check
   - `/gate-check` â€” validate readiness before architecture work
   **Architecture phase:**
   - `/create-architecture` â€” produce the master architecture blueprint and Required ADR list
   - `/architecture-decision (Ã—N)` â€” record key technical decisions, following the Required ADR list
   - `/create-control-manifest` â€” compile decisions into an actionable rules sheet
   - `/architecture-review` â€” validate architecture coverage
   **Pre-Production phase:**
   - `/ux-design` â€” author UX specs for key screens (main menu, HUD, core interactions)
   - `/vertical-slice` â€” production-quality end-to-end build to validate the full game loop
   - `/playtest-report (Ã—1+)` â€” document each vertical slice playtest session
   - `/create-epics` â€” map systems to epics
   - `/create-stories` â€” break epics into implementable stories
   - `/sprint-plan` â€” plan the first sprint
   **Production phase:** â†’ pick up stories with `/dev-story`

#### If D: Existing work

1. Share what you found in Phase 1:
   - "I can see you have [X source files / Y design docs / Z prototypes]..."
   - "Your engine is [configured as X / not yet configured]..."

2. **Sub-case D1 â€” Early stage** (engine not configured or only a game concept exists):
   - Recommend `/setup-engine` first if engine not configured
   - Then `/project-stage-detect` for a gap inventory

   **Sub-case D2 â€” GDDs, ADRs, or stories already exist:**
   - Explain: "Having files isn't the same as the template's skills being able to use them. GDDs might be missing required sections. `/adopt` checks this specifically."
   - Recommend:
     1. `/project-stage-detect` â€” understand what phase and what's missing entirely
     2. `/adopt` â€” audit whether existing artifacts are in the right internal format

3. Show the recommended path for D2:
   - `/project-stage-detect` â€” phase detection + existence gaps
   - `/adopt` â€” format compliance audit + migration plan
   - `/setup-engine` â€” if engine not configured
   - `/design-system retrofit [path]` â€” fill missing GDD sections
   - `/architecture-decision retrofit [path]` â€” add missing ADR sections
   - `/architecture-review` â€” bootstrap the TR requirement registry
   - `/gate-check` â€” validate readiness for next phase

---

## Phase 3c: Write Initial Stage File

After confirming the starting path (and before asking about review mode), write the initial stage to `production/stage.txt`. Create the `production/` directory if it does not exist.

Stage mapping:
- **Path A, B, or C (starting from scratch)**: write `Concept`
- **Path D, existing project, engine not configured or only a game concept exists**: write `Concept`
- **Path D, existing project with GDDs but no architecture documents**: write `Systems Design`
- **Path D, existing project with full architecture (ADRs, architecture doc)**: write `Technical Setup`

Do this silently â€” no "May I write?" needed for this single-line file.

Say: "I've set `production/stage.txt` to `[stage]` â€” this anchors your status line and stage detection."

---

## Phase 3b: Set Review Mode

Check if `production/review-mode.txt` already exists.

**If it exists**: Read it and show the current mode â€” "Review mode is set to `[current]`." â€” then proceed to Phase 4. Do not ask again.

**If it does not exist**: Use `AskUserQuestion`:

- **Prompt**: "One setup choice: how much design review would you want as you work through the workflow?"
- **Options**:
  - `Full` â€” Director specialists review at each key workflow step. Best for teams, learning the workflow, or when you want thorough feedback on every decision.
  - `Lean (recommended)` â€” Directors only at phase gate transitions (/gate-check). Skips per-skill reviews. Balanced approach for solo devs and small teams.
  - `Solo` â€” No director reviews at all. Maximum speed. Best for game jams, prototypes, or if the reviews feel like overhead.

Write the choice to `production/review-mode.txt` immediately after the user
selects â€” no separate "May I write?" needed, as the write is a direct
consequence of the selection:
- `Full` â†’ write `full`
- `Lean (recommended)` â†’ write `lean`
- `Solo` â†’ write `solo`

Create the `production/` directory if it does not exist.

---

## Phase 4: Confirm Before Proceeding

After presenting the recommended path, use `AskUserQuestion` to ask the user which step they'd like to take first. Never auto-run the next skill.

- **Prompt**: "Would you like to start with [recommended first step]?"
- **Options**:
  - `Yes, let's start with [recommended first step]`
  - `I'd like to do something else first`

---

## Phase 5: Hand Off

When the user confirms their next step, respond with a single short line: "Type `[skill command]` to begin." Nothing else. Do not re-explain the skill or add encouragement. The `/start` skill's job is done.

Verdict: **COMPLETE** â€” user oriented and handed off to next step.

---

## Edge Cases

- **User picks D but project is empty**: Gently redirect â€” "It looks like the project is a fresh template with no artifacts yet. Would Path A or B be a better fit?"
- **User picks A but project has code**: Mention what you found â€” "I noticed there's already code in `src/`. Did you mean to pick D (existing work)?"
- **User is returning (engine configured, concept exists)**: Skip onboarding entirely â€” "It looks like you're already set up! Your engine is [X] and you have a game concept at `design/gdd/game-concept.md`. Review mode: `[read from production/review-mode.txt, or 'lean (default)' if missing]`. Want to pick up where you left off? Try `/sprint-plan` or just tell me what you'd like to work on."
- **User doesn't fit any option**: Let them describe their situation in their own words and adapt.

---

## Collaborative Protocol

1. **Ask first** â€” never assume the user's state or intent
2. **Present options** â€” give clear paths, not mandates
3. **User decides** â€” they pick the direction
4. **No auto-execution** â€” recommend the next skill, don't run it without asking
5. **Adapt** â€” if the user's situation doesn't fit a template, listen and adjust
