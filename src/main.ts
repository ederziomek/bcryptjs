import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { CpaQualificationRule } from '@prisma/client'; // Import enum

async function bootstrap() {
  // Dynamically import ESM modules
  const { default: AdminJS, ComponentLoader } = await import('adminjs');
  const { default: AdminJSExpress } = await import('@adminjs/express');
  const AdminJSPrisma = await import('@adminjs/prisma');
  const { default: express } = await import('express');
  const { default: session } = await import('express-session');
  const { default: formidableMiddleware } = await import('express-formidable');
  const bcrypt = await import("bcryptjs");

  const logger = new Logger("Bootstrap");

  // Register Prisma Adapter
  AdminJS.registerAdapter({ Database: AdminJSPrisma.Database, Resource: AdminJSPrisma.Resource });
  logger.log("Prisma adapter registered for AdminJS.");

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const prisma = app.get(PrismaService);

  // --- AdminJS Authentication --- START ---
  const DEFAULT_ADMIN = {
    email: configService.get('ADMIN_EMAIL') || 'admin@example.com',
    password: configService.get('ADMIN_INITIAL_PASSWORD') || 'admin123',
  };

  const authenticate = async (email, password) => {
    const adminUser = await prisma.adminUser.findUnique({ where: { email } });
    if (adminUser) {
      const matched = await bcrypt.compare(password, adminUser.password);
      if (matched) {
        return adminUser;
      }
    }
    return false;
  };

  // Function to create initial admin user if none exists
  const createInitialAdminUser = async () => {
    const userCount = await prisma.adminUser.count();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
      await prisma.adminUser.create({
        data: {
          email: DEFAULT_ADMIN.email,
          password: hashedPassword,
        },
      });
      logger.log(`Created initial admin user: ${DEFAULT_ADMIN.email}`);
    }
  };
  // --- AdminJS Authentication --- END ---

  const adminJS = new AdminJS({
    rootPath: '/admin',
    resources: [
      // --- SystemSettings Configuration --- START ---
      {
        resource: { model: AdminJSPrisma.getModelByName('SystemSettings'), client: prisma },
        options: {
          // Only allow editing the single settings record
          actions: {
            new: { isAccessible: false }, // Disable creation of new settings
            delete: { isAccessible: false }, // Disable deletion
            bulkDelete: { isAccessible: false },
            // Ensure edit action finds the single record or creates if missing
            edit: {
              before: async (request) => {
                let settings = await prisma.systemSettings.findFirst();
                if (!settings) {
                  settings = await prisma.systemSettings.create({ data: {} }); // Create default if none exists
                  logger.log('Created default SystemSettings record.');
                }
                // Redirect edit action to the specific record ID
                request.params.recordId = settings.id;
                return request;
              },
            },
            show: {
              before: async (request) => {
                 let settings = await prisma.systemSettings.findFirst();
                 if (!settings) {
                   settings = await prisma.systemSettings.create({ data: {} });
                   logger.log('Created default SystemSettings record for show.');
                 }
                 request.params.recordId = settings.id;
                 return request;
              }
            }
          },
          properties: {
            id: { isVisible: { list: false, filter: false, show: true, edit: false } }, // Hide ID in most views
            activeCpaRule: {
              availableValues: Object.values(CpaQualificationRule).map(rule => ({ value: rule, label: rule })),
            },
            // Ensure number fields are treated as numbers
            cpaMinimumDeposit: { type: 'number' },
            cpaActivityBetCount: { type: 'number' },
            cpaActivityMinGgr: { type: 'number' },
            cpaCommissionAmount: { type: 'number' },
            updatedAt: { isVisible: { list: true, filter: true, show: true, edit: false } }, // Read-only
          },
          listProperties: ['activeCpaRule', 'cpaMinimumDeposit', 'cpaActivityBetCount', 'cpaActivityMinGgr', 'cpaCommissionAmount', 'updatedAt'],
          editProperties: ['activeCpaRule', 'cpaMinimumDeposit', 'cpaActivityBetCount', 'cpaActivityMinGgr', 'cpaCommissionAmount'],
          showProperties: ['activeCpaRule', 'cpaMinimumDeposit', 'cpaActivityBetCount', 'cpaActivityMinGgr', 'cpaCommissionAmount', 'updatedAt'],
        },
      },
      // --- SystemSettings Configuration --- END ---

      // --- AdminUser Configuration --- START ---
      {
        resource: { model: AdminJSPrisma.getModelByName('AdminUser'), client: prisma },
        options: {
          properties: {
            id: { isVisible: { list: false, filter: false, show: true, edit: false } },
            email: { isRequired: true },
            password: {
              type: 'password',
              isVisible: { list: false, filter: false, show: false, edit: true }, // Only show in edit/new forms
              isRequired: true,
            },
            // Hashed password property (read-only, for internal use if needed, hidden by default)
            hashedPassword: {
                isVisible: false, // Never show this directly
                // If you need to display *something* without revealing the hash:
                // components: { list: ComponentLoader.add('PasswordDisplay', './PasswordDisplayComponent') }
            },
            createdAt: { isVisible: { list: true, filter: true, show: true, edit: false } }, // Read-only
            updatedAt: { isVisible: { list: true, filter: true, show: true, edit: false } }, // Read-only
          },
          listProperties: ['email', 'createdAt', 'updatedAt'],
          editProperties: ['email', 'password'],
          newProperties: ['email', 'password'],
          showProperties: ['email', 'createdAt', 'updatedAt'],
          actions: {
            new: {
              before: async (request) => {
                if (request.payload.password) {
                  request.payload.password = await bcrypt.hash(request.payload.password, 10);
                }
                return request;
              },
            },
            edit: {
              before: async (request) => {
                // Only hash if a new password is provided
                if (request.payload.password && request.payload.password.length > 0) {
                  request.payload.password = await bcrypt.hash(request.payload.password, 10);
                } else {
                  // Remove password from payload if it's empty to avoid overwriting with null/empty
                  delete request.payload.password;
                }
                return request;
              },
            },
          },
        },
      },
      // --- AdminUser Configuration --- END ---

      // Other resources (keep as is for now)
      { resource: { model: AdminJSPrisma.getModelByName('Affiliate'), client: prisma }, options: {} },
      { resource: { model: AdminJSPrisma.getModelByName('Indication'), client: prisma }, options: {} },
      { resource: { model: AdminJSPrisma.getModelByName('Wallet'), client: prisma }, options: {} },
      { resource: { model: AdminJSPrisma.getModelByName('Commission'), client: prisma }, options: {} },
      { resource: { model: AdminJSPrisma.getModelByName('WalletTransaction'), client: prisma }, options: {} },
    ],
    branding: { companyName: 'Fature100x Admin' },
    // dashboard: { component: ComponentLoader.add('CustomDashboard', './custom-dashboard') } // Example
  });

  // --- Build AdminJS Router with Authentication --- START ---
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJS, {
    authenticate,
    cookieName: 'adminjs', // Customize cookie name if needed
    cookiePassword: configService.get('ADMIN_COOKIE_PASSWORD') || 'some-secret-password-for-cookie-encryption-fature100x',
  }, null, {
    // express-session options (can reuse from below, but good to be explicit)
    resave: false,
    saveUninitialized: true,
    secret: configService.get('ADMIN_SESSION_SECRET') || 'supersecret-fallback-key-fature100x',
    cookie: { maxAge: 86400000 } // 1 day
  });
  // --- Build AdminJS Router with Authentication --- END ---

  const expressApp = app.getHttpAdapter().getInstance();

  // Add formidable middleware (needed for file uploads, etc.)
  expressApp.use(formidableMiddleware());

  // Mount AdminJS router
  expressApp.use(adminJS.options.rootPath, adminRouter);
  logger.log(`AdminJS router mounted at ${adminJS.options.rootPath}`);

  // Enable CORS if needed
  // app.enableCors();

  const port = configService.get<number>('PORT') || 3000;

  // Initialize NestJS application
  await app.init();

  // Create initial admin user *after* app init and before listen
  await createInitialAdminUser();

  // Listen on 0.0.0.0
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://127.0.0.1:${port}`);
  logger.log(`AdminJS is running on: http://127.0.0.1:${port}${adminJS.options.rootPath}`);
}

bootstrap();

