import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ENDPOINTS, getApiUrl } from '../../config/api';
import { useCartStore } from '../store/cartStore';

const Store = () => {
  const cart = useCartStore(state => state.cart);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(getApiUrl(ENDPOINTS.PRODUCTS));
        const data = await response.json();
        if (Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Filtron artikujt me quantity > 0 dhe i bashkon me info të produktit
  const cartDetails = cart
    .filter(item => item.quantity > 0)
    .map(item => {
      const product = products.find(p => p._id === item.productId);
      return {
        ...item,
        title: product?.title || 'Produkt i panjohur',
        price: product?.price || 0,
      };
    });

  // Totali i shportës
  const total = cartDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Produkte në Shportë:</Text>
      {cartDetails.length === 0 ? (
        <Text>Shporta është bosh.</Text>
      ) : (
        <>
          {cartDetails.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text>Sasia: {item.quantity}</Text>
              <Text>Çmimi: {item.price} €</Text>
              <Text>Totali: {(item.price * item.quantity).toFixed(2)} €</Text>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Totali Gjithsej: {total.toFixed(2)} €</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  itemContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 10,
  },
  title: { fontSize: 18, fontWeight: '600' },
  totalContainer: { marginTop: 20, borderTopWidth: 1, borderColor: '#aaa', paddingTop: 10 },
  totalText: { fontSize: 20, fontWeight: 'bold' },
});

export default Store;
