// Установите целевую дату здесь (год, месяц (0-11), день, час, минута)
const targetDate = new Date(2025, 9, 1, 0, 0, 0).getTime(); // 1 января 2025 года

// Функция для обновления таймера
function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    // Если дата уже прошла
    if (distance < 0) {
        document.getElementById('days').innerHTML = '00';
        document.getElementById('hours').innerHTML = '00';
        document.getElementById('minutes').innerHTML = '00';
        document.getElementById('seconds').innerHTML = '00';
        
        // Можно добавить сообщение о том, что сайт уже открыт
        document.querySelector('.main-text h2').innerHTML = 'Мы открылись!';
        document.querySelector('.main-text p').innerHTML = 'Добро пожаловать на наш сайт!';
        return;
    }
    
    // Вычисляем время
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Обновляем элементы на странице
    document.getElementById('days').innerHTML = days.toString().padStart(2, '0');
    document.getElementById('hours').innerHTML = hours.toString().padStart(2, '0');
    document.getElementById('minutes').innerHTML = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').innerHTML = seconds.toString().padStart(2, '0');
}

// Обновляем таймер каждую секунду
setInterval(updateCountdown, 1000);

// Запускаем таймер сразу при загрузке страницы
updateCountdown();

// Обработка формы подписки
document.querySelector('.email-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const emailInput = this.querySelector('input[type="email"]');
    const submitButton = this.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();
    
            if (!email) {
            const currentLang = localStorage.getItem('language') || 'ru';
            showNotification(locales[currentLang].emailRequired, 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            const currentLang = localStorage.getItem('language') || 'ru';
            showNotification(locales[currentLang].invalidEmail, 'error');
            return;
        }
    
            // Disable form during submission
        const currentLang = localStorage.getItem('language') || 'ru';
        submitButton.disabled = true;
        submitButton.textContent = locales[currentLang].submittingButton;
        
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(data.message, 'success');
                emailInput.value = '';
                // Update subscription count if available
                updateSubscriptionCount();
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            showNotification(locales[currentLang].connectionError, 'error');
        } finally {
            // Re-enable form
            submitButton.disabled = false;
            submitButton.textContent = locales[currentLang].subscribeButton;
        }
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    } else {
        notification.style.background = '#2196F3';
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    // Add click to dismiss
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// Update subscription count (optional feature)
async function updateSubscriptionCount() {
    try {
        const response = await fetch('/api/subscriptions');
        const data = await response.json();
        
        if (data.success) {
            // You can display the count somewhere on the page
            console.log(`Total subscriptions: ${data.count}`);
        }
    } catch (error) {
        console.error('Error fetching subscription count:', error);
    }
}

// Добавляем анимацию появления элементов при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language system
    initLanguage();
    
    // Add language switcher to the page
    const switcherContainer = document.querySelector('.language-switcher-container');
    if (switcherContainer) {
        switcherContainer.appendChild(createLanguageSwitcher());
    }
    
    const elements = document.querySelectorAll('.logo, .main-text, .countdown, .newsletter, .social-links');
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// Добавляем эффект параллакса для фоновых элементов
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.background-animation');
    
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// Добавляем интерактивность для элементов таймера
document.querySelectorAll('.countdown-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Функция для изменения целевой даты (можно вызвать из консоли браузера)
function setTargetDate(year, month, day, hour = 0, minute = 0) {
    const newDate = new Date(year, month - 1, day, hour, minute, 0);
    targetDate = newDate.getTime();
    updateCountdown();
}

// Пример использования: setTargetDate(2025, 3, 15) - 15 апреля 2025 года

