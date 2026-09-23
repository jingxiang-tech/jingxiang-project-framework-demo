# 字典枚举

放在本目录的枚举，是要落库、并且要给前端一个中文名的固定取值。`demo-app` 和 `demo-ms` 共用这一份，不要在某一端再复制一个。

字典扫描路径是 `com.jingxiang.framework.demo`，见 `demo-app` 的 `application.yml`。

## 什么时候放这里

- 取值会写入数据库，列表和详情要同时给出编码和中文名。
- 两个及以上模块都会用到同一个取值。

只在一个接口的入参里出现、也不落库的取值，跟那个接口放在一起，不要提前抽到这里。

是否、有无不要在这里再定义一套。用 `com.jingxiang.commons.model.dict.Whether`：`Whether.No` 否，`Whether.Yes` 是。

## 写法

- 类名写具体对象，`StudentStatusEnum`，不要叫 `StatusEnum`。
- 常量全大写。每个常量一行中文注释，并带中文 `name`。
- 库存的是常量名，例如 `ENROLLED`，不是序号。

```java
/**
 * 学生状态。
 */
public enum StudentStatusEnum {

    /** 在读 */
    ENROLLED("在读"),

    /** 休学 */
    SUSPENDED("休学"),

    /** 毕业 */
    GRADUATED("毕业");

    /** 状态名称 */
    public final String name;

    StudentStatusEnum(String name) {
        this.name = name;
    }
}
```

本目录现有两个例子：

| 枚举 | 用途 |
| --- | --- |
| `StudentStatusEnum` | 学生状态：在读、休学、毕业 |
| `StudentChangeTypeEnum` | 某一条异动记录的类型。它只描述这条记录，不负责把学生状态改掉 |

## 和接口的关系

枚举本身不加 `@DictSerialize`。注解写在 web 模块的 Brief / Detail 上，序列化时会多一个 `Name` 字段，例如 `studentStatus` 旁边多出 `studentStatusName`。

字段不要叫 `status`。`status` 太常见，用 `studentStatus`、`changeType` 这种带对象的名字。

接口上的完整写法见 `demo-app` 里的 `Dict - 字典说明 - README.md`。
