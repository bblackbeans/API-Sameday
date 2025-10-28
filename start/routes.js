'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('welcome')

// API Documentation
Route.get('/docs', ({ response }) => {
  response.send('<h1>SameDay API v2 - Documentação</h1><p>Endpoint funcionando!</p>')
})

// Health check endpoint
Route.get('/health', ({ response }) => {
  response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})



function methodNotAllowed({
  response
}) {
  response.status(405)
  response.json({
    status: 'error',
    message: 'Method Not Allowed',
  })
}

Route.group('Shared With Platforms - No Authentication', () => {
  // Create User
  Route.post('user', 'UserController.postUser')

  // Login
  Route.post('auth/login', 'AuthController.login')
  Route.any('auth/login', methodNotAllowed)
  
  // Test user lookup
  Route.post('auth/test-user', 'AuthController.testUser')
  Route.get('auth/list-users', 'AuthController.listUsers')
  Route.post('auth/debug-password', 'AuthController.debugPassword')

  // Recover Password
  Route.post('recover_password', 'RecoverPasswordController.step_1')
  Route.post('recover_password/code/validate', 'RecoverPasswordController.step_2')
  Route.post('recover_password/change', 'RecoverPasswordController.step_3')
  Route.any('recover_password', methodNotAllowed)

  // Upload
  Route.post('upload', 'UploadController.upload')
  Route.any('upload', methodNotAllowed)
  Route.post('destroy', 'UploadController.destroy')
  Route.any('destroy', methodNotAllowed)

  // Shared
  Route.get('zipe_code', 'SharedController.getZipCode')
  Route.any('zipe_code', methodNotAllowed)

  // Get latitude and longitude through address
  Route.get('address/lat_lng', 'SharedController.getLatLngThroughAddress')
  Route.any('address/lat_lng', methodNotAllowed)

  Route.post('send/sms', 'SharedController.sensdSms')
  Route.any('send/sms', methodNotAllowed)

  // Partners Registration (Public)
  Route.post('partners/shippers', 'ShipperController.postShipper')
  Route.post('partners/carriers', 'CarrierController.postCarrier')
  Route.post('partners/stock-store', 'StockStorePartnerController.postStockStorePartner')
  Route.post('partners/contacts', 'ContactController.postContact')

  // Driver Registration and Authentication (Public)
  Route.post('drivers/register', 'DriverController.register')
  Route.post('drivers/login', 'DriverController.login')
  Route.post('drivers/forgot-password', 'DriverController.forgotPassword')
  Route.post('drivers/reset-password', 'DriverController.resetPassword')

  // Driver Profile and Documents (Requires Authentication)
  Route.get('drivers/profile', 'DriverController.getProfile').middleware(['auth:sameDay'])
  Route.put('drivers/profile', 'DriverController.updateProfile').middleware(['auth:sameDay'])
  Route.post('drivers/avatar', 'DriverController.uploadAvatar').middleware(['auth:sameDay'])
  Route.post('drivers/documents', 'DriverController.uploadDocument').middleware(['auth:sameDay'])
  Route.put('drivers/vehicle', 'DriverController.updateVehicleData').middleware(['auth:sameDay'])
  Route.put('drivers/payment', 'DriverController.updatePayment').middleware(['auth:sameDay'])
  Route.get('drivers/stats', 'DriverController.getStats').middleware(['auth:sameDay'])
  Route.put('drivers/change-password', 'DriverController.changePassword').middleware(['auth:sameDay'])
  Route.get('drivers/registration-status', 'DriverController.getRegistrationStatus').middleware(['auth:sameDay'])
  Route.post('drivers/complete-onboarding', 'DriverController.completeOnboarding').middleware(['auth:sameDay'])
  Route.get('drivers/notifications', 'DriverController.getNotifications').middleware(['auth:sameDay'])
  Route.put('drivers/notifications/:id/read', 'DriverController.markNotificationAsRead').middleware(['auth:sameDay'])
  Route.post('drivers/logout', 'DriverController.logout').middleware(['auth:sameDay'])

  // Deliveries (Requires Authentication)
  Route.get('deliveries/available', 'DeliveryController.getAvailable').middleware(['auth:sameDay'])
  Route.get('deliveries/:id', 'DeliveryController.getById').middleware(['auth:sameDay'])
  Route.post('deliveries/:id/accept', 'DeliveryController.accept').middleware(['auth:sameDay'])
  Route.post('deliveries/:id/reject', 'DeliveryController.reject').middleware(['auth:sameDay'])
  Route.put('deliveries/:id/status', 'DeliveryController.updateStatus').middleware(['auth:sameDay'])
  Route.post('deliveries/:id/pickup-photo', 'DeliveryController.uploadPickupPhoto').middleware(['auth:sameDay'])
  Route.post('deliveries/:id/delivery-photo', 'DeliveryController.uploadDeliveryPhoto').middleware(['auth:sameDay'])
  Route.post('deliveries/location', 'DeliveryController.updateLocation').middleware(['auth:sameDay'])
  Route.get('deliveries/history', 'DeliveryController.getHistory').middleware(['auth:sameDay'])
  Route.get('deliveries/summary', 'DeliveryController.getSummary').middleware(['auth:sameDay'])
  Route.get('deliveries/active', 'DeliveryController.getActive').middleware(['auth:sameDay'])
  Route.post('deliveries/:id/cancel', 'DeliveryController.cancel').middleware(['auth:sameDay'])
  Route.get('deliveries/driver/stats', 'DeliveryController.getDriverStats').middleware(['auth:sameDay'])
  Route.post('deliveries/:id/rate', 'DeliveryController.rate').middleware(['auth:sameDay'])

  // Location Services (Requires Authentication)
  Route.post('location/update', 'LocationController.update').middleware(['auth:sameDay'])
  Route.get('location/current', 'LocationController.getCurrent').middleware(['auth:sameDay'])
  Route.post('location/track-delivery', 'LocationController.trackDelivery').middleware(['auth:sameDay'])
  Route.get('location/nearby-deliveries', 'LocationController.getNearbyDeliveries').middleware(['auth:sameDay'])

  // Payments (Requires Authentication)
  Route.get('payments', 'PaymentController.getPayments').middleware(['auth:sameDay'])
  Route.get('payments/summary', 'PaymentController.getSummary').middleware(['auth:sameDay'])
  Route.get('payments/methods', 'PaymentController.getMethods').middleware(['auth:sameDay'])
  Route.post('payments/withdrawals', 'PaymentController.requestWithdrawal').middleware(['auth:sameDay'])

  // Notifications (Requires Authentication)
  Route.get('notifications', 'NotificationController.getNotifications').middleware(['auth:sameDay'])
  Route.put('notifications/:id/read', 'NotificationController.markAsRead').middleware(['auth:sameDay'])
  Route.get('notifications/settings', 'NotificationController.getSettings').middleware(['auth:sameDay'])

  // Email Testing (Development only)
  Route.get('email/test', 'EmailController.testEmail')
  Route.post('email/test', 'EmailController.sendTestEmail')
  Route.post('email/send', 'EmailController.sendCustomEmail')

  // Site Email Integration
  Route.post('api/send-email', 'SiteEmailController.sendEmail')
  Route.get('api/send-email/test', 'SiteEmailController.testEndpoint')

  // Adjust later
  Route.get('schedule/driver-raffle', 'DriverRaffleTaskController.index')
  Route.get('schedule/status-invoice', 'IuguInvoiceStatusTaskController.index')
  Route.get('schedule/start', 'ScheduleController.start')

}).prefix('v2')

// APP
Route.group('APP - No Authentication', () => {
  // User
  Route.get('user/:id', 'RedoUserController.show')
  Route.put('user/avatar/:id', 'RedoUserController.updateAvatar')
  Route.put('user/driver/status/:id', 'RedoUserController.updateStatus')
  Route.get('user/driver/status/:id', 'RedoUserController.getDriverStatus')
  Route.put('user/driver/update/player/:userId', 'UserController.updateOneSignalPlayerId')
  Route.any('user', methodNotAllowed)

  // Orders
  Route.resource('orders', 'RedoOrderController').apiOnly()
  Route.get('order/items/:id', 'RedoOrderController.showItems')
  Route.post('orders/send/sms/:id', 'RedoOrderController.sendSms')
  Route.get('orders/pending/:id', 'RedoOrderController.getPendingOrder').middleware(['auth:sameDay'])
  Route.put('orders/finish/:id', 'RedoOrderController.finishOrder')
  Route.get('orders/driver/:idDriver', 'RedoOrderController.getOrdersDriver')
  Route.get('order/driver/:idDriver/view/:idOrder', 'RedoOrderController.getOrderView')
  Route.put('order/verification/code/collect_or_destination', 'OrderController.verificationCodeCollectAndDestination')
  
  Route.any('orders', methodNotAllowed)

  // Order Driver
  Route.get('driver-order/delivery-status', 'DriverOrderController.getDeliveryStatus')
  Route.get('driver-order/delivery-fail-status', 'DriverOrderController.getDeliveryFailStatus')
  Route.get('driver-order/:idOrder(\\d+)/status', 'DriverOrderController.getOrderDeliveryStatus')
  Route.get('driver-order/:idDriver(\\d+)/orders', 'DriverOrderController.getDriverOrders').middleware(['auth:sameDay'])
  Route.post('driver-order/delivery', 'DriverOrderController.postOrderDelivery')
  Route.put('/driver-order/:idOrder(\\d+)/confirm/:confirm(\\d+)', 'DriverOrderController.putConfirmDelivery').middleware(['auth:sameDay'])

}).prefix('app/v2')

// Portal
Route.group('Portal - With Authentication', () => {
  // User
  Route.get('user', 'UserController.getUser')
  Route.put('user', 'UserController.putUser')
  Route.get('user/all', 'UserController.getUserAll')
  Route.delete('user/:id', 'UserController.deleteUser')
  Route.put('user/avatar', 'UserController.putProfilePicture')
  Route.post('user/driver/validate', 'UserController.postValidateDriver')
  Route.any('user', methodNotAllowed)

  // Dashboard
  Route.get('dashboard/data', 'DashboardController.getDashboardData')
  Route.get('dashboard/graphics', 'DashboardController.getDashboardGraphics')

  // Orders
  Route.get('order', 'OrderController.getOrder')
  Route.put('order', 'OrderController.putOrder')
  Route.post('order', 'OrderController.postOrder')
  Route.get('order/all', 'OrderController.getOrderAll')
  Route.get('order/view', 'OrderController.getOrderView')
  Route.get('order/historic', 'OrderController.getHistoric')
  Route.delete('order/:idOrder(\\d+)?', 'OrderController.deleteOrder')
  Route.get('order/value', 'OrderController.getOrderValue')
  Route.post('order/:idOrder(\\d+)?/invoice', 'OrderController.postOrderInvoice')
  Route.post('order/:idOrder(\\d+)?/refund', 'OrderController.refundInvoice')
  Route.any('get', methodNotAllowed)

  // Order Driver
  Route.get('driver-order/deliver-status', 'DriverOrderController.getDriverStatus')
  Route.get('driver-order/deliver-fail-status', 'DriverOrderController.getDriverFailStatus')
  Route.get('driver-order/:idDriver(\\d+)/orders', 'DriverOrderController.getDriverOrders')
  Route.put('/driver-order/:idOrder(\\d+)/confirm/:confirm(\\d+)', 'DriverOrderController.putConfirmDelivery')

  // Financial
  Route.get('financial/resume', 'FinancialController.getResumeReport')
  Route.get('financial/driver-ranking', 'FinancialController.getDriverRankReport')
  Route.get('financial/admin-invoice', 'FinancialController.getAdminInvoiceReport')

  Route.get('financial/driver-resume', 'FinancialController.getDriverResumeReport')
  Route.get('financial/driver-payment', 'FinancialController.getDriverPaymentReport')

  // UserBank
  Route.get('user-bank/list', 'UserBankController.getUserBankList')
  Route.put('user-bank/:id(\\d+)?', 'UserBankController.putUserBank')
  Route.post('user-bank', 'UserBankController.postUserBank')
  Route.delete('user-bank/:id(\\d+)?', 'UserBankController.deleteUserBank')

  // Partners Management
  // Shippers (Embarcadores)
  Route.get('partners/shippers', 'ShipperController.getShippers')
  Route.post('partners/shippers', 'ShipperController.postShipper')
  Route.get('partners/shippers/:id', 'ShipperController.getShipper')
  Route.put('partners/shippers/:id', 'ShipperController.putShipper')
  Route.put('partners/shippers/:id/status', 'ShipperController.putShipperStatus')
  Route.delete('partners/shippers/:id', 'ShipperController.deleteShipper')

  // Carriers (Transportadores)
  Route.get('partners/carriers', 'CarrierController.getCarriers')
  Route.post('partners/carriers', 'CarrierController.postCarrier')
  Route.get('partners/carriers/:id', 'CarrierController.getCarrier')
  Route.put('partners/carriers/:id', 'CarrierController.putCarrier')
  Route.put('partners/carriers/:id/status', 'CarrierController.putCarrierStatus')
  Route.delete('partners/carriers/:id', 'CarrierController.deleteCarrier')

  // Stock Store Partners
  Route.get('partners/stock-store', 'StockStorePartnerController.getStockStorePartners')
  Route.post('partners/stock-store', 'StockStorePartnerController.postStockStorePartner')
  Route.get('partners/stock-store/:id', 'StockStorePartnerController.getStockStorePartner')
  Route.put('partners/stock-store/:id', 'StockStorePartnerController.putStockStorePartner')
  Route.put('partners/stock-store/:id/status', 'StockStorePartnerController.putStockStorePartnerStatus')
  Route.delete('partners/stock-store/:id', 'StockStorePartnerController.deleteStockStorePartner')

  // Contacts
  Route.get('partners/contacts', 'ContactController.getContacts')
  Route.post('partners/contacts', 'ContactController.postContact')
  Route.get('partners/contacts/:id', 'ContactController.getContact')
  Route.put('partners/contacts/:id', 'ContactController.putContact')
  Route.put('partners/contacts/:id/status', 'ContactController.putContactStatus')
  Route.delete('partners/contacts/:id', 'ContactController.deleteContact')

  // Partners Dashboard
  Route.get('partners/dashboard/stats', 'PartnersDashboardController.getDashboardStats')
  Route.get('partners/dashboard/recent', 'PartnersDashboardController.getRecentActivities')
  Route.get('partners/dashboard/export/:entityType', 'PartnersDashboardController.exportData')


}).prefix('portal/v2').middleware(['auth:sameDay'])

module.exports = {
  Route
}
