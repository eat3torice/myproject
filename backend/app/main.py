from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles

import app.model  # Đảm bảo model được load trước
import app.model.address_model  # Import address models explicitly
from app.database.base_class import Base
from app.database.session import engine
from app.router import (
    address_router,
    auth_router,
    brand_router,
    cart_router,
    category_router,
    customer_router,
    employee_router,
    images_router,
    order_router,
    product_router,
    public_router,
    user_order_router,
    user_router,
    variation_router,
)

app = FastAPI(title="Auth Service API", version="0.1.0")

# Cho phép frontend truy cập API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://myproject-d8ri.onrender.com",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Backend is running"}


# ✅ Tạo bảng DB
Base.metadata.create_all(bind=engine)

# Import router
# Auth
app.include_router(auth_router.router)

# Admin routes
app.include_router(product_router.router)
app.include_router(category_router.router)
app.include_router(brand_router.router)
app.include_router(variation_router.router)
app.include_router(images_router.router)
app.include_router(customer_router.router)
app.include_router(employee_router.router)
app.include_router(order_router.router)

# User routes
app.include_router(user_router.router)
app.include_router(public_router.router)
app.include_router(cart_router.router)
app.include_router(user_order_router.router)
app.include_router(address_router.router)

# Serve static files (mount AFTER routers to avoid path conflicts)
app.mount("/static", StaticFiles(directory="static"), name="static")


# ✅ Thêm security scheme để hiện nút "Authorize 🔒"
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
    }

    for path in openapi_schema["paths"].values():
        for method in path.values():
            method.setdefault("security", [{"BearerAuth": []}])

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
