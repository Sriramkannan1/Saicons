import type { Config, Context } from "@netlify/functions";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("../../dist/server/server.js").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

export default async (request: Request, context: Context) => {
  const handler = await getServerEntry();
  return handler.fetch(request, {}, context);
};

export const config: Config = {
  path: "/*",
  preferStatic: true,
};
