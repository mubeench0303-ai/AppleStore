ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE AFTER role;

-- Existing accounts (seed admin/demo, etc.) stay usable without re-verifying.
UPDATE users SET is_verified = TRUE;

CREATE TABLE verification_codes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verification_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_verification_codes_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
