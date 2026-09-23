package com.jingxiang.framework.demo.web.student.service;

import com.jingxiang.commons.model.dto.Page;
import com.jingxiang.commons.model.dto.R;
import com.jingxiang.framework.demo.web.student.model.StudentBrief;
import com.jingxiang.framework.demo.web.student.model.StudentCreate;
import com.jingxiang.framework.demo.web.student.model.StudentDetail;
import com.jingxiang.framework.demo.web.student.model.StudentQuery;
import com.jingxiang.framework.demo.web.student.model.StudentUpdate;

import java.util.List;

/**
 * 学生用例。返回 {@link R}，不依赖 Servlet。
 */
public interface StudentService {

    /**
     * 查询学生列表，不分页。
     *
     * @param query 筛选条件
     * @return 列表
     */
    R<List<StudentBrief>> list(StudentQuery query);

    /**
     * 分页查询学生。
     *
     * @param query 分页与筛选条件
     * @return 分页列表
     */
    R<Page<StudentBrief>> page(StudentQuery query);

    /**
     * 查询学生详情。
     *
     * @param id 学生 ID
     * @return 详情；不存在时失败
     */
    R<StudentDetail> detail(Long id);

    /**
     * 创建学生，并同时写入学籍和异动记录。
     * 幂等键是学号。同一学号再次提交不会插入第二行，唯一约束是并发下的最终防线。
     * 学号冲突抛出 DuplicateKeyException，交给全局异常拦截返回失败，不在这里吞掉。
     * 第二次带来的姓名、状态不会覆盖已有学生，要改内容走修改。
     * 只表示写入成功，不回传学生数据。
     *
     * @param create 创建参数
     * @return 成功或失败，不含学生数据
     */
    R create(StudentCreate create);

    /**
     * 修改学生，并同时更新学籍、覆盖异动记录。
     * 只表示修改成功，不回传学生数据。
     *
     * @param update 修改参数
     * @return 成功或失败，不含学生数据
     */
    R update(StudentUpdate update);

    /**
     * 逻辑删除学生，并同时逻辑删除学籍和异动记录。
     *
     * @param id 学生 ID
     * @return 成功或失败，不含业务数据
     */
    R delete(Long id);
}
