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
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 商品用例实现。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    /** 未删除 */
    private static final int NOT_DELETED = 0;

    private final ProductMapper productMapper;

    /**
     * 分页查询商品。
     *
     * @param query 分页与筛选条件
     * @return 分页列表
     */
    @Override
    @SuppressWarnings("unchecked")
    public R<Page<ProductBrief>> list(ProductQuery query) {
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
        ProductDetail detail = productMapper.detail(id);
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
        product.setDeleted(NOT_DELETED);
        product.setCreatedAt(now);
        product.setUpdatedAt(now);
        try {
            productMapper.insert(product);
        } catch (DataAccessException exception) {
            if (!isDuplicateSku(exception)) {
                throw exception;
            }
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
        product.setName(update.getName());
        product.setPrice(update.getPrice());
        product.setStatus(update.getStatus());
        product.setUpdatedAt(LocalDateTime.now());
        if (productMapper.updateActive(product) == 0) {
            return R.fail("商品不存在");
        }
        ProductDetail detail = productMapper.detail(update.getId());
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
        if (productMapper.logicDelete(id) == 0) {
            return R.fail("商品不存在");
        }
        return R.ok("删除成功");
    }

    /**
     * MySQL 唯一约束会被 Spring 译成 {@link DuplicateKeyException}，MyBatis 可能再包一层。
     *
     * @param exception 写入失败异常
     * @return 是否为商品编码重复
     */
    private boolean isDuplicateSku(Throwable exception) {
        for (Throwable current = exception; current != null; current = current.getCause()) {
            if (current instanceof DuplicateKeyException) {
                return true;
            }
        }
        return false;
    }

    private ProductBrief toBrief(ProductPo product) {
        ProductBrief brief = new ProductBrief();
        BeanUtils.copyProperties(product, brief);
        brief.setProductStatus(product.getStatus());
        return brief;
    }
}
