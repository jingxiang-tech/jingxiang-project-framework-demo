package com.jingxiang.framework.demo.web.product.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jingxiang.framework.demo.web.product.model.ProductBrief;
import com.jingxiang.framework.demo.web.product.model.ProductDetail;
import com.jingxiang.framework.demo.commons.model.ProductPo;
import com.jingxiang.framework.demo.web.product.model.ProductQuery;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 商品存取。分页由 PageHelper 处理，SQL 不写 LIMIT。
 */
@Mapper
public interface ProductMapper extends BaseMapper<ProductPo> {

    /**
     * 分页查询商品。调用前需 PageUtil.startPage。
     *
     * @param query 查询条件
     * @return 当前页数据
     */
    @Select("""
            <script>
            SELECT id,
                   sku,
                   name,
                   price,
                   product_status,
                   created_at
              FROM product
             WHERE deleted = 0
               <if test="query.name != null and query.name != ''">
               AND name LIKE CONCAT('%', #{query.name}, '%')
               </if>
               <if test="query.productStatus != null">
               AND product_status = #{query.productStatus}
               </if>
             ORDER BY id DESC
            </script>
            """)
    List<ProductBrief> list(@Param("query") ProductQuery query);

    /**
     * 查询商品详情。
     *
     * @param id 商品 ID
     * @return 详情，不存在时返回 null
     */
    @Select("""
            SELECT id,
                   sku,
                   name,
                   price,
                   product_status,
                   created_at,
                   updated_at
              FROM product
             WHERE deleted = 0
               AND id = #{id}
            """)
    ProductDetail detail(@Param("id") Long id);

    /**
     * 修改未删除的商品。商品编码不在此更新。
     *
     * @param product 待更新字段，必须带 id
     * @return 影响行数
     */
    @Update("""
            UPDATE product
               SET name = #{name},
                   price = #{price},
                   product_status = #{productStatus},
                   updated_at = #{updatedAt}
             WHERE deleted = 0
               AND id = #{id}
            """)
    int updateActive(ProductPo product);

    /**
     * 逻辑删除商品。
     *
     * @param id 商品 ID
     * @return 影响行数
     */
    @Update("""
            UPDATE product
               SET deleted = 1,
                   updated_at = NOW()
             WHERE deleted = 0
               AND id = #{id}
            """)
    int logicDelete(@Param("id") Long id);
}
