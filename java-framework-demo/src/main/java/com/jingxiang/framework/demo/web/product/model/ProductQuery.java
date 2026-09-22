package com.jingxiang.framework.demo.web.product.model;

import com.jingxiang.commons.model.dto.BasePage;
import lombok.Getter;
import lombok.Setter;

/**
 * 商品分页查询。
 * pageNum 从 0 起，0 与 1 都表示第一页，与 PageUtil 一致。
 */
@Getter
@Setter
public class ProductQuery extends BasePage {

    /** 商户号，服务端写入 */
    private String mctNo;

    /** 商品名称，模糊匹配 */
    private String name;

    /** 商品状态 */
    private ProductStatusEnum status;
}
