const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session management for admin authentication
const sessions = new Map();

// Admin authentication middleware
function requireAuth(req, res, next) {
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
    
    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized' 
        });
    }
    
    const session = sessions.get(sessionId);
    if (Date.now() > session.expires) {
        sessions.delete(sessionId);
        return res.status(401).json({ 
            success: false, 
            message: 'Session expired' 
        });
    }
    
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

// Database setup
const db = new sqlite3.Database('./subscriptions.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

// Initialize database table
function initDatabase() {
    const sql = `
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'active'
        )
    `;
    
    db.run(sql, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Subscriptions table ready');
        }
    });
}

// API Routes

// Admin authentication
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Hardcoded credentials
    if (username === 'admin' && password === '29041979qw') {
        const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        
        sessions.set(sessionId, {
            user: { username: 'admin' },
            expires: expires
        });
        
        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
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
        database: 'connected'
    });
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
    console.log(`📧 Email subscription service ready`);
    console.log(`💾 SQLite database: subscriptions.db`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
