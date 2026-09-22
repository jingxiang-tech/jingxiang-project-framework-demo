package com.jingxiang.framework.demo.web.product.controller;

import com.jingxiang.commons.model.dto.Page;
import com.jingxiang.commons.model.dto.R;
import com.jingxiang.framework.demo.web.product.model.ProductBrief;
import com.jingxiang.framework.demo.web.product.model.ProductCreate;
import com.jingxiang.framework.demo.web.product.model.ProductDetail;
import com.jingxiang.framework.demo.web.product.model.ProductQuery;
import com.jingxiang.framework.demo.web.product.model.ProductUpdate;
import com.jingxiang.framework.demo.web.product.service.ProductService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 商品接口
 * 只做参数校验并转发，完整路径前缀为 /api/product
 */
@Validated
@RestController
@RequestMapping("product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * 分页查询商品
     *
     * @param query 分页与筛选条件
     * @return 分页列表
     */
    @GetMapping
    public R<Page<ProductBrief>> list(@Valid ProductQuery query) {
        return productService.list(query);
    }

    /**
     * 查询商品详情
     *
     * @param id 商品 ID
     * @return 详情
     */
    @GetMapping("{id}")
    public R<ProductDetail> detail(@PathVariable("id") @Positive(message = "商品 ID 必须大于 0") Long id) {
        return productService.detail(id);
    }

    /**
     * 创建商品
     *
     * @param create 创建参数
     * @return 创建后的商品
     */
    @PostMapping
    public R<ProductBrief> create(@Valid @RequestBody ProductCreate create) {
        return productService.create(create);
    }

    /**
     * 修改商品
     *
     * @param update 修改参数
     * @return 修改后的商品
     */
    @PutMapping
    public R<ProductBrief> update(@Valid @RequestBody ProductUpdate update) {
        return productService.update(update);
    }

    /**
     * 删除商品
     *
     * @param id 商品 ID
     * @return 删除结果
     */
    @DeleteMapping("{id}")
    public R delete(@PathVariable("id") @Positive(message = "商品 ID 必须大于 0") Long id) {
        return productService.delete(id);
    }
}
