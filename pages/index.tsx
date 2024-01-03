import { ConnectWallet, embeddedWallet, useAddress, useConnect, ChainId, useEmbeddedWallet } from "@thirdweb-dev/react";
import { EmbeddedWallet } from "@thirdweb-dev/wallets";
import { Goerli } from "@thirdweb-dev/chains";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import Image from "next/image";
import { useState } from "react";
import { THIRDWEB_CLIENT_ID } from "../constants/addresses";
const wallet = new EmbeddedWallet({
  clientId: `${THIRDWEB_CLIENT_ID}`,
  chain: Goerli,
});

const Home: NextPage = () => {
  const address = useAddress();
  const connect = useConnect();
  const [isLoading, setIsLoading] = useState(false);
  const [id, setID] = useState("");

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const authResult = await wallet.authenticate({
        strategy: "auth_endpoint",
        payload: JSON.stringify({ userId: 1 }),
        encryptionKey: ""
      });
      await connect(embeddedWallet({}), {
        authResult
      });
      setIsLoading(false);
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
                  }}
                />
              </div>
            </div>
            :
            <div className={styles.centeredContainer}>
              {
                <div className={styles.centeredCard}>
                  <h1>Verify Your Self !</h1>
                  <p>Enter your Id .</p>
                  <form style={{ width: "100%" }} onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin()
                  }}>
                    <input
                      type="number"
                      placeholder="Enter ID"
                      value={id}
                      onChange={(e) => setID(e.target.value)}
                      required
                    />
                    <button type="submit">Login</button>
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
