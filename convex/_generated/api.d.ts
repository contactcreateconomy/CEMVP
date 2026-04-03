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
import type * as forum_constants from "../forum/constants.js";
import type * as forum_discussionRoute from "../forum/discussionRoute.js";
import type * as forum_discussionRouteHelpers from "../forum/discussionRouteHelpers.js";
import type * as forum_feedQueries from "../forum/feedQueries.js";
import type * as forum_helpers from "../forum/helpers.js";
import type * as forum_limits from "../forum/limits.js";
import type * as forum_mutations from "../forum/mutations.js";
import type * as forum_queries from "../forum/queries.js";
import type * as forum_rateLimit from "../forum/rateLimit.js";
import type * as forum_seed from "../forum/seed.js";
import type * as forum_seed_catalog from "../forum/seed/catalog.js";
import type * as forum_seed_discussionThreads from "../forum/seed/discussionThreads.js";
import type * as forum_seed_generatePosts from "../forum/seed/generatePosts.js";
import type * as http from "../http.js";
import type * as profile from "../profile.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "forum/constants": typeof forum_constants;
  "forum/discussionRoute": typeof forum_discussionRoute;
  "forum/discussionRouteHelpers": typeof forum_discussionRouteHelpers;
  "forum/feedQueries": typeof forum_feedQueries;
  "forum/helpers": typeof forum_helpers;
  "forum/limits": typeof forum_limits;
  "forum/mutations": typeof forum_mutations;
  "forum/queries": typeof forum_queries;
  "forum/rateLimit": typeof forum_rateLimit;
  "forum/seed": typeof forum_seed;
  "forum/seed/catalog": typeof forum_seed_catalog;
  "forum/seed/discussionThreads": typeof forum_seed_discussionThreads;
  "forum/seed/generatePosts": typeof forum_seed_generatePosts;
  http: typeof http;
  profile: typeof profile;
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
