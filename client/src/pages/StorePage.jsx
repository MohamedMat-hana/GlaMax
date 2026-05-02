/**
 * StorePage.jsx — Main client-facing storefront.
 * Renders Header → StoriesBar → ProductGrid → Footer + floating ChatBubble.
 */

import Header      from '../components/layout/Header';
import Footer      from '../components/layout/Footer';
import StoriesBar  from '../components/stories/StoriesBar';
import ProductGrid from '../components/products/ProductGrid';
import ChatBubble  from '../components/chat/ChatBubble';
import { useProducts } from '../hooks/useProducts';
import { useStories }  from '../hooks/useStories';
import '../styles/global.css';

export default function StorePage() {
  const { products, loading: pLoading, error: pError } = useProducts();
  const { stories,  loading: sLoading }                = useStories();

  return (
    <>
      <Header />

      <main>
        {!sLoading && <StoriesBar stories={stories} />}
        <ProductGrid products={products} loading={pLoading} error={pError} />
      </main>

      <Footer />

      {/* Floating chat button */}
      <ChatBubble />
    </>
  );
}
