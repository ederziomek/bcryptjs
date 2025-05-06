"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("./prisma/prisma.service");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
async function bootstrap() {
    const { default: AdminJS, ComponentLoader } = await import('adminjs');
    const { default: AdminJSExpress } = await import('@adminjs/express');
    const AdminJSPrisma = await import('@adminjs/prisma');
    const { default: express } = await import('express');
    const { default: session } = await import('express-session');
    const { default: formidableMiddleware } = await import('express-formidable');
    const bcrypt = await import("bcryptjs");
    const logger = new common_1.Logger("Bootstrap");
    AdminJS.registerAdapter({ Database: AdminJSPrisma.Database, Resource: AdminJSPrisma.Resource });
    logger.log("Prisma adapter registered for AdminJS.");
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const prisma = app.get(prisma_service_1.PrismaService);
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
    const adminJS = new AdminJS({
        rootPath: '/admin',
        resources: [
            {
                resource: { model: AdminJSPrisma.getModelByName('SystemSettings'), client: prisma },
                options: {
                    actions: {
                        new: { isAccessible: false },
                        delete: { isAccessible: false },
                        bulkDelete: { isAccessible: false },
                        edit: {
                            before: async (request) => {
                                let settings = await prisma.systemSettings.findFirst();
                                if (!settings) {
                                    settings = await prisma.systemSettings.create({ data: {} });
                                    logger.log('Created default SystemSettings record.');
                                }
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
                        id: { isVisible: { list: false, filter: false, show: true, edit: false } },
                        activeCpaRule: {
                            availableValues: Object.values(client_1.CpaQualificationRule).map(rule => ({ value: rule, label: rule })),
                        },
                        cpaMinimumDeposit: { type: 'number' },
                        cpaActivityBetCount: { type: 'number' },
                        cpaActivityMinGgr: { type: 'number' },
                        cpaCommissionAmount: { type: 'number' },
                        updatedAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
                    },
                    listProperties: ['activeCpaRule', 'cpaMinimumDeposit', 'cpaActivityBetCount', 'cpaActivityMinGgr', 'cpaCommissionAmount', 'updatedAt'],
                    editProperties: ['activeCpaRule', 'cpaMinimumDeposit', 'cpaActivityBetCount', 'cpaActivityMinGgr', 'cpaCommissionAmount'],
                    showProperties: ['activeCpaRule', 'cpaMinimumDeposit', 'cpaActivityBetCount', 'cpaActivityMinGgr', 'cpaCommissionAmount', 'updatedAt'],
                },
            },
            {
                resource: { model: AdminJSPrisma.getModelByName('AdminUser'), client: prisma },
                options: {
                    properties: {
                        id: { isVisible: { list: false, filter: false, show: true, edit: false } },
                        email: { isRequired: true },
                        password: {
                            type: 'password',
                            isVisible: { list: false, filter: false, show: false, edit: true },
                            isRequired: true,
                        },
                        hashedPassword: {
                            isVisible: false,
                        },
                        createdAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
                        updatedAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
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
                                if (request.payload.password && request.payload.password.length > 0) {
                                    request.payload.password = await bcrypt.hash(request.payload.password, 10);
                                }
                                else {
                                    delete request.payload.password;
                                }
                                return request;
                            },
                        },
                    },
                },
            },
            { resource: { model: AdminJSPrisma.getModelByName('Affiliate'), client: prisma }, options: {} },
            { resource: { model: AdminJSPrisma.getModelByName('Indication'), client: prisma }, options: {} },
            { resource: { model: AdminJSPrisma.getModelByName('Wallet'), client: prisma }, options: {} },
            { resource: { model: AdminJSPrisma.getModelByName('Commission'), client: prisma }, options: {} },
            { resource: { model: AdminJSPrisma.getModelByName('WalletTransaction'), client: prisma }, options: {} },
        ],
        branding: { companyName: 'Fature100x Admin' },
    });
    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJS, {
        authenticate,
        cookieName: 'adminjs',
        cookiePassword: configService.get('ADMIN_COOKIE_PASSWORD') || 'some-secret-password-for-cookie-encryption-fature100x',
    }, null, {
        resave: false,
        saveUninitialized: true,
        secret: configService.get('ADMIN_SESSION_SECRET') || 'supersecret-fallback-key-fature100x',
        cookie: { maxAge: 86400000 }
    });
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use(formidableMiddleware());
    expressApp.use(adminJS.options.rootPath, adminRouter);
    logger.log(`AdminJS router mounted at ${adminJS.options.rootPath}`);
    const port = configService.get('PORT') || 3000;
    await app.init();
    await createInitialAdminUser();
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on: http://127.0.0.1:${port}`);
    logger.log(`AdminJS is running on: http://127.0.0.1:${port}${adminJS.options.rootPath}`);
}
bootstrap();
//# sourceMappingURL=main.js.map