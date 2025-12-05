-- Add indexes for better query performance
-- Run this on your Render PostgreSQL database

-- Account indexes
CREATE INDEX IF NOT EXISTS idx_account_roleid ON account(roleid);
CREATE INDEX IF NOT EXISTS idx_account_status ON account(status);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_product_categoryid ON product(categoryid);
CREATE INDEX IF NOT EXISTS idx_product_brandid ON product(brandid);
CREATE INDEX IF NOT EXISTS idx_product_status ON product(status);

-- Variation indexes
CREATE INDEX IF NOT EXISTS idx_variation_productid ON variation(productid);
CREATE INDEX IF NOT EXISTS idx_variation_status ON variation(status);

-- CartItem indexes
CREATE INDEX IF NOT EXISTS idx_cartitem_customerid ON cartitem(customer_id);
CREATE INDEX IF NOT EXISTS idx_cartitem_status ON cartitem(status);

-- Cart Variation indexes
CREATE INDEX IF NOT EXISTS idx_cart_variation_cartitemid ON cart_variation(cartitem_id);
CREATE INDEX IF NOT EXISTS idx_cart_variation_variationid ON cart_variation(variation_id);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_posorder_customerid ON posorder(customerid);
CREATE INDEX IF NOT EXISTS idx_posorder_employeeid ON posorder(employeeid);
CREATE INDEX IF NOT EXISTS idx_posorder_status ON posorder(status);
CREATE INDEX IF NOT EXISTS idx_posorder_order_date ON posorder(order_date DESC);

-- OrderLine indexes
CREATE INDEX IF NOT EXISTS idx_orderline_orderid ON orderline(orderid);
CREATE INDEX IF NOT EXISTS idx_orderline_variationid ON orderline(variationid);

-- Images indexes
CREATE INDEX IF NOT EXISTS idx_images_productid ON images(productid);
CREATE INDEX IF NOT EXISTS idx_images_variationid ON images(variationid);
CREATE INDEX IF NOT EXISTS idx_images_set_default ON images(set_default);

-- Address indexes
CREATE INDEX IF NOT EXISTS idx_address_customerid ON address(customerid);
CREATE INDEX IF NOT EXISTS idx_address_is_default ON address(is_default);
CREATE INDEX IF NOT EXISTS idx_address_provinceid ON address(provinceid);
CREATE INDEX IF NOT EXISTS idx_address_districtid ON address(districtid);
CREATE INDEX IF NOT EXISTS idx_address_wardid ON address(wardid);

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customer_accountid ON customer(accountid);
CREATE INDEX IF NOT EXISTS idx_customer_status ON customer(status);

-- Employee indexes
CREATE INDEX IF NOT EXISTS idx_employee_accountid ON employee(accountid);
CREATE INDEX IF NOT EXISTS idx_employee_status ON employee(status);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_variation_product_status ON variation(productid, status);
CREATE INDEX IF NOT EXISTS idx_posorder_customer_status ON posorder(customerid, status);
CREATE INDEX IF NOT EXISTS idx_images_variation_default ON images(variationid, set_default);

-- Analyze tables for better query planning
ANALYZE account;
ANALYZE product;
ANALYZE variation;
ANALYZE cartitem;
ANALYZE cart_variation;
ANALYZE posorder;
ANALYZE orderline;
ANALYZE images;
ANALYZE address;
ANALYZE customer;
ANALYZE employee;
