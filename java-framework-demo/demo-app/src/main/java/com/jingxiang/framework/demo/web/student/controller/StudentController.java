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

import java.util.List;

/**
 * 学生
 */
@Validated
@RestController
@RequestMapping("student") // 接口使用业务名称单数形式
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    /** 列表 */
    @GetMapping
    public R<List<StudentBrief>> list(@Valid StudentQuery query) {
        // 千万级数据量，或者 APP 端不关心数据总量情况，直接查询列表数据
        return studentService.list(query);
    }

    /** 分页 */
    @GetMapping("page")
    public R<Page<StudentBrief>> page(@Valid StudentQuery query) {
        // 后台系统需要显示当前数据、总行数、当前页、分页等，使用 page 分页查询
        return studentService.page(query);
    }

    /** 详情 */
    @GetMapping("{id}")
    public R<StudentDetail> detail(@PathVariable("id") @Positive(message = "学生 ID 必须大于 0") Long id) {
        return studentService.detail(id);
    }

    /** 创建 */
    @PostMapping
    public R create(@Valid @RequestBody StudentCreate create) {
        // 只返回成功或失败，不回传学生。需要数据时再查详情。
        return studentService.create(create);
    }

    /** 修改 */
    @PutMapping
    public R update(@Valid @RequestBody StudentUpdate update) {
        return studentService.update(update);
    }

    /** 删除 */
    @DeleteMapping("{id}")
    public R delete(@PathVariable("id") @Positive(message = "学生 ID 必须大于 0") Long id) {
        return studentService.delete(id);
    }
}
