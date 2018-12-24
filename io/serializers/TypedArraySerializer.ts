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
| hprose/io/serializers/TypedArraySerializer.ts            |
|                                                          |
| hprose typed array serializer for TypeScript.            |
|                                                          |
| LastModified: Dec 20, 2018                               |
| Author: Ma Bingyao <andot@hprose.com>                    |
|                                                          |
\*________________________________________________________*/

import Tags from '../Tags';
import ReferenceSerializer from './ReferenceSerializer';
import WriterInterface from './WriterInterface';
import ByteStream from '../ByteStream';

export default class TypedArraySerializer extends ReferenceSerializer<ArrayLike<number>> {
    constructor (private readonly writeNumber: (stream: ByteStream, value: number) => void) { super(); }
    public write(writer: WriterInterface, value: ArrayLike<number>): void {
        super.write(writer, value);
        const stream = writer.stream;
        stream.writeByte(Tags.TagList);
        const n = value.length;
        if (n > 0) stream.writeAsciiString('' + n);
        stream.writeByte(Tags.TagOpenbrace);
        for (let i = 0; i < n; i++) {
            this.writeNumber(stream, value[i]);
        }
        stream.writeByte(Tags.TagClosebrace);
    }
}