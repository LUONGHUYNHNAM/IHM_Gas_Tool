# 🚀 Quick Start - IHM Gas Tool

## Chạy nhanh trong 3 bước

### 1. Cài đặt
```bash
npm install
```

### 2. Chạy ứng dụng
```bash
# Chạy cả web và Electron
npm run dev

# Hoặc chỉ chạy web
npm run dev:web
```

### 3. Sử dụng
1. Mở ứng dụng Electron hoặc browser tại `http://localhost:5173`
2. Đăng nhập với bất kỳ username/password nào
3. Thêm thành phần khí và thực hiện conversion

## 🔧 Scripts chính

| Command | Mô tả |
|---------|-------|
| `npm run dev` | Chạy cả Vite + Electron |
| `npm run dev:web` | Chỉ chạy web server |
| `npm run build` | Build production |
| `npm start` | Chạy Electron production |

## ❗ Lưu ý

- Cần Node.js 18+
- API backend tùy chọn tại `http://localhost:8000`
- Nếu Electron lỗi, dùng `npm run dev:web` để test

---
**Thời gian setup**: ~2 phút 🕐 