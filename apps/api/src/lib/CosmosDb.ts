import "dotenv/config"
import { CosmosClient, type ItemDefinition, PartitionKeyKind } from "@azure/cosmos"
import { Console, Data, Effect, pipe, Schedule } from "effect"
import { timed } from "./timed.ts"

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  error: unknown
}> {
  toString() {
    return `Database read failed: ${this.error}`
  }
}

function connectionParam(name: string): Effect.Effect<{ endpoint: string; key: string }, string>  {
  
  const connectionStringName = `ConnectionStrings__${name}`;
  const connectionString = process.env[connectionStringName]
  const cosmosEndpoint = process.env.COSMOS_ENDPOINT;
  const cosmosKey = process.env.COSMOS_KEY;

  if (connectionString) {
    const parts = connectionString.split(';').filter(Boolean);
    const map: Record<string, string> = {};
    for (const part of parts) {
      const [key, ...rest] = part.split('=');
      map[key] = rest.join('=');
    }
    const endpoint = map['AccountEndpoint'];
    const key = map['AccountKey'];
    if (endpoint && key) {
      return Effect.succeed({ endpoint, key });
    }
  } else if (cosmosEndpoint && cosmosKey) {
    return Effect.succeed({ endpoint: cosmosEndpoint, key: cosmosKey });
  }
  return Effect.fail("INVALID_COSMOSDB_CONFIG");
}

export class Cosmos extends Effect.Service<Cosmos>()("app/CosmosDb", {
  effect: timed(
    "Creating CosmosDb Service",
    Effect.gen(function* () {
      const { endpoint, key } = yield* pipe(
        connectionParam("cosmos"), 
        Effect.tapError((err) => Effect.log(err)),
      )

      const connectionParams = {
        endpoint,
        key,
        connectionPolicy: {
          enableEndpointDiscovery: false,
        }
      }

        yield* Effect.logInfo("Creating Cosmos Client", {
    userId: 123,
    action: "click",
    value: Math.random()
  })
      const client = new CosmosClient(connectionParams)

      function readAllDatabases() {
        return Effect.gen(function* () {
          yield* Effect.log("readAllDatabases")
          const response = yield* Effect.tryPromise({
            try: () => client.databases.readAll().fetchAll(),
            catch: (error) => new DatabaseError({ error })
          })
          return response.resources
        }).pipe(
          Effect.withSpan("readAllDatabases")
        )
      }

      // Add this function to your Cosmos service class
      function initializeProjectDB() {
        return Effect.gen(function* () {
          // Create database if not exists
          const { database } = yield* Effect.tryPromise({
            try: () => client.databases.createIfNotExists({ id: "ProjectDB" }),
            catch: (error) => new DatabaseError({ error })
          }).pipe(Effect.withSpan("createDatabase"))

          yield* Effect.log("init databases").pipe(Effect.withSpan("init"))
          // Create container if not exists
          const { container } = yield* Effect.tryPromise({
            try: () =>
              database.containers.createIfNotExists({
                id: "Project",
                partitionKey: {
                  paths: ["/project_id"],
                  kind: PartitionKeyKind.Hash
                }
              }),
            catch: (error) => new DatabaseError({ error })
          }).pipe(Effect.withSpan("createContainer"))

          return container
        })
      }

      const projectContainer = yield* initializeProjectDB().pipe(Effect.tapError((e) => Console.log(e)))

            /*
        const querySpec = {
    query: "SELECT * FROM Families f WHERE  f.lastName = @lastName",
    parameters: [
      {
        name: "@lastName",
        value: "Andersen",
      },
    ],
  };

  logStep("Query items in container '" + container.id + "'");
  const { resources: results } = await container.items.query(querySpec).fetchAll();

  if (results.length === 0) {
    throw "No items found matching";
  } else if (results.length > 1) {
    throw "More than 1 item found matching";
  }

  const person = results[0];
  console.log("The '" + person.id + "' family has lastName '" + person.lastName + "'");
  console.log("The '" + person.id + "' family has " + person.children.length + " children '");

      */
      function query() {
        const querySpec = {
          query: "SELECT c.id, c.project_name, c.project_objective, c.project_description, c.project_stakeholders FROM c",
          parameters: [
          ],
        };
        return Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () => projectContainer.items.query(querySpec).fetchAll(),
            catch: (error) => new DatabaseError({ error })
          })
          return response.resources
        }).pipe(
          Effect.withSpan("readAllDatabases")
        )
      }

      function readDocument(id: string) {
        return Effect.gen(function* () {
          const item = yield* Effect.tryPromise({
            try: () => projectContainer.item(id, id).read(),
            catch: (error) => new DatabaseError({ error })
          })
          return item
        }).pipe(
          Effect.withSpan("readDocument")
        )
      }

      function writeDocument<T extends ItemDefinition>(t: T) {
        return Effect.gen(function* () {
          const itemResponse = yield* Effect.tryPromise({
            try: () => projectContainer.items.create(t),
            catch: (error) => {
              new DatabaseError({ error })
            }
          })
          return itemResponse
        }).pipe(
          Effect.withSpan("writeDocument")
        )
      }

      // Helpers
      const chunkItems = <T>(items: Array<T>, size: number): Array<Array<T>> =>
        Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size))

      const MAX_BATCH_SIZE = 100 // Cosmos DB's maximum per batch

      function upsertChunk<T extends { id: string }>(chunk: Array<T>) {
        return Effect.tryPromise({
          try: () => {
            const operations = chunk.map((item) => ({
              operationType: "Upsert" as const,
              resourceBody: item
            }))

            return projectContainer.items.bulk(operations, { continueOnError: true })
          },
          catch: (error) => {
            console.error("Bulk upsert failed:", error)
            return new DatabaseError({ error })
          }
        }).pipe(Effect.withSpan("upsertChunk"))
      }

      function bulkUpsertDocuments<T extends { id: string }>(items: Array<T>, concurrency = 25) {
        return Effect.gen(function* () {
          const chunks = chunkItems(items, MAX_BATCH_SIZE)

          const results = yield* Effect.forEach(chunks, upsertChunk, { concurrency })

          return results.flatMap((batchResult) =>
            batchResult.map((item) => item.statusCode === 201 ? "Inserted" : "Updated")
          )
        }).pipe(
          Effect.withSpan("bulkUpsertDocuments")
        )
      }

      function upsertDocument<T>(t: T) {
        return Effect.gen(function* () {
          const itemResponse = yield* Effect.tryPromise({
            try: () => projectContainer.items.upsert(t),
            catch: (error) => {
              new DatabaseError({ error })
            }
          })
          return itemResponse
        }).pipe(
          Effect.withSpan("upsertDocument")
        )
      }

      function concurrentUpserts<T>(documents: Array<T>, concurrency = 100) {
        return pipe(
          Effect.forEach(
            documents,
            (doc) => upsertDocument(doc),
            { concurrency }
          ).pipe(
            Effect.retry(Schedule.exponential(100, 1.2))
          ),
          Effect.withSpan("concurrentUpserts")
        )
      }

      return {
        readAllDatabases,
        readDocument,
        writeDocument,
        upsertDocument,
        concurrentUpserts,
        bulkUpsertDocuments,
        initializeProjectDB,
        query
      } as const
    })
  ),
  dependencies: []
}) { }
