# Aeternum Production Deployment Checklist

This document outlines the final verification steps before promoting Aeternum to production.

## 1. Environment Secrets Audit
Ensure the following secrets are set in the production environment (e.g., Vercel, Supabase):

- [ ] `IRYS_PRIVATE_KEY`: Private key with enough Base ETH for Arweave uploads.
- [ ] `IRYS_RPC_URL`: Reliable Base RPC (e.g., Alchemy/QuickNode).
- [ ] `PINATA_JWT`: Valid Pinata JWT for IPFS pinning.
- [ ] `NEXT_PUBLIC_SUPABASE_URL`: Production Supabase project URL.
- [ ] `SUPABASE_SERVICE_ROLE_KEY`: **CRITICAL**: Server-only key, never expose to client.
- [ ] `STRIPE_SECRET_KEY`: Production Stripe secret key.
- [ ] `STRIPE_WEBHOOK_SECRET`: Production Stripe webhook secret.
- [ ] `NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID`: Stripe pricing table ID for production.
- [ ] `UPSTASH_REDIS_REST_URL`: (Optional) For scalable rate limiting.
- [ ] `UPSTASH_REDIS_REST_TOKEN`: (Optional) For scalable rate limiting.

## 2. Smart Contract Verification
- [ ] Contract deployed to Base Mainnet.
- [ ] Contract verified on Basescan.
- [ ] `scaffold.config.ts` points to `base` (not `baseSepolia`).
- [ ] Owner of the UUPS proxy set to a secure Multi-sig (Gnosis Safe).

## 3. Security Hardening
- [ ] Rate limiting verified on `/api/arweave-upload` and `/api/ipfs-upload`.
- [ ] Session authentication confirmed for all upload routes.
- [ ] Row Level Security (RLS) enabled on all Supabase tables (`proofs`, `evidence`, `profiles`, etc.).
- [ ] CORS policies configured to allow only production domains.

## 4. Observability
- [ ] `/api/health` returning `healthy` in production.
- [ ] Log drains (Vercel/Axiom) configured to monitor for `level: 'error'`.

## 5. Domain & SSL
- [ ] Production custom domain connected.
- [ ] SSL certificates active.
- [ ] `/verify` public page loads correctly.
