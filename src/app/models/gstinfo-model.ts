export class GstInformation {
  InfoId: number;
  AirlineCode: string;
  TicketNo: string;
  DOI: string; // datetime
  IATACode: number;
  PNRNo: string;
  TransactionType: number;
  TransNo: string;
  TransDate: string; // datetime
  AirlineGSTNo: string;
  CustomerGSTNo: string;
  CustomerName: string;
  Email: string;
  PhoneNo: string;
  PassengerName: string;
  TaxableAmt: number;
  GSTAmt: number;
  TotalAmt: number;
  FilePath: string;
  CreatedBy: string;
  CreatedDate: string; // datetime
  ModifiedBy: string;
  ModifiedDate: string;
}

export class VerifByAirlines {
  AirlineId: number;
  AirlineCode: string;
  AirlineName: string;
  Digit3Code: string;
}

export class GstInfoRequest {
  TicketNo: string;
  PNRNo: string;
  CustomerGSTNo: string;
  PassengerName: string;
  AirlineCode: string;
  TransactionType: number;
  FromTransDate: string;
  ToTransDate: string;
  UserId: string;
  AirlineId: number;
  CustId: number;
}

export class GstInformationListResponse {
  InfoId: number;
  AirlineCode: string;
  TicketNo: string;
  DOI: Date;
  IATACode: number;
  PNRNo: string;
  TransactionType: number;
  TransType: string;
  TransNo: string;
  TransDate: Date;
  AirlineGSTNo: string;
  CustomerGSTNo: string;
  CustomerName: string;
  Email: string;
  PhoneNo: string;
  PassengerName: string;
  TaxableAmt: number;
  GSTAmt: number;
  TotalAmt: number;
}

export class GstInformationExcel {
  AirlineCode: string;
  TicketNo: string;
  DOI: string;
  PNRNo: string;
  CustomerGSTNo: string;
  TransType: string;
  TransNo: string;
  TransDate: string;
  PassengerName: string;
  TaxableAmt: number;
  GSTAmt: number;
  TotalAmt: number;
}

export class GstInfoDownloadRequest {
  infoId: Array<number>;
  AirlineCode: string;
  UserId: string;
}
