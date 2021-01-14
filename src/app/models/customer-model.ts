export class Customer {
  ReqId: number;
  TicketNo: string;
  PNR: string;
  DateofIssue: string;
  CustomerName: string;
  PANNo: string;
  GstNo: string;
  Email: string;
  Mobile: string;
  CreatedDate: string;
  Status: number;
  Notes: string;
  VerifiedBy: string;
  VerifiedByName: string;
  VerifiedOn: string;
  CustId: string; // GUID;
  IsAutoRegistered: boolean;
  AirlineCode: string;
  AirlineName: string;
}

export class CustomerUsers {
    CustUserId: number;
    CustId: number;
    UserId: string;
    Name: string;
    ContactNo: string;
    IsActive: boolean;
    CreatedDate: string;
    CreatedBy: string;
    IsResetPassword: boolean;
    CustomerName: string;
    RoleName: string;
    UserName: string;
    Email: string;
}

export class CustomerResponse {
  customerMaster: Customer;
  customerUsers: CustomerUsers;
}

export class CustomerStateMaster {
  CustStId: number;
  CustId: number;
  CustomerName: string;
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

export class CustomerUserLinkRM {
  LinkId: number;
  CustStId: number;
}

export class CustomerUsersRM {
  customerUsers: CustomerUsers;
  customerUserLink_RMs: Array<CustomerUserLinkRM>;
}

export class CustomerStateUserLinkRM {
  LinkId: number;
  CustStId: number;
  StateCode: string;
  StateName: string;
}


export class CustomerMaster {
  CustId: number;
  CustomerName: string;
  PANNo: string;
  GstNo: string;
  IsActive: boolean;
  CreatedDate: Date;
  CreatedBy: string;
  CustCode: string;
  Email: string;
  ContactNo: string;
  PanCardPath: string;
}

export class RaiseRequestVM {
  RrId: number;
  TicketNo: string;
  PNRNo: string;
  GstNo: string;
  TransTypeText: string;
  StatusNm: string;
  RequestTypeStr: string;
  StateGst: string;
  CustName: string;
}

export class RaiseRequestTbl {
  RrId: number;
  TicketNo: string;
  PNRNo: string;
  GstNo: string;
  TransType: number;
  TransTypeText: string;
  RequestType: number; // FK RequestMaster
  StateId: number; // F.K(CustStId)
  Status: number; // new/close/inprogress
  RequestBy: number; // int	F.K (CustUserId)
  RequestedOn: Date;
}

export class RaiseRequestHistoryTbl {
  HId: number;
  RrId: number;
  Status: number; // new/close/inprogress
  Notes: string;
  SystemNotes: string;
  CreatedBy: string;
  CreatedDate: Date;
}

export class RaiseRequestPost {
  raiseRequest: RaiseRequestTbl;
  Notes: string;
  UserId: string;
  CreatedBy: string;
}

export class RaiseRequestResponse {
  raiseRequest: Array<RaiseRequestTbl>;
  raiseRequestHistory: Array<RaiseRequestHistoryTbl>;
}

export class CustStateUsers {
  CustStId: number;
  StateCode: string;
  StateName: string;
}

export class VerifyRequest {
  ReqId: number;
  Status: number;
  LUserId: string;
  Notes: string;
}

export class B2CGstRequestList {
  ReqId: number;
  TicketNumber: string;
  PNR: string;
  GSTNo: string;
  DateOfIssue: Date;
  Email: string;
  ContactNo: string;
  StatusNm: string;
}

export class B2CGstRequestRM {
  UserId: string;
  Page: number;
  PageSize: number;
  SearchStr: string;
}

export class BulkQueryResponse {
  Type: number;
  Message: string;
}
