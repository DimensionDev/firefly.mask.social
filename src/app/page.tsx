import { Layout } from '@/components/Layout';
import { ConnectWallet } from '@/components/ConnectWallet';

export default function Home() {
    return <Layout MainArea={<ConnectWallet />} />;
}
