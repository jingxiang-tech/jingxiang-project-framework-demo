package com.jingxiang.framework.demo.web.product.model;

import com.jingxiang.component.common.dict.convert.DictSerialize;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品列表项。
 */
@Getter
@Setter
public class ProductBrief {

    /** 商品 ID */
    private Long id;

    /** 商品编码 */
    private String sku;

    /** 商品名称 */
    private String name;

    /** 单价，单位元 */
    private BigDecimal price;

    /**
     * 商品状态。序列化时额外返回 productStatusName，见同目录 Dict - 字典说明 - README.md。
     * 不叫 status：status 太常见，容易和其他状态混淆，优先用具体对象上的名字，如 productStatus、orderStatus。
     */
    @DictSerialize(ProductStatusEnum.class)
    private ProductStatusEnum productStatus;

    /** 创建时间 */
    private LocalDateTime createdAt;
}
