import * as React from "react";

import { Loader } from './Loader';
import { Graphistry } from './Graphistry';

function Main({v, view, config, datasetID, state}) {
    console.debug('Main::render', { v, view, config, state });
    return (<>
        <Loader view={view} config={config} state={state}/>
        <Graphistry view={view} config={config} datasetID={datasetID} state={state}/>
    </>);
}

export { Main };