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
