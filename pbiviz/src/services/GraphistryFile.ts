import { GraphistryClient } from './GraphistryClient';

export enum GraphistryFileType {
    Node,
    Edge,
}

export class GraphistryFile {
    public Name: string;

    public FileType: string;

    public Type: GraphistryFileType;

    private _fileId;

    private _fileCreated: boolean;

    private _fileUploaded: boolean;

    private _data;

    private _graphistryClient: GraphistryClient;

    public get fileID(): string {
        return this._fileId;
    }

    constructor(type: GraphistryFileType) {
        this.FileType = 'json';
        this.Name = 'my pbi';
        this.Type = type;
        this._graphistryClient = new GraphistryClient();
    }

    public createFile(): Promise<boolean> {
        if (this._fileCreated) {
            return Promise.resolve(this._fileCreated);
        }
        return this._graphistryClient
            .post('api/v2/files/', {
                file_type: this.FileType,
            })
            .then((fileJsonResults) => {
                console.log('fileJsonResults', { fileJsonResults });
                this._fileId = fileJsonResults.file_id;
                this._fileCreated = true;
                return Promise.resolve(this._fileCreated);
            });
    }

    public uploadData(): Promise<boolean> {
        if (this._fileUploaded) {
            return Promise.resolve(this._fileUploaded);
        }
        return this._graphistryClient
            .post(`api/v2/upload/files/${this._fileId}?erase=true&orient=columnar`, this._data)
            .then((results) => {
                console.log('uploadData', { results });
                this._fileUploaded = results.is_uploaded;
                return Promise.resolve(this._fileUploaded);
            });
    }

    public setData(data: any) {
        this._data = data;
    }
}
