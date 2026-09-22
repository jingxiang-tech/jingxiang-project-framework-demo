package com.jingxiang.framework.demo.web.product.service.impl;

import com.jingxiang.commons.model.dto.Page;
import com.jingxiang.commons.model.dto.R;
import com.jingxiang.commons.util.PageUtil;
import com.jingxiang.framework.demo.web.product.dao.ProductMapper;
import com.jingxiang.framework.demo.web.product.model.ProductBrief;
import com.jingxiang.framework.demo.web.product.model.ProductCreate;
import com.jingxiang.framework.demo.web.product.model.ProductDetail;
import com.jingxiang.framework.demo.web.product.model.ProductPo;
import com.jingxiang.framework.demo.web.product.model.ProductQuery;
import com.jingxiang.framework.demo.web.product.model.ProductUpdate;
import com.jingxiang.framework.demo.web.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 商品用例实现。查询与写入都带商户号，避免越权。
 * 教学环境没有登录态，商户号固定为 DEMO；正式项目改为 SessionUtil.getTenantCode()。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    /** 未删除 */
    private static final int NOT_DELETED = 0;

    /** 教学环境固定商户号 */
    private static final String DEMO_MCT_NO = "DEMO";

    private final ProductMapper productMapper;

    /**
     * 分页查询当前商户的商品。
     *
     * @param query 分页与筛选条件
     * @return 分页列表
     */
    @Override
    @SuppressWarnings("unchecked")
    public R<Page<ProductBrief>> list(ProductQuery query) {
        query.setMctNo(DEMO_MCT_NO);
        PageUtil.startPage(query);
        List<ProductBrief> list = productMapper.list(query);
        return R.page(list);
    }

    /**
     * 查询商品详情。
     *
     * @param id 商品 ID
     * @return 详情；不存在时失败
     */
    @Override
    public R<ProductDetail> detail(Long id) {
        ProductDetail detail = productMapper.detail(id, DEMO_MCT_NO);
        if (detail == null) {
            return R.fail("商品不存在");
        }
        return R.ok(detail);
    }

    /**
     * 创建商品。
     *
     * @param create 创建参数
     * @return 创建后的商品；编码重复时失败
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public R<ProductBrief> create(ProductCreate create) {
        LocalDateTime now = LocalDateTime.now();
        ProductPo product = new ProductPo();
        BeanUtils.copyProperties(create, product);
        product.setMctNo(DEMO_MCT_NO);
        product.setDeleted(NOT_DELETED);
        product.setCreatedAt(now);
        product.setUpdatedAt(now);
        try {
            productMapper.insert(product);
        } catch (DuplicateKeyException exception) {
            log.warn("商品编码已存在, sku={}", create.getSku());
            return R.fail("商品编码已存在");
        }
        return R.ok(toBrief(product));
    }

    /**
     * 修改商品。
     *
     * @param update 修改参数
     * @return 修改后的商品；不存在时失败
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public R<ProductBrief> update(ProductUpdate update) {
        ProductPo product = new ProductPo();
        product.setId(update.getId());
        product.setMctNo(DEMO_MCT_NO);
        product.setName(update.getName());
        product.setPrice(update.getPrice());
        product.setStatus(update.getStatus());
        product.setUpdatedAt(LocalDateTime.now());
        if (productMapper.updateByMct(product) == 0) {
            return R.fail("商品不存在");
        }
        ProductDetail detail = productMapper.detail(update.getId(), DEMO_MCT_NO);
        if (detail == null) {
            return R.fail("商品不存在");
        }
        ProductBrief brief = new ProductBrief();
        BeanUtils.copyProperties(detail, brief);
        return R.ok(brief);
    }

    /**
     * 逻辑删除商品。
     *
     * @param id 商品 ID
     * @return 删除结果；不存在时失败
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public R<String> delete(Long id) {
        if (productMapper.logicDelete(id, DEMO_MCT_NO) == 0) {
            return R.fail("商品不存在");
        }
        return R.ok("删除成功");
    }

    private ProductBrief toBrief(ProductPo product) {
        ProductBrief brief = new ProductBrief();
        BeanUtils.copyProperties(product, brief);
        return brief;
    }
}
