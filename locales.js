const locales = {
    ru: {
        // Main page
        title: 'Скоро открытие - Coming Soon',
        logo: 'LOGO',
        mainHeading: 'Скоро открытие',
        mainDescription: 'Мы работаем над чем-то удивительным. Оставайтесь с нами!',
        days: 'Дней',
        hours: 'Часов',
        minutes: 'Минут',
        seconds: 'Секунд',
        newsletterTitle: 'Уведомить об открытии',
        emailPlaceholder: 'Введите ваш email',
        subscribeButton: 'Подписаться',
        submittingButton: 'Отправка...',
        
        // Notifications
        emailRequired: 'Пожалуйста, введите email адрес',
        invalidEmail: 'Пожалуйста, введите корректный email адрес',
        subscriptionSuccess: 'Спасибо! Мы уведомим вас, когда сайт откроется.',
        alreadySubscribed: 'Этот email уже подписан на уведомления',
        alreadySubscribedMessage: 'Вы уже подписаны на уведомления! Вы получите уведомление сразу после публикации сайта.',
        emailAlreadySubscribed: 'Этот email уже подписан на уведомления',
        subscriptionReactivated: 'Подписка восстановлена! Мы уведомим вас, когда сайт откроется.',
        connectionError: 'Ошибка соединения. Попробуйте позже.',
        serverError: 'Ошибка сервера. Попробуйте позже.',
        
        // Admin panel
        adminPanelTitle: 'Админ-панель подписок',
        adminPanelDescription: 'Управление email подписками на уведомления',
        administrator: 'Администратор',
        logout: 'Выйти',
        totalSubscriptions: 'Всего подписок',
        todaySubscriptions: 'Сегодня',
        refresh: 'Обновить',
        exportCSV: 'Экспорт CSV',
        id: 'ID',
        email: 'Email',
        subscriptionDate: 'Дата подписки',
        actions: 'Действия',
        delete: 'Удалить',
        deleteConfirm: 'Вы уверены, что хотите удалить подписчика {email}? Это действие нельзя отменить.',
        deleteSuccess: 'Подписчик успешно удален',
        bulkDelete: 'Удалить выбранные',
        bulkDeleteConfirm: 'Вы уверены, что хотите удалить {count} выбранных подписчиков? Это действие нельзя отменить.',
        bulkDeleteSuccess: 'Выбранные подписчики успешно удалены',
        selectSubscriptionsToDelete: 'Пожалуйста, выберите подписки для удаления',
        noSubscriptions: 'Подписки не найдены',
        loadingSubscriptions: 'Загрузка подписок...',
        errorLoading: 'Ошибка загрузки подписок: ',
        connectionErrorAdmin: 'Ошибка соединения с сервером',
        errorToggle: 'Ошибка: ',
        exportFileName: 'subscriptions_',
        
        // Admin login
        adminLoginTitle: 'Вход в админ-панель',
        username: 'Логин',
        password: 'Пароль',
        usernamePlaceholder: 'Введите логин',
        passwordPlaceholder: 'Введите пароль',
        loginButton: 'Войти',
        loggingIn: 'Вход...',
        fillAllFields: 'Пожалуйста, заполните все поля',
        loginSuccess: 'Авторизация успешна! Перенаправление...',
        authError: 'Ошибка авторизации',
        backToMain: '← Вернуться на главную',
        
        // Language switcher
        language: 'Язык',
        switchToEnglish: 'Switch to English',
        switchToRussian: 'Переключиться на русский'
    },
    
    en: {
        // Main page
        title: 'Coming Soon - Site Launch',
        logo: 'LOGO',
        mainHeading: 'Coming Soon',
        mainDescription: 'We are working on something amazing. Stay tuned!',
        days: 'Days',
        hours: 'Hours',
        minutes: 'Minutes',
        seconds: 'Seconds',
        newsletterTitle: 'Notify me when launched',
        emailPlaceholder: 'Enter your email',
        subscribeButton: 'Subscribe',
        submittingButton: 'Submitting...',
        
        // Notifications
        emailRequired: 'Please enter an email address',
        invalidEmail: 'Please enter a valid email address',
        subscriptionSuccess: 'Thank you! We will notify you when the site launches.',
        alreadySubscribed: 'This email is already subscribed to notifications',
        alreadySubscribedMessage: 'You are already subscribed to notifications! You will receive a notification as soon as the site is published.',
        emailAlreadySubscribed: 'This email is already subscribed to notifications',
        subscriptionReactivated: 'Subscription reactivated! We will notify you when the site launches.',
        connectionError: 'Connection error. Please try again later.',
        serverError: 'Server error. Please try again later.',
        
        // Admin panel
        adminPanelTitle: 'Subscriptions Admin Panel',
        adminPanelDescription: 'Manage email subscriptions for notifications',
        administrator: 'Administrator',
        logout: 'Logout',
        totalSubscriptions: 'Total Subscriptions',
        todaySubscriptions: 'Today',
        refresh: 'Refresh',
        exportCSV: 'Export CSV',
        id: 'ID',
        email: 'Email',
        subscriptionDate: 'Subscription Date',
        actions: 'Actions',
        delete: 'Delete',
        deleteConfirm: 'Are you sure you want to delete subscriber {email}? This action cannot be undone.',
        deleteSuccess: 'Subscriber successfully deleted',
        bulkDelete: 'Delete selected',
        bulkDeleteConfirm: 'Are you sure you want to delete {count} selected subscribers? This action cannot be undone.',
        bulkDeleteSuccess: 'Selected subscribers successfully deleted',
        selectSubscriptionsToDelete: 'Please select subscriptions to delete',
        noSubscriptions: 'No subscriptions found',
        loadingSubscriptions: 'Loading subscriptions...',
        errorLoading: 'Error loading subscriptions: ',
        connectionErrorAdmin: 'Server connection error',
        errorToggle: 'Error: ',
        exportFileName: 'subscriptions_',
        
        // Admin login
        adminLoginTitle: 'Admin Panel Login',
        username: 'Username',
        password: 'Password',
        usernamePlaceholder: 'Enter username',
        passwordPlaceholder: 'Enter password',
        loginButton: 'Login',
        loggingIn: 'Logging in...',
        fillAllFields: 'Please fill in all fields',
        loginSuccess: 'Login successful! Redirecting...',
        authError: 'Authentication error',
        backToMain: '← Back to main page',
        
        // Language switcher
        language: 'Language',
        switchToEnglish: 'Switch to English',
        switchToRussian: 'Переключиться на русский'
    }
};

// Language switcher component
function createLanguageSwitcher() {
    const currentLang = localStorage.getItem('language') || 'ru';
    
    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.innerHTML = `
        <button class="lang-btn ${currentLang === 'ru' ? 'active' : ''}" data-lang="ru">
            🇷🇺 RU
        </button>
        <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">
            🇺🇸 EN
        </button>
    `;
    
    // Add event listeners
    switcher.addEventListener('click', (e) => {
        if (e.target.classList.contains('lang-btn')) {
            const lang = e.target.dataset.lang;
            switchLanguage(lang);
        }
    });
    
    return switcher;
}

// Switch language function
function switchLanguage(lang) {
    localStorage.setItem('language', lang);
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update page content
    updatePageContent(lang);
    
    // Update page title
    document.title = locales[lang].title;
}

// Update page content based on language
function updatePageContent(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.dataset.i18n;
        if (locales[lang][key]) {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.placeholder = locales[lang][key];
            } else {
                element.textContent = locales[lang][key];
            }
        }
    });
}

// Initialize language on page load
function initLanguage() {
    const currentLang = localStorage.getItem('language') || 'ru';
    switchLanguage(currentLang);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { locales, createLanguageSwitcher, switchLanguage, initLanguage };
} else {
    window.locales = locales;
    window.createLanguageSwitcher = createLanguageSwitcher;
    window.switchLanguage = switchLanguage;
    window.initLanguage = initLanguage;
}
