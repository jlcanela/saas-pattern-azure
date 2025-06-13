[![Docker Build and Push](https://github.com/jlcanela/saas-pattern-azure/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/jlcanela/saas-pattern-azure/actions/workflows/docker-publish.yml)

# Usage

## Install

```bash
pnpm install
```

## Local run

Run locally [frontend](http://localhost:5173/) with vite and
[api](http://localhost:8000/) with deno:

```
pnpm run dev
```

## Docker run

```
pnpm turbo run build
docker build -f infra/docker/Dockerfile -t saas-pattern-azure .
docker run -p 8000:8000 saas-pattern-azure
```

```
buildah bud -f infra/docker/Dockerfile -t saas-pattern-azure .
# if using remote podman:
rm saas-pattern-azure.tar
buildah push saas-pattern-azure docker-archive:saas-pattern-azure.tar
podman load -i saas-pattern-azure.tar 
podman pod create --name azurepod -p 8000:8000 -p 1234:1234
podman run --pod azurepod --env AZURE_COSMOS_EMULATOR_IP_ADDRESS_OVERRIDE=127.0.0.1 -d --name cosmosdb-emulator mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:vnext-preview
podman run --pod azurepod -d \
  -e COSMOS_ENDPOINT="http://localhost:8081" \
  -e COSMOS_KEY="C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==" \
  localhost/saas-pattern-azure
```

```
podman pod stop azurepod
podman pod rm azurepod
```

## Run with .Net Aspire

To run the Aspire config: 
```
cd AspireApp.AppHost
dotnet run
```

## Perf test

```
sudo snap install plow
plow http://localhost:8000/
```

Open [http://localhost:18888/](http://localhost:18888/) for Plow graphs

## Deploy to Azure

Set **AZURE_CREDENTIALS** with the result of the following command:

```bash
az ad sp create-for-rbac --name "saas-pattern-azure-role" --role contributor \
    --scopes /subscriptions//<subscription-id>/resourceGroups/SaasPatternAzure-rg --sdk-aut
```

It should be like the following:

```json
{
    "clientId": "<client-id>",
    "clientSecret": "<client-secret>",
    "subscriptionId": "<subscription-id>",
    "tenantId": "<tenant-id>"
    [...]
}
```

Set **READ_PACKAGE_PAT** with a "New Token (classic)" with scope 'read:packages'

Run the deploy-azure workflow or run the following command:

```
az deployment group create \
         --resource-group SaasPatternAzure-rg \
         --name deploy-dev \
         --template-file infra/bicep/deployment.bicep \
         --parameters \
             hashSecret=${{ secrets.HASH_SECRET }} \
             jwtSecret=${{ secrets.JWT_SECRET }} \
             databaseUrl=${{ secrets.DATABASE_URL }} \
             registryPassword=${{ secrets.READ_PACKAGE_PAT }} \
             imageUrl='ghcr.io/${{ github.repository }}:latest' \
         --no-wait
```

## Undeploy from Azure

Run locally

```
az deployment group create \
    --mode Complete \
    --resource-group SaasPatternAzure-rg \
    --template-file infra/bicep/delete.bicep \
    --no-wait
```

The file '.github/workflows/undeploy-azure.yml' is provided but would require
either admin or owner rights.





# Cosmosdb emulation

Using Aspire CosmosDb is provided automatically
```
cd AspireApp.AppHost
dotnet run
``` 

Another option is to start it from the api project:
```
pnpm --filter api run infra
```

The explorer is available at: http://localhost:1234/

# Trace

https://effect.website/docs/observability/tracing/

Using grafana dashboard:
```
podman run -p 3000:3000 -p 4317:4317 -p 4318:4318 --rm -it docker.io/grafana/otel-lgtm
```

Using aspire dashboard with the provided env template apps/api/env-template:
```
cp apps/api/env-template apps/api/.env

podman run --rm -it -d \
    -p 18888:18888 \
    -p 18890:18890 \
    -p 4317:18889 \
    --name aspire-dashboard \
    mcr.microsoft.com/dotnet/aspire-dashboard:9.3

pnpm run dev
```

in any issue with Aspire OLTP, please use the following:
```
dotnet dev-certs https --export-path ./aspire-dev-cert.crt --format PEM
sudo cp ./aspire-dev-cert.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

it seems that the following command is not registering the certificate properly on linux:
```
dotnet dev-certs https --trust
```

## License

The source code is under MIT License.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.