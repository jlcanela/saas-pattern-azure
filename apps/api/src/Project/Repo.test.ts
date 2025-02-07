import { Arbitrary, Effect, FastCheck, Layer, Option, pipe } from "effect"

import { KeyValueStore } from "@effect/platform"
import { it } from "@effect/vitest"

import { ProjectRepo } from "./Repo.js"

import type { ProjectResponse } from "common"
import { ProjectRequest } from "common"
import { HistoryRepo } from "../History/Repo.js"

const TestLayer = ProjectRepo.live
  .pipe(Layer.provide(HistoryRepo.live))
  .pipe(Layer.provide(Layer.fresh(KeyValueStore.layerMemory)))

const createProject = Effect.gen(function*(_) {
  const _repo = yield* ProjectRepo
  const arb = Arbitrary.make(ProjectRequest)
  const project = FastCheck.sample(arb, 1)[0]
  return { _1: project, _2: yield* _repo.create(project) }
})

it.effect("should create a project", () =>
  pipe(
    Effect.gen(function*(_) {
      const { _1: project, _2: created } = yield* createProject
      return expect(created).toMatchObject({
        ...project,
        id: "1"
      })
    }),
    Effect.provide(TestLayer)
  ))

it.effect("should find a project by id", () =>
  Effect.gen(function*(_) {
    const { _2: created } = yield* createProject
    const repo = yield* ProjectRepo
    const found = yield* repo.findById(created.id)
    return expect(found).toEqual(Option.some(created))
  }).pipe(Effect.provide(TestLayer)))

it.effect("update without change should not create an history", () =>
  Effect.gen(function*(_) {
    const history = yield* Effect.gen(function*(_) {
      const { _2: created } = yield* createProject
      const repo = yield* ProjectRepo
      yield* repo.update(created)
      return yield* repo.findHistoryById(created.id)
    })
    expect(Option.isNone(history)).toBeTruthy()
  }).pipe(Effect.provide(TestLayer)))

it.effect("update with change should create an history", () =>
  Effect.gen(function*(_) {
    const repo = yield* ProjectRepo
    const updated = yield* Effect.gen(function*(_) {
      const { _2: created } = yield* createProject
      const updated = { ...created, project_name: "Updated Name" }
      return yield* repo.update(updated)
    })
    const history = yield* repo.findHistoryById(updated.id)
    expect(Option.isSome(history)).toBeTruthy()
  }).pipe(Effect.provide(TestLayer)))

// Test listing projects
it.live("should list all projects", () =>
    Effect.gen(function* (_) {
        const repo = yield* ProjectRepo
        const arb = Arbitrary.make(ProjectRequest)
        const projects = FastCheck.sample(arb, 2)

        const allCreated = new Array<ProjectResponse>()
        for (const idx in Object.keys(projects)) {
          const created = yield* repo.create(projects[idx])
          allCreated.push(created)
        }

        const list = yield* repo.list()

        expect(allCreated).toStrictEqual(list)
    }).pipe(Effect.provide(TestLayer))
)
