import * as React from 'react';
import { LoadState } from '../LoadState';




function isConfigureAccountReady(config) {
    return config.UrlBase !== '' && config.UserName !== '' && config.Password !== '';
}

function isBindingsReady(view) {
    return (
        view &&
        view.metadata.columns.find((c) => c.roles.SourceNode) &&
        view.metadata.columns.find((c) => c.roles.DestinationNode)
    );
}


const getSSO = async (client, host) => {
    console.log('getSSO');
    const authResponse = await client.getAuthUrl();
    console.log('checking ssoLogin');
    host.launchUrl(authResponse.auth_url);
    // await client.delay (5000);
    const startedMS = Date.now();
    await client.delay(200);
    console.log('getSSO'); //short initial delay as may already be logged in
    while(true) {
        console.log('ssologin loop');
        await client.delay(20000);
        const response = await (client.fetch)(`https://eks-skinny.grph.xyz/api/v2/o/sso/oidc/jwt/${authResponse.state}/`, {
            method: 'GET', 
        });
        await client.delay(15000);
        console.log('authenticated');
        console.info('ssoLogin response');
        const data = await response.json(); // only do this if theyre done being authenticated/logged in
        if (data) { //TODO and whatever success conditions
            console.log('data with good jwt', data.data.token);
            const newIframe = `/accounts/login/jwt/?token=${data.data.token}&next=graph/graph.html`;
            console.log('this is the newiframe', newIframe);
            return newIframe;
        }
        //TODO check if expected not-ready rejection, else throw unexpected error
        if (Date.now() - startedMS > 60000) {
            console.error('sso login timed out');
            throw new Error('sso login timed out');
        }
        await client.delay(1000);
}
}
// const preJwt = async (client): Promise<any> => {
//     const afterClick = await clickedAuthUrl(client);
//     setTimeout()
//     client.authenticated = true
//     return afterClick;
// }


// tslint:disable-next-line
function Loader({ view, config, state, host, client }) {
    console.debug('Loader::render', { view, config, state, host });
  
    if (state !== LoadState.MISCONFIGURED) {
        return null;
    }
    return (
        <>
            <h1>Graphistry for PowerBI Custom </h1>
            <h2>
                1. Configure account in <code>Format panel: Graphistry Settings</code>
            </h2>
            {isConfigureAccountReady(config)? ( //fix
                <span>✔️ Done</span>
            ) : (
                <ul>
                    {config.UrlBase === '' ? (
                        <li>
                            ❌ <code>Format.GraphistrySettings.GraphistryServer</code>: undefined
                        </li>
                    ) : null}
                    {config.UserName === '' ? (
                        <li>
                            ❌ <code>Format.GraphistrySettings.GraphistryUserName</code>: undefined
                        </li>
                    ) : null}
                    {config.Password === '' ? (
                        <li>
                            ❌ <code>Format.GraphistrySettings.GraphistryPassword</code>: undefined
                        </li>
                    ) : null}
                </ul>
            )}
             <h2>
                2. Bind edge source/destination in <code>Fields panel</code>
            </h2>
            {isBindingsReady(view) ? (
                <span>✔️ Done</span>
            ) : (
                <ul>
                    {!view || !view.metadata.columns.find((c) => c.roles.SourceNode) ? (
                        <li>
                            ❌ <code>Fields.SourceNode</code>: undefined
                        </li>
                    ) : null}
                    {!view || !view.metadata.columns.find((c) => c.roles.DestinationNode) ? (
                        <li>
                            ❌ <code>Fields.DestinationNode</code>: undefined
                        </li>
                    ) : null}
                </ul>

            )} 
             <h2>
                 3. Sign in with SSO
            </h2>
                <ul>
                    <li>
                        <button onClick={ async () => { await getSSO(client,host)} }>Sign in</button>
                    </li>
                </ul>
        </>
    );
}
export { Loader };