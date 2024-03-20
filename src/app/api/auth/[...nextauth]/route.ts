import { authOptions } from '@/app/api/auth/[...nextauth]/options.js';
import { Auth } from '@/esm/Auth.js';

const handler = Auth(authOptions);

export { handler as GET, handler as POST };
