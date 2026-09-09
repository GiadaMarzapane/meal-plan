/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as categorie from "../categorie.js";
import type * as cucina from "../cucina.js";
import type * as frigo from "../frigo.js";
import type * as households from "../households.js";
import type * as http from "../http.js";
import type * as lib from "../lib.js";
import type * as menuAI from "../menuAI.js";
import type * as menuContesto from "../menuContesto.js";
import type * as pianificatore from "../pianificatore.js";
import type * as ricette from "../ricette.js";
import type * as ricetteAI from "../ricetteAI.js";
import type * as seed from "../seed.js";
import type * as seedData_categorieBase from "../seedData/categorieBase.js";
import type * as seedData_dispensaIniziale from "../seedData/dispensaIniziale.js";
import type * as seedData_ricetteEsempio from "../seedData/ricetteEsempio.js";
import type * as seedData_verdureStagionali from "../seedData/verdureStagionali.js";
import type * as spesa from "../spesa.js";
import type * as stagionalita from "../stagionalita.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  categorie: typeof categorie;
  cucina: typeof cucina;
  frigo: typeof frigo;
  households: typeof households;
  http: typeof http;
  lib: typeof lib;
  menuAI: typeof menuAI;
  menuContesto: typeof menuContesto;
  pianificatore: typeof pianificatore;
  ricette: typeof ricette;
  ricetteAI: typeof ricetteAI;
  seed: typeof seed;
  "seedData/categorieBase": typeof seedData_categorieBase;
  "seedData/dispensaIniziale": typeof seedData_dispensaIniziale;
  "seedData/ricetteEsempio": typeof seedData_ricetteEsempio;
  "seedData/verdureStagionali": typeof seedData_verdureStagionali;
  spesa: typeof spesa;
  stagionalita: typeof stagionalita;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
