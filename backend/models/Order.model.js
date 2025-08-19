import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, default: '' },
  title: { type: String, default: '' },
  quantity: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  lineTotal: { type: Number, default: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  nr: { type: String, default: '' },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  selectedPayment: { type: String, default: '' },
  cart: { type: [cartItemSchema], default: [] },
  orderTotal: { type: Number, default: 0 },
}, { timestamps: true });

const OrderModel = mongoose.model('orders', orderSchema);
export default OrderModel;
