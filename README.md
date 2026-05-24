# bananascanner.com

Marketing and policy site for **Go Bananas: Banana Scanner**, the iOS and Android app that scans bananas for ripeness. Published by Harnisch LLC.

## Stack

- Astro 6 (static output)
- Tailwind 4 via `@tailwindcss/postcss`
- Deployed to Cloudflare via `wrangler deploy` (Workers Static Assets)

## Pages

- `/` — landing with brand hero + tagline + links
- `/privacy` — privacy policy (ported from the gobananas repo)
- `/support` — contact for tester feedback and support

## Local dev

```
npm install
npm run dev
```

## Deploy

```
npm run deploy
```

That builds to `./dist` and runs `wrangler deploy`, which pushes the static assets to the Cloudflare Worker named `bananascanner-website`. The custom domain `bananascanner.com` is configured in the Cloudflare dashboard.
