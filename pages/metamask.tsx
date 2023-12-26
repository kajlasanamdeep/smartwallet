import { ChainId, ConnectWallet, SmartWallet, Web3Button, embeddedWallet, metamaskWallet, smartWallet, useAddress, useConnect, useContract, useOwnedNFTs } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import { ACCOUNT_FACTORY_ADDRESS, NFT_CONTRACT_ADDRESS } from "../constants/addresses";
import { useState } from "react";
import { ethers } from "ethers";
import Image from "next/image";

const embeddedWalletConfig = embeddedWallet({});

const metamaskWalletConfig = metamaskWallet();

const smartWalletConfig = smartWallet(embeddedWalletConfig, {
    factoryAddress: ACCOUNT_FACTORY_ADDRESS,
    gasless: true,
});

const Home: NextPage = () => {
    const address = useAddress();
    const connect = useConnect();

    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [toAddress, setToAddress] = useState<string | undefined>(undefined);
    const [smartWallet, setSmartWallet] = useState<SmartWallet | undefined>(undefined);
    const [personalWalletAddress, setPersonalWalletAddress] = useState<string | undefined>(undefined);
    const [smartWalletAddress, setSmartWalletAddress] = useState<string | undefined>(undefined);

    const handleLoginMetamask = async () => {
        try {
            setIsLoading(true);
            const personalWallet = await connect(metamaskWalletConfig);
            const personalWalletAddress = await personalWallet.getAddress();
            setPersonalWalletAddress(personalWalletAddress);

            const smartWallet = await connect(smartWalletConfig, {
                personalWallet: personalWallet,
                chainId: ChainId.Goerli,
            });
            setSmartWallet(smartWallet);
            const smartWalletAddress = await smartWallet.getAddress();
            setSmartWalletAddress(smartWalletAddress);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    const transferFunds = async () => {
        try {
            if (Number(amount) <= 0) {
                throw new Error('Amount must be greater than zero !')
            }
            
            setIsLoading(true);
            if (smartWallet) {
                await smartWallet.deployIfNeeded();
                const tx = await smartWallet.sendRaw({
                    to: `${toAddress}`,
                    chainId: ChainId.Goerli,
                    gasLimit: 3000000,
                    value: ethers.utils.parseEther(`${amount}`)
                });
                const receipt = await tx.wait();
                console.log(receipt, "transaction receipt");
            } else {
                throw new Error('Please connect smart wallet !')
            }
            setIsLoading(false);
        } catch (error: Error | any) {
            console.log(error, "error");
            setIsLoading(false);
            alert(error?.message)
        }
    }
    if (isLoading) {
        return (
            <div className={styles.centeredContainer}>
                <Image src="/images/loading.gif" alt="loading" width={200} height={200} className="loading" />
            </div>
        )
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {
                    address ?
                        <div className={styles.centeredContainer}>
                            <div className={styles.centeredCard}>
                                <ConnectWallet auth={{
                                    onLogout: () => {
                                        window.location.reload()
                                    }
                                }} dropdownPosition={{
                                    side: "bottom",
                                    align: "center"
                                }} />
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    transferFunds()
                                }}>
                                    <h2 style={{ textAlign: "center" }}>TRANSFER FUNDS</h2>
                                    <label>Wallet Address :</label>
                                    <input value={toAddress} type="text" placeholder="Enter Wallet Address" minLength={20} onChange={(e) => setToAddress(e.target.value)} required />
                                    <label>Amount in ETH :</label>
                                    <input value={amount} placeholder="Enter Amount in ETH" type="text" onChange={(e) => {
                                        if (!isNaN(Number(e.target.value))) {
                                            setAmount(e.target.value)
                                        }
                                        else if (!isNaN(Number(e.target.value)) && e.target.value.endsWith(".")) {
                                            setAmount(e.target.value)
                                        }
                                        else {
                                            setAmount("")
                                        }
                                    }} required />
                                    <button type="submit">Transfer</button>
                                </form>
                            </div>
                        </div>
                        :
                        <div className={styles.centeredContainer}>
                            <div className={styles.centeredCard}>
                                <h1 style={{ textAlign: "center" }}>Login With Metamask !</h1>
                                <p style={{ textAlign: "center" }}>Click below button to login.</p>
                                <button
                                    onClick={handleLoginMetamask}
                                >Login</button>
                            </div>
                        </div>
                }
            </div>
        </main>
    );
};

export default Home;
