import * as minehut from 'minehut-ts'; // Login to minehut

export async function minetronLogin (token: string): Promise<MinehutAccount> {
    return new Promise(async (resolve, reject) => {
        try {
            resolve(new MinehutAccount(await minehut.minetronLogin(token)));
        }
        catch (err) {
            reject(err);
        }
    });
}

/**
 * Login by token information
 * 
 * @async
 * @param account 
 * @returns MinehutAccount
 */
export async function rawLogin(account: MinehutAccount): Promise<MinehutAccount> {
    return new MinehutAccount(minehut._altLogin({
        userId: account.id,
        servers: [],
        authorization: account.auth.authorization,
        slgSessionId: account.auth.slgSessionId,
        xSessionId: account.auth.xSessionId,
        xSlgUser: account.auth.xSlgUser
    }));
}

export class MinehutAccount {
    id: string;
    servers: string[];

    auth: {
        authorization: string,
        xSessionId: string,
        slgSessionId: string,
        xSlgUser: string,
    };

    constructor (loginInfo: minehut.LoginInfo) {
        this.id = loginInfo.userId
        this.servers = loginInfo.servers
        this.auth = {
            authorization: loginInfo.authorization,
            xSessionId: loginInfo.xSessionId,
            slgSessionId: loginInfo.slgSessionId,
            xSlgUser: loginInfo.xSlgUser
        }
    }
}