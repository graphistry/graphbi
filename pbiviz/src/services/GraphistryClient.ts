import powerbi from 'powerbi-visuals-api'; // tslint:disable-line

export interface GraphistryConfiguration {
    UserName: string;
    Password: string;
    UrlBase: string;
    AuthToken: string;
    DatasetOverride: string;

    BackgroundColor: powerbi.Fill;
    ChartLoadPlay: number | null;
    ChartLoadShowSplashScreen: boolean;
    EdgeCurvature: number | null;
    EdgeOpacity: number | null;
    EdgeShowArrows: boolean;
    EdgeTitle: string | null;
    LabelBackground: powerbi.Fill;
    LabelColor: powerbi.Fill;
    LabelOpacity: number | null;
    LabelShowLabels: boolean;
    LabelShowLabelOnHover: boolean;
    LabelShowLabelPropertiesOnHover: boolean;
    LabelShowPointsOfInterest: boolean;
    LabelShowPointsOfInterestLabels: boolean;
    LabelPointsOfInterestMax: number | null;
    LayoutDissuadeHubs: boolean;
    LayoutEdgeInfluence: number | null;
    LayoutStrongGravity: boolean;
    LayoutGravity: number | null;
    LayoutLinLog: boolean;
    LayoutPrecisionVsSpeed: number | null;
    LayoutScalingRatio: number | null;
    MenuShowInfo: boolean;
    MenuShowMenu: boolean;
    MenuShowToolbar: boolean;
    NodeOpacity: number | null;
    NodeSize: number | null;
    NodeTitle: string | null;
    PanelShowHistograms: boolean;
    PanelShowTimebars: boolean;
    PositionX: number | null;
    PositionY: number | null;
    PositionLockedX: boolean;
    PositionLockedY: boolean;
    PositionLockedRadius: boolean;
}

const config: GraphistryConfiguration = {
    UserName: '',
    Password: '',
    UrlBase: '',
    AuthToken: '',
    DatasetOverride: '',

    BackgroundColor: { solid: { color: '#ffffff' } },
    ChartLoadPlay: undefined,
    ChartLoadShowSplashScreen: true,
    EdgeCurvature: undefined,
    EdgeOpacity: undefined,
    EdgeShowArrows: true,
    EdgeTitle: undefined,
    LabelBackground: { solid: { color: '#333339' } },
    LabelColor: { solid: { color: '#ffffff' } },
    LabelOpacity: undefined,
    LabelShowLabels: true,
    LabelShowLabelOnHover: true,
    LabelShowLabelPropertiesOnHover: true,
    LabelShowPointsOfInterest: true,
    LabelShowPointsOfInterestLabels: true,
    LabelPointsOfInterestMax: undefined,
    LayoutDissuadeHubs: false,
    LayoutEdgeInfluence: undefined,
    LayoutStrongGravity: false,
    LayoutGravity: undefined,
    LayoutLinLog: false,
    LayoutPrecisionVsSpeed: undefined,
    LayoutScalingRatio: undefined,
    MenuShowInfo: false,
    MenuShowMenu: false,
    MenuShowToolbar: false,
    NodeOpacity: undefined,
    NodeSize: undefined,
    NodeTitle: undefined,
    PanelShowHistograms: false,
    PanelShowTimebars: false,
    PositionX: undefined,
    PositionY: undefined,
    PositionLockedX: false,
    PositionLockedY: false,
    PositionLockedRadius: false,
};

export { config }; // tslint:disable-line

export class GraphistryClient {
    public isServerConfigured(): boolean {
        return config.UserName !== '' && config.Password !== '' && config.UrlBase !== '';
    }

    public post(Uri: string, Payload: any): Promise<any> {
        console.debug('@post', { Uri, Payload });

        const headers = <Record<string, string>>this.getBaseHeaders();
        return this.getAuthToken().then((response) => {
            headers.Authorization = `Bearer ${response}`;
            return this.postToApi(Uri, Payload, headers);
        });
    }

    private getAuthToken(): Promise<string> {
        console.debug('@GetAuthToken');

        if (config.AuthToken !== '' && this.authTokenValid()) {
            return Promise.resolve(config.AuthToken);
        }

        return this.postToApi(
            'api/v2/auth/token/generate',
            { username: config.UserName, password: config.Password },
            this.getBaseHeaders(),
        ).then((response) => {
            console.log('token/generate', { response });
            config.AuthToken = response.token;
            return Promise.resolve(config.AuthToken);
        });
    }

    private authTokenValid(): boolean {
        return true;
    }

    private postToApi(url: string, data, headers: HeadersInit): Promise<any> {
        console.debug('@postToApi', { url, data, headers });
        return fetch(this.getBaseUrl() + url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        }).then((response) => response.json());
    }

    private getBaseHeaders(): HeadersInit {
        return {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
    }

    private getBaseUrl(): string {
        return `https://${config.UrlBase}/`;
    }
}
