import Head from 'next/head';

const SEO = ({ title }) => (
  <Head>
    <title>{title}</title>
    <meta name="description" content="Blum-like website built with Next.js" />
  </Head>
);

export default SEO;
