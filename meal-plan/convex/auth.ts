import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

// Le credenziali vivono nelle env del deployment Convex:
//   npx convex env set AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
// (con --prod per il deployment di produzione)
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
});
