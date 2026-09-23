package com.jingxiang.framework.demo.web.student.controller;

import com.jingxiang.commons.model.dto.Page;
import com.jingxiang.commons.model.dto.R;
import com.jingxiang.framework.demo.web.student.model.StudentBrief;
import com.jingxiang.framework.demo.web.student.model.StudentCreate;
import com.jingxiang.framework.demo.web.student.model.StudentDetail;
import com.jingxiang.framework.demo.web.student.model.StudentQuery;
import com.jingxiang.framework.demo.web.student.model.StudentUpdate;
import com.jingxiang.framework.demo.web.student.service.StudentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 学生接口。
 * 只做参数校验并转发，完整路径前缀为 http://127.0.0.1:8000/api/student
 */
@Validated
@RestController
@RequestMapping("student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    /**
     * 分页查询学生。
     *
     * @param query 分页与筛选条件
     * @return 分页列表
     */
    @GetMapping
    public R<Page<StudentBrief>> list(@Valid StudentQuery query) {
        return studentService.list(query);
    }

    /**
     * 查询学生详情。
     *
     * @param id 学生 ID
     * @return 详情
     */
    @GetMapping("{id}")
    public R<StudentDetail> detail(@PathVariable("id") @Positive(message = "学生 ID 必须大于 0") Long id) {
        return studentService.detail(id);
    }

    /**
     * 创建学生。
     *
     * @param create 创建参数
     * @return 创建后的学生
     */
    @PostMapping
    public R<StudentBrief> create(@Valid @RequestBody StudentCreate create) {
        return studentService.create(create);
    }

    /**
     * 修改学生。
     *
     * @param update 修改参数
     * @return 修改后的学生
     */
    @PutMapping
    public R<StudentBrief> update(@Valid @RequestBody StudentUpdate update) {
        return studentService.update(update);
    }

    /**
     * 删除学生。
     *
     * @param id 学生 ID
     * @return 删除结果
     */
    @DeleteMapping("{id}")
    public R<String> delete(@PathVariable("id") @Positive(message = "学生 ID 必须大于 0") Long id) {
        return studentService.delete(id);
    }
}
