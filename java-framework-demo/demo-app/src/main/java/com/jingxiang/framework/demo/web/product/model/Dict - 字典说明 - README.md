# 字典序列化 `@DictSerialize`

列表和详情只存状态编码。返回 JSON 时，`DictSerializer` 会按字段上的 `@DictSerialize` 再补一个中文名字段，前端不用自己翻译枚举。

注解写在 **Brief / Detail** 上。字段名决定多出来的那个 key：原字段名后面加 `Name`。

## 案例：商品状态

`productStatus` 的类型是 `ProductStatusEnum`，枚举放在 commons 的 `dict` 包。不加注解时，接口只返回枚举 key：

```json
{
  "productStatus": "ON_SALE"
}
```

加上注解之后：

```java
/**
 * 不叫 status：status 太常见，容易和其他状态混淆。
 * 优先用具体对象上的名字，如 productStatus、orderStatus。
 */
@DictSerialize(ProductStatusEnum.class)
private ProductStatusEnum productStatus;
```

同一条数据会多返回 `productStatusName`。值来自枚举里的 `name`：

```java
public enum ProductStatusEnum {

    ON_SALE("在售"),
    OFF_SALE("下架");

    public final String name;
}
```

```json
{
  "productStatus": "ON_SALE",
  "productStatusName": "在售"
}
```

`OFF_SALE` 对应的 `productStatusName` 是 `下架`。

商品列表 `GET http://127.0.0.1:8000/api/product` 和详情 `GET http://127.0.0.1:8000/api/product/{id}` 都是这个写法，字段定义在 `ProductBrief`、`ProductDetail`。管理端默认端口是 `9000`。
