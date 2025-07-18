import NextAuth from 'next-auth';;
import { authOptions } from '../../../../lib/auth';

const handler = NextAuth(authOptions);

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export { handler as GET, handler as POST }; 