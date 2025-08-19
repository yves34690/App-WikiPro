/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.controller.ts":
/*!*******************************!*\
  !*** ./src/app.controller.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./src/app.service.ts");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getHealth() {
        return this.appService.getHealth();
    }
    ping() {
        return this.appService.ping();
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AppController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('ping'),
    (0, swagger_1.ApiOperation)({ summary: 'Ping endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pong response' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AppController.prototype, "ping", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),

/***/ "./src/app.module.ts":
/*!***************************!*\
  !*** ./src/app.module.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const throttler_1 = __webpack_require__(/*! @nestjs/throttler */ "@nestjs/throttler");
const config_module_1 = __webpack_require__(/*! @core/config/config.module */ "./src/core/config/config.module.ts");
const auth_module_1 = __webpack_require__(/*! @core/auth/auth.module */ "./src/core/auth/auth.module.ts");
const telemetry_module_1 = __webpack_require__(/*! @core/telemetry/telemetry.module */ "./src/core/telemetry/telemetry.module.ts");
const registry_module_1 = __webpack_require__(/*! @core/registry/registry.module */ "./src/core/registry/registry.module.ts");
const ai_providers_module_1 = __webpack_require__(/*! @modules/ai-providers/ai-providers.module */ "./src/modules/ai-providers/ai-providers.module.ts");
const app_controller_1 = __webpack_require__(/*! ./app.controller */ "./src/app.controller.ts");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./src/app.service.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            config_module_1.CoreConfigModule,
            auth_module_1.AuthModule,
            telemetry_module_1.TelemetryModule,
            registry_module_1.RegistryModule,
            ai_providers_module_1.AiProvidersModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),

/***/ "./src/app.service.ts":
/*!****************************!*\
  !*** ./src/app.service.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let AppService = class AppService {
    getHealth() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        };
    }
    ping() {
        return { message: 'pong' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),

/***/ "./src/core/auth/auth.controller.ts":
/*!******************************************!*\
  !*** ./src/core/auth/auth.controller.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./src/core/auth/auth.service.ts");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async validateToken(body) {
        try {
            const payload = await this.authService.validateToken(body.token);
            return { valid: true, payload };
        }
        catch (error) {
            return { valid: false };
        }
    }
    async getProfile(req) {
        this.logger.log(`Profil demandé pour l'utilisateur ${req.user.email}`);
        return req.user;
    }
    async hashPassword(body) {
        const hash = await this.authService.hashPassword(body.password);
        return { hash };
    }
    getAuthHealth() {
        return {
            status: 'healthy',
            service: 'authentication',
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Valider un token JWT' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token valide' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token invalide' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], AuthController.prototype, "validateToken", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir le profil utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profil utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('hash-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Hasher un mot de passe (utilitaire)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mot de passe hashé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AuthController.prototype, "hashPassword", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check du service d\'authentification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service opérationnel' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AuthController.prototype, "getAuthHealth", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ }),

/***/ "./src/core/auth/auth.module.ts":
/*!**************************************!*\
  !*** ./src/core/auth/auth.module.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./src/core/auth/auth.service.ts");
const auth_controller_1 = __webpack_require__(/*! ./auth.controller */ "./src/core/auth/auth.controller.ts");
const jwt_strategy_1 = __webpack_require__(/*! ./strategies/jwt.strategy */ "./src/core/auth/strategies/jwt.strategy.ts");
const tenant_guard_1 = __webpack_require__(/*! ./guards/tenant.guard */ "./src/core/auth/guards/tenant.guard.ts");
const config_service_1 = __webpack_require__(/*! @core/config/config.service */ "./src/core/config/config.service.ts");
const config_module_1 = __webpack_require__(/*! @core/config/config.module */ "./src/core/config/config.module.ts");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.CoreConfigModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_module_1.CoreConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.security.jwtSecret,
                    signOptions: {
                        expiresIn: configService.security.jwtExpiration
                    },
                }),
                inject: [config_service_1.ConfigService],
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            tenant_guard_1.TenantGuard,
        ],
        exports: [auth_service_1.AuthService, tenant_guard_1.TenantGuard],
    })
], AuthModule);


/***/ }),

/***/ "./src/core/auth/auth.service.ts":
/*!***************************************!*\
  !*** ./src/core/auth/auth.service.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const bcrypt = __webpack_require__(/*! bcrypt */ "bcrypt");
const config_service_1 = __webpack_require__(/*! @core/config/config.service */ "./src/core/config/config.service.ts");
let AuthService = AuthService_1 = class AuthService {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async hashPassword(password) {
        const rounds = this.configService.security.bcryptRounds;
        return bcrypt.hash(password, rounds);
    }
    async comparePasswords(plaintext, hash) {
        return bcrypt.compare(plaintext, hash);
    }
    async generateTokens(payload) {
        const tokenPayload = {
            sub: payload.sub,
            email: payload.email,
            tenantId: payload.tenantId,
            roles: payload.roles,
        };
        const accessToken = this.jwtService.sign(tokenPayload);
        this.logger.log(`Token généré pour l'utilisateur ${payload.email} (tenant: ${payload.tenantId})`);
        return {
            user: {
                id: payload.sub,
                email: payload.email,
                tenantId: payload.tenantId,
                roles: payload.roles,
            },
            accessToken,
        };
    }
    async validateToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch (error) {
            this.logger.warn(`Token invalide: ${error.message}`);
            throw new common_1.UnauthorizedException('Token invalide');
        }
    }
    async validateUser(payload) {
        if (!payload.sub || !payload.email || !payload.tenantId) {
            throw new common_1.UnauthorizedException('Payload JWT invalide');
        }
        return payload;
    }
    extractTenantFromUser(user) {
        if (!user.tenantId) {
            throw new common_1.UnauthorizedException('Tenant non défini pour l\'utilisateur');
        }
        return user.tenantId;
    }
    hasRole(user, requiredRole) {
        return user.roles && user.roles.includes(requiredRole);
    }
    hasAnyRole(user, requiredRoles) {
        if (!user.roles)
            return false;
        return requiredRoles.some(role => user.roles.includes(role));
    }
    isAdmin(user) {
        return this.hasRole(user, 'admin') || this.hasRole(user, 'super-admin');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof config_service_1.ConfigService !== "undefined" && config_service_1.ConfigService) === "function" ? _b : Object])
], AuthService);


/***/ }),

/***/ "./src/core/auth/guards/tenant.guard.ts":
/*!**********************************************!*\
  !*** ./src/core/auth/guards/tenant.guard.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TenantGuard_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenantGuard = exports.TenantContext = exports.TENANT_KEY = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
exports.TENANT_KEY = 'tenant';
exports.TenantContext = core_1.Reflector.createDecorator();
let TenantGuard = TenantGuard_1 = class TenantGuard {
    constructor(reflector) {
        this.reflector = reflector;
        this.logger = new common_1.Logger(TenantGuard_1.name);
    }
    canActivate(context) {
        const requiredTenant = this.reflector.getAllAndOverride(exports.TENANT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredTenant) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Utilisateur non authentifié');
        }
        if (!user.tenantId) {
            throw new common_1.ForbiddenException('Tenant non défini pour l\'utilisateur');
        }
        if (user.tenantId !== requiredTenant) {
            this.logger.warn(`Tentative d'accès cross-tenant: utilisateur ${user.email} (tenant: ${user.tenantId}) ` +
                `tentant d'accéder aux ressources du tenant ${requiredTenant}`);
            throw new common_1.ForbiddenException('Accès interdit - Violation de l\'isolation tenant');
        }
        request.tenantId = user.tenantId;
        return true;
    }
};
exports.TenantGuard = TenantGuard;
exports.TenantGuard = TenantGuard = TenantGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], TenantGuard);


/***/ }),

/***/ "./src/core/auth/strategies/jwt.strategy.ts":
/*!**************************************************!*\
  !*** ./src/core/auth/strategies/jwt.strategy.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const passport_jwt_1 = __webpack_require__(/*! passport-jwt */ "passport-jwt");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_service_1 = __webpack_require__(/*! ../auth.service */ "./src/core/auth/auth.service.ts");
const config_service_1 = __webpack_require__(/*! @core/config/config.service */ "./src/core/config/config.service.ts");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(authService, configService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.security.jwtSecret,
        });
        this.authService = authService;
    }
    async validate(payload) {
        const user = await this.authService.validateUser(payload);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object, typeof (_b = typeof config_service_1.ConfigService !== "undefined" && config_service_1.ConfigService) === "function" ? _b : Object])
], JwtStrategy);


/***/ }),

/***/ "./src/core/config/config.module.ts":
/*!******************************************!*\
  !*** ./src/core/config/config.module.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CoreConfigModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const config_service_1 = __webpack_require__(/*! ./config.service */ "./src/core/config/config.service.ts");
const config_validation_1 = __webpack_require__(/*! ./config.validation */ "./src/core/config/config.validation.ts");
let CoreConfigModule = class CoreConfigModule {
};
exports.CoreConfigModule = CoreConfigModule;
exports.CoreConfigModule = CoreConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validate: config_validation_1.configValidation,
                envFilePath: ['.env.local', '.env'],
            }),
        ],
        providers: [config_service_1.ConfigService],
        exports: [config_service_1.ConfigService],
    })
], CoreConfigModule);


/***/ }),

/***/ "./src/core/config/config.service.ts":
/*!*******************************************!*\
  !*** ./src/core/config/config.service.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfigService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let ConfigService = class ConfigService {
    constructor(nestConfigService) {
        this.nestConfigService = nestConfigService;
    }
    get port() {
        return this.nestConfigService.get('PORT', 3001);
    }
    get nodeEnv() {
        return this.nestConfigService.get('NODE_ENV', 'development');
    }
    get corsOrigins() {
        const origins = this.nestConfigService.get('CORS_ORIGIN', 'http://localhost:3000');
        return origins.split(',').map(origin => origin.trim());
    }
    get database() {
        return {
            host: this.nestConfigService.get('DB_HOST', 'localhost'),
            port: this.nestConfigService.get('DB_PORT', 5432),
            username: this.nestConfigService.get('DB_USERNAME', 'postgres'),
            password: this.nestConfigService.get('DB_PASSWORD', ''),
            database: this.nestConfigService.get('DB_DATABASE', 'wikipro'),
        };
    }
    get security() {
        return {
            jwtSecret: this.nestConfigService.get('JWT_SECRET', 'dev-secret-change-in-production'),
            jwtExpiration: this.nestConfigService.get('JWT_EXPIRATION', '24h'),
            bcryptRounds: this.nestConfigService.get('BCRYPT_ROUNDS', 12),
        };
    }
    get ai() {
        return {
            geminiApiKey: this.nestConfigService.get('GEMINI_API_KEY', ''),
            geminiModel: this.nestConfigService.get('GEMINI_MODEL', 'gemini-2.5-flash-002'),
            maxTokens: this.nestConfigService.get('AI_MAX_TOKENS', 4096),
            temperature: this.nestConfigService.get('AI_TEMPERATURE', 0.7),
        };
    }
    get telemetry() {
        return {
            enabled: this.nestConfigService.get('TELEMETRY_ENABLED', false),
            endpoint: this.nestConfigService.get('TELEMETRY_ENDPOINT'),
            apiKey: this.nestConfigService.get('TELEMETRY_API_KEY'),
            environment: this.nodeEnv,
        };
    }
    get isDevelopment() {
        return this.nodeEnv === 'development';
    }
    get isProduction() {
        return this.nodeEnv === 'production';
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], ConfigService);


/***/ }),

/***/ "./src/core/config/config.validation.ts":
/*!**********************************************!*\
  !*** ./src/core/config/config.validation.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnvironmentVariables = void 0;
exports.configValidation = configValidation;
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class EnvironmentVariables {
    constructor() {
        this.PORT = 3001;
        this.NODE_ENV = 'development';
        this.CORS_ORIGIN = 'http://localhost:3000';
        this.DB_HOST = 'localhost';
        this.DB_PORT = 5432;
        this.DB_USERNAME = 'postgres';
        this.DB_PASSWORD = '';
        this.DB_DATABASE = 'wikipro';
        this.JWT_SECRET = 'dev-secret-change-in-production';
        this.JWT_EXPIRATION = '24h';
        this.BCRYPT_ROUNDS = 12;
        this.GEMINI_API_KEY = '';
        this.GEMINI_MODEL = 'gemini-2.5-flash-002';
        this.AI_MAX_TOKENS = 4096;
        this.AI_TEMPERATURE = 0.7;
        this.TELEMETRY_ENABLED = false;
    }
}
exports.EnvironmentVariables = EnvironmentVariables;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.Min)(1000),
    (0, class_validator_1.Max)(65535),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "PORT", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "NODE_ENV", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "CORS_ORIGIN", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "DB_HOST", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "DB_PORT", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "DB_USERNAME", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "DB_PASSWORD", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "DB_DATABASE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "JWT_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "JWT_EXPIRATION", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.Min)(4),
    (0, class_validator_1.Max)(16),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "BCRYPT_ROUNDS", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "GEMINI_API_KEY", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "GEMINI_MODEL", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(8192),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "AI_MAX_TOKENS", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "AI_TEMPERATURE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "TELEMETRY_ENABLED", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "TELEMETRY_ENDPOINT", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "TELEMETRY_API_KEY", void 0);
function configValidation(config) {
    const validatedConfig = (0, class_transformer_1.plainToClass)(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = (0, class_validator_1.validateSync)(validatedConfig, {
        skipMissingProperties: false,
    });
    if (errors.length > 0) {
        throw new Error(`Configuration validation error: ${errors.toString()}`);
    }
    return validatedConfig;
}


/***/ }),

/***/ "./src/core/registry/registry.controller.ts":
/*!**************************************************!*\
  !*** ./src/core/registry/registry.controller.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegistryController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const registry_service_1 = __webpack_require__(/*! ./registry.service */ "./src/core/registry/registry.service.ts");
let RegistryController = class RegistryController {
    constructor(registryService) {
        this.registryService = registryService;
    }
    getAllProviders() {
        return {
            providers: this.registryService.getProvidersInfo(),
            types: this.registryService.getProviderTypes(),
        };
    }
    getProvidersByType(type) {
        const providers = this.registryService.getByType(type);
        return {
            type,
            providers: providers.map(provider => ({
                name: provider.name,
                version: provider.version,
                capabilities: provider.capabilities,
                metrics: provider.getMetrics(),
            })),
        };
    }
    getBestProvider(type) {
        const provider = this.registryService.getBest(type);
        if (!provider) {
            return { provider: null, message: `Aucun provider disponible pour le type: ${type}` };
        }
        return {
            provider: {
                name: provider.name,
                version: provider.version,
                capabilities: provider.capabilities,
                metrics: provider.getMetrics(),
            },
        };
    }
    async healthCheck(type, name) {
        const results = await this.registryService.healthCheck(type, name);
        return {
            timestamp: new Date().toISOString(),
            results: Object.fromEntries(results),
            summary: {
                total: results.size,
                healthy: Array.from(results.values()).filter(Boolean).length,
                unhealthy: Array.from(results.values()).filter(r => !r).length,
            },
        };
    }
    getProviderTypes() {
        return {
            types: this.registryService.getProviderTypes(),
        };
    }
    getRegistryHealth() {
        const providers = this.registryService.getAllProviders();
        return {
            status: 'healthy',
            service: 'registry',
            providersCount: providers.size,
            types: this.registryService.getProviderTypes().length,
        };
    }
};
exports.RegistryController = RegistryController;
__decorate([
    (0, common_1.Get)('providers'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister tous les providers enregistrés' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des providers avec leurs informations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RegistryController.prototype, "getAllProviders", null);
__decorate([
    (0, common_1.Get)('providers/by-type'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les providers par type' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: true, type: String, description: 'Type de provider (ex: ai-text-generation)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des providers du type spécifié' }),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegistryController.prototype, "getProvidersByType", null);
__decorate([
    (0, common_1.Get)('providers/best'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir le meilleur provider pour un type donné' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: true, type: String, description: 'Type de provider' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Meilleur provider disponible' }),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegistryController.prototype, "getBestProvider", null);
__decorate([
    (0, common_1.Post)('health-check'),
    (0, swagger_1.ApiOperation)({ summary: 'Déclencher un health check des providers' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, type: String, description: 'Type de provider spécifique' }),
    (0, swagger_1.ApiQuery)({ name: 'name', required: false, type: String, description: 'Nom du provider spécifique' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Résultats du health check' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RegistryController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('types'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister tous les types de providers disponibles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des types de providers' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RegistryController.prototype, "getProviderTypes", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check du service de registre' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service opérationnel' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RegistryController.prototype, "getRegistryHealth", null);
exports.RegistryController = RegistryController = __decorate([
    (0, swagger_1.ApiTags)('Registry'),
    (0, common_1.Controller)('registry'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof registry_service_1.RegistryService !== "undefined" && registry_service_1.RegistryService) === "function" ? _a : Object])
], RegistryController);


/***/ }),

/***/ "./src/core/registry/registry.module.ts":
/*!**********************************************!*\
  !*** ./src/core/registry/registry.module.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegistryModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const registry_service_1 = __webpack_require__(/*! ./registry.service */ "./src/core/registry/registry.service.ts");
const registry_controller_1 = __webpack_require__(/*! ./registry.controller */ "./src/core/registry/registry.controller.ts");
let RegistryModule = class RegistryModule {
};
exports.RegistryModule = RegistryModule;
exports.RegistryModule = RegistryModule = __decorate([
    (0, common_1.Module)({
        providers: [registry_service_1.RegistryService],
        controllers: [registry_controller_1.RegistryController],
        exports: [registry_service_1.RegistryService],
    })
], RegistryModule);


/***/ }),

/***/ "./src/core/registry/registry.service.ts":
/*!***********************************************!*\
  !*** ./src/core/registry/registry.service.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RegistryService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegistryService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let RegistryService = RegistryService_1 = class RegistryService {
    constructor() {
        this.logger = new common_1.Logger(RegistryService_1.name);
        this.providers = new Map();
        this.typeRegistries = new Map();
    }
    async onModuleInit() {
        this.logger.log('Service de registre initialisé');
        this.startHealthCheckLoop();
    }
    register(type, name, provider, config) {
        const key = this.getProviderKey(type, name);
        if (this.providers.has(key)) {
            this.logger.warn(`Provider ${key} est déjà enregistré, remplacement...`);
        }
        const entry = {
            instance: provider,
            config,
            registeredAt: new Date(),
            healthStatus: 'unknown',
        };
        this.providers.set(key, entry);
        if (!this.typeRegistries.has(type)) {
            this.typeRegistries.set(type, new Map());
        }
        this.typeRegistries.get(type).set(name, entry);
        this.logger.log(`Provider enregistré: ${key} (priority: ${config.priority})`);
    }
    unregister(type, name) {
        const key = this.getProviderKey(type, name);
        const removed = this.providers.delete(key);
        const typeRegistry = this.typeRegistries.get(type);
        if (typeRegistry) {
            typeRegistry.delete(name);
            if (typeRegistry.size === 0) {
                this.typeRegistries.delete(type);
            }
        }
        if (removed) {
            this.logger.log(`Provider désenregistré: ${key}`);
        }
        return removed;
    }
    get(type, name) {
        const key = this.getProviderKey(type, name);
        const entry = this.providers.get(key);
        return entry ? entry.instance : null;
    }
    getByType(type) {
        const typeRegistry = this.typeRegistries.get(type);
        if (!typeRegistry)
            return [];
        return Array.from(typeRegistry.values())
            .filter(entry => entry.config.enabled)
            .sort((a, b) => b.config.priority - a.config.priority)
            .map(entry => entry.instance);
    }
    getBest(type) {
        const providers = this.getByType(type);
        const healthyProviders = providers.filter(provider => {
            const key = this.getProviderKey(type, provider.name);
            const entry = this.providers.get(key);
            return entry?.healthStatus === 'healthy';
        });
        return healthyProviders.length > 0 ? healthyProviders[0] : null;
    }
    getAllProviders() {
        return new Map(this.providers);
    }
    getProviderTypes() {
        return Array.from(this.typeRegistries.keys());
    }
    getProvidersInfo() {
        return Array.from(this.providers.entries()).map(([key, entry]) => {
            const [type, name] = key.split(':');
            return {
                key,
                type,
                name,
                config: entry.config,
                healthStatus: entry.healthStatus,
                metrics: entry.instance.getMetrics(),
                registeredAt: entry.registeredAt,
                lastHealthCheck: entry.lastHealthCheck,
            };
        });
    }
    async healthCheck(type, name) {
        const results = new Map();
        if (type && name) {
            const provider = this.get(type, name);
            if (provider) {
                const key = this.getProviderKey(type, name);
                const isHealthy = await this.performHealthCheck(key, provider);
                results.set(key, isHealthy);
            }
        }
        else {
            const promises = Array.from(this.providers.entries()).map(async ([key, entry]) => {
                const isHealthy = await this.performHealthCheck(key, entry.instance);
                results.set(key, isHealthy);
            });
            await Promise.all(promises);
        }
        return results;
    }
    async performHealthCheck(key, provider) {
        try {
            const isHealthy = await provider.healthCheck();
            const entry = this.providers.get(key);
            if (entry) {
                entry.healthStatus = isHealthy ? 'healthy' : 'unhealthy';
                entry.lastHealthCheck = new Date();
            }
            return isHealthy;
        }
        catch (error) {
            this.logger.warn(`Health check échoué pour ${key}: ${error.message}`);
            const entry = this.providers.get(key);
            if (entry) {
                entry.healthStatus = 'unhealthy';
                entry.lastHealthCheck = new Date();
            }
            return false;
        }
    }
    getProviderKey(type, name) {
        return `${type}:${name}`;
    }
    startHealthCheckLoop() {
        const interval = 5 * 60 * 1000;
        setInterval(async () => {
            try {
                this.logger.debug('Démarrage du health check périodique');
                await this.healthCheck();
                this.logger.debug('Health check périodique terminé');
            }
            catch (error) {
                this.logger.error(`Erreur lors du health check périodique: ${error.message}`);
            }
        }, interval);
        this.logger.log(`Health check périodique configuré (intervalle: ${interval / 1000}s)`);
    }
};
exports.RegistryService = RegistryService;
exports.RegistryService = RegistryService = RegistryService_1 = __decorate([
    (0, common_1.Injectable)()
], RegistryService);


/***/ }),

/***/ "./src/core/telemetry/metrics.controller.ts":
/*!**************************************************!*\
  !*** ./src/core/telemetry/metrics.controller.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MetricsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const telemetry_service_1 = __webpack_require__(/*! ./telemetry.service */ "./src/core/telemetry/telemetry.service.ts");
let MetricsController = class MetricsController {
    constructor(telemetryService) {
        this.telemetryService = telemetryService;
    }
    getRecentEvents(limit) {
        const limitNumber = limit ? parseInt(limit, 10) : 50;
        return this.telemetryService.getRecentEvents(limitNumber);
    }
    getMetrics(name, limit) {
        const limitNumber = limit ? parseInt(limit, 10) : 50;
        return this.telemetryService.getMetrics(name, limitNumber);
    }
    getMetricNames() {
        return { metrics: this.telemetryService.getAllMetricNames() };
    }
    getSystemMetrics() {
        return this.telemetryService.getSystemMetrics();
    }
    getTelemetryHealth() {
        return {
            status: 'healthy',
            service: 'telemetry',
        };
    }
};
exports.MetricsController = MetricsController;
__decorate([
    (0, common_1.Get)('events'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les événements de télémétrie récents' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Nombre d\'événements à retourner (défaut: 50)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des événements récents' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], MetricsController.prototype, "getRecentEvents", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les métriques par nom' }),
    (0, swagger_1.ApiQuery)({ name: 'name', required: true, type: String, description: 'Nom de la métrique' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Nombre de valeurs à retourner (défaut: 50)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des valeurs de la métrique' }),
    __param(0, (0, common_1.Query)('name')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Array)
], MetricsController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('metrics/names'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir la liste des noms de métriques disponibles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des noms de métriques' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], MetricsController.prototype, "getMetricNames", null);
__decorate([
    (0, common_1.Get)('system'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les métriques système' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Métriques système' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], MetricsController.prototype, "getSystemMetrics", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check du service de télémétrie' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service opérationnel' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], MetricsController.prototype, "getTelemetryHealth", null);
exports.MetricsController = MetricsController = __decorate([
    (0, swagger_1.ApiTags)('Telemetry'),
    (0, common_1.Controller)('telemetry'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof telemetry_service_1.TelemetryService !== "undefined" && telemetry_service_1.TelemetryService) === "function" ? _a : Object])
], MetricsController);


/***/ }),

/***/ "./src/core/telemetry/telemetry.module.ts":
/*!************************************************!*\
  !*** ./src/core/telemetry/telemetry.module.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TelemetryModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const telemetry_service_1 = __webpack_require__(/*! ./telemetry.service */ "./src/core/telemetry/telemetry.service.ts");
const metrics_controller_1 = __webpack_require__(/*! ./metrics.controller */ "./src/core/telemetry/metrics.controller.ts");
const config_module_1 = __webpack_require__(/*! @core/config/config.module */ "./src/core/config/config.module.ts");
let TelemetryModule = class TelemetryModule {
};
exports.TelemetryModule = TelemetryModule;
exports.TelemetryModule = TelemetryModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.CoreConfigModule],
        providers: [telemetry_service_1.TelemetryService],
        controllers: [metrics_controller_1.MetricsController],
        exports: [telemetry_service_1.TelemetryService],
    })
], TelemetryModule);


/***/ }),

/***/ "./src/core/telemetry/telemetry.service.ts":
/*!*************************************************!*\
  !*** ./src/core/telemetry/telemetry.service.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TelemetryService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TelemetryService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_service_1 = __webpack_require__(/*! @core/config/config.service */ "./src/core/config/config.service.ts");
let TelemetryService = TelemetryService_1 = class TelemetryService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TelemetryService_1.name);
        this.events = [];
        this.metrics = new Map();
        if (this.configService.telemetry.enabled) {
            this.logger.log('Service de télémétrie activé');
        }
        else {
            this.logger.log('Service de télémétrie désactivé');
        }
    }
    trackEvent(event) {
        const telemetryEvent = {
            ...event,
            timestamp: new Date(),
        };
        this.events.push(telemetryEvent);
        if (this.configService.telemetry.enabled) {
            this.logger.debug(`Événement tracé: ${event.event} pour le tenant ${event.tenantId}`);
        }
        if (this.events.length > 1000) {
            this.events.shift();
        }
    }
    recordMetric(metric) {
        const metricWithTimestamp = {
            ...metric,
            timestamp: new Date(),
        };
        if (!this.metrics.has(metric.name)) {
            this.metrics.set(metric.name, []);
        }
        const metricArray = this.metrics.get(metric.name);
        metricArray.push(metricWithTimestamp);
        if (this.configService.telemetry.enabled) {
            this.logger.debug(`Métrique enregistrée: ${metric.name} = ${metric.value}`);
        }
        if (metricArray.length > 100) {
            metricArray.shift();
        }
    }
    trackUserLogin(tenantId, userId) {
        this.trackEvent({
            event: 'user.login',
            tenantId,
            userId,
        });
    }
    trackApiCall(tenantId, endpoint, method, responseTime, statusCode) {
        this.trackEvent({
            event: 'api.call',
            tenantId,
            metadata: {
                endpoint,
                method,
                responseTime,
                statusCode,
            },
        });
        this.recordMetric({
            name: 'api.response_time',
            value: responseTime,
            tags: {
                endpoint,
                method,
                status: statusCode.toString(),
                tenant: tenantId,
            },
        });
    }
    trackAiProviderCall(tenantId, provider, model, tokensUsed, responseTime) {
        this.trackEvent({
            event: 'ai.provider.call',
            tenantId,
            metadata: {
                provider,
                model,
                tokensUsed,
                responseTime,
            },
        });
        this.recordMetric({
            name: 'ai.tokens_used',
            value: tokensUsed,
            tags: {
                provider,
                model,
                tenant: tenantId,
            },
        });
        this.recordMetric({
            name: 'ai.response_time',
            value: responseTime,
            tags: {
                provider,
                model,
                tenant: tenantId,
            },
        });
    }
    getRecentEvents(limit = 50) {
        return this.events.slice(-limit);
    }
    getMetrics(metricName, limit = 50) {
        const metrics = this.metrics.get(metricName);
        if (!metrics)
            return [];
        return metrics.slice(-limit);
    }
    getAllMetricNames() {
        return Array.from(this.metrics.keys());
    }
    getSystemMetrics() {
        return {
            totalEvents: this.events.length,
            totalMetrics: Array.from(this.metrics.values()).reduce((sum, arr) => sum + arr.length, 0),
            uptime: process.uptime(),
        };
    }
};
exports.TelemetryService = TelemetryService;
exports.TelemetryService = TelemetryService = TelemetryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_service_1.ConfigService !== "undefined" && config_service_1.ConfigService) === "function" ? _a : Object])
], TelemetryService);


/***/ }),

/***/ "./src/modules/ai-providers/ai-providers.controller.ts":
/*!*************************************************************!*\
  !*** ./src/modules/ai-providers/ai-providers.controller.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AiProvidersController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const ai_providers_service_1 = __webpack_require__(/*! ./ai-providers.service */ "./src/modules/ai-providers/ai-providers.service.ts");
let AiProvidersController = class AiProvidersController {
    constructor(aiProvidersService) {
        this.aiProvidersService = aiProvidersService;
    }
    async generateText(req, body) {
        const user = req.user;
        const { provider, ...request } = body;
        return this.aiProvidersService.generateText(user.tenantId, request, provider);
    }
    async chatCompletion(req, body) {
        const user = req.user;
        const { provider, ...request } = body;
        return this.aiProvidersService.chatCompletion(user.tenantId, request, provider);
    }
    getProviders(type) {
        return {
            providers: this.aiProvidersService.getAvailableProviders(type),
        };
    }
    async testProvider(req, body) {
        const user = req.user;
        return this.aiProvidersService.testProvider(user.tenantId, body.type, body.name);
    }
    getAiHealth() {
        const providers = this.aiProvidersService.getAvailableProviders();
        return {
            status: 'healthy',
            service: 'ai-providers',
            providersCount: providers.length,
            enabledProviders: providers.filter(p => p.enabled).length,
        };
    }
};
exports.AiProvidersController = AiProvidersController;
__decorate([
    (0, common_1.Post)('generate-text'),
    (0, swagger_1.ApiOperation)({ summary: 'Générer du texte via IA' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Texte généré avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Provider non disponible' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiProvidersController.prototype, "generateText", null);
__decorate([
    (0, common_1.Post)('chat-completion'),
    (0, swagger_1.ApiOperation)({ summary: 'Completion de chat via IA' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chat complété avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Provider non disponible' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiProvidersController.prototype, "chatCompletion", null);
__decorate([
    (0, common_1.Get)('providers'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les providers IA disponibles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des providers' }),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiProvidersController.prototype, "getProviders", null);
__decorate([
    (0, common_1.Post)('test-provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Tester un provider IA spécifique' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Résultat du test' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiProvidersController.prototype, "testProvider", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check des services IA' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service opérationnel' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AiProvidersController.prototype, "getAiHealth", null);
exports.AiProvidersController = AiProvidersController = __decorate([
    (0, swagger_1.ApiTags)('AI Providers'),
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof ai_providers_service_1.AiProvidersService !== "undefined" && ai_providers_service_1.AiProvidersService) === "function" ? _a : Object])
], AiProvidersController);


/***/ }),

/***/ "./src/modules/ai-providers/ai-providers.module.ts":
/*!*********************************************************!*\
  !*** ./src/modules/ai-providers/ai-providers.module.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AiProvidersModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const ai_providers_service_1 = __webpack_require__(/*! ./ai-providers.service */ "./src/modules/ai-providers/ai-providers.service.ts");
const ai_providers_controller_1 = __webpack_require__(/*! ./ai-providers.controller */ "./src/modules/ai-providers/ai-providers.controller.ts");
const gemini_provider_1 = __webpack_require__(/*! ./gemini/gemini.provider */ "./src/modules/ai-providers/gemini/gemini.provider.ts");
const registry_service_1 = __webpack_require__(/*! @core/registry/registry.service */ "./src/core/registry/registry.service.ts");
const config_service_1 = __webpack_require__(/*! @core/config/config.service */ "./src/core/config/config.service.ts");
const telemetry_service_1 = __webpack_require__(/*! @core/telemetry/telemetry.service */ "./src/core/telemetry/telemetry.service.ts");
const config_module_1 = __webpack_require__(/*! @core/config/config.module */ "./src/core/config/config.module.ts");
const telemetry_module_1 = __webpack_require__(/*! @core/telemetry/telemetry.module */ "./src/core/telemetry/telemetry.module.ts");
const registry_module_1 = __webpack_require__(/*! @core/registry/registry.module */ "./src/core/registry/registry.module.ts");
let AiProvidersModule = class AiProvidersModule {
    constructor(registryService, configService, telemetryService) {
        this.registryService = registryService;
        this.configService = configService;
        this.telemetryService = telemetryService;
    }
    async onModuleInit() {
        await this.registerProviders();
    }
    async registerProviders() {
        const geminiProvider = new gemini_provider_1.GeminiProvider(this.configService, this.telemetryService);
        geminiProvider.config.enabled = !!this.configService.ai.geminiApiKey;
        geminiProvider.config.metadata = {
            model: this.configService.ai.geminiModel,
            description: 'Google Gemini 2.5 - Large Language Model',
        };
        try {
            await geminiProvider.initialize();
            this.registryService.register('ai-text-generation', 'gemini', geminiProvider, geminiProvider.config);
            this.registryService.register('ai-chat-completion', 'gemini', geminiProvider, geminiProvider.config);
            console.log('✅ Provider Gemini enregistré avec succès');
        }
        catch (error) {
            console.warn(`⚠️ Échec de l'enregistrement du provider Gemini: ${error.message}`);
        }
    }
};
exports.AiProvidersModule = AiProvidersModule;
exports.AiProvidersModule = AiProvidersModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.CoreConfigModule, telemetry_module_1.TelemetryModule, registry_module_1.RegistryModule],
        providers: [
            ai_providers_service_1.AiProvidersService,
            gemini_provider_1.GeminiProvider,
        ],
        controllers: [ai_providers_controller_1.AiProvidersController],
        exports: [ai_providers_service_1.AiProvidersService],
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof registry_service_1.RegistryService !== "undefined" && registry_service_1.RegistryService) === "function" ? _a : Object, typeof (_b = typeof config_service_1.ConfigService !== "undefined" && config_service_1.ConfigService) === "function" ? _b : Object, typeof (_c = typeof telemetry_service_1.TelemetryService !== "undefined" && telemetry_service_1.TelemetryService) === "function" ? _c : Object])
], AiProvidersModule);


/***/ }),

/***/ "./src/modules/ai-providers/ai-providers.service.ts":
/*!**********************************************************!*\
  !*** ./src/modules/ai-providers/ai-providers.service.ts ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiProvidersService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AiProvidersService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const registry_service_1 = __webpack_require__(/*! @core/registry/registry.service */ "./src/core/registry/registry.service.ts");
const telemetry_service_1 = __webpack_require__(/*! @core/telemetry/telemetry.service */ "./src/core/telemetry/telemetry.service.ts");
let AiProvidersService = AiProvidersService_1 = class AiProvidersService {
    constructor(registryService, telemetryService) {
        this.registryService = registryService;
        this.telemetryService = telemetryService;
        this.logger = new common_1.Logger(AiProvidersService_1.name);
    }
    async generateText(tenantId, request, providerName) {
        const provider = this.getProvider('ai-text-generation', providerName);
        this.logger.log(`Génération de texte demandée pour tenant ${tenantId} avec ${provider.name}`);
        const response = await provider.generateText(tenantId, request);
        this.telemetryService.trackEvent({
            event: 'ai.text.generation.success',
            tenantId,
            metadata: {
                provider: provider.name,
                promptLength: request.prompt.length,
                tokensUsed: response.tokensUsed,
            },
        });
        return response;
    }
    async chatCompletion(tenantId, request, providerName) {
        const provider = this.getProvider('ai-chat-completion', providerName);
        if (!provider.chatCompletion) {
            throw new Error(`Provider ${provider.name} ne supporte pas le chat completion`);
        }
        this.logger.log(`Chat completion demandé pour tenant ${tenantId} avec ${provider.name}`);
        const response = await provider.chatCompletion(tenantId, request);
        this.telemetryService.trackEvent({
            event: 'ai.chat.completion.success',
            tenantId,
            metadata: {
                provider: provider.name,
                messagesCount: request.messages.length,
                tokensUsed: response.tokensUsed,
            },
        });
        return response;
    }
    getAvailableProviders(type) {
        if (type) {
            const providers = this.registryService.getByType(type);
            return providers.map(provider => ({
                name: provider.name,
                version: provider.version,
                capabilities: provider.capabilities,
                metrics: provider.getMetrics(),
                enabled: provider.isEnabled,
            }));
        }
        const allProviders = this.registryService.getProvidersInfo();
        return allProviders
            .filter(info => info.type.startsWith('ai-'))
            .map(info => ({
            name: info.name,
            version: info.config.version,
            capabilities: info.instance?.capabilities || {},
            metrics: info.metrics,
            enabled: info.config.enabled,
        }));
    }
    async testProvider(tenantId, providerType, providerName) {
        const startTime = Date.now();
        try {
            const provider = this.getProvider(providerType, providerName);
            const testRequest = {
                prompt: 'Dis simplement "Test réussi" en français.',
                maxTokens: 50,
                temperature: 0.1,
            };
            const response = await provider.generateText(tenantId, testRequest);
            const responseTime = Date.now() - startTime;
            this.logger.log(`Test du provider ${providerName} réussi pour tenant ${tenantId} (${responseTime}ms)`);
            return {
                success: true,
                response,
                responseTime,
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.logger.error(`Test du provider ${providerName} échoué pour tenant ${tenantId}: ${error.message}`);
            return {
                success: false,
                error: error.message,
                responseTime,
            };
        }
    }
    getProvider(type, name) {
        if (name) {
            const provider = this.registryService.get(type, name);
            if (!provider) {
                throw new common_1.NotFoundException(`Provider ${name} non trouvé pour le type ${type}`);
            }
            return provider;
        }
        const provider = this.registryService.getBest(type);
        if (!provider) {
            throw new common_1.NotFoundException(`Aucun provider disponible pour le type ${type}`);
        }
        return provider;
    }
};
exports.AiProvidersService = AiProvidersService;
exports.AiProvidersService = AiProvidersService = AiProvidersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof registry_service_1.RegistryService !== "undefined" && registry_service_1.RegistryService) === "function" ? _a : Object, typeof (_b = typeof telemetry_service_1.TelemetryService !== "undefined" && telemetry_service_1.TelemetryService) === "function" ? _b : Object])
], AiProvidersService);


/***/ }),

/***/ "./src/modules/ai-providers/gemini/gemini.provider.ts":
/*!************************************************************!*\
  !*** ./src/modules/ai-providers/gemini/gemini.provider.ts ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GeminiProvider_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeminiProvider = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const generative_ai_1 = __webpack_require__(/*! @google/generative-ai */ "@google/generative-ai");
const ai_provider_interface_1 = __webpack_require__(/*! @shared/interfaces/ai-provider.interface */ "./src/shared/interfaces/ai-provider.interface.ts");
const config_service_1 = __webpack_require__(/*! @core/config/config.service */ "./src/core/config/config.service.ts");
const telemetry_service_1 = __webpack_require__(/*! @core/telemetry/telemetry.service */ "./src/core/telemetry/telemetry.service.ts");
let GeminiProvider = GeminiProvider_1 = class GeminiProvider extends ai_provider_interface_1.BaseAiProvider {
    constructor(configService, telemetryService) {
        super({
            name: 'gemini',
            version: '2.5',
            enabled: true,
            priority: 100,
        });
        this.configService = configService;
        this.telemetryService = telemetryService;
        this.name = 'gemini';
        this.version = '2.5';
        this.capabilities = {
            textGeneration: true,
            chatCompletion: true,
            functionCalling: true,
            streaming: true,
            embedding: false,
            imageGeneration: false,
        };
        this.logger = new common_1.Logger(GeminiProvider_1.name);
    }
    async initialize() {
        try {
            const apiKey = this.configService.ai.geminiApiKey;
            if (!apiKey) {
                throw new Error('Clé API Gemini manquante dans la configuration');
            }
            this.client = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.model = this.client.getGenerativeModel({
                model: this.configService.ai.geminiModel
            });
            this.logger.log(`Provider Gemini initialisé avec le modèle: ${this.configService.ai.geminiModel}`);
        }
        catch (error) {
            this.logger.error(`Erreur d'initialisation Gemini: ${error.message}`);
            throw error;
        }
    }
    async healthCheck() {
        try {
            const result = await this.model.generateContent('Test de santé');
            return !!(result.response?.text());
        }
        catch (error) {
            this.logger.warn(`Health check Gemini échoué: ${error.message}`);
            return false;
        }
    }
    async generateText(tenantId, request) {
        const startTime = Date.now();
        try {
            this.validateTenant(tenantId);
            this.validateRequest(request);
            const prompt = this.buildPrompt(request);
            const config = this.buildGenerationConfig(request);
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: config,
            });
            const responseText = result.response.text();
            const tokensUsed = this.estimateTokens(request.prompt + responseText);
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, tokensUsed);
            if (this.telemetryService) {
                this.telemetryService.trackAiProviderCall(tenantId, this.name, this.configService.ai.geminiModel, tokensUsed, responseTime);
            }
            this.logger.debug(`Génération de texte réussie pour le tenant ${tenantId} (${responseTime}ms, ${tokensUsed} tokens)`);
            return {
                text: responseText,
                tokensUsed,
                finishReason: 'stop',
                metadata: {
                    model: this.configService.ai.geminiModel,
                    responseTime,
                },
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, 0, true);
            this.logger.error(`Erreur génération Gemini pour tenant ${tenantId}: ${error.message}`);
            this.handleError(error, 'Gemini text generation');
        }
    }
    async chatCompletion(tenantId, request) {
        const startTime = Date.now();
        try {
            this.validateTenant(tenantId);
            this.validateRequest(request);
            const contents = this.convertMessages(request.messages);
            const config = this.buildGenerationConfig(request);
            const result = await this.model.generateContent({
                contents,
                generationConfig: config,
            });
            const responseText = result.response.text();
            const tokensUsed = this.estimateTokens(request.messages.map(m => m.content).join('') + responseText);
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, tokensUsed);
            if (this.telemetryService) {
                this.telemetryService.trackAiProviderCall(tenantId, this.name, this.configService.ai.geminiModel, tokensUsed, responseTime);
            }
            this.logger.debug(`Chat completion réussi pour le tenant ${tenantId} (${responseTime}ms, ${tokensUsed} tokens)`);
            return {
                message: {
                    role: 'assistant',
                    content: responseText,
                },
                tokensUsed,
                finishReason: 'stop',
                metadata: {
                    model: this.configService.ai.geminiModel,
                    responseTime,
                },
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, 0, true);
            this.logger.error(`Erreur chat completion Gemini pour tenant ${tenantId}: ${error.message}`);
            this.handleError(error, 'Gemini chat completion');
        }
    }
    buildPrompt(request) {
        let prompt = '';
        if (request.systemPrompt) {
            prompt += `${request.systemPrompt}\n\n`;
        }
        prompt += this.sanitizePrompt(request.prompt);
        return prompt;
    }
    buildGenerationConfig(request) {
        return {
            maxOutputTokens: request.maxTokens || this.configService.ai.maxTokens,
            temperature: request.temperature ?? this.configService.ai.temperature,
            stopSequences: request.stopSequences || [],
        };
    }
    convertMessages(messages) {
        return messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));
    }
    estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
    getMetrics() {
        return this.metrics;
    }
};
exports.GeminiProvider = GeminiProvider;
exports.GeminiProvider = GeminiProvider = GeminiProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_service_1.ConfigService !== "undefined" && config_service_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof telemetry_service_1.TelemetryService !== "undefined" && telemetry_service_1.TelemetryService) === "function" ? _b : Object])
], GeminiProvider);


/***/ }),

/***/ "./src/shared/interfaces/ai-provider.interface.ts":
/*!********************************************************!*\
  !*** ./src/shared/interfaces/ai-provider.interface.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseAiProvider = void 0;
const provider_interface_1 = __webpack_require__(/*! ./provider.interface */ "./src/shared/interfaces/provider.interface.ts");
class BaseAiProvider extends provider_interface_1.BaseProvider {
    async chatCompletion(tenantId, request) {
        if (!this.capabilities.chatCompletion) {
            throw new Error(`Provider ${this.name} ne supporte pas le chat completion`);
        }
        throw new Error('Method not implemented');
    }
    async generateEmbedding(tenantId, request) {
        if (!this.capabilities.embedding) {
            throw new Error(`Provider ${this.name} ne supporte pas les embeddings`);
        }
        throw new Error('Method not implemented');
    }
    async generateTextStream(tenantId, request) {
        if (!this.capabilities.streaming) {
            throw new Error(`Provider ${this.name} ne supporte pas le streaming`);
        }
        throw new Error('Method not implemented');
    }
    validateRequest(request) {
        if (!request) {
            throw new Error('Request is required');
        }
    }
    validateTenant(tenantId) {
        if (!tenantId) {
            throw new Error('Tenant ID is required');
        }
    }
    sanitizePrompt(prompt) {
        return prompt.trim().substring(0, 10000);
    }
    handleError(error, context) {
        const message = error?.message || 'Unknown error';
        const errorWithContext = new Error(`${context}: ${message}`);
        this.updateMetrics(0, 0, true);
        throw errorWithContext;
    }
}
exports.BaseAiProvider = BaseAiProvider;


/***/ }),

/***/ "./src/shared/interfaces/provider.interface.ts":
/*!*****************************************************!*\
  !*** ./src/shared/interfaces/provider.interface.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseProvider = void 0;
class BaseProvider {
    constructor(config) {
        this.metrics = {
            totalCalls: 0,
            totalTokens: 0,
            averageLatency: 0,
            errorRate: 0,
        };
        this.config = config;
    }
    get isEnabled() {
        return this.config.enabled;
    }
    get priority() {
        return this.config.priority;
    }
    updateMetrics(responseTime, tokensUsed = 0, isError = false) {
        this.metrics.totalCalls++;
        this.metrics.totalTokens += tokensUsed;
        this.metrics.lastUsed = new Date();
        this.metrics.averageLatency =
            (this.metrics.averageLatency * (this.metrics.totalCalls - 1) + responseTime) / this.metrics.totalCalls;
        if (isError) {
            const previousErrors = this.metrics.errorRate * (this.metrics.totalCalls - 1);
            this.metrics.errorRate = (previousErrors + 1) / this.metrics.totalCalls;
        }
        else {
            const previousErrors = this.metrics.errorRate * (this.metrics.totalCalls - 1);
            this.metrics.errorRate = previousErrors / this.metrics.totalCalls;
        }
    }
}
exports.BaseProvider = BaseProvider;


/***/ }),

/***/ "@google/generative-ai":
/*!****************************************!*\
  !*** external "@google/generative-ai" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("@google/generative-ai");

/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/jwt":
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),

/***/ "@nestjs/passport":
/*!***********************************!*\
  !*** external "@nestjs/passport" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),

/***/ "@nestjs/swagger":
/*!**********************************!*\
  !*** external "@nestjs/swagger" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),

/***/ "@nestjs/throttler":
/*!************************************!*\
  !*** external "@nestjs/throttler" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("@nestjs/throttler");

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),

/***/ "class-transformer":
/*!************************************!*\
  !*** external "class-transformer" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "passport-jwt":
/*!*******************************!*\
  !*** external "passport-jwt" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./src/app.module.ts");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        credentials: true,
    });
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('WikiPro Backend API')
            .setDescription('API pour la plateforme WikiPro de gestion de connaissances')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 WikiPro Backend démarré sur http://localhost:${port}`);
    console.log(`📚 Documentation API: http://localhost:${port}/api/docs`);
}
bootstrap();

})();

/******/ })()
;