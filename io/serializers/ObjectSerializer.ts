/*--------------------------------------------------------*\
|                                                          |
|                          hprose                          |
|                                                          |
| Official WebSite: http://www.hprose.com/                 |
|                   http://www.hprose.org/                 |
|                                                          |
\*________________________________________________________*/
/*--------------------------------------------------------*\
|                                                          |
| hprose/io/serializers/ObjectSerializer.ts                |
|                                                          |
| hprose object serializer for TypeScript.                 |
|                                                          |
| LastModified: Dec 14, 2018                               |
| Author: Ma Bingyao <andot@hprose.com>                    |
|                                                          |
\*________________________________________________________*/

import Tags from '../Tags';
import ReferenceSerializer from './ReferenceSerializer';
import WriterInterface from './WriterInterface';
import ByteStream from '../ByteStream';
import { writeStringBody } from './ValueWriter';

export default class ObjectSerializer<T> extends ReferenceSerializer<T> {
    public readonly type: Function;
    public readonly fields: string[];
    public readonly metadata: Uint8Array;
    constructor(obj: T, name: string, fields: string[] = []) {
        super();
        this.type = obj.constructor;
        if (fields.length === 0) {
            for (const key in obj) {
                if (obj.hasOwnProperty(key) && typeof obj[key] !== 'function') {
                    fields[fields.length] = key.toString();
                }
            }
        }
        this.fields = fields;
        const stream: ByteStream = new ByteStream();
        stream.writeByte(Tags.TagClass);
        writeStringBody(stream, name);
        const n = fields.length;
        if (n > 0) stream.writeAsciiString('' + n);
        stream.writeByte(Tags.TagOpenbrace);
        for (let i = 0; i < n; i++) {
            stream.writeByte(Tags.TagString);
            writeStringBody(stream, fields[i]);
        }
        stream.writeByte(Tags.TagClosebrace);
        this.metadata = stream.takeBytes();
    }
    public write(writer: WriterInterface, value: any): void {
        const stream = writer.stream;
        const fields = this.fields;
        const metadata = this.metadata;
        const n = fields.length;
        const r = writer.writeClass(this.type, () => {
            stream.write(metadata);
            writer.addReferenceCount(n);
        });
        super.write(writer, value);
        stream.writeByte(Tags.TagObject);
        stream.writeAsciiString('' + r);
        stream.writeByte(Tags.TagOpenbrace);
        for (let i = 0; i < n; i++) {
            writer.serialize(value[fields[i]]);
        }
        stream.writeByte(Tags.TagClosebrace);
    }
}