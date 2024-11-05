import Elysia from 'elysia'
import { UserController } from './modules/user/user.controller'
import { StoreController } from './modules/store/store.controller'
import { CategoryController } from './modules/category/category.controller'
import { ProductController } from './modules/product/product.controller'
import { OrganizationController } from './modules/organization/organization.controller'
import { ModifierController } from './modules/modifier/modifier.controller'
import { TableController } from './modules/table/table.controller'
import { OrderController } from './modules/order/order.controller'
import { NotifyController } from './modules/notifications/notify.controller'
import { QrController } from './modules/qr/qr.controller'

export const httpV1 = new Elysia({ prefix: '/v1' })
  .use(UserController)
  .use(StoreController)
  .use(CategoryController)
  .use(ProductController)
  .use(OrganizationController)
  .use(ModifierController)
  .use(TableController)
  .use(OrderController)
  .use(NotifyController)
  .use(QrController)
