# 🐳 Docker для Coming Soon

Этот документ содержит подробные инструкции по использованию Docker для проекта "Coming Soon".

## 📋 Требования

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM (минимум)
- 2GB свободного места на диске

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd coming-soon
```

### 2. Запуск с Docker
```bash
# Простой запуск
docker-compose up -d

# Или с помощью Makefile
make up

# Или с помощью скрипта
./docker-build.sh up
```

### 3. Проверка работы
```bash
# Проверить статус
docker-compose ps

# Посмотреть логи
docker-compose logs -f

# Открыть в браузере
open http://localhost:3000
```

## 🔧 Команды

### Makefile команды
```bash
make help        # Показать справку
make build       # Собрать production образ
make build-dev   # Собрать development образ
make up          # Запустить production контейнеры
make up-dev      # Запустить development контейнеры
make down        # Остановить все контейнеры
make logs        # Показать логи
make shell       # Открыть shell в контейнере
make clean       # Очистить образы и контейнеры
make status      # Показать статус контейнеров
make restart     # Перезапустить production контейнеры
make restart-dev # Перезапустить development контейнеры
```

### Скрипт команды
```bash
./docker-build.sh build     # Собрать production образ
./docker-build.sh build-dev # Собрать development образ
./docker-build.sh up        # Запустить production контейнеры
./docker-build.sh up-dev    # Запустить development контейнеры
./docker-build.sh down      # Остановить все контейнеры
./docker-build.sh logs      # Показать логи
./docker-build.sh shell     # Открыть shell в контейнере
./docker-build.sh help      # Показать справку
```

### Docker Compose команды
```bash
# Production
docker-compose up -d
docker-compose down
docker-compose logs -f

# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f
```

## 🏗️ Сборка образов

### Production образ
```bash
# Сборка
docker build -t coming-soon:latest .

# Запуск
docker run -d -p 3000:3000 --name coming-soon-app coming-soon:latest
```

### Development образ
```bash
# Сборка
docker build -f Dockerfile.dev -t coming-soon:dev .

# Запуск с монтированием кода
docker run -d -p 3000:3000 -v $(pwd):/app -v /app/node_modules \
  --name coming-soon-dev coming-soon:dev
```

## ⚙️ Конфигурация

### Переменные окружения
```env
# Server Configuration
PORT=3000

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
```

### Volumes
- `./subscriptions.db:/app/subscriptions.db` - база данных
- `./images:/app/images` - изображения

### Ports
- `3000:3000` - основное приложение

## 🔍 Отладка

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f coming-soon

# Последние 100 строк
docker-compose logs --tail=100 coming-soon
```

### Shell в контейнере
```bash
# Production
docker exec -it coming-soon-app /bin/sh

# Development
docker exec -it coming-soon-dev /bin/sh
```

### Проверка состояния
```bash
# Статус контейнеров
docker-compose ps

# Использование ресурсов
docker stats

# Информация об образах
docker images
```

## 🧹 Очистка

### Остановка и удаление
```bash
# Остановить контейнеры
docker-compose down

# Удалить контейнеры и образы
docker-compose down --rmi all --volumes --remove-orphans

# Очистить все
make clean
```

### Удаление образов
```bash
# Удалить конкретный образ
docker rmi coming-soon:latest
docker rmi coming-soon:dev

# Удалить все неиспользуемые образы
docker image prune -a
```

## 🚨 Устранение неполадок

### Порт занят
```bash
# Найти процесс на порту 3000
lsof -i :3000

# Убить процесс
kill -9 <PID>

# Или изменить порт в docker-compose.yml
ports:
  - "3001:3000"
```

### Проблемы с правами доступа
```bash
# Исправить права на базу данных
sudo chown 1001:1001 subscriptions.db

# Или изменить пользователя в Dockerfile
USER root
```

### Проблемы с памятью
```bash
# Ограничить память в docker-compose.yml
services:
  coming-soon:
    deploy:
      resources:
        limits:
          memory: 512M
```

## 📊 Мониторинг

### Health Check
```bash
# Проверить health endpoint
curl http://localhost:3000/api/health

# Посмотреть статус health check
docker inspect coming-soon-app | grep -A 10 Health
```

### Метрики
```bash
# Использование ресурсов
docker stats --no-stream

# Размер образов
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

## 🔒 Безопасность

### Рекомендации
- Измените пароль администратора в `.env`
- Используйте HTTPS в продакшене
- Ограничьте доступ к Docker daemon
- Регулярно обновляйте базовые образы

### Production настройки
```yaml
# docker-compose.prod.yml
services:
  coming-soon:
    environment:
      - NODE_ENV=production
      - SECURE_COOKIES=true
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

## 📚 Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Docker Security Best Practices](https://docs.docker.com/develop/dev-best-practices/)
