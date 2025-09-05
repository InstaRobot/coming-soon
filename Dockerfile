# Универсальный Dockerfile для Coming Soon проекта
FROM node:18-alpine

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production --no-audit --no-fund && npm cache clean --force

# Копирование исходного кода
COPY . .

# Создание непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Изменение владельца файлов
RUN chown -R nodejs:nodejs /app
USER nodejs

# Открытие порта (порт приложения настраивается через переменную PORT)
EXPOSE 3000

# Переменные окружения
ENV NODE_ENV=production

# Команда запуска
CMD ["npm", "start"]
