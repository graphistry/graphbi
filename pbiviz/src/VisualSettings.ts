import { dataViewObjectsParser } from 'powerbi-visuals-utils-dataviewutils';
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
import { GraphistrySetting } from './GraphistrySetting';
import { ChartLoadSetting } from './settings/ChartLoadSetting';
import { PositionSetting } from './settings/PositionSetting';
import { BackgroundSetting } from './settings/BackgroundSetting';
import { LabelSetting } from './settings/LabelSetting';
import { NodeSetting } from './settings/NodeSetting';
import { EdgeSetting } from './settings/EdgeSetting';
import { MenuSetting } from './settings/MenuSetting';
import { PanelSetting } from './settings/PanelSetting';
import { LayoutSetting } from './settings/LayoutSetting';

export class VisualSettings extends DataViewObjectsParser {
    public graphistrySetting: GraphistrySetting = new GraphistrySetting();

    public chartLoadSetting: ChartLoadSetting = new ChartLoadSetting();

    public positionSetting: PositionSetting = new PositionSetting();

    public backgroundSetting: BackgroundSetting = new BackgroundSetting();

    public labelSetting: LabelSetting = new LabelSetting();

    public nodeSetting: NodeSetting = new NodeSetting();

    public edgeSetting: EdgeSetting = new EdgeSetting();

    public menuSetting: MenuSetting = new MenuSetting();

    public panelSetting: PanelSetting = new PanelSetting();

    public layoutSetting: LayoutSetting = new LayoutSetting();
}
