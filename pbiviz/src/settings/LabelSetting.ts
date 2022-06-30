import powerbi from 'powerbi-visuals-api'; // tslint:disable-line

export class LabelSetting {
    public background: powerbi.Fill = { solid: { color: '#111111' } };

    public text: powerbi.Fill = { solid: { color: '#ffffff' } };

    public opacity: number | null = null;

    public showLabels: boolean = true;

    public showLabelOnHover: boolean = true;

    public showLabelPropertiesOnHover: boolean = true;

    public showPointsOfInterest: boolean = true;

    public showPointsOfInterestLabels: boolean = true;

    public pointsOfInterestMax: number | null = null;
}
