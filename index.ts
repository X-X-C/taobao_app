import App from "./App";
import {XApp} from "./base/App";
import UserService from "./src/service/UserService";

const services = [UserService];
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
