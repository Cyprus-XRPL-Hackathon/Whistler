import { AuthProvider } from "@refinedev/core";
import Web3 from "web3";

import { getBalance } from "./utility";
import { xumm } from "./modules/xrpl/services/xumm";
import { withTimeout } from "./utility/core";

export const TOKEN_KEY = "refine-auth";

// const providerOptions = {};
// const web3Modal = new Web3Modal({
//     cacheProvider: true,
//     providerOptions,
// });

// eslint-disable-next-line
const web3Modal = null;
let provider: any | null = null;

const getAccount =  async () => {
    try {
        const promiseWithTimeout = withTimeout(xumm.user.account, 500); // 100 ms timeout

        return await promiseWithTimeout
    } catch (error) {
        return null;
    }
}


export const authProvider: AuthProvider = {

    login: async () => {
        provider = await xumm.authorize();
        return {
            success: true,
            redirectTo: "/",
        };

        // if (window.ethereum) {
        //     provider = await xumm.authorize();
        //     const web3 = new Web3(provider);
        //     const accounts = await web3.eth.getAccounts();
        //     localStorage.setItem(TOKEN_KEY, accounts[0]);
        //     return {
        //         success: true,
        //         redirectTo: "/",
        //     };
        // } else {
        //     return {
        //         success: false,
        //         error: new Error(
        //             "Not set ethereum wallet or invalid. You need to install Metamask",
        //         ),
        //     };
        // }
    },
    logout: async () => {
        await xumm.logout()
        return {
            success: true,
            redirectTo: "/login",
        };
    },
    onError: async (error: any) => {
        console.error(error);
        return { error };
    },
    check: async () => {
        const account = await getAccount();
        if (account) {
            return {
                authenticated: true,
            };
        }

        return {
            authenticated: false,
            redirectTo: "/login",
            logout: true,
        };
    },
    getPermissions: async () => null,
    getIdentity: async () => {
        const account = await getAccount();
        if (!account) {
            return null;
        }

        return {
            address: account,
        };
    },
};
