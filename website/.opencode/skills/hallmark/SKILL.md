---
name: hallmark
description: "Anti-AI-slop design skill for redesigns. Use hallmark [redesign] or follow Hallmark principles."
---

# Hallmark

Apply these principles when redesigning pages:

## Design Direction
- **Audience**: Utah community members, wildfire preparedness activists, tech-hobbyists
- **Use case**: Drive network signups, sensor deployments
- **Tone**: Editorial-utilitarian — magazine copy, functional but sophisticated

## Theme (Custom Editorial)
- Paper: warm off-white (#FAF8F5)
- Ink: deep charcoal (#1A1A1A)
- Accent: terracotta/rust (#C45A3B)
- Display: serif (Playfair Display or Instrument Serif)
- Body: grotesk sans (Space Grotesk or Archivo)

## Key Hallmark Rules

### NEVER DO
1. Centered-everything hero
2. Inter/Roboto/Poppins as display font
3. Italic headings — remain roman
4. `transition: all`
5. Hover scale on unrelated elements
6. Re-drawn browser/phone chrome
7. Fabricated metrics without source
8. Two-line buttons/CTA
9. Purple-to-blue gradients on text
10. Image grids without `minmax(0, 1fr)`

### ALWAYS DO
- Asymmetric layouts over centered
- Typography-led (no decoration needed)
- serif display + sans body
- accent ≤ 5% viewport coverage
- Every interactive element: hover, focus, active, disabled states
- `overflow-x: clip` on html/body
- max-width: 45-75ch for prose
- 4pt/8pt spacing scale

### Mobile
- Test at 320, 375, 414, 768px
- No horizontal scroll
- Buttons never wrap to 2 lines
- `overflow-wrap: anywhere` on display text

## Macrostructure for Uinta Watch
- Hero: typographic with parallel alignment (not centered)
- Sections: clear rhythm, data-forward
- CTA: prominent but not the only focus
- Footer: statement-style (not 4-column links)

## CSS Stamp Required
```css
/* Hallmark · macrostructure: <name> · genre: editorial · theme: custom-editorial
 * contrast: pass (40-41)
 * mobile: pass (34, 49, 50-57)
 */
```