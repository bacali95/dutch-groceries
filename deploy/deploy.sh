#!/bin/sh

if [ ! -f "$APP_DIR/blue" ] && [ ! -f "$APP_DIR/green" ]; then
  touch "$APP_DIR/green"
fi

OLD_DEPLOYMENT=$(if [ -f "$APP_DIR/blue" ]; then echo "blue"; else echo "green"; fi)
OLD_SERVICE_NAME="${OLD_DEPLOYMENT}-app"

NEW_DEPLOYMENT=$(if [ -f "$APP_DIR/blue" ]; then echo "green"; else echo "blue"; fi)
NEW_SERVICE_NAME="${NEW_DEPLOYMENT}-app"

################## FUNCTIONS #####################

wait_for_health_app() {
  CONTAINER_NAME="dutch-groceries-${NEW_SERVICE_NAME}-1"
  TIMEOUT=120

  echo "Wait for container '$CONTAINER_NAME' to be healthy for max $TIMEOUT seconds..."

  for i in $(seq $TIMEOUT); do
    STATUS=$(docker inspect -f '{{ .State.Health.Status }}' "$CONTAINER_NAME")
    echo "Attempt $i: $STATUS"

    if [ "$STATUS" = "healthy" ]; then
      echo "Container is healthy after ${i} seconds."
      return 0
    fi

    sleep 1s
  done

  return 1
}

#################################################

echo "Deploying version $APP_VERSION of $NEW_SERVICE_NAME website..."

mkdir -p "$APP_DIR/versions"
envsubst < deploy/docker-compose.yaml > "$APP_DIR/versions/docker-compose.$APP_VERSION.yaml"

cd "$APP_DIR" || exit 1

OLD_COMPOSE_FILE=$(readlink -f docker-compose.yaml)

ln -sf "versions/docker-compose.$APP_VERSION.yaml" docker-compose.yaml

echo "Pulling new images..."
docker compose pull

echo "Updating services..."
docker compose up -d "$NEW_SERVICE_NAME"

wait_for_health_app

EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo "Deployment succeeded, switching traffic to the new app ($NEW_SERVICE_NAME)..."

  mv "$APP_DIR/$OLD_DEPLOYMENT" "$APP_DIR/$NEW_DEPLOYMENT"

  echo "y" | docker compose rm --stop "$OLD_SERVICE_NAME"
else
  echo "Deployment failed, rolling back to the previous version ($OLD_COMPOSE_FILE)..."

  ln -sf "$OLD_COMPOSE_FILE" docker-compose.yaml

  echo "y" | docker compose rm --stop "$NEW_SERVICE_NAME"
fi

exit $EXIT_CODE
