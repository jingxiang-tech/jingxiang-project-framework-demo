package com.jingxiang.framework.demo.commons.dict;

/**
 * 商品状态。
 */
public enum ProductStatusEnum {

    ON_SALE("在售"),
    OFF_SALE("下架");

    /** 状态名称 */
    public final String name;

    ProductStatusEnum(String name) {
        this.name = name;
    }
}
