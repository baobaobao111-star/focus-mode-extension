# ... (giữ nguyên phần import và các hàm trên) ...

TARGET_GAMES = [] # Để trống, sẽ được Chrome nạp vào
is_focused = False

def kill_games_loop():
    global is_focused, TARGET_GAMES
    while True:
        if is_focused and len(TARGET_GAMES) > 0:
            for proc in psutil.process_iter(['name']):
                try:
                    proc_name = proc.info['name']
                    if proc_name and proc_name.lower() in TARGET_GAMES:
                        proc.kill()
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass
        time.sleep(2)

# ... (giữ nguyên hàm send_message và read_message) ...

if __name__ == '__main__':
    killer_thread = threading.Thread(target=kill_games_loop, daemon=True)
    killer_thread.start()

    while True:
        try:
            msg = read_message()
            if msg.get("action") == "start":
                # Nhận danh sách game động từ Chrome gửi xuống
                TARGET_GAMES = msg.get("games", [])
                is_focused = True
                send_message({"status": f"Đã nhận lệnh quét: {TARGET_GAMES}"})
                
            elif msg.get("action") == "stop":
                is_focused = False
                send_message({"status": "Đã thả cửa cho game"})
        except Exception as e:
            sys.exit(0)