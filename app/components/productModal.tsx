import React from 'react';
import { Button, Image, Modal, StyleSheet, Text, View } from 'react-native';

type ProductModalProps = {
  visible: boolean;
  product: any;
  onClose: () => void;
};

const ProductModal = ({ visible, product, onClose }: ProductModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Image style={styles.productImage} source={{ uri: product.image }} />
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productPrice}>{product.price}€</Text>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 20,
  },
});

export default ProductModal;
