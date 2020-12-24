import App from "./base/App";
// @ts-ignore
exports.main = async (context) => {
    const app = new App(context, "main");
    app.config.globalActivity = true;
    return await app.run(async function () {
        //..
    });
}
