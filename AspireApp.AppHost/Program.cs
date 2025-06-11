var builder = DistributedApplication.CreateBuilder(args);

// var cosmos = builder.AddAzureCosmosDB("cosmos-db")
//     .RunAsEmulator(emulator =>
//        // emulator.WithImage(image: "cosmosdb/linux/azure-cosmos-emulator", tag: "vnext-preview") // Use the 'next' tag or your desired version
//         emulator.WithImage(image: "cosmosdb/emulator", tag: "latest") // Use the 'next' tag or your desired version
//     );
#pragma warning disable ASPIRECOSMOSDB001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
var cosmos = builder.AddAzureCosmosDB("cosmos")
    .RunAsPreviewEmulator(emulator =>
    {
        // emulator
        //     //.WithGatewayPort(8081) // Main HTTPS port
        //     .WithDataExplorer(1234) // Data Explorer port
        //     .WithHttpsEndpoint(targetPort: 8081, name: "https", isProxied: false)
        //     .WithArgs(
        //         "--protocol", "https",
        //         "--enable-explorer", "true" // Explicitly enable explorer (optional)
        //     )
        //     .WithHttpHealthCheck(path: "/"); // Health check endpoint
        emulator
        .WithHttpEndpoint(targetPort: 1234, name: "explorer-port", isProxied: true);
        //.WithLifetime(ContainerLifetime.Persistent);
    });
#pragma warning restore ASPIRECOSMOSDB001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

var api = builder.AddPnpmApp(name: "Api",
        workingDirectory: "..",
        scriptName: "apidev"
    )
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints()
    .WithPnpmPackageInstallation()
    .WithReference(cosmos)
    .WaitFor(cosmos); 

var web = builder.AddPnpmApp(name: "Web",
        workingDirectory: "..",
        scriptName: "webdev"
    )
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints()
    .WithPnpmPackageInstallation()
    .WithReference(api)
    .WaitFor(api); 

builder.Build().Run();
