import XApp, {XBefore} from "./base/App";

export default class App extends XApp {
    constructor(context, apiName) {
        super(context, apiName);
        this.before = new Before(this);
        this.globalNeedParams = {
            // activityId: "string"
        }
    }

    before: Before;
}

class Before extends XBefore {
    // test() {
    //     this.addBefore = async (app: App) => {
    //         //...
    //     }
    // }
}
