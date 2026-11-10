# ShuttleSplit design

- Theme: Liquid glass on a dark canvas, explicitly selected by the user. No sidebar.
- Shell: horizontal navigation, normal document scrolling, large page title and translucent cards with static ambient background gradients. Opaque fallback when backdrop blur is unavailable.
- Font: Be Vietnam Pro, weights 400, 500, 600, 700; selected by the user for rounded letterforms.
- Typography: body 17px, controls 16–17px, section titles 24px, page titles 30–36px. Status colors retain their meanings.
- Default dark mode; light mode remains available. Preference key: shuttleSplit_inset_theme.
- Active theme: src/soft-theme.css for shared controls, src/liquid-theme.css for the current appearance. Inset preview is inactive.
- Preserve English copy, data and business logic.

- Palette refined to navy, lavender and neutral surfaces; other colors reserved for status and original payment artwork.
- Month toolbar: compact transparent month selector, separate actions, full text on mobile.
- Payment artwork: public/images/new_momo.jpg, shared PaymentQRCode component in Summary and Sheet views. Legacy bank image is not rendered. The supplied QR image is displayed unchanged; old stored image overrides are no longer used.

- Glass refinement: 42% dark / 48% light surface opacity, 30px blur, layered inner edge highlights, stronger lavender ambient light. Text and input surfaces remain opaque enough for reading.

- Player refinement: enlarged total label (23–30px), soft rounded focus treatment, centered team pills, glass player cards; Summary card structure retained.
- Month selector uses GlassSelect with pointer, arrow keys, Enter and Escape support instead of the native browser menu.

- Summary polish: remove legacy filled session rows and italic/opacity treatment; use fine separators, clear amounts and quiet non-participation labels. Centered team pill gets lavender fill, brighter rim and static subtle glow.

- Overview density: compact total (21px label / 28px value desktop), summary title and total share a row on desktop, view controls share a toolbar; reduced upper spacing to bring player cards into the initial viewport.

- Status accents explicitly requested: Paid has a green label, illuminated rim and glow; Unpaid has a neutral text label. Attended session rows use lavender fill/rim/glow, absent sessions stay quiet.
- Configuration color roles: teams/cyan, players/lavender, removal/red. Colors are fixed by function, not randomly assigned to cards.

- Configuration palette revised by user: muted lavender and neutral glass, no cyan accents or icon glow. Team chips and action buttons use subdued neutrals; delete reveals red only on hover. Summary status/attendance colors are unchanged.

- Configuration final preference: soft lavender glow on card rims and team badges, slightly stronger on hover. No cyan. Summary colors remain unchanged.
