FROM node:20-alpine

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./
COPY tsup.config.ts ./

COPY apps/shopify-app/package.json apps/shopify-app/
COPY packages/database/package.json packages/database/
COPY packages/services/package.json packages/services/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/shopify-app apps/shopify-app

COPY packages/database packages/database
RUN pnpm --filter @internal/database build

COPY packages/services packages/services
RUN pnpm --filter @internal/services build

RUN pnpm --filter shopify-app build

EXPOSE 3000

CMD ["pnpm", "--filter", "shopify-app", "start"]