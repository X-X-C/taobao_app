import App from "./src/App";
import UserService from "./src/service/UserService";
import PrizeService from "./src/service/PrizeService";

// @ts-ignore
exports.main = async (context) => {
    const app = new App(context, "main");
    app.config.globalActivity = true;
    return await app.run(async function () {
    });
}


// @ts-ignore
exports.assist = async (context) => {
    const app = new App(context, "assist");
    app.config.globalActivity = true;
    let need = ['sopenId']
    return await app.run(async function () {
        await app.getService(UserService).assist();
    }, need);
}


// @ts-ignore
exports.task = async (context) => {
    const app = new App(context, "task");
    app.config.globalActivity = true;
    let need = ['target'];
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.normalTask(this.target);
    }, need);
}


// @ts-ignore
exports.enter = async (context) => {
    const app = new App(context, "enter");
    app.config.globalActivity = true;
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.enter();
    });
}


// @ts-ignore
exports.userInfo = async (context) => {
    const app = new App(context, "userInfo");
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.userInfo();
    });
}


// @ts-ignore
exports.updateUser = async (context) => {
    const app = new App(context, "updateUser");
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.updateUser();
    });
}


// @ts-ignore
exports.lottery = async (context) => {
    const app = new App(context, "lottery");
    app.config.globalActivity = true;
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.lottery();
    });
}


// @ts-ignore
exports.myPrize = async (context) => {
    const app = new App(context, "myPrize");
    return await app.run(async function () {
        let prizeService = app.getService(PrizeService);
        await prizeService.my();
    });
}

// @ts-ignore
exports.receivePrize = async (context) => {
    const app = new App(context, "receivePrize");
    let need = ['prizeId'];
    return await app.run(async function () {
        let prizeService = app.getService(PrizeService);
        await prizeService.receive();
    }, need);
}

