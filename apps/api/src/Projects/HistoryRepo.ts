// HistoryRepo.ts
import { KeyValueStore } from "@effect/platform"
import type { PlatformError } from "@effect/platform/Error"
import type { HaveId, Reason } from "common"
import { History, HistoryId } from "common"
import type { Schema } from "effect"
import { Context, Effect, Layer } from "effect"
import type { ParseError } from "effect/ParseResult"
import { diff } from "json-diff-ts"
import { BaseRepo } from "../lib/BaseRepo.js"

export class HistoryRepo extends Context.Tag("HistorysRepo")<
  HistoryRepo,
  {
    create: (
      r: Schema.Schema.Type<typeof Reason>,
      old: HaveId,
      updated: HaveId
    ) => Effect.Effect<History, PlatformError | ParseError>
    findById: (id: string) => Effect.Effect<History | null, PlatformError | ParseError>
  }
>() {
  static live = Layer.effect(
    HistoryRepo,
    Effect.gen(function* (_) {
      const store = yield* KeyValueStore.KeyValueStore
      const historyRepo = new BaseRepo("history", store, History)

      const repo = HistoryRepo.of({
        create: (r: Schema.Schema.Type<typeof Reason>, old: HaveId, updated: HaveId) =>
          Effect.gen(function* (_) {
            const diffs = diff(old, updated, { embeddedObjKeys: { characters: "id" } })
            const change = {
              timestamp: new Date(),
              ...r,
              content: JSON.stringify(diffs)
            }
            const existing = yield* historyRepo.findById(updated.id)
            const toSave = {
              id: HistoryId.make(updated.id),
              changes: existing ? [...existing.changes, change] : [change]
            }
            return yield* historyRepo.update(toSave)
          }),
        findById: (id) =>
          Effect.gen(function* (_) {
            const res = yield* historyRepo.findById(id)
            return res
          })
      })

      return repo
    })
  )
}
