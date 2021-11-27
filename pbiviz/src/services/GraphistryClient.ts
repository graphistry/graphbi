interface GraphistryConfiguration {
    UserName: string;
    Password: string;
    UrlBase: string;
    AuthToken: string;
    DatasetOverride: string;
}

const config: GraphistryConfiguration = {
    UserName: '',
    Password: '',
    UrlBase: '',
    AuthToken: '',
    DatasetOverride: '',
};

export { config }; // tslint:disable-line

export class GraphistryClient {
    public isServerConfigured(): boolean {
        return config.UserName !== '' && config.Password !== '' && config.UrlBase !== '';
    }

    public post(Uri: string, Payload: any): Promise<any> {
        console.debug('@post', { Uri, Payload });

        const headers = this.getBaseHeaders();
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
