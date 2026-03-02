import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { graphql } from "ponder";

const app = new Hono();

// Enable GraphQL API — Ponder generates the schema from ponder.schema.ts.
// Next.js app fetches proofs via POST to /graphql when NEXT_PUBLIC_INDEXER_URL is set.
app.use("/graphql", graphql({ db, schema }));

export default app;
