import App from "./base/App";
import UserService from "./src/service/UserService";

// @ts-ignore
exports.main = async (context) => {
    const app = new App(context, "main");
    return await app.run(async function () {
        return "OK";
    });
}

// @ts-ignore
exports.enter = async (context) => {
    const app = new App(context, "enter");
    app.config.globalActivity = true;
    return await app.run(async function () {
        let userService = app.getService(UserService);
        return await userService.enter();
    });
}


// @ts-ignore
exports.userInfo = async (context) => {
    const app = new App(context, "userInfo");
    return await app.run(async function () {
        let userService = app.getService(UserService);
        return await userService.userInfo();
    });
}


// @ts-ignore
exports.updateUser = async (context) => {
    const app = new App(context, "updateUser");
    return await app.run(async function () {
        let userService = app.getService(UserService);
        return await userService.updateUser();
    });
}

