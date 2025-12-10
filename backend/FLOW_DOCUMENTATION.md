# LUỒNG CHẠY CÁC CHỨC NĂNG - BACKEND API

## 1. KHỞI ĐỘNG ỨNG DỤNG

### Entry Point: `backend/app/main.py`

```python
# File: backend/app/main.py (dòng 1-42)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Cấu hình logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Import models để tạo bảng
import app.model
from app.database.base_class import Base
from app.database.session import engine

# Khởi tạo FastAPI app
app = FastAPI(title="Auth Service API", version="0.1.0")

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Đăng ký Routers: `backend/app/main.py` (dòng 68-88)

```python
# File: backend/app/main.py (dòng 68-88)
# Auth router
app.include_router(auth_router.router)  # /auth/*

# Admin routes
app.include_router(product_router.router)  # /admin/products/*
app.include_router(category_router.router)  # /admin/categories/*
app.include_router(brand_router.router)  # /admin/brands/*
app.include_router(variation_router.router)  # /admin/variations/*
app.include_router(customer_router.router)  # /admin/customers/*
app.include_router(employee_router.router)  # /admin/employees/*
app.include_router(order_router.router)  # /admin/orders/*

# User routes
app.include_router(user_router.router)  # /user/*
app.include_router(public_router.router)  # /products/* (public)
app.include_router(cart_router.router)  # /cart/*
app.include_router(user_order_router.router)  # /user/orders/*
app.include_router(address_router.router)  # /user/addresses/*

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")
```

---

## 2. AUTHENTICATION FLOW (Đăng nhập/Đăng ký)

### 2.1. ĐĂNG KÝ TÀI KHOẢN CUSTOMER

**Frontend → Backend Flow:**

```
Frontend (Register.tsx) 
    ↓ POST /user/register
Backend (user_router.py → user_service.py → auth_service.py)
    ↓
Database (Insert vào bảng account, customer)
    ↓
Return: UserProfile
```

**Chi tiết code:**

#### Bước 1: Frontend gửi request
```typescript
// File: frontend/src/pages/Register.tsx (dòng 22-40)
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Gọi API
    try {
        await userService.register({
            username: formData.username,
            password: formData.password,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
        });
        navigate('/login');
    } catch (error) {
        alert('Registration failed');
    }
};
```

```typescript
// File: frontend/src/services/userService.ts (dòng 4-12)
register: async (userData: {
    username: string;
    password: string;
    name: string;
    phone?: string;
    address?: string;
}) => {
    const response = await api.post('/user/register', userData);
    return response.data;
}
```

#### Bước 2: Backend xử lý request

```python
# File: backend/app/router/user_router.py (dòng 19-31)
@router.post("/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Đăng ký tài khoản khách hàng mới"""
    service = UserService(db)
    try:
        customer = service.register_user(user_data)
        return customer
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
```

#### Bước 3: UserService xử lý logic

```python
# File: backend/app/service/user_service.py (dòng ~50-80)
def register_user(self, user_data: UserRegister) -> Customer:
    """Đăng ký user mới - tạo account và customer profile"""
    
    # Check username tồn tại
    existing_account = self.db.query(Account).filter(
        Account.Username == user_data.username
    ).first()
    if existing_account:
        raise ValueError("Username already exists")
    
    # Hash password
    auth_service = AuthService(self.db)
    hashed_password = auth_service.hash_password(user_data.password)
    
    # Tạo Account với RoleID = 2 (CUSTOMER)
    db_account = Account(
        Username=user_data.username,
        Password=hashed_password,
        RoleID=2,  # Customer role
        Status="ACTIVE"
    )
    self.db.add(db_account)
    self.db.flush()  # Lấy PK_Account
    
    # Tạo Customer profile
    db_customer = Customer(
        AccountID=db_account.PK_Account,
        Name=user_data.name,
        Phone=user_data.phone,
        Address=user_data.address
    )
    self.db.add(db_customer)
    self.db.commit()
    self.db.refresh(db_customer)
    
    return db_customer
```

---

### 2.2. ĐĂNG NHẬP

**Frontend → Backend Flow:**

```
Frontend (Login.tsx) 
    ↓ POST /auth/login
Backend (auth_router.py → auth_service.py)
    ↓
Database (Query account, verify password)
    ↓
Return: { access_token, role_id }
    ↓
Frontend lưu token vào localStorage/sessionStorage
```

**Chi tiết code:**

#### Bước 1: Frontend gửi request

```typescript
// File: frontend/src/pages/Login.tsx (dòng 14-34)
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const response = await authService.login({ 
            username: username.trim(), 
            password: password.trim() 
        });
        
        // Kiểm tra role
        if (response.role_id === 1 || response.role_id === 18) {
            setError('Admin and Employee cannot login to customer area');
            return;
        }
        
        // Lưu token
        authService.setToken(response.access_token);
        navigate('/shop');
    } catch (err: any) {
        setError(err.response?.data?.detail || 'Login failed');
    } finally {
        setLoading(false);
    }
};
```

```typescript
// File: frontend/src/services/authService.ts (dòng 13-16)
login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
}
```

#### Bước 2: Backend xử lý login

```python
# File: backend/app/router/auth_router.py (dòng 25-50)
@router.post("/login")
def login(account: AccountLogin, db: Session = Depends(get_db)):
    logger.info(f"Login attempt for username: {account.username}")
    auth_service = AuthService(db)
    
    # Xác thực username + password
    db_account = auth_service.authenticate_account(account.username, account.password)
    
    if not db_account:
        # Check if user exists
        user_exists = db.query(Account).filter(Account.Username == account.username).first()
        if not user_exists:
            logger.warning(f"Login failed - username not found: {account.username}")
            raise HTTPException(status_code=401, detail="Username does not exist")
        else:
            logger.warning(f"Login failed - incorrect password for: {account.username}")
            raise HTTPException(status_code=401, detail="Incorrect password")
    
    logger.info(f"Login successful for: {account.username}, Role: {db_account.RoleID}")
    
    # Check account status
    if db_account.Status != "ACTIVE":
        raise HTTPException(status_code=401, detail=f"Account is {db_account.Status}")
    
    # Tạo access token
    access_token = auth_service.create_access_token(data={"sub": db_account.Username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role_id": db_account.RoleID,
        "account_status": db_account.Status
    }
```

#### Bước 3: AuthService xác thực

```python
# File: backend/app/auth/auth_service.py (dòng 59-70)
def authenticate_account(self, username: str, password: str) -> Account | None:
    logger.debug(f"Authenticating username='{username}', password='{password}' (len={len(password)})")
    
    # Tìm account theo username
    account = self.db.query(Account).filter(Account.Username == username).first()
    
    if account:
        logger.debug(f"Account found: {account.Username}, RoleID={account.RoleID}")
        
        # Verify password bằng Argon2
        is_valid = self.verify_password(password, account.Password)
        logger.debug(f"Password validation result: {is_valid}")
        
        if is_valid:
            return account
    else:
        logger.debug(f"Account not found for username: {username}")
    
    return None
```

```python
# File: backend/app/auth/auth_service.py (dòng 24-34)
@staticmethod
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        logger.debug(f"Verifying password: plain='{plain_password}' (len={len(plain_password)})")
        ph.verify(hashed_password, plain_password)
        logger.debug("Password verification SUCCESS")
        return True
    except VerifyMismatchError:
        logger.debug("Password verification FAILED")
        return False
```

#### Bước 4: Tạo JWT Token

```python
# File: backend/app/auth/auth_service.py (dòng 36-43)
def create_access_token(self, data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
```

---

## 3. PROTECTED ROUTES (Routes cần authentication)

### 3.1. Middleware Authentication

**Flow:**

```
Client request với header Authorization: Bearer <token>
    ↓
FastAPI OAuth2PasswordBearer extract token
    ↓
get_current_account dependency (dependencies.py)
    ↓
Decode JWT token → lấy username
    ↓
Query database lấy Account
    ↓
Kiểm tra Status = "ACTIVE"
    ↓
Return Account object cho endpoint
```

**Chi tiết code:**

```python
# File: backend/app/auth/dependencies.py (dòng 1-44)
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import logging

from app.core.config import settings
from app.database.session import get_db
from app.model.account_model import Account

oauth2 = OAuth2PasswordBearer(tokenUrl="auth/login")
logger = logging.getLogger(__name__)


def get_current_account(db: Session = Depends(get_db), token: str = Depends(oauth2)) -> Account:
    logger.debug(f"Validating token: {token[:20]}...")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        logger.debug(f"Token decoded, username: {username}")
        
        if username is None:
            logger.warning("Token payload missing 'sub' field")
            raise credentials_exception
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        raise credentials_exception
    
    # Query account từ database
    account = db.query(Account).filter(Account.Username == username).first()
    
    if account is None:
        logger.warning(f"Account not found for username: {username}")
        raise credentials_exception
    
    if account.Status != "ACTIVE":
        logger.warning(f"Account not active: {username}")
        raise HTTPException(status_code=401, detail="Account is not active")
    
    logger.debug(f"Authentication successful for: {username}")
    return account
```

### 3.2. Admin-only Routes

```python
# File: backend/app/auth/dependencies.py (dòng 47-54)
def get_current_admin_account(current_account: Account = Depends(get_current_account)) -> Account:
    """Dependency to ensure user has admin role (role_id = 1)"""
    if current_account.RoleID != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_account
```

**Sử dụng:**

```python
# File: backend/app/router/employee_router.py (dòng 17-26)
@router.get("/", response_model=List[EmployeeResponse])
def list_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    current_admin: Account = Depends(get_current_admin_account)  # Chỉ admin mới access
):
    """Lấy danh sách nhân viên (chỉ admin)"""
    service = EmployeeService(db)
    return service.get_employees(skip=skip, limit=limit)
```

---

## 4. SHOPPING FLOW (Mua hàng)

### 4.1. XEM DANH SÁCH SẢN PHẨM (Public - không cần login)

**Flow:**

```
Frontend (Shop.tsx)
    ↓ GET /products?skip=0&limit=50
Backend (public_router.py)
    ↓ Query database (product_variation JOIN product JOIN category JOIN brand)
    ↓ Lấy images của variation
Return: List[ProductVariationPublic]
```

**Chi tiết code:**

```typescript
// File: frontend/src/pages/user/Shop.tsx (dòng 81-85)
useEffect(() => {
    loadProducts();
    loadCategories();
    if (authService.isAuthenticated()) {
        loadCart();
    }
}, []);
```

```typescript
// File: frontend/src/pages/user/Shop.tsx (dòng 90-96)
const loadProducts = async () => {
    try {
        setLoading(true);
        const data = await publicProductService.getProducts(selectedCategory);
        setProducts(data);
    } catch (error) {
        console.error('Error loading products:', error);
    } finally {
        setLoading(false);
    }
};
```

```typescript
// File: frontend/src/services/publicProductService.ts (dòng 4-12)
getProducts: async (categoryId?: number) => {
    let url = '/products?skip=0&limit=50';
    if (categoryId) {
        url += `&category_id=${categoryId}`;
    }
    const response = await api.get(url);
    return response.data;
}
```

```python
# File: backend/app/router/public_router.py (dòng 13-30)
@router.get("/", response_model=List[ProductVariationPublic])
def list_product_variations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Lấy danh sách biến thể sản phẩm (công khai)"""
    service = PublicProductService(db)
    return service.get_product_variations(
        skip=skip,
        limit=limit,
        category_id=category_id,
        brand_id=brand_id,
        search=search
    )
```

```python
# File: backend/app/service/public_service.py (dòng ~30-60)
def get_product_variations(self, skip: int = 0, limit: int = 20, 
                          category_id: int = None, brand_id: int = None, 
                          search: str = None):
    """Lấy danh sách variation với filter"""
    
    query = self.db.query(Variation).join(Product)
    
    # Filter theo category
    if category_id:
        query = query.filter(Product.CategoryID == category_id)
    
    # Filter theo brand
    if brand_id:
        query = query.filter(Product.BrandID == brand_id)
    
    # Search theo tên
    if search:
        query = query.filter(Product.Name.ilike(f"%{search}%"))
    
    # Chỉ lấy active products và variations có stock > 0
    query = query.filter(
        Product.Status == "ACTIVE",
        Variation.Stock_Quantity > 0
    )
    
    variations = query.offset(skip).limit(limit).all()
    
    # Load images cho mỗi variation
    result = []
    for var in variations:
        images = self.db.query(Images).filter(
            Images.VariationID == var.PK_Variation
        ).all()
        
        result.append({
            "variation": var,
            "product": var.product,
            "images": images
        })
    
    return result
```

---

### 4.2. THÊM VÀO GIỎ HÀNG (Cần login)

**Flow:**

```
Frontend (Shop.tsx - handleAddToCart)
    ↓ Kiểm tra đã login chưa
    ↓ POST /cart/ { variation_id, quantity }
Backend (cart_router.py)
    ↓ get_current_customer_id dependency
    ↓ CartService.add_to_cart()
    ↓ Check variation tồn tại, đủ stock
    ↓ Insert/Update cart_variation
Return: CartItemResponse
```

**Chi tiết code:**

```typescript
// File: frontend/src/pages/user/Shop.tsx (dòng 170-195)
const handleAddToCart = async (variationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Kiểm tra đã login
    const token = authService.getToken();
    if (!token) {
        navigate('/login');
        return;
    }
    
    // Kiểm tra đã có trong giỏ hàng chưa
    if (cartVariations.includes(variationId)) return;
    
    try {
        await cartService.addToCart(variationId, 1);
        setCartVariations([...cartVariations, variationId]);
        await loadCart();  // Reload cart count
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart');
    }
};
```

```typescript
// File: frontend/src/services/cartService.ts (dòng 9-13)
addToCart: async (variationId: number, quantity: number) => {
    const response = await api.post('/cart/', {
        variation_id: variationId,
        quantity: quantity
    });
    return response.data;
}
```

```python
# File: backend/app/router/cart_router.py (dòng 27-36)
@router.post("/", response_model=CartItemResponse)
def add_to_cart(
    item: CartItemAdd, 
    customer_id: int = Depends(get_current_customer_id), 
    db: Session = Depends(get_db)
):
    """Thêm sản phẩm vào giỏ hàng"""
    service = CartService(db)
    return service.add_to_cart(customer_id, item.variation_id, item.quantity)
```

```python
# File: backend/app/service/cart_service.py (dòng ~40-80)
def add_to_cart(self, customer_id: int, variation_id: int, quantity: int):
    """Thêm variation vào giỏ hàng"""
    
    # Kiểm tra variation có tồn tại
    variation = self.db.query(Variation).filter(
        Variation.PK_Variation == variation_id
    ).first()
    
    if not variation:
        raise ValueError("Variation not found")
    
    # Kiểm tra stock
    if variation.Stock_Quantity < quantity:
        raise ValueError("Not enough stock")
    
    # Kiểm tra đã có trong giỏ hàng chưa
    existing = self.db.query(CartVariation).filter(
        CartVariation.CustomerID == customer_id,
        CartVariation.VariationID == variation_id
    ).first()
    
    if existing:
        # Update quantity
        existing.Quantity += quantity
        self.db.commit()
        return existing
    else:
        # Thêm mới
        cart_item = CartVariation(
            CustomerID=customer_id,
            VariationID=variation_id,
            Quantity=quantity
        )
        self.db.add(cart_item)
        self.db.commit()
        self.db.refresh(cart_item)
        return cart_item
```

```python
# File: backend/app/router/cart_router.py (dòng 15-22)
def get_current_customer_id(current_account=Depends(get_current_account), db: Session = Depends(get_db)):
    """Helper để lấy customer_id từ account hiện tại"""
    user_service = UserService(db)
    customer = user_service.get_user_profile(current_account.PK_Account)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    return customer.PK_Customer
```

---

### 4.3. XEM GIỎ HÀNG

**Flow:**

```
Frontend (Cart.tsx)
    ↓ GET /cart/
Backend (cart_router.py)
    ↓ get_current_customer_id
    ↓ CartService.get_cart(customer_id)
    ↓ Query cart_variation JOIN variation JOIN product
Return: List[CartItemResponse]
```

**Chi tiết code:**

```typescript
// File: frontend/src/pages/user/Cart.tsx (dòng 30-38)
const loadCart = async () => {
    try {
        setLoading(true);
        const data = await cartService.getCart();
        setCartItems(data);
    } catch (error) {
        console.error('Error loading cart:', error);
    } finally {
        setLoading(false);
    }
};
```

```python
# File: backend/app/router/cart_router.py (dòng 25-29)
@router.get("/", response_model=List[CartItemResponse])
def get_cart(customer_id: int = Depends(get_current_customer_id), db: Session = Depends(get_db)):
    """Lấy giỏ hàng của user"""
    service = CartService(db)
    return service.get_cart(customer_id)
```

```python
# File: backend/app/service/cart_service.py (dòng ~20-40)
def get_cart(self, customer_id: int):
    """Lấy tất cả items trong giỏ hàng"""
    
    cart_items = self.db.query(CartVariation).filter(
        CartVariation.CustomerID == customer_id
    ).all()
    
    result = []
    for item in cart_items:
        # Load variation và product info
        variation = self.db.query(Variation).filter(
            Variation.PK_Variation == item.VariationID
        ).first()
        
        if variation:
            product = variation.product  # Relationship
            images = self.db.query(Images).filter(
                Images.VariationID == variation.PK_Variation
            ).all()
            
            result.append({
                "cart_item": item,
                "variation": variation,
                "product": product,
                "images": images
            })
    
    return result
```

---

### 4.4. ĐẶT HÀNG (Checkout)

**Flow:**

```
Frontend (Cart.tsx - handleCheckout)
    ↓ POST /user/orders { payment_method_id, address_id }
Backend (user_order_router.py)
    ↓ get_current_customer_id
    ↓ OrderService.create_order_from_cart()
    ↓ BEGIN TRANSACTION
    ↓ 1. Tạo POSOrder
    ↓ 2. Lấy cart items
    ↓ 3. Tạo OrderLine cho mỗi item
    ↓ 4. Giảm Stock_Quantity của variation
    ↓ 5. Xóa cart items
    ↓ COMMIT
Return: OrderResponse
```

**Chi tiết code:**

```typescript
// File: frontend/src/pages/user/Cart.tsx (dòng 150-174)
const handleCheckout = async () => {
    if (cartItems.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    try {
        setLoading(true);
        
        // Tạo order từ cart
        await userService.createOrder({
            payment_method_id: 5,  // Cash
            address_id: undefined,
            note: ''
        });
        
        alert('Order created successfully!');
        navigate('/orders');
    } catch (error: any) {
        console.error('Error creating order:', error);
        alert(error.response?.data?.detail || 'Failed to create order');
    } finally {
        setLoading(false);
    }
};
```

```python
# File: backend/app/router/user_order_router.py (dòng 83-127)
@router.post("/", response_model=OrderResponse)
def create_order(
    order_data: OrderCreate,
    customer_id: int = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    """Tạo đơn hàng từ giỏ hàng"""
    service = OrderService(db)
    
    try:
        # Tạo order từ cart
        order = service.create_order_from_cart(
            customer_id=customer_id,
            payment_method_id=order_data.payment_method_id,
            address_id=order_data.address_id,
            note=order_data.note
        )
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")
```

```python
# File: backend/app/service/order_service.py (dòng ~150-250)
def create_order_from_cart(self, customer_id: int, payment_method_id: int, 
                          address_id: int = None, note: str = None):
    """Tạo đơn hàng từ giỏ hàng"""
    
    # Lấy cart items
    cart_items = self.db.query(CartVariation).filter(
        CartVariation.CustomerID == customer_id
    ).all()
    
    if not cart_items:
        raise ValueError("Cart is empty")
    
    # Tính tổng tiền
    total_amount = 0
    order_lines = []
    
    for cart_item in cart_items:
        variation = self.db.query(Variation).filter(
            Variation.PK_Variation == cart_item.VariationID
        ).first()
        
        if not variation:
            raise ValueError(f"Variation {cart_item.VariationID} not found")
        
        # Kiểm tra stock
        if variation.Stock_Quantity < cart_item.Quantity:
            raise ValueError(f"Not enough stock for {variation.product.Name}")
        
        subtotal = variation.Price * cart_item.Quantity
        total_amount += subtotal
        
        order_lines.append({
            "variation_id": variation.PK_Variation,
            "quantity": cart_item.Quantity,
            "unit_price": variation.Price,
            "subtotal": subtotal
        })
    
    # Tạo POSOrder
    db_order = POSOrder(
        CustomerID=customer_id,
        AddressID=address_id,
        PaymentMethodID=payment_method_id,
        Total_Amount=total_amount,
        Total_Payment=total_amount,
        Status="PENDING",
        Type_Order="ONLINE",
        Note=note,
        Order_Date=datetime.now()
    )
    self.db.add(db_order)
    self.db.flush()  # Lấy PK_POSOrder
    
    # Tạo OrderLines và giảm stock
    for line in order_lines:
        db_orderline = OrderLine(
            POSOrderID=db_order.PK_POSOrder,
            VariationID=line["variation_id"],
            Quantity=line["quantity"],
            Unit_Price=line["unit_price"],
            Subtotal=line["subtotal"]
        )
        self.db.add(db_orderline)
        
        # Giảm stock
        variation = self.db.query(Variation).filter(
            Variation.PK_Variation == line["variation_id"]
        ).first()
        variation.Stock_Quantity -= line["quantity"]
    
    # Xóa cart items
    for cart_item in cart_items:
        self.db.delete(cart_item)
    
    self.db.commit()
    self.db.refresh(db_order)
    
    return db_order
```

---

## 5. ORDER MANAGEMENT FLOW

### 5.1. XEM DANH SÁCH ĐƠN HÀNG (Customer)

**Flow:**

```
Frontend (Orders.tsx)
    ↓ GET /user/orders
Backend (user_order_router.py)
    ↓ get_current_customer_id
    ↓ OrderService.get_orders(customer_id)
    ↓ Query POSOrder WHERE CustomerID = ?
Return: List[OrderResponse]
```

**Chi tiết code:**

```typescript
// File: frontend/src/pages/user/Orders.tsx (dòng 25-34)
const loadOrders = async () => {
    try {
        const data = await userService.getOrders();
        // Sắp xếp đơn mới nhất lên đầu
        setOrders(data.sort((a: any, b: any) => b.PK_POSOrder - a.PK_POSOrder));
    } catch (error) {
        console.error('Error loading orders:', error);
    } finally {
        setLoading(false);
    }
};
```

```python
# File: backend/app/router/user_order_router.py (dòng 24-38)
@router.get("/", response_model=List[OrderResponse])
def get_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    status: Optional[str] = None,
    customer_id: int = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    """Lấy danh sách đơn hàng của customer"""
    service = OrderService(db)
    orders = service.get_orders(
        customer_id=customer_id,
        skip=skip,
        limit=limit,
        status=status
    )
    return orders
```

```python
# File: backend/app/service/order_service.py (dòng ~50-80)
def get_orders(self, customer_id: int = None, skip: int = 0, limit: int = 50, status: str = None):
    """Lấy danh sách đơn hàng"""
    
    query = self.db.query(POSOrder)
    
    # Filter theo customer (nếu là customer)
    if customer_id:
        query = query.filter(POSOrder.CustomerID == customer_id)
    
    # Filter theo status
    if status:
        query = query.filter(POSOrder.Status == status)
    
    # Sort theo ngày mới nhất
    query = query.order_by(POSOrder.Order_Date.desc())
    
    orders = query.offset(skip).limit(limit).all()
    
    return orders
```

---

### 5.2. XEM CHI TIẾT ĐƠN HÀNG

**Flow:**

```
Frontend (OrderDetail.tsx)
    ↓ GET /user/orders/{order_id}
Backend (user_order_router.py)
    ↓ get_current_customer_id
    ↓ OrderService.get_order_by_id(order_id)
    ↓ Kiểm tra order thuộc về customer
    ↓ GET /user/orders/{order_id}/items
    ↓ OrderService.get_order_lines(order_id)
Return: OrderResponse + List[OrderLineResponse]
```

**Chi tiết code:**

```typescript
// File: frontend/src/pages/user/OrderDetail.tsx (dòng 35-58)
const loadOrder = async () => {
    if (!orderId) return;
    
    try {
        setLoading(true);
        
        // Lấy thông tin order
        const orderData = await userService.getOrderById(parseInt(orderId));
        setOrder(orderData);
        
        // Lấy danh sách items trong order
        const itemsData = await userService.getOrderItems(parseInt(orderId));
        setOrderItems(itemsData);
    } catch (error) {
        console.error('Error loading order:', error);
        setError('Failed to load order details');
    } finally {
        setLoading(false);
    }
};
```

```python
# File: backend/app/router/user_order_router.py (dòng 52-66)
@router.get("/{order_id}", response_model=OrderResponse)
def get_order_detail(
    order_id: int,
    customer_id: int = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    """Lấy chi tiết đơn hàng"""
    service = OrderService(db)
    order = service.get_order_by_id(order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Kiểm tra order có thuộc customer không
    if order.CustomerID != customer_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return order
```

```python
# File: backend/app/router/user_order_router.py (dòng 68-81)
@router.get("/{order_id}/items", response_model=List[OrderLineResponse])
def get_order_items(
    order_id: int,
    customer_id: int = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    """Lấy danh sách sản phẩm trong đơn hàng"""
    service = OrderService(db)
    order = service.get_order_by_id(order_id)
    
    if not order or order.CustomerID != customer_id:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return service.get_order_lines(order_id)
```

---

## 6. ADMIN FLOW

### 6.1. QUẢN LÝ SẢN PHẨM (Products)

**Flow CRUD:**

#### GET - Lấy danh sách

```
Frontend (ProductList.tsx)
    ↓ GET /admin/products?skip=0&limit=10
Backend (product_router.py)
    ↓ Requires: get_current_account (có token)
    ↓ ProductService.get_products()
    ↓ Query Product JOIN Category JOIN Brand
Return: List[ProductResponse]
```

```python
# File: backend/app/router/product_router.py (dòng 15-30)
@router.get("/", response_model=List[ProductResponse])
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    name: Optional[str] = None,
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    logger.info(f"GET /admin/products - skip={skip}, limit={limit}")
    service = ProductService(db)
    products = service.get_products(skip=skip, limit=limit, name=name, 
                                    category_id=category_id, brand_id=brand_id)
    logger.info(f"GET /admin/products - returned {len(products)} products")
    return products
```

#### POST - Tạo mới

```
Frontend
    ↓ POST /admin/products { name, description, category_id, brand_id }
Backend
    ↓ ProductService.create_product()
    ↓ INSERT INTO product
Return: ProductResponse
```

```python
# File: backend/app/router/product_router.py (dòng 45-51)
@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    logger.info(f"POST /admin/products - Creating product: {product.name}")
    service = ProductService(db)
    created = service.create_product(product)
    logger.info(f"POST /admin/products - Product created with ID: {created.id}")
    return created
```

#### PUT - Cập nhật

```
Frontend
    ↓ PUT /admin/products/{product_id} { name, ... }
Backend
    ↓ ProductService.update_product(product_id, data)
    ↓ UPDATE product SET ... WHERE id = ?
Return: ProductResponse
```

#### DELETE - Xóa

```
Frontend
    ↓ DELETE /admin/products/{product_id}
Backend
    ↓ ProductService.delete_product(product_id)
    ↓ DELETE FROM product WHERE id = ?
Return: { message: "success" }
```

---

### 6.2. UPLOAD HÌNH ẢNH CHO VARIATION

**Flow:**

```
Frontend (VariationList.tsx)
    ↓ POST /admin/variations/{variation_id}/upload-image
    ↓ FormData { file: File }
Backend (variation_router.py)
    ↓ Lưu file vào static/images/{variation_id}_{filename}
    ↓ INSERT INTO images (VariationID, ImageURL)
Return: { message, image_url }
```

**Chi tiết code:**

```python
# File: backend/app/router/variation_router.py (dòng 62-100)
@router.post("/{variation_id}/upload-image", response_model=dict)
def upload_variation_image(
    variation_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload hình ảnh cho variation"""
    
    # Kiểm tra variation tồn tại
    service = VariationService(db)
    variation = service.get_variation_by_id(variation_id)
    if not variation:
        raise HTTPException(status_code=404, detail="Variation not found")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Tạo filename unique
    file_extension = Path(file.filename).suffix
    unique_filename = f"{variation_id}_{file.filename}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Lưu file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Lưu vào database
    image_url = f"/static/images/{unique_filename}"
    db_image = Images(
        VariationID=variation_id,
        ImageURL=image_url
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    return {
        "message": "Image uploaded successfully",
        "image_url": image_url,
        "image_id": db_image.PK_Images
    }
```

---

## 7. DATABASE SCHEMA

### Bảng chính:

1. **role** - Vai trò (Admin, Employee, Customer)
2. **account** - Tài khoản đăng nhập
3. **customer** - Thông tin khách hàng
4. **employee** - Thông tin nhân viên
5. **category** - Danh mục sản phẩm
6. **brand** - Thương hiệu
7. **product** - Sản phẩm
8. **variation** - Biến thể sản phẩm (size, color, ...)
9. **images** - Hình ảnh variation
10. **cart_variation** - Giỏ hàng
11. **posorder** - Đơn hàng
12. **orderline** - Chi tiết đơn hàng
13. **payment_method** - Phương thức thanh toán
14. **province, district, ward** - Địa chỉ
15. **address** - Địa chỉ giao hàng của customer

### Relationships:

```
account (1) → (1) customer
account (1) → (1) employee
product (N) → (1) category
product (N) → (1) brand
variation (N) → (1) product
images (N) → (1) variation
cart_variation (N) → (1) customer
cart_variation (N) → (1) variation
posorder (N) → (1) customer
posorder (N) → (1) payment_method
orderline (N) → (1) posorder
orderline (N) → (1) variation
```

---

## 8. AXIOS INTERCEPTOR (Frontend)

### Request Interceptor - Tự động thêm token

```typescript
// File: frontend/src/config/api.ts (dòng 24-31)
api.interceptors.request.use((config) => {
    const tokenKey = getTokenKey();  // 'admin_token' hoặc 'user_token'
    const token = localStorage.getItem(tokenKey);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### Response Interceptor - Auto redirect khi 401

```typescript
// File: frontend/src/config/api.ts (dòng 34-43)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
            const tokenKey = getTokenKey();
            localStorage.removeItem(tokenKey);
            window.location.href = tokenKey === 'admin_token' ? '/admin/login' : '/login';
        }
        return Promise.reject(error);
    }
);
```

---

## 9. ROUTING (Frontend)

### Public Routes (Không cần login):
- `/login` - Customer login
- `/register` - Đăng ký
- `/forgot-password` - Quên mật khẩu
- `/admin/login` - Admin login
- `/shop` - Xem sản phẩm
- `/variation/:id` - Chi tiết sản phẩm

### Protected Routes - User (Cần login):
- `/cart` - Giỏ hàng
- `/orders` - Danh sách đơn hàng
- `/orders/:orderId` - Chi tiết đơn hàng
- `/profile` - Thông tin cá nhân

### Protected Routes - Admin (Cần login + role admin/employee):
- `/admin/products` - Quản lý sản phẩm
- `/admin/categories` - Quản lý danh mục
- `/admin/brands` - Quản lý thương hiệu
- `/admin/variations` - Quản lý biến thể
- `/admin/customers` - Quản lý khách hàng
- `/admin/employees` - Quản lý nhân viên
- `/admin/orders` - Quản lý đơn hàng
- `/admin/pos` - Bán hàng tại quầy

```typescript
// File: frontend/src/App.tsx (dòng 25-32)
function UserProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
```

```typescript
// File: frontend/src/App.tsx (dòng 18-23)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
```

---

## 10. TÓM TẮT FLOW CHÍNH

### Authentication:
1. User nhập username/password → Frontend gửi POST /auth/login
2. Backend verify password (Argon2) → Tạo JWT token
3. Frontend lưu token vào localStorage (admin_token hoặc user_token)
4. Mọi request sau đều gửi kèm token trong header Authorization

### Shopping:
1. Browse products (public) → GET /products
2. Add to cart (protected) → POST /cart/ + token
3. View cart → GET /cart/ + token
4. Checkout → POST /user/orders + token → Tạo order, giảm stock, xóa cart

### Admin:
1. Login admin → Lưu admin_token
2. CRUD operations → Gửi request với admin_token
3. Upload images → POST multipart/form-data với file

### Security:
- Password hash: Argon2
- JWT token: HS256
- Token validation: Mỗi protected route check token
- Role-based access: Admin endpoint check RoleID = 1
- CORS: Chỉ cho phép frontend domain
