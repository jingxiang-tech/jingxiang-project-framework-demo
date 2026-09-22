package com.jingxiang.framework.demo.web.product.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品持久化对象，不直接返回给前端。
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("product")
public class ProductPo {

    /** 商品 ID */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 商品编码 */
    private String sku;

    /** 商品名称 */
    private String name;

    /** 单价，单位元 */
    private BigDecimal price;

    /** 商品状态 */
    private ProductStatusEnum status;

    /** 是否删除：0 否，1 是 */
    private Integer deleted;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}
