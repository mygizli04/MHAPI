import { MinehutAccount } from "./minehutAccount";
import * as minehut from 'minehut-ts';
import { minehutAccountToLoginInfo } from './Utils';

/**
 * Check if a minehut account is still logged in.
 * 
 * @async
 * @param account 
 * @returns boolean
 */
export async function checkAccount (account: MinehutAccount): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        minehut._altLogin(minehutAccountToLoginInfo(account));
        try {
            await minehut.fetchServers();
        }
        catch {
            resolve(false);
            return;
        }
        resolve(true);
    });
}