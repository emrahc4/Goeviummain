

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  mobileNavToggleBtn.addEventListener('click', mobileNavToogle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('loaded');
      }, 1000);
      setTimeout(() => {
        preloader.remove();
      }, 2000);
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  

})();
document.addEventListener('DOMContentLoaded', loadTasks); // Sayfa yüklendiğinde görevleri yükle

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const taskText = taskInput.value.trim();
  if (taskText === '') return;

  const task = {
    text: taskText,
    completed: false,
  };

  let tasks = getTasksFromStorage();
  tasks.push(task);
  saveTasksToStorage(tasks);

  renderTasks();
  taskInput.value = ''; // Input kutusunu temizle
}

function getTasksFromStorage() {
  let tasks = localStorage.getItem('tasks');
  return tasks ? JSON.parse(tasks) : [];
}

function saveTasksToStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  const tasks = getTasksFromStorage();
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = ''; // Listeyi temizle

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `list-group-item d-flex justify-content-between align-items-center ${task.completed ? 'completed' : 'pending'}`;

    li.innerHTML = `
      <span onclick="toggleCompletion(${index})">${task.text}</span>
      <div>
        <button onclick="editTask(${index})" class="btn btn-sm btn-info">Düzenle</button>
        <button onclick="deleteTask(${index})" class="btn btn-sm btn-danger">Sil</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function toggleCompletion(index) {
  let tasks = getTasksFromStorage();
  tasks[index].completed = !tasks[index].completed;
  saveTasksToStorage(tasks);
  renderTasks();
}

function editTask(index) {
  const tasks = getTasksFromStorage();
  const newText = prompt('Yeni görev ismi:', tasks[index].text);
  if (newText) {
    tasks[index].text = newText;
    saveTasksToStorage(tasks);
    renderTasks();
  }
}

function deleteTask(index) {
  let tasks = getTasksFromStorage();
  tasks.splice(index, 1); // Görevi sil
  saveTasksToStorage(tasks);
  renderTasks();
}

function filterTasks(status) {
  const tasks = getTasksFromStorage();
  const filteredTasks = tasks.filter(task => {
    if (status === 'all') return true;
    if (status === 'completed') return task.completed;
    if (status === 'pending') return !task.completed;
  });

  const taskList = document.getElementById('taskList');
  taskList.innerHTML = ''; // Listeyi temizle

  filteredTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `list-group-item d-flex justify-content-between align-items-center ${task.completed ? 'completed' : 'pending'}`;
    li.innerHTML = `
      <span onclick="toggleCompletion(${index})">${task.text}</span>
      <div>
        <button onclick="editTask(${index})" class="btn btn-sm btn-info">Düzenle</button>
        <button onclick="deleteTask(${index})" class="btn btn-sm btn-danger">Sil</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function loadTasks() {
  renderTasks(); // Sayfa yüklendiğinde görevleri görüntüle
}
// İmleç hareket ettikçe cursor elementini takip etsin
const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', (e) => {
  const x = e.clientX;
  const y = e.clientY;

  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
});

// Tarihi formatla
function getCurrentDate() {
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return today.toLocaleDateString('tr-TR', options); // Türkçe tarih formatı
}

document.addEventListener('DOMContentLoaded', () => {
    // Pomodoro Timer Ayarları
    const POMODORO_WORK_TIME = 25 * 60; // 25 dakika
    const POMODORO_SHORT_BREAK_TIME = 5 * 60; // 5 dakika
    const POMODORO_LONG_BREAK_TIME = 15 * 60; // 15 dakika

    let pomodoroCurrentTime = POMODORO_WORK_TIME;
    let pomodoroInterval;
    let pomodoroState = 'work'; // 'work', 'shortBreak', 'longBreak'
    let pomodoroCycles = 0; // Uzun mola için döngü sayacı

    // Custom Timer Ayarları
    let customMinutesInput = document.getElementById('customMinutes');
    let customCurrentTime = parseInt(customMinutesInput.value) * 60;
    let customInterval;

    // Element Referansları
    const pomodoroTimerDisplay = document.getElementById('timer');
    const pomodoroStatusDisplay = document.getElementById('status');
    const pomodoroProgressBar = document.getElementById('progressBar');
    const pomodoroProgressText = document.getElementById('progressText');

    const customTimerDisplay = document.getElementById('customTimer');
    const customProgressBar = document.getElementById('customProgressBar');
    const customProgressText = document.getElementById('customProgressText');

    // Butonlar
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    const shortBreakButton = document.getElementById('shortBreakButton');
    const longBreakButton = document.getElementById('longBreakButton');

    const customStartButton = document.getElementById('customStartButton');
    const customPauseButton = document.getElementById('customPauseButton');
    const customResetButton = document.getElementById('customResetButton');

    // Ses Efekti (İsteğe bağlı)
    const audio = new Audio('assets/audio/bell.mp3'); // Zil sesi için bir ses dosyası ekleyebilirsiniz

    // --- Genel Yardımcı Fonksiyonlar ---

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function updateDisplay(displayElement, timeInSeconds) {
        displayElement.textContent = formatTime(timeInSeconds);
    }

    function updateProgressBar(progressBarElement, progressTextElement, totalSeconds, currentSeconds) {
        const elapsedSeconds = totalSeconds - currentSeconds;
        const percentage = (elapsedSeconds / totalSeconds) * 100;

        progressBarElement.style.setProperty('--progress', percentage.toFixed(2));
        progressTextElement.textContent = `${Math.round(percentage)}%`;
    }

    function toggleButtons(startBtn, pauseBtn, resetBtn, disableStart = false, disablePause = false, disableReset = false) {
        if (startBtn) startBtn.disabled = disableStart;
        if (pauseBtn) pauseBtn.disabled = disablePause;
        if (resetBtn) resetBtn.disabled = disableReset;
    }

    // --- Pomodoro Zamanlayıcı Mantığı ---

    function startPomodoro() {
        clearInterval(pomodoroInterval); // Önceki aralığı temizle
        toggleButtons(startButton, pauseButton, resetButton, true, false, false); // Başlat devre dışı, Duraklat/Sıfırla aktif

        pomodoroInterval = setInterval(() => {
            pomodoroCurrentTime--;
            updateDisplay(pomodoroTimerDisplay, pomodoroCurrentTime);
            
            // İlerleme çubuğunu güncelle
            let totalTimeForCurrentState;
            if (pomodoroState === 'work') totalTimeForCurrentState = POMODORO_WORK_TIME;
            else if (pomodoroState === 'shortBreak') totalTimeForCurrentState = POMODORO_SHORT_BREAK_TIME;
            else if (pomodoroState === 'longBreak') totalTimeForCurrentState = POMODORO_LONG_BREAK_TIME;
            
            updateProgressBar(pomodoroProgressBar, pomodoroProgressText, totalTimeForCurrentState, pomodoroCurrentTime);

            if (pomodoroCurrentTime <= 0) {
                clearInterval(pomodoroInterval);
                audio.play(); // Süre bitiminde ses çal
                handlePomodoroCompletion();
            }
        }, 1000);
    }

    function pausePomodoro() {
        clearInterval(pomodoroInterval);
        toggleButtons(startButton, pauseButton, resetButton, false, true, false); // Başlat aktif, Duraklat devre dışı
    }

    function resetPomodoro() {
        clearInterval(pomodoroInterval);
        pomodoroState = 'work';
        pomodoroCurrentTime = POMODORO_WORK_TIME;
        pomodoroCycles = 0; // Döngüleri sıfırla
        updateDisplay(pomodoroTimerDisplay, pomodoroCurrentTime);
        pomodoroStatusDisplay.textContent = 'Çalışma Süresi';
        updateProgressBar(pomodoroProgressBar, pomodoroProgressText, POMODORO_WORK_TIME, pomodoroCurrentTime);
        toggleButtons(startButton, pauseButton, resetButton, false, true, true); // Başlat aktif, Duraklat/Sıfırla devre dışı
    }

    function handlePomodoroCompletion() {
        if (pomodoroState === 'work') {
            pomodoroCycles++;
            if (pomodoroCycles % 4 === 0) {
                setPomodoroState('longBreak');
            } else {
                setPomodoroState('shortBreak');
            }
        } else { // Mola bitti
            setPomodoroState('work');
        }
        startPomodoro(); // Yeni durumu başlat
    }

    function setPomodoroState(newState) {
        pomodoroState = newState;
        if (newState === 'work') {
            pomodoroCurrentTime = POMODORO_WORK_TIME;
            pomodoroStatusDisplay.textContent = 'Çalışma Süresi';
        } else if (newState === 'shortBreak') {
            pomodoroCurrentTime = POMODORO_SHORT_BREAK_TIME;
            pomodoroStatusDisplay.textContent = 'Kısa Mola Süresi';
        } else if (newState === 'longBreak') {
            pomodoroCurrentTime = POMODORO_LONG_BREAK_TIME;
            pomodoroStatusDisplay.textContent = 'Uzun Mola Süresi';
        }
        updateDisplay(pomodoroTimerDisplay, pomodoroCurrentTime);
        updateProgressBar(pomodoroProgressBar, pomodoroProgressText, pomodoroCurrentTime, pomodoroCurrentTime); // Yeni duruma göre progress bar'ı sıfırla
    }

    // --- Custom Timer Mantığı ---

    function startCustomTimer() {
        clearInterval(customInterval);
        toggleButtons(customStartButton, customPauseButton, customResetButton, true, false, false); // Başlat devre dışı

        // Input değeri boşsa veya geçersizse varsayılan değere ayarla
        const minutes = parseInt(customMinutesInput.value);
        if (isNaN(minutes) || minutes < 1) {
            customMinutesInput.value = 25; // Varsayılan değer
            customCurrentTime = 25 * 60;
        } else {
            customCurrentTime = minutes * 60;
        }

        // Eğer zamanlayıcı daha önce çalışmıyorsa, ilk başlangıçta zamanı ayarla
        if (customTimerDisplay.textContent === '00:00' || customCurrentTime === 0) {
            customTimerDisplay.textContent = formatTime(customCurrentTime);
        }

        // Güncel zamanı toplam zaman olarak ayarla, çünkü başlangıçta her zaman tam süreden başlarız
        let totalTimeForCustomTimer = parseInt(customMinutesInput.value) * 60;
        updateProgressBar(customProgressBar, customProgressText, totalTimeForCustomTimer, customCurrentTime);

        customInterval = setInterval(() => {
            customCurrentTime--;
            updateDisplay(customTimerDisplay, customCurrentTime);
            updateProgressBar(customProgressBar, customProgressText, totalTimeForCustomTimer, customCurrentTime);

            if (customCurrentTime <= 0) {
                clearInterval(customInterval);
                audio.play(); // Süre bitiminde ses çal
                resetCustomTimer(); // Bitince sıfırla
                alert('Özel Zamanlayıcı bitti!');
            }
        }, 1000);
    }

    function pauseCustomTimer() {
        clearInterval(customInterval);
        toggleButtons(customStartButton, customPauseButton, customResetButton, false, true, false); // Başlat aktif
    }

    function resetCustomTimer() {
        clearInterval(customInterval);
        const initialCustomTime = parseInt(customMinutesInput.value) * 60;
        customCurrentTime = initialCustomTime;
        updateDisplay(customTimerDisplay, customCurrentTime);
        updateProgressBar(customProgressBar, customProgressText, initialCustomTime, customCurrentTime);
        toggleButtons(customStartButton, customPauseButton, customResetButton, false, true, true); // Başlat aktif
    }

    // --- Olay Dinleyicileri ---

    startButton.addEventListener('click', startPomodoro);
    pauseButton.addEventListener('click', pausePomodoro);
    resetButton.addEventListener('click', resetPomodoro);
    shortBreakButton.addEventListener('click', () => setPomodoroState('shortBreak'));
    longBreakButton.addEventListener('click', () => setPomodoroState('longBreak'));

    customStartButton.addEventListener('click', startCustomTimer);
    customPauseButton.addEventListener('click', pauseCustomTimer);
    customResetButton.addEventListener('click', resetCustomTimer);

    // Özel dakika girişi değiştiğinde zamanlayıcıyı sıfırla ve güncelle
    customMinutesInput.addEventListener('change', () => {
        const newTime = parseInt(customMinutesInput.value);
        if (!isNaN(newTime) && newTime > 0) {
            customCurrentTime = newTime * 60;
        } else {
            customMinutesInput.value = 1; // Geçersiz girişte min 1 dakika
            customCurrentTime = 1 * 60;
        }
        resetCustomTimer(); // Yeni değere göre sıfırla
    });

    // Sayfa yüklendiğinde ilk durumu ayarla
    updateDisplay(pomodoroTimerDisplay, pomodoroCurrentTime);
    updateProgressBar(pomodoroProgressBar, pomodoroProgressText, POMODORO_WORK_TIME, pomodoroCurrentTime);
    toggleButtons(startButton, pauseButton, resetButton, false, true, true); // Başlangıçta Duraklat/Sıfırla devre dışı

    updateDisplay(customTimerDisplay, customCurrentTime);
    updateProgressBar(customProgressBar, customProgressText, customCurrentTime, customCurrentTime);
    toggleButtons(customStartButton, customPauseButton, customResetButton, false, true, true); // Başlangıçta Duraklat/Sıfırla devre dışı
});