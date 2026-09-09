import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

// Provider OAuth. Le credenziali vivono nelle env del deployment Convex:
//   npx convex env set AUTH_GITHUB_ID / AUTH_GITHUB_SECRET
//   npx convex env set AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [GitHub, Google],
});
