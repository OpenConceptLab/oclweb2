# oclweb2
Overhauled OCL Web Authoring Interface v2

### Run Dev
1. docker-compose up -d
2. Visit http://localhost:4000

### Run Production
1. docker-compose run -p 4000:4000 -e NODE_ENV=production -e API_URL="http://127.0.0.1:8000" web bash ./start-prod.sh   # do check CORS origin policy with API_URL 
2. Visit http://localhost:4000


### Eslint
docker exec -it <container_name> bash -c "eslint src/ --ext=.js*"
