ALTER TABLE orders ADD COLUMN user_order_number INT NULL AFTER user_id;

UPDATE orders o
JOIN (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS rn
  FROM orders
) ranked ON o.id = ranked.id
SET o.user_order_number = ranked.rn;

ALTER TABLE orders MODIFY COLUMN user_order_number INT NOT NULL;
ALTER TABLE orders ADD UNIQUE KEY uniq_user_order_number (user_id, user_order_number);
