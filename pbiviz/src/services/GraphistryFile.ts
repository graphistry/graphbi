import {GraphistryClient} from "./GraphistryService"
import { v4 as uuidv4 } from 'uuid';
export enum GraphistryFileType
{
    Node,
    Edge
}

export class GraphistryFile{
   
    public Name:string;
    
    public FileType:string;
    public Type:GraphistryFileType;

    private _fileId;
    private _fileCreated:boolean;
    private _fileUploaded:boolean;
    private _data;
    private _graphistryClient:GraphistryClient;

    constructor(type:GraphistryFileType)
    {
        this.FileType="json"
        this.Name = uuidv4();
        this.Type=type;
        this._graphistryClient= new GraphistryClient();
    }

    

    public CreateFile():Promise<boolean>
    {
        debugger;
        if(this._fileCreated)
        {
            return Promise.resolve(this._fileCreated);
        }
        return this._graphistryClient.Post("api/v2/files/",{
            file_type:this.FileType
        }).then((fileJsonResults)=>{
            this._fileId=fileJsonResults.file_id;
            this._fileCreated=true;
            return Promise.resolve(this._fileCreated);
        })
        
    }

    public UploadData():Promise<boolean>
    {
        debugger;
        if(this._fileUploaded)
        {
            return Promise.resolve(this._fileUploaded);
        }
        return this._graphistryClient.Post("api/v2/upload/files/"+this._fileId+"/",this._data)
            .then((results)=>{
                this._fileUploaded=results.is_uploaded;
                return Promise.resolve(this._fileUploaded);
            })
    }


    public SetData(data:any) {
       this._data=data;
    }

     
}