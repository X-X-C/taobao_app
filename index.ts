import App from "./App";
import UserService from "./src/service/UserService";
import PrizeService from "./src/service/PrizeService";
import SpmService from "./src/service/SpmService";
import {XApp} from "./base/App";

//必须显式使用才会编译出导入模块...
const modules = [UserService, PrizeService, SpmService];
for (let entry of Object.entries(XApp.exports)) {
    // @ts-ignore
    exports[entry[0]] = async (context) => {
        const app = new App(context, entry[0]);
        app.runNeedParams = entry[1].params || {};
        if (!entry[1].needGlobalParam) {
            app.globalNeedParams = {};
        }
        entry[1].before.forEach(v => v.call(app.before))
        return await app.run(async function () {
            await app.getService(entry[1].constructor)[entry[0]]();
        });
    }
}
