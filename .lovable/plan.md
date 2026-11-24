# Redesign the NorthGo booking experience

## What will change
- Make the home and customer booking screens feel like a compact, polished transport app, with a clean white surface, deep navy text, restrained blue accents and NorthGo branding.
- Keep the four-tab mobile navigation for Home, Bookings, Tickets and Profile, and simplify the shared header and footer.
- Rework the home screen around the two Isiolo ⇄ Nairobi directions, departure windows, a clear seat-booking action and the existing private-hire request form.
- Remove customer-facing review cards, stars, rating totals, testimonials and rating prompts across the homepage, driver listings/profiles, trip listings and booking confirmation. Keep administrative review tools and backend data intact.
- Preserve seat booking, live availability, driver contact, WhatsApp, Cash/M-Pesa pay-on-board, private hire, authentication and existing integrations.
- Check the experience at mobile and desktop sizes and verify the central booking navigation remains usable.

## Technical details
- Reuse the existing TanStack routes, Header, BottomNav, Footer and design tokens; avoid changing database or server behavior.
- Update customer-facing metadata and copy only where needed to remove review claims.
