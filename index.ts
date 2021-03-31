import UserService from "./src/service/UserService";
import PrizeService from "./src/service/PrizeService";
import App from "./base/App";

// @ts-ignore
exports.main = async (context) => {
    const app = new App(context, "main");
    return await app.run(async function () {
    });
}


// @ts-ignore
exports.assist = async (context) => {
    const app = new App(context, "assist");
    app.runConfig.inspectionActivity;
    app.runNeedParams = {
        sopenId: "string",
    }
    return await app.run(async function () {
        await app.getService(UserService).assist();
    });
}


// @ts-ignore
exports.task = async (context) => {
    const app = new App(context, "task");
    app.runConfig.inspectionActivity;
    app.runNeedParams = {
        target: "string"
    }
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.normalTask(this.target);
    });
}


// @ts-ignore
exports.enter = async (context) => {
    const app = new App(context, "enter");
    app.runConfig.setGlobalActivity
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
    app.runConfig.inspectionActivity;
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.lottery();
    });
}


// @ts-ignore
exports.spmMember = async (context) => {
    const app = new App(context, "spmMember");
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.spmMember();
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
    app.runNeedParams = {
        prizeId: "string"
    }
    return await app.run(async function () {
        let prizeService = app.getService(PrizeService);
        await prizeService.receive();
    });
}

