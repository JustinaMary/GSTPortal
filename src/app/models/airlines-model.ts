export class Airline {
    AirlineId: number;
    AirlineCode: string;
    Digit3Code: string;
    AirlineName: string;
    PANNo: string;
    IsOwnServer: boolean;
    CustomerVerify: boolean;
    CanAccess: boolean;
    PermitAgents: boolean;
    IsActive: boolean;
    CreatedBy: string; // GUID;
    groupAirlines: string;
}

export class AirlineUsers {
    AirUserId: number;
    AirlineId: number;
    UserId: string;
    Name: string;
    ContactNo: string;
    IsActive: boolean;
    CreatedBy: string;
    IsResetPassword: boolean;
    AirlineName: string;
    RoleName: string;
    UserName: string;
    Email: string;
}

export class AirlineResponse {
    airlineMaster: Airline;
    airlineUsers: AirlineUsers;
}

export class AirlineStateMaster {
    AirStId: number;
    AirlineId: number;
    AirlineName: string;
    StateCode: string;
    GSTNo: string;
    Address: string;
    EmailId: string;
    PhoneNo: string;
    IsActive: boolean;
    CreatedBy: string;
    PinCode: string;
    CityName: string;
}

export class StateGstMaster {
    GstId: string;
    StateName: string;
}

export class AirlineUserLinkRM {
    LinkId: number;
    AirStId: number;
}

export class AirlineUsersRM {
    airlineUsers: AirlineUsers;
    airlineUserLink_RMs: Array<AirlineUserLinkRM>;
}

export class AirlineStateUserLinkRM {
    LinkId: number;
    AirStId: number;
    StateCode: string;
    StateName: string;
}


export class TransactionType {
    TypeId: number;
    AirlineId: number;
    TransType: string;
    Description: string;
    CreatedBy: string;
}

