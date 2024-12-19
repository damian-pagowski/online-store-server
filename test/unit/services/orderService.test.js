const { checkout, getOrderHistory, getOrderById } = require('../../../services/orderService');
const { getCart, deleteCart } = require('../../../services/cartService');
const { getProductsByIds } = require('../../../services/productService');
const Order = require('../../../models/order');
const { NotFoundError, ValidationError, DatabaseError } = require('../../../utils/errors');

jest.mock('../../../services/cartService');
jest.mock('../../../services/productService');
jest.mock('../../../models/order');

describe('Order Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
      });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkout', () => {
        it('should create an order successfully and clear the cart', async () => {
            // Arrange
            const username = 'testuser';
            const cart = { '1': 2, '2': 1 };
            const products = [
                { productId: 1, name: 'Product 1', price: 10 },
                { productId: 2, name: 'Product 2', price: 20 }
            ];
            const createdOrder = { _id: 'orderId123' };

            getCart.mockResolvedValueOnce(cart);
            getProductsByIds.mockResolvedValueOnce(products);
            Order.create.mockResolvedValueOnce(createdOrder);
            deleteCart.mockResolvedValueOnce();

            // Act
            const result = await checkout(username);

            // Assert
            expect(result).toEqual({ message: 'Order created successfully', orderId: createdOrder._id });
            expect(getCart).toHaveBeenCalledWith(username);
            expect(getProductsByIds).toHaveBeenCalledWith([1, 2]);
            expect(Order.create).toHaveBeenCalledWith(expect.objectContaining({
                username,
                items: expect.arrayContaining([
                    expect.objectContaining({ productId: '1', quantity: 2 }),
                    expect.objectContaining({ productId: '2', quantity: 1 })
                ])
            }));
            expect(deleteCart).toHaveBeenCalledWith(username);
        });

        it('should throw ValidationError if cart is empty', async () => {
            // Arrange
            const username = 'testuser';
            getCart.mockResolvedValueOnce(null);

            // Act & Assert
            await expect(checkout(username)).rejects.toThrow(ValidationError);
        });

        it('should throw DatabaseError if database operation fails', async () => {
            // Arrange
            const username = 'testuser';
            getCart.mockResolvedValueOnce({ '1': 2 });
            getProductsByIds.mockRejectedValueOnce(new Error('DB error'));

            // Act & Assert
            await expect(checkout(username)).rejects.toThrow(DatabaseError);
        });
    });

    describe('getOrderHistory', () => {
        it('should return order history for a user', async () => {
            const username = 'testuser';
            const orders = [{ _id: 'orderId123', items: [], totalPrice: 100 }];
            
            Order.find.mockReturnThis(); 
            Order.sort = jest.fn().mockResolvedValueOnce(orders); 
        
            // Act
            const result = await getOrderHistory(username);
        
            // Assert
            expect(result).toEqual(orders);
            expect(Order.find).toHaveBeenCalledWith({ username });
            expect(Order.sort).toHaveBeenCalledWith({ createdAt: -1 });
        });

        it('should throw NotFoundError if no orders are found', async () => {
            // Arrange
            const username = 'testuser';
            Order.find.mockReturnThis(); 
            Order.sort = jest.fn().mockResolvedValueOnce([]); 
            // Act & Assert
            await expect(getOrderHistory(username)).rejects.toThrow(NotFoundError);
        });

        it('should throw DatabaseError if database query fails', async () => {
            // Arrange
            const username = 'testuser';
            Order.find.mockReturnThis(); 
            Order.sort = jest.fn().mockRejectedValueOnce(new Error('DB error')); 

            // Act & Assert
            await expect(getOrderHistory(username)).rejects.toThrow(DatabaseError);
        });
    });

    describe('getOrderById', () => {
        it('should return the order by id for the given user', async () => {
            // Arrange
            const orderId = 'orderId123';
            const username = 'testuser';
            const order = { _id: orderId, items: [], totalPrice: 100 };
            Order.findOne.mockResolvedValueOnce(order);

            // Act
            const result = await getOrderById(orderId, username);

            // Assert
            expect(result).toEqual(order);
            expect(Order.findOne).toHaveBeenCalledWith({ _id: orderId, username });
        });

        it('should throw NotFoundError if the order does not exist', async () => {
            // Arrange
            const orderId = 'orderId123';
            const username = 'testuser';
            Order.findOne.mockResolvedValueOnce(null);

            // Act & Assert
            await expect(getOrderById(orderId, username)).rejects.toThrow(NotFoundError);
        });

        it('should throw DatabaseError if database query fails', async () => {
            // Arrange
            const orderId = 'orderId123';
            const username = 'testuser';
            Order.findOne.mockRejectedValueOnce(new Error('DB error'));

            // Act & Assert
            await expect(getOrderById(orderId, username)).rejects.toThrow(DatabaseError);
        });
    });
});