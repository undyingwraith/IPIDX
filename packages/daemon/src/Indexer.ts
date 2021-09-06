import {CID} from "ipfs-http-client";
import {IIndexer} from "./IIndexer";

export class Indexer implements IIndexer {
    constructor(
        private db: any
    ) {
    }

    exists(cid: CID): Promise<boolean> {
        return this.db.query('SELECT FROM Object WHERE Cid=:cid', {
            params: {
                cid: this.cidToString(cid)
            }
        }).all()
            .then((r: any[]) => {
                return Promise.resolve(r.length > 0)
            })
    }

    addFile(cid: CID) {
        const now = this.getCurrentTime()
        return this.db.command(`CREATE VERTEX File CONTENT {"Cid": "${this.cidToString(cid)}", "FirstSeen": ${now}, "LastSeen": ${now}}`).all()
    }

    addFolder(cid: CID) {
        const now = this.getCurrentTime()
        return this.db.command(`CREATE VERTEX Folder CONTENT {"Cid": "${this.cidToString(cid)}", "FirstSeen": ${now}, "LastSeen": ${now}}`).all()
    }

    isFileInFolder(folder: CID, file: CID, filename: string) {
        //TODO: also check filename
        return this.db.query(`MATCH {class: Folder, where: (Cid="${folder}"), as: folder}.out(\'ContainsFile\') {as: file, where: (Cid="${file}")} RETURN file, folder`).all()
            .then((r: any[]) => {
                return Promise.resolve(r.length > 0)
            })
    }

    addFileToFolder(folder: CID, file: CID, filename: string) {
        return this.db.command(`CREATE EDGE ContainsFile FROM (SELECT FROM Object WHERE Cid="${this.cidToString(folder)}") TO (SELECT FROM Object WHERE Cid="${this.cidToString(file)}") SET Name="${filename}"`)
    }

    touchByCid(cid: CID): Promise<void> {
        return this.db.command('UPDATE Object SET LastSeen = :now WHERE Cid = :cid', {
            params: {
                cid: this.cidToString(cid),
                now: this.getCurrentTime(),
            }
        }).all();
    }

    private getCurrentTime() {
        return new Date().getTime()
    }

    private cidToString(cid: CID): string {
        return cid.toV1().toString()
    }
}