import fs from 'fs';
import * as uuid from 'uuid';
import * as MHAccount from './minehutAccount';

export class User {
    token: string;

    minehutAccounts: MHAccount.MinehutAccount[] = [];

    constructor (token?: string, accounts?: MHAccount.MinehutAccount[]) {
        this.token = token ?? uuid.v4();
        if (accounts) {
            this.minehutAccounts = accounts;
        }
    }
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
                return accounts[name] = { token: uuid.v4(), minehutAccounts: [] };
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