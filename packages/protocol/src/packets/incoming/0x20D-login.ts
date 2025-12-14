import { BinaryReader } from '../../io/binary-reader';
import { IPacketHeader } from '../../io/packet-interface';

export interface ILoginRequest {
    header: IPacketHeader;
    username: string;
    password: string;
}

export function readLoginPacket(reader: BinaryReader): ILoginRequest {
    const header = reader.readHeader();

    // p20D structure:
    // Header (12 bytes)
    // Password: char[10]
    // Unused: WORD (2 bytes)
    // Username: char[12] -> Actually in many legacy sources p20D is:
    // char Key[4];
    // char Password[10]; or 12?
    // Let's stick to the prompt Requirement: 
    // Password: char[10]
    // Unused: WORD (2 bytes)
    // Username: char[12]

    const password = reader.readString(10);
    reader.skip(2); // Unused WORD
    const username = reader.readString(12);

    return {
        header,
        username,
        password
    };
}
