# ARG DEPENDENCIES_TAG

# FROM ghcr.io/technocode-tunisie/web-projects-dependencies:$DEPENDENCIES_TAG
FROM deps:latest

ARG PROJECT

WORKDIR /usr/src/app

RUN ls -al

COPY --chown=node:node ./build ./build
COPY --chown=node:node ./prisma ./prisma
COPY --chown=node:node ./docker/start.sh ./start.sh

ENV ENVIRONMENT=production

EXPOSE 3000

USER node

ENTRYPOINT ["/usr/src/app/start.sh"]

HEALTHCHECK --interval=10s --timeout=5s --retries=10 CMD curl -f http://localhost:3000/status || exit 1
