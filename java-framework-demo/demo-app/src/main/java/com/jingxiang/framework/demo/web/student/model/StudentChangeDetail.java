package com.jingxiang.framework.demo.web.student.model;

import com.jingxiang.component.common.dict.convert.DictSerialize;
import com.jingxiang.framework.demo.commons.dict.StudentChangeTypeEnum;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * 学籍异动详情。挂在学生详情上，不单独提供接口。
 */
@Getter
@Setter
public class StudentChangeDetail {

    /** 异动 ID */
    private Long id;

    /** 异动日期 */
    private LocalDate changedOn;

    /**
     * 异动类型。序列化时额外返回 changeTypeName。
     * 不叫 status，避免和学生状态 studentStatus 混淆。
     */
    @DictSerialize(StudentChangeTypeEnum.class)
    private StudentChangeTypeEnum changeType;

    /** 说明 */
    private String remark;
}
