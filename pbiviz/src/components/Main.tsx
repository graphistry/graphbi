import * as React from "react";
import { Loader } from './Loader';
import { Graphistry } from './Graphistry';

function main({v, host, view, config, datasetID, state, numNodes, numEdges}) {
    console.debug('Main::render', { v, view, config, state });
    return (<>
        <Loader view={view} config={config} state={state}/>
        <Graphistry
            host={host} view={view} config={config} state={state}
            datasetID={datasetID} numNodes={numNodes} numEdges={numEdges}/>
    </>);
}

export { main };
