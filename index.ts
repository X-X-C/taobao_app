import UserService from "./src/service/UserService";
import PrizeService from "./src/service/PrizeService";
import App from "./App";
import Time from "./base/utils/Time";


export async function main(context) {
    const app = new App(context, "main");
    return await app.run(async function () {
    });
}


export async function assist(context) {
    const app = new App(context, "assist");
    app.before.inspectionActivity();
    app.runNeedParams = {
        sopenId: "string",
    }
    return await app.run(async function () {
        await app.getService(UserService).assist();
    });
}


export async function task(context) {
    const app = new App(context, "task");
    app.before.inspectionActivity();
    app.runNeedParams = {
        target: "string"
    }
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.normalTask(this.target);
    });
}


export async function enter(context) {
    const app = new App(context, "enter");
    app.before.globalActivity();
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.enter();
    });
}


export async function userInfo(context) {
    const app = new App(context, "userInfo");
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.userInfo();
    });
}


export async function updateUser(context) {
    const app = new App(context, "updateUser");
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.updateUser();
    });
}


export async function lottery(context) {
    const app = new App(context, "lottery");
    app.before.inspectionActivity();
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.lottery();
    });
}


export async function spmMember(context) {
    const app = new App(context, "spmMember");
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.spmMember();
    });
}


export async function myPrize(context) {
    const app = new App(context, "myPrize");
    return await app.run(async function () {
        let prizeService = app.getService(PrizeService);
        await prizeService.my();
    });
}


export async function receivePrize(context) {
    const app = new App(context, "receivePrize");
    app.runNeedParams = {
        prizeId: "string"
    }
    return await app.run(async function () {
        let prizeService = app.getService(PrizeService);
        await prizeService.receive();
    });
}

export async function getTime(context) {
    const app = new App(context, "getTime");
    return await app.run(async function () {
        let time = new Time();
        app.response.data = {
            base: time.common.base,
            x: time.common.x
        }
    });
}



