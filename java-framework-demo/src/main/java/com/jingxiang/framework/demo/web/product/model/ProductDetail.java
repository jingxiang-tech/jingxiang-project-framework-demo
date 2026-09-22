package com.jingxiang.framework.demo.web.product.model;

import com.jingxiang.component.common.dict.convert.DictSerialize;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品详情。
 */
@Getter
@Setter
public class ProductDetail {

    /** 商品 ID */
    private Long id;

    /** 商品编码 */
    private String sku;

    /** 商品名称 */
    private String name;

    /** 单价，单位元 */
    private BigDecimal price;

    /** 商品状态 */
    @DictSerialize(ProductStatusEnum.class)
    private ProductStatusEnum status;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}
