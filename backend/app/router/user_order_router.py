from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_account
from app.database.session import get_db
from app.schema.order_schema import OrderCreate, OrderLineResponse, OrderResponse
from app.service.order_service import OrderService
from app.service.user_service import UserService

router = APIRouter(prefix="/user/orders", tags=["User - Orders"])


def get_current_customer_id(current_account=Depends(get_current_account), db: Session = Depends(get_db)):
    """Helper để lấy customer_id từ account hiện tại"""
    user_service = UserService(db)
    customer = user_service.get_user_profile(current_account.PK_Account)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    return customer.PK_Customer


@router.get("/", response_model=List[OrderResponse])
def get_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    status: Optional[str] = None,
    customer_id: int = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    """Lấy danh sách đơn hàng của user"""
    from app.model.posorder_model import POSOrder

    query = db.query(POSOrder).filter(POSOrder.CustomerID == customer_id)

    if status:
        query = query.filter(POSOrder.Status == status)

    orders = query.order_by(POSOrder.Creation_date.desc()).offset(skip).limit(limit).all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_detail(order_id: int, customer_id: int = Depends(get_current_customer_id), db: Session = Depends(get_db)):
    """Lấy chi tiết đơn hàng"""
    from app.model.posorder_model import POSOrder

    order = db.query(POSOrder).filter(POSOrder.PK_POSOrder == order_id, POSOrder.CustomerID == customer_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/{order_id}/items", response_model=List[OrderLineResponse])
def get_order_items(order_id: int, customer_id: int = Depends(get_current_customer_id), db: Session = Depends(get_db)):
    """Lấy danh sách sản phẩm trong đơn hàng"""
    from app.model.posorder_model import POSOrder

    # Verify order belongs to customer
    order = db.query(POSOrder).filter(POSOrder.PK_POSOrder == order_id, POSOrder.CustomerID == customer_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    service = OrderService(db)
    return service.get_order_lines(order_id)


@router.post("/", response_model=OrderResponse)
def create_order(order_data: dict, customer_id: int = Depends(get_current_customer_id), db: Session = Depends(get_db)):
    """Tạo đơn hàng mới từ giỏ hàng"""
    from app.model.cart_variation_model import CartVariation
    from app.model.variation_model import Variation
    from app.service.cart_service import CartService

    # Get cart items
    cart_service = CartService(db)
    cart_items = cart_service.get_cart_items(customer_id)

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Build order lines from cart
    order_lines = []
    for cart_item in cart_items:
        cart_var = db.query(CartVariation).filter(CartVariation.CartItemID == cart_item.PK_CartItem).first()
        if cart_var:
            variation = db.query(Variation).filter(Variation.PK_Variation == cart_var.VariationID).first()
            if variation:
                order_lines.append(
                    {"VariationID": cart_var.VariationID, "Quantity": cart_item.Quantity, "Unit_Price": variation.Price}
                )

    # Create order
    order = OrderCreate(
        CustomerID=customer_id,
        EmployeeID=None,
        PaymentMethodID=order_data.get("payment_method_id", 5),  # Default to Cash
        Note=order_data.get("note", ""),
        Type_Order="Online",
        order_lines=order_lines,
    )

    service = OrderService(db)
    try:
        new_order = service.create_order(order)
        # Clear cart after successful order
        cart_service.clear_cart(customer_id)
        return new_order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_my_order(order_id: int, customer_id: int = Depends(get_current_customer_id), db: Session = Depends(get_db)):
    """Hủy đơn hàng của user (chỉ user chủ sở hữu mới được hủy)"""
    from app.model.posorder_model import POSOrder

    # Verify order belongs to customer
    order = db.query(POSOrder).filter(POSOrder.PK_POSOrder == order_id, POSOrder.CustomerID == customer_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    service = OrderService(db)
    cancelled = service.cancel_order(order_id)
    if not cancelled:
        raise HTTPException(status_code=400, detail="Order not found or already cancelled")
    return cancelled
