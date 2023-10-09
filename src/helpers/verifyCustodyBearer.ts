import { CustodyPayload } from './generateCustodyBearer';

export function verifyCustodyBearer(token: string, payload: CustodyPayload, address: string) {
    return true;
}
