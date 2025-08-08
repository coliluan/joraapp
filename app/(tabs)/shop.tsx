import { globalStyles } from '@/assets/globalStyles';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, Text } from 'react-native-paper';
import { ENDPOINTS, getApiUrl } from '../../config/api';
import LoginModal from '../components/loginModal';
import ProductModal from '../components/productModal';
import { useCartStore } from '../store/cartStore';
import { useFavoriteStore } from '../store/favoritesStore';
import { useUserStore } from '../store/useUserStore';

const Shop = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Te gjitha');
  const { user, isLoggedIn, loadUserFromStorage } = useUserStore();
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const { cart, addToCart } = useCartStore(state => state); 
  const loadFavorites = useFavoriteStore(state => state.loadFavorites);

  // Merr favorite global dhe funksion toggle nga zustand store
  const favorites = useFavoriteStore(state => state.favorites);
  const toggleFavorite = useFavoriteStore(state => state.toggleFavorite);

  // Load user
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadFavorites();  // Ngarko favorite nga backend
    }
  }, [isLoggedIn]);

  // Fetch products
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

  // Sync quantities me cart store
  useEffect(() => {
    const initialQuantities: { [productId: string]: number } = {};
    cart.forEach(item => {
      initialQuantities[item.productId] = item.quantity;
    });
    setQuantities(initialQuantities);
  }, [cart]);

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
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const changeQuantity = (productId: string, type: 'increase' | 'decrease') => {
  const currentQuantity = quantities[productId] ?? 0;
  const newQuantity = type === 'increase' ? currentQuantity + 1 : Math.max(0, currentQuantity - 1);

  setQuantities(prev => ({
    ...prev,
    [productId]: newQuantity,
  }));

  // ✅ Update Zustand state separately (after setting quantities)
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
      <ScrollView style={styles.container}>
        {/* Notification icon */}
        <View style={globalStyles.notification}>
          <TouchableOpacity
            onPress={() => {
              if (!user?.isGuest && user?.firstName) {
                router.push('/components/notificationModal');
              }
            }}
            disabled={user?.isGuest || !user?.firstName}
          >
            <Image source={require('../../assets/images/notification.png')} />
          </TouchableOpacity>
        </View>
        <View style={globalStyles.notification}>
          <TouchableOpacity
            onPress={() => router.push('../components/favorite_product')}
          >
            <Image style={styles.favoriteIcon} source={require('../../assets/images/favorite-icon.png')} />
          </TouchableOpacity>
        </View>
        

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Kërko produkte..."
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {/* Sort/Filter */}
        <View style={styles.sortFilterContainer}>
          <TouchableOpacity style={styles.button}>
            <Text>Sort</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoryContainer}>
          {['Te gjitha', 'Ushqimore', 'Vendore', 'Higjenike'].map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => handleCategoryClick(category)}
            >
              <Text
                style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
              
              >{category}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
                    <Text style={styles.title}>{product.title}</Text>
                    <Text style={styles.price}>{product.price}€</Text>
                  </Card.Content>
                  <Card.Actions style={styles.quantityContainer}>
                    <View style={styles.quantityButtons}>
                      <View style={styles.leftSection}>
                        <TouchableOpacity
                          style={styles.counter}
                          onPress={() => changeQuantity(product._id, 'decrease')}
                        >
                          <Text>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantity}>
                          {quantities[product._id] || 0}
                        </Text>
                        <TouchableOpacity
                          style={styles.counter}
                          onPress={() => changeQuantity(product._id, 'increase')}
                        >
                          <Text>+</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.rightSection}>
                      <TouchableOpacity
                        style={styles.buttonFavorite}
                        onPress={() => toggleFavorite(product._id)}
                      >
                        <Image
                          style={styles.favorite}
                          source={
                            favorites.includes(product._id)
                              ? require('../../assets/images/favorite-selected.png')
                              : require('../../assets/images/favorite.png')
                          }
                        />
                      </TouchableOpacity>
                    </View>
                    </View>
                    <View style={styles.cartButton}>
                      <TouchableOpacity
                        style={styles.buttonCart}
                        onPress={() => addToCart(product._id, quantities[product._id] || 0)}
                      >
                        <Text style={{ color: 'white' }}>Shto në Shportë</Text>
                      </TouchableOpacity>
                    </View>
                  </Card.Actions>
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

  // ✅ Corrected pathname
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
        <ProductModal visible={modalVisible} product={selectedProduct} onClose={closeModal} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    position: 'relative',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 170,
    paddingHorizontal: 40,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    resizeMode: 'contain',
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
  top: 700,
  left: 250,
  right: 0,
  alignItems: 'center',
  zIndex: 1000,
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
    width: 50,
    borderRadius: '100%',
    height: 50,
    backgroundColor: 'red'
  }
});

export default Shop;
