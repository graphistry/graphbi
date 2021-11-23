"use strict";


//import "core-js/stable";
//import 'regenerator-runtime/runtime'
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils";
import { VisualSettings } from "./settings";
import { DataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils/lib/dataViewObjectsParser";

import {GraphistryDataSet} from "./services/GraphistryDataset";
import {GraphistryFile, GraphistryFileType} from "./services/GraphistryFile";
import {config, GraphistryClient} from "./services/GraphistryClient";


export class Visual implements IVisual {
    private host: IVisualHost;
    private locale: string;
    private selectionManager: ISelectionManager;
    private rootElement: JQuery;
    private dataView: DataView;
    private visualSettings: VisualSettings;
    private client: GraphistryClient;

    constructor(options: VisualConstructorOptions) {
        console.debug('Visual::constructor()');
        this.host = options.host;
        this.locale = options.host.locale;
        this.client = new GraphistryClient();
        this.rootElement = $(options.element);
        this.visualSettings = VisualSettings.getDefault() as VisualSettings;
        console.debug('////constructed');
    }

    public createViewModel(dataView: DataView): VisualSettings {

        console.debug('Visual::createViewModel()', {dataView});

        this.visualSettings = VisualSettings.parse<VisualSettings>(dataView);

        console.debug('////Visual::createViewModel', {out: this.visualSettings});

        return this.visualSettings;
    }


    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions) {
        console.debug('Visual::enumerateObjectInstances()', { options, visualSettings: this.visualSettings, def: <VisualSettings> VisualSettings.getDefault()});
        const settings: VisualSettings = this.visualSettings || <VisualSettings> VisualSettings.getDefault();
        const out = VisualSettings.enumerateObjectInstances(settings, options);
        console.debug('////Visual::enumerateObjectInstances1', {out})
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

    private notReadyIframe() {
        console.debug('Visual::notReadyIframe()', {config});
        this.rootElement.empty();
        this.rootElement.append("<h2>Graphistry Visual: Finish account configuration:</h2>");
        if (config.UrlBase === "") {
            this.rootElement.append("<p>Format.GraphistrySettings.GraphistryServer: undefined</p>");
        }
        if (config.UserName === "") {
            this.rootElement.append("<p>Format.GraphistrySettings.GraphistryUserName: undefined</p>");
        }
        if (config.Password === "") {
            this.rootElement.append("<p>Format.GraphistrySettings.GraphistryPassword: undefined</p>");
        }
        console.debug('////Visual::notReadyIframe');
    }

    private notReadySrcDstIframe(view) {
        console.debug('Visual::notReadySrcDstIframe()');
        this.rootElement.empty();
        this.rootElement.append("<h2>Graphistry Visual: Finish edge bindings:</h2>");
        if (!view.metadata.columns.find(c => c.roles.Source)) {
            this.rootElement.append("<p>Fields.Source: undefined</p>");
        }
        if (!view.metadata.columns.find(c => c.roles.Destination)) {
            this.rootElement.append("<p>Fields.Destination: undefined</p>");
        }
    }
    private isReadySrcDstIframe(view) {
        console.debug('Visual::isReadySrcDstIframe()');
        const src = view.metadata.columns.find(c => c.roles.Source);
        if (!src) {
            return false;
        }
        const dst = view.metadata.columns.find(c => c.roles.Destination);
        if (!dst) {
            return false;
        }
        return true;
    }

    private updateIframe(datasetID: string) {

        // if(this.visualSettings.GraphistrySetting.graphistryDataSetId != "")
        // {
        //     var dataSetFrameUrl= this.GetGraphistryBaseUrl()+"/graph/graph.html?dataset="+this.visualSettings.GraphistrySetting.graphistryDataSetId;

        //     var frame=$('<iframe />', {
        //         name: 'frame1',
        //         id: 'frame1',
        //         src: dataSetFrameUrl,

        //     });
        //     this.rootElement.append(frame)
        // }
        // else
        // {
        //     this.rootElement.append("<p><span style='color: #ff0000;'>Data Set Id is invalid. </span></p><p><span style='color: #ff0000;'>Please enter a valid Data Set Id</span></p>")
        // }

        console.debug('Visual::updateIframeOverride()', {datasetID});
        this.rootElement.empty();
        const url = this.GetGraphistryBaseUrl() + "/graph/graph.html?dataset=" + datasetID + "&play=3000";
        const iframeUrl = url + "&splashAfter=true";
        const linkUrl = url + "&splashAfter=true";
        var frame=$('<iframe />', {
            allowfullscreen: "true",
            webkitallowfullscreen: "true",
            mozallowfullscreen: "true",
            oallowfullscreen: "true",
            msallowfullscreen: "true",
            //name: 'frame1',
            //id: 'frame1',
            src: iframeUrl,
        });
        this.rootElement.append(frame)
        this.rootElement.append("<h3>Open in a <a href=\"" + linkUrl + "\">new tab: " + datasetID + "</a></h3>");
        console.debug('////Visual::updateIframeOverride');
    }

    public update(options: VisualUpdateOptions, viewModel) {
        console.debug('Visual::update()', {options, viewModel});
        const view = options.dataViews[0];
        this.createViewModel(view);

        config.UrlBase = this.visualSettings.graphistrySetting.graphistryBaseUrl || 'https://hub.graphistry.com';
        config.UserName = this.visualSettings.graphistrySetting.graphistryUserName;
        config.Password = this.visualSettings.graphistrySetting.graphistryPassword;
        config.DatasetOverride = this.visualSettings.graphistrySetting.graphistryDatasetOverride;


        if (config.DatasetOverride) {
            console.debug('as DatasetOverride', {datasetOverride: config.DatasetOverride});
            this.updateIframe(config.DatasetOverride);
            console.debug('////update has DatasetOverride, stop');
            return;
        }

        if (!this.client.readyForUpload()) {
            console.debug('////update not readyForUpload, stop');
            this.notReadyIframe();
            return;
        }

        if (!this.isReadySrcDstIframe(view)) {
            console.debug('////update not readySrcDstIframe, stop');
            this.notReadySrcDstIframe(view);
            return;
        }
        
        console.debug('update readyForUpload, continue');

       
        this.rootElement.empty();
        this.rootElement.append("<h2>Graphistry Visual: Uploading data...</h2>");

        /*
        var nodeFile = new GraphistryFile(GraphistryFileType.Node);
        nodeFile.SetData({
            "n":["a","b","c"],
            "v":[2,4,6],
            "v2":["a","aa","aaa"]
        });
        */
        var edgeFile = new GraphistryFile(GraphistryFileType.Edge);

        const srcColMetadata = view.metadata.columns.find(c => c.roles.Source);
        const srcColName = srcColMetadata.queryName;  //TODO displaName?
        const srcCol = view.categorical.categories[srcColMetadata.index];
        const dstColMetadata = view.metadata.columns.find(c => c.roles.Destination);
        const dstColName = dstColMetadata.queryName;  //TODO displaName?
        const dstCol = view.categorical.categories[dstColMetadata.index];
        const edgePropertyMetadatas = view.metadata.columns.filter(c => c.roles.EdgeType);
        const edgeWeightMetadata = view.metadata.columns.find(c => c.roles.EdgeWeight);
        const edgeWeightCol = edgeWeightMetadata ? view.categorical.categories[edgeWeightMetadata.index] : undefined;
        const edgeWeightColName = edgeWeightMetadata ? edgeWeightMetadata.queryName : undefined;
        edgeFile.SetData({
            [srcColName]: srcCol.values,
            [dstColName]: dstCol.values,
            ...Object.fromEntries(edgePropertyMetadatas.map(c => [c.queryName, view.categorical.categories[c.index].values])),
            ...(edgeWeightMetadata ? {[edgeWeightColName]: edgeWeightCol.values} : {})
        });

        var dataSet = new GraphistryDataSet();
        //dataSet.AddFile(nodeFile);
        dataSet.AddFile(edgeFile);
        dataSet.AddBindings({
            "node_encodings": {
                "bindings": {
                    "node":"n"
                }
            },
            "edge_encodings": {
                "bindings": {
                    "source": srcColName,
                    "destination": dstColName,
                    ...(edgeWeightMetadata ? { "edge_weight": edgeWeightCol.values } : {})
                }
            },
            "metadata": {},
            "name": "testdata"
        })
        this.rootElement.append("Created local schema, now uploading...");
        dataSet.GetGraphUrl()
            .then(datasetID => {
                console.debug('update deferred has id', { datasetID });
                this.updateIframe(datasetID);
                console.debug('////update fresh ID, stop');
            });
        


        // this.service.SetNodes({
        //     "n":["a","b","c"],
        //     "v":[2,4,6],
        //     "v2":["a","aa","aaa"]
        // });
        // this.service.SetEdges({
        //     "s":["a","b","c"],
        //     "d":["b","c","a"],
        //     "txt":["the","quick","brown"],
        //     "num":[2,4,6]
        // });
        // this.service.SetDataSetConfig({
        //     "node_encodings": {
        //         "bindings": {
        //             "node":"n"
        //         }
        //     },
        //     "edge_encodings": {
        //         "bindings": {
        //             "source": "s",
        //             "destination": "d"
        //         }
        //     },
        //     "metadata": {},
        //     "name": "testdata"
        // });

        //var url= this.service.GetDataSetFrameUrl();       

    }


    private GetGraphistryBaseUrl():string
    {
        return "https://"+this.visualSettings.graphistrySetting.graphistryBaseUrl;
    }

  
    public destroy(): void {
        // Perform any cleanup tasks here
    }

}
