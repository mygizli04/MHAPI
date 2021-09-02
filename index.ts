import express from 'express';
import * as account from './accounts';

const app = express();

app.get('/usernamepassword', async (req, res) => {

    if (!req.headers.username || Array.isArray(req.headers.username)) {
        res.send(JSON.stringify({
            success: false,
            reason: "Invalid username."
        }));
        return;
    }
    else if (!req.headers.password || Array.isArray(req.headers.password)) {
        res.send(JSON.stringify({
            success: false,
            reason: "Invalid password."
        }));
        return;
    }

    res.send(await account.check(req.headers.username, req.headers.password));
    return;
});

app.post('/create', async (req, res) => {
    if (!req.headers.username || Array.isArray(req.headers.username)) {
        res.send(JSON.stringify({
            success: false,
            reason: "Invalid username."
        }));
        return;
    }
    else if (!req.headers.password || Array.isArray(req.headers.password)) {
        res.send(JSON.stringify({
            success: false,
            reason: "Invalid password."
        }));
        return;
    }

    res.send(await account.create(req.headers.username, req.headers.password));
    return;
})

app.listen(80);