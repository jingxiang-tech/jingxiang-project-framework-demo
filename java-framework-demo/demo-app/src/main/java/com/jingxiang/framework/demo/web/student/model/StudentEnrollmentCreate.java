package com.jingxiang.framework.demo.web.student.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * 学籍入参。班级和专业是字符串，不单独建表。
 */
@Getter
@Setter
public class StudentEnrollmentCreate {

    /** 入学日期 */
    @NotNull(message = "入学日期不能为空")
    private LocalDate enrolledOn;

    /** 班级 */
    @NotBlank(message = "班级不能为空")
    @Size(max = 40, message = "班级不能超过 40 个字符")
    private String className;

    /** 专业 */
    @NotBlank(message = "专业不能为空")
    @Size(max = 40, message = "专业不能超过 40 个字符")
    private String major;
}
