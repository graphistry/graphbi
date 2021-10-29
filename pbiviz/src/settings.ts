"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

class GraphistrySetting
{
    public graphistryBaseUrl: string = "hub.graphistry.com";
    public graphistryUserName:string ="";
    public graphistryPassword:string ="";
    public graphistryDataSetId:string="";
}

export class VisualSettings extends DataViewObjectsParser
{
    public GraphistrySetting: GraphistrySetting = new GraphistrySetting();
}