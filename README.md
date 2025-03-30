docker build -t shopify-app --file ./.docker/Dockerfile .

docker run -p 3000:3000 shopify-app
