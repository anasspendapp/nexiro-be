import { Model, Optional } from "sequelize";
interface AdminUserAttributes {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface AdminUserCreationAttributes extends Optional<AdminUserAttributes, "id" | "createdAt" | "updatedAt"> {
}
export declare class AdminUser extends Model<AdminUserAttributes, AdminUserCreationAttributes> implements AdminUserAttributes {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default AdminUser;
//# sourceMappingURL=admin-user.model.d.ts.map