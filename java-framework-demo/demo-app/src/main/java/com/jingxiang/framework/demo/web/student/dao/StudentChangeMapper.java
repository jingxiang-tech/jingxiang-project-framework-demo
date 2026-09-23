package com.jingxiang.framework.demo.web.student.dao;

import com.jingxiang.framework.demo.commons.model.StudentChangePo;
import com.jingxiang.framework.demo.web.student.model.StudentChangeDetail;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 学籍异动存取。一个学生多条。
 */
@Mapper
public interface StudentChangeMapper {

    /**
     * 按学生查询异动，日期倒序。
     *
     * @param studentId 学生 ID
     * @return 异动列表
     */
    @Select("""
            SELECT id,
                   changed_on,
                   change_type,
                   remark
              FROM student_change
             WHERE deleted = 0
               AND student_id = #{studentId}
             ORDER BY changed_on DESC, id DESC
            """)
    List<StudentChangeDetail> list(@Param("studentId") Long studentId);

    /**
     * 批量写入异动。调用方保证列表非空。
     *
     * @param changes 异动记录
     * @return 影响行数
     */
    @Insert("""
            <script>
            INSERT INTO student_change (
                   student_id,
                   changed_on,
                   change_type,
                   remark,
                   deleted,
                   created_at,
                   updated_at
            ) VALUES
            <foreach collection="changes" item="item" separator=",">
            (
                   #{item.studentId},
                   #{item.changedOn},
                   #{item.changeType},
                   #{item.remark},
                   #{item.deleted},
                   #{item.createdAt},
                   #{item.updatedAt}
            )
            </foreach>
            </script>
            """)
    int insertBatch(@Param("changes") List<StudentChangePo> changes);

    /**
     * 按学生逻辑删除全部异动。
     *
     * @param studentId 学生 ID
     * @return 影响行数
     */
    @Update("""
            UPDATE student_change
               SET deleted = 1,
                   updated_at = NOW()
             WHERE deleted = 0
               AND student_id = #{studentId}
            """)
    int delete(@Param("studentId") Long studentId);
}
