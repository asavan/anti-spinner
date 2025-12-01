// Получаем элемент квадрата
const square = document.getElementById('square');

// Переменные для хранения углов
let alpha = 0; // Поворот вокруг оси Z (компас)
let beta = 0;  // Поворот вокруг оси X (наклон вперед/назад)
let gamma = 0; // Поворот вокруг оси Y (наклон влево/вправо)

// Флаг для отслеживания состояния разрешения
let permissionGranted = false;

// Функция для применения трансформации к квадрату
function updateSquareOrientation() {
    // Компенсируем поворот вокруг оси Z (альфа), чтобы квадрат оставался горизонтальным
    // Используем 3D трансформации для более плавного эффекта
    square.style.transform = `rotateZ(${-alpha}deg)`;
}

// Обработчик события deviceorientation
function handleOrientation(event) {
    // Проверяем, что событие содержит корректные данные
    if (event.alpha === null && event.beta === null && event.gamma === null) {
        return;
    }
    
    // Получаем углы в градусах
    alpha = event.alpha !== null ? event.alpha : 0; // compass direction
    beta = event.beta !== null ? event.beta : 0;    // front-to-back tilt
    gamma = event.gamma !== null ? event.gamma : 0; // left-to-right tilt
    
    // Применяем обратный поворот к квадрату
    updateSquareOrientation();
}

// Обработчик события deviceorientationabsolute (более точный, но поддерживается не всеми браузерами)
function handleOrientationAbsolute(event) {
    // Проверяем, что событие содержит корректные данные
    if (event.alpha === null && event.beta === null && event.gamma === null) {
        return;
    }
    
    alpha = event.alpha !== null ? event.alpha : 0;
    beta = event.beta !== null ? event.beta : 0;
    gamma = event.gamma !== null ? event.gamma : 0;
    
    // Применяем обратный поворот к квадрату
    updateSquareOrientation();
}

// Функция для проверки поддержки ориентации устройства
function checkOrientationSupport() {
    if (typeof DeviceOrientationEvent !== 'undefined') {
        // Проверяем, требуется ли разрешение (iOS 13+)
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // Создаем кнопку для запроса разрешения
            createPermissionButton();
        } else {
            // Добавляем обработчики событий напрямую
            addOrientationListeners();
        }
    } else {
        console.warn('Device orientation API не поддерживается в этом браузере');
        showUnsupportedMessage();
    }
}

// Функция для создания кнопки запроса разрешения
function createPermissionButton() {
    const button = document.createElement('button');
    button.id = 'permission-button';
    button.textContent = 'Разрешить доступ к ориентации устройства';
    button.style.position = 'fixed';
    button.style.top = '20px';
    button.style.left = '50%';
    button.style.transform = 'translateX(-50%)';
    button.style.zIndex = '1000';
    button.style.padding = '12px 24px';
    button.style.background = '#0066ff';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '8px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '16px';
    button.style.fontWeight = '500';
    button.style.boxShadow = '0 4px 12px rgba(0, 102, 255, 0.3)';
    button.style.transition = 'all 0.2s ease';
    
    button.addEventListener('mouseenter', function() {
        this.style.background = '#0052cc';
        this.style.boxShadow = '0 6px 16px rgba(0, 102, 255, 0.4)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.background = '#0066ff';
        this.style.boxShadow = '0 4px 12px rgba(0, 102, 255, 0.3)';
    });
    
    button.addEventListener('click', function() {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    permissionGranted = true;
                    // Убираем кнопку после получения разрешения
                    if (this.parentNode) {
                        this.parentNode.removeChild(this);
                    }
                    // Добавляем обработчики событий
                    addOrientationListeners();
                }
            })
            .catch(error => {
                console.error('Ошибка при запросе разрешения:', error);
                alert('Не удалось получить разрешение на доступ к ориентации устройства');
            });
    });
    
    document.body.appendChild(button);
}

// Функция для добавления обработчиков событий ориентации
function addOrientationListeners() {
    if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleOrientationAbsolute);
    } else {
        window.addEventListener('deviceorientation', handleOrientation);
    }
}

// Функция для отображения сообщения о неподдерживаемом браузере
function showUnsupportedMessage() {
    const message = document.createElement('div');
    message.textContent = 'Ваш браузер не поддерживает Device Orientation API';
    message.style.position = 'fixed';
    message.style.top = '20px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.zIndex = '1000';
    message.style.padding = '12px 24px';
    message.style.background = '#ff3333';
    message.style.color = 'white';
    message.style.borderRadius = '8px';
    message.style.fontSize = '16px';
    message.style.textAlign = 'center';
    
    document.body.appendChild(message);
}

square.addEventListener("click", () => {
    if (!permissionGranted) {
        checkOrientationSupport();
    }
    permissionGranted = true;
});

// Обработчик изменения размера окна
window.addEventListener('resize', updateSquareOrientation);

// Обработчик видимости страницы
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Страница снова видима, обновляем ориентацию
        updateSquareOrientation();
    }
});
