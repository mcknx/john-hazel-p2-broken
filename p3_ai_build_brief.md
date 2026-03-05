


**PART 2: BUILD BRIEF**

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT'S REQUEST                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  "I want my customers to be able to save their favorite     │
│   listings and get an email when something on a saved       │
│   listing changes. Oh and it should work without an         │
│   account too, for now at least. Nothing too complicated!"  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Breaking that down — 3 things they want:                   │
│                                                             │
│  ♥ SAVE    │ Users can bookmark/favorite listings           │
│            │ Think: Zillow heart button, eBay watchlist     │
│            │                                                │
│  ✉ NOTIFY  │ Email when a saved listing changes             │
│            │ Think: price drop alert, status update          │
│            │                                                │
│  👤 NO ACC  │ Works without creating an account              │
│            │ Think: guest checkout at an online store        │
│                                                             │
│  Real-world example:                                        │
│  ┌────────────────────────────────┐                         │
│  │  🏠 Beachfront Villa - $500k   │                         │
│  │  Status: Available             │                         │
│  │                                │                         │
│  │  [♥ Save]  [🔔 Notify me]     │                         │
│  └────────────────────────────────┘                         │
│         │               │                                   │
│         ▼               ▼                                   │
│    Saved to your     Enter email                            │
│    browser (cookie)  "john@gmail.com"                       │
│                         │                                   │
│                         ▼                                   │
│                    2 weeks later...                          │
│                    Price drops to $450k                      │
│                         │                                   │
│                         ▼                                   │
│                 ┌──────────────────┐                        │
│                 │ 📧 EMAIL SENT:   │                        │
│                 │ "Beachfront Villa│                        │
│                 │  price changed   │                        │
│                 │  $500k → $450k"  │                        │
│                 │ [View] [Unsub]   │                        │
│                 └──────────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```



```
┌─────────────────────────────────────────────┐
│              WHAT WE'RE BUILDING            │
├─────────────────────────────────────────────┤
│ A feature layer on top of existing listings │
│ that lets anonymous users:                  │
│   1. Save/bookmark listings (no account)    │
│   2. Subscribe to email notifications       │
│   3. Get notified when a listing changes    │
└─────────────────────────────────────────────┘
```

**User Flow:**
```
Browse listings
      │
      ▼
  Click ♥ "Save"
      │
      ├──→ Saved to browser (cookie stores anonymous ID)
      │
      ▼
  "Get notified?" prompt
      │
      ▼
  Enter email ──→ Verification email sent
      │                    │
      │                    ▼
      │              Click verify link
      │                    │
      ▼                    ▼
  Saved locally      Subscribed to changes
      │                    │
      │                    ▼
      │           ┌─────────────────┐
      │           │  CRON JOB runs  │
      │           │  Compares old   │
      │           │  snapshot to    │
      │           │  current data   │
      │           └────────┬────────┘
      │                    │ Change detected?
      │                    ▼
      │              Send email:
      │              "Price dropped $50→$40"
      │              [View listing] [Unsubscribe]
```

**Data Model:**
```
┌──────────────────┐     ┌───────────────────────┐
│    listings       │     │    saved_listings      │
│ (already exists)  │     │                       │
├──────────────────┤     ├───────────────────────┤
│ id               │◄────│ listing_id            │
│ title            │     │ anonymous_id (cookie) │
│ price            │     │ created_at            │
│ status           │     └───────────────────────┘
│ description      │
│ updated_at       │     ┌───────────────────────┐
│                  │     │  email_subscriptions   │
│                  │     ├───────────────────────┤
│                  │◄────│ listing_id            │
│                  │     │ email                 │
│                  │     │ anonymous_id          │
│                  │     │ verified (bool)       │
│                  │     │ unsubscribe_token     │
│                  │     │ created_at            │
└──────────────────┘     └───────────────────────┘
                         ┌───────────────────────┐
                         │  listing_snapshots    │
                         ├───────────────────────┤
                         │ listing_id            │
                         │ snapshot (JSON)       │
                         │ captured_at           │
                         └───────────────────────┘
```

**Tech Stack:**
```
Frontend:  Next.js (React + API routes)
Database:  Supabase (Postgres)
Email:     Resend (transactional emails)
Cron:      Supabase Edge Functions (scheduled)
Identity:  httpOnly cookie with UUID (generated on first visit)
```

**Edge Cases:**
```
Problem                          │ Solution
─────────────────────────────────┼──────────────────────────────────
User clears cookies              │ Saved listings lost locally.
                                 │ If subscribed, send recovery link
                                 │ via email with their saved items.
─────────────────────────────────┼──────────────────────────────────
Same email subscribes twice      │ Deduplicate: unique constraint
to same listing                  │ on (email + listing_id)
─────────────────────────────────┼──────────────────────────────────
Listing gets deleted             │ Notify subscribers: "This listing
                                 │ is no longer available." Remove
                                 │ subscriptions.
─────────────────────────────────┼──────────────────────────────────
Emails bounce                    │ Track bounces. After 3 bounces,
                                 │ mark subscription inactive.
─────────────────────────────────┼──────────────────────────────────
Unsubscribe                      │ One-click via token in email URL.
                                 │ Required for CAN-SPAM compliance.
```

**Deliberately NOT building:**
```
❌ User accounts        → Client said "without account for now"
❌ Real-time push       → Email only per spec
❌ Listing CRUD         → Assumed existing
❌ Mobile notifications → Not requested
```

---

**PART 3: TASK BREAKDOWN**

```
Task                                │ Est   │ Easy/Hard?
────────────────────────────────────┼───────┼──────────────────────────────
Data model + Supabase setup         │ 2 hrs │ Easy — standard CRUD tables
Anonymous ID cookie system          │ 1 hr  │ Easy — generate UUID, set cookie
Save/unsave listing UI + API        │ 3 hrs │ Medium — toggle state, sync cookie↔DB
Email subscription flow             │ 2 hrs │ Medium — verification email adds a step
Change detection cron               │ 3 hrs │ HARDEST — comparing JSON snapshots,
                                    │       │   deciding what counts as "changed",
                                    │       │   batching emails efficiently
Email templates + Resend sending    │ 2 hrs │ Easy — templated HTML, one API call
Unsubscribe flow                    │ 1 hr  │ Easy — token-based URL, one DB update
Testing + edge cases                │ 2 hrs │ Medium — many async flows to verify
────────────────────────────────────┼───────┼
TOTAL                               │16 hrs │
```

---

**Follow-up questions:**
```
"Hardest part devs underestimate?"
→ Change detection. Comparing snapshots sounds simple but:
  what if 50 fields change at once? Do you send 50 emails or 1?
  What's the cron interval? Too frequent = expensive. Too slow = stale.

"What if they add accounts in 3 months?"
→ The anonymous_id system becomes a migration problem.
  Need to merge anonymous saved_listings into the new user record.
  email_subscriptions would link to user_id instead of anonymous_id.
  The save/subscribe UI barely changes. The backend needs a merge step.

"Assumption about X — what if different?"
→ I assumed listings already exist. If NOT, add 8-10 hrs for
  full listing CRUD + admin panel + image uploads. Brief doubles in scope.
```

---