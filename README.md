# 🛡️ Focus Mode Extension - Kỷ Luật Thép Cho Trình Duyệt

**Focus Mode** là một tiện ích mở rộng (Chrome/Edge Extension) kết hợp với **Python Native Host** giúp bạn đánh bại sự trì hoãn và tối đa hóa sự tập trung. 

Không chỉ chặn các trang web xao nhãng hay ẩn video ngắn, Focus Mode còn có khả năng can thiệp sâu vào hệ điều hành để "đóng băng" các ứng dụng game trên PC trong suốt phiên làm việc, đồng thời có một linh vật đồng hành luôn nhắc nhở bạn.

---

## ✨ Tính Năng Nổi Bật

- 🍅 **Đồng hồ Pomodoro Tùy Chỉnh:** Thiết lập thời gian học tập linh hoạt và đếm ngược trực quan ngay trên popup.
- 🔥 **Super Strict Mode (Kỷ Luật Thép):** Chặn hoàn toàn bảng tin (Newsfeed) trên Facebook và Instagram, tự động đá bạn sang Messenger / IG Direct. **Chỉ cho phép nhắn tin, không cho phép lướt dạo!**
- 🙈 **Chặn Shorts & Reels:** Ẩn triệt để các video ngắn gây nghiện trên YouTube, Facebook và Instagram.
- 🛑 **Khóa Trang Web (Blacklist):** Chặn truy cập các trang web do bạn tự định nghĩa. Khi truy cập sẽ hiện màn hình "Đã Bị Khóa".
- 🎮 **Native Game Killer (PC):** Kết nối với Python Script dưới máy tính để tự động quét và tắt ngay lập tức các tiến trình game (như `valorant.exe`, `leagueclient.exe`) khi bạn đang trong phiên Pomodoro.


---

## 🚀 Hướng Dẫn Cài Đặt

Dự án này gồm 2 phần: **Chrome Extension** (Giao diện) và **Python Host** (Xử lý ngầm chặn game). Bạn cần thiết lập cả 2 để trải nghiệm đầy đủ sức mạnh của ứng dụng.

### Phần 1: Cài đặt Chrome Extension
1. Tải file `.zip` mã nguồn này về máy (hoặc tải từ mục **Releases**) và giải nén ra một thư mục cố định (Không xóa thư mục này sau khi cài).
2. Mở trình duyệt Chrome/Edge/Brave, truy cập vào trang quản lý tiện ích: `chrome://extensions/`.
3. Bật công tắc **Developer mode** (Chế độ dành cho nhà phát triển) ở góc trên bên phải.
4. Chọn **Load unpacked** (Tải tiện ích đã giải nén) và chọn thư mục vừa giải nén.
5. ⚠️ **QUAN TRỌNG:** Sau khi tải lên thành công, hãy **Copy ID của tiện ích** (một dãy khoảng 32 chữ cái, ví dụ: `mmhchjpjcmiefaledoeaoecnjohkfpid`) để dùng cho Phần 2.

💡 Mẹo nhỏ: Nếu bạn chỉ muốn dùng các tính năng chặn xao nhãng trên trình duyệt (Chặn Shorts, Khóa Web, Pomodoro, Mascot...), bạn CHỈ CẦN làm Phần 1 là xong (chưa tới 1 phút). Phần 2 (Cài Python) là tùy chọn không bắt buộc, chỉ dành cho những ai muốn chặn thêm Game trên máy tính (như Liên Minh, Valorant...).

### Phần 2: Cài đặt Python Host (Kích hoạt tính năng Chặn Game PC)
Tính năng chặn game yêu cầu môi trường Python để chạy ngầm trên Windows.
1. Đảm bảo máy tính đã cài đặt [Python](https://www.python.org/downloads/) (Nhớ tích chọn *Add Python to PATH* khi cài).
2. Mở Terminal/Command Prompt, chạy lệnh cài đặt thư viện quản lý tiến trình:
   ```bash
   pip install psutil



