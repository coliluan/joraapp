import { globalStyles } from '@/assets/globalStyles';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-paper';
import { ENDPOINTS, getApiUrl } from '../../config/api';
import LoginModal from '../components/loginModal';
import OrderLocationModal from '../components/OrderLocationModal';
import ProductModal from '../components/productModal';
import { useCartStore } from '../store/cartStore';
import { useFavoriteStore } from '../store/favoritesStore';
import { useUserStore } from '../store/useUserStore';

const Shop = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [orderLocationVisible, setOrderLocationVisible] = useState(true); // hapet default kur hyjmë në shop
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Te gjitha');
  const { user, isLoggedIn, loadUserFromStorage } = useUserStore();
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const { cart, addToCart } = useCartStore(state => state);
  const loadFavorites = useFavoriteStore(state => state.loadFavorites);
  const [city, setCity] = useState('');
  const favorites = useFavoriteStore(state => state.favorites);
  const toggleFavorite = useFavoriteStore(state => state.toggleFavorite);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadFavorites();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(getApiUrl(ENDPOINTS.PRODUCTS));
        const data = await response.json();
        if (Array.isArray(data.products)) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const initialQuantities: { [productId: string]: number } = {};
    cart.forEach(item => {
      initialQuantities[item.productId] = item.quantity;
    });
    setQuantities(initialQuantities);
  }, [cart]);

  const handleSave = (location: { city: string }) => {
    setCity(location.city);
    setOrderLocationVisible(false);
  };

  const handleCancel = () => {
    setOrderLocationVisible(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterProducts(query, selectedCategory);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    filterProducts(searchQuery, category);
  };

  const filterProducts = (query: string, category: string) => {
    let filtered = products;

    if (query) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category && category !== 'Te gjitha') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setProductModalVisible(true);
  };
  const closeProductModal = () => {
    setSelectedProduct(null);
    setProductModalVisible(false);
  };

  const changeQuantity = (productId: string, type: 'increase' | 'decrease') => {
    const currentQuantity = quantities[productId] ?? 0;
    const newQuantity = type === 'increase' ? currentQuantity + 1 : Math.max(0, currentQuantity - 1);

    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity,
    }));

    addToCart(productId, newQuantity);
  };

  if (user?.isGuest || !isLoggedIn) {
    return <LoginModal />;
  }

  const totalPrice = useMemo(() => {
    let total = 0;
    for (const productId in quantities) {
      const quantity = quantities[productId];
      const product = products.find(p => p._id === productId);
      if (product && quantity > 0) {
        total += quantity * parseFloat(product.price);
      }
    }
    return total.toFixed(2);
  }, [quantities, products]);

  return (
    <SafeAreaView>
      <OrderLocationModal
        visible={orderLocationVisible}
        onSave={handleSave}
        onCancel={handleCancel}
        userId={user?._id ?? ''}
      />

      <ScrollView style={styles.container}>
        <View><Text style={styles.header}>Shop at Jora Center</Text></View>
          
        {/* Product cards */}
        <View style={styles.cardContainer}>
           {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <TouchableOpacity
                key={product._id}
                style={styles.card}
                onPress={() => handleProductClick(product)} 
              >
                <Card>
                  <Card.Cover
                    style={styles.productImage}
                    source={{ uri: getApiUrl(product.image) }}
                  />
                  <Card.Content>
                    <View>
                      <Text style={styles.title}>{product.title}</Text>
                    </View>
                    <View>
                      <Text style={styles.title}>Vetem</Text>
                      <Text style={styles.price}>{product.price}€</Text>
                    </View>
                    
                    
                  </Card.Content>
                  {/* <Card.Actions style={styles.quantityContainer}>
                    <View style={styles.cartButton}>
                      <TouchableOpacity
                        style={styles.buttonCart}
                        onPress={() => {
                          const qty = quantities[product._id] || 0;
                          const finalQty = Math.max(1, qty);
                          addToCart(product._id, finalQty);
                        }}
                      >
                        <Text style={{ color: 'white' }}>Shto në Shportë</Text>
                      </TouchableOpacity>
                    </View>
                  </Card.Actions> */}
                </Card>
               </TouchableOpacity>
            ))
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>Nuk ka produkte.</Text>
          )}
        </View>        
      </ScrollView>
      <View style={styles.fixedCartButtonContainer}>
        <TouchableOpacity
  style={styles.fixedCartButton}
  onPress={() => {
  const selectedProducts = Object.entries(quantities)
    .filter(([productId, qty]) => qty > 0)
    .map(([productId, qty]) => {
      const product = products.find(p => p._id === productId);
      if (product) {
        return {
          ...product,
          quantity: qty,
        };
      }
      return null;
    })
    .filter(Boolean);

  router.push({
    pathname: '../components/store',
    params: {
      data: JSON.stringify(selectedProducts),
    },
  });
}}
>
          <Image style={styles.cartImage} source={require('../../assets/images/shopping.png')} />
          <Text style={styles.fixedCartButtonText}>
             {totalPrice}€</Text>
        </TouchableOpacity>
      </View>

      {selectedProduct && (
        <ProductModal 
          visible={productModalVisible} 
          packageId={selectedProduct._id}  
          onClose={closeProductModal} 
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    position: 'relative',
    zIndex: 2,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 90,
  },
  card: {
    width: '48%',
    marginBottom: 10,
    zIndex: 1,
  },
  productImage: {
    width: '100%',
    height: 170,
    paddingHorizontal: 40,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    resizeMode: 'contain',
    zIndex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'red',
    margin: 0,
  },
  quantityContainer: {
    paddingHorizontal: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  quantityButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    marginBottom: 10,
  },
  leftSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    width: '70%',
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 8,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '30%',
    height: 40,
  },
  buttonFavorite: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    width: 35,
    borderWidth: 1,
    borderColor: 'red',
    height: 35,
    paddingTop: 6,
    paddingHorizontal: 11,
  },
  favorite: {
    width: 35,
    height: 35,
  },
  counter: {
    width: 40,
    borderRadius: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  cartButton: {
    width: '100%',
    alignItems: 'center',
  },
  buttonCart: {
    backgroundColor: 'red',
    width: '100%',
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
  },
  sortFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 30,
  },
  selectedCategory: {
    backgroundColor: 'red',
  },
  categoryText: {
    fontSize: 14,
  },
  selectedCategoryText: {
    color: 'white',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  clearFiltersButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  fixedCartButtonContainer: {
  position: 'absolute',
  // top: 700,
  // left: 250,
  bottom: 100,
  right: 10,
  alignItems: 'center',
  zIndex: 10,
},

fixedCartButton: {
  backgroundColor: 'red',
  paddingVertical: 12,
  paddingHorizontal: 15,
  borderRadius: 30,
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  display: 'flex',
  flexDirection:'row',
  alignItems: 'center',
  zIndex: 10,
},

fixedCartButtonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
  justifyContent: 'center',
  alignItems:'center',
},
cartImage: {
  width: 30,
  height: 30,
},

  favoriteIcon:{
    width: 40,
    borderRadius: 100,
    height: 40,
    backgroundColor: 'red'
  },

  header: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 30,
    color: '#171717',
  },
});

export default Shop;