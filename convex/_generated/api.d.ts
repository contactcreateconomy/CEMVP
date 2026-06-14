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
import type * as crons from "../crons.js";
import type * as forum_constants from "../forum/constants.js";
import type * as forum_discussionRoute from "../forum/discussionRoute.js";
import type * as forum_discussionRouteHelpers from "../forum/discussionRouteHelpers.js";
import type * as forum_feedCache from "../forum/feedCache.js";
import type * as forum_feedQueries from "../forum/feedQueries.js";
import type * as forum_helpers from "../forum/helpers.js";
import type * as forum_jobs from "../forum/jobs.js";
import type * as forum_limits from "../forum/limits.js";
import type * as forum_mutations from "../forum/mutations.js";
import type * as forum_personas_auth from "../forum/personas/auth.js";
import type * as forum_personas_configHelpers from "../forum/personas/configHelpers.js";
import type * as forum_personas_draftMutations from "../forum/personas/draftMutations.js";
import type * as forum_personas_generateAction from "../forum/personas/generateAction.js";
import type * as forum_personas_generateContext from "../forum/personas/generateContext.js";
import type * as forum_personas_mutations from "../forum/personas/mutations.js";
import type * as forum_personas_publishHelpers from "../forum/personas/publishHelpers.js";
import type * as forum_personas_publishInternal from "../forum/personas/publishInternal.js";
import type * as forum_personas_queries from "../forum/personas/queries.js";
import type * as forum_personas_scheduler from "../forum/personas/scheduler.js";
import type * as forum_personas_seed from "../forum/personas/seed.js";
import type * as forum_personas_seedData from "../forum/personas/seedData.js";
import type * as forum_personas_validators from "../forum/personas/validators.js";
import type * as forum_queries from "../forum/queries.js";
import type * as forum_rateLimit from "../forum/rateLimit.js";
import type * as forum_seed from "../forum/seed.js";
import type * as forum_seed_catalog from "../forum/seed/catalog.js";
import type * as forum_seed_discussionThreads from "../forum/seed/discussionThreads.js";
import type * as forum_seed_ensureCategoryRows from "../forum/seed/ensureCategoryRows.js";
import type * as forum_seed_generatePosts from "../forum/seed/generatePosts.js";
import type * as forum_validators from "../forum/validators.js";
import type * as http from "../http.js";
import type * as profile from "../profile.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  "forum/constants": typeof forum_constants;
  "forum/discussionRoute": typeof forum_discussionRoute;
  "forum/discussionRouteHelpers": typeof forum_discussionRouteHelpers;
  "forum/feedCache": typeof forum_feedCache;
  "forum/feedQueries": typeof forum_feedQueries;
  "forum/helpers": typeof forum_helpers;
  "forum/jobs": typeof forum_jobs;
  "forum/limits": typeof forum_limits;
  "forum/mutations": typeof forum_mutations;
  "forum/personas/auth": typeof forum_personas_auth;
  "forum/personas/configHelpers": typeof forum_personas_configHelpers;
  "forum/personas/draftMutations": typeof forum_personas_draftMutations;
  "forum/personas/generateAction": typeof forum_personas_generateAction;
  "forum/personas/generateContext": typeof forum_personas_generateContext;
  "forum/personas/mutations": typeof forum_personas_mutations;
  "forum/personas/publishHelpers": typeof forum_personas_publishHelpers;
  "forum/personas/publishInternal": typeof forum_personas_publishInternal;
  "forum/personas/queries": typeof forum_personas_queries;
  "forum/personas/scheduler": typeof forum_personas_scheduler;
  "forum/personas/seed": typeof forum_personas_seed;
  "forum/personas/seedData": typeof forum_personas_seedData;
  "forum/personas/validators": typeof forum_personas_validators;
  "forum/queries": typeof forum_queries;
  "forum/rateLimit": typeof forum_rateLimit;
  "forum/seed": typeof forum_seed;
  "forum/seed/catalog": typeof forum_seed_catalog;
  "forum/seed/discussionThreads": typeof forum_seed_discussionThreads;
  "forum/seed/ensureCategoryRows": typeof forum_seed_ensureCategoryRows;
  "forum/seed/generatePosts": typeof forum_seed_generatePosts;
  "forum/validators": typeof forum_validators;
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
