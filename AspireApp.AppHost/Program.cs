var builder = DistributedApplication.CreateBuilder(args);

#pragma warning disable ASPIRECOSMOSDB001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
var cosmos = builder.AddAzureCosmosDB("cosmos")
    .RunAsPreviewEmulator(emulator =>
    {
        emulator
        .WithHttpEndpoint(targetPort: 1234, name: "explorer-port", isProxied: true);
        // .WithLifetime(ContainerLifetime.Persistent);
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
