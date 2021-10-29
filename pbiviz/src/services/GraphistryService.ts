export class GraphistryService
{

    private baseUrl;

    private username;
    private password;
    
    private nodes:Object;
    private edges:Object;
    private dataSetSettings:Object;
    
    private currentDataSetId:string="";
    private authToken:string="";


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



    public GetDataSetFrameUrl():Promise<string>
    {
        return this.AuthToGraphistry().then(()=>{
            return Promise.resolve("hello World");
        })
       
    }

     


    private  AuthToGraphistry() :Promise<any>
    {
        var authUrl= this.GetGraphistryBaseUrl()+"/api/v2/auth/token/generate";
        return this.PostToApi(authUrl,{
            "username":this.username,
            "password":this.password
        })
        .then((authReponse: Response)=> {
            return authReponse.json();
        }).then(this.ProcessAuthReponse);
    }


    private ProcessAuthReponse(authBody: any): Promise<any> {
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