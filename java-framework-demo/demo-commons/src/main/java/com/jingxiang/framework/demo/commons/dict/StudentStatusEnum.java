package com.jingxiang.framework.demo.commons.dict;

/**
 * 学生状态。
 */
public enum StudentStatusEnum {

    ENROLLED("在读"),
    SUSPENDED("休学"),
    GRADUATED("毕业");

    /** 状态名称 */
    public final String name;

    StudentStatusEnum(String name) {
        this.name = name;
    }
}
