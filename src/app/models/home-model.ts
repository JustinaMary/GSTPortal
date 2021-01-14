export class Login {
  Email: string;
  Password: string;
  RememberMe: boolean;
  IpAddress: string;
}

export class Register {
  ReqId: number;
  TicketNo: string;
  PNR: string;
  DateofIssue: string;
  CustomerName: string;
  PANNo: string;
  GstNo: string;
  Email: string;
  Mobile: string;
  AirlineId: number;
  IsAutoRegistered: boolean;
}

export class B2CGstRequest {
  ReqId: number;
  TicketNumber: string;
  PNR: string;
  GSTNo: string;
  DateOfIssue: Date;
  Email: string;
  ContactNo: string;
}

export class RaisedTicketCount {
  TotalCount: number;
  PendingCount: number;
  InProgressCount: number;
  ClosedCount: number;
}
