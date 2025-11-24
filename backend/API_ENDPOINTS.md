# API Endpoints Documentation

## Authentication
- POST `/auth/register` - Đăng ký tài khoản mới
- POST `/auth/login` - Đăng nhập

---

## ADMIN ENDPOINTS

### Products (Sản phẩm)
- GET `/admin/products/` - Lấy danh sách sản phẩm
- GET `/admin/products/{product_id}` - Lấy chi tiết sản phẩm
- POST `/admin/products/` - Tạo sản phẩm mới
- PUT `/admin/products/{product_id}` - Cập nhật sản phẩm
- DELETE `/admin/products/{product_id}` - Xóa sản phẩm

## Categories (Danh mục)
- GET `/admin/categories/` - Lấy danh sách danh mục
- GET `/admin/categories/{category_id}` - Lấy chi tiết danh mục
- POST `/admin/categories/` - Tạo danh mục mới
- PUT `/admin/categories/{category_id}` - Cập nhật danh mục
- DELETE `/admin/categories/{category_id}` - Xóa danh mục

## Brands (Thương hiệu)
- GET `/admin/brands/` - Lấy danh sách thương hiệu
- GET `/admin/brands/{brand_id}` - Lấy chi tiết thương hiệu
- POST `/admin/brands/` - Tạo thương hiệu mới
- PUT `/admin/brands/{brand_id}` - Cập nhật thương hiệu
- DELETE `/admin/brands/{brand_id}` - Xóa thương hiệu

## Variations (Biến thể sản phẩm)
- GET `/admin/variations/` - Lấy danh sách biến thể (có thể lọc theo product_id)
- GET `/admin/variations/{variation_id}` - Lấy chi tiết biến thể
- POST `/admin/variations/` - Tạo biến thể mới
- PUT `/admin/variations/{variation_id}` - Cập nhật biến thể
- DELETE `/admin/variations/{variation_id}` - Xóa biến thể
- PATCH `/admin/variations/{variation_id}/quantity` - Cập nhật số lượng tồn kho

## Customers (Khách hàng)
- GET `/admin/customers/` - Lấy danh sách khách hàng
- GET `/admin/customers/{customer_id}` - Lấy chi tiết khách hàng
- POST `/admin/customers/` - Tạo khách hàng mới
- PUT `/admin/customers/{customer_id}` - Cập nhật khách hàng
- DELETE `/admin/customers/{customer_id}` - Xóa khách hàng

## Employees (Nhân viên)
- GET `/admin/employees/` - Lấy danh sách nhân viên
- GET `/admin/employees/{employee_id}` - Lấy chi tiết nhân viên
- POST `/admin/employees/` - Tạo nhân viên mới
- PUT `/admin/employees/{employee_id}` - Cập nhật nhân viên
- DELETE `/admin/employees/{employee_id}` - Xóa nhân viên

## Orders (Đơn hàng)
- GET `/admin/orders/` - Lấy danh sách đơn hàng (có thể lọc theo status)
- GET `/admin/orders/statistics` - Lấy thống kê đơn hàng
- GET `/admin/orders/{order_id}` - Lấy chi tiết đơn hàng
- GET `/admin/orders/{order_id}/lines` - Lấy danh sách sản phẩm trong đơn
- POST `/admin/orders/` - Tạo đơn hàng mới
- PUT `/admin/orders/{order_id}` - Cập nhật đơn hàng
- POST `/admin/orders/{order_id}/cancel` - Hủy đơn hàng (hoàn lại tồn kho)

---

## USER ENDPOINTS

### User Management
- POST `/user/register` - Đăng ký tài khoản khách hàng
- GET `/user/profile` - Lấy thông tin profile (cần login)
- PUT `/user/profile` - Cập nhật thông tin profile (cần login)
- POST `/user/change-password` - Đổi mật khẩu (cần login)

### Public Products (Không cần login)
- GET `/products/` - Lấy danh sách sản phẩm (có filter: category_id, brand_id, search)
- GET `/products/featured` - Lấy sản phẩm nổi bật/bán chạy
- GET `/products/search` - Tìm kiếm sản phẩm theo keyword
- GET `/products/categories` - Lấy danh sách danh mục
- GET `/products/brands` - Lấy danh sách thương hiệu
- GET `/products/{product_id}` - Lấy chi tiết sản phẩm

### Shopping Cart (Cần login)
- GET `/cart/` - Lấy giỏ hàng của user
- POST `/cart/` - Thêm sản phẩm vào giỏ hàng
- PUT `/cart/{cart_item_id}` - Cập nhật số lượng trong giỏ
- DELETE `/cart/{cart_item_id}` - Xóa sản phẩm khỏi giỏ
- DELETE `/cart/` - Xóa toàn bộ giỏ hàng

### User Orders (Cần login)
- GET `/user/orders/` - Lấy danh sách đơn hàng của user (có filter: status)
- GET `/user/orders/{order_id}` - Lấy chi tiết đơn hàng
- GET `/user/orders/{order_id}/items` - Lấy danh sách sản phẩm trong đơn
- POST `/user/orders/` - Tạo đơn hàng mới (đặt hàng online)

---

## Swagger Documentation
- Truy cập http://127.0.0.1:8000/docs để xem tài liệu API đầy đủ
- Tất cả endpoints đều được document với schemas và examples
