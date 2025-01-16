# CosmosDB Emulator

[CosmosDB Emulator](https://learn.microsoft.com/en-us/azure/cosmos-db/how-to-develop-emulator?pivots=api-nosql&tabs=windows%2Ccsharp)

```
docker run \
    --publish 8081:8081 \
    --publish 10250-10255:10250-10255 \
    --name linux-emulator \
    --detach \
    mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:latest
```

```
using CosmosClient client = new(
    accountEndpoint: "https://localhost:8081/",
    authKeyOrResourceToken: "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=="
);
```

## CosmosDB Patterns

https://github.com/Azure-Samples/cosmos-db-design-patterns

https://learn.microsoft.com/en-us/azure/cosmos-db/social-media-apps
https://learn.microsoft.com/en-us/shows/azure-cosmos-db-conf-2024/best-practices-for-building-multi-tenant-applications-on-azure-cosmos-db
https://azurecosmosdb.github.io/labs/dotnet/labs/08-change_feed_with_azure_functions.html
