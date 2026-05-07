import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "learn ai elite" },
      { name: "description", content: "Neural Galaxy Learn is a predictive learning ecosystem that visualizes knowledge connections and forecasts mastery." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "learn ai elite" },
      { property: "og:description", content: "Neural Galaxy Learn is a predictive learning ecosystem that visualizes knowledge connections and forecasts mastery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "learn ai elite" },
      { name: "twitter:description", content: "Neural Galaxy Learn is a predictive learning ecosystem that visualizes knowledge connections and forecasts mastery." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d6a45308-e1d6-44de-a6e4-699c2ef6b68f/id-preview-80607309--12f3ea94-ecb0-41ff-9eac-2efa8b20cc73.lovable.app-1778176084068.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d6a45308-e1d6-44de-a6e4-699c2ef6b68f/id-preview-80607309--12f3ea94-ecb0-41ff-9eac-2efa8b20cc73.lovable.app-1778176084068.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
