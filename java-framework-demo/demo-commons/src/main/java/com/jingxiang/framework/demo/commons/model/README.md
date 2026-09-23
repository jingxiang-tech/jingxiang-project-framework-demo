# 持久化对象 Po

这里放表对应的 Po。一行记录一个类，给 `demo-app`、`demo-ms` 共用。不要在某一端再复制一份。

Po 只负责和表打交道，不返回给前端。列表用 Brief，详情用 Detail，入参用 Create / Update / Query。那些类放在 `web/{domain}/model`，不放这里。

## 什么时候放这里

- 这张表会被多个模块读写。
- 字段就是表上的列，包含主键、业务列和通用列。

只为一个接口临时组出来的结构，不是一张表，不要做成 Po。

一张表一个 Po。学生、学籍、异动是三张表，所以是 `StudentPo`、`StudentEnrollmentPo`、`StudentChangePo`，不要把学籍和异动的列塞进 `StudentPo`。

## 通用内容

每张业务表的 Po 都带这些：

| 内容 | 约定 |
| --- | --- |
| 主键 | `id`，`@TableId(type = IdType.AUTO)` |
| 表名 | `@TableName`，与库表一致 |
| 是否删除 | `deleted`，`Integer`。`Whether.No` 否，`Whether.Yes` 是。Java 字段不加 `is` |
| 时间 | `createdAt`、`updatedAt` |
| 落库枚举 | 类型用 `commons.dict` 里的枚举，例如 `StudentStatusEnum` |
| 注解 | `@Getter` `@Setter` `@Builder` `@NoArgsConstructor` `@AllArgsConstructor` |

类写中文名称注释。每个字段都写中文注释，Po、Brief、Detail、Create、Update、Query 一样，不能只给一部分字段写。

```java
/**
 * 学生持久化对象，不直接返回给前端。
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("student")
public class StudentPo {

    /** 学生 ID */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 学号 */
    private String studentNo;

    /** 姓名 */
    private String studentName;

    /** 学生状态 */
    private StudentStatusEnum studentStatus;

    /** 是否删除：Whether.No 否，Whether.Yes 是 */
    private Integer deleted;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}
```

禁止用 record：Po 要走 MyBatis，也要能 `BeanUtils.copyProperties`。

## 不放这里的

- Create、Update、Query、Brief、Detail。
- 接口要多返回的中文名。`@DictSerialize` 写在 Brief / Detail 上。
- 只在一次查询里拼出来的条数、名称。例如列表上的 `changeCount` 属于 Brief，不是 `student` 表的列。
