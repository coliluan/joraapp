import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { ENDPOINTS, getApiUrl } from '../../config/api';
import { useFavoriteStore } from '../store/favoritesStore';

const FavoriteProduct = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [quantityById, setQuantityById] = useState<{ [key: string]: number }>({});
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

  const handleIncrease = (id: string) => {
    setQuantityById(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleDecrease = (id: string) => {
    setQuantityById(prev => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }));
  };

  const favoriteProducts = products.filter(product => favorites.includes(product._id));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {favoriteProducts.length > 0 ? (
          favoriteProducts.map(product => {
            const quantity = quantityById[product._id] || 0;
            const total = (quantity * parseFloat(product.price)).toFixed(2);
            return (
              <TouchableOpacity key={product._id} style={styles.card}>
                <Card style={styles.cardContent}>
                  <View style={styles.row}>
                    {/* Left: Image + title/price */}
                    <View style={styles.leftSection}>
                      <View>
                        <Card.Cover style={styles.image} source={{ uri: getApiUrl(product.image) }} />
                      </View>
                      <View style={styles.productContent}>
                        <Text style={styles.title}>{product.title}</Text>
                        <Text style={styles.price}>{product.price}€</Text>
                      </View>
                    </View>

                    <View style={styles.rightSection}>
                      <TouchableOpacity onPress={() => handleDecrease(product._id)} style={styles.counter}>
                        <Text style={styles.counterText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{quantity}</Text>
                      <TouchableOpacity onPress={() => handleIncrease(product._id)} style={styles.counter}>
                        <Text style={styles.counterText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                    
                   <Text style={styles.totalText}>Total: {total}€</Text>
               </Card>
              </TouchableOpacity>
            );
          })
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
  },
  card: {
    padding: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 10,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    
  },
  image: {
    height: 60,
    width: 50,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  productContent: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: 'black',
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'red',
  },
  counter: {
    backgroundColor: 'red',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  counterText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
    marginHorizontal: 6,
  },
  totalText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    color: 'black',
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});


export default FavoriteProduct;
