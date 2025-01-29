// HistoryRepo.ts
import { Effect, Context, Layer, Schema, Console, pipe } from "effect"
import { KeyValueStore } from "@effect/platform"
import { PlatformError } from "@effect/platform/Error"
import { ParseError } from "effect/ParseResult"
import { BaseRepo } from "../lib/BaseRepo.js"
import { diff } from 'json-diff-ts';
import { HaveId, History, HistoryId, Reason } from "common"


export class HistoryRepo extends Context.Tag("HistorysRepo")<
    HistoryRepo,
    {
        create: (r: Schema.Schema.Type<typeof Reason>, old: HaveId, updated: HaveId) => Effect.Effect<History, PlatformError | ParseError>
        findById: (id: string) => Effect.Effect<History | null, PlatformError | ParseError>
    }
>() {
    static live = Layer.effect(
        HistoryRepo,
        Effect.gen(function* (_) {
            const store = yield* KeyValueStore.KeyValueStore
            const historyRepo = new BaseRepo("history", store, History)

            const repo = HistoryRepo.of({
                create: (r: Schema.Schema.Type<typeof Reason>, old: HaveId, updated: HaveId) => Effect.gen(function* (_) {
                    const diffs = diff(old, updated, { embeddedObjKeys: { characters: 'id' } });
                    const change = {
                        timestamp: new Date(),
                        ...r,
                        content: JSON.stringify(diffs)
                    };
                    const existing = yield* historyRepo.findById(updated.id)
                    const toSave = {
                        id: HistoryId.make(updated.id),
                        changes: existing ? [...existing.changes, change] : [change]
                    }
                    return yield* historyRepo.update(toSave)
                }),
                findById: (id) => Effect.gen(function* (_) {
                    const res = yield* historyRepo.findById(id)
                    return res;
                })
            })

            return repo
        })
    )
}
