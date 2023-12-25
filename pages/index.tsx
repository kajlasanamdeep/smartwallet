import { ConnectWallet, embeddedWallet, useAddress, useConnect, ChainId, smartWallet, useContract, useOwnedNFTs, Web3Button } from "@thirdweb-dev/react";
import { EmbeddedWallet } from "@thirdweb-dev/wallets";
import { Goerli } from "@thirdweb-dev/chains";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import Image from "next/image";
import { ACCOUNT_FACTORY_ADDRESS, NFT_CONTRACT_ADDRESS } from "../constants/addresses";
import { useState } from "react";

const wallet = new EmbeddedWallet({
  clientId: `${process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}`,
  chain: Goerli,
});

const embeddedWalletConfig = embeddedWallet({
  auth: {
    options: ["email"],
  },
});
const smartWalletConfig = smartWallet(embeddedWalletConfig, {
  factoryAddress: ACCOUNT_FACTORY_ADDRESS,
  gasless: true,
})

const Home: NextPage = () => {
  const address = useAddress();
  const connect = useConnect();
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [personalWalletAddress, setPersonalWalletAddress] = useState<string | undefined>(undefined);
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | undefined>(undefined);

  const handleLogin = async () => {
    try {
      if (!emailInput || !(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(emailInput))) {
        alert("Valid Email is required !");
        return;
      }
      setIsLoading(true);
      const authResult = await wallet.authenticate({
        strategy: "iframe_email_verification",
        email: emailInput
      });
      console.log("Authenticated with", authResult.user);
      const personalWalletAddress = await wallet.connect({ authResult })
      setPersonalWalletAddress(personalWalletAddress)
      console.log("personalWalletAddress", personalWalletAddress);
      const smartWallet = await connect(smartWalletConfig, {
        personalWallet: wallet,
        chainId: ChainId.Goerli,
      });
      console.log("smartWallet", smartWallet);
      const smartWalletAddress = await smartWallet.getAddress();
      setSmartWalletAddress(smartWalletAddress);
      console.log("smartWalletAddress", smartWalletAddress);
      setIsLoading(false);
      setEmailInput("");
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const { contract } = useContract(NFT_CONTRACT_ADDRESS);
  const { data: personalOwnedNFTs, isLoading: isPersonalOwnedNFTsLoading } = useOwnedNFTs(contract, personalWalletAddress);
  const { data: smartOwnedNFTs, isLoading: isSmartOwnedNFTsLoading } = useOwnedNFTs(contract, smartWalletAddress);

  if (isLoading) {
    return (
      <div className={styles.centeredContainer}>
          <Image src="/images/loading.gif" alt="loading" width={200} height={200} className="loading"/>
      </div>
    )
  }
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {
          address ? <div className={styles.centeredContainer}>
            <div className={styles.centeredCard}>
              <ConnectWallet auth={{
                onLogout: () => {
                  window.location.reload()
                }
              }} />
              <h1>Logged in!</h1>
              <p>Personal Wallet: {personalWalletAddress}</p>
              <Web3Button
                contractAddress={NFT_CONTRACT_ADDRESS}
                action={(contract) => contract.erc1155.claimTo(personalWalletAddress!, 0, 1)}
              >Claim NFT</Web3Button>
              <div style={{ width: "100%", margin: "0 auto", textAlign: "center" }}>
                {!isPersonalOwnedNFTsLoading && (
                  personalOwnedNFTs && personalOwnedNFTs.length > 0 ? (
                    personalOwnedNFTs.map((nft) => (
                      <p key={nft.metadata.id}>QTY: {nft.quantityOwned}</p>
                    ))
                  ) : (
                    <p>No NFTs owned.</p>
                  )
                )}
              </div>
              <p>Smart Wallet: {smartWalletAddress}</p>
              <Web3Button
                contractAddress={NFT_CONTRACT_ADDRESS}
                action={(contract) => contract.erc1155.claim(0, 1)}
              >Claim NFT</Web3Button>
              <div style={{ width: "100%", margin: "0 auto", textAlign: "center" }}>
                {!isSmartOwnedNFTsLoading && (
                  smartOwnedNFTs && smartOwnedNFTs.length > 0 ? (
                    smartOwnedNFTs.map((nft) => (
                      <p key={nft.metadata.id}>QTY: {nft.quantityOwned}</p>
                    ))
                  ) : (
                    <p>No NFTs owned.</p>
                  )
                )}
              </div>
            </div>
          </div>
            :
            <div className={styles.centeredContainer}>
              <div className={styles.centeredCard}>
                <h1>Login</h1>
                <p>Enter your email to login.</p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <button
                  onClick={handleLogin}
                >Login</button>
              </div>
            </div>
        }
      </div>
    </main>
  );
};

export default Home;
