import { Schema } from "effect"

export const HistoryId = Schema.String.pipe(Schema.brand("HistoryId"))

export const Reason = Schema.Struct({
    userId: Schema.String,
    reason: Schema.String,
})
export type Reason = Schema.Schema.Type<typeof Reason>

export const Change = Schema.Struct({
    timestamp: Schema.Date,
    ...Reason.fields,
    content: Schema.String,
})
export type Change = Schema.Schema.Type<typeof Change>

export const History = Schema.Struct({
    id: HistoryId,
    changes: Schema.Array(Change),
})
export type History = Schema.Schema.Type<typeof History>

export interface HaveId {
    readonly id: string
}
