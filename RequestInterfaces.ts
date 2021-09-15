import { User } from "./users";
import { checkProperty } from "./Utils";

/**
 * The response to send when something goes wrong.
 */
export interface ErrorResponse {
    success: false,
    reason: string;
}

/**
 * The response to send when a check operation is a success
 */
export interface CheckSuccessResponse {
    success: true,
    user: User;
}

/**
 * All types a request for linking an account can be
 */
export type LinkAccountRequest = MinetronLinkAccountRequest | RawLinkAccountRequest;

/**
 * The request when we don't know what type it is yet.
 */
export interface UnknownLinkAccountRequest {
    type: "minetron" | "raw",
    token?: string;
    authDetails?: {
        authorization: string,
        xSessionId: string,
        slgSessionId: string,
        xSlgUser: string,
        userId: string;
    };
}

/**
 * Check if a given object is a UnknownLinkAccountRequest
 * 
 * @param obj Unknown object
 */
export function checkLinkAccountRequest (obj: UnknownLinkAccountRequest): obj is UnknownLinkAccountRequest {
    return checkProperty(obj as {}, "type", "string", ["minetron", "raw"]);
}

export interface MinetronLinkAccountRequest {
    type: "minetron",
    token: string;
}

/**
 * Check if an UnknownLinkAccountRequest is a MinetronLinkAccountRequest
 * 
 * @param obj UnknownLinkAccountRequest
 */
export function checkMinetronLinkAccountRequest (obj: UnknownLinkAccountRequest): obj is MinetronLinkAccountRequest {
    let type = checkProperty(obj as {}, "type", "string", "minetron");
    let token = checkProperty(obj as { token: string; }, "token", "string", "", obj => obj.token.length === 36);
    return type && token;
}

export interface RawLinkAccountRequest {
    type: "raw",
    authDetails: {
        authorization: string,
        xSessionId: string,
        slgSessionId: string,
        xSlgUser: string,
        userId: string;
    };
}

/**
 * Check if an UnknownLinkAccountRequest is a RawLinkAccountRequest
 * 
 * @param obj UnknownLinkAccountRequest
 */
export function checkRawLinkAccountRequest (obj: UnknownLinkAccountRequest): obj is RawLinkAccountRequest {

    if (!checkLinkAccountRequest(obj)) {
        return false;
    }

    let type = checkProperty(obj as {}, "type", "string", "raw");

    let authorization = checkProperty(obj.authDetails!, "authorization", "string");
    let xSessionId = checkProperty(obj.authDetails!, "xSessionId", "string");
    let slgSessionId = checkProperty(obj.authDetails!, "slgSessionId", "string");
    let xSlgUser = checkProperty(obj.authDetails!, "xSlgUser", "string");
    let userId = checkProperty(obj.authDetails!, "userId", "string");

    let authDetails = authorization && xSessionId && slgSessionId && xSlgUser && userId;

    return type && authDetails;
}

enum AuthType {
    RAW,
    MINETRON
}

export function determineAuthType (obj: UnknownLinkAccountRequest): AuthType {
    if (!checkLinkAccountRequest(obj)) {
        throw "Invalid arguments.";
    }

    let minetron = checkMinetronLinkAccountRequest(obj);
    let raw = checkRawLinkAccountRequest(obj);

    if (minetron && raw) {
        throw "Too many arguments.";
    }

    if (minetron) {
        return AuthType.MINETRON;
    }
    else if (raw) {
        return AuthType.RAW;
    }
    else {
        throw "Not enough arguments.";
    }
}