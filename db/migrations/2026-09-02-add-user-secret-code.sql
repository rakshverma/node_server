ALTER TABLE tbl_users
  ADD COLUMN IF NOT EXISTS secret_code varchar(100) DEFAULT NULL;
