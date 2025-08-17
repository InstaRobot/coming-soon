# Coming Soon - Landing Page

![Main Page](images/main-en.png)

![Admin Panel](images/admin-panel-en.png)

Modern "Coming Soon" landing page with countdown timer and admin panel for managing email subscriptions.

## 🚀 Quick Start

### Local Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env file

# Start server
npm run dev
```

### Docker

```bash
# Build image
docker build -t coming-soon .

# Run container
docker run -d -p 3000:3000 --name coming-soon-app coming-soon

# Stop container
docker stop coming-soon-app

# Remove container
docker rm coming-soon-app
```

## 📋 Requirements

- Node.js 14+ 
- npm or yarn

## ✨ Features

- ⏰ **Countdown Timer** - shows time until opening
- 📧 **Subscription Form** - for opening notifications
- 🔐 **Admin Panel** - subscription management and date settings
- 🎨 **Modern Design** - responsive layout, animations
- 🌍 **Multilingual** - Russian and English languages

## 📁 Project Structure

- `index.html` - main page
- `admin.html` - admin panel
- `admin-login.html` - login page
- `server.js` - Node.js server
- `script.js` - timer logic
- `locales.js` - translations
- `css/` - styles
- `images/` - images
- `LICENSE` - MIT license

## ⚙️ Configuration

### 1. Environment Variables

Create `.env` file:

```env
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
```

### 2. Opening Date Settings

Date is configured through admin panel:
1. Login to admin panel
2. Go to "Opening Date Settings" section
3. Set desired date and time
4. Click "Update Date"

### 3. Logo and Text Customization

Edit `index.html`:
- Replace "LOGO" with your logo
- Change headings and descriptions
- Update social media links

## 🚀 Running

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### Page Access

- **Main Page:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **Admin Login:** http://localhost:3000/admin-login

## 🔐 Admin Panel

### Functions

- 📊 **Statistics** - total and new subscriptions
- 📧 **Subscription Management** - view, delete, bulk delete
- 🎯 **Date Settings** - set opening date and time
- 📥 **Export** - download subscriptions to CSV

### Authentication

Login credentials are configured in `.env` file.

## 🐳 Docker

### Commands

```bash
# Build image
docker build -t coming-soon .

# Run container
docker run -d -p 3000:3000 --name coming-soon-app coming-soon

# Stop container
docker stop coming-soon-app

# Remove container
docker rm coming-soon-app
```

### Files

- `Dockerfile` - universal image for building

### Docker Compose (optional)

Create `docker-compose.yml` for convenient startup:

```yaml
version: '3.8'

services:
  coming-soon:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./app.db:/app/app.db
    restart: unless-stopped
```

Usage:
```bash
# Build and run
docker-compose up -d --build

# Stop
docker-compose down

# View logs
docker-compose logs -f
```

## 🌍 Localization

Supported languages:
- 🇷🇺 Russian (default)
- 🇺🇸 English

Language switcher is located in the top right corner.

## 📱 Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## 🛠️ Technologies

- HTML5, CSS3, JavaScript (ES6+)
- Node.js, Express, SQLite3
- Docker, Docker Compose

## 📄 License

Project is distributed under MIT license. See [LICENSE](LICENSE) file for details.

MIT License allows:
- ✅ Use code in commercial projects
- ✅ Modify and adapt for your needs
- ✅ Distribute and sell
- ✅ Use in closed projects

Only requirement - keep license text and indicate authorship.
