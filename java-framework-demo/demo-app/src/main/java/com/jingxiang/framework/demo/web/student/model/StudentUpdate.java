package com.jingxiang.framework.demo.web.student.model;

import com.jingxiang.framework.demo.commons.dict.StudentStatusEnum;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 修改学生。学号创建后不可改。
 * 学籍按本次提交更新。异动记录按本次提交整体覆盖，传空列表表示清空。
 */
@Getter
@Setter
public class StudentUpdate {

    /** 学生 ID */
    @NotNull(message = "学生 ID 不能为空")
    @Positive(message = "学生 ID 必须大于 0")
    private Long id;

    /** 姓名 */
    @NotBlank(message = "姓名不能为空")
    @Size(max = 40, message = "姓名不能超过 40 个字符")
    private String studentName;

    /** 学生状态 */
    @NotNull(message = "学生状态不能为空")
    private StudentStatusEnum studentStatus;

    /** 学籍。一个学生一条 */
    @Valid
    @NotNull(message = "学籍不能为空")
    private StudentEnrollmentCreate enrollment;

    /**
     * 异动记录。按本次提交整体覆盖，没有记录时传空列表。
     * 一次最多 20 条。
     */
    @Valid
    @NotNull(message = "异动记录未提交")
    @Size(max = 20, message = "异动记录不能超过 20 条")
    private List<StudentChangeCreate> changes;
}
