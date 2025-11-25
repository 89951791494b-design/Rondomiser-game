document.addEventListener('DOMContentLoaded', () => {
    const playerInput = document.getElementById('playerInput');
    const addButton = document.getElementById('addButton');
    const playerList = document.getElementById('playerList');
    const resetButton = document.getElementById('resetButton');
    const spinButton = document.getElementById('spinButton');
    const winnerNameDisplay = document.getElementById('winnerName');
    const winnerTitleDisplay = document.getElementById('winnerTitle');
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    
    let players = [];
    let isSpinning = false;
    
    // Цветовая палитра для секторов
    const colors = ['#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#e74c3c', '#1abc9c', '#f1c40f', '#e67e22'];

    /**
     * @brief Добавляет игрока в список.
     */
    function addPlayer() {
        const name = playerInput.value.trim();
        if (name && players.length < 100) { // Ограничение на количество игроков
            players.push(name);
            playerInput.value = ''; // Очищаем поле ввода
            renderPlayers();
            drawWheel();
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
            winnerNameDisplay.textContent = 'Победитель';
            winnerTitleDisplay.textContent = 'Нажмите "Крутить"';
        }
    }

    /**
     * @brief Рендерит список игроков на экране.
     */
    function renderPlayers() {
        playerList.innerHTML = '';
        players.forEach((player, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'player-item';
            listItem.innerHTML = `
                <span>${player}</span>
                <button class="delete-button" data-index="${index}">×</button>
            `;
            playerList.appendChild(listItem);
        });

        // Добавляем обработчики для кнопок удаления
        playerList.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                deletePlayer(index);
            });
        });
        
        // Управление доступностью кнопки "Крутить"
        spinButton.disabled = players.length < 2;
    }

    /**
     * @brief Рисует рулетку на Canvas.
     */
    function drawWheel() {
        const numSegments = players.length;
        const arcSize = 2 * Math.PI / numSegments;
        const radius = canvas.width / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (numSegments === 0) {
            // Рисуем пустой круг, если нет игроков
            ctx.beginPath();
            ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#ecf0f1';
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#bdc3c7';
            ctx.stroke();
            return;
        }

        // Рисуем секторы
        for (let i = 0; i < numSegments; i++) {
            const startAngle = i * arcSize;
            const endAngle = (i + 1) * arcSize;
            
            ctx.beginPath();
            ctx.arc(radius, radius, radius, startAngle, endAngle);
            ctx.lineTo(radius, radius);
            ctx.closePath();
            
            // Заливка цветом
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            
            // Обводка
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#fff';
            ctx.stroke();

            // Текст (имя игрока)
            ctx.save();
            ctx.translate(radius, radius);
            // Поворот, чтобы текст был направлен от центра
            ctx.rotate(startAngle + arcSize / 2 + Math.PI / 2); 
            
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(players[i], radius * 0.9, 5); // Смещение для размещения текста
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
        winnerNameDisplay.textContent = '...';
        winnerTitleDisplay.textContent = 'Крутится!';

        // Определяем случайное количество оборотов (3-5 секунд)
        // 1000-1500 градусов (2.7 - 4 полных оборота) + случайный сектор
        const minRotation = 1080; // 3 полных оборота
        const maxRotation = 1800; // 5 полных оборотов
        
        // Выбираем случайный выигрышный индекс
        const winningIndex = Math.floor(Math.random() * players.length);
        
        // Угол, под которым должен остановиться выигрышный сектор (вверху, под стрелкой)
        const arcSize = 2 * Math.PI / players.length;
        // Указатель находится на 270 градусов (-90), сектор должен повернуться так, чтобы его середина была там.
        // Нужно компенсировать угол: 270 градусов - (startAngle + arcSize/2)
        const segmentCenterAngle = winningIndex * arcSize + arcSize / 2; // Угол центра выигрышного сектора от 0
        const degreesToTarget = 270 - (segmentCenterAngle * 180 / Math.PI); // Угол в градусах

        // Добавляем случайные обороты
        const totalRotation = Math.floor(Math.random() * (maxRotation - minRotation + 1)) + minRotation + degreesToTarget;
        
        // Длительность анимации (3-5 секунд)
        const duration = Math.random() * (5000 - 3000) + 3000; 

        // Применяем CSS анимацию
        canvas.style.transition = `transform ${duration / 1000}s ease-out`;
        canvas.style.transform = `rotate(${totalRotation}deg)`;

        // Когда анимация закончится
        setTimeout(() => {
            isSpinning = false;
            spinButton.disabled = false;
            
            // Отображаем победителя
            const winner = players[winningIndex];
            winnerNameDisplay.textContent = winner;
            winnerTitleDisplay.textContent = 'ПОБЕДИТЕЛЬ!';
            
            // Сброс CSS, чтобы следующее вращение начиналось с правильной позиции
            canvas.style.transition = 'none';
            // Вычисляем остаток от деления на 360, чтобы сохранить позицию рулетки
            const currentRotation = totalRotation % 360; 
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

    // Инициализация
    // Добавим двух игроков по умолчанию, чтобы рулетка сразу рисовалась
    players = ['Игрок 1', 'Игрок 2']; 
    renderPlayers();
    drawWheel();
});
