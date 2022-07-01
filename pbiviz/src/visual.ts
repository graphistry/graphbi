import * as React from 'react';
import * as ReactDOM from 'react-dom';

// import "core-js/stable";
// import 'regenerator-runtime/runtime'
import '@graphistry/client-api-react/assets/index.less';
import '../style/visual.less';

import powerbi from 'powerbi-visuals-api'; // tslint:disable-line
import { Client, EdgeFile, File, Dataset, NodeFile } from '@graphistry/client-api'; // eslint-disable-line @typescript-eslint/no-unused-vars
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import DataView = powerbi.DataView;
import { VisualSettings } from './VisualSettings';

import { config } from './services/GraphistryClient';
import { LoadState } from './LoadState';

import { Main } from './components/Main';

export class Visual implements IVisual {
    private host: IVisualHost;

    // private locale: string;

    private rootElement: JQuery;

    private visualSettings: VisualSettings;

    private client: Client;

    private reactRoot: React.ReactElement<any>;

    private target: HTMLElement;

    private datasetID: string;

    private state: LoadState;

    private numNodes: number;

    private numEdges: number;

    constructor(options: VisualConstructorOptions) {
        console.debug('Visual::constructor()');
        this.host = options.host;
        // this.locale = options.host.locale;
        this.client = new Client();
        this.rootElement = $(options.element);
        this.rootElement.append('<h2>Graphistry Visual: First set fields Source and Destination</h2>');
        this.datasetID = null;
        this.numNodes = undefined;
        this.numEdges = undefined;

        this.visualSettings = <VisualSettings>VisualSettings.getDefault();

        this.state = LoadState.MISCONFIGURED;

        this.reactRoot = <React.ReactElement<any>>React.createElement(Main, {
            host: this.host,
            numNodes: this.numNodes,
            numEdges: this.numEdges,
            v: `constructed: ${Date.now()}`,
            view: null,
            config,
            datasetID: this.datasetID,
            state: this.state,
        });
        this.target = options.element;
        ReactDOM.render(this.reactRoot, this.target);

        console.debug('////constructed');
    }

    public createViewModel(dataView: DataView): VisualSettings {
        console.debug('Visual::createViewModel()', { dataView });

        this.visualSettings = VisualSettings.parse<VisualSettings>(dataView);

        console.debug('////Visual::createViewModel', { out: this.visualSettings });

        return this.visualSettings;
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions) {
        console.debug('Visual::enumerateObjectInstances()', {
            options,
            visualSettings: this.visualSettings,
            def: <VisualSettings>VisualSettings.getDefault(),
        });
        const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
        const out = VisualSettings.enumerateObjectInstances(settings, options);
        console.debug('////Visual::enumerateObjectInstances1', { out });
        return out;

        /*
        let objectName: string = options.objectName;
        let objectEnumeration: VisualObjectInstance[] = [];

        if (!this.visualSettings) {
            console.debug('////Visual::enumerateObjectInstances mt this.visualSettings');
        }

        switch( objectName ) {
            case 'graphistrySetting':
                objectEnumeration.push({
                    objectName,
                    displayName: "Graphistry Settings",
                    properties: {
                        "graphistryBaseUrl": settings.graphistrySetting.graphistryBaseUrl,
                        "graphistryUserName": settings.graphistrySetting.graphistryUserName,
                        "graphistryPassword": settings.graphistrySetting.graphistryPassword,
                        "graphistryDatasetOverride": settings.graphistrySetting.graphistryDatasetOverride
                    },
                    selector: null
                });
                break;
        };

        console.debug('////Visual::enumerateObjectInstances2', {objectEnumeration})
        return objectEnumeration;
        */
    }

    private isReadySrcDstIframe(view) {
        console.debug('Visual::isReadySrcDstIframe()');
        const src = view.metadata.columns.find((c) => c.roles.SourceNode);
        if (!src) {
            return false;
        }
        const dst = view.metadata.columns.find((c) => c.roles.DestinationNode);
        if (!dst) {
            return false;
        }
        return true;
    }

    private prevValues = {};

    private prevFiles = { edgeFile: null, nodeFile: null };

    private prevBindings = null;

    private previousRendered = false;

    private uploadDataset(view: powerbi.DataView) {
        try {
            console.debug('@uploadDataset', { view });
            /*
        var nodeFile = new GraphistryFile(GraphistryFileType.Node);
        nodeFile.setData({
            "n":["a","b","c"],
            "v":[2,4,6],
            "v2":["a","aa","aaa"]
        });
        */
            const srcColMetadata = view.metadata.columns.find((c) => c.roles.SourceNode);
            const srcColName = srcColMetadata.displayName;
            const srcCol = view.categorical.categories.find((c) => c.source.displayName === srcColName);
            const dstColMetadata = view.metadata.columns.find((c) => c.roles.DestinationNode);
            const dstColName = dstColMetadata.displayName;
            const dstCol = view.categorical.categories.find((c) => c.source.displayName === dstColName);
            const edgePropertyMetadatas = view.metadata.columns.filter((c) => c.roles.EdgeProperty);
            const edgeWeightMetadata = view.metadata.columns.find((c) => c.roles.EdgeWeight);
            // categorical.values because measure?
            const edgeWeightCol = edgeWeightMetadata
                ? view.categorical.values.find((c) => c.source.displayName === edgeWeightMetadata.displayName)
                : undefined;
            const edgeWeightColName = edgeWeightMetadata ? edgeWeightMetadata.displayName : undefined;
            console.debug('edgeWeights', { edgeWeightCol, edgeWeightColName });

            // upload edge values if new, else reuse edge file
            const edgeFileColumnValues = {
                [srcColName]: srcCol.values,
                [dstColName]: dstCol.values,
                ...(edgeWeightMetadata ? { [edgeWeightColName]: edgeWeightCol.values } : {}),
            };
            console.debug('edgeFileColumnValues', { edgeFileColumnValues });
            edgePropertyMetadatas.forEach((c) => {
                edgeFileColumnValues[c.displayName] = view.categorical.categories.find(
                    (c2) => c2.source.displayName === c.displayName,
                ).values;
            });
            console.debug('with settings', { srcColName, dstColName, edgeWeightColName, edgeFileColumnValues });

            const edgeValuesAllSame = Object.keys(edgeFileColumnValues)
                .map((colName) => {
                    if (this.prevValues[colName] === edgeFileColumnValues[colName]) {
                        return true;
                    }
                    console.debug(
                        'edge alias delta on prop',
                        colName,
                        this.prevValues[colName],
                        edgeFileColumnValues[colName],
                    );
                    if (!this.prevValues || !this.prevValues[colName] || !edgeFileColumnValues[colName]) {
                        console.debug('missing ref');
                        return false;
                    }
                    if (this.prevValues[colName].length !== edgeFileColumnValues[colName].length) {
                        console.debug(
                            'diff lengths',
                            this.prevValues[colName].length,
                            edgeFileColumnValues[colName].length,
                        );
                        return false;
                    }
                    for (let i = 0; i < this.prevValues[colName].length; i++) {  // eslint-disable-line
                        if (this.prevValues[colName][i] !== edgeFileColumnValues[colName][i]) {
                            console.debug(
                                'delta on i',
                                i,
                                this.prevValues[colName][i],
                                edgeFileColumnValues[colName][i],
                            );
                            return false;
                        }
                    }
                    console.debug('all column values same even if diff alias');
                    return true;
                })
                .every((check) => check);
            // eslint-disable-next-line prettier/prettier
            let {
                prevFiles: { edgeFile },
            } = this;
            const isReusedEdgeFile = edgeFile && edgeValuesAllSame;
            console.debug('duplicate isReusedEdgeFile', isReusedEdgeFile);
            if (!isReusedEdgeFile) {
                edgeFile = new EdgeFile(); // change!
                edgeFile.setData(edgeFileColumnValues);
                this.prevFiles.edgeFile = edgeFile;
                Object.assign(this.prevValues, edgeFileColumnValues);
            }

            const bindings = {
                node_encodings: {
                    bindings: {
                        node: 'n',
                        ...(config.NodeTitle !== undefined ? { node_title: config.NodeTitle } : {}),
                        ...(config.PositionX !== undefined ? { node_x: config.PositionX } : {}),
                        ...(config.PositionY !== undefined ? { node_y: config.PositionY } : {}),
                    },
                },
                edge_encodings: {
                    bindings: {
                        source: srcColName,
                        destination: dstColName,
                        ...(edgeWeightMetadata ? { edge_weight: edgeWeightColName } : {}),
                        ...(config.EdgeTitle !== undefined ? { edge_title: config.EdgeTitle } : {}),
                    },
                },
                metadata: this.prevBindings ? this.prevBindings.metadata || {} : {},
                name: 'testdata',
            };
            const isReusedBindings = JSON.stringify(bindings) === JSON.stringify(this.prevBindings);
            console.debug(
                'duplicate isReusedBindings',
                isReusedBindings,
                { bindings, prev: this.prevBindings },
                { prevStr: JSON.stringify(this.prevBindings), currStr: JSON.stringify(bindings) },
            );

            // //////////////////////////////////////////////////////////////////////////////

            if (this.previousRendered && isReusedEdgeFile && isReusedBindings) {
                console.debug('no change, reuse iframe');
                return null;
            }

            this.prevBindings = bindings;

            // //////////////////////////////////////////////////////////////////////////////

            // this.rootElement.empty();
            // this.rootElement.append('<h2>Graphistry Visual: Uploading data...</h2>');

            const dataset = new Dataset(); // changed
            // dataSet.addFile(nodeFile);
            dataset.addFile(edgeFile);
            dataset.updateBindings(bindings);
            console.debug('dataset', { nodeFiles: dataset.nodeFiles, edgeFiles: dataset.edgeFiles });

            const numEdges = srcCol.values.length;
            console.debug('Visual::uploadDataset() edges', { numEdges });
            const numNodes = new Set(srcCol.values.concat(dstCol.values)).size;
            console.debug('Visual::uploadDataset() nodes', { numNodes });

            // this.rootElement.append('Created local schema, now uploading...');
            this.previousRendered = true;
            console.debug('Visual::uploadDataset()', { dataset });
            const uploading = dataset.upload(this.client).then((ds) => ds.datasetID); // => Promise<Dataset>
            console.debug('uploading in background...', uploading);
            return {
                uploading,
                uploaded: uploading.then((datasetID) => {
                    console.debug('update deferred has id', { datasetID });
                    return { datasetID, numEdges, numNodes };
                }),
            };
        } catch (e) {
            console.error('Visual::uploadDataset() error', e);
        }
        return null;
    }

    private clear() {
        this.state = LoadState.MISCONFIGURED;
        this.reactRoot = <React.ReactElement<any>>React.createElement(Main, {
            host: this.host,
            numNodes: this.numNodes,
            numEdges: this.numEdges,
            v: `cleared: ${Date.now()}`,
            view: null,
            config,
            datasetID: null,
            state: this.state,
        });
        ReactDOM.render(this.reactRoot, this.target);
    }

    public update(options: VisualUpdateOptions, viewModel) {
        console.debug('Visual::update()', { options, viewModel });

        if (!options || !options.dataViews || !options.dataViews[0]) {
            console.debug('Visual::update() no dataViews', { options });
            this.clear();
            return;
        }
        const view = options.dataViews[0];
        this.createViewModel(view);

        function deserializeUndefined(v) {
            return v === undefined || v === null || v === '' ? undefined : v;
        }

        config.UrlBase = this.visualSettings.graphistrySetting.graphistryBaseUrl || 'https://hub.graphistry.com';
        config.UserName = this.visualSettings.graphistrySetting.graphistryUserName;
        config.Password = this.visualSettings.graphistrySetting.graphistryPassword;
        config.DatasetOverride = this.visualSettings.graphistrySetting.graphistryDatasetOverride;
        config.BackgroundColor = this.visualSettings.backgroundSetting.color;
        config.ChartLoadPlay = this.visualSettings.chartLoadSetting.play;
        config.ChartLoadShowSplashScreen = deserializeUndefined(this.visualSettings.chartLoadSetting.showSplashScreen);
        config.EdgeCurvature = this.visualSettings.edgeSetting.curvature;
        config.EdgeOpacity = this.visualSettings.edgeSetting.opacity;
        config.EdgeShowArrows = this.visualSettings.edgeSetting.showArrows;
        config.EdgeTitle = deserializeUndefined(this.visualSettings.edgeSetting.title);
        config.LabelBackground = this.visualSettings.labelSetting.background;
        config.LabelColor = this.visualSettings.labelSetting.text;
        config.LabelOpacity = this.visualSettings.labelSetting.opacity;
        config.LabelShowLabels = this.visualSettings.labelSetting.showLabels;
        config.LabelShowLabelOnHover = this.visualSettings.labelSetting.showLabelOnHover;
        config.LabelShowLabelPropertiesOnHover = this.visualSettings.labelSetting.showLabelPropertiesOnHover;
        config.LabelShowPointsOfInterest = this.visualSettings.labelSetting.showPointsOfInterest;
        config.LabelShowPointsOfInterestLabels = this.visualSettings.labelSetting.showPointsOfInterestLabels;
        config.LabelPointsOfInterestMax = this.visualSettings.labelSetting.pointsOfInterestMax;
        config.LayoutDissuadeHubs = this.visualSettings.layoutSetting.dissuadeHubs;
        config.LayoutEdgeInfluence = this.visualSettings.layoutSetting.edgeInfluence;
        config.LayoutStrongGravity = this.visualSettings.layoutSetting.strongGravity;
        config.LayoutGravity = this.visualSettings.layoutSetting.gravity;
        config.LayoutLinLog = this.visualSettings.layoutSetting.linLog;
        config.LayoutPrecisionVsSpeed = this.visualSettings.layoutSetting.precisionVsSpeed;
        config.LayoutScalingRatio = this.visualSettings.layoutSetting.scalingRatio;
        config.MenuShowInfo = this.visualSettings.menuSetting.showInfo;
        config.MenuShowMenu = this.visualSettings.menuSetting.showMenu;
        config.MenuShowToolbar = this.visualSettings.menuSetting.showToolbar;
        config.NodeOpacity = this.visualSettings.nodeSetting.opacity;
        config.NodeSize = this.visualSettings.nodeSetting.size;
        config.NodeTitle = deserializeUndefined(this.visualSettings.nodeSetting.title);
        config.PanelShowHistograms = this.visualSettings.panelSetting.showHistograms;
        config.PanelShowTimebars = this.visualSettings.panelSetting.showTimebars;
        config.PositionX = this.visualSettings.positionSetting.positionX;
        config.PositionY = this.visualSettings.positionSetting.positionY;
        config.PositionLockedX = this.visualSettings.positionSetting.lockedX;
        config.PositionLockedY = this.visualSettings.positionSetting.lockedY;
        config.PositionLockedRadius = this.visualSettings.positionSetting.lockedR;
        if (this.client && this.client.checkStale(config.UserName, config.Password, 'https', config.UrlBase, `https://${config.UrlBase}/`) // eslint-disable-line
        ) {
            console.debug('Visual::update() client is stale, resetting');
            this.client = new Client(
                config.UserName,
                config.Password,
                'https',
                config.UrlBase,
                `https://${config.UrlBase}/`,
            );
        } else {
            console.debug('Visual::update() client is not stale');
        }

        if (config.DatasetOverride && config.UrlBase) {
            console.debug('as DatasetOverride', { datasetOverride: config.DatasetOverride });
            // this.updateIframe(config.DatasetOverride);
            this.previousRendered = false;

            this.state = LoadState.UPLOADED;
            this.reactRoot = <React.ReactElement<any>>React.createElement(Main, {
                host: this.host,
                numNodes: this.numNodes,
                numEdges: this.numEdges,
                v: `updated baked: ${Date.now()}`,
                view,
                config,
                datasetID: config.DatasetOverride,
                state: this.state,
            });
            ReactDOM.render(this.reactRoot, this.target);
            console.debug('////update has DatasetOverride, stop');
            return;
        }

        console.debug('Visual::isReadyForUpload()', { visualSettings: this.visualSettings });
        if (!this.client.isServerConfigured() || !this.isReadySrcDstIframe(view)) {
            // this.notReadyIframe(view);
            this.previousRendered = false;
            this.state = LoadState.MISCONFIGURED;
            this.reactRoot = <React.ReactElement<any>>React.createElement(Main, {
                host: this.host,
                numNodes: this.numNodes,
                numEdges: this.numEdges,
                v: `updated misconfigured: ${Date.now()}`,
                view,
                config,
                datasetID: this.datasetID,
                state: this.state,
            });
            ReactDOM.render(this.reactRoot, this.target);
            console.debug('////update not ready for upload, stop');
            return;
        }

        // FIXME cancelation
        console.debug('update readyForUpload, continue');
        const uploadDatasetResult = this.uploadDataset(view);
        if (!uploadDatasetResult) {
            console.debug('Rerendering with existing data but likely new config');
            this.reactRoot = <React.ReactElement<any>>React.createElement(Main, {
                host: this.host,
                numNodes: this.numNodes,
                numEdges: this.numEdges,
                v: `updated uploaded: ${Date.now()}`,
                view,
                config,
                datasetID: this.datasetID,
                state: this.state,
            });
            ReactDOM.render(this.reactRoot, this.target);
        }
        const { uploading, uploaded } = uploadDatasetResult;
        if (uploading) {
            this.state = LoadState.UPLOADING;
            this.reactRoot = <React.ReactElement<any>>React.createElement(Main, {
                host: this.host,
                numNodes: this.numNodes,
                numEdges: this.numEdges,
                v: `updated: ${Date.now()}`,
                view: !options || !options.dataViews || !options.dataViews[0] ? null : options.dataViews[0],
                config,
                datasetID: this.datasetID,
                state: this.state,
            });
            ReactDOM.render(this.reactRoot, this.target);
        }
            uploaded.then(({ datasetID, numEdges, numNodes }) => { // eslint-disable-line   
                this.state = LoadState.UPLOADED;
                this.numNodes = numNodes;
                this.numEdges = numEdges;
                this.datasetID = datasetID;
                this.reactRoot = <React.ReactElement<any>>React.createElement(Main, {
                    host: this.host,
                    numNodes: this.numNodes,
                    numEdges: this.numEdges,
                    v: `updated uploaded: ${Date.now()}`,
                    view,
                    config,
                    datasetID: this.datasetID,
                    state: this.state,
                });
                ReactDOM.render(this.reactRoot, this.target);
            })
            .catch((err) => {
                console.error('Visual::uploadDataset()', err);
                // TODO popup an error message to the user
            });
    }

    public destroy(): void {
        // Perform any cleanup tasks here
    }
}
