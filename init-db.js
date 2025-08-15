const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🗄️  Initializing SQLite database...');

// Create database connection
const db = new sqlite3.Database('./subscriptions.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
});

// Create subscriptions table
const createTableSQL = `
    CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active'
    )
`;

db.run(createTableSQL, (err) => {
    if (err) {
        console.error('❌ Error creating table:', err.message);
    } else {
        console.log('✅ Subscriptions table created successfully');
    }
    
    // Create indexes for better performance
    const createIndexSQL = 'CREATE INDEX IF NOT EXISTS idx_email ON subscriptions(email)';
    
    db.run(createIndexSQL, (err) => {
        if (err) {
            console.error('❌ Error creating index:', err.message);
        } else {
            console.log('✅ Email index created successfully');
        }
        
        // Insert sample data for testing (optional)
        const sampleEmails = [
            'test1@example.com',
            'test2@example.com'
        ];
        
        let inserted = 0;
        sampleEmails.forEach((email) => {
            const insertSQL = 'INSERT OR IGNORE INTO subscriptions (email) VALUES (?)';
            db.run(insertSQL, [email], function(err) {
                if (err) {
                    console.error('❌ Error inserting sample data:', err.message);
                } else if (this.changes > 0) {
                    inserted++;
                    console.log(`✅ Sample email inserted: ${email}`);
                }
            });
        });
        
        // Close database and exit
        setTimeout(() => {
            db.close((err) => {
                if (err) {
                    console.error('❌ Error closing database:', err.message);
                } else {
                    console.log('✅ Database connection closed');
                }
                console.log(`📊 Database initialized with ${inserted} sample records`);
                console.log('🎉 Ready to use!');
                process.exit(0);
            });
        }, 1000);
    });
});
