# Danh sách tài khoản mẫu cho hệ thống POS

## 📋 TÀI KHOẢN ADMIN (Role ID: 1)
Các tài khoản này có quyền truy cập đầy đủ tất cả chức năng admin, bao gồm quản lý nhân viên.

| Username     | Password    | Role    | Truy cập | Status |
|--------------|-------------|---------|----------|--------|
| admin        | admin123    | ADMIN   | Toàn bộ hệ thống | ✅ Created |
| testuser123  | test123     | ADMIN   | Toàn bộ hệ thống | ✅ Existing |
| bca123       | bca123      | ADMIN   | Toàn bộ hệ thống | ✅ Existing |
| abc123       | abc123      | ADMIN   | Toàn bộ hệ thống | ✅ Existing |

## 👔 TÀI KHOẢN EMPLOYEE (Role ID: 18)
Các tài khoản này có quyền truy cập tất cả chức năng admin TRỪ quản lý nhân viên.

| Username     | Password    | Role      | Truy cập | Employee Record | Status |
|--------------|-------------|-----------|----------|-----------------|--------|
| employee1    | emp123      | EMPLOYEE  | Admin trừ nhân viên | Tran Thi B | ✅ Created |
| employee2    | emp456      | EMPLOYEE  | Admin trừ nhân viên | Le Van C | ✅ Created |
| staff1       | staff123    | EMPLOYEE  | Admin trừ nhân viên | Pham Thi D | ✅ Created |

## 👨‍💼 EMPLOYEE RECORDS (dữ liệu nhân viên)
Các bản ghi nhân viên sẽ hiển thị trong trang quản lý nhân viên của admin:

| ID | Account | Name | Phone | Email | Status |
|----|---------|------|-------|-------|--------|
| 1 | admin1 | Nguyen Van A | 0901234567 | a.nguyen@example.com | INACTIVE |
| 2 | employee1 | Tran Thi B | 0902345678 | b.tran@example.com | ACTIVE |
| 3 | employee2 | Le Van C | 0903456789 | c.le@example.com | ACTIVE |
| 4 | staff1 | Pham Thi D | 0904567890 | d.pham@example.com | ACTIVE |
| 5 | admin | Nguyen Van Admin | 0905678901 | admin@example.com | ACTIVE |
| 6 | testuser123 | Test User | 0906789012 | test@example.com | ACTIVE |

## 🛒 TÀI KHOẢN CUSTOMER (Role ID: 2)
Các tài khoản này chỉ có quyền truy cập chức năng người dùng (đặt hàng, xem giỏ hàng, etc.).

| Username     | Password    | Role      | Truy cập | Status |
|--------------|-------------|-----------|----------|--------|
| customer1    | cust123     | CUSTOMER  | Chỉ chức năng user | ✅ Existing |
| customer2    | cust456     | CUSTOMER  | Chỉ chức năng user | ✅ Existing |
| user1        | user123     | CUSTOMER  | Chỉ chức năng user | ✅ Created |

## 🔐 HƯỚNG DẪN SỬ DỤNG

### 1. Đăng nhập Admin/Employee:
- Truy cập: `http://localhost:5173/admin/login`
- Sử dụng tài khoản admin hoặc employee

### 2. Đăng nhập Customer:
- Truy cập: `http://localhost:5173/login`
- Sử dụng tài khoản customer

### 3. Quyền hạn theo vai trò:

#### ADMIN (Role ID: 1):
- ✅ Quản lý sản phẩm, danh mục, thương hiệu
- ✅ Quản lý đơn hàng, khách hàng
- ✅ Quản lý nhân viên (xem, thêm, sửa, vô hiệu hóa)
- ✅ Toàn quyền truy cập admin

#### EMPLOYEE (Role ID: 18):
- ✅ Quản lý sản phẩm, danh mục, thương hiệu
- ✅ Quản lý đơn hàng, khách hàng
- ✅ POS Order
- ❌ KHÔNG thể xem/quản lý nhân viên khác

#### CUSTOMER (Role ID: 2):
- ✅ Xem sản phẩm, đặt hàng
- ✅ Quản lý giỏ hàng, đơn hàng cá nhân
- ✅ Quản lý địa chỉ giao hàng
- ❌ KHÔNG thể truy cập admin

## ⚠️ LƯU Ý

- Tất cả tài khoản mẫu đều có `status = ACTIVE`
- Passwords được hash bằng Argon2
- Để tạo tài khoản thực tế, sử dụng endpoint `/auth/register` với `role_id` tương ứng

## 🛠️ Tạo tài khoản mới

### Tạo Admin Account:
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newadmin",
    "password": "admin123",
    "role_id": 1,
    "phone": "0123456789"
  }'
```

### Tạo Employee Account:
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newemployee",
    "password": "emp123",
    "role_id": 18,
    "phone": "0123456789"
  }'
```

### Tạo Customer Account:
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newcustomer",
    "password": "cust123",
    "role_id": 2,
    "phone": "0123456789"
  }'
```