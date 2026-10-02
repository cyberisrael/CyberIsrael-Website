import { buildAdminConfig } from "./admin-config.mjs";
import { buildSitemap } from "./generate-sitemap.mjs";
import { buildAgentsTxt } from "./generate-agents.mjs";

const GENERATED_FILES_CONFIG = {
  "admin/config.yml": { type: "text/yaml", build: buildAdminConfig },
  "sitemap.xml": { type: "application/xml", build: buildSitemap },
  "agents.txt": { type: "text/markdown", build: buildAgentsTxt },
};

/**
 * Every file in GENERATED_FILES_CONFIG is emitted in prouction and rebuilt
 * on each request in development.
 */
export default function generatedFilesPlugin() {
  let root = process.cwd();

  return {
    name: "cyberisrael:generated-files",

    configResolved(config) {
      root = config.root;
    },

    async generateBundle() {
      // The build runs once per environment. Only the client bundle is served, so
      // emitting into the Worker bundle as well would just write files nothing reads.
      if (this.environment && this.environment.name !== "client") return;
      for (const [fileName, { build }] of Object.entries(
        GENERATED_FILES_CONFIG,
      )) {
        this.emitFile({ type: "asset", fileName, source: await build(root) });
      }
    },

    configureServer(server) {
      for (const [fileName, { type, build }] of Object.entries(
        GENERATED_FILES_CONFIG,
      )) {
        server.middlewares.use(
          `/${fileName}`,
          async (_request, response, next) => {
            try {
              const body = await build(root);
              response.setHeader("Content-Type", `${type}; charset=utf-8`);
              response.end(body);
            } catch (error) {
              next(error);
            }
          },
        );
      }
    },
  };
}
