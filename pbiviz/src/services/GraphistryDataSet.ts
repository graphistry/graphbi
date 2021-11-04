import {GraphistryClient} from "./GraphistryService"
import {GraphistryFile} from "./GraphistryFile";
export class GraphistryDataSet
{
   
    
    private _files:GraphistryFile[];


    private _graphistryClient:GraphistryClient;
    constructor()
    {
        this._graphistryClient= new GraphistryClient();
        this._files = new Array();
    }

    public GetGraphUrl():Promise<string> {
        var filePromises:Promise<boolean>[] = new Array();
        this._files.forEach((file)=>{
            filePromises.push(file.CreateFile().then((response)=>{ 
                if(response)
                {
                    return file.UploadData()
                }
                return Promise.reject("Error In Creating File");
                
            }));
        });
       
        return Promise.resolve("hello");

    }

    public AddFile(file: GraphistryFile) {
        this._files.push(file);
    }
}