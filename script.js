let timeLeft;
let timerId = null;
let isWorkTime = true;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const modeText = document.getElementById('mode-text');
const progressBar = document.getElementById('progress-bar');
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTask');
const tasksList = document.getElementById('tasks');

let WORK_TIME = 25 * 60; // 25 minutes in seconds
let BREAK_TIME = 5 * 60; // 5 minutes in seconds

const workEndSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
const breakEndSound = new Audio('https://actions.google.com/sounds/v1/alarms/gentle_bell.ogg');

const workTimeInput = document.getElementById('workTime');
const breakTimeInput = document.getElementById('breakTime');
const saveSettingsButton = document.getElementById('saveSettings');

function requestNotificationPermission() {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    updateProgressBar();
}

function switchMode() {
    isWorkTime = !isWorkTime;
    timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
    modeText.textContent = isWorkTime ? 'Work Time' : 'Break Time';
    
    if (Notification.permission === 'granted') {
        new Notification(isWorkTime ? 'Break is over!' : 'Time for a break!', {
            body: isWorkTime ? 'Back to work!' : 'Take a short break.',
            icon: '/path/to/icon.png'
        });
    }
    updateDisplay();
}

function startTimer() {
    if (timerId === null) {
        if (timeLeft === undefined) {
            timeLeft = WORK_TIME;
        }
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                timerId = null;
                switchMode();
                startTimer();
            }
        }, 1000);
        startButton.disabled = true;
    }
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
    startButton.disabled = false;
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isWorkTime = true;
    timeLeft = WORK_TIME;
    modeText.textContent = 'Work Time';
    updateDisplay();
    startButton.disabled = false;
}

function updateProgressBar() {
    const totalTime = isWorkTime ? WORK_TIME : BREAK_TIME;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    progressBar.style.width = `${progress}%`;
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const li = document.createElement('li');
    li.innerHTML = `
        <span>${taskText}</span>
        <button class="delete-task">✕</button>
        <button class="complete-task">✓</button>
    `;

    // Add delete functionality
    li.querySelector('.delete-task').addEventListener('click', () => {
        li.remove();
    });

    // Add complete functionality
    li.querySelector('.complete-task').addEventListener('click', () => {
        li.classList.toggle('completed');
    });

    tasksList.appendChild(li);
    taskInput.value = '';
}

function saveSettings() {
    const newWorkTime = parseInt(workTimeInput.value);
    const newBreakTime = parseInt(breakTimeInput.value);
    
    if (newWorkTime > 0 && newBreakTime > 0) {
        WORK_TIME = newWorkTime * 60;
        BREAK_TIME = newBreakTime * 60;
        // Update the current timeLeft if we're in work mode
        if (isWorkTime) {
            timeLeft = WORK_TIME;
        }
        resetTimer();
        // Update the display to show new time
        updateDisplay();
    }
}

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Initialize the display
resetTimer();

// Call this when the page loads
requestNotificationPermission();

// Add this event listener
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (timerId === null) {
            startTimer();
        } else {
            pauseTimer();
        }
    } else if (e.code === 'KeyR') {
        resetTimer();
    }
});

saveSettingsButton.addEventListener('click', saveSettings);

async function fetchBitcoinPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        
        const price = data.bitcoin.usd;
        const change = data.bitcoin.usd_24h_change;
        
        // Update price display
        const priceElement = document.getElementById('btc-price');
        const changeElement = document.getElementById('btc-change');
        
        priceElement.textContent = `$${price.toLocaleString()}`;
        changeElement.textContent = `${change.toFixed(2)}%`;
        
        // Add color based on price change
        changeElement.className = 'price-change ' + (change >= 0 ? 'positive' : 'negative');
        
    } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
    }
}

// Fetch initial price
fetchBitcoinPrice();

// Update price every minute
setInterval(fetchBitcoinPrice, 60000); 