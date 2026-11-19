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

<!-- impeccable:design-map -->
Name: Sotto
Colors: primary: plasma #ff8a00; secondary: ontime #6fd696; neutral: chassis #0f0e0d; primary: plasma-soft #ffb35c; primary: on-plasma #140a00; secondary: on-ontime #04140a; secondary: late #ff5a3c (+11 more in the sidecar)
Fonts: Big Shoulders Display (display, headline, title); Saira (lede, body, body-sm); Saira Semi Condensed (label, label-control, label-control-sm, label-nav, label-field, label-status, label-plate, label-tag); Nixie One (numeral, clock); JetBrains Mono (mono, mono-field)
Spacing: tight 8px, control 10px, cluster 12px, inset 14px, gutter 16px, block 24px, stack 28px, section 40px, hero 48px
Radius: xs 3px, sm 4px, md 6px, full 50%
North Star: "The Laboratory Counter"
Rules:
- The Live Light Rule. Plasma is light, and light means live.
- The Lamp And Word Rule. State is never colour alone.
- The No Neon Rule. No blues and no purples anywhere.
- The Engraved Caps Rule. Every heading, label, button and tag is uppercase condensed caps with open tracking (0.05em at display sizes, 0.1em to 0.2em on labels).
- (+5 more)
Elevation:
- Plate lift: filter: drop-shadow(0 12px 18px rgb(0 0 0 / 0.55))
- Housing lift: filter: drop-shadow(0 16px 22px rgb(0 0 0 / 0.6))
- Switch recess: inset 0 2px 5px rgb(0 0 0 / 0.75), 0 1px 0 rgb(255 255 255 / 0.05)
- Field well: inset 0 2px 6px rgb(0 0 0 / 0.6)
- Name plate inset: inset 0 1px 2px rgb(0 0 0 / 0.7)
- Top plate seam: 0 1px 0 #050506
- Numeral glow: text-shadow: 0 0 4px rgb(255 179 92 / 0.9), 0 0 14px rgb(255 138 0 / 0.75), 0 0 32px rgb(255 100 0 / 0.45)
- Clock glow: text-shadow: 0 0 8px rgb(255 138 0 / 0.6)
- Lamp glow: 0 0 6px
Don't:
- Don't use the editorial paper look (warm paper, serif, ink) or the station departure board (deep blue ground, signal yellow); the user built and rejected both.
- Don't build the category's white-and-navy dashboard of stat cards; counts live in the instrument, not in cards.
- Don't use neon blues or purples, or any saturated hue beyond plasma orange, lamp green and alarm red.
- Don't make anything glow that is not lit; static surfaces take no coloured shadow.
- Don't convey state by colour alone.
- Don't set words in Nixie One, or running text in uppercase caps.
- Don't ship an irreversible action without a confirmation box.
Full: .impeccable/design-full.md (read a section when you need its detail)
