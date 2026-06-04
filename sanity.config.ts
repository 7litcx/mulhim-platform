import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { sanityConfig } from "./src/sanity/config";

export default defineConfig({
  name: "mulhim-studio",
  title: "Mulhim CMS Studio (منصة ملهم)",

  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,

  basePath: "/studio",

  plugins: [
    structureTool(),
    visionTool({
      defaultApiVersion: sanityConfig.apiVersion,
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
