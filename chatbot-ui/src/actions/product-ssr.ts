import { _products } from 'src/_mock/_product';

// ----------------------------------------------------------------------

export async function getProducts() {
  const products = _products();
  
  return {
    products,
  };
}

// ----------------------------------------------------------------------

export async function getProduct(id: string) {
  const products = _products();
  const product = products.find((p) => p.id === id);
  
  return {
    product,
  };
}
