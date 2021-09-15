import { LoginInfo } from "minehut-ts";
import { MinehutAccount } from "./minehutAccount";

export function objectForEach<Type> (obj: { [key: string]: Type; }, callback: (obj: { [key: string]: Type; }, value: Type, index: string) => any) {
    Object.entries(obj).forEach(entry => {
        callback(obj, entry[1], entry[0]);
    });
}

export function objectIndexOf<Type> (obj: { [key: string]: Type; }, value: Type): string | undefined {
    let result: string | undefined = undefined;
    objectForEach(obj, (obj, compare, index) => {
        if (value === compare) result = index;
    });
    return result;
}

export function hasOwnProperty<X extends Object, Y extends PropertyKey> (obj: X, prop: Y): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty(prop);
}

type Types = "undefined" | "object" | "boolean" | "number" | "bigint" | "string" | "symbol" | "function";

export function checkProperty<Value, Obj extends { [key: string]: Value; }> (obj: Obj, prop: string, type: Types, values?: Value | Value[], check?: (obj: Obj) => boolean) {

    if (!obj) {
        return false;
    }

    if (!hasOwnProperty(obj, prop)) {
        return false;
    }

    let valueCheck = true;

    if (values) {
        if (Array.isArray(values)) {
            valueCheck = values.includes(obj[prop]);
        }
        else {
            valueCheck = values === obj[prop];
        }
    }

    return typeof obj[prop] === type && valueCheck && (check ? check(obj) : true);
}

export function minehutAccountToLoginInfo (account: MinehutAccount): LoginInfo {
    return {
        authorization: account.auth.authorization,
        servers: [],
        slgSessionId: account.auth.slgSessionId,
        userId: account.id,
        xSessionId: account.auth.xSessionId,
        xSlgUser: account.auth.xSessionId
    };
}

export async function asyncArrayFilter<T> (array: T[], callback: (value: T, index: number, array: T[]) => Promise<boolean>): Promise<T[]> {
    let ret: T[] = [];
    array.forEach(async (element, index, array) => {
        if (await callback(element, index, array)) {
            ret.push(element);
        }
    });
    return ret;
}