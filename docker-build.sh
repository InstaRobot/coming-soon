#!/bin/bash

# Скрипт для сборки и запуска Docker контейнеров

echo "🐳 Docker build script for Coming Soon"

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

# Проверяем наличие docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
    exit 1
fi

# Функция для показа помощи
show_help() {
    echo "Использование: $0 [команда]"
    echo ""
    echo "Команды:"
    echo "  build     - Собрать production образ"
    echo "  build-dev - Собрать development образ"
    echo "  up        - Запустить production контейнеры"
    echo "  up-dev    - Запустить development контейнеры"
    echo "  down      - Остановить все контейнеры"
    echo "  logs      - Показать логи"
    echo "  shell     - Открыть shell в контейнере"
    echo "  help      - Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0 build && $0 up"
    echo "  $0 up-dev"
}

# Функция для сборки production образа
build_production() {
    echo "🔨 Сборка production образа..."
    docker build -t coming-soon:latest .
    echo "✅ Production образ собран!"
}

# Функция для сборки development образа
build_dev() {
    echo "🔨 Сборка development образа..."
    docker build -f Dockerfile.dev -t coming-soon:dev .
    echo "✅ Development образ собран!"
}

# Функция для запуска production контейнеров
run_production() {
    echo "🚀 Запуск production контейнеров..."
    docker-compose up -d
    echo "✅ Production контейнеры запущены!"
    echo "🌐 Приложение доступно по адресу: http://localhost:3000"
}

# Функция для запуска development контейнеров
run_dev() {
    echo "🚀 Запуск development контейнеров..."
    docker-compose -f docker-compose.dev.yml up -d
    echo "✅ Development контейнеры запущены!"
    echo "🌐 Приложение доступно по адресу: http://localhost:3000"
}

# Функция для остановки контейнеров
stop_containers() {
    echo "🛑 Остановка контейнеров..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    echo "✅ Контейнеры остановлены!"
}

# Функция для показа логов
show_logs() {
    echo "📋 Логи контейнеров:"
    docker-compose logs -f
}

# Функция для открытия shell в контейнере
open_shell() {
    echo "🐚 Открытие shell в контейнере..."
    docker exec -it coming-soon-app /bin/sh
}

# Основная логика
case "${1:-help}" in
    "build")
        build_production
        ;;
    "build-dev")
        build_dev
        ;;
    "up")
        build_production
        run_production
        ;;
    "up-dev")
        build_dev
        run_dev
        ;;
    "down")
        stop_containers
        ;;
    "logs")
        show_logs
        ;;
    "shell")
        open_shell
        ;;
    "help"|*)
        show_help
        ;;
esac
