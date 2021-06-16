import App from "./App";
import {XApp} from "./base/App";
import UserService from "./src/service/UserService";

const modules = [UserService];
// @ts-ignore
XApp.initExpose(App, exports);
