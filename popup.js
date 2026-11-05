document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. KHAI BÁO CÁC PHẦN TỬ DOM (GIAO DIỆN)
    // ==========================================
    // Dark Mode
    const darkModeToggle = document.getElementById("darkModeToggle");
    
    // Toggles Shorts/Reels/Strict
    const ytToggle = document.getElementById("ytToggle");
    const fbToggle = document.getElementById("fbToggle");
    const igToggle = document.getElementById("igToggle");
    const superStrictToggle = document.getElementById("superStrictToggle");
    
    // Khóa Trang Web
    const siteInput = document.getElementById("siteInput");
    const addSiteBtn = document.getElementById("addSiteBtn");
    const blockedList = document.getElementById("blockedList");
    
    // Khóa Game
    const gameInput = document.getElementById("gameInput");
    const addGameBtn = document.getElementById("addGameBtn");
    const blockedGamesList = document.getElementById("blockedGamesList");
    
    // Pomodoro & Session
    const toggleTimerBtn = document.getElementById("toggleTimerBtn");
    const timerDisplay = document.getElementById("timerDisplay");
    const pomodoroSettings = document.getElementById("pomodoroSettings");
    const workMinutesInput = document.getElementById("workMinutes");
    const breakMinutesInput = document.getElementById("breakMinutes");
    const timerPhase = document.getElementById("timerPhase");
    const sessionCountDisplay = document.getElementById("sessionCount"); // Biến mới cho Session
    
    let timerInterval;

    // ==========================================
    // 2. KHỞI TẠO TẢI DỮ LIỆU TỪ STORAGE
    // ==========================================
    chrome.storage.local.get({
        isDarkMode: false,
        toggles: { yt: true, fb: true, ig: true },
        superStrict: false,
        blockedSites: [],
        targetGames: [],
        isPomodoroRunning: false,
        isBreakRunning: false,
        pomodoroEndTime: 0,
        breakMinutes: 5,
        sessionCount: 0 // Tải giá trị session
    }, (data) => {
        // Tải trạng thái Dark Mode
        if (data.isDarkMode) {
            document.body.classList.add("dark-mode");
            darkModeToggle.textContent = "☀️";
        } else {
            darkModeToggle.textContent = "🌙";
        }

        // Tải trạng thái Toggles
        ytToggle.checked = data.toggles.yt;
        fbToggle.checked = data.toggles.fb;
        igToggle.checked = data.toggles.ig;
        superStrictToggle.checked = data.superStrict;

        // Render Danh sách Web và Game
        renderBlockedSites(data.blockedSites);
        renderBlockedGames(data.targetGames);

        // Tải trạng thái Pomodoro & Session
        breakMinutesInput.value = data.breakMinutes;
        sessionCountDisplay.textContent = data.sessionCount; // Cập nhật số hiệp lên UI
        
        if (data.isPomodoroRunning) {
            startTimerDisplay(data.pomodoroEndTime, "work");
        } else if (data.isBreakRunning) {
            startTimerDisplay(data.pomodoroEndTime, "break");
        } else {
            resetTimerDisplay(workMinutesInput.value);
        }
    });

    // ==========================================
    // 3. LOGIC CHẾ ĐỘ TỐI (DARK MODE)
    // ==========================================
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        darkModeToggle.textContent = isDark ? "☀️" : "🌙";
        chrome.storage.local.set({ isDarkMode: isDark });
    });

    // ==========================================
    // 4. LOGIC LƯU TOGGLES BẬT/TẮT
    // ==========================================
    const saveToggles = () => {
        chrome.storage.local.set({
            toggles: {
                yt: ytToggle.checked,
                fb: fbToggle.checked,
                ig: igToggle.checked
            },
            superStrict: superStrictToggle.checked
        });
    };
    ytToggle.addEventListener("change", saveToggles);
    fbToggle.addEventListener("change", saveToggles);
    igToggle.addEventListener("change", saveToggles);
    superStrictToggle.addEventListener("change", saveToggles);

    // ==========================================
    // 5. LOGIC KHÓA TRANG WEB
    // ==========================================
    addSiteBtn.addEventListener("click", () => {
        let rawSite = siteInput.value.trim().toLowerCase();
        if (rawSite) {
            // Tiền xử lý URL: Xóa http://, https://, www. và các đường dẫn con phía sau
            let site = rawSite.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
            
            chrome.storage.local.get({ blockedSites: [] }, (data) => {
                if (!data.blockedSites.includes(site) && site !== "") {
                    const newList = [...data.blockedSites, site];
                    chrome.storage.local.set({ blockedSites: newList }, () => {
                        renderBlockedSites(newList);
                        siteInput.value = "";
                    });
                }
            });
        }
    });

    function renderBlockedSites(sites) {
        blockedList.innerHTML = "";
        sites.forEach((site, index) => {
            const li = document.createElement("li");
            li.textContent = site;
            const delBtn = document.createElement("button");
            delBtn.textContent = "Xóa";
            delBtn.className = "delete-btn";
            delBtn.onclick = () => removeSite(index);
            li.appendChild(delBtn);
            blockedList.appendChild(li);
        });
    }

    function removeSite(index) {
        chrome.storage.local.get({ blockedSites: [] }, (data) => {
            const newList = data.blockedSites;
            newList.splice(index, 1);
            chrome.storage.local.set({ blockedSites: newList }, () => {
                renderBlockedSites(newList);
            });
        });
    }

    // ==========================================
    // 6. LOGIC CHẶN GAME (PC)
    // ==========================================
    addGameBtn.addEventListener("click", () => {
        let game = gameInput.value.trim().toLowerCase();
        if (game) {
            if (!game.endsWith('.exe')) game += '.exe'; // Tự thêm đuôi .exe
            chrome.storage.local.get({ targetGames: [] }, (data) => {
                if (!data.targetGames.includes(game)) {
                    const newList = [...data.targetGames, game];
                    chrome.storage.local.set({ targetGames: newList }, () => {
                        renderBlockedGames(newList);
                        gameInput.value = "";
                    });
                }
            });
        }
    });

    function renderBlockedGames(games) {
        blockedGamesList.innerHTML = "";
        games.forEach((game, index) => {
            const li = document.createElement("li");
            li.textContent = game;
            const delBtn = document.createElement("button");
            delBtn.textContent = "Xóa";
            delBtn.className = "delete-btn";
            delBtn.onclick = () => removeGame(index);
            li.appendChild(delBtn);
            blockedGamesList.appendChild(li);
        });
    }

    function removeGame(index) {
        chrome.storage.local.get({ targetGames: [] }, (data) => {
            const newList = data.targetGames;
            newList.splice(index, 1);
            chrome.storage.local.set({ targetGames: newList }, () => {
                renderBlockedGames(newList);
            });
        });
    }

    // ==========================================
    // 7. LOGIC POMODORO LẶP VÔ HẠN VÀ SESSION
    // ==========================================
    toggleTimerBtn.addEventListener("click", () => {
        chrome.storage.local.get(['isPomodoroRunning', 'isBreakRunning'], (data) => {
            // Nếu đang chạy 1 trong 2 chế độ -> Hủy/Dừng toàn bộ
            if (data.isPomodoroRunning || data.isBreakRunning) {
                chrome.runtime.sendMessage({ action: "stopTimer" });
                resetTimerDisplay(workMinutesInput.value);
            } 
            // Nếu đang tắt -> Khởi động chuỗi mới
            else {
                const wMin = parseFloat(workMinutesInput.value);
                const bMin = parseFloat(breakMinutesInput.value);
                if (wMin > 0 && bMin > 0) {
                    chrome.runtime.sendMessage({ action: "startTimer", workMinutes: wMin, breakMinutes: bMin });
                    sessionCountDisplay.textContent = "0"; // Trả session về 0 trên UI
                    startTimerDisplay(Date.now() + wMin * 60 * 1000, "work");
                }
            }
        });
    });

    function startTimerDisplay(endTime, phase) {
        pomodoroSettings.style.display = "none";
        
        if (phase === "work") {
            timerPhase.textContent = "🔥 ĐANG TẬP TRUNG";
            timerPhase.className = "timer-phase phase-work";
            toggleTimerBtn.textContent = "Dừng tập trung 🛑";
            toggleTimerBtn.className = "btn pomodoro-btn active";
        } else {
            timerPhase.textContent = "☕ ĐANG NGHỈ NGƠI";
            timerPhase.className = "timer-phase phase-break";
            toggleTimerBtn.textContent = "Bỏ qua & Dừng chuỗi 🛑";
            toggleTimerBtn.className = "btn pomodoro-btn break-active";
        }

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            const remaining = endTime - Date.now();
            if (remaining <= 0) {
                clearInterval(timerInterval);
            } else {
                const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((remaining % (1000 * 60)) / 1000);
                timerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    function resetTimerDisplay(minutes) {
        clearInterval(timerInterval);
        pomodoroSettings.style.display = "block";
        timerPhase.textContent = "🍅 POMODORO";
        timerPhase.className = "timer-phase phase-idle";
        toggleTimerBtn.textContent = "Bắt đầu tập trung";
        toggleTimerBtn.className = "btn pomodoro-btn";
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:00`;
        sessionCountDisplay.textContent = "0"; // Reset khi người dùng chủ động tắt
    }

    // Lắng nghe sự kiện để cập nhật Giao diện (Phase và Session) khi mở popup
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            // Cập nhật số đếm session ngay lập tức nếu thay đổi
            if (changes.sessionCount) {
                sessionCountDisplay.textContent = changes.sessionCount.newValue;
            }

            // Chuyển sang Giờ nghỉ
            if (changes.isBreakRunning && changes.isBreakRunning.newValue === true) {
                chrome.storage.local.get(['pomodoroEndTime'], (data) => {
                    startTimerDisplay(data.pomodoroEndTime, "break");
                });
            } 
            // Chuyển lại sang Giờ Học
            else if (changes.isPomodoroRunning && changes.isPomodoroRunning.newValue === true) {
                chrome.storage.local.get(['pomodoroEndTime'], (data) => {
                    startTimerDisplay(data.pomodoroEndTime, "work");
                });
            }
            // Tắt hoàn toàn
            else if (changes.isBreakRunning && changes.isBreakRunning.newValue === false && changes.isPomodoroRunning?.newValue !== true) {
                resetTimerDisplay(workMinutesInput.value);
            }
        }
    });
});