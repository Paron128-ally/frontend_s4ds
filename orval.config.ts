import { defineConfig, type OpenApiDocument } from "orval";

const API_PREFIX = "/api/v1";

type JsonSchema = { $ref?: string; properties?: Record<string, unknown> };
type JsonMedia = { schema?: JsonSchema };
type JsonResponse = { content?: Record<string, JsonMedia> };

/**
 * The frontend base URL already includes `/api/v1`, and the mutator unwraps
 * `APIResponse` / `PaginatedResponse`. Rewrite the spec so generated functions
 * take relative paths and return the inner payload.
 */
function prepareSpec(spec: OpenApiDocument): OpenApiDocument {
  const schemas = (spec.components?.schemas ?? {}) as Record<string, JsonSchema>;
  const nextPaths: NonNullable<OpenApiDocument["paths"]> = {};

  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    if (!pathItem) continue;
    const nextPath = path.startsWith(API_PREFIX) ? path.slice(API_PREFIX.length) || "/" : path;
    for (const operation of Object.values(pathItem)) {
      if (!operation || typeof operation !== "object" || !("responses" in operation)) continue;
      const responses = (operation as { responses?: Record<string, JsonResponse> }).responses ?? {};
      for (const response of Object.values(responses)) {
        const content = response?.content?.["application/json"];
        const ref = content?.schema?.$ref;
        if (!content?.schema || !ref) continue;
        const name = ref.split("/").pop() ?? "";
        const definition = schemas[name];
        const data = definition?.properties?.data;
        if (!data) continue;
        if (name.startsWith("PaginatedResponse_")) {
          content.schema = {
            type: "object",
            required: ["data", "total", "page", "limit"],
            properties: {
              data,
              total: definition.properties?.total,
              page: definition.properties?.page,
              limit: definition.properties?.limit,
            },
          } as JsonSchema;
        } else if (name.startsWith("APIResponse_")) {
          content.schema = data as JsonSchema;
        }
      }
    }
    nextPaths[nextPath] = pathItem;
  }

  spec.paths = nextPaths;
  return spec;
}

export default defineConfig({
  backend: {
    input: {
      target: "./openapi/backend.openapi.json",
      override: {
        transformer: prepareSpec,
      },
    },
    output: {
      mode: "single",
      target: "./src/api/generated/endpoints.ts",
      schemas: "./src/api/generated/model",
      client: "fetch",
      clean: true,
      override: {
        mutator: {
          path: "./src/api/orval-mutator.ts",
          name: "orvalMutator",
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
});
