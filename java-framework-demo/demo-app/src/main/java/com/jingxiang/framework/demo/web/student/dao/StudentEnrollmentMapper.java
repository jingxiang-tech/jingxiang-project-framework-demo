package com.jingxiang.framework.demo.web.student.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jingxiang.framework.demo.commons.model.StudentEnrollmentPo;
import com.jingxiang.framework.demo.web.student.model.StudentEnrollmentDetail;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

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
    StudentEnrollmentDetail detailByStudentId(@Param("studentId") Long studentId);

    /**
     * 修改未删除的学籍。
     *
     * @param enrollment 待更新字段，必须带 studentId
     * @return 影响行数
     */
    @Update("""
            UPDATE student_enrollment
               SET enrolled_on = #{enrolledOn},
                   class_name = #{className},
                   major = #{major},
                   updated_at = #{updatedAt}
             WHERE deleted = 0
               AND student_id = #{studentId}
            """)
    int updateActive(StudentEnrollmentPo enrollment);

    /**
     * 按学生逻辑删除学籍。
     *
     * @param studentId 学生 ID
     * @return 影响行数
     */
    @Update("""
            UPDATE student_enrollment
               SET deleted = 1,
                   updated_at = NOW()
             WHERE deleted = 0
               AND student_id = #{studentId}
            """)
    int logicDeleteByStudentId(@Param("studentId") Long studentId);
}
