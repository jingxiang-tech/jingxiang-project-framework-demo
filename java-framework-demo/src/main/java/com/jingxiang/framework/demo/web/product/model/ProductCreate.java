package com.jingxiang.framework.demo.web.product.model;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * 创建商品。
 */
@Getter
@Setter
public class ProductCreate {

    /** 商品编码，1~32 位大写字母、数字、下划线或连字符 */
    @NotBlank(message = "商品编码不能为空")
    @Pattern(regexp = "[A-Z0-9_-]{1,32}", message = "商品编码应为 1~32 位大写字母、数字、下划线或连字符")
    private String sku;

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
    private ProductStatusEnum status;
}
