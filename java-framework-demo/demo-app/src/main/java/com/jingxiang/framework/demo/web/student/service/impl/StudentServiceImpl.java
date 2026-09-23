package com.jingxiang.framework.demo.web.student.service.impl;

import com.jingxiang.commons.model.dict.Whether;
import com.jingxiang.commons.model.dto.Page;
import com.jingxiang.commons.model.dto.R;
import com.jingxiang.commons.util.PageUtil;
import com.jingxiang.framework.demo.commons.model.StudentEnrollmentPo;
import com.jingxiang.framework.demo.commons.model.StudentPo;
import com.jingxiang.framework.demo.web.student.dao.StudentChangeMapper;
import com.jingxiang.framework.demo.web.student.dao.StudentEnrollmentMapper;
import com.jingxiang.framework.demo.web.student.dao.StudentMapper;
import com.jingxiang.framework.demo.web.student.model.*;
import com.jingxiang.framework.demo.web.student.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 学生用例实现。学生、学籍、异动记录在同一个事务里写入。
 */
@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentMapper studentMapper;

    private final StudentEnrollmentMapper studentEnrollmentMapper;

    private final StudentChangeMapper studentChangeMapper;

    /**
     * 查询学生列表，不分页。
     *
     * @param query 筛选条件
     * @return 列表
     */
    @Override
    public R<List<StudentBrief>> list(StudentQuery query) {
        return R.ok(studentMapper.list(query));
    }

    /**
     * 分页查询学生。
     *
     * @param query 分页与筛选条件
     * @return 分页列表
     */
    @Override
    public R<Page<StudentBrief>> page(StudentQuery query) {
        PageUtil.startPage(query);
        List<StudentBrief> list = studentMapper.list(query);
        return R.page(list);
    }

    /**
     * 查询学生详情。主档、学籍、异动各查一次，不在循环里查库。
     *
     * @param id 学生 ID
     * @return 详情；不存在时失败
     */
    @Override
    public R<StudentDetail> detail(Long id) {
        StudentDetail detail = findDetail(id);
        if (detail == null) {
            return R.fail("学生不存在");
        }
        return R.ok(detail);
    }

    /**
     * 创建学生，并同时写入学籍和异动记录。
     * 不在这里捕获唯一约束冲突。学号重复会抛出 DuplicateKeyException，
     * 由 CommonExceptionResolver 统一转成失败响应，当前事务一并回滚。
     * 创建只表示写入成功，不组装 Brief 返回；需要数据时再查详情。
     *
     * @param create 创建参数
     * @return 成功或失败，不含学生数据
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public R create(StudentCreate create) {
        LocalDateTime now = LocalDateTime.now();
        StudentPo student = new StudentPo();
        BeanUtils.copyProperties(create, student);
        student.setDeleted(Whether.No);
        student.setCreatedAt(now);
        student.setUpdatedAt(now);
        studentMapper.insert(student);
        return R.ok();
    }

    /**
     * 修改学生，并同时更新学籍、覆盖异动记录。
     * 只表示修改成功，不组装 Brief 返回；需要数据时再查详情。
     *
     * @param update 修改参数
     * @return 成功或失败，不含学生数据
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public R update(StudentUpdate update) {
        LocalDateTime now = LocalDateTime.now();
        StudentPo student = new StudentPo();
        student.setId(update.getId());
        student.setStudentName(update.getStudentName());
        student.setStudentStatus(update.getStudentStatus());
        student.setUpdatedAt(now);
        studentMapper.updateById(student);
        return R.ok();
    }

    /**
     * 逻辑删除学生，并同时逻辑删除学籍和异动记录。
     *
     * @param id 学生 ID
     * @return 成功或失败，不含业务数据
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public R delete(Long id) {
        studentMapper.deleteById(id);
        return R.ok();
    }

    /**
     * 组装详情：主档、学籍、异动各一次查询。
     *
     * @param id 学生 ID
     * @return 详情，学生不存在时返回 null
     */
    private StudentDetail findDetail(Long id) {
        StudentDetail detail = studentMapper.detail(id);
        if (detail == null) {
            return null;
        }
        detail.setEnrollment(studentEnrollmentMapper.detailByStudentId(id));
        List<StudentChangeDetail> changes = studentChangeMapper.listByStudentId(id);
        detail.setChanges(changes);
        return detail;
    }

}
