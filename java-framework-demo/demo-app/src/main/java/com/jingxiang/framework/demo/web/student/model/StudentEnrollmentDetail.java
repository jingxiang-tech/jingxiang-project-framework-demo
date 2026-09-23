package com.jingxiang.framework.demo.web.student.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * 学籍详情。挂在学生详情上，不单独提供接口。
 */
@Getter
@Setter
public class StudentEnrollmentDetail {

    /** 入学日期 */
    private LocalDate enrolledOn;

    /** 班级 */
    private String className;

    /** 专业 */
    private String major;
}
