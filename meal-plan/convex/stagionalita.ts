import { v } from "convex/values";
import { query } from "./_generated/server";
import { MESI } from "./lib";
import { verdureStagionali } from "./seedData/verdureStagionali";

/** Verdure di stagione per un mese (default: tutti i mesi). */
export const perMese = query({
  args: { mese: v.optional(v.string()) },
  handler: (_ctx, args) => {
    if (args.mese === undefined) {
      return MESI.map((mese) => ({ mese, verdure: verdureStagionali[mese] ?? [] }));
    }
    const mese = args.mese.toLowerCase();
    return [{ mese, verdure: verdureStagionali[mese] ?? [] }];
  },
});
