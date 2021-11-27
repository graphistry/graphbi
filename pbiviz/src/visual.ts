// import "core-js/stable";
// import 'regenerator-runtime/runtime'
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

let linkNum = 0;

export class Visual implements IVisual {
    private host: IVisualHost;

    // private locale: string;

    private rootElement: JQuery;

    private visualSettings: VisualSettings;

    private client: GraphistryClient;

    constructor(options: VisualConstructorOptions) {
        console.debug('Visual::constructor()');
        this.host = options.host;
        // this.locale = options.host.locale;
        this.client = new GraphistryClient();
        this.rootElement = $(options.element);
        this.rootElement.append('<h2>Graphistry Visual: First set fields Source and Destination</h2>');

        this.visualSettings = <VisualSettings>VisualSettings.getDefault();
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

    private notReadyIframe(view) {
        console.debug('Visual::notReadyIframe()', { config });
        this.rootElement.empty();
        this.rootElement.append('<h1>Graphistry for PowerBI Custom Visual</h1>');

        let isConfigureAccountReady = true;
        this.rootElement.append('<h2>1. Configure account in <code>Format panel: Graphistry Settings</code></h2>');
        const ul = this.rootElement.append('<ul></ul>');
        if (config.UrlBase === '') {
            ul.append('<li>❌ <code>Format.GraphistrySettings.GraphistryServer</code>: undefined</li>');
            isConfigureAccountReady = false;
        }
        if (config.UserName === '') {
            ul.append('<li>❌ <code>Format.GraphistrySettings.GraphistryUserName</code>: undefined</li>');
            isConfigureAccountReady = false;
        }
        if (config.Password === '') {
            ul.append('<li>❌ <code>Format.GraphistrySettings.GraphistryPassword</code>: undefined</li>');
            isConfigureAccountReady = false;
        }
        if (isConfigureAccountReady) {
            this.rootElement.append('✔️ Done');
        }

        this.rootElement.append('<h2>2. Bind edge source/destination in <code>Fields panel</code></h3>');
        if (!view.metadata.columns.find((c) => c.roles.Source)) {
            this.rootElement.append('<p>❌ <code>Fields.Source</code>: undefined</p>');
        }
        if (!view.metadata.columns.find((c) => c.roles.Destination)) {
            this.rootElement.append('<p>❌ <code>Fields.Destination</code>: undefined</p>');
        }
    }

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

    private prevValues = {};

    private prevFiles = { edgeFile: null, nodeFile: null };

    private prevBindings = null;

    private previousRendered = false;

    private uploadDatasetAndRender(view) {
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
            ...Object.fromEntries(
                edgePropertyMetadatas.map((c) => [c.queryName, view.categorical.categories[c.index].values]),
            ),
            ...(edgeWeightMetadata ? { [edgeWeightColName]: edgeWeightCol.values } : {}),
        };
        const edgeValuesAllSame = Object.keys(edgeFileColumnValues)
            .map((colName) => this.prevValues[colName] === edgeFileColumnValues[colName])
            .every((check) => check);
        // eslint-disable-next-line prettier/prettier
        let { prevFiles: { edgeFile } } = this;
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

        this.rootElement.empty();
        this.rootElement.append('<h2>Graphistry Visual: Uploading data...</h2>');

        const dataset = new GraphistryDataset();
        // dataSet.addFile(nodeFile);
        dataset.addFile(edgeFile);
        dataset.addBindings(bindings);

        this.rootElement.append('Created local schema, now uploading...');
        this.previousRendered = true;
        return dataset.getGraphUrl().then((datasetID) => {
            console.debug('update deferred has id', { datasetID });
            this.updateIframe(datasetID);
            console.debug('////update fresh ID, stop');
            return datasetID;
        });
    }

    public update(options: VisualUpdateOptions, viewModel) {
        console.debug('Visual::update()', { options, viewModel });
        const view = options.dataViews[0];
        this.createViewModel(view);

        config.UrlBase = this.visualSettings.graphistrySetting.graphistryBaseUrl || 'https://hub.graphistry.com';
        config.UserName = this.visualSettings.graphistrySetting.graphistryUserName || 'pbi';
        config.Password = this.visualSettings.graphistrySetting.graphistryPassword || 'pwd1234!';
        config.DatasetOverride = this.visualSettings.graphistrySetting.graphistryDatasetOverride;

        if (config.DatasetOverride && config.UrlBase) {
            console.debug('as DatasetOverride', { datasetOverride: config.DatasetOverride });
            this.updateIframe(config.DatasetOverride);
            this.previousRendered = false;
            console.debug('////update has DatasetOverride, stop');
            return;
        }

        console.debug('Visual::isReadyForUpload()', { visualSettings: this.visualSettings });
        if (!this.client.isServerConfigured() || !this.isReadySrcDstIframe(view)) {
            this.notReadyIframe(view);
            this.previousRendered = false;
            console.debug('////update not ready for upload, stop');
            return;
        }

        console.debug('update readyForUpload, continue');
        this.uploadDatasetAndRender(view);
    }

    private getGraphistryBaseUrl(): string {
        return `https://${this.visualSettings.graphistrySetting.graphistryBaseUrl}`;
    }

    public destroy(): void {
        // Perform any cleanup tasks here
    }
}
