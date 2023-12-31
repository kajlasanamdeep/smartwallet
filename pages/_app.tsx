import type { AppProps } from "next/app";
import { ThirdwebProvider, embeddedWallet, metamaskWallet, smartWallet } from "@thirdweb-dev/react";
import { Goerli } from "@thirdweb-dev/chains";
import "../styles/globals.css";
import { THIRDWEB_CLIENT_ID } from "../constants/addresses";

// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <ThirdwebProvider
      clientId={THIRDWEB_CLIENT_ID}
      activeChain={Goerli}
      supportedWallets={[embeddedWallet({})]}
      autoConnect={true}
    >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
