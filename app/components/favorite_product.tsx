import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { ENDPOINTS, getApiUrl } from '../../config/api';
import { useFavoriteStore } from '../store/favoritesStore';

const FavoriteProduct = () => {
  const [products, setProducts] = useState<any[]>([]);
  const favorites = useFavoriteStore(state => state.favorites);

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

  const favoriteProducts = products.filter(product => favorites.includes(product._id));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {favoriteProducts.length > 0 ? (
          favoriteProducts.map(product => (
            <TouchableOpacity
              key={product._id}
              style={styles.card}
              onPress={() => {} /* Navigate to product details */}
            >
              <Card>
                <Card.Cover style={styles.productImage} source={{ uri: getApiUrl(product.image) }} />
                <Card.Content>
                  <Text style={styles.title}>{product.title}</Text>
                  <Text style={styles.price}>{product.price}€</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Nuk ka produkte të preferuara.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    flex: 1,
  },
  card: {
    marginBottom: 15,
  },
  productImage: {
    height: 170,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'red',
  },
});

export default FavoriteProduct;
