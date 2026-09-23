# 字典序列化 `@DictSerialize`

列表和详情只存状态编码。返回 JSON 时，`DictSerializer` 会按字段上的 `@DictSerialize` 再补一个中文名字段，前端不用自己翻译枚举。

注解写在 **Brief / Detail** 上。字段名决定多出来的那个 key：原字段名后面加 `Name`。

## 案例：学生状态

`studentStatus` 的类型是 `StudentStatusEnum`，枚举放在 commons 的 `dict` 包。不加注解时，接口只返回枚举 key：

```json
{
  "studentStatus": "ENROLLED"
}
```

加上注解之后：

```java
/**
 * 不叫 status：status 太常见，容易和其他状态混淆。
 * 优先用具体对象上的名字，如 studentStatus、orderStatus。
 */
@DictSerialize(StudentStatusEnum.class)
private StudentStatusEnum studentStatus;
```

同一条数据会多返回 `studentStatusName`。值来自枚举里的 `name`：

```java
public enum StudentStatusEnum {

    ENROLLED("在读"),
    SUSPENDED("休学"),
    GRADUATED("毕业");

    public final String name;
}
```

```json
{
  "studentStatus": "ENROLLED",
  "studentStatusName": "在读"
}
```

`SUSPENDED` 对应的 `studentStatusName` 是 `休学`，`GRADUATED` 对应 `毕业`。

学生列表 `GET http://127.0.0.1:8000/api/student` 和详情 `GET http://127.0.0.1:8000/api/student/{id}` 都是这个写法，字段定义在 `StudentBrief`、`StudentDetail`。

异动记录上的 `changeType` 同样处理，多返回 `changeTypeName`，例如 `TRANSFER` 对应 `转班`。字段定义在 `StudentChangeDetail`。

管理端默认端口是 `9000`。
