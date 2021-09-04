import * as codepass from './codepass/index';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.KEY) {
    console.error("CodePass API key could not be loaded.");
    process.exit(1);
}

type CheckReason = "Invalid username." | "Invalid password." | null;

interface Result {
    success: boolean,
    reason?: CheckReason;
}

function checkResultToReason (checkReason: codepass.CheckResult): CheckReason {
    switch (checkReason) {
        case 'InvalidAccount':
            return "Invalid username.";
        case "WrongPassword":
            return "Invalid password.";
        case null:
            return null;
    }
}

export async function check (username: string, password: string): Promise<Result> {
    return new Promise(async (resolve, reject) => {
        let result: [boolean, codepass.CheckResult];
        try {
            result = await codepass.check(process.env.KEY!, username, password);
        }
        catch (err) {
            if (err === "Invalid API Key.") {
                reject({
                    sucess: false,
                    reason: err
                })
                return; 
            }
            reject(err);
            return;
        }

        if (result[0]) {
            resolve({ success: true });
            return;
        }
        else {
            resolve({
                success: false,
                reason: checkResultToReason(result[1])
            });
            return;
        }
    });
}

export async function create (username: string, password: string): Promise<Result> {
    return new Promise(async (resolve, reject) => {
        try {
            await codepass.create(process.env.KEY!, username, password)
        }
        catch (err) {
            return reject(err);
        }

        resolve({
            success: true
        });
    });
}