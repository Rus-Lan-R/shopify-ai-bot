#!/usr/bin/env sh

set -e

role=${CONTAINER_ROLE:-app}
env=${APP_ENV:-production}

echo "build"
npm run build

echo "run service"
npm run docker:start
