package com.jingxiang.framework.demo.commons.dict;

/**
 * 学籍异动类型。只描述这一条记录，不驱动学生状态流转。
 */
public enum StudentChangeTypeEnum {

    TRANSFER("转班"),
    SUSPEND("休学"),
    RESUME("复学"),
    GRADUATE("毕业");

    /** 类型名称 */
    public final String name;

    StudentChangeTypeEnum(String name) {
        this.name = name;
    }
}
