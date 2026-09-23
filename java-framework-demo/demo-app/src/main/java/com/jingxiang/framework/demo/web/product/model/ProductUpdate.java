package com.jingxiang.framework.demo.web.product.model;

import com.jingxiang.framework.demo.commons.dict.ProductStatusEnum;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * 修改商品。商品编码创建后不可改。
 */
@Getter
@Setter
public class ProductUpdate {

    /** 商品 ID */
    @NotNull(message = "商品 ID 不能为空")
    @Positive(message = "商品 ID 必须大于 0")
    private Long id;

    /** 商品名称 */
    @NotBlank(message = "商品名称不能为空")
    @Size(max = 80, message = "商品名称不能超过 80 个字符")
    private String name;

    /** 单价，单位元，最多 8 位整数和 2 位小数 */
    @NotNull(message = "单价不能为空")
    @DecimalMin(value = "0.00", message = "单价不能为负数")
    @Digits(integer = 8, fraction = 2, message = "单价最多 8 位整数和 2 位小数")
    private BigDecimal price;

    /** 商品状态 */
    @NotNull(message = "商品状态不能为空")
    private ProductStatusEnum productStatus;
}
