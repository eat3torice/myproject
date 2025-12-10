# Tips để cải thiện tốc độ load dữ liệu

## 1. DATABASE OPTIMIZATION

### Đã tạo file: `add_indexes.sql` và `add_indexes.py`
Chạy ngay:
```bash
cd backend
$env:DATABASE_URL='postgresql://test_l19f_user:...' 
python add_indexes.py
```

**Lợi ích**: Giảm thời gian query từ 100-500ms xuống 5-50ms

---

## 2. BACKEND OPTIMIZATION

### A. Enable Response Caching
Thêm vào `main.py`:
```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache

@router.get("/products/")
@cache(expire=300)  # Cache 5 phút
async def get_products():
    ...
```

### B. Use eager loading trong SQLAlchemy
Trong service files, thay:
```python
products = db.query(Product).all()
```
Bằng:
```python
from sqlalchemy.orm import joinedload

products = db.query(Product)\
    .options(joinedload(Product.category))\
    .options(joinedload(Product.brand))\
    .all()
```

### C. Giảm số lượng queries N+1
Ví dụ trong `cart_router.py`, thay vì query từng variation:
```python
# Tối ưu hóa bằng cách join một lần
items = db.query(CartItem)\
    .join(CartVariation)\
    .join(Variation)\
    .filter(CartItem.Customer_id == customer_id)\
    .all()
```

---

## 3. FRONTEND OPTIMIZATION

### A. Implement Virtual Scrolling
Cho danh sách dài (products, variations):
```bash
npm install react-window
```

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
    height={600}
    itemCount={products.length}
    itemSize={120}
>
    {({ index, style }) => (
        <div style={style}>{products[index]}</div>
    )}
</FixedSizeList>
```

### B. Image Lazy Loading
Thêm vào img tags:
```tsx
<img 
    src={imageUrl} 
    loading="lazy"
    decoding="async"
/>
```

### C. React Query cho caching
```bash
npm install @tanstack/react-query
```

```tsx
import { useQuery } from '@tanstack/react-query';

function ProductList() {
    const { data, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: productService.getAll,
        staleTime: 5 * 60 * 1000, // Cache 5 phút
    });
}
```

### D. Debounce search
```tsx
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedSearch = useMemo(
    () => debounce((value) => {
        // API call
    }, 300),
    []
);
```

---

## 4. API OPTIMIZATION

### A. Giảm payload size - chỉ trả về fields cần thiết
Backend:
```python
@router.get("/products/list")
def get_product_list():
    # Chỉ lấy PK, Name, Price thay vì toàn bộ
    products = db.query(
        Product.PK_Product,
        Product.Name,
        Product.Images
    ).all()
    return products
```

### B. Implement infinite scroll
Frontend pagination:
```tsx
const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
    const newData = await productService.getAll({
        skip: page * 20,
        limit: 20
    });
    if (newData.length < 20) setHasMore(false);
    setProducts([...products, ...newData]);
    setPage(page + 1);
};
```

---

## 5. NETWORK OPTIMIZATION

### A. Enable Gzip compression
Backend `main.py`:
```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### B. HTTP/2
Render đã enable HTTP/2 by default ✅

---

## 6. RENDER-SPECIFIC OPTIMIZATION

### A. Upgrade instance type
- Hiện tại: Free tier (512MB RAM, 0.1 CPU)
- Nâng cấp: Starter ($7/mo - 512MB RAM, 0.5 CPU)

### B. Add Redis cache
Render Redis addon ($7/mo):
```yaml
# render.yaml
services:
  - type: redis
    name: myproject-redis
    plan: starter
```

---

## 7. MONITORING

### A. Add performance logging
```python
import time
from functools import wraps

def timing_middleware(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.time()
        result = await func(*args, **kwargs)
        print(f"{func.__name__}: {time.time() - start:.3f}s")
        return result
    return wrapper
```

---

## PRIORITY ACTIONS (Làm ngay):

1. ✅ **Chạy add_indexes.py** - Tác động lớn nhất
2. ✅ **Thêm GZipMiddleware** - 2 dòng code
3. ✅ **Lazy load images** - Thêm `loading="lazy"`
4. ⚠️  **Enable eager loading** - Tối ưu N+1 queries
5. ⚠️  **React Query** - Cache frontend

## Kết quả mong đợi:
- Products load: 2-3s → **0.5-1s**
- Cart operations: 1-2s → **0.3-0.5s**
- Image loading: **50-70% faster**
