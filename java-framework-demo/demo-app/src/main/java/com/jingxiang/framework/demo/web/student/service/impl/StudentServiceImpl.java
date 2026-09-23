package com.jingxiang.framework.demo.web.student.service.impl;

import com.jingxiang.commons.model.dict.Whether;
import com.jingxiang.commons.model.dto.Page;
import com.jingxiang.commons.model.dto.R;
import com.jingxiang.commons.util.PageUtil;
import com.jingxiang.framework.demo.commons.model.StudentChangePo;
import com.jingxiang.framework.demo.commons.model.StudentEnrollmentPo;
import com.jingxiang.framework.demo.commons.model.StudentPo;
import com.jingxiang.framework.demo.web.student.dao.StudentChangeMapper;
import com.jingxiang.framework.demo.web.student.dao.StudentEnrollmentMapper;
import com.jingxiang.framework.demo.web.student.dao.StudentMapper;
import com.jingxiang.framework.demo.web.student.model.StudentBrief;
import com.jingxiang.framework.demo.web.student.model.StudentChangeCreate;
import com.jingxiang.framework.demo.web.student.model.StudentChangeDetail;
import com.jingxiang.framework.demo.web.student.model.StudentCreate;
import com.jingxiang.framework.demo.web.student.model.StudentDetail;
import com.jingxiang.framework.demo.web.student.model.StudentEnrollmentCreate;
import com.jingxiang.framework.demo.web.student.model.StudentQuery;
import com.jingxiang.framework.demo.web.student.model.StudentUpdate;
import com.jingxiang.framework.demo.web.student.service.StudentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 学生用例实现。学生、学籍、异动记录在同一个事务里写入。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    /** 学号唯一约束名 */
    private static final String STUDENT_NO_UNIQUE_KEY = "uk_student_no";

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
     *
     * @param create 创建参数
     * @return 创建后的学生；学号重复时失败
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public R<StudentBrief> create(StudentCreate create) {
        LocalDateTime now = LocalDateTime.now();
        StudentPo student = new StudentPo();
        BeanUtils.copyProperties(create, student);
        student.setDeleted(Whether.No);
        student.setCreatedAt(now);
        student.setUpdatedAt(now);
        try {
            studentMapper.insert(student);
        } catch (DataAccessException exception) {
            if (!isDuplicateStudentNo(exception)) {
                throw exception;
            }
            log.warn("学号已存在, studentNo={}", create.getStudentNo());
            return R.fail("学号已存在");
        }
        insertEnrollment(student.getId(), create.getEnrollment(), now);
        insertChanges(student.getId(), create.getChanges(), now);
        return R.ok(toBrief(student, create.getChanges().size()));
    }

    /**
     * 修改学生，并同时更新学籍、覆盖异动记录。
     *
     * @param update 修改参数
     * @return 修改后的学生；不存在时失败
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public R<StudentBrief> update(StudentUpdate update) {
        LocalDateTime now = LocalDateTime.now();
        StudentPo student = new StudentPo();
        student.setId(update.getId());
        student.setStudentName(update.getStudentName());
        student.setStudentStatus(update.getStudentStatus());
        student.setUpdatedAt(now);
        if (studentMapper.updateActive(student) == 0) {
            return R.fail("学生不存在");
        }
        StudentEnrollmentPo enrollment = new StudentEnrollmentPo();
        BeanUtils.copyProperties(update.getEnrollment(), enrollment);
        enrollment.setStudentId(update.getId());
        enrollment.setUpdatedAt(now);
        if (studentEnrollmentMapper.updateActive(enrollment) == 0) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return R.fail("学籍不存在");
        }
        studentChangeMapper.logicDeleteByStudentId(update.getId());
        insertChanges(update.getId(), update.getChanges(), now);
        StudentDetail detail = findDetail(update.getId());
        if (detail == null) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return R.fail("学生不存在");
        }
        return R.ok(toBrief(detail));
    }

    /**
     * 逻辑删除学生，并同时逻辑删除学籍和异动记录。
     *
     * @param id 学生 ID
     * @return 删除结果；不存在时失败
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public R<String> delete(Long id) {
        if (studentMapper.logicDelete(id) == 0) {
            return R.fail("学生不存在");
        }
        studentEnrollmentMapper.logicDeleteByStudentId(id);
        studentChangeMapper.logicDeleteByStudentId(id);
        return R.ok("删除成功");
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

    /**
     * 写入学籍。
     *
     * @param studentId 学生 ID
     * @param enrollmentCreate 学籍入参
     * @param now 当前时间
     */
    private void insertEnrollment(Long studentId, StudentEnrollmentCreate enrollmentCreate, LocalDateTime now) {
        StudentEnrollmentPo enrollment = new StudentEnrollmentPo();
        BeanUtils.copyProperties(enrollmentCreate, enrollment);
        enrollment.setStudentId(studentId);
        enrollment.setDeleted(NOT_DELETED);
        enrollment.setCreatedAt(now);
        enrollment.setUpdatedAt(now);
        studentEnrollmentMapper.insert(enrollment);
    }

    /**
     * 批量写入异动。空列表不访问数据库。
     *
     * @param studentId 学生 ID
     * @param changeCreates 异动入参
     * @param now 当前时间
     */
    private void insertChanges(Long studentId, List<StudentChangeCreate> changeCreates, LocalDateTime now) {
        if (changeCreates.isEmpty()) {
            return;
        }
        List<StudentChangePo> changes = new ArrayList<>(changeCreates.size());
        for (StudentChangeCreate changeCreate : changeCreates) {
            StudentChangePo change = new StudentChangePo();
            BeanUtils.copyProperties(changeCreate, change);
            change.setStudentId(studentId);
            change.setDeleted(NOT_DELETED);
            change.setCreatedAt(now);
            change.setUpdatedAt(now);
            changes.add(change);
        }
        studentChangeMapper.insertBatch(changes);
    }

    /**
     * 唯一约束冲突包在数据访问异常里，信息中带有约束名。
     * 只把学号冲突转成业务失败，其他唯一约束继续抛出。
     *
     * @param exception 写入失败异常
     * @return 是否为学号重复
     */
    private boolean isDuplicateStudentNo(Throwable exception) {
        for (Throwable current = exception; current != null; current = current.getCause()) {
            String message = current.getMessage();
            if (message != null && message.contains(STUDENT_NO_UNIQUE_KEY)) {
                return true;
            }
        }
        return false;
    }

    private StudentBrief toBrief(StudentPo student, int changeCount) {
        StudentBrief brief = new StudentBrief();
        BeanUtils.copyProperties(student, brief);
        brief.setChangeCount(changeCount);
        return brief;
    }

    private StudentBrief toBrief(StudentDetail detail) {
        StudentBrief brief = new StudentBrief();
        BeanUtils.copyProperties(detail, brief);
        int changeCount = detail.getChanges() == null ? 0 : detail.getChanges().size();
        brief.setChangeCount(changeCount);
        return brief;
    }
}
