# IHM Gas Tool

**ISO 14912:2023 Gas Mixture Component Unit Conversion Tool**

Công cụ chuyển đổi đơn vị thành phần hỗn hợp khí theo tiêu chuẩn ISO 14912:2023 với giao diện Electron và API tích hợp.

## ✨ Tính năng

- 🔄 **Chuyển đổi đơn vị** - Chuyển đổi giữa các đơn vị khác nhau (mol/mol, µmol/mol, ppm, ppb, m³/m³, mg/m³)
- 🧪 **Quản lý thành phần khí** - Thêm, sửa, xóa các thành phần khí với tìm kiếm API
- 📊 **Hiển thị kết quả** - Bảng kết quả chi tiết với uncertainty
- 🔍 **API Testing Panel** - Kiểm tra kết nối API và health check
- 🔐 **Đăng nhập** - Hệ thống đăng nhập đơn giản
- ⚡ **Electron App** - Ứng dụng desktop đa nền tảng

## 🛠 Công nghệ sử dụng

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop**: Electron 29
- **Build Tool**: Vite 5
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📁 Cấu trúc dự án

```
src/
├── components/          # React components
│   ├── ConversionTool.tsx      # Component chính cho conversion
│   ├── ComponentTable.tsx     # Bảng quản lý thành phần khí
│   ├── ConversionResults.tsx   # Hiển thị kết quả
│   ├── InputForm.tsx          # Form nhập điều kiện
│   ├── ApiTestPanel.tsx       # Panel test API
│   ├── Header.tsx             # Header component
│   ├── LoginModal.tsx         # Modal đăng nhập
│   ├── Welcome.tsx            # Màn hình welcome
│   └── ErrorBoundary.tsx      # Error boundary
├── services/            # API services
│   ├── api.ts                 # Base API client
│   ├── iso14912Api.ts         # ISO 14912 API
│   ├── moleculesApi.ts        # Molecules API
│   └── index.ts               # Exports
├── utils/               # Utilities
│   ├── types.ts               # Type definitions
│   ├── conversionLogic.ts     # Logic chuyển đổi
│   └── dataValidation.ts     # Validation logic
├── App.tsx              # Main App component
├── main.tsx            # React entry point
└── index.css           # Global styles
electron/
└── main.js             # Electron main process
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy ứng dụng

#### Chế độ development (Web + Electron)
```bash
npm run dev
```

#### Chỉ chạy web development
```bash
npm run dev:web
```

#### Chỉ chạy Electron (cần web server đang chạy)
```bash
npm run dev:electron
```

### Build production
```bash
npm run build
```

### Chạy Electron với build production
```bash
npm start
```

## 📋 Scripts có sẵn

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy cả Vite dev server và Electron |
| `npm run dev:web` | Chỉ chạy Vite dev server |
| `npm run dev:electron` | Chỉ chạy Electron |
| `npm run build` | Build production |
| `npm run preview` | Preview build production |
| `npm start` | Chạy Electron với build production |
| `npm run lint` | Kiểm tra code với ESLint |

## 🔧 Cấu hình

### Environment Variables
Tạo file `.env` trong thư mục root:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Electron Configuration
File `electron/main.js` chứa cấu hình Electron:
- Auto-detect Vite port
- Error handling
- Development tools

## 📖 Sử dụng

1. **Đăng nhập** - Nhấn "Sign In to Continue" và nhập thông tin
2. **Nhập điều kiện** - Temperature, Pressure, Input/Output units
3. **Thêm thành phần khí** - Sử dụng bảng để thêm các thành phần
4. **Chuyển đổi** - Nhấn nút Convert để thực hiện chuyển đổi
5. **Xem kết quả** - Kết quả hiển thị trong bảng với uncertainty

## 🧪 API Integration

Ứng dụng tích hợp với backend API để:
- Tìm kiếm thông tin molecules
- Validate CAS numbers
- Thực hiện conversion theo ISO 14912:2023
- Health check và monitoring

## 🐛 Debug

Ứng dụng có Error Boundary và console logging để debug. Mở Developer Tools trong Electron để xem logs.

## 📝 License

Dự án này được phát triển cho mục đích giáo dục và nghiên cứu.

## 👥 Đóng góp

Dự án này là một phần của khóa học IHM Final Project.

---

**Phiên bản**: 1.0.0  
**Tiêu chuẩn**: ISO 14912:2023  
**Phát triển**: IHM Team
