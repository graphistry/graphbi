import * as React from "react";
import { LoadState } from '../LoadState';

function isConfigureAccountReady(config) {
    return config.UrlBase !== '' && config.UserName !== '' && config.Password !== '';
}

function isBindingsReady(view) {
    return (
        view
        && view.metadata.columns.find((c) => c.roles.Source)
        && view.metadata.columns.find((c) => c.roles.Destination)
    );
}

// tslint:disable-next-line
function Loader({view, config, state}) {

    console.debug('Loader::render', { view, config, state });

    if (state !== LoadState.MISCONFIGURED) {
        return null;
    }

    return (<>
        <h1>Graphistry for PowerBI Custom </h1>
        <h2>1. Configure account in <code>Format panel: Graphistry Settings</code></h2>
        {
            isConfigureAccountReady(config)
                ? <span>✔️ Done</span>
                : (<ul>
                    {
                        config.UrlBase === ''
                            ? <li>❌ <code>Format.GraphistrySettings.GraphistryServer</code>: undefined</li>
                            : null
                    }
                    {
                        config.UserName === ''
                            ? <li>❌ <code>Format.GraphistrySettings.GraphistryUserName</code>: undefined</li>
                            : null
                    }
                    {
                        config.Password === ''
                            ? <li>❌ <code>Format.GraphistrySettings.GraphistryPassword</code>: undefined</li>
                            : null
                    }
                </ul>)
        }
        <h2>2. Bind edge source/destination in <code>Fields panel</code></h2>
        {
            isBindingsReady(view)
            ? <span>✔️ Done</span>
            : (<ul>
                {
                    !view || !(view.metadata.columns.find((c) => c.roles.Source))
                    ? <li>❌ <code>Fields.Source</code>: undefined</li>
                    : null
                }
                {
                    !view || !(view.metadata.columns.find((c) => c.roles.Destination))
                    ? <li>❌ <code>Fields.Destination</code>: undefined</li>
                    : null
                }
            </ul>)
        }
    </>);
}

export { Loader };
