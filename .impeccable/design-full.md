---
name: Sotto
description: Anonymous insider reports, with a response clock anyone can verify.
colors:
  chassis: "#0f0e0d"
  field: "#0b0b0b"
  housing: "#111214"
  plate: "#202327"
  mesh: "#3a3d42"
  rule-faint: "#23252a"
  steel: "#6d7178"
  glass: "#b9bec5"
  ink: "#ebe7df"
  ink-2: "#bdb9b1"
  ink-3: "#9a968e"
  plasma: "#ff8a00"
  plasma-soft: "#ffb35c"
  on-plasma: "#140a00"
  ontime: "#6fd696"
  on-ontime: "#04140a"
  late: "#ff5a3c"
  on-late: "#1a0500"
typography:
  display:
    fontFamily: "Big Shoulders Display, Saira Semi Condensed, sans-serif"
    fontSize: "clamp(40px, 5.6vw, 80px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.05em"
  headline:
    fontFamily: "Big Shoulders Display, Saira Semi Condensed, sans-serif"
    fontSize: "clamp(32px, 4vw, 52px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.05em"
  title:
    fontFamily: "Big Shoulders Display, Saira Semi Condensed, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.06em"
  lede:
    fontFamily: "Saira, system-ui, sans-serif"
    fontSize: "clamp(18px, 1.7vw, 22px)"
    fontWeight: 500
    lineHeight: 1.45
  body:
    fontFamily: "Saira, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "tnum"
  body-sm:
    fontFamily: "Saira, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Saira Semi Condensed, Saira, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.2em"
  label-control:
    fontFamily: "Saira Semi Condensed, Saira, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.16em"
  label-control-sm:
    fontFamily: "Saira Semi Condensed, Saira, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.16em"
  label-nav:
    fontFamily: "Saira Semi Condensed, Saira, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.16em"
  label-field:
    fontFamily: "Saira Semi Condensed, Saira, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.12em"
  label-status:
    fontFamily: "Saira Semi Condensed, Saira, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.14em"
  label-plate:
    fontFamily: "Saira Semi Condensed, Saira, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.18em"
  label-tag:
    fontFamily: "Saira Semi Condensed, Saira, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.14em"
  numeral:
    fontFamily: "Nixie One, Saira, sans-serif"
    fontSize: "clamp(48px, 5vw, 66px)"
    fontWeight: 400
    lineHeight: 1
  clock:
    fontFamily: "Nixie One, Saira, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.86em"
    fontWeight: 400
  mono-field:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "15px"
    fontWeight: 400
rounded:
  xs: "3px"
  sm: "4px"
  md: "6px"
  full: "50%"
spacing:
  tight: "8px"
  control: "10px"
  cluster: "12px"
  inset: "14px"
  gutter: "16px"
  block: "24px"
  stack: "28px"
  section: "40px"
  hero: "48px"
components:
  switch:
    backgroundColor: "#121315"
    textColor: "{colors.plasma}"
    typography: "{typography.label-control}"
    rounded: "{rounded.md}"
    padding: "0 40px"
    height: "52px"
  switch-hover:
    textColor: "{colors.plasma-soft}"
  button-quiet:
    backgroundColor: "#17181b"
    textColor: "{colors.ink}"
    typography: "{typography.label-control-sm}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-subtle:
    backgroundColor: "transparent"
    textColor: "{colors.ink-3}"
    typography: "{typography.label-control-sm}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-subtle-hover:
    textColor: "{colors.ink}"
  button-done:
    backgroundColor: "{colors.ontime}"
    textColor: "{colors.on-ontime}"
  button-danger:
    backgroundColor: "{colors.late}"
    textColor: "{colors.on-late}"
    typography: "{typography.label-control-sm}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "44px"
  button-danger-hover:
    backgroundColor: "#ff7a60"
  nav-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.label-nav}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  nav-link-hover:
    textColor: "{colors.ink}"
  nav-link-current:
    textColor: "{colors.plasma}"
  net-badge:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  live-clock:
    textColor: "{colors.plasma-soft}"
    typography: "{typography.clock}"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  input-mono:
    typography: "{typography.mono-field}"
  key-well:
    backgroundColor: "{colors.field}"
    textColor: "{colors.plasma-soft}"
    typography: "{typography.mono-field}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
  plate:
    backgroundColor: "{colors.plate}"
    padding: "14px 16px"
  instrument:
    backgroundColor: "{colors.housing}"
    padding: "18px 8px 14px"
  tube:
    textColor: "{colors.plasma-soft}"
    typography: "{typography.numeral}"
    width: "clamp(56px, 5.6vw, 76px)"
  channel-plate:
    backgroundColor: "#191a1d"
    textColor: "{colors.glass}"
    typography: "{typography.label-plate}"
    rounded: "{rounded.xs}"
    padding: "7px 10px 8px"
  status-ontime:
    textColor: "{colors.ontime}"
    typography: "{typography.label-status}"
  status-due:
    textColor: "{colors.plasma-soft}"
    typography: "{typography.label-status}"
  status-delayed:
    textColor: "{colors.late}"
    typography: "{typography.label-status}"
  status-closed:
    textColor: "{colors.ink-3}"
    typography: "{typography.label-status}"
  status-lamp:
    size: "10px"
    rounded: "{rounded.full}"
  tag:
    textColor: "{colors.glass}"
    typography: "{typography.label-tag}"
    rounded: "{rounded.xs}"
    padding: "2px 6px"
  notice:
    backgroundColor: "#16171a"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
---

# Design System: Sotto

## Overview

**Creative North Star: "The Laboratory Counter"**

Sotto is set as a bench instrument, not a page. The channel's record is read off a counter: every count and countdown is a lit numeral inside a drawn glass tube, the tubes stand in a blackened-steel housing, and each channel is named on a small recessed plate in engraved steel caps. The ground is a warm near-black steel chassis. Gunmetal plates, fastened with screws, lift off it and hold the units people act on; switches and fields sink into those plates. The record reads as a measurement nobody typed.

There is one light source. Plasma orange is the only colour that glows, and it lights only what is live: lit numerals, values read from the ledger, the clock, the waiting lamp, the current position, focus, and the switch that acts. Everything else is steel and warm ink. Two lamp colours, green and red, report state, and each lamp always stands beside its word. Density is instrument-like and calm: condensed caps carry the hierarchy, a rounded technical sans carries the reading at 17px in sentence case, and tabular numerals keep every count aligned.

The user built and rejected two earlier looks: the editorial paper look (warm paper, serif, ink) and the station departure board (deep blue ground, signal yellow). The category's white-and-navy dashboard of stat cards is what this world refuses. Condensed caps are native here; what was rejected about the departure board is its blue-and-yellow signage, not condensed type.

**Key Characteristics:**
- A blackened, slightly warm steel chassis with gunmetal plates and an instrument housing drawn as 9-slice SVG frames with screws.
- Live counts as lit Nixie numerals in drawn IN-14 tube envelopes, all ten unlit numerals faintly visible behind the lit one.
- Plasma orange as the only glow, reserved for what is live.
- Steel-grey condensed engraved caps for every heading, label and button; sentence-case Saira for prose.
- Status lamps that always carry their word.
- One signature move: a tube cross-fades from the old numeral to the new one, including the first read; reduced motion swaps instantly.

## Colors

One warm light against cold steel: a near-black chassis, steel greys for structure and labels, warm off-white ink for reading, plasma orange for anything live, and two lamp colours for state.

### Primary
- **Plasma Orange** (#ff8a00): the lit switch's text and border, the focus outline, the caret, text selection, the current nav item, the Waiting lamp, the skip link and the wordmark's tube outline.
- **Lit Numeral Amber** (#ffb35c): the lit tube numerals, the live clock, and every value read from the ledger: case ids, member keys, member fingerprints, channel readouts and elapsed proving seconds. Also the Waiting status word and the switch's hover text.
- **Plasma Ink** (#140a00): text set on a plasma fill (selection and the skip link).

### Secondary
- **On-Time Lamp Green** (#6fd696): the On time lamp and word, the connected network dot, a registered credential's state line and outline (at 40%), and the filled face of a done button.
- **Alarm Red** (#ff5a3c): the Delayed lamp and word, late and overdue text, the late channel's label, errors, the danger button, the disconnected network dot, and the alarm and confirmation boxes (8% tint, 60 to 70% border).
- **Lamp Ink Green** (#04140a) and **Lamp Ink Red** (#1a0500): text on filled green and red buttons.

### Neutral
- **Blackened Warm Steel** (#0f0e0d): the chassis; page and html background, scrollbar track.
- **Recess Black** (#0b0b0b): wells darker than the ground: inputs, the key well, the network badge, the Lace note.
- **Housing Black** (#111214): the instrument housing fill.
- **Gunmetal** (#202327): the plate fill.
- **Anode Mesh** (#3a3d42): hairlines: the top plate's rule, engraved-heading rules, the table header rule, field and notice borders, the case-head rule, the footer rule.
- **Row Rule** (#23252a): the fainter divider between table rows and member rows.
- **Screwhead Steel** (#6d7178): ring terminals, nav connectors, tag borders, the quiet button's border, list markers, link underlines, reporter thread dots, the scrollbar thumb.
- **Engraved Glass** (#b9bec5): display headlines, the wordmark, engraved headings, channel labels, step numbers, officer thread dots and note icons.
- **Warm Ink** (#ebe7df): body text and input text.
- **Worn Ink** (#bdb9b1): secondary prose, field labels, nav at rest, status words at rest, list text in readouts.
- **Faded Ink** (#9a968e): tertiary text: footer, provenance, table column heads, placeholders, the Closed status, muted spans.

### Named Rules
**The Live Light Rule.** Plasma is light, and light means live. It appears only on lit numerals, ledger values, the clock, the Waiting lamp, the current position, focus, caret, selection and the action switch. It never fills a surface (selection and the skip link are the only plasma fills), never sets running text, and never decorates.

**The Lamp And Word Rule.** State is never colour alone. Every lamp sits beside its word (On time, Waiting, Delayed, Closed), a late channel's count says how many, and the network dot is followed by the word "reconnecting" when it turns red.

**The No Neon Rule.** No blues and no purples anywhere. The only saturated hues are plasma orange, lamp green and alarm red.

## Typography

**Display Font:** Big Shoulders Display (with Saira Semi Condensed, sans-serif)
**Body Font:** Saira (with system-ui, sans-serif)
**Label/Mono Font:** Saira Semi Condensed for labels and controls (with Saira); Nixie One for tube numerals and the clock (with Saira); JetBrains Mono for ledger values (with ui-monospace)

**Character:** Tall, tightly condensed steel caps name things the way engraving names a panel; a rounded technical sans carries the reading in sentence case with tabular figures. The numbers that matter are light, not ink. All five families are self-hosted woff2 with latin and latin-ext subsets (Nixie One latin only).

### Hierarchy
- **Display** (700, clamp(40px, 5.6vw, 80px), line-height 1, 0.05em, uppercase): the counter's headline, a sentence about the record ("No late reports."), held to 14ch and balanced. 38px at phone width.
- **Headline** (700, clamp(32px, 4vw, 52px), line-height 1, 0.05em, uppercase): the h1 of the working screens (Report, Officer desk).
- **Title** (700, 24px, line-height 1.15, 0.06em, uppercase, Warm Ink): the heading inside a plate, such as the File a report panel. 21px at phone width.
- **Lede** (Saira 500, clamp(18px, 1.7vw, 22px), line-height 1.45): the plain sub-line under a display headline, max 46ch.
- **Body** (Saira 400, 17px, line-height 1.6, tabular numerals): all running text, lines held to 60 to 66ch.
- **Body small** (Saira 400, 15px): hints, errors, notes, status lines, the footer. Provenance and switch notes run at 14px.
- **Label** (Saira Semi Condensed 600, 14px, 0.2em, uppercase): engraved section headings and work sub-heads.
- **Control label** (700, 16px, 0.16em, uppercase; 14px on quiet and danger buttons): every button and switch.
- **Small caps labels** (600, uppercase): field labels 14px at 0.12em, nav 15px at 0.16em, status words 13px at 0.14em, channel plates and table heads 12px at 0.18em, tags 11px at 0.14em.
- **Numeral** (Nixie One 400, clamp(48px, 5vw, 66px), line-height 1): tube digits only.
- **Clock** (Nixie One 400, 20px, line-height 1): the live clock in the top plate; 17px at phone width.
- **Mono** (JetBrains Mono 400 at 0.86em; 15px in key wells and mono fields; 500 at 12px in channel readouts): case ids, member keys, the contract address, elapsed seconds.

### Named Rules
**The Engraved Caps Rule.** Every heading, label, button and tag is uppercase condensed caps with open tracking (0.05em at display sizes, 0.1em to 0.2em on labels). Running text, hints, errors, inline links and disclosure rows stay in sentence case.

**The Glass Numeral Rule.** Nixie One sets the numerals inside tubes and the live clock, nothing else. Words never go in the tube face.

**The Ledger Mono Rule.** Anything copied from or checkable against the ledger (case ids, member keys, fingerprints, the contract address, elapsed proving time) is set in JetBrains Mono, usually in Lit Numeral Amber.

## Layout

One centred column, max 1240px, with a 16px side gutter; main content has 44px above and 80px below. The top plate spans the full width but aligns its contents to the same column with `max(16px, calc((100vw - 1240px) / 2))` side padding.

- **Counter hero:** a two-column grid (1.55fr and 1fr, 48px gap, bottom-aligned): the headline and lede on the left, the File a report plate on the right. Stacks below 900px.
- **Instrument:** a full-width band. Channels share the width equally (minimum 150px each), separated by 1px vertical dividers, and each holds as many tubes as its value needs.
- **Readouts:** two equal columns with a 40px gap (what is public and what is sealed), stacking below 860px; a stacked variant sits beside working forms.
- **Working screens:** two equal columns, or wide-left (1.7fr and 1fr), 40px gap, stacking below 920px to one column with a 28px gap.
- **Rhythm:** hand-tuned, not a token scale in code: 8 to 14px inside components, 16px gutters and plate padding, 24 to 28px between blocks, 40px between sections, 48px for the hero gap.
- **Phone (760px and below):** the top plate wraps into rows (wordmark and network badge, then nav, then the organisation line); the instrument compacts to 42px tubes, or 30px on the counter page so all four channels hold one row; the cases table turns each row into a two-column card with its own caps labels; the counter page orders headline, instrument and switch so all three land in the first screen.
- **Touch targets:** nav items, quiet buttons and disclosure rows hold a 44px minimum height; switches hold 52px.

## Elevation & Depth

Depth comes from the instrument's construction, not from floating cards. Plates and the housing are lifted off the chassis by a soft drop shadow applied as a filter, so the shadow follows the drawn frame; switches, fields and channel name plates are recessed into whatever holds them with inset shadows. Glow is light, not elevation: only lit things emit it. The tonal ladder runs from the wells below the ground (Recess Black) through the chassis, the housing (#111214), the switch body (#121315), the top plate (#141517), notices (#16171a), quiet buttons (#17181b) and channel plates (#191a1d) up to the gunmetal plates.

### Shadow Vocabulary
- **Plate lift** (`filter: drop-shadow(0 12px 18px rgb(0 0 0 / 0.55))`): every plate, credential plate and case plate.
- **Housing lift** (`filter: drop-shadow(0 16px 22px rgb(0 0 0 / 0.6))`): the instrument housing.
- **Switch recess** (`box-shadow: inset 0 2px 5px rgb(0 0 0 / 0.75), 0 1px 0 rgb(255 255 255 / 0.05)`): switches at rest. On hover the second layer becomes `inset 0 0 18px rgb(255 138 0 / 0.22)`, so the switch lights from inside.
- **Field well** (`box-shadow: inset 0 2px 6px rgb(0 0 0 / 0.6)`): inputs and textareas; focus adds `0 0 0 1px` in plasma.
- **Name plate inset** (`box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.7)`): channel plates under the tubes.
- **Top plate seam** (`box-shadow: 0 1px 0 #050506`): the black line under the top plate's mesh rule.
- **Numeral glow** (`text-shadow: 0 0 4px rgb(255 179 92 / 0.9), 0 0 14px rgb(255 138 0 / 0.75), 0 0 32px rgb(255 100 0 / 0.45)`): lit numerals only.
- **Clock glow** (`text-shadow: 0 0 8px rgb(255 138 0 / 0.6)`): the live clock.
- **Lamp glow** (`box-shadow: 0 0 6px` in the lamp's own colour at 0.7 to 0.8 alpha): lit status lamps. An unlit lamp is #3b3d41 with `inset 0 -1px 2px rgb(0 0 0 / 0.6)`.

### Named Rules
**The Lifted Plate, Sunken Control Rule.** Plates and the housing rise off the chassis; switches, fields and name plates sink into what holds them. Nothing else takes an outer shadow.

**The Only Light Glows Rule.** A coloured glow belongs to lit numerals, the clock, lit lamps, the wordmark's tube and the hovered switch. A static surface never glows.

## Shapes

The form language is fastened hardware. Containers are drawn frames, not CSS boxes: plates use `plate.svg` as a 9-slice border image (slice 18, 14px border), a 7px-rounded gunmetal edge with an engraved inner line, a light top edge, a dark bottom edge and two slotted screws at the top corners. The housing uses `housing.svg` (slice 20, 16px border), a 9px-rounded bevel with four corner screws. Each frame's background is clipped to the padding box so the drawn edge reads as the plate's rim. Every switch carries a slotted screw (`screw.svg`, 10px) 12px in from each end.

The tube (`tube.svg`, 100 by 190) is an arched glass envelope with a hexagonal anode mesh, two posts, a faint orange inner glow, highlights on the glass, a ribbed metal cap and four pins; the numerals are live text laid over it, never part of the drawing. All four SVGs are hand-drawn for Sotto and carry their provenance in a comment.

- **Corners:** 3px for tags and channel plates, 4px for nav items, the key well and the focus outline, 6px for switches, buttons, fields, notices and the network badge.
- **Circles:** lamps (10px), the network dot (8px), thread dots (9px), and 7px steel ring terminals that end every engraved heading rule and join the nav items.
- **The mark:** a small tube silhouette beside the wordmark, 18 by 26px with 9px top and 3px bottom corners, a 1.5px plasma outline and an inner glow.

### Named Rules
**The Plates Frame Units Rule.** A drawn, screwed plate frames each unit someone acts on: the File a report panel, the desk plates, the credential, each case. The case log, the readouts and member lists sit unframed on the chassis, ruled by hairlines.

## Components

### Buttons
The lit switch is a recessed panel switch that lights from inside.
- **Shape:** 6px corners, 52px tall, 40px side padding, a screw at each end.
- **Primary (lit switch):** switch body (#121315), plasma text, plasma border at 70%, control-label caps, usually an 18px icon before the label. It serves the File a report link and every primary action (Create my credential, Seal and file report, Acknowledge receipt, Register member, Load officer keys).
- **Hover / Focus:** hover turns the text Lit Numeral Amber, the border full plasma, and lights the inside (160ms colour and border, 200ms shadow, ease-out-expo). Active presses it down 1px. Focus is the global 2px plasma outline at a 3px offset. Disabled drops to 40% opacity with a not-allowed cursor.
- **Busy:** an operation that may take a minute swaps the icon for a 16px ring spinner and the label for a progressive verb ("Filing…"); a polite status line under it names the current step with the elapsed seconds in amber mono. A failure appears below in Alarm Red as a plain sentence saying what to do next.
- **Quiet:** #17181b body, Warm Ink text, Screwhead Steel border, no screws, 44px tall, 16px padding, 14px caps; hover brightens the border to Engraved Glass. For secondary actions (Close: feedback given, Revoke, Keep it, Try again).
- **Subtle:** transparent and borderless in Faded Ink; hover shows a mesh border and Warm Ink. For leaving actions (Remove from this browser, Unload officer keys).
- **Done flip:** a quick action (Copy member key, Back up credential) flips to a filled On-Time green face with a check and "Copied" or "Saved" for two seconds. The face fades in over 420ms from a 2px blur, and a polite live region announces it.
- **Danger:** filled Alarm Red with Lamp Ink Red text, 44px tall, 18px padding, no inset shadow; hover lightens to #ff7a60. It appears only inside a confirmation box.

### Chips (status lamps and tags)
- **Status lamp:** a 10px round lamp, then the word in 13px status caps, no background and no border. On time: green lamp with glow, green word. Waiting: plasma lamp with glow, amber word. Delayed: red lamp with glow, red word. Closed: unlit grey lamp, Faded Ink word.
- **Tags:** Planned and Demo organisation, 11px caps at 0.14em with a 1px Screwhead Steel border, 3px corners and no fill. A Planned tag leads any sentence about something not yet built.

### Cards / Containers
- **Corner Style:** the drawn plate frame (7px outer rounding in the SVG).
- **Background:** Gunmetal.
- **Shadow Strategy:** plate lift (see Elevation & Depth).
- **Border:** the 14px drawn frame with an engraved inner line and screws at the top corners.
- **Internal Padding:** 14px 16px by default; desk plates 18px 20px 20px, the credential 16px 18px 18px, case plates 16px 18px 6px.
- **Registered credential:** a 1px On-Time green outline at 40%, inset 6px, and a green state line.
- **Engraved heading:** section headings set in label caps (Engraved Glass), followed by a mesh hairline that runs to a 7px steel ring terminal.

### Inputs / Fields
- **Style:** a Recess Black well with a 1px Anode Mesh border, 6px corners, 12px 14px padding, Saira 17px, the field-well inset shadow and a plasma caret; placeholders in Faded Ink; textareas resize vertically. The label sits above in field caps (14px, 0.12em, Worn Ink); the hint sits below at 15px in Worn Ink, linked by aria-describedby.
- **Focus:** the border turns plasma and a 1px plasma ring is added around the well; the default outline is removed.
- **Mono variant:** JetBrains Mono at 15px for keys and key files, spellcheck off.
- **Error:** a plain sentence in Alarm Red at 15px, weight 500, role alert, naming the fix ("Check that you pasted all 64 characters from the backup file.").

### Navigation
- **Top plate:** a full-width steel bar (#141517) with a mesh rule and a black seam beneath. Left to right: the wordmark (Big Shoulders Display 700, 30px, 0.16em, Engraved Glass) with its tube mark; the organisation name in 15px caps (Worn Ink) behind a mesh divider, followed by the Demo organisation tag; the nav, pushed right; the network badge last.
- **Nav items:** 44px tall, 16px padding, 15px caps at 0.16em in Worn Ink, joined by steel ring connectors. Hover: Warm Ink with a mesh border. Current page: plasma text with a plasma border at 55%.
- **Network badge:** Recess Black with a mesh border and 6px corners, holding a green dot (red when the indexer is unreachable, with the word "reconnecting"), "Midnight preview" in 14px caps, and the live clock in Nixie One amber with its glow.
- **Phone:** the bar wraps; the nav takes a full row, the organisation line drops to the last row at 13px, and the clock shrinks to 17px.

### The Instrument (signature component)
The instrument is the system's one signature: a housing of tube channels that serves both the public counter and the officer desk.
- **Housing:** the drawn housing frame in Housing Black with housing lift, 18px 8px 14px padding; channels divided by 1px rules (#26282c).
- **Tube:** width clamp(56px, 5.6vw, 76px), aspect 100 by 190, the drawn envelope as background. All ten numerals are stacked inside in the physical IN-14 order (1 6 2 7 5 0 4 9 8 3); the unlit ones show at 8% warm grey, the lit one in Lit Numeral Amber with the numeral glow. A dark tube (value not yet read) shows only the unlit stack, at 7%. Values are zero-padded to the channel's minimum places, and a tube is added when a value needs more digits.
- **Cross-fade:** when a value changes, including the first read when the tubes go from dark to lit, the old numeral dims as the new one lights in a single 520ms colour and glow transition on the ease-out-expo curve. No flicker; reduced motion swaps instantly.
- **Channel plate:** a recessed name plate under the tubes (#191a1d, 1px #2c2e32 border, 3px corners, name plate inset), with the channel name in 12px Engraved Glass caps and an optional readout below in 12px amber mono ("of 1 · within 7 days").
- **Late tone:** a channel whose count is late turns its plate label Alarm Red.
- **Accessibility:** the tubes and plates are hidden from assistive tech; each channel speaks its whole value as a sentence ("Overdue now: 0"), and the housing is a labelled group, marked busy while warming up.

### Case Log
- **Table:** column heads in 12px Faded Ink caps at 0.18em above a mesh rule; rows with 15px vertical padding and Row Rule dividers; the case id in amber mono; a late acknowledgement in Alarm Red at weight 500; the feedback column muted; the status column holds the lamp.
- **Phone:** each row becomes a two-column grid card, with an 11px caps label above every value.

### Case Thread
- **Head:** inside a case plate, the amber mono case number, its status lamp, and a muted line (opened, deadline) above a mesh rule.
- **Messages:** an ordered list; each message carries a 9px dot (steel for the reporter, Engraved Glass for the officer, whose messages indent 28px), the speaker in 13px caps and the time in muted sentence case. A message the viewer cannot open reads "Sealed to the other side. Only they can read it." in Faded Ink.
- **Compose:** a field, then the Lace note (a Recess Black box with a lock icon explaining what Lace will show), then the lit switch.

### Notices and Confirmation
- **Notice:** #16171a, 1px mesh border, 6px corners, 14px 18px padding, Warm Ink at weight 500. The alarm variant tints the box 8% Alarm Red with a 70% red border.
- **Confirmation:** an 8% red tint with a 60% red border and 6px corners: the question in bold with its consequence, then the danger button and a quiet "Keep it" that takes focus.

### Disclosure
- **Summary:** a 44px row in Worn Ink at weight 500 with an Engraved Glass chevron that turns 90 degrees when open (160ms); hover turns the text Warm Ink.

### Icons
- **Family:** one set (Lucide path data, ISC), 18px, 2px stroke, round caps and joins, currentColor, hidden from assistive tech: lock, copy, download, check, chevron, send.

## Do's and Don'ts

### Do:
- **Do** put every live count in tubes: lit Nixie numerals in the drawn envelope, the unlit stack faintly visible, a single 520ms cross-fade when a value changes.
- **Do** reserve plasma (#ff8a00, #ffb35c) for what is live: numerals, ledger values, the clock, the Waiting lamp, the current position, focus, caret, selection and the action switch.
- **Do** pair every lamp with its word, and give every tube channel a full spoken sentence for screen readers.
- **Do** set headings, labels, buttons and tags in uppercase condensed caps with 0.1em to 0.2em tracking, and all running text in sentence-case Saira at 15 to 17px.
- **Do** set ledger values (case ids, keys, fingerprints, the contract address) in JetBrains Mono.
- **Do** frame each unit someone acts on with the drawn plate or housing (9-slice SVG with screws), and sink controls into it with inset shadows.
- **Do** keep touch targets at 44px minimum (52px for switches) and the 2px plasma focus outline at a 3px offset.
- **Do** honour reduced motion: every animation and transition off, values swap instantly.
- **Do** mark anything not yet built with the Planned tag and the demo organisation with the Demo organisation tag.

### Don't:
- **Don't** use the editorial paper look (warm paper, serif, ink) or the station departure board (deep blue ground, signal yellow); the user built and rejected both.
- **Don't** build the category's white-and-navy dashboard of stat cards; counts live in the instrument, not in cards.
- **Don't** use neon blues or purples, or any saturated hue beyond plasma orange, lamp green and alarm red.
- **Don't** make anything glow that is not lit; static surfaces take no coloured shadow.
- **Don't** convey state by colour alone.
- **Don't** set words in Nixie One, or running text in uppercase caps.
- **Don't** ship an irreversible action without a confirmation box.
