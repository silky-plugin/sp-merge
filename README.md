## Documents

合并文件

```js
[
  //支持两种配置格式。 一种为正则模式，一种为普通字符串匹配模式
  {
    "_regexp": true, //表示source 将在项目全局 进行正则匹配
    "target": "/js/global.js", //目标文件。绝对路径。  在start时， path = target 触发合并。 在build的时，正在处理的文件  根据source正则匹配触发合并
    "source": [
      "(\\-componts\\.js)$",
      "B-beMerge"
    ],
    "keepSource": false //是否把被合并的个体文件也属出来， 默认false。 可选true
  },
  {
    "suffix": "js/",
    "postfix": ".js",
    "target": "/js/global-1",//目标文件。绝对路径。在start时， path = target 触发合并。 在build的时， 正在处理的文件路径 等于   source里面的 （ suffix + sourceItem + protfix） 时触发合并
    "source": [
      "A-componts",
      "B-beMerge"
    ],
    "keepSource": false //是否把被合并的个体文件也属出来， 默认false。 可选true
  },
  ...
]
```
