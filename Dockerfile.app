FROM node:18-alpine

WORKDIR /app

ARG SHOPIFY_API_KEY
ARG SHOPIFY_API_SECRET
ARG SHOPIFY_APP_URL
ARG SCOPES
ARG DATABASE_URL
ARG OPENAI_API_KEY
ARG APP_PORT

ENV SHOPIFY_API_KEY=${SHOPIFY_API_KEY}
ENV SHOPIFY_API_SECRET=${SHOPIFY_API_SECRET}
ENV SHOPIFY_APP_URL=${SHOPIFY_APP_URL}
ENV SCOPES=${SCOPES}
ENV DATABASE_URL=${DATABASE_URL}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV APP_PORT=${APP_PORT}


COPY pnpm-lock.yaml ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./
COPY tsup.config.ts ./

COPY apps/shopify-app/package.json apps/shopify-app/
COPY packages/types/package.json packages/types/
COPY packages/database/package.json packages/database/
COPY packages/services/package.json packages/services/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/shopify-app apps/shopify-app

COPY packages/types packages/types
RUN pnpm --filter @internal/types build

COPY packages/database packages/database
RUN pnpm --filter @internal/database build

COPY packages/services packages/services
RUN pnpm --filter @internal/services build

RUN pnpm --filter shopify-app build

EXPOSE ${APP_PORT}

CMD ["pnpm", "--filter", "shopify-app", "start"]