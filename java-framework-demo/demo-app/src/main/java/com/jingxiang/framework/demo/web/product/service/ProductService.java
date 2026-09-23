package com.jingxiang.framework.demo.web.product.service;

import com.jingxiang.commons.model.dto.Page;
import com.jingxiang.commons.model.dto.R;
import com.jingxiang.framework.demo.web.product.model.ProductBrief;
import com.jingxiang.framework.demo.web.product.model.ProductCreate;
import com.jingxiang.framework.demo.web.product.model.ProductDetail;
import com.jingxiang.framework.demo.web.product.model.ProductQuery;
import com.jingxiang.framework.demo.web.product.model.ProductUpdate;

/**
 * 商品用例。返回 {@link R}，不依赖 Servlet。
 */
public interface ProductService {

    /**
     * 分页查询商品。
     *
     * @param query 分页与筛选条件
     * @return 分页列表
     */
    R<Page<ProductBrief>> list(ProductQuery query);

    /**
     * 查询商品详情。
     *
     * @param id 商品 ID
     * @return 详情；不存在时失败
     */
    R<ProductDetail> detail(Long id);

    /**
     * 创建商品。
     *
     * @param create 创建参数
     * @return 创建后的商品；编码重复时失败
     */
    R<ProductBrief> create(ProductCreate create);

    /**
     * 修改商品。
     *
     * @param update 修改参数
     * @return 修改后的商品；不存在时失败
     */
    R<ProductBrief> update(ProductUpdate update);

    /**
     * 逻辑删除商品。
     *
     * @param id 商品 ID
     * @return 删除结果；不存在时失败
     */
    R delete(Long id);
}
