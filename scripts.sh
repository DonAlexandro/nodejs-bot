bot-dev-start() {
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
}

bot-dev-build() {
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
}

bot-dev-down() {
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
}

bot-prod-start() {
  if [ ! -f .env ]; then
    read -p "Please enter Telegram bot token: " token
    echo "TOKEN=$token" > .env
  fi

  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
}

bot-prod-build() {
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
}

bot-prod-down() {
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml down -v
}

bot-prod-push() {
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml push bot
}

bot-prod-pull() {
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull
}


