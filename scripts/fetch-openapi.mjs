/**
 * Refresh the pinned OpenAPI snapshot from a running backend.
 * If the backend is down and a snapshot already exists, generation continues offline.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "openapi", "backend.openapi.json");
const url = process.env.OPENAPI_URL ?? "http://127.0.0.1:8000/openapi.json";

try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const spec = await response.json();
  await mkdir(dirname(out), { recursive: true });
  const ids = [];
  for (const pathItem of Object.values(spec.paths ?? {})) {
    for (const operation of Object.values(pathItem ?? {})) {
      if (operation && typeof operation === "object" && "operationId" in operation) {
        ids.push(String(operation.operationId));
      }
    }
  }
  const autoIds = ids.filter((id) => id.includes("_api_v1_"));
  if (autoIds.length > 0) {
    console.warn(
      "OpenAPI operationIds look auto-generated. Restart the backend so the explicit operation_id values are included.",
    );
  }
  await writeFile(out, `${JSON.stringify(spec, null, 2)}\n`);
  console.log(`Wrote ${out} from ${url}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (existsSync(out)) {
    console.warn(`OpenAPI fetch failed (${message}). Using pinned ${out}`);
    process.exit(0);
  }
  console.error(`OpenAPI fetch failed (${message}) and no pinned spec exists at ${out}`);
  process.exit(1);
}
