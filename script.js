document.addEventListener('DOMContentLoaded', () => {
    const playerInput = document.getElementById('playerInput');
    const addButton = document.getElementById('addButton');
    const playerList = document.getElementById('playerList');
    const resetButton = document.getElementById('resetButton');
    const spinButton = document.getElementById('spinButton');
    const winnerTitleDisplay = document.getElementById('winnerTitle');
    const winnerInfoDisplay = document.getElementById('winnerInfo'); // Теперь для номера победителя
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    
    let players = [];
    let isSpinning = false;
    
    // Более яркая и разнообразная цветовая палитра
    const colors = [
        '#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#a29bfe', 
        '#fd79a8', '#00b894', '#0984e3', '#ffaf40', '#6c5ce7'
    ];

    /**
     * @brief Добавляет игрока в список.
     */
    function addPlayer() {
        const name = playerInput.value.trim();
        if (name && players.length < 20) { // Ограничение на количество игроков
            players.push(name);
            playerInput.value = ''; 
            renderPlayers();
            drawWheel();
        } else if (players.length >= 20) {
            alert('Максимум 20 игроков.');
        }
    }

    /**
     * @brief Удаляет игрока по индексу.
     * @param {number} index - Индекс игрока в массиве players.
     */
    function deletePlayer(index) {
        players.splice(index, 1);
        renderPlayers();
        drawWheel();
    }

    /**
     * @brief Очищает весь список игроков.
     */
    function resetAll() {
        if (confirm("Вы уверены, что хотите очистить весь список игроков?")) {
            players = [];
            renderPlayers();
            drawWheel();
            winnerTitleDisplay.textContent = 'Нажми "Старт"';
            winnerInfoDisplay.textContent = '';
        }
    }

    /**
     * @brief Рендерит список игроков на экране с номерами.
     */
    function renderPlayers() {
        playerList.innerHTML = '';
        players.forEach((player, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'player-item';
            listItem.innerHTML = `
                <span class="player-number">${index + 1}.</span> 
                <span class="player-name">${player}</span>
                <button class="delete-button" data-index="${index}">×</button>
            `;
            playerList.appendChild(listItem);
        });

        playerList.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                deletePlayer(index);
            });
        });
        
        spinButton.disabled = players.length < 2; // Кнопка доступна, если игроков 2 или более
    }

    /**
     * @brief Рисует рулетку на Canvas с цифрами.
     */
    function drawWheel() {
        const numSegments = players.length;
        const arcSize = 2 * Math.PI / numSegments;
        const radius = canvas.width / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (numSegments === 0) {
            ctx.beginPath();
            ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#dfe6e9';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#b2bec3';
            ctx.stroke();
            return;
        }

        for (let i = 0; i < numSegments; i++) {
            const startAngle = i * arcSize;
            const endAngle = (i + 1) * arcSize;
            
            ctx.beginPath();
            ctx.arc(radius, radius, radius, startAngle, endAngle);
            ctx.lineTo(radius, radius);
            ctx.closePath();
            
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            
            ctx.lineWidth = 3; // Более толстая обводка
            ctx.strokeStyle = 'rgba(255,255,255,0.8)'; // Белая полупрозрачная
            ctx.stroke();

            // Рисуем цифру
            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate(startAngle + arcSize / 2 + Math.PI / 2); // Поворот для текста

            ctx.textAlign = 'center';
            ctx.fillStyle = '#2d3436'; // Темный цвет для цифры
            ctx.font = 'bold 36px Arial'; // Более крупный и жирный шрифт
            ctx.fillText(i + 1, 0, -radius * 0.6); // Цифра в секторе
            ctx.restore();
        }
    }

    /**
     * @brief Запускает анимацию вращения рулетки.
     */
    function spinWheel() {
        if (isSpinning || players.length < 2) return;
        
        isSpinning = true;
        spinButton.disabled = true;
        winnerTitleDisplay.textContent = 'Крутится...';
        winnerInfoDisplay.textContent = ''; // Очищаем предыдущий результат

        const numSegments = players.length;
        const arcSize = 2 * Math.PI / numSegments;
        
        const winningIndex = Math.floor(Math.random() * numSegments);
        
        // Целевой угол остановки: середина выигрышного сектора под стрелкой
        // Стрелка указывает на 270 градусов (-PI/2)
        const targetAngleRad = (2 * Math.PI - (winningIndex * arcSize + arcSize / 2)) + Math.PI / 2;
        
        // Переводим в градусы и добавляем случайные полные обороты
        const minFullRotations = 5; // Минимум 5 полных оборотов
        const maxFullRotations = 8; // Максимум 8 полных оборотов
        const randomFullRotations = Math.floor(Math.random() * (maxFullRotations - minFullRotations + 1)) + minFullRotations;
        
        const totalRotationDeg = (randomFullRotations * 360) + (targetAngleRad * 180 / Math.PI);
        
        // Длительность анимации (3-5 секунд)
        const duration = Math.random() * (5000 - 3000) + 3000; 

        // Применяем CSS анимацию
        canvas.style.transition = `transform ${duration / 1000}s cubic-bezier(0.25, 0.1, 0.25, 1)`; // Более плавная остановка
        canvas.style.transform = `rotate(${totalRotationDeg}deg)`;

        // Когда анимация закончится
        setTimeout(() => {
            isSpinning = false;
            spinButton.disabled = false;
            
            winnerTitleDisplay.textContent = 'ПОБЕДИТЕЛЬ!';
            winnerInfoDisplay.textContent = `${winningIndex + 1}. ${players[winningIndex]}`;
            
            // Сброс CSS, чтобы следующее вращение начиналось с правильной позиции
            canvas.style.transition = 'none';
            // Вычисляем остаток от деления на 360, чтобы сохранить позицию рулетки
            const currentRotation = totalRotationDeg % 360; 
            canvas.style.transform = `rotate(${currentRotation}deg)`; 

        }, duration + 50); // Небольшая задержка после завершения анимации
    }

    // --- Обработчики событий ---
    addButton.addEventListener('click', addPlayer);
    playerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addPlayer();
        }
    });
    resetButton.addEventListener('click', resetAll);
    spinButton.addEventListener('click', spinWheel);

    // Инициализация - добавим нескольких игроков по умолчанию
    players = ['Иван', 'Мария', 'Петр', 'Анна']; 
    renderPlayers();
    drawWheel();
});
