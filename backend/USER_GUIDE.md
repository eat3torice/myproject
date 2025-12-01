# POS System API - Hướng dẫn sử dụng

## Khởi động server

```bash
cd backend
uvicorn app.main:app --reload
```

Server sẽ chạy tại: http://127.0.0.1:8000

API Documentation (Swagger): http://127.0.0.1:8000/docs

---

## Luồng hoạt động cho USER

### 1. Đăng ký tài khoản
```http
POST /user/register
Content-Type: application/json

{
  "username": "customer1",
  "password": "password123",
  "name": "Nguyễn Văn A",
  "phone": "0123456789",
  "address": "123 Đường ABC, TP.HCM",
  "email": "customer@example.com"
}
```

### 2. Đăng nhập
```http
POST /auth/login
Content-Type: application/json

{
  "username": "customer1",
  "password": "password123"
}
```

Response sẽ trả về `access_token`, lưu token này để dùng cho các request sau.

### 3. Xem danh sách sản phẩm (Không cần login)
```http
GET /products/?skip=0&limit=20
GET /products/?category_id=1
GET /products/?brand_id=1
GET /products/search?keyword=chair
```

### 4. Xem chi tiết sản phẩm
```http
GET /products/1
```

### 5. Xem sản phẩm nổi bật
```http
GET /products/featured?limit=10
```

### 6. Thêm vào giỏ hàng (Cần login)
```http
POST /cart/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "variation_id": 1,
  "quantity": 2
}
```

### 7. Xem giỏ hàng
```http
GET /cart/
Authorization: Bearer <access_token>
```

### 8. Cập nhật số lượng trong giỏ
```http
PUT /cart/1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "quantity": 3
}
```

### 9. Đặt hàng
```http
POST /user/orders/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "PaymentMethodID": 1,
  "Note": "Giao hàng buổi chiều",
  "order_lines": [
    {
      "VariationID": 1,
      "Quantity": 2,
      "Unit_Price": 100000
    }
  ]
}
```

### 10. Xem đơn hàng của mình
```http
GET /user/orders/
Authorization: Bearer <access_token>
```

### 11. Xem chi tiết đơn hàng
```http
GET /user/orders/1
Authorization: Bearer <access_token>
```

---

## Luồng hoạt động cho ADMIN

### 1. Đăng nhập với tài khoản admin
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 2. Quản lý danh mục
```http
GET /admin/categories/
POST /admin/categories/
PUT /admin/categories/1
DELETE /admin/categories/1
```

### 3. Quản lý thương hiệu
```http
GET /admin/brands/
POST /admin/brands/
PUT /admin/brands/1
DELETE /admin/brands/1
```

### 4. Quản lý sản phẩm
```http
GET /admin/products/
POST /admin/products/
PUT /admin/products/1
DELETE /admin/products/1
```

### 5. Quản lý biến thể sản phẩm
```http
GET /admin/variations/?product_id=1
POST /admin/variations/
PUT /admin/variations/1
DELETE /admin/variations/1
PATCH /admin/variations/1/quantity  # Cập nhật tồn kho
```

### 6. Quản lý khách hàng
```http
GET /admin/customers/
POST /admin/customers/
PUT /admin/customers/1
DELETE /admin/customers/1
```

### 7. Quản lý nhân viên
```http
GET /admin/employees/
POST /admin/employees/
PUT /admin/employees/1
PUT /admin/employees/1/deactivate  # Vô hiệu hóa tài khoản nhân viên
PUT /admin/employees/1/reactivate  # Kích hoạt lại tài khoản nhân viên
```

### 8. Quản lý đơn hàng
```http
GET /admin/orders/?status=pending
GET /admin/orders/statistics
POST /admin/orders/
PUT /admin/orders/1
POST /admin/orders/1/cancel  # Hủy đơn và hoàn kho
```

---

## Authentication

Tất cả các endpoint có prefix `/admin/` và `/user/` (trừ `/user/register`) đều yêu cầu authentication.

Thêm header sau vào request:
```
Authorization: Bearer <access_token>
```

### Vai trò người dùng (Role IDs):
- `1`: ADMIN - Quản trị viên, có quyền truy cập tất cả chức năng admin bao gồm quản lý nhân viên
- `2`: CUSTOMER - Khách hàng, có quyền truy cập chức năng người dùng
- `18`: EMPLOYEE - Nhân viên, có quyền truy cập tất cả chức năng admin **trừ** quản lý nhân viên

---

## Các tính năng đặc biệt

### 1. Tự động cập nhật tồn kho
- Khi tạo đơn hàng: Số lượng tồn kho tự động giảm, Sold tăng
- Khi hủy đơn hàng: Số lượng tồn kho được hoàn lại

### 2. Kiểm tra SKU trùng lặp
- Khi tạo/cập nhật variation, hệ thống tự động kiểm tra SKU trùng

### 3. Thống kê đơn hàng
```http
GET /admin/orders/statistics?start_date=2025-01-01&end_date=2025-12-31
```

### 4. Lọc và tìm kiếm
- Lọc sản phẩm theo category, brand
- Tìm kiếm sản phẩm theo tên
- Lọc đơn hàng theo status

---

## Testing với Swagger UI

1. Mở http://127.0.0.1:8000/docs
2. Click nút "Authorize 🔒" ở góc trên
3. Nhập token dạng: `Bearer <access_token>`
4. Test các endpoint ngay trên giao diện

---

## Database Schema

Hệ thống sử dụng PostgreSQL với các bảng:
- account (tài khoản)
- role (vai trò)
- customer (khách hàng)
- employee (nhân viên)
- category (danh mục)
- brand (thương hiệu)
- product (sản phẩm)
- variation (biến thể)
- images (hình ảnh)
- cartitem (giỏ hàng)
- posorder (đơn hàng)
- orderline (chi tiết đơn hàng)
- paymentmethod (phương thức thanh toán)
