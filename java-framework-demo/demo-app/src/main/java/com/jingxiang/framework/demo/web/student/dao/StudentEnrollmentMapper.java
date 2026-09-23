package com.jingxiang.framework.demo.web.student.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jingxiang.framework.demo.commons.model.StudentEnrollmentPo;
import com.jingxiang.framework.demo.web.student.model.StudentEnrollmentDetail;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 学籍存取。一个学生一条。
 */
@Mapper
public interface StudentEnrollmentMapper extends BaseMapper<StudentEnrollmentPo> {

    /**
     * 按学生查询学籍。
     *
     * @param studentId 学生 ID
     * @return 学籍，不存在时返回 null
     */
    @Select("""
            SELECT enrolled_on,
                   class_name,
                   major
              FROM student_enrollment
             WHERE deleted = 0
               AND student_id = #{studentId}
            """)
    StudentEnrollmentDetail detail(@Param("studentId") Long studentId);

}
