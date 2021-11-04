"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils";
import { VisualSettings } from "./settings";
import * as d3select from 'd3-selection';
import { DataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils/lib/dataViewObjectsParser";
import{GraphistryService} from "./services/GraphistryService"
import { thresholdScott } from "d3-array";
import {GraphistryDataSet} from "./services/GraphistryDataSet";
import {GraphistryFile, GraphistryFileType} from "./services/GraphistryFile";
import {config} from "./services/GraphistryService";

export class Visual implements IVisual {
    private rootElement: JQuery;
    private dataView: DataView;
    private visualSettings: VisualSettings;
    private service:GraphistryService;

    constructor(options: VisualConstructorOptions) {
        //this.service= new GraphistryService();
        this.rootElement = $(options.element);
    }

    public update(options: VisualUpdateOptions) {
     
        
        this.rootElement.empty();
        this.visualSettings = VisualSettings.parse<VisualSettings>(options.dataViews[0]);
        config.Password = this.visualSettings.GraphistrySetting.graphistryPassword;
        config.UrlBase = this.visualSettings.GraphistrySetting.graphistryBaseUrl;
        config.UserName=this.visualSettings.GraphistrySetting.graphistryUserName;


        
        var nodeFile = new GraphistryFile(GraphistryFileType.Node);
        nodeFile.SetData({
            "n":["a","b","c"],
            "v":[2,4,6],
            "v2":["a","aa","aaa"]
        });
        var edgeFile = new GraphistryFile(GraphistryFileType.Edge);
        edgeFile.SetData({
            "s":["a","b","c"],
            "d":["b","c","a"],
            "txt":["the","quick","brown"],
            "num":[2,4,6]
        });


        var dataSet = new GraphistryDataSet();
        dataSet.AddFile(nodeFile);
        dataSet.AddFile(edgeFile);
        dataSet.GetGraphUrl();
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

        var url= this.service.GetDataSetFrameUrl();       
        
        
      
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions) {
        const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
        return VisualSettings.enumerateObjectInstances(settings, options);
    }

    private GetGraphistryBaseUrl():string
    {
        return "https://"+this.visualSettings.GraphistrySetting.graphistryBaseUrl;
    }

  


}
