import App from "./App";
import XApp from "./base/App";
import UserService from "./src/service/UserService";
import PrizeService from "./src/service/PrizeService";
import SpmService from "./src/service/SpmService";

[UserService, PrizeService, SpmService].forEach(v => v.init);
for (let entry of Object.entries(XApp.exports)) {
    // @ts-ignore
    exports[entry[0]] = async (context) => {
        const app = new App(context, entry[0]);
        app.runNeedParams = entry[1].params || {};
        if (!entry[1].needGlobalParam) {
            app.globalNeedParams = {};
        }
        return await app.run(async function () {
            await app.getService(entry[1].constructor)[entry[0]]();
        });
    }
}
