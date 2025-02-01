import { Arbitrary, Effect, FastCheck, Layer, Option, pipe } from "effect"

import { KeyValueStore } from "@effect/platform"
import { it } from "@effect/vitest"

import { ProjectsRepo } from "./ProjectsRepo.js"

import { ProjectRequest } from "common"
import { HistoryRepo } from "./HistoryRepo.js"

const TestLayer = ProjectsRepo.live
  .pipe(Layer.provide(HistoryRepo.live))
  .pipe(Layer.provide(KeyValueStore.layerMemory))

const createProject = Effect.gen(function*(_) {
  const _repo = yield* ProjectsRepo
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
        id: "2" // Repo is auto creating a project, so id of newly created must be ${entityType}_${size+1}
      })
    }),
    Effect.provide(TestLayer)
  ))

it.effect("should find a project by id", () =>
  Effect.gen(function*(_) {
    const { _2: created } = yield* createProject
    const repo = yield* ProjectsRepo
    const found = yield* repo.findById(created.id)
    return expect(found).toEqual(Option.some(created))
  }).pipe(Effect.provide(TestLayer)))

it.effect("update without change should not create an history", () =>
  Effect.gen(function*(_) {
    const history = yield* Effect.gen(function*(_) {
      const { _2: created } = yield* createProject
      const repo = yield* ProjectsRepo
      yield* repo.update(created)
      return yield* repo.findHistoryById(created.id)
    })
    expect(Option.isNone(history)).toBeTruthy()
  }).pipe(Effect.provide(TestLayer)))

it.live("update with change should create an history", () =>
  Effect.gen(function*(_) {
    const repo = yield* ProjectsRepo
    const updated = yield* Effect.gen(function*(_) {
      const { _2: created } = yield* createProject
      const updated = { ...created, project_name: "Updated Name" }
      return yield* repo.update(updated)
    })
    const history = yield* repo.findHistoryById(updated.id)
    expect(Option.isSome(history)).toBeTruthy()
  }).pipe(Effect.provide(TestLayer)))

// // Test listing projects
// it.effect("should list all projects", () =>
//     Effect.gen(function* (_) {
//         const repo = yield* ProjectsRepo
//         const project1 = yield* repo.create({
//             name: "Project 1",
//             description: "Description 1"
//         })
//         const project2 = yield* repo.create({
//             name: "Project 2",
//             description: "Description 2"
//         })

//         const projects = yield* repo.list()

//         expect(projects).toContainEqual(project1)
//         expect(projects).toContainEqual(project2)
//     }).pipe(Effect.provide(TestLayer))
// )
