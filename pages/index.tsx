import { ConnectWallet, useAddress, useConnect, ChainId, embeddedWallet } from "@thirdweb-dev/react";
import { EmbeddedWallet } from "@thirdweb-dev/wallets";
import { Goerli } from "@thirdweb-dev/chains";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import Image from "next/image";
import { useState } from "react";
import OtpInput from 'react-otp-input';
const wallet = new EmbeddedWallet({
  clientId: `${process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}`,
  chain: Goerli,
});

const embeddedWalletConfig = embeddedWallet({
  auth: {
    options: ['email']
  }
})
const Home: NextPage = () => {
  const address = useAddress();
  const connect = useConnect();
  const [otpInput, setOtpInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      await connect(embeddedWalletConfig, {
        authResult
      })
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
                }}
                  dropdownPosition={{
                    side: "bottom",
                    align: "center"
                  }} />
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
