-- 学号全局唯一，是并发下的最终防线，不能只靠先查再插。
CREATE TABLE IF NOT EXISTS student (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '学生 ID',
    student_no VARCHAR(32) NOT NULL COMMENT '学号',
    student_name VARCHAR(40) NOT NULL COMMENT '姓名',
    student_status VARCHAR(32) NOT NULL COMMENT '学生状态：ENROLLED 在读，SUSPENDED 休学，GRADUATED 毕业',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除：0 否，1 是',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    CONSTRAINT uk_student_no UNIQUE (student_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生';

CREATE TABLE IF NOT EXISTS student_enrollment (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '学籍 ID',
    student_id BIGINT NOT NULL COMMENT '学生 ID',
    enrolled_on DATE NOT NULL COMMENT '入学日期',
    class_name VARCHAR(40) NOT NULL COMMENT '班级',
    major VARCHAR(40) NOT NULL COMMENT '专业',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除：0 否，1 是',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    CONSTRAINT uk_student_enrollment_student_id UNIQUE (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学籍';

CREATE TABLE IF NOT EXISTS student_change (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '异动 ID',
    student_id BIGINT NOT NULL COMMENT '学生 ID',
    changed_on DATE NOT NULL COMMENT '异动日期',
    change_type VARCHAR(32) NOT NULL COMMENT '异动类型：TRANSFER 转班，SUSPEND 休学，RESUME 复学，GRADUATE 毕业',
    remark VARCHAR(200) NOT NULL COMMENT '说明',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除：0 否，1 是',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_student_change_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学籍异动';

INSERT INTO student (student_no, student_name, student_status)
SELECT seed.student_no,
       seed.student_name,
       seed.student_status
  FROM (
       SELECT 'S2024001' AS student_no, 'James Walker' AS student_name, 'ENROLLED' AS student_status
       UNION ALL SELECT 'S2024002', 'Lily Brooks', 'ENROLLED'
       UNION ALL SELECT 'S2024003', 'Ethan Clark', 'SUSPENDED'
       UNION ALL SELECT 'S2023001', 'Sophia Bennett', 'GRADUATED'
       UNION ALL SELECT 'S2024004', 'Noah Hayes', 'ENROLLED'
       UNION ALL SELECT 'S2024005', 'Mia Foster', 'ENROLLED'
       UNION ALL SELECT 'S2022001', 'Oliver Reed', 'GRADUATED'
       UNION ALL SELECT 'S2024006', 'Ava Morgan', 'ENROLLED'
       UNION ALL SELECT 'S2024007', 'Lucas Perry', 'SUSPENDED'
       UNION ALL SELECT 'S2023008', 'Grace Coleman', 'ENROLLED'
       UNION ALL SELECT 'S2024008', 'Henry Shaw', 'ENROLLED'
       UNION ALL SELECT 'S2021004', 'Chloe Adams', 'GRADUATED'
       ) AS seed
 WHERE NOT EXISTS (
       SELECT 1
         FROM student
        WHERE student.student_no = seed.student_no
 );

INSERT INTO student_enrollment (student_id, enrolled_on, class_name, major)
SELECT student.id,
       seed.enrolled_on,
       seed.class_name,
       seed.major
  FROM (
       SELECT 'S2024001' AS student_no, DATE '2024-09-01' AS enrolled_on, '计算机2401' AS class_name, '计算机科学与技术' AS major
       UNION ALL SELECT 'S2024002', DATE '2024-09-01', '软件2401', '软件工程'
       UNION ALL SELECT 'S2024003', DATE '2023-09-01', '会计2302', '会计学'
       UNION ALL SELECT 'S2023001', DATE '2023-09-01', '汉语言2301', '汉语言文学'
       UNION ALL SELECT 'S2024004', DATE '2024-09-01', '英语2402', '英语'
       UNION ALL SELECT 'S2024005', DATE '2024-09-01', '数学2401', '数学与应用数学'
       UNION ALL SELECT 'S2022001', DATE '2022-09-01', '法学2201', '法学'
       UNION ALL SELECT 'S2024006', DATE '2024-09-01', '临床2401', '临床医学'
       UNION ALL SELECT 'S2024007', DATE '2024-09-01', '新闻2401', '新闻学'
       UNION ALL SELECT 'S2023008', DATE '2023-09-01', '建筑2301', '建筑学'
       UNION ALL SELECT 'S2024008', DATE '2024-09-01', '机械2402', '机械工程'
       UNION ALL SELECT 'S2021004', DATE '2021-09-01', '历史2101', '历史学'
       ) AS seed
  JOIN student
    ON student.student_no = seed.student_no
   AND student.deleted = 0
 WHERE NOT EXISTS (
       SELECT 1
         FROM student_enrollment
        WHERE student_enrollment.student_id = student.id
          AND student_enrollment.deleted = 0
 );

INSERT INTO student_change (student_id, changed_on, change_type, remark)
SELECT student.id,
       seed.changed_on,
       seed.change_type,
       seed.remark
  FROM (
       SELECT 'S2024001' AS student_no, DATE '2025-03-01' AS changed_on, 'TRANSFER' AS change_type, '由计算机2402转入' AS remark
       UNION ALL SELECT 'S2024003', DATE '2025-02-18', 'SUSPEND', '因病休学一年'
       UNION ALL SELECT 'S2023001', DATE '2026-06-20', 'GRADUATE', '完成学业'
       UNION ALL SELECT 'S2024005', DATE '2025-09-01', 'RESUME', '休学期满复学'
       UNION ALL SELECT 'S2024007', DATE '2025-11-03', 'SUSPEND', '个人原因休学'
       UNION ALL SELECT 'S2024008', DATE '2025-03-12', 'TRANSFER', '由机械2401转入'
       ) AS seed
  JOIN student
    ON student.student_no = seed.student_no
   AND student.deleted = 0
 WHERE NOT EXISTS (
       SELECT 1
         FROM student_change
        WHERE student_change.student_id = student.id
          AND student_change.changed_on = seed.changed_on
          AND student_change.change_type = seed.change_type
          AND student_change.deleted = 0
 );
