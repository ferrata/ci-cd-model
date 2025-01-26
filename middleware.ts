import { clerkMiddleware } from "@clerk/nextjs/server";
import { isAuthProviderEnabled } from "utils/is-auth-provider-enabled";

const isAuthEnabled = isAuthProviderEnabled()

const middleware = isAuthEnabled ? clerkMiddleware() : function () { };

export default middleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
