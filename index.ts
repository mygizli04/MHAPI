import express from 'express';
import * as account from './accounts';
import { MinehutAccount, minetronLogin } from './minehutAccount';
import { CheckSuccessResponse, ErrorResponse } from './RequestInterfaces';
import * as users from './users';
import { objectForEach, objectIndexOf } from './Utils';

const app = express();

function error(reason: string): ErrorResponse {
    return {
        success: false,
        reason: reason
    }
}

app.get('/usernamepassword', async (req, res) => {

    let errors = {
        invalidUsername: error("Invalid username."),
        invalidPassword: error("Invalid password.")
    }

    if (typeof req.headers.username !== "string") {
        res.status(400).send(errors.invalidUsername);
        return;
    }
    else if (typeof req.headers.password !== "string") {
        res.status(400).send(errors.invalidPassword);
        return;
    }

    const check = await account.check(req.headers.username, req.headers.password)

    if (check.success) {
        let response: CheckSuccessResponse = {
            success: true,
            user: users.accounts[req.headers.username]
        }
        res.send(response);
    }
    else {
        res.status(401).send(check)
    }
    return;
});

app.post('/create', async (req, res) => {

    let errors = {
        invalidUsername: error("Invalid username."),
        invalidPassword: error("Invalid password.")
    }

    if (!req.headers.username || Array.isArray(req.headers.username)) {
        res.status(400).send(errors.invalidUsername);
        return;
    }
    else if (!req.headers.password || Array.isArray(req.headers.password)) {
        res.status(400).send(errors.invalidPassword);
        return;
    }

    res.send(await account.create(req.headers.username, req.headers.password));
    return;
});

app.post('/link', async (req, res) => {

    let errors = {
        invalidMinetronToken: error("Invalid minetron token."),
        invalidAuthorizationToken: error("Invalid authorization token.")
    }

    let user = verifyAuthorization(req.headers.authorization)

    if (user) {
        if (typeof req.headers.token !== 'string') {
            res.status(400).send(errors.invalidMinetronToken)
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
        
        let response: CheckSuccessResponse = {
            success: true,
            user: user
        }
        res.send(response);
    }
    else {
        res.status(401).send(errors.invalidAuthorizationToken)
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