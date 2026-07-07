ALTER TABLE reviews
  ADD COLUMN order_id BIGINT UNSIGNED NULL AFTER user_id,
  ADD CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

ALTER TABLE reviews
  ADD UNIQUE KEY uniq_user_product (user_id, product_id);
