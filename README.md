# oclweb2

[![DPG Badge](https://img.shields.io/badge/Verified-DPG-3333AB?logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMzEiIGhlaWdodD0iMzMiIHZpZXdCb3g9IjAgMCAzMSAzMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0LjIwMDggMjEuMzY3OEwxMC4xNzM2IDE4LjAxMjRMMTEuNTIxOSAxNi40MDAzTDEzLjk5MjggMTguNDU5TDE5LjYyNjkgMTIuMjExMUwyMS4xOTA5IDEzLjYxNkwxNC4yMDA4IDIxLjM2NzhaTTI0LjYyNDEgOS4zNTEyN0wyNC44MDcxIDMuMDcyOTdMMTguODgxIDUuMTg2NjJMMTUuMzMxNCAtMi4zMzA4MmUtMDVMMTEuNzgyMSA1LjE4NjYyTDUuODU2MDEgMy4wNzI5N0w2LjAzOTA2IDkuMzUxMjdMMCAxMS4xMTc3TDMuODQ1MjEgMTYuMDg5NUwwIDIxLjA2MTJMNi4wMzkwNiAyMi44Mjc3TDUuODU2MDEgMjkuMTA2TDExLjc4MjEgMjYuOTkyM0wxNS4zMzE0IDMyLjE3OUwxOC44ODEgMjYuOTkyM0wyNC44MDcxIDI5LjEwNkwyNC42MjQxIDIyLjgyNzdMMzAuNjYzMSAyMS4wNjEyTDI2LjgxNzYgMTYuMDg5NUwzMC42NjMxIDExLjExNzdMMjQuNjI0MSA5LjM1MTI3WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==)](https://digitalpublicgoods.net/r/open-concept-lab)
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

## License

This repository is part of the [OCL Digital Public Good](https://github.com/OpenConceptLab/.github/blob/main/DIGITAL-PUBLIC-GOOD.md). It is licensed under the [Mozilla Public License 2.0](LICENSE.md) with the [OCL Healthcare Disclaimer](HEALTHCARE-DISCLAIMER.md).
