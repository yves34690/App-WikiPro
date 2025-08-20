import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus, Tenant } from '@core/entities';

export interface CreateUserDto {
  tenant_id: string;
  email: string;
  password: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  status?: UserStatus;
  preferences?: Record<string, any>;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Vérifier que le tenant existe
    const tenant = await this.tenantRepository.findOne({
      where: { id: createUserDto.tenant_id },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant avec l'ID '${createUserDto.tenant_id}' introuvable`);
    }

    if (!tenant.canAccess()) {
      throw new UnauthorizedException('Le tenant n\'est pas accessible');
    }

    // Vérifier que l'email n'existe pas déjà pour ce tenant
    const existingUser = await this.userRepository.findOne({
      where: {
        tenant_id: createUserDto.tenant_id,
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        `Un utilisateur avec l'email '${createUserDto.email}' existe déjà pour ce tenant`
      );
    }

    // Hacher le mot de passe
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = this.userRepository.create({
      ...createUserDto,
      password_hash,
      role: createUserDto.role || UserRole.USER,
      status: UserStatus.ACTIVE,
      password_changed_at: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    this.logger.log(
      `Nouvel utilisateur créé: ${savedUser.email} pour le tenant ${tenant.slug}`
    );

    return savedUser;
  }

  async findByEmailAndTenant(email: string, tenantId: string): Promise<User | null> {
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

  async findById(id: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
        tenant_id: tenantId,
      },
      relations: ['tenant'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID '${id}' introuvable`);
    }

    return user;
  }

  async findAllByTenant(tenantId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { tenant_id: tenantId },
      relations: ['tenant'],
      order: { created_at: 'DESC' },
    });
  }

  async update(id: string, tenantId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id, tenantId);

    Object.assign(user, updateUserDto);

    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`Utilisateur mis à jour: ${updatedUser.email}`);

    return updatedUser;
  }

  async changePassword(
    id: string,
    tenantId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id, tenant_id: tenantId },
      select: ['id', 'email', 'password_hash'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password_hash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    // Hacher le nouveau mot de passe
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);

    await this.userRepository.update(id, {
      password_hash: newPasswordHash,
      password_changed_at: new Date(),
    });

    this.logger.log(`Mot de passe changé pour l'utilisateur: ${user.email}`);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async updateLastLogin(id: string, tenantId: string, ip?: string): Promise<void> {
    const updateData: Partial<User> = {
      last_login_at: new Date(),
    };

    if (ip) {
      updateData.last_login_ip = ip;
    }

    await this.userRepository.update(
      { id, tenant_id: tenantId },
      updateData,
    );
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const user = await this.findById(id, tenantId);

    await this.userRepository.remove(user);

    this.logger.log(`Utilisateur supprimé: ${user.email}`);
  }

  async deactivate(id: string, tenantId: string): Promise<User> {
    const user = await this.findById(id, tenantId);

    user.status = UserStatus.INACTIVE;

    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`Utilisateur désactivé: ${updatedUser.email}`);

    return updatedUser;
  }

  async activate(id: string, tenantId: string): Promise<User> {
    const user = await this.findById(id, tenantId);

    user.status = UserStatus.ACTIVE;

    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`Utilisateur activé: ${updatedUser.email}`);

    return updatedUser;
  }
}