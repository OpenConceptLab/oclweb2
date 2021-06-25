# oclweb2
Overhauled OCL Web Authoring Interface v2

### Run Dev
1. docker-compose up -d
2. Visit http://localhost:4000

### Run Production (do check CORS origin policy with API_URL)
1. docker-compose -f docker-compose.yml up -d
2. Visit http://localhost:4000


### Eslint
docker exec -it <container_name> bash -c "eslint src/ --ext=.js*"

### Release

Every build is a candidate for release.

In order to release please trigger the release build step in [our CI](https://ci.openmrs.org/browse/OCL-OW2/latest)

You also need to create a deployment release [here](https://ci.openmrs.org/deploy/createDeploymentVersion.action?deploymentProjectId=205619202).
Please set the release version to match the version defined in package.json.

Do remember to increase maintenance release version in package.json after a successful release (if releasing the latest build).

### Deployment

In order to deploy please trigger the deployment [here](https://ci.openmrs.org/deploy/viewDeploymentProjectEnvironments.action?id=205619202).
Please use an existing deployment release.
