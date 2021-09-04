import * as minehut from 'minehut-ts';

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