## 全局参数

| 参数   | 类型   | 必填 | 说明   |
| --- |--- |--- | --- |
|activityId|string|true|活动ID|

## 活动特殊配置

```json

```

<% data.forEach(group => { -%><% for(let g of group.subs){ %>## 接口名称：<%- g.url %>

### 接口说明：<%- g.title%>

<%- g.description %>

### 云函数 <%- g.type %>

### 请求参数说明

<%if(g.parameter === undefined){%>无<%}else{_%>
| 参数 | 类型 | 必填 | 说明 | 
|----|----|----|---- |<%for(let param of g.parameter.fields.Parameter){%>
| <%-param.field%> | <%-param.type%> | <%-!param.optional%> | <%-param.description%> |<%}-%>

<%if(g.parameter.examples){for(let e of g.parameter.examples){%>
<%-e.title%>参数示例：
```<%-e.type%>
<%-e.content%>
```
<%}}_%>
<%}%>
### 返回值

```json
<%if(g.success){_%><%-g.success.examples[0].content_%><%}%>
```

<%}%><% }) -%>
## 接口名称：spm

### 接口说明

埋点

### 云函数 spm

### 埋点类型

```
自主入会人数 - 调用spmMember接口
```

### 请求实例

https://www.yuque.com/ggikb6/kn8z1d/avrvek#gkbK3
