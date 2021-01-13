import App from "../../base/App";
import BaseUserService from "./abstract/BaseUserService";

export default class UserService extends BaseUserService {
    constructor(app: App) {
        super(app);
    }
}
