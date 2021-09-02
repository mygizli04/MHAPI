import * as codepass from './codepass/index';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.KEY) {
    console.error("CodePass API key could not be loaded.");
    process.exit(1);
}

type Reason = "Invalid username." | "Invalid password." | null;

interface Result {
    success: boolean,
    reason?: Reason;
}

function checkResultToReason (checkReason: codepass.CheckResult): Reason {
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
        const result = await codepass.check(process.env.KEY!, username, password);

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