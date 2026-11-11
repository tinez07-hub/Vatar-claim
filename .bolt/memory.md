# Project memory

## Product intent & audience

- "Vatar-claim" is a claim/payment application built with Vite + React.
- Users authenticate (login), enter a PIN to claim, then complete email verification before seeing a payment success screen.
- Admins manage users via a dedicated admin page (view credentials, delete users).

## Brand personality & voice

- Production-grade, polished UI; "beautiful, not cookie cutter" per global prompt.
- Tone is functional and transactional (claim flow, admin dashboard).

## Visual design & UX direction

- **Admin page:** "Admin" heading; refresh and lock (Lucide) icons; Dashboard / User details toggle; user list showing password, PIN, and per-row trash delete; "Back to claim" link.
- **Claim flow screens:** PIN entry → "Please log in again in 3 minutes; a code will be sent to your email" message → (user re-logs in) → 6-digit email code input → payment successful screen.
- Icons from `lucide-react`; styling via Tailwind CSS.
- Modules imported via `@/` path alias (maps to `src/`).

## Decisions, constraints & rationale

- **Admin redesign complete:** frontend-only, builds cleanly; not yet browser-verified.
- **Verification flow not yet implemented:** blocked on two factors:
  - No email provider configured (needs Resend/SendGrid API key + sender address from user).
  - Database migration and server function deployment cannot be applied from the current session.
- Flow will be built once provider is supplied: relogin message → code screen → success message.
- Database skill loaded; schema checked; no email-sending key present in project secrets.

## Open questions & assumptions

- Which email provider will be used (Resend, SendGrid, other)? API key and sender email needed.
- How should the 3-minute wait be enforced (client-side countdown vs. server-side timestamp)?
- Where is the 6-digit code stored/validated — database table or serverless function?
- Does "relogin" mean full logout/login or just re-entering credentials on the same session?
- Admin page needs visual verification on the user's device (mobile).