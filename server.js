require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration for both development and production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);

        // Allow all origins in development
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // In production, check allowed origins
        const allowedOrigins = process.env.ALLOWED_ORIGINS ?
            process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) :
            [];

        // If ALLOWED_ORIGINS is set, use it strictly
        if (allowedOrigins.length > 0) {
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                console.log(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
                return callback(new Error('Not allowed by CORS'));
            }
        }

        // If no ALLOWED_ORIGINS set, allow all (for ease of deployment)
        console.log(`CORS allowing origin: ${origin} (no restrictions set)`);
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session management for admin authentication
const sessions = new Map();
const SESSION_DURATION = 86400000; // 24 hours in milliseconds

// Target date storage (in production, this should be stored in database)
let targetDate = new Date('2025-10-01T00:00:00.000Z');

// Admin authentication middleware
function requireAuth(req, res, next) {
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
    console.log('Auth check - Session ID:', sessionId ? sessionId.substring(0, 8) + '...' : 'missing');
    console.log('Auth check - Sessions count:', sessions.size);
    console.log('Auth check - Request origin:', req.headers.origin || 'no origin');
    console.log('Auth check - Request URL:', req.url);

    if (!sessionId || !sessions.has(sessionId)) {
        console.log('Auth failed - no valid session. Available sessions:', Array.from(sessions.keys()).map(id => id.substring(0, 8) + '...'));
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    
    const session = sessions.get(sessionId);
    if (Date.now() > session.expires) {
        console.log('Auth failed - session expired at:', new Date(session.expires).toISOString());
        sessions.delete(sessionId);
        return res.status(401).json({ 
            success: false, 
            message: 'Session expired' 
        });
    }
    
    console.log('Auth successful for user:', session.user.username);
    req.adminUser = session.user;
    next();
}

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve robots.txt with proper content-type
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

// Database setup with retry logic  
const dbPath = process.env.DB_PATH || './data/app.db';
const fs = require('fs');

console.log('Attempting to connect to database at:', dbPath);
console.log('Current working directory:', process.cwd());

// Ensure database file exists
try {
    if (!fs.existsSync(dbPath)) {
        console.log('Database file does not exist, creating:', dbPath);
        fs.writeFileSync(dbPath, '', { mode: 0o666 });
    }
    
    const stats = fs.statSync(dbPath);
    console.log('Database file stats:', {
        size: stats.size,
        mode: stats.mode.toString(8),
        accessible: fs.accessSync ? 'checking...' : 'unknown'
    });
    
    // Check if file is readable and writable
    fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
    console.log('Database file is readable and writable');
    
} catch (error) {
    console.error('Error with database file:', error.message);
    console.log('Attempting to create database file...');
    
    try {
        fs.writeFileSync(dbPath, '', { mode: 0o666 });
        console.log('Database file created successfully');
    } catch (createError) {
        console.error('Failed to create database file:', createError.message);
        console.error('This is likely a file system permissions issue');
        process.exit(1);
    }
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        console.error('Database path:', dbPath);
        console.error('This is a critical error, server cannot continue');
        process.exit(1);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
        initDatabase();
    }
});

// Initialize database table
function initDatabase() {
    console.log('Starting database initialization...');
    
    // Create subscriptions table first
    const subscriptionsSql = `
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'active'
        )
    `;
    
    db.run(subscriptionsSql, (err) => {
        if (err) {
            console.error('Error creating subscriptions table:', err.message);
            return;
        }
        console.log('Subscriptions table ready');
        
        // Create site_config table after subscriptions
        const configSql = `
            CREATE TABLE IF NOT EXISTS site_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                config_key TEXT UNIQUE NOT NULL,
                config_value TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        db.run(configSql, (err) => {
            if (err) {
                console.error('Error creating site_config table:', err.message);
                return;
            }
            console.log('Site config table ready');
            
            // Initialize default target date after both tables are created
            initDefaultTargetDate();
        });
    });
}

// Initialize default target date in database
function initDefaultTargetDate() {
    console.log('Initializing default target date...');
    const defaultDate = new Date('2025-10-01T00:00:00.000Z');
    
    db.get("SELECT config_value FROM site_config WHERE config_key = 'target_date'", (err, row) => {
        if (err) {
            console.error('Error checking default target date:', err);
            return;
        }
        
        if (!row) {
            // Insert default target date
            const insertSql = `
                INSERT INTO site_config (config_key, config_value, updated_at) 
                VALUES ('target_date', ?, CURRENT_TIMESTAMP)
            `;
            
            db.run(insertSql, [defaultDate.toISOString()], (err) => {
                if (err) {
                    console.error('Error inserting default target date:', err);
                } else {
                    console.log('Default target date initialized in DB:', defaultDate.toISOString());
                    // Update memory variable
                    targetDate = defaultDate;
                    // Initialize default project name after target date
                    initDefaultProjectName();
                }
            });
        } else {
            // Load existing target date from DB
            targetDate = new Date(row.config_value);
            console.log('Target date loaded from DB:', targetDate.toISOString());
            // Initialize default project name after target date
            initDefaultProjectName();
        }
    });
}

// Initialize default project name in database
function initDefaultProjectName() {
    console.log('Initializing default project name...');
    
    db.get("SELECT config_value FROM site_config WHERE config_key = 'project_name'", (err, row) => {
        if (err) {
            console.error('Error checking default project name:', err);
            return;
        }
        
        if (!row) {
            // Insert default project name
            const insertSql = `
                INSERT INTO site_config (config_key, config_value, updated_at) 
                VALUES ('project_name', ?, CURRENT_TIMESTAMP)
            `;
            
            db.run(insertSql, ['LOGO'], (err) => {
                if (err) {
                    console.error('Error inserting default project name:', err);
                } else {
                    console.log('Default project name initialized in DB: LOGO');
                    console.log('Database initialization completed successfully!');
                }
            });
        } else {
            console.log('Project name loaded from DB:', row.config_value);
            console.log('Database initialization completed successfully!');
        }
    });
}

// Save target date to database
function saveTargetDateToDB(newDate) {
    const sql = `
        INSERT OR REPLACE INTO site_config (config_key, config_value, updated_at) 
        VALUES ('target_date', ?, CURRENT_TIMESTAMP)
    `;
    
    db.run(sql, [newDate.toISOString()], (err) => {
        if (err) {
            console.error('Error saving target date to DB:', err);
        } else {
            console.log('Target date saved to DB:', newDate.toISOString());
        }
    });
}

// Save project name to database
function saveProjectNameToDB(projectName) {
    const sql = `
        INSERT OR REPLACE INTO site_config (config_key, config_value, updated_at) 
        VALUES ('project_name', ?, CURRENT_TIMESTAMP)
    `;
    
    db.run(sql, [projectName], (err) => {
        if (err) {
            console.error('Error saving project name to DB:', err);
        } else {
            console.log('Project name saved to DB:', projectName);
        }
    });
}

// Get project name from database
function getProjectNameFromDB(callback) {
    const sql = 'SELECT config_value FROM site_config WHERE config_key = ?';
    
    db.get(sql, ['project_name'], (err, row) => {
        if (err) {
            console.error('Error getting project name from DB:', err);
            callback(err, null);
        } else {
            const projectName = row ? row.config_value : 'LOGO';
            callback(null, projectName);
        }
    });
}

// API Routes

// Admin authentication
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);
    console.log('Request origin:', req.headers.origin || 'no origin');
    console.log('Request user-agent:', req.headers['user-agent'] || 'unknown');
    
    // Check credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    console.log('Expected username:', adminUsername);
    console.log('Using default credentials:', !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD);
    
    if (username === adminUsername && password === adminPassword) {
        const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expires = Date.now() + SESSION_DURATION;
        
        sessions.set(sessionId, {
            user: { username: 'admin' },
            expires: expires
        });
        
        // Cookie configuration for production/development
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Fixed: use 'strict' instead of 'none'
            maxAge: SESSION_DURATION
        };

        // Add domain if specified in production
        if (process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN) {
            cookieOptions.domain = process.env.COOKIE_DOMAIN;
        }

        console.log('Setting cookie with options:', JSON.stringify(cookieOptions));
        res.cookie('sessionId', sessionId, cookieOptions);
        
        res.json({ 
            success: true, 
            message: 'Авторизация успешна',
            sessionId: sessionId
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Неверный логин или пароль' 
        });
    }
});

app.post('/api/admin/logout', (req, res) => {
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
    
    if (sessionId) {
        sessions.delete(sessionId);
    }
    
    res.clearCookie('sessionId');
    res.json({ 
        success: true, 
        message: 'Выход выполнен успешно' 
    });
});

app.get('/api/admin/check-auth', requireAuth, (req, res) => {
    res.json({ 
        success: true, 
        message: 'Авторизован',
        user: req.adminUser 
    });
});

// Subscribe to newsletter
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ 
            success: false, 
            message: 'Пожалуйста, введите корректный email адрес' 
        });
    }
    
    // First check if email already exists
    const checkSql = 'SELECT * FROM subscriptions WHERE email = ?';
    
    db.get(checkSql, [email], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка сервера. Попробуйте позже.' 
            });
        }
        
        if (row) {
            // Email already exists
            if (row.status === 'active') {
                return res.status(200).json({ 
                    success: true, 
                    message: 'Вы уже подписаны на уведомления! Вы получите уведомление сразу после публикации сайта.',
                    alreadySubscribed: true,
                    id: row.id 
                });
            } else if (row.status === 'unsubscribed') {
                // Reactivate subscription
                const updateSql = 'UPDATE subscriptions SET status = ? WHERE email = ?';
                db.run(updateSql, ['active', email], function(err) {
                    if (err) {
                        console.error('Database error:', err.message);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Ошибка сервера. Попробуйте позже.' 
                        });
                    }
                    
                    res.json({ 
                        success: true, 
                        message: 'Подписка восстановлена! Мы уведомим вас, когда сайт откроется.',
                        reactivated: true,
                        id: row.id 
                    });
                });
            }
        } else {
            // Email doesn't exist, create new subscription
            const insertSql = 'INSERT INTO subscriptions (email) VALUES (?)';
            
            db.run(insertSql, [email], function(err) {
                if (err) {
                    console.error('Database error:', err.message);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Ошибка сервера. Попробуйте позже.' 
                    });
                }
                
                res.json({ 
                    success: true, 
                    message: 'Спасибо! Мы уведомим вас, когда сайт откроется.',
                    id: this.lastID 
                });
            });
        }
    });
});

// Check if email exists in database
app.post('/api/check-email', (req, res) => {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ 
            success: false, 
            message: 'Пожалуйста, введите корректный email адрес' 
        });
    }
    
    const sql = 'SELECT id, status FROM subscriptions WHERE email = ?';
    
    db.get(sql, [email], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка сервера. Попробуйте позже.' 
            });
        }
        
        if (row) {
            res.json({ 
                success: true, 
                exists: true,
                status: row.status,
                id: row.id 
            });
        } else {
            res.json({ 
                success: true, 
                exists: false 
            });
        }
    });
});

// Get all subscriptions (for admin purposes) - requires auth
app.get('/api/subscriptions', requireAuth, (req, res) => {
    const sql = 'SELECT * FROM subscriptions ORDER BY subscribed_at DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка при получении подписок' 
            });
        }
        
        res.json({ 
            success: true, 
            subscriptions: rows,
            count: rows.length 
        });
    });
});

// Unsubscribe from newsletter
app.post('/api/unsubscribe', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email адрес обязателен' 
        });
    }
    
    const sql = 'UPDATE subscriptions SET status = ? WHERE email = ?';
    
    db.run(sql, ['unsubscribed', email], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка сервера' 
            });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Email не найден в списке подписок' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Вы успешно отписались от уведомлений' 
        });
    });
});

// Delete subscriber (admin only)
app.delete('/api/subscriptions/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID подписчика обязателен' 
        });
    }
    
    const sql = 'DELETE FROM subscriptions WHERE id = ?';
    
    db.run(sql, [id], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка сервера' 
            });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Подписчик не найден' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Подписчик успешно удален' 
        });
    });
});

// Bulk delete subscribers (admin only)
app.post('/api/subscriptions/bulk-delete', requireAuth, (req, res) => {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Список ID подписчиков обязателен' 
        });
    }
    
    // Convert array of IDs to comma-separated string for SQL IN clause
    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM subscriptions WHERE id IN (${placeholders})`;
    
    db.run(sql, ids, function(err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка сервера при массовом удалении' 
            });
        }
        
        res.json({ 
            success: true, 
            message: `Успешно удалено ${this.changes} подписчиков`,
            deletedCount: this.changes
        });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: 'connected',
        environment: process.env.NODE_ENV || 'development',
        sessions: sessions.size
    });
});

// Debug endpoint for production issues (admin only)
app.get('/api/debug', requireAuth, (req, res) => {
    const envVars = {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        PORT: process.env.PORT || 'not set',
        ADMIN_USERNAME: process.env.ADMIN_USERNAME ? 'set' : 'not set',
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'set' : 'not set',
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'not set',
        COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'not set',
        DB_PATH: process.env.DB_PATH || 'default (./app.db)'
    };
    
    res.json({
        status: 'Debug Info',
        timestamp: new Date().toISOString(),
        environment: envVars,
        activeSessions: sessions.size,
        requestHeaders: {
            origin: req.headers.origin || 'not set',
            userAgent: req.headers['user-agent'] || 'not set',
            host: req.headers.host || 'not set',
            referer: req.headers.referer || 'not set'
        },
        databasePath: dbPath,
        workingDirectory: process.cwd()
    });
});

// Configuration endpoint for frontend
app.get('/api/config', (req, res) => {
    getProjectNameFromDB((err, projectName) => {
        if (err) {
            console.error('Error getting project name:', err);
            projectName = 'LOGO';
        }
        
        res.json({
            siteTitle: 'Скоро открытие - Coming Soon',
            siteDescription: 'Мы работаем над чем-то удивительным. Оставайтесь с нами!',
            targetDate: targetDate.toISOString(),
            projectName: projectName,
            defaultLanguage: 'ru',
            supportedLanguages: ['ru', 'en']
        });
    });
});

// Update target date endpoint (admin only)
app.post('/api/config/update-target-date', requireAuth, (req, res) => {
    try {
        const { targetDate: newTargetDate, timezone } = req.body;
        
        if (!newTargetDate) {
            return res.status(400).json({
                success: false,
                message: 'Target date is required'
            });
        }
        
        // Parse and validate the date
        const parsedDate = new Date(newTargetDate);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }
        
        // Update the target date in memory
        targetDate = parsedDate;
        
        // Save to database
        saveTargetDateToDB(parsedDate);
        
        console.log(`Target date updated to: ${targetDate.toISOString()} (${timezone || 'UTC'})`);
        
        res.json({
            success: true,
            message: 'Target date updated successfully',
            targetDate: targetDate.toISOString(),
            timezone: timezone || 'UTC'
        });
        
    } catch (error) {
        console.error('Error updating target date:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update project name endpoint (admin only)
app.post('/api/config/update-project-name', requireAuth, (req, res) => {
    try {
        const { projectName } = req.body;
        
        if (!projectName || typeof projectName !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Project name is required'
            });
        }
        
        const trimmedName = projectName.trim();
        
        if (!trimmedName) {
            return res.status(400).json({
                success: false,
                message: 'Project name cannot be empty'
            });
        }
        
        if (trimmedName.length > 50) {
            return res.status(400).json({
                success: false,
                message: 'Project name cannot exceed 50 characters'
            });
        }
        
        // Save to database
        saveProjectNameToDB(trimmedName);
        
        console.log(`Project name updated to: ${trimmedName}`);
        
        res.json({
            success: true,
            message: 'Project name updated successfully',
            projectName: trimmedName
        });
        
    } catch (error) {
        console.error('Error updating project name:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin login page
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

// Serve admin panel (protected)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Внутренняя ошибка сервера' 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Страница не найдена' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`Service ready`);
    console.log(`💾 SQLite database: app.db`);
});

// Prevent crash loops - handle unhandled errors
process.on('uncaughtException', (error) => {
    console.error('🚨 UNCAUGHT EXCEPTION! Shutting down...');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Close database connection gracefully
    db.close(() => {
        console.log('Database connection closed due to uncaught exception');
        process.exit(1);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 UNHANDLED REJECTION! Shutting down...');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    
    // Close database connection gracefully
    db.close(() => {
        console.log('Database connection closed due to unhandled rejection');
        process.exit(1);
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
