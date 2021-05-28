<% data.forEach(group => { -%><% for(let g of group.subs){ %>## 接口名称：<%- g.url %>
```json
{
    "handler": "<%-g.url%>",
    "data": {
        "activityId": ""<%-g.parameter ? "," : "",%>
<%if(g.parameter){  for(let param of g.parameter.fields.Parameter){ -%>
        <%-`"${param.field}": ""${g.parameter.fields.Parameter.findIndex(v=>v === param) === g.parameter.fields.Parameter.length - 1? "" : ","}`%>
<%}}-%>
    }
}
```
<%}%><% }) -%>
