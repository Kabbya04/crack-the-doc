# Pending Tasks & Future Work

This file lists work that is **not yet implemented**, especially around **auth**, **document storage**, and **account-related features**. The app currently uses **local storage** for persistence; the items below assume a future auth system and optional backend.

---

## Authentication & Account System

- [ ] **Choose and integrate an auth provider** (e.g. Google Sign-In, Firebase Auth, Auth0, or custom backend).
- [ ] **Sign-in / Sign-up UI** — Login and registration flows (or “Sign in with Google” only).
- [ ] **Session management** — Token refresh, logout, and secure storage of auth state.
- [ ] **Protected routes** — Redirect unauthenticated users to login where appropriate (or keep app usable without auth and gate only certain features).
- [ ] **User profile** — Minimal profile (display name, email) and optional settings (e.g. theme, notifications).
- [ ] **Account deletion** — Allow users to delete their account and associated data (for compliance and trust).

---

## Document Storage & Persistence

- [ ] **Store documents in the cloud** — Replace or complement local storage with user-scoped document storage (e.g. Google Drive, S3, or your own backend).
- [ ] **Document list / library** — List of user’s saved documents (by account), with metadata (name, date, mastery status, etc.).
- [ ] **Sync recall ratings, takeaways, and mastery** — Persist per-document state (ratings, one-line takeaway, mastered flag) to the backend keyed by user + document.
- [ ] **Sync “last doc” and “today’s quiz” source** — So “Today’s quiz” (questions from docs studied yesterday) and daily streak work across devices once the user is signed in.
- [ ] **Sync streak and activity** — Store `lastActivityDate` and `currentStreak` per user so streak is consistent across devices and survives clearing local storage.

---

## Features That Depend on Auth / Backend

- [ ] **Today’s quiz across devices** — Sync “studied per day” and quiz questions per user so today’s quiz is the same on all devices and based on docs they actually studied yesterday on any device.
- [ ] **Today’s quiz: strict “yesterday only”** — Right now, if no docs were studied yesterday, the app falls back to the last open doc. With auth, you could show an empty state (“Study something today to get a quiz tomorrow”) instead of fallback, or keep fallback as an option.
- [ ] **Quiz reminders / notifications** — Optional push or email (“Your daily quiz is ready”) to bring users back (requires backend or third-party and user consent).
- [ ] **History of takeaways** — List past “one-line takeaways” by document and date (optional; can stay local until you have a backend).
- [ ] **Mastered docs list** — Show all documents the user has mastered (requires stored mastery state per user).
- [ ] **Reminders / emails** — Optional “daily quiz” or “keep your streak” email (requires backend or third-party service and user email).
- [ ] **Sharing & collaboration** — Share a study pack or document link with others (e.g. read-only link; may require backend and permissions).

---

## Data & Privacy

- [ ] **Privacy policy and terms** — If you collect emails or store user data, add a privacy policy and terms of use.
- [ ] **Data export** — Let users export their data (documents list, takeaways, ratings, streak) in a portable format.
- [ ] **GDPR / compliance** — If you have EU users, consider consent, data minimization, and right-to-deletion (tied to account deletion above).

---

## Infrastructure & DevOps (if you add a backend)

- [ ] **Backend API** — REST or GraphQL API for auth, document metadata, and synced state (ratings, takeaways, streak, mastery).
- [ ] **Database** — Store users, document metadata, and per-document state; keep document content in object storage or a separate doc store if needed.
- [ ] **Environment and secrets** — Move API keys and auth config to environment variables / secrets (no secrets in frontend for backend auth).
- [ ] **Rate limiting and abuse prevention** — Especially on document upload and LLM endpoints.

---

## Optional Product Enhancements (non-auth)

- [ ] **RAG for long docs** — Already partially implemented (OpenAI embeddings + retrieval when doc > 12k chars); consider making it the default for long docs and improving chunking/ranking.
- [ ] **Offline / PWA** — Service worker and caching so the app works offline for already-loaded documents.
- [ ] **Mobile layout** — Further tweaks for small screens (e.g. Library, Focus, Today’s quiz card).
- [ ] **Accessibility** — Full keyboard navigation, screen reader labels, and contrast checks for new UI.
- [ ] **Analytics (privacy-friendly)** — Optional usage metrics (e.g. feature usage, errors) without identifying users, if you add a backend.

---

*Last updated after implementing: Today’s quiz (multiple questions from docs studied yesterday, with fallback to last doc), Explain to a 10-year-old, Confidence heatmap, One-line takeaway, and Doc mastery + streak (all using local storage).*
