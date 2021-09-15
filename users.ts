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

/**
 * The object that contains all accounts.
 * 
 * Warning: This object is a proxy that handles caching, reading and writing of accounts.json. You should not write to accounts.json manually.
 * 
 * Assume this object is always up to date.
 * 
 * Warning: Make sure to assign directly to this object's properties in order for them to get picked up by the proxy.
 * 
 * @example
 * ```javascript
 * // What NOT to do
 * accounts["user"].minehutAccounts.push(account);
 * 
 * // What to ACTUALLY do
 * let user = accounts["user"]
 * user.minehutAccounts.push(account);
 * accounts["user"] = user;
 * ```
 */
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