export class EnumVm {
  EnumId: number;
  EnumType: string;
  Description: string;
}

export class UniqueCheckRM {
  Tablename: string;
  Columnvalue: string;
  Pid: number;
  Fid: number;
}

export class UserLog {
  // UlId: string;
  UserId: string;
  PageName: string;
  Action: string;
  Notes: string;
  // InsertedDate: number;
}

export class Notifications {
  NotifyId: number;
  NotifyType: number;
  FromUseId: string;
  ToUserId: string;
  Title: string;
  Details: string;
  Parameter: string;
  isSeen: boolean;
}

export class RequestMaster {
  Id: number;
  Description: string;
}

export class ErrorLog {
  message: string;
  Id: string;
  CreatedOn: string;
}

// email config model

export class EmailConfiguration {
  Id: number;
  AirlineId: number;
  Email: string;
  Password: string;
  FromTitle: string;
  SmtpServer: string;
  PortNumber: number;
  IsTested: boolean;
  CreatedBy: string;
  CreatedDate: Date;
}
