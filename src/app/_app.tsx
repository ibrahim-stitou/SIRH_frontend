import { SessionProvider } from "next-auth/react";
//@ts-ignore
function App({ Component, pageProps }) {
  return (
    <SessionProvider
      refetchInterval={60 * 60}
      refetchOnWindowFocus={false}
    >
        <Component {...pageProps} />
    </SessionProvider>
  );
}

export default App;