window.__ModuleLoader__.load({
  id: '@stars-twinkle/dsh-liquid-glass',
  factory() {
    /**
     * Liquid-glass skin for the whole shell: one light field behind the app
     * frame, a frosted sidebar, a frosted conversation panel, rounded window
     * corners, and a translucent drag strip on Windows.
     *
     * Design constraints (the reason this file is small):
     * - Nothing but paint properties is touched. Columns keep their
     *   `display`, `grid-template-columns`, `height`, `overflow` and scrolling;
     *   only backgrounds, radii, shadows and pseudo-elements change.
     * - Each glass surface is a `::before` on the negative layer of an
     *   isolated container. A positioned pseudo-element with z-index auto
     *   paints above inline text and would blur the UI itself.
     * - `backdrop-filter` is never applied to a container with children: the
     *   conversation hosts a `position: fixed` popover (ContextMeter), which
     *   would be re-anchored and clipped by a filtered ancestor. Pseudo
     *   elements have no descendants, so they are safe.
     * - Selectors use only stable anchors: `#root`, `[data-slot="root"]`,
     *   `[data-slot="sidebar"]`, `[data-slot="main.conversation"]`,
     *   `[data-phase]`, `[data-composer-seat]`, `[data-windows-titlebar]`.
     *   Hashed CSS-module names are never referenced, so a DSH rebuild cannot
     *   turn this skin into a broken layout.
     * - Uninstalling the plugin removes the style element and the window is
     *   untouched again.
     */
    const STYLE_ID = 'dsh-liquid-glass';

    const CSS = `
/* ================= 1. window wallpaper + rounded corners =================
   One shared light field behind every column, and the app frame's own
   corners. It only adds a background image and a radius: display:grid,
   the inline grid-template-columns, height and overflow stay untouched. */
#root > [data-slot="root"] > div {
  border-radius: 12px;
  background-image:
    radial-gradient(46% 58% at 8% 0%, rgba(96, 165, 250, .30), rgba(96, 165, 250, 0) 70%),
    radial-gradient(36% 50% at 95% 4%, rgba(139, 92, 246, .24), rgba(139, 92, 246, 0) 72%),
    radial-gradient(44% 56% at 86% 100%, rgba(20, 184, 166, .20), rgba(20, 184, 166, 0) 72%),
    radial-gradient(52% 48% at 26% 96%, rgba(236, 72, 153, .16), rgba(236, 72, 153, 0) 76%);
  background-repeat: no-repeat;
}

/* The Windows drag strip sits on top of the wallpaper: keep it readable but
   let the light through instead of painting an opaque bar. */
html[data-windows-titlebar] #root > [data-slot="root"] > div::before {
  background: color-mix(in srgb, var(--dsw-specific-sidebar-fill) 38%, transparent);
}

/* ================= 2. sidebar =================
   The column and the sidebar's own root both paint the opaque fill, so both
   are cleared; the glass lives on the sidebar root's negative layer. */
#root div:has(> [data-slot="sidebar"]) {
  background: transparent;
}

#root [data-slot="sidebar"] > * {
  position: relative;
  isolation: isolate;
  background: transparent;
}

#root [data-slot="sidebar"] > *::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-color: color-mix(in srgb, var(--dsw-specific-sidebar-fill) 50%, transparent);
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, .10) 0, rgba(255, 255, 255, 0) 200px);
  background-repeat: no-repeat;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .14),
    inset -1px 0 0 rgba(255, 255, 255, .07);
  /* No backdrop-filter here on purpose: the sidebar column animates its grid
     track on collapse/expand, and blurring a resizing surface every frame
     stalls the transition. The backdrop is the static wallpaper anyway. */
}

/* ================= 3. centre column + conversation panel =================
   Both opaque layers are cleared so the wallpaper reaches the conversation
   glass. The conversation panel keeps no wallpaper of its own. */
#root div:has(> [data-slot="main"]) {
  background: transparent;
  border-radius: 0;
}

#root [data-slot="main.conversation"] > [data-phase] {
  isolation: isolate;
  background-color: transparent;
  background-image: none;
}

/* Glass body. It must live on the negative layer of the isolated panel: a
   positioned pseudo-element with z-index auto paints above inline text and
   would blur the conversation itself. */
#root [data-slot="main.conversation"] > [data-phase]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  border-radius: inherit;
  background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 50%, transparent);
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, .30) 0, rgba(255, 255, 255, .05) 92px, rgba(255, 255, 255, 0) 220px);
  background-repeat: no-repeat;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .55),
    inset 0 0 0 .5px rgba(255, 255, 255, .30),
    inset 0 -1px 0 rgba(255, 255, 255, .14),
    inset 0 0 64px rgba(255, 255, 255, .10);
  -webkit-backdrop-filter: blur(18px) saturate(170%) brightness(1.02);
  backdrop-filter: blur(18px) saturate(170%) brightness(1.02);
}

/* While a column track is animating or being dragged, the conversation and
   composer glass change width every frame. A live backdrop-filter there would
   stall the transition, so it steps aside for the duration; the tint and
   highlights stay, so nothing visibly jumps. */
#root > [data-slot="root"] > div[data-animating] [data-slot="main.conversation"] > [data-phase]::before,
#root > [data-slot="root"] > div[data-dragging] [data-slot="main.conversation"] > [data-phase]::before,
#root > [data-slot="root"] > div[data-animating] [data-composer-card]::before,
#root > [data-slot="root"] > div[data-dragging] [data-composer-card]::before {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

/* The active-state composer veil fades into the window background; keep the
   fade translucent so the glass does not turn into an opaque band. */
body #root [data-slot="main.conversation"] > [data-phase] [data-composer-seat] {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0,
    color-mix(in srgb, var(--dsw-alias-bg-base) 58%, transparent) 36px);
}

/* ================= 4. composer card + its controls =================
   The card paints an opaque --dsw-specific-input-major. It becomes a sheet of
   glass; the blur lives on its own pseudo-element so no descendant gains a
   containing block. */
#root [data-composer-card] {
  isolation: isolate;
  background-color: transparent;
  background-color: color-mix(in srgb, var(--dsw-specific-input-major) 68%, transparent);
  box-shadow:
    var(--dsw-elevation-soft),
    inset 0 1px 0 rgba(255, 255, 255, .20),
    inset 0 0 0 .5px rgba(255, 255, 255, .11);
}

#root [data-composer-card]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  border-radius: inherit;
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, .16) 0, rgba(255, 255, 255, .02) 48px, rgba(255, 255, 255, 0) 120px);
  background-repeat: no-repeat;
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
}

/* Round controls inside the composer get a specular rim; no geometry changes. */
#root [data-composer-card] button {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .22);
}

/* ================= 5. modal panels =================
   The settings panel is portalled to <body> and tagged with a stable
   data-shortcut-modal marker. Its mask already blurs the app behind it, so the
   panel only needs a translucent fill, a light rim and a breath of colour. */
body [data-shortcut-modal="settings"] {
  background-color: transparent;
  background-color: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 90%, transparent);
  background-image:
    radial-gradient(64% 48% at 10% 0%, rgba(96, 165, 250, .18), rgba(96, 165, 250, 0) 72%),
    radial-gradient(52% 42% at 100% 0%, rgba(139, 92, 246, .14), rgba(139, 92, 246, 0) 74%);
  background-repeat: no-repeat;
  box-shadow:
    var(--dsw-elevation-prominent),
    inset 0 1px 0 rgba(255, 255, 255, .16),
    inset 0 0 0 .5px rgba(255, 255, 255, .10);
}

/* ================= 6. cards, message bubble, round controls =================
   Class-module local names survive rebuilds even though their hash prefix does
   not, so the card suffixes (_card, Card) target the card surfaces of every
   package while staying independent of any single build. Each keeps its own
   fill token and only loses opacity, so the palette stays the host's. */
body :is([class$="_card"], [class$="Card"]) {
  background-color: color-mix(in srgb, var(--dsw-alias-settings-card-fill) 68%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .10),
    inset 0 0 0 .5px rgba(255, 255, 255, .06);
}

body [class$="_bubble"] {
  background-color: color-mix(in srgb, var(--dsw-specific-bubble) 78%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .10),
    inset 0 0 0 .5px rgba(255, 255, 255, .07);
}

/* Cards such as the changed-files one paint a full-width inner header with
   their own --changes-fill/--changes-hover tokens, which covers the glass
   underneath. Fading those tokens does nothing for cards that never define
   them: the declaration is simply invalid there and the host fill stays. */
body [class$="_card"] [class$="_header"] {
  background-color: color-mix(in srgb, var(--changes-fill) 72%, transparent);
}

body [class$="_card"] [class$="_header"]:hover {
  background-color: color-mix(in srgb, var(--changes-hover) 76%, transparent);
}

#root [data-composer-card] [class$="_add"] {
  background-color: color-mix(in srgb, var(--dsw-specific-selector) 72%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .30),
    inset 0 0 0 .5px rgba(255, 255, 255, .16),
    0 2px 6px -2px rgba(0, 0, 0, .25);
}

#root [data-composer-card] [class$="_add"]:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--dsw-alias-interactive-bg-hover-solid) 80%, transparent);
}

/* ================= 7. trajectory view =================
   The trajectory ledger stacks several opaque --dsw-alias-bg-layer-1 surfaces
   (view root, split, table, timeline plot, detail pane). Clearing them lets the
   conversation glass show through; the sticky table header keeps a mostly
   opaque fill so rows do not bleed under it while scrolling. */
#root [data-slot="conversation.view"] > *,
#root [data-slot="conversation.view"] > * [class$="_root"],
#root [data-slot="conversation.view"] > * [class$="_split"],
#root [data-slot="conversation.view"] > * [class$="_table"],
#root [data-slot="conversation.view"] > * [class$="_plot"],
#root [data-slot="conversation.view"] > * [class$="_toolbar"] {
  background-color: transparent;
}

#root [data-slot="conversation.view"] [class$="_table"] th {
  background-color: color-mix(in srgb, var(--dsw-specific-sidebar-fill) 88%, transparent);
}

/* ================= 8. dark palette ================= */
body[data-ds-dark-theme] #root > [data-slot="root"] > div {
  background-image:
    radial-gradient(46% 58% at 8% 0%, rgba(59, 130, 246, .50), rgba(59, 130, 246, 0) 70%),
    radial-gradient(36% 50% at 95% 4%, rgba(139, 92, 246, .42), rgba(139, 92, 246, 0) 72%),
    radial-gradient(44% 56% at 86% 100%, rgba(20, 184, 166, .32), rgba(20, 184, 166, 0) 72%),
    radial-gradient(52% 48% at 26% 96%, rgba(236, 72, 153, .24), rgba(236, 72, 153, 0) 76%);
}

body[data-ds-dark-theme] #root [data-slot="sidebar"] > *::before {
  background-color: color-mix(in srgb, var(--dsw-specific-sidebar-fill) 56%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .10),
    inset -1px 0 0 rgba(255, 255, 255, .05);
}

body[data-ds-dark-theme] #root [data-slot="main.conversation"] > [data-phase]::before {
  background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 54%, transparent);
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, .14) 0, rgba(255, 255, 255, .03) 92px, rgba(255, 255, 255, 0) 220px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .22),
    inset 0 0 0 .5px rgba(255, 255, 255, .14),
    inset 0 -1px 0 rgba(255, 255, 255, .06),
    inset 0 0 64px rgba(255, 255, 255, .05);
}

body[data-ds-dark-theme] #root [data-composer-card] {
  background-color: color-mix(in srgb, var(--dsw-specific-input-major) 62%, transparent);
  box-shadow:
    var(--dsw-elevation-soft),
    inset 0 1px 0 rgba(255, 255, 255, .12),
    inset 0 0 0 .5px rgba(255, 255, 255, .10);
}

body[data-ds-dark-theme] #root [data-composer-card]::before {
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, .08) 0, rgba(255, 255, 255, .01) 48px, rgba(255, 255, 255, 0) 120px);
}

body[data-ds-dark-theme] #root [data-composer-card] button {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .16);
}

body[data-ds-dark-theme] [data-shortcut-modal="settings"] {
  background-color: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 68%, transparent);
  background-image:
    radial-gradient(64% 48% at 10% 0%, rgba(59, 130, 246, .22), rgba(59, 130, 246, 0) 72%),
    radial-gradient(52% 42% at 100% 0%, rgba(139, 92, 246, .18), rgba(139, 92, 246, 0) 74%);
  box-shadow:
    var(--dsw-elevation-prominent),
    inset 0 1px 0 rgba(255, 255, 255, .10),
    inset 0 0 0 .5px rgba(255, 255, 255, .06);
}

body[data-ds-dark-theme] :is([class$="_card"], [class$="Card"]) {
  background-color: color-mix(in srgb, var(--dsw-alias-settings-card-fill) 62%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .07),
    inset 0 0 0 .5px rgba(255, 255, 255, .04);
}

body[data-ds-dark-theme] [class$="_bubble"] {
  background-color: color-mix(in srgb, var(--dsw-specific-bubble) 82%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .07),
    inset 0 0 0 .5px rgba(255, 255, 255, .05);
}

body[data-ds-dark-theme] #root [data-composer-card] [class$="_add"] {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .18),
    inset 0 0 0 .5px rgba(255, 255, 255, .10),
    0 2px 6px -2px rgba(0, 0, 0, .35);
}

/* ================= 8. fallbacks ================= */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  #root [data-slot="main.conversation"] > [data-phase]::before {
    background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 78%, transparent);
  }
  #root [data-composer-card] {
    background-color: color-mix(in srgb, var(--dsw-specific-input-major) 88%, transparent);
  }
}
`;

    function apply(ctx) {
      ctx.effect(() => {
        for (const stale of Array.from(document.querySelectorAll(`style[data-plugin="${STYLE_ID}"]`))) stale.remove();
        const tag = document.createElement('style');
        tag.dataset.plugin = STYLE_ID;
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return () => tag.remove();
      }, 'liquid-glass: conversation skin');
    }

    return { apply };
  },
});
