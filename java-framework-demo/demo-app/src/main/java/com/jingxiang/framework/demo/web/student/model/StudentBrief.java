package com.jingxiang.framework.demo.web.student.model;

import com.jingxiang.component.common.dict.convert.DictSerialize;
import com.jingxiang.framework.demo.commons.dict.StudentStatusEnum;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 学生列表项。只带主档和异动条数，不带学籍、不带异动明细。
 */
@Getter
@Setter
public class StudentBrief {

    /** 学生 ID */
    private Long id;

    /** 学号 */
    private String studentNo;

    /** 姓名 */
    private String studentName;

    /**
     * 学生状态。序列化时额外返回 studentStatusName，见同目录 Dict - 字典说明 - README.md。
     * 不叫 status：status 太常见，容易和其他状态混淆。
     * 优先用具体对象上的名字，如 studentStatus、orderStatus。
     */
    @DictSerialize(StudentStatusEnum.class)
    private StudentStatusEnum studentStatus;

    /** 异动条数 */
    private Integer changeCount;

    /** 创建时间 */
    private LocalDateTime createdAt;
}
