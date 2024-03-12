# oclweb2
OCL TermBrowser v2, an open-source ReactJS-based web client for terminology management

### Run Dev
1. docker-compose up -d
2. Visit http://localhost:4000

### Run Dev with KeyCloak (SSO)
1. docker-compose -f docker-compose.yml -f docker-compose.sso.yml up -d
2. Visit http://localhost:4000

### Run Production (do check CORS origin policy with API_URL)
1. docker-compose -f docker-compose.yml up -d
2. Visit http://localhost:4000


### Eslint
docker exec -it <container_name> bash -c "eslint src/ --ext=.js*"

### Release

Every build is a candidate for release.

In order to release please trigger the release build step in [our CI](https://ci.openmrs.org/browse/OCL-OW2/latest). Please note
that the maintenance version will be automatically increased after a successful release. It is desired only, if you are releasing the latest build and
should be turned off by setting the increaseMaintenanceRelease variable to false on the Run stage "Release" popup in other cases.

A deployment release will be automatically created and pushed to the staging environment.


#### Major/minor version increase

In order to increase major/minor version you need to set the new version in [package.json](package.json). Alongside you need to login to our CI and update the next release version on a deployment plan [here](https://ci.openmrs.org/deploy/config/configureDeploymentProjectVersioning.action?id=205619202) with the same value.

### Deployment

In order to deploy please trigger the deployment [here](https://ci.openmrs.org/deploy/viewDeploymentProjectEnvironments.action?id=205619202).
Please use an existing deployment release.
