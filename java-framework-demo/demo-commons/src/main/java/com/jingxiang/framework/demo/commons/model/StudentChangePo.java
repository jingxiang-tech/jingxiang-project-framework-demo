package com.jingxiang.framework.demo.commons.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.jingxiang.framework.demo.commons.dict.StudentChangeTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 学籍异动持久化对象。一个学生多条，不直接返回给前端。
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("student_change")
public class StudentChangePo {

    /** 异动 ID */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 学生 ID */
    private Long studentId;

    /** 异动日期 */
    private LocalDate changedOn;

    /** 异动类型 */
    private StudentChangeTypeEnum changeType;

    /** 说明 */
    private String remark;

    /** 是否删除：Whether.No 否，Whether.Yes 是 */
    private Integer deleted;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}
