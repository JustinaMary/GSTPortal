export class Login {
    Email: string;
    Password: string;
    RememberMe: boolean;
    IpAddress: string;
}

export class ResetPasswordVm {
    UserId: string;
    Password: string;
    Code: string;
}

export class ManagePasswordVm {
    UserId: string;
    OldPassword: string;
    NewPassword: string;
}

export class ResetPasswordInternalVm {
    UserName: string;
    Password: string;
    Id: string; // Id = Who is reset the password
    IsSuperAdmin: boolean;
}

export class RolesVm {
    Name: string;
    DisplayName: string;
    RoleId: string;
}

export class RefreshTokenRequest {
    RefreshToken: string;
    IpAddress: string;
}

export class RoleModuleActionInsUpd {
    RoleId: string;
    ModuleId: number;
    ModuleActionId: number;
}
export class RoleModuleActionInsUpdModel {
    ModuleActionList: Array<RoleModuleActionInsUpd>;
    UserId: string;
}

export class UserMenuSession {
    MenuID: number;
    MenuName: string;
    MenuURL: string;
    MenuDescription: string;
    Icon: string;
    MenuType: string;
    SortBy: number;
    CategoryOrder: number;
    mMenuId: number;
    CategoryName: string;

}

export class UserMenuActionSession {
    Module: string;
    ActionName: string;
}
