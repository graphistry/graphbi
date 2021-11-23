interface GraphistryConfiguration{
    UserName:string;
    Password:string;
    UrlBase:string;
    AuthToken:string;
    DatasetOverride:string;
}

const config:GraphistryConfiguration = {
    UserName:"",
    Password:"",
    UrlBase:"",
    AuthToken:"",
    DatasetOverride: ""
};

export {config};

export class GraphistryClient {

    public readyForUpload():boolean {
        return config.UserName !== "" && config.Password !== "" && config.UrlBase !== "";
    }

    public Post(Uri:string, Payload:any):Promise<any> {
        console.debug('@Post', {Uri, Payload});

        var headers=this.getBaseHeaders();
        return this.GetAuthToken().then(response=>{
            headers["Authorization"] = 'Bearer '+response;
            return this.PostToApi(Uri,Payload,headers)
        })
    }

    private GetAuthToken():Promise<string> {
        console.debug('@GetAuthToken');

        if (config.AuthToken != "" && this.AuthTokenValid()) {
            return Promise.resolve(config.AuthToken);
        }

        return this.PostToApi("api/v2/auth/token/generate",
                            { username: config.UserName, password: config.Password },
                            this.getBaseHeaders())
                            .then((response)=>{
                                console.log('token/generate', {response});
                                config.AuthToken=response.token;
                                return Promise.resolve(config.AuthToken);
                            })

    }


    private AuthTokenValid():boolean
    {
        return true;
    }

    private PostToApi(url:string,data,headers:HeadersInit):Promise<any> {
        console.debug('@PostToApi', {url,data,headers});
        return fetch(this.getBaseUrl()+url,{
            method:'POST',
            headers:headers,
            body: JSON.stringify(data)
        }).then((response)=>{
            return response.json();
        })
    }


    private getBaseHeaders():HeadersInit
    {
        return {
            'Accept': "application/json",
            'Content-Type': "application/json",
        };
    }

    private getBaseUrl():string
    {
        return "https://"+config.UrlBase+"/";
    }

}