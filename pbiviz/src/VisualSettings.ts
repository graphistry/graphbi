import { dataViewObjectsParser } from 'powerbi-visuals-utils-dataviewutils';
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
import { GraphistrySetting } from './GraphistrySetting';

export class VisualSettings extends DataViewObjectsParser {
    public graphistrySetting: GraphistrySetting = new GraphistrySetting();
}
