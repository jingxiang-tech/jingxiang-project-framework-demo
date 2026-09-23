package com.jingxiang.framework.demo.web.student.model;

import com.jingxiang.commons.model.dto.BasePage;
import com.jingxiang.framework.demo.commons.dict.StudentStatusEnum;
import lombok.Getter;
import lombok.Setter;

/**
 * 学生分页查询。
 * pageNum 从 0 起，0 与 1 都表示第一页，与 PageUtil 一致。
 */
@Getter
@Setter
public class StudentQuery extends BasePage {

    /** 姓名，模糊匹配 */
    private String studentName;

    /** 学生状态 */
    private StudentStatusEnum studentStatus;
}
