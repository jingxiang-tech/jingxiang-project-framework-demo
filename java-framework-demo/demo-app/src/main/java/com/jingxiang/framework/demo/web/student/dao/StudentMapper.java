package com.jingxiang.framework.demo.web.student.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jingxiang.framework.demo.commons.model.StudentPo;
import com.jingxiang.framework.demo.web.student.model.StudentBrief;
import com.jingxiang.framework.demo.web.student.model.StudentDetail;
import com.jingxiang.framework.demo.web.student.model.StudentQuery;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 学生存取。分页由 PageHelper 处理，SQL 不写 LIMIT。
 */
@Mapper
public interface StudentMapper extends BaseMapper<StudentPo> {

    /**
     * 分页查询学生。调用前需 PageUtil.startPage。
     * 异动条数在同一条 SQL 里算出，不按学生逐条查。
     *
     * @param query 查询条件
     * @return 当前页数据
     */
    @Select("""
            <script>
            SELECT id,
                   student_no,
                   student_name,
                   student_status,
                   (SELECT COUNT(*)
                      FROM student_change
                     WHERE student_change.deleted = 0
                       AND student_change.student_id = student.id) AS change_count,
                   created_at
              FROM student
             WHERE deleted = 0
               <if test="studentName != null and studentName != ''">
               AND student_name LIKE CONCAT('%', #{studentName}, '%')
               </if>
               <if test="studentStatus != null">
               AND student_status = #{studentStatus}
               </if>
             ORDER BY id DESC
            </script>
            """)
    List<StudentBrief> list(StudentQuery query);

    /**
     * 查询学生主档。学籍和异动由服务再查一次后组装。
     *
     * @param id 学生 ID
     * @return 主档，不存在时返回 null
     */
    @Select("""
            SELECT id,
                   student_no,
                   student_name,
                   student_status,
                   created_at,
                   updated_at
              FROM student
             WHERE deleted = 0
               AND id = #{id}
            """)
    StudentDetail detail(@Param("id") Long id);

}
