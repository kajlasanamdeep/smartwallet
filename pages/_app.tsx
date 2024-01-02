import type { AppProps } from "next/app";
import { ThirdwebProvider, embeddedWallet, metamaskWallet, smartWallet } from "@thirdweb-dev/react";
import { Goerli } from "@thirdweb-dev/chains";
import "../styles/globals.css";
import { ACCOUNT_FACTORY_ADDRESS, NEXT_PUBLIC_TEMPLATE_CLIENT_ID } from "../constants/addresses";

// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.

function MyApp({ Component, pageProps }: AppProps) {
  const smartWalletConfig = {
    factoryAddress: ACCOUNT_FACTORY_ADDRESS,
    gasless: true,
  }

  return (
    <ThirdwebProvider
      clientId={NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      activeChain={Goerli}
      autoConnect={false}
    >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
