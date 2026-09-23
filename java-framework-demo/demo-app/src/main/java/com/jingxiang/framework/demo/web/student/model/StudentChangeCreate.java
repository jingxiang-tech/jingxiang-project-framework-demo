package com.jingxiang.framework.demo.web.student.model;

import com.jingxiang.framework.demo.commons.dict.StudentChangeTypeEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * 一条学籍异动。离开学生没有独立含义。
 */
@Getter
@Setter
public class StudentChangeCreate {

    /** 异动日期 */
    @NotNull(message = "异动日期不能为空")
    private LocalDate changedOn;

    /** 异动类型 */
    @NotNull(message = "异动类型不能为空")
    private StudentChangeTypeEnum changeType;

    /** 说明 */
    @NotBlank(message = "异动说明不能为空")
    @Size(max = 200, message = "异动说明不能超过 200 个字符")
    private String remark;
}
