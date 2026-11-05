// ==========================================
// 1. BIẾN TOÀN CỤC & TRẠNG THÁI
// ==========================================
let globalData = {
    toggles: { yt: true, fb: true, ig: true },
    blockedSites: [],
    superStrict: false,
    isPomodoroRunning: false,
    isBreakRunning: false
};

const currentDomain = window.location.hostname;
let isBlockedScreenRendered = false;

// ==========================================
// 2. HỆ THỐNG KHÓA WEB & KỶ LUẬT THÉP (ĐÃ NÂNG CẤP)
// ==========================================
const enforceRules = () => {
    const currentUrl = window.location.href;
    const isFB = currentDomain.includes("facebook.com");
    const isIG = currentDomain.includes("instagram.com");

    // A. KHÓA TRANG WEB
    const isBlockedSite = globalData.blockedSites.some(site => currentDomain.includes(site));
    
    if (isBlockedSite && !globalData.isBreakRunning) {
        
        // SÁT THỦ ÂM THANH: Tìm và bóp cổ mọi video/audio của TikTok, YouTube ngay lập tức
        document.querySelectorAll('video, audio, iframe').forEach(media => {
            if (media.pause) media.pause();
            media.muted = true;
            media.removeAttribute('src'); 
            media.remove(); // Xóa sổ khỏi trang
        });

        // SÁT THỦ GIAO DIỆN: Chống Canva nhét chữ rác
        // Nếu màn hình khóa chưa được vẽ, HOẶC Canva vừa ghi đè lại thẻ body
        if (!isBlockedScreenRendered || !document.getElementById("focus-blocked-screen")) {
            window.stop(); 
            
            // Cày nát toàn bộ DOM hiện tại
            document.documentElement.innerHTML = ''; 
            
            // Bơm CSS độc quyền để vô hiệu hóa mọi nỗ lực hồi sinh của web
            const style = document.createElement('style');
            style.textContent = `
                /* Giấu mọi thẻ body lạ mà web cố sinh ra */
                body:not(#focus-blocked-screen) { display: none !important; opacity: 0 !important; }
                html { background: #18191A !important; }
            `;
            document.documentElement.appendChild(style);

            // Tái tạo lại một thân xác (body) mới hoàn toàn không thể bị xâm phạm
            const newBody = document.createElement('body');
            newBody.id = 'focus-blocked-screen';
            newBody.style.cssText = "display:flex !important; flex-direction:column !important; justify-content:center !important; align-items:center !important; height:100vh !important; width:100vw !important; background:#18191A !important; color:#ff4757 !important; font-family:sans-serif !important; margin:0 !important; overflow:hidden !important; z-index:2147483647 !important; position:fixed !important; top:0 !important; left:0 !important;";
            newBody.innerHTML = `
                <div style="font-size: 5rem; margin-bottom: 20px;">🛑</div>
                <div style="font-weight: bold; text-align:center; font-size:2.5rem;">TRANG WEB ĐÃ BỊ KHÓA</div>
                <div style="color: #aaa; font-size: 1.2rem; margin-top: 15px; text-align:center;">Hãy quay lại làm việc đi!</div>
            `;
            document.documentElement.appendChild(newBody);
            
            isBlockedScreenRendered = true;
        }
        return; // Dừng thuật toán tại đây, không cho chạy tiếp
    } 
    // Nếu đang bị khóa mà giờ nghỉ tới -> Tải lại trang để về bình thường
    else if (isBlockedSite && globalData.isBreakRunning) {
        if (isBlockedScreenRendered) {
            isBlockedScreenRendered = false;
            location.reload(); 
        }
    }

    // B. KỶ LUẬT THÉP (SUPER STRICT MODE)
    if (globalData.superStrict && !globalData.isBreakRunning) {
        if (isFB && !currentUrl.includes("/messages")) {
            forceRedirect("https://www.facebook.com/messages/");
        } else if (isIG && !currentUrl.includes("/direct")) {
            forceRedirect("https://www.instagram.com/direct/");
        } else {
            removeStrictOverlay();
        }
    } else {
        removeStrictOverlay(); 
    }
};

const forceRedirect = (targetUrl) => {
    if (!document.getElementById("super-strict-overlay")) {
        const overlay = document.createElement("div");
        overlay.id = "super-strict-overlay";
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:#18191A; z-index:2147483647; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; font-size:24px; font-family:sans-serif; font-weight:bold;";
        overlay.innerHTML = `
            <div style="font-size: 50px; margin-bottom: 20px;">🔥</div>
            <div>CHẾ ĐỘ KỶ LUẬT THÉP!</div>
            <div style="font-size: 16px; margin-top: 10px; color: #aaa;">Đang chuyển hướng sang trang tin nhắn...</div>
        `;
        (document.body || document.documentElement).appendChild(overlay);
    }
    window.location.replace(targetUrl);
    setTimeout(() => { window.location.href = targetUrl; }, 100);
};

const removeStrictOverlay = () => {
    const overlay = document.getElementById("super-strict-overlay");
    if (overlay) overlay.remove();
};

// ==========================================
// 3. HỆ THỐNG CHẶN SHORTS & REELS
// ==========================================
const updateShortsReels = () => {
    const isYT = currentDomain.includes("youtube.com");
    const isFB = currentDomain.includes("facebook.com");
    const isIG = currentDomain.includes("instagram.com");

    if (!isYT && !isFB && !isIG) return;

    let cssRules = "";
    if (isYT && globalData.toggles.yt) cssRules += `a[title="Shorts"], a[href^="/shorts/"], ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer { display: none !important; }`;
    if (isFB && globalData.toggles.fb) cssRules += `a[href*="/reel/"], div[aria-label*="Reel"], div[aria-label*="Reels"] { display: none !important; }`;
    if (isIG && globalData.toggles.ig) cssRules += `a[href*="/reels/"], a[href*="/reel/"] { display: none !important; }`;
    
    let styleTag = document.getElementById("shorts-reels-css");
    if (cssRules !== "") {
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = "shorts-reels-css";
            document.documentElement.appendChild(styleTag);
        }
        styleTag.textContent = cssRules;
    } else if (styleTag) {
        styleTag.remove();
    }

    const url = window.location.href;
    if (isYT && globalData.toggles.yt && url.includes("/shorts/")) {
        window.location.replace(url.replace("/shorts/", "/watch?v="));
    }
    if ((isFB && globalData.toggles.fb && url.includes("/reel/")) || 
        (isIG && globalData.toggles.ig && (url.includes("/reels/") || url.includes("/reel/")))) {
        window.location.replace("/");
    }

    document.querySelectorAll('div, a, span').forEach(el => {
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel && (ariaLabel.includes('Reel') || ariaLabel.includes('Shorts'))) {
            if ((isYT && globalData.toggles.yt) || (isFB && globalData.toggles.fb) || (isIG && globalData.toggles.ig)) {
                el.style.display = 'none';
            }
        }
        if (el.tagName === 'A' && el.href) {
            if (isYT && globalData.toggles.yt && el.href.includes('/shorts/')) el.remove();
            if ((isFB && globalData.toggles.fb || isIG && globalData.toggles.ig) && (el.href.includes('/reels/') || el.href.includes('/reel/'))) el.remove();
        }
    });
};

// ==========================================
// 4. HỆ THỐNG LINH VẬT CHIẾN BINH
// ==========================================
let mascotInterval;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
const quotes = [
    "Tập Trung Đi!",
    "Vì tương lai của chủ nhân, xin hãy tập trung!",
    "Đừng để tôi phải rút kiếm đấy!",
    "Bug còn đầy ra kìa, làm việc đi!",
    "Sắp xong Pomodoro rồi, cố lên!"
];

function initMascot() {
    if (document.getElementById("focus-mascot")) return;

    const style = document.createElement('style');
    style.id = "mascot-styles";
    style.textContent = `
        @keyframes mascotBreathe {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }
        .mascot-idle img { animation: mascotBreathe 2s infinite ease-in-out; }
        .mascot-smooth { transition: top 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.5s ease; }
        .mascot-dragging { transition: none !important; cursor: grabbing !important; }
    `;
    document.head.appendChild(style);

    const mascotHTML = `
        <div id="focus-mascot" class="mascot-smooth" style="position: fixed; left: calc(100vw - 150px); top: -150px; z-index: 2147483647; display: flex; flex-direction: column; align-items: center; cursor: grab; user-select: none;">
            <div id="mascot-speech" style="opacity: 0; background: white; color: #2c3e50; padding: 12px 18px; border-radius: 16px; border: 3px solid #34495e; margin-bottom: 10px; font-weight: bold; font-family: 'Segoe UI', sans-serif; font-size: 14px; transition: opacity 0.3s; box-shadow: 4px 4px 0px rgba(0,0,0,0.15); max-width: 220px; text-align: center; pointer-events: none;">
                Tập Trung Đi!
            </div>
            <img id="mascot-img" src="${chrome.runtime.getURL('assets/idle.gif')}" draggable="false" style="width: 100px; height: 100px; image-rendering: pixelated; filter: drop-shadow(2px 6px 8px rgba(0,0,0,0.4));">
        </div>
    `;
    document.documentElement.insertAdjacentHTML('beforeend', mascotHTML);
    setupDragAndDrop();
}

function setupDragAndDrop() {
    const mascot = document.getElementById("focus-mascot");
    mascot.addEventListener('mousedown', (e) => {
        isDragging = true;
        mascot.classList.add('mascot-dragging');
        mascot.classList.remove('mascot-smooth');
        offsetX = e.clientX - mascot.getBoundingClientRect().left;
        offsetY = e.clientY - mascot.getBoundingClientRect().top;
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        mascot.style.left = (e.clientX - offsetX) + 'px';
        mascot.style.top = (e.clientY - offsetY) + 'px';
    });
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            mascot.classList.remove('mascot-dragging');
            mascot.classList.add('mascot-smooth');
        }
    });
}

function showMascot() {
    initMascot();
    const mascot = document.getElementById("focus-mascot");
    const mascotImg = document.getElementById("mascot-img");
    
    mascot.classList.remove("mascot-idle");
    mascotImg.src = chrome.runtime.getURL('assets/climb.gif');
    
    setTimeout(() => { mascot.style.top = "calc(100vh - 180px)"; }, 100);

    setTimeout(() => {
        mascotImg.src = chrome.runtime.getURL('assets/idle.gif');
        mascot.classList.add("mascot-idle");
        mascotSpeak("Tôi sẽ canh chừng bạn!");
    }, 1600);

    clearInterval(mascotInterval);
    mascotInterval = setInterval(() => {
        mascotSpeak(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 900000); 
}

function hideMascot() {
    const mascot = document.getElementById("focus-mascot");
    const mascotImg = document.getElementById("mascot-img");
    if (!mascot) return;

    clearInterval(mascotInterval);
    mascot.classList.remove("mascot-idle");
    
    mascotImg.src = chrome.runtime.getURL('assets/wave.gif');
    mascotSpeak("Tạm biệt chủ nhân!");

    setTimeout(() => {
        mascotImg.src = chrome.runtime.getURL('assets/climb.gif');
        mascot.style.top = "-200px"; 
    }, 2500);

    setTimeout(() => {
        mascot.remove();
        const styles = document.getElementById("mascot-styles");
        if (styles) styles.remove();
    }, 4500);
}

function mascotSpeak(text) {
    const speech = document.getElementById("mascot-speech");
    if (!speech) return;
    speech.innerText = text;
    speech.style.opacity = "1";
    setTimeout(() => { speech.style.opacity = "0"; }, 6000);
}

// ==========================================
// 5. KHỞI CHẠY & LẮNG NGHE SỰ KIỆN
// ==========================================
chrome.storage.local.get({
    toggles: { yt: true, fb: true, ig: true },
    blockedSites: [],
    superStrict: false,
    isPomodoroRunning: false,
    isBreakRunning: false
}, (data) => {
    globalData = data;
    
    // Vòng lặp 200ms thần thánh - Quét sạch mọi video và chữ rác
    setInterval(() => {
        enforceRules();
        updateShortsReels();
    }, 200);

    if (globalData.isPomodoroRunning) showMascot();
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.superStrict) globalData.superStrict = changes.superStrict.newValue;
    if (changes.toggles) globalData.toggles = changes.toggles.newValue;
    if (changes.blockedSites) globalData.blockedSites = changes.blockedSites.newValue;
    
    if (changes.isBreakRunning) {
        globalData.isBreakRunning = changes.isBreakRunning.newValue;
        enforceRules(); 
    }

    if (changes.isPomodoroRunning) {
        globalData.isPomodoroRunning = changes.isPomodoroRunning.newValue;
        if (globalData.isPomodoroRunning) {
            showMascot();
        } else {
            hideMascot();
        }
    }
});