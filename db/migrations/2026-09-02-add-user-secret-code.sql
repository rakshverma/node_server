SET @secret_code_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tbl_users'
    AND COLUMN_NAME = 'secret_code'
);

SET @secret_code_sql = IF(
  @secret_code_exists = 0,
  'ALTER TABLE tbl_users ADD COLUMN secret_code varchar(100) DEFAULT NULL AFTER password',
  'SELECT 1'
);

PREPARE secret_code_stmt FROM @secret_code_sql;
EXECUTE secret_code_stmt;
DEALLOCATE PREPARE secret_code_stmt;
