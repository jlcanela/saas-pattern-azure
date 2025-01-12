# Usage

## Install

```bash
deno install --allow-scripts
```

## Local run

Run locally [frontend](http://localhost:5173/) with vite and [api](http://localhost:8000/) with deno: 
```
deno task dev
```

## Docker run

```
deno task build
docker build -f infra/docker/Dockerfile -t saas-pattern-azure .
docker run -p 8000:8000 saas-pattern-azure
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

The file '.github/workflows/undeploy-azure.yml' is provided but would require either admin or owner rights. 
```