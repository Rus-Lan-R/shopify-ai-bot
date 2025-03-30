docker build -t shopify-app --file ./.docker/Dockerfile .

docker run -p 3000:3000 shopify-app

docker push registry.heroku.com/chat-assistant-app/web

---

docker buildx build --provenance false --platform linux/amd64 -t registry.heroku.com/chat-assistant-app/web

docker tag shopify-app registry.heroku.com/chat-assistant-app/web
docker push registry.heroku.com/chat-assistant-app/web
