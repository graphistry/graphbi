// import "core-js/stable";
// import 'regenerator-runtime/runtime'
import '@graphistry/client-api-react/assets/index.less';
import '../style/visual.less';

import powerbi from 'powerbi-visuals-api'; // tslint:disable-line
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import DataView = powerbi.DataView;
import { VisualSettings } from './VisualSettings';
import { GraphistryDataset } from './services/GraphistryDataset';
import { GraphistryFile, GraphistryFileType } from './services/GraphistryFile';
import { config, GraphistryClient } from './services/GraphistryClient';
import { LoadState } from './LoadState';

// Import React dependencies and the added component
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Main } from './components/Main'


export class Visual implements IVisual {
    private host: IVisualHost;

    // private locale: string;

    private rootElement: JQuery;

    private visualSettings: VisualSettings;

    private client: GraphistryClient;

    private reactRoot: React.ReactElement<any>;

    private target: HTMLElement;

    private datasetID: string;

    private state: LoadState; 

    constructor(options: VisualConstructorOptions) {

        console.debug('Visual::constructor()');
        this.host = options.host;
        // this.locale = options.host.locale;
        this.client = new GraphistryClient();
        this.rootElement = $(options.element);
        this.rootElement.append('<h2>Graphistry Visual: First set fields Source and Destination</h2>');
        this.datasetID = null;

        this.visualSettings = <VisualSettings>VisualSettings.getDefault();

        this.state = LoadState.MISCONFIGURED;

        this.reactRoot = <React.ReactElement<any>>React.createElement(Main, {
            v: `constructed: ${Date.now()}`,
            view: null,
            config,
            datasetID: this.datasetID,
            state: this.state
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
        const src = view.metadata.columns.find((c) => c.roles.Source);
        if (!src) {
            return false;
        }
        const dst = view.metadata.columns.find((c) => c.roles.Destination);
        if (!dst) {
            return false;
        }
        return true;
    }

    private prevValues = {};

    private prevFiles = { edgeFile: null, nodeFile: null };

    private prevBindings = null;

    private previousRendered = false;

    private uploadDataset(view) {
        /*
        var nodeFile = new GraphistryFile(GraphistryFileType.Node);
        nodeFile.setData({
            "n":["a","b","c"],
            "v":[2,4,6],
            "v2":["a","aa","aaa"]
        });
        */

        const srcColMetadata = view.metadata.columns.find((c) => c.roles.Source);
        const srcColName = srcColMetadata.queryName;
        const srcCol = view.categorical.categories[srcColMetadata.index];
        const dstColMetadata = view.metadata.columns.find((c) => c.roles.Destination);
        const dstColName = dstColMetadata.queryName;
        const dstCol = view.categorical.categories[dstColMetadata.index];
        const edgePropertyMetadatas = view.metadata.columns.filter((c) => c.roles.EdgeProperty);
        const edgeWeightMetadata = view.metadata.columns.find((c) => c.roles.EdgeWeight);
        // categorical.values because measure?
        const edgeWeightCol = edgeWeightMetadata ? view.categorical.categories[edgeWeightMetadata.index] : undefined;
        const edgeWeightColName = edgeWeightMetadata ? edgeWeightMetadata.queryName : undefined;

        // upload edge values if new, else reuse edge file
        const edgeFileColumnValues = {
            [srcColName]: srcCol.values,
            [dstColName]: dstCol.values,
            ...(edgeWeightMetadata ? { [edgeWeightColName]: edgeWeightCol.values } : {}),
        };
        edgePropertyMetadatas.forEach(c => {
            edgeFileColumnValues[c.queryName] = view.categorical.categories[c.index].values;
        });

        const edgeValuesAllSame = Object.keys(edgeFileColumnValues)
            .map((colName) => this.prevValues[colName] === edgeFileColumnValues[colName])
            .every((check) => check);
        // eslint-disable-next-line prettier/prettier
        let {
            prevFiles: { edgeFile },
        } = this;
        const isReusedEdgeFile = edgeFile && edgeValuesAllSame;
        console.debug('duplicate isReusedEdgeFile', isReusedEdgeFile);
        if (!isReusedEdgeFile) {
            edgeFile = new GraphistryFile(GraphistryFileType.Edge);
            edgeFile.setData(edgeFileColumnValues);
            this.prevFiles.edgeFile = edgeFile;
            Object.assign(this.prevValues, edgeFileColumnValues);
        }

        const bindings = {
            node_encodings: {
                bindings: {
                    node: 'n',
                },
            },
            edge_encodings: {
                bindings: {
                    source: srcColName,
                    destination: dstColName,
                    ...(edgeWeightMetadata ? { edge_weight: edgeWeightColName } : {}),
                },
            },
            metadata: {},
            name: 'testdata',
        };
        const isReusedBindings = JSON.stringify(bindings) === JSON.stringify(this.prevBindings);
        console.debug('duplicate isReusedBindings', isReusedBindings, { bindings, prev: this.prevBindings });

        // //////////////////////////////////////////////////////////////////////////////

        if (this.previousRendered && isReusedEdgeFile && isReusedBindings) {
            console.debug('no change, reuse iframe');
            return null;
        }

        this.prevBindings = bindings;

        // //////////////////////////////////////////////////////////////////////////////

        //this.rootElement.empty();
        //this.rootElement.append('<h2>Graphistry Visual: Uploading data...</h2>');

        const dataset = new GraphistryDataset();
        // dataSet.addFile(nodeFile);
        dataset.addFile(edgeFile);
        dataset.addBindings(bindings);

        //this.rootElement.append('Created local schema, now uploading...');
        this.previousRendered = true;
        const uploading = dataset.getGraphUrl();
        return {
            uploading,
            uploaded: uploading.then((datasetID) => {
                console.debug('update deferred has id', { datasetID });
                return datasetID;
            })
        };
    }

    private clear() {
        this.state = LoadState.MISCONFIGURED;
        this.reactRoot = <React.ReactElement<any>>React.createElement(Main, {
            v: `cleared: ${Date.now()}`,
            view: null,
            config,
            datasetID: null,
            state: this.state
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

        config.UrlBase = this.visualSettings.graphistrySetting.graphistryBaseUrl || 'https://hub.graphistry.com';
        config.UserName = this.visualSettings.graphistrySetting.graphistryUserName || 'pbi';
        config.Password = this.visualSettings.graphistrySetting.graphistryPassword || 'pwd1234!';
        config.DatasetOverride = this.visualSettings.graphistrySetting.graphistryDatasetOverride;

        if (config.DatasetOverride && config.UrlBase) {
            console.debug('as DatasetOverride', { datasetOverride: config.DatasetOverride });
            //this.updateIframe(config.DatasetOverride);
            this.previousRendered = false;

            this.state = LoadState.UPLOADED;
            this.reactRoot = <React.ReactElement<any>>React.createElement(Main, {
                v: `updated baked: ${Date.now()}`,
                view,
                config,
                datasetID: config.DatasetOverride,
                state: this.state
            });
            ReactDOM.render(this.reactRoot, this.target);
            console.debug('////update has DatasetOverride, stop');
            return;
        }

        console.debug('Visual::isReadyForUpload()', { visualSettings: this.visualSettings });
        if (!this.client.isServerConfigured() || !this.isReadySrcDstIframe(view)) {
            //this.notReadyIframe(view);
            this.previousRendered = false;
            this.state = LoadState.MISCONFIGURED;
            this.reactRoot = <React.ReactElement<any>>React.createElement(Main, {
                v: `updated misconfigured: ${Date.now()}`,
                view,
                config,
                datasetID: this.datasetID,
                state: this.state
            });
            ReactDOM.render(this.reactRoot, this.target);    
            console.debug('////update not ready for upload, stop');
            return;
        }

        //FIXME cancelation
        console.debug('update readyForUpload, continue');
        const { uploading, uploaded } = this.uploadDataset(view);
        if (uploading) {
            this.state = LoadState.UPLOADING;
            this.reactRoot = <React.ReactElement<any>>React.createElement(Main, {
                v: `updated: ${Date.now()}`,
                view: (!options || !options.dataViews || !options.dataViews[0])
                    ? null
                    : options.dataViews[0],
                config,
                datasetID: this.datasetID,
                state: this.state
            });
            ReactDOM.render(this.reactRoot, this.target);
        }
        uploaded.then((datasetID) => {
            this.state = LoadState.UPLOADED;
            this.datasetID = datasetID;
            this.reactRoot = <React.ReactElement<any>>React.createElement(Main, {
                v: `updated uploaded: ${Date.now()}`,
                view,
                config,
                datasetID: this.datasetID,
                state: this.state
            });
            ReactDOM.render(this.reactRoot, this.target);
        });
    }

    private getGraphistryBaseUrl(): string {
        return `https://${this.visualSettings.graphistrySetting.graphistryBaseUrl}`;
    }

    public destroy(): void {
        // Perform any cleanup tasks here
    }
}
