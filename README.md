# persist

使用本地存储实现数据持久化，并能设置过期时间和自定义命名空间。

## 安装

```bash
npm install @gunny/persist
```

## 使用

```js
import Persist from "@gunny/persist";

// 创建 Persist 实例
const persist = new Persist("a name");

// 设置
persist.set("logged", true);

// 设置一分钟后过期
persist.set("logged", true, 60);

// 获取登录状态
const logged = persist.get("logged");

// 移除登录状态
persist.remove("logged");

// 清空所有数据
persist.clear();
```
