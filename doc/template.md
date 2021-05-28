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
<%if(g.parameter === undefined){%>无<%}else{%>
| 参数 | 类型 | 必填 | 说明 | 
|----|----|----|---- |<%for(let param of g.parameter.fields.Parameter){%>
| <%-param.field%> | <%-param.type%> | <%-!param.optional%> | <%-param.description%> |<%}-%>
<%if(g.parameter.examples){for(let e of g.parameter.examples){%>
<%-e.title%>参数示例：
```<%-e.type%>
<%-e.content%>
```
<%}}%>
<%}%>

### 返回值

```json
<%if(g.success){_%><%-g.success.examples[0].content_%><%}%>
```

<%}%><% }) -%>
