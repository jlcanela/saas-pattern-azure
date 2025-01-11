param location string
param appName string
param environmentId string
@secure()
param hashSecret string
@secure()
param jwtSecret string
param databaseUrl string
param registryUsername string
@secure()
param registryPassword string
param imageUrl string

resource containerApp 'Microsoft.App/containerApps@2022-03-01' = {
  name: appName
  location: location
  properties: {
    managedEnvironmentId: environmentId
    configuration: {
      ingress: {
        external: true
        targetPort: 8000
      }
      registries: [
        {
          server: 'ghcr.io'
          username: registryUsername
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: registryPassword
        }
      ]
    }
    template: {
      containers: [
        {
          name: appName
          image: imageUrl
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'HASH_SECRET'
              value: hashSecret
            }
            {
              name: 'JWT_SECRET'
              value: jwtSecret
            }
            {
              name: 'DATABASE_URL'
              value: databaseUrl
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
      }
    }
  }
}
