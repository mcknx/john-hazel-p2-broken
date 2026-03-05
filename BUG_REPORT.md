# Bug Report — User Dashboard

## Bug 1: Tailwind CSS v3/v4 Mismatch
- **Symptom:** App fails to compile. PostCSS error: "trying to use tailwindcss directly as a PostCSS plugin"
- **File:** `app/globals.css`, `postcss.config.mjs`
- **Root Cause:** `globals.css` used Tailwind v3 directives (`@tailwind base/components/utilities`) but `tailwindcss@^4` was installed, which requires different syntax. PostCSS config also referenced `tailwindcss` directly instead of `@tailwindcss/postcss`.
- **Fix:** Replaced CSS directives with `@import "tailwindcss"`. Updated PostCSS config to use `@tailwindcss/postcss`. Installed `@tailwindcss/postcss` package.

## Bug 2: tsconfig.json — `paths` Outside `compilerOptions`
- **Symptom:** `Module not found: Can't resolve '@/lib/users'` — all `@/` path aliases fail to resolve.
- **File:** `tsconfig.json`
- **Root Cause:** The `paths` config was placed as a sibling of `compilerOptions` instead of inside it. TypeScript ignores `paths` unless it's within `compilerOptions`.
- **Fix:** Moved `paths` block inside `compilerOptions`.

## Bug 3: API Route Rejects GET Requests
- **Symptom:** Users list shows "Unable to load users." API returns 405 Method Not Allowed.
- **File:** `app/api/users/route.ts`
- **Root Cause:** The `GET` handler had `if (request.method !== "POST")` — rejecting every request since the method is always GET. In Next.js App Router, the export name (`GET`) already ensures only GET requests reach this function.
- **Fix:** Removed the unnecessary method check block entirely.

## Bug 4: Wrong React Key Property
- **Symptom:** React key warnings in console; potential rendering issues with list items.
- **File:** `app/page.tsx`
- **Root Cause:** `key={(user as any).userId}` but `User` type has `id`, not `userId` — key evaluates to `undefined` for every item.
- **Fix:** Changed to `key={user.id}`.

## Bug 5: useEffect Missing Dependency Array
- **Symptom:** Display name input resets to original value on every keystroke — impossible to edit.
- **File:** `app/users/[id]/UserDetail.tsx`
- **Root Cause:** `useEffect(() => { setDisplayName(user.name) })` has no dependency array, so it runs on every render — overwriting any typed input immediately.
- **Fix:** Added `[user.name]` as the dependency array.

## Bug 6: Synchronous Access to Async `params` (Next.js 15+)
- **Symptom:** Potential runtime error or incorrect behavior on the user detail page.
- **File:** `app/users/[id]/page.tsx`
- **Root Cause:** In Next.js 15+, `params` is a Promise. The code accessed `params.id` synchronously.
- **Fix:** Changed to `const { id } = await params`.