# 🛍️ E-Commerce Platform (SHOPPY)

Một nền tảng thương mại điện tử đầy đủ tính năng được xây dựng bằng **FastAPI** (backend) và **React + TypeScript** (frontend), hỗ trợ quản lý sản phẩm, đơn hàng, và địa chỉ giao hàng Việt Nam.

## ✨ Tính năng chính

### 👤 Quản lý người dùng
- Đăng ký/đăng nhập với JWT authentication
- Phân quyền Admin/User
- Quản lý profile cá nhân

### 🏪 Quản lý sản phẩm
- CRUD sản phẩm, danh mục, thương hiệu
- Quản lý biến thể sản phẩm (size, color, material)
- Upload và quản lý hình ảnh sản phẩm

### 🛒 Giỏ hàng & Đặt hàng
- Thêm/xóa sản phẩm khỏi giỏ hàng
- Checkout với địa chỉ giao hàng Việt Nam
- Theo dõi trạng thái đơn hàng

### 📍 Hệ thống địa chỉ Việt Nam
- Cấu trúc địa chỉ 3 cấp: Tỉnh → Quận/Huyện → Phường/Xã
- Tự động populate dữ liệu từ API chính phủ
- Hỗ trợ tìm kiếm và autocomplete

### 👨‍💼 Quản trị viên (Admin)
- Dashboard quản lý đơn hàng
- Quản lý khách hàng, nhân viên

## 🏗️ Kiến trúc hệ thống

```
myproject/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # Application entry point
│   │   ├── core/              # Core configuration
│   │   ├── database/          # Database setup
│   │   ├── model/             # SQLAlchemy models
│   │   ├── schema/            # Pydantic schemas
│   │   ├── service/           # Business logic
│   │   ├── router/            # API endpoints
│   │   └── auth/              # Authentication
│   ├── tests/                 # Unit tests
│   └── requirements.txt       # Python dependencies
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── types/             # TypeScript types
│   │   └── config/            # Configuration
│   ├── package.json           # Node dependencies
│   └── vite.config.ts         # Vite configuration
└── openapi.json               # API documentation
```

## 🚀 Cài đặt và chạy

### 📋 Yêu cầu hệ thống
- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- Git

### 🔧 Setup Backend

```bash
# 1. Clone repository
git clone https://github.com/eat3torice/myproject.git
cd myproject/backend

# 2. Tạo virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# hoặc
source .venv/bin/activate  # Linux/Mac

# 3. Cài đặt dependencies
pip install -r app/requirements.txt

# 4. Setup environment variables
cp .env.example .env
# Edit .env file with your actual database credentials and secret keys

# 5. Setup database
# Tạo database PostgreSQL và cập nhật DATABASE_URL trong .env
# Chạy schema SQL: psql -U username -d database_name -f database_schema.sql

# 5. Populate dữ liệu địa chỉ Việt Nam (optional)
python populate_addresses.py

# 6. Populate dữ liệu mẫu (categories & brands)
python populate_sample_data.py

# 7. Chạy server
uvicorn app.main:app --reload
```

### 🎨 Setup Frontend

```bash
# 1. Di chuyển đến thư mục frontend
cd ../frontend

# 2. Cài đặt dependencies
npm install

# 3. Chạy development server
npm run dev

# 4. Build cho production
npm run build
```

### 🧪 Chạy Tests

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Frontend linting
cd frontend
npm run lint
```

## 📖 API Documentation

### 🔗 Endpoints chính

#### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký

#### Products
- `GET /products` - Lấy danh sách sản phẩm
- `POST /admin/products` - Tạo sản phẩm mới (Admin)
- `PUT /admin/products/{id}` - Cập nhật sản phẩm (Admin)

#### Orders
- `GET /user/orders/my-orders` - Lấy đơn hàng của user
- `POST /user/orders` - Tạo đơn hàng mới
- `GET /admin/orders` - Lấy tất cả đơn hàng (Admin)

#### Addresses
- `GET /user/addresses/provinces` - Lấy danh sách tỉnh
- `GET /user/addresses/districts/{province_id}` - Lấy quận/huyện
- `GET /user/addresses/wards/{district_id}` - Lấy phường/xã

### 📋 API Docs
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### 🗄️ Database Schema

### Các bảng chính:
- `account` - Tài khoản người dùng
- `customer` - Thông tin khách hàng
- `employee` - Thông tin nhân viên
- `product` - Sản phẩm
- `variation` - Biến thể sản phẩm
- `posorder` - Đơn hàng
- `address` - Địa chỉ giao hàng (3 cấp)

### 📄 Database Schema File
File `backend/database_schema.sql` chứa schema đầy đủ của database PostgreSQL, bao gồm:
- Tất cả các bảng và cột
- Constraints và indexes
- Foreign key relationships
- Được tạo từ pgAdmin 4 ERD tool

## 🔐 Authentication

Sử dụng JWT (JSON Web Tokens) cho authentication:
- **Access Token**: Hết hạn sau 30 phút
- **Refresh Token**: Hết hạn sau 7 ngày
- **Role-based Access**: Admin/User permissions

## ⚙️ Environment Variables

Project sử dụng các biến môi trường được định nghĩa trong file `.env`. Copy file mẫu và điền thông tin thực tế:

```bash
cp backend/.env.example backend/.env
```

### Biến môi trường bắt buộc:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Key bí mật cho JWT signing
- `ALGORITHM`: Thuật toán JWT (HS256)

### Biến môi trường tùy chọn:
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Thời gian hết hạn token (mặc định: 30 phút)
- `DEBUG`: Chế độ debug (true/false)
- `HOST`: Server host (mặc định: 0.0.0.0)
- `PORT`: Server port (mặc định: 8000)

## 🧪 Testing

```bash
# Chạy tất cả tests
pytest

# Chạy với coverage
pytest --cov=app --cov-report=html

# Chạy smoke test
pytest tests/test_smoke.py
```

## 📦 Deployment

### Backend (Railway/Render)
```bash
# Build command
pip install -r requirements.txt

# Start command
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel/Netlify)
```bash
# Build command
npm run build

# Publish directory
dist/
```

## 🤝 Contributing

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### 📝 Code Style
- **Backend**: Ruff formatter, Black style
- **Frontend**: ESLint, Prettier
- **Commits**: Conventional commits

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Authors

- **eat3torice** - *Initial work* - [GitHub](https://github.com/eat3torice)

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python SQL toolkit
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

---

⭐ **Nếu project này hữu ích, hãy cho chúng tôi một ngôi sao!** ⭐</content>
<parameter name="filePath">d:\test\myproject\README.md
