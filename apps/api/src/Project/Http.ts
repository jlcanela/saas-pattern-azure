import { HttpApiBuilder, KeyValueStore } from "@effect/platform";
import { Effect, Layer } from "effect";

import { Project as P, Project } from "../Project.js";
import { Api } from "../Api.js";
//import { Project } from "common";

export const HttpProjectLive = HttpApiBuilder.group(Api, "projects", (handlers) => 
    Effect.gen(function*() {
        const project = yield* P 
        return handlers
          .handle("create", (req) => project.createProject(req.payload))
          .handle("findById", ({ path: { id } }) => project.findById(id))
          .handle("update", (req) => project.update(req.payload))
          .handle("findProjectHistoryById", ({ path: { id } }) => project.findProjectHistoryById(id))
          .handle("list", () => project.listProject())
        })).pipe(
            Layer.provide([Project.Default, KeyValueStore.layerMemory])
        ) 
