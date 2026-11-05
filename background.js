let nativePort = null;

function connectToNativeHost() {
    nativePort = chrome.runtime.connectNative('com.focusmode.killer');
    nativePort.onDisconnect.addListener(() => { nativePort = null; });
}

// Hàm khởi tạo đếm ngược
function startTimer(type, minutes) {
    const endTime = Date.now() + minutes * 60 * 1000;
    
    if (type === "work") {
        chrome.storage.local.set({ 
            isPomodoroRunning: true, 
            isBreakRunning: false,
            pomodoroEndTime: endTime 
        });
        chrome.alarms.create("pomodoroTimer", { delayInMinutes: minutes });
        
        // Bắt đầu quét game bằng Python
        if (!nativePort) connectToNativeHost();
        chrome.storage.local.get({ targetGames: [] }, (data) => {
            nativePort.postMessage({ action: "start", games: data.targetGames });
        });
    } 
    else if (type === "break") {
        if (nativePort) nativePort.postMessage({ action: "stop" });
        chrome.storage.local.set({ 
            isPomodoroRunning: false, 
            isBreakRunning: true,
            pomodoroEndTime: endTime 
        });
        chrome.alarms.create("breakTimer", { delayInMinutes: minutes });
    }
}

chrome.alarms.onAlarm.addListener((alarm) => {
    chrome.storage.local.get(['workMinutes', 'breakMinutes', 'sessionCount'], (data) => {
        const wMin = parseFloat(data.workMinutes) || 25;
        const bMin = parseFloat(data.breakMinutes) || 5;
        let count = data.sessionCount || 0;

        // KHI HẾT GIỜ TẬP TRUNG -> CHUYỂN SANG GIỜ NGHỈ
        if (alarm.name === "pomodoroTimer") {
            // Cộng 1 hiệp khi hoàn thành 1 chu kỳ học
            count += 1;
            chrome.storage.local.set({ sessionCount: count });
            
            startTimer("break", bMin);
            
            chrome.notifications.create({
                type: "basic", iconUrl: "icon128.png", priority: 2,
                title: "🍅 Hoàn thành hiệp " + count + "!",
                message: `Tuyệt vời! Đã mở khóa. Hãy nghỉ ngơi ${bMin} phút nhé!`
            });
        } 
        // KHI HẾT GIỜ NGHỈ NGƠI -> TỰ ĐỘNG QUAY LẠI TẬP TRUNG
        else if (alarm.name === "breakTimer") {
            startTimer("work", wMin);
            
            chrome.notifications.create({
                type: "basic", iconUrl: "icon128.png", priority: 2,
                title: "☕ Hết giờ nghỉ ngơi!",
                message: `Hiệp ${count + 1} bắt đầu. Kỷ luật thép đã được bật lại!`
            });
        }
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startTimer") {
        // Lưu cấu hình và reset session về 0 khi bắt đầu chuỗi mới
        chrome.storage.local.set({ 
            workMinutes: request.workMinutes,
            breakMinutes: request.breakMinutes,
            sessionCount: 0 
        });
        startTimer("work", request.workMinutes);

    } else if (request.action === "stopTimer") {
        chrome.storage.local.set({ 
            isPomodoroRunning: false, 
            isBreakRunning: false, 
            pomodoroEndTime: 0,
            sessionCount: 0 // Xóa session khi dừng
        });
        chrome.alarms.clear("pomodoroTimer");
        chrome.alarms.clear("breakTimer");
        if (nativePort) nativePort.postMessage({ action: "stop" });
    }
});