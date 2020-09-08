import App from "./src/main/App";
import UserService from "./src/main/service/UserService";
import BaseResult from "./src/main/dto/BaseResult";
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

// @ts-ignore
exports.enter = async (context) => {
    const app = new App(context, "enter");
    return await app.run(async function () {
        let userService = new UserService(context);
        let rs = await userService.enter();
        return BaseResult.success("成功", rs);
    });
}

/**
 * 自己的排名
 * @param context
 */
// @ts-ignore
exports.selfRank = async (context) => {
    const app = new App(context, "selfRank");
    return await app.run(async function () {
        let userService = new UserService(context);
        let rs = await userService.selfRank();
        return BaseResult.success("成功", rs);
    });
}

/**
 * 入会
 * @param context
 */
// @ts-ignore
exports.enterMember = async (context) => {
    const app = new App(context, "enterMember");
    return await app.run(async function () {
        let userService = new UserService(context);
        let rs = await userService.enterMember();
        return BaseResult.success("成功", rs);
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



