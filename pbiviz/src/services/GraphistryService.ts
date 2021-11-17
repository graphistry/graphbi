export class GraphistryService
{

    private baseUrl;

    private username;
    private password;
    
    private nodes:Object;
    private edges:Object;
    private dataSetSettings:Object;
    
    private currentDatasetID:string="";
    private authToken:string="";

    private datasetOverride:string="";


    public SetUserName(name:string) {
        this.username=name;
    }

    public SetPassword(pass:string) {
        this.password=pass;
    }

    public SetUrl(url:string) {
        this.baseUrl=url;
    }
    public SetEdges(edgeObject:Object) {
        this.edges=edgeObject;
    }
    public SetNodes(nodeObject:Object) {
        this.nodes=nodeObject;
    }

    public SetDataSetConfig(settings:Object)
    {
        this.dataSetSettings=settings;
    }

    public SetDatasetOverride(datasetID:string)
    {
        this.datasetOverride = datasetID;
    }



    public GetDataSetFrameUrl():Promise<string>
    {
        return this.AuthToGraphistry()
            .then(this.ProcessEdges)
            .then(()=>{
                return Promise.resolve("hello");
            })
       
    }

    private ProcessEdges(): Promise<void> {
       return this.CreateFile().then(()=>{
           return Promise.resolve();
       })
    }


    private CreateFile(): Promise<string> {
        throw new Error("Method not implemented.");
    }

     


    private  AuthToGraphistry() :Promise<any>
    {

        if(this.username === "")
        {
            return Promise.reject("No User Name Set");
        }

        if(this.password === "")
        {
            return Promise.reject("No Password Set");
        }

        if(this.authToken != "")
        {
            return Promise.resolve();
        }
        var authUrl= this.GetGraphistryBaseUrl()+"/api/v2/auth/token/generate";
        return this.PostToApi(authUrl,{
            "username":this.username,
            "password":this.password
        })
        .then((authReponse: Response)=> {
            return authReponse.json();
        }).then((AuthObject)=>{
            return this.ProcessAuthReponse(AuthObject);
        });
    }


    private ProcessAuthReponse(authBody: any): Promise<any> {
        //debugger;
       this.authToken=authBody.token;
       return Promise.resolve(true);
    }

    private PostToApi(url:string, body:Object)
    {
        var Tempheaders={
            'Accept': "application/json",
            'Content-Type': "application/json",
        };
        if(this.authToken!= "")
        {
           Tempheaders["Authorization"] = 'Bearer '+this.authToken;
        }
        return fetch(url,{
            method:'POST',
            headers:Tempheaders,
            body: JSON.stringify(body)
        });
    }
   


    private GetGraphistryBaseUrl():string
    {
        return "https://"+this.baseUrl;
    }


    


}

interface GraphistryConfiguration
{
    UserName:string;
    Password:string;
    UrlBase:string;
    AuthToken:string;
    DatasetOverride:string;
}

const  config:GraphistryConfiguration = 
{
    UserName:"",
    Password:"",
    UrlBase:"",
    AuthToken:"",
    DatasetOverride: ""
}


export {config};



export class GraphistryClient
{

    private static _username:string;
    private static _password:string;
    private static _urlbase:string;
    private static _authToken:string;

    public Post(Uri:string, Payload:any):Promise<any>
    {
        var headers=this.getBaseHeaders();
        return this.GetAuthToken().then(response=>{
            headers["Authorization"] = 'Bearer '+response;
            return this.PostToApi(Uri,Payload,headers)
        })
    }


    private GetAuthToken():Promise<string>
    {
        if(config.AuthToken!= "" && this.AuthTokenValid())
        {
            return Promise.resolve(config.AuthToken);
        }

        return this.PostToApi("api/v2/auth/token/generate",
                            { username: config.UserName, password: config.Password },
                            this.getBaseHeaders())
                            .then((response)=>{
                                config.AuthToken=response.token;
                                return Promise.resolve(config.AuthToken);
                            })

    }


    private AuthTokenValid():boolean
    {
        return true;
    }

    private PostToApi(url:string,data,headers:HeadersInit):Promise<any>
    {
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