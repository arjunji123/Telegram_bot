import '../styles/globals.css';
import Head from 'next/head';
import Layout from '../components/Layout';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Head>
        <link href="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/css/blum-deba4c.webflow.c7f330fd6.css" rel="stylesheet" type="text/css" />
        <link href="https://fonts.googleapis.com" rel="preconnect"></link>
        <link href="https://fonts.gstatic.com" rel="preconnect" crossorigin="anonymous"></link>
        <script type="text/javascript" async="" src="//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" type="text/javascript"></script>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:regular,500,600,700,800,900%7CInter:100,200,300,regular&amp;subset=latin,latin-ext" media="all"></link>
        <style jsx global>{`
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`}</style>
      </Head>
      <Script
        src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=65b6a1a4a0e2af577bccce96"
        type="text/javascript"
        strategy="afterInteractive"
        integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
        crossOrigin="anonymous"
      ></Script>

      <Script
        src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/js/webflow.5eb91b5d2.js"
        type="text/javascript"
        strategy="afterInteractive"
      ></Script>
      <Script
  src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/js/webflow.js"
  strategy="afterInteractive"
/>

      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
