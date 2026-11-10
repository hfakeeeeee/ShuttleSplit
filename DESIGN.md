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
