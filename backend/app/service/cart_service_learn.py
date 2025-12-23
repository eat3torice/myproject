# from sqlalchemy.orm import Session

# from app.model.cart_variation_model import CartVariation
# from app.model.cartitem_model import CartItem
# from app.model.variation_model import Variation
# from app.schema.cart_schema import CartItemAdd
# import logging

# logger = logging.getLogger(__name__)
# logger.setLevel(logging.DEBUG)

# class CartServiceLearn:
#     def __init__(self, db: Session):
#         self.db = db    
    
#     def list_cart(self, customer_id: int):
#         carts = self.db.query(CartItem).filter(CartItem.Customer_id == customer_id).all()
#         logger.info(f"Listing cart items for customer ID: {customer_id}")
#         for idx, c in enumerate(carts , 1):
#             logger.info(f"[{idx}] CartItem ID:{c.PK_CartItem} Qty:{c.Quantity} Status:{c.Status}")
#         return carts

#     def add_to_cart(self, customer_id: int, cart_item : CartItemAdd):
#         #kiem tra ton kho 
#         variation = self.db.query(Variation).filter(Variation.PK_Variation == cart_item.variation_id).first()
#         if not variation:
#             logger.error(f"Product variation ID {cart_item.variation_id} not found")
#             raise ValueError("Product variation not found")
#         if variation.Quantity < cart_item.quantity:
#             logger.error(f"Not enough stock for variation ID {cart_item.variation_id}. Requested: {cart_item.quantity}, Available: {variation.Quantity}")
#             raise ValueError("Not enough stock")
        
#         #kiem tra sp da co trong gio hang chua
#         exiting_cart_item = (
#             self.db.query(CartItem)
#             .filter(CartItem.Customer_id == customer_id, CartItem.Status =="ACTIVE")
#             .join(CartVariation)
#             .filter(CartVariation.VariationID == cart_item.variation_id)
#             .first()
#         )
#         if exiting_cart_item:
#             #update so luong
#             exiting_cart_item.Quantity += cart_item.quantity
#             self.db.commit()
#             self.db.refresh(exiting_cart_item)
#             logger.info(f"Updated CartItem ID:{exiting_cart_item.PK_CartItem} new Qty:{exiting_cart_item.Quantity}")
#             return exiting_cart_item
#         else:
#             #tao moi cart item 
#             new_cart_item = CartItem(Customer_id = customer_id, Quantity = cart_item.quantity, Status="ACTIVE")
#             self.db.add(new_cart_item)
#             self.db.flush()
#             #tao mapping cart_variation
#             cart_var = CartVariation(CartItemID=new_cart_item.PK_CartItem, VariationID=cart_item.variation_id)
#             self.db.add(cart_var)
#             self.db.commit()
#             self.db.refresh(new_cart_item)
#             logger.info(f"Added new CartItem ID:{new_cart_item.PK_CartItem} Qty:{new_cart_item.Quantity}")
#             return new_cart_item

#     def update_cart_item(self, cart_item_id: int, customer_id: int, quantity: int):
#         #cap nhat so luong trong gio hang, kiem tra ton kho
#         cart_item = (
#             self.db.query(CartItem)
#             .filter(CartItem.PK_CartItem == cart_item_id, CartItem.Customer_id == customer_id)
#             .first()

#         ) 
#         if not cart_item:
#             logger.error(f"CartItem ID {cart_item_id} for Customer ID {customer_id} not found")
#             raise ValueError("Cart item not found")
#             return None
#         #lay variation tu cart_variation
#         cart_var = self.db.query(CartVariation).filter(CartVariation.CartItemID == cart_item_id).first()
#         if not cart_var:
#             logger.error(f"CartVariation for CartItem ID {cart_item_id} not found")
#             raise ValueError("Cart variation not found")
#             return None
#         # Lay variation de kiem tra ton kho
#         variation = self.db.query(Variation).filter(Variation.PK_Variation == cart_var.VariationID).first()
#         if not variation:
#             logger.error(f"Variation ID {cart_var.VariationID} not found")
#             raise ValueError("Product variation not found")
#             return None
#         if quantity > variation.Quantity:
#             logger.error(f"Not enough stock for Variation ID {variation.PK_Variation}. Requested: {quantity}, Available: {variation.Quantity}")
#             raise ValueError("Not enough stock")
        
#         if quantity <= 0:
#             # Xoa cart item
#             self.db.delete(cart_item)
#             self.db.commit()
#             logger.info(f"Deleted CartItem ID:{cart_item_id} as quantity set to {quantity}")
#             return None
#         else:
#             cart_item.Quantity = quantity
#             self.db.commit()
#             self.db.refresh(cart_item)
#             logger.info(f"Updated CartItem ID:{cart_item_id} to new Qty:{quantity}")
#             return cart_item
#     def remove_from_cart(self, customer_id: int):
#         #xoa san phan khoi  gio hang
#         cart_item = (
#             self.db.query(CartItem)
#             .filter(CartItem.Customer_id==customer_id)
#             .first()
#         )
#         if not cart_item:
#             logger.info(f"No cart items found for Customer ID {customer_id} to clear")
#             return
#         self.db.delete(cart_item)
#         self.db.commit()
#         logger.info(f"Cleared cart for Customer ID:{customer_id}")
    
#     def clear_cart(self, customer_id: int):
#         #xoa toan bo san pham khoi gio hanh
#         cart_items =  self.db.query(CartItem).filter(CartItem.Customer_id == customer_id) .delete()
#         self.db.commit()
#         logger.info(f"Cleared all cart items for Customer ID:{customer_id}")
#         return True
           
           
        