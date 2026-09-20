# Terra — Organic Design

Design system for this app, mirrored from the Stitch project
`stitch.withgoogle.com/projects/9501967419425703733` ("Offline Gym Workout Planner").
Tokens live in `app/globals.css` under `@theme`; nothing hardcodes a color.

## North Star: "Rooted Warmth"
Calm, grounded, and human. Earthy tones, soft shapes, and natural textures create a warm, approachable experience.

## Colors

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#f0ece4` | Page background, deeper cream so cards read as raised |
| `--color-surface` | `#faf6f0` | Cards, bars, sheets — warm cream, never sterile white |
| `--color-ink` | `#2e3230` | Body text (warm near-black) |
| `--color-muted` | `#6b6358` | Secondary text |
| `--color-line` | `#c4c8bc` | Hairlines, always at low opacity (`/50`–`/60`) |
| `--color-accent` | `#4a7c59` | Forest green — actions, navigation, interactive states |
| `--color-accent-soft` | `#d8f0de` | Pressed states, soft fills |
| `--color-tertiary` | `#705c30` | Warm amber — badges, highlights |
| `--color-tertiary-soft` | `#f8e0a8` | Badge backgrounds |
| `--color-danger` | `#b83230` | Destructive actions |

Earthy and desaturated. No neon or pure-hue colors. Every gray has a yellow/green undertone.
Light mode only — no dark variant.

## Typography
- **Headlines:** Literata (`font-serif`) — warm serif with personality. Page titles, section titles, app bar, card headings.
- **Body/Labels:** Nunito Sans (`font-sans`) — friendly, rounded letterforms.
- **Numbers:** Geist Mono (`font-mono` + `tabular-nums`) for timers, reps, counts.
- Body line-height `1.6` (set on `body`). Comfortable, unhurried reading.

## Elevation
- Very soft shadows only: `--shadow-soft: 0 4px 20px rgba(46, 50, 48, 0.06)`, via `shadow-soft`.
- Prefer tonal separation over shadows — layer warm cream tones (`bg` under `surface`).
- Borders: `border-line/50`–`/60` only when a shadow would be wrong (inputs, sticky bars).

## Shape
- Roundness 12px → `--radius-card: 0.75rem`, used as `rounded-card` on cards, buttons, inputs.
- `rounded-full` only for circular controls (steppers) and pill badges.
- Avoid sharp corners and hard contrasts.

## Components
- **Buttons** (`components/ui/Button.tsx`): primary = solid green; secondary = cream bg + green text + thin green border; danger = cream bg + red text. All `h-13`, `rounded-card`.
- **Cards** (`components/ui/Card.tsx`): cream fill, `rounded-card`, `shadow-soft`, no border.
- **Inputs:** cream background, `rounded-card`, green focus border.
- **List rows** (`components/ui/ListRow.tsx`): `min-h-13`, hairline dividers, `active:bg-accent-soft/40`.

## Rules
- Large touch targets (`min-h-13`), generous spacing. Design should feel breathable.
- Images natural and warm — avoid clinical or tech-stock imagery.
- Add a color by adding a token, not a literal hex in a component.

## Screen patterns

Mirrored from the five Stitch screens. Shared pieces live in `components/ui/`.

- **Chrome:** `BrandBar` (logo + wordmark + OFFLINE chip) sits in `app/(tabs)/layout.tsx` for tab routes; `AppBar` (back + title) for stacked routes. Page titles are serif `text-3xl` inside the content, not in the bar.
- **Cards over rows:** every list is a stack of `rounded-card bg-surface shadow-soft` cards with `space-y-2/3`, never a divided table. Hairlines only inside a card.
- **Home:** weekly-goal card with `ProgressRing`, one card per weekday with a circular `THỨ n` badge, today's card accented by a `h-1.5 bg-accent` top bar + inner `bg-bg` exercise-chip box, then a full-width green CTA card.
- **Library:** sticky search card, horizontally scrolling filter chip rows (`Tất cả` clears), then exercise cards with an 80px thumbnail. Keep `.vrow` in sync with the real row height.
- **Session:** live header (status dot + progress bar), hero GIF with a gradient overlay naming the target muscle, one row per set (`done` / `current` accent-filled / `todo`), inline rest card with `RestTimer`'s ring, sticky bottom CTA.
- **History:** stats strip (3 tiles) + vertical timeline with a left rail of dots; per-session detail uses native `<details>`.
- **Editing:** action tiles (`grid-cols-4`) and stat tiles (`grid-cols-3`) inside the `Sheet` instead of full-width rows. Writes hit the store immediately, so the sheet closes with `Xong` — no fake Save/Cancel.

## Icons

`public/icon-512.png` is the master: a green (`--color-accent`) squircle with a white dumbbell.
`public/icon-192.png` and `public/apple-icon.png` are the same artwork at smaller sizes, `app/favicon.ico`
packs 16/32/48/256 from it. Recolour by lerping the artwork's blue→white blend onto the new hue
(the red channel is the blend factor) rather than flood-filling, so the antialiased edges stay clean.
