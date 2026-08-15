import type { Config, Context } from "@netlify/functions";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

// `included_files` are unpacked at the deployment root (LAMBDA_TASK_ROOT), not
// relative to this function's source location, so the bundled dist/server
// output must be addressed from there rather than via a relative import.
async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    const taskRoot = process.env.LAMBDA_TASK_ROOT ?? process.cwd();
    const entryPath = join(taskRoot, "dist/server/server.js");
    serverEntryPromise = import(pathToFileURL(entryPath).href).then(
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
