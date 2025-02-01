// BaseRepo.ts
import type { KeyValueStore } from "@effect/platform"
import { Effect } from "effect"
import type { Schema } from "effect"

export interface BaseEntity {
  id: string
}

type EntityType<S> = Schema.Schema.Type<S>

export class BaseRepo<S extends Schema.Schema<any, any>> {
  readonly prefix: string
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

  newIndex = () => {
    const self = this
    return Effect.gen(function*(_) {
      const sz = yield* self.schemaStore.size
      const id = (sz + 1).toString()
      return id
    })
  }

  create = (entity: Omit<EntityType<S>, "id">) => {
    const self = this // Capture this context
    return Effect.gen(function*(_) {
      const index = yield* self.newIndex()
      const newEntity = { ...entity, id: index } as EntityType<S>
      yield* self.schemaStore.set(self.key(index), newEntity)
      return newEntity
    })
  }

  findById = (id: string) => {
    const self = this
    return this.schemaStore.get(self.key(id))
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
      const entities: Array<EntityType<S>> = []

      for (let i = 0; i < size; i++) {
        const key = self.key(`${i + 1}`)
        const result = yield* self.schemaStore.get(key)
        if (result._tag === "Some") {
          entities.push(result.value)
        } else {
          yield* Effect.log(`Entity with key ${key} not found`)
        }
      }
      return entities
    })
  }
}
