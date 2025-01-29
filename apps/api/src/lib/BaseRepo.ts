// BaseRepo.ts
import { Effect, Schema } from "effect"
import { KeyValueStore } from "@effect/platform"

export interface BaseEntity {
    id: string
}

type EntityType<S> = Schema.Schema.Type<S>

export class BaseRepo<S extends Schema.Schema<any, any>> {
    protected readonly prefix: string;
    protected readonly schemaStore: KeyValueStore.SchemaStore<EntityType<S>, never>

    constructor(
        prefix: string,
        protected readonly store: KeyValueStore.KeyValueStore,
        protected readonly schema: S
    ) {
        this.prefix = prefix
        this.schemaStore = store.forSchema(this.schema)
    }

    key = (id: string) => `${this.prefix}_${id}`

    size = () => this.schemaStore.size

    newKey = () => {
        const self = this
        return Effect.gen(function* (_) {
            const sz = yield* self.schemaStore.size
            const id = (sz + 1).toString()
            return self.key(id)
        })
    }

    create = (entity: Omit<EntityType<S>, "id">) => {
        const self = this // Capture this context
        return Effect.gen(function* (_) {
            const key = yield* self.newKey()
            const newEntity = { ...entity, id: key } as EntityType<S>
            yield* self.schemaStore.set(key, newEntity)
            return newEntity
        })
    }

    findById = (id: string) => {
        const self = this
        return Effect.gen(function* (_) {
            const result = yield* self.schemaStore.get(self.key(id))
            return result._tag === "Some" ? result.value : null
        })
    }

    update = (entity: EntityType<S>) => {
        const self = this
        return Effect.gen(function* (_) {
            yield* self.schemaStore.set(self.key(entity.id), entity)
            return entity
        })
    }

    list = () => {
        const self = this
        return Effect.gen(function* (_) {
            const size = yield* self.size()
            const entities: EntityType<S>[] = []

            for (let i = 0; i < size; i++) {
                const result = yield* self.schemaStore.get(self.key(`${i + 1}`))
                if (result._tag === "Some") {
                    entities.push(result.value)
                }
            }
            return entities
        })
    }
}
