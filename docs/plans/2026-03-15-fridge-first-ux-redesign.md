# Fridge-First UX Redesign

**Date:** 2026-03-15
**Goal:** Reframe app from "cooking assistant" to "food waste prevention assistant with cooking support"

## Product Direction

This product is a **food waste prevention assistant with a cooking side**, not a smart cooking assistant.

Core loop: glance at fridge state → notice what's at risk → act (cook it or remember to use it).

## Key Diagnosis

| Category | Problem |
|---|---|
| Friction | Home frames every visit as a cooking session, not a fridge check |
| Friction | No inline way to set ingredient state (only via post-cooking modals) |
| Friction | Post-cooking = 2 modals (ServingPrompt + DeductionPrompt) |
| Trust | Default state is `unknown` — system never has real data |
| Trust | `lastUpdatedAt` exists but never shown |
| Motivation | No "what's at risk" hook on open |
| Motivation | TomorrowSection buried mid-page |

## Revised Information Architecture

```
App
├── 冰箱 (Home) [PRIMARY]
│   ├── ⚠ Alert zone — low/empty items + quick-cook CTA
│   ├── 推薦今天煮 — TomorrowSection (urgency-sorted, top of page)
│   ├── 我的冰箱 — all items, urgency-sorted, inline state cycling
│   └── [設定 ⚙] — gear icon → preferences
│
├── 建議 (Suggestions) [SECONDARY]
│   ├── Based on current fridge state
│   ├── ✓ Doable now
│   ├── 🛒 Near-miss
│   └── Post-cook → single step deduction
│
└── 清單 (Shopping List) [UTILITY]
    ├── Items from near-miss suggestions
    ├── Manual add
    └── ✅ 已買回 → auto-restock pantry
```

## Top-10 Improvements (Prioritized)

| # | Change | Impact | Effort |
|---|---|---|---|
| 1 | Inline chip state cycling (tap to set plenty/some/low/empty) | Critical | Medium |
| 2 | Default new items to `some` not `unknown` | High | Trivial |
| 3 | ⚠ Alert zone on home: show low/empty items + quick-cook CTA | High | Small |
| 4 | Move TomorrowSection to top of home, above search | High | Trivial |
| 5 | Home: sort items by urgency, not category | High | Small |
| 6 | Show `lastUpdatedAt` staleness in home header | Medium | Trivial |
| 7 | Change headline copy: 今晚想煮什麼 → 冰箱裡有什麼 | Medium | Trivial |
| 8 | Remove 偏好 from bottom nav, move to gear icon | Medium | Small |
| 9 | Merge ServingPrompt + DeductionPrompt into one step | Medium | Medium |
| 10 | Suggestions framing: "用掉這些食材" not recipe-first | Medium | Small |

## v2 Scope (Incremental Sprints)

### Sprint 1 — Fridge-First Reframe
- Change home headline + primary CTA copy
- Default state to `some` on new adds
- Move TomorrowSection to top
- Sort home items by urgency (low → some → plenty → unknown)
- Show staleness text (`上次更新：N天前`)
- Remove 偏好 tab, add gear icon in header

### Sprint 2 — State Interaction Overhaul
- Inline chip state cycling (tap → 4-option popover + remove)
- Alert zone component (low/empty items + quick-cook CTA)
- `unknown` items shown last with "tap to update" nudge

### Sprint 3 — Post-Cook Simplification
- Merge ServingPrompt + DeductionPrompt into single bottom sheet
- Auto-apply deductions, show inline result flash

### Sprint 4 — Suggestions Reframe
- "今天可以用掉..." framing in suggestions header
- Prioritize low-state ingredients in suggestion ranking
- TomorrowSection: rename for urgency framing

### Deferred
- Household sharing UI (keep Firebase code, no UI surface)
- Recipe history screen (keep store, internal use only)
- Push notifications

## Home Screen Wireframe

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 冰箱             [設定 ⚙]  上次更新：2天前
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 ┌─────────────────────────────────┐
 │ ⚠ 快用完                        │
 │ 雞蛋  菠菜  豆腐                 │
 │              [馬上找菜色 →]       │
 └─────────────────────────────────┘

 ┌─────────────────────────────────┐
 │  推薦今天煮                       │
 │  [菠菜炒蛋]  [豆腐湯]            │
 └─────────────────────────────────┘

 ── 我的冰箱 ──────────────────────

 蛋白質
 [雞蛋 low] [雞胸肉 some] [豆腐 low]

 蔬菜
 [菠菜 low] [青椒 plenty] [洋蔥 some]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 [冰箱]          [建議]        [清單]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Design System Notes

- Alert zone: `jade-50` background (only use jade for urgency/action per design system)
- State indicators: use ink opacity levels instead of multiple saturated colors
  - plenty: 100% ink
  - some: 60% ink
  - low: jade text (the one saturated signal)
  - empty: strikethrough + 40% ink
- Chips: sharp corners (`border-radius: 0`), no shadow
- Staleness timestamp: `IBM Plex Mono`, secondary color
- Bottom nav: 3 tabs only
- Post-cook sheet: fade-in allowed per motion spec
- Prefer Unicode: ⚠ for warning, ✓ for success, ✕ for remove
