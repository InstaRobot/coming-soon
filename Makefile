.PHONY: help build build-dev up up-dev down logs shell clean

# Переменные
IMAGE_NAME = coming-soon
TAG = latest
DEV_TAG = dev

help: ## Показать справку
	@echo "🐳 Docker команды для Coming Soon"
	@echo ""
	@echo "Доступные команды:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Собрать production образ
	docker build -t $(IMAGE_NAME):$(TAG) .

build-dev: ## Собрать development образ
	docker build -f Dockerfile.dev -t $(IMAGE_NAME):$(DEV_TAG) .

up: build ## Запустить production контейнеры
	docker-compose up -d

up-dev: build-dev ## Запустить development контейнеры
	docker-compose -f docker-compose.dev.yml up -d

down: ## Остановить все контейнеры
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

logs: ## Показать логи
	docker-compose logs -f

shell: ## Открыть shell в контейнере
	docker exec -it $(IMAGE_NAME)-app /bin/sh

clean: ## Очистить образы и контейнеры
	docker-compose down --rmi all --volumes --remove-orphans
	docker-compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans
	docker rmi $(IMAGE_NAME):$(TAG) $(IMAGE_NAME):$(DEV_TAG) 2>/dev/null || true

status: ## Показать статус контейнеров
	docker-compose ps
	docker-compose -f docker-compose.dev.yml ps

restart: down up ## Перезапустить контейнеры

restart-dev: down up-dev ## Перезапустить development контейнеры
