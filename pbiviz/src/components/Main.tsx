import * as React from "react";
import { Loader } from './Loader';
import { Graphistry } from './Graphistry';

// tslint:disable-next-line
function Main({v, host, view, config, datasetID, state, numNodes, numEdges, client}) {
    console.debug('Main::render', { v, view, config, state, host });
    return (<>
        <Loader view={view} config={config} state={state} host={host} client={client}/>
        <Graphistry
            host={host} view={view} config={config} state={state}
            datasetID={datasetID} numNodes={numNodes} numEdges={numEdges}/>
    </>);
}

export { Main };

