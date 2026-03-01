# Aeternum Ponder Indexer

This indexer keeps a fast, queryable list of Evidence Vault proofs (ProofCreated / ProofRevoked) so the app does not rely on slow RPC `getLogs` for the "Recent Evidence Proofs" list.

---

## 1. Where the indexer URL comes from

The **indexer URL** is simply the address where this Ponder app is running:

| Environment | URL you use |
|-------------|-------------|
| **Local dev** | `http://localhost:42069` (Ponder’s default port) |
| **Production** | The URL of your deployed Ponder app (e.g. `https://aeternum-indexer.vercel.app` or your own host) |

The Next.js app reads it from **`NEXT_PUBLIC_INDEXER_URL`**. If that is set, the vault list loads from the indexer; if not, it falls back to Supabase or chain events.

---

## 2. Local setup (run indexer + app)

### Step 1: Install dependencies

From the **monorepo root** (`aeternum/`):

```bash
yarn install
```

If the Ponder package fails to resolve, you can install only inside the ponder package:

```bash
cd packages/ponder && yarn install && cd ../..
```

### Step 2: (Optional) Set RPC URL for Base Sepolia

Ponder uses `https://sepolia.base.org` by default. For faster indexing you can use an Alchemy/Infura URL:

- Create a file `packages/ponder/.env` (or set env in your shell):
  ```bash
  PONDER_RPC_URL_84532=https://sepolia-base.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
  ```

### Step 3: Start the indexer

From the **monorepo root**:

```bash
yarn workspace @aeternum/ponder dev
```

Or from `packages/ponder`:

```bash
cd packages/ponder && yarn dev
```

You should see:

- Database and HTTP server start
- Backfill over the configured block range (EvidenceVault on Base Sepolia)
- GraphQL at **http://localhost:42069/graphql**

Leave this terminal running.

### Step 4: Point the Next.js app at the indexer

In **`packages/nextjs/`**, create or edit `.env.local`:

```bash
# Ponder indexer (local)
NEXT_PUBLIC_INDEXER_URL=http://localhost:42069
```

No trailing slash. Save the file.

### Step 5: Run the Next.js app

From the monorepo root:

```bash
yarn start
```

(or `yarn workspace @se-2/nextjs dev`)

Open the app, connect your wallet on Base Sepolia, and go to the Vault section. The "Recent Evidence Proofs" list should load from the indexer (fast) instead of RPC events.

---

## 3. Verify the indexer

1. **Health:** Open [http://localhost:42069/health](http://localhost:42069/health) — should return 200.
2. **GraphQL:** Open [http://localhost:42069/graphql](http://localhost:42069/graphql) and run:
   ```graphql
   query {
     proofs(limit: 10, orderBy: "timestamp", orderDirection: "desc") {
       items {
         id
         owner
         fileHash
         timestamp
         arweaveTxId
       }
     }
   }
   ```
   You should see proof records once indexing has run.

---

## 4. Production (deploying the indexer)

To get a **production indexer URL**:

1. **Deploy Ponder** to a host that runs Node and has Postgres (e.g. [Ponder’s docs](https://ponder.sh/docs/production/self-hosting), or a platform that supports long-running processes + Postgres).
2. Set **`PONDER_RPC_URL_84532`** (and any other env) in that environment.
3. After deploy, note the public URL of the indexer (e.g. `https://your-indexer.railway.app`).
4. In your **Next.js** deployment (e.g. Vercel), set:
   ```bash
   NEXT_PUBLIC_INDEXER_URL=https://your-indexer.railway.app
   ```
   Again, no trailing slash.

Until you deploy, use `NEXT_PUBLIC_INDEXER_URL=http://localhost:42069` only for local dev (the browser can’t reach your laptop from the internet).

---

## 5. Summary

| Step | Action |
|------|--------|
| **Where to set the URL** | `packages/nextjs/.env.local` (or your host’s env) as `NEXT_PUBLIC_INDEXER_URL=...` |
| **Where you get the URL** | Local: `http://localhost:42069` when Ponder is running. Production: URL of your deployed Ponder app. |
| **Run indexer locally** | `yarn workspace @aeternum/ponder dev` (from repo root). |
| **Use in app** | Set `NEXT_PUBLIC_INDEXER_URL` and run the Next.js app; the vault list will use the indexer when the URL is set and reachable. |
