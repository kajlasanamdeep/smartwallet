import { ConnectWallet, embeddedWallet, useAddress, useConnect, ChainId, smartWallet, SmartWallet } from "@thirdweb-dev/react";
import { EmbeddedWallet } from "@thirdweb-dev/wallets";
import { Goerli } from "@thirdweb-dev/chains";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import Image from "next/image";
import { ACCOUNT_FACTORY_ADDRESS, NFT_CONTRACT_ADDRESS } from "../constants/addresses";
import { useState } from "react";
import { ethers, providers } from "ethers";
import OtpInput from 'react-otp-input';
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
  const [amount, setAmount] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toAddress, setToAddress] = useState<string | undefined>(undefined);
  const [smartWallet, setSmartWallet] = useState<SmartWallet | undefined>(undefined);

  const handleSendOtp = async () => {
    try {
      if (!emailInput || !(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(emailInput))) {
        alert("Valid Email is required !");
        return;
      }
      setIsLoading(true);
      await wallet.sendVerificationEmail({
        email: emailInput
      });
      setVerifying(true);
      setIsLoading(false)
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const authResult = await wallet.authenticate({
        strategy: "email_verification",
        verificationCode: otpInput,
        email: emailInput
      });
      console.log("Authenticated with", authResult.user);
      const personalWalletAddress = await wallet.connect({ authResult });
      console.log("personalWalletAddress", personalWalletAddress);
      const smartWallet = await connect(smartWalletConfig, {
        personalWallet: wallet,
        chainId: ChainId.Goerli,
      });
      setSmartWallet(smartWallet);
      console.log("smartWallet", smartWallet);
      const smartWalletAddress = await smartWallet.getAddress();
      console.log("smartWalletAddress", smartWalletAddress);
      setVerifying(false);
      setIsLoading(false);
      setEmailInput("");
      setOtpInput("");
    } catch (error: any) {
      console.error(error);
      setIsLoading(false);
      alert(error?.message)
    }
  };

  if (isLoading) {
    return (
      <div className={styles.centeredContainer}>
        <Image src="/images/loading.gif" alt="loading" width={200} height={200} className="loading" />
      </div>
    )
  }

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
              {
                verifying ?
                  <div className={styles.centeredCard}>
                    <h1>Verify Your Email !</h1>
                    <p>Enter otp to login.</p>
                    <form style={{ width: "100%" }} onSubmit={(e) => {
                      e.preventDefault();
                      handleLogin()
                    }}>
                      {/* <OtpInput
                        value={otpInput}
                        onChange={setOtpInput}
                        numInputs={6}
                        renderSeparator={<span></span>}
                        renderInput={(props) => <input {...props}
                          required
                          maxLength={6}
                          minLength={6}
                        />}
                      /> */}
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        maxLength={6}
                        minLength={6}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        required
                      />
                      <button type="submit">Login</button>
                    </form>
                  </div>
                  :
                  <div className={styles.centeredCard}>
                    <h1>Login With Email !</h1>
                    <p>Enter valid email to Verify.</p>
                    <form style={{ width: "100%" }} onSubmit={(e) => {
                      e.preventDefault()
                      handleSendOtp()
                    }}>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                      />
                      <button
                        type="submit"
                      >Verify</button>
                    </form>
                  </div>
              }
            </div>
        }
      </div>
    </main>
  );
};

export default Home;
