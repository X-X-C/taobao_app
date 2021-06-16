import UserService from "./src/service/UserService";
import PrizeService from "./src/service/PrizeService";
import SpmService from "./src/service/SpmService";
import {XApp} from "./base/App";
import App from "./App";

// tsconfig.json配置 importsNotUsedAsValues 的值可以控制没被使用的导入语句将会被如何处理
const modules = [
    UserService,
    PrizeService,
    SpmService
];
XApp.initExpose(App, exports);
