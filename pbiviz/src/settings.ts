"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

class GraphistrySetting {
    public graphistryBaseUrl: string = "hub.graphistry.com";
    public graphistryUserName: string = "";
    public graphistryPassword: string = "";
    public graphistryDatasetOverride: string = "";
}

export class VisualSettings extends DataViewObjectsParser {
    public graphistrySetting: GraphistrySetting = new GraphistrySetting();
}