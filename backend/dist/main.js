/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(5);
const throttler_1 = __webpack_require__(6);
const database_module_1 = __webpack_require__(7);
const config_module_1 = __webpack_require__(15);
const auth_module_1 = __webpack_require__(20);
const telemetry_module_1 = __webpack_require__(35);
const registry_module_1 = __webpack_require__(38);
const tenant_module_1 = __webpack_require__(33);
const user_module_1 = __webpack_require__(32);
const session_module_1 = __webpack_require__(41);
const ai_module_1 = __webpack_require__(48);
const ai_providers_module_1 = __webpack_require__(68);
const app_controller_1 = __webpack_require__(74);
const app_service_1 = __webpack_require__(75);
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
            database_module_1.DatabaseModule,
            config_module_1.CoreConfigModule,
            tenant_module_1.TenantModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            session_module_1.SessionModule,
            telemetry_module_1.TelemetryModule,
            registry_module_1.RegistryModule,
            ai_module_1.AIModule,
            ai_providers_module_1.AiProvidersModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/throttler");

/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(8);
const config_1 = __webpack_require__(5);
const entities_1 = __webpack_require__(9);
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', ''),
                    database: configService.get('DB_NAME', 'wikipro'),
                    entities: [entities_1.Tenant, entities_1.User, entities_1.Session, entities_1.Conversation],
                    migrations: [__dirname + '/migrations/*.js'],
                    migrationsRun: configService.get('DB_RUN_MIGRATIONS', false),
                    synchronize: configService.get('DB_SYNCHRONIZE', false),
                    logging: configService.get('DB_LOGGING', false),
                    ssl: configService.get('DB_SSL', false)
                        ? {
                            rejectUnauthorized: configService.get('DB_SSL_REJECT_UNAUTHORIZED', false),
                        }
                        : false,
                    extra: {
                        application_name: 'wikipro-backend',
                        max: configService.get('DB_POOL_MAX', 20),
                        idleTimeoutMillis: configService.get('DB_POOL_IDLE_TIMEOUT', 30000),
                        connectionTimeoutMillis: configService.get('DB_POOL_CONNECTION_TIMEOUT', 2000),
                    },
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([entities_1.Tenant, entities_1.User, entities_1.Session, entities_1.Conversation]),
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], DatabaseModule);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Conversation = exports.AIProvider = exports.Session = exports.UserStatus = exports.UserRole = exports.User = exports.Tenant = void 0;
var tenant_entity_1 = __webpack_require__(10);
Object.defineProperty(exports, "Tenant", ({ enumerable: true, get: function () { return tenant_entity_1.Tenant; } }));
var user_entity_1 = __webpack_require__(12);
Object.defineProperty(exports, "User", ({ enumerable: true, get: function () { return user_entity_1.User; } }));
Object.defineProperty(exports, "UserRole", ({ enumerable: true, get: function () { return user_entity_1.UserRole; } }));
Object.defineProperty(exports, "UserStatus", ({ enumerable: true, get: function () { return user_entity_1.UserStatus; } }));
var session_entity_1 = __webpack_require__(13);
Object.defineProperty(exports, "Session", ({ enumerable: true, get: function () { return session_entity_1.Session; } }));
Object.defineProperty(exports, "AIProvider", ({ enumerable: true, get: function () { return session_entity_1.AIProvider; } }));
var conversation_entity_1 = __webpack_require__(14);
Object.defineProperty(exports, "Conversation", ({ enumerable: true, get: function () { return conversation_entity_1.Conversation; } }));


/***/ }),
/* 10 */
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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Tenant = void 0;
const typeorm_1 = __webpack_require__(11);
const user_entity_1 = __webpack_require__(12);
let Tenant = class Tenant {
    constructor(partial = {}) {
        Object.assign(this, partial);
    }
    isActive() {
        return this.is_active;
    }
    isPlanExpired() {
        if (!this.plan_expires_at)
            return false;
        return new Date() > this.plan_expires_at;
    }
    canAccess() {
        return this.isActive() && !this.isPlanExpired();
    }
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "logo_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], Tenant.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'trial' }),
    __metadata("design:type", String)
], Tenant.prototype, "plan_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], Tenant.prototype, "plan_expires_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], Tenant.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], Tenant.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.tenant, { cascade: true }),
    __metadata("design:type", Array)
], Tenant.prototype, "users", void 0);
exports.Tenant = Tenant = __decorate([
    (0, typeorm_1.Entity)('tenants'),
    __metadata("design:paramtypes", [typeof (_a = typeof Partial !== "undefined" && Partial) === "function" ? _a : Object])
], Tenant);


/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 12 */
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
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = exports.UserStatus = exports.UserRole = void 0;
const typeorm_1 = __webpack_require__(11);
const tenant_entity_1 = __webpack_require__(10);
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super-admin";
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["PENDING"] = "pending";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
let User = class User {
    constructor(partial = {}) {
        Object.assign(this, partial);
    }
    isActive() {
        return this.status === UserStatus.ACTIVE;
    }
    isAdmin() {
        return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
    }
    isSuperAdmin() {
        return this.role === UserRole.SUPER_ADMIN;
    }
    canAccess() {
        return this.isActive() && this.tenant?.canAccess();
    }
    hasRole(role) {
        return this.role === role;
    }
    getFullName() {
        if (this.first_name && this.last_name) {
            return `${this.first_name} ${this.last_name}`;
        }
        return this.name || this.email;
    }
    updateLastLogin(ip) {
        this.last_login_at = new Date();
        if (ip) {
            this.last_login_ip = ip;
        }
    }
    toPublic() {
        const { password_hash, ...publicData } = this;
        return publicData;
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], User.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', select: false }),
    __metadata("design:type", String)
], User.prototype, "password_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatar_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], User.prototype, "preferences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], User.prototype, "last_login_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'inet', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "last_login_ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], User.prototype, "email_verified_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], User.prototype, "password_changed_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", typeof (_f = typeof Date !== "undefined" && Date) === "function" ? _f : Object)
], User.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", typeof (_g = typeof Date !== "undefined" && Date) === "function" ? _g : Object)
], User.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, (tenant) => tenant.users, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", typeof (_h = typeof tenant_entity_1.Tenant !== "undefined" && tenant_entity_1.Tenant) === "function" ? _h : Object)
], User.prototype, "tenant", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users'),
    (0, typeorm_1.Unique)('unique_tenant_email', ['tenant_id', 'email']),
    __metadata("design:paramtypes", [typeof (_a = typeof Partial !== "undefined" && Partial) === "function" ? _a : Object])
], User);


/***/ }),
/* 13 */
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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Session = exports.AIProvider = void 0;
const typeorm_1 = __webpack_require__(11);
const user_entity_1 = __webpack_require__(12);
const conversation_entity_1 = __webpack_require__(14);
var AIProvider;
(function (AIProvider) {
    AIProvider["OPENAI"] = "openai";
    AIProvider["ANTHROPIC"] = "anthropic";
    AIProvider["GEMINI"] = "gemini";
})(AIProvider || (exports.AIProvider = AIProvider = {}));
let Session = class Session {
    constructor(partial = {}) {
        Object.assign(this, partial);
    }
    getConversationCount() {
        return this.conversations?.length || 0;
    }
    getLastActivity() {
        if (!this.conversations || this.conversations.length === 0) {
            return this.created_at;
        }
        const lastConversation = this.conversations
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0];
        return lastConversation.created_at;
    }
    isProviderSupported(provider) {
        return Object.values(AIProvider).includes(provider);
    }
    updateMetadata(key, value) {
        this.metadata = {
            ...this.metadata,
            [key]: value,
        };
    }
    toPublic() {
        return {
            id: this.id,
            title: this.title,
            provider: this.provider,
            metadata: this.metadata,
            conversation_count: this.getConversationCount(),
            last_activity: this.getLastActivity(),
            created_at: this.created_at,
            updated_at: this.updated_at,
        };
    }
};
exports.Session = Session;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Session.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Session.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Session.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AIProvider,
    }),
    __metadata("design:type", String)
], Session.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '{}' }),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], Session.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], Session.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], Session.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", typeof (_e = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _e : Object)
], Session.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conversation_entity_1.Conversation, (conversation) => conversation.session, {
        cascade: ['soft-remove'],
    }),
    __metadata("design:type", Array)
], Session.prototype, "conversations", void 0);
exports.Session = Session = __decorate([
    (0, typeorm_1.Entity)('ai_sessions'),
    (0, typeorm_1.Index)('idx_ai_sessions_user_created', ['user_id', 'created_at']),
    (0, typeorm_1.Index)('idx_ai_sessions_provider', ['provider']),
    __metadata("design:paramtypes", [typeof (_a = typeof Partial !== "undefined" && Partial) === "function" ? _a : Object])
], Session);


/***/ }),
/* 14 */
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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Conversation = void 0;
const typeorm_1 = __webpack_require__(11);
const session_entity_1 = __webpack_require__(13);
let Conversation = class Conversation {
    constructor(partial = {}) {
        Object.assign(this, partial);
    }
    hasResponse() {
        return !!this.response && this.response.trim().length > 0;
    }
    getTokenEfficiency() {
        if (!this.tokens_used || !this.processing_time_ms) {
            return 0;
        }
        return this.tokens_used / (this.processing_time_ms / 1000);
    }
    isProcessingComplete() {
        return this.hasResponse() && this.processing_time_ms > 0;
    }
    getMessageLength() {
        return this.message?.length || 0;
    }
    getResponseLength() {
        return this.response?.length || 0;
    }
    updateMetadata(key, value) {
        this.metadata = {
            ...this.metadata,
            [key]: value,
        };
    }
    getCompressionRatio() {
        if (!this.hasResponse())
            return 0;
        const inputLength = this.getMessageLength();
        const outputLength = this.getResponseLength();
        return inputLength > 0 ? outputLength / inputLength : 0;
    }
    toPublic() {
        return {
            id: this.id,
            message: this.message,
            response: this.response,
            provider_used: this.provider_used,
            tokens_used: this.tokens_used,
            processing_time_ms: this.processing_time_ms,
            metadata: this.metadata || {},
            has_response: this.hasResponse(),
            is_complete: this.isProcessingComplete(),
            created_at: this.created_at,
            statistics: {
                message_length: this.getMessageLength(),
                response_length: this.getResponseLength(),
                token_efficiency: this.getTokenEfficiency(),
                compression_ratio: this.getCompressionRatio(),
            },
        };
    }
};
exports.Conversation = Conversation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Conversation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Conversation.prototype, "session_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Conversation.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Conversation.prototype, "response", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: session_entity_1.AIProvider,
        nullable: true,
    }),
    __metadata("design:type", typeof (_b = typeof session_entity_1.AIProvider !== "undefined" && session_entity_1.AIProvider) === "function" ? _b : Object)
], Conversation.prototype, "provider_used", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Conversation.prototype, "tokens_used", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Conversation.prototype, "processing_time_ms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], Conversation.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], Conversation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => session_entity_1.Session, (session) => session.conversations, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'session_id' }),
    __metadata("design:type", typeof (_e = typeof session_entity_1.Session !== "undefined" && session_entity_1.Session) === "function" ? _e : Object)
], Conversation.prototype, "session", void 0);
exports.Conversation = Conversation = __decorate([
    (0, typeorm_1.Entity)('conversations'),
    (0, typeorm_1.Index)('idx_conversations_session_created', ['session_id', 'created_at']),
    (0, typeorm_1.Index)('idx_conversations_provider', ['provider_used']),
    __metadata("design:paramtypes", [typeof (_a = typeof Partial !== "undefined" && Partial) === "function" ? _a : Object])
], Conversation);


/***/ }),
/* 15 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CoreConfigModule = void 0;
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(5);
const config_service_1 = __webpack_require__(16);
const config_validation_1 = __webpack_require__(17);
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
/* 16 */
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
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(5);
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
/* 17 */
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
const class_transformer_1 = __webpack_require__(18);
const class_validator_1 = __webpack_require__(19);
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
/* 18 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 19 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 20 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(21);
const passport_1 = __webpack_require__(22);
const auth_service_1 = __webpack_require__(23);
const auth_controller_1 = __webpack_require__(25);
const jwt_strategy_1 = __webpack_require__(28);
const tenant_guard_1 = __webpack_require__(30);
const jwt_auth_guard_1 = __webpack_require__(31);
const config_service_1 = __webpack_require__(16);
const config_module_1 = __webpack_require__(15);
const user_module_1 = __webpack_require__(32);
const tenant_module_1 = __webpack_require__(33);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.CoreConfigModule,
            user_module_1.UserModule,
            tenant_module_1.TenantModule,
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
            jwt_auth_guard_1.JwtAuthGuard,
        ],
        exports: [auth_service_1.AuthService, tenant_guard_1.TenantGuard, jwt_auth_guard_1.JwtAuthGuard],
    })
], AuthModule);


/***/ }),
/* 21 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 22 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 23 */
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
const common_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(21);
const bcrypt = __webpack_require__(24);
const config_service_1 = __webpack_require__(16);
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
/* 24 */
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),
/* 25 */
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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = exports.VerifyTokenDto = exports.LoginDto = void 0;
const common_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(22);
const swagger_1 = __webpack_require__(3);
const class_validator_1 = __webpack_require__(19);
const auth_service_1 = __webpack_require__(23);
const user_service_1 = __webpack_require__(26);
const tenant_service_1 = __webpack_require__(27);
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], LoginDto.prototype, "tenant_id", void 0);
class VerifyTokenDto {
}
exports.VerifyTokenDto = VerifyTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyTokenDto.prototype, "token", void 0);
let AuthController = AuthController_1 = class AuthController {
    constructor(authService, userService, tenantService) {
        this.authService = authService;
        this.userService = userService;
        this.tenantService = tenantService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async login(loginDto, ip) {
        this.logger.log(`Tentative de connexion: ${loginDto.email} pour le tenant ${loginDto.tenant_id}`);
        const tenant = await this.tenantService.findById(loginDto.tenant_id);
        if (!tenant.canAccess()) {
            throw new common_1.UnauthorizedException('Le tenant n\'est pas accessible');
        }
        const user = await this.userService.findByEmailAndTenant(loginDto.email, loginDto.tenant_id);
        if (!user) {
            this.logger.warn(`Utilisateur introuvable: ${loginDto.email} pour le tenant ${loginDto.tenant_id}`);
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        if (!user.canAccess()) {
            this.logger.warn(`Utilisateur inactif: ${loginDto.email}`);
            throw new common_1.UnauthorizedException('Compte utilisateur inactif');
        }
        const isPasswordValid = await this.userService.validatePassword(user, loginDto.password);
        if (!isPasswordValid) {
            this.logger.warn(`Mot de passe incorrect pour: ${loginDto.email}`);
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const jwtPayload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenant_id,
            roles: [user.role],
        };
        const authResult = await this.authService.generateTokens(jwtPayload);
        await this.userService.updateLastLogin(user.id, user.tenant_id, ip);
        this.logger.log(`Connexion réussie: ${user.email} (tenant: ${tenant.slug})`);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.getFullName(),
                role: user.role,
                tenant_id: user.tenant_id,
            },
            access_token: authResult.accessToken,
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
            },
        };
    }
    async verifyToken(req) {
        const user = req.user;
        const tenant = await this.tenantService.findById(user.tenantId);
        if (!tenant.canAccess()) {
            throw new common_1.UnauthorizedException('Le tenant n\'est plus accessible');
        }
        const dbUser = await this.userService.findById(user.sub, user.tenantId);
        if (!dbUser.canAccess()) {
            throw new common_1.UnauthorizedException('L\'utilisateur n\'est plus actif');
        }
        this.logger.log(`Token vérifié pour: ${user.email} (tenant: ${tenant.slug})`);
        return {
            valid: true,
            user: {
                id: user.sub,
                email: user.email,
                tenant_id: user.tenantId,
                roles: user.roles,
            },
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
            },
        };
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
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Authentification avec tenant_id' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Authentification réussie' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Identifiants invalides' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, String]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('verify'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vérification du token JWT' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token valide' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token invalide' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AuthController.prototype, "verifyToken", null);
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
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('hash-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Hasher un mot de passe (utilitaire)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mot de passe hashé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
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
    (0, common_1.Controller)('api/auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object, typeof (_b = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _b : Object, typeof (_c = typeof tenant_service_1.TenantService !== "undefined" && tenant_service_1.TenantService) === "function" ? _c : Object])
], AuthController);


/***/ }),
/* 26 */
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
var UserService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserService = void 0;
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
const bcrypt = __webpack_require__(24);
const entities_1 = __webpack_require__(9);
let UserService = UserService_1 = class UserService {
    constructor(userRepository, tenantRepository) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.logger = new common_1.Logger(UserService_1.name);
    }
    async create(createUserDto) {
        const tenant = await this.tenantRepository.findOne({
            where: { id: createUserDto.tenant_id },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant avec l'ID '${createUserDto.tenant_id}' introuvable`);
        }
        if (!tenant.canAccess()) {
            throw new common_1.UnauthorizedException('Le tenant n\'est pas accessible');
        }
        const existingUser = await this.userRepository.findOne({
            where: {
                tenant_id: createUserDto.tenant_id,
                email: createUserDto.email,
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException(`Un utilisateur avec l'email '${createUserDto.email}' existe déjà pour ce tenant`);
        }
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(createUserDto.password, saltRounds);
        const user = this.userRepository.create({
            ...createUserDto,
            password_hash,
            role: createUserDto.role || entities_1.UserRole.USER,
            status: entities_1.UserStatus.ACTIVE,
            password_changed_at: new Date(),
        });
        const savedUser = await this.userRepository.save(user);
        this.logger.log(`Nouvel utilisateur créé: ${savedUser.email} pour le tenant ${tenant.slug}`);
        return savedUser;
    }
    async findByEmailAndTenant(email, tenantId) {
        const user = await this.userRepository.findOne({
            where: {
                email,
                tenant_id: tenantId,
            },
            relations: ['tenant'],
            select: [
                'id',
                'tenant_id',
                'email',
                'name',
                'first_name',
                'last_name',
                'password_hash',
                'role',
                'status',
                'last_login_at',
                'created_at',
            ],
        });
        return user;
    }
    async findById(id, tenantId) {
        const user = await this.userRepository.findOne({
            where: {
                id,
                tenant_id: tenantId,
            },
            relations: ['tenant'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID '${id}' introuvable`);
        }
        return user;
    }
    async findAllByTenant(tenantId) {
        return this.userRepository.find({
            where: { tenant_id: tenantId },
            relations: ['tenant'],
            order: { created_at: 'DESC' },
        });
    }
    async update(id, tenantId, updateUserDto) {
        const user = await this.findById(id, tenantId);
        Object.assign(user, updateUserDto);
        const updatedUser = await this.userRepository.save(user);
        this.logger.log(`Utilisateur mis à jour: ${updatedUser.email}`);
        return updatedUser;
    }
    async changePassword(id, tenantId, changePasswordDto) {
        const user = await this.userRepository.findOne({
            where: { id, tenant_id: tenantId },
            select: ['id', 'email', 'password_hash'],
        });
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur introuvable');
        }
        const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            throw new common_1.UnauthorizedException('Mot de passe actuel incorrect');
        }
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);
        await this.userRepository.update(id, {
            password_hash: newPasswordHash,
            password_changed_at: new Date(),
        });
        this.logger.log(`Mot de passe changé pour l'utilisateur: ${user.email}`);
    }
    async validatePassword(user, password) {
        return bcrypt.compare(password, user.password_hash);
    }
    async updateLastLogin(id, tenantId, ip) {
        const updateData = {
            last_login_at: new Date(),
        };
        if (ip) {
            updateData.last_login_ip = ip;
        }
        await this.userRepository.update({ id, tenant_id: tenantId }, updateData);
    }
    async remove(id, tenantId) {
        const user = await this.findById(id, tenantId);
        await this.userRepository.remove(user);
        this.logger.log(`Utilisateur supprimé: ${user.email}`);
    }
    async deactivate(id, tenantId) {
        const user = await this.findById(id, tenantId);
        user.status = entities_1.UserStatus.INACTIVE;
        const updatedUser = await this.userRepository.save(user);
        this.logger.log(`Utilisateur désactivé: ${updatedUser.email}`);
        return updatedUser;
    }
    async activate(id, tenantId) {
        const user = await this.findById(id, tenantId);
        user.status = entities_1.UserStatus.ACTIVE;
        const updatedUser = await this.userRepository.save(user);
        this.logger.log(`Utilisateur activé: ${updatedUser.email}`);
        return updatedUser;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Tenant)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], UserService);


/***/ }),
/* 27 */
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
var TenantService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenantService = void 0;
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
const entities_1 = __webpack_require__(9);
let TenantService = TenantService_1 = class TenantService {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
        this.logger = new common_1.Logger(TenantService_1.name);
    }
    async create(createTenantDto) {
        const existingTenant = await this.tenantRepository.findOne({
            where: { slug: createTenantDto.slug },
        });
        if (existingTenant) {
            throw new common_1.ConflictException(`Un tenant avec le slug '${createTenantDto.slug}' existe déjà`);
        }
        const tenant = this.tenantRepository.create({
            ...createTenantDto,
            is_active: true,
            plan_type: createTenantDto.plan_type || 'trial',
        });
        const savedTenant = await this.tenantRepository.save(tenant);
        this.logger.log(`Nouveau tenant créé: ${savedTenant.name} (${savedTenant.slug})`);
        return savedTenant;
    }
    async findAll() {
        return this.tenantRepository.find({
            order: { created_at: 'DESC' },
        });
    }
    async findBySlug(slug) {
        const tenant = await this.tenantRepository.findOne({
            where: { slug },
            relations: ['users'],
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant avec le slug '${slug}' introuvable`);
        }
        return tenant;
    }
    async findById(id) {
        const tenant = await this.tenantRepository.findOne({
            where: { id },
            relations: ['users'],
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant avec l'ID '${id}' introuvable`);
        }
        return tenant;
    }
    async update(id, updateTenantDto) {
        const tenant = await this.findById(id);
        Object.assign(tenant, updateTenantDto);
        const updatedTenant = await this.tenantRepository.save(tenant);
        this.logger.log(`Tenant mis à jour: ${updatedTenant.name} (${updatedTenant.slug})`);
        return updatedTenant;
    }
    async remove(id) {
        const tenant = await this.findById(id);
        await this.tenantRepository.remove(tenant);
        this.logger.log(`Tenant supprimé: ${tenant.name} (${tenant.slug})`);
    }
    async validateTenantAccess(tenantId) {
        const tenant = await this.findById(tenantId);
        return tenant.canAccess();
    }
    async getTenantStats(tenantId) {
        const tenant = await this.tenantRepository
            .createQueryBuilder('tenant')
            .leftJoin('tenant.users', 'user')
            .select([
            'tenant.id',
            'tenant.is_active',
            'tenant.plan_type',
            'tenant.created_at',
            'COUNT(user.id) as userCount'
        ])
            .where('tenant.id = :tenantId', { tenantId })
            .groupBy('tenant.id')
            .getRawOne();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant avec l'ID '${tenantId}' introuvable`);
        }
        return {
            userCount: parseInt(tenant.userCount) || 0,
            isActive: tenant.tenant_is_active,
            planType: tenant.tenant_plan_type,
            createdAt: tenant.tenant_created_at,
        };
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = TenantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Tenant)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], TenantService);


/***/ }),
/* 28 */
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
const passport_jwt_1 = __webpack_require__(29);
const passport_1 = __webpack_require__(22);
const common_1 = __webpack_require__(2);
const auth_service_1 = __webpack_require__(23);
const config_service_1 = __webpack_require__(16);
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
/* 29 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 30 */
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
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(1);
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
/* 31 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(22);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    canActivate(context) {
        return super.canActivate(context);
    }
    handleRequest(err, user, info, context) {
        const request = context.switchToHttp().getRequest();
        if (err || !user) {
            const authHeader = request.headers.authorization;
            if (!authHeader) {
                throw new common_1.UnauthorizedException('Token d\'authentification manquant');
            }
            if (!authHeader.startsWith('Bearer ')) {
                throw new common_1.UnauthorizedException('Format de token invalide. Utilisez: Bearer <token>');
            }
            if (info?.name === 'TokenExpiredError') {
                throw new common_1.UnauthorizedException('Token d\'authentification expiré');
            }
            if (info?.name === 'JsonWebTokenError') {
                throw new common_1.UnauthorizedException('Token d\'authentification invalide');
            }
            throw new common_1.UnauthorizedException('Authentification échouée');
        }
        if (user.status !== 'active') {
            throw new common_1.UnauthorizedException('Compte utilisateur inactif');
        }
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 32 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserModule = void 0;
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(8);
const entities_1 = __webpack_require__(9);
const user_service_1 = __webpack_require__(26);
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([entities_1.User, entities_1.Tenant])],
        providers: [user_service_1.UserService],
        exports: [user_service_1.UserService],
    })
], UserModule);


/***/ }),
/* 33 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenantModule = void 0;
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(8);
const entities_1 = __webpack_require__(9);
const tenant_service_1 = __webpack_require__(27);
const tenant_controller_1 = __webpack_require__(34);
let TenantModule = class TenantModule {
};
exports.TenantModule = TenantModule;
exports.TenantModule = TenantModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([entities_1.Tenant])],
        controllers: [tenant_controller_1.TenantController],
        providers: [tenant_service_1.TenantService],
        exports: [tenant_service_1.TenantService],
    })
], TenantModule);


/***/ }),
/* 34 */
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
var TenantController_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenantController = void 0;
const common_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(22);
const tenant_guard_1 = __webpack_require__(30);
const tenant_service_1 = __webpack_require__(27);
let TenantController = TenantController_1 = class TenantController {
    constructor(tenantService) {
        this.tenantService = tenantService;
        this.logger = new common_1.Logger(TenantController_1.name);
    }
    async create(createTenantDto) {
        this.logger.log(`Création d'un nouveau tenant: ${createTenantDto.slug}`);
        return this.tenantService.create(createTenantDto);
    }
    async findAll() {
        return this.tenantService.findAll();
    }
    async getProfile(slug, req) {
        const tenant = await this.tenantService.findBySlug(slug);
        if (req.user.tenantId !== tenant.id) {
            this.logger.warn(`Tentative d'accès cross-tenant: utilisateur ${req.user.email} ` +
                `(tenant: ${req.user.tenantId}) tentant d'accéder au profil du tenant ${tenant.id}`);
            throw new Error('Accès interdit - Violation de l\'isolation tenant');
        }
        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            description: tenant.description,
            logo_url: tenant.logo_url,
            plan_type: tenant.plan_type,
            is_active: tenant.is_active,
            created_at: tenant.created_at,
            stats: await this.tenantService.getTenantStats(tenant.id),
        };
    }
    async findOne(id) {
        return this.tenantService.findById(id);
    }
    async update(id, updateTenantDto) {
        return this.tenantService.update(id, updateTenantDto);
    }
    async remove(id) {
        await this.tenantService.remove(id);
        return { message: 'Tenant supprimé avec succès' };
    }
    async getStats(id) {
        return this.tenantService.getTenantStats(id);
    }
};
exports.TenantController = TenantController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof tenant_service_1.CreateTenantDto !== "undefined" && tenant_service_1.CreateTenantDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':slug/profile'),
    (0, common_1.UseGuards)(tenant_guard_1.TenantGuard),
    (0, tenant_guard_1.TenantContext)(),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof tenant_service_1.UpdateTenantDto !== "undefined" && tenant_service_1.UpdateTenantDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getStats", null);
exports.TenantController = TenantController = TenantController_1 = __decorate([
    (0, common_1.Controller)('api/tenants'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [typeof (_a = typeof tenant_service_1.TenantService !== "undefined" && tenant_service_1.TenantService) === "function" ? _a : Object])
], TenantController);


/***/ }),
/* 35 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TelemetryModule = void 0;
const common_1 = __webpack_require__(2);
const telemetry_service_1 = __webpack_require__(36);
const metrics_controller_1 = __webpack_require__(37);
const config_module_1 = __webpack_require__(15);
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
/* 36 */
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
const common_1 = __webpack_require__(2);
const config_service_1 = __webpack_require__(16);
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
/* 37 */
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
const common_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(22);
const swagger_1 = __webpack_require__(3);
const telemetry_service_1 = __webpack_require__(36);
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
/* 38 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegistryModule = void 0;
const common_1 = __webpack_require__(2);
const registry_service_1 = __webpack_require__(39);
const registry_controller_1 = __webpack_require__(40);
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
/* 39 */
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
const common_1 = __webpack_require__(2);
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
/* 40 */
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
const common_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(22);
const swagger_1 = __webpack_require__(3);
const registry_service_1 = __webpack_require__(39);
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
/* 41 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionModule = void 0;
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(8);
const session_entity_1 = __webpack_require__(13);
const conversation_entity_1 = __webpack_require__(14);
const session_service_1 = __webpack_require__(42);
const session_controller_1 = __webpack_require__(43);
const auth_module_1 = __webpack_require__(20);
let SessionModule = class SessionModule {
};
exports.SessionModule = SessionModule;
exports.SessionModule = SessionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                session_entity_1.Session,
                conversation_entity_1.Conversation,
            ]),
            auth_module_1.AuthModule,
        ],
        controllers: [session_controller_1.SessionController],
        providers: [session_service_1.SessionService],
        exports: [
            session_service_1.SessionService,
            typeorm_1.TypeOrmModule,
        ],
    })
], SessionModule);


/***/ }),
/* 42 */
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
var SessionService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionService = void 0;
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
const core_1 = __webpack_require__(1);
const session_entity_1 = __webpack_require__(13);
const conversation_entity_1 = __webpack_require__(14);
let SessionService = SessionService_1 = class SessionService {
    constructor(sessionRepository, conversationRepository, request) {
        this.sessionRepository = sessionRepository;
        this.conversationRepository = conversationRepository;
        this.request = request;
        this.logger = new common_1.Logger(SessionService_1.name);
    }
    async createSession(createSessionDto) {
        this.logger.log(`Création nouvelle session: ${createSessionDto.toLogSafe()}`);
        const validationErrors = createSessionDto.validate();
        if (validationErrors.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Données de session invalides',
                errors: validationErrors,
            });
        }
        const currentUser = this.getCurrentUser();
        const session = this.sessionRepository.create({
            user_id: currentUser.id,
            title: createSessionDto.getCleanTitle(),
            provider: createSessionDto.provider,
            metadata: {
                ...createSessionDto.metadata,
                created_by: currentUser.id,
                tenant_id: this.getCurrentTenantId(),
                created_at_iso: new Date().toISOString(),
            },
        });
        try {
            const savedSession = await this.sessionRepository.save(session);
            this.logger.log(`Session créée avec succès: ${savedSession.id} pour utilisateur ${currentUser.id}`);
            return savedSession;
        }
        catch (error) {
            this.logger.error(`Erreur création session: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Erreur lors de la création de la session');
        }
    }
    async findUserSessions(page = 1, limit = 20, titleFilter, providerFilter) {
        this.logger.log(`Récupération sessions utilisateur - page: ${page}, limit: ${limit}`);
        const currentUser = this.getCurrentUser();
        if (page < 1)
            page = 1;
        if (limit < 1 || limit > 100)
            limit = 20;
        const queryBuilder = this.sessionRepository
            .createQueryBuilder('session')
            .where('session.user_id = :userId', { userId: currentUser.id })
            .orderBy('session.created_at', 'DESC');
        if (titleFilter && titleFilter.trim()) {
            queryBuilder.andWhere('session.title ILIKE :titleFilter', { titleFilter: `%${titleFilter.trim()}%` });
        }
        if (providerFilter && Object.values(session_entity_1.AIProvider).includes(providerFilter)) {
            queryBuilder.andWhere('session.provider = :provider', { provider: providerFilter });
        }
        const offset = (page - 1) * limit;
        queryBuilder.skip(offset).take(limit);
        try {
            const [sessions, total] = await queryBuilder.getManyAndCount();
            const sessionsWithStats = await Promise.all(sessions.map(async (session) => {
                const stats = await this.getSessionStatistics(session.id);
                return { session, stats };
            }));
            const totalPages = Math.ceil(total / limit);
            this.logger.log(`Sessions récupérées: ${sessions.length}/${total} pour utilisateur ${currentUser.id}`);
            return {
                data: sessionsWithStats,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            };
        }
        catch (error) {
            this.logger.error(`Erreur récupération sessions: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Erreur lors de la récupération des sessions');
        }
    }
    async findSessionById(sessionId) {
        this.logger.log(`Récupération session: ${sessionId}`);
        const currentUser = this.getCurrentUser();
        if (!this.isValidUUID(sessionId)) {
            throw new common_1.BadRequestException('ID de session invalide');
        }
        try {
            const session = await this.sessionRepository.findOne({
                where: {
                    id: sessionId,
                    user_id: currentUser.id,
                },
                relations: ['conversations'],
            });
            if (!session) {
                throw new common_1.NotFoundException('Session non trouvée');
            }
            return session;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Erreur récupération session ${sessionId}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Erreur lors de la récupération de la session');
        }
    }
    async updateSession(sessionId, updateSessionDto) {
        this.logger.log(`Mise à jour session: ${sessionId} - ${updateSessionDto.toLogSafe()}`);
        const validationErrors = updateSessionDto.validate();
        if (validationErrors.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Données de mise à jour invalides',
                errors: validationErrors,
            });
        }
        const existingSession = await this.findSessionById(sessionId);
        try {
            const updateData = {};
            if (updateSessionDto.hasTitle()) {
                updateData.title = updateSessionDto.getCleanTitle();
            }
            if (updateSessionDto.hasMetadata()) {
                updateData.metadata = updateSessionDto.mergeWithExistingMetadata(existingSession.metadata);
            }
            await this.sessionRepository.update(sessionId, updateData);
            const updatedSession = await this.findSessionById(sessionId);
            this.logger.log(`Session mise à jour avec succès: ${sessionId}`);
            return updatedSession;
        }
        catch (error) {
            this.logger.error(`Erreur mise à jour session ${sessionId}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Erreur lors de la mise à jour de la session');
        }
    }
    async deleteSession(sessionId) {
        this.logger.log(`Suppression session: ${sessionId}`);
        const session = await this.findSessionById(sessionId);
        try {
            await this.sessionRepository.remove(session);
            this.logger.log(`Session supprimée avec succès: ${sessionId}`);
        }
        catch (error) {
            this.logger.error(`Erreur suppression session ${sessionId}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Erreur lors de la suppression de la session');
        }
    }
    async createConversation(sessionId, createConversationDto) {
        this.logger.log(`Création conversation pour session: ${sessionId}`);
        const validationErrors = createConversationDto.validate();
        if (validationErrors.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Données de conversation invalides',
                errors: validationErrors,
            });
        }
        const session = await this.findSessionById(sessionId);
        const conversation = this.conversationRepository.create({
            session_id: sessionId,
            message: createConversationDto.getCleanMessage(),
            metadata: {
                ...createConversationDto.metadata,
                session_provider: session.provider,
                created_at_iso: new Date().toISOString(),
            },
        });
        try {
            const savedConversation = await this.conversationRepository.save(conversation);
            this.logger.log(`Conversation créée: ${savedConversation.id} dans session ${sessionId}`);
            return savedConversation;
        }
        catch (error) {
            this.logger.error(`Erreur création conversation pour session ${sessionId}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Erreur lors de la création de la conversation');
        }
    }
    async findSessionConversations(queryDto) {
        this.logger.log(`Récupération conversations: ${queryDto.toLogSafe()}`);
        await this.findSessionById(queryDto.session_id);
        const queryBuilder = this.conversationRepository
            .createQueryBuilder('conversation')
            .where('conversation.session_id = :sessionId', { sessionId: queryDto.session_id })
            .orderBy('conversation.created_at', 'ASC');
        if (queryDto.provider) {
            queryBuilder.andWhere('conversation.provider_used = :provider', {
                provider: queryDto.provider
            });
        }
        const offset = queryDto.getOffset();
        queryBuilder.skip(offset).take(queryDto.limit);
        try {
            const [conversations, total] = await queryBuilder.getManyAndCount();
            const totalPages = Math.ceil(total / (queryDto.limit || 20));
            this.logger.log(`Conversations récupérées: ${conversations.length}/${total} pour session ${queryDto.session_id}`);
            return {
                data: conversations,
                meta: {
                    total,
                    page: queryDto.page || 1,
                    limit: queryDto.limit || 20,
                    totalPages,
                    hasNextPage: (queryDto.page || 1) < totalPages,
                    hasPreviousPage: (queryDto.page || 1) > 1,
                },
            };
        }
        catch (error) {
            this.logger.error(`Erreur récupération conversations session ${queryDto.session_id}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Erreur lors de la récupération des conversations');
        }
    }
    async updateConversation(conversationId, updateConversationDto) {
        this.logger.log(`Mise à jour conversation: ${conversationId}`);
        const validationErrors = updateConversationDto.validate();
        if (validationErrors.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Données de mise à jour invalides',
                errors: validationErrors,
            });
        }
        if (!this.isValidUUID(conversationId)) {
            throw new common_1.BadRequestException('ID de conversation invalide');
        }
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: ['session'],
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation non trouvée');
        }
        const currentUser = this.getCurrentUser();
        if (conversation.session.user_id !== currentUser.id) {
            throw new common_1.ForbiddenException('Accès non autorisé à cette conversation');
        }
        try {
            const updateData = {};
            if (updateConversationDto.response !== undefined) {
                updateData.response = updateConversationDto.response?.trim() || null;
            }
            if (updateConversationDto.provider_used) {
                updateData.provider_used = updateConversationDto.provider_used;
            }
            if (updateConversationDto.tokens_used !== undefined) {
                updateData.tokens_used = updateConversationDto.tokens_used;
            }
            if (updateConversationDto.processing_time_ms !== undefined) {
                updateData.processing_time_ms = updateConversationDto.processing_time_ms;
            }
            if (updateConversationDto.metadata !== undefined) {
                updateData.metadata = {
                    ...conversation.metadata,
                    ...updateConversationDto.metadata,
                    updated_at_iso: new Date().toISOString(),
                };
            }
            await this.conversationRepository.update(conversationId, updateData);
            const updatedConversation = await this.conversationRepository.findOne({
                where: { id: conversationId },
            });
            this.logger.log(`Conversation mise à jour: ${conversationId}`);
            return updatedConversation;
        }
        catch (error) {
            this.logger.error(`Erreur mise à jour conversation ${conversationId}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Erreur lors de la mise à jour de la conversation');
        }
    }
    async getSessionStatistics(sessionId) {
        try {
            const result = await this.conversationRepository
                .createQueryBuilder('conversation')
                .select([
                'COUNT(conversation.id) as conversation_count',
                'COALESCE(SUM(conversation.tokens_used), 0) as total_tokens',
                'COALESCE(AVG(conversation.processing_time_ms), 0) as avg_processing_time',
                'MAX(conversation.created_at) as last_activity',
            ])
                .where('conversation.session_id = :sessionId', { sessionId })
                .getRawOne();
            return {
                conversationCount: parseInt(result.conversation_count) || 0,
                totalTokens: parseInt(result.total_tokens) || 0,
                avgProcessingTime: Math.round(parseFloat(result.avg_processing_time) || 0),
                lastActivity: result.last_activity || new Date(),
            };
        }
        catch (error) {
            this.logger.warn(`Erreur calcul statistiques session ${sessionId}: ${error.message}`);
            return {
                conversationCount: 0,
                totalTokens: 0,
                avgProcessingTime: 0,
                lastActivity: new Date(),
            };
        }
    }
    getCurrentUser() {
        if (!this.request.user) {
            throw new common_1.ForbiddenException('Utilisateur non authentifié');
        }
        return this.request.user;
    }
    getCurrentTenantId() {
        if (!this.request.tenant?.id) {
            throw new common_1.ForbiddenException('Tenant non identifié');
        }
        return this.request.tenant.id;
    }
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = SessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __param(1, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(2, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, Object])
], SessionService);


/***/ }),
/* 43 */
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
var SessionController_1;
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const throttler_1 = __webpack_require__(6);
const jwt_auth_guard_1 = __webpack_require__(31);
const tenant_guard_1 = __webpack_require__(30);
const session_service_1 = __webpack_require__(42);
const dto_1 = __webpack_require__(44);
const session_entity_1 = __webpack_require__(13);
let SessionController = SessionController_1 = class SessionController {
    constructor(sessionService) {
        this.sessionService = sessionService;
        this.logger = new common_1.Logger(SessionController_1.name);
    }
    async getUserSessions(tenantSlug, page, limit, titleFilter, providerFilter) {
        const startTime = Date.now();
        try {
            const result = await this.sessionService.findUserSessions(page, limit, titleFilter, providerFilter);
            const processingTime = Date.now() - startTime;
            this.logger.log(`Sessions récupérées pour tenant ${tenantSlug} en ${processingTime}ms - ` +
                `${result.data.length}/${result.meta.total} éléments`);
            return {
                success: true,
                data: result.data,
                meta: {
                    ...result.meta,
                    processingTimeMs: processingTime,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.logger.error(`Erreur récupération sessions tenant ${tenantSlug}: ${error.message} (${processingTime}ms)`, error.stack);
            throw error;
        }
    }
    async createSession(tenantSlug, createSessionDto) {
        const startTime = Date.now();
        try {
            const session = await this.sessionService.createSession(createSessionDto);
            const processingTime = Date.now() - startTime;
            this.logger.log(`Session créée pour tenant ${tenantSlug} en ${processingTime}ms: ${session.id}`);
            return {
                success: true,
                data: session.toPublic(),
                meta: {
                    processingTimeMs: processingTime,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.logger.error(`Erreur création session tenant ${tenantSlug}: ${error.message} (${processingTime}ms)`, error.stack);
            throw error;
        }
    }
    async getSessionConversations(tenantSlug, sessionId, page, limit, provider) {
        const startTime = Date.now();
        try {
            const queryDto = new dto_1.ConversationQueryDto({
                session_id: sessionId,
                page,
                limit,
                provider,
            });
            const result = await this.sessionService.findSessionConversations(queryDto);
            const processingTime = Date.now() - startTime;
            this.logger.log(`Conversations récupérées pour session ${sessionId} en ${processingTime}ms - ` +
                `${result.data.length}/${result.meta.total} éléments`);
            return {
                success: true,
                data: result.data.map(conv => conv.toPublic()),
                meta: {
                    ...result.meta,
                    processingTimeMs: processingTime,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.logger.error(`Erreur récupération conversations session ${sessionId}: ${error.message} (${processingTime}ms)`, error.stack);
            throw error;
        }
    }
    async createConversation(tenantSlug, sessionId, createConversationDto) {
        const startTime = Date.now();
        try {
            const conversation = await this.sessionService.createConversation(sessionId, createConversationDto);
            const processingTime = Date.now() - startTime;
            this.logger.log(`Conversation créée pour session ${sessionId} en ${processingTime}ms: ${conversation.id}`);
            return {
                success: true,
                data: conversation.toPublic(),
                meta: {
                    processingTimeMs: processingTime,
                    sessionId: sessionId,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.logger.error(`Erreur création conversation session ${sessionId}: ${error.message} (${processingTime}ms)`, error.stack);
            throw error;
        }
    }
    async updateSession(tenantSlug, sessionId, updateSessionDto) {
        const startTime = Date.now();
        try {
            const session = await this.sessionService.updateSession(sessionId, updateSessionDto);
            const processingTime = Date.now() - startTime;
            this.logger.log(`Session mise à jour ${sessionId} en ${processingTime}ms`);
            return {
                success: true,
                data: session.toPublic(),
                meta: { processingTimeMs: processingTime },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.logger.error(`Erreur mise à jour session ${sessionId}: ${error.message} (${processingTime}ms)`, error.stack);
            throw error;
        }
    }
    async deleteSession(tenantSlug, sessionId) {
        const startTime = Date.now();
        try {
            await this.sessionService.deleteSession(sessionId);
            const processingTime = Date.now() - startTime;
            this.logger.log(`Session supprimée ${sessionId} en ${processingTime}ms`);
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.logger.error(`Erreur suppression session ${sessionId}: ${error.message} (${processingTime}ms)`, error.stack);
            throw error;
        }
    }
    async updateConversation(tenantSlug, conversationId, updateConversationDto) {
        const startTime = Date.now();
        try {
            const conversation = await this.sessionService.updateConversation(conversationId, updateConversationDto);
            const processingTime = Date.now() - startTime;
            this.logger.log(`Conversation mise à jour ${conversationId} en ${processingTime}ms`);
            return {
                success: true,
                data: conversation.toPublic(),
                meta: { processingTimeMs: processingTime },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.logger.error(`Erreur mise à jour conversation ${conversationId}: ${error.message} (${processingTime}ms)`, error.stack);
            throw error;
        }
    }
};
exports.SessionController = SessionController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer les sessions IA de l\'utilisateur',
        description: 'Liste paginée des sessions IA avec possibilité de filtrage par titre et provider.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'tenant_slug',
        description: 'Slug du tenant',
        example: 'entreprise-demo',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Numéro de page (défaut: 1)',
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Nombre d\'éléments par page (défaut: 20, max: 100)',
        example: 20,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'title',
        required: false,
        type: String,
        description: 'Filtrer par titre (recherche partielle)',
        example: 'analyse',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'provider',
        required: false,
        enum: session_entity_1.AIProvider,
        description: 'Filtrer par provider IA',
        example: 'openai',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Sessions récupérées avec succès',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            session: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', example: 'uuid' },
                                    title: { type: 'string', example: 'Analyse Q1 2025' },
                                    provider: { type: 'string', example: 'openai' },
                                    metadata: { type: 'object' },
                                    created_at: { type: 'string', format: 'date-time' },
                                    updated_at: { type: 'string', format: 'date-time' },
                                },
                            },
                            stats: {
                                type: 'object',
                                properties: {
                                    conversationCount: { type: 'number', example: 5 },
                                    totalTokens: { type: 'number', example: 1500 },
                                    avgProcessingTime: { type: 'number', example: 2300 },
                                    lastActivity: { type: 'string', format: 'date-time' },
                                },
                            },
                        },
                    },
                },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 50 },
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 20 },
                        totalPages: { type: 'number', example: 3 },
                        hasNextPage: { type: 'boolean', example: true },
                        hasPreviousPage: { type: 'boolean', example: false },
                    },
                },
                timestamp: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Paramètres de requête invalides',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Non authentifié',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Accès refusé au tenant',
    }),
    (0, throttler_1.Throttle)({ default: { limit: 60, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('tenant_slug')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('title')),
    __param(4, (0, common_1.Query)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, typeof (_b = typeof session_entity_1.AIProvider !== "undefined" && session_entity_1.AIProvider) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getUserSessions", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer une nouvelle session IA',
        description: 'Crée une nouvelle session IA avec titre et provider obligatoires.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'tenant_slug',
        description: 'Slug du tenant',
        example: 'entreprise-demo',
    }),
    (0, swagger_1.ApiBody)({
        type: dto_1.CreateSessionDto,
        description: 'Données de la nouvelle session',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Session créée avec succès',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'uuid' },
                        title: { type: 'string', example: 'Nouvelle analyse' },
                        provider: { type: 'string', example: 'openai' },
                        metadata: { type: 'object' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                timestamp: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Données invalides',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Non authentifié',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Accès refusé au tenant',
    }),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('tenant_slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof dto_1.CreateSessionDto !== "undefined" && dto_1.CreateSessionDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)(':session_id/conversations'),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer l\'historique des conversations d\'une session',
        description: 'Liste paginée des conversations d\'une session, triées chronologiquement.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'tenant_slug',
        description: 'Slug du tenant',
        example: 'entreprise-demo',
    }),
    (0, swagger_1.ApiParam)({
        name: 'session_id',
        description: 'ID de la session',
        example: 'uuid-session',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Numéro de page (défaut: 1)',
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Nombre d\'éléments par page (défaut: 20, max: 100)',
        example: 20,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'provider',
        required: false,
        enum: session_entity_1.AIProvider,
        description: 'Filtrer par provider utilisé',
        example: 'openai',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Conversations récupérées avec succès',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: 'uuid' },
                            message: { type: 'string', example: 'Question utilisateur' },
                            response: { type: 'string', example: 'Réponse IA' },
                            provider_used: { type: 'string', example: 'openai' },
                            tokens_used: { type: 'number', example: 150 },
                            processing_time_ms: { type: 'number', example: 2300 },
                            created_at: { type: 'string', format: 'date-time' },
                        },
                    },
                },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 25 },
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 20 },
                        totalPages: { type: 'number', example: 2 },
                        hasNextPage: { type: 'boolean', example: true },
                        hasPreviousPage: { type: 'boolean', example: false },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Session non trouvée',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Paramètres invalides',
    }),
    (0, throttler_1.Throttle)({ default: { limit: 100, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('tenant_slug')),
    __param(1, (0, common_1.Param)('session_id')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, typeof (_d = typeof session_entity_1.AIProvider !== "undefined" && session_entity_1.AIProvider) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getSessionConversations", null);
__decorate([
    (0, common_1.Post)(':session_id/conversations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Ajouter une conversation à une session',
        description: 'Ajoute un message utilisateur et potentiellement la réponse IA à une session.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'tenant_slug',
        description: 'Slug du tenant',
        example: 'entreprise-demo',
    }),
    (0, swagger_1.ApiParam)({
        name: 'session_id',
        description: 'ID de la session',
        example: 'uuid-session',
    }),
    (0, swagger_1.ApiBody)({
        type: dto_1.CreateConversationDto,
        description: 'Données de la nouvelle conversation',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Conversation créée avec succès',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'uuid' },
                        message: { type: 'string', example: 'Question utilisateur' },
                        response: { type: 'string', nullable: true },
                        provider_used: { type: 'string', nullable: true },
                        tokens_used: { type: 'number', example: 0 },
                        processing_time_ms: { type: 'number', example: 0 },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                timestamp: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Session non trouvée',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Données invalides',
    }),
    (0, throttler_1.Throttle)({ default: { limit: 50, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('tenant_slug')),
    __param(1, (0, common_1.Param)('session_id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_e = typeof dto_1.CreateConversationDto !== "undefined" && dto_1.CreateConversationDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Put)(':session_id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mettre à jour une session',
        description: 'Met à jour le titre et/ou les métadonnées d\'une session.',
    }),
    (0, swagger_1.ApiParam)({ name: 'tenant_slug', description: 'Slug du tenant' }),
    (0, swagger_1.ApiParam)({ name: 'session_id', description: 'ID de la session' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateSessionDto }),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('tenant_slug')),
    __param(1, (0, common_1.Param)('session_id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_f = typeof dto_1.UpdateSessionDto !== "undefined" && dto_1.UpdateSessionDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "updateSession", null);
__decorate([
    (0, common_1.Delete)(':session_id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Supprimer une session',
        description: 'Supprime une session et toutes ses conversations.',
    }),
    (0, swagger_1.ApiParam)({ name: 'tenant_slug', description: 'Slug du tenant' }),
    (0, swagger_1.ApiParam)({ name: 'session_id', description: 'ID de la session' }),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('tenant_slug')),
    __param(1, (0, common_1.Param)('session_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "deleteSession", null);
__decorate([
    (0, common_1.Put)('conversations/:conversation_id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mettre à jour une conversation',
        description: 'Met à jour la réponse et les métriques d\'une conversation.',
    }),
    (0, swagger_1.ApiParam)({ name: 'tenant_slug', description: 'Slug du tenant' }),
    (0, swagger_1.ApiParam)({ name: 'conversation_id', description: 'ID de la conversation' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateConversationDto }),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('tenant_slug')),
    __param(1, (0, common_1.Param)('conversation_id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_g = typeof dto_1.UpdateConversationDto !== "undefined" && dto_1.UpdateConversationDto) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "updateConversation", null);
exports.SessionController = SessionController = SessionController_1 = __decorate([
    (0, swagger_1.ApiTags)('Sessions IA'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    (0, common_1.Controller)('api/v1/:tenant_slug/sessions'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __metadata("design:paramtypes", [typeof (_a = typeof session_service_1.SessionService !== "undefined" && session_service_1.SessionService) === "function" ? _a : Object])
], SessionController);


/***/ }),
/* 44 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConversationQueryDto = exports.UpdateConversationDto = exports.CreateConversationDto = exports.UpdateSessionDto = exports.CreateSessionDto = void 0;
var create_session_dto_1 = __webpack_require__(45);
Object.defineProperty(exports, "CreateSessionDto", ({ enumerable: true, get: function () { return create_session_dto_1.CreateSessionDto; } }));
var update_session_dto_1 = __webpack_require__(46);
Object.defineProperty(exports, "UpdateSessionDto", ({ enumerable: true, get: function () { return update_session_dto_1.UpdateSessionDto; } }));
var conversation_dto_1 = __webpack_require__(47);
Object.defineProperty(exports, "CreateConversationDto", ({ enumerable: true, get: function () { return conversation_dto_1.CreateConversationDto; } }));
Object.defineProperty(exports, "UpdateConversationDto", ({ enumerable: true, get: function () { return conversation_dto_1.UpdateConversationDto; } }));
Object.defineProperty(exports, "ConversationQueryDto", ({ enumerable: true, get: function () { return conversation_dto_1.ConversationQueryDto; } }));


/***/ }),
/* 45 */
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
exports.CreateSessionDto = void 0;
const class_validator_1 = __webpack_require__(19);
const class_transformer_1 = __webpack_require__(18);
const swagger_1 = __webpack_require__(3);
const session_entity_1 = __webpack_require__(13);
class CreateSessionDto {
    constructor(partial = {}) {
        Object.assign(this, partial);
        if (this.title) {
            this.title = this.title.trim();
        }
        if (!this.metadata) {
            this.metadata = {};
        }
    }
    getCleanTitle() {
        return this.title?.trim().replace(/\s+/g, ' ') || '';
    }
    hasMetadata() {
        return this.metadata && Object.keys(this.metadata).length > 0;
    }
    isProviderSupported() {
        return Object.values(session_entity_1.AIProvider).includes(this.provider);
    }
    validate() {
        const errors = [];
        if (!this.getCleanTitle()) {
            errors.push('Le titre ne peut pas être vide ou contenir uniquement des espaces');
        }
        if (this.title && this.title.length > 255) {
            errors.push('Le titre ne peut pas dépasser 255 caractères');
        }
        if (!this.isProviderSupported()) {
            errors.push('Provider non supporté. Utilisez: openai, anthropic ou gemini');
        }
        if (this.metadata) {
            try {
                JSON.stringify(this.metadata);
            }
            catch (error) {
                errors.push('Les métadonnées doivent être sérialisables en JSON');
            }
            const metadataSize = JSON.stringify(this.metadata).length;
            if (metadataSize > 10000) {
                errors.push('Les métadonnées ne peuvent pas dépasser 10KB');
            }
        }
        return errors;
    }
    toLogSafe() {
        return {
            title: this.getCleanTitle(),
            provider: this.provider,
            hasMetadata: this.hasMetadata(),
            metadataKeys: this.metadata ? Object.keys(this.metadata) : [],
        };
    }
}
exports.CreateSessionDto = CreateSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Titre de la session IA',
        example: 'Analyse stratégique Q1 2025',
        minLength: 1,
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)({ message: 'Le titre doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le titre ne peut pas être vide' }),
    (0, class_validator_1.MinLength)(1, { message: 'Le titre doit contenir au moins 1 caractère' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le titre ne peut pas dépasser 255 caractères' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.Matches)(/^[^<>\"'&]*$/, {
        message: 'Le titre ne peut pas contenir de caractères HTML dangereux'
    }),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Provider IA à utiliser pour cette session',
        example: 'openai',
        enum: session_entity_1.AIProvider,
    }),
    (0, class_validator_1.IsEnum)(session_entity_1.AIProvider, {
        message: 'Le provider doit être openai, anthropic ou gemini'
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le provider est obligatoire' }),
    __metadata("design:type", typeof (_a = typeof session_entity_1.AIProvider !== "undefined" && session_entity_1.AIProvider) === "function" ? _a : Object)
], CreateSessionDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Métadonnées optionnelles pour la session',
        example: {
            context: 'analyse financière',
            department: 'stratégie',
            priority: 'high'
        },
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)({ message: 'Les métadonnées doivent être un objet JSON valide' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return {};
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                throw new Error('Métadonnées JSON invalides');
            }
        }
        return value;
    }),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], CreateSessionDto.prototype, "metadata", void 0);


/***/ }),
/* 46 */
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
exports.UpdateSessionDto = void 0;
const class_validator_1 = __webpack_require__(19);
const class_transformer_1 = __webpack_require__(18);
const swagger_1 = __webpack_require__(3);
class UpdateSessionDto {
    constructor(partial = {}) {
        Object.assign(this, partial);
        if (this.title !== undefined) {
            this.title = this.title?.trim();
        }
    }
    getCleanTitle() {
        return this.title?.trim().replace(/\s+/g, ' ');
    }
    hasTitle() {
        return this.title !== undefined && this.title.trim().length > 0;
    }
    hasMetadata() {
        return this.metadata !== undefined && Object.keys(this.metadata).length > 0;
    }
    isEmpty() {
        return !this.hasTitle() && !this.hasMetadata();
    }
    validate() {
        const errors = [];
        if (this.isEmpty()) {
            errors.push('Au moins un champ doit être fourni pour la mise à jour');
        }
        if (this.title !== undefined) {
            const cleanTitle = this.getCleanTitle();
            if (!cleanTitle) {
                errors.push('Le titre ne peut pas être vide ou contenir uniquement des espaces');
            }
            if (cleanTitle && cleanTitle.length > 255) {
                errors.push('Le titre ne peut pas dépasser 255 caractères');
            }
        }
        if (this.metadata !== undefined) {
            try {
                JSON.stringify(this.metadata);
            }
            catch (error) {
                errors.push('Les métadonnées doivent être sérialisables en JSON');
            }
            const metadataSize = JSON.stringify(this.metadata).length;
            if (metadataSize > 10000) {
                errors.push('Les métadonnées ne peuvent pas dépasser 10KB');
            }
            const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
            const providedKeys = Object.keys(this.metadata);
            const hasDangerousKeys = providedKeys.some(key => dangerousKeys.includes(key.toLowerCase()));
            if (hasDangerousKeys) {
                errors.push('Les clés de métadonnées ne peuvent pas contenir des mots-clés réservés');
            }
        }
        return errors;
    }
    mergeWithExistingMetadata(existingMetadata = {}) {
        if (!this.hasMetadata()) {
            return existingMetadata;
        }
        return {
            ...existingMetadata,
            ...this.metadata,
            updated_at: new Date().toISOString(),
        };
    }
    toLogSafe() {
        return {
            hasTitle: this.hasTitle(),
            titleLength: this.title?.length || 0,
            hasMetadata: this.hasMetadata(),
            metadataKeys: this.metadata ? Object.keys(this.metadata) : [],
            isEmpty: this.isEmpty(),
        };
    }
    toUpdateObject() {
        const updateObj = {};
        if (this.hasTitle()) {
            updateObj.title = this.getCleanTitle();
        }
        if (this.hasMetadata()) {
            updateObj.metadata = this.metadata;
        }
        return updateObj;
    }
}
exports.UpdateSessionDto = UpdateSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nouveau titre de la session IA',
        example: 'Analyse stratégique Q1 2025 - Mise à jour',
        minLength: 1,
        maxLength: 255,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Le titre doit être une chaîne de caractères' }),
    (0, class_validator_1.MinLength)(1, { message: 'Le titre doit contenir au moins 1 caractère' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le titre ne peut pas dépasser 255 caractères' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.Matches)(/^[^<>\"'&]*$/, {
        message: 'Le titre ne peut pas contenir de caractères HTML dangereux'
    }),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Métadonnées à fusionner avec les existantes',
        example: {
            status: 'completed',
            notes: 'Session terminée avec succès',
            updated_by: 'user_id'
        },
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)({ message: 'Les métadonnées doivent être un objet JSON valide' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return undefined;
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                throw new Error('Métadonnées JSON invalides');
            }
        }
        return value;
    }),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], UpdateSessionDto.prototype, "metadata", void 0);


/***/ }),
/* 47 */
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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConversationQueryDto = exports.UpdateConversationDto = exports.CreateConversationDto = void 0;
const class_validator_1 = __webpack_require__(19);
const class_transformer_1 = __webpack_require__(18);
const swagger_1 = __webpack_require__(3);
const session_entity_1 = __webpack_require__(13);
class CreateConversationDto {
    constructor(partial = {}) {
        Object.assign(this, partial);
        if (this.message) {
            this.message = this.message.trim();
        }
        if (!this.metadata) {
            this.metadata = {};
        }
    }
    getCleanMessage() {
        return this.message?.trim().replace(/\s+/g, ' ') || '';
    }
    getMessageLength() {
        return this.getCleanMessage().length;
    }
    hasMetadata() {
        return this.metadata && Object.keys(this.metadata).length > 0;
    }
    validate() {
        const errors = [];
        if (!this.getCleanMessage()) {
            errors.push('Le message ne peut pas être vide ou contenir uniquement des espaces');
        }
        if (this.getMessageLength() > 50000) {
            errors.push('Le message ne peut pas dépasser 50000 caractères');
        }
        if (this.metadata) {
            try {
                JSON.stringify(this.metadata);
            }
            catch (error) {
                errors.push('Les métadonnées doivent être sérialisables en JSON');
            }
            const metadataSize = JSON.stringify(this.metadata).length;
            if (metadataSize > 5000) {
                errors.push('Les métadonnées ne peuvent pas dépasser 5KB');
            }
        }
        return errors;
    }
    toLogSafe() {
        return {
            messageLength: this.getMessageLength(),
            hasMetadata: this.hasMetadata(),
            metadataKeys: this.metadata ? Object.keys(this.metadata) : [],
        };
    }
}
exports.CreateConversationDto = CreateConversationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message utilisateur à envoyer au provider IA',
        example: 'Peux-tu analyser les tendances du marché pour Q1 2025?',
        minLength: 1,
        maxLength: 50000,
    }),
    (0, class_validator_1.IsString)({ message: 'Le message doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le message ne peut pas être vide' }),
    (0, class_validator_1.MinLength)(1, { message: 'Le message doit contenir au moins 1 caractère' }),
    (0, class_validator_1.MaxLength)(50000, { message: 'Le message ne peut pas dépasser 50000 caractères' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Métadonnées optionnelles pour le contexte de conversation',
        example: {
            context: 'analyse_marche',
            urgency: 'high',
            expected_format: 'structured_analysis'
        },
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)({ message: 'Les métadonnées doivent être un objet JSON valide' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return {};
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                throw new Error('Métadonnées JSON invalides');
            }
        }
        return value;
    }),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], CreateConversationDto.prototype, "metadata", void 0);
class UpdateConversationDto {
    constructor(partial = {}) {
        Object.assign(this, partial);
        if (this.response !== undefined) {
            this.response = this.response?.trim();
        }
    }
    hasResponse() {
        return this.response !== undefined && this.response.trim().length > 0;
    }
    hasMetrics() {
        return (this.tokens_used !== undefined && this.tokens_used > 0) ||
            (this.processing_time_ms !== undefined && this.processing_time_ms > 0);
    }
    isEmpty() {
        return !this.hasResponse() &&
            !this.provider_used &&
            !this.hasMetrics() &&
            !this.metadata;
    }
    validate() {
        const errors = [];
        if (this.isEmpty()) {
            errors.push('Au moins un champ doit être fourni pour la mise à jour');
        }
        if (this.tokens_used && this.tokens_used > 0 && !this.hasResponse()) {
            errors.push('Une réponse est requise si des tokens ont été utilisés');
        }
        if (this.processing_time_ms && this.processing_time_ms > 0 && !this.hasResponse()) {
            errors.push('Une réponse est requise si un temps de traitement est fourni');
        }
        if (this.tokens_used && this.tokens_used > 0 && !this.provider_used) {
            errors.push('Le provider utilisé doit être spécifié si des tokens ont été consommés');
        }
        if (this.metadata) {
            try {
                JSON.stringify(this.metadata);
            }
            catch (error) {
                errors.push('Les métadonnées doivent être sérialisables en JSON');
            }
            const metadataSize = JSON.stringify(this.metadata).length;
            if (metadataSize > 10000) {
                errors.push('Les métadonnées ne peuvent pas dépasser 10KB');
            }
        }
        return errors;
    }
    getTokenEfficiency() {
        if (!this.tokens_used || !this.processing_time_ms ||
            this.tokens_used === 0 || this.processing_time_ms === 0) {
            return 0;
        }
        return this.tokens_used / (this.processing_time_ms / 1000);
    }
    getCostEfficiencyScore() {
        const efficiency = this.getTokenEfficiency();
        const responseLength = this.response?.length || 0;
        if (efficiency === 0 || responseLength === 0)
            return 0;
        return (efficiency * responseLength) / 1000;
    }
    toLogSafe() {
        return {
            hasResponse: this.hasResponse(),
            responseLength: this.response?.length || 0,
            providerUsed: this.provider_used,
            tokensUsed: this.tokens_used || 0,
            processingTimeMs: this.processing_time_ms || 0,
            tokenEfficiency: this.getTokenEfficiency(),
            hasMetadata: !!this.metadata,
        };
    }
}
exports.UpdateConversationDto = UpdateConversationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Réponse du provider IA',
        example: 'Basé sur l\'analyse des données disponibles, voici les tendances identifiées...',
        required: false,
        maxLength: 100000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La réponse doit être une chaîne de caractères' }),
    (0, class_validator_1.MaxLength)(100000, { message: 'La réponse ne peut pas dépasser 100000 caractères' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateConversationDto.prototype, "response", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Provider IA utilisé pour générer la réponse',
        example: 'openai',
        enum: session_entity_1.AIProvider,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(session_entity_1.AIProvider, {
        message: 'Le provider utilisé doit être openai, anthropic ou gemini'
    }),
    __metadata("design:type", typeof (_b = typeof session_entity_1.AIProvider !== "undefined" && session_entity_1.AIProvider) === "function" ? _b : Object)
], UpdateConversationDto.prototype, "provider_used", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre de tokens consommés',
        example: 1250,
        minimum: 0,
        maximum: 1000000,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Le nombre de tokens doit être un nombre' }),
    (0, class_validator_1.Min)(0, { message: 'Le nombre de tokens ne peut pas être négatif' }),
    (0, class_validator_1.Max)(1000000, { message: 'Le nombre de tokens ne peut pas dépasser 1,000,000' }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10), { toClassOnly: true }),
    __metadata("design:type", Number)
], UpdateConversationDto.prototype, "tokens_used", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Temps de traitement en millisecondes',
        example: 2500,
        minimum: 0,
        maximum: 300000,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Le temps de traitement doit être un nombre' }),
    (0, class_validator_1.Min)(0, { message: 'Le temps de traitement ne peut pas être négatif' }),
    (0, class_validator_1.Max)(300000, { message: 'Le temps de traitement ne peut pas dépasser 5 minutes' }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10), { toClassOnly: true }),
    __metadata("design:type", Number)
], UpdateConversationDto.prototype, "processing_time_ms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Métadonnées additionnelles de la réponse',
        example: {
            model: 'gpt-4',
            temperature: 0.7,
            finish_reason: 'stop'
        },
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)({ message: 'Les métadonnées doivent être un objet JSON valide' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return undefined;
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                throw new Error('Métadonnées JSON invalides');
            }
        }
        return value;
    }),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], UpdateConversationDto.prototype, "metadata", void 0);
class ConversationQueryDto {
    constructor(partial = {}) {
        this.page = 1;
        this.limit = 20;
        Object.assign(this, partial);
    }
    getOffset() {
        return ((this.page || 1) - 1) * (this.limit || 20);
    }
    toLogSafe() {
        return {
            sessionId: this.session_id,
            page: this.page,
            limit: this.limit,
            offset: this.getOffset(),
            provider: this.provider,
        };
    }
}
exports.ConversationQueryDto = ConversationQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID de la session pour filtrer les conversations',
        example: 'uuid-session-id',
    }),
    (0, class_validator_1.IsUUID)(4, { message: 'L\'ID de session doit être un UUID valide' }),
    __metadata("design:type", String)
], ConversationQueryDto.prototype, "session_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Numéro de page (commence à 1)',
        example: 1,
        minimum: 1,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'La page doit être un nombre' }),
    (0, class_validator_1.Min)(1, { message: 'La page doit être supérieure à 0' }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10) || 1),
    __metadata("design:type", Number)
], ConversationQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre d\'éléments par page (max 100)',
        example: 20,
        minimum: 1,
        maximum: 100,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'La limite doit être un nombre' }),
    (0, class_validator_1.Min)(1, { message: 'La limite doit être supérieure à 0' }),
    (0, class_validator_1.Max)(100, { message: 'La limite ne peut pas dépasser 100' }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10) || 20),
    __metadata("design:type", Number)
], ConversationQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Provider à filtrer',
        example: 'openai',
        enum: session_entity_1.AIProvider,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(session_entity_1.AIProvider, { message: 'Provider invalide' }),
    __metadata("design:type", typeof (_d = typeof session_entity_1.AIProvider !== "undefined" && session_entity_1.AIProvider) === "function" ? _d : Object)
], ConversationQueryDto.prototype, "provider", void 0);


/***/ }),
/* 48 */
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
var AIModule_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AIModule = void 0;
const common_1 = __webpack_require__(2);
const schedule_1 = __webpack_require__(49);
const ai_orchestrator_service_1 = __webpack_require__(50);
const quota_manager_service_1 = __webpack_require__(58);
const ai_controller_1 = __webpack_require__(59);
const ai_gateway_1 = __webpack_require__(60);
const config_module_1 = __webpack_require__(15);
const config_service_1 = __webpack_require__(16);
const session_module_1 = __webpack_require__(41);
const telemetry_module_1 = __webpack_require__(35);
let AIModule = AIModule_1 = class AIModule {
    constructor(configService, aiOrchestrator, quotaManager) {
        this.configService = configService;
        this.aiOrchestrator = aiOrchestrator;
        this.quotaManager = quotaManager;
        this.logger = new common_1.Logger(AIModule_1.name);
    }
    async onModuleInit() {
        await this.initializeAISystem();
    }
    async initializeAISystem() {
        this.logger.log('🚀 Initialisation du système IA multi-providers...');
        try {
            const openaiApiKey = process.env.AI_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
            const anthropicApiKey = process.env.AI_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
            const geminiApiKey = process.env.AI_GEMINI_API_KEY || process.env.GEMINI_API_KEY ||
                this.configService.ai?.geminiApiKey;
            await this.aiOrchestrator.initialize(openaiApiKey, anthropicApiKey, geminiApiKey);
            const availableProviders = this.aiOrchestrator.getAvailableProviders();
            if (availableProviders.length === 0) {
                this.logger.warn('⚠️ ATTENTION: Aucun provider IA n\'est configuré avec des clés API valides!');
                this.logger.warn('Configurez au moins une de ces variables d\'environnement:');
                this.logger.warn('- AI_OPENAI_API_KEY ou OPENAI_API_KEY');
                this.logger.warn('- AI_ANTHROPIC_API_KEY ou ANTHROPIC_API_KEY');
                this.logger.warn('- AI_GEMINI_API_KEY ou GEMINI_API_KEY');
            }
            else {
                this.logger.log(`✅ Système IA initialisé avec succès!`);
                this.logger.log(`📦 Providers disponibles: ${availableProviders.join(', ')}`);
                const healthResults = await this.aiOrchestrator.healthCheckAll();
                const healthyProviders = Array.from(healthResults.entries())
                    .filter(([_, isHealthy]) => isHealthy)
                    .map(([type]) => type);
                this.logger.log(`🏥 Providers en bonne santé: ${healthyProviders.join(', ')}`);
                if (healthyProviders.length < availableProviders.length) {
                    const unhealthyProviders = availableProviders.filter(p => !healthyProviders.includes(p));
                    this.logger.warn(`⚠️ Providers avec problèmes: ${unhealthyProviders.join(', ')}`);
                }
            }
            await this.initializeDefaultQuotas();
            this.logger.log('🎯 Module IA entièrement opérationnel!');
        }
        catch (error) {
            this.logger.error(`💥 Erreur fatale lors de l'initialisation du système IA: ${error.message}`);
            this.logger.error('Le système IA ne sera pas disponible.');
        }
    }
    async initializeDefaultQuotas() {
        try {
            const defaultQuotaConfigs = [
                {
                    tenantType: 'free',
                    dailyTokens: 10000,
                    monthlyTokens: 200000,
                    dailyRequests: 100,
                    monthlyRequests: 2000,
                },
                {
                    tenantType: 'pro',
                    dailyTokens: 100000,
                    monthlyTokens: 2000000,
                    dailyRequests: 1000,
                    monthlyRequests: 20000,
                },
                {
                    tenantType: 'enterprise',
                    dailyTokens: 500000,
                    monthlyTokens: 10000000,
                    dailyRequests: 5000,
                    monthlyRequests: 100000,
                },
            ];
            this.logger.log('📊 Configuration des quotas par défaut terminée');
        }
        catch (error) {
            this.logger.warn(`⚠️ Erreur lors de l'initialisation des quotas: ${error.message}`);
        }
    }
    getOrchestrator() {
        return this.aiOrchestrator;
    }
    getQuotaManager() {
        return this.quotaManager;
    }
    async getSystemHealth() {
        try {
            const healthResults = await this.aiOrchestrator.healthCheckAll();
            const quotaStats = this.quotaManager.getGlobalStats();
            let healthyCount = 0;
            const providers = {};
            for (const [type, isHealthy] of healthResults) {
                providers[type] = isHealthy;
                if (isHealthy)
                    healthyCount++;
            }
            const status = healthyCount === 0 ? 'unhealthy' :
                healthyCount === healthResults.size ? 'healthy' : 'partial';
            return {
                status,
                providers,
                quotas: quotaStats,
                streaming: {
                    active: 0,
                    total: 0,
                },
            };
        }
        catch (error) {
            this.logger.error(`Erreur health check système: ${error.message}`);
            return {
                status: 'unhealthy',
                providers: {},
                quotas: null,
                streaming: null,
            };
        }
    }
};
exports.AIModule = AIModule;
exports.AIModule = AIModule = AIModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            config_module_1.CoreConfigModule,
            session_module_1.SessionModule,
            telemetry_module_1.TelemetryModule,
        ],
        providers: [
            ai_orchestrator_service_1.AIOrchestrator,
            quota_manager_service_1.QuotaManagerService,
            ai_gateway_1.AIStreamGateway,
        ],
        controllers: [ai_controller_1.AIController],
        exports: [
            ai_orchestrator_service_1.AIOrchestrator,
            quota_manager_service_1.QuotaManagerService,
            ai_gateway_1.AIStreamGateway,
        ],
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof config_service_1.ConfigService !== "undefined" && config_service_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof ai_orchestrator_service_1.AIOrchestrator !== "undefined" && ai_orchestrator_service_1.AIOrchestrator) === "function" ? _b : Object, typeof (_c = typeof quota_manager_service_1.QuotaManagerService !== "undefined" && quota_manager_service_1.QuotaManagerService) === "function" ? _c : Object])
], AIModule);


/***/ }),
/* 49 */
/***/ ((module) => {

module.exports = require("@nestjs/schedule");

/***/ }),
/* 50 */
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
var AIOrchestrator_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AIOrchestrator = void 0;
const common_1 = __webpack_require__(2);
const base_provider_1 = __webpack_require__(51);
const openai_provider_1 = __webpack_require__(52);
const anthropic_provider_1 = __webpack_require__(54);
const gemini_provider_1 = __webpack_require__(56);
let AIOrchestrator = AIOrchestrator_1 = class AIOrchestrator {
    constructor() {
        this.logger = new common_1.Logger(AIOrchestrator_1.name);
        this.fallbackConfig = {
            enabled: true,
            maxRetries: 3,
            retryDelay: 1000,
            preferredOrder: [base_provider_1.AIProviderType.OPENAI, base_provider_1.AIProviderType.ANTHROPIC, base_provider_1.AIProviderType.GEMINI],
            circuitBreakerThreshold: 5,
            circuitBreakerTimeout: 60000,
        };
        this.providers = new Map();
        this.providerStats = new Map();
    }
    async initialize(openaiApiKey, anthropicApiKey, geminiApiKey) {
        this.logger.log('🚀 Initialisation de l\'orchestrateur IA...');
        const providerPromises = [];
        if (openaiApiKey) {
            const openaiProvider = new openai_provider_1.OpenAIProvider(openaiApiKey);
            this.providers.set(base_provider_1.AIProviderType.OPENAI, openaiProvider);
            this.initializeProviderStats(base_provider_1.AIProviderType.OPENAI);
            providerPromises.push(this.safeInitializeProvider(openaiProvider));
        }
        if (anthropicApiKey) {
            const anthropicProvider = new anthropic_provider_1.AnthropicProvider(anthropicApiKey);
            this.providers.set(base_provider_1.AIProviderType.ANTHROPIC, anthropicProvider);
            this.initializeProviderStats(base_provider_1.AIProviderType.ANTHROPIC);
            providerPromises.push(this.safeInitializeProvider(anthropicProvider));
        }
        if (geminiApiKey) {
            const geminiProvider = new gemini_provider_1.GeminiProvider(geminiApiKey);
            this.providers.set(base_provider_1.AIProviderType.GEMINI, geminiProvider);
            this.initializeProviderStats(base_provider_1.AIProviderType.GEMINI);
            providerPromises.push(this.safeInitializeProvider(geminiProvider));
        }
        await Promise.allSettled(providerPromises);
        const availableProviders = this.getAvailableProviders();
        this.logger.log(`✅ Orchestrateur IA initialisé avec ${availableProviders.length} provider(s) disponible(s): ${availableProviders.join(', ')}`);
    }
    async chatCompletion(request) {
        const preferredProvider = request.preferredProvider;
        const orderedProviders = this.getOrderedProviders(preferredProvider);
        if (orderedProviders.length === 0) {
            throw new Error('Aucun provider IA disponible');
        }
        let lastError = null;
        let attemptCount = 0;
        for (const providerType of orderedProviders) {
            const provider = this.providers.get(providerType);
            if (!provider)
                continue;
            if (this.isCircuitBreakerOpen(providerType)) {
                this.logger.warn(`⚡ Circuit breaker ouvert pour ${providerType}, passage au suivant`);
                continue;
            }
            attemptCount++;
            try {
                this.logger.debug(`🎯 Tentative ${attemptCount} avec ${providerType}`);
                const startTime = Date.now();
                const response = await provider.chatCompletion(request);
                const duration = Date.now() - startTime;
                this.updateProviderStats(providerType, duration, false);
                this.logger.log(`✅ Chat completion réussi avec ${providerType} en ${duration}ms`);
                return response;
            }
            catch (error) {
                lastError = error;
                const duration = Date.now();
                this.updateProviderStats(providerType, duration, true, error.message);
                this.logger.warn(`❌ Erreur avec ${providerType}: ${error.message}`);
                this.checkCircuitBreaker(providerType);
                if (!this.fallbackConfig.enabled || attemptCount >= this.fallbackConfig.maxRetries) {
                    break;
                }
                if (this.fallbackConfig.retryDelay > 0) {
                    await this.delay(this.fallbackConfig.retryDelay);
                }
            }
        }
        this.logger.error(`💥 Tous les providers IA ont échoué après ${attemptCount} tentative(s)`);
        throw lastError || new Error('Tous les providers IA sont indisponibles');
    }
    async chatCompletionStream(request, events) {
        const preferredProvider = request.preferredProvider;
        const orderedProviders = this.getOrderedProviders(preferredProvider);
        if (orderedProviders.length === 0) {
            const error = new Error('Aucun provider IA disponible');
            events.onError?.(error);
            throw error;
        }
        let lastError = null;
        let attemptCount = 0;
        const wrappedEvents = {
            onStart: events.onStart,
            onChunk: events.onChunk,
            onComplete: events.onComplete,
            onError: (error, fallback) => {
                lastError = error;
                if (fallback && this.fallbackConfig.enabled) {
                    this.logger.warn(`🔄 Fallback vers ${fallback} suggéré`);
                }
                events.onError?.(error, fallback);
            },
        };
        for (const providerType of orderedProviders) {
            const provider = this.providers.get(providerType);
            if (!provider)
                continue;
            if (this.isCircuitBreakerOpen(providerType)) {
                this.logger.warn(`⚡ Circuit breaker ouvert pour ${providerType}, passage au suivant`);
                continue;
            }
            attemptCount++;
            try {
                this.logger.debug(`🎯 Stream tentative ${attemptCount} avec ${providerType}`);
                const startTime = Date.now();
                await provider.chatCompletionStream(request, wrappedEvents);
                const duration = Date.now() - startTime;
                this.updateProviderStats(providerType, duration, false);
                this.logger.log(`✅ Stream réussi avec ${providerType}`);
                return;
            }
            catch (error) {
                lastError = error;
                const duration = Date.now();
                this.updateProviderStats(providerType, duration, true, error.message);
                this.logger.warn(`❌ Erreur stream avec ${providerType}: ${error.message}`);
                this.checkCircuitBreaker(providerType);
                if (!this.fallbackConfig.enabled || attemptCount >= this.fallbackConfig.maxRetries) {
                    break;
                }
                if (this.fallbackConfig.retryDelay > 0) {
                    await this.delay(this.fallbackConfig.retryDelay);
                }
            }
        }
        this.logger.error(`💥 Tous les providers stream ont échoué après ${attemptCount} tentative(s)`);
        const finalError = lastError || new Error('Tous les providers IA sont indisponibles');
        events.onError?.(finalError);
        throw finalError;
    }
    getAvailableProviders() {
        return Array.from(this.providers.entries())
            .filter(([_, provider]) => provider.isAvailable())
            .map(([type]) => type);
    }
    getProviderStatus() {
        const status = new Map();
        for (const [type, provider] of this.providers) {
            const stats = this.providerStats.get(type);
            if (stats) {
                status.set(type, { provider, stats });
            }
        }
        return status;
    }
    async healthCheckAll() {
        const results = new Map();
        const healthPromises = Array.from(this.providers.entries()).map(async ([type, provider]) => {
            try {
                const isHealthy = await provider.healthCheck();
                results.set(type, isHealthy);
                if (!isHealthy) {
                    this.updateProviderStats(type, 0, true, 'Health check failed');
                }
                return { type, isHealthy };
            }
            catch (error) {
                results.set(type, false);
                this.updateProviderStats(type, 0, true, `Health check error: ${error.message}`);
                return { type, isHealthy: false };
            }
        });
        await Promise.allSettled(healthPromises);
        return results;
    }
    getOrderedProviders(preferredProvider) {
        const availableProviders = this.getAvailableProviders();
        if (!preferredProvider) {
            return this.fallbackConfig.preferredOrder.filter(type => availableProviders.includes(type));
        }
        const ordered = [preferredProvider];
        for (const type of this.fallbackConfig.preferredOrder) {
            if (type !== preferredProvider && availableProviders.includes(type)) {
                ordered.push(type);
            }
        }
        return ordered.filter(type => availableProviders.includes(type));
    }
    async safeInitializeProvider(provider) {
        try {
            await provider.initialize();
        }
        catch (error) {
            this.logger.warn(`⚠️ Échec de l'initialisation du provider ${provider.name}: ${error.message}`);
        }
    }
    initializeProviderStats(providerType) {
        this.providerStats.set(providerType, {
            provider: providerType,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageLatency: 0,
            circuitBreakerOpen: false,
        });
    }
    updateProviderStats(providerType, duration, isError, errorMessage) {
        const stats = this.providerStats.get(providerType);
        if (!stats)
            return;
        stats.totalRequests++;
        if (isError) {
            stats.failedRequests++;
            stats.lastError = errorMessage;
        }
        else {
            stats.successfulRequests++;
            const totalRequests = stats.successfulRequests;
            stats.averageLatency = ((stats.averageLatency * (totalRequests - 1)) + duration) / totalRequests;
        }
    }
    isCircuitBreakerOpen(providerType) {
        const stats = this.providerStats.get(providerType);
        if (!stats)
            return false;
        if (stats.circuitBreakerOpen && stats.lastCircuitBreakerTrip) {
            const now = new Date();
            const timeSinceTrip = now.getTime() - stats.lastCircuitBreakerTrip.getTime();
            if (timeSinceTrip > this.fallbackConfig.circuitBreakerTimeout) {
                stats.circuitBreakerOpen = false;
                this.logger.log(`🔄 Circuit breaker réinitialisé pour ${providerType}`);
            }
        }
        return stats.circuitBreakerOpen;
    }
    checkCircuitBreaker(providerType) {
        const stats = this.providerStats.get(providerType);
        if (!stats || stats.circuitBreakerOpen)
            return;
        const recentRequests = Math.min(stats.totalRequests, this.fallbackConfig.circuitBreakerThreshold);
        const recentFailures = Math.min(stats.failedRequests, this.fallbackConfig.circuitBreakerThreshold);
        if (recentRequests >= this.fallbackConfig.circuitBreakerThreshold &&
            recentFailures >= this.fallbackConfig.circuitBreakerThreshold) {
            stats.circuitBreakerOpen = true;
            stats.lastCircuitBreakerTrip = new Date();
            this.logger.warn(`⚡ Circuit breaker activé pour ${providerType} après ${recentFailures} erreurs`);
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.AIOrchestrator = AIOrchestrator;
exports.AIOrchestrator = AIOrchestrator = AIOrchestrator_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AIOrchestrator);


/***/ }),
/* 51 */
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
exports.BaseProvider = exports.ProviderStatus = exports.AIProviderType = void 0;
const common_1 = __webpack_require__(2);
var AIProviderType;
(function (AIProviderType) {
    AIProviderType["OPENAI"] = "openai";
    AIProviderType["ANTHROPIC"] = "anthropic";
    AIProviderType["GEMINI"] = "gemini";
})(AIProviderType || (exports.AIProviderType = AIProviderType = {}));
var ProviderStatus;
(function (ProviderStatus) {
    ProviderStatus["AVAILABLE"] = "available";
    ProviderStatus["RATE_LIMITED"] = "rate_limited";
    ProviderStatus["ERROR"] = "error";
    ProviderStatus["QUOTA_EXCEEDED"] = "quota_exceeded";
    ProviderStatus["MAINTENANCE"] = "maintenance";
})(ProviderStatus || (exports.ProviderStatus = ProviderStatus = {}));
let BaseProvider = class BaseProvider {
    constructor() {
        this.status = ProviderStatus.AVAILABLE;
        this.initializeMetrics();
    }
    getStatus() {
        return this.status;
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getConfig() {
        return { ...this.config };
    }
    isAvailable() {
        return this.status === ProviderStatus.AVAILABLE && this.config.enabled;
    }
    canHandleRequest(tokensNeeded) {
        if (!this.isAvailable())
            return false;
        if (tokensNeeded > this.config.maxTokensPerRequest)
            return false;
        if (this.metrics.dailyTokens + tokensNeeded > this.config.dailyTokenLimit)
            return false;
        if (this.metrics.monthlyTokens + tokensNeeded > this.config.monthlyTokenLimit)
            return false;
        return true;
    }
    setStatus(status) {
        this.status = status;
    }
    updateMetrics(tokensUsed, latency, isError = false) {
        this.metrics.requestCount++;
        this.metrics.dailyTokens += tokensUsed;
        this.metrics.monthlyTokens += tokensUsed;
        if (isError) {
            this.metrics.errorCount++;
        }
        else {
            this.metrics.successCount++;
        }
        const totalRequests = this.metrics.requestCount;
        this.metrics.averageLatency =
            ((this.metrics.averageLatency * (totalRequests - 1)) + latency) / totalRequests;
        this.metrics.errorRate = this.metrics.errorCount / this.metrics.requestCount;
        this.metrics.lastUpdated = new Date();
    }
    handleProviderError(error, context) {
        console.error(`[${this.name}] Erreur dans ${context}:`, error);
        if (error.status === 429 || error.code === 'rate_limit_exceeded') {
            this.setStatus(ProviderStatus.RATE_LIMITED);
        }
        else if (error.status === 402 || error.code === 'quota_exceeded') {
            this.setStatus(ProviderStatus.QUOTA_EXCEEDED);
        }
        else if (error.status >= 500) {
            this.setStatus(ProviderStatus.ERROR);
        }
        this.updateMetrics(0, 0, true);
        return new Error(`${this.name} ${context}: ${error.message || error}`);
    }
    validateRequest(request) {
        if (!request) {
            throw new Error('Chat request is required');
        }
        if (!request.tenantId) {
            throw new Error('Tenant ID is required');
        }
        if (!request.messages || request.messages.length === 0) {
            throw new Error('Messages array is required and cannot be empty');
        }
        if (request.temperature && (request.temperature < 0 || request.temperature > 2)) {
            throw new Error('Temperature must be between 0 and 2');
        }
    }
    sanitizeMessages(messages) {
        return messages.map(msg => ({
            role: msg.role,
            content: msg.content.trim().substring(0, 50000),
            metadata: msg.metadata,
        }));
    }
    initializeMetrics() {
        this.metrics = {
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            averageLatency: 0,
            dailyTokens: 0,
            monthlyTokens: 0,
            errorRate: 0,
            lastUpdated: new Date(),
        };
    }
    resetDailyQuotas() {
        this.metrics.dailyTokens = 0;
    }
    resetMonthlyQuotas() {
        this.metrics.monthlyTokens = 0;
    }
};
exports.BaseProvider = BaseProvider;
exports.BaseProvider = BaseProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BaseProvider);


/***/ }),
/* 52 */
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
var OpenAIProvider_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OpenAIProvider = void 0;
const common_1 = __webpack_require__(2);
const openai_1 = __webpack_require__(53);
const base_provider_1 = __webpack_require__(51);
let OpenAIProvider = OpenAIProvider_1 = class OpenAIProvider extends base_provider_1.BaseProvider {
    constructor(apiKey, defaultModel = 'gpt-4', organization) {
        super();
        this.apiKey = apiKey;
        this.defaultModel = defaultModel;
        this.organization = organization;
        this.type = base_provider_1.AIProviderType.OPENAI;
        this.name = 'OpenAI GPT';
        this.logger = new common_1.Logger(OpenAIProvider_1.name);
        this.config = {
            enabled: !!apiKey,
            priority: 9,
            maxTokensPerRequest: 4096,
            maxRequestsPerMinute: 200,
            dailyTokenLimit: 100000,
            monthlyTokenLimit: 1000000,
            timeout: 30000,
            retryAttempts: 3,
            fallbackEnabled: true,
            models: [
                'gpt-4',
                'gpt-4-turbo-preview',
                'gpt-3.5-turbo',
                'gpt-3.5-turbo-16k',
            ],
            metadata: {
                defaultModel: defaultModel,
                organization: organization,
                supportsStreaming: true,
                supportsFunctions: true,
            },
        };
    }
    async initialize() {
        if (!this.config.enabled) {
            throw new Error('OpenAI API key not provided');
        }
        try {
            this.openai = new openai_1.default({
                apiKey: this.apiKey,
                organization: this.organization,
                timeout: this.config.timeout,
                maxRetries: this.config.retryAttempts,
            });
            await this.healthCheck();
            this.setStatus(base_provider_1.ProviderStatus.AVAILABLE);
            this.logger.log(`✅ Provider OpenAI initialisé avec succès (modèle: ${this.defaultModel})`);
        }
        catch (error) {
            this.setStatus(base_provider_1.ProviderStatus.ERROR);
            throw this.handleProviderError(error, 'initialization');
        }
    }
    async healthCheck() {
        try {
            const startTime = Date.now();
            const response = await this.openai.chat.completions.create({
                model: this.defaultModel,
                messages: [{ role: 'user', content: 'Hi' }],
                max_tokens: 5,
                temperature: 0,
            });
            const latency = Date.now() - startTime;
            if (response.choices && response.choices.length > 0) {
                this.updateMetrics(response.usage?.total_tokens || 5, latency);
                this.setStatus(base_provider_1.ProviderStatus.AVAILABLE);
                return true;
            }
            throw new Error('Invalid response from OpenAI');
        }
        catch (error) {
            this.logger.warn(`❌ Health check failed: ${error.message}`);
            this.handleProviderError(error, 'health check');
            return false;
        }
    }
    async chatCompletion(request) {
        this.validateRequest(request);
        const tokensNeeded = this.estimateTokens(request.messages);
        if (!this.canHandleRequest(tokensNeeded)) {
            throw new Error('Request exceeds provider limits');
        }
        const startTime = Date.now();
        try {
            const messages = this.sanitizeMessages(request.messages);
            const openaiMessages = this.convertToOpenAIFormat(messages);
            const response = await this.openai.chat.completions.create({
                model: this.defaultModel,
                messages: openaiMessages,
                max_tokens: request.maxTokens || this.config.maxTokensPerRequest,
                temperature: request.temperature || 0.7,
                stop: request.stopSequences,
                stream: false,
            });
            const duration = Date.now() - startTime;
            const tokensUsed = response.usage?.total_tokens || 0;
            this.updateMetrics(tokensUsed, duration);
            const responseMessage = {
                role: 'assistant',
                content: response.choices[0].message.content || '',
                metadata: {
                    model: response.model,
                    created: response.created,
                    id: response.id,
                },
            };
            return {
                message: responseMessage,
                tokensUsed,
                finishReason: this.mapFinishReason(response.choices[0].finish_reason),
                provider: this.type,
                duration,
                metadata: {
                    model: response.model,
                    usage: response.usage,
                    systemFingerprint: response.system_fingerprint,
                },
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.updateMetrics(0, duration, true);
            throw this.handleProviderError(error, 'chat completion');
        }
    }
    async chatCompletionStream(request, events) {
        this.validateRequest(request);
        const tokensNeeded = this.estimateTokens(request.messages);
        if (!this.canHandleRequest(tokensNeeded)) {
            throw new Error('Request exceeds provider limits');
        }
        const startTime = Date.now();
        let totalTokens = 0;
        let fullContent = '';
        try {
            const messages = this.sanitizeMessages(request.messages);
            const openaiMessages = this.convertToOpenAIFormat(messages);
            events.onStart?.({ sessionId: request.sessionId || '', provider: this.type });
            const stream = await this.openai.chat.completions.create({
                model: this.defaultModel,
                messages: openaiMessages,
                max_tokens: request.maxTokens || this.config.maxTokensPerRequest,
                temperature: request.temperature || 0.7,
                stop: request.stopSequences,
                stream: true,
                stream_options: {
                    include_usage: true,
                },
            });
            let lastContent = '';
            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta;
                if (delta?.content) {
                    fullContent += delta.content;
                    const deltaContent = delta.content;
                    events.onChunk?.({
                        content: fullContent,
                        delta: deltaContent,
                        isComplete: false,
                        tokensUsed: totalTokens,
                    });
                }
                if (chunk.choices[0]?.finish_reason) {
                    const duration = Date.now() - startTime;
                    totalTokens = chunk.usage?.total_tokens || this.estimateTokens([
                        { role: 'assistant', content: fullContent }
                    ]);
                    this.updateMetrics(totalTokens, duration);
                    const finalResponse = {
                        message: {
                            role: 'assistant',
                            content: fullContent,
                            metadata: {
                                model: chunk.model,
                                id: chunk.id,
                            },
                        },
                        tokensUsed: totalTokens,
                        finishReason: this.mapFinishReason(chunk.choices[0].finish_reason),
                        provider: this.type,
                        duration,
                        metadata: {
                            model: chunk.model,
                            usage: chunk.usage,
                        },
                    };
                    events.onChunk?.({
                        content: fullContent,
                        delta: '',
                        isComplete: true,
                        tokensUsed: totalTokens,
                        finishReason: finalResponse.finishReason,
                    });
                    events.onComplete?.(finalResponse);
                    break;
                }
            }
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.updateMetrics(0, duration, true);
            const providerError = this.handleProviderError(error, 'streaming chat');
            events.onError?.(providerError);
            throw providerError;
        }
    }
    convertToOpenAIFormat(messages) {
        return messages.map(msg => ({
            role: msg.role,
            content: msg.content,
        }));
    }
    mapFinishReason(reason) {
        switch (reason) {
            case 'stop': return 'stop';
            case 'length': return 'length';
            case 'content_filter': return 'content_filter';
            case 'function_call': return 'function_call';
            default: return 'stop';
        }
    }
    estimateTokens(messages) {
        const totalChars = messages.reduce((total, msg) => total + msg.content.length, 0);
        return Math.ceil(totalChars / 3);
    }
};
exports.OpenAIProvider = OpenAIProvider;
exports.OpenAIProvider = OpenAIProvider = OpenAIProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String, Object, String])
], OpenAIProvider);


/***/ }),
/* 53 */
/***/ ((module) => {

module.exports = require("openai");

/***/ }),
/* 54 */
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
var AnthropicProvider_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnthropicProvider = void 0;
const common_1 = __webpack_require__(2);
const sdk_1 = __webpack_require__(55);
const base_provider_1 = __webpack_require__(51);
let AnthropicProvider = AnthropicProvider_1 = class AnthropicProvider extends base_provider_1.BaseProvider {
    constructor(apiKey, defaultModel = 'claude-3-sonnet-20240229') {
        super();
        this.apiKey = apiKey;
        this.defaultModel = defaultModel;
        this.type = base_provider_1.AIProviderType.ANTHROPIC;
        this.name = 'Anthropic Claude';
        this.logger = new common_1.Logger(AnthropicProvider_1.name);
        this.config = {
            enabled: !!apiKey,
            priority: 8,
            maxTokensPerRequest: 4096,
            maxRequestsPerMinute: 60,
            dailyTokenLimit: 80000,
            monthlyTokenLimit: 800000,
            timeout: 30000,
            retryAttempts: 3,
            fallbackEnabled: true,
            models: [
                'claude-3-opus-20240229',
                'claude-3-sonnet-20240229',
                'claude-3-haiku-20240307',
                'claude-2.1',
                'claude-2.0',
            ],
            metadata: {
                defaultModel: defaultModel,
                supportsStreaming: true,
                supportsFunctions: false,
                maxContextWindow: 200000,
            },
        };
    }
    async initialize() {
        if (!this.config.enabled) {
            throw new Error('Anthropic API key not provided');
        }
        try {
            this.anthropic = new sdk_1.default({
                apiKey: this.apiKey,
                timeout: this.config.timeout,
                maxRetries: this.config.retryAttempts,
            });
            await this.healthCheck();
            this.setStatus(base_provider_1.ProviderStatus.AVAILABLE);
            this.logger.log(`✅ Provider Anthropic initialisé avec succès (modèle: ${this.defaultModel})`);
        }
        catch (error) {
            this.setStatus(base_provider_1.ProviderStatus.ERROR);
            throw this.handleProviderError(error, 'initialization');
        }
    }
    async healthCheck() {
        try {
            const startTime = Date.now();
            const response = await this.anthropic.messages.create({
                model: this.defaultModel,
                max_tokens: 5,
                messages: [{ role: 'user', content: 'Hi' }],
            });
            const latency = Date.now() - startTime;
            if (response.content && response.content.length > 0) {
                this.updateMetrics(response.usage?.output_tokens || 5, latency);
                this.setStatus(base_provider_1.ProviderStatus.AVAILABLE);
                return true;
            }
            throw new Error('Invalid response from Anthropic');
        }
        catch (error) {
            this.logger.warn(`❌ Health check failed: ${error.message}`);
            this.handleProviderError(error, 'health check');
            return false;
        }
    }
    async chatCompletion(request) {
        this.validateRequest(request);
        const tokensNeeded = this.estimateTokens(request.messages);
        if (!this.canHandleRequest(tokensNeeded)) {
            throw new Error('Request exceeds provider limits');
        }
        const startTime = Date.now();
        try {
            const messages = this.sanitizeMessages(request.messages);
            const { anthropicMessages, systemMessage } = this.convertToAnthropicFormat(messages);
            const response = await this.anthropic.messages.create({
                model: this.defaultModel,
                max_tokens: request.maxTokens || this.config.maxTokensPerRequest,
                temperature: request.temperature || 0.7,
                messages: anthropicMessages,
                system: systemMessage,
                stop_sequences: request.stopSequences,
                stream: false,
            });
            const duration = Date.now() - startTime;
            const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);
            this.updateMetrics(tokensUsed, duration);
            const responseContent = response.content
                .map(content => content.type === 'text' ? content.text : '')
                .join('');
            const responseMessage = {
                role: 'assistant',
                content: responseContent,
                metadata: {
                    model: response.model,
                    id: response.id,
                    type: response.type,
                },
            };
            return {
                message: responseMessage,
                tokensUsed,
                finishReason: this.mapFinishReason(response.stop_reason),
                provider: this.type,
                duration,
                metadata: {
                    model: response.model,
                    usage: response.usage,
                    stopSequence: response.stop_sequence,
                },
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.updateMetrics(0, duration, true);
            throw this.handleProviderError(error, 'chat completion');
        }
    }
    async chatCompletionStream(request, events) {
        this.validateRequest(request);
        const tokensNeeded = this.estimateTokens(request.messages);
        if (!this.canHandleRequest(tokensNeeded)) {
            throw new Error('Request exceeds provider limits');
        }
        const startTime = Date.now();
        let totalTokens = 0;
        let fullContent = '';
        try {
            const messages = this.sanitizeMessages(request.messages);
            const { anthropicMessages, systemMessage } = this.convertToAnthropicFormat(messages);
            events.onStart?.({ sessionId: request.sessionId || '', provider: this.type });
            const stream = await this.anthropic.messages.create({
                model: this.defaultModel,
                max_tokens: request.maxTokens || this.config.maxTokensPerRequest,
                temperature: request.temperature || 0.7,
                messages: anthropicMessages,
                system: systemMessage,
                stop_sequences: request.stopSequences,
                stream: true,
            });
            for await (const chunk of stream) {
                switch (chunk.type) {
                    case 'message_start':
                        totalTokens += chunk.message.usage?.input_tokens || 0;
                        break;
                    case 'content_block_delta':
                        if (chunk.delta.type === 'text_delta') {
                            fullContent += chunk.delta.text;
                            events.onChunk?.({
                                content: fullContent,
                                delta: chunk.delta.text,
                                isComplete: false,
                                tokensUsed: totalTokens,
                            });
                        }
                        break;
                    case 'message_delta':
                        totalTokens += chunk.usage?.output_tokens || 0;
                        if (chunk.delta.stop_reason) {
                            const duration = Date.now() - startTime;
                            this.updateMetrics(totalTokens, duration);
                            const finalResponse = {
                                message: {
                                    role: 'assistant',
                                    content: fullContent,
                                    metadata: {
                                        model: this.defaultModel,
                                    },
                                },
                                tokensUsed: totalTokens,
                                finishReason: this.mapFinishReason(chunk.delta.stop_reason),
                                provider: this.type,
                                duration,
                                metadata: {
                                    model: this.defaultModel,
                                    usage: {
                                        input_tokens: 0,
                                        output_tokens: totalTokens,
                                    },
                                },
                            };
                            events.onChunk?.({
                                content: fullContent,
                                delta: '',
                                isComplete: true,
                                tokensUsed: totalTokens,
                                finishReason: finalResponse.finishReason,
                            });
                            events.onComplete?.(finalResponse);
                        }
                        break;
                    case 'message_stop':
                        break;
                }
            }
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.updateMetrics(0, duration, true);
            const providerError = this.handleProviderError(error, 'streaming chat');
            events.onError?.(providerError);
            throw providerError;
        }
    }
    convertToAnthropicFormat(messages) {
        const anthropicMessages = [];
        let systemMessage;
        for (const msg of messages) {
            if (msg.role === 'system') {
                systemMessage = systemMessage ? `${systemMessage}\n${msg.content}` : msg.content;
            }
            else if (msg.role === 'user' || msg.role === 'assistant') {
                anthropicMessages.push({
                    role: msg.role,
                    content: msg.content,
                });
            }
        }
        return { anthropicMessages, systemMessage };
    }
    mapFinishReason(reason) {
        switch (reason) {
            case 'end_turn':
            case 'stop_sequence':
                return 'stop';
            case 'max_tokens':
                return 'length';
            default:
                return 'stop';
        }
    }
    estimateTokens(messages) {
        const totalChars = messages.reduce((total, msg) => total + msg.content.length, 0);
        return Math.ceil(totalChars / 3.5);
    }
};
exports.AnthropicProvider = AnthropicProvider;
exports.AnthropicProvider = AnthropicProvider = AnthropicProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String, Object])
], AnthropicProvider);


/***/ }),
/* 55 */
/***/ ((module) => {

module.exports = require("@anthropic-ai/sdk");

/***/ }),
/* 56 */
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeminiProvider = void 0;
const common_1 = __webpack_require__(2);
const generative_ai_1 = __webpack_require__(57);
const base_provider_1 = __webpack_require__(51);
let GeminiProvider = GeminiProvider_1 = class GeminiProvider extends base_provider_1.BaseProvider {
    constructor(apiKey, defaultModel = 'gemini-1.5-pro') {
        super();
        this.apiKey = apiKey;
        this.defaultModel = defaultModel;
        this.type = base_provider_1.AIProviderType.GEMINI;
        this.name = 'Google Gemini';
        this.logger = new common_1.Logger(GeminiProvider_1.name);
        this.config = {
            enabled: !!apiKey,
            priority: 7,
            maxTokensPerRequest: 8192,
            maxRequestsPerMinute: 40,
            dailyTokenLimit: 50000,
            monthlyTokenLimit: 500000,
            timeout: 30000,
            retryAttempts: 3,
            fallbackEnabled: true,
            models: [
                'gemini-1.5-pro',
                'gemini-1.5-flash',
                'gemini-1.0-pro',
                'gemini-pro-vision',
            ],
            metadata: {
                defaultModel: defaultModel,
                supportsStreaming: true,
                supportsFunctions: true,
                supportsVision: true,
                maxContextWindow: 1048576,
            },
        };
    }
    async initialize() {
        if (!this.config.enabled) {
            throw new Error('Gemini API key not provided');
        }
        try {
            this.client = new generative_ai_1.GoogleGenerativeAI(this.apiKey);
            this.model = this.client.getGenerativeModel({
                model: this.defaultModel
            });
            await this.healthCheck();
            this.setStatus(base_provider_1.ProviderStatus.AVAILABLE);
            this.logger.log(`✅ Provider Gemini initialisé avec succès (modèle: ${this.defaultModel})`);
        }
        catch (error) {
            this.setStatus(base_provider_1.ProviderStatus.ERROR);
            throw this.handleProviderError(error, 'initialization');
        }
    }
    async healthCheck() {
        try {
            const startTime = Date.now();
            const result = await this.model.generateContent('Hi');
            const latency = Date.now() - startTime;
            if (result.response?.text()) {
                this.updateMetrics(this.estimateTokens([
                    { role: 'user', content: 'Hi' },
                    { role: 'assistant', content: result.response.text() }
                ]), latency);
                this.setStatus(base_provider_1.ProviderStatus.AVAILABLE);
                return true;
            }
            throw new Error('Invalid response from Gemini');
        }
        catch (error) {
            this.logger.warn(`❌ Health check failed: ${error.message}`);
            this.handleProviderError(error, 'health check');
            return false;
        }
    }
    async chatCompletion(request) {
        this.validateRequest(request);
        const tokensNeeded = this.estimateTokens(request.messages);
        if (!this.canHandleRequest(tokensNeeded)) {
            throw new Error('Request exceeds provider limits');
        }
        const startTime = Date.now();
        try {
            const messages = this.sanitizeMessages(request.messages);
            const contents = this.convertToGeminiFormat(messages);
            const config = this.buildGenerationConfig(request);
            const result = await this.model.generateContent({
                contents,
                generationConfig: config,
            });
            const duration = Date.now() - startTime;
            const responseText = result.response.text();
            const tokensUsed = this.estimateTokens([
                ...messages,
                { role: 'assistant', content: responseText }
            ]);
            this.updateMetrics(tokensUsed, duration);
            const responseMessage = {
                role: 'assistant',
                content: responseText,
                metadata: {
                    model: this.defaultModel,
                    candidateCount: result.response.candidates?.length || 1,
                },
            };
            return {
                message: responseMessage,
                tokensUsed,
                finishReason: this.mapFinishReason(result.response.candidates?.[0]?.finishReason),
                provider: this.type,
                duration,
                metadata: {
                    model: this.defaultModel,
                    usageMetadata: result.response.usageMetadata,
                    safetyRatings: result.response.candidates?.[0]?.safetyRatings,
                },
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.updateMetrics(0, duration, true);
            throw this.handleProviderError(error, 'chat completion');
        }
    }
    async chatCompletionStream(request, events) {
        this.validateRequest(request);
        const tokensNeeded = this.estimateTokens(request.messages);
        if (!this.canHandleRequest(tokensNeeded)) {
            throw new Error('Request exceeds provider limits');
        }
        const startTime = Date.now();
        let totalTokens = 0;
        let fullContent = '';
        try {
            const messages = this.sanitizeMessages(request.messages);
            const contents = this.convertToGeminiFormat(messages);
            const config = this.buildGenerationConfig(request);
            events.onStart?.({ sessionId: request.sessionId || '', provider: this.type });
            const result = await this.model.generateContentStream({
                contents,
                generationConfig: config,
            });
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                    fullContent += chunkText;
                    events.onChunk?.({
                        content: fullContent,
                        delta: chunkText,
                        isComplete: false,
                        tokensUsed: totalTokens,
                    });
                }
            }
            const duration = Date.now() - startTime;
            totalTokens = this.estimateTokens([
                ...messages,
                { role: 'assistant', content: fullContent }
            ]);
            this.updateMetrics(totalTokens, duration);
            const finalResponse = await result.response;
            const finalResponse2 = {
                message: {
                    role: 'assistant',
                    content: fullContent,
                    metadata: {
                        model: this.defaultModel,
                    },
                },
                tokensUsed: totalTokens,
                finishReason: this.mapFinishReason(finalResponse.candidates?.[0]?.finishReason),
                provider: this.type,
                duration,
                metadata: {
                    model: this.defaultModel,
                    usageMetadata: finalResponse.usageMetadata,
                },
            };
            events.onChunk?.({
                content: fullContent,
                delta: '',
                isComplete: true,
                tokensUsed: totalTokens,
                finishReason: finalResponse2.finishReason,
            });
            events.onComplete?.(finalResponse2);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.updateMetrics(0, duration, true);
            const providerError = this.handleProviderError(error, 'streaming chat');
            events.onError?.(providerError);
            throw providerError;
        }
    }
    convertToGeminiFormat(messages) {
        const contents = [];
        let systemInstruction = '';
        for (const msg of messages) {
            if (msg.role === 'system') {
                systemInstruction += (systemInstruction ? '\n' : '') + msg.content;
            }
            else {
                contents.push({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }],
                });
            }
        }
        if (systemInstruction && contents.length > 0 && contents[0].role === 'user') {
            contents[0].parts[0].text = `${systemInstruction}\n\n${contents[0].parts[0].text}`;
        }
        return contents;
    }
    buildGenerationConfig(request) {
        return {
            maxOutputTokens: request.maxTokens || this.config.maxTokensPerRequest,
            temperature: request.temperature || 0.7,
            stopSequences: request.stopSequences || [],
        };
    }
    mapFinishReason(reason) {
        switch (reason) {
            case 'STOP': return 'stop';
            case 'MAX_TOKENS': return 'length';
            case 'SAFETY': return 'content_filter';
            case 'RECITATION': return 'content_filter';
            default: return 'stop';
        }
    }
    estimateTokens(messages) {
        const totalChars = messages.reduce((total, msg) => total + msg.content.length, 0);
        return Math.ceil(totalChars / 4);
    }
};
exports.GeminiProvider = GeminiProvider;
exports.GeminiProvider = GeminiProvider = GeminiProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String, Object])
], GeminiProvider);


/***/ }),
/* 57 */
/***/ ((module) => {

module.exports = require("@google/generative-ai");

/***/ }),
/* 58 */
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
var QuotaManagerService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuotaManagerService = void 0;
const common_1 = __webpack_require__(2);
const schedule_1 = __webpack_require__(49);
const base_provider_1 = __webpack_require__(51);
let QuotaManagerService = QuotaManagerService_1 = class QuotaManagerService {
    constructor() {
        this.logger = new common_1.Logger(QuotaManagerService_1.name);
        this.alertThresholds = {
            warning: 75,
            critical: 90,
        };
        this.tenantQuotas = new Map();
        this.providerQuotas = new Map();
        this.quotaAlerts = [];
        this.initializeDefaultProviderQuotas();
    }
    async initializeTenantQuotas(tenantId, dailyTokenLimit = 50000, monthlyTokenLimit = 1000000, dailyRequestLimit = 1000, monthlyRequestLimit = 20000) {
        const now = new Date();
        const quotas = {
            tenantId,
            dailyTokenLimit,
            monthlyTokenLimit,
            dailyRequestLimit,
            monthlyRequestLimit,
            currentDailyTokens: 0,
            currentMonthlyTokens: 0,
            currentDailyRequests: 0,
            currentMonthlyRequests: 0,
            lastResetDaily: now,
            lastResetMonthly: now,
        };
        this.tenantQuotas.set(tenantId, quotas);
        this.logger.log(`📊 Quotas initialisés pour le tenant ${tenantId}`);
        return quotas;
    }
    async checkTenantQuotas(tenantId, tokensNeeded, providerType) {
        let quotas = this.tenantQuotas.get(tenantId);
        if (!quotas) {
            quotas = await this.initializeTenantQuotas(tenantId);
        }
        if (quotas.currentDailyTokens + tokensNeeded > quotas.dailyTokenLimit) {
            this.createAlert('exceeded', 'tenant', 100, quotas.currentDailyTokens + tokensNeeded, quotas.dailyTokenLimit, `Quota quotidien dépassé pour le tenant ${tenantId}`, tenantId);
            return { allowed: false, reason: 'Daily token quota exceeded' };
        }
        if (quotas.currentDailyRequests >= quotas.dailyRequestLimit) {
            return { allowed: false, reason: 'Daily request quota exceeded' };
        }
        if (quotas.currentMonthlyTokens + tokensNeeded > quotas.monthlyTokenLimit) {
            this.createAlert('exceeded', 'tenant', 100, quotas.currentMonthlyTokens + tokensNeeded, quotas.monthlyTokenLimit, `Quota mensuel dépassé pour le tenant ${tenantId}`, tenantId);
            return { allowed: false, reason: 'Monthly token quota exceeded' };
        }
        if (quotas.currentMonthlyRequests >= quotas.monthlyRequestLimit) {
            return { allowed: false, reason: 'Monthly request quota exceeded' };
        }
        const providerCheck = await this.checkProviderQuotas(tokensNeeded, providerType);
        if (!providerCheck.allowed) {
            return providerCheck;
        }
        return { allowed: true };
    }
    async consumeQuota(tenantId, tokensUsed, providerType) {
        const quotas = this.tenantQuotas.get(tenantId);
        if (!quotas) {
            this.logger.warn(`⚠️ Quotas non trouvés pour le tenant ${tenantId}`);
            return;
        }
        quotas.currentDailyTokens += tokensUsed;
        quotas.currentMonthlyTokens += tokensUsed;
        quotas.currentDailyRequests++;
        quotas.currentMonthlyRequests++;
        const providerQuotas = this.providerQuotas.get(providerType);
        if (providerQuotas) {
            providerQuotas.currentGlobalDaily += tokensUsed;
            providerQuotas.currentGlobalMonthly += tokensUsed;
        }
        this.checkQuotaAlerts(quotas, providerType);
    }
    getTenantQuotas(tenantId) {
        return this.tenantQuotas.get(tenantId);
    }
    initializeDefaultProviderQuotas() {
        const providers = [
            {
                type: base_provider_1.AIProviderType.OPENAI,
                globalDaily: 500000,
                globalMonthly: 10000000,
                perTenantDaily: 100000,
                perTenantMonthly: 1000000,
            },
            {
                type: base_provider_1.AIProviderType.ANTHROPIC,
                globalDaily: 300000,
                globalMonthly: 6000000,
                perTenantDaily: 80000,
                perTenantMonthly: 800000,
            },
            {
                type: base_provider_1.AIProviderType.GEMINI,
                globalDaily: 200000,
                globalMonthly: 4000000,
                perTenantDaily: 50000,
                perTenantMonthly: 500000,
            },
        ];
        const now = new Date();
        for (const config of providers) {
            this.providerQuotas.set(config.type, {
                providerType: config.type,
                globalDailyLimit: config.globalDaily,
                globalMonthlyLimit: config.globalMonthly,
                currentGlobalDaily: 0,
                currentGlobalMonthly: 0,
                perTenantDailyLimit: config.perTenantDaily,
                perTenantMonthlyLimit: config.perTenantMonthly,
                lastResetDaily: now,
                lastResetMonthly: now,
            });
        }
    }
    async checkProviderQuotas(tokensNeeded, providerType) {
        const quotas = this.providerQuotas.get(providerType);
        if (!quotas) {
            return { allowed: false, reason: 'Provider quotas not configured' };
        }
        if (quotas.currentGlobalDaily + tokensNeeded > quotas.globalDailyLimit) {
            this.createAlert('exceeded', 'provider', 100, quotas.currentGlobalDaily + tokensNeeded, quotas.globalDailyLimit, `Quota global quotidien dépassé pour ${providerType}`, undefined, providerType);
            return { allowed: false, reason: 'Provider daily quota exceeded' };
        }
        if (quotas.currentGlobalMonthly + tokensNeeded > quotas.globalMonthlyLimit) {
            this.createAlert('exceeded', 'provider', 100, quotas.currentGlobalMonthly + tokensNeeded, quotas.globalMonthlyLimit, `Quota global mensuel dépassé pour ${providerType}`, undefined, providerType);
            return { allowed: false, reason: 'Provider monthly quota exceeded' };
        }
        return { allowed: true };
    }
    getProviderQuotas(providerType) {
        return this.providerQuotas.get(providerType);
    }
    checkQuotaAlerts(quotas, providerType) {
        const now = new Date();
        const dailyUsagePercent = (quotas.currentDailyTokens / quotas.dailyTokenLimit) * 100;
        if (dailyUsagePercent >= this.alertThresholds.critical) {
            this.createAlert('critical', 'tenant', dailyUsagePercent, quotas.currentDailyTokens, quotas.dailyTokenLimit, `Quota quotidien critique pour le tenant ${quotas.tenantId}`, quotas.tenantId);
        }
        else if (dailyUsagePercent >= this.alertThresholds.warning) {
            this.createAlert('warning', 'tenant', dailyUsagePercent, quotas.currentDailyTokens, quotas.dailyTokenLimit, `Quota quotidien en alerte pour le tenant ${quotas.tenantId}`, quotas.tenantId);
        }
        const monthlyUsagePercent = (quotas.currentMonthlyTokens / quotas.monthlyTokenLimit) * 100;
        if (monthlyUsagePercent >= this.alertThresholds.critical) {
            this.createAlert('critical', 'tenant', monthlyUsagePercent, quotas.currentMonthlyTokens, quotas.monthlyTokenLimit, `Quota mensuel critique pour le tenant ${quotas.tenantId}`, quotas.tenantId);
        }
        else if (monthlyUsagePercent >= this.alertThresholds.warning) {
            this.createAlert('warning', 'tenant', monthlyUsagePercent, quotas.currentMonthlyTokens, quotas.monthlyTokenLimit, `Quota mensuel en alerte pour le tenant ${quotas.tenantId}`, quotas.tenantId);
        }
        const providerQuotas = this.providerQuotas.get(providerType);
        if (providerQuotas) {
            const providerDailyPercent = (providerQuotas.currentGlobalDaily / providerQuotas.globalDailyLimit) * 100;
            if (providerDailyPercent >= this.alertThresholds.critical) {
                this.createAlert('critical', 'provider', providerDailyPercent, providerQuotas.currentGlobalDaily, providerQuotas.globalDailyLimit, `Quota quotidien critique pour ${providerType}`, undefined, providerType);
            }
        }
    }
    createAlert(type, level, threshold, current, limit, message, tenantId, providerType) {
        const alert = {
            type,
            level,
            threshold,
            current,
            limit,
            message,
            tenantId,
            providerType,
            timestamp: new Date(),
        };
        const recentSimilar = this.quotaAlerts.find(a => a.type === type &&
            a.level === level &&
            a.tenantId === tenantId &&
            a.providerType === providerType &&
            (Date.now() - a.timestamp.getTime()) < 300000);
        if (!recentSimilar) {
            this.quotaAlerts.push(alert);
            this.logger.warn(`🚨 ${type.toUpperCase()} - ${message}`);
            if (this.quotaAlerts.length > 100) {
                this.quotaAlerts = this.quotaAlerts.slice(-100);
            }
        }
    }
    getRecentAlerts(limit = 50) {
        return this.quotaAlerts
            .slice(-limit)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    async resetDailyQuotas() {
        this.logger.log('🔄 Réinitialisation des quotas quotidiens...');
        const now = new Date();
        for (const [tenantId, quotas] of this.tenantQuotas) {
            quotas.currentDailyTokens = 0;
            quotas.currentDailyRequests = 0;
            quotas.lastResetDaily = now;
        }
        for (const [type, quotas] of this.providerQuotas) {
            quotas.currentGlobalDaily = 0;
            quotas.lastResetDaily = now;
        }
        this.logger.log(`✅ Quotas quotidiens réinitialisés pour ${this.tenantQuotas.size} tenant(s) et ${this.providerQuotas.size} provider(s)`);
    }
    async resetMonthlyQuotas() {
        this.logger.log('🔄 Réinitialisation des quotas mensuels...');
        const now = new Date();
        for (const [tenantId, quotas] of this.tenantQuotas) {
            quotas.currentMonthlyTokens = 0;
            quotas.currentMonthlyRequests = 0;
            quotas.lastResetMonthly = now;
        }
        for (const [type, quotas] of this.providerQuotas) {
            quotas.currentGlobalMonthly = 0;
            quotas.lastResetMonthly = now;
        }
        this.logger.log(`✅ Quotas mensuels réinitialisés pour ${this.tenantQuotas.size} tenant(s) et ${this.providerQuotas.size} provider(s)`);
    }
    getGlobalStats() {
        const stats = {
            totalTenants: this.tenantQuotas.size,
            totalDailyTokens: 0,
            totalMonthlyTokens: 0,
            providerStats: new Map(),
            alerts: { warning: 0, critical: 0, exceeded: 0 },
        };
        for (const quotas of this.tenantQuotas.values()) {
            stats.totalDailyTokens += quotas.currentDailyTokens;
            stats.totalMonthlyTokens += quotas.currentMonthlyTokens;
        }
        for (const [type, quotas] of this.providerQuotas) {
            stats.providerStats.set(type, {
                daily: quotas.currentGlobalDaily,
                monthly: quotas.currentGlobalMonthly,
            });
        }
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        for (const alert of this.quotaAlerts) {
            if (alert.timestamp > oneDayAgo) {
                stats.alerts[alert.type]++;
            }
        }
        return stats;
    }
};
exports.QuotaManagerService = QuotaManagerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_a = typeof Promise !== "undefined" && Promise) === "function" ? _a : Object)
], QuotaManagerService.prototype, "resetDailyQuotas", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], QuotaManagerService.prototype, "resetMonthlyQuotas", null);
exports.QuotaManagerService = QuotaManagerService = QuotaManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], QuotaManagerService);


/***/ }),
/* 59 */
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
var AIController_1;
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AIController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const jwt_auth_guard_1 = __webpack_require__(31);
const tenant_guard_1 = __webpack_require__(30);
const ai_orchestrator_service_1 = __webpack_require__(50);
const quota_manager_service_1 = __webpack_require__(58);
const ai_gateway_1 = __webpack_require__(60);
const session_service_1 = __webpack_require__(42);
const dto_1 = __webpack_require__(44);
const dto_2 = __webpack_require__(63);
const base_provider_1 = __webpack_require__(51);
const session_entity_1 = __webpack_require__(13);
let AIController = AIController_1 = class AIController {
    constructor(aiOrchestrator, quotaManager, streamGateway, sessionService) {
        this.aiOrchestrator = aiOrchestrator;
        this.quotaManager = quotaManager;
        this.streamGateway = streamGateway;
        this.sessionService = sessionService;
        this.logger = new common_1.Logger(AIController_1.name);
    }
    async chatCompletion(tenantSlug, chatRequest, preferredProvider, userId) {
        try {
            this.logger.log(`💬 Chat request pour tenant ${tenantSlug} (${chatRequest.messages.length} messages)`);
            let providerType;
            if (preferredProvider) {
                if (Object.values(base_provider_1.AIProviderType).includes(preferredProvider)) {
                    providerType = preferredProvider;
                }
                else {
                    throw new common_1.HttpException(`Provider invalide: ${preferredProvider}. Providers supportés: ${Object.values(base_provider_1.AIProviderType).join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
                }
            }
            const request = {
                messages: chatRequest.messages,
                maxTokens: chatRequest.maxTokens,
                temperature: chatRequest.temperature,
                stopSequences: chatRequest.stopSequences,
                stream: false,
                sessionId: chatRequest.sessionId,
                tenantId: tenantSlug,
                preferredProvider: providerType,
            };
            const estimatedTokens = this.estimateTokens(request.messages);
            const quotaCheck = await this.quotaManager.checkTenantQuotas(tenantSlug, estimatedTokens, providerType || base_provider_1.AIProviderType.OPENAI);
            if (!quotaCheck.allowed) {
                throw new common_1.HttpException(`Quota dépassé: ${quotaCheck.reason}`, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            const startTime = Date.now();
            const response = await this.aiOrchestrator.chatCompletion(request);
            const duration = Date.now() - startTime;
            await this.quotaManager.consumeQuota(tenantSlug, response.tokensUsed, response.provider);
            let persistedSessionId;
            if (chatRequest.sessionId && userId) {
                try {
                    const conversationDto = new dto_1.CreateConversationDto({
                        message: chatRequest.messages[chatRequest.messages.length - 1]?.content || '',
                        metadata: {
                            temperature: chatRequest.temperature,
                            maxTokens: chatRequest.maxTokens,
                            provider: response.provider,
                            aiResponse: response.message.content,
                            tokensUsed: response.tokensUsed,
                            finishReason: response.finishReason,
                            duration: response.duration,
                        },
                    });
                    const conversation = await this.sessionService.createConversation(chatRequest.sessionId, conversationDto);
                    persistedSessionId = chatRequest.sessionId;
                }
                catch (sessionError) {
                    this.logger.warn(`⚠️ Échec sauvegarde session: ${sessionError.message}`);
                }
            }
            this.logger.log(`✅ Chat terminé en ${duration}ms avec ${response.provider} (${response.tokensUsed} tokens)`);
            return {
                message: response.message,
                tokensUsed: response.tokensUsed,
                finishReason: response.finishReason,
                provider: response.provider,
                duration: response.duration,
                sessionId: persistedSessionId,
            };
        }
        catch (error) {
            this.logger.error(`❌ Erreur chat completion: ${error.message}`);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            if (error.message.includes('quota') || error.message.includes('limit')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            if (error.message.includes('indisponible') || error.message.includes('unavailable')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            throw new common_1.HttpException('Erreur interne lors du traitement de votre demande', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getProvidersStatus(tenantSlug) {
        try {
            this.logger.debug(`📊 Récupération statut providers pour ${tenantSlug}`);
            const providersStatus = this.aiOrchestrator.getProviderStatus();
            const availableProviders = this.aiOrchestrator.getAvailableProviders();
            const providers = Array.from(providersStatus.entries()).map(([type, data]) => {
                const providerQuotas = this.quotaManager.getProviderQuotas(type);
                return {
                    type,
                    name: data.provider.name,
                    status: data.provider.getStatus(),
                    available: data.provider.isAvailable(),
                    config: {
                        enabled: data.provider.getConfig().enabled,
                        priority: data.provider.getConfig().priority,
                        maxTokensPerRequest: data.provider.getConfig().maxTokensPerRequest,
                        models: data.provider.getConfig().models,
                    },
                    metrics: data.provider.getMetrics(),
                    quotas: providerQuotas ? {
                        dailyLimit: providerQuotas.globalDailyLimit,
                        monthlyLimit: providerQuotas.globalMonthlyLimit,
                        currentDaily: providerQuotas.currentGlobalDaily,
                        currentMonthly: providerQuotas.currentGlobalMonthly,
                        dailyUsagePercent: Math.round((providerQuotas.currentGlobalDaily / providerQuotas.globalDailyLimit) * 100),
                        monthlyUsagePercent: Math.round((providerQuotas.currentGlobalMonthly / providerQuotas.globalMonthlyLimit) * 100),
                    } : null,
                };
            });
            const tenantQuotas = this.quotaManager.getTenantQuotas(tenantSlug);
            return {
                providers,
                quotas: {
                    tenant: tenantQuotas ? {
                        dailyTokens: {
                            current: tenantQuotas.currentDailyTokens,
                            limit: tenantQuotas.dailyTokenLimit,
                            usagePercent: Math.round((tenantQuotas.currentDailyTokens / tenantQuotas.dailyTokenLimit) * 100),
                        },
                        monthlyTokens: {
                            current: tenantQuotas.currentMonthlyTokens,
                            limit: tenantQuotas.monthlyTokenLimit,
                            usagePercent: Math.round((tenantQuotas.currentMonthlyTokens / tenantQuotas.monthlyTokenLimit) * 100),
                        },
                        dailyRequests: {
                            current: tenantQuotas.currentDailyRequests,
                            limit: tenantQuotas.dailyRequestLimit,
                            usagePercent: Math.round((tenantQuotas.currentDailyRequests / tenantQuotas.dailyRequestLimit) * 100),
                        },
                    } : null,
                    alerts: this.quotaManager.getRecentAlerts(5),
                },
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`❌ Erreur récupération providers: ${error.message}`);
            throw new common_1.HttpException('Erreur lors de la récupération du statut des providers', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async healthCheck(tenantSlug) {
        try {
            this.logger.debug(`🏥 Health check pour ${tenantSlug}`);
            const healthResults = await this.aiOrchestrator.healthCheckAll();
            const availableProviders = this.aiOrchestrator.getAvailableProviders();
            const providers = {};
            let healthyCount = 0;
            for (const [type, isHealthy] of healthResults) {
                providers[type] = isHealthy;
                if (isHealthy)
                    healthyCount++;
            }
            const overall = healthyCount > 0 ?
                (healthyCount === healthResults.size ? 'healthy' : 'partial') :
                'unhealthy';
            return {
                overall,
                providers,
                availableProviders,
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`❌ Erreur health check: ${error.message}`);
            throw new common_1.HttpException('Erreur lors du health check', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStats(tenantSlug) {
        try {
            const quotaStats = this.quotaManager.getGlobalStats();
            const streamStats = this.streamGateway.getStats();
            const providersStatus = this.aiOrchestrator.getProviderStatus();
            return {
                quotas: quotaStats,
                streaming: streamStats,
                providers: {
                    total: providersStatus.size,
                    available: this.aiOrchestrator.getAvailableProviders().length,
                },
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`❌ Erreur récupération stats: ${error.message}`);
            throw new common_1.HttpException('Erreur lors de la récupération des statistiques', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    estimateTokens(messages) {
        const totalChars = messages.reduce((total, msg) => total + (msg.content?.length || 0), 0);
        return Math.ceil(totalChars / 4);
    }
    mapProviderToEnum(providerType) {
        switch (providerType) {
            case base_provider_1.AIProviderType.OPENAI: return session_entity_1.AIProvider.OPENAI;
            case base_provider_1.AIProviderType.ANTHROPIC: return session_entity_1.AIProvider.ANTHROPIC;
            case base_provider_1.AIProviderType.GEMINI: return session_entity_1.AIProvider.GEMINI;
            default: return session_entity_1.AIProvider.OPENAI;
        }
    }
};
exports.AIController = AIController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, swagger_1.ApiOperation)({
        summary: 'Chat synchrone avec IA',
        description: 'Envoie un message à l\'IA et reçoit une réponse complète. Supporte le fallback automatique entre providers.',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Preferred-Provider',
        description: 'Provider IA préféré (openai, anthropic, gemini)',
        required: false,
    }),
    (0, swagger_1.ApiParam)({
        name: 'tenant_slug',
        description: 'Slug du tenant',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Réponse de l\'IA reçue avec succès',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'object',
                    properties: {
                        role: { type: 'string', example: 'assistant' },
                        content: { type: 'string', example: 'Voici ma réponse...' },
                    },
                },
                tokensUsed: { type: 'number', example: 150 },
                finishReason: { type: 'string', example: 'stop' },
                provider: { type: 'string', example: 'openai' },
                duration: { type: 'number', example: 1250 },
                sessionId: { type: 'string', example: 'uuid' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Quota dépassé',
    }),
    (0, swagger_1.ApiResponse)({
        status: 503,
        description: 'Tous les providers IA sont indisponibles',
    }),
    __param(0, (0, common_1.Param)('tenant_slug')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-preferred-provider')),
    __param(3, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_e = typeof dto_2.ChatRequestDto !== "undefined" && dto_2.ChatRequestDto) === "function" ? _e : Object, String, String]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AIController.prototype, "chatCompletion", null);
__decorate([
    (0, common_1.Get)('providers'),
    (0, swagger_1.ApiOperation)({
        summary: 'Statut des providers IA',
        description: 'Récupère la liste des providers disponibles avec leurs métriques et quotas.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'tenant_slug',
        description: 'Slug du tenant',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste des providers avec leurs statuts',
        schema: {
            type: 'object',
            properties: {
                providers: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            type: { type: 'string', example: 'openai' },
                            name: { type: 'string', example: 'OpenAI GPT' },
                            status: { type: 'string', example: 'available' },
                            available: { type: 'boolean', example: true },
                            config: { type: 'object' },
                            metrics: { type: 'object' },
                            quotas: { type: 'object' },
                        },
                    },
                },
                timestamp: { type: 'string', format: 'date-time' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('tenant_slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AIController.prototype, "getProvidersStatus", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Health check des providers IA',
        description: 'Vérifie la santé de tous les providers IA disponibles.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'tenant_slug',
        description: 'Slug du tenant',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Résultats du health check',
        schema: {
            type: 'object',
            properties: {
                overall: { type: 'string', example: 'healthy' },
                providers: {
                    type: 'object',
                    additionalProperties: { type: 'boolean' },
                },
                availableProviders: {
                    type: 'array',
                    items: { type: 'string' },
                },
                timestamp: { type: 'string', format: 'date-time' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('tenant_slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], AIController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Statistiques du système IA',
        description: 'Récupère les statistiques globales du système IA (quotas, streaming, etc.).',
    }),
    (0, swagger_1.ApiParam)({
        name: 'tenant_slug',
        description: 'Slug du tenant',
    }),
    __param(0, (0, common_1.Param)('tenant_slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], AIController.prototype, "getStats", null);
exports.AIController = AIController = AIController_1 = __decorate([
    (0, swagger_1.ApiTags)('IA - Intelligence Artificielle'),
    (0, common_1.Controller)('api/v1/:tenant_slug/ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof ai_orchestrator_service_1.AIOrchestrator !== "undefined" && ai_orchestrator_service_1.AIOrchestrator) === "function" ? _a : Object, typeof (_b = typeof quota_manager_service_1.QuotaManagerService !== "undefined" && quota_manager_service_1.QuotaManagerService) === "function" ? _b : Object, typeof (_c = typeof ai_gateway_1.AIStreamGateway !== "undefined" && ai_gateway_1.AIStreamGateway) === "function" ? _c : Object, typeof (_d = typeof session_service_1.SessionService !== "undefined" && session_service_1.SessionService) === "function" ? _d : Object])
], AIController);


/***/ }),
/* 60 */
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
var AIStreamGateway_1;
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AIStreamGateway = void 0;
const websockets_1 = __webpack_require__(61);
const common_1 = __webpack_require__(2);
const socket_io_1 = __webpack_require__(62);
const jwt_auth_guard_1 = __webpack_require__(31);
const tenant_guard_1 = __webpack_require__(30);
const ai_orchestrator_service_1 = __webpack_require__(50);
const quota_manager_service_1 = __webpack_require__(58);
const dto_1 = __webpack_require__(63);
const base_provider_1 = __webpack_require__(51);
const uuid_1 = __webpack_require__(67);
let AIStreamGateway = AIStreamGateway_1 = class AIStreamGateway {
    constructor(aiOrchestrator, quotaManager) {
        this.aiOrchestrator = aiOrchestrator;
        this.quotaManager = quotaManager;
        this.logger = new common_1.Logger(AIStreamGateway_1.name);
        this.connections = new Map();
        this.activeSessions = new Map();
        this.stats = {
            totalConnections: 0,
            activeConnections: 0,
            totalSessions: 0,
            activeSessions: 0,
            totalChunks: 0,
            totalTokensStreamed: 0,
            averageLatency: 0,
        };
    }
    afterInit(server) {
        this.logger.log('🌐 WebSocket Gateway AI Stream initialisé');
        this.setupCleanupTimer();
    }
    async handleConnection(client) {
        try {
            const tenantId = client.handshake.auth?.tenantId;
            const userId = client.handshake.auth?.userId;
            if (!tenantId || !userId) {
                this.logger.warn(`❌ Connexion rejetée: données d'auth manquantes`);
                client.disconnect();
                return;
            }
            const connectionId = (0, uuid_1.v4)();
            const connection = {
                socket: client,
                tenantId,
                userId,
                isActive: true,
                connectedAt: new Date(),
                lastActivity: new Date(),
            };
            this.connections.set(connectionId, connection);
            client.data = { connectionId, tenantId, userId };
            this.stats.totalConnections++;
            this.stats.activeConnections++;
            this.logger.log(`✅ Client connecté: ${connectionId} (tenant: ${tenantId}, user: ${userId})`);
            client.emit('connected', {
                connectionId,
                status: 'connected',
                timestamp: new Date(),
                supportedProviders: this.aiOrchestrator.getAvailableProviders(),
            });
        }
        catch (error) {
            this.logger.error(`❌ Erreur lors de la connexion: ${error.message}`);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        const connectionId = client.data?.connectionId;
        if (connectionId) {
            const activeSessions = Array.from(this.activeSessions.entries())
                .filter(([_, session]) => session.connectionId === connectionId);
            for (const [sessionId, session] of activeSessions) {
                session.isActive = false;
                this.activeSessions.delete(sessionId);
                this.stats.activeSessions--;
                this.logger.log(`🛑 Session stream fermée: ${sessionId}`);
            }
            this.connections.delete(connectionId);
            this.stats.activeConnections--;
            this.logger.log(`👋 Client déconnecté: ${connectionId}`);
        }
    }
    async handleChatStreamStart(data, client) {
        const connectionId = client.data?.connectionId;
        const tenantId = client.data?.tenantId;
        const userId = client.data?.userId;
        if (!connectionId || !tenantId || !userId) {
            client.emit('error', { message: 'Invalid connection state' });
            return;
        }
        try {
            const sessionId = (0, uuid_1.v4)();
            const streamSession = {
                connectionId,
                tenantId,
                userId,
                sessionId: data.sessionId,
                startedAt: new Date(),
                isActive: true,
                totalTokens: 0,
                chunks: 0,
            };
            this.activeSessions.set(sessionId, streamSession);
            this.stats.totalSessions++;
            this.stats.activeSessions++;
            const estimatedTokens = this.estimateTokens(data.messages);
            const quotaCheck = await this.quotaManager.checkTenantQuotas(tenantId, estimatedTokens, data.preferredProvider || base_provider_1.AIProviderType.OPENAI);
            if (!quotaCheck.allowed) {
                client.emit('chat.error', {
                    sessionId,
                    error: quotaCheck.reason,
                    timestamp: new Date(),
                });
                this.activeSessions.delete(sessionId);
                this.stats.activeSessions--;
                return;
            }
            const connection = this.connections.get(connectionId);
            if (connection) {
                connection.lastActivity = new Date();
            }
            const chatRequest = {
                messages: data.messages,
                maxTokens: data.maxTokens,
                temperature: data.temperature,
                stopSequences: data.stopSequences,
                stream: true,
                sessionId: data.sessionId,
                tenantId,
                preferredProvider: data.preferredProvider,
            };
            const events = {
                onStart: (startData) => {
                    streamSession.provider = startData.provider;
                    client.emit('chat.start', {
                        sessionId,
                        provider: startData.provider,
                        timestamp: new Date(),
                    });
                    this.logger.debug(`🎬 Stream démarré: ${sessionId} avec ${startData.provider}`);
                },
                onChunk: (chunk) => {
                    streamSession.chunks++;
                    streamSession.totalTokens = chunk.tokensUsed || streamSession.totalTokens;
                    this.stats.totalChunks++;
                    const chunkEvent = {
                        content: chunk.content,
                        delta: chunk.delta,
                        isComplete: chunk.isComplete,
                        tokensUsed: chunk.tokensUsed,
                        finishReason: chunk.finishReason,
                    };
                    client.emit('chat.chunk', {
                        sessionId,
                        chunk: chunkEvent,
                        timestamp: new Date(),
                    });
                    if (chunk.isComplete) {
                        this.finalizeStreamSession(sessionId, streamSession);
                    }
                },
                onComplete: async (response) => {
                    const duration = Date.now() - streamSession.startedAt.getTime();
                    await this.quotaManager.consumeQuota(tenantId, response.tokensUsed, response.provider);
                    this.stats.totalTokensStreamed += response.tokensUsed;
                    this.updateAverageLatency(duration);
                    client.emit('chat.complete', {
                        sessionId,
                        response: {
                            message: response.message,
                            tokensUsed: response.tokensUsed,
                            finishReason: response.finishReason,
                            provider: response.provider,
                            duration,
                        },
                        timestamp: new Date(),
                    });
                    this.finalizeStreamSession(sessionId, streamSession);
                    this.logger.log(`✅ Stream terminé: ${sessionId} (${response.tokensUsed} tokens, ${duration}ms)`);
                },
                onError: (error, fallback) => {
                    client.emit('chat.error', {
                        sessionId,
                        error: error.message,
                        fallback,
                        timestamp: new Date(),
                    });
                    this.finalizeStreamSession(sessionId, streamSession);
                    this.logger.error(`❌ Stream error: ${sessionId} - ${error.message}`);
                },
            };
            await this.aiOrchestrator.chatCompletionStream(chatRequest, events);
        }
        catch (error) {
            this.logger.error(`💥 Erreur stream chat: ${error.message}`);
            client.emit('chat.error', {
                error: error.message,
                timestamp: new Date(),
            });
        }
    }
    async handleChatStreamStop(data, client) {
        const connectionId = client.data?.connectionId;
        const session = Array.from(this.activeSessions.entries())
            .find(([_, s]) => s.connectionId === connectionId && s.sessionId === data.sessionId);
        if (session) {
            const [sessionId, streamSession] = session;
            this.finalizeStreamSession(sessionId, streamSession);
            client.emit('chat.stopped', {
                sessionId: data.sessionId,
                timestamp: new Date(),
            });
            this.logger.log(`🛑 Stream arrêté manuellement: ${data.sessionId}`);
        }
    }
    async handleGetProvidersStatus(client) {
        try {
            const providersStatus = this.aiOrchestrator.getProviderStatus();
            const statusData = Array.from(providersStatus.entries()).map(([type, data]) => ({
                type,
                name: data.provider.name,
                status: data.provider.getStatus(),
                available: data.provider.isAvailable(),
                config: data.provider.getConfig(),
                metrics: data.provider.getMetrics(),
                stats: data.stats,
            }));
            client.emit('providers.status', {
                providers: statusData,
                timestamp: new Date(),
            });
        }
        catch (error) {
            client.emit('error', {
                message: `Failed to get providers status: ${error.message}`,
                timestamp: new Date(),
            });
        }
    }
    async handleGetQuotaStatus(client) {
        const tenantId = client.data?.tenantId;
        if (!tenantId) {
            client.emit('error', { message: 'Tenant ID not found' });
            return;
        }
        try {
            const tenantQuotas = this.quotaManager.getTenantQuotas(tenantId);
            const globalStats = this.quotaManager.getGlobalStats();
            const recentAlerts = this.quotaManager.getRecentAlerts(10);
            client.emit('quota.status', {
                tenant: tenantQuotas,
                global: globalStats,
                alerts: recentAlerts,
                timestamp: new Date(),
            });
        }
        catch (error) {
            client.emit('error', {
                message: `Failed to get quota status: ${error.message}`,
                timestamp: new Date(),
            });
        }
    }
    finalizeStreamSession(sessionId, session) {
        session.isActive = false;
        this.activeSessions.delete(sessionId);
        this.stats.activeSessions--;
    }
    estimateTokens(messages) {
        const totalChars = messages.reduce((total, msg) => total + (msg.content?.length || 0), 0);
        return Math.ceil(totalChars / 4);
    }
    updateAverageLatency(latency) {
        const totalSessions = this.stats.totalSessions;
        this.stats.averageLatency = ((this.stats.averageLatency * (totalSessions - 1)) + latency) / totalSessions;
    }
    setupCleanupTimer() {
        setInterval(() => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            for (const [sessionId, session] of this.activeSessions) {
                if (session.startedAt < fiveMinutesAgo && session.isActive) {
                    this.logger.warn(`🧹 Nettoyage session inactive: ${sessionId}`);
                    this.finalizeStreamSession(sessionId, session);
                }
            }
        }, 5 * 60 * 1000);
    }
    getStats() {
        return {
            ...this.stats,
            connections: {
                active: this.stats.activeConnections,
                total: this.stats.totalConnections,
            },
            sessions: {
                active: this.stats.activeSessions,
                total: this.stats.totalSessions,
            },
        };
    }
    getActiveConnections() {
        return Array.from(this.connections.values());
    }
    getActiveSessions() {
        return Array.from(this.activeSessions.values());
    }
};
exports.AIStreamGateway = AIStreamGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_c = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _c : Object)
], AIStreamGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat.stream.start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof dto_1.StreamRequestDto !== "undefined" && dto_1.StreamRequestDto) === "function" ? _d : Object, typeof (_e = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], AIStreamGateway.prototype, "handleChatStreamStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat.stream.stop'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_f = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], AIStreamGateway.prototype, "handleChatStreamStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get.providers.status'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], AIStreamGateway.prototype, "handleGetProvidersStatus", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get.quota.status'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], AIStreamGateway.prototype, "handleGetQuotaStatus", null);
exports.AIStreamGateway = AIStreamGateway = AIStreamGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        namespace: '/ai/stream',
        cors: {
            origin: true,
            credentials: true,
        },
        transports: ['websocket'],
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof ai_orchestrator_service_1.AIOrchestrator !== "undefined" && ai_orchestrator_service_1.AIOrchestrator) === "function" ? _a : Object, typeof (_b = typeof quota_manager_service_1.QuotaManagerService !== "undefined" && quota_manager_service_1.QuotaManagerService) === "function" ? _b : Object])
], AIStreamGateway);


/***/ }),
/* 61 */
/***/ ((module) => {

module.exports = require("@nestjs/websockets");

/***/ }),
/* 62 */
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),
/* 63 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(64), exports);
__exportStar(__webpack_require__(65), exports);
__exportStar(__webpack_require__(66), exports);


/***/ }),
/* 64 */
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
exports.ChatRequestDto = exports.ChatMessageDto = void 0;
const class_validator_1 = __webpack_require__(19);
const class_transformer_1 = __webpack_require__(18);
const swagger_1 = __webpack_require__(3);
const base_provider_1 = __webpack_require__(51);
class ChatMessageDto {
}
exports.ChatMessageDto = ChatMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['user', 'assistant', 'system'],
        description: 'Rôle du message',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['user', 'assistant', 'system']),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contenu du message',
        maxLength: 50000,
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Métadonnées optionnelles du message',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], ChatMessageDto.prototype, "metadata", void 0);
class ChatRequestDto {
    constructor() {
        this.maxTokens = 1000;
        this.temperature = 0.7;
        this.stream = false;
    }
}
exports.ChatRequestDto = ChatRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ChatMessageDto],
        description: 'Tableau des messages de conversation',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChatMessageDto),
    __metadata("design:type", Array)
], ChatRequestDto.prototype, "messages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre maximum de tokens à générer',
        minimum: 1,
        maximum: 4096,
        default: 1000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(4096),
    __metadata("design:type", Number)
], ChatRequestDto.prototype, "maxTokens", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Température pour la créativité (0-2)',
        minimum: 0,
        maximum: 2,
        default: 0.7,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], ChatRequestDto.prototype, "temperature", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        description: 'Séquences d\'arrêt pour stopper la génération',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ChatRequestDto.prototype, "stopSequences", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Activer le streaming de réponse',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ChatRequestDto.prototype, "stream", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID de session pour persistance',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ChatRequestDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: base_provider_1.AIProviderType,
        description: 'Provider IA préféré (override automatique)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(base_provider_1.AIProviderType),
    __metadata("design:type", typeof (_b = typeof base_provider_1.AIProviderType !== "undefined" && base_provider_1.AIProviderType) === "function" ? _b : Object)
], ChatRequestDto.prototype, "preferredProvider", void 0);


/***/ }),
/* 65 */
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
exports.StreamChunkDto = exports.StreamEventDto = exports.StreamRequestDto = void 0;
const class_validator_1 = __webpack_require__(19);
const swagger_1 = __webpack_require__(3);
const chat_request_dto_1 = __webpack_require__(64);
class StreamRequestDto extends chat_request_dto_1.ChatRequestDto {
}
exports.StreamRequestDto = StreamRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID de connexion WebSocket pour le streaming',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], StreamRequestDto.prototype, "connectionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Callback URL pour recevoir les événements de stream',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StreamRequestDto.prototype, "callbackUrl", void 0);
class StreamEventDto {
}
exports.StreamEventDto = StreamEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['start', 'chunk', 'complete', 'error'],
        description: 'Type d\'événement de streaming',
    }),
    __metadata("design:type", String)
], StreamEventDto.prototype, "event", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Données de l\'événement',
    }),
    __metadata("design:type", Object)
], StreamEventDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp de l\'événement',
    }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], StreamEventDto.prototype, "timestamp", void 0);
class StreamChunkDto {
}
exports.StreamChunkDto = StreamChunkDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contenu du chunk',
    }),
    __metadata("design:type", String)
], StreamChunkDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Delta de contenu depuis le dernier chunk',
    }),
    __metadata("design:type", String)
], StreamChunkDto.prototype, "delta", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indique si c\'est le dernier chunk',
    }),
    __metadata("design:type", Boolean)
], StreamChunkDto.prototype, "isComplete", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre de tokens utilisés jusqu\'à présent',
    }),
    __metadata("design:type", Number)
], StreamChunkDto.prototype, "tokensUsed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Raison de fin si c\'est le dernier chunk',
    }),
    __metadata("design:type", String)
], StreamChunkDto.prototype, "finishReason", void 0);


/***/ }),
/* 66 */
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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProviderMetricsDto = exports.ProviderStatusDto = exports.ProviderConfigDto = void 0;
const class_validator_1 = __webpack_require__(19);
const swagger_1 = __webpack_require__(3);
const base_provider_1 = __webpack_require__(51);
class ProviderConfigDto {
}
exports.ProviderConfigDto = ProviderConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Provider activé ou non',
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProviderConfigDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Priorité du provider (plus élevé = priorité plus haute)',
        minimum: 1,
        maximum: 10,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], ProviderConfigDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre maximum de tokens par requête',
        minimum: 1,
        maximum: 8192,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(8192),
    __metadata("design:type", Number)
], ProviderConfigDto.prototype, "maxTokensPerRequest", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Limite de requêtes par minute',
        minimum: 1,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ProviderConfigDto.prototype, "maxRequestsPerMinute", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Limite quotidienne de tokens',
        minimum: 1000,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1000),
    __metadata("design:type", Number)
], ProviderConfigDto.prototype, "dailyTokenLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Limite mensuelle de tokens',
        minimum: 10000,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(10000),
    __metadata("design:type", Number)
], ProviderConfigDto.prototype, "monthlyTokenLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timeout en millisecondes',
        minimum: 5000,
        maximum: 60000,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5000),
    (0, class_validator_1.Max)(60000),
    __metadata("design:type", Number)
], ProviderConfigDto.prototype, "timeout", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre de tentatives de retry',
        minimum: 0,
        maximum: 5,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], ProviderConfigDto.prototype, "retryAttempts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fallback automatique activé',
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProviderConfigDto.prototype, "fallbackEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        description: 'Liste des modèles supportés',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProviderConfigDto.prototype, "models", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Métadonnées supplémentaires',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], ProviderConfigDto.prototype, "metadata", void 0);
class ProviderStatusDto {
}
exports.ProviderStatusDto = ProviderStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: base_provider_1.AIProviderType,
        description: 'Type de provider',
    }),
    (0, class_validator_1.IsEnum)(base_provider_1.AIProviderType),
    __metadata("design:type", typeof (_b = typeof base_provider_1.AIProviderType !== "undefined" && base_provider_1.AIProviderType) === "function" ? _b : Object)
], ProviderStatusDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nom du provider',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProviderStatusDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: base_provider_1.ProviderStatus,
        description: 'Statut actuel du provider',
    }),
    (0, class_validator_1.IsEnum)(base_provider_1.ProviderStatus),
    __metadata("design:type", typeof (_c = typeof base_provider_1.ProviderStatus !== "undefined" && base_provider_1.ProviderStatus) === "function" ? _c : Object)
], ProviderStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Provider disponible pour les requêtes',
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProviderStatusDto.prototype, "available", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Configuration du provider',
    }),
    __metadata("design:type", ProviderConfigDto)
], ProviderStatusDto.prototype, "config", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Métriques du provider',
    }),
    __metadata("design:type", ProviderMetricsDto)
], ProviderStatusDto.prototype, "metrics", void 0);
class ProviderMetricsDto {
}
exports.ProviderMetricsDto = ProviderMetricsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre total de requêtes',
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProviderMetricsDto.prototype, "requestCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre de requêtes réussies',
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProviderMetricsDto.prototype, "successCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre d\'erreurs',
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProviderMetricsDto.prototype, "errorCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Latence moyenne en ms',
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProviderMetricsDto.prototype, "averageLatency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tokens utilisés aujourd\'hui',
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProviderMetricsDto.prototype, "dailyTokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tokens utilisés ce mois',
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProviderMetricsDto.prototype, "monthlyTokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Taux d\'erreur (0-1)',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], ProviderMetricsDto.prototype, "errorRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Dernière mise à jour des métriques',
    }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], ProviderMetricsDto.prototype, "lastUpdated", void 0);


/***/ }),
/* 67 */
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),
/* 68 */
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
const common_1 = __webpack_require__(2);
const ai_providers_service_1 = __webpack_require__(69);
const ai_providers_controller_1 = __webpack_require__(70);
const gemini_provider_1 = __webpack_require__(71);
const registry_service_1 = __webpack_require__(39);
const config_service_1 = __webpack_require__(16);
const telemetry_service_1 = __webpack_require__(36);
const config_module_1 = __webpack_require__(15);
const telemetry_module_1 = __webpack_require__(35);
const registry_module_1 = __webpack_require__(38);
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
/* 69 */
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
const common_1 = __webpack_require__(2);
const registry_service_1 = __webpack_require__(39);
const telemetry_service_1 = __webpack_require__(36);
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
/* 70 */
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
const common_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(22);
const swagger_1 = __webpack_require__(3);
const ai_providers_service_1 = __webpack_require__(69);
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
/* 71 */
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
const common_1 = __webpack_require__(2);
const generative_ai_1 = __webpack_require__(57);
const ai_provider_interface_1 = __webpack_require__(72);
const config_service_1 = __webpack_require__(16);
const telemetry_service_1 = __webpack_require__(36);
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
/* 72 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseAiProvider = void 0;
const provider_interface_1 = __webpack_require__(73);
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
/* 73 */
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
/* 74 */
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
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const app_service_1 = __webpack_require__(75);
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
/* 75 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const common_1 = __webpack_require__(2);
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


/***/ })
/******/ 	]);
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

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const app_module_1 = __webpack_require__(4);
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