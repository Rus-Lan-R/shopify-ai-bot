rm -rf node_modules pnpm-lock.yaml

find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
find . -name "pnpm-lock.yaml" -type f -delete