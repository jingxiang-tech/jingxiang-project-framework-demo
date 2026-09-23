package com.jingxiang.framework.demo.web.student.service;

import com.jingxiang.commons.model.dto.Page;
import com.jingxiang.commons.model.dto.R;
import com.jingxiang.framework.demo.web.student.model.StudentBrief;
import com.jingxiang.framework.demo.web.student.model.StudentCreate;
import com.jingxiang.framework.demo.web.student.model.StudentDetail;
import com.jingxiang.framework.demo.web.student.model.StudentQuery;
import com.jingxiang.framework.demo.web.student.model.StudentUpdate;

/**
 * 学生用例。返回 {@link R}，不依赖 Servlet。
 */
public interface StudentService {

    /**
     * 分页查询学生。
     *
     * @param query 分页与筛选条件
     * @return 分页列表
     */
    R<Page<StudentBrief>> list(StudentQuery query);

    /**
     * 查询学生详情。
     *
     * @param id 学生 ID
     * @return 详情；不存在时失败
     */
    R<StudentDetail> detail(Long id);

    /**
     * 创建学生，并同时写入学籍和异动记录。
     *
     * @param create 创建参数
     * @return 创建后的学生；学号重复时失败
     */
    R<StudentBrief> create(StudentCreate create);

    /**
     * 修改学生，并同时更新学籍、覆盖异动记录。
     *
     * @param update 修改参数
     * @return 修改后的学生；不存在时失败
     */
    R<StudentBrief> update(StudentUpdate update);

    /**
     * 逻辑删除学生，并同时逻辑删除学籍和异动记录。
     *
     * @param id 学生 ID
     * @return 删除结果；不存在时失败
     */
    R<String> delete(Long id);
}
