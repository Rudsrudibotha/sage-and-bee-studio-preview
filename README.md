# Sage & Bee Studio website concept

Independent, responsive static website built for a prospective client. This is an unsolicited preview awaiting business approval, not an official website. Research date: 14 September 2026. No independent website was found in the checks recorded in SOURCES.md; absence is not proven.

## Run locally

Open `index.html`, or serve this directory with any static server, for example `python -m http.server 8766 --bind 127.0.0.1`.

## Deploy

No build step or dependency installation. Publish the repository root through GitHub Pages. All CSS, JavaScript, images and favicon links are relative and support repository subpaths. `.nojekyll`, robots exclusion and a noindex meta tag are included. These discourage indexing but do not provide access control.

## Behaviour

The original hero leads into a connected journey of three real business photographs, concise captions, and a progressively drawn path. The composition alternates and overlaps across the page; on mobile it becomes a compact, staggered photo/caption/connector grid. Native scrolling, reduced-motion support, keyboard navigation, responsive menu and a native photograph dialog are included. The dialog shows each complete photograph, with previous/next controls, arrow keys, Escape and focus restoration. Gallery links still open the original local image without JavaScript. Contact links open the relevant client application and do not automatically send anything. No forms, analytics, cookies, third-party scripts, CDN or remote image dependency.

## Content and limitations

Business offer/contact/location facts and photos come from public business pages; detailed provenance is in SOURCES.md. Real photographs are copied unchanged, retaining existing watermarks. Publicly accessible photos do not establish reuse rights; confirm the business owns or can license their intended use before an accepted public launch. No AI portfolio photography, fabricated testimonials, prices, stock, delivery timing or founding story is used.

Availability, pricing, scope, location/collection arrangements and ownership of imagery must be confirmed with the business before launch. No messages have been sent. The contact channels have been checked as link destinations, without sending an enquiry. The concept footer should remain until business approval. Source photos limit visual resolution; higher-resolution originals can replace the same files after approval.

## Design

Each site has its own composition and palette. Cinematic inspiration is translated into normal-flow photographic chapters and restrained scroll movement rather than artificial product animation. Native system fonts remove external font dependencies. The favicon is a typographic concept monogram, not a claim to be the business's official mark.

## Connected journey revision

The user's Adorable Bekkies Academy photo-story architecture informed the motion: one-time entrances, remembered path progress, separate transform wrappers and small opposing drift. No Academy photographs or decorative assets are included. ImageGen section concepts were inspected before implementation; generated pixels are not production assets. Each brand has its own geometry, typography and connector: measured linework for Cash, a floral stem for Marelise, a looping personalisation thread for Sage & Bee.

Sections remain in normal flow, with no pin, scroll snap, synthetic scroll position or delay before movement. On desktop the two opposing photo translations stay within 6.3px; their values follow the current scene bounds directly and have no CSS catch-up transition. The path retains the furthest point reached, including rapid exits. Reveal memory survives motion-preference changes; visible, above-screen and keyboard-focused content stays readable. Reduced-motion displays complete paths and static, visible photographs. Geometry reads are batched before style writes and scroll events use one scheduled update; hidden responsive connector windows do not complete prematurely.

The photo sequence is editorial, not a before/after transformation or a documented making process. Captions describe only the photographed examples and verified business offer. QA checks cover real desktop/mobile scrolling and galleries, with an isolated controller check for preference changes and edge cases; browser animation preference was not changed on the user's system.
