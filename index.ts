import express from 'express';
import * as account from './accounts';
import { MinehutAccount, minetronLogin } from './minehutAccount';
import * as users from './users';
import { objectForEach, objectIndexOf } from './Utils';

const app = express();

app.get('/usernamepassword', async (req, res) => {

    if (!req.headers.username || Array.isArray(req.headers.username)) {
        res.status(400).send(JSON.stringify({
            success: false,
            reason: "Invalid username."
        }));
        return;
    }
    else if (!req.headers.password || Array.isArray(req.headers.password)) {
        res.status(400).send(JSON.stringify({
            success: false,
            reason: "Invalid password."
        }));
        return;
    }

    const check = await account.check(req.headers.username, req.headers.password)

    if (check.success) {
        res.send({
            success: true,
            user: users.accounts[req.headers.username]
        })
    }
    else {
        res.status(401).send(check)
    }
    return;
});

app.post('/create', async (req, res) => {
    if (!req.headers.username || Array.isArray(req.headers.username)) {
        res.status(400).send(JSON.stringify({
            success: false,
            reason: "Invalid username."
        }));
        return;
    }
    else if (!req.headers.password || Array.isArray(req.headers.password)) {
        res.status(400).send(JSON.stringify({
            success: false,
            reason: "Invalid password."
        }));
        return;
    }

    res.send(await account.create(req.headers.username, req.headers.password));
    return;
});

app.post('/link/minetron', async (req, res) => {
    let user = verifyAuthorization(req.headers.authorization)

    if (user) {
        if (typeof req.headers.token !== 'string') {
            res.status(400).send({
                success: false,
                reason: "Invalid minetron token."
            })
            return;
        }

        let account: MinehutAccount;
        try {
            account = await minetronLogin(req.headers.token)
        }
        catch (err) {
            let reason: string

            if (err === "Invalid UUID") {
                reason = "Invalid minetron token."
            }
            else {
                if (typeof err === "string") {
                    reason = err;
                }
                else if (typeof err === "object" && err !== null && err.toString && err.toString() !== "[object Object]") {
                    reason = "An error occured while resolving minetron token: " + err.toString();
                }
                else {
                    reason = "An unknown error occured while resolving minetron token."
                }
            }

            res.status(401).send({
                success: false,
                reason: reason
            })
            return;
        }
        user.minehutAccounts.push(account);

        users.accounts[objectIndexOf(users.accounts, user)!] = user;
        res.send({
            success: true,
            user: user
        })
    }
    else {
        res.status(401).send({
            success: false,
            reason: "Invalid authorization token."
        })
    }
})

function verifyAuthorization(header: string | string[] | undefined): null | users.User {
    if (!header || Array.isArray(header)) {
        return null;
    }

    let ret: null | users.User = null;
    objectForEach(users.accounts, (obj, user) => {
        if (user.token === header) {
            ret = user
        }
    })
    return ret
}

app.listen(80, () => {
    console.log("Listening on port 80!")
});