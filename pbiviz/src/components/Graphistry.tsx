import * as React from "react";
import { LoadState } from "../LoadState";
import powerbi from 'powerbi-visuals-api'; // tslint:disable-line

import * as GraphistryModule from '@graphistry/client-api-react';
import { Graphistry as GraphistryJS } from '@graphistry/client-api-react';
import { GraphistryConfiguration } from "../services/GraphistryClient";

// tslint:disable-next-line
function Graphistry(
    {view, config, datasetID, state, host, numNodes = undefined, numEdges = undefined}
    : {
        view: powerbi.DataView,
        config: GraphistryConfiguration,
        datasetID: string,
        state: LoadState,
        host: powerbi.extensibility.visual.IVisualHost,
        numNodes: number | undefined,
        numEdges: number | undefined
    }
) {
    console.debug('Graphistry::render', { view, config, datasetID, state, GraphistryModule, GraphistryJS });
    if (state === LoadState.MISCONFIGURED) {
        return null;
    } else if (state === LoadState.UPLOADING) {
        return <div>Loading...</div>;
    } else {
        if (!datasetID) {
            return <div>No dataset ID: {datasetID}</div>;
        } else {
            const play = config.ChartLoadPlay !== undefined ? config.ChartLoadPlay
                : numNodes === undefined || numEdges === undefined ? 2
                : numNodes < 5000 ? 1
                : numNodes < 20000 ? 3
                : 5;

            const resolveColor(v) => v && v.solid && v.solid.color ? v.solid.color : null;

            const url = `https://${config.UrlBase}/graph/graph.html?dataset=${datasetID}&play=${play}`;
            const extraOpts = {
                play,
                showSplashScreen: config.ChartLoadShowSplashScreen,
                backgroundColor: resolveColor(config.BackgroundColor),
                lockedX: config.PositionLockedX,
                lockedY: config.PositionLockedY,
                lockedR: config.PositionLockedRadius,
                labelBackground: resolveColor(config.LabelBackground.solid.color),
                labelColor: resolveColor(config.LabelColor.solid.color),
                showPointsOfInterest: config.LabelShowPointsOfInterest,
                showPointsOfInterestLabels: config.LabelShowPointsOfInterestLabels,
                showLabelOnHover: config.LabelShowLabelOnHover,
                showLabelPropertiesOnHover: config.LabelShowLabelPropertiesOnHover,
                showLabels: config.LabelShowLabels,
                showInfo: config.MenuShowInfo,
                showMenu: config.MenuShowMenu,
                showToolbar: config.MenuShowToolbar,
                showHistograms: config.PanelShowHistograms,
                showTimebars: config.PanelShowTimebars,
                dissuadeHubs: config.LayoutDissuadeHubs,
                edgeInfluence: config.LayoutEdgeInfluence,
                strongGravity: config.LayoutStrongGravity,
                gravity: config.LayoutGravity,
                linLog: config.LayoutLinLog,
                precisionVsSpeed: config.LayoutPrecisionVsSpeed,
                scalingRatio: config.LayoutScalingRatio,
                showArrows: config.EdgeShowArrows,

                ...(config.LabelPointsOfInterestMax !== undefined ? {pointsOfInterestMax: config.LabelPointsOfInterestMax} : {}),
            };
            console.debug('Graphistry::render2', {url, datasetID, UrlBase: config.UrlBase, extraOpts});
            return (<>
                <GraphistryJS
                    dataset={datasetID}
                    graphistryHost={`https://${config.UrlBase}`}
                    containerStyle={{'height': 'calc(100% - 75px)'}}
                    {...extraOpts}
                />
                <h3>
                   {/* tslint:disable-next-line */}
                    Open in a <a href='javascript:void(0)' onClick={ () => { host.launchUrl(url); } }>new tab: {url}</a>
                </h3>
            </>);
        }
    }
}

export { Graphistry };
