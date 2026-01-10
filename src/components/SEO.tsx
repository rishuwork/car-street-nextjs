import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: object;
}

const defaultMeta = {
  title: 'Car Street - Quality Used Cars in Langton, Ontario',
  description: 'We are certified used car dealers in Langton. Browse our pre-owned vehicles today & drive home your favourite! Contact us.',
  keywords: 'used cars Langton, pre-owned vehicles, car dealership Ontario, quality used cars, certified used cars, car financing, used cars Brampton, used cars Mississauga, auto financing Toronto, GTA car dealership',
  image: 'https://carstreet.ca/og-image.jpg',
  url: 'https://carstreet.ca',
};

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  jsonLd,
}: SEOProps) {
  const seo = {
    title: title ? `${title} | Car Street` : defaultMeta.title,
    description: description || defaultMeta.description,
    keywords: keywords || defaultMeta.keywords,
    image: image || defaultMeta.image,
    url: url || defaultMeta.url,
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seo.title}</title>
      <meta name="title" content={seo.title} />
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <link rel="canonical" href={seo.url} />

      {/* Open Graph / Facebook */}
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Car Street" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}