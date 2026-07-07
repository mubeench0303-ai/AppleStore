ALTER TABLE reviews DROP INDEX uniq_user_product;
ALTER TABLE reviews DROP FOREIGN KEY fk_reviews_order;
ALTER TABLE reviews DROP COLUMN order_id;
