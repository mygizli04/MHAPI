import express from 'express'; // Implement the API
import bodyParser from 'body-parser'; // JSON parsing for Express
import * as account from './accounts'; // Implement CodePass accounts 
import { MinehutAccount, minetronLogin, rawLogin } from './minehutAccount'; // Implement logging into MineHut
import { checkLinkAccountRequest, checkMinetronLinkAccountRequest, checkRawLinkAccountRequest, CheckSuccessResponse, ErrorResponse } from './RequestInterfaces'; // Type all responses this API can send.
import * as users from './users'; // Implement local users
import { objectForEach, objectIndexOf, asyncArrayFilter } from './Utils'; // Various utilities
import { checkAccount } from './minehutFunctions'; // Functions related to using the minehut API

const jsonParser = bodyParser.json();
const app = express();

/**
 * Generate an error message.
 * 
 * @param reason The reason for this error.
 * @returns ErrorResponse
 */
function error (reason: string): ErrorResponse {
    return {
        success: false,
        reason: reason
    };
}

/**
 * Authenticate the user with their CodePass username/password
 */
app.get('/usernamepassword', async (req, res) => {

    let errors = {
        invalidUsername: error("Invalid username."),
        invalidPassword: error("Invalid password.")
    };

    if (typeof req.headers.username !== "string") {
        res.status(400).send(errors.invalidUsername);
        return;
    }
    else if (typeof req.headers.password !== "string") {
        res.status(400).send(errors.invalidPassword);
        return;
    }

    const check = await account.check(req.headers.username, req.headers.password);

    if (check.success) {
        let response: CheckSuccessResponse = {
            success: true,
            user: users.accounts[req.headers.username]
        };
        res.send(response);
    }
    else {
        res.status(401).send(check);
    }
    return;
});

/**
 * Create a new account
 */
app.post('/create', async (req, res) => {

    let errors = {
        invalidUsername: error("Invalid username."),
        invalidPassword: error("Invalid password.")
    };

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

/**
 * Link a minehut account with a local account
 */
app.post('/link', jsonParser, async (req, res) => {

    let errors = {
        invalidMinetronToken: error("Invalid minetron token."),
        invalidAuthorizationToken: error("Invalid authorization token."),
        invalidSyntax: error("Your request is malformed.")
    };

    if (!checkLinkAccountRequest(req.body)) {
        res.status(500).send(errors.invalidSyntax);
        return;
    }

    let user = verifyAuthorization(req.headers.authorization);

    if (user) {
        let account: MinehutAccount;
        if (checkMinetronLinkAccountRequest(req.body)) {
            if (typeof req.body.token !== 'string') {
                res.status(400).send(errors.invalidMinetronToken);
                return;
            }

            try {
                account = await minetronLogin(req.body.token);
            }
            catch (err) {
                let reason: string;

                if (err === "Invalid UUID") {
                    reason = "Invalid minetron token.";
                }
                else {
                    if (typeof err === "string") {
                        reason = err;
                    }
                    else if (typeof err === "object" && err !== null && err.toString && err.toString() !== "[object Object]") {
                        reason = "An error occured while resolving minetron token: " + err.toString();
                    }
                    else {
                        reason = "An unknown error occured while resolving minetron token.";
                    }
                }

                res.status(401).send({
                    success: false,
                    reason: reason
                });
                return;
            }
        }
        else if (checkRawLinkAccountRequest(req.body)) {
            account = await rawLogin({
                auth: {
                    authorization: req.body.authDetails.authorization,
                    slgSessionId: req.body.authDetails.slgSessionId,
                    xSessionId: req.body.authDetails.xSessionId,
                    xSlgUser: req.body.authDetails.xSlgUser
                },
                id: req.body.authDetails.userId,
                servers: []
            });
        }
        else {
            return res.status(400).send(errors.invalidSyntax);
        }
        user.minehutAccounts.push(account);

        users.accounts[objectIndexOf(users.accounts, user)!] = user;

        let response: CheckSuccessResponse = {
            success: true,
            user: user
        };
        res.send(response);
    }
    else {
        res.status(401).send(errors.invalidAuthorizationToken);
    }
});

/**
 * Validate authorization tokens
 * 
 * @param header The header entry that contains the authorization token
 * 
 * @returns null | Users.User
 */
function verifyAuthorization (header: string | string[] | undefined): null | users.User {
    if (!header || Array.isArray(header)) {
        return null;
    }

    let ret: null | users.User = null;
    objectForEach(users.accounts, (obj, user) => {
        if (user.token === header) {
            ret = user;
        }
    });
    return ret;
}

/**
 * Verify all minehut accounts linked to a local account
 */
app.post('/verifyAccounts', async (req, res) => {
    let user = verifyAuthorization(req.headers.authorization);

    if (!user) {
        res.status(401).send("Your account could not be found.");
        return;
    }

    user.minehutAccounts = await asyncArrayFilter(user.minehutAccounts, checkAccount);
    users.accounts[objectIndexOf(users.accounts, user)!] = user;

    let result: CheckSuccessResponse = {
        success: true,
        user: users.accounts[objectIndexOf(users.accounts, user)!]
    };

    res.send(result);
});

/**
 * Get user information
 */
app.get('/accountInfo', async (req, res) => {
    let user = verifyAuthorization(req.headers.authorization);

    if (!user) {
        res.status(401).send("Your account could not be found.");
        return;
    }

    let result: CheckSuccessResponse = {
        success: true,
        user: users.accounts[objectIndexOf(users.accounts, user)!]
    };

    res.send(result);
});

app.listen(80, () => {
    console.log("Listening on port 80!");
});