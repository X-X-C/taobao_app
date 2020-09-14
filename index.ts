import App from "./src/App";
import UserService from "./src/service/UserService";
import BaseResult from "./src/dto/BaseResult";
//每次请求都必须要的参数
App.config.needParams = {};
// @ts-ignore
exports.main = async (context) => {
    const app = new App(context, "main");
    App.config.needParams = {};
    return await app.run(async function () {
        // do...
    });
}
/**
 * 获取用户
 * @param context
 */
// @ts-ignore
exports.user = async (context) => {
    const app = new App(context, "user");
    return await app.run(async function () {
        let userService = new UserService(context);
        let user = await userService.get();
        return BaseResult.success("成功", {
            user
        })
    });
}
/**
 * 更新用户信息
 * @param context
 */
// @ts-ignore
exports.updateUser = async (context) => {
    const app = new App(context, "updateUser");
    let need = {avatar: ""}
    return await app.run(async function () {
        let userService = new UserService(context);
        let code = await userService.updateUser();
        return BaseResult.success("成功", {code});
    }, need);
}



