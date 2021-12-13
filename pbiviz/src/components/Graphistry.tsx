import * as React from "react";
import { LoadState } from "../LoadState";

//Error: Minified React error #321;
//Module parse failed: Unexpected token (20296:4)
import * as GraphistryModule from '@graphistry/client-api-react';
import { Graphistry as GraphistryJS } from '@graphistry/client-api-react';

//import * as GraphistryJSb from '@graphistry/client-api-react';
//import * as GraphistryJSc from '@graphistry/client-api-react/lib/index.js';

//Support for the experimental syntax 'jsx' isn't currently enabled
//import { Graphistry as GraphistryJS } from '@graphistry/client-api-react/es/index.js';

//Support for the experimental syntax 'jsx' isn't currently enabled
//import { Graphistry as GraphistryJS } from '@graphistry/client-api-react/dist/client-api-react.cjs.js';

//Runtime Error: Minified React error #130; visit https://reactjs.org/docs/error-decoder.html?invariant=130&args[]=undefined&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
//import { Graphistry as GraphistryJS } from '@graphistry/client-api-react/lib/index.js';
//import { Graphistry as GraphistryJS } from '@graphistry/client-api-react/lib/index.js';

//https://reactjs.org/docs/error-decoder.html/?invariant=321
/* 
Invalid hook call. Hooks can only be called inside of the body of a function component.
This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.
*/
//import * as GraphistryModule from '@graphistry/client-api-react/dist/index.cjs.pure.js';
//import { Graphistry as GraphistryJS } from '@graphistry/client-api-react/dist/index.cjs.pure.js';

//https://reactjs.org/docs/error-decoder.html/?invariant=321
//import * as GraphistryModule from '@graphistry/client-api-react/es/index.pure.js';
//import { Graphistry as GraphistryJS } from '@graphistry/client-api-react/es/index.pure.js';

//cannot find (build)
//import * as GraphistryModule from '@graphistry/client-api-react/es/index.pure.mjs';
//import { Graphistry as GraphistryJS } from '@graphistry/client-api-react/es/index.pure.mjs';

//Uncaught Error: Cannot find module 'react'
//import * as GraphistryModule from '@graphistry/client-api-react/dist/index.pure.iife.js';
//import { Graphistry as GraphistryJS } from '@graphistry/client-api-react/dist/index.pure.iife.js';

// //////////////////////////////////////////////////////////////////////////////

//https://reactjs.org/docs/error-decoder.html/?invariant=321
//import * as GraphistryModule from '@graphistry/client-api-react/dist/index.cjs.pure.full.js';
//import { Graphistry as GraphistryJS } from '@graphistry/client-api-react/dist/index.cjs.pure.full.js';

/*
Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.
*/
//import * as GraphistryModule from '@graphistry/client-api-react/es/index.pure.full.js';
//import { Graphistry as GraphistryJS } from '@graphistry/client-api-react/es/index.pure.full.js';

//cannot find (build)
//import * as GraphistryModule from '@graphistry/client-api-react/es/index.pure.full.mjs';
//import { Graphistry as GraphistryJS } from '@graphistry/client-api-react/es/index.pure.full.mjs';

//Error: Minified React error #130
//Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined.
//import * as GraphistryModule from '@graphistry/client-api-react/dist/index.pure.iife.full.js';
//import { Graphistry as GraphistryJS } from '@graphistry/client-api-react/dist/index.pure.iife.full.js';

/*
    private updateIframe(datasetID: string) {
        console.debug('Visual::updateIframeOverride()', { datasetID });
        this.rootElement.empty();
        const url = `${this.getGraphistryBaseUrl()}/graph/graph.html?dataset=${datasetID}&play=3000`;
        const iframeUrl = `${url}&splashAfter=true`;
        const frame = $('<iframe />', {
            allowfullscreen: 'true',
            webkitallowfullscreen: 'true',
            mozallowfullscreen: 'true',
            oallowfullscreen: 'true',
            msallowfullscreen: 'true',
            // name: 'frame1',
            // id: 'frame1',
            src: iframeUrl,
        });
        this.rootElement.append(frame);
        linkNum += 1;
        const linkID = `vizlink-${linkNum}`;
        this.rootElement
            .append(`<h3>Open in a <a id="${linkID}" href="${iframeUrl}">new tab: ${iframeUrl}</a></h3>`)
            .on('click', `#${linkID}`, (e) => {
                console.debug('Visual::updateIframeOverride() link click', { e });
                e.preventDefault();
                this.host.launchUrl(iframeUrl);
            });
        console.debug('////Visual::updateIframeOverride');
    }
*/

function Graphistry2({view, config, datasetID, state}) {
    return null;
}

function Graphistry({view, config, datasetID, state}) {
    console.debug('Graphistry::render', { view, config, datasetID, state, GraphistryModule, GraphistryJS });
    if (state === LoadState.MISCONFIGURED) {
        return null;
    } else if (state === LoadState.UPLOADING) {
        return <div>Loading...</div>;
    } else {
        if (!datasetID) {
            return <div>No dataset ID: {datasetID}</div>;
        } else {
            return (<GraphistryJS dataset={datasetID} graphistryHost={`https://${config.UrlBase}`}/>)
        }
    }
}

export { Graphistry };