# squinky.dev Guestbook Backend

The static site calls `/api/guestbook`.

Deploy `api/worker.mjs` as a Cloudflare Worker with a KV namespace bound as `GUESTBOOK`, then route it to:

```text
squinky.dev/api/*
```

The Worker supports:

- `GET /api/guestbook` for approved entries
- `POST /api/guestbook` for new entries
- no-cursing rejection before saving
- a short post cooldown to slow spam

There is no admin panel yet. Current moderation is automatic: clean messages are approved immediately, and blocked words are rejected.

For local testing, run these in two terminal windows:

```text
python3 -m http.server 4173
node api/local-dev.mjs
```

Then open:

```text
http://127.0.0.1:4173/index.html
```
