import fs from 'fs';
import * as uuid from 'uuid';

interface User {
    token: string;
}

if (!fs.existsSync('./accounts.json')) {
    fs.writeFileSync('./accounts.json', "{}");
}

export let accounts = new Proxy(JSON.parse(fs.readFileSync("./accounts.json").toString()) as { [key: string]: User; }, {
    get (target, name) {
        if (typeof name === "symbol") throw "What the heck are symbols";

        if (target[name]) {
            return target[name];
        }
        else {
            const user = JSON.parse(fs.readFileSync("./accounts.json").toString())[name] as User | undefined;
            if (user) {
                return user;
            }
            else {
                return accounts[name] = { token: uuid.v4() };
            }
        }
    },

    set (target, name, value) {
        if (typeof name === "symbol") throw "What the heck are symbols";

        target[name] = value;
        fs.writeFileSync("./accounts.json", JSON.stringify(target));

        return true;
    }
}) as {
    [key: string]: User;
};