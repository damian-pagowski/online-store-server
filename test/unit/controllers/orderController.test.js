const { checkoutHandler, getOrderHistoryHandler, getOrderByIdHandler } = require('../../../controllers/orderController');
const { checkout, getOrderHistory, getOrderById } = require('../../../services/orderService');
const { mockRequest, mockResponse } = require('../../testUtil');
const { NotFoundError, DatabaseError } = require('../../../utils/errors');

jest.mock('../../../services/orderService'); // Mock the orderService

describe('Order Controller Tests', () => {

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    describe('checkoutHandler', () => {

        it('should checkout successfully and return 201 status', async () => {
            // Arrange
            const username = 'testuser';
            const req = mockRequest({ currentUser: { username } });
            const res = mockResponse();
            const next = jest.fn();
            const mockCheckoutResponse = { message: 'Order created successfully', orderId: 'orderId123' };

            checkout.mockResolvedValueOnce(mockCheckoutResponse);

            // Act
            await checkoutHandler(req, res, next);

            // Assert
            expect(checkout).toHaveBeenCalledWith(username);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockCheckoutResponse);
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error if checkout service fails', async () => {
            // Arrange
            const username = 'testuser';
            const req = mockRequest({ currentUser: { username } });
            const res = mockResponse();
            const next = jest.fn();
            const error = new DatabaseError('Failed to create order');

            checkout.mockRejectedValueOnce(error);

            // Act
            await checkoutHandler(req, res, next);

            // Assert
            expect(checkout).toHaveBeenCalledWith(username);
            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('getOrderHistoryHandler', () => {

        it('should return order history for a user', async () => {
            // Arrange
            const username = 'testuser';
            const req = mockRequest({ currentUser: { username } });
            const res = mockResponse();
            const next = jest.fn();
            const mockOrders = [{ _id: 'orderId123', items: [], totalPrice: 100 }];

            getOrderHistory.mockResolvedValueOnce(mockOrders);

            // Act
            await getOrderHistoryHandler(req, res, next);

            // Assert
            expect(getOrderHistory).toHaveBeenCalledWith(username);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, orders: mockOrders });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error if getOrderHistory service fails', async () => {
            // Arrange
            const username = 'testuser';
            const req = mockRequest({ currentUser: { username } });
            const res = mockResponse();
            const next = jest.fn();
            const error = new DatabaseError('Failed to fetch order history');

            getOrderHistory.mockRejectedValueOnce(error);

            // Act
            await getOrderHistoryHandler(req, res, next);

            // Assert
            expect(getOrderHistory).toHaveBeenCalledWith(username);
            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('getOrderByIdHandler', () => {

        it('should return order details successfully', async () => {
            // Arrange
            const username = 'testuser';
            const orderId = 'orderId123';
            const req = mockRequest({ currentUser: { username }, params: { id: orderId } });
            const res = mockResponse();
            const next = jest.fn();
            const mockOrder = { _id: 'orderId123', items: [], totalPrice: 100 };

            getOrderById.mockResolvedValueOnce(mockOrder);

            // Act
            await getOrderByIdHandler(req, res, next);

            // Assert
            expect(getOrderById).toHaveBeenCalledWith(orderId, username);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, order: mockOrder });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error if getOrderById service fails', async () => {
            // Arrange
            const username = 'testuser';
            const orderId = 'orderId123';
            const req = mockRequest({ currentUser: { username }, params: { id: orderId } });
            const res = mockResponse();
            const next = jest.fn();
            const error = new NotFoundError('Order', orderId);

            getOrderById.mockRejectedValueOnce(error);

            // Act
            await getOrderByIdHandler(req, res, next);

            // Assert
            expect(getOrderById).toHaveBeenCalledWith(orderId, username);
            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

    });

});