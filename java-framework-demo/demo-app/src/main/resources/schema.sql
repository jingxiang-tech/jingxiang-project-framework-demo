-- SKU 全局唯一，是并发下的最终防线，不能只靠先查再插。
CREATE TABLE IF NOT EXISTS product (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '商品 ID',
    sku VARCHAR(32) NOT NULL COMMENT '商品编码',
    name VARCHAR(80) NOT NULL COMMENT '商品名称',
    price DECIMAL(10, 2) NOT NULL COMMENT '单价，单位元',
    product_status VARCHAR(32) NOT NULL COMMENT '商品状态：ON_SALE 在售，OFF_SALE 下架',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除：0 否，1 是',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    CONSTRAINT uk_product_sku UNIQUE (sku),
    CONSTRAINT ck_product_price CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品';

-- 已有库仍是 status 列时改名。新库建表时已经是 product_status，这条语句不执行。
SET @rename_product_status = (
    SELECT IF(
               COUNT(*) > 0,
               'ALTER TABLE product RENAME COLUMN status TO product_status',
               'SELECT 1'
           )
      FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'product'
       AND COLUMN_NAME = 'status'
);
PREPARE rename_product_status_stmt FROM @rename_product_status;
EXECUTE rename_product_status_stmt;
DEALLOCATE PREPARE rename_product_status_stmt;

INSERT INTO product (sku, name, price, product_status)
SELECT seed.sku,
       seed.name,
       seed.price,
       seed.product_status
  FROM (
       SELECT 'DEMO-001' AS sku, '陶瓷马克杯' AS name, 19.90 AS price, 'ON_SALE' AS product_status
       UNION ALL SELECT 'DEMO-002', '不锈钢保温杯', 59.00, 'ON_SALE'
       UNION ALL SELECT 'DEMO-003', '玻璃冷水壶', 45.00, 'ON_SALE'
       UNION ALL SELECT 'DEMO-004', '竹制茶盘', 88.00, 'OFF_SALE'
       UNION ALL SELECT 'DEMO-005', '手冲咖啡壶', 128.00, 'ON_SALE'
       UNION ALL SELECT 'DEMO-006', '滤纸一盒', 16.80, 'ON_SALE'
       UNION ALL SELECT 'DEMO-007', '电子秤', 39.90, 'ON_SALE'
       UNION ALL SELECT 'DEMO-008', '亚麻围裙', 49.00, 'OFF_SALE'
       UNION ALL SELECT 'DEMO-009', '铸铁平底锅', 168.00, 'ON_SALE'
       UNION ALL SELECT 'DEMO-010', '硅胶铲', 22.50, 'ON_SALE'
       UNION ALL SELECT 'DEMO-011', '砧板', 35.00, 'ON_SALE'
       UNION ALL SELECT 'DEMO-012', '密封罐三件套', 42.00, 'OFF_SALE'
       UNION ALL SELECT 'DEMO-013', '香薰蜡烛', 29.90, 'ON_SALE'
       UNION ALL SELECT 'DEMO-014', '棉麻桌旗', 56.00, 'ON_SALE'
       UNION ALL SELECT 'DEMO-015', '陶瓷花瓶', 79.00, 'OFF_SALE'
       UNION ALL SELECT 'DEMO-016', '台灯', 99.00, 'ON_SALE'
       UNION ALL SELECT 'DEMO-017', '收纳篮', 26.00, 'ON_SALE'
       UNION ALL SELECT 'DEMO-018', '懒人沙发', 259.00, 'OFF_SALE'
       UNION ALL SELECT 'DEMO-019', '抱枕', 33.00, 'ON_SALE'
       UNION ALL SELECT 'DEMO-020', '羊毛毯', 189.00, 'ON_SALE'
       ) AS seed
 WHERE NOT EXISTS (
       SELECT 1
         FROM product
        WHERE product.sku = seed.sku
 );
