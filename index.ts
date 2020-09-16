import App from "./src/App";
//每次请求都必须要的参数
App.config.needParams = {};
// @ts-ignore
exports.main = async (context) => {
    const app = new App(context, "main");
    // App.config.needParams = {};
    return await app.run(async function () {
        //..
    });
}
